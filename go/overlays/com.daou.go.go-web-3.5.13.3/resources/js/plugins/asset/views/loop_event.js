(function() {
    define([
            "jquery",
            "underscore",
            "hgn!asset/templates/asset_loop_popup",
            "i18n!nls/commons",
            "i18n!calendar/nls/calendar",
            "i18n!asset/nls/asset",
            "jquery.go-popup"
        ],

        function(
            $,
            _,
            Template,
            commonLang,
            calLang,
            assetLang
        ) {
            var LoopEvent = (function() {
                var constructor = function(model, type, data) {
                    if(!_.contains(['remove', 'update'], type)) throw new Error("잘못된 인자입니다.");

                    this.model = model;
                    this.isRecurrence = this.model.get("recurrence");
                    this.type =  type;
                    this.data = data;
                    this.callbacks = {};
                    this.template = Template({
                        "recurrence?": this.isRecurrence,
                        "remove?": this.isRemoveType(),
                        "update?": this.isUpdateType(),
                        "recurrence_notice": assetLang["현재 '반복 예약'으로 등록되어 있습니다."],
                        "remove_desc": assetLang["예약을 취소하시겠습니까? 취소한 예약은 복구가 되지 않습니다"],
                        "label": {
                            "remove_only": assetLang["이 예약만 수정"],
                            "remove_after": assetLang["이 예약부터 이후 예약 모두 수정"],
                            "remove_all": assetLang["전체 예약 수정"]
                        }
                    });
                };

                constructor.prototype = {
                    render: function() {
                        var classname = {'remove': "layer_schedule_del", 'update': "layer_schedule_repeat"}[this.type],
                            headerTitle = {'remove': assetLang["예약 취소"], 'update': assetLang['예약 수정']}[this.type];

                        this.popupEl = $.goPopup({
                            pclass: 'layer_normal ' + classname,
                            width: -1,
                            header: headerTitle,
                            contents: this.template,
                            closeCallback: $.proxy(this._close, this),
                            buttons : [
                                { btype : 'confirm', btext : commonLang["확인"], callback: $.proxy(this._confirm, this), autoclose : false },
                                { btype : 'cancel', btext : commonLang["취소"], callback: $.proxy(this._cancel, this) }
                            ]
                        });
                    },

                    setCallbacks: function(obj) {
                        $.extend(true, this.callbacks, obj || {});
                    },

                    isRemoveType: function() {
                        return this.type === 'remove';
                    },

                    isUpdateType: function() {
                        return this.type === 'update';
                    },

                    _confirm: function() {
                        if(this.isRemoveType()) {
                            this.reservationDeleteAction();
                        } else {
                            this.reservationUpdateAction();
                        }
                    },

                    _cancel: function() {
                        if(this.callbacks.hasOwnProperty('complete')) {
                            this.callbacks.complete.call(this);
                        }
                    },

                    reservationDeleteAction: function () {
                        var self = this;
                        var url = GO.contextRoot + "api/asset/item/loop/reservation?" + $.param({
                            reservationId: this.model.attributes.reservationId,
                            recurChange: $(this.popupEl).find("input[name=remove_option]:checked").val()
                        });

                        $.ajax(url, {
                            type: 'DELETE',
                            success: function () {
                                self.popupEl.close();
                                GO.router.navigate('asset/' + self.model.attributes.assetId + '/list/reservation' , true);
                            }
                        });
                    },
                    reservationUpdateAction: function () {
                        var self = this;
                        var url = GO.contextRoot + "api/asset/item/loop/reservation?" + $.param({
                            reservationId: this.model.attributes.reservationId,
                            recurChange: $(this.popupEl).find("input[name=remove_option]:checked").val()
                        });

                        $.ajax(url, {
                            type: 'PUT',
                            data: JSON.stringify(this.data),
                            dataType: 'json',
                            contentType: "application/json",
                            success: function () {
                                self.popupEl.close();
                                GO.router.navigate('asset/' + self.model.attributes.assetId + '/list/reservation' , true);
                            },
                            error: function () {
                                $.goError(assetLang["예약하려는 시간대에 이미 예약된 건이 포함되어있습니다."]);
                            }
                        });
                    }

                };

                return constructor;
            })();

            return LoopEvent;
        });
}).call(this);
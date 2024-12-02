(function () {

    define([
            "jquery",
            "hogan",
            "app",
            "hgn!calendar/templates/_regist_attendees",
            "i18n!nls/commons",
            "i18n!calendar/nls/calendar"
        ],
        function (
            $,
            Hogan,
            GO,
            AttendeesTpl,
            commonLang,
            calLang
        ) {
            var tvars = {"remove": commonLang["삭제"]};

            var FormAttendeesHelper = (function () {
                var constructor = function (obj, attendees, editable) {
                    attendees = attendees || [];
                    this.rootElement = obj;
                    this.editable = typeof editable === 'undefined' ? true : editable;
                    this.delegateEvents();
                    this.addAttendeeCallbacks = $.Callbacks();
                    this.removeCallbacks = $.Callbacks();
                    this.addAttendee(attendees);
                };

                constructor.prototype = {
                    delegateEvents: function () {
                        this.undelegateEvents();
                        $(this.rootElement).on("click.attendee", "li:not([data-button]) > span.btn_wrap", $.proxy(this.removeAttendee, this));
                    },

                    undelegateEvents: function () {
                        $(this.rootElement).off(".attendee");
                    },

                    addAttendee: function (info) {
                        var self = this;
                        var defer = $.Deferred();

                        if (info.type === 'org') {
                            $.goPopup({
                                pclass: 'layer_confim',
                                title: calLang["참석자 추가"],
                                message: GO.i18n(calLang["참석자 추가 확인 메시지"], {"dept": info.name}),
                                modal: true,
                                buttons: [{
                                    btype: 'confirm',
                                    btext: calLang["현재 부서원만 추가"],
                                    callback: function () {
                                        reqDeptMemberList.call(self, defer, info.id);
                                    }
                                }, {
                                    btype: 'confirm',
                                    btext: calLang["하위 부서원 모두 추가"],
                                    callback: function () {
                                        reqDeptMemberList.call(self, defer, info.id, true);
                                    }
                                }, {
                                    btype: 'close', btext: commonLang["취소"]
                                }]
                            });
                        } else {
                            this._addAttendee(info);
                            if (info.length > 20) this.rootElement.find("#moreAttendee").show();
                            defer.resolve([info]);
                        }

                        function reqDeptMemberList(defer, deptId, isIncludeSubDept) {
                            isIncludeSubDept = isIncludeSubDept || false;
                            var reqUrl = GO.config('contextRoot') + 'api/organization/user?deptid=' + info.id + (!!isIncludeSubDept ? '&scope=subdept' : '');

                            return $.ajax(reqUrl).done(_.bind(function (memberList) {
                                var memberInfos = [];
                                _.each(memberList, function (member) {
                                    memberInfos.push(member.metadata);
                                }, this);

                                defer.resolve(this._addAttendee(memberInfos));
                            }, this)).fail(function () {
                                console.log('error');
                                defer.reject();
                            });
                        }

                        return defer;
                    },

                    removeAttendee: function (e) {
                        var li = this._getAttendeeLIElement(e.currentTarget),
                            $li = $(li),
                            userid = parseInt($li.attr("data-id"));

                        this.removeCallbacks.fire(userid, li);
                        return this;
                    },

                    getAttendees: function (exceptId) {
                        exceptId = exceptId || null;
                        var elements = $(this.rootElement).find("li:not([data-button])"),
                            attendees = new Array();

                        elements.each(function (i, element) {
                            var $element = $(element),
                                userid = $element.attr("data-id"),
                                username = $element.attr("data-name");

                            if (exceptId && exceptId === parseInt(userid)) {
                                // 아무것도 하지 않는다.
                            } else {
                                attendees.push({
                                    "id": userid,
                                    "name": username,
                                    "email": $element.attr("data-email"),
                                    "position": $element.attr("data-position")
                                });
                            }
                        });
                        return attendees;
                    },

                    isMe: function (userid) {
                        return GO.session("id") === userid;
                    },

                    /**
                     참석자에 userid의 유저가 포함되어 있는지 여부 반환

                     @method includeMe
                     @param {Integer} userid 사용자 고유 ID
                     @return {boolean} 포함 여부
                     */
                    includeMe: function (userid) {
                        var result = _.where(this.getAttendees(), {"id": "" + userid});
                        return result.length > 0;
                    },

                    /**
                     이미 참석자에 포함되어 있는지 여부 반환

                     @method isExistedAttendee
                     @param {Integer} userid 사용자 고유 ID
                     @return {boolean} 포함 여부
                     @private
                     */
                    isExistedAttendee: function (userid) {
                        return this.includeMe(userid);
                    },

                    addRemoveCallback: function (fn) {
                        this.removeCallbacks.add(fn);
                        return this;
                    },

                    addAttendeeCallback: function (fn) {
                        this.addAttendeeCallbacks.add(fn);
                        return this;
                    },

                    /**
                     참석자 추가

                     @method _addAttendee
                     @param {Object} data 참석자 정보
                     @private
                     */
                    _addAttendee: function (data) {
                        var $root = $(this.rootElement),
                            $addBtn = $root.find('li.creat'),
                            result = [];
                        var moreBtn = $root.find("#moreAttendee");

                        if (!$.isArray(data)) {
                            data = [data];
                        }

                        var isVisible = true;
                        for (var i = 0, len = data.length; i < len; i++) {
                            var info = data[i],
                                isMe = this.isMe(info.id),
                                markup = '';

                            if (!info['id']) continue;
                            if (this.isExistedAttendee(info.id)) continue;

                            info.title = [info.name, info.position].join(" ");

                            if (i > 19) isVisible = false;
                            markup = AttendeesTpl(_.extend({
                                "username": info.name,
                                "me?": isMe,
                                "editable?": this.editable,
                                isVisible: isVisible
                            }, info, tvars));

                            $root.append(markup, [moreBtn, $addBtn]);

                            // 실제로 추가된 참석자만 반환
                            result.push(info);
                        }

                        this.addAttendeeCallbacks.fire(result);

                        return result;
                    },

                    /**
                     참석자 엘리먼트 반환

                     @method _getAttendeeLIElement
                     @private
                     */
                    _getAttendeeLIElement: function (obj) {
                        return $(obj).parent();
                    }
                };

                return constructor;
            })();

            return FormAttendeesHelper;
        });
}).call(this);
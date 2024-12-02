define('admin/views/ehr/timeline/workplace/work_place_list', function (require) {
    var WorkPlaceListTmpl = require('hgn!admin/templates/ehr/timeline/workplace/work_place_list');
    var WorkPlaceCollection = require('admin/collections/ehr/timeline/work_place_list');
    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");

    return Backbone.View.extend({
        el: '#workPlaceList',
        unbindEvent: function() {
            this.$el.off("click", ".work_place");
            this.$el.off("click", "#placeAddBtn");
            this.$el.off("click", "#placeDelBtn");
        },
        bindEvent : function() {
            this.$el.on("click", ".work_place", $.proxy(this.onPlaceClicked, this));
            this.$el.on("click", "#placeAddBtn", $.proxy(this.addWorkPlace, this));
            this.$el.on("click", "#placeDelBtn", $.proxy(this.onDelBtnClicked, this));
        },
        initialize: function (options) {
            this.workPlaceCollection = new WorkPlaceCollection();
            this.workPlaceCollection.fetch({async: false});
            this.workPlaceCollection.sortWorkPlaces('createdAt', true);
            this.unbindEvent();
            this.bindEvent();
        },

        render: function () {
            this.$el.html(WorkPlaceListTmpl({
                places: this.workPlaceCollection.models,
                adminLang: AdminLang,
                commonLang: CommonLang
            }));
            this.defaultActiveWorkPlace(this.workPlaceCollection);
        },

        defaultActiveWorkPlace: function(workPlaceCollection) {
            if (workPlaceCollection.models[0]) {
                this.$el.trigger('activeWorkPlace', workPlaceCollection.models[0]);
            }
        },

        addWorkPlace: function () {
            this.$el.trigger('renderWorkPlace');
            this.$el.trigger('inActiveWorkPlace');
        },

        onPlaceClicked: function (e) {
            var id = $(e.currentTarget).val();
            this.$el.trigger('activeWorkPlace', this.getCheckedWorkPlace(id));
            this.$el.trigger('renderWorkPlace', this.getCheckedWorkPlace(id));
        },

        getCheckedWorkPlace: function (id) {
            this.activePlaceModel = this.workPlaceCollection.getById(id);
            return this.activePlaceModel;
        },

        onDelBtnClicked: function (e) {
            var ids = new Array();
            var table = this.$el.find('#workPlacesTable');
            var delWorkPlacesEl = table.find('li input[type="checkbox"]:checked');
            if (delWorkPlacesEl.size() == 0) {
                $.goMessage(AdminLang["삭제할 근무지를 선택하세요"]);
                return;
            }

            delWorkPlacesEl.attr('value', function (i, val) {
                if (val != null) {
                    ids.push(val);
                }
            });

            var callback = function () {
                var self = this;
                $.go(GO.contextRoot + 'ad/api/timeline/workplaces', JSON.stringify({ids: ids}), {
                    qryType: 'DELETE',
                    contentType: 'application/json',
                    responseFn: function (response) {
                        if (response.code == 200) {
                            $.goMessage(CommonLang["삭제되었습니다."]);
                            self.$el.trigger('reset');
                        }
                    },
                    error: function (response) {
                        var responseData = JSON.parse(response.responseText);
                        if (responseData != null) {
                            $.goAlert(responseData.message);
                        } else {
                            $.goMessage(CommonLang["실패했습니다."]);
                        }
                    }
                });
            };
            $.goPopup({
                title: AdminLang["선택한 근무지 삭제 알림"],
                modal: true,
                buttons: [{
                    btype: 'confirm',
                    btext: CommonLang["삭제"],
                    callback: $.proxy(callback, this)
                }, {
                    btype: 'close', btext: CommonLang["취소"]
                }]
            });
        }
    });
});
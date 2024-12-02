define("admin/views/ehr/timeline/group/work_place", function(require){
    var Backbone = require("backbone");
    var WorkPlaceTmpl = require("hgn!admin/templates/ehr/timeline/group/work_place");
    var SelectWorkPlacesTmpl = require("hgn!admin/templates/ehr/timeline/group/select_work_places");
    var WorkPlaceCollection = require('admin/collections/ehr/timeline/work_place_list');
    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");

    return Backbone.View.extend({
        events : {
            "click #selectWorkPlacesBtn" : "selectWorkPlaces",
            "click .workPlaceCancelBtn" : "cancelWorkPlace"
        },

        initialize : function (options) {
            this.group = options.group;
            this.selectedWorkPlaces = this.group.get('workPlaces') || [];
            this.workPlaces = new WorkPlaceCollection();
            this.workPlaces.fetch();
        },

        render : function () {
            this.$el.html(WorkPlaceTmpl({
                AdminLang : AdminLang,
                CommonLang : CommonLang,
                selectedWorkPlaces : this.selectedWorkPlaces,
            }));
        },

        getSelectedWorkPlaces : function() {
            return this.selectedWorkPlaces;
        },

        cancelWorkPlace : function(e) {
            var id = $(e.currentTarget).data('id');
            this.selectedWorkPlaces.splice(_.findIndex(this.selectedWorkPlaces, function (item) {
                return item.id == Number(id);
            }), 1);
            this.render();
        },

        selectWorkPlaces : function (e) {
            var places = this.workPlaces.toJSON();
            var self = this,
                TmplCode = SelectWorkPlacesTmpl({
                    AdminLang : AdminLang,
                    CommonLang : CommonLang,
                    places : places,
                });

            this.selectPlacesPopup = $.goPopup({
                pclass : 'layer_normal layer_attend_place',
                header : AdminLang["근무지 추가"],
                modal : true,
                contents : TmplCode,
                buttons : [{
                    btext : CommonLang["저장"],
                    btype : "confirm",
                    autoclose : false,
                    callback : function(popupEl) {
                        var values = $('#workPlaceSelectBox').val();

                        values.forEach(function(id) {
                            if (!self.selectedWorkPlaces.filter(function (item){ return item.id === Number(id)})[0]) {
                                self.selectedWorkPlaces.push(self.workPlaces.getById(id).toJSON());
                            }
                        });

                        self.render();
                        popupEl.close();
                    }
                },{
                    btext : CommonLang["취소"],
                    btype : "cancel"
                }]
            }, this);

            this.selectWithOutCtrlKey()
        },

        selectWithOutCtrlKey : function () {
            $('#workPlaceSelectBox option').mousedown(function(e) {
                e.preventDefault();
                $(this).toggleClass('selected');

                $(this).prop('selected', !$(this).prop('selected'));
                return false;
            });
        }
    });
});
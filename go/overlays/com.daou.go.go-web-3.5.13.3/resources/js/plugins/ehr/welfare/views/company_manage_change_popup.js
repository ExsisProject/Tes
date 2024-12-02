(function () {
    define([
            "backbone",
            "app",
            "hgn!welfare/templates/company_manage_change_popup",
            "i18n!welfare/nls/welfare",
            "i18n!nls/commons"
        ],

        function (
            Backbone,
            GO,
            Tmpl,
            WelfareLang,
            CommonLang
        ) {
            var lang = {
                "선택" : CommonLang["선택"],
                "추가" : CommonLang["추가"],
                "제외" : WelfareLang["제외"],
                "조정 Point" : WelfareLang["조정 Point"]
            };

            var CompanyManageChangeModel = Backbone.Model.extend({
                url : function(){
                    return GO.contextRoot + "api/ehr/welfare/company/change/point" + this.postfix;
                },
                initialize : function(data, options){
                    if(options.type == "company"){
                        this.postfix = "/all"
                        this.set("year", options.year);
                    }else{
                        this.postfix = "";
                        this.set("welfare", {"ids" : options.ids});
                    }
                }
            });

            var CompanyManageChangePopup = Backbone.View.extend({
                events: {},

                initialize: function () {
                    var type = this.options.type;
                    var ids = this.options.ids;
                    var year = this.options.year;
                    this.model = new CompanyManageChangeModel({}, {type : type , ids : ids, year : year});
                },

                render: function () {
                    this.$el.html(Tmpl({
                        lang : lang
                    }));

                    return this;
                },

                save : function(){
                    var $el = this.$el;
                    var additionType = $("#addtionMode").val();
                    var additionPointNum = Number(this.$el.find("#additionPoint").val());
                    var additionPoint = (additionType == "plus") ? additionPointNum : - additionPointNum;
                    this.model.set({
                        additionPoint : additionPoint
                    });

                    GO.EventEmitter.trigger('common', 'layout:setOverlay', "로딩중");
                    this.model.save({}, {
                        method : "PUT",
                        success : $.proxy(function(){
                            this.trigger("save.success");
                        },this),
                        complete : function(){
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay');
                        }
                    })
                }
            });

            return CompanyManageChangePopup;

        });

})();
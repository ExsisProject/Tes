(function () {
    define([
            "backbone",
            "app",
            "welfare/models/company_manage_user_welfare",
            "hgn!welfare/templates/company_manage_welfare_popup",
            "i18n!welfare/nls/welfare"
        ],

        function (
            Backbone,
            GO,
            UserWelfareModel,
            Tmpl,
            WelfareLang
        ) {
            var lang = {
                "연도" : WelfareLang["연도"],
                "ID(계정)" : WelfareLang["ID(계정)"],
                "입사일" : WelfareLang["입사일"],
                "년간 Point" : WelfareLang["년간 Point"]
            }
            var CompanyManageWelfarePopup = Backbone.View.extend({
                events: {},

                initialize: function () {
                    this.$el.off();
                    this.welfareId = this.options.welfareId;
                    this.model = new UserWelfareModel();
                    this.model.set({id : this.welfareId});
                    this.model.fetch({async : false});
                },

                render: function () {
                    this.$el.html(Tmpl({
                        lang : lang,
                        data : this.model.toJSON()
                    }));

                    this.initDatePicker();

                    return this;
                },

                save : function(){
                    var $el = this.$el;
                    this.model.set({
                        hireDate : $el.find("#hireDate").val(),
                        totalPoint : $el.find("#totalPoint").val()
                    });
                    this.model.save({}, {
                        success : $.proxy(function(){
                            this.trigger("save.success");
                        },this)
                    })
                },

                initDatePicker : function(){
                    var hireDate = this.model.get("hireDate");
                    var $hireDate = this.$el.find("#hireDate");

                    $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
                    $hireDate.datepicker({
                        dateFormat : "yy-mm-dd",
                        changeMonth: true,
                        changeYear : true,
                        yearSuffix: ""
                    });

                    //입사일이 등록되어 있을경우에만 해당 날짜 Set, 없으면 null
                    if(hireDate.length > 0) {
                        $hireDate.val(hireDate);
                    }
                }

            });

            function privateFunc(view, param1, param2) {

            }

            return CompanyManageWelfarePopup;

        });

})();
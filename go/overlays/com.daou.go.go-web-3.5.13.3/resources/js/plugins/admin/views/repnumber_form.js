(function() {
    define([
        "backbone", 
        "app",
        
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "i18n!sms/nls/sms",
        "hgn!admin/templates/repnumber_form",
        "sms/models/sms_repnumber",
        "GO.util",
        "jquery.go-validation",
        "jquery.go-preloader",
        "jquery.go-sdk"
    ],

    function(
        Backbone,
        GO,
        
        CommonLang,
        AdminLang,
        SmsLang,
        FormTmpl,
        SmsRepnumberModel
    ) {
        var lang = {
            "save" : CommonLang["저장"],
            "cancel" : CommonLang["취소"],
            "save_success" : CommonLang["저장되었습니다."],
            "remove" : CommonLang["삭제"],
            "state" : AdminLang["사용여부"],
            "normal" : AdminLang["정상"],
            "hidden" : AdminLang["숨김"],
            "menu_title" : AdminLang["대표번호 설정"],
            "rep_info" : SmsLang["대표번호 등록정보"],
            "repnumber_name" : SmsLang["대표번호 이름"],
            "repnumber" : SmsLang["발신번호"],
            "limit_char" : GO.i18n(AdminLang["0자이상 0이하 입력해야합니다."], {arg1: 1, arg2: 64})
        };
        
        var SmsRepNumberForm = Backbone.View.extend({
            
            el : '#layoutContent',
            
            events : {
            	"click input[id*='_all']" : "selectAll",
                "click #save" : "save",
                "click #cancel" : "cancel"
            },

            initialize : function() {
                this.$el.off();
                this.isCreate = (this.options.repNumberId == undefined || this.options.repNumberId == "create") ? true : false;
                this.model = new SmsRepnumberModel({
                	type : "company"
                });
                
                if(this.isCreate){
                    this.model.setInitData();
                }else{
                    this.model.set({id : this.options.repNumberId});
                    this.model.fetch({async : false});
                }
            },

            render : function() {
                initContent.call(this);
            },
            
            save : function(){
            	
                var preloader = $.goPreloader();
                preloader.render();
                
                setData.call(this);
                
                if(!validate.call(this)){
                	preloader.release();
                    return false;
                }
                
                this.model.save(null, {
                    success : function(){
                        preloader.release();
                        var url = "sms/repnumber";
                        $.goMessage(lang.save_success);
                        GO.router.navigate(url, {trigger: true});
                    },
                    error : function(model, response) {
                        preloader.release();
                        if(response.message) $.goAlert(response.message);
                        else $.goMessage(CommonLang["실패했습니다."]);
                    }
                });
            },
            selectAll : function(e) {
            	var currentTarget = $(e.currentTarget),
            		targetChecked = currentTarget.is(":checked");
            	$("input[name='" + currentTarget.attr("name") + "']").attr("checked", targetChecked);
            },
            cancel : function(){
                var url = "sms/repnumber";
                GO.router.navigate(url, {trigger: true});
            },
        },
        {
            render : function(options){
                var repNumberForm = new SmsRepNumberForm(options);
                repNumberForm.render();
                return repNumberForm;
            }
        }
        );
        
        function setData(){
            this.model.set({
                "name" : this.$el.find("#name").val(),
                "repNumber" : this.$el.find("#repNumber").val(),
                "status" : $(":radio[name='status']:checked").val()
            });
        };
        
        
        function validate(){
            if(!$.goValidation.isCheckLength(1, 64, this.model.get("name"))){
                this.$el.find("#name_validation").show();
                this.$el.find("#name").focus();
                return false;
            }else{
                this.$el.find("#name_validation").hide();
            }
            if(!$.goValidation.isCheckLength(1, 64, this.model.get("repNumber"))){
                this.$el.find("#repNumber_validation").show();
                this.$el.find("#repNumber_validation").text(GO.i18n(AdminLang["0자이상 0이하 입력해야합니다."], {arg1: 1, arg2: 64}));
                this.$el.find("#repNumber").focus();
                return false;
            }else{
                this.$el.find("#repNumber_validation").hide();
            }
            
            if($.trim(this.model.get("repNumber")) && !$.goValidation.isInvalidTel(this.model.get("repNumber"))){
            	this.$el.find("#repNumber_validation").show();
            	this.$el.find("#repNumber_validation").text(AdminLang["전화번호허용문자"]);
                this.$el.find("#repNumber").focus();
                return false;
            }
            
            return true;
        };

        function initContent() {
            
            this.$el.html(FormTmpl({
                lang : lang,
                data : $.extend({}, this.model.toJSON(), {
                	isNormal : this.model.get("status") == "NORMAL",
                })
            }));
        };
        

        return SmsRepNumberForm;
    });

})();
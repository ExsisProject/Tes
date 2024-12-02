define(function(require) {
    var Backbone = require("backbone");
    var CommonLang = require("i18n!nls/commons");
    var UserLang = require("i18n!nls/user");
    var ContactLang = require("i18n!contact/nls/contact");
    var ContactPrintTpl = require("hgn!contact/templates/contact_print");
    var Contacts = require("contact/collections/contacts");

    var lang = {
        'name' : CommonLang['이름'],
        'email' : UserLang['이메일'],
        'mobileno' : UserLang['휴대폰'],
        'companyname' : UserLang['회사'],
        'company_tel' : ContactLang['회사전화']
    };

    var ContactPrintView = Backbone.View.extend({
        isUser : function(){
            return this.type == "USER";
        },
        isDept : function(){
            return this.type == "DEPARTMENT";
        },
        isCompany : function(){
            return this.type == "COMPANY";
        },
        initialize : function() {
            this.type = sessionStorage.getItem("type");
            var pPage = sessionStorage.getItem("contactPrintPage");
            var deptId = sessionStorage.getItem("deptId");
            var pOffset = sessionStorage.getItem("contactPrintOffset");
            var pDirection = sessionStorage.getItem("contactPrintDirection");
            var pProperty = sessionStorage.getItem("contactPrintProperty");
            var pPattern = sessionStorage.getItem("initialConsonantPattern");
            var pData = {page : pPage, offset : pOffset, direction : pDirection, property : pProperty, initialConsonantPattern : pPattern};

            if(pPattern == 'undefined'){
                pData = {page : pPage, offset : pOffset, direction : pDirection, property : pProperty};
            }
            if(sessionStorage.getItem("contactPrintOffset") =='9999') {//전체/ 현재 목록 인쇄 구분
                pData = {page : 0, offset : pOffset, direction : pDirection, property : pProperty};
            }
            var groupId = sessionStorage.getItem("groupId");

            if(groupId != 'undefined'){
                pData["groupId"] = groupId;
            }

            if(deptId != 'undefined'){
                pData["deptId"] = deptId;
            }

            pData["type"] = this.type;

            this.collection = new Contacts();
            this.collection.findAll(pData);
        },
        render : function() {
            this.$el.html(ContactPrintTpl({
                lang : lang,
                data : this.collection.toJSON()
            }));

            return this;
        }
    });
    return ContactPrintView;
});
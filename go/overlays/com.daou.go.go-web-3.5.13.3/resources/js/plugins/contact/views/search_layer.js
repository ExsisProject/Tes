define(function(require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var CommonLang = require("i18n!nls/commons");
    var UserLang = require("i18n!nls/user");
    var ContactLang = require("i18n!contact/nls/contact");
    var Tpldetail = require("hgn!contact/templates/search_layer");
    var JoinedDepts = require("collections/joined_depts");

    var lang = {
            'name' : CommonLang['이름'],
            'email' : UserLang['이메일'],
            'mobileno' : UserLang['휴대폰'],
            'companyname' : UserLang['회사'],
            'tel' : CommonLang['전화번호'],
            'personal' :  ContactLang['개인 주소록'],
            'company' : ContactLang['전사 주소록'],
            'dept' : ContactLang["부서 주소록"],
            'all' : CommonLang['전체'],
            'searchresult' : CommonLang['검색결과'],
            'searchword' : CommonLang['검색어'],
            'contacttype' : ContactLang['주소록 구분']
    };

    var detailSearchLayer = Backbone.View.extend({
        el : '.go_popup .content',

        events : {
            "change #searchType" : "selectType"
        },

        initialize: function() {
            this.$el.off();
            this.joinedDepts = JoinedDepts.fetch();
        },

        render: function() {
            var tpltmpList = Tpldetail({
                lang:lang,
                depts : this.joinedDepts.toJSON()
            });
            this.$el.html(tpltmpList);
        },

        selectType : function(e){
            var $target = $(e.currentTarget);
            var value = $target.val();

            if(value == "DEPARTMENT"){
                this.$el.find("#deptList").show();
            }else{
                this.$el.find("#deptList").hide();
            }
        }
    });

    return {
        render: function(opt) {
            var detail = new detailSearchLayer();
            return detail.render(opt);
        }
    };
});

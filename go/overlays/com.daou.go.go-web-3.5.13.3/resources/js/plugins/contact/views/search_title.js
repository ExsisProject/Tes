define(function(require) {
    var App = require("app");
    var tplSearchTitle = require("hgn!contact/templates/search_title");
    var contactSearchLayerView = require("contact/views/search_layer");
    var totalSearchView = require("dashboard/views/search/detail_search_popup");
    var commonLang = require("i18n!nls/commons");
    require("jquery.go-grid");
    require("jquery.go-popup");
    require("jquery.go-validation");

    var lang = {
        'placeholder_search' : commonLang['플레이스홀더검색'],
        'search_detail' : commonLang['상세검색'],
        'search' : commonLang['검색'],
        'app_search' : commonLang["앱검색"],
        'unified_search' : commonLang["통합검색"],
        'detail' : commonLang['상세'],
        'contact' : commonLang['주소록']
    };

    // server 전송시 params 이 다름
    var TYPE_MAPPER = {
        "USER" : "user",
        "COMPANY" : "company",
        "DEPARTMENT" : "department"
    }

    var ContactHome = Backbone.View.extend({
        el : '.content_top',

        events : {
            "click #detailContactSearch" : "detailContactSearch",
            "click #simpleContactSearch" : "simpleContactSearch",
            "keydown #simpleContactInput" : "simpleContactInput"
        },

        isUser : function(){
            return this.type == "USER";
        },

        isCompany : function(){
            return this.type == "COMPANY";
        },

        isDept : function(){
            return this.type == "DEPARTMENT";
        },

        initialize: function() {
            this.type = this.options.type;          // owner type
            this.groupId = this.options.groupId;    // group id
            this.deptId = this.options.deptId;      // dept id
            this.$el.off();
        },

        render : function() {

            var tmpl = tplSearchTitle({
                lang : lang
            });
            this.$el.find('#search').remove();
            this.$el.append(tmpl);
            $('input[placeholder], textarea[placeholder]').placeholder();
        },

        detailContactSearch : function(e){
            var searchType = $('#searchType').val();
            if(searchType != "appSearch"){
                this.totalSearchDetailPopup(e);
            }else{
                this.appSearchDetailPopup(e);
            }
        },

        appSearchDetailPopup : function(e) {
            var targetOffset = $(e.currentTarget).offset();
            var _this = this;
            this.appSearchPopup = $.goSearch({
                header: commonLang['상세검색'],
                modal: true,
                offset: {
                    top: parseInt(targetOffset.top + 30, 10),
                    right: 7
                },
                callback: function () {
                    _this.searchAction();
                }
            });

            $('div.detail_search input').die('keydown');
            $('div.detail_search input').live('keydown', function (e) {
                _this.detailSearchNameInput(e);
            });

            contactSearchLayerView.render();
        },

        totalSearchDetailPopup : function(e) {
            var self = this;
            var detailSearchPopupView = new totalSearchView();
            var targetOffset = $(e.currentTarget).offset();

            var searchPopup = $.goSearch({
                modal : true,
                header : commonLang["상세검색"],
                offset : {
                    top : parseInt(targetOffset.top + 30, 10),
                    right : 7
                },
                callback : function() {
                    if (detailSearchPopupView.validate())
                        self.search(detailSearchPopupView.getSearchParam());
                }
            });

            searchPopup.find(".content").html(detailSearchPopupView.el);
            detailSearchPopupView.render();
        },

        simpleContactSearch : function() {

            //var groupId = $('#groupInfoName').attr('data-groupId');
            var keyword = $.trim($('#simpleContactInput').val());
            var searchType = $('#searchType').val();
            if(keyword == '' || keyword == $('#simpleContactInput').attr('placeholder')) {
                $.goSlideMessage(commonLang['검색어를 입력하세요.'], "caution");
                return;
            }

            if(!$.goValidation.isCheckLength(2,64,keyword)){
                $.goMessage(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"64"}));
                return;
            }

            if($.goValidation.isInValidEmailChar(keyword)){
                $.goMessage(commonLang['메일 사용 불가 문자']);
                return;
            }

            var param = {
                name : keyword,
                keyword : keyword,
                deptId : this.deptId,
                ownerType : TYPE_MAPPER[this.type],
                date : GO.util.toISO8601(new Date())
            };

            if(searchType == "appSearch"){
				param.email = keyword;
				param.mobileNo = keyword;
				param.companyName = keyword;
				param.officeTel = keyword;
				param.searchType = 'or';
                App.router.navigate('contact/search?'+this._serializeObj(param), {replace:true, trigger: true, pushState:true});
            }else{
                param.stype = "simple";
                param.searchTerm = "all";
                param.offset = 5;
                App.router.navigate('unified/search?'+this._serializeObj(param), true);
            }
        },

        searchAction : function() {
            var $popupEl = this.appSearchPopup;
            var name = $.trim($popupEl.find('#name').val());
            var email = $.trim($popupEl.find('#email').val());
            var mobileNo = $.trim($popupEl.find('#mobileNo').val());
            var companyName = $.trim($popupEl.find('#companyName').val());
            var officeTel = $.trim($popupEl.find('#officeTel').val());
            var ownerType = $popupEl.find("#searchType").val();

            if(name == "" && email == "" && mobileNo == "" && companyName == "" && officeTel == ""){
                $.goSlideMessage(commonLang['검색어를 입력하세요.'], "caution");
                return;
            }

            var invalidAction = function(msg, focusEl) {
                $.goMessage(msg);
                if(focusEl) focusEl.focus();
                return false;
            };

            if(name.length > 0) {
                if(!$.goValidation.isCheckLength(2, 64, name)) {
                    invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"64"}), $('#name'));
                    return false;
                }

                if($.goValidation.isInValidEmailChar(name)){
                    $.goMessage(commonLang['메일 사용 불가 문자']);
                    return false;
                }
            }

            if(email.length > 0) {
                if(!$.goValidation.isCheckLength(2, 255, email)) {
                    invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"255"}), $('#email'));
                    return false;
                }

                if($.goValidation.isInValidEmailChar(email)){
                    $.goMessage(commonLang['메일 사용 불가 문자']);
                    return false;
                }
            }

            if(!$.goValidation.isCheckLength(0, 40, mobileNo)) {
                invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"40"}), $('#mobileNo'));
                return false;
            }

            if($.goValidation.isInValidEmailChar(mobileNo)){
                $.goMessage(commonLang['메일 사용 불가 문자']);
                return false;
            }

            if(!$.goValidation.isCheckLength(0, 255, companyName)) {
                invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"255"}), $('#companyName'));
                return false;
            }

            if($.goValidation.isInValidEmailChar(companyName)){
                $.goMessage(commonLang['메일 사용 불가 문자']);
                return false;
            }

            if(!$.goValidation.isCheckLength(0, 40, officeTel)) {
                invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"40"}), $('#officeTel'));
                return false;
            }

            if($.goValidation.isInValidEmailChar(officeTel)){
                $.goMessage(commonLang['메일 사용 불가 문자']);
                return false;
            }

            var param = {
                    name : name,
                    email : email,
                    mobileNo : mobileNo,
                    companyName : companyName,
                    officeTel : officeTel,
                    ownerType : ownerType,
                    date : GO.util.toISO8601(new Date())
            };

            if(param["ownerType"] == "DEPARTMENT"){
                param["deptId"] = $("#deptList").val();
            }

            this.search(param);

        },

        search : function(param){
            var searchType = $('#searchType').val();
            if(searchType == "appSearch"){
                App.router.navigate('contact/search?'+this._serializeObj(param), {trigger: true, pushState:true});
            }else{
                App.router.navigate('unified/search?'+this._serializeObj(param), {trigger: true, pushState:true});
            }
        },

        detailSearchNameInput : function(e){
            if(e.keyCode == 13){
                this.searchAction();
            }
        },

        simpleContactInput : function(e){
            if(e.keyCode == 13){
                this.simpleContactSearch();
            }
        },

        _serializeObj : function(obj) {
            var str = [];
            for(var p in obj) {
                if(obj[p] != undefined && obj[p] != "") {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            }
            return str.join("&");
        },

    });

    return {
        render: function(type, groupId, deptId) {
            var instance = new ContactHome({type : type, groupId : groupId, deptId : deptId});
            return instance.render();
        }
    };
});
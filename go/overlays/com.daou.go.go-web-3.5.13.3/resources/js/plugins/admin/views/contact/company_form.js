define(function (require) {
    var GO = require('app');
    var _ = require("underscore");
    var Backbone = require("backbone");
    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");

    var Template = require("hgn!admin/templates/contact/company_form");
    var EmptyTemplate = require("hgn!admin/templates/contact/company_empty");

    var CircleTableView = require("views/circle_tableTmpl");
    var CircleView = require("views/circle");

    require("jquery.go-popup");

    var lang = {
        "주소록 명": AdminLang["주소록 명"],
        "운영자": AdminLang["운영자"],
        "열람자 설정": AdminLang["열람자 설정"],
        "예외자 설정": AdminLang["예외자 설정"],
        "공용 주소록을 선택해 주세요": AdminLang["공용 주소록을 선택해 주세요"],
        "전사 주소록": AdminLang["전사 주소록"],
        "저장되었습니다.": CommonLang["저장되었습니다."],
        "취소되었습니다." : CommonLang["취소되었습니다."],
        "저장" : CommonLang["저장"],
        "취소" : CommonLang["취소"]
    };

    var ContactFolderModel = Backbone.Model.extend({
        defaults: {},

        isSiteAdmin : true,

        initialize: function (options) {
            this.isSiteAdmin = _.isUndefined(options.isSiteAdmin) ? this.isSiteAdmin : options.isSiteAdmin;
        },

        urlRoot: function(){
            if(this.isSiteAdmin){
                return GO.contextRoot + "ad/api/contact/companyfolder/manage";
            }else{
                return GO.contextRoot + "api/contact/companyfolder/manage";
            }
        }
    });

    var ContactCompany = Backbone.View.extend({
        className: "col2",

        events: {
            "click #save": "save",
            "click #cancel" : "cancel"
        },

        isAdmin: true,
        isSiteAdmin : true,

        initialize: function (options) {
            this.accessTargetView = null;
            this.exceptionTargetView = null;
            this.isAdmin = _.isUndefined(options.isAdmin) ? this.isAdmin : options.isAdmin;
            this.isSiteAdmin = _.isUndefined(options.isSiteAdmin) ? this.isSiteAdmin : options.isSiteAdmin;
            this.model = new ContactFolderModel({isSiteAdmin : this.isSiteAdmin});
        },

        render: function (groupId) {
            this.model.set({id: groupId});
            this.model.fetch({async: false});

            if(_.isUndefined(this.model.get("id"))){
            	this.$el.html(EmptyTemplate({
                    lang: lang
                }));
            }else{
            	this.$el.html(Template({
                    lang: lang,
                    name: this.model.get("name")
                }));
            }

            var useOrgService = GO.util.isUseOrgService(this.isSiteAdmin)
            this.renderAdminView(useOrgService);
            this.renderAccessTargetView(useOrgService);
            this.renderExceptionTargetView(useOrgService);
        },
        
        cancel: function() {
        	$.goSlideMessage(lang["취소되었습니다."]);
            this.trigger("company_form.refresh");
        },

        save: function () {
            var $el = this.$el,
                name = $el.find("#name").val(),
                accessTarget = this.accessTargetView.getData(),
                exceptionTarget = this.exceptionTargetView.getData(),
                admin = this.adminView.getData();

            this.model.set({
                name: name,
                accessTarget: accessTarget,
                exceptionTarget: exceptionTarget,
                admins: admin
            }, {silent: true});

            this.model
                .save()
                .done($.proxy(function () {
                    $.goMessage(lang["저장되었습니다."]);
                    this.trigger("company_form.refresh");
                }, this));
        },

        renderAdminView: function (useOrgService) {
            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];

            if (useOrgService) {
                nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }

            if (this.model.get("manager") != null) {
                this.model.get("manager").nodes = _.sortBy(this.model.get("manager").nodes, 'nodeType');
            }
            this.adminView = new CircleView({
                selector: '#admin',
                isAdmin: this.isSiteAdmin,
                isWriter: true,
                circleJSON: this.model.get("admins"),
                nodeTypes: nodeTypes
            });
            this.adminView.render();
        },

        renderEmpty: function () {
            this.$el.html(EmptyTemplate({
                lang: lang
            }));
        },

        renderAccessTargetView: function (useOrgService) {
            var nodeTypes = ['company', 'user', 'position', 'grade', 'usergroup'];
            if (useOrgService) {
                nodeTypes = ['company', 'user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }
            if (this.model.get("accessTarget") != null) {
                this.model.get("accessTarget").nodes = _.sortBy(this.model.get("accessTarget").nodes, 'nodeType');
            }
            this.accessTargetView = new CircleTableView({
                selector: '#accessTarget',
                isAdmin: this.isSiteAdmin,
                isWriter: true,
                circleJSON: this.model.get("accessTarget"),
                nodeTypes: nodeTypes
            });
            this.accessTargetView.render();
        },

        renderExceptionTargetView: function (useOrgService) {
            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
            if (useOrgService) {
                nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }
            if (this.model.get("exceptionTarget") != null) {
                this.model.get("exceptionTarget").nodes = _.sortBy(this.model.get("exceptionTarget").nodes, 'nodeType');
            }
            this.exceptionTargetView = new CircleTableView({
                selector: '#exceptionTarget',
                isExceptionList: true,
                isAdmin: this.isSiteAdmin,
                isWriter: true,
                circleJSON: this.model.get("exceptionTarget"),
                nodeTypes: nodeTypes
            });
            this.exceptionTargetView.render();
        },
    });

    return ContactCompany;
});
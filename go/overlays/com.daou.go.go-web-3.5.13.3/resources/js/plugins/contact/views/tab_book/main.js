/**
 * tab_book main view
*/
;define(function (require) {
    var UserContactView = require("contact/views/tab_book/content/user");
    var DeptContactView = require("contact/views/tab_book/content/department");
    var CompanyContactView = require("contact/views/tab_book/content/company");
    var OrgContactView = require("contact/views/tab_book/content/org");
    var SearchContactView = require("contact/views/tab_book/content/search");
    var TabView = require("contact/views/tab_book/toolbar/tab");

    var renderFactory = {
        "USER" : UserContactView,
        "DEPARTMENT" : DeptContactView,
        "COMPANY" : CompanyContactView,
        "ORG" : OrgContactView,
        "USERSEARCH" : SearchContactView
    };

    // Main View = TabView + contentView
    var ConnectorInfo = function (options) {
        this.tabArea = options.tabArea;
        this.infoArea = options.infoArea;

        var mode = options.mode; // MAIL, SMS
        
        var typeManager = options.typeManager;
        var initType = typeManager.getType();    

        this.tabView = new TabView({
            tabMenus : typeManager.getMenus(),
            initType : initType
        });

        this.contentView = new renderFactory[initType]({mode : mode});

        this.tabView.on("tab.click", $.proxy(function (data) {
            var type = data.type;
            this.contentView = new renderFactory[type]({mode: mode});
            $(this.infoArea).html(this.contentView.el);
            this.contentView.render();
            typeManager.saveType(type);
        }, this));
    };

    ConnectorInfo.prototype.getSelectedGroup = function () {
        return this.contentView.getSelectedGroup();
    };

    ConnectorInfo.prototype.getSelectedUsers = function () {
        return this.contentView.getSelectedUsers();
    };

    ConnectorInfo.prototype.render = function () {
        $(this.tabArea).html(this.tabView.el);
        $(this.infoArea).html(this.contentView.el);

        this.tabView.render();
        this.contentView.render();
    };

    return ConnectorInfo;
});
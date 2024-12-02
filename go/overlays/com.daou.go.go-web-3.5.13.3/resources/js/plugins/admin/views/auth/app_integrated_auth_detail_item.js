define('admin/views/auth/app_integrated_auth_detail_item', function (require) {

    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var App = require('app');

    var Tmpl = require('hgn!admin/templates/auth/app_integrated_auth_detail_item');
    var ItemModel = require('admin/models/auth/app_integrated_auth');
    var CircleView = require('views/circle');

    var CommonLang = require("i18n!nls/commons");
    var AdminLang = require("i18n!admin/nls/admin");

    var ContentLinkInfos = [
        {type: 'CompanyAssetManager', lang: AdminLang['자산을 먼저 추가해주세요'], link: '/asset'},
        {type: 'CompanyDocsOperator', lang: AdminLang['문서함을 먼저 추가해주세요'], link: '/docs'},
        {type: 'CommunityMaster', lang: AdminLang['생성된 커뮤니티가 없습니다'], link: null},
        {type: 'WorksAppOperator', lang: AdminLang['생성된 Works앱이 없습니다'], link: null}
    ];

    return Backbone.View.extend({

        tagName: 'tr',
        events: {
            'click .add_admin': 'addAdmin',
            'click .add_action': 'addAction',
            'click .auth_checkbox': 'updateAction',
            'click .ic_del': '_removeAdmin',
            'click .content_link': 'moveContentPage',
            'click .sel_auth_item': 'updateSelectedRow',
            'click .shortcut': 'moveOriginSettingPage',
        },
        initialize: function (options, viewOpt) {
            this.model = options;
            this.viewOpt = viewOpt;

            this.contentId = this.model.contentId ? this.model.contentId : '';
            this.isMyLevel = this.model.authLevel === this.viewOpt.appAuthLevel;
            this.authId = this.model.appAuthType + '-auth-detail' + this.contentId;

        },
        renderAuthData: function () {
            var type = this.model.authDataType;

            if (this.model.authLevel !== this.viewOpt.appAuthLevel) {
                return this.renderContentAuthLink();
            }

            if (type === 'USER') {
                return this.renderUserTypeAuthData();
            } else if (type === 'USER_ACTION') {
                return this.renderUserActionAuthData();
            } else if (type === 'CIRCLE') {
                return this.renderCircle();
            }else if ( type === 'CIRCLE_ACTION'){
                return this.renderUserActionAuthData();
            }

        },
        renderContentAuthLink: function () {
            var linkInfo = this.getContentLinkInfo();

            if( !!linkInfo && this.model.isEmptyContent() ){
                return '<span data-link="(data-link)" class="btn_tool light content_link">'.replace('(data-link)', linkInfo.link ? linkInfo.link : 'none') +
                    '<span class="ic_adm ic_accordion_s_folded"></span>' +
                    '<span class="txt">(txt)</span>'.replace('(txt)', linkInfo.lang) +
                    '</span>';
            }else{
                return '<span value="(menuKey)" class="btn_tool light content_link">'.replace('(menuKey)', this.model.appAuthType) +
                    '<span class="ic_adm ic_accordion_s_folded"></span>' +
                    '<span class="txt">(menuName)</span>'.replace('(menuName)', this.model.name + ' ' + CommonLang['관리']) +
                    '</span>';
            }

        },
        getContentLinkInfo: function () {
            for (var i = 0; i < ContentLinkInfos.length; i++) {
                if (ContentLinkInfos[i].type === this.model.appAuthType) {
                    return ContentLinkInfos[i];
                }
            }
            return undefined;
        },
        renderUserTypeAuthData: function () {
            var addText = this.viewOpt.singleManagerType ? AdminLang['마스터 변경'] : AdminLang['운영자 추가'];
            var tpl = '<ul class="name_tag">';
            var self = this;
            _.forEach(this.model.users, function (user) {
                tpl += '<li> <span class="name" value="(userId)">(name)</span>'.replace('(userId)', user.id)
                    .replace('(name)', user.name);
                if (!self.viewOpt.singleManagerType && self.model.owner) {
                    tpl += '<span class="btn_wrap"><span class="ic ic_del" value="(userId)" title="'.replace('(userId)', user.id)
                        + CommonLang['삭제'] + '"></span></span></li>'
                }
            });
            if( self.model.owner) {
                tpl += '<li class="creat add_admin"> <span class="btn_wrap"> <span class="ic ic_addlist"></span> ' +
                    '<span class="txt">(addtext)</span> </span> </li>'.replace('(addtext)', addText);
            }
            tpl += '</ul>';
            return tpl;
        },
        renderUserActionAuthData: function () {
            var tpl = '';

            _.forEach(this.model.actionModel, function (action) {
                tpl += '<div class="wrap_row"><span class="cell">' +
                    '<ul class="name_tag"> <li>' +
                    '<span class="name">(name)</span>'.replace('(name)', action.user.name) +
                    '<span class="btn_wrap">' +
                    '<span class="ic ic_del" value="(userId)" title="(delete)"></span>'.replace('(delete)', CommonLang['삭제']).replace('(userId)', action.user.id) +
                    '</span> </li> </ul>' +
                    '<div class="wrap_sub">' +
                    '<span class="option_wrap">' +
                    '<input type="checkbox" class="auth_checkbox" name="(userId)" value="write, manage" checked>'
                        .replace('checked', action.write ? 'checked' : '')
                        .replace('(userId)', action.user.id)

                    + '<label>' + AdminLang['수정 권한'] + '</label>' +
                    '</span>' +
                    '<span class="option_wrap">' +
                    '<input type="checkbox" class="auth_checkbox" name="(userId)" value="remove" checked>'
                        .replace('checked', action.remove ? 'checked' : '')
                        .replace('(userId)', action.user.id)
                    + '<label>' + AdminLang['삭제 권한'] + '</label>' +
                    '</span> </div> </span></div>'
            });

            var addLang = this.model.authDataType ==='CIRCLE_ACTION' ? AdminLang['운영자 추가'] :AdminLang['관리자 추가']  ;
            tpl += '<ul class="name_tag add_action">' +
                '<li class="creat">' +
                '<span class="btn_wrap">' +
                '<span class="ic ic_addlist"></span>' +
                '<span class="txt">' + addLang + '</span>' +
                '</span> </li> </ul>';
            return tpl;

        },
        refresh: function () {
            var type = this.model.authDataType;
            if (type === 'CIRCLE') {
                this.renderCircle();
            }
        },
        renderCircle: function () {
            var type = this.model.authDataType;
            if (type !== 'CIRCLE') {
                return;
            }

            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
            if (GO.util.isUseOrgService(true)) {
                nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }
            this.circleView = new CircleView({
                selector: '#' + this.authId,
                isAdmin: true,
                isWriter: true,
                id: this.authId,
                changeCallback: this.circleCb,
                circleJSON: this.model.circle,
                nodeTypes: nodeTypes,
            });

            this.circleView.render();
            this.circleView.show();

            $('body').off(this.authId + "circle.data.updated");
            $('body').on(this.authId + "circle.data.updated", $.proxy(this._updateCircle, this));
            return '';
        },
        circleCb: function (data) {
            $('body').trigger(this.id + 'circle.data.updated');
        },
        _updateCircle: function () {
            if (this.viewOpt.viewSaveButton) {
                this.model.updateCircleData(this.circleView.getData());
            } else {
                this.model.updateCircle(this.circleView.getData());
            }
        },
        getSaveUpdatedModel: function () {
            if (!this.model.updated) {
                return;
            }
            return this.model.getSaveModel();
        },
        render: function () {

            var menu = this.viewOpt.menus.findMenuFromHref(this.model.originLink);
            var accessible = false;

            var linkName = this.model.name;
            if (menu) {
                linkName = menu.getTitle();
                accessible =menu.accessible;
            }

            var hasTooltip = this.model.tooltip && this.model.tooltip.length > 0;

            this.$el.html(Tmpl({
                contextRoot: GO.contextRoot,
                AdminLang: AdminLang,
                CommonLang: CommonLang,
                name: this.model.name,
                groupName: this.model.groupName,
                groupKey: this.model.groupKey,
                authId: this.authId,
                authType: this.model.appAuthType,
                contentKey: this.model.contentKey,
                viewCkbox: this.isMyLevel && this.viewOpt.useCheckBox && this.model.owner,
                contentName: this.model.contentName,
                originLink: this.model.originLink,
                isContentAuthView: this.viewOpt.isContentAuthView,
                isAppAuthView: this.viewOpt.isAppAuthView,
                isCompanyShare: this.model.companyShare,
                isContent: this.model.appAuthLevel === 'AppContentOperator',
                hasTooltip: hasTooltip,
                linkName: linkName,
                tooltip: this.model.tooltip,
                isAccessible:accessible,
            }));

            var authDetail = this.$el.find('#' + this.authId);
            authDetail.append(this.renderAuthData());

            return this;
        },
        showOrgSlide: function (e, cb) {
            var self = this;

            if (this.model.appAuthType === 'CommunityMaster') {
                var communityId = this.model.contentId;

                $.goOrgSlide({
                    header: AdminLang["마스터 변경"],
                    type: 'community',
                    contextRoot: GO.contextRoot,
                    callback: $.proxy(function (data) {
                        cb(self, data, e);
                    }, this),
                    loadId: communityId,
                    isAdmin: true,
                    accessOrg: true
                });
            } else {
                $.goOrgSlide({
                    header:this.model.authDataType !=='USER_ACTION' ?AdminLang["운영자 추가"] : AdminLang['관리자 추가'],
                    desc: '',
                    callback: $.proxy(function (data) {
                        cb(self, data, e);
                    }, this),
                    target: e,
                    isAdmin: true,
                    contextRoot: GO.contextRoot
                });
            }

        },
        addAction: function (e) {
            this.showOrgSlide($(e.currentTarget), this._saveAction);
        },
        updateAction: function (e) {
            var target = $(e.currentTarget);
            var value = target.attr('value');
            var userId = target.attr('name');
            var checked = !!target.attr('checked');
            var action = this.model.findAction(userId);

            action.read = true;
            action.write = value.indexOf('write') >= 0 ? checked : action.write;
            action.remove = value.indexOf('remove') >= 0 ? checked : action.remove;
            action.manage = value.indexOf('manage') >= 0 ? checked : action.manage;

            this._saveAction(this, action.user);

        },
        _saveAction: function (self, data, e) {
            self.model.addUser(data);
            console.log(self.model)
            self.render();

        },
        addAdmin: function (e) {
            this.showOrgSlide($(e.currentTarget), this._addAdmin);
        },
        _addAdmin: function (self, data, e) {
            self.model.addUser(data);
            console.log(self.model)
            self.render();
        },
        _removeAdmin: function (e) {
            var target = $(e.currentTarget);
            var id = target.attr('value');
            this.model.removeUser({id: id});
            this.render();
        },
        updateSelectedRow: function (e) {
            $('body').trigger('auth.selected.updated');
        },
        moveContentPage: function (e) {
            var target = $(e.currentTarget);
            var directLink = target.attr('data-link');
            if( !!directLink){
                if( directLink === 'none'){ return; }
                App.router.navigate(directLink, {trigger: true, pushState: true});
                return;
            }

            var appType = target.attr('value');
            var link = '/auth/app/' + appType;
            App.router.navigate(link, {trigger: true, pushState: true});
        },
        moveOriginSettingPage: function (e) {
            App.router.navigate(this.model.originLink, {trigger: true, pushState: true});
        }

    });
});
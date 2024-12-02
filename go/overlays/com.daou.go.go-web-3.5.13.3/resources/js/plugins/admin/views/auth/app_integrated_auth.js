define('admin/views/auth/app_integrated_auth', function (require) {

    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var App = require('app');

    var Tmpl = require('hgn!admin/templates/auth/app_integrated_auth');
    var AuthCollection = require('admin/collections/auth/app_integrated_auth_collection');
    var CategoryView = require('admin/views/auth/app_integrated_auth_category')
    var PageView = require('admin/views/layout/page_view');


    var CommonLang = require("i18n!nls/commons");
    var AdminLang = require("i18n!admin/nls/admin");

    var requiredSaveButtonTypes = ['ApprFormOperator'];
    var singleManagerTypes = ['CommunityMaster'];
    var notUsedCheckboxTypes = ['CommunityMaster'];

    return Backbone.View.extend({

        events: {
            'click #sel_auth_item_all': 'selectAll',
            'click .btn_adm_add': 'addAdmAll',
            'click .btn_adm_del': 'delAdmAll',
            'click .search_btn': 'changedSearchCondition',
            'click #ok_button': 'saveAll',
            'click #cancel_button': 'render',
            'click #back_list': 'backToList',
            'keydown #search_txt': 'keydownSearch',
            'keydown #search_content_txt': 'keydownSearch',
            'change #app_category_select': 'changedAppCategory',
            'change #search_category_select': 'changedSearchCategory',
            'click .sorting':'sort',
            'click .sorting_asc':'sort',
            'click .sorting_desc':'sort',
        },
        initialize: function (options) {
            var self = this;

            this.viewOpt = {};
            this.bc = options.bc;
            this.viewOpt.appAuthType = (options) ? options.opt1 : null;
            this.viewOpt.menus = (options)? options.menus : null;
            this.viewOpt.appAuthLevel = this.viewOpt.appAuthType ? 'AppContentOperator' : 'AppManager';
            this.viewOpt.isAppAuthView = this.viewOpt.appAuthLevel === 'AppManager';
            this.viewOpt.isContentAuthView = !this.viewOpt.isAppAuthView;

            this.viewOpt.pageView = this.viewOpt.isContentAuthView;
            this.viewOpt.viewSaveButton = !!_.find(requiredSaveButtonTypes, function (type) {
                return type === self.viewOpt.appAuthType;
            });
            this.viewOpt.singleManagerType = !!_.find(singleManagerTypes, function (type) {
                return type === self.viewOpt.appAuthType;
            });
            this.viewOpt.useCheckBox = !_.find(notUsedCheckboxTypes, function (type) {
                return type === self.viewOpt.appAuthType;
            });

            this.checkedCnt = 0;
            this.catViews = [];
            this.filterModel = {
                appAuthLevel: this.viewOpt.appAuthLevel,
                appCategory: 'ALL',
                userName: null,
                appAuthType: this.viewOpt.appAuthType,
                contentName: null
            };

            this.auths = new AuthCollection({filterModel: this.filterModel});
            this.viewOpt.appName = this.auths.appName;

        },
        keydownSearch: function (e) {
            if (e.keyCode === 13) {
                this.changedSearchCondition(e)
            }
        },
        changedSearchCondition: function (e) {

            this.filterModel.userName = null;
            this.filterModel.contentName = null;
            if (this.viewOpt.isAppAuthView) {
                this.filterModel.userName = $('#search_txt').val();
            } else {
                var searchCategory = $('#search_category_select').val();
                this.filterModel[searchCategory] = $('#search_content_txt').val();
            }

            _.forEach($('input[type=checkbox]:checked'), function (box) {
                $(box).attr('checked', false)
            });

            this.changePage(this, 0);
        },
        changedSearchCategory:function(e){
            var target = $(e.currentTarget);
            var category = target.val();
            if( category === 'userName'){
                $('#search_content_txt').attr('placeholder', AdminLang['검색할 운영자(이름+이메일)을 입력하세요']).val('').focus().blur();
            }else if( category ==='contentName'){
                $('#search_content_txt').attr('placeholder', AdminLang['검색할 {name}을 입력하세요'].replace('{name}', this.contentTitle())).val('').focus().blur();
            }
        },
        changedAppCategory: function (e) {
            var target = $(e.currentTarget);

            _.forEach($('input[type=checkbox]:checked'), function (box) {
                $(box).attr('checked', false);
            });

            var category = target.val();
            this.filterModel.appCategory = category;
            this.render();
        },
        updateBreadCrumbs:function(){
            if(this.viewOpt.isAppAuthView){ return; }
            this.bc.setSubMenu(this.auths.appName + ' ' + CommonLang['관리'],'/auth/app/' + this.viewOpt.appAuthType);
            this.bc.render();
        },
        render: function () {
            var searchInputKey = this.viewOpt.isAppAuthView ? 'search_txt' : 'search_content_txt';
            var searchTxt = $('#' + searchInputKey).val();
            var contentSelect = $('#search_category_select').val();

            this.$el.html(Tmpl({
                contextRoot: GO.contextRoot,
                AdminLang:AdminLang,
                CommonLang:CommonLang,
                isAppAuthView: this.viewOpt.isAppAuthView,
                isContentAuthView: this.viewOpt.isContentAuthView,
                pageView: this.viewOpt.pageView,
                viewCkbox: this.viewOpt.useCheckBox,
                multiManager:!this.viewOpt.singleManagerType,
                viewSaveButton: this.viewOpt.viewSaveButton,
                appTitle:this.contentTitle(),
            }));

            this.renderContents(true);
            this.addEventListner();
            this.renderPage();
            this.updateBreadCrumbs();

            if (searchTxt) {
                $('#' + searchInputKey).val(searchTxt);
            }
            this.updatedSelectedItems();

            if (contentSelect) {
                $('#search_category_select').val(contentSelect);
            }

            if( this.filterModel.appCategory) {
                $('#app_category_select').val(this.filterModel.appCategory);
            }

            return this;
        },
        renderContents: function (reload) {

            var checkedKeys = [];
            _.forEach($('input[type=checkbox]:checked'), function (box) {
                checkedKeys[checkedKeys.length] = $(box).attr('id');
            });

            this.$el.find('tbody').remove();
            var contents = $('#auth_table');

            if( reload) {
                this.auths.refresh();
            }
            for (var i = 0; i < this.auths.catModel.length; i++) {
                this.catViews[i] = new CategoryView(this.auths.catModel[i], this.viewOpt);
            }

            var viewSize = 0;

            _.forEach(this.catViews, function (catView) {
                contents.append(catView.$el);
                catView.render();
                viewSize += catView.hasContent ? 1 : 0 ;
                var groupKey = catView.model.appAuthGroup;
                if(!catView.hasContent && groupKey !== 'ALL') {
                    $('#app_category_select').find('option[value="' + groupKey + '"]').remove();
                }
            });

            _.forEach(checkedKeys, function (key) {
                $('#' + key).attr('checked', true);
            });

            if (viewSize < 1) {
                contents.append(this.emptyContentTpl());
            }
            var lastHelpEl = contents.find("tbody:last .help .tool_tip");

            if (lastHelpEl.length > 0) {
                lastHelpEl.addClass("top");
            }

        },
        emptyContentTpl:function(){
            var collspanSize = this.viewOpt.isAppAuthView ? 5 : 3;
            var emptyTpl = '<tbody role="alert" aria-live="polite" aria-relevant="all"><tr class="odd"><td valign="top" colspan="'+ collspanSize +'" class="dataTables_empty">\n' +
                '    \n' +
                '        \n' +
                '            <p class="data_null">\n' +
                '                <span class="ic_data_type ic_no_data"></span> \n' +
                '                <span class="txt">' +  CommonLang['검색결과없음']+'</span>\n' +
                '            </p>\n' +
                '        \n' +
                '    \n' +
                '</td></tr></tbody>';

            return emptyTpl;
        },
        renderPage: function () {
            var target = $('#page_view');
            this.pageView = new PageView( {self:this, page:this.auths, pageCb:this.changePage, offsetCb:this.changeOffset});
            target.append(this.pageView.$el);
        },
        selectAll: function (e) {
            var target = $(e.currentTarget);
            var checked = !!target.attr('checked');

            _.forEach($('.sel_auth_item'), function (t) {
                $(t).attr('checked', checked);
            });

            this.updatedSelectedItems();
        },
        addEventListner: function () {
            $('body').on("auth.selected.updated", $.proxy(this.updatedSelectedItems, this));
        },
        showOrgSlide: function (e, cb, lang) {
            var self = this;
            $.goOrgSlide({
                header: AdminLang[lang],
                desc: '',
                callback: $.proxy(function (data) {
                    cb(self, data, e);
                }, this),
                target: e,
                isAdmin: true,
                contextRoot: GO.contextRoot
            });
        },
        addAdmAll: function (e) {
            if (this.checkedCnt < 1) {
                return;
            }
            this.showOrgSlide(e, this._addAdmAll, AdminLang['운영자 추가']);
        },
        _addAdmAll: function (self, user, e) {
            if (self.viewOpt.viewSaveButton) {
                self.auths.addAdminData(user);
            }else{
                self.auths.addAdmin(user);
            }
            self.renderContents(false)
        },
        delAdmAll: function (e) {
            if (this.checkedCnt < 1) {
                return;
            }
            var self = this;

            if ( this.viewOpt.viewSaveButton){
                self.auths.clearData();
                self.renderContents(false)
            }else{
                $.goConfirm(AdminLang['메뉴운영관리자일괄삭제'], AdminLang['메뉴운영관리자일괄삭제설명'], $.proxy(deleteAll, this) , CommonLang['삭제']);

                function deleteAll(){
                    self.auths.removeSelectedUser();
                    $('#search_txt').val('');
                    self.changedSearchCondition(e);
                    self.render();
                    jQuery.goMessage(AdminLang['삭제 되었습니다']);
                }
            }

        },
        changeOffset: function (self, offset) {
            self.auths.updatePage( {page:0, offset:offset}) ;
            self.render();
        },
        changePage: function (self, page) {
            self.auths.updatePage( {page:page}) ;
            self.render();
        },
        sort:function(e){
            var target = $(e.currentTarget);
            var className = target.attr('class');
            var currentDirection = className.indexOf('sorting_asc') >=0 ? 'asc'
                : className.indexOf('sorting_desc') >=0 ? 'desc' :'none';
            var nextDirection = currentDirection ==='asc' ? 'desc':'asc';

            $('.sorting_asc').addClass('sorting').removeClass('sorting_asc');
            $('.sorting_desc').addClass('sorting').removeClass('sorting_desc');

            target.removeClass('sorting sorting_asc sorting_desc');
            target.addClass('sorting_' + nextDirection);
            var property = target.attr('value');

            this.auths.updatePage({property:property, direction:nextDirection});
            this.renderContents(true);

        },
        updatedSelectedItems: function () {

            var self = this;
            var selectedKeys = '';

            _.forEach($('.sel_auth_item'), function (t) {
                if (!!$(t).attr('checked')) {
                    selectedKeys += $(t).attr('value') + ', ';
                }
            });

            this.checkedCnt = this.auths.updatedChecked(selectedKeys);

            _.forEach(this.$el.find('.btn_only_checked'), function (t) {
                $(t).removeClass('disable');
                if (self.checkedCnt < 1) {
                    $(t).addClass('disable');
                }
            });
        },
        backToList: function (e) {
            var link = '/auth/app';
            App.router.navigate(link, {trigger: true, pushState: true});
        },
        saveAll: function (e) {

            var self = this;
            $.goConfirm(AdminLang['결재양식운영자변경'], AdminLang['결재양식운영자변경설명'], function() {
                self.auths.saveUpdatedItems();
                self.render();

                jQuery.goMessage(AdminLang['저장 되었습니다']);

            }, function(){}, CommonLang['변경']);
        },
        contentTitle:function(){
            var appTitle = AdminLang['앱이름'];
            switch(this.viewOpt.appAuthType){
                case 'ApprFormOperator' :
                    appTitle = AdminLang['결재양식 명'];
                    break;
                case 'CompanyCalendarManager':
                    appTitle = AdminLang['전사 캘린더 명'];
                    break;
                case 'CompanyAssetManager':
                    appTitle = AdminLang['자산 명'];
                    break;
                case 'CommunityMaster':
                    appTitle = AdminLang['커뮤니티 명'];
                    break;
                case 'WorksAppOperator':
                    appTitle = AdminLang['works 앱명'];
                    break;
                case 'CompanyContactGroupOperator':
                    appTitle = AdminLang['공용 주소록 명'];
                    break;
                case 'CompanyBoardManager':
                    appTitle = AdminLang['전사 게시판 명'];
                    break;
                case 'CompanyDocsOperator':
                    appTitle = AdminLang['문서함 명'];
                    break;
            }
            return appTitle;
        }


    });

});
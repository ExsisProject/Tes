define(function(require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var when = require("when");
    var App = require("app");

    var CircleView = require("system/views/simple_circle");
    var SiteGroupModel = require("system/models/sitegroup");
    var UserIntegrationModel = require("system/models/user_integration");
    var CompanyCollection = require("system/collections/companies");
    var SimpleCompanyCollection = require("system/collections/simple_companies");
    var CompanyBoardShareCollection = require("system/collections/company_borad_shares");
    var CompanyAssetShareCollection = require("system/collections/company_asset_shares");
    var CompanyGroupShareView = require("system/views/company_group_share");

    var SiteGroupDetailTmpl = require("hgn!system/templates/sitegroup_detail");
    var UserIntegrationLayerTmpl = require("hgn!system/templates/user_integration_layer");
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");

    require("jquery.go-grid");
    require("jquery.go-sdk");
    require("jquery.go-orgtab");
    require("jquery.go-orgslide");
    require("GO.util");
    require("jquery.go-validation");

    var lang = {
        '사이트 그룹 기본 정보' : adminLang['사이트 그룹 기본 정보'],
        '사이트 그룹명' : adminLang['사이트 그룹명'],
        '사이트 매칭' : adminLang['사이트 매칭'],
        '사이트 목록' : adminLang['사이트 목록'],
        '선택한 사이트' : adminLang['선택한 사이트'],
        '맨 위로' : adminLang['맨 위로'],
        '위로' : adminLang['위로'],
        '아래로' : adminLang['아래로'],
        '맨 아래로' : adminLang['맨 아래로'],
        '삭제' : adminLang['삭제'],
        '그룹간 조직도 공유' : adminLang['그룹간 조직도 공유'],
        '조직도 공유자' : adminLang['조직도 공유자'],
        '지정 사용자' : adminLang['지정 사용자'],
        '모든 사용자' : adminLang['모든 사용자'],
        '공유 범위' : adminLang['공유 범위'],
        '추가할 사이트가 없습니다' : adminLang['추가할 사이트가 없습니다.'],
        '조직도와 검색을 제공합니다' : adminLang['조직도와 검색을 제공합니다.'],
        '검색만 제공합니다' : adminLang['검색만 제공합니다.'],
        '선택된 사이트가 없습니다' : adminLang['선택된 사이트가 없습니다.'],
        '추가' : commonLang['추가'],
        '삭제' : commonLang['삭제'],
        '저장' : commonLang['저장'],
        '취소' : commonLang['취소'],
        '목록으로 돌아가기' : adminLang['목록으로 돌아가기'],
        '저장되었습니다' : commonLang['저장되었습니다.'],
        '500 오류페이지 내용' : commonLang['500 오류페이지 내용'],
        '사이트 그룹명을 입력하세요': adminLang['사이트 그룹명을 입력하세요.'],
        '2개 이상의 사이트가 매칭되어야 합니다' : adminLang['2개 이상의 사이트가 매칭되어야 합니다.'],
        '겸직자가 존재하지 않습니다' : adminLang['겸직자가 존재하지 않습니다.'],
        '추가' : commonLang['추가'],
        '삭제' : commonLang['삭제'],
        '이름' : commonLang['이름'],
        '사이트명' : adminLang['사이트명'],
        '이메일' : commonLang['이메일'],
        '겸직자 설정' : adminLang['겸직자 설정'],
        '선택한 사용자' : adminLang['선택한 사용자'],
        '겸직자 설정 레이어 설명' : adminLang['겸직자 설정 레이어 설명'],
        '선택된 사용자가 없습니다' : adminLang['선택된 사용자가 없습니다'],
        '서로 다른 회사의 사용자를 둘 이상 추가해주세요' : adminLang['서로 다른 회사의 사용자를 둘 이상 추가해주세요'],
        '회사가 동일한 사용자를 추가할 수 없습니다' : adminLang['회사가 동일한 사용자를 추가할 수 없습니다'],
        '동일한 사용자를 추가할 수 없습니다' : adminLang['동일한 사용자를 추가할 수 없습니다'],
        '선택 안함' : adminLang['선택 안함'],
        '겸직자 목록' : adminLang['겸직자 목록'],
        '그룹사간 조직도 공유' : adminLang['그룹사간 조직도 공유'],
        '겸직자 목록 도움말' : adminLang['겸직자 목록 도움말'],
        '그룹사간 조직도 공유 도움말' : adminLang['그룹사간 조직도 공유 도움말'],
        '공유 범위 도움말' : adminLang['공유 범위 도움말'],
        '이미 겸직으로 추가된 사용자를 겸직으로 다시 추가할 수 없습니다.' : adminLang['이미 겸직으로 추가된 사용자를 겸직으로 다시 추가할 수 없습니다.'],
        '삭제된 사용자를 겸직으로 추가할 수 없습니다.' : adminLang['삭제된 사용자를 겸직으로 추가할 수 없습니다.'],
        '사이트 그룹이 다르거나 그룹에 소속되지 않은 사용자를 겸직으로 추가할 수 없습니다.' : adminLang['사이트 그룹이 다르거나 그룹에 소속되지 않은 사용자를 겸직으로 추가할 수 없습니다.'],
        '사이트 그룹명을 1자 이상 64자 미만으로 입력하세요.' : adminLang['사이트 그룹명을 1자 이상 64자 미만으로 입력하세요.'],
        '이미 다른 그룹에 속한 사이트를 추가할 수 없습니다.' : adminLang['이미 다른 그룹에 속한 사이트를 추가할 수 없습니다.'],
        '이미 사용중인 사이트명입니다.' : adminLang['이미 사용중인 사이트명입니다.'],
        '들여쓰기' : adminLang['들여쓰기'],
        '들여쓰기 취소' : adminLang['들여쓰기'] + ' ' + commonLang['취소'],
        '사이트 그룹 컨텐츠 공유방법 설명1' : adminLang['사이트 그룹 컨텐츠 공유방법 설명1'],
        '사이트 그룹 맵핑 컴퍼니 삭제 경고' : adminLang['사이트 그룹 맵핑 컴퍼니 삭제 경고']
    };

    var UserIntegrationView = Backbone.View.extend({

        initialize: function(options) {
            var data = _.extend({}, options.data);
            this.model = new UserIntegrationModel(data);
            this.availableCompanyIds = options.availableCompanyIds;
        },

        render: function() {
            this.$el.html(UserIntegrationLayerTmpl({ lang: lang }));
            this._renderOrgTree();
            this._renderUserList();
            this.$el.off();
            this._bindEvents();
        },

        _renderOrgTree: function() {
            this.orgTab = $.goOrgTab({
                elId: 'user_integration_layer_org_tree',
                companyIds: this.availableCompanyIds,
                isAdmin: true,
                css : {
                    'minHeight' : '185px',
                    'maxHeight' : '185px',
                    'overflow-y' : 'auto'
                }
            });
        },

        _renderUserList: function(selectedId) {
            var htmls = '{{#users}}<li data-id={{id}}>{{companyName}} - {{name}}({{email}})</li>{{/users}}';
            this.$('#integration_users').html(Hogan.compile(htmls).render({
                'users' : this.model.get('users')
            }));

            if (selectedId) {
                $('#integration_users > li[data-id="' + selectedId + '"]').addClass('on');
            }
        },

        _bindEvents: function() {
            this.$el.on('click', '#integration_users > li', $.proxy(this._onUserClicked, this));
            this.$el.on('click', '#add_user', $.proxy(this._onAddUserClicked, this));
            this.$el.on('click', 'div.tool_bar > span', $.proxy(this._onToolbarClicked, this));
        },

        _onUserClicked: function(e) {
            var $target = $(e.currentTarget),
                $siblings = $('#integration_users > li');

            $siblings.removeClass('on');
            $target.addClass('on');
        },

        _onAddUserClicked: function(e) {
            var users = this.model.get('users'),
                selected = this.orgTab.getSelectedData(),
                companyDuplicated = false,
                userDuplicated = false;

            if (!_.contains(["MASTER", "MODERATOR", "MEMBER"], selected.type)) {
                return false;
            }

            $.ajax({
                type: 'GET',
                async: false,
                dataType: 'json',
                url: GO.contextRoot + "ad/api/system/user/profile/" + selected.id,
                success: function(resp) {
                    var profile = resp.data;
                    selected.companyId = profile.companyId;
                    selected.companyName = profile.companyName;
                }
            });

            _.each(users, function(user) {
                if (selected['companyId'] == user['companyId']) {
                    companyDuplicated = true;
                }

                if (selected['id'] == user['id']) {
                    userDuplicated = true;
                }
            });

            if (companyDuplicated) {
                $.goMessage(lang['회사가 동일한 사용자를 추가할 수 없습니다']);
                return false;
            }

            if (userDuplicated) {
                $.goMessage(lang['동일한 사용자를 추가할 수 없습니다']);
                return false;
            }

            users.push({
                'id' : selected['id'],
                'name' : selected['name'],
                'email' : selected['email'],
                'companyId' : selected['companyId'],
                'companyName' : selected['companyName']
            });

            this.model.set('users', users);
            this._renderUserList(selected['id']);
        },

        _onToolbarClicked: function(e) {
            var $selected = $('#integration_users > li.on'),
                targetId = $selected.attr('data-id');

            if ($selected.length < 1) {
                $.goMessage(lang['선택된 사용자가 없습니다']);
            }

            switch ($(e.currentTarget).attr('id')) {
                case 'move_user_top':this.model.moveUserTop(targetId); break;
                case 'move_user_up': this.model.moveUserUp(targetId); break;
                case 'move_user_down': this.model.moveUserDown(targetId); break;
                case 'move_user_bottom': this.model.moveUserBottom(targetId); break;
                case 'delete_user': this.model.removeUser(targetId); break;
            }

            this._renderUserList(targetId);
        },

        validate: function() {
            var users = this.model.get('users'),
                duplicatedCompany = false;

            if (users.length < 2) {
                $.goMessage(lang['서로 다른 회사의 사용자를 둘 이상 추가해주세요']);
                return false;
            }

            _.each(users, function(user) {
                var dup = _.filter(users, function(target) {
                    return user['companyId'] == target['companyId'];
                });
                if (dup.length > 1) {
                    duplicatedCompany = true;
                }
            });

            if (duplicatedCompany) {
                $.goMessage(lang['서로 다른 회사의 사용자를 둘 이상 추가해주세요']);
                return false;
            }

            return true;
        },

        getData: function() {
            return this.model.toJSON();
        }
    });

    var SiteGroupDetailView = Backbone.View.extend({

        el : '#layoutContent',

        initialize : function(options) {
            this.unbindEvent();
            this.bindEvent();

            this.companies = new SimpleCompanyCollection();
            this.siteGroup = new SiteGroupModel({
                'id' : options.siteGroupId
            });

        },

        unbindEvent : function() {
            this.$el.off('click', '#add_site_to_group');
            this.$el.off('click', '#selected_companies_tool_bar > span');
            this.$el.off('click', '#companies_candidate > li[data-id]');
            this.$el.off('click', '#companies_selected > li[data-id]');
            this.$el.off('focusout', 'input[name="name"]');
            this.$el.off('change', 'input[name="org_tree_share_scope"]');
            this.$el.off('change', 'input[name="org_tree_share_content"]');
            this.$el.off('click', '#btn_save');
            this.$el.off('click', '#btn_cancel');
            this.$el.off('click', '#btn_return_list');
            this.$el.off('click', 'input[name="userIntegration"]');
            this.$el.off('click', '#deleteUserIntegrations');
            this.$el.off('click', 'td.showUserIntegration');
            this.$el.off('click', '#addUserIntegration');
        },

        bindEvent : function() {
            this.$el.on('click', '#add_site_to_group', $.proxy(this._onSiteAddClicked, this));
            this.$el.on('click', '#selected_companies_tool_bar > span', $.proxy(this._onSiteToolbarClicked, this));
            this.$el.on('click', '#companies_candidate > li[data-id]', $.proxy(this._onCompanyCandidateSelected, this));
            this.$el.on('click', '#companies_selected > li[data-id]', $.proxy(this._onCompanySelectedSelected, this));
            this.$el.on('focusout', 'input[name="name"]', $.proxy(this._onNameFocusOut, this));
            this.$el.on('change', 'input[name="org_tree_share_scope"]', $.proxy(this._onOrgShareScopeClicked, this));
            this.$el.on('change', 'input[name="org_tree_share_content"]', $.proxy(this._onOrgShareContentClicked, this));
            this.$el.on('click', '#btn_save', $.proxy(this._onSaveButtonClicked, this));
            this.$el.on('click', '#btn_cancel', $.proxy(this._onCancelButtonClicked, this));
            this.$el.on('click', '#btn_return_list', $.proxy(this._onListButtonClicked, this));
            this.$el.on('click', 'input[name="userIntegration"]', $.proxy(this._onUserIntegrationChecked, this));
            this.$el.on('click', '#deleteUserIntegrations', $.proxy(this._onUserIntegrationDeleteClicked, this));
            this.$el.on('click', 'td.showUserIntegration', $.proxy(this._onUserIntegrationShowClicked, this));
            this.$el.on('click', '#addUserIntegration', $.proxy(this._onUserIntegrationAddClicked, this));
        },

        render : function(keyword) {
            var ctx = this;
            this.companies.fetch({
                success: function() {
                    if (ctx.siteGroup.isNew()) {
                    	$('.breadcrumb .path').html(adminLang["사이트 관리 > 사이트 그룹 추가"]);
                        ctx._renderTemplate();
                    }
                    else {
                        ctx.siteGroup.fetch({
                            success: function(model) {
                            	$('.breadcrumb .path').html(adminLang["사이트 관리 > 사이트 그룹 수정"]);
                                ctx._renderTemplate(undefined, ctx.siteGroupId);
                            }
                        })
                    }
                }
            });
        },

        _renderTemplate: function(selectedCompanyId, companyGroupId) {
            this.$el.empty().html(SiteGroupDetailTmpl({
                data: this._makeTemplateData(),
                lang: lang
            }));

            if (!_.isUndefined(selectedCompanyId)) {
                $('#companies_selected > li[data-id="' + selectedCompanyId + '"]').addClass('on');
            }

            var availableCompanyIds = _.map(this.siteGroup.get('companies'), function(company) {
                return company['id'];
            });

            var circleChangeCallback = function(data) {
                this.siteGroup.set('orgTreeShareUser', data);
            };

            this.orgTreeShareUserView = new CircleView({
                'selector': '#org_tree_share_user',
                'isAdmin': true,
                'withCompanies': true,
                'companyIds' : availableCompanyIds,
                'circleJSON': this.siteGroup.get('orgTreeShareUser'),
                'nodeTypes': ['user', 'department', 'position', 'grade', 'duty', 'usergroup'],
                'addCallback' : $.proxy(circleChangeCallback, this),
                'removeCallback' : $.proxy(circleChangeCallback, this),
                'companies' : this.companies
            });

            this.orgTreeShareUserView.render();
            if (this.siteGroup.isOrgShareToSelectedUser()) {
                this.orgTreeShareUserView.show();
            }

            this._handleOrgShareContentVisible();

            if (!_.isUndefined(companyGroupId)) {
            	$('#companySharePageNoti').hide();
            	this._renderBoardCompany();
	        } else {
	        	$('#companySharePageNoti').show();
	        }
        },

        _renderBoardCompany : function(){
        	var availableCompanies = this.siteGroup.get('companies');
        	CompanyGroupShareView.render({type : 'BOARD', companyGroupId: this.siteGroupId, companies : new CompanyCollection(availableCompanies)});
        },

        _makeTemplateData: function() {
            var data = {
                'isNew': this.siteGroup.isNew(),
                'name': this.siteGroup.get('name'),
                'orgShareByTree': this.siteGroup.isOrgShareByTree(),
                'orgShareToNoUser': this.siteGroup.isOrgShareToNoUser(),
                'orgShareToAllUser': this.siteGroup.isOrgShareToAllUser(),
                'orgShareToSelectedUser': this.siteGroup.isOrgShareToSelectedUser(),
                'companiesSelected': this.siteGroup.get('companies'),
                'companies': this.companies.toJSON(),
                'companiesCandidate': [],
                'userIntegrations': []
            };

            this.companies.each(function(company) {
                if (_.isEmpty(company.get('companyGroup'))) {
                    data.companiesCandidate.push(company.toJSON());
                }
            });

            _.each(this.siteGroup.get('userIntegrations'), function(integration) {
                var userIds = [],
                    userNames = [],
                    userEmails = [],
                    siteNames = [];

                _.each(integration['users'], function(user) {
                    userIds.push(user['id']);
                    userNames.push(user['name']);
                    userEmails.push(user['email']);
                    siteNames.push(user['companyName']);
                });

                data.userIntegrations.push({
                    'id': integration['id'],
                    'userNames': userNames,
                    'userEmails': userEmails,
                    'userListKey': SiteGroupModel.generateUserListKey(userIds),
                    'siteNames': siteNames
                });
            });

            return data;
        },

        _onSiteAddClicked: function() {
            var $selected = $('#companies_candidate > li.on'),
                targetId = $selected.attr('data-id');

            if ($selected.length < 1) {
                $.goMessage(lang['선택된 사이트가 없습니다']);
            }

            this.companies.each(function(company) {
                if (targetId == company.get('id')) {
                    company.set('companyGroup', this.siteGroup);
                    this.siteGroup.addCompany(company);
                }
            }, this);

            this._renderTemplate(targetId, this.siteGroupId);
        },

        _onSiteToolbarClicked: function(e) {
            var self = this,
            	$selected = $('#companies_selected > li.on'),
                targetId = $selected.attr('data-id');

            if ($selected.length < 1) {
                $.goMessage(lang['선택된 사이트가 없습니다']);
            }

            switch ($(e.currentTarget).attr('id')) {
                case 'move_site_top':this.siteGroup.moveCompanyTop(targetId); break;
                case 'move_site_up': this.siteGroup.moveCompanyUp(targetId); break;
                case 'move_site_down': this.siteGroup.moveCompanyDown(targetId); break;
                case 'move_site_bottom': this.siteGroup.moveCompanyBottom(targetId); break;
                case 'move_site_right':
                	this.moveCompanyRight($selected);
                	break;
                case 'move_site_left':
                	this.moveCompanyLeft($selected);
                	break;
                case 'remove_site_from_group':
                    this.siteGroup.removeCompany(targetId);
                    var target = this.companies.get(targetId);
                    target.set('companyGroup', null);

                    // 매칭된 사이트 정보 삭제할 경우 이벤트
                    this._removeUserIntegrationOfCompany(targetId);
                    this._removeOrgShareUserOfCompany(targetId);

                    break;
            }

            this._renderTemplate(targetId, this.siteGroupId);
        },

        moveCompanyRight: function(target) {
        	var oldDepth = parseInt(target.attr('data-depth'));
        	if (oldDepth == 4) {
        		return;
        	}
        	var newDepth = oldDepth + 1;
        	_.each(this.siteGroup.get('companies'), function(company) {
            	if(target.attr('data-id') == company['id']) {
                	company['groupDepth'] = newDepth;
            	}
            });
        },

        moveCompanyLeft: function(target) {
        	var oldDepth = parseInt($(target).attr('data-depth'));
        	if (oldDepth == 0) {
        		return;
        	}
        	var newDepth = oldDepth - 1;
        	_.each(this.siteGroup.get('companies'), function(company) {
            	if(target.attr('data-id') == company['id']) {
                	company['groupDepth'] = newDepth;
            	}
            });
        },

        _removeUserIntegrationOfCompany: function(companyId) {
            this.siteGroup.removeUserIntegrationOfCompany(companyId);
        },

        _removeOrgShareUserOfCompany: function(companyId) {
            this.orgTreeShareUserView.deleteDataOfCompany(companyId);
            this.siteGroup.set('orgTreeShareUser', this.orgTreeShareUserView.getData());
        },

        _onCompanyCandidateSelected: function(e) {
            $('#companies_candidate > li').removeClass('on');
            $(e.currentTarget).addClass('on');
        },

        _onCompanySelectedSelected: function(e) {
            $('#companies_selected > li').removeClass('on');
            $(e.currentTarget).addClass('on');
        },

        _onNameFocusOut: function(e) {
            this.siteGroup.set('name', $('input[name="name"]').val());
        },

        _onOrgShareScopeClicked: function(e) {
            this.siteGroup.set('orgTreeShareScope', $(e.currentTarget).val());
            if (this.siteGroup.isOrgShareToSelectedUser()) {
                this.orgTreeShareUserView.show();
            } else {
                this.orgTreeShareUserView.hide();
            }

            this._handleOrgShareContentVisible();
        },

        _handleOrgShareContentVisible: function(visible) {
            var $orgShareContent = $('#sitegroup_detail_org_share_content');
            if (this.siteGroup.isOrgShareToNoUser()) {
                $orgShareContent.hide();
            } else {
                $orgShareContent.show();
            }
        },

        _onOrgShareContentClicked: function(e) {
            this.siteGroup.set('orgTreeShareContent', $(e.currentTarget).val());
        },

        _onSaveButtonClicked: function() {
            if (_.isEmpty(this.siteGroup.get('name'))) {
                $.goMessage(lang['사이트 그룹명을 입력하세요']);
                $('input[name="name"]').focus();
                return false;
            }

            if (this.siteGroup.get('companies').length < 2) {
                $.goMessage(lang['2개 이상의 사이트가 매칭되어야 합니다']);
                return false;
            }

            _.each(this.siteGroup.get('companies'), function(company) {
                // 순환참조로 인해 toJSON 불가하므로 company에서 companyGroup 참조를 제거한다.
                company['companyGroup'] = null;
                $("#companies_selected").find('li').each(function(i, m) {
                	if($(m).attr('data-id') == company['id']) {
                    	company['groupDepth'] = $(m).attr('data-depth');
                	}
                });
            });
            this.siteGroup.set('orgTreeShareUser',this.orgTreeShareUserView.getData());

            var ctx = this;
            this.siteGroup.save({}, {
                success: function(model) {
                    $.goMessage(lang['저장되었습니다']);
                    ctx._goToShow(model.get('id'));
                },
                error: function(model, response, options) {
                    if (response.responseJSON.code == 400) {
                        switch (response.responseJSON.message) {
                        case 'already integrated with others.':
                            $.goMessage(lang['이미 겸직으로 추가된 사용자를 겸직으로 다시 추가할 수 없습니다.']);
                            break;
                        case 'same company.':
                        case 'invalid integration size':
                            $.goMessage(lang['서로 다른 회사의 사용자를 둘 이상 추가해주세요']);
                            break;
                        case 'deleted user.':
                            $.goMessage(lang['삭제된 사용자를 겸직으로 추가할 수 없습니다.']);
                            break;
                        case 'not in same company group or empty.':
                            $.goMessage(lang['사이트 그룹이 다르거나 그룹에 소속되지 않은 사용자를 겸직으로 추가할 수 없습니다.']);
                            break;
                        case 'empty or more than 64 length.':
                            $.goMessage(lang['사이트 그룹명을 1자 이상 64자 미만으로 입력하세요.']);
                            break;
                        case 'already belonged to other group.':
                            $.goMessage(lang['이미 다른 그룹에 속한 사이트를 추가할 수 없습니다.']);
                            break;
                        case 'duplicated company group name.':
                            $.goMessage(lang['이미 사용중인 사이트명입니다.']);
                            break;
                        default:
                            $.goMessage(lang['500 오류페이지 내용']);
                            break;
                        }
                    } else {
                        $.goMessage(lang['500 오류페이지 내용']);
                    }
                }
            })
        },

        _onCancelButtonClicked: function() {
            this._reload();
        },

        _onListButtonClicked: function() {
            this._goToList();
        },

        _onUserIntegrationChecked: function(e) {
            var $target = $(e.currentTarget);
            if ($target.attr('id') == 'checkAllUserIntegration') {
                $('input[name="userIntegration"]').prop('checked', $target.is(':checked'));
            }
            else {
                if (!$target.is(':checked')) {
                    $('#checkAllUserIntegration').prop('checked', false);
                }
            }
        },

        _onUserIntegrationDeleteClicked: function() {
            var $targets = $('input[name="userIntegration"]:checked'),
                targetUserListKeys = [];

            $targets.each(function(index) {
                targetUserListKeys.push($(this).data('userlistkey'));
            });

            _.each(targetUserListKeys, function(key) {
                this.siteGroup.removeUserIntegrationByUserListKey(key);
            }, this);

            this._renderTemplate(undefined, this.siteGroupId);
        },

        _onUserIntegrationShowClicked: function(e) {
            e.preventDefault();

            var $record = $(e.currentTarget).parents('tr'),
                userListKey = $record.find('input[name="userIntegration"]').data('userlistkey'),
                userIntegration = this.siteGroup.getUserIntegrationByUserListKey(userListKey);

            var ctx = this;
            this._loadUserIntegrationLayer(userIntegration, function(data) {
                ctx.siteGroup.updateUserIntegration(userIntegration, data);
                ctx._renderTemplate(undefined, this.siteGroupId);
            });
        },

        _onUserIntegrationAddClicked: function(e) {
            e.preventDefault();

            if (_.isEmpty(this.siteGroup.get('companies'))) {
                $.goMessage(lang['2개 이상의 사이트가 매칭되어야 합니다']);
                return false;
            }

            var ctx = this;
            this._loadUserIntegrationLayer({}, function(data) {
                ctx.siteGroup.addUserIntegration(data);
                ctx._renderTemplate(undefined, this.siteGroupId);
            });
        },

        _loadUserIntegrationLayer: function(currentData, closeCallback) {
            var ctx = this;
            $.goPopup({
                "pclass" : "layer_normal layer_admin_sideJob layer_user_integration",
                "header" : lang['겸직자 설정'],
                "modal" : true,
                "width" : 600,
                "contents" :  "",
                "buttons" : [
                    {
                        'btext' : commonLang['확인'],
                        'autoclose' : false,
                        'btype' : 'confirm',
                        'callback' : function(rs){
                            if (userIntegrationView.validate()) {
                                closeCallback(userIntegrationView.getData());
                                rs.close();
                            } else {
                                return false;
                            }
                        }
                    },
                    {
                        'btext' : commonLang["취소"],
                        'btype' : 'cancel'
                    }
                ]
            });

            var userIntegrationView = new UserIntegrationView({
                el: '.layer_user_integration .content',
                availableCompanyIds: _.map(this.siteGroup.get('companies'), function(company) {
                    return company['id'];
                }),
                data: currentData
            });

            userIntegrationView.render();
        },

        _reload: function() {
            if (this.siteGroup.isNew()) {
                this._goToCreate();
            } else {
                this._goToShow(this.siteGroup.get('id'));
            }
        },

        _goToCreate: function() {
            GO.router.navigate('system/sitegroup/create', {trigger: true});
        },

        _goToShow: function(id) {
            GO.router.navigate('system/sitegroup/' + id + '/modify', {trigger: true});
        },

        _goToList: function() {
            GO.router.navigate('system/sitegroup', {trigger: true});
        }
    },
    {
        create: function(opt) {
            instance = new SiteGroupDetailView({
                el : (opt.el ? opt.el : '#layoutContent'),
                siteGroupId : (opt ? opt.siteGroupId : '')
            });

            instance.siteGroupId = opt ? opt.siteGroupId : '';
            return instance.render();
        }
    });

    return {
        render: function(opt) {
            var layout = SiteGroupDetailView.create(opt);
            return layout;
        }
    };
});
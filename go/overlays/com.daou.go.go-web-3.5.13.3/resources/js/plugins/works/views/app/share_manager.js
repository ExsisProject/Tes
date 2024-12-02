/**
 * 공유자설정 메인 뷰
 */

define('works/views/app/share_manager', function(require) {
	// dependency
	var Backbone = require('backbone');
	var when = require('when');
	var AppletBaseConfigModel = require('works/models/applet_baseconfig');
	var ShareModel = require('works/models/applet_share');
	var WorksHomeLayout = require('works/views/app/home/works_home_layout');
	var ShareManagerTpl = require('hgn!works/templates/app/share_manager');
    var CircleView = require("views/circle");
	var WorksUtil = require('works/libs/util');
	var commonLang = require('i18n!nls/commons');
	var worksLang = require("i18n!works/nls/works");
	var ManageContentTopView = require('works/views/app/layout/manage_content_top');
	var Fields = require("works/collections/fields");
	
	var BaseFilterSetting = require('works/models/base_filter_setting');
    var BaseFilterItemView = require('works/views/app/base_filter_item');
    var BaseFilterGroupView = require('works/views/app/base_filter_group_item');

    var ShareConfigSetting = require('works/models/share_config_setting');
	
	require("jquery.go-orgtab");
	require("jquery.go-orgslide");
	
    var lang = {
		desc : worksLang['공유자관리 설명'],
		useClosed : worksLang['비공개 사용'],
		closedDesc : worksLang['비공개 설명'],
		closedSelected : worksLang['비공개 사용자선택'],
		closed : worksLang['비공개만'],
		open : worksLang['공개만'],
		title : worksLang['공유 설정'],
		regist : commonLang['저장'],
		cancel : commonLang['취소'],
		pub : worksLang['전사 설정'],
		custom : worksLang['사용자 설정'],
		goback : worksLang['돌아가기'],
		add : commonLang['추가'],
		gosettinghome : worksLang['관리 홈으로 이동'],
		goapphome : worksLang['해당 앱으로 이동'],
		"공유자 설정" : worksLang['공유자 설정'],
		"titleDesc" : worksLang['공유관리 안내문구'],
		infoDesc : worksLang['접근제어 설명'],
		'데이터 등록 권한': worksLang['데이터 등록 권한'],
		'데이터 수정 권한': worksLang['데이터 수정 권한'],
		'데이터 삭제 권한': worksLang['데이터 삭제 권한'],
		'수정 알림 대상': worksLang['수정 알림 대상'],
		'공유자 전체': worksLang['공유자 전체'],
		'등록자': worksLang['등록자'],
		'운영자': worksLang['운영자'],
        'filter.name.length': GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {'arg1': 2, 'arg2': 50}),
        'filter.name.blank': commonLang['공백문자는 입력할 수 없습니다.'],
        'filter.name.unused.char': commonLang['사용할 수 없는 문자입니다.'],
        'filter.name.invalid': GO.i18n(worksLang['{{arg0}}만 입력할 수 있습니다.'], {arg0: worksLang['한글, 영문, 숫자']}),
        'filter.description.length': GO.i18n(commonLang['최대 {{arg1}}자 까지 입력할 수 있습니다.'], {'arg1': 200}),
        'rule.rule.null': worksLang['필터규칙을 입력해 주세요.'],
        'rule.name.length': GO.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {'arg1': 2, 'arg2': 50}),
        'rule.description.length': GO.i18n(commonLang['최대 {{arg1}}자 까지 입력할 수 있습니다.'], {'arg1': 200}),
        'rule.filterRule.invalid': worksLang['유효하지 않는 필터규칙입니다.'],
        '추가': commonLang['추가'],
        '필터명': worksLang['필터명'],
        '설명': worksLang['설명'],
        '필터 조건': worksLang['필터 조건'],
        '삭제': commonLang['삭제'],
        '목록이 없습니다': worksLang['목록이 없습니다.'],
        '필터 조건 대상 설정': worksLang['필터 조건 대상 설정'],
        '필터규칙': worksLang['필터규칙'],
        '데이터 목록 조회 권한 설정': worksLang['데이터 목록 조회 권한 설정'],
        '데이터 목록 조회 권한 설정 설명': worksLang['데이터 목록 조회 권한 설정 설명'],
        '데이터 상세 권한 설정': worksLang['데이터 상세 권한 설정'],
        '데이터 상세 권한 설정 설명': worksLang['데이터 상세 권한 설정 설명'],
        '대상': commonLang['대상'],
        '공개문서만 등록 설정 시 문구' : worksLang['공개문서만 등록 설정 시 문구'],
        '수정 알림 대상 설명' : "※ " + worksLang['수정 알림 대상 설명']
    };
	
	return Backbone.View.extend({
		className : 'go_content go_renew go_works_home app_temp',

		events : {
			"change input[name=shareType]" : "toggleCircle",
            "change input[name=closedOption]" : "toggleClosedOption",
			"click #btn-confirm" : "onSave",
			"click #btn-cancel" : "onCancel",
			"click #btn-gosettinghome" : "gosettinghome",
			"click #btn-goapphome" : "goapphome",
			'click #goAppHomeNav' : "goapphome",
			'click #goSettingHomeNav' : "gosettinghome",
			'click [el-add-filter]': '_onClickAddFilter',
            'click [el-add-role]': '_onClickAddGroup'
		},

		initialize: function(options) {
			options = options || {};
			this.layoutView = WorksHomeLayout.create();
			if(options.hasOwnProperty('appletId')) {
				this.model = new ShareModel({"id": options.appletId});
				this.config = new AppletBaseConfigModel(options.hasOwnProperty('appletId') ? {"id": options.appletId} : null);
				this.fields = new Fields([], {
					appletId: options.appletId,
                    includeProperty: true
				});
				
				this.baseFilterSetting = new BaseFilterSetting({appletId: options.appletId});
	            this.baseFilterSetting.on('sync', this._renderFilterViewContent, this);
	            this.$el.on('removeFilterItem', _.bind(this._onRemoveFilter, this));
			}
		}, 

		render: function() {
			return when.all([renderLayout.call(this), this.fields.fetch()])
				.then(this.baseFilterSetting.fetch())	// fields.fetch() 후 수행
				.then(_.bind(fetchConfigModel, this))			
				.then(_.bind(fetchModel, this))
				.then(_.bind(renderMain, this))
				.otherwise(function printError(err) {
	                console.log(err.stack);
	            });
		},
		
		_renderFilterViewContent: function() {
            this._renderFilters();
            this._renderRules();
        },
        
		_renderFilters: function() {
			this.$('#filters').empty();
            this.baseFilterSetting.baseFilters.each(function(filter) {
                this._appendFilterItem(filter);
            }, this);
        },

        _renderRules: function() {
        	this.$('#groups').empty();
            this.baseFilterSetting.baseFilterGroups.each(function(group) {
            	var isDefault = _.isUndefined(group.get('circle'));
            	if(isDefault) {
            		group.set('isDefault', isDefault);
            		if(_.isUndefined(group.get('rule'))) group.set('rule', "");
            	}
                this._appendFilterGroupItem(group);
            }, this);
        },
        
        _onClickAddFilter: function() {
	         this._appendFilterItem();
        },

        _onClickAddGroup: function() {
           this._appendFilterGroupItem();
       	},
       
       	_onRemoveFilter: function() {
           if (this.$('#filters').find('tr:not([el-null])').length === 1) { // beforeAction
               this.$('tr[el-null]').show();
           }
       	},
        
		onSave : function(e){
			e.preventDefault();
			
			var validateResult = this.baseFilterSetting.validate()
			
			if (validateResult) {
                $.goError(lang[validateResult]);
                return false;
            }
			
			this.model.set('addDocRoles', this._getMemberAddDocFromView());
			this.model.set('editDocRoles', this._getEditDocRolesFromView());
			this.model.set('deleteDocRoles', this._getDeleteDocRolesFromView());
			this.model.set('editDocPushes', this._getEditDocPushesFromView());
			
			this.model.set('public', this.$('#public').is(':checked'));
			this.model.set('closedOption', this.$("input[name=closedOption]:checked").val());
			if(this.model.get('public')){
				this.model.set('circle', {nodes : []});				
			}else{
				this.model.set('circle', this.circleView.getData());				
			}

			this.shareConfigSetting = new ShareConfigSetting({"appletId": this.model.get('id')});
			this.shareConfigSetting.set('share', this.model);
			this.shareConfigSetting.set('baseFilterConfig', this.baseFilterSetting);
			this.shareConfigSetting.save({}, {
				type: 'PUT',
				success: function() {
					$.goMessage(commonLang['저장되었습니다.']);
				}
			});
            
			return false;
		},
		
		onCancel : function(e){
			var self = this;
			e.preventDefault();
			$.goConfirm(commonLang['취소하시겠습니까?'],
				commonLang['입력하신 정보가 초기화됩니다.'],
				function() {
					when(fetchModel.call(self), self.baseFilterSetting.fetch())
					.then(_.bind(fetchConfigModel, self))
					.then(_.bind(renderMain, self))
					.otherwise(function printError(err) {
						console.log(err.stack);
					});
				}
			);
		},
		
		gosettinghome : function(){
			WorksUtil.goSettingHome(this.model.get('id'));
		},
		
		goapphome : function(){
			WorksUtil.goAppHome(this.model.get('id'));			
		},
		
		toggleCircle : function(e){
			if ($(e.target).val() == "custom") {
				$('#circleArea').show();
			} else {
				$('#circleArea').hide();
			}
		},
		
		toggleClosedOption : function(e) {
			if ($(e.target).val() == "OPEN") {
				$('#closedOption_open_desc').show();
			} else {
				$('#closedOption_open_desc').hide();
			}
		},
		
		_getMemberAddDocFromView: function() {
			return this._getCheckboxValueByParentSelector('tr[el-add-roles]');
		},
		_getEditDocRolesFromView: function() {
			return this._getCheckboxValueByParentSelector('tr[el-edit-roles]');
		},
		_getDeleteDocRolesFromView: function() {
			return this._getCheckboxValueByParentSelector('tr[el-delete-roles]');
		},
		_getEditDocPushesFromView: function() {
			return this._getCheckboxValueByParentSelector('tr[el-edit-pushes]');
		},
		_getCheckboxValueByParentSelector: function(selector) {
			return _.map(this.$(selector).find('input[type="checkbox"]:checked'), function(el) {
				return $(el).val();
			});
		},
		
		_setRolesAndPushes: function() {
			this._setMemberAddDocToView();
			this._setEditDocRolesToView();
			this._setDeleteDocRolesToView();
			this._setEditDocPushesToView();
		},
		_setMemberAddDocToView: function() {
			this._setCheckboxValueByType('addDocRoles');
		},
		_setEditDocRolesToView: function() {
			this._setCheckboxValueByType('editDocRoles');
		},
		_setDeleteDocRolesToView: function() {
			this._setCheckboxValueByType('deleteDocRoles');
		},
		_setEditDocPushesToView: function() {
			this._setCheckboxValueByType('editDocPushes');
		},
		_setCheckboxValueByType: function(type) {
			_.each(this.model.get(type), function(role) {
				this.$('#' + type + role).prop('checked', true);
			}, this);
		},
		
        _appendFilterItem: function(model) {
            if (!model) model = new Backbone.Model();
            this.baseFilterSetting.addBaseFilterItem(model);
            var view = new BaseFilterItemView({
                model: model,
                fields: this.fields,
                appletId: this.appletId,
                filters: this.filters
            });
            this.$('[el-null]').hide();
            this.$('#filters').append(view.render().el);
        },

        _appendFilterGroupItem: function(model) {
            if (!model) model = BaseFilterSetting.getGroupModelInstance();
            this.baseFilterSetting.addBaseFilterGroupItem(model);
            var view = new BaseFilterGroupView({model: model});
            this.$('#groups').append(view.render().el);
        }
	});
	
    function renderMain(){
		console.log("renderMain");
    	var self = this;
		WorksUtil.checkAppManager(this.config.get('admins'));
		var userFields = this.fields.getUserFieldsExceptMappingFields();
		this.$el.html(ShareManagerTpl({
			lang : lang,
			config : this.config.toJSON(),
			userTypes: userFields.toJSON(),
			hasUserTypes : userFields.length > 0
		}));
		
	    var contentTopView = new ManageContentTopView({
            baseConfigModel: self.config, 
            pageName: worksLang['접근 제어 관리'], 
            useActionButton: true,
            infoDesc: lang.infoDesc
        });
	    contentTopView.setElement(this.$('#worksContentTop'));
	    contentTopView.render();
	    
		
		this.circleView = new CircleView({
            selector: '#accessUser',
            isAdmin: false,
            isWriter: true,
            circleJSON: self.model.get('circle'),
            nodeTypes: ['user', 'department', 'position', 'grade', 'duty', 'usergroup']
        });
		this.circleView.render();
        
		if(this.model.get('public')){
        	this.$('#public').prop('checked', true).trigger('change');
        }else{
        	this.$('#custom').prop('checked', true).trigger('change');
        }
		
		// GO-22593 OPEN 으로 되어있는 경우 이 설정을 노출하지 않도록 처리
		var closedOption = this.model.get('closedOption');
		if(closedOption == 'SELECTED') {
			this.$("input[id=closedOption_selected]").attr('checked', true);
		}else if(closedOption == 'OPEN'){
			this.$("input[id=closedOption_open]").attr('checked', true);
			this.$('tr[el-use-closed]').hide();
		}else if(closedOption == 'CLOSED') {
			this.$("input[id=closedOption_closed]").attr('checked', true);
		}
		
		this._setRolesAndPushes();
		this._renderFilterViewContent();
		
        return this;
    }
    
	function renderLayout(){
		return when(this.layoutView.render())
		.then(this.layoutView.setContent(this));
	}
	
	function fetchConfigModel(){
		var defer = when.defer();
		this.config.fetch({
			success : defer.resolve,
			error : defer.reject
		});
		return defer.promise;
	}
    
	function fetchModel(){
		var defer = when.defer();
		this.model.fetch({
			success : defer.resolve,
			error : defer.reject
		});
		return defer.promise;
	}
});
define('works/models/applet_baseconfig', function(require) {
	
	var GO = require('app');

	var BaseModel = require('models/base_model');
	
	var PRIVATE_OPT_OPEN = 'OPEN';
	var PRIVATE_OPT_CLOSED = 'CLOSED';
	var PRIVATE_OPT_SELECTED = 'SELECTED';
	
	/**
	 * 애플릿 기본 설정 모델(AppletBaseConfigModel)
	 * 참고: http://wiki.daou.co.kr/display/go/AppletBaseConfigModel 
	 */
	return BaseModel.extend({

		initialize: function(options) {
			BaseModel.prototype.initialize.apply(this, arguments);
			options = options || {};
			this.access = options.access; // 애플릿 접근 이력 갱신 여부
			this.refType = options.refType || "applets";	// 앱생성 시 "templates" or "applets" 
			this.asDefault = options.asDefault || false;	// template이 기본템플릿인지 유무
		},

		url: function() {
			if(!this.get('id')) {
				return new Error('애플릿의 ID가 필요합니다.');
			}
			var param = this.access ? '?access=true' : '';
			if(this.refType == "templates") {
				param += (param.length > 0 ? "&" : "?" ) + ('asDefault=' + this.asDefault);
			}
			return GO.config('contextRoot') + 'api/works/' + this.refType + '/' + this.get('id') + '/base' + param;
		},
		
		setUrl : function(url){
			this.url = url;
		}, 
		
		getAdmin: function(userId) {
		    return _.findWhere(this.get('admins'), {"id": userId});
		},
		
		isAdmin: function(userId) {
		    return !!this.getAdmin(userId);
		}, 
		
		getPrivateOption: function() {
		    return this.get('privateOption') || PRIVATE_OPT_OPEN;
		},
		
		canUsePrivateOption: function() {
		    var opt = this.getPrivateOption();
		    return this.isPrivateOptionClosed() || opt === PRIVATE_OPT_SELECTED;
		}, 
		
		isPrivateOptionClosed: function() {
		    return this.getPrivateOption() === PRIVATE_OPT_CLOSED;
		}
	});
});
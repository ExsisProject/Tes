define('works/models/applet_admin', function(require) {
	// dependency
	var Backbone = require('backbone');
	var GO = require('app');

	/**
	 * 애플릿 관리자인지 여부.(관리자만 앱 생성 가능)
	 * 
	 */
	var AppletAdmin = Backbone.Model.extend({
		/** 권한이 없는 경우. 테스트용 */
		//parse: function(resp) {
		//	resp.data = false;
		//	return resp;
		//},

        url: function () {
            return GO.config('contextRoot') + 'api/works/checkadmin';
        },

        isWorksAdmin: function () {
            return !_.isUndefined(this) && this.get("true");
        }
    });

    return AppletAdmin;
});
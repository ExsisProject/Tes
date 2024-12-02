define('works/models/applet_doc_refer', function(require) {
	var AppletDocModel = require('works/models/applet_doc');
	return AppletDocModel.extend({
		initialize: function(attributes, options) {
			AppletDocModel.prototype.initialize.apply(this, arguments);
			this.appletId = options.appletId;
			this.reqAppletId = options.reqAppletId;
		},
		
		urlRoot: function() {
			return GO.config('contextRoot') + 'api/works/applets/' + this.reqAppletId + '/producer/' + this.appletId + '/doc';
		}
	});
});
define([
    "backbone"
],
function(
    Backbone
) {
    var MailBanner= Backbone.Model.extend({
    	url: function() {
			return [GO.contextRoot + "ad/api/mail/banner", this.id].join('/');
		}
    });

    return MailBanner;
});
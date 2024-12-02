define([
    "backbone"
],
function(Backbone) {
    return Backbone.Model.extend({
        initialize: function(options) {
            options = _.extend({}, options);
            if (_.isBoolean(options.adminContext)) {
                this.adminContext = options.adminContext;
            }
        },

        url: function(){
            var url = '/';
            if (this.adminContext) {
                url += 'ad/'
            }
            url += 'api/mobileconfig';
            return url;
        },

        isOTPEnabled: function() {
            return this.get('otpEnabled');
        },

        isMAMEnabled: function() {
            return this.get('useAppManagement');
        },

        isOTPDeviceRegistered: function() {
            return this.get('otpDeviceRegistered');
        }
    });
});
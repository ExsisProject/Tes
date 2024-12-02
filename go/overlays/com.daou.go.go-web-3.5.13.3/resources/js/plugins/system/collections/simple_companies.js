/**
 * 목록 갯수에 제한이 없으며 SaaS용 collection.
 */
define([
    "backbone"
],

function(Backbone) {
    
    var SystemCompanyCollection = Backbone.Collection.extend({
        
        url: function() {
            var url = GO.contextRoot + "/ad/api/system/companies/simple";
            return url.replace('//', '/');
        },
        
        initialize: function(options) {
            var options = _.extend({}, options);
        }
        
    });
    
    return SystemCompanyCollection;
});
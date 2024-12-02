define([
    "jquery",
    "backbone",     
    "app",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "jquery.go-popup"
],
function(
    $, 
    Backbone,
    App,
    commonLang,
    adminLang,
    AppAdminList
){
    var AppAdminList = Backbone.Collection.extend({
        
        addAdmin: function(data) {
            this.add(new Backbone.Model(data));
        },
        
        isExist: function(data) {
            return _.any(this.models, function(el) { return el.get("userId") == data.userId; });
        },
        
        removeAdmin: function(userId) {
            var target = _.find(this.models, function(model) {
                return userId == model.get("userId");
            });
            this.remove(target);
        }
    });
    
    return AppAdminList;
});
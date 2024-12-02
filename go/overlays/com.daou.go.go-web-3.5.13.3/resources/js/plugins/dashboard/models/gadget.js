(function() {

    define(["backbone", "app"], function( Backbone, GO ) {
    	var GADGET_TYPE = {"company": 'COMPANY', "user": 'USER'},
    		Gadget;
    	
        Gadget = Backbone.Model.extend({
            urlRoot: '/api/gadget', 
            
            savePosition: function(boxNumber, boxOrder) {
            	var deferred = $.Deferred();
            	
            	if(needSyncPosition.call(this, boxNumber, boxOrder)) {
            		var url = GO.config('contextRoot') + [_.result(this, 'urlRoot'), this.id, 'move'].join('/');
            		this.save({"boxNumber": +boxNumber, "boxOrder": +boxOrder}, {
                		"url": url.replace('//', '/'), 
                		"success": function(model) {
                			deferred.resolve(model);
                		}, 
                		"error": function() {
                			deferred.reject();
                		}
                	});
            	} else {
            		deferred.resolve(this);
            	}
            	
            	return deferred;
            }, 
            
            setPosition: function(boxNumber, boxOrder) {
            	return this.set({"boxNumber": +boxNumber, "boxOrder": +boxOrder});
            }, 
                        
            getSpec: function(key) {                
                return returnOptions(this.get('spec'), key);
            }, 
            
            getBoxNumber: function() {
            	return this.get('boxNumber') + 1;
            }, 
            
            getActions: function() {
            	return _.defaults(this.get('actions') || {}, getDefaultActions.call(this));
            }, 
            
            getGadgetOption: function(key) {
            	var gadgetOptions = Backbone.$.parseJSON(this.get('options')) || {};
            	return returnOptions(gadgetOptions, key);
            },
            
            isUserType: function() {
            	return this.get('type') === GADGET_TYPE.user;
            }, 
            
            isCompanyType: function() {
            	return this.get('type') === GADGET_TYPE.company;
            }, 
            
            updatable: function() {
            	return this.getActions().updatable;
            }, 
            
            removable: function() {
            	return this.getActions().removable;
            }
        }, {
        	TYPE_COMPANY: GADGET_TYPE.company, 
        	TYPE_USER: GADGET_TYPE.user
        });
        
        function needSyncPosition(newBoxNumber, newBoxOrder) {
        	if(this.isNew()) return false;
        	if(this.get('boxNumber') !== +newBoxNumber) return true;
        	if(this.get('boxOrder') !== +newBoxOrder) return true;
        	
        	return false;
        }
        
        function getDefaultActions() {
        	var actions = { "updatable": false, "removable": false };
        	
        	if(checkCommonPermission.call(this)) {
        		actions.updatable = true;
        		actions.removable = true;
        	} else {
        		actions.updatable = this.getGadgetOption('editable') || false;
        		actions.removable = this.getGadgetOption('removable') || false;
        	}
        	
        	return actions;
        }
        
        function checkCommonPermission() {
        	if(this.isUserType()) return true;
        	if(GO.session('dashboardAdmin')) return true;
        	
        	return false;
        }
        
        function returnOptions(obj, key) {
        	return (typeof key === 'undefined' ? obj: obj[key]);
        }
        
        return Gadget;
    });
    
})();
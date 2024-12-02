define('works/components/formbuilder/core/component_registry', function(require) {
	
    var _ = require('underscore');
	var ComponentRegistry = {};
	
	_.extend(ComponentRegistry, {
	    __components__: [], 
	    
	    regist: function(FormComponent) {
	        if(FormComponent.hasOwnProperty('define') && _.isFunction(FormComponent.define)) {
                this.__components__.push(FormComponent);
            } else {
                throw new Error('FormComponent 타입의 객체가 아닙니다.');
            }
	        
	        return;
	    }, 
	    
	    /**
	     * @deprecated
	     * use regist
	     */
	    addComponent: function(FormComponent) {
	        return this.regist(FormComponent);
	    }, 
	    
	    getAll: function() {
	        return this.__components__;
	    }, 
	    
	    findByType: function(type) {
	        return _.findWhere(this.__components__, {"type": type});
	    }, 
	    
        /**
         * @deprecated
         */
        findById: function(id) {
            return this.findByType(id);
        }
	})
	
	return ComponentRegistry;
});
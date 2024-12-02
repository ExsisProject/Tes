define('works/models/base_filter_setting', function (require) {

    var RESERVED_KEYWORDS = ['AND', 'OR', 'NOT'];

    var FilterRuleValidator = require('works/libs/filter_rule_validator');

    /**
     * Model > Collection > Model > Collection 의 구조에서 child 의 변화를 최상위 까지 sync 하자. 이게 최선인가?
     */
    var Items = Backbone.Collection.extend({
        initialize: function() {
            this.on('change', this._change, this);
            this.on('destroy', this._destroy, this);
        },

        _change: function() {
            this.trigger('changeChildModel');
        },

        _destroy: function() {
            this.trigger('destroyChildModel');
        }
    });

    var Group = Backbone.Model.extend({
        defaults: {
            circle: {
                nodes: []
            }
        }
    });

    return Backbone.Model.extend({

        defaults: {
            filters: [],
            rules: []
        },

        initialize: function (options) {
            options = options || {};
            this.appletId = options.appletId;
            this.baseFilters = new Items();
            this.baseFilterGroups = new Items({model: Group});
            this.baseFilters.on('changeChildModel', this._syncBaseFilters, this);
            this.baseFilters.on('destroyChildModel', this._syncBaseFilters, this);
            this.baseFilterGroups.on('changeChildModel', this._syncBaseFilterGroups, this);
            this.baseFilterGroups.on('destroyChildModel', this._syncBaseFilterGroups, this);
            this.on('sync', this._syncParentToChild, this);
        },

        url: function () {
            return GO.contextRoot + 'api/works/applets/' + this.appletId + '/basefilters';
        },

        validate: function() {
        	var filterNames = [];
            var reason = null;
            _.each(this.get('filters'), function(filter) {
                var name = filter.name;

                if(!(/^[ㄱ-ㅎ가-힣a-zA-Z0-9]+$/.test(name))) {
                    reason = 'filter.name.invalid';
                    return false;
                }

                if (!name || name.length < 2 || name.length > 50) {
                    reason = 'filter.name.length';
                    return false;
                }
                if ($.trim(name).indexOf(' ') > -1) {
                    reason = 'filter.name.blank';
                    return false;
                }
                if (_.contains(RESERVED_KEYWORDS, name.toUpperCase())) {
                    reason = 'filter.name.unused.char';
                    return false;
                }
                if (filter.description && filter.description.length > 200) {
                    reason = 'filter.description.length';
                    return false;
                }
                filterNames.push(name);
            }, this);

          _.each(this.get('rules'), function(rule) {
        	  var isDefault = rule.isDefault || false;
        	  if (!isDefault && !rule.rule) {
        		  reason = 'rule.rule.null';
        		  return false;
        	  }
	          if (rule.description && rule.description.length > 200) {
	              reason = 'rule.description.length';
	              return false;
	          }
	          
	          var filterRuleValidator = new FilterRuleValidator(filterNames, rule.rule);
	          var result = filterRuleValidator.evaluate();
	          if(!result.validate) {
//	        	  console.error("Filter_Role_Error: " + result.debugMessage);
	        	  reason = 'rule.filterRule.invalid';
	              return false; 
	          }
	      }, this);
          
            return reason;
        },

        addBaseFilterItem: function(filterItem) {
            this.baseFilters.add(filterItem);
            this._syncBaseFilters();
        },

        addBaseFilterGroupItem: function(filterGroupItem) {
            this.baseFilterGroups.add(filterGroupItem);
            this._syncBaseFilterGroups();
        },

        _syncParentToChild: function() {
            this.baseFilters.reset(this.get('filters'));
            this.baseFilterGroups.reset(this.get('rules'));
        },

        _syncBaseFilters: function() {
            this.set('filters', this.baseFilters.toJSON());
        },

        _syncBaseFilterGroups: function() {
            this.set('rules', this.baseFilterGroups.toJSON());
        }
    }, {
        getGroupModelInstance: function() {
            return new Group();
        }
    });
});
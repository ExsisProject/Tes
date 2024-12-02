define([
    "backbone"
],

function(Backbone) {
    
    var CompanyCollection = Backbone.Collection.extend({
        
        url: function() {
            var url = GO.contextRoot + "/ad/api/";
            if (this.type == 'companygroup') {
                url += 'companygroup/';
            }
            url += 'companies?offset=9999';
            return url.replace('//', '/');
        },
        
        initialize: function(options) {
            var options = _.extend({}, options);
            
            this.type = 'normal';
            if (options['type']) {
                this.type = options['type'];
            }
            
            if (!_.contains(CompanyCollection.AVAILABLE_TYPES, this.type)) {
                throw new Error('Invalid Company Collection Type - not in [normal, companygroup]');
            }
        },
        
        /**
         * 회사 목록 중에 중복된 URL을 가진 회사가 있는지 검사한다.
         */
        hasUrlDuplication: function() {
            var duplicated = false,
                urls = [];
            
            urls = this.map(function(model) {
                return model.get('siteUrl');
            });
            
            if (_.size(_.uniq(urls)) == _.size(urls)) {
                duplicated = true;
            }
            
            return duplicated;
        }
        
    }, {
        
        /**
         * normal은 일반 회사 목록이고,
         * comppanygroup은 현재 세션 회사 그룹의 회사 목록을 가리킨다. 
         */
        AVAILABLE_TYPES: ['normal', 'companygroup']
    });
    
    return CompanyCollection;
});
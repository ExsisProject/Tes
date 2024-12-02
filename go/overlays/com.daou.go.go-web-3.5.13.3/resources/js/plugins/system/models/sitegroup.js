define([
    "backbone",
    "system/models/user_integration",
    "system/collections/companies"
],

function(
    Backbone,
    UserIntegrationModel,
    CompanyCollection
) {
    
    var UserIntegrationCollection = Backbone.Collection.extend({
        
        model: UserIntegrationModel,
        
        getByUserListKey: function(key) {
            return this.find(function(model) {
                return model.generateUserListKey() == key;
            });
        },
        
        removeByUserListKey: function(key) {
            var target = this.getByUserListKey(key);
            if (target) {
                this.remove(target);
            }
        },
        
        removeByCompanyId: function(companyId) {
            var targets = this.filter(function(model) {
                return model.hasCompanyUser(companyId);
            });
            
            this.remove(targets);
        }
    });
    
    var SiteGroupModel = Backbone.Model.extend({
        
        defaults: {
            id : null,
            name : '',
            orgTreeShareScope : 'NO_USER', // ALL_USER, SELECTED_USER, NO_USER
            orgTreeShareContent : 'TREE', // TREE, SEARCH
            orgTreeShareUser : null,
            companies : null,
            userIntegrations : null
        },
        
        initialize: function() {
            if (_.isEmpty(this.get('companies'))) {
                this.set('companies', []);
            }
            
            if (_.isEmpty(this.get('userIntegrations'))) {
                this.set('userIntegrations', []);
            }
        },
        
        url: function() {
            var url = GO.contextRoot + 'ad/api/system/companygroup';
            if (this.get('id')) {
                url += '/' + this.get('id');
            }
            
            return url;
        },
        
        addCompany: function(target) {
            this._setCompaniesSeq();
            var companies = new CompanyCollection(this.get('companies'));
            companies.add(target);
            
            this.set('companies', companies.toJSON());
            this._setCompaniesSeq();
        },
        
        removeCompany: function(companyId, afterRemoveCallback) {
            this._setCompaniesSeq();
            
            var companies = new CompanyCollection(this.get('companies')),
                company = companies.get(companyId),
                index = companies.indexOf(company);
            
            if (!company) {
                return company;
            }
            
            companies.remove(company);
            if (_.isFunction(afterRemoveCallback)) {
                afterRemoveCallback(companies, company, index);
            }
            
            this.set('companies', companies.toJSON());
            company.set('companyGroup', null);
            this._setCompaniesSeq();
            return company;
        },
        
        moveCompanyTop: function(companyId) {
            this.removeCompany(companyId, function(companies, company, index) {
                companies.add(company, {
                    'at' : 0
                });
            });
        },
        
        moveCompanyUp: function(companyId) {
            this.removeCompany(companyId, function(companies, company, index) {
                companies.add(company, {
                    'at' : index == 0 ? 0 : index - 1
                });
            });
        },
        
        moveCompanyDown: function(companyId) {
            this.removeCompany(companyId, function(companies, company, index) {
                companies.add(company, {
                    'at' : index == companies.size() ? index : index + 1
                });
            });
        },
        
        moveCompanyBottom: function(companyId) {
            this.removeCompany(companyId, function(companies, company, index) {
                companies.add(company);
            });
        },
        
        _setCompaniesSeq: function() {
            var companies = this.get('companies');
            for (var i=0; i < companies.length; i++) {
                companies[i]['seq'] = i;
            }
        },
        
        /**
         * 사용자들의 아이디를 묶어 만든 key를 통해 integration 항목을 반환한다.
         */
        getUserIntegrationByUserListKey: function(key) {
            var integrations = new UserIntegrationCollection(this.get('userIntegrations'));
                integration = integrations.getByUserListKey(key);
            return integration.toJSON();
        },
        
        /**
         * 사용자들의 아이디를 묶어 만든 key를 통해 integration 항목을 제거한다.
         */
        removeUserIntegrationByUserListKey: function(key) {
            var integrations = new UserIntegrationCollection(this.get('userIntegrations'));
            integrations.removeByUserListKey(key);
            this.set('userIntegrations', integrations.toJSON());
        },
        
        /**
         * 주어진 회사 소속 계정을 가진 겸직 데이터를 제거한다.
         */
        removeUserIntegrationOfCompany: function(companyId) {
            var integrations = new UserIntegrationCollection(this.get('userIntegrations'));
            integrations.removeByCompanyId(companyId);
            this.set('userIntegrations', integrations.toJSON());
        },
        
        isOrgShareToNoUser: function() {
            return this.get('orgTreeShareScope') == 'NO_USER';
        },
        
        isOrgShareToSelectedUser: function() {
            return this.get('orgTreeShareScope') == 'SELECTED_USER';
        },
        
        isOrgShareToAllUser: function() {
            return this.get('orgTreeShareScope') == 'ALL_USER';
        },
        
        isOrgShareByTree: function() {
            return this.get('orgTreeShareContent') == 'TREE';
        },
        
        addUserIntegration: function(integration) {
            var integrations = new UserIntegrationCollection(this.get('userIntegrations'));
            integrations.add(new UserIntegrationModel(integration));
            this.set('userIntegrations', integrations.toJSON());
        },
        
        updateUserIntegration: function(oldIntegration, newIntegration) {
            var integrations = new UserIntegrationCollection(this.get('userIntegrations')),
                userIds,
                target;
            
            userIds = _.map(oldIntegration['users'], function(user) {
                return user['id'];
            });
            
            target = integrations.getByUserListKey(SiteGroupModel.generateUserListKey(userIds));
            if (target) {
                target.set(newIntegration);
            }
            
            this.set('userIntegrations', integrations.toJSON());
        }
    },
    {
        generateUserListKey: function(userIds) {
            return UserIntegrationModel.generateUserListKey(userIds);
        }
    });
    
    return SiteGroupModel;
});
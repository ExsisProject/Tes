(function() {
    define([
            "backbone",
            "moment"
        ],
        function(
            Backbone,
            moment
        ) {
            var Session = Backbone.Model.extend({
                urlRoot: "/api/user/session",

                // user: 사용자 화면, admin: 관리자 화면
                instanceType: 'user',

                // 세션 기본 파기 시간
                destroyTime: (60 * 30),

                defaults: {
                    // 기본 이미지가 없을 경우 default 이미지 보여주도록 처리
                    "thumbnail": "resources/images/photo_my.jpg",
                    "noti" : 0,
                    "updated_at": new Date()
                },

                url: function() {
                    var prefix = this.instanceType === 'admin' ? '/ad': '';
                    return prefix + _.result(this, 'urlRoot');
                },

                initialize: function(model, options) {
                    options = options || {};
                    this.instanceType = 'user';
                    if(options.hasOwnProperty('instanceType')) this.setInstanceType(options.instanceType);                    
                },

                setInstanceType: function(newType) {
                    this.instanceType = newType;
                },

                setDestroyTime: function(seconds) {
                    this.destroyTime = seconds;
                    return this;
                },

                getDestroyTime: function() {
                    return this.destroyTime;
                },

                isValid: function() {
                    return (typeof this.id !== 'undefined' && moment().diff(moment(this.get('updated_at')), 'seconds', true) < this.getDestroyTime());
                },

                updateDate: function() {
                    this.set('updated_at', new Date());
                },

                updateSession: function(data) {
                    if(!this.isValid() && this.instanceType !== 'install') {
                        window.GO_Session.set(data);
                        this.updateDate();
                        this.setInstanceType(GO.instanceType);
                        this.setDestroyTime(GO.config("sessionDestroyTime"));
                        this.on("change:locale", function() { location.reload(); });
                        this.set('integratedCompanies', this._getIntegratedCompanies());
                    }
                },

                /**
                 * 겸직으로 있는 회사 목록을 반환. 만약, 겸직이 아니면 자신의 회사만을 목록으로 반환
                 *
                 * @returns
                 */
                _getIntegratedCompanies: function() {
                    var integratedCompanies = [],
                        companies = this.get('companies');

                    if (!companies) {
                        return [];
                    }

                    for (var i=0; i < companies.length; i++) {
                        if (companies[i].userId) {
                            integratedCompanies.push(companies[i]);
                        }
                    }

                    return integratedCompanies;
                }
            });

            return Session;
        });

}).call(this);
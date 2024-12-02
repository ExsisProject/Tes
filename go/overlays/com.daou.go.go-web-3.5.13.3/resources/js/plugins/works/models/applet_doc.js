define('works/models/applet_doc', function (require) {
    var BaseModel = require('models/base_model');
    var GO = require('app');

    /**
     * 애플릿 문서 모델(AppletDocModel)
     * 참고: http://wiki.daou.co.kr/display/go/AppletDocModel
     *
     * 문서상세에서 사용
     */
    return BaseModel.extend({

        param: {},

        urlRoot: function () {
            var appletId = this.get('appletId');
            return GO.config('contextRoot') + 'api/works/applets/' + appletId + '/docs' + this._makeParam();
        },

        initialize: function (attributes, options) {
            BaseModel.prototype.initialize.call(this);
            // values가 객체이기 때문에 defaults 값으로 하고 기본값을 {}로 설정하면 새로운 객체
            // 생성후에도 해당 defaults 설정에 기존 값이 남아있어서 새로 생성되는 객체에 연결된다.
            // 이를 해결하기 위해 직접 attributes 속성을 설정.
            if (attributes && attributes.hasOwnProperty('values')) {
                this.attributes.values = attributes.values;
            } else if (!this.attributes.hasOwnProperty('values')) {
                this.attributes.values = {};
            }
        },

        fetch: function (options) {
            options = options || {};
            options = _.extend({
                error: function (data, error) {
                    if (GO.util.isMobile()) {
                        GO.util.linkToErrorPage(error);
                    } else {
                        var _error = JSON.parse(error.responseText);
                        GO.util.error(_error.code, _error.code === "500" ? {} : {"msgCode": "400-works"})
                    }
                }
            }, options);

            var subFormId = this.get('subFormId');
            if (GO.util.isValidValue(subFormId)) {
                options.url = this.url() + '?subFormId=' + subFormId;
            }

            return BaseModel.prototype.fetch.call(this, options);
        },

        parse: function (resp) {
            if (resp.data) {
                return _.extend(resp.data, resp.data.values);
            } else {
                return _.extend(resp, resp.values);
            }
        },

        setValue: function (key, val) {
            var oldValues = this.get('values');

            if (_.isObject(key)) {
                _.extend(oldValues, key);
            } else if (_.isString(key)) {
                oldValues[key] = val;
            }
            this.set('values', oldValues);
        },

        getValue: function (key) {
            return this.get('values')[key];
        },

        setAppletId: function (appletId) {
            this.appletId = appletId;
        },

        getAppletId: function () {
            return this.appletId;
        },

        isCreator: function (userId) {
            var creator = this.getValue('creator');
            return creator && creator.id === userId;
        },

        isPrivate: function () {
            return this.get('privateFlag');
        },

        isNew: function () {
            return this.get('id') ? false : true;
        },

        setParam: function (param) {
            this.param = param
        },

        _makeParam: function () {
            return _.isEmpty(this.param) ? '' : '?' + $.param(this.param);
        },

        setSubFormId: function (subFormId) {
            this.set('subFormId', subFormId);
        }
    });
});

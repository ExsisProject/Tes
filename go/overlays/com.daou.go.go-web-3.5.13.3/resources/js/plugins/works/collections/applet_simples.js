define('works/collections/applet_simples', function (require) {
    var GO = require('app');
    var when = require('when');
    var WorksUtil = require('works/libs/util');
    var SimpleAppletModel = require('works/models/applet_simple');
    var BaseCollection = require('collections/base_collection');

    /**
     * 애플릿 폼 모델(SimpleAppletModel)
     * 참고: http://wiki.daou.co.kr/display/go/SimpleAppletModel
     *
     * 애플릿의 기본 정보를 표현하는 가장 단순한 애플릿 모델에 대한 Collection
     */

    return BaseCollection.extend({

        comparator: 'seq',
        model: SimpleAppletModel,

        initialize: function (models, options) {
            BaseCollection.prototype.initialize.apply(this, arguments);
            this.options = options || {};
            this.url = _.isString(this.options.url) ? this.options.url : this.url;
            this.type = this.options.type || 'base';
            this.folderId = this.options.folderId;
            this.keyword = this.options.keyword;
        },
        url: function () {
            var param = this._makeParam();

            return this._urlMap()[this.type] + (param ? '?' + param : '');
        },

        parse: function (resp) {
            _.each(resp.data, function (model) {
                model.templateId = model.id;
                if (model.asDefault == false) model.id = 'c_' + model.id; // defaultTemplate와 costomTemplate가 id가 동일 할 수 도 있기 때문
            });
            return resp.data;
        },

        _urlMap: function () {
            return {
                base: GO.config('contextRoot') + 'api/works/applets',
                all: GO.config('contextRoot') + 'api/works/folders/root',
                folder: GO.config('contextRoot') + 'api/works/folders/' + this.folderId + '/applets',
                favorite: GO.config('contextRoot') + 'api/works/applets/favorites',
                manage: GO.config('contextRoot') + 'api/works/applets/manage',
                share: GO.config('contextRoot') + 'api/works/folders/root',
                accessible: GO.config('contextRoot') + 'api/works/applets/accessible',
                search: GO.config('contextRoot') + 'api/works/applets/accessible/search',
            }
        },

        /** 목록이 없는 경우. 테스트용 */
        //parse: function(resp) {
        //	resp.data = [];
        //	return resp.data;
        //},

        reorder: function (appletIds) {
            var self = this,
                defer = when.defer();
            WorksUtil.reqReorderList([_.result(this, 'urlRoot'), '/applets/favorites'].join('/'), appletIds).then(function (data) {
                _.map(appletIds, function (appletId, newSeq) {
                    var curTodo = self.get(appletId);
                    curTodo.set('seq', newSeq);
                });
                self.sort();
                defer.resolve(self);
            }, defer.reject);

            return defer.promise;
        },
        urlRoot: function () {
            return GO.config('contextRoot') + 'api/works';
        },
        setUrl: function (url) {
            this.url = url;
        },

        mergeAppletToFavorite: function (applets) {
            this.each(function (favorite) {
                favorite.set("isFavorite", true);
            });

            var cloneApplets = applets.clone();
            cloneApplets.each(function (applet) {
                var favorite = this.findWhere({id: applet.id});
                if (_.isObject(favorite)) return;
                this.push(applet);
            }, this);
        },

        findByKeyword: function (keyword) {
            if (!keyword) return [];

            return this.filter(function (model) {
                return model.get("name").indexOf(keyword) > -1;
            });
        },

        getType: function () {
            return this.type;
        },

        setType: function (type) {
            this.type = type;
        },

        setFolderId: function (folderId) {
            this.folderId = folderId;
        },

        getFolderId: function () {
            return this.folderId;
        },

        setOrder: function (order) {
            this.orderBy = order;
        },

        setKeyword: function (keyword) {
            this.keyword = keyword;
        },

        _makeParam: function () {
            var param = {};
            if (this.type == 'favorite') return $.param(param);
            if (this.options.writable) param['onlyWritable'] = 'true';
            if (this.orderBy) param['orderBy'] = this.orderBy;
            if (this.keyword) param['keyword'] = this.keyword;
            return $.param(param);
        }
    });
});

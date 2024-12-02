define(function(require) {
    var MATRIX_EVENT = require('matrix/constants/matrix_event');

    var CommonLang = require('i18n!nls/commons');
    var CalendarLang = require('i18n!calendar/nls/calendar');
    var TaskLang = require('i18n!task/nls/task');
    var WorksLang = require('i18n!works/nls/works');

    var Backbone = require('backbone');

    var ProfileView = require('views/profile_card');

    var TaskMatrixView = require('task/views/task_matrix');
    var TaskHeaderView = require('task/views/task_title');

    var CalendarItems = require('task/collections/task_calendar_items');
    var DeptProfile = require('models/dept_profile');

    var Template = require('hgn!task/templates/task_calendar');

    var lang = {
        '더 보기': TaskLang['더 보기']
    };

    return Backbone.View.extend({

        events: {
            'click li[data-nav-type]': '_onClickNav',
            'click #moreButton': '_onClickMoreButton',
            'click #home': '_onClickHomeButton',
            'click td[data-row-head]': '_profile'
        },

        initialize : function(options) {
            this.navType = GO.util.store.get(GO.session("id") + "-last-task-calendar") || 'week';
            this.deptId = options.deptId;

            this.deptProfile = DeptProfile.init({id: this.deptId});
            this.listenTo(this.deptProfile, 'sync', this._onSyncDept);
            this.deptProfile.fetch();
            this._initMatrix();
        },

        render : function() {
            this.$el.html(Template({lang: lang}));
            this.$('header.content_top').html((new TaskHeaderView({
                title: ''
            })).render().el);
            this.$('span.meta').html([
                '<span id="home" class="action">',
                    '<a class="btn_fn6">' + TaskLang['나의 업무 현황 보기'] + '</a>',
                '</span>'
            ].join(''));
            this.$('div[data-matrix-area]').html(this.matrixView.el);

            return this;
        },

        _initMatrix: function() {
            var contentRenderer = function() {
                var isPrivate = this.model.get('privateTask') ? '<span class="ic_classic ic_lock"></span>' : '';
                var content = this.model.get('delay') ? '<span style="color: red;">' + this.model.get('name') + '</span>' : this.model.get('name');
                return {
                    content: isPrivate + content,
                    title: this.model.get('name')
                };
            };

            this.collection = new CalendarItems([], {deptId: this.deptId});
            this.collection.setRangeType(this.navType);
            this.listenTo(this.collection, 'sync', this._onSyncCollection);
            this.matrixView = new TaskMatrixView({
                matrix: {
                    type: 'week',
                    gridUnit: 'days',
                    gridValue: 1,
                    startTime: moment(new Date()).startOf(this.navType).format('YYYY-MM-DDTHH:mm:ss.sssZ'),
                    endTime: moment(new Date()).endOf(this.navType).add(1, 'millisecond').format('YYYY-MM-DDTHH:mm:ss.sssZ'),
                    useGrid: true,
                    navigationInterval: this.navType,
                    contentRenderer: contentRenderer
                },
                leftToolbar: this._toolbarTemplate(),
                collection: this.collection,
                emptyMessage: WorksLang['데이터가 없습니다'],
                matrixHeader: CommonLang['이름']
            });
            this.matrixView.$el.on(MATRIX_EVENT.RENDER_DONE, $.proxy(function() {
                this._markNav();
            }, this));
            this.matrixView.$el.on(MATRIX_EVENT.ITEM_CLICK, $.proxy(function(e, data) {
                var model = data.target.data('model');
                var url = GO.contextRoot + 'app/task/' + model.id + '/detail';
                window.open(url, "_blank");
            }, this));
            this.matrixView.$el.on(MATRIX_EVENT.ROW_CLICK, $.proxy(function() {
                GO.router.navigate('task/create', true);
            }, this));
        },

        _toolbarTemplate: function() {
            var template = Hogan.compile([
                '<ul class="tab_nav">',
                    '<li class="first" data-nav-type="day">',
                        '<span>' + CalendarLang['일간'] + '</span>',
                    '</li>',
                    '<li class="last" data-nav-type="week">',
                        '<span>' + CalendarLang['주간'] + '</span>',
                    '</li>',
                '</ul>'
            ].join(''));

            return template.render();
        },

        _onClickNav: function(e) {
            var $target = $(e.currentTarget);
            var type = $target.attr('data-nav-type');

            if (type == this.navType) return;
            this.navType = type;
            GO.util.store.set(GO.session("id") + "-last-task-calendar", type);

            var matrix = this.matrixView.getMatrix();
            matrix.setInterval(type);
            matrix.initMatrix(true);
            this.collection.setRangeType(type);
            this.matrixView.fetch();
        },

        _markNav: function() {
            var matrix = this.matrixView.getMatrix();
            var type = matrix.get('navigationInterval');
            this.matrixView.$('li[data-nav-type]').removeClass('on');
            this.matrixView.$('li[data-nav-type="' + type + '"]').addClass('on');
        },

        _onSyncCollection: function() {
            this.$('#moreButton').toggle(this.collection.hasMore());
        },

        _onClickMoreButton: function() {
            this.collection.page++;
            this.collection.fetch();
        },

        _onSyncDept: function() {
            this.$('h1').find('span.txt').html(this.deptProfile.get('name'));
        },

        _onClickHomeButton: function() {
            GO.router.navigate('task/home', true);
        },

        _profile : function(e) {
            e.stopPropagation();
            var target = e.currentTarget;
            var userId = $(target).attr("data-row-head");
            if (!userId) return;
            ProfileView.render(userId, target);
        }
    });
});
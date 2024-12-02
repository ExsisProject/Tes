define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "components/backdrop/backdrop",
    "approval/views/content_top",
    "approval/views/home/reception_list",
    "approval/views/home/todo_list",
    "approval/views/home/draft_list",
    "approval/views/home/complete_list",
    "hgn!approval/templates/home",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
    "jquery.go-preloader"
],

function(
	$,
	_,
	Backbone,
	GO,
    BackdropView,
	ContentTopView,
	ReceptionListView,
    TodoListView,
    DraftListView,
    CompleteListView,
    HomeTpl,
    commonLang,
    approvalLang
) {
	var preloader = null;
	
	var HomeMainView = Backbone.View.extend({
		el: '#content',

		events: {
            "click #home_reception_waiting_doclist .btn-toggle-desc" : "_toggleReceptionWaitingDesc",
            "click #home_drafted_doclist .btn-toggle-desc" : "_toggleDraftedDesc",
            "click #home_completed_doclist .btn-toggle-desc" : "_toggleCompletedDesc",
    	},

		initialize: function(options) {
		    this.options = options || {};
			this.contentTop = ContentTopView.getInstance();
		},

		render: function() {
			preloader = $.goPreloader();
			var lang = {
				'결재 대기 문서': approvalLang['결재 대기 문서'],
				'기안 문서': approvalLang['기안 문서'],
				'기안 진행 문서': approvalLang['기안 진행 문서'],
				'완료 문서': approvalLang['완료 문서'],
				'접수 대기 문서': approvalLang['접수 대기 문서'],
				'최근에 수신된 시간순서대로, 최대 5개의 목록을 표시합니다': approvalLang['최근에 수신된 시간순서대로, 최대 5개의 목록을 표시합니다'],
				'최근에 등록된 시간순서대로, 최대 5개의 목록을 표시합니다': approvalLang['최근에 등록된 시간순서대로, 최대 5개의 목록을 표시합니다.'],
				'최근에 결재 완료된 순서대로, 최대 5개의 목록을 표시합니다': approvalLang['최근에 결재 완료된 순서대로, 최대 5개의 목록을 표시합니다.'],
				'현재 진행중인 기안문서 5개를, 최근 등록 순서대로 표시합니다': approvalLang['현재 진행중인 기안문서 5개를, 최근 등록 순서대로 표시합니다']
			};

			this.$el.html(HomeTpl({
				lang: lang
			}));

			this.contentTop.setTitle(approvalLang['전자결재 홈']);
			this.contentTop.render();

			this.$el.find('header.content_top').replaceWith(this.contentTop.el);
			var receptionListView = new ReceptionListView();
			receptionListView.render($.proxy(function(el, isEmptyCollection) {
			    var $wrapper = this.$el.find('#home_reception_waiting_doclist');
			    $wrapper.find('.dataTables_wrapper').append(el);
			    if (!isEmptyCollection) {
			        $wrapper.show();
			    }
			}, this));
			var todoListView = new TodoListView();
			this.$el.find('#home_approval_waiting_doclist').find('.dashboard_box').append(todoListView.render().el);

			var draftListView = new DraftListView();
			this.$el.find('#home_drafted_doclist').find('div.dataTables_wrapper').append(draftListView.render().el);

			var completeListView = new CompleteListView();
			this.$el.find('#home_completed_doclist').find('div.dataTables_wrapper:last').append(completeListView.render().el);
			preloader.release();
		},

		release: function() {
			this.$el.off();
			this.$el.empty();
		},
        
        _toggleReceptionWaitingDesc : function(e) {
            if (!this.receptionWaitingDescBackdropView) {
                this.receptionWaitingDescBackdropView = this._bindBackdrop($(e.currentTarget));
            }
        },

        _toggleDraftedDesc : function(e) {
            if (!this.draftedDescBackdropView) {
                this.draftedDescBackdropView = this._bindBackdrop($(e.currentTarget));
            }
        },

        _toggleCompletedDesc : function(e) {
            if (!this.completedDescBackdropView) {
                this.completedDescBackdropView = this._bindBackdrop($(e.currentTarget));
            }
        },

        _bindBackdrop: function ($currentTarget) {
            var backdropView = new BackdropView();
            backdropView.backdropToggleEl = $currentTarget.find(".tooltip-desc");
            backdropView.linkBackdrop($currentTarget);
            return backdropView;
        },
	});

	return HomeMainView;
});
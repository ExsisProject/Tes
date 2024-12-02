(function() {
	define([
		'views/mobile/m_more_list',
		"backbone",
		"app",
		"survey/collections/surveys",
		"survey/helpers/html",
		"i18n!survey/nls/survey",
		"views/mobile/header_toolbar"
	],

	function(
		MoreView,
		Backbone,
		GO,
		SurveyList,
		SurveyHtmlHelper,
		SurveyLang,
		HeaderToolbarView
	) {

		var SurveyListView = MoreView.extend({
			tagName : 'ul',
			className: 'list_box list_box_survey',
			filterName: 'all',

			events: {
				"vclick a.tit": "goDetail"
			},

			initialize: function(options) {
				this.options = options || {};
				GO.util.appLoading(true);
				this.filterName = this.options.filter;
				var renderListFunc = {
					listFunc: $.proxy(function (collection) {
						collection.each(function(model, i) {
							this.$el.append(renderListItem.call(this, model));
						}, this);
					}, this),
					emptyListFunc: $.proxy(function () {
						this.$el.append('<li class="creat data_null"><span class="txt_ellipsis">'+SurveyLang["설문 빈목록 메시지"]+'</span></li>')
					}, this)
				};
				this.setRenderListFunc(renderListFunc);
				var dataSet = {"property": 'id', "direction": 'desc'};

				if(!this.collection) {
					this.setFetchInfo(dataSet, new SurveyList([], {"filter": this.filterName}));
				}
			},

			render : function() {
				var defer = $.Deferred();
                var isFirstClickSurveyHome = this.filterName === "progress" && _.isNull(sessionStorage.getItem("tabKind"));
				HeaderToolbarView.render({
					title: {
						"progress": SurveyLang["진행중인 설문"],
						"finished": SurveyLang["완료된 설문"],
						"my": SurveyLang["내가 만든 설문"]
					}[this.filterName],
					isList : true,
					isSideMenu: true,
					isHome: true
				});
				this.dataFetch()
					.done($.proxy(function (collection) {
						if (collection.length === 0) {
						    if(isFirstClickSurveyHome){
						        GO.EventEmitter.trigger("survey", "layout:toggleLatestTab");
                            }
							this.renderListFunc.emptyListFunc();
						} else {
							this.renderListFunc.listFunc(collection);
							defer.resolveWith(this, collection);
							GO.util.pageDone();
							this.scrollToEl();
						}
						GO.util.appLoading(false);
					}, this));
				return defer;
			},

			// TODO: 리팩토링(PC웹과 동일함)
			isMyList: function() {
				return this.filterName === 'my';
			},
			goDetail: function (e) {
				this.setSessionInfo(e);
				var targetEl = $(e.currentTarget);
				var url = 'survey/' + targetEl.attr('data-list-id');
				GO.router.navigate(url, {
					trigger: true
				});
				return false;
			}
		});

		function renderListItem(model) {
			var html = [],
				statusTag = '';

			html.push('<li>');
				html.push('<a class="tit"' + " data-list-id='" + model.id + "'>");
					html.push('<span class="subject">');

						// TODO: PC에서 카피 => SurveyHtmlHelper에 넣고 재사용...
						if(this.isMyList()) {
							statusTag = SurveyHtmlHelper.getStatusTagByStatus(model.get('status'));
						} else if(model.isResponsible()) {
							statusTag = SurveyHtmlHelper.getStatusTagByResponse(model.getResponseStatus());
						} else if(model.isIncludedReferrer(GO.session('id'))) {
							statusTag = SurveyHtmlHelper.getStatusTag('read', SurveyLang["열람"]);
						}

						html.push(statusTag);

						if(model.isIncludedReferrer(GO.session("id"))) {
							// TODO: 디자인팀에 요청(PC refer랑 클래스 맞춰달라고...)
							html.push('<span class="state refer">'+SurveyLang['참조']+'</span>');
						}

						html.push('<span class="txt">' + model.get('title') + '</span>');
					html.push('</span>');
					html.push('<span class="info">');
						html.push('<span class="vertical_wrap"><span class="date date_em">' + SurveyHtmlHelper.getSurveyPeriod(model) + '</span></span>');
						html.push('<span class="writer">' + model.getCreatorName() + '</span>');
					html.push('</span>');
				html.push('</a>');
			html.push('</li>');

			return html.join("\n");
		}
		return SurveyListView;

	});
})();
(function() {
	define(function(require) {
		var $ = require("jquery"),
			Backbone = require("backbone"),
			App = require("app"),
			TplResult = require("text!approval/templates/mobile/m_search_result.html"),
			TplResultItem = require("text!approval/templates/mobile/m_search_result_item.html"),
			CommonResult = require("views/mobile/m_search_common_result"),
			commonLang = require("i18n!nls/commons"),
			approvalLang = require("i18n!approval/nls/approval");
		require("GO.util");

		var instance = null;
		var lang = {
			'검색결과없음' : commonLang['검색결과없음'],
			'검색결과' : commonLang['검색결과'],
			'수신' : approvalLang['수신']
		};

		var parseDraftedAt = function(){
			return GO.util.snsDate(this.draftedAt);
		};

		var isReceive = function() {
			if(this.docType == "RECEIVE"){
				return true;
			} else {
				return false;
			}
		};

		var getStatusName = function() {
			var docStatus = this.docStatus;
			if (docStatus == "INPROGRESS") {
				return approvalLang['진행중'];
			} else if (docStatus == "COMPLETE") {
				return approvalLang['완료'];
			} else if (docStatus == "RETURN") {
				return approvalLang['반려'];
			} else if (docStatus == "TEMPSAVE") {
				return approvalLang['임시저장'];
			} else if (docStatus == "DRAFT_WAITING") {
				return approvalLang['임시저장'];
			} else if (docStatus == "RECEIVED") {
				return approvalLang['접수'];
			} else if (docStatus == "RECV_WAITING") {
				return approvalLang['접수대기'];
			} else if (docStatus == "RECV_RETURNED") {
				return approvalLang['반송'];
			}
		};

		var SearchCollection = Backbone.Collection.extend({
			model: Backbone.Model.extend(),
			initialize: function(type) {
				this.type = type;
			},
			url: function() {
				return '/api/search/'+this.type;
			}
		});
		var getStatusClass = function(){
			var docStatus = this.docStatus;
			if (docStatus == 'INPROGRESS' || docStatus == 'RECEIVED') {
				return 'read';
			} else if (docStatus == 'TEMPSAVE' || docStatus == 'DRAFT_WAITING' || docStatus == 'RECV_WAITING') {
				return 'temp';
			} else if (docStatus == 'RETURN' || docStatus == 'RECV_RETURNED') {
				return 'notyet';
			} else if (docStatus == 'COMPLETE') {
				return 'finish';
			}
		};

		var SearchView = Backbone.View.extend({
			el : '#searchResultWrap',
			events : {
				'vclick a[data-id]': '_getContent',
			},
			initialize: function(options) {
				var _this = this;
				this.options = options;
				this.$el.off();
				this.collection = new SearchCollection(this.options.type);
				this.lastPage = false;
				CommonResult.set({
					collection : this.collection,
					searchOptions : this.options,
					renderListFunc : function(collection) {
						_this._renderContents(collection);
					},
					renderListMoreFunc : function(collection) {
						_this._moreList(collection);
					}
				});
			},
			render: function() {
				CommonResult.fetch();
				return this.el;
			},
			_renderContents : function(collection) {
				this.$el.html(Hogan.compile(TplResult).render({
					lang : lang,
					dataset : collection.toJSON(),
					resultCount : collection.page.total,
					parseDraftedAt : parseDraftedAt,
					isReceive : isReceive,
					getStatusName : getStatusName,
					getStatusClass : getStatusClass
				},{
					partial : TplResultItem
				}));
				$('#detailSearchToggle').removeClass('on');
				this._showResultWrap();
			},
			_moreList : function(collection) {
				this.$el.find('ul:first').append(Hogan.compile(TplResultItem).render({
					lang : lang,
					dataset : collection.toJSON(),
					parseDraftedAt : parseDraftedAt,
					isReceive : isReceive,
					getStatusName : getStatusName,
					getStatusClass : getStatusClass
				}));
			},
			_showResultWrap : function() {
				$('#simpleSearchWrap').hide();
				$('#detailSearchWrap').hide();
				$('#searchResultWrap').show();
			},
			_getContent : function(e) {
				e.preventDefault();
				var target = $(e.currentTarget);
				var url = "/"+this.options.type+"/document/" + target.attr('data-id');
				App.router.navigate(url, true);
			}
		});
		return {
			render : function(options) {
				instance = new SearchView(options);
				return instance.render();
			}
		};
	});

}).call(this);
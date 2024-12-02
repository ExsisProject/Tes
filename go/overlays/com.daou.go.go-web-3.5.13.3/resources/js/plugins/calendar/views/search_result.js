(function() {
    define([
        "jquery", 
        "underscore", 
        "backbone", 
        "app", 
        "calendar/collections/search_results", 
        "hgn!calendar/templates/search_result", 
        "hgn!calendar/templates/_search_results", 
        "i18n!nls/commons", 
        "i18n!calendar/nls/calendar", 
        "jquery.go-preloader"
    ], 

    function(
        $, 
        _, 
        Backbone, 
        GO, 
        SearchResults, 
        SearchResultTpl, 
        SearchResultListTpl, 
        commonLang, 
        calLang
    ) {
        var tvars = {
            "label": {
                "keyword": commonLang["검색어"], 
                "summary": calLang["일정명"], 
                "category": calLang["일정 구분"],
                "attendee": calLang["참석자"],
                "description": commonLang["내용"], 
                "period": calLang["기간"], 
                "date": calLang["날짜"],
                "more" : commonLang["더보기"]
            }
        };

        var SearchResultView = GO.BaseView.extend({
            className: "content_page", 

            events: {
                "click a.summary_link": "_goToEvent",
                "click #searchMoreButton": "_showMore"
            }, 

            initialize: function() {
            	this.collection = new SearchResults();
                this.collection.parseQueryString();
                
                this._prepareTemplate();
            }, 
            
            fetchResult: function() {
                var self = this, 
                    deferred = $.Deferred(), 
                    preloader = $.goPreloader();
                
                this.collection.fetch({
                    beforeSend: function() {
                    	preloader.render();
                    	deferred.notify(); 
                    }, 
                    complete: function() { 
                    	preloader.release();
                    }, 
                    success: function() {
                    	self.render();
                    }, 
                    fail: deferred.reject
                });
                
                return deferred;
            },

            render: function() {
            	this.$el.find("table.tb_search_result > tbody").empty().append(this._makeList());
            	this._renderMoreButton();
                
                // TODO: 바로 접근하는 방법외에 모색
                $('header.content_top > h1 > span.num').html(GO.i18n(commonLang["총건수"], { num: this.getResultCount() }));
                this._bindScrollEvent();
                return this;
            },
            
            _showMore: function() {
            	var self = this;
            	this.collection.setPage(self.collection.getPage() + 1);
            	this.collection.fetch({
                    success: function() {
                    	self.$el.find("table.tb_search_result > tbody").append(self._makeList());
                    	self._renderMoreButton();
                    }
                });
            },
            
            _makeList: function() {
            	return SearchResultListTpl({
                    search_results: this._parseSearchResults(), 
                    msg: {"no_matched": calLang["검색어와 일치하는 일정이 없습니다"]}
                });
            },
            
            _renderMoreButton: function() {
            	if (!this.collection.page.lastPage) {
            		this.$('#searchMoreButton').show();
            	} else {
            		this.$('#searchMoreButton').hide();
            	}
            },
            
            _bindScrollEvent: function() {
            	var self = this;
            	$(window).unbind('scroll.board');
				$(window).bind('scroll.board', function (ev) {
					 d_height = $(document).height(); 
					 w_height = $(window).height();  
					 s_height = d_height - w_height;
					 d_top = $(document).scrollTop(); 
					 if ((s_height - d_top) < 2) {
						 if(self.$el.find('div.bottom_action').is(':visible')){
							 self._showMore();
						 }
					 }
				});
            },
            
            reload: function() {
                this.$el.find(".tb_search_result").empty();
                this.render();
            }, 
            
            getResultCount: function() {
                return this.collection.length;
            }, 

            _prepareTemplate: function() {
                this.$el.empty();
                var template = SearchResultTpl(_.extend({
                    "detail_search?": this.collection.isDetailSearch(), 
                    "keyword": this._parseKeyword()
                }, tvars));
                this.$el.append(template);
                return this;
            }, 

            _parseKeyword: function() {
                var keyword = null;
                if(this.collection.isDetailSearch()) {
                    keyword = {
                        'summary': commonLang["전체"], 
                        'attendees': commonLang["전체"], 
                        'period': commonLang["전체"]
                    };
                    if(this.collection.getSummary()) keyword['summary'] = this.collection.getSummary();
                    if(this.collection.getAttendees()) keyword['attendees'] = this.collection.getAttendees();
                    if(this.collection.getFromDate() && this.collection.getToDate()) {
                        keyword['period'] = [GO.util.shortDate(this.collection.getFromDate()), GO.util.shortDate(this.collection.getToDate())].join(" ~ ");
                    }
                } else {
                    keyword = this.collection.getKeyword();
                }

                return keyword;
            }, 

            _parseSearchResults: function() {
                var results = this.collection.toJSON();

                _.map(results, function(model, i) {
                    model['event_date'] = GO.util.basicDate2(model.startTime);
                    if(model.timeType === 'allday') {
                        model['event_time'] = calLang["종일일정"];
                    } else {
                        var from = GO.util.hourMinute(model.startTime), 
                            to = GO.util.isSameDate(model.startTime, model.endTime) ? GO.util.hourMinute(model.endTime) : calLang["계속"];
                        model['event_time'] = [from, to].join(" ~ ");
                    }
                    model['calendarId'] = Backbone.$.trim(model.calendarId);
                }, this);

                return results;
            }, 

            _goToEvent: function(e) {
                e.preventDefault();
                var $target = $(e.currentTarget);
                GO.router.navigate(["calendar", $target.attr("data-calendar-id"), "event", $target.attr("data-id")].join("/"), {trigger: true, pushState: true});
                return this;
            }
        });

        return SearchResultView;
    });
}).call(this);
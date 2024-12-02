(function() {
    define([
        "backbone", 
        "app"
    ], 

    function(
        Backbone, 
        GO
    ) {
        var SearchResult = GO.BaseModel.extend({
        });

        var SearchResults = GO.BaseCollection.extend({
            
        	model: SearchResult, 
            url: function() {
                this.conditionValidate();
                return "/api/search/calendar?" + $.param(this.conditions);
            }, 

            initialize: function() {
                this.conditions = {
                    type: 'all', 
                    page: 0, 
                    offset: 20
                };
            }, 

            conditionValidate: function() {
                if(!this.conditions.stype) throw new Error("'stype' 파라미터는 필수입니다.");
                if(this.conditions.stype === 'simple' && !this.conditions.keyword) throw new Error("'simple'타입 검색에는 'keyword' 속성이 필요합니다.");
                return true;
            }, 

            getConditions: function() {
                return this.conditions;
            }, 

            setSearchType: function(stype) {
                this.conditions['stype'] = stype;
                return this;
            }, 

            getSearchType: function() {
                return this.conditions['stype'];
            }, 

            isDetailSearch: function() {
                return !!(this.conditions['stype'] === 'detail');
            }, 

            setKeyword: function(keyword) {
                this.conditions['keyword'] = keyword;
                return this;
            }, 

            getKeyword: function() {
                return this.conditions['keyword'] ? this.conditions['keyword'] : null;
            }, 

            setSummary: function(summary) {
                this.conditions['summary'] = summary;
                return this;
            }, 

            getSummary: function() {
                return this.conditions['summary'] ? this.conditions['summary'] : null;
            }, 

            setType: function(type) {
                this.conditions['type'] = type;
                return this;
            }, 

            getType: function() {
                return this.conditions['type'];
            }, 

            setAttendees: function(attendees) {
                this.conditions['attendees'] = attendees;
                return this;
            }, 

            getAttendees: function() {
                return this.conditions['attendees'] ? this.conditions['attendees'] : null;
            }, 

            setFromDate: function(datetime) {
                this.conditions['fromDate'] = GO.util.toISO8601(datetime);
                return this;
            }, 

            getFromDate: function() {
                return this.conditions['fromDate'];
            }, 

            setToDate: function(datetime) {
                this.conditions['toDate'] = GO.util.toISO8601(datetime);
                return this; 
            }, 

            getToDate: function() {
                return this.conditions['toDate'];
            }, 

            setPage: function(page) {
                this.conditions['page'] = page;
                return this;
            }, 

            getPage: function() {
                return this.conditions['page'];
            }, 

            setOffset: function(offset) {
                this.conditions['offset'] = offset;
                return this;
            }, 

            getOffset: function() {
                return this.conditions['offset'];
            }, 

            parseQueryString: function() {
                var qs = GO.router.getSearch();
                this.conditions = _.extend(this.conditions, qs);
                return this;
            }
        });

        return SearchResults;
    });
}).call(this)
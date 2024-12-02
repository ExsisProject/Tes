define("works/views/mobile/app_home_filter", function(require) {
	
	var worksLang = require("i18n!works/nls/works");
	var Filter = require("works/components/filter/models/filter");
	var WorksUtil = require('works/libs/util');
	var Conditions = require("works/components/filter/collections/filter_conditions");

	var SearchTemplate = Hogan.compile([
		'<div class="critical">',
			'<div class="filter_search">',
				'<input type="text" class="txt" id="searchFilterText" placeholder="{{searchText}}">',
				'<button type="submit" class="btn_search"><span class="ico_sch_submit"></span></button>',
			'</div>',
		'</div>',
		'<div class="optional">',
			'<div class="btn_submenu">',
				'<select name="filterSelector" style="width:100px;"></select>',
			'</div>',
		'</div>'
	].join(""));

	return Backbone.View.extend({

		el : "#filterSection",
		
		initialize : function(options) {
			var self = this;
			this.appletId = options.appletId;
			this.filterId = options.filterId;
			
			this.filters = options.filters;

			this.baseFilters = this.filters.getBaseFilters();
			this.mineFilters = this.filters.getMineFilters();

			$.when(this.baseFilters.fetch(), this.mineFilters.fetch()).then($.proxy(function() {
				this._renderFilters();
			}, this));

			this.fields = options.fields;

			this._initFilter(this.filterId);
			this.filter.fetch({
				success : function(){
					self._onSyncFilter(true);
				},
				statusCode: {
                    404: function() {self._onSyncFilter();} // 에러가 나면 튕기는거 임시 코딩.
                }
			});

			this.conditions = new Conditions(this.filter.get("conditions"));
		},

		render : function() {
			this.$el.html(SearchTemplate.render({searchText : worksLang['텍스트 검색']}));
			return this;
		},
		
		events : {
			"change select[name='filterSelector']" : "_onChangeFilter",
			"vclick .btn_search" : "_onClickSearch",
            "keyup #searchFilterText" : "_keyUpSearch"
		},

        _keyUpSearch : function(e){
		    if(e.keyCode === 13){
                this._onClickSearch();
            }
        },

		_onClickSearch : function(){
			this.filter.set('searchKeyword',$.trim(this.$("#searchFilterText").val()));
			this._search();
		},
		
		_renderFilters : function() {
			var template = Hogan.compile('<option value="{{id}}" {{#selected}}selected{{/selected}}>{{name}}</option>');
			var $select = this.$('select[name="filterSelector"]');
			$select.find("option").remove();
			$select.append(template.render({id : '', name : worksLang['기본 필터'] + ' ---'}));
			$select.append(template.render({id : 'all', name : worksLang['모든 데이터']}));
			$select.append(template.render({id : 'createdBy', name : worksLang['내가 등록한 데이터']}));

			this.baseFilters.each(function(filter) {
				$select.append(template.render({id : filter.id, name : filter.get('name')}));
			}, this);
			if (this.mineFilters.length) $select.append(template.render({id : '', name : worksLang['개인 필터'] + ' ---'}));
			this.mineFilters.each(function(filter) {
				$select.append(template.render({id : filter.id, name : filter.get('name')}));
			}, this);
			if (this.filterId) $select.val(this.filterId);
			WorksUtil.saveFilterStorage("works/applet/" + this.appletId + "/filter/mobile", this.filterId); //최초에 store에 저장해준다.
		},
		
		_onChangeFilter : function(){
			this.$("#searchFilterText").val('');
			var selectedFilterId = this.$('select').val();
			if (!selectedFilterId) return;
			WorksUtil.saveFilterStorage("works/applet/" + this.appletId + "/filter/mobile", selectedFilterId);
			this._initFilter(selectedFilterId);
			if (selectedFilterId === "all") {
				this.conditions.reset([]);
				this._search();
			} else {
				this.filter.fetch({
					success : $.proxy(function(){
						this._onSyncFilter(false); //필터를 바꾸면 무조건 1페이지로 가게 함
					}, this)
				});
			}
		},
		
		_initFilter : function(data) {
			var filterOption = {appletId: this.appletId};
			if (data === 'createdBy') {
				this.filter = new Filter(_.extend(filterOption, Filter.getCreatedByFilterOptions()));
			} else {
				if (parseInt(data) > 0) filterOption['id'] = parseInt(data);
				this.filter = new Filter(filterOption);
			}
		},
		
		_onSyncFilter : function(useStorePage) {
			this.conditions.reset(this.filter.get("conditions"));
			this.conditions.mergeFromFields(this.fields.toJSON());
			this.fields.mergeFromConditions(this.conditions.toJSON());
			this.filter.set('conditions', this.conditions.toJSON()); // condition 엔 valueType 이 없기 때문에 field 가 merge 된 condition 을 다시 set 해야 한다.
			this._search(useStorePage);
		},

		_search : function(useStorePage){
			this.$el.trigger("searchByFilter", {
				queryString : this.filter.getSearchQuery(this.conditions),
				useStorePage : !!useStorePage 
			});
		}
	});
});
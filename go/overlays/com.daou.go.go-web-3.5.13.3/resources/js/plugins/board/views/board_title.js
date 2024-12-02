define([
    "jquery", 
    "backbone", 
    "app", 
    "hgn!board/templates/board_title", 
    "i18n!board/nls/board", 
    "i18n!nls/commons", 
    "board/views/detail_search_layer",
    "dashboard/views/search/detail_search_popup",
    "jquery.go-sdk", 
    "jquery.go-validation", 
    "jquery.placeholder"
],

function(
    $, 
    Backbone, 
    App, 
    boardTitleTpl, 
    boardLang, 
    commonLang, 
    DetailSearch,
    totalSearchView
) {	
	var instance = null,	
		tplVar = {
			'favorite' : commonLang['즐겨찾기'],
			'search_detail' : commonLang['상세검색'],
			'search' : commonLang['플레이스홀더검색'],
			'searchtitle' : commonLang['검색'],
			'total' : commonLang['전체'],
			'postCount' : boardLang['총 0건'],//arg1
			'alert_keyword' : commonLang['검색어를 입력하세요.'],
			'alert_length' : boardLang['0자이상 0이하 입력해야합니다.'],
			'alert_date' : commonLang['날짜를 지정하세요.'],
			'search_result' : commonLang['검색결과'],
			'add' : boardLang['추가하기'],
			'clean' : boardLang['해제하기'],	
			'app_search' : commonLang["앱검색"],
			'unified_search' : commonLang["통합검색"],
			'detail' : commonLang['상세']
		};

	var BoardTitle = Backbone.View.extend({
		
		unbindEvent: function() {
			this.$el.off("click", "#boardFavorite");
			this.$el.off("click", "#detailSearch");
			this.$el.off("click", "#simpleSearch");
			this.$el.off("keydown", "#simpleInput");
			//this.$el.off("keydown", "#detail_title");
		}, 
		
		bindEvent: function() {				
			this.$el.on("click", "#boardFavorite", $.proxy(this.favoriteBoard, this));
			this.$el.on("click", "#detailSearch", $.proxy(this.detailSearch, this));
			this.$el.on("click", "#simpleSearch", $.proxy(this.simpleSearch, this));
			this.$el.on("keydown", "#simpleInput", $.proxy(this.simpleInputKeyEvent, this));
			//this.$el.on("keydown", "#detail_title", $.proxy(this.detailInputKeyEvent, this));
		},

		events : {

		},
		initialize: function(options) {
			this.options = options || {};
		},
		detailInputKeyEvent : function(e){
			if(e.keyCode == 13){
				this.searchAction();
			}
		},
		simpleInputKeyEvent : function(e){
			if(e.keyCode == 13){
				this.simpleSearch();
			}
		},
		render: function() {
			
			this.unbindEvent();
			this.bindEvent();
			this.el = this.options.el;
			this.dataset = this.options.dataset;
			this.isCommunity = this.options.isCommunity || false;
			var isCommunity = this.isCommunity;
			this.$el.html(boardTitleTpl({
				'dataset' : this.dataset,
				'postCount?' : function() {
					if(this.dataset.hasOwnProperty('postCount')) return true;
					return false;
				},
				'isCommunity?' : function() {
					return (this.dataset.hasOwnProperty('masterOwner') && this.dataset.masterOwner.ownerType == 'Community');
				},
				'isDepartment?' : function() {
					return (this.dataset.hasOwnProperty('masterOwner') && this.dataset.masterOwner.ownerType == 'Department');
				},
				'postCountParser' : function() {
					return App.i18n(tplVar['postCount'], "arg1", this.dataset.postCount == "" ? 0 : this.dataset.postCount);
				},
				lang:tplVar,
				appSearchName : function() {
					return isCommunity ? commonLang['커뮤니티'] : commonLang['게시판'];
				}
			}));
            if(!_.isUndefined(this.dataset.masterOwner)){
                var deptInfoTpl = Hogan.compile(this.dataset.masterOwner.ownerInfo.replace(/\|/g, '<span class="part">/</span>'));
                this.$el.find(".from").append(deptInfoTpl.render());
            }
			$('input[placeholder]').placeholder();
			
			return this.el;
		},
		simpleSearch : function(e){
			if(e) e.preventDefault();
			var keywordEl = $('#simpleInput'),
				keyword = $.trim($('#simpleInput').val());
			
			if(keyword == '' /*|| keyword == keywordEl.attr('placeholder')*/ ){
				$.goError(tplVar['alert_keyword']);
				keywordEl.focus();
				return;
			}
			
			if(!$.goValidation.isCheckLength(2,64,keyword)){
				$.goMessage(App.i18n(tplVar['alert_length'], {"arg1":"2","arg2":"64"}));
				return;
			}
			
			if($.goValidation.isInValidEmailChar(keyword)){
				$.goMessage(commonLang['메일 사용 불가 문자']);
				return;
			}
			
			var startAt = GO.util.toISO8601('1970/01/01');
			var endAt = GO.util.toISO8601(new Date());
			
			var param = {
					stype : 'simple',
					keyword : keyword,						
					fromDate : startAt,
					toDate : endAt,
					isCommunity : this.isCommunity,
					searchType : 'simple',
			};
			var searchType = $('#searchType').val();
			if(searchType == "appSearch"){
				App.router.navigate((this.isCommunity ?'community':'board')+'/search?' + this._serializeObj(param), true);
			}else{
				param.offset = 5;
				param.page = 0;
				param.searchTerm = "all";
				delete param.searchType;
				App.router.navigate('unified/search?'+this._serializeObj(param), true);
			}
		},
		detailSearch : function(e){
			var searchType = $('#searchType').val();
			if(searchType != "appSearch"){
				this.detailPopup(e);
				return;
			}
			
			var targetOffset = $(e.currentTarget).offset();
			var _this = this;
			$.goSearch({
				header : tplVar['search_detail'],
				modal:true,
				offset : {
					top : parseInt(targetOffset.top+30, 10),
					right : 7
				},
				callback : function() {
					_this.searchAction();
				}
			});
			DetailSearch.render({isCommunity:this.isCommunity,callback:this.searchAction});
		},
		searchAction : function(e){
			
			if(e) e.preventDetail();
			
			var stext = $.trim($('#stext').val());
			var writer = $.trim($('#detail_writer').val());
			var boardSelect = $('.go_popup #select_board');
			var boardIds = [];
			var boardName = [];
			
			if(stext == "" && writer == ""){
				$.goError(tplVar['alert_keyword'], $('#searchMessage'));
				return;
			} else {
				$.goError('', $('#searchMessage'), true);
			}
			
			var inputData = [writer,stext]; 
			
			for(var i=0 ; i<inputData.length ; i++){
				if(inputData[i] != ''){
					if(!$.goValidation.isCheckLength(2,64,inputData[i])){
						$.goError(App.i18n(tplVar['alert_length'], {"arg1":"2","arg2":"64"}));
						return;
					}
					if($.goValidation.isInValidEmailChar(inputData[i])){
						$.goMessage(commonLang['메일 사용 불가 문자']);
						return;
					}
				}
			}
			
			var isChecked = false;
			$('input[type=checkbox]').each(function() {
				if(this.checked) isChecked = true;
		    });  
			
			if(stext && !isChecked){
				$.goError(commonLang['검색어 구분을 선택해주세요.']); 
				return;
			}
			if(boardSelect.val() == "all"){
				$.each($('.go_popup #select_board option[data-bbstype]'),function(k,v) {
					boardIds.push(v.value);
					boardName.push(v.text);
				});
			}else{
									
				boardIds.push(boardSelect.val());
				boardName.push(boardSelect.val() ? boardSelect.children("option:selected").text() : '');
				
			}	
			
			var searchTerm = $('input:radio[name="searchType"]:checked').val();
			var startAt, endAt, startEl, endEl, dateValidation = 0;
			var allSearch = false;
			
			if(searchTerm == "detail_term_all"){ //전체
				var currentDate = GO.util.shortDate(new Date());
				startAt = GO.util.toISO8601('1970/01/01');
				endAt = GO.util.searchEndDate(currentDate);
				allSearch = true;
				
			}else if(searchTerm == "detail_term_custom"){ //달력선택
				
				startEl = $('#searchStartDate'),
				endEl = $('#searchEndDate');
				
				if(!startEl.val()) {
					dateValidation++;
					$.goError(tplVar['alert_date'], startEl.parents('.wrap_dateselect'));
					startEl.addClass('error');
				} else {
					startEl.removeClass('error');
				}
				if ( !endEl.val()) {
					dateValidation++;
					$.goError(tplVar['alert_date'], endEl.parents('.wrap_dateselect'));
					endEl.addClass('error');
				} else {
					endEl.removeClass('error');
				}
				
				if(dateValidation > 0) return false;
				
				startAt = GO.util.toISO8601(startEl.val());
				endAt = GO.util.searchEndDate(endEl.val());
				
			}else{ //1주일,2주일,1개월
				var currentDate = GO.util.shortDate(new Date());
				var target = $('input:radio[name="searchType"]:checked');
				var key = target.attr('data-key');
				var amount = target.attr('data-amount');
				
				startAt = GO.util.calDate(currentDate,key,amount);
				endAt =  GO.util.searchEndDate(currentDate);
			}
			
			GO.EventEmitter.trigger('common', 'layout:setOverlay', true);

			var param = {
					stype : 'detail',
					content : $("#detail_content").attr('checked') ? stext : '',
					comments : $("#detail_comment").attr('checked') ? stext : '',
					attachFileNames : $("#detail_attachFileName").attr('checked') ? stext : '',
					attachFileContents : $("#detail_attachFileContents").attr('checked') ? stext : '',
					userName : writer,
					boardIds : boardIds,
					fromDate : startAt,
					toDate : endAt,
					searchType : 'detail',
					boardName : boardName.join(','),
					isCommunity : this.isCommunity,
					allSearch : allSearch
			};
			
			var searchType = $('#searchType').val();
			if(searchType == "appSearch"){
				App.router.navigate((this.isCommunity ?'community':'board')+'/search?' + this._serializeObj(param), true);
			}else{
				App.router.navigate('unified/search?'+this._serializeObj(param), {trigger: true, pushState:true});
			}
		},
		search : function(param) {
			var searchType = $('#searchType').val();
			if(searchType == "appSearch"){
				App.router.navigate((this.isCommunity ?'community':'board')+'/search?' + this._serializeObj(param), true);
			}else{
				App.router.navigate('unified/search?'+this._serializeObj(param), {trigger: true, pushState:true});
			}
		},
		_serializeObj : function(obj) {
			var str = [];
			for(var p in obj) {
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			}
			return str.join("&");
		},
		favoriteBoard : function(e) {
			
			this.favoriteModel = this.options.favoriteModel;
			
			var self = this,
			eventTarget = $(e.currentTarget),
			successCallback = function(model, rs) {
				if(rs.code == 200) {
					if(rs.favorite) {
						eventTarget.removeClass('ic_star_off').attr('title',tplVar.favorite+" "+tplVar.clean);
					} else {
						eventTarget.addClass('ic_star_off').attr('title',tplVar.favorite+" "+tplVar.add);
					}
					self.dataset.favorite = rs.favorite;
					GO.EventEmitter.trigger('board', 'changed:favorite', true);
				}
			};		
			
			this.favoriteModel.set({ boardId : this.dataset.id, id : this.dataset.id}, {silent: true});
			if(!this.dataset.favorite) {
				this.favoriteModel.save({},{
					type : 'POST',
					success : function(model, rs) {
						rs.favorite = true;
						successCallback(model, rs, true); 
					}
				});
			} else {
				this.favoriteModel.destroy({
					success : function(model, rs) {
						rs.favorite = false;
						successCallback(model, rs); 
					}
				});
			}
		},
		detailPopup : function(e) {
			var self = this;
			var detailSearchPopupView = new totalSearchView();
			var targetOffset = $(e.currentTarget).offset();
			
			this.searchPopup = $.goSearch({
                modal : true,
                header : commonLang["상세검색"],
                offset : {
					top : parseInt(targetOffset.top + 30, 10),
					right : 7
				},
				callback : function() {
					if (detailSearchPopupView.validate()) 
						self.search(detailSearchPopupView.getSearchParam());
				}
            });
			
			this.searchPopup.find(".content").html(detailSearchPopupView.el);
			detailSearchPopupView.render();
		}
	}, {
		/**
		 * @deprecated
		 */
		render: function(options) {
			instance = new BoardTitle(options);
			instance.render();
			return instance;
		}
	});
	
	return BoardTitle;
});
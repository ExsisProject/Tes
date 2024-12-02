(function() {
	define([
        // 필수
    	"jquery",
		"underscore", 
        "backbone", 
        "app",
        "approval/views/document/actcopy_detail",
        "hgn!approval/templates/document/actcopy_list",
		"i18n!nls/commons",
        "i18n!approval/nls/approval",
        "jquery.jstree"
    ], 
    
    function(
        $,  
		_, 
        Backbone, 
        App,
        ActCopyDetailView,
        ActCopyLayerTpl,
        commonLang,
		approvalLang
    ) {	
		var ActCopyModel = Backbone.Model.extend({
			initialize: function(options) {
			    this.options = options || {};
			},
			url: function() {
				return "/api/approval/actcopyform/" + this.id;
			},
			getYear: function() {
				var preserveDurationInYear = this.attributes.preserveDurationInYear;
				if (preserveDurationInYear == 0) {
					return approvalLang['영구'];
				} else {
					return App.i18n(commonLang["{{arg1}}년"],{arg1 : preserveDurationInYear});
				}
			},
			setId: function(id){
				this.id = id;
			}
		});
		
		var ActCopyList = Backbone.Collection.extend({
			initialize: function(options) {
			    this.options = options || {};
			},
			model : Backbone.Model.extend(),
			setKeyword : function(keyword){
				this.keyword = keyword
			},
			url: function() {
				if(_.isUndefined(this.keyword) || _.isEmpty(this.keyword)){
					return "/api/approval/actcopyform";
				}else{
					return "/api/approval/actcopyform?" + $.param({keyword : this.keyword});
				}
			}
		});
		
			lang = {
				'상세정보' : approvalLang['상세정보'],
 				'양식제목' : approvalLang['양식제목'],
				'문서분류' : approvalLang['문서분류'],
				'보존연한' : approvalLang['보존연한'],
				'설명' : approvalLang['설명'],
				'검색' : commonLang['검색'],
				'양식명' : approvalLang['양식명']
			};
		
		var ActCopyLayerView = Backbone.View.extend({
    		el : ".go_popup .content",
		
			events: {
				'click span.txt' : 'selectedForm',
				'keyup #actcopySearchKeyWord' : 'searchActcopyByKeyword'
			},
	    	
    		initialize: function(options) {
    		    this.options = options || {};
    			this.model = new ActCopyModel();
    			this.collection = new ActCopyList();
    			this.collection.fetch({async : false});
    		},
    		
	    	render : function(){
				var tpl = ActCopyLayerTpl({
					lang : lang
				});
				this.$el.html(tpl);
				this.renderActCopyList();
	    		this.$el.find('input[placeholder]').placeholder();
    		},
    		
    		renderActCopyList : function(){
    			var dataset = this.collection.toJSON();
    			var ActCopyListTpl = Hogan.compile(["{{#dataset}}",
							'<li class="folder">',
								'<p class="title">',
									'<a><ins class="ic"></ins><span data-id="{{id}}" class="txt">{{name}}</span></a>',
								'</p>',
							'</li>',
							'{{/dataset}}'].join(''));
                var NullTpl = Hogan.compile([
                                         '<p class="data_null"><span class="ic_data_type ic_no_part"></span>{{msg_no_search_result}}</p>',
                                     ].join(''));
    			if(this.collection.length > 0){
    				this.$el.find('#actCopyList').html(ActCopyListTpl.render({dataset : dataset}));
    			}else{
    				this.$el.find('#actCopyList').html(NullTpl.render({'msg_no_search_result': approvalLang["자료가 없습니다"]}));
    			}
    		},
    		
    		searchActcopyByKeyword : function(e){
    			var keyword = $(e.currentTarget).val();
    			this.collection.setKeyword(keyword);
    			
    			this.collection.fetch({async : false});
    			this.renderActCopyList();
    			
    		},
    		
    		selectedForm: function(e){
    			var actCopyDetailView = new ActCopyDetailView();
    			var selectedEl = $(e.currentTarget).parents('p.title');
    			this.$el.find('.on').removeClass('on');
    			selectedEl.addClass('on');
    			
    			var actCopyId = $(e.currentTarget).attr('data-id');
    			
    			this.model.setId(actCopyId);
    			this.model.fetch({async:false});
    			
    			actCopyDetailView.render(this.model);
    		},
    		
	    	release: function() {
				this.$el.off();
				this.$el.empty();
			}
		});

		return ActCopyLayerView;
		
	});
	
}).call(this);
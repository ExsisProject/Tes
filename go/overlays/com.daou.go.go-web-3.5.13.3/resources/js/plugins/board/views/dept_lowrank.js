// 하위부서 게시판 목록
(function() {
	define([
	    // libraries...
	    "jquery",
	    "backbone", 	
	    "app",
	    
	    "board/views/board_title",
	    "board/collections/board_menu_target_lowrank",
	    "hgn!board/templates/dept_lowrank",
	    
	    "i18n!nls/commons",
	    "i18n!board/nls/board",
	    "jquery.go-grid",
	    "GO.util"
	], 
	function(
		$,
		Backbone,
		App, 
				
		BoardTitleView,
		MenuTargetCollection,
		tplLowrank,
		
		commonLang,
		boardLang
	) {
		var instance = null,
			lang = {
				'dept_low_rank' : boardLang['하위부서 게시판 조회'],
				'dept_low_rank_all' : boardLang['하위부서 전체'],
				'dept_name' : boardLang['부서명'],
				'board_name' : commonLang['게시판'],
				'board_manager' : boardLang['운영자'],
				'board_post_count' : boardLang['게시글 수'],
				'board_created_at' : boardLang['개설일'],
				'board_setting' : commonLang['설정'],
				'board_public' : commonLang['비공개'],
				'board_list_null' : boardLang['등록된 게시판이 없습니다.'],
				'normal' : commonLang['정상'],
				'stop' : commonLang['중지']
		};
		var lowRankView = Backbone.View.extend({
			initialize: function() {
				this.$el.off();
				this.targetMeuCollction = null;
				this.type = "ACTIVE";
			},
			events : {
				'change select#lowDeptSelect' : 'deptFilter',
				'click #tabMenu li' : 'changeTab'
			},
			render : function() {
				this.$el.html(tplLowrank({
					lang : lang
				}));
				
				this.renderList();
				
				BoardTitleView.render({
					el : '.content_top',
					dataset : {
						name : lang['dept_low_rank'] 
					}
				});
				
				
				return this.el;
			},
			renderList : function() {
				var self = this, 
					searchParams = App.router.getSearch(),
					url = GO.contextRoot + 'api/department/lowrank/board/' + this.type;
				
				this.boardList = $.goGrid({
					el : '#lowRankList',
					url : url,
					bDestroy : true,
					defaultSorting : [[0, 'asc']],
					emptyMessage : lang['board_list_null'],
					columns : [
			            {
			            	mData : 'deptName', sWidth: '200px', bSortable: true
			            },
			            { 
			            	mData : 'name', sClass : 'align_l', bSortable: true, fnRender: function(obj) {
			            		var title =  ['<a href="'+GO.contextRoot+'app/board/'+obj.aData.id+'">'];
			            		if(obj.aData.publicFlag) title.push('<span class="ic_classic ic_lock" title="'+lang['board_public']+'"></span>&nbsp;');
			            		title.push(obj.aData.name,'</a>');
			            		
			            		//{{#publicFlag}}private{{/publicFlag}}
			            		return title.join('');
			            	} 
			            },
			            {
			            	mData : null , bSortable: false, fnRender : function(obj) {
			            		var managerNames = [];
			            		$(obj.aData.managers).each(function(k,v) {
			            			managerNames.push(v.name + v.positionName);
			            		});
			            		return managerNames.join(', ');
			            	}
			            },
			            { 
			            	mData : 'postCount', sWidth: '100px', bSortable : true 
			            },
			            { 
			            	mData : 'createdAt', sWidth: '150px', bSortable : true, fnRender : function(obj) {
			            		return GO.util.basicDate(obj.aData.createdAt);
			            	}  
			            },
			            {
			            	mData : null, sWidth: '70px', bSortable : false, fnRender : function(obj) {
			            		var tpl = [
            		                '<span class="btn_border">',
            		                    '<a href="' +  GO.contextRoot + 'app/board/' + obj.aData.id + '/admin" title="' + lang['board_setting'] + '">',
            		                    	'<span class="ic_classic ic_setup"></span>',
        		                    	'</a>',
    		                    	'</span>'
        		                ];
			            		return tpl.join('');
			            	}
			            }
			        ],
			        fnDrawCallback : function(tables, oSettings, listParams) {
			        	if(!self.$el.find('select#lowDeptSelect').length) {
			        		self.renderTargetMenu();
			        	}
			        }
				});
			},
			renderTargetMenu : function() {
				var menuTpl = ['<select id="lowDeptSelect" style="margin-top:2px">','<option value="">', lang['dept_low_rank_all'] ,'</option>'],
					data = [];
				
				if(this.targetMeuCollction == null) this.targetMeuCollction = MenuTargetCollection.getCollection();
				data = this.targetMeuCollction.toJSON();
				$(data).each(function(k,v) {
					menuTpl.push('<option value="'+v.id+'">');
					for(var i=0; i<v.depth; i++) {
						menuTpl.push('-');
					}
					menuTpl.push(v.name+'</option>');
				});
				this.$el.find('.tool_bar .custom_header').html(menuTpl.join(''));			
			},
			deptFilter : function(e) {
				var deptId = $(e.currentTarget).val(),
					url = GO.contextRoot + 'api/department/lowrank/board/'+ this.type +'?deptId='+deptId;
				
				this.boardList.tables.fnSettings().sAjaxSource = url;
				this.boardList.tables.fnDraw(this.boardList.tables.fnSettings());				
			},
			changeTab : function(e){
			    var currentEl = $(e.currentTarget);
			    
			    currentEl.parents("ul:first").find("li").removeClass("active");
			    currentEl.addClass("active");
			    
			    this.type = currentEl.attr("data-type");
			    this.renderList();
			}
		});
		
		return {
			render: function(opt) {
				instance = new lowRankView({ el : '#content' });
				instance.render();
			}
		};
	});
}).call(this);
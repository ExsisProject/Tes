define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!admin/templates/user_cert_list",
    "admin/collections/position_list",
    "i18n!nls/commons",
    "i18n!admin/nls/admin",
    "jquery.go-sdk",
    "GO.util",
    "jquery.go-popup",
    "jquery.go-grid"
], 

function(
	$, 
	Backbone,
	App, 
	layoutTpl,
	positionCollection,
	commonLang,
	adminLang
) {
	var lang = {
			'use_cert_list' : adminLang['인증서 사용 계정'],
			'unuse_cert_list' : adminLang['인증서 비사용 계정'],
			'goto_unuse' : adminLang['인증서 비사용 계정으로 변경'],
			'goto_use' : adminLang['인증서 사용 계정으로 변경'],
			'name' : commonLang['이름'],
			'position' : adminLang['직위'],
			'email' : commonLang['이메일'],
			'registedate' : adminLang['인증서 등록일'],
			'search' : commonLang['검색']
			
	};
	var instance = null;
	var userCertList = Backbone.View.extend({
		el:'#certListPage',
		unbindEvent: function() {
			this.$el.off("click", "#tabControll li");
			this.$el.off("change", "#position");
			this.$el.off("click", "span.btn_search");
			this.$el.off("keydown", "span.search_wrap input");
			this.$el.off("click", "span#goto_unuse");
			this.$el.off("click", "span#goto_use");
		}, 
		bindEvent : function() {
			this.$el.on("click", "#tabControll li", $.proxy(this.changeTab, this));
			this.$el.on("change", "#position", $.proxy(this.positionFilter, this));
			this.$el.on("click", "span.btn_search", $.proxy(this.search, this));
			this.$el.on("keydown", "span.search_wrap input", $.proxy(this.searchKeyboardEvent, this));
			this.$el.on("click", "span#goto_unuse", $.proxy(this.goToUnUseCert, this));
			this.$el.on("click", "span#goto_use", $.proxy(this.goToUseCert, this));
		},
		initialize: function() {			
			this.unbindEvent();
			this.bindEvent();
			this.type = "USE";
			this.positions = positionCollection.getCollection();
		},
		render : function(type) {
			this.dataTable = null;
			
			var isUse = function(){
				if(type == 'USE'){
					return true;
				}
				return false;
			};
			
			var tmpl = layoutTpl({
				positions : this.positions.toJSON(),
				isUse:isUse,
				lang:lang
			});			
			
			this.$el.html(tmpl);
			this.renderDataTables();
		},
		renderDataTables : function() {
			var self = this;
			this.dataTable = $.goGrid({
				el : '#certDataTable',
				method : 'GET',
				destroy : true,
				url : GO.contextRoot + 'ad/api/cert/user/' + this.type,
				emptyMessage : "<p class='data_null'> " +
	                "<span class='ic_data_type ic_no_data'></span>" +
	                "<span class='txt'>"+adminLang["등록된 계정이 없습니다."]+"</span>" +
	                "</p>",
				defaultSorting : [[ 1, "asc" ]],
				sDomType : 'admin',
				checkbox : true,
                checkboxData : 'id',
                displayLength : App.session('adminPageBase'),
				params : {
					'page' : this.page,
					'offset' : this.offset
				},
				columns : [
		            { mData : "name",sClass:"title", bSortable: true},
		            { mData : "position", sClass: "align_c" ,sWidth : "200px",bSortable: false},
		    	    { mData : "email",sClass:"title" ,bSortable: true},
		    	    { mData: null, sClass: "align_c", sWidth : "200px",bSortable: false, fnRender : function(obj) {
		    	    	if(obj.aData.registeredDate == null || obj.aData.registeredDate == ''){
			        		   return commonLang['없음'];
			        	}
		    	    	return GO.util.basicDate(obj.aData.registeredDate);
		    	    }}		    	    
		        ],
		        fnDrawCallback : function(tables, oSettings, listParams) {
		        	self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
		        }
			});
		},
        positionFilter : function(e){
            this.changeFilter(e, "positionFilter");
        },
        changeFilter : function(e , key){
        	var value = $(e.currentTarget).val();
        	console.log(this.dataTable.tables.setParam);
            if(typeof this.dataTable.tables.setParam == 'function') {
                this.dataTable.tables.setParam(key,value);
            }
        },
        search : function() {
			var searchForm = this.$el.find('.table_search input[type="text"]'),
				keyword = searchForm.val();		
			
			this.dataTable.tables.search(this.$el.find('.table_search select').val(), keyword, searchForm);
		},
		searchKeyboardEvent : function(e) {
			if(e.keyCode == 13) {
				this.search();
			}
		},
		changeTab : function(e){
		    var currentEl = $(e.currentTarget);
		    this.type = currentEl.attr("data-type");
		    this.render(this.type);
		},
		goToUnUseCert : function(e) {
			this.changeUseCert("UNUSE");
		},
		goToUseCert : function(e) {
			this.changeUseCert("USE");
		},
		changeUseCert : function(type) {
			 var ids = this.getCheckedIds(),
		        self = this;
		    if(ids.length == 0){
		        $.goMessage(adminLang['계정을 선택하세요.']);
		        return;
		    }
		    var confirmTitle = "",
		    	confirmContent = "";
		    
		    if(type == "USE") {
		    	confirmTitle = adminLang['인증서 사용 계정으로 변경'];
		    	confirmContent = adminLang['인증서 로그인 이동 상세'];
		    } else{
		    	confirmTitle = adminLang['인증서 비사용 계정으로 변경'];
		    	confirmContent = adminLang['예외계정 이동 상세'];
		    }
		    
		    $.goConfirm(confirmTitle,  confirmContent, function() {
                $.ajax({
                    type: 'PUT',
                    async: true,
                    data : JSON.stringify({ids : ids}),
                    dataType: 'json',
                    contentType : "application/json",
                    url: GO.config("contextRoot") + 'ad/api/cert/user/' + type
                }).
                done(function(response){
                    $.goMessage(commonLang['저장되었습니다.']);
                    self.render(self.type);
                });
            });
		},
		getCheckedIds : function(){
		    var checkedEl = this.$el.find("#certDataTable input:checkbox:checked").not("#checkedAll");
		        checkedIds = [];
		        
	        checkedEl.each(function(){
	            checkedIds.push($(this).val()); 
	        });
	        
	        return checkedIds;
		}
	},{
		create: function(status) {
			instance = new userCertList();
			return instance.render("USE");
		}
	});
	
	return {
		render: function() {
			var layout = userCertList.create();
			return layout;
		}		
	};
});
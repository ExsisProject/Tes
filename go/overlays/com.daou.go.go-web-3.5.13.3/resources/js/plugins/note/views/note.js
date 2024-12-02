;(function() {
	define([
			"backbone",
			"app",
			"i18n!nls/commons",
			"hgn!note/templates/note",
			"jquery.go-grid"
	], 
	function(
			Backbone,
			App,
			commonLang,
			SendMailLayerTmpl
	) {
		var instance = null;
		
		window.reloadList = function() {
			instance.dataTable.tables.fnClearTable();
		};
		
		var lang = {
			"inbox" : commonLang["받은 쪽지함"],
			"sent" : commonLang["보낸 쪽지함"],
			"allBox" : commonLang["전체 쪽지함"],
			"write" : commonLang["쪽지 쓰기"],
			"reply" : commonLang["답장"],
			"replyAll" : commonLang["전체 답장"],
			"delivery" : commonLang["전달"],
			"delete" : commonLang["삭제"],
			"from" : commonLang["보낸사람"],
			"subject" : commonLang["제목"],
			"received" : commonLang["받은날짜"],
			"size" : commonLang["크기"],
			"empty" : commonLang["쪽지가 없습니다"],
			"totalPeriod" : commonLang["전체기간"],
			"subjectAndContent" : commonLang["제목+내용"],
			"search" : commonLang["검색"]
		};
		
		var DEFAULT_TABTYPE = "__go_note__";
		
		var LayerView = Backbone.View.extend({
			events : {
				"click #tab li" : "changeTab",
				"click table td:has(span)" : "read",
				"click a[data-btn=write]" : "write",
				"click a[data-btn=reply]" : "reply",
				"click a[data-btn=replyAll]" : "replyAll",
				"click a[data-btn=delivery]" : "delivery",
				"click a[data-btn=delete]" : "destroy",
				"click #checkAll" : "checkAll",
				"click #search" : "search",
				"change select[aria-controls]" : "setOffset"
			},
			
			initialize : function(options) {
				var search = GO.router.getSearch();
				
				this.tabType = search.tabType || DEFAULT_TABTYPE;
				this.listOption = {
					page : 0,
					offset : 10,
					tabType : this.tabType
				};
				if (search.keyWord) this.listOption.keyWord = search.keyWord;
			},
			
			render : function() {
				var tmpl = SendMailLayerTmpl({
					lang : lang
				});
				this.$el.html(tmpl);
				
				this.renderDataTable();
				this.renderButton();
				this.setSearchData();
				this.markTab();
			},
			
			
			markTab : function() {
				this.$("li[data-type]").removeClass("on");
				this.$("li[data-type='" + this.tabType + "']").addClass("on");
			},
			
			
			setSearchData : function() {
				if (this.listOption.keyWord) {
					this.$("#searchKeyword").val(decodeURIComponent(this.listOption.keyWord));
				}
			},
			
			
			getApiUrl : function() {
				return "/api/mail/note/list";
			},
			
			
			renderDataTable : function() {
				var self = this;
				var param = GO.router.getSearch();
				param.folder = this.tabType;
				this.dataTable = $.goGrid({
					el : '#messageList',
					url : this.getApiUrl(),
					params : param,
					lengthMenu : [10, 20, 30, 40],
					displayLength : GO.util.store.get("messageOffset") || 10,
					defaultSorting : [[3, "desc"]],
					method : "POST",
					emptyMessage : '<tr class="tb_option">' +
										'<td colspan="5">' +
											'<p class="desc" id="empty">' + commonLang["쪽지가 없습니다"] + '</p>' +
										'</td>' +
									'</tr>',
				    columns : [{
				    	mData : null, sClass : null, bSortable : false, fnRender : function(obj) {
				    		return '<input type="checkbox" data-id="' + obj.aData.id + '" data-seen="' + obj.aData.seen + '">';
				    	}
				    }, {
				    	mData : "fromToSimple", sClass : null, bSortable : true, fnRender : function(obj) {
				    		var name = self.tabType == DEFAULT_TABTYPE ? obj.aData.fromToSimple : obj.aData.sendToSimple;
				    		return "<span class='name'>" + name + "</span>";
				    	}, sortKey : self.tabType == DEFAULT_TABTYPE ? "from" : "to",
				    }, {
				    	mData : "subject", sClass : null, bSortable : true, fnRender : function(obj) {
				    		var attachIcon = obj.aData.flag.indexOf("T") != -1 ? '<span class="ic ic_file_s" title=""></span>' : ""; 
				    		var subject = "<span class='subject'>" + attachIcon + (obj.aData.subject || commonLang["제목없음"]) + "</span>";
				    		return subject;
				    	}, sortKey : "subj"
				    }, {
				    	mData : "dateUtc", sClass : null, bSortable : true, fnRender : function(obj) {
				    		var format;
				    		var mdate = moment(obj.aData.dateUtc);
				    		var today = new Date();
				    		if (mdate.isSame(today, 'day')) {
				    			format = 'HH:mm';
				    		} else {
				    			format = 'YY-MM-DD HH:mm';
				    		}
				    		return "<span class='date'>" + mdate.format(format) + "</span>";
				    	}, sortKey : "arrival"
				    }, {
				    	mData : "size", sClass : null, bSortable : true, fnRender : function(obj) {
				    		return "<span class='size'>" + obj.aData.size + "</span>";
				    	}
				    }],
				    fnDrawCallback : function(tables, oSettings, listParams) {
				    	self.defaultTableStyle(oSettings);
				    	self.toggleText();
				    	self.markUnRead();
				    	self.fillEmptyArea(tables);
				    	self.listOption.page = listParams.page;
				    	self.listOption.offset = listParams.offset;
				    	self.changeSearchUrl(false);
				    	self.$("select").remove();
				    }
				});
			},
			
			
			reloadDataTable : function() {
				this.dataTable.tables.fnSettings().sAjaxSource = this.getApiUrl();
	    		this.dataTable.tables.customParams = this.listOption;
	    		this.dataTable.tables.fnPageChange("first");
	    		this.dataTable.tables.fnClearTable();
	    		
	    		this.changeSearchUrl(true);
			},
			
				
			fillEmptyArea : function(tables) {
				var dataCount = tables.find("tr:not([role=row])").length;
				var emptyCount = 10 - dataCount;
				for (var int = 0; int < emptyCount; int++) {
					this.$("tbody").append('<tr class="" style="height:28px"></tr>');
				}
			},
			
			
			defaultTableStyle : function(oSettings) {
				this.$('.dataTables_paginate').css('padding-top', '43px');
				if (!oSettings.aoData.length) {
		    		this.$("#empty").parents("tr").addClass("tb_option");
		    	};
			},
			
			
			toggleText : function() {
				var nameText = this.tabType == DEFAULT_TABTYPE ? commonLang["보낸사람"] : commonLang["받는사람"];
				var addrType = this.tabType == DEFAULT_TABTYPE ? "fromaddr" : "toaddr";
				var $addrType = this.$("#addrType");
		    	this.$("#name").text(nameText);
		    	$addrType.text(nameText);
		    	$addrType.attr("value", addrType);
			},
			
			
			markUnRead : function() {
				_.each(this.$("input[data-seen=false]"), function(input) {
		    		$(input).parents("tr").addClass("read_no");
		    	});
			},
			
			
			renderButton : function() {
				var writetBtn = this.makeButton("write", true); 
				var replyBtn = this.makeButton("reply", false); 
				var replyAllBtn = this.makeButton("replyAll", false); 
				var deliveryBtn = this.makeButton("delivery", false); 
				var deleteBtn = this.makeButton("delete", false); 
			    	
		    	var btns = writetBtn + replyBtn + replyAllBtn + deliveryBtn + deleteBtn;
			    	
		    	this.$("div.critical").append(btns);
			},
			
			
			makeButton : function(key, isMajor) {
				var style = isMajor ? "btn_major_s" : "btn_minor_s";
				return '<a class="' + style + '" data-btn="' + key + '">' +
							'<span class="ic"></span>' +
							'<span class="txt">' + lang[key] + '</span>' +
						'</a>';
			},
			
			
			changeTab : function(e) {
				var target = $(e.currentTarget);
				target.siblings().removeClass("on");
				target.addClass("on");
				
				this.tabType = target.attr("data-type");
				this.listOption = {
					page : 0,
					offset : 10,
					tabType : this.tabType
				};
				this.reloadDataTable();
			},
			
			
			read : function(e) {
				var target = $(e.currentTarget).parents("tr");
				var id = target.find("input").attr("data-id");
				var param = "?uid=" + id + "&folder=" + this.tabType;
				var url = GO.contextRoot + "app/#note/read" + param;
				
				target.removeClass("read_no");
				
				this.externalSetUrl(url);
			},
			
			
			write : function() {
				var url = GO.contextRoot + "app/#note/write";
				
				this.externalSetUrl(url);
			},
			
			
			reply : function() {
				if (!this.hasChecked()) {
					this.messagePopup(commonLang["쪽지를 선택해 주세요."]);
					return;
				}
				
				if (this.isMultiCheck()) {
					this.messagePopup(commonLang["하나의 쪽지만 답장 가능합니다."]);
					return;
				}
				
				var target = this.getCheckedMessage();
				var param = "?type=reply&uids=" + target.attr("data-id") + "&folder=" + this.tabType;
				var url = GO.contextRoot + "app/#note/write" + param;
				
				this.externalSetUrl(url);
			},
			
			
			replyAll : function() {
				if (!this.hasChecked()) {
					this.messagePopup(commonLang["쪽지를 선택해 주세요."]);
					return;
				}
				
				if (this.isMultiCheck()) {
					this.messagePopup(commonLang["하나의 쪽지만 전체 답장 가능합니다."]);
					return;
				}
				
				var target = this.getCheckedMessage();
				var param = "?type=replyall&uids=" + target.attr("data-id") + "&folder=" + this.tabType;
				var url = GO.contextRoot + "app/#note/write" + param;
				
				this.externalSetUrl(url);
			},
			
			
			delivery : function() {
				if (!this.hasChecked()) {
					this.messagePopup(commonLang["쪽지를 선택해 주세요."]);
					return;
				}
				
				if (this.isMultiCheck()) {
					this.messagePopup(commonLang["하나의 쪽지만 전달 가능합니다."]);
					return;
				}
				
				var target = this.getCheckedMessage();
				var param = "?type=forward&uids=" + target.attr("data-id") + "&folder=" + this.tabType;
				var url = GO.contextRoot + "app/#note/write" + param;
				
				this.externalSetUrl(url);
			},
			
			
			destroy : function() {
				if (!this.hasChecked()) {
					this.messagePopup(commonLang["쪽지를 선택해 주세요."]);
					return;
				}
				
				var self = this;
				var callback = function() {
					var uids = [];
					_.each(self.getCheckedMessage(), function(message) {
						uids.push($(message).attr("data-id"));
					});
					var messageParam = {
						"folderNames":[self.tabType],
						"uids":uids
					};
					$.ajax({
						url : "/api/mail/message/delete",
                        dataType : "json",
                        contentType: "application/json",
						type : "POST",
						data : JSON.stringify(messageParam),
						traditional : true,
						success : function() {
							self.dataTable.tables.fnClearTable();
						},
						error : function() {
							console.log("error");
						}
					});
				};
				
				$.goPopup({
					message : commonLang["삭제하시겠습니까?"],
					modal : true,
					allowPrevPopup : true,
					pclass : "layer_confim layer_colleage layer_smallmail smail_pop",
					buttons : [{
						btext : commonLang["확인"],
						btype : 'confirm',
						callback : callback
					}, {
						btext : commonLang["취소"],
						btype : 'normal'
					}]
				});
			},
			
			
			checkAll : function(e) {
				var isChecked = $(e.currentTarget).is(":checked");
	    		this.$("tbody input[type=checkbox]").attr("checked", isChecked);
			},
			
			
			hasChecked : function() {
				return this.$("tbody input[type=checkbox]:checked").length > 0;
			},
			
			
			isMultiCheck : function() {
				return this.$("tbody input[type=checkbox]:checked").length > 1;
			},
			
			
			getCheckedMessage : function() {
				return this.$("input:checked").not("#checkAll");
			},
			
			
			getCheckedIds : function() {
				return _.map(this.getCheckedMessage(), function(message) {
					return $(message).attr("data-id");
				});
			},
			
			
			search : function() {
	    		var keyword = this.$("#searchKeyword");
	    		var searchType = this.$("#searchType");
	    		
	    		if (keyword.val().length > 64 || keyword.val().length < 2) {
	    			$.goMessage(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1 : 2, arg2 : 64}), keyword, false, true);
	    			return;
	    		}
	    		
	    		/*this.listOption["fromaddr"] = "";
	    		this.listOption["toaddr"] = "";
	    		this.listOption["category"] = "";
	    		
	    		if (searchType.val() == "fromaddr") {
	    			this.listOption["fromaddr"] = keyword.val();
	    		} else if (searchType.val() == "toaddr") {
	    			this.listOption["toaddr"] = keyword.val();
	    		} else if (searchType.val() == "sb") {
	    			this.listOption["category"] = "sb";
	    		} else if (searchType.val() == "s") {
	    			this.listOption["category"] = "s";
	    		}*/
	    		
	    		this.listOption["category"] = "sb";
	    		this.listOption["listType"] = "mail";
	    		this.listOption["adv"] = "on";
	    		this.listOption["keyWord"] = keyword.val();
	    		this.listOption["page"] = 0;
	    		
	    		this.reloadDataTable();
	    	},
	    	
	    	
	    	setOffset : function(e) {
	    		var target = $(e.currentTarget);
	    		GO.util.store.set("messageOffset", target.val(), {type : "session"});
	    	},
	    	
	    	
	    	messagePopup : function(message) {
	    		$.goPopup({
					message : message,
					modal : true,
					allowPrevPopup : true,
					pclass : "layer_confim layer_colleage layer_smallmail smail_pop",
					buttons : [{
						'btext' : commonLang["확인"],
						'btype' : 'confirm'
					}]
				});
	    	},
	    	
	    	
	    	changeSearchUrl : function(searchFlag) {
	    		var isSearch = searchFlag || false;
	    		GO.router.navigate(GO.router.getUrl().split("?")[0] + "?" + $.param(this.listOption), {replace : !isSearch, trigger : isSearch});
	    	},
	    	
	    	
	    	externalSetUrl : function(url) {
    			console.log('note:' + JSON.stringify({
				     "function" : "setUrl", 
				     "param1" : url
				}));
	    	}
		});
		
		return {
			init : function(option) {
				instance = new LayerView(option);
				return instance;
			}
		};
	});
}).call(this);
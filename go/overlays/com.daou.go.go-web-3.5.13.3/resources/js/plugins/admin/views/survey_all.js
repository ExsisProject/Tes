(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "hgn!admin/templates/survey_all",
        "hgn!admin/templates/list_empty",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "i18n!survey/nls/survey",
        "jquery.go-popup",
        "jquery.go-sdk",
        "jquery.go-grid",
        "jquery.go-orgslide",
        "jquery.go-validation",
        "GO.util"
    ], 
    
    function(
        $, 
        Backbone,
        App,
        surveyAllListTmpl,
        emptyTmpl,
        commonLang,
        adminLang,
        surveyLang
    ) {
        var tmplVal = {
            label_id: adminLang["일련번호"],
            search : commonLang["검색"],
            label_delete: commonLang["삭제"],
            label_progress: commonLang["진행중"],
            progress: commonLang["진행"],
            label_stop: commonLang["중지"],
            label_finish: commonLang["완료"],
            label_tmp: commonLang["임시저장"],
            label_ready: commonLang["준비중"],
            label_no: adminLang["번호"],
            label_status: adminLang["상태"],
            label_title: commonLang["제목"],
            label_perior: commonLang["설문 기간"],
            label_writer: commonLang["작성자"]
        };
        var SurveyAllList = Backbone.View.extend({
            el : '#layoutContent',
            initialize : function() {
                this.listEl = '#surveyList';
                this.dataTable = null;
                this.unbindEvent();
                this.bindEvent();
            },
            unbindEvent: function() {
                this.$el.off("click", "#search_survey");
                this.$el.off("keydown", "span.search_wrap input");
                this.$el.off("click", "span#btn_progress");
                this.$el.off("click", "span#btn_stop");
                this.$el.off("click", "span#btn_finished");
                this.$el.off("click", "span#btn_delete");
                this.$el.off("click", "div#surveyList_wrapper input:checkbox");
            }, 
            bindEvent: function() {
                this.$el.on("click", "#search_survey", $.proxy(this.search, this));
                this.$el.on("keydown","span.search_wrap input", $.proxy(this.searchKeyboardEvent, this));
                this.$el.on("click", "span#btn_progress", $.proxy(this.changeSurveyStatus, this));
                this.$el.on("click", "span#btn_stop", $.proxy(this.changeSurveyStatus, this));
                this.$el.on("click", "span#btn_finished", $.proxy(this.changeSurveyStatus, this));
                this.$el.on("click", "span#btn_delete", $.proxy(this.deleteSurvey, this));
                this.$el.on("click", "div#surveyList_wrapper input:checkbox", $.proxy(this.toggleCheckbox, this));
            },
            search : function(){
                var searchEl = this.$el.find(".table_search input[type='text']"),
                	keyword = searchEl.val();
                	
				if(keyword.length >64){
					$.goAlert(App.i18n(adminLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"64"}));
					return;
				}
                this.dataTable.tables.search(this.$el.find('.table_search select').val(), keyword, searchEl);
            },
            searchKeyboardEvent : function(e) {
				if(e.keyCode == 13) {
					this.search();
				}
			},
			changeSurveyStatus : function(e) {
				var status = $(e.currentTarget).attr('data-status'),
					self = this,
					idEl = this.$el.find('input[type="checkbox"]:checked');
					
				if(idEl.size() == 0){
					$.goAlert(commonLang["설문을 선택하세요."]);
					return;
				}
				var url = GO.contextRoot+"ad/api",
					options = {
		                ids : []
		            };
		            
	            for(var i=0 ; i < idEl.length ; i++){
	                if(idEl[i].value == "on"){
	                    continue;
	                }
	                options.ids.push(parseInt(idEl[i].value));
	            }
	            
	            if(options.ids.length == 0){
	                return;
	            }
				if(status == "progress"){
					$.go(url + "/survey/status/progress",JSON.stringify(options), {
		                qryType : 'POST',
		                contentType : 'application/json',
		                responseFn : function(response) {
		                    $.goMessage(commonLang["변경되었습니다."]);
		                    self.render();
		                },
		                error : function(error){
		                	$.goMessage(commonLang["실패했습니다."]);
		                }
		            });
				}else if(status == "stop"){
					$.go(url + "/survey/status/stop",JSON.stringify(options), {
		                qryType : 'POST',
		                contentType : 'application/json',
		                responseFn : function(response) {
		                    $.goMessage(commonLang["변경되었습니다."]);
		                    self.render();
		                },
		                error : function(error){
		                	$.goMessage(commonLang["실패했습니다."]);
		                }
		            });
				}else if(status == 'finished'){
					$.goConfirm(surveyLang['설문 마감 확인 타이틀'], '' , function() {
						$.go(url + "/survey/status/finished",JSON.stringify(options), {
			                qryType : 'POST',
			                contentType : 'application/json',
			                responseFn : function(response) {
			                    $.goMessage(commonLang["변경되었습니다."]);
			                    self.render();
			                },
			                error : function(error){
			                	$.goMessage(commonLang["실패했습니다."]);
			                }
			            });
					});
				}
				else{
					return;
				}
			},
			deleteSurvey : function() {
				var self = this,
					idEl = this.$el.find('input[type="checkbox"]:checked');
						
					if(idEl.size() == 0){
						$.goAlert(commonLang["설문을 선택하세요."]);
						return;
					}
					var url = GO.contextRoot+"ad/api/survey",
						options = {
			                ids : []
			            };
		            
		            for(var i=0 ; i < idEl.length ; i++){
		                if(idEl[i].value == "on"){
		                    continue;
		                }
		                options.ids.push(parseInt(idEl[i].value));
		            }
		            
		            if(options.ids.length == 0){
		                return;
		            }
		            
		            $.goCaution(adminLang["설문삭제질문"], adminLang["삭제경고"], function() {
					var url = GO.contextRoot+"ad/api/survey";
					$.go(url, JSON.stringify(options), {
						qryType : 'DELETE',					
						contentType : 'application/json',
						responseFn : function(response) {
		                    $.goMessage(commonLang["삭제되었습니다."]);
		                    self.render();
		                },
		                error : function(error){
		                	$.goMessage(commonLang["실패했습니다."]);
		                }
					});
					
				});
			},
			toggleCheckbox : function(e) {
				var self = this;
				var targetEl = $(e.currentTarget),
					idEl = this.$el.find('input[type="checkbox"]:checked');
					
				if(targetEl.is(':checked')){
					targetEl.attr('checked', true);
				}else{
					this.$el.find('#checkedAll').attr('checked', false);
					targetEl.attr('checked', false);
				}
				
				var btnProgress = self.$el.find('#btn_progress'),
					btnStop = self.$el.find('#btn_stop'),
					btnFinished = self.$el.find('#btn_finished');

				btnProgress.css('display', '');
				btnStop.css('display', '');
				btnFinished.css('display', '');
				
				idEl.attr('data-value', function(i, val){
					console.log(val);
					
					if(val == 'progress'){
						btnProgress.css('display', 'none');
					}else if(val == 'stop'){
						btnStop.css('display', 'none');
						btnFinished.css('display', 'none');
					}else if(val == 'temp' || val == 'finished'){
						btnProgress.css('display', 'none');
						btnStop.css('display', 'none');
						btnFinished.css('display', 'none');
					}else if(val == 'ready'){
						//btnProgress.css('display', 'none');
						btnStop.css('display', 'none');
						btnFinished.css('display', 'none');
					}
				});
			},
            render : function() {
                this.$el.empty();
                this.$el.html( surveyAllListTmpl({
                    lang : tmplVal,
                }));    
                this.renderSurveyAllList();
            },
            renderSurveyAllList : function(){
                var self = this;
                var progressIds = [],
                	stopIds = [],
                	finishIds = [],
                	readyIds = [],
                	tmpIds = [];
                
                this.$tableEl = this.$el.find('#surveyList');	
                this.dataTable = $.goGrid({
                        el : this.listEl,
                        method : 'GET',
                        url : GO.contextRoot + 'ad/api/survey/all',
                        emptyMessage : emptyTmpl({
                                label_desc : adminLang["설문 없음"]	
                        }),
                        defaultSorting : [[ 1, "desc" ]],
                        pageUse : true,
						checkbox : true,
                        sDomType : 'admin',
                        checkboxData : 'id',
                        displayLength : App.session('adminPageBase'),
                        columns : [
                                   { mData: null, sWidth: '80px', bSortable: false, fnRender : function(obj) {
                                       var settings = obj.oSettings;
						            	return ( settings._iRecordsTotal- settings._iDisplayStart-obj.iDataRow );
                                   } },
                                   { mData: "status", sClass: "align_c", sWidth: "100px", bSortable: true, fnRender : function(obj) {
                                   		var status = obj.aData.status;
                                   		if(status == "progress"){
                                   			progressIds.push(obj.aData.id);
                                   			return tmplVal['label_progress'];
                                   		}else if(status == "stop"){
                                   			stopIds.push(obj.aData.id);
                                   			return tmplVal['label_stop'];
                                   		}else if(status == "finished"){
                                   			finishIds.push(obj.aData.id);
                                   			return tmplVal['label_finish'];
                                   		}else if(status == "ready"){
                                   			readyIds.push(obj.aData.id);
                                   			return tmplVal['label_ready'];
                                   		}
                                   		else{
                                   			tmpIds.push(obj.aData.id);
                                   			return tmplVal['label_tmp'];
                                   		}
                                   }},
                                   { mData: "title", sClass: "title", bSortable: true, fnRender : function(obj) {
                                       return obj.aData.title;
                                   }},
                                   { mData: null, bSortable: true, sWidth: "350px", sClass: "align_c", fnRender : function(obj) {
                                       return GO.util.basicDate(obj.aData.startTime) + " ~ " + GO.util.basicDate(obj.aData.endTime); 
                                   }},
                                   { mData : "creatorName", sWidth: "200px", sClass: "title", bSortable: true, fnRender: function(obj) {
                                       return obj.aData.creatorName + " " +obj.aData.creator.position;
                                   }}
                        ],
                        fnDrawCallback : function(obj) {
                            self.$el.find('.toolbar_top .custom_header').append(self.$el.find('#controlButtons').show());
                            $(tmpIds).each(function(k,v) {
	                        	self.$tableEl.find('input[type="checkbox"][name="id"][value="'+v+'"]').attr('data-value', "temp");
	                        });
	                        $(progressIds).each(function(k,v) {
	                        	self.$tableEl.find('input[type="checkbox"][name="id"][value="'+v+'"]').attr('data-value', "progress");
	                        });
	                        $(stopIds).each(function(k,v) {
	                        	self.$tableEl.find('input[type="checkbox"][name="id"][value="'+v+'"]').attr('data-value', "stop");
	                        });
	                        $(finishIds).each(function(k,v) {
	                        	self.$tableEl.find('input[type="checkbox"][name="id"][value="'+v+'"]').attr('data-value', "finished");
	                        });
	                        $(readyIds).each(function(k,v) {
	                        	self.$tableEl.find('input[type="checkbox"][name="id"][value="'+v+'"]').attr('data-value', "ready");
	                        });
                        }
                    
                    });
                }
            });
        return SurveyAllList;
    });
}).call(this);
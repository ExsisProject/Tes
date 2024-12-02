(function() {
    
    define([
        "backbone", 
        "app", 
        "survey/models/survey_response", 
        "survey/libs/util", 
        "survey/helpers/html", 
        "hgn!survey/templates/list", 
        "i18n!nls/commons", 
        "i18n!survey/nls/survey", 
        "jquery.go-grid", 
        "jquery.go-popup"
    ], 
    
    function(
        Backbone,
        GO, 
        SurveyResponseModel, 
        SurveyUtil,
        HtmlHelper,
        ListTemplate, 
        CommonLang,
        SurveyLang
    ) {
        
    	var SurveyListView = Backbone.View.extend({
    		tagName: 'div', 
            className: 'content_page', 
            
            dataTable: null, 
            filterName: 'all', 
            
            events: {
        		"click .btn-search": '_search', 
        		"click .btn-survey-progress": "_startSurveys",
        		"click .btn-survey-stop": "_stopSurveys",
        		"click .btn-survey-finished" : "_finishedSurveys",
        		"click .btn-survey-remove": "_removeSurveys",
				"change #selectSite" : "loadTable",
        		"keydown section.search2 input": '_searchKeyboardEvent',
				"click a.preview" : "preview",
				"change input.copyable" : "copySurvey"
            }, 
                        
            initialize: function(options) {
            	this.options = options || {};
                this.dataTable = null;
                _.defaults(this.options, {
                	usePage: true, 
                	useButton: true,
                	useToolbar: true, 
                	showSeq: true,
                	displayLength: 20
                })
            },
            _isUseButtonMenu: function() {
            	return location.href.indexOf("/list/my") > -1;
            },
			_canCopyMultiCompanySurvey: function() {
				return this.isCopyableList() && GO.session('integratedCompanies').length > 1;
			},
            render: function() {
                this.$el.append(ListTemplate({
                    "context_root": GO.config("contextRoot"), 
                    "my_list?": this.isMyList(),
					"canCopyMultiCompanySurvey" : this._canCopyMultiCompanySurvey(),
					"companies" : GO.session('integratedCompanies'),
                    "use_button?": this._isUseButtonMenu(), 
                    "show_seq?": this.options.showSeq, 
                    "label": {
						"select_site": SurveyLang["사이트 선택"],
                        "num": SurveyLang["번호"], 
                        "status": SurveyLang["상태"], 
                        "title": SurveyLang["설문 제목"], 
                        "period": SurveyLang["설문 기간"], 
                        "creator": SurveyLang["작성자"], 
                        "rating": SurveyLang["참여율"],
                        "progress": SurveyLang["진행"], 
                        "finished" : SurveyLang["마감"],
                        "stop": SurveyLang["중지"],
                        "delete": SurveyLang["삭제"],
                        "search": CommonLang["검색"]
                    }
                }));
				if(this._canCopyMultiCompanySurvey()) {
					this.$el.find("#selectSite option[value=" + GO.session('companyId') + "]").prop('selected', true);
				}
                this.loadTable();
            }, 
            
            loadTable: function() {
                var self = this;
                var requestUrl = this.getSearchUrl();
                                
                if(this.dataTable === null) {
                    var dataTableOptions = {
                        el: "#survey-list-table",
                        url: requestUrl,
                        displayLength: self.options.displayLength,
                        emptyMessage: makeListEmptyMessage(),
                        columns: [], 
                        
                        fnDrawCallback : function(tables, oSettings, listParams) {
                            self.$el.find('.btn-custom').appendTo(self.$el.find('.tool_bar .custom_header')).show();

							if(self.isCopyableList()) {
								self.$el.find('.select-custom').appendTo(self.$el.find('.tool_bar .custom_header')).show();
								self.$el.find('tr input[type="checkbox"]').addClass('copyable');
							}
                            if(self.options.usePage) {
                            	if(oSettings._iRecordsTotal == 0 && !listParams['keyword']) {
                                    $('.dataTables_paginate, .table_search').hide();
                                } else {
                                    $('.dataTables_paginate, .table_search').show();
                                }
                            } else {
                            	$('.dataTables_paginate, .table_search').hide();
                            }
                            
                            if(!self.options.useToolbar) {
                            	$('.dataTables_wrapper .tool_bar').hide();
                            }
                            $(window).scrollTop(0);
                        }
                    };
                    
                    
                    if(this.options.showSeq) {
                    	dataTableOptions.columns.push(setDataTableColumn('num', _.bind(setSeqColumn, this)));
                    }
                    
                    dataTableOptions.columns.push(setDataTableColumn('state', _.bind(setStatusColumn, this)));
                    dataTableOptions.columns.push(setDataTableColumn('list_subject', _.bind(setSubjectColumn, this)));
                    dataTableOptions.columns.push(setDataTableColumn('date', _.bind(setDateColumn, this)));
                    
                    if(this.isMyList()) {
                    	dataTableOptions.columns.push(setDataTableColumn('rate', _.bind(setRateColumn, this)));
                    	dataTableOptions.checkbox = true;
                        dataTableOptions.checkboxData = 'id';
                        $("select[name='searchtype'] option[value='writer']").remove();
                    } else {
						if(this.isCopyableList()) {
							dataTableOptions.checkbox = true;
							dataTableOptions.checkboxData = 'id';
						}
                    	dataTableOptions.columns.push(setDataTableColumn('name', _.bind(setCreatorColumn, this)));
                    }

                    this.dataTable = $.goGrid(dataTableOptions);
                } else {
					if(this.isCopyableList()) {
						this.dataTable.tables.setParam("companyId", this.$el.find("#selectSite option:selected").val());
					}
                    this.dataTable.tables.fnSettings().sAjaxSource = requestUrl;
                    this.dataTable.tables.fnClearTable();
                }
            }, 
            
            setFilter: function(filterName) {
                this.filterName = filterName;
            }, 
            
            getSearchUrl: function() {
            	return GO.config('contextRoot') + 'api/survey/list/' + this.filterName;
            }, 
            
            isProgressList: function() {
            	return this.filterName === 'progress';
            }, 
            
            isFinishedList: function() {
            	return this.filterName === 'finished';
            }, 
            
            isMyList: function() {
            	return this.filterName === 'my';
            },

			isCopyableList: function() {
				return this.filterName === 'copyable';
			},
            
            _searchKeyboardEvent : function(e) {
				if(e.keyCode == 13) {
					this._search(e);
				}
			},
			
            _search: function(e) {
            	var $wrap = $(e.currentTarget).closest('.table_search'),
            		$searchtype = $wrap.find('select[name=searchtype]'), 
            		$keyword = $wrap.find('input[name=keyword]'), 
            		searchtype = $searchtype.val(), 
            		keyword = $keyword.val();
            	console.log(e);
            	
            	// TODO: 리팩토링
            	if(!keyword || (keyword && (keyword.length < 2 || keyword.length > 64))) {
            		$.goAlert(SurveyUtil.getStringLengthError(2, 64));
            		return false;
            	}
            	
            	this.dataTable.tables.fnSettings().sAjaxSource = this.getSearchUrl();
            	this.dataTable.tables.customParams = {"searchtype": searchtype, "keyword": keyword};
            	this.dataTable.tables.fnClearTable();
            }, 
            
            _startSurveys: function() {
            	requestBatch(this, 'progress');
            }, 
            
            _stopSurveys: function() {
            	requestBatch(this, 'stop');
            }, 
            
            _finishedSurveys: function() {
            	requestBatch(this, 'finished');
            },
            
            _removeSurveys: function() {
            	requestBatch(this, 'remove');
            },

			preview: function(e) {
				e.preventDefault();
				var url = GO.contextRoot +"app/survey/" + $(e.currentTarget).closest('tr').find('input').val() + "/preview";
				window.open(url, 'surveyPreview','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
			},

			copySurvey: function(e) {
				var $target = $(e.currentTarget);
				this.$el.find("input.copyable").prop('checked', false);
				if ($target.attr('id') === "checkedAll") return;

				$(e.currentTarget).prop('checked', true);
				$.goConfirm(SurveyLang["설문을 복사하시겠습니까?"], SurveyLang["설문 복사 알림"], function () {
					var url = GO.contextRoot + "api/survey/" + $target.val() + "/copy";
					$.ajax(url, {method: 'POST'}).done(function (resp) {
						GO.router.navigate('survey/' + resp.data.id + '/copied/edit', {trigger: true, pushState: true});
					});
				}, function () {
					$target.prop('checked', false);
				});
			}
    	});
    	
    	function getCheckedEl() {
    		return $('#survey-list-table input[type=checkbox]:checked')
    	}
        
        function makeListEmptyMessage() {            
        	var html = [];
            html.push('<p class="data_null">');
                html.push('<span class="ic_data_type ic_no_contents"></span>');
                html.push('<span class="txt">' + SurveyLang["설문 빈목록 메시지"] + '</span>');
            html.push('</p>');

            return html.join("\n");
        }
        
        function requestBatch(view, task) {
        	var reqUrl = (GO.config('contextRoot') + 'api/survey' + (task === 'remove' ? '': '/status/' + task)).replace('//', '/'), 
        		checkedData = view.dataTable.tables.getCheckedData(), 
        		filteredData,
        		errorMessage = null;
        	
        	if(checkedData.length == 0){
        		$.goSlideMessage(SurveyLang["선택 설문 없음"]);
        	}
        	
        	if(task === 'remove') {
        		filteredData = checkedData;
        	} else {
        		var curStatus = {"progress": 'stop', "stop": 'progress', 'finished': 'progress'}[task],
        			 dataStatus = checkedData[0].status,
        			 sameStatus = true;
        		
        		$.each(checkedData, function(k, v){
        			if(sameStatus && dataStatus != v.status){
        				sameStatus = false; 
        			}
        		});
        		
        		filteredData = _.filter(checkedData, function(data) {
        			if(!sameStatus){
            			errorMessage = SurveyLang["같은상태만선택"];
            			return;
            		}
        			
        			if(task == 'stop')	{ //중지로 변경 
        				if(data.status == 'finished'){
        					errorMessage = SurveyLang["완료된설문중지"];
        					return;
        				}else if(data.status == 'ready'){
        					errorMessage = SurveyLang["준비중설문중지"];
        					return;
        				}else if(data.status == 'temp'){
        					errorMessage = SurveyLang["임시저장설문중지"];
        					return;
        				}else if(data.status == 'stop'){
        					errorMessage = SurveyLang["중지된설문중지"];
        					return;
        				}
        			}
        			if(task == 'progress') {
        				if(data.status == 'finished'){
        					errorMessage = SurveyLang["완료된설문진행"];
        					return;
        				}else if(data.status == 'ready'){
        				//	errorMessage = SurveyLang["준비중설문진행"];
        					return true;
        				}else if(data.status == 'temp'){
        					errorMessage = SurveyLang["임시저장설문진행"];
        					return;
        				}else if(data.status == 'progress'){
        					errorMessage = SurveyLang["진행된설문진행"];
        					return;
        				}
        			}
        			if(task == 'finished') {
        				if(data.status == 'finished') {
        					errorMessage = SurveyLang["마감된설문마감"];
        					return;
        				}else if(data.status == 'stop') {
        					errorMessage = SurveyLang["중지된설문마감"];
        					return;
        				}else if(data.status == 'temp') {
        					errorMessage = SurveyLang["임시저장설문마감"];
        					return;
        				}else if(data.status == 'ready') {
        					errorMessage = SurveyLang["준비중설문마감"];
        					return;
        				}
        			}
        			return data.status === curStatus;
        		});
        	}
        	
        	if(filteredData.length > 0) {
        		if(task == 'remove'){
        			$.goConfirm(SurveyLang['설문 삭제 확인 타이틀'], SurveyLang['설문 삭제 확인 메시지'] , function() {
        				$.ajax(reqUrl, {
                    		method: 'DELETE', 
                    		data: JSON.stringify({"ids":_.pluck(filteredData, 'id')}), 
                    		dataType: 'json', 
                    		contentType: 'application/json'
                    	}).done(function() {
                    		view.dataTable.tables.fnSettings().sAjaxSource = view.getSearchUrl();
                            view.dataTable.tables.fnClearTable();
                            view.$el.find('input[type=checkbox]').prop('checked', false);
                    	}).fail(function() {
                    		$.goSlideMessage(SurveyLang["배치 처리 오류 메시지"], 'caution');
                    	});
                        
                    });
        		}else if(task == 'finished'){
        			$.goConfirm(SurveyLang['설문 마감 확인 타이틀'], '' , function() {
        				$.ajax(reqUrl, {
            				method: 'POST', 
            				data: JSON.stringify({"ids":_.pluck(filteredData, 'id')}), 
            				dataType: 'json', 
            				contentType: 'application/json'
            			}).done(function() {
            				view.dataTable.tables.fnSettings().sAjaxSource = view.getSearchUrl();
            				view.dataTable.tables.fnClearTable();
            				view.$el.find('input[type=checkbox]').prop('checked', false);
            			}).fail(function() {
            				$.goSlideMessage(SurveyLang["배치 처리 오류 메시지"], 'caution');
            			});
        			});
        		}
        		else{
        			$.ajax(reqUrl, {
        				method: 'POST', 
        				data: JSON.stringify({"ids":_.pluck(filteredData, 'id')}), 
        				dataType: 'json', 
        				contentType: 'application/json'
        			}).done(function() {
        				view.dataTable.tables.fnSettings().sAjaxSource = view.getSearchUrl();
        				view.dataTable.tables.fnClearTable();
        				view.$el.find('input[type=checkbox]').prop('checked', false);
        			}).fail(function() {
        				$.goSlideMessage(SurveyLang["배치 처리 오류 메시지"], 'caution');
        			});
        		}
        	} else {
        		if(errorMessage != null){
        			$.goSlideMessage(errorMessage);
        		}else{
        			$.goSlideMessage(SurveyLang["선택 설문 없음"]);
        		}
        	}
        }
        
        function setDataTableColumn(classname, callback) {
        	return { mData:null, sClass: classname, bSortable: false, fnRender: callback };
        }
        
        function setSeqColumn(obj) {
        	var settings = obj.oSettings,
				orderSeq = settings._iRecordsTotal - settings._iDisplayStart - obj.iDataRow;

        	return '<span class="txt">' + orderSeq + '</span>';
        }
        
        function setStatusColumn(obj) {
        	var model = new SurveyResponseModel(obj.aData), 
            	statusTag = '-';
            
            if(this.isMyList()|| this.isCopyableList()) {
                statusTag = HtmlHelper.getStatusTagByStatus(model.get('status'));
            } else if(model.isResponsible()) {                                        
                statusTag = HtmlHelper.getStatusTagByResponse(model.getResponseStatus());
            } else if(model.isIncludedReferrer(GO.session('id'))) {
                statusTag = HtmlHelper.getStatusTag('read', SurveyLang["열람"]);
            }
            
            return statusTag;
        }
        
        function setSubjectColumn(obj) {
        	var model = new SurveyResponseModel(obj.aData), 
                isReferrer = model.isIncludedReferrer(GO.session('id')), 
                linkUrl = GO.config('contextRoot')+'app/survey/' + model.id, 
                html = [];
            
        	if(this.isMyList() && model.isTempSaved()) {
        		linkUrl += '/edit';
        	} 
        	
            if(isReferrer) {
                html.push(HtmlHelper.getReferTag());
            }
			if(this.isCopyableList()) {
				html.push('<a class="preview"><span class="txt">' + _.escape(model.get('title'))+ '</span></a>');
			} else {
				html.push('<a href="'+linkUrl+'"><span class="txt">'+_.escape(model.get('title'))+'</span></a>');
			}
            if(model.get('commentCount') > 0) {
            	html.push('<span class="ic_classic ic_reply"></span>');
            	html.push('<span class="num">[<strong>' + model.get('commentCount') + '</strong>]</span>');
            }
            
            return html.join("\n");
        }
        
        function setDateColumn(obj) {
        	/*
        	 * 0.83에서는 batch 작업 문제로 종일 설문만 지원
            var startDt = GO.util.toMoment(obj.aData.startTime).format('YYYY-MM-DD HH:mm'), 
                endDt = GO.util.toMoment(obj.aData.endTime).format('YYYY-MM-DD HH:mm');
            */
        	var startDt = moment(obj.aData.startTime, 'YYYY-MM-DD').format('YYYY-MM-DD'), 
                endDt = moment(obj.aData.endTime, 'YYYY-MM-DD').format('YYYY-MM-DD');
            return '<span class="txt">'+startDt+' ~ ' +endDt+ '</span>';
        }
        
        function setRateColumn(obj) {
    		var str = '', 
        		targetCount = obj.aData.targetCount, 
        		respCount = obj.aData.responseCount < 0 ? 0 : obj.aData.responseCount;
    		
    		if(targetCount > 0) {
    			var rate = ((respCount / targetCount) * 100).toFixed(2);
    			
    			str = respCount + '/' + targetCount + '<strong> (' + rate + '%)</strong>';
    		} else {
    			str = '-';
    		}
    		
    		return '<span class="txt">' + str + '</span>';
        }
        
        function setCreatorColumn(obj) {
        	var displayName = obj.aData.deptName ? obj.aData.deptName : obj.aData.creator.name + ' ' + obj.aData.creator.position;
    		return '<span class="txt">'+ displayName + '</span>';
        }
        
        return SurveyListView;
        
    });
    
})();
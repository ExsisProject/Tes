(function() {
    define([
        "jquery", 
        "underscore", 
        "app", 
        "hgn!approval/templates/detail_search_layer",
        "i18n!nls/commons",
        "i18n!approval/nls/approval",
        "jquery.ui", 
        "jquery.go-popup",
		"jquery.go-validation"
    ], 

    function(
        $, 
        _, 
        App, 
        Template, 
        commonLang, 
        approvalLang
    ) {
        var now = GO.util.now().format("YYYY-MM-DD");
        var tvars = {
            "maxlength": 200, 
            "label": {
            	"전자결제 상세 검색": commonLang["상세검색"],
            	"전사 문서함 상세 검색": commonLang["상세검색"],
                "대상 문서함": approvalLang["대상 문서함"], 
                "검색 기간": approvalLang["검색 기간"], 
                "기안일": approvalLang["기안일"],
                "기안자": approvalLang["기안자"],
                "기안부서": approvalLang["기안부서"],
                "결재선": approvalLang["결재선"],
                "완료일": approvalLang["결재일"],
                "전체": approvalLang["전체"],
                "오늘": commonLang["오늘"],
                "일": approvalLang["일"],
                "주일": approvalLang["주일"],
                "개월": approvalLang["개월"],
                "년": approvalLang["년"],
                "직접선택":approvalLang["직접선택"],
                "양식을 선택하세요": approvalLang["양식을 선택하세요"],
                "작성자": commonLang["작성자"], 
                "검색어": commonLang["검색어"], 
                "양식제목": approvalLang["양식제목"],
                "제목": commonLang["제목"], 
                "내용": commonLang["본문"],
                "첨부파일명": approvalLang["첨부파일명"],
                "첨부파일내용" : commonLang["첨부파일 내용"],
                "검색": commonLang["검색"],
                "닫기": commonLang["닫기"],
                "모두 만족": commonLang["모두 만족"],
                "하나만 만족": commonLang["하나만 만족"],
                "설정된 기간에만 검색": commonLang["설정된 기간에만 검색"],
                "검색 조건": commonLang["검색 조건"],
                "문서번호": approvalLang["문서번호"]
            }
        };

        var ApprovalDetailSearchLayer = (function() {
            var constructor = function(options) {
                this.template = Template(_.extend({
                    fromDate: GO.util.shortDate(now),
                    toDate: GO.util.shortDate(now)
                }, tvars));
                this.render(options);
                this.delegateEvents();
                this.$el.find('#termAll').trigger('click');
            };

            constructor.prototype = {
            		
                render: function(poptions) {
                	var header = '';
                	
                	if(!this.setSearchType()){ header = commonLang["상세검색"];} else { header = commonLang["상세검색"];}
                	
                    var options = {
                        width: -1, 
                        modal: true, 
                        header: header,
                        pclass: "layer_approval_search",
                        contents: this.template,
                        closeCallback: $.proxy(this._release, this), 
                        callback : $.proxy(this.saveAction, this)
                    };
                    
                    if('offset' in poptions) options.offset = poptions.offset;
                    this.el = $.goSearch(options);
                    this.$el = $(this.el);
                    this._prepareDatepicker();
                    return this;
                }, 
                
                delegateEvents: function() {
                    this.undelegateEvents();
                    this.$el.on("keydown.approval-detail-search", "input.enable_enter", $.proxy(this._bindKeyboardEvent, this));
                    this.$el.on("click.period", "span.btn_minor_s", $.proxy(this.selectTerm, this));                    
                    this.$el.on("click.listName", "li>span[data-list]", $.proxy(this.changeList, this));
                    this.$el.on("click", ".btn_select", $.proxy(this.toggleSelect, this))

                },

                undelegateEvents: function() {
                    this.$el.off(".approval-detail-search");
                    this.$el.off(".period");
                    this.$el.off(".listName");
                }, 
                
                selectTerm : function(e){
                	var today = GO.util.shortDate(GO.util.searchEndDate(now));
                	var term = $(e.currentTarget).data('term');
                	$(e.currentTarget).parent().find('.btn_minor_s').removeClass('btn_minor_s_selected');
                	$(e.currentTarget).addClass('btn_minor_s_selected');
                	if(term == 'today'){
                    	this.$el.find('#term_select').hide();
    					$('#detailFromDate').val(today);
    					$('#detailToDate').val(today);
                	}else if(term == 'specify'){
                    	if ($('#detailFromDate').val() == '') {
                    		$('#detailFromDate').val(today);
                    	}
                    	if ($('#detailToDate').val() == '') {
                    		$('#detailToDate').val(today);
                    	}
                		this.$el.find('#term_select').show();
                	}else if(term == 'all'){
                    	this.$el.find('#term_select').hide();
                    	$('#detailFromDate').val('');
    					$('#detailToDate').val(today);
                	}else{
                    	this.$el.find('#term_select').hide();
    					$('#detailFromDate').val(GO.util.shortDate(GO.util.calDate(now, term, -1)));
    					$('#detailToDate').val(today);
                	}
                },
    			
    			changeList: function(e){
    				var currentName = $(e.currentTarget);
    				$('#dateType').val(currentName.text());
    				$('#dateType').attr('data-name', currentName.text());
    				$('#dateType').attr('data-list', e.currentTarget.id);
    				$('ul.select_list').hide();
    			},
    			toggleSelect : function(){
    				if($('ul.select_list').css('display') != 'none') {
    					$('ul.select_list').hide();
    				}else{
    					$('ul.select_list').show();
    				}
    			},
    			// TODO 결재문서 검색 or 전사문서함 검색 체크
    			setSearchType: function(obj){
                	var searchCheck = GO.router.getUrl().indexOf("docfolder");
                	if ( searchCheck == -1 ) return true;
                	else return false; 
                },
                close: function() {
                    this.el.close($.proxy(this._release, this));
                }, 
                
                saveAction: function(e){
    				// TODO 검색 조건 설정 parameter 수정 요망 (서버에 맞춰 작업)
					var currentDate = GO.util.shortDate(new Date());
    				var searchURI = '/approval/search', type = 'approval';
                	if (!this.setSearchType()) type = 'docfolder';
                	
    				var formName = $.trim($('#formName').val());
    				var drafterName = $.trim($('#drafterName').val());
    				var drafterDeptName = $.trim($('#drafterDeptName').val());
    				var activityUserNames = $.trim($('#activityUserNames').val());
    				var docNum = $.trim($('#docNum').val());
    				var fromDate = $.trim($('#detailFromDate').val());
    				var toDate = $.trim($('#detailToDate').val());
    				var stext = $.trim($('#stext').val());
                    var searchOption = $.trim($("input[name='searchOption']:checked").val());
    				if (formName == "" && drafterName == "" && drafterDeptName == "" && activityUserNames == "" && docNum == "" && stext == "" && fromDate == "" && toDate == ""){
    					$.goMessage(commonLang["검색어를 입력하세요."]);
    					return;
    				} else {
    					$.goError('', $('#searchMessage'), true);
    				}
    				var inputData = [formName, drafterName, drafterDeptName, activityUserNames, docNum, stext];
    				
    				for (var i=0 ; i<inputData.length ; i++){
    					if(inputData[i] != ''){
    						if(!$.goValidation.isCheckLength(2,64,inputData[i])){
    							$.goError(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"64"}));
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
    					$.goError(approvalLang['검색어 구분을 선택해주세요.']); 
    					return;
					}
    				
    				var dateType = $('input#dateType[data-list]').attr('data-list');
    				var startAt, endAt = 0;
    				
    				if(!fromDate) {
    					startAt = GO.util.toISO8601('1970/01/01');
					}else {
						startAt = GO.util.toISO8601($('#detailFromDate').val());
					};
    				
					if(!toDate) {
    					endAt = GO.util.searchEndDate(currentDate);
    				}else{
    					endAt = GO.util.searchEndDate($('#detailToDate').val());
    				};

    				GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
    				var param = {
    						type : type,
    						formName : formName,
    						drafterName : drafterName,
    						drafterDeptName : drafterDeptName,
    						activityUserNames : activityUserNames,
    						docNum : docNum,
    						dateType : dateType,
    						title : $('#title').attr('checked') ? stext : '',
							docBody : $('#docBody').attr('checked') ? stext : '',
							searchTerm : this.$el.find('.btn_minor_s_selected').data('term'), 
							attachFileNames : $('#attachFileNames').attr('checked') ? stext : '',
							attachFileContents : $('#attachFileContents').attr('checked') ? stext : '',
    						fromDate : startAt,
    						toDate : endAt,
    						stype : 'detail',
                            searchOption : searchOption
    				};
    				if(type=='docfolder') {searchURI = '/docfolder/search';}
    				App.router.navigate(searchURI + '?' + this._serializeObj(param), true);				
    			},
    			_serializeObj : function(obj) {
    				var str = [];
    				for(var p in obj) {
    					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    				}
    				return str.join("&");
                },
                
                _bindKeyboardEvent: function(e) {
                    if(e.which === 13) { this._requestSearch(); }
                    return this;
                }, 

                _prepareDatepicker: function() {
                    var fromDate = this.$el.find("#detailFromDate"), 
                        toDate = this.$el.find("#detailToDate");

                    fromDate.datepicker({
                        dateFormat: "yy-mm-dd", 
                        changeMonth: true,
                        changeYear: true,
                        yearSuffix: "",
                        onClose: function( selectedDate ) {
                            toDate.datepicker( "option", "minDate", selectedDate );
                        }
                    });
                    toDate.datepicker({ 
                        dateFormat: "yy-mm-dd",
                        changeMonth: true,
                        changeYear: true,
                        yearSuffix: "",
                        minDate: fromDate.val()
                    });

                    return this;
                }, 
                /*
                _requestSearch: function() {
                	alert("상세 검색");
                	                    
                	var reqData = GO.util.serializeForm(this.$el.find("#approvalDetailSearch"), true);
                	console.log(reqData);
                    if(this.validate(reqData))  {
                        GO.router.navigate("approval/search?" + $.param(reqData), {trigger: true, pushState: true});
                        this.close();
                    }
                    return this;
                    
                }, 
                */
                validate: function(data) {
                    var self = this, 
                        checkAllEmpty = true; 

                    _.map(data, function(val, key) {
                        if(key !== 's_type' && !!val) checkAllEmpty &= false;
                        
                        // 날짜의 경우 ISO포맷으로 변환하여 설정한다.
                        if(key === 'fromDate' && val) {
                            data[key] = GO.util.toISO8601(GO.util.toMoment(val).startOf('day'));
                        }
                        if(key === 'toDate' && val) {
                            data[key] = GO.util.toISO8601(GO.util.toMoment(val).endOf('day'));
                        }
                    });
                    
                    // 모든 항목에 검색어가 없으면 검색되지 않도록 한다.
                    if(checkAllEmpty) {
                        $.goMessage(commonLang["검색어를 입력하세요."]);
                        return false;
                    }
                    
                    if(data.summary > 200) {
                        $.goMessage(GO.i18n(approvalLang["{{max}}자 이하로 입력해 주십시오"], {'max': 200}));
                        this.$el.find("#detail_keyword").focus();
                        return false;
                    }
                    
                    return true;
                }, 

                _release: function() {
                    this.undelegateEvents();
                }, 
                
                _showDatepicker: function(e) {
                    var $target = $(e.currentTarget);
                    if($target.val() === "custom") {
                        this.$el.find('#datepicker').show();    
                    } else {
                        this.$el.find('#datepicker').hide();
                    }
                    return this; 
                }                
            }; 

            return constructor;
        })();

        return ApprovalDetailSearchLayer;
    });
}).call(this);
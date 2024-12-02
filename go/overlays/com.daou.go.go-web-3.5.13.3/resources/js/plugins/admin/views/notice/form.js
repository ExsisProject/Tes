(function() {
    define([
        "backbone", 
        "app",
        "views/circle",
        "admin/libs/recurrence_parser",
        
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "i18n!calendar/nls/calendar",
        "hgn!admin/templates/notice/form",
        "admin/models/notice",
        "file_upload",
        "attach_file",
        "GO.util",
        "jquery.go-validation",
        "go-webeditor/jquery.go-webeditor",
        "go-notice",
        "jquery.go-preloader",
        "jquery.go-sdk",
        "jquery.jstree",
        "jquery.go-popup",
        "jquery.go-orgslide",
    ],

    function(
        Backbone,
        GO,
        CircleView,
        RecurrenceParser,
        
        CommonLang,
        AdminLang,
        CalLang,
        NoticeFormTmpl,
        NoticeModel,
        FileUpload,
        AttachFilesView
    ) {
        var lang = {
            "notice_config" : AdminLang["팝업 공지 설정"],
            "notice_detail_config" : AdminLang["팝업 공지 상세 설정"],
            "notice_name" : AdminLang["공지 제목"],
            "limit_char" : GO.i18n(AdminLang["0자이하 입력해야합니다."], {arg1: 64}),
            "content" : AdminLang["공지 내용"],
            "term" : AdminLang["공지 기간"],
            "size" : AdminLang["팝업 사이즈"],
            "preview" : AdminLang["설정한 공지 미리보기"],
            "options" : AdminLang["옵션"],
            "option_1" : AdminLang["로그인 할 때마다 사용자에게 보여주기"],
            "option_2" : AdminLang["사용자에게 '하루동안 이 창을 열지 않음' 기능 제공"],
            "option_3" : AdminLang["사용자에게 '1주일 동안 이 창을 열지 않음' 기능 제공"],
            "option_4" : AdminLang["사용자에게 '더이상 열지 않음' 기능 제공"],
            "save" : CommonLang["저장"],
            "cancel" : CommonLang["취소"],
            "save_success" : CommonLang["저장되었습니다."],
            "attach_file" : CommonLang["파일첨부"],
            "remove" : CommonLang["삭제"],
            "desc" : AdminLang["※ 옵션을 수정하더라도 이미 '열지 않음'을 체크한 사용자는 수정사항이 반영되지 않습니다."],
            "target" : AdminLang["공지 대상"],
            "targetAll" : AdminLang["전체 사용자"],
            "state" : AdminLang["사용여부"],
            "normal" : AdminLang["사용"],
            "every_month" : CalLang["매월"],
            "every_week" : CalLang["매주"],
            "last_week" : CalLang["마지막 주"],
            "last_day" : CalLang["마지막 일"],
            "recur" : CalLang["반복"],
            "scope" : CalLang["특정기간"],
            "usedesc" : AdminLang["팝업공지사용여부"],
            "specdays" : CalLang["특정요일"],
            "specweek" : CalLang["특정 주"],
            "day" : CalLang["날"],
            "specday" : CalLang["특정 일"],
            "month" : CalLang["달"],
            "recurmonth" : CalLang["반복 월"],
            "weekly" : CalLang["매 주 반복"],
            "monthly" : CalLang["매 월 반복"],
            "device" : AdminLang["디바이스"],
            "web" : AdminLang["웹"],
            "mobile" : AdminLang["모바일"],
            "mobile_size_desc" : AdminLang["모바일은 기기에 맞춰서 사이즈가 자동 지정됩니다."],
            "mobile_option_1_desc" : AdminLang["로그인 할 때마다 사용자에게 보여주기 모바일 안내"]
        };
        
        var NoticeForm = Backbone.View.extend({
            
            el : '#layoutContent',
            
            events : {
                "click #preview" : "preview",
                "click #save" : "save",
                "click #cancel" : "cancel",
                "click #attaches span.ic_del" : "removeAttach",
                "click #targetAll" : "changeTarget",
                "click input[name='term']" : "changeTerm",
                "click input[name='month']" : "changeMonthOrWeek",
                "click input[name='week']" : "changeMonthOrWeek",
                "click input[id*='_all']" : "selectAll",
                "change #startDay" : "changeDay",
                "change select[data-tag=repeatSelect]" : "changeRecurrence",
            	"change input[data-tag=repeatSelect]" : "changeRecurrence"
            },

            initialize : function() {
                this.$el.off();
                this.isCreate = (this.options.noticeId == undefined) ? true : false;
                this.model = new NoticeModel();
                
                if(this.isCreate){
                    this.model.setInitData();
                }else{
                    this.model.set({id : this.options.noticeId});
                    this.model.fetch({async : false});
                }
            },

            render : function() {
                initContent.call(this);
                initEditor.call(this);
                initDatepicker.call(this);
                initFileUpload.call(this);
            },
            
            save : function(){
            	if (!GO.Editor.getInstance("notice_editor").validate()) {
            		$.goError(commonLang['마임 사이즈 초과']);
            		return false;
            	}
            	
                var preloader = $.goPreloader();
                preloader.render();
                
                setData.call(this);
                
                if(!validate.call(this)){
                	preloader.release();
                    return false;
                }
                
                this.model.save(null, {
                    success : function(){
                        preloader.release();
                        var url = "company/notice";
                        $.goMessage(lang.save_success);
                        GO.router.navigate(url, {trigger: true});
                    },
                    error : function(model, response) {
                        preloader.release();
                        if(response.message) $.goAlert(response.message);
                        else $.goMessage(CommonLang["실패했습니다."]);
                    }
                });
            },
            changeRecurrence : function(e) {
            	var recurrenceCode = "";
    			
    			if($("#monthly_radio").is(":checked")) {	//매월 반복
    				var months = [];
    				var monthDays = [];
    				
    				var startDay = $("#startDay option:selected").val(),	//특정일 시작일
    					endDay = $("#endDay option:selected").val();	//특정일 종료일
    				
    				_.each($("input[name=month]:checked"), function(checkbox){
    					months.push(checkbox.getAttribute("value"));
    				});
    				//매월은 제거
    				months = $.grep(months, function(value) {
    					  return value != "all";
    				});

    				monthDays = this._makeMonthDays(startDay, endDay == -1 ? 31 : endDay, endDay == -1 ? true : false);
    				
    				if(months.length > 0 && monthDays.length > 0){
    					recurrenceCode = this._setICalFormat({"FREQ" : "YEARLY", "BYMONTH" : months.join(","), "BYMONTHDAY" : monthDays.join(",")});
    				}else{
						recurrenceCode = "";
					}
    				
    			}else if($("#weekly").is(":checked")) {	//매주반복
    				var months = [];
    				var weeks = [];
    				var days = [];
    				var byDays = [];
    				
    				_.each($("input[name=month]:checked"), function(checkbox){
    					months.push(checkbox.getAttribute("value"));
    				});
    				//매월은 제거
    				months = $.grep(months, function(value) {
	  					  return value != "all";
	  				});
    				_.each($("input[name=week]:checked"), function(checkbox){
    					weeks.push(checkbox.getAttribute("value"));
    				});
    				//매주 제거
    				weeks = $.grep(weeks, function(value) {
	  					  return value != "all";
	  				});
    				_.each($("input[name=day]:checked"), function(checkbox){
    					days.push(checkbox.getAttribute("value"));
    				});
    				
    				_.each(weeks, function(weekValue){
    					_.each(days, function(dayValue){
    						byDays.push(weekValue + dayValue);
    					});
    				});
    				
    				if(!$.isEmptyObject(months) && !$.isEmptyObject(byDays)){
    					recurrenceCode = this._setICalFormat({"FREQ" : "YEARLY", "BYMONTH" : months.join(","), "BYDAY" : byDays.join(",")});
    				}else{
						recurrenceCode = "";
					}
    			}
    			
    			var displayRecur = "";
    			if(recurrenceCode != undefined && recurrenceCode != ""){
    				this.recrurrenceHelper = new RecurrenceParser();
    				displayRecur = this.recrurrenceHelper.parse(recurrenceCode).humanize();
    			}
    			$("#recurrence_label").attr("data-recurrence", recurrenceCode);
    			$("#recurrence_label").text(CalLang["반복"] + ": " + displayRecur);
            },
            changeTarget : function(e) {
            	var currentTarget = $(e.currentTarget);
            	if(currentTarget.is(':checked')){
            		$("#target").hide();
            	}else{
            		$("#target").show();
            	}
            },
            changeTerm : function(e) {
            	var currentTarget = $(e.currentTarget),
            		selectVal = currentTarget.val();
            	$("[id*='_select']").hide();
            	if(selectVal != "scope"){
            		$("div#monthly").show();
            		$("#reccurrenceDetail").show();
            	}else{
            		$("div#monthly").hide();
            		$("#reccurrenceDetail").hide();
            	}
            	$("#" + selectVal + "_select*").show();
            },
            changeMonthOrWeek : function(e) {
            	var currentTarget = $(e.currentTarget),
            		targetName = currentTarget.attr('name'),
        			targetId = currentTarget.attr('id');
            	
            	if(targetName == "month" && (!$(e.currentTarget).is(':checked') && targetId != "month_all")){
            		$("#month_all").attr("checked", false);
            	}
            	if(targetName == "week" && (!$(e.currentTarget).is(':checked') && targetId != "week_all")){
            		$("#week_all").attr("checked", false);
            	}
            },
            selectAll : function(e) {
            	var currentTarget = $(e.currentTarget),
            		targetChecked = currentTarget.is(":checked");
            	$("input[name='" + currentTarget.attr("name") + "']").attr("checked", targetChecked);
            },
            changeDay : function(e) {
            	var currentTarget = $(e.currentTarget),
        			selectId = currentTarget.attr("id"),
        			selectVal = currentTarget.val();
            	if(parseInt(selectVal) > parseInt($("#endDay option:selected").val()) || selectVal == -1){
            		if($("#endDay option:selected").val() != -1){
            			$("#endDay").val(selectVal);
            		}
            	}
            	var prevOptions = $("#" + selectId + " option:selected").prevAll();
            	$("#endDay").children().attr("disabled", false);
            	_.each(prevOptions, function(option) {
            		$("#endDay option[value=" + option.value +"]").attr("disabled", true);
            	});
            	
            },
            preview : function(){
                var popupSizeEl = this.$el.find("input:radio[name='popup_size']:checked"),
                    popupWidth = popupSizeEl.val().split("|")[0],
                    popupHeight= popupSizeEl.val().split("|")[1],
                    content = GO.Editor.getInstance("notice_editor").getContent();
                
				$.go(GO.contextRoot + 'ad/api/notice/contentpreview', JSON.stringify({content : content}), {
					qryType : 'POST',
					contentType : 'application/json',
					responseFn : function(rs) {
						callback(rs.data);
					}
				});
				var self = this;
				var callback = function(content){
	                $.goNotice.makePreviewItem({
	                    content : content,
	                    modal : true,
	                    title : self.$el.find("#title").val(),
	                    width : popupWidth,
	                    height : popupHeight,
	                    option : self.$el.find("input:radio[name='option']:checked").val(),
	                    attaches : getAttaches.call(self)
	                }).css({"left" : "30%", "top" : "20%"});
				}
            },
            
            cancel : function(){
                var url = "company/notice";
                
                GO.router.navigate(url, {trigger: true});
            },
            
            removeAttach : function(e){
                var targetEl = $(e.currentTarget),
                    attcheEl = targetEl.parents("li:first");
                
                attcheEl.remove();
            },
            _getDay : function() {
				return [
				    {text : CalLang["일"], value : "SU"}, 
				    {text : CalLang["월"], value : "MO"},
				    {text : CalLang["화"], value : "TU"},
				    {text : CalLang["수"], value : "WE"},
				    {text : CalLang["목"], value : "TH"},
				    {text : CalLang["금"], value : "FR"},
				    {text : CalLang["토"], value : "SA"}
				];
			},
			_getWeek : function() {
				return [
					    {text : CalLang["첫째주"], value : "1"}, 
					    {text : CalLang["둘째주"], value : "2"},
					    {text : CalLang["셋째주"], value : "3"},
					    {text : CalLang["넷째주"], value : "4"},
					    {text : CalLang["다섯째주"], value : "5"}
					];
			},
			_getTermData : function(min, max) {
				var data = [];
				for ( var int = min; int <= max; int++) {
					data.push({"value" : int});
				}
				
				return data;
			},
			_makeMonthDays : function(startDay, endDay, isLastDay) {
				var list = [];
				for(var i = parseInt(startDay); i <= parseInt(endDay); i++){
					list.push(i);
				}
				if(isLastDay) {
					list.push(-1);
				}
				return _.filter(list, this._onlyUnique);
			},
			_onlyUnique : function(value, index, self) {
	        	return self.indexOf(value) === index;
	        },
			_setICalFormat : function(data) {
			    var recurrenceStr = [];
	             $.each(data, function(key, value){
	                 if($.trim(value) != ""){
	                     recurrenceStr.push(key+"="+value);
	                 }
	             });
			    
				return recurrenceStr.join(";");
			},
            _renderRecurrence : function(recurrenceCode) {
                var recurrence = recurrenceParse(recurrenceCode);
                var months = recurrence.BYMONTH.split(",");
                
                if(months.length == 12){
                	$("input[name='month']").attr("checked", true);
                }else{
                	_.each(months, function(value){
                		$("input[name='month'][value='"+ value +"']").attr("checked", true);
                	});
                }

                if($("input[name='term']:checked").attr("id") == "monthly_radio"){
              		var monthDays = recurrence.BYMONTHDAY.split(","),
              			first = monthDays.shift(),
              			last = monthDays.pop();
              		
              		$("#startDay").val(first);
              		$("#endDay").val(last);
              		
              	}else if($("input[name='term']:checked").attr("id") == "weekly"){
              		var byDay = recurrence.BYDAY.split(",");
              		_.each(byDay, function(value) {
              			var week = value.replace(/[^-1-9]/g,"");
              			var day = value.replace(week,"");
              			$("input[name='week'][value='"+ week +"']").attr("checked", true);
              			$("input[name='day'][value='"+ day +"']").attr("checked", true);
              		});
              		if($("input[name=week]:checked").length == 6){
              			$("input[name=week]").attr("checked", true);
              		}
              	}
            },
        },
        {
            render : function(options){
                var noticeForm = new NoticeForm(options);
                noticeForm.render();
                return noticeForm;
            }
        }
        );
        
        function recurrenceParse(recurrence){
            var recurrenceJSON = {};
            
            $.each(recurrence.split(";"), function(){
                var key = "";
                    value = "";
                $.each(this.split("="), function(index, data){
                    if(index==0){
                        key = data;
                    }else{
                        value = data;
                    }
                });
                
                recurrenceJSON[key] = value;
            });
            
            return recurrenceJSON;
        }
        
        function setData(){
            var popupSizeEl = this.$el.find("input:radio[name='popup_size']:checked"),
                popupDevice = this.$el.find("input:radio[name='popup_device']:checked"),
            	targetAll = this.$el.find("#targetAll").is(":checked"),
                popupWidth = popupSizeEl.val().split("|")[0],
                popupHeight = popupSizeEl.val().split("|")[1],
                showWeb = popupDevice.val() == 'all' || popupDevice.val() == 'web',
                showMobile = popupDevice.val() == 'all' || popupDevice.val() == 'mobile',
                startTime =  this.$el.find("#startDate").val() + ' 00:00',
                endTime = this.$el.find("#endDate").val() + ' 23:59',
                state = this.$el.find("#state").is(":checked") ? "NORMAL" : "HIDDEN";                
                
			var target = targetAll ? null : this.targetView.getData();
			var recurrence = $("#recurrence_label").attr("data-recurrence") ? $("#recurrence_label").attr("data-recurrence") : null;
            
            this.model.set({
                "title" : this.$el.find("#title").val(),
                "content" : GO.Editor.getInstance("notice_editor").getContent(),
                "startTime" : startTime,
                "endTime" : endTime,
                "option" : this.$el.find("input:radio[name='option']:checked").val(),
                "width" : popupWidth,
                "height" : popupHeight,
                "showWeb" : showWeb,
                "showMobile" : showMobile,
                "attaches" : getAttaches.call(this),
                "targetAll" : targetAll,
                "target" : target,
                "state" : state,
                "recurrence" : recurrence
            });
        };
        
        function getAttaches(){
            var attaches = [];
            
            $.each(this.$el.find("#attaches li"), function(index, data){
                var $el = $(data);
                
                attaches.push({
                    id : $el.attr("data-id"),
                    name : $el.attr("data-name"),
                    path : $el.attr("data-path"),
                    hostId : $el.attr("host-id"),
                    extention : $el.attr("data-name").split(".")[$el.attr("data-name").split(".").length -1],
                    size : $el.attr("data-file-size"),
                    downloadUrl : "#"
                });
            });
            
            return attaches;
        };
        
        function validate(){
        	var recurData = $("#recurrence_label").attr("data-recurrence");
        	if(!$("#scope").is(":checked") && (recurData == "" || recurData == undefined)){	//반복일정인데 선택된 반복일정이 없다면
        		$.goMessage(CommonLang["반복 기간을 설정해 주세요."]);
        		return false;
        	}
        	
            if(!$.goValidation.isCheckLength(0, 64, this.model.get("title"))){
                this.$el.find("#name_validation").show();
                this.$el.find("#title").focus();
                return false;
            }else{
                this.$el.find("#name_validation").hide();
                return true;
            }
        };

        function initContent() {
            if(this.model.get("attaches")){
                $.each(this.model.get("attaches"), function(){
                    this.file_icon = GO.util.getFileIconStyle({extention : this.extention});
                    this.sizeByKb = GO.util.getHumanizedFileSize(this.size);
                });
            }
            
            this.$el.html(NoticeFormTmpl({
                lang : lang,
                data : $.extend({}, this.model.toJSON(), {
                	dayTerm : this._getDay(),
                	dateTerm : this._getTermData(1, 31),
        			weekTerm : this._getWeek(1, 5),
        			monthTerm : this._getTermData(1, 12),
                	hasRecurrence : this.model.hasRecurrence(),
                	hasByMonthDay : this.model.hasByMonthDay(),
                	hasByDay : this.model.hasByDay(),

                    isShowAll : this.model.isShowAll(),
                    isShowWeb : this.model.isShowWeb(),
                    isShowMobile : this.model.isShowMobile(),
                    
                	isNormalState : this.model.isNormalState(),
                    isSize400_600 : this.model.isSize400_600(),
                    isSize520_600 : this.model.isSize520_600(),
                    isSize800_600 : this.model.isSize800_600(),
                    
                    isAlwaysMode : this.model.isAlwaysMode(),
                    isDayMode : this.model.isDayMode(),
                    isWeekMode : this.model.isWeekMode(),
                    isNoneMode : this.model.isNoneMode(),
                    
                    convertedStartTime : this.model.getConvertStartTime(),
                    convertedEndTime : this.model.getConvertEndTime(),
                    
                    files : this.model.get("attaches")
                })
            }));
            
            var recurrenceCode = this.model.get("recurrence"),
            	displayRecur = "";
            if(recurrenceCode != undefined && recurrenceCode != ""){
            	this.recrurrenceHelper = new RecurrenceParser();
				displayRecur = this.recrurrenceHelper.parse(recurrenceCode).humanize();
				this._renderRecurrence(recurrenceCode);
			}
			$("#recurrence_label").attr("data-recurrence", recurrenceCode);
			$("#recurrence_label").text(CalLang["반복"] + ": " + displayRecur);
            
            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
    		if(GO.util.isUseOrgService(true)){
    			nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
    		}
    		
    		this.targetView = new CircleView({
    			selector: '#target',
    			isAdmin: true,
    			isWriter: true,
    			circleJSON: this.model.get('target'),
    			nodeTypes: nodeTypes
    		});
    		
    		this.targetView.render();
    		if(this.model.get('targetAll')){
    			this.targetView.hide();
    		}else{
    			this.targetView.show();
    		}
        };
        
        function initDatepicker() {
            var startDate = $("#startDate"),
            endDate = $("#endDate");
        
            $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
            
            startDate.datepicker({
                dateFormat : "yy-mm-dd",
                changeMonth: true,
                changeYear : true,
                yearSuffix: "",
                minDate : GO.util.customDate(new Date(), "YYYY-MM-DD"),
                onSelect: function( selectedDate ) {
                    endDate.datepicker( "option", "minDate", selectedDate );
                }
            });
            
            endDate.datepicker({
                dateFormat : "yy-mm-dd",
                changeMonth: true,
                changeYear : true,
                yearSuffix: "",
                minDate : this.model.getConvertStartTime()
            });     
        };
        
        function initEditor(view, param1, param2) {
            var editorValue = this.isCreate ? "" : this.model.get("content");
            editorValue = GO.util.escapeEditorContent(editorValue);

            $("#notice_editor").goWebEditor({
            	contextRoot: GO.config('contextRoot'),
                lang: GO.session('locale'),
                editorValue : editorValue
            });
        };
        
        function initFileUpload(){
            var self = this,
                options = {
                    el : "#file-control",
                    context_root : GO.contextRoot ,
                    button_text : "<span class='buttonText'>"+lang.attach_file+"</span>",
                    button_width : 100,
                    button_height: 22,
                    url : "ad/api/file?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
            };
            
            (new FileUpload(options))
            .queue(function(e, data){
                
            })
            .start(function(e, data){
                
            })
            .progress(function(e, data){
                
            })
            .success(function(e, resp, fileItemEl){
                var isImage = GO.util.isImage(resp.data.fileExt),
                    attacheEl = self.$el.find("#attaches"),
                    fileAttachEl = attacheEl.find("ul.file_wrap"),
                    data = resp.data,
                    fileName = data.fileName,
                    filePath = data.filePath,
                    hostId = data.hostId,
                    fileSize = GO.util.getHumanizedFileSize(data.fileSize),
                    fileClass = GO.util.getFileIconStyle({extention : data.fileExt}),
                    tmpl = "";
            
                tmpl = "<li class='item_file' data-name='"+ fileName + "' data-file-size='"+ data.fileSize +"' data-path='"+ filePath +"' host-id='" + hostId + "'>"+
                            "<span class='item_file'>"+
                                "<span class='ic_file " + fileClass + "'></span>"+
                                "<span class='name'>"+fileName+"</span>"+
                                "<span class='size'>("+fileSize+")</span>"+
                                "<span class='btn_wrap' title='"+  lang["remove"]  +"'>"+
                                    "<span class='ic_classic ic_del'></span>"+
                                "</span>"+
                            "</span>"+
                        "</li>";
            
                $fileTmpl = $(tmpl);
                
                $fileTmpl.find("span.ic_del").on("click", function(){
                    var attachArea = $(this).parents("div#commentAttachPart");
                    $(this).parents("li[data-name]").remove();
                    var count = attachArea.find("li").length;
                    if (!count) attachArea.removeClass("option_display");
                });
                
                fileAttachEl.append($fileTmpl);
            })
            .complete(function(e, data){
            })
            .error(function(e, data){
            });
        }

        return NoticeForm;
    });

})();
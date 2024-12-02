;(function() {
    define([
            "app",
            
            "i18n!nls/commons",
            "i18n!report/nls/report",
            "i18n!calendar/nls/calendar",
            "hgn!report/templates/folder_create",
            
            "report/views/report_title",
            "report/collections/report_recent_list",
            "report/models/report_folder",
            
            "views/circle",
            "go-nametags",
            "views/form_editor",
            "views/form_list",
            "collections/joined_depts",
            'components/form_component_manager/report_form_manager',
            
            "jquery.go-sdk",
            "jquery.go-orgslide",
            "jquery.go-validation",
            "jquery.go-popup",
            "jquery.go-preloader"
            ], 
    function(
            App,
            
            CommonLang,
            ReportLang,
            CalendarLang,           
            ReportFolderCreateTmpl,
            
            ReportTitleView,
            ReportRecentList,
            ReportFolder,
            
            CircleView, 
            NameTagListView,
            FormEditorView,
            FormListView,
            JoinedDeptCollection,
            FormComponentManager
    ) {
        
        var WEEKDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"],
            WEEKDAYTEXT = [
               CalendarLang["일요일"], 
               CalendarLang["월요일"], 
               CalendarLang["화요일"], 
               CalendarLang["수요일"], 
               CalendarLang["목요일"],
               CalendarLang["금요일"],
               CalendarLang["토요일"]
            ];
            
        var lang = {
        	'addFolder' : ReportLang["보고서 추가"],
        	'department' : ReportLang["위치"],
        	'folderName' : ReportLang["제목"],
        	'desc' : ReportLang["설명"],
        	'privateSetting' : ReportLang["비공개 설정"],
        	'private' : ReportLang["비공개"],
        	'share' : ReportLang["보고자 간 공개"],
        	'shareDesc' : ReportLang["보고자 간 공개 설명"],
        	'alone' : ReportLang["보고자 간 비공개"],
        	'aloneDesc' : ReportLang["보고자 간 비공개 설명"],
        	'reporter' : ReportLang["보고자"],
        	'all' : ReportLang["부서원 전체"],
        	'rowRank' : ReportLang["하위 부서원 포함"],
        	'directly' : ReportLang["직접 지정"],
        	'addReporter' : ReportLang["보고자 추가"],
        	'referer' : ReportLang["참조자"],
        	'addReferer' : ReportLang["참조자 추가"],
        	'admin' : ReportLang["운영자"],
        	'addAdmin' : ReportLang["운영자 추가"],
        	'type' : ReportLang["유형"],
        	'series' : ReportLang["정기 보고서"],
        	'anytime' : ReportLang["수시 보고서"],
        	'everyDay' : ReportLang["매일"],
        	'everyWeek' : ReportLang["매주"],
        	'everyMonth' : ReportLang["매월"],
        	'daily' : CalendarLang["일마다"],
        	'weekly' : CalendarLang["주마다"],
        	'monthly' : CalendarLang["월마다"],
        	'last' : ReportLang["마지막"],
        	'date' : ReportLang["일"],
        	'th' : ReportLang["번째"],
        	'day' : ReportLang["요일"],
        	'repeat' : ReportLang["반복"],
        	'reportForm' : ReportLang["보고양식"],
        	'notUse' : ReportLang["사용하지 않음"],
        	'use' : ReportLang["사용함"],
        	'preview' : ReportLang["미리보기"],
        	'editForm' : ReportLang["양식편집"],
        	'ok' : ReportLang["확인"],
        	'cancel' : ReportLang["취소"],
        	'delete' : CommonLang["삭제"],
        	"save" : CommonLang["저장"],
        	"otherForm" : CommonLang["다른 양식 불러오기"],
        	"formEditorTitle" : CommonLang["양식 편집기"],
        	"reportCreate" : ReportLang["보고서 추가"],
        	"reportEdit" : ReportLang["보고서 수정"],
        	"require_admin" : ReportLang["운영자를 선택해 주세요."],
        	"require_reporter" : ReportLang["보고자를 선택해 주세요."],
        	"require_recurrence" : ReportLang["요일을 선택해 주세요."],
        	"folder_change_title" : CommonLang["변경사항 확인"],
        	"folder_change_content" : ReportLang["폴더 수정 변경사항 알림"],
        	"remove_msg" : ReportLang["보고서 및 선택한 보고서 내 모든 데이터가 삭제 됩니다. 삭제하시겠습니까?"],
        	"create_success" : CommonLang["저장되었습니다."],
        	"update_success" : CommonLang["변경되었습니다."],
			"delete_success": CommonLang["삭제되었습니다."],
			"reporters" : ReportLang["보고자"],
			"referrers" : ReportLang["참조자"],
			"admins" : ReportLang["운영자"],
			"recurrence_desc" : ReportLang["정기보고안내"],
            "periodicToolTip" : ReportLang["정기 보고서 툴팁"]
        };
        
        var ReportFolderCreateView = Backbone.View.extend({
            events: {
            	"change select[data-tag=repeatSelect]" : "changeRepeatDate",
            	"change input[data-tag=repeatSelect]" : "changeRepeatDate",
            	"change input[name=folderType]" : "folderTypeOptionViewToggle",
            	"change input[name=reporter]" : "reporterOptionViewToggle",
            	"click input#privateFlag" : "privateOptionViewToggle",
            	"click ul#repeatTab li" : "renderRepeatView",
            	"click a#submit" : "submit",
            	"click a#cancel" : "cancel",
            	"click a#delete" : "remove",
            	"click #editForm" : "editForm",
            	"click #formOption input:radio" : "formUseToggle",
            	"click tr[data-repeat='MONTHLY'] span.monthRecurrenceOption" : "monthRadioToggle",
            	"click #showFormPreview" : "showFormPreview"
            },
            initialize: function(options) {
            	this.options = options || {};
                var self = this;
                
                this.$el.off();
            	this.isCreate = this.options.id ? false : true;
            	this.folder = this.isCreate ? ReportFolder.init() :  ReportFolder.get(this.options.id);
            	this.joinedFolder = JoinedDeptCollection.fetch();
            	
            	if(!this.isCreate){
                    this.oldModel = this.folder.clone();
            	}
            	
                $("#content").on("insert:deptForm", function(e, content){
                    self.popupEditForm(content);
                });
            },
            showFormPreview : function(){
                FormEditorView.preview(this.folder.get("form").content, $.trim($("#deptId option:checked").text()));
            },
            formUseToggle : function(event){
                var flag = $(event.target).val();
                
                if(flag == "true"){
                    $("#formUseOption").show();
                }else{
                    $("#formUseOption").hide();
                }
            },
            
            editForm : function(){
                this.popupEditForm();
            },
            
            monthRadioToggle : function(e){
                var targetEl = $(e.target),
                    parentEl = targetEl.parents("span.monthRecurrenceOption");
                
                    parentEl.find("input:radio").attr("checked", true);
                    
                this.renderRepeatLabel( this.getRepeatType(e));
            },
            popupEditForm : function(content){
                var $body = $('body');
                var toggleEl = $body.find('.go_wrap, #organogram, .go_footer');
                var view = new FormComponentManager({
                    lang: GO.config('locale') || 'ko',
                    title: false,
                    editorId: 'formEditor',
                    content: content || this.folder.get("form").content,
                    saveCallback: _.bind(function(title, content) {
                        var form = this.folder.get('form');
                        this.folder.set({ form : $.extend({}, form, {content : content })});
                    }, this),
                    toggleEl: toggleEl
                });
                toggleEl.hide();
                $body.append(view.render().el);
            },
            render : function() {
            	var reportData = {
            		lang : lang,
        			departmentList : this.getDepartmentList(),
        			baseTerm : this.getTermData(1, 30),
        			dateTerm : this.getTermData(1, 31),
        			weekTerm : this.getTermData(1, 5),
        			dayTerm : this.getDay(),
        			data : $.extend(
        			        this.folder.toJSON(),
        			        {
        			            isOpen : this.folder.isOpen(),
        			            isReporterOpen : true,   // default value
        			            isPrivate : this.folder.isPrivate(),
        			            isMemberWrite : this.folder.isMemberWrite(),
        			            isDescendantWrite : this.folder.isDescendantWrite(),
        			            isSpecifiedWrite :this.folder.isSpecifiedWrite(),
        			            isPeriodic : this.folder.isPeriodic(),
        			            isOccasional : this.folder.isOccasional()
        			        })
            	};
            	
            	
                this.$el.html(ReportFolderCreateTmpl(reportData));
                $("#content").addClass("go_renew");
                
                this.renderNameTagView();
                
                this.circleView = new CircleView({
                    selector: '#referrers',
                    isAdmin: false,
                    isWriter: true,
                    circleJSON: this.folder.get('referrer'),
                    nodeTypes: ['user', 'department']
                });
        		this.circleView.render();
                
                this.renderRecurrence();
                
                if(this.isCreate){
                    ReportTitleView.create({
                        text : lang.reportCreate
                    });
                    $("#delete").hide();
                }else{
                    ReportTitleView.create({
                        text : lang.reportEdit,
                        meta_data : this.folder.get("department").name
                    });
                    $("#deptId").attr('disabled',true);
                    $("#delete").show();
                } 
                
                if(this.options.id){
                    $("#side").trigger("set:leftMenu", this.options.id);
                }
                
                return this;
            },
            cancel : function(){
            	var self = this;
                if (this.isCreate) {
    				$.goConfirm(CommonLang['취소하시겠습니까?'],
    						CommonLang['입력하신 정보가 초기화됩니다.'],
    						function() {
    							self.render();
    						});
                } else {
                    var url = "report/folder/" + this.folder.get("id") + "/reports";
                    App.router.navigate(url,{trigger: true});
                }
            },
            
            submit : function() {
            	// GO-16989: 중복 처리 방지(Bongsu Kang, kbsbroad@daou.co.kr)
            	if(getRequestStatus()) {
            		return;
            	}
            	
            	this.setData();
            	
            	if (!this.validation()) {
            		return false;
            	}
            	
            	// 요청 시작했음을 마킹
            	setRequestStatus(true);
            	
            	if(!this.isCreate && this.folder.isPeriodic() && isChangedFolder.call(this, this.folder, this.oldModel)){
            	    $.goConfirm(
        	    		lang.folder_change_title, 
        	    		lang.folder_change_content, 
        	    		$.proxy(saveCallback,this,this), 
        	    		function cancelCallback() {
        	            	setRequestStatus(false);
        	    		}
    	    		);
            	}else{
                    saveCallback(this);
            	}
            },
            
            remove : function(){
                var self = this;
            	var ids = [];

            	// GO-16989: 중복 처리 방지(Bongsu Kang, kbsbroad@daou.co.kr)
            	if(getRequestStatus()) {
            		return;
            	}
            	ids.push(this.folder.get("id"));

                var deptId = $("#deptId option:checked").val();
                $.goConfirm('', lang.remove_msg,
                        function() {
                            var url = GO.contextRoot + "api/report/folder", options = { id : deptId, ids : ids };
                            self.preloader = $.goPreloader();
                            self.preloader.render();

                            // 요청 시작했음을 마킹
                        	setRequestStatus(true);
                            $.go(url,JSON.stringify(options), {
                                async : true,
                                qryType : 'DELETE',
                                data : JSON.stringify(options),
                                contentType : 'application/json',
                                responseFn : function(response) {
                                    self.preloader.release();
                                    if (response.code === "200") {
                                        $.goMessage(lang.delete_success);
                                        App.router.navigate("report/folder", {trigger: true});
                                    }
                                    setRequestStatus(false);
                                },
                                error : function(error) {
                                    self.preloader.release();
                                    $.goAlert(CommonLang["삭제에 실패하였습니다."]);
                                    setRequestStatus(false);
                                }
                            });
                        });
            },
            
            setData : function() {
            	this.folder.set({
            	    department : {
            	        id : $("select#deptId").val()
            	    },
            		name : $.trim($("input#folderName").val()),
            		description : $.trim($("textarea#description").val()),
            		publicOption : this._getPublicOption(),
            		admin : this._getAdminIds(),
            		reporter : this._getReporterIds(),
            		type : $("#folderTypeOption input:radio[name='folderType']:checked").val(),
            		formFlag : $("#formOption input:radio:checked").val() === "true"
            	});
  				
            	this.folder.set('referrer', this.circleView.getData());				
            },
            _getAdminIds : function(){
                var admins = [];
                $.each($("#admins li[data-id]"), function(index, data){
                    admins.push(
                            {
                                nodeId : parseInt($(this).attr("data-id")),
                                nodeType : "user"
                            }
                         );
                    
                });
                
                if(this.isCreate){
                    return {nodes : admins};
                }else{
                    return { id : this.folder.get("admin").id , nodes : admins};
                }
   
                
            },
            _getReporterIds : function(){
                var reporters = [],
                    reporterOption = $("#reporterOption input:radio:checked").val();
                    
                if(reporterOption == "SPECIFIED"){
                    $.each($("#reporters li[data-id]"), function(index, data){
                        reporters.push(
                            {
                                nodeId : parseInt($(this).attr("data-id")),
                                nodeType : "user"
                            }
                        );
                    });
                }else{
                    var deptId = $("#deptId option:checked").val(),
                        descendantEl = $("#descendantUse"),
                        descendantFlag = descendantEl.is(":checked");
                    
                    if(reporterOption == "MEMBER" && descendantFlag){
                        reporters.push({
                            nodeId : deptId,
                            nodeType : "subdepartment"
                        });
                    }else{
                        reporters.push({
                            nodeId : deptId,
                            nodeType : "department"
                        });
                    }
                }
                
                if(this.isCreate){
                    return {nodes : reporters};
                }else{
                    return { id : this.folder.get("reporter").id , nodes : reporters};
                }
                
            },
            _getPublicOption : function(){
                var privateEl = $("#privateFlag"),
                    privateFlag = privateEl.is(":checked");
                
                if(privateFlag){
                    return $("#privateOptionView input:radio:checked").val();
                }else{
                    return privateEl.val();
                }
            },
            _getReporterOption : function(){
                var descendantEl = $("#descendantUse"),
                    descendantFlag = descendantEl.is(":checked")
                if(descendantFlag){
                    return descendantEl.val();
                }else{
                    return $("#reporterOption input:radio:checked").val();
                }
            },
            renderRecurrence : function() {
                var self = this,
                    date = new Date(),
                    recurrence = "";
                
                if(this.isCreate){
                    $("tr[data-repeat=WEEKLY]").find("input:checkbox[value=" + date.getDay() + "]").attr("checked", true);
                }
                var monthly = $("tr[data-repeat=MONTHLY]");
                monthly.find("select#date").val(date.getDate());
                monthly.find("select#week").val(this.getWeekOfMonth(date));
                monthly.find("select#day").val(date.getDay());
                    
                if(!this.isCreate){
                    recurrence = recurrenceParse(this.folder.get("recurrence"));
                    
                    $.each($("#recurrence_table tr").not(".recurrence_label"), function(){
                        var recurrenceTr = $(this),
                            recurrenceType = recurrenceTr.attr("data-repeat");
                        
                        if(recurrenceType == recurrence.FREQ){
                            recurrenceTr.show();
                            self["set" +recurrenceType+ "Render"].call(self, recurrence);
                        }else{
                            recurrenceTr.hide();
                        }
                    });
                }
            	
            	var freq = this.isCreate ? "WEEKLY" : recurrence.FREQ; 
            	this.renderRepeatLabel(freq);
            },
            setDAILYRender : function(recurrence){
                var interval = recurrence.INTERVAL;
                $("tr[data-repeat=DAILY]").find("select [value='"+ interval +"']").attr("selected", true);
            },
            
            setWEEKLYRender : function(recurrence){
                var byDayArr = recurrence.BYDAY.split(","),
                    interval = recurrence.INTERVAL;
                
                $("tr[data-repeat=WEEKLY]").find("select [value='"+ interval +"']").attr("selected", true);
                $.each(byDayArr, function(index, data){
                    var index = WEEKDAY.indexOf(data);
                    $("tr[data-repeat=WEEKLY]").find("input:checkbox[value=" + index + "]").attr("checked", true);
                })
                
            },
            
            setMONTHLYRender : function(recurrence){
                var byDayArr = recurrence.BYDAY,        // 요일
                    bySetPos = recurrence.BYSETPOS,     // 몇 번째 (마지막 -1)
                    interval = recurrence.INTERVAL,         // 개월
                    byMonthDay = recurrence.BYMONTHDAY;    // 개월의 몇일
                    
                
                    $("tr[data-repeat=MONTHLY]").find("#month [value='"+ interval +"']").attr("selected", true);
                    
                    if(byMonthDay){
                        $("tr[data-repeat=MONTHLY]").find("input:radio[value=byMonthDay]").attr("checked", true);
                        $("tr[data-repeat=MONTHLY]").find("#date option[value='"+byMonthDay+"']").attr("selected", true);
                    }else{
                        $("tr[data-repeat=MONTHLY]").find("input:radio[value=bySetPos]").attr("checked", true);
                        $("tr[data-repeat=MONTHLY]").find("#week option[value='"+bySetPos+"']").attr("selected", true);
                        var index = WEEKDAY.indexOf(byDayArr);
                        $("tr[data-repeat=MONTHLY]").find("#day option[value=" + index + "]").attr("selected", true);
                    }
                    
                    
            },
            
            setWEEKLY : function(){
                recurrence = recurrenceParse(this.folder.get("recurrence"));
            },
            
            getWeekOfMonth : function(date) {
            	var firstDate = new Date(date.getFullYear() + "/" + (date.getMonth() + 1) + "/01");
            	return Math.ceil((date.getDate() + firstDate.getDay()) / 7);
            },
            
            getDepartmentList : function() {
            	if (this.folder.isNew()) {
            		var joindDepartment = [],
					    selectedId = this.isCreate ? "" : this.folder.get("department").id,
					    joinDeptData = this.joinedFolder.toJSON();
					    
					if (!joinDeptData.length) {
						App.router.navigate("report", { trigger : true, replace : true});
						$.goAlert('',ReportLang['부서가 설정되지 않아 보고서를 추가 할 수 없습니다.']);
					} else {
					    var department = _.sortBy(joinDeptData, "id");
						joindDepartment = $(department).map(function(k, v) {
							return ['<option value="',v.id,'"',v.id == selectedId ? 'selected="selected"' : '','>',v.name,'</option>' ].join('');
						}).get();
					}
					
					return joindDepartment.join('');
            	} else {
            		var dept = this.folder.get('department');
            		return ['<option value="',dept.id,'" selected="selected">',dept.name,'</option>'].join('');
            	}
			},
			
			privateOptionViewToggle : function(){
				$("#privateOptionView").toggle();
			},
			
			
			reporterOptionViewToggle : function(e){
				if ($(e.target).val() == "SPECIFIED") {
					$("#descendantUse").attr("disabled", true).attr("checked", false);
					$("#reporterOptionView").show();
				} else {
					$("#descendantUse").attr("disabled", false);
					$("#reporterOptionView").hide();
				}
			},
			
			
			renderNameTagView : function() {
				var self = this;
				this.$el.find('div.wrap_name_tag').each(function(key, value) {
				    var nameTag = ""; 
				    
				    if(value.id == "reporters" && !self.folder.isSpecifiedWrite()){
				        nameTag = NameTagListView.create([], {useAddButton : true});
				    }else{
				        nameTag = NameTagListView.create(self.folder[value.id +"NameTag"].call(self.folder), {useAddButton : true});
				    }
				    
					$(this)
						.empty()
						.append(nameTag.el)
						.data('instance', nameTag)
						.data("type", $(this).attr("id"));
										
					nameTag.$el.on('nametag:clicked-add', function(e, nameTag) {
					    var type = nameTag.$el.parent().data("type");
						$.goOrgSlide({
							header : lang['manager_select'],
							desc : lang['manager_select_desc'],
							type : "list",
							contextRoot : GO.contextRoot,
							memberTypeLabel : lang[type],
							externalLang : CommonLang,
							isBatchAdd : true,
							callback : $.proxy(function(info) {
								nameTag.addTags(info, { removable : true, "attrs": info });
							})
						});
					});
				});
			},
			
			
			folderTypeOptionViewToggle : function(e) {
				if ($(e.currentTarget).val() == "PERIODIC") {
					$("#folderTypeOptionView").show();
				} else {
					$("#folderTypeOptionView").hide();
				}
			},
			
			
			renderRepeatView : function(e) {
				var type = this.getRepeatType(e),
					tabRoot = $("ul.tab_nav");
				tabRoot.children().removeClass("on");
				tabRoot.find("li[data-repeat=" + type + "]").addClass("on");
				
				$("tr[data-type=option]").hide();
				
				this.renderRepeatLabel(type);
			},
			
			
			changeRepeatDate : function(e) {
				this.renderRepeatLabel( this.getRepeatType(e));
			},
			
			
			getRepeatType : function(e) {
				return $(e.target).attr("data-repeat") || $(e.target).parents("li").attr("data-repeat") || $(e.target).parents("tr").attr("data-repeat");
			},
			
			
			renderRepeatLabel : function(type) {
				var context = this.getRepeatViewContext(type),
					text = this.getRepeatLabel(type),
					data = [];
				
				$.each(this.$el.find("#folderTypeOptionView tr[data-type='option']"),function(){
				    $(this).hide();
				});
				
                $.each(this.$el.find("#repeatTab li"),function(){
                    var el = $(this);
                    
                    if(el.attr("data-repeat") == type){
                        el.addClass("on");
                    }else{
                        el.removeClass("on");
                    }
                });
				
				context.show();
				$("span#repeatLabel").text(text);
			},
			
			
			getRepeatViewContext : function(type) {
				return $("tr[data-repeat=" + type + "]");
			},
			
			
			getRepeatLabel : function(type) {
				var label = "";
				if (type == "DAILY") {
					label = this.getDailyLabel(type);
				} else if (type == "WEEKLY") {
					label = this.getWeeklyLabel(type);
				} else {
					label = this.getMonthlyLabel(type);
				}
				
				return label;
			},
			
			
			getDailyLabel : function(type) {
				var context = this.getRepeatViewContext(type),
					label = "",
				    date = context.find("select[data-seq=1]").val();
				
				if (date == 1) {
					label = ReportLang["매일"];
				} else {
					label = App.i18n(CalendarLang["{{monthday}}일마다"],{monthday : date});
				}
				
				this.setICalFormat({"FREQ" : "DAILY", "INTERVAL" : date});
				
				return label;
			},
			
			
			getWeeklyLabel : function(type) {
				var context = this.getRepeatViewContext(type),
					dayTemplate = this.getDay(),
					dayString = [],
					days = [],
					daysText = [],
					label = "",
					frequecy = "",
					week = context.find("select[data-seq=1]").val();
				
				if (week == 1) {
				    frequecy = ReportLang["매주"];
				} else {
				    frequecy = App.i18n(CalendarLang["{{week}}주마다"], {week : week});
				}
				
				_.each(context.find("input[name=day]:checked"), function(checkbox){
					days.push(WEEKDAY[checkbox.getAttribute("value")]);
					daysText.push(WEEKDAYTEXT[checkbox.getAttribute("value")]);
				});
				
				this.setICalFormat({"FREQ" : "WEEKLY", "INTERVAL" : week, "BYDAY" : days.join(",")});
				
                label = App.i18n(CalendarLang["{{frequecy}}마다 {{interval_options}}({{until_or_count}})"],
                        {
                            frequecy : frequecy,
                            interval_options : daysText.join(", ")
                        });
				return label;
			},
			
			
			getMonthlyLabel : function(type) {
				var viewContext = this.getRepeatViewContext(type),
					dayTemplate = this.getDay(),
					month = viewContext.find("select[data-seq=1]").val(),
					week = null,
					label = null,
					frequecy = "",
					interval_options = "",
					iCal = {};
				
				if(month == 1){
				    frequecy = ReportLang["매월"];
				}else{
				    frequecy = App.i18n(CalendarLang["{{month}}개월마다"], {month : month});
				}
				
				
				var context = viewContext.find("input[data-seq=2]:checked").parents("span.monthRecurrenceOption").find("select");
				if (context.attr("id") == "date") {
					var date = $(context[0]).val(),
					    interval_options = App.i18n(CalendarLang["{{monthday}}일"], {monthday : date});
					
					iCal = {"FREQ" : "MONTHLY", "INTERVAL" : month, "BYMONTHDAY" : date};  
				} else { // week
					week = $(context[0]).val();
					var day = $(context[1]).val(), 
					    ordinary = "";
					
					iCal = {"FREQ" : "MONTHLY", "INTERVAL" : month, "BYDAY" : WEEKDAY[day], "BYSETPOS" : week};
					
					if(week > 0){
					    ordinary = GO.util.parseOrdinaryNumber(week, GO.config("locale"));
					    interval_options = App.i18n(CalendarLang["{{nth}}번째 {{weekday}}"], {nth : ordinary, weekday : WEEKDAYTEXT[day]});
					}else{
					    ordinary = ReportLang["마지막"];
					    interval_options = ordinary + " " + WEEKDAYTEXT[day];
					}
				}
				
				this.setICalFormat(iCal);
				
                label = App.i18n(CalendarLang["{{frequecy}}마다 {{interval_options}}({{until_or_count}})"],
                        {
                            frequecy : frequecy,
                            interval_options : interval_options
                        });
				
				return label;
			},
			
			setICalFormat : function(data) {
			    var recurrenceStr = [];
	             $.each(data, function(key, value){
	                 if($.trim(value) != ""){
	                     recurrenceStr.push(key+"="+value);
	                 }
	             });
			    
				this.folder.set({recurrence : recurrenceStr.join(";")});
			},
			
			
			getTermData : function(min, max) {
				var data = [];
				for ( var int = min; int <= max; int++) {
					data.push({"value" : int});
				}
				
				return data;
			},
			
			
			getDay : function() {
				return [
				    {text : ReportLang["일"], value : 0}, 
				    {text : ReportLang["월"], value : 1},
				    {text : ReportLang["화"], value : 2},
				    {text : ReportLang["수"], value : 3},
				    {text : ReportLang["목"], value : 4},
				    {text : ReportLang["금"], value : 5},
				    {text : ReportLang["토"], value : 6}
				];
			},
			
			getStrLength : function(str) {
				return escape(str).split("%u").join("").length;
			},
			
			validation : function() {
			    
			    if(this.folder.get("name").length == 0){
			        $.goMessage(CommonLang["필수항목을 입력하지 않았습니다."]);
			        $("#folderName").focus();
			        return false;
			    }
			    
				if(!$.goValidation.isCheckLength(2, 100, this.folder.get("name"))){
                    $.goMessage( App.i18n(CommonLang["0자이상 0이하 입력해야합니다."],{arg1 : 2, arg2 : 100}));
                    $("#folderName").focus();
				    return false;
				};
			    
				if(!$.goValidation.isCheckLength(0, 2000, this.folder.get("description"))){
				    $.goMessage( App.i18n(CommonLang["최대 {{arg1}}자 까지 입력할 수 있습니다."],{arg1 : 2000}));
				    $("#description").focus();
				    return false;
				};
				
				var recurrence = recurrenceParse(this.folder.get("recurrence"));
				
				if(this.folder.isPeriodic() && recurrence.FREQ == "WEEKLY"){
				    if($("#recurrence_table tr[data-repeat='WEEKLY'] input:checkbox:checked").length == 0){
				        $.goMessage(lang.require_recurrence);
				        return false;
				    }
				}
				
				if(this.folder.get("admin").nodes.length == 0){
				    $.goMessage(lang.require_admin);
				    return false;
				}
				
				if(this.folder.get("reporter").nodes.length == 0){
                    $.goMessage(lang.require_reporter);
                    return false;
				}
				
				return true;
			}
        });
        
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
        
        function saveCallback(context){
        	var _this = context instanceof Array ? context[0] : context;
        	
        	_this.folder.save(null, {
        	    success : function(){
        	        var message = lang.create_success;
        	        
        	        if(!_this.isCreate){
        	            message = lang.update_success;
        	        }
        	        
        	        $.goMessage(message);
        	        setTimeout(function(){
                        App.router.navigate("report/folder/" + _this.folder.get("id") + "/reports", {trigger: true});
        	        },100);
        	        
        	        setRequestStatus(false);
        	    }
        	});
        }
        
        function isChangedFolder(oldModel, newModel){
            if(oldModel.get("recurrence") != newModel.get("recurrence")){
                return true;
            }
            
            if(oldModel.get("formFlag") != newModel.get("formFlag")){
                return true;
            }else if(oldModel.get("form").content != newModel.get("form").content){
                return true;
            }
        }
        
        // save시 요청이 시작되었음을 체크하기 위한 플래그
		var __startRequest__ = false;
		function setRequestStatus(bool) {
			__startRequest__ = bool;
		}
		function getRequestStatus() {
			return __startRequest__;
		}
        
        return ReportFolderCreateView;
    });
}).call(this);
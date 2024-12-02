define("timeline/views/mobile/user/history", function(require){
    var Backbone = require("backbone");
    
    var AuthModel = require("timeline/models/auth");
    var HistoryModel = require("timeline/models/history");
    
    var HeaderToolbarView = require('views/mobile/header_toolbar');

    var RegistTmpl = require("hgn!timeline/templates/mobile/user/history_regist");
    var DetailTmpl = require("hgn!timeline/templates/mobile/user/history_detail");
    
    var TimelineLang = require("i18n!timeline/nls/timeline");
    var CommonLang = require("i18n!nls/commons");
    
    var HOUR = _.range(0,24).map(function(num){ return num < 10 ? "0"+num : num });
    var MINUTE = _.range(0,60).map(function(num){return num < 10 ? "0"+num : num });

    var StatusCollection = Backbone.Collection.extend({
        url : GO.contextRoot + "api/timeline/status"
    });
    
    var HistoryView = Backbone.View.extend({
    	bindEvent : function(){
        	var self = this;
        	$("#modifyBtn").click(function(e){
				self.modify(e);
			});
        	$("#deleteBtn").click(function(e){
				self.delete(e);
			});
        },
        unbindEvent : function(){
        	$("#modifyBtn").unbind("click");
        	$("#deleteBtn").unbind("click");
        },
        initialize : function(options){
            this.options = options;
            this.baseDate = this.options.baseDate ? this.options.baseDate : moment().format("YYYY-MM-DD");
            this.targetUserId = this.options.targetUserId;
            this.historyId = this.options.historyId;
            this.type = this.options.type;

            this.authModel = new AuthModel(GO.util.store.get("timeline.auth"));
            
            this.isCreatable = this.authModel.isCreatable();
            this.isEditable = this.authModel.isEditable();
            this.isDeletable = this.authModel.isDeletable();
            this.isReadable = this.authModel.isReadable();
            
            this.isViewMode = this.type === "view" ? true : false;
            this.isCreateMode = this.type === "create" ? true : false;
            this.isUpdateMode = this.type === "update" ? true : false;
            this.isDeleteMode = this.type === "delete" ? true : false;
            
            if(this.isCreateMode) {
            	this.model =  new HistoryModel({
            		targetUserId : this.targetUserId, 
            		baseDate : this.baseDate
        		});
            }else{
            	this.model =  new HistoryModel({
            		id : this.historyId, 
            		targetUserId : this.targetUserId, 
            		baseDate : this.baseDate
        		});
            }
            if(!this.isViewMode){
            	this.statusCollection = new StatusCollection();
            }

			GO.EventEmitter.off("trigger-action");
			GO.EventEmitter.on('trigger-action','timeline-movecreate', this.moveCreatePage, this);
			GO.EventEmitter.on('trigger-action','timeline-movemodify', this.moveModifyPage, this);
			GO.EventEmitter.on('trigger-action','timeline-movedelete', this.moveDeletePage, this);
			GO.EventEmitter.on('trigger-action','timeline-save', this._save, this);
			GO.EventEmitter.on('trigger-action','timeline-delete', this._delete, this);

        },

        render : function() {
        	this.unbindEvent();
        	this.$el.empty();
        	
        	this.renderTitleToolbar();
        	
        	if(this.isCreateMode) {
        		this._renderCreateView();
        	} else if(this.isUpdateMode) {
        		this._renderUpdateView();
        	} else if(this.isViewMode) {
    			this._renderDetailView();
        	} else if(this.isDeleteMode) {
        		this._renderDeleteView();
        	}
        	
        	this.bindEvent();
        },
		moveCreatePage : function() {
			GO.router.navigate("ehr/timeline/history/create", {
				trigger: true,
				pushState: true
			});
		},
        moveModifyPage : function() {
        	GO.router.navigate("ehr/timeline/history/"+ this.historyId +"/update/" +this.targetUserId+ "/" + this.baseDate, {
                trigger: true,
                pushState: true
            });
        },
        moveDeletePage : function() {
        	GO.router.navigate("ehr/timeline/history/"+ this.historyId +"/delete/" +this.targetUserId+ "/" + this.baseDate, {
                trigger: true,
                pushState: true
            });
        },
        _goTimelineHome : function() {
        	GO.router.navigate("ehr", {trigger: true,pushState: true});
        },
        _renderCreateView : function() {
        	if(!this.isCreatable) {
				this._goTimelineHome();
			}
    		this.statusCollection.fetch().done(_.bind(this._renderRegist, this));
        },
        _renderUpdateView : function() {
        	if(!this.isEditable) {
        		this._goTimelineHome();
			}
    		this.statusCollection.fetch().done(_.bind(this._renderRegist, this));
        },
        _renderDeleteView : function() {
        	if(!this.isDeletable) {
        		this._goTimelineHome();
			}
        	this.statusCollection.fetch().done(_.bind(this._renderRegist, this));
        },
        _renderRegist : function() {
        	var now = GO.util.now(),
        		intervalTime = GO.util.getIntervalTime(now).format("HH:mm"),
	    		nowHour = intervalTime.split(":")[0],
	    		nowMinute = intervalTime.split(":")[1],
	    		datePickValue = !_.isEmpty(this.baseDate) ? this.baseDate : now.format("YYYY-MM-DD");
	    	
        	if(this.isUpdateMode || this.isDeleteMode) {
        		this.model.fetch({async:false,
    				error : function(model, response) {
    					GO.util.error('404', { "msgCode": "400-common"});
    					return;
    			}});
        		if(this.model.isNightWork()){
        			datePickValue = moment(this.model.get("baseDate")).add("days", 1).format("YYYY-MM-DD");
        		} else{
        			datePickValue = this.model.get("baseDate");
        		}
        	}

        	var self = this;
        	$(".content_page").html(RegistTmpl({
                CommonLang : CommonLang,
                TimelineLang : TimelineLang,
                data : this.model.toJSON(),
                isNew : this.model.isNew(),
                status : this.statusCollection.toJSON(),
                HOUR : HOUR,
                MINUTE : MINUTE,
                isSelected : function(){
                    if(self.model.isNew()){
                        return false;
                    }
                    return self.model.get("timelineStatus")["id"] == this.id;
                },
                isCheckTimeHour : function() {
                	if(self.type === "create"){
                		return this == nowHour;
                	} else {
                		return self.model.isCheckTimeHour(this);
                	}
                },
                isCheckTimeMinute : function() {
                	if(self.type === "create"){
                		return this == nowMinute;
                	} else {
                		return self.model.isCheckTimeMinute(this);
                	}
                }
            }));
            this._initDatePicker(datePickValue);
            $("#isNightWork").unbind("click");
            $("#isNightWork").click(function(e){
        		self.changeNight(e);
        	});
        },
        _renderDetailView : function () {
			this.model.fetch({async:false,
				error : function(model, response) {
					GO.util.error('404', { "msgCode": "400-common"});
					return;
			}});

			if(!this.isReadable) {
				this._goTimelineHome();
			}
			
			var self = this;

			$(".content_page").html(DetailTmpl({
                TimelineLang : TimelineLang,
                CommonLang : CommonLang,
                data : this.model.toJSON(),
                checkTimeDate : function() { return self.model.checkTimeDate(); },
                checkTimeHour : function() { return self.model.checkTimeHour(); },
                checkTimeMinute : function() { return self.model.checkTimeMinute(); },
                statusName : function() { return self.model.getStatusName(); }
            }));
        },
        renderTitleToolbar : function() {
        	var self = this;
        	var titleName = TimelineLang["상태 상세"];
        	if(this.isCreateMode){
        		titleName = TimelineLang["상태 등록"];
        	} else if(this.isUpdateMode) {
        		titleName = TimelineLang["상태 수정"];
        	} else if(this.isDeleteMode) {
        		titleName = TimelineLang["상태 삭제"];
        	}

			var titleToolbarOption = {
				title : titleName,
				actionMenu : this.getUseMenus()
			};

			if(this.isViewMode){
				titleToolbarOption.isPrev = true;
				titleToolbarOption.prevCallback = function(){
					if(window.history.length == 1){
						self._goTimelineHome();
					}else{
						window.history.back();
					}
				};
			} else {
				titleToolbarOption.isClose = true;
			}
			this.headerToolbarView = HeaderToolbarView;
			this.headerToolbarView.render(titleToolbarOption);
        },
		getUseMenus : function(){
			var useMenuList = [];
			var menus = {
				"수정이동" : {
					id: 'timeline-movemodify',
					text: CommonLang["수정"],
					triggerFunc: 'timeline-movemodify',
					inMoreBtn: true
				},
				"삭제이동": {
					id: 'timeline-movedelete',
					text: CommonLang["삭제"],
					triggerFunc: 'timeline-movedelete',
					inMoreBtn: true
				},
				"삭제": {
					id: 'timeline-delete',
					text: CommonLang["삭제"],
					triggerFunc: 'timeline-delete'
				},
				"확인": {
					id: 'timeline-save',
					text: CommonLang["확인"],
					triggerFunc: 'timeline-save'
				}
			};
			if(this.isViewMode) {
				if(this.authModel.isEditable()){
					useMenuList.push(menus.수정이동);
				}
				if(this.authModel.isDeletable()){
					useMenuList.push(menus.삭제이동);
				}
			} else if(this.isDeleteMode) {
				useMenuList.push(menus.삭제);
			} else {
				useMenuList.push(menus.확인);
			}
			return useMenuList;
		},
        _initDatePicker : function(value) {
            var $datePicker = $("#timelineDatePicker");
            $datePicker.val(value);
            $datePicker.datepicker({
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: ""
            });
        },
        _validateReason : function(reason) {
        	if(_.isEmpty(reason)){
            	GO.util.delayAlert(TimelineLang["사유를입력해주세요"]);
            	$("textarea#reason").focus();
            	GO.util.appLoading(false);
            	return false;
            }
        	return true;
        },
        _save : function() {
        	GO.util.appLoading(true);
            var isNew = this.model.isNew(),
            	message = CommonLang["저장되었습니다."];
            if(!isNew){
                var reason = $("#reason").val();
                if(!this._validateReason(reason)){ return; }
                message = CommonLang["수정되었습니다."];
            }

            this.model.save(this.getVariable())
                .done(function(){
                	GO.util.delayAlert(message);
                	GO.util.appLoading(false);
                	GO.router.navigate("ehr", {trigger: true,pushState: true});
                }).fail(function(response) {
                	if (response.responseJSON && response.responseJSON.message){
                		GO.util.delayAlert(response.responseJSON.message);
                	} else {
                		GO.util.delayAlert(CommonLang["저장에 실패 하였습니다."]);
                	}
                    GO.util.appLoading(false);
                });
        },
        _delete : function() {
        	var reason = $("#reason").val();
        	if(!this._validateReason(reason)){ return; }
        	
        	if(confirm(CommonLang['삭제하시겠습니까?'])){
        		GO.util.appLoading(true);
                $.ajax({
                    url: this.model.url(),
                    data: JSON.stringify({reason : reason}),
                    type: 'delete',
                    async: true,
                    dataType: 'json',
                    contentType : "application/json",
                    success: function() {
                    	GO.util.delayAlert(CommonLang["삭제되었습니다."]);
                    	GO.util.appLoading(false);
                    	GO.router.navigate("ehr", {trigger: true,pushState: true});
                    },
                    error : function() {
                    	GO.util.delayAlert(CommonLang["실패했습니다."]);
                    	GO.util.appLoading(false);
                    }
                });
        	}
        },
        changeNight : function(e) {
        	$("#nightWorkDescription").toggle();
        },
        getVariable : function() {
            return {
                "checkTime" : moment($("#timelineDatePicker").val() + " " +$("#checkTimeHour").val() + ":" + $("#checkTimeMinute").val()).toISOString(),
                "content" : $("textarea#content").val(),
                "reason" : $("textarea#reason").val(),
                "isNightWork" :  $("#isNightWork").is(':checked'),
                "timelineStatus" : {id : $("#status").val()}
            }
        }
    });

    return HistoryView;
});
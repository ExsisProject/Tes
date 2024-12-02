(function() {
    
    define([
        "jquery", 
        "underscore", 
        "backbone", 
        "app", 
        "survey/models/survey", 
        "survey/views/regist/target",
        "survey/libs/util", 
        "helpers/form", 
        "hgn!survey/templates/regist", 
        "i18n!nls/commons", 
        "i18n!survey/nls/survey", 
        "go-nametags", 
        "libraries/go-classcodepicker", 
        "jquery.go-popup", 
        "jquery.go-orgslide",
        "jquery.go-preloader"
    ], 
    
    function(
        $, 
        _, 
        Backbone,
        GO, 
        SurveyModel, 
        SurveyTargetView, 
        SurveyUtil, 
        FormHelper, 
        RegistTemplate, 
        CommonLang, 
        SurveyLang, 
        NameTagListView, 
        ClassCodePicker
    ) {
    	        
        var
	        TITLE_MIN_LENGTH = 2, 
	    	TITLE_MAX_LENGTH = 64, 
	    	DEPTNAME_MIN_LENGTH = 2, 
	    	DEPTNAME_MAX_LENGTH = 64, 
            FORMAT_DATE = 'YYYY-MM-DD', 
            FORMAT_TIME = 'HH:mm', 
            tvars = {
                "label": {
                    "title": SurveyLang["설문 제목"], 
                    "survey_period": SurveyLang["설문 기간 설정"], 
                    "allday": SurveyLang["종일"], 
                    "survey_target": SurveyLang["설문 대상자 설정"], 
                    "setup_referer": SurveyLang["참조자 설정"], 
                    "add_item": SurveyLang["추가"], 
                    "open_result": SurveyLang["설문 결과 공개"], 
                    "public": SurveyLang["공개"], 
                    "private": SurveyLang["비공개"], 
                    "use_comment": SurveyLang["댓글 사용"], 
                    "usable": SurveyLang["사용"], 
                    "unusable": SurveyLang["사용안함"],
                    "editable": SurveyLang["참여 후 수정 허용"], 
                    "permit": SurveyLang["허용"], 
                    "not_permit": SurveyLang["허용안함"], 
                    "setup_creator": SurveyLang["작성자 이름 변경"], 
                    "next_step": SurveyLang["다음"], 
                    "cancel": SurveyLang["취소"],
                    "tempsave": SurveyLang["임시저장"], 
                    "add_dept": SurveyLang["부서추가"],
                    "finished": SurveyLang["작성 완료"]
                }, 
                "msg": {
                    "about_referer": SurveyLang["설문 결과 열람 가능 안내 메시지"],
                    "about_copyable_target": SurveyLang["설문 복사 가능 대상자 안내메시지"],
                    "about_open_result": SurveyLang["설문 참여자 결과 공개 안내메시지"], 
                    "about_setup_creator": SurveyLang["설문 등록자 설정 안내 메시지"],
                    "about_target": SurveyLang["설문 대상자 설정 안내 메시지"]
                }
            };
        
        var SurveyRegistView = Backbone.View.extend({
            tagName: "div", 
            className: "content_page survey_form go_renew", 
            
            events: {
                "click #btn-next": "_saveAndNext",
                "click #btn-cancel": "_cancel", 
                "click #all-day": "_toggleTimeSelect",
                "click #btn-finished": "_saveAndNext"
            }, 
            
            initialize: function() {
            	if(!this.model) {
                    this.model = new SurveyModel();
                }
            }, 
            
            render: function() {
                var now = GO.util.now(), 
                    startDt = GO.util.toMoment(this.model.get('startTime')) < now ? now : GO.util.toMoment(this.model.get('startTime')), 
                    endDt = GO.util.toMoment(this.model.get('endTime')) < now ? now : GO.util.toMoment(this.model.get('endTime'));

                this.$el.append(RegistTemplate($.extend(true, tvars, {
                    "title": this.model.getTitle(), 
                    "start_date": (this.model.isNew() ? now : startDt).format(FORMAT_DATE), 
                    "start_time": (this.model.isNew() ? GO.util.getIntervalTime(now) : startDt).format(FORMAT_TIME), 
                    "end_date": (this.model.isNew() ? now.clone().add('days', 1).startOf('days') : endDt).format(FORMAT_DATE), 
                    "end_time": this.model.isNew() ? "00:00" : endDt.format(FORMAT_TIME), 
                    "deptName": this.model.getDeptName(), 
                    "admin?": isSurveyAdmin(), 
                    "allday?": this.model.isAllday(), 
                    "target_company?": this.model.isTargetCompany(), 
                    "private?": this.model.isPrivate(), 
                    "use_comment?": this.model.commentable(), 
                    "editable?": this.model.editable(),
                    "stopped?": this.model.isStopped()
                })));
                
                this.initDatepicker();
                this.targetView = SurveyTargetView.create('#target-container', this.model, isSurveyAdmin());
                this.addReferrerListView();
                this.toggleSelectTime($('#all-day'));
            },
            
            
            initDatepicker : function() {
            	 var $from = this.$("#start-date");
                 var $to = this.$("#end-date");
            	
            	$.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] );
                $from.datepicker({
                    dateFormat: "yy-mm-dd", 
                    changeMonth: true,
                    changeYear: true,
                    minDate: GO.util.customDate(new Date(), "YYYY-MM-DD"),
                    yearSuffix: "",
                    onClose: function( selectedDate ) {
                        if(selectedDate) $from.trigger("change:startdate", [selectedDate]);
                        $to.datepicker("option", "minDate", moment(selectedDate).toDate());
                    }
                });

                $to.datepicker({
                    dateFormat: "yy-mm-dd",
                    changeMonth: true,
                    changeYear: true,
                    minDate: $from.val(), 
                    yearSuffix: "",
                    onClose: function( selectedDate ) {
                        if(selectedDate) $to.trigger("change:enddate", [selectedDate]);
                    }
                });
            },
            
            
            addReferrerListView: function() {
            	var removable = this.model.isCreator(GO.session("id")), 
            		tags = [], nameTagListView;
            	
            	_.each(this.model.gerReferrers(), function(refer) {
            		tags.push({"id": refer.id, "title": refer.name + ' ' + refer.position, options: {"attrs": refer, "removable": removable}})
            	});
            	
                nameTagListView = NameTagListView.create(tags, { "useAddButton": true, "useRemoveAll": true });
                
                $('#referer-list')
                    .append(nameTagListView.el)
                    .data('instance', nameTagListView);
                
                bindNameTagAddBtnEvent(nameTagListView, {
                    "title": SurveyLang["참조자 추가"],
                    "desc" : SurveyLang["참조자 추가 안내 메시지"],
                    "removable": removable
                });
            }, 
            
            toggleSelectTime: function($el) {
            	// batch 작업 문제로 8.3 버전에서는 종일만 지원
            	this.$el.find('.select_date').hide();
               /* 
                if($el.is(':checked')) {
                    this.$el.find('.select_date').hide();
                } else {
                    this.$el.find('.select_date').show();
                }
                */
            }, 
                        
            _saveAndNext: function(e) {
                var $form = $('#survey-form'), 
                    formData, preloader;
                
                var isStopped = this.model.isStopped();
                var param={};
                //진행중 또는 중지된 설문을 수정할때
                if(isStopped){
                    param = {
                            'noti' : 'false',
                            'status':'progress'
                            };
                }
                
                
                if(validateForm($form)) {
                    preloader = $.goPreloader();
                    preloader.render();
                    formData = GO.util.serializeForm($('#survey-form')); 
                    
                    this.model.setFromFormData(formData);
                    
                    // 타겟 정보는 별도로 설정
                    if(this.targetView.isTargetAll()) {
                        this.model.set('target', {});
                        this.model.set('targetAll', true);
                    } else {
                        this.model.set('target', getTargetInfoList());
                        this.model.set('targetAll', false);
                    }
                    
                    this.model.set('referrers', getReferrerList());

                    this.model.save(param, {
                        success: function(model) {
                            if(isStopped){
                                
                                GO.router.navigate('survey/list/my', {trigger: true, pushState: false});
                            }else{
                                GO.router.navigate('survey/' + model.id + '/query/editor', {trigger: true, pushState: true});
                            }
                           
                        }, 
                        error: function(resp) {
                            SurveyUtil.raiseRequestError();
                        }
                    }).done(function(){
                        preloader.release();
                    });
                    
                    return true;
                } else {
                    return false;
                }
            }, 
            
            _toggleTimeSelect: function(e) {
                this.toggleSelectTime($(e.currentTarget));
            }, 
            
            _cancel: function() {
            	return SurveyUtil.goToLastList();
            }
        });
        
        // TODO: 리팩토링
        function validateForm($form) {
            //TODO: form validator 개발
            var $title = $form.find('input[name=title]'), 
            	$deptName = $form.find('input[name=deptName]'), 
            	title = $title.val(), 
            	deptName = $deptName.val();
            
            if(!title) {
                FormHelper.printError($title, SurveyLang["설문 제목 필수 오류 메시지"]);
                return false;
            }
            
            // GO-26748 XSS 대응
            if (GO.util.isXSSPettern(title)) {
            	$title.val(GO.util.escapeXssToBlank(title));
            }
            
            if(title && (title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH)) {
                FormHelper.printError($title, SurveyUtil.getStringLengthError(TITLE_MIN_LENGTH, TITLE_MAX_LENGTH));
                return false;
            }
            
            if(deptName && (deptName.length < DEPTNAME_MIN_LENGTH || deptName.length > DEPTNAME_MAX_LENGTH)) {
            	FormHelper.printError($deptName, SurveyUtil.getStringLengthError(DEPTNAME_MIN_LENGTH, DEPTNAME_MAX_LENGTH));
            	return false;
            }
            
            if(isSurveyAdmin()) {
            	if($form.find('select[name=target_type]').val() === 'part') {
                	var $targetClass = $('#target-class-div');
                	
            		if($form.find('input[name=targetpart]:checked').length <= 0) {
                		$.goAlert(SurveyLang["설문대상 미지정 오류 메시지"]);
                		return false;
                	}
                	
                	if(
            			$('#checkbox-targetpart-dept').is(':checked') && 
            			$('#target-dept-table > tbody > tr').length <= 0
        			) {
                		$.goAlert(SurveyLang["설문대상 부서 미지정 오류 메시지"]);
                		return false;
                	}
                	
                	if(
            			$('#checkbox-targetpart-class').is(':checked') && 
            			$targetClass.find('.list_option > li').length <= 0
        			) {
                		$.goAlert(SurveyLang["설문대상 클래스 미지정 오류 메시지"]);
                		return false;
                	}
                	
                	if(!isValidateTargetUser('#checkbox-targetpart-user')) {
                		alertTargetNoneError();
                		return false;
                	}
            	}
            } else {
            	if(!$form.find('input[name=target]:checked').length) {
            		alertTargetNoneError();
            		return false;
            	}
            	
            	if(!isValidateTargetUser('#radio-target-user')) {
            		alertTargetNoneError();
            		return false;
            	}
            }
            
            return true;
        }
        
        function isValidateTargetUser(selector) {
        	if(!$(selector).is(':checked')) return true;
        	return $('#target-user-div').find('li:not(.add-btn)').length > 0;
        }
        
        function alertTargetNoneError() {
        	return SurveyUtil.alert(SurveyLang["설문대상 사용자 미지정 오류 메시지"]);
        }
        
        function isSurveyAdmin() {
            return GO.session('surveyAdmin') || false;
        }
        
        function getTargetInfoList() {
            return {
                "nodes": ($('#target-container').data('targetview')).getList()
            }
        }
        
        function getReferrerList() {
            var view = $('#referer-list').data('instance'), 
                result = [];
        
            _.each(view.getNameTagList(), function(info) {
                result.push(_.pick(info, 'id', 'name', 'email', 'position'));
            });
            
            return result;
        }
        
        
        function bindNameTagAddBtnEvent(nameTagListView, options) {
            options = _.defaults(options || {}, {
                "title": "", 
                "type": 'list', 
                "desc": "", 
                "removable": true
            });
            
            nameTagListView.$el.on("nametag:clicked-add", function(view) {
                $.goOrgSlide({
                    header : options.title,
                    type: options.type, 
                    desc : options.desc,
                    contextRoot : GO.config("contextRoot"),
                    memberTypeLabel : SurveyLang["참조자 설정"],
                    externalLang : CommonLang,
					isBatchAdd : true,
                    callback : function(info) {
                    	var datas = _.isArray(info) ? info : [info];
                    	_.each(datas, function(data) {
                    		var displayName = data.position ? data.name + " " + data.position : data.name;
            				nameTagListView.addTag(data.id, displayName, { "attrs": data, "removable": _.result(options, 'removable') } );
            			});
                    }
                });
            });
        }
        
        return SurveyRegistView;
    });
    
})();
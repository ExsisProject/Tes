(function() {
    define([
        "backbone", 
        "app",
        "views/circle",
        "admin/libs/recurrence_parser",
        
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "i18n!calendar/nls/calendar",
        "hgn!system/templates/notice/form",
        "system/models/notice",
        "file_upload",
        "attach_file",
        "GO.util",
        "jquery.go-validation",
        "go-webeditor/jquery.go-webeditor",
        "go-notice",
        "jquery.go-preloader",
        "jquery.go-sdk",
        "formeditor",
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
            "options" : AdminLang["옵션"],
            "option_4" : AdminLang["사용자에게 '더이상 열지 않음' 기능 제공"],
            "save" : CommonLang["저장"],
            "cancel" : CommonLang["취소"],
            "save_success" : CommonLang["저장되었습니다."],
            "attach_file" : CommonLang["파일첨부"],
            "remove" : CommonLang["삭제"],
            "target" : AdminLang["공지 대상"],
            "targetAll" : AdminLang["전체 사용자"],
            "state" : AdminLang["사용여부"],
            "normal" : AdminLang["사용"],
            "recur" : CalLang["반복"],
            "scope" : CalLang["특정기간"],
            "usedesc" : AdminLang["팝업공지사용여부"],
            "web" : AdminLang["웹"],
            "mobile" : AdminLang["모바일"],
            "mobile_size_desc" : AdminLang["모바일은 기기에 맞춰서 사이즈가 자동 지정됩니다."],
            "mobile_option_1_desc" : AdminLang["로그인 할 때마다 사용자에게 보여주기 모바일 안내"]
        };
        
        var NoticeForm = Backbone.View.extend({

            events : {
                "click #save" : "save",
                "click #cancel" : "cancel",
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
                $('.breadcrumb .path').html("로그인페이지 공지");
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
                        var url = "system/extension/frontnotice";
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
            
            cancel : function(){
                var url = "system/extension/frontnotice";
                
                GO.router.navigate(url, {trigger: true});
            }
        },
        {
            render : function(options){
                var noticeForm = new NoticeForm(options);
                noticeForm.render();
                return noticeForm;
            }
        }
        );
        
        function setData(){
            var startTime =  this.$el.find("#startDate").val() + ' 00:00',
                endTime = this.$el.find("#endDate").val() + ' 23:59',
                state = this.$el.find("#state").is(":checked") ? "NORMAL" : "HIDDEN";                
            
            this.model.set({
                "title" : this.$el.find("#title").val(),
                "content" : GO.Editor.getInstance("notice_editor").getContent(),
                "startTime" : startTime,
                "endTime" : endTime,
                "option" : this.$el.find("input:radio[name='option']:checked").val(),
                "state" : state,
            });
        };
        
        function validate(){
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
            
            var sample = 
            '<div class="banner" style="background:#20bec6; height:60px">"<br/>' +    
        	'<a href="http://daouoffice.com/edu_cloud.html" target="_blank"><br/>' +
        	'    <!-- 편집기의 인라인 이미지를 통해 등록해주세요 --><br/>' +
        	'    <img src="images/banner_edu.png" title="다우오피스 사용자 교육에 초대합니다." /><br/>' +
        	'</a><br/>'
        	'<!-- id=bannerClose 로 지정해야 X버튼이 동작합니다. --><br/>' +
        	'<a id="bannerClose" class="btn_layer_bigx" title="다시 열지 안음"><br/>' +
            '    <span class="ic">  </span><br/>' +
        	'</a>' +
        	'</div>'
            
            this.$el.html(NoticeFormTmpl({
                lang : lang,
                data : $.extend({}, this.model.toJSON(), {
                	hasByDay : this.model.hasByDay(),
                    isNoneMode : this.model.isNoneMode(),
                    convertedStartTime : this.model.getConvertStartTime(),
                    convertedEndTime : this.model.getConvertEndTime(),
                    isNormalState : this.model.isNormalState(),
                    sample : sample
                })
            }));            
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
            
            $("#notice_editor").goWebEditor({
            	contextRoot: GO.config('contextRoot'),
                lang: GO.session('locale'),
                editorValue : editorValue
            });
        };
        return NoticeForm;
    });

})();
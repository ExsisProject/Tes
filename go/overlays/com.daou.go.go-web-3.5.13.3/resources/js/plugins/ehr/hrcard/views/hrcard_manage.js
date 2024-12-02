define([ 
         "jquery", 
         "backbone", 
         "app", 
         "file_upload",
         "hrcard/models/hrcard_manage",
         // "hrcard/models/hrcard_manage_checkbox",
         "hgn!hrcard/templates/hrcard_manage", 
         "i18n!hrcard/nls/hrcard",
         "i18n!nls/commons" ,
         "jquery.go-preloader"
        ],

function(
		$, 
		Backbone, 
		App,
		FileUpload,
		hrcardManageModel,
		// hrcardManageCheckboxModel,
		TplHrcard, 
		hrcardLang, 
		commonLang
		) 
		
	{
		var lang = {
			personnel_manag_info : hrcardLang['인사정보 관리'],
	
	
			myself_modify : hrcardLang['본인 인사정보 수정'],
			myself_modify_tool_tip : hrcardLang['본인인사정보수정안내'],
			permit : hrcardLang['허용'],
			no_permit : hrcardLang['허용하지 않음'],
	
			headofthedepartment_public : hrcardLang['부서장 인사정보 공개'],
			headofthedepartment_public_tool_tip : hrcardLang['부서장인사정보공개안내'],
			
			personnel_info_all_enroll : hrcardLang['인사정보 일괄 등록'],
			sample_download : hrcardLang['샘플 양식 다운로드'],
			sample_download_guide: hrcardLang['샘플 양식 다운로드 가이드'],
			download : hrcardLang['현재 설정 다운로드'],
			download_guide : hrcardLang['현재 설정 다운로드 가이드'],
			file_search : hrcardLang['파일 찾기'],
			file_attach : hrcardLang['파일 첨부'],
			all_enroll : hrcardLang['일괄 등록'],

			personnel_info_file_enroll : hrcardLang['인사정보 파일 등록'],
			all_enroll_desc : hrcardLang['일괄등록주의사항'],
	
			personnel_info_manage : hrcardLang['인사정보 항목 관리'],
			personnel_info_manage_tool_tip : hrcardLang['인사정보항목관리안내'],
	
			basic_info : hrcardLang['기본 정보'],
			entrance_date : hrcardLang['입사일'],
			duty : hrcardLang['직무'],
			occupation : hrcardLang['직종'],
			occupational_group : hrcardLang['직군'],
			recruitment_division : hrcardLang['채용구분'],
			employee_division : hrcardLang['직원구분'],
			salary_division : hrcardLang['급여구분'],
			recommender : hrcardLang['추천자'],
			state : hrcardLang['상태'],
			birth : hrcardLang['생년월일'],
			gender : hrcardLang['성별'],
			marital_status : hrcardLang['결혼여부'],
			disability_status : hrcardLang['장애여부'],
			the_veterans : hrcardLang['보훈여부'],
			resignation_date : hrcardLang['퇴사일'],
			resignation_reason : hrcardLang['퇴사사유'],
	
			personal_info : hrcardLang['신상 정보'],
			hobby : hrcardLang['취미'],
			speciality : hrcardLang['특기'],
			fax : hrcardLang['팩스'],
			job_route : hrcardLang['취업방법'],
			address : hrcardLang['주소'],
			home_number : hrcardLang['자택번호'],
			the_veterans_number : hrcardLang['보훈번호'],
			the_veterans_family : hrcardLang['보훈가족'],
			the_veterans_division : hrcardLang['보훈구분'],
			disability_number : hrcardLang['장애등록번호'],
			disability_division : hrcardLang['장애구분'],
			disability_rating : hrcardLang['장애등급'],
			disability_permit_division : hrcardLang['장애인정구분'],
			account_type : hrcardLang['계좌유형'],
			bank : hrcardLang['은행'],
			depositor : hrcardLang['예금주'],
			note : hrcardLang['비고'],
			account_number : hrcardLang['계좌번호'],
			start_date : hrcardLang['시작일자'],
			end_date : hrcardLang['종료일자'],
	
			duty_info : hrcardLang['직무 정보'],
			start_date2 : hrcardLang['시작일'],
			end_date2 : hrcardLang['종료일'],
			importance : hrcardLang['비중'],
			assignment_task : hrcardLang['담당업무'],
	
			appointment_info : hrcardLang['발령 정보'],
			appointment_date : hrcardLang['발령일'],
			division : hrcardLang['구분'],
			appointment_name : hrcardLang['발령명'],
			belong : hrcardLang['소속'],
			salary_level : hrcardLang['급여단계'],
			job_title : hrcardLang['직책'],
	
			career_info : hrcardLang['경력 정보'],
			working_place : hrcardLang['근무처'],
			position : hrcardLang['직위'],
			long_service_period : hrcardLang['근속기간'],
			retirement_reason : hrcardLang['퇴직사유'],
	
			prize_disciplinary_info : hrcardLang['포상/징계 정보'],
			date : hrcardLang['일자'],
			contents : hrcardLang['내용'],
			reason : hrcardLang['사유'],
	
			etc : hrcardLang['기타'],
	
			personnel_evaluation_info : hrcardLang['인사평가 정보'],
			evaluation_year : hrcardLang['평가년도'],
			capability : hrcardLang['역량'],
			result : hrcardLang['성과'],
			evaluator : hrcardLang['평가자'],
			organization : hrcardLang['조직'],
			educational_institution : hrcardLang['교육기관'],
	
			educational_info : hrcardLang['교육 정보'],
			curriculum : hrcardLang['교육과정'],
			educational_type : hrcardLang['교육유형'],
	
			qualification_info : hrcardLang['자격 정보'],
			qualification_name : hrcardLang['자격명'],
			qualification_number : hrcardLang['자격번호'],
			qualification_rating : hrcardLang['자격등급'],
			institution_name : hrcardLang['기관명'],
			date_of_acquisition : hrcardLang['취득일'],
			date_of_halt : hrcardLang['정지일'],
	
			language_info : hrcardLang['어학 정보'],
			language_name : hrcardLang['어학명'],
			evaluation_date : hrcardLang['평가일'],
			evaluation_institution : hrcardLang['평가기관'],
			score : hrcardLang['점수'],
			grade : hrcardLang['등급'],
	
			military_info : hrcardLang['병역 정보'],
			military_clique : hrcardLang['군벌'],
			rank : hrcardLang['계급'],
			military_serial_number : hrcardLang['군번'],
			discharge_division : hrcardLang['전역구분'],
			enlist_date : hrcardLang['입대일'],
			discharge_date : hrcardLang['제대일'],
			etc_reason : hrcardLang['기타 사유'],
	
			overseas_business_trip_info : hrcardLang['해외출장 정보'],
			period_start : hrcardLang['기간(시작)'],
			period_end : hrcardLang['기간(종료)'],
			business_trip_country : hrcardLang['출장국가'],
			business_trip_place : hrcardLang['출장지'],
			business_trip_purpose : hrcardLang['출장목적'],
	
			level_of_education_info : hrcardLang['학력 정보'],
			school_name : hrcardLang['학교명'],
			admission_year : hrcardLang['입학년도'],
			graduation_year : hrcardLang['졸업년도'],
			major : hrcardLang['전공'],
			minor : hrcardLang['부전공'],
	
			family_info : hrcardLang['가족 정보'],
			family_name : hrcardLang['가족성명'],
			family_relations : hrcardLang['가족관계'],
			academic_ability : hrcardLang['학력'],
			job : hrcardLang['직업'],
            register : commonLang['등록'],
	
			ok : commonLang['저장'],
			cancel : commonLang['취소']
		};
	
		var layoutView = Backbone.View.extend({
			events : {
				'click th.item_title input:checkbox' : 'checkbox', // 체크박스
				'click #upload_ok' : 'excelupload',
				'click #btn_delete' : 'exceldelete',
				'click #downExcelSample' : 'downExcelHeader',
				'click #downExcel' : 'downExcelByCompany',
				'click table.tb_ehr_item span.btn_wrap .ic_classic' : 'tableToggle'  //인사정보 항목 테이블 접기/펼치기
			},
	
			initialize : function(options) {
				this.unbindEvent();
				this.bindEvent();
			},
	
			unbindEvent : function() {
				this.$el.off("click", "span#btn_ok");
				this.$el.off("click", "span#btn_cancel");
			},
	
			bindEvent : function() {
				this.$el.on("click", "span#btn_ok", $.proxy(this.hrcardManageSave,
						this));
				this.$el.on("click", "span#btn_cancel", $.proxy(
						this.hrcardManageCancel, this));
			},
			tableToggle : function(e){
				var $target = $(e.currentTarget);
				var $tr = $target.closest("table").find("tr:not(:first)");
				if($target.hasClass("ic_open")){
					$target.removeClass("ic_open").addClass("ic_close");
					$tr.hide();
				}else{
					$target.removeClass("ic_close").addClass("ic_open");
					$tr.show();
				}
				
			},
			getCheckConfigModel : function(){
				var _this = this;
				
				var CheckConfigModel = Backbone.Model.extend({
	       			url : GO.contextRoot + "api/ehr/hrcard/config/manage"
	       		});
				
				this.checkConfigModel = new CheckConfigModel();    
				this.checkConfigModel.fetch({
					success : function(model,resp){
						_this.$el.html(TplHrcard({
							lang : lang,
							publicFlag_myself : _this.model.get('hrCardMyselfModify'),
							publicFlag_headofthedepartment : _this.model.get('hrCardHeadPublic')
			
						}));
						_this.initFileUpload();
						
						//체크박스 활성, 비활성
						$.each(resp.data,function(k,v){
							$.each(v,function(n,m){
								$("table#"+k).find("[data-name="+n+"]").attr('checked',m);
							});
						});
						
						//각 탭별로 하위에 체크가 안되어있으면 최상단 체크해제.
						$("table.tb_ehr_item").each(function(k,v){
							var $titleInput = $(v).find("th input");
							$titleInput.attr("checked",false);
							if($(v).find("td input").is(":checked")){
								$titleInput.attr("checked",true);
							}
						});
						
					}
				});
				
			},

			render : function() {
				var _this = this;
				this.model = new hrcardManageModel();
				this.model.fetch({
					success: function(model, resp) {
						_this.getCheckConfigModel();
					},
					statusCode: {
	                    403: function() { GO.util.error('403'); }, 
	                    404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
	                    500: function() { GO.util.error('500'); }
	                }
				});


				// 파일업로드 Render
				
				return this;
			},
	
			checkbox : function(e) {
				$targetEl = $(e.currentTarget);
	
				if ($(e.currentTarget).is(':checked')) {
					$(e.currentTarget).closest('table').find('td input').attr("disabled", false);
					$(e.currentTarget).closest('table').find('td').find('input').attr("checked", true);
				}
	
				else { // unchecked
					$(e.currentTarget).closest('table').find('td').find('input').attr("disabled", true);
					$(e.currentTarget).closest('table').find('td').find('input').attr("checked", false);
				}
			},
	
			hrcardManageSave : function(e) {
				$targetEl = $(e.currentTarget);
				var model = this.model;
				var collection = new Backbone.Collection;
				var array = new Array();
	
				_.each($('table.form_hr table'), function(key, value) { //테이블 json으로 만드는 과정
					var array1 = new Array();
					array1['tableName'] = $(key).attr('id');
					_.each($(key).find('td'), function(k, v) {
						if ($(k).find('input').attr('data-name') !== undefined) {
	
							array1[$(k).find('input').attr('data-name')] = $(k)
									.find('input').is(':checked');
							// array.push(object);
						}
					});
					var test = new Backbone.Model;
					var wrap = {};
					wrap[$(key).attr('id')] = array1;
					test.set(array1);
					collection.add(test);
				});
	
				var wrap = {};
	
				// hrCardManageCheckbox : model.set(JSON.stringify(this.model));
				// *************************************************
	
				wrap['configMap'] = collection;
	
				var saveData = {  //데이터 저장
	
						hrCardMyselfModify : $("input[name=publicFlag_myself]:checked").val(),
						hrCardHeadPublic : $("input[name=publicFlag_headofthedepartment]:checked").val()
				// configMa
				};
				this.model.set(wrap);
				//this.model.save({}, {   //테이블 저장시
					 this.model.save(saveData,{
					success : function(model, response) {
						if (response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
							$('body').scrollTop(0);
						}
					},
					error : function(model, response) {
						if (response.message)
							$.goAlert(response.message);
						else
							$.goMessage(commonLang["실패했습니다."]);
					}
				});
	
			},
	
			hrcardManageCancel : function(e) {
				var self = this;
				$.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."],
						function() {
							self.initialize();
							self.render();
							$.goMessage(commonLang["취소되었습니다."]);
						}, commonLang["확인"]);
			},
			
			initFileUpload : function(){
				var fileAttachLang = "파일 찾기",
					_this = this,
					options = {
						el : "#swfupload-control",
						context_root : GO.contextRoot ,
						button_text : "<span class='buttonText'>" + lang.file_search + "</span>",
						button_width : "132px",
						progressBarUse : true,
						url : "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie')
					};

				(new FileUpload(options))
					.queue(function(e, data){

					})
					.start(function(e, data){
						var reExt = new RegExp("(.xls|.xlsx)","gi"),
							fileExt = data.type.toLowerCase();

						if(!reExt.test(fileExt)){
							$.goAlert((GO.i18n(commonLang["{{extension}} 파일만 등록 가능합니다."], {"extension": 'exel'})));
							$("#progressbar").hide();
							return false;
						}
					})
					.progress(function(e, data){

					})
					.success(function(e, serverData, fileItemEl){
						if(GO.util.fileUploadErrorCheck(serverData)){
							$.goAlert(GO.util.serverMessage(serverData));
							return false;
						} else {
							if(GO.util.isFileSizeZero(serverData)) {
								$.goAlert(GO.util.serverMessage(serverData));
								return false;
							}
						}
	                    
						var data = serverData.data,
							fileName = data.fileName,
							filePath = data.filePath,
							hostId = data.hostId,
							fileSize = GO.util.getHumanizedFileSize(data.fileSize),
							fileExt = data.fileExt,
							fileType = GO.util.getFileIconStyle({extention : data.fileExt});
						fileTmpl = "<li id='item_file'>"+
							"<span class='item_file' style='vertical-align:bottom'>"+
							"<span class='ic_file " + fileType + "'></span>"+
							"<span class='name'>"+fileName+"</span>"+
							"<span class='size'>("+fileSize+")</span>"+
							"<span class='btn_wrap' id='btn_delete' title='삭제' style='margin-right:20px'>"+
							"<span class='ic_classic ic_del'></span>"+
							"</span>"+
							"<a id='upload_ok' data-bypass='' class='btn_minor_s' data-role='button' style=''><span class='txt'>" + lang.register + "</span></a>" +
							"</span>"+
							"<input type='hidden' value='"+filePath+"' id='file_path'/>"+
							"<input type='hidden' value='"+fileName+"' id='file_name'/>"+
							"<input type='hidden' value='"+hostId+"' id='host_id'/>"+
							"<input type='hidden' value='"+fileExt+"' id='file_ext'/>"+
							"</li>";

						$("#fileComplete").html(fileTmpl);
					})
					.complete(function(e, data){
						console.info(data);
					})
					.error(function(e, data){
						console.info("error" + data);
					});

			},
			excelupload : function(){
				var self = this;
				if(jQuery("#item_file").length < 1) {
					return;
				}
				var url = GO.contextRoot+"api/ehr/hrcard/excelUpload"
					options = {
						fileName : $("#file_name").val(),
						filePath : $("#file_path").val(),
						hostId : $("#host_id").val(),
						fileExt : $("#file_ext").val()
					};

				GO.EventEmitter.trigger('common', 'layout:setOverlay', "로딩중");
				$.go(url,JSON.stringify(options), {
					qryType : 'POST',
					timeout : 0,
					contentType : 'application/json',
					responseFn : function(response) {
						if(response.code=="200"){
							GO.EventEmitter.trigger('common', 'layout:clearOverlay');
							$.goAlert(commonLang["저장되었습니다."]);
						}else{
							self.displayUploadErrMsg(response);
						}
					},
					error : function(error){
						clearInterval(this.interval);
						$.goAlert(error.responseJSON.message);
					}
				});
			},

			displayUploadErrMsg : function(resp){
				var target = this.$el.find(".tool_bar .custom_header #uploadMsg");
				$(target).text(resp.extParameter);
			},
			
			exceldelete : function() {
				$("#fileComplete").html("");
			},

			downExcelHeader : function() {
				window.location.href = GO.contextRoot + "api/ehr/hrcard/excelDownload";
			},

			downExcelByCompany : function(e) {
			    var self = this;
                var downloadUrl = GO.contextRoot + "api/ehr/hrcard/excelDownload/" + GO.session().companyId;

                $('#download_file_form').attr('action', downloadUrl);
                var token = new Date().getTime();
                $('#downloadTokenId').val(token);

                preloader = $.goPreloader();
                this.fileDownloadCheckTimer = window.setInterval(function () {
                    var cookieValue = $.cookie('downloadTokenId');
                    if (cookieValue == token){
                        self.finishDownload();
                    }
                }, 1000);
                $('#download_file_form').attr('target','ifm_download_file_form');
                $('#download_file_form').submit();
			},

            finishDownload : function(){
                window.clearInterval(this.fileDownloadCheckTimer);
                preloader.release();
            }
		});
	
		return layoutView;
	});


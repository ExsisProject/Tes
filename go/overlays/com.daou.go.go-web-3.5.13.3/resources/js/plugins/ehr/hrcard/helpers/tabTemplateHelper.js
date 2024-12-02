(function() {

    define([
        "hgn!hrcard/templates/detail/basic",
        "hgn!hrcard/templates/detail/detail",
        "hgn!hrcard/templates/detail/duty",
        "hgn!hrcard/templates/detail/appoint",
        "hgn!hrcard/templates/detail/carrer",
        "hgn!hrcard/templates/detail/rewardPunish",
        "hgn!hrcard/templates/detail/edu",
        "hgn!hrcard/templates/detail/evaluation",
        "hgn!hrcard/templates/detail/license",
        "hgn!hrcard/templates/detail/language",
        "hgn!hrcard/templates/detail/abroadTrip",
        "hgn!hrcard/templates/detail/academic",
        "hgn!hrcard/templates/detail/military",
        "hgn!hrcard/templates/detail/family",
        "i18n!hrcard/nls/hrcard",
        "i18n!nls/commons"
    ], 

    function(
        BasicTabTpl,
        DetailTabTpl,
        DutyTabTpl,
        AppointTabTpl,
        CarrerTabTpl,
        RewardPunishTabTpl,
        EduTabTpl,
        EvaluationTabTpl,
        LicenseTabTpl,
        LanguageTabTpl,
        TripTabTpl,
        AcademicTabTpl,
        MilitaryTabTpl,
        FamilyTabTpl,
        HRCardLang,
        commonLang
    ) {
    	
    	var lang = {
    			label_modify			: HRCardLang["수정"],
    			label_private			: HRCardLang["비공개"],
    			label_select_option		: HRCardLang["선택하세요"],
    			label_solar				: HRCardLang["양력"],
    			label_lunar				: HRCardLang["음력"],
    			label_new				: HRCardLang["신입"],
    			label_career			: HRCardLang["경력"],
    			label_male				: HRCardLang["남자"],
    			label_female			: HRCardLang["여자"],
    			label_single			: HRCardLang["미혼"],
    			label_married			: HRCardLang["기혼"],
    			
    			/*기본탭*/
    			label_basic				: HRCardLang["기본 정보"],
    			label_hireDate			: HRCardLang["입사일"],
    			label_jobDuty			: HRCardLang["직무"],
    			label_jobClass			: HRCardLang["직종"],
    			label_jobGroup			: HRCardLang["직군"],
    			label_careerType		: HRCardLang["채용구분"],
    			label_employeeDiv		: HRCardLang["직원구분"],
    			label_salaryDiv			: HRCardLang["급여구분"],
    			label_recommender		: HRCardLang["추천자"],
    			label_status			: HRCardLang["상태"],
    			label_birthDay			: HRCardLang["생년월일"],
    			label_gender			: HRCardLang["성별"],
    			label_maritalStatus		: HRCardLang["결혼여부"],
    			label_disability		: HRCardLang["장애여부"],
    			label_veteransStatus	: HRCardLang["보훈여부"],
    			label_leaveDate			: HRCardLang["퇴사일"],
    			label_leaveReason		: HRCardLang["퇴사사유"],
    			
    			/*신상탭*/
    			label_detail			: HRCardLang["신상 정보"],
    			label_hobby				: HRCardLang["취미"],	
    			label_speciality		: HRCardLang["특기"],	
    			label_faxNo				: HRCardLang["팩스"],	
    			label_way				: HRCardLang["취업방법"],	
    			label_address			: HRCardLang["주소"],	
    			label_homeNo			: HRCardLang["자택번호"],	
    			label_veteransNo		: HRCardLang["보훈번호"],	
    			label_veteransFamily	: HRCardLang["보훈가족"],	
    			label_veteransDiv		: HRCardLang["보훈구분"],	
    			label_disabilityNo		: HRCardLang["장애등록번호"],	
    			label_disabilityDiv		: HRCardLang["장애구분"],	
    			label_disabilityClass	: HRCardLang["장애등급"],	
    			label_disabilityRecDiv	: HRCardLang["장애인정구분"],	
    			label_accountType		: HRCardLang["계좌유형"],	
    			label_bank				: HRCardLang["은행"],	
    			label_depositor			: HRCardLang["예금주"],	
    			label_note				: HRCardLang["비고"],	
    			label_accountNum		: HRCardLang["계좌번호"],	
    			label_startDt			: HRCardLang["시작일자"],	
    			label_endDt				: HRCardLang["종료일자"],
    			
    			/*직무*/
    			label_duty				: HRCardLang["직무/담당"],
    			label_No				: HRCardLang["번호"],
    			label_jobGroup			: HRCardLang["직군"],
    			label_jobClass			: HRCardLang["직종"],
    			label_jobDuty			: HRCardLang["직무"],
    			label_beginDate			: HRCardLang["시작일"],
    			label_endDate			: HRCardLang["종료일"],
    			label_jobWeight			: HRCardLang["비중"],
    			label_chargeDuty		: HRCardLang["담당업무"],
    			
    			/*발령*/
    			label_appoint			: HRCardLang["발령"],
    			label_appointDate		: HRCardLang["발령일"],
    			label_appointDiv		: HRCardLang["구분"],
    			label_content			: HRCardLang["발령명"],
    			label_employeeType		: HRCardLang["직원구분"],
    			label_position			: HRCardLang["소속"],
    			label_salaryStep		: HRCardLang["급여단계"],
    			label_responsibility	: HRCardLang["직책"],
    			label_chargeDuty		: HRCardLang["담당업무"],
    			
    			/*경력*/
    			label_carrer			: HRCardLang["경력"],
    			label_fromDate			: HRCardLang["시작일"],
    			label_toDate			: HRCardLang["종료일"],
    			label_workspace			: HRCardLang["근무처"],
    			label_positionName		: HRCardLang["직위"],
    			label_task				: HRCardLang["담당업무"],
    			label_continousPeriod	: HRCardLang["근속기간"],
    			label_leaveReason		: HRCardLang["퇴직사유"],
    			
    			/*포상,징계*/
    			label_reward			: HRCardLang["포상/징계"],
    			label_reward_type		: HRCardLang["구분"],
    			label_reward_date		: HRCardLang["일자"],
    			label_reward_content	: HRCardLang["내용"],
    			label_reward_reason		: HRCardLang["사유"],
    			label_reward_note		: HRCardLang["기타"],
    			
    			/*인사평가*/
    			label_evaluation				: HRCardLang["인사평가"],
    			label_evaluation_evalYear		: HRCardLang["평가년도"],
    			label_evaluation_capability		: HRCardLang["역량"],
    			label_evaluation_outcome		: HRCardLang["성과"],
    			label_evaluation_evaluator		: HRCardLang["평가자"],
    			label_evaluation_organization	: HRCardLang["조직"],
    			label_evaluation_etc			: HRCardLang["기타"],
    			
    			/*교육*/
    			
    			label_edu				: HRCardLang["교육"],
    			label_edu_content		: HRCardLang["교육과정"],
    			label_edu_category		: HRCardLang["교육유형"],
    			label_edu_fromDate		: HRCardLang["시작일"],
    			label_edu_toDate		: HRCardLang["종료일"],
    			label_edu_institution	: HRCardLang["교육기관"],
    			
    			/*자격*/
    			label_license					: HRCardLang["자격"],
    			label_license_licenseType 		: HRCardLang["구분"],
    			label_license_licenseNm 		: HRCardLang["자격명"],
    			label_license_licenseNo 		: HRCardLang["자격번호"],
    			label_license_licenseClass 		: HRCardLang["자격등급"],
    			label_license_institution 		: HRCardLang["기관명"],
    			label_license_receiveDate 		: HRCardLang["취득일"],
    			label_license_expirationDate 	: HRCardLang["정지일"],
    			
    			/*어학*/
    			label_language					: HRCardLang["어학"],
    			label_language_langType			: HRCardLang["구분"],
    			label_language_langNm			: HRCardLang["어학명"],
    			label_language_evaluationDate	: HRCardLang["평가일"],
    			label_language_evaluationOrg	: HRCardLang["평가기관"],
    			label_language_langScore		: HRCardLang["점수"],
    			label_language_langClass		: HRCardLang["등급"],
    			label_language_note				: HRCardLang["기타"],
    			
    			/*병역*/
    			label_military					: HRCardLang["병역"],
    			label_military_militaryType		: HRCardLang["군벌"],
    			label_military_rank				: HRCardLang["계급"],
    			label_military_serialNumber		: HRCardLang["군번"],
    			label_military_discharge		: HRCardLang["전역구분"],
    			label_military_joinDate			: HRCardLang["입대일"],
    			label_military_dischargeDate	: HRCardLang["제대일"],
    			label_military_reason			: HRCardLang["기타 사유"],
    			
    			/*해외출장*/
    			label_trip				: HRCardLang["해외출장"],
    			label_trip_period			: HRCardLang["기간"],
    			label_trip_country		: HRCardLang["출장국가"],
    			label_trip_place			: HRCardLang["출장지"],
    			label_trip_purpose		: HRCardLang["출장목적"],
    			
    			/*학력*/
    			label_academic			: HRCardLang["학력"],
    			label_academic_classify  : HRCardLang["구분"],
    			label_academic_schoolName : HRCardLang["학교명"],
    			label_academic_admissionDate : HRCardLang["입학년도"],
    			label_academic_graduationDate : HRCardLang["졸업년도"],
    			label_academic_major 	: HRCardLang["전공"],
    			label_academic_minor 	: HRCardLang["부전공"],
    			label_academic_note 	: HRCardLang["기타"],
    			
    			/*가족*/
    			label_family			: HRCardLang["가족"],
    			label_family_name		: HRCardLang["가족성명"],	
    			label_family_relation	: HRCardLang["가족관계"],
    			label_family_gender		: HRCardLang["성별"],
    			label_family_birthDay	: HRCardLang["생년월일"],
    			label_family_educationLevel	: HRCardLang["학력"],
    			label_family_job		: HRCardLang["직업"],
    			label_family_note		: HRCardLang["기타"]
    			
    	
    			
    		};
    		
    		var dataLang = {
    			data_SOLAR					: HRCardLang["양력"],
    			data_LUNAR					: HRCardLang["음력"],
    			data_NEW					: HRCardLang["신입"],
    			data_CAREER					: HRCardLang["경력"],
    			data_MALE					: HRCardLang["남자"],
    			data_FEMALE					: HRCardLang["여자"],
    			data_SINGLE					: HRCardLang["미혼"],
    			data_MARRIED				: HRCardLang["기혼"]
    		};
    		
    	var TabTplHelper = {
    			
	    	getTemplate: function(tabType,editable,data) {
	    		var tpl;
	    		console.log(tabType);
	    		if(tabType == "basic"){
	    			//기본
	    			tpl = BasicTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : data,
	    				phaseName : (data['phase'].value) ? "("+this.i18nConvert(data['phase'].value)+")" : "",
	    				careerName : this.i18nConvert(data['careerType'].value),
	    				genderName : this.i18nConvert(data['gender'].value),
	    				maritalStatusName : this.i18nConvert(data['maritalStatus'].value),
	    				careerTypeIsNew : data.careerType.value == 'NEW' ? true : false,
	    				veteransStatusIsYes : data.veteransStatus.value == 'Y' ? true : false,
	    				disabilityIsYes : data.disability.value == 'Y' ? true : false,
	    				maritalStatusIsSingle : data.maritalStatus.value == 'SINGLE' ? true : false,
	    				genderIsMan : data.gender.value == 'MALE' ? true : false,
	    				phaseIsSolar : data.phase.value == 'SOLAR' ? true : false
	    			});
	    			
	    		}else if(tabType == "detail"){
	    			//신상
	    			tpl = DetailTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : data
	    			});
	    		}else if(tabType == "duty"){
	    			//직무,담당
	    			
	    			tpl = DutyTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : this.setNumber(data)
	    			});
	    			
	    		}else if(tabType == "appoint"){
	    			
	    			//발령
	    			tpl = AppointTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : this.setNumber(data)
	    			});
	    			
	    		}else if(tabType == "career"){
	    			//경력
	    			tpl = CarrerTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : this.setNumber(data)
	    			});
	    		}else if(tabType == "reward"){
	    			//포상,징계
	    			tpl = RewardPunishTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : this.setNumber(data)
	    			});
	    		}else if(tabType == "evaluation"){
	    			//인사평가
	    			tpl = EvaluationTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : this.setNumber(data)
	    			});
	    			
	    		}else if(tabType == "edu"){
	    			//교육
	    			tpl = EduTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : this.setNumber(data)	    				
	    			});
	    			
	    			
	    		}else if(tabType == "license"){
	    			tpl = LicenseTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : this.setNumber(data)	    				
	    			});
	    			
	    		}else if(tabType == "language"){
	    			tpl = LanguageTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : this.setNumber(data)	    				
	    			});
	    			
	    		}else if(tabType == "military"){
	    			tpl = MilitaryTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : this.setNumber(data)	    				
	    			});
	    			
	    		}else if(tabType == "abroad"){
	    			tpl = TripTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : this.setNumber(data.sort(function(first,second){
							return first.startPeriod.value > second.startPeriod.value ? -1 : first.startPeriod.value < second.startPeriod.value ? 1: 0;
						}))
	    			});
	    			
	    		}else if(tabType == "academic"){
	    			//학력
	    			tpl = AcademicTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : this.setNumber(data)
	    			});
	    			
	    		}else if(tabType == "family"){
	    			//가족
	    			
	    			var _this = this;
	    			
	    			$.each(data,function(k,v){
	    				var genderVal = v.gender.value;
	    				$.extend(true,v,{
	    					genderName:_this.i18nConvert(genderVal),
	    					genderIsMan:genderVal == 'MALE' ? true : false
	    					});
	    				
	    			});
	    			
	    			tpl = FamilyTabTpl({
	    				lang : lang,
	    				editable : editable,
	    				data : this.setNumber(data)
	    			});
	    		}
	    			
	    		return tpl;
	    		
	    	},
	    	
	    	i18nConvert : function(key) {
				var value;
				_.each(dataLang, function(k, v) {
					if(v == 'data_'+key) {
						value = k;
					}
				});
				return value;
			},
			
			setNumber : function(data){
				//배열로 들어온 데이터에 채번을 한다.
				$.each(data,function(k,v){
    				var number = {number : k+1};
    				$.extend(true,v,number);
    			});
				
				return data;
			}			
			
    	}
       
        return TabTplHelper;
    });

})();
(function(){define(["hgn!hrcard/templates/detail/basic","hgn!hrcard/templates/detail/detail","hgn!hrcard/templates/detail/duty","hgn!hrcard/templates/detail/appoint","hgn!hrcard/templates/detail/carrer","hgn!hrcard/templates/detail/rewardPunish","hgn!hrcard/templates/detail/edu","hgn!hrcard/templates/detail/evaluation","hgn!hrcard/templates/detail/license","hgn!hrcard/templates/detail/language","hgn!hrcard/templates/detail/abroadTrip","hgn!hrcard/templates/detail/academic","hgn!hrcard/templates/detail/military","hgn!hrcard/templates/detail/family","i18n!hrcard/nls/hrcard","i18n!nls/commons"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v){var m={label_modify:d["\uc218\uc815"],label_private:d["\ube44\uacf5\uac1c"],label_select_option:d["\uc120\ud0dd\ud558\uc138\uc694"],label_solar:d["\uc591\ub825"],label_lunar:d["\uc74c\ub825"],label_new:d["\uc2e0\uc785"],label_career:d["\uacbd\ub825"],label_male:d["\ub0a8\uc790"],label_female:d["\uc5ec\uc790"],label_single:d["\ubbf8\ud63c"],label_married:d["\uae30\ud63c"],label_basic:d["\uae30\ubcf8 \uc815\ubcf4"],label_hireDate:d["\uc785\uc0ac\uc77c"],label_jobDuty:d["\uc9c1\ubb34"],label_jobClass:d["\uc9c1\uc885"],label_jobGroup:d["\uc9c1\uad70"],label_careerType:d["\ucc44\uc6a9\uad6c\ubd84"],label_employeeDiv:d["\uc9c1\uc6d0\uad6c\ubd84"],label_salaryDiv:d["\uae09\uc5ec\uad6c\ubd84"],label_recommender:d["\ucd94\ucc9c\uc790"],label_status:d["\uc0c1\ud0dc"],label_birthDay:d["\uc0dd\ub144\uc6d4\uc77c"],label_gender:d["\uc131\ubcc4"],label_maritalStatus:d["\uacb0\ud63c\uc5ec\ubd80"],label_disability:d["\uc7a5\uc560\uc5ec\ubd80"],label_veteransStatus:d["\ubcf4\ud6c8\uc5ec\ubd80"],label_leaveDate:d["\ud1f4\uc0ac\uc77c"],label_leaveReason:d["\ud1f4\uc0ac\uc0ac\uc720"],label_detail:d["\uc2e0\uc0c1 \uc815\ubcf4"],label_hobby:d["\ucde8\ubbf8"],label_speciality:d["\ud2b9\uae30"],label_faxNo:d["\ud329\uc2a4"],label_way:d["\ucde8\uc5c5\ubc29\ubc95"],label_address:d["\uc8fc\uc18c"],label_homeNo:d["\uc790\ud0dd\ubc88\ud638"],label_veteransNo:d["\ubcf4\ud6c8\ubc88\ud638"],label_veteransFamily:d["\ubcf4\ud6c8\uac00\uc871"],label_veteransDiv:d["\ubcf4\ud6c8\uad6c\ubd84"],label_disabilityNo:d["\uc7a5\uc560\ub4f1\ub85d\ubc88\ud638"],label_disabilityDiv:d["\uc7a5\uc560\uad6c\ubd84"],label_disabilityClass:d["\uc7a5\uc560\ub4f1\uae09"],label_disabilityRecDiv:d["\uc7a5\uc560\uc778\uc815\uad6c\ubd84"],label_accountType:d["\uacc4\uc88c\uc720\ud615"],label_bank:d["\uc740\ud589"],label_depositor:d["\uc608\uae08\uc8fc"],label_note:d["\ube44\uace0"],label_accountNum:d["\uacc4\uc88c\ubc88\ud638"],label_startDt:d["\uc2dc\uc791\uc77c\uc790"],label_endDt:d["\uc885\ub8cc\uc77c\uc790"],label_duty:d["\uc9c1\ubb34/\ub2f4\ub2f9"],label_No:d["\ubc88\ud638"],label_jobGroup:d["\uc9c1\uad70"],label_jobClass:d["\uc9c1\uc885"],label_jobDuty:d["\uc9c1\ubb34"],label_beginDate:d["\uc2dc\uc791\uc77c"],label_endDate:d["\uc885\ub8cc\uc77c"],label_jobWeight:d["\ube44\uc911"],label_chargeDuty:d["\ub2f4\ub2f9\uc5c5\ubb34"],label_appoint:d["\ubc1c\ub839"],label_appointDate:d["\ubc1c\ub839\uc77c"],label_appointDiv:d["\uad6c\ubd84"],label_content:d["\ubc1c\ub839\uba85"],label_employeeType:d["\uc9c1\uc6d0\uad6c\ubd84"],label_position:d["\uc18c\uc18d"],label_salaryStep:d["\uae09\uc5ec\ub2e8\uacc4"],label_responsibility:d["\uc9c1\ucc45"],label_chargeDuty:d["\ub2f4\ub2f9\uc5c5\ubb34"],label_carrer:d["\uacbd\ub825"],label_fromDate:d["\uc2dc\uc791\uc77c"],label_toDate:d["\uc885\ub8cc\uc77c"],label_workspace:d["\uadfc\ubb34\ucc98"],label_positionName:d["\uc9c1\uc704"],label_task:d["\ub2f4\ub2f9\uc5c5\ubb34"],label_continousPeriod:d["\uadfc\uc18d\uae30\uac04"],label_leaveReason:d["\ud1f4\uc9c1\uc0ac\uc720"],label_reward:d["\ud3ec\uc0c1/\uc9d5\uacc4"],label_reward_type:d["\uad6c\ubd84"],label_reward_date:d["\uc77c\uc790"],label_reward_content:d["\ub0b4\uc6a9"],label_reward_reason:d["\uc0ac\uc720"],label_reward_note:d["\uae30\ud0c0"],label_evaluation:d["\uc778\uc0ac\ud3c9\uac00"],label_evaluation_evalYear:d["\ud3c9\uac00\ub144\ub3c4"],label_evaluation_capability:d["\uc5ed\ub7c9"],label_evaluation_outcome:d["\uc131\uacfc"],label_evaluation_evaluator:d["\ud3c9\uac00\uc790"],label_evaluation_organization:d["\uc870\uc9c1"],label_evaluation_etc:d["\uae30\ud0c0"],label_edu:d["\uad50\uc721"],label_edu_content:d["\uad50\uc721\uacfc\uc815"],label_edu_category:d["\uad50\uc721\uc720\ud615"],label_edu_fromDate:d["\uc2dc\uc791\uc77c"],label_edu_toDate:d["\uc885\ub8cc\uc77c"],label_edu_institution:d["\uad50\uc721\uae30\uad00"],label_license:d["\uc790\uaca9"],label_license_licenseType:d["\uad6c\ubd84"],label_license_licenseNm:d["\uc790\uaca9\uba85"],label_license_licenseNo:d["\uc790\uaca9\ubc88\ud638"],label_license_licenseClass:d["\uc790\uaca9\ub4f1\uae09"],label_license_institution:d["\uae30\uad00\uba85"],label_license_receiveDate:d["\ucde8\ub4dd\uc77c"],label_license_expirationDate:d["\uc815\uc9c0\uc77c"],label_language:d["\uc5b4\ud559"],label_language_langType:d["\uad6c\ubd84"],label_language_langNm:d["\uc5b4\ud559\uba85"],label_language_evaluationDate:d["\ud3c9\uac00\uc77c"],label_language_evaluationOrg:d["\ud3c9\uac00\uae30\uad00"],label_language_langScore:d["\uc810\uc218"],label_language_langClass:d["\ub4f1\uae09"],label_language_note:d["\uae30\ud0c0"],label_military:d["\ubcd1\uc5ed"],label_military_militaryType:d["\uad70\ubc8c"],label_military_rank:d["\uacc4\uae09"],label_military_serialNumber:d["\uad70\ubc88"],label_military_discharge:d["\uc804\uc5ed\uad6c\ubd84"],label_military_joinDate:d["\uc785\ub300\uc77c"],label_military_dischargeDate:d["\uc81c\ub300\uc77c"],label_military_reason:d["\uae30\ud0c0 \uc0ac\uc720"],label_trip:d["\ud574\uc678\ucd9c\uc7a5"],label_trip_period:d["\uae30\uac04"],label_trip_country:d["\ucd9c\uc7a5\uad6d\uac00"],label_trip_place:d["\ucd9c\uc7a5\uc9c0"],label_trip_purpose:d["\ucd9c\uc7a5\ubaa9\uc801"],label_academic:d["\ud559\ub825"],label_academic_classify:d["\uad6c\ubd84"],label_academic_schoolName:d["\ud559\uad50\uba85"],label_academic_admissionDate:d["\uc785\ud559\ub144\ub3c4"],label_academic_graduationDate:d["\uc878\uc5c5\ub144\ub3c4"],label_academic_major:d["\uc804\uacf5"],label_academic_minor:d["\ubd80\uc804\uacf5"],label_academic_note:d["\uae30\ud0c0"],label_family:d["\uac00\uc871"],label_family_name:d["\uac00\uc871\uc131\uba85"],label_family_relation:d["\uac00\uc871\uad00\uacc4"],label_family_gender:d["\uc131\ubcc4"],label_family_birthDay:d["\uc0dd\ub144\uc6d4\uc77c"],label_family_educationLevel:d["\ud559\ub825"],label_family_job:d["\uc9c1\uc5c5"],label_family_note:d["\uae30\ud0c0"]},g={data_SOLAR:d["\uc591\ub825"],data_LUNAR:d["\uc74c\ub825"],data_NEW:d["\uc2e0\uc785"],data_CAREER:d["\uacbd\ub825"],data_MALE:d["\ub0a8\uc790"],data_FEMALE:d["\uc5ec\uc790"],data_SINGLE:d["\ubbf8\ud63c"],data_MARRIED:d["\uae30\ud63c"]},y={getTemplate:function(d,v,g){var y;console.log(d);if(d=="basic")y=e({lang:m,editable:v,data:g,phaseName:g.phase.value?"("+this.i18nConvert(g.phase.value)+")":"",careerName:this.i18nConvert(g.careerType.value),genderName:this.i18nConvert(g.gender.value),maritalStatusName:this.i18nConvert(g.maritalStatus.value),careerTypeIsNew:g.careerType.value=="NEW"?!0:!1,veteransStatusIsYes:g.veteransStatus.value=="Y"?!0:!1,disabilityIsYes:g.disability.value=="Y"?!0:!1,maritalStatusIsSingle:g.maritalStatus.value=="SINGLE"?!0:!1,genderIsMan:g.gender.value=="MALE"?!0:!1,phaseIsSolar:g.phase.value=="SOLAR"?!0:!1});else if(d=="detail")y=t({lang:m,editable:v,data:g});else if(d=="duty")y=n({lang:m,editable:v,data:this.setNumber(g)});else if(d=="appoint")y=r({lang:m,editable:v,data:this.setNumber(g)});else if(d=="career")y=i({lang:m,editable:v,data:this.setNumber(g)});else if(d=="reward")y=s({lang:m,editable:v,data:this.setNumber(g)});else if(d=="evaluation")y=u({lang:m,editable:v,data:this.setNumber(g)});else if(d=="edu")y=o({lang:m,editable:v,data:this.setNumber(g)});else if(d=="license")y=a({lang:m,editable:v,data:this.setNumber(g)});else if(d=="language")y=f({lang:m,editable:v,data:this.setNumber(g)});else if(d=="military")y=h({lang:m,editable:v,data:this.setNumber(g)});else if(d=="abroad")y=l({lang:m,editable:v,data:this.setNumber(g.sort(function(e,t){return e.startPeriod.value>t.startPeriod.value?-1:e.startPeriod.value<t.startPeriod.value?1:0}))});else if(d=="academic")y=c({lang:m,editable:v,data:this.setNumber(g)});else if(d=="family"){var b=this;$.each(g,function(e,t){var n=t.gender.value;$.extend(!0,t,{genderName:b.i18nConvert(n),genderIsMan:n=="MALE"?!0:!1})}),y=p({lang:m,editable:v,data:this.setNumber(g)})}return y},i18nConvert:function(e){var t;return _.each(g,function(n,r){r=="data_"+e&&(t=n)}),t},setNumber:function(e){return $.each(e,function(e,t){var n={number:e+1};$.extend(!0,t,n)}),e}};return y})})();
define("views/user/user_noti", function(require) {

    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");
    var NoticdTmpl = require("hgn!templates/user/user_noti");
    var MenuNotiTmpl = require("hgn!templates/user/user_menu_noti");
    var UserNotiModel = require("models/user_noti");
    var SiteConfigModel = require("models/site_config");
    var CommonLang = require("i18n!nls/commons");
    var AdminLang = require("i18n!admin/nls/admin");
    var TimelineLang = require("i18n!timeline/nls/timeline");
    var UserLang = require("i18n!nls/user");

    var UserNotice = Backbone.View.extend({
        lang : {
            saveFail : CommonLang["저장에 실패 하였습니다."],
            saveSuccess : CommonLang["저장되었습니다."],
            save : CommonLang["저장"],
            cancel : CommonLang["취소"],
            title : UserLang["알림설정"],
            notification : UserLang["알림설정"],
            use : UserLang["사용함"],
            not_use : UserLang["사용하지 않음"],
            menu_noti_setting : UserLang["메뉴별 알림 설정"],
            base_noti_setting : UserLang["공통 알림 설정"],
            close : CommonLang["닫기"],
            open : CommonLang["열기"],
            push_and_mail : UserLang["모두"],
            pc_push : UserLang["PC"],
            mobile_push : UserLang["모바일"],
            mail : UserLang["메일"],
            basic_setting : UserLang["메뉴별 알림 설정"],
            noti_setting_desc : UserLang["알림 설정 도움말"]
        },
        apps : {
            mail : CommonLang["메일"],
            contact : CommonLang["주소록"],
            webfolder : CommonLang["자료실"],
            calendar : CommonLang["캘린더"],
            docs : CommonLang["문서관리"],
            board : CommonLang["게시판"],
            community : CommonLang["커뮤니티"],
            asset : CommonLang["예약"],
            survey : CommonLang["설문"],
            report : CommonLang["보고"],
            task : CommonLang["업무"],
            works : CommonLang["Works"],
            todo : CommonLang["ToDO+"],
            approval : CommonLang["전자결재"],
            docfolder : CommonLang["전사 문서함"],
            ehr : TimelineLang["근태관리"],
            channel : AdminLang['외부 시스템']
        },
        event : {
            mail_arrived : UserLang["메일 수신"],
            mail_shared : UserLang["공유메일 설정"],
            mail_scheduled_send : UserLang["전사 게시물 등록"],
            board_post_added : UserLang["게시물 등록"],
            board_post_changed : UserLang["게시물 수정"],
            board_reply_added : UserLang["답글 등록"],
            board_post_reply_changed : UserLang["답글 수정"],
            board_comment_added : UserLang["댓글 알림"],
            board_post_recommended : UserLang["추천 등록"],
            community_member_added : UserLang["멤버 추가"],
            community_apply_to_join : UserLang["가입 신청"],
            community_request : UserLang["개설 신청"],
            community_post_added : UserLang["게시물 등록"],
            community_post_changed : UserLang["게시물 수정"],
            community_reply_added : UserLang["답글 등록"],
            community_post_reply_changed : UserLang["답글 수정"],
            community_comment_added : UserLang["댓글 알림"],
            community_post_recommended : UserLang["추천 등록"],
            todo_member_added : UserLang["보드 멤버추가"],
            todo_item_moved : UserLang["카드 이동"],
            todo_director_changed : UserLang["담당자 변경"],
            todo_item_comment_added : UserLang["댓글 등록"],
            todo_item_attach_added : UserLang["첨부파일 등록"],
            todo_item_checklist_added : UserLang["세부 작업 추가"],
            todo_item_checklist_completed : UserLang["세부 작업 완료"],
            todo_item_added : UserLang["카드 등록"],
            calendar_company_event_added : UserLang["전사 일정 등록"],
            calendar_event_created : UserLang["일정 등록"],
            calendar_event_updated : UserLang["일정 수정"],
            calendar_follow_requested : UserLang["관심동료 신청"],
            calendar_follow_request_accepted : UserLang["관심동료 신청 수락"],
            calendar_follow_request_denied : UserLang["관심동료 신청 거부"],
            calendar_event_reminder : UserLang["일정 알림"],
            calendar_event_commented : UserLang["댓글등록"],
            applet_doc_added : UserLang["데이터 등록"],
            applet_doc_status_changed : UserLang["상태 변경"],
            applet_doc_edited : UserLang["데이터 정보 변경"],
            applet_activity_added : UserLang["활동기록 등록"],
            applet_activity_edited : UserLang["활동기록 수정"],
            applet_comment_added : UserLang["댓글 등록"],
            survey_progress : UserLang["설문 등록"],
            survey_none_temp_respondent : UserLang["미참여자에게 알림보내기"],
            survey_comment_added : UserLang["댓글"],
            report_reporter_added : UserLang["보고자로 등록"],
            report_added : UserLang["보고서 등록"],
            report_changed : UserLang["보고서 수정"],
            report_series_comment_added : UserLang["정기보고 회차 댓글 등록"],
            report_comment_added : UserLang["보고 상세 댓글 등록"],
            report_referrer_added : UserLang["참조자로 등록"],
            report_manager_added : UserLang["운영자로 설정"],
            document_arrived : UserLang["결재 도착"],
            document_withdrew : UserLang["취소 or 회수"],
            document_returned : UserLang["결재 반려/강제 반려"],
            document_previous_returned : UserLang["전단계 반려"],
            document_completed : UserLang["최종완료"],
            document_commented : UserLang["댓글 등록 알림"],
            document_reading_reader_added : UserLang["열람자 추가"],
            document_referrence_reader_added : UserLang["참조자 추가"],
            document_received : UserLang["수신도착"],
            document_receiver_changed : UserLang["담당자 지정 알림"],
            document_received_returned : UserLang["반송 알림"],
            asset_reserve_added : UserLang["예약 등록"],
            asset_reserve_changed : UserLang["예약 변경"],
            asset_reserve_canceled : UserLang["예약 취소"],
            asset_rent_added : UserLang["대여 등록"],
            asset_rent_canceled : UserLang["반납"],
            asset_manager_added : UserLang["운영자로 설정"],
            docs_added : UserLang["문서 등록"],
            docs_updated : UserLang["문서 업데이트"],
            docs_approval_request : UserLang["등록 승인 요청"],
            docs_approval_request_canceled : UserLang["승인 요청 취소"],
            docs_approved : UserLang["승인 완료"],
            docs_rejected : UserLang["반려"],
            webfolder_added : UserLang["파일 등록"],
            webfolder_shared : UserLang["공유자 설정"],
            applet_integration_requested : UserLang["데이터 연동신청"],
            applet_integration_accepted : UserLang["데이터 연동수락"],
            ehr_day : UserLang["일간 알림"],
            ehr_week : UserLang["주간 알림"],
            ehr_month : UserLang["월간 알림"],
            ehr_timeline_admin : UserLang["운영자로 설정"],
        },
        role : {
            all : UserLang["전체"],
            favorite : UserLang["즐겨찾기"],
            shared_user : UserLang["공유받은 사용자"],
            manager : UserLang["운영자"],
            creator : UserLang["등록자"],
            master : UserLang["(부)마스터"],
            siteadmin : UserLang["사이트관리자"],
            attendee : UserLang["참석자"],
            requested_calendar_owner : UserLang["신청을 받은 사용자"],
            follower : UserLang["신청한 사용자"],
            all_sharer : UserLang["공유자"],
            respondent : UserLang["대상자"],
            norespondent : UserLang["대상자 중 미참여자"],
            reporter : UserLang["보고자"],
            referrer : UserLang["참조자"],
            wait_approval : UserLang["결재 대기자"],
            drafter : UserLang["기안자"],
            leader : UserLang["부(부)서장"],
            approval : UserLang["기결재자"],
            add_reader : UserLang["추가된 열람자"],
            add_referrer  : UserLang["추가된 참조자"],
            dept_folder_director  : UserLang["수신부서의 부서문서함 담당자"],
            director : UserLang["담당자"],
            origin_drafter : UserLang["원문서 기안자"],
            add_manager: UserLang["운영자로 설정된 사용자"],
            requester: UserLang["승인 요청자"],
            shared_folder: UserLang["공유한 폴더"],
            inbox: UserLang["받은 메일"],
            comment_creator: UserLang["댓글 등록자"],
            member: UserLang["부서 멤버"],
            community_member: UserLang["멤버"],
            wait_agreement: UserLang["합의 대기자"],
            agreement: UserLang["기합의자"],
            sharing_folder: UserLang["공유받은 폴더"],
            shared_mail: UserLang["공유받은 메일"],
            report_recipient: UserLang["보고 등록 대상자"],
            wait_check: UserLang["확인 대기자"],
            check: UserLang["기확인자"],
            receiver: UserLang["수신자"],
            origin_creator: UserLang["원글 등록자"],
            wait_inspection: UserLang["감사 대기자"],
            inspection: UserLang["기감사자"],
            wait_deputy: UserLang["대결 대기자"],
            reader: UserLang["열람자"],
            company_official_doc_masters: UserLang["전사 공문 발송 관리자"],
            wait: UserLang["현재 결재 대기자"],
            manager_setting : UserLang["운영자 설정 우선"],
            activity_creator : UserLang["활동기록 등록자"],
            data_added_user : UserLang["데이터에 추가된 사용자"],
            approve_people : UserLang["결재자"],
            agree_people : UserLang["합의자"],
            check_people : UserLang["확인자"],
            inspect_people : UserLang["감사자"],
            creator_noti : UserLang["등록자 알림"],
            post_creator : UserLang["게시물 등록자"],
            registered_referrer : UserLang["참조자로 등록된 사용자"],
            registered_manager : UserLang["운영자로 설정된 사용자"],

            ehr_clockin: UserLang["출근 체크"],
            ehr_clockout: UserLang["퇴근 체크"],
            ehr_rest_time : UserLang["휴게시간 종료"],
            ehr_overtime_40_before: UserLang["40시간 초과 전"],
            ehr_overtime_40_after: UserLang["40시간 초과"],
            ehr_overtime_52_before: UserLang["52시간 초과 전"],
            ehr_overtime_52_after: UserLang["52시간 초과"],
            ehr_overtime_52: UserLang["주 52시간 초과근무"],
            ehr_overtime_month_min_before: UserLang['기본 근무시간 초과 전'],
            ehr_overtime_month_min_after : UserLang['기본 근무시간 초과'],
            ehr_overtime_month_max_before: UserLang['연장 근무시간 초과 전'],
            ehr_overtime_month_max_after : UserLang['연장 근무시간 초과'],
            ehr_timeline_admin_push : UserLang["운영자로 설정된 사용자"],
            ehr_auto_clockout_push : UserLang["자동퇴근"]
        },
        description: {
            mail_arrived_all: UserLang["메일수신 전체 설명"],
            mail_arrived_inbox: UserLang["메일수신 받은메일 설명"],
            mail_shared_shared_user: UserLang["공유메일 공유받은 사용자 설명"],
            board_post_added_all: UserLang["게시판 게시물등록 전체 설명"],
            board_post_added_manager: UserLang["게시판 게시물등록 운영자 설명"],
            board_post_added_favorite: UserLang["게시판 게시물등록 즐겨찾기 설명"],
            board_post_added_creator: UserLang["게시판 게시물등록 등록자 설명"],
            board_post_changed_all: UserLang["게시판 게시물수정 전체 설명"],
            board_post_changed_manager: UserLang["게시판 게시물수정 운영자 설명"],
            board_post_changed_favorite: UserLang["게시판 게시물수정 즐겨찾기 설명"],
            board_reply_added_all: UserLang["게시판 게시물답글등록 전체 설명"],
            board_reply_added_manager: UserLang["게시판 게시물답글등록 운영자 설명"],
            board_reply_added_favorite: UserLang["게시판 게시물답글등록 즐겨찾기 설명"],
            board_reply_added_creator: UserLang["게시판 게시물답글등록 등록자 설명"],
            board_reply_added_origin_creator: UserLang["게시판 게시물답글등록 원글등록자 설명"],
            board_post_reply_changed_all: UserLang["게시판 게시물답글수정 전체 설명"],
            board_post_reply_changed_manager: UserLang["게시판 게시물답글수정 운영자 설명"],
            board_post_reply_changed_favorite: UserLang["게시판 게시물답글수정 즐겨찾기 설명"],
            board_post_reply_changed_creator: UserLang["게시판 게시물답글수정 등록자 설명"],
            board_post_reply_changed_origin_creator: UserLang["게시판 게시물답글수정 원글등록자 설명"],
            board_comment_added_creator: UserLang["게시판 댓글 게시물등록자 설명"],
            board_comment_added_comment_creator: UserLang["게시판 댓글 등록자 설명"],
            board_post_recommended_creator: UserLang["게시판 추천 등록자 설명"],
            community_member_added_master: UserLang["커뮤니티 멤버추가 마스터 설명"],
            community_member_added_member: UserLang["커뮤니티 멤버추가 멤버 설명"],
            community_apply_to_join_master: UserLang["커뮤니티 가입신청 마스터 설명"],
            community_request_siteadmin: UserLang["커뮤니티 개설신청 관리자 설명"],
            community_post_added_all: UserLang["커뮤니티 게시물등록 전체 설명"],
            community_post_added_manager: UserLang["커뮤니티 게시물등록 운영자 설명"],
            community_post_added_creator: UserLang["커뮤니티 게시물등록 등록자 설명"],
            community_post_changed_all: UserLang["커뮤니티 게시물수정 전체 설명"],
            community_post_changed_manager: UserLang["커뮤니티 게시물수정 운영자 설명"],
            community_post_changed_comment_creator: UserLang["커뮤니티 게시물수정 댓글등록자 설명"],
            community_reply_added_all: UserLang["커뮤니티 게시물답글등록 전체 설명"],
            community_reply_added_manager: UserLang["커뮤니티 게시물답글등록 운영자 설명"],
            community_reply_added_creator: UserLang["커뮤니티 게시물답글등록 등록자 설명"],
            community_reply_added_origin_creator: UserLang["커뮤니티 게시물답글등록 원글등록자 설명"],
            community_post_reply_changed_all: UserLang["커뮤니티 게시물답글수정 전체 설명"],
            community_post_reply_changed_manager: UserLang["커뮤니티 게시물답글수정 운영자 설명"],
            community_post_reply_changed_creator: UserLang["커뮤니티 게시물답글수정 등록자 설명"],
            community_post_reply_changed_origin_creator: UserLang["커뮤니티 게시물답글수정 원글등록자 설명"],
            community_comment_added_creator: UserLang["커뮤니티 댓글 게시물등록자 설명"],
            community_comment_added_comment_creator: UserLang["커뮤니티 댓글 등록자 설명"],
            community_post_recommended_creator: UserLang["커뮤니티 추천 등록자 설명"],
            todo_member_added_all: UserLang["투두 멤버추가 전체 설명"],
            todo_member_added_manager: UserLang["투두 멤버추가 운영자 설명"],
            todo_member_added_favorite: UserLang["투두 멤버추가 즐겨찾기 설명"],
            todo_item_moved_all: UserLang["투두 카드이동 전체 설명"],
            todo_item_moved_manager: UserLang["투두 카드이동 운영자 설명"],
            todo_item_moved_favorite: UserLang["투두 카드이동 즐겨찾기 설명"],
            todo_item_moved_director: UserLang["투두 카드이동 담당자 설명"],
            todo_item_moved_comment_creator: UserLang["투두 카드이동 댓글등록자 설명"],
            todo_director_changed_all: UserLang["투두 담당자변경 전체 설명"],
            todo_director_changed_manager: UserLang["투두 담당자변경 운영자 설명"],
            todo_director_changed_favorite: UserLang["투두 담당자변경 즐겨찾기 설명"],
            todo_director_changed_director: UserLang["투두 담당자변경 담당자 설명"],
            todo_director_changed_comment_creator: UserLang["투두 담당자변경 댓글등록자 설명"],
            todo_item_comment_added_all: UserLang["투두 댓글등록 전체 설명"],
            todo_item_comment_added_manager: UserLang["투두 댓글등록 운영자 설명"],
            todo_item_comment_added_favorite: UserLang["투두 댓글등록 즐겨찾기 설명"],
            todo_item_comment_added_director: UserLang["투두 댓글등록 담당자 설명"],
            todo_item_comment_added_comment_creator: UserLang["투두 댓글등록 댓글등록자 설명"],
            todo_item_attach_added_all: UserLang["투두 첨부파일 전체 설명"],
            todo_item_attach_added_manager: UserLang["투두 첨부파일 운영자 설명"],
            todo_item_attach_added_favorite: UserLang["투두 첨부파일 즐겨찾기 설명"],
            todo_item_attach_added_director: UserLang["투두 첨부파일 담당자 설명"],
            todo_item_attach_added_comment_creator: UserLang["투두 첨부파일 댓글등록자 설명"],
            todo_item_checklist_added_all: UserLang["투두 세부작업추가 전체 설명"],
            todo_item_checklist_added_manager: UserLang["투두 세부작업추가 운영자 설명"],
            todo_item_checklist_added_favorite: UserLang["투두 세부작업추가 즐겨찾기 설명"],
            todo_item_checklist_added_director: UserLang["투두 세부작업추가 담당자 설명"],
            todo_item_checklist_added_comment_creator: UserLang["투두 세부작업추가 댓글등록자 설명"],
            todo_item_checklist_completed_all: UserLang["투두 세부작업완료 전체 설명"],
            todo_item_checklist_completed_manager: UserLang["투두 세부작업완료 운영자 설명"],
            todo_item_checklist_completed_favorite: UserLang["투두 세부작업완료 즐겨찾기 설명"],
            todo_item_checklist_completed_director: UserLang["투두 세부작업완료 담당자 설명"],
            todo_item_checklist_completed_comment_creator: UserLang["투두 세부작업완료 댓글등록자 설명"],
            todo_item_added_all: UserLang["투두 카드등록 전체 설명"],
            todo_item_added_manager: UserLang["투두 카드등록 운영자 설명"],
            todo_item_added_favorite: UserLang["투두 카드등록 즐겨찾기 설명"],
            calendar_company_event_added_attendee: UserLang["캘린더 전사일정 참석자 설명"],
            calendar_event_created_attendee: UserLang["캘린더 일정등록 참석자 설명"],
            calendar_event_updated_attendee: UserLang["캘린더 일정수정 참석자 설명"],
            calendar_event_updated_comment_creator: UserLang["캘린더 일정수정 댓글등록자 설명"],
            calendar_follow_requested_requested_calendar_owner: UserLang["캘린더 관심동료신청 수신자 설명"],
            calendar_follow_request_accepted_follower: UserLang["캘린더 관심동료신청수락 신청자 설명"],
            calendar_follow_request_denied_follower: UserLang["캘린더 관심동료신청거부 신청자 설명"],
            calendar_event_reminder_attendee: UserLang["캘린더 일정알림 참석자 설명"],
            calendar_event_commented_attendee: UserLang["캘린더 댓들 참석자 설명"],
            calendar_event_commented_comment_creator: UserLang["캘린더 댓글 댓글등록자 설명"],
            applet_doc_added_all_sharer: UserLang["웍스 데이터등록 공유자 설명"],
            applet_doc_added_manager: UserLang["웍스 데이터등록 운영자 설명"],
            applet_doc_added_favorite: UserLang["웍스 데이터등록 즐겨찾기 설명"],
            applet_doc_added_data_added_user: UserLang["웍스 데이터등록 추가된사용자 설명"],
            applet_doc_added_manager_setting: UserLang["웍스 데이터등록 운영자설정 설명"],
            applet_doc_status_changed_all_sharer: UserLang["웍스 상태변경 공유자 설명"],
            applet_doc_status_changed_manager: UserLang["웍스 상태변경 운영자 설명"],
            applet_doc_status_changed_favorite: UserLang["웍스 상태변경 즐겨찾기 설명"],
            applet_doc_status_changed_data_added_user: UserLang["웍스 상태변경 추가된사용자 설명"],
            applet_doc_status_changed_creator: UserLang["웍스 상태변경 등록자 설명"],
            applet_doc_status_changed_manager_setting: UserLang["웍스 상태변경 운영자설정 설명"],
            applet_doc_edited_all_sharer: UserLang["웍스 데이터변경 공유자 설명"],
            applet_doc_edited_manager: UserLang["웍스 데이터변경 운영자 설명"],
            applet_doc_edited_favorite: UserLang["웍스 데이터변경 즐겨찾기 설명"],
            applet_doc_edited_data_added_user: UserLang["웍스 데이터변경 추가된사용자 설명"],
            applet_doc_edited_creator: UserLang["웍스 데이터변경 등록자 설명"],
            applet_doc_edited_manager_setting: UserLang["웍스 데이터변경 운영자설정 설명"],
            applet_activity_added_all_sharer: UserLang["웍스 활동기록등록 공유자 설명"],
            applet_activity_added_manager: UserLang["웍스 활동기록등록 운영자 설명"],
            applet_activity_added_favorite: UserLang["웍스 활동기록등록 즐겨찾기 설명"],
            applet_activity_added_data_added_user: UserLang["웍스 활동기록등록 추가된사용자 설명"],
            applet_activity_added_creator: UserLang["웍스 활동기록등록 등록자 설명"],
            applet_activity_added_activity_creator: UserLang["웍스 활동기록등록 운영자설정 설명"],
            applet_activity_edited_all_sharer: UserLang["웍스 활동기록수정 공유자 설명"],
            applet_activity_edited_manager: UserLang["웍스 활동기록수정 운영자 설명"],
            applet_activity_edited_favorite: UserLang["웍스 활동기록수정 즐겨찾기 설명"],
            applet_activity_edited_data_added_user: UserLang["웍스 활동기록수정 추가된사용자 설명"],
            applet_activity_edited_creator: UserLang["웍스 활동기록수정 등록자 설명"],
            applet_comment_added_all_sharer: UserLang["웍스 댓글 공유자 설명"],
            applet_comment_added_manager: UserLang["웍스 댓글 운영자 설명"],
            applet_comment_added_data_added_user: UserLang["웍스 댓글 추가된사용자 설명"],
            applet_comment_added_creator: UserLang["웍스 댓글 등록자 설명"],
            applet_comment_added_activity_creator: UserLang["웍스 댓글 활동기록등록자 설명"],
            applet_comment_added_comment_creator: UserLang["웍스 댓글 등록자 설명"],
            applet_integration_requested_manager: UserLang["웍스 데이터연동신청 운영자 설명"],
            applet_integration_accepted_manager: UserLang["웍스 데이터연동수락 운영자 설명"],
            survey_progress_respondent: UserLang["설문 등록 대상자 설명"],
            survey_progress_referrer: UserLang["설문 등록 참조자 설명"],
            survey_none_temp_respondent_norespondent: UserLang["설문 미참여자알림 미참여자 설명"],
            survey_comment_added_creator: UserLang["설문 댓글 등록자 설명"],
            survey_comment_added_respondent: UserLang["설문 댓글 대상자 설명"],
            survey_comment_added_referrer: UserLang["설문 댓글 참조자 설명"],
            survey_comment_added_comment_creator: UserLang["설문 댓글 댓글등록자 설명"],
            report_reporter_added_reporter: UserLang["보고 보고자등록 보고자 설명"],
            report_added_manager: UserLang["보고 보고서등록 운영자 설명"],
            report_added_referrer: UserLang["보고 보고서등록 참조자 설명"],
            report_changed_manager: UserLang["보고 보고서수정 운영자 설명"],
            report_changed_referrer: UserLang["보고 보고서수정 참조자 설명"],
            report_series_comment_added_manager: UserLang["보고 정기보고회차댓글 운영자 설명"],
            report_series_comment_added_referrer: UserLang["보고 정기보고회차댓글 참조자 설명"],
            report_series_comment_added_report_recipient: UserLang["보고 정기보고회차댓글 보고자 설명"],
            report_series_comment_added_comment_creator: UserLang["보고 정기보고회차댓글 댓글등록자 설명"],
            report_comment_added_manager: UserLang["보고 상세댓글 운영자 설명"],
            report_comment_added_referrer: UserLang["보고 상세댓글 참조자 설명"],
            report_comment_added_reporter: UserLang["보고 상세댓글 보고자 설명"],
            report_comment_added_comment_creator: UserLang["보고 상세댓글 댓글등록자 설명"],
            report_referrer_added_referrer: UserLang["보고 참조자 사용자 설명"],
            report_manager_added_manager: UserLang["보고 운영자 사용자 설명"],
            document_arrived_wait_approval: UserLang["결재 도착 결재대기자 설명"],
            document_arrived_wait_agreement: UserLang["결재 도착 합의대기자 설명"],
            document_arrived_wait_check: UserLang["결재 도착 확인대기자 설명"],
            document_arrived_wait_inspection: UserLang["결재 도착 감사대기자 설명"],
            document_arrived_wait_deputy: UserLang["결재 도착 대결자 설명"],
            document_withdrew_wait_approval: UserLang["결재 회수 결재대기자 설명"],
            document_withdrew_wait_agreement: UserLang["결재 회수 합의대기자 설명"],
            document_withdrew_wait_check: UserLang["결재 회수 확인대기자 설명"],
            document_withdrew_wait_inspection: UserLang["결재 회수 감사대기자 설명"],
            document_withdrew_wait_deputy: UserLang["결재 회수 대결자 설명"],
            document_returned_drafter: UserLang["결재 반려 기안자 설명"],
            document_returned_approval: UserLang["결재 반려 결재자 설명"],
            document_returned_agreement: UserLang["결재 반려 합의자 설명"],
            document_returned_check: UserLang["결재 반려 확인자 설명"],
            document_returned_inspection: UserLang["결재 반려 감사자 설명"],
            document_returned_referrer: UserLang["결재 반려 참조자 설명"],
            document_previous_returned_approval: UserLang["결재 전단계반려 결재자 설명"],
            document_previous_returned_agreement: UserLang["결재 전단계반려 합의자 설명"],
            document_previous_returned_check: UserLang["결재 전단계반려 확인자 설명"],
            document_previous_returned_inspection: UserLang["결재 전단계반려 감사자 설명"],
            document_completed_drafter: UserLang["결재 완료 기안자 설명"],
            document_completed_approval: UserLang["결재 완료 결재자 설명"],
            document_completed_agreement: UserLang["결재 완료 합의자 설명"],
            document_completed_check: UserLang["결재 완료 확인자 설명"],
            document_completed_inspection: UserLang["결재 완료 감사자 설명"],
            document_completed_referrer: UserLang["결재 완료 참조자 설명"],
            document_completed_reader: UserLang["결재 완료 열람자 설명"],
            document_commented_drafter: UserLang["결재 댓글 기안자 설명"],
            document_commented_approval: UserLang["결재 댓글 결재자 설명"],
            document_commented_agreement: UserLang["결재 댓글 합의자 설명"],
            document_commented_check: UserLang["결재 댓글 확인자 설명"],
            document_commented_inspection: UserLang["결재 댓글 감사자 설명"],
            document_commented_referrer: UserLang["결재 댓글 참조자 설명"],
            document_commented_reader: UserLang["결재 댓글 열람자 설명"],
            document_reading_reader_added_add_reader: UserLang["결재 열람자추가 사용자 설명"],
            document_referrence_reader_added_add_referrer: UserLang["결재 참조자추가 사용자 설명"],
            document_received_dept_folder_director: UserLang["결재 수신도착 담당자 설명"],
            document_received_master: UserLang["결재 수신도착 부서장 설명"],
            document_received_receiver: UserLang["결재 수신도착 수신자 설명"],
            document_receiver_changed_receiver: UserLang["결재 담당자지정 사용자 설명"],
            document_received_returned_origin_drafter: UserLang["결재 반송 원문서기안자 설명"],
            asset_reserve_added_manager: UserLang["예약 등록 운영자 설명"],
            asset_reserve_changed_manager: UserLang["예약 변경 운영자 설명"],
            asset_reserve_canceled_manager: UserLang["예약 취소 운영자 설명"],
            asset_rent_added_manager: UserLang["예약 대여등록 운영자 설명"],
            asset_rent_canceled_manager: UserLang["예약 대여반납 운영자 설명"],
            asset_manager_added_add_manager: UserLang["예약 운영자설정 운영자 설명"],
            docs_added_all: UserLang["문서관리 등록 전체 설명"],
            docs_added_favorite: UserLang["문서관리 등록 즐겨찾기 설명"],
            docs_added_manager: UserLang["문서관리 등록 운영자 설명"],
            docs_updated_all: UserLang["문서관리 수정 전체 설명"],
            docs_updated_favorite: UserLang["문서관리 수정 즐겨찾기 설명"],
            docs_updated_manager: UserLang["문서관리 수정 운영자 설명"],
            docs_approval_request_manager: UserLang["문서관리 승인요청 운영자 설명"],
            docs_approval_request_canceled_manager: UserLang["문서관리 요청취소 운영자 설명"],
            docs_approved_requester: UserLang["문서관리 승인완료 요청자 설명"],
            docs_rejected_requester: UserLang["문서관리 반려 요청자 설명"],
            webfolder_added_shared_folder: UserLang["자료실 파일등록 공유한폴더 설명"],
            webfolder_added_sharing_folder: UserLang["자료실 파일등록 공유받은폴더 설명"],
            webfolder_shared_shared_user: UserLang["자료실 공유자설정 사용자 설명"],
            ehr_day_ehr_clockin: UserLang["출근 체크 설명"],
            ehr_day_ehr_clockout: UserLang["퇴근 체크 설명"],
            ehr_day_ehr_rest_time: UserLang["휴게시간 종료 설명"],
            ehr_week_ehr_overtime_40_before: UserLang["40시간 초과 전 설명"],
            ehr_week_ehr_overtime_40_after: UserLang["40시간 초과 설명"],
            ehr_week_ehr_overtime_52_before: UserLang["52시간 초과 전 설명"],
            ehr_week_ehr_overtime_52_after: UserLang["52시간 초과 설명"],
            ehr_month_ehr_overtime_month_min_before: UserLang["기본 근무시간 초과 전 설명"],
            ehr_month_ehr_overtime_month_min_after: UserLang["기본 근무시간 초과 설명"],
            ehr_month_ehr_overtime_month_max_before: UserLang["연장 근무시간 초과 전 설명"],
            ehr_month_ehr_overtime_month_max_after: UserLang["연장 근무시간 초과 설명"],
            ehr_timeline_admin_ehr_timeline_admin_push: UserLang["운영자로 설정된 사용자 설명"],
            ehr_day_ehr_auto_clockout_push: UserLang["자동퇴근 설명"]
        },
        appOrder : ["mail", "approval", "calendar", "board", "community", "survey", "report", "todo", "works", "asset", "docs", "webfolder", "task", "ehr", "channel"],
        el : "#content",
        delegateEvents: function(events) {
            this.undelegateEvents();
            Backbone.View.prototype.delegateEvents.call(this, events);
            this.$el.on("click.usernotice", "#saveBaseNotiSetting", $.proxy(this.saveBaseNotiSetting, this));
            this.$el.on("click.usernotice", "#cancelBaseNotiSetting", $.proxy(this.cancelBaseNotiSetting, this));
            this.$el.on("click.usernotice", ".module_drop_head span.tit", $.proxy(this.toggleModuleDropHead, this));
            this.$el.on("click.usernotice", "button.btn_toggle ", $.proxy(this.notiOnOffToggle, this));
            this.$el.on("click.usernotice", "input[type='checkbox'][value='all']", $.proxy(this.toggleAllType, this));
            this.$el.on("click.usernotice", ".list_setting .app_event span.tit ", $.proxy(this.toggleDescription, this));
            return this;
        },
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.off(".usernotice");
            return this;
        },
        initialize : function(){
            $(this.el).removeClass("go_home");
            this.notiModel = UserNotiModel.read();
            this.siteConfigModel = SiteConfigModel.read().toJSON();
        },
        cancel : function(){
            $.goAlert(CommonLang["취소되었습니다."], "", $.proxy(this.render, this));
            return false;
        },
        reload : function(){
            window.location.reload(true);
        },
        render : function(){

            this.$el.html(NoticdTmpl({
                lang: this.lang
            }));

            //공통 알림 설정
            this.drawBaseNotiTemplate();
            this._renderBrowserTitle();
            return this;
        },

        drawBaseNotiTemplate : function() {
            var self = this;
            var notiModel = this.notiModel.toJSON();

            $.getJSON(GO.config("contextRoot")+"resources/js/app/views/user/baseSettingMenu.json", function(data){
                var tmpl = "";
                $.each(self.appOrder, function(i, appName){
                    if(!self.isAccessibleApp(appName)){
                        //접근 가능하지 않은 앱이면 그리지 않는다.
                        return;
                    }

                    var appModel = appName + "NotiModel";
                    var appUseNotiName = "use" + appName.charAt(0).toUpperCase() + appName.slice(1) + "Noti";

                    tmpl = tmpl + MenuNotiTmpl({
                        lang : self.lang,
                        model : notiModel[appModel],
                        appTitle : self.apps[appName],
                        appName : appName,
                        appUseWebPush : notiModel.webNotiSetting[appUseNotiName],
                        appUseMobilePush: notiModel.mobileNotiSetting[appUseNotiName],
                        appUseMail : notiModel.mailNotiSetting[appUseNotiName],
                        hasSubOption : function() {
                            if(appName == "task" || appName == "channel"){
                                return false;
                            }
                            return true;
                        },
                        getMobileCss : function() {
                            if(appName == "webfolder") { return "none" }
                            return notiModel.mobileNotiSetting[appUseNotiName] ? "on" : "off";
                        },
                        getMobileTitle : function() {
                            if(appName == "webfolder") { return "NONE" }
                            return notiModel.mobileNotiSetting[appUseNotiName] ? "ON" : "OFF";
                        },
                        getMobileText : function() {
                            if(appName == "webfolder") { return "-" }
                            return UserLang["모바일"];
                        },
                        getMailCss : function() {
                            if(appName == "ehr") { return "none" }
                            return notiModel.mailNotiSetting[appUseNotiName] ? "on" : "off";
                        },
                        getMailTitle : function() {
                            if(appName == "ehr") { return "NONE" }
                            return notiModel.mailNotiSetting[appUseNotiName] ? "ON" : "OFF";
                        },
                        getMailText : function() {
                            if(appName == "ehr") { return "-" }
                            return UserLang["메일"];
                        },
                        isFile : function() {
                            if(appName == "webfolder"){
                                return true;
                            }
                            return false;
                        },
                        convertEventName : function(){
                            //이벤트 code를 이름과 맵핑
                            var eventName = this.event.replace(/\./gi, "_");
                            return self.event[eventName];
                        },
                        isUseMail : function(){
                            if(appName == "ehr"){
                                return false;
                            }

                            if(this.event == "mail.arrived"){
                                return false;
                            }
                            return true;
                        },
                        eventDescription : function() {
                            var _self = this;
                            return function(value){
                                var targetsTmpl = "";
                                //알림을 받을 체크되어 있는 값 표시
                                $.each(data[appName].events, function(k, v){
                                    if(v.event == _self.event){
                                        var event = v.event;
                                        $.each(v.targets, function(i, item){
                                            targetsTmpl = targetsTmpl + Hogan.compile(value).render({
                                                desc : function() {
                                                    var descKey = event+'.'+item;
                                                    return self.description[descKey.replace(/\./gi, "_")];
                                                }
                                            });
                                        });
                                    }
                                });
                                return targetsTmpl;
                            }
                        },


                        checkTargets : function() {
                            var _self = this;
                            return function(value){
                                var targetsTmpl = "";
                                //알림을 받을 체크되어 있는 값 표시
                                $.each(data[appName].events, function(k, v){
                                    if(v.event == _self.event){
                                        var roleEvent = v.event;
                                        var isContainAll = false;
                                        var isCheckedAll = false;
                                        $.each(v.targets, function(i, item){
                                            if (item == 'all'){
                                                isContainAll = true;
                                            }
                                            targetsTmpl = targetsTmpl + Hogan.compile(value).render({
                                                getRole : function(){
                                                    return item;
                                                },
                                                getEventKey : v.event,
                                                isChecked : function() {
                                                    var checked = "";
                                                    $.each(_self.targets, function(i, target){
                                                        if(item == target){
                                                            checked = "checked";
                                                            if (item=='all') {
                                                                isCheckedAll = true;
                                                            }		                    									}
                                                    });
                                                    return checked;
                                                },
                                                isDisable: function() {
                                                    if (isCheckedAll && isContainAll && item !='all')
                                                        return 'disabled';
                                                    return '';
                                                },
                                                getRoleName : function() {
                                                    if (roleEvent.indexOf('document') > -1) {
                                                        return self.getApprovalRoleName(roleEvent, item);
                                                    } else if (roleEvent.indexOf('report') > -1) {
                                                        return self.getReportRoleName(roleEvent, item)
                                                    } else if (roleEvent.indexOf('board') > -1 || roleEvent.indexOf('community') > -1) {
                                                        return self.getPostRelativeRoleName(roleEvent, item);
                                                    }
                                                    var roleName = item.replace(/\./gi, "_");
                                                    return self.role[roleName];
                                                }
                                            });
                                        });
                                    }
                                });
                                return targetsTmpl;
                            }
                        }
                    });
                });
                $("#baseNotiSetting div").before(tmpl);

            }).fail(function(jqXHR, textStatus, errorThrown) {
                console.warn('baseSettingMenu 파일이 없습니다.');
            });

        },

        isAccessibleApp: function(appName) {
            if(appName == "channel"){
                return this.siteConfigModel.channelService =="on";
            }else{
                return GO.isAvailableApp(appName);
            }
        },

        getPostRelativeRoleName : function (event, eventRole) {
            //등록자 알림
            var creatorAlimEvt = ['board.post.added', 'board.reply.added', 'board.post.reply.changed', 'community.post.added', 'community.reply.added', 'community.post.reply.changed'];
            //게시물 등록
            var postCreateEvt = ['board.comment.added', 'board.post.recommended', 'community.comment.added', 'community.post.recommended'];

            if (creatorAlimEvt.indexOf(event) > -1) {
                if (eventRole === 'creator') {
                    return this.role['creator_noti'];
                }
            } else if (postCreateEvt.indexOf(event) > -1) {
                if (eventRole === 'creator') {
                    return this.role['post_creator'];
                }
            }
            if ('community.member.added' === event) {
                if (eventRole === 'member') {
                    return this.role['community_member'];
                }
            }
            return this.role[eventRole.replace(/\./gi, "_")];
        },

        getApprovalRoleName : function (event, eventRole) {
            if ('document.commented' === event) {
                if (eventRole === 'approval') {
                    return this.role['approve_people'];
                } else if (eventRole === 'agreement') {
                    return this.role['agree_people'];
                } else if (eventRole === 'check') {
                    return this.role['check_people'];
                } else if (eventRole === 'inspection') {
                    return this.role['inspect_people'];
                }
            } else if ('document.received' === event) {
                if (eventRole === 'master') {
                    return this.role['leader'];
                }
            } else if ('document.receiver.changed' === event) {
                if (eventRole === 'receiver') {
                    return this.role['director'];
                }
            }
            return this.role[eventRole.replace(/\./gi, "_")];
        },

        getReportRoleName : function (event, eventRole) {
            if ('report.referrer.added' === event) {
                if (eventRole === 'referrer') {
                    return this.role['registered_referrer'];
                }
            } else if ('report.manager.added' === event) {
                if (eventRole === 'manager') {
                    return this.role['registered_manager'];
                }
            }

            return this.role[eventRole.replace(/\./gi, "_")];
        },

        _renderBrowserTitle : function(){
            $(document).attr('title', this.lang['title'] + ' - ' + GO.config('webTitle'));
        },

        getUseApps : function(){
            var self = this;
            var useApps = [];
            $.each(self.model.toJSON(), function(key, value){
                if(key.indexOf("use") > -1){
                    var appName = key.split("use")[1].split("Noti")[0].toLowerCase();
                    useApps[appName] = GO.isAvailableApp(appName);
                }
            });
            return useApps;
        },

        toggleModuleDropHead : function(e) {
            var menuName = $(e.currentTarget).parents('.module_drop').attr("data-app-name");
            if("task" == menuName || "channel" == menuName){
                return;
            }
            var arrowTarget = $(e.currentTarget).find('span').first();
            if(arrowTarget.hasClass('ic_arrow_t')){
                arrowTarget.removeClass('ic_arrow_t').addClass('ic_arrow_d');
            }else{
                arrowTarget.removeClass('ic_arrow_d').addClass('ic_arrow_t');
            }
            var currentTaget = $(e.currentTarget).parents('div.module_drop').find(".module_drop_body");
            currentTaget.slideToggle();
        },

        toggleAllType : function(e) {
            this.renderAllType(e.currentTarget);
        },
        renderAllType : function (target) {
            if ($(target).is(':checked')) {
                $(target).closest('div.data').find('input').each(function(i, item) {
                    if ($(item).val() !='all') {
                        $(item).attr('disabled',true);
                    }
                });
            } else {
                $(target).closest('div.data').find('input').attr('disabled',false);
            }
        },

        notiOnOffToggle : function(e) {
            var arrowTarget = $(e.currentTarget);
            if(arrowTarget.hasClass('on')){
                arrowTarget.removeClass('on').addClass('off');
                arrowTarget.attr("title", "OFF");
            }else if(arrowTarget.hasClass('off')){
                arrowTarget.removeClass('off').addClass('on');
                arrowTarget.attr("title", "ON");
            }
            $(e.currentTarget).parent().next().slideToggle();
        },

        toggleDescription : function(e) {
            $(e.currentTarget).closest('li.app_event').find('ul.list_guide_set').stop().slideToggle();
        },

        saveBaseNotiSetting : function() {

            var self = this;
            var webNotiSetting = self.notiModel.attributes.webNotiSetting;
            var mobileNotiSetting = self.notiModel.attributes.mobileNotiSetting;
            var mailNotiSetting = self.notiModel.attributes.mailNotiSetting;

            $.each($("div.app_events"), function(i, events) {
                var appName = $(events).attr("data-app-name");
                var appModelName = appName + "NotiModel";
                var notiSettingName = "use" + appName.charAt(0).toUpperCase() + appName.slice(1) + "Noti";
                webNotiSetting[notiSettingName] =  $(events).find('.module_drop_head button.pc').hasClass('on');
                mobileNotiSetting[notiSettingName] =  $(events).find('.module_drop_head button.mobile').hasClass('on');
                mailNotiSetting[notiSettingName] =  $(events).find('.module_drop_head button.mail').hasClass('on');

                var notiEvents = [];
                $.each($(events).find(".app_event"), function(i, event) {
                    var eventCode = $(event).attr("data-event-code");
                    var useWebPush = $(event).find('button.pc').hasClass('on');
                    var useMobilePush = $(event).find('button.mobile').hasClass('on');
                    var useMail = $(event).find('button.mail').hasClass('on');

                    var targets = [];
                    $.each($(event).find("input:checkbox:checked"), function(i, target) {
                        targets.push($(target).val());
                    });

                    var notiEvnet = {
                        "event" : eventCode,
                        "useWebPush" : useWebPush,
                        "useMobilePush" : useMobilePush,
                        "useMail" : useMail,
                        "targets" : targets
                    };

                    notiEvents.push(notiEvnet);

                });

                self.notiModel.set(appModelName, {"events" : notiEvents}, {silent: true});
            });
            self.notiModel.set(webNotiSetting, webNotiSetting, {silent: true});
            self.notiModel.set(mobileNotiSetting, mobileNotiSetting, {silent: true});
            self.notiModel.set(mailNotiSetting, mailNotiSetting, {silent: true});

            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            this.notiModel.save({}, {
                type: 'POST',
                contentType: 'application/json',
                success: function(model, response){
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    $.goMessage(self.lang.saveSuccess);
                },
                error: function(model, response){
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    $.goMessage(self.lang.saveFail);
                }
            });
        },

        cancelBaseNotiSetting : function() {
            this.render();
        }
    });

    return {
        render: function() {
            var userNotice = new UserNotice();
            return userNotice.render();
        }
    };

});
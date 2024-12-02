define('components/form_component_manager/constants/components', function(require) {
    var commonLang = require('i18n!nls/commons');

    return {
        '제목': {
            label: commonLang['제목'],
            data: {
                type: 'text',
                id: 'subject',
                duplicate: false
            },
            iconClass: 'ic_comp_subject'
        },
        '본문 내용': {
            label: commonLang['본문 내용'],
            data: {
                type: 'editor',
                id: 'appContent',
                duplicate: false
            },
            iconClass: 'ic_comp_contents'
        },
        '결재선': {
            label: commonLang['결재선'],
            data: {
                type: 'room',
                name: commonLang['결재선'],
                roomType: 'type1',
                maxApprovalCount: 5
            },
            iconClass: 'ic_comp_approveLine'
        },
        '텍스트': {
            label: commonLang['텍스트'],
            data: {
                type: 'text'
            },
            iconClass: 'ic_comp_txt'
        },
        '멀티텍스트': {
            label: commonLang['멀티텍스트'],
            data: {
                type: 'textarea'
            },
            iconClass: 'ic_comp_multiTxt'
        },
        '편집기': {
            label: commonLang['편집기'],
            data: {
                type: 'editor'
            },
            iconClass: 'ic_comp_editor'
        },
        '숫자': {
            label: commonLang['숫자'],
            data: {
                type: 'number'
            },
            iconClass: 'ic_comp_num'
        },
        '통화': {
            label: commonLang['통화'],
            data: {
                type: 'currency',
                options: [{value: '0'}]
            },
            iconClass: 'ic_comp_current'
        },
        '단일선택': {
            label: commonLang['단일선택'],
            data: {
                type: 'radio',
                options: [
                    {value: 'A'},
                    {value: 'B'}
                ]
            },
            iconClass: 'ic_comp_radio'
        },
        '드롭박스': {
            label: commonLang['드롭박스'],
            data: {
                type: 'cSel',
                options: [
                    {value: 'A'},
                    {value: 'B'}
                ]
            },
            iconClass: 'ic_comp_drop'
        },
        '체크박스': {
            label: commonLang['체크박스'],
            data: {
                type: 'check',
                options: [
                    {value: 'A'},
                    {value: 'B'}
                ]
            },
            iconClass: 'ic_comp_chk'
        },
        '날짜': {
            label: commonLang['날짜'],
            data: {
                type: 'calendar'
            },
            iconClass: 'ic_comp_date'
        },
        '시간': {
            label: commonLang['시간'],
            data: {
                type: 'time'
            },
            iconClass: 'ic_comp_time'
        },
        '기간': {
            label: commonLang['기간'],
            data: {
                type: 'period'
            },
            iconClass: 'ic_comp_day'
        },
        '사용자선택': {
            label: commonLang['사용자선택'],
            data: {
                type: 'cOrg',
                id: 'auto'
            },
            iconClass: 'ic_comp_user'
        },
        '부서선택': {
            label: commonLang['부서선택'],
            data: {
                type: 'cOrg',
                orgType: 'department',
                id: 'auto'
            },
            iconClass: 'ic_comp_depart'
        },
        '레이블': {
            label: commonLang['레이블'],
            data: {
                type: 'label'
            },
            iconClass: 'ic_comp ic_comp_label'
        },
        '기안자': {
            label: commonLang['기안자'],
            data: {
                type: 'label',
                id: 'draftUser'
            },
            iconClass: 'ic_comp_drafter'
        },
        '기안부서': {
            label: commonLang['기안부서'],
            data: {
                type: 'label',
                id: 'draftDept'
            },
            iconClass: 'ic_comp_drafDepart'
        },
        '기안자이메일': {
            label: commonLang['기안자이메일'],
            data: {
                type: 'label',
                id: 'draftUserEmail'
            },
            iconClass: 'ic_comp_drafMail'
        },
        '직위': {
            label: commonLang['직위'],
            data: {
                type: 'label',
                id: 'position'
            },
            iconClass: 'ic_comp_position'
        },
        '사번': {
            label: commonLang['사번'],
            data: {
                type: 'label',
                id: 'empNo'
            },
            iconClass: 'ic_comp_companyNum'
        },
        '핸드폰번호': {
            label: commonLang['핸드폰번호'],
            data: {
                type: 'label',
                id: 'mobileNo'
            },
            iconClass: 'ic_comp_selNum'
        },
        '직통전화': {
            label: commonLang['직통전화'],
            data: {
                type: 'label',
                id: 'directTel'
            },
            iconClass: 'ic_comp_phone'
        },
        '대표번호': {
            label: commonLang['대표번호'],
            data: {
                type: 'label',
                id: 'repTel'
            },
            iconClass: 'ic_comp_directory'
        },
        '팩스': {
            label: commonLang['팩스'],
            data: {
                type: 'label',
                id: 'fax'
            },
            iconClass: 'ic_comp_fax'
        },
        '기안일': {
            label: commonLang['기안일'],
            data: {
                type: 'label',
                id: 'draftDate'
            },
            iconClass: 'ic_comp_drafDate'
        },
        '완료일': {
            label: commonLang['완료일'],
            data: {
                type: 'label',
                id: 'completeDate'
            },
            iconClass: 'ic_comp_completeDate'
        },
        '문서번호': {
            label: commonLang['문서번호'],
            data: {
                type: 'label',
                id: 'docNo'
            },
            iconClass: 'ic_comp_docNum'
        },
        '공개여부': {
            label: commonLang['공개여부'],
            data: {
                type: 'label',
                id: 'openOption'
            },
            iconClass: 'ic_comp_public'
        },
        '보안등급': {
            label: commonLang['보안등급'],
            data: {
                type: 'label',
                id: 'securityLevel'
            },
            iconClass: 'ic_comp_security'
        },
        '보존연한': {
            label: commonLang['보존연한'],
            data: {
                type: 'label',
                id: 'preserveDuration'
            },
            iconClass: 'ic_comp_save'
        },
        '전사문서함': {
            label: commonLang['전사문서함'],
            data: {
                type: 'label',
                id: 'docClassification'
            },
            iconClass: 'ic_comp_docFolder'
        },
        '첨부파일명': {
            label: commonLang['첨부파일명'],
            data: {
                type: 'label',
                id: 'attachFile'
            },
            iconClass: 'ic_comp_attackName' // 오타 아님
        },
        '참조자': {
            label: commonLang['참조자'],
            data: {
                type: 'label',
                id: 'docReference'
            },
            iconClass: 'ic_comp_reference'
        },
        '수신자': {
            label: commonLang['수신자'],
            data: {
                type: 'label',
                id: 'recipient'
            },
            iconClass: 'ic_comp_recive' // 오타 아님
        },
        '합의 결재선': {
            label: commonLang['합의 결재선'],
            data: {
                type: 'room',
                duplicate: false,
                name: commonLang['합의'],
                roomType: 'type1',
                seq: 10, // 수신/합의 결재선에서 seq 는 의미 없음
                maxApprovalCount: 1,
                isAgreement: true
            },
            iconClass: 'ic_comp_agreement'
        },
        '수신 결재선': {
            label: commonLang['수신 결재선'],
            data: {
                type: 'room',
                duplicate: false,
                name: commonLang['수신'],
                roomType: 'type1',
                seq: 11, // 수신/합의 결재선에서 seq 는 의미 없음
                maxApprovalCount: 7,
                isReception: true
            },
            iconClass: 'ic_comp_reciveApproval' // 오타아님
        },
        '단일선택 자동결재선': {
            label: commonLang['단일선택 자동결재선'],
            data: {
                type: 'radio',
                id: 'apprLineRuleOption',
                options: [
                    {value: 'A'},
                    {value: 'B'}
                ],
                isAutoType: true,
                duplicate: false
            },
            iconClass: 'ic_comp_autoDrop'
        },
        '드롭박스 자동결재선': {
            label: commonLang['드롭박스 자동결재선'],
            data: {
                type: 'cSel',
                id: 'apprLineRuleOption',
                options: [
                    {value: 'A'},
                    {value: 'B'}
                ],
                isAutoType: true,
                duplicate: false
            },
            iconClass: 'ic_comp_autoDrop'
        },
        '통화 자동결재선': {
            label: commonLang['통화 자동결재선'],
            data: {
                type: 'currency',
                id: 'apprLineRuleAmount',
                isAutoType: true,
                duplicate: false
            },
            iconClass: 'ic_comp_autoCurrrent'
        },
        '발신명의': {
            label: commonLang['발신명의'],
            data: {
                type: 'label',
                id: 'officialDocSender',
                duplicate: false
            },
            iconClass: 'ic_comp_dispatch'
        },
        '공문수신처': {
            label: commonLang['공문수신처'],
            data: {
                type: 'span',
                id: 'officialDocReceiver',
                duplicate: false
            },
            iconClass: 'ic_comp_officialDoc'
        },
        '공문수신처2': {
            label: commonLang['공문수신처2'],
            data: {
                type: 'span',
                id: 'officialDocVersionReceiver',
                duplicate: false
            },
            iconClass: 'ic_comp_officialDoc'
        },
        '이름 및 직위': {
            label: commonLang['이름 및 직위'],
            data: {
                type: 'name_pos'
            }
        },
        '이름': {
            label: commonLang['이름'],
            data: {
                type: 'user_name'
            }
        },
        '직위(보고)': {
            label: commonLang['직위'],
            data: {
                type: 'user_pos'
            },
            iconClass: 'ic_comp_position'
        },
        '사번(보고)': {
            label: commonLang['사번'],
            data: {
                type: 'user_empno'
            },
            iconClass: 'ic_comp_companyNum'
        },
        '소속부서': {
            label: commonLang['소속부서'],
            data: {
                type: 'user_org'
            },
            iconClass: 'ic_comp_depart'
        },
        '오늘날짜': {
            label: commonLang['오늘날짜'],
            data: {
                type: 'today'
            },
            iconClass: 'ic_comp_date'
        }
    };
});

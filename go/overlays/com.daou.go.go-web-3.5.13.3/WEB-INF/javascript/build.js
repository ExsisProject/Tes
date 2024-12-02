({
    mainConfigFile: '../../resources/js/conf/config.js',
    // 웹앱 경로
    appDir: "../../resources/js",
    // 기본 디렉토리(appDir에 상대적인 값)
    baseUrl: "./app",
    // 빌드결과가 저장될 디렉토리
    dir: "../../resources/dist/js",
//    dir: "./built",

    // 모듈 정의(bundle 정의)
    modules: [{
        // vendors 정의
        name: '../vendors',
        include: [
            // 기반 라이브러리들
            'jquery', 'jquery-migrate', 'underscore', 'json2', 'backbone',
            'moment', 'amplify', 'when', 'when/sequence', 'jquery.ui',
            // jquery plugins
            'jquery.cookie', 'jquery.autocomplete', 'jquery.dotdotdot', 'jquery.maskMoney', 'jquery.printElement',
            'jquery.jqplugin', 'jquery.placeholder', 'jquery.nanoscroller', 'jquery.jstree', 'jquery.jstree.hotkeys',
            'jquery.fancybox', 'jquery.fancybox-thumbs', 'jquery.fancybox-buttons', 'jquery.inputmask', 'jquery.tooltipster',
            'jquery.mobile',
            'jquery.ui.locale.ko', 'jquery.ui.locale.ja', 'jquery.ui.locale.en',
            'jquery.ui.locale.zh_CN', 'jquery.ui.locale.zh_TW',
            // backbone plugins
            'backbone.routefilter',
            // require plugins
            'text', 'json', 'i18n',
            '../vendors/requirejs/plugins/css/normalize', 'css',
            // 어플리케이션 초기화시 사용되는 라이브러리
            'browser',
            'iscroll'
            //'axisj', 'css', 'hgn', 'strophe' // build 하면 error 발생함.
        ],
        create: true
    }, {
        name: 'app',
        include: [
            'GO.util', 'jquery.go-validation', 'go-nametags', 'jquery.go-sdk'
        ],
        exclude: ['../vendors', 'hogan', 'hgn',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'go-charts',
        include: [
            'jquery.flot',
            'jquery.flot/jquery.flot.pie',
            'jquery.flot/jquery.flot.stack',
            'jquery.flot/jquery.flot.orderBars',
            'jquery.flot/jquery.flot.tooltip',
            'jquery.flot/jquery.flot.selection',
            'raphael',
            'justgage'
        ],
        exclude: ['../vendors']
    }, {
        name: 'views/layouts/mobile_default',
        include: ['views/mobile/header_toolbar','views/mobile/layer_toolbar', 'collections/paginated_collection', 'attach_file', 'm_comment'],
        exclude: [
            'hogan', 'hgn', 'app', 'go-charts', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'dashboard/views/site/app',
        exclude: ['../vendors', 'app', 'hogan', 'hgn',
            'go-charts', 'i18n!nls/commons', 'views/layouts/default', 'jquery.go-org', 'go-webeditor/jquery.go-webeditor',
            'swipe', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'works/controllers/main',
        include: [
            'works/home/views/home',
            'works/views/app/app_home',
            'works/views/app/doc_detail',
            'works/views/app/print_body',
            'works/views/app/user_form',
            'works/views/app/doc_detail_popup',
            'works/views/app/create_app_intro',
            'works/views/app/baseinfo_form',
            'works/views/app/setting_home',
            'works/views/app/form_manager',
            'works/views/app/share_manager',
            'works/views/app/list_manager',
            'works/personal_list_manager/views/personal_list_manager',
            'works/views/app/integration_manager',
            'works/views/app/workflow_manager',
            'works/views/app/csv_manager',
            'works/views/app/download_manager',
            'works/views/app/csv_help',
            'works/views/app/data_copy',
            'works/search/views/search',
            'works/views/app/report/app_report_list',
            'works/views/app/report/app_report_detail'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'axisj', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'task/controllers/main',
        include: [
            'task/views/layouts/defaults',
            'task/views/app',
            'task/views/task_folder',
            'task/views/task_detail',
            'task/views/print',
            'task/views/task',
            'task/views/task_list',
            'task/views/folder_admin',
            'task/views/closed_folder_list',
            'task/views/sub_dept_folder_list',
            'task/views/task_search_result',
            'task/views/task_calendar',
            'task/views/task_detail_popup'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'approval/controllers/main',
        include: [
            'approval/components/layoutEventListener',
            'jquery.go-preloader',
            'jquery.go-popup',
            'jquery.go-orgslide',
            'approval/views/layouts/defaults',
            'views/layouts/popup_default',
            'approval/views/home/main',
            'approval/views/doclist/todo_doclist',
            'approval/views/doclist/todo_reception_doclist',
            'approval/views/doclist/official_todo_doclist',
            'approval/views/doclist/todo_viewer_doclist',
            'approval/views/doclist/upcoming_doclist',
            'approval/views/doclist/draft_doclist',
            'approval/views/doclist/tempsave_doclist',
            'approval/views/doclist/approval_doclist',
            'approval/views/doclist/viewer_doclist',
            'approval/views/doclist/reception_doclist',
            'approval/views/doclist/send_doclist',
            'approval/views/doclist/user_official_doclist',
            'approval/views/document/main',
            'approval/views/official_document/main',
            'approval/views/official_document/official_preview',
            'approval/views/document/print_main',
            'approval/views/doclist/dept_reception_doclist',
            'approval/views/doclist/dept_folder_doclist',
            'approval/views/doclist/user_folder_doclist',
            'approval/views/doclist/share_folder_doclist',
            'approval/views/dept_folder_manage',
            'approval/views/doc_classify_manage',
            'approval/views/user_folder_manage',
            'approval/views/doclist/child_dept_folder',
            'approval/views/user_config',
            'approval/views/user_deputy',
            'approval/views/regist_deputy_form',
            'approval/views/appr_doc_manage_list',
            'approval/views/document_manage_show',
            'approval/views/company_official_manage_list',
            'approval/views/appr_doc_manage_log',
            'approval/views/modify_deputy_form',
            'approval/views/doclist/company_doc_home',
            'approval/views/doclist/company_doc_list',
            'approval/views/doc_result_list',
            'approval/views/help'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'asset/controllers/main',
        include: [
            'asset/views/layouts/defaults',
            'asset/views/home_list',
            'asset/views/asset_admin_wrap',
            'asset/views/asset_item_list',
            'asset/views/asset_item_create',
            'asset/views/asset_weekly',
            'asset/views/rental_reserv_create'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'board/controllers/main',
        include: [
            'board/views/layouts/defaults',
            'board/views/app',
            'board/views/dept_board',
            'components/print/views/popup_print',
            'board/views/post_home',
            'board/views/post_stream_detail',
            'board/views/board_create',
            'board/views/close_dept_board',
            'board/views/close_company_board',
            'board/views/dept_lowrank',
            'board/views/post_write',
            'board/views/post_result'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'calendar/controllers/main',
        include: [
            'calendar/libs/util',
            'i18n!nls/commons',
            'i18n!calendar/nls/calendar',
            'calendar/views/layouts/fixed_size',
            'calendar/views/app',
            'calendar/views/search_result',
            'calendar/views/layouts/default',
            'calendar/views/preference',
            'calendar/views/regist',
            'calendar/views/event_detail'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'community/controllers/main',
        include: [
            'community/views/layouts/defaults',
            'community/views/app',
            'community/views/create',
            'community/views/home',
            'community/views/add_member',
            'community/views/members',
            'community/views/master_home',
            'community/views/boards',
            'community/views/board_create',
            'community/views/board_closed',
            'board/views/post_home',
            'board/views/post_write',
            'board/views/post_stream_detail',
            'board/views/post_result'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'contact/controllers/main',
        include: [
            'contact/views/layouts/defaults',
            'contact/views/home',
            'contact/views/company_manage',
            'contact/views/create',
            'contact/views/search',
            'contact/views/connector',
            'contact/views/print',
            'print'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'dashboard/controllers/site',
        include: [
            'dashboard/views/site/layout',
            //'dashboard/views/site/app',
            'dashboard/views/search/search_results',
            'dashboard/views/search/defaults',
            'dashboard/views/search/app_search_results'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'docs/controllers/main',
        include: [
            'docs/views/home',
            'docs/views/create',
            'docs/views/create',
            'docs/views/detail',
            'print',
            'docs/search/views/search',
            'docs/views/docslist/latest_read',
            'docs/views/docslist/latest_update',
            'docs/views/docslist/normal_list',
            'docs/views/docslist/approve_waiting',
            'docs/views/docslist/regist_waiting'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'report/controllers/main',
        include: [
            'report/views/layouts/defaults',
            'i18n!nls/commons',
            'report/views/app',
            'report/views/search',
            'report/views/dept_active_folders',
            'report/views/dept_close_folders',
            'report/views/dept_descendant',
            'report/views/folder_create',
            'report/views/series_report',
            'report/views/report_form',
            'report/views/reports',
            'report/views/report_detail',
            'report/views/report_detail',
            'print',
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'sms/controllers/main',
        include: [
            'sms/views/home',
            'sms/views/send',
            'sms/views/detail',
            'sms/views/connector'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'survey/controllers/main',
        include: [
            'survey/views/layouts/default',
            'i18n!survey/nls/survey',
            'survey/views/dashboard',
            'survey/views/list',
            'survey/views/regist',
            'survey/views/edit',
            'survey/views/query_editor',
            'survey/views/detail'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'todo/controllers/main',
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'axisj', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'works/controllers/mobile',
        include: [
            'works/views/mobile/side',
            'views/layouts/mobile_default',
            'works/views/mobile/home',
            'works/views/mobile/app_home',
            'works/views/mobile/doc_detail',
            'works/views/mobile/doc_detail_refer',
            'works/views/mobile/user_form',
            'works/views/mobile/doc_detail/doc_activity_form',
            'works/views/mobile/doc_detail/comment_list',
            'works/search/views/mobile/search',
            'works/search/views/mobile/search_layer',
            'works/search/views/mobile/search_result'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'axisj', 'file_upload','views/layouts/default',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'task/controllers/mobile',
        include: [
            'views/layouts/mobile_default',
            'task/views/mobile/side',
            'task/views/mobile/home',
            'task/views/mobile/task_list',
            'task/views/mobile/task_detail',
            'task/views/mobile/task',
            'task/views/mobile/task_activity_form',
            'task/views/mobile/comment_list',
            'task/views/mobile/task_search_result'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'approval/controllers/mobile',
        include: [
            'views/layouts/mobile_default',
            'approval/views/mobile/m_side',
            'approval/views/mobile/m_company_doc_side',
            'approval/views/mobile/m_todo_doclist',
            'approval/views/mobile/m_draft_doclist',
            'approval/views/mobile/m_todo_reception_doclist',
            'approval/views/mobile/m_official_todo_doclist',
            'approval/views/mobile/m_todo_viewer_doclist',
            'approval/views/mobile/m_upcoming_doclist',
            'approval/views/mobile/m_approval_doclist',
            'approval/views/mobile/m_viewer_doclist',
            'approval/views/mobile/m_reception_doclist',
            'approval/views/mobile/m_send_doclist',
            'approval/views/mobile/m_user_official_doclist',
            'approval/views/mobile/official_document/m_main',
            'approval/views/mobile/document/m_main',
            'approval/views/mobile/m_search_result',
            'approval/views/mobile/m_company_doc_home',
            'approval/views/mobile/m_company_doc_list',
            'approval/views/mobile/m_user_folder_doclist',
            'approval/views/mobile/m_dept_folder_doclist',
            'approval/views/mobile/m_share_folder_doclist',
            'approval/views/mobile/m_child_dept_folder',
            'approval/views/mobile/document/m_reply'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'asset/controllers/mobile',
        include: [
            'views/layouts/mobile_default',
            'asset/views/mobile/m_side',
            'asset/views/mobile/m_home_list',
            'asset/views/mobile/m_asset_item_list',
            'asset/views/mobile/m_rental_reservation',
            'asset/views/mobile/m_monthly_item',
            'asset/views/mobile/m_search_result'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'board/controllers/mobile',
        include: [
            'views/layouts/mobile_default',
            'board/views/mobile/m_side',
            'board/views/mobile/m_home_list',
            'board/views/mobile/m_post_home',
            'board/views/mobile/m_post_recommends',
            'board/views/mobile/m_post_comments',
            'board/views/mobile/m_post_write',
            'board/views/mobile/m_post_result',
            'board/views/mobile/m_search_layer',
            'board/views/mobile/m_search_result'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'calendar/controllers/mobile',
        include: [
            'views/layouts/mobile_default',
            'calendar/views/mobile/m_side',
            'calendar/views/mobile/m_daily_list',
            'calendar/views/mobile/m_monthly_list',
            'calendar/views/mobile/m_search_result',
            'calendar/views/mobile/m_calendar_write',
            'calendar/views/mobile/m_calendar_view',
            'calendar/views/mobile/m_calendar_comment',
            'calendar/views/mobile/m_calendar_follows',
            'calendar/views/mobile/m_search_layer',
            'calendar/views/mobile/m_search_result_new'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'community/controllers/mobile',
        include: [
            'views/layouts/mobile_default',
            'community/views/mobile/m_side_board',
            'community/views/mobile/m_side_community',
            'community/views/mobile/m_index',
            'community/views/mobile/m_home_list',
            'community/views/mobile/m_admin',
            'board/views/mobile/m_post_write',
            'board/views/mobile/m_post_home',
            'board/views/mobile/m_post_recommends',
            'board/views/mobile/m_post_comments',
            'board/views/mobile/m_post_result',
            'board/views/mobile/m_search_layer',
            'board/views/mobile/m_search_result'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'contact/controllers/mobile',
        include: [
            'views/layouts/mobile_default',
            'contact/views/mobile/m_side',
            'contact/views/mobile/m_home',
            'contact/views/mobile/m_detail',
            'contact/views/mobile/m_create',
            'contact/views/mobile/m_search',
            'contact/views/mobile/m_search_layer',
            'contact/views/mobile/m_search_result'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'docs/controllers/mobile',
        include: [
            'views/layouts/mobile_default',
            'docs/views/mobile/side',
            'docs/views/mobile/docslist/base_docs_list',
            'docs/search/views/mobile/search',
            'docs/views/mobile/detail',
            'docs/views/mobile/docs_reply',
            'docs/views/mobile/docs_reject'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'report/controllers/mobile',
        include: [
            'views/layouts/mobile_default',
            'report/views/mobile/m_side',
            'report/views/mobile/m_home_list',
            'report/views/mobile/m_reports',
            'report/views/mobile/m_report_detail',
            'report/views/mobile/m_report_comments',
            'report/views/mobile/m_series',
            'report/views/mobile/m_series_comments',
            'report/views/mobile/m_report_form',
            'report/views/mobile/m_series_report_form',
            'report/views/mobile/m_report_result'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'survey/controllers/mobile',
        include: [
            'survey/views/layouts/mobile',
            'i18n!survey/nls/survey',
            'survey/views/mobile/dashboard',
            'survey/views/mobile/list',
            'survey/views/mobile/detail',
            'survey/views/mobile/comment'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: 'todo/controllers/mobile',
        include: [
            'when',
            'i18n!nls/commons',
            'i18n!todo/nls/todo',
            'todo/views/mobile/layout',
            'todo/views/site/dashboard',
            'todo/views/site/todo_detail',
            'todo/views/site/card_detail',
            'todo/views/mobile/search_result'
        ],
        exclude: ['../vendors', 'hogan', 'hgn', 'app', 'go-charts', 'main', 'axisj', 'file_upload',
            'json!lang/ko/custom.json', 'json!lang/en/custom.json', 'json!lang/ja/custom.json',
            'json!lang/zh-cn/custom.json', 'json!lang/zh-tw/custom.json', 'json!lang/vi/custom.json']
    }, {
        name: '../lang',
        include: [
            'i18n!nls/commons',
            'i18n!nls/notification',
            'i18n!admin/nls/admin',
            'i18n!approval/nls/approval',
            'i18n!asset/nls/asset',
            'i18n!board/nls/board',
            'i18n!calendar/nls/calendar',
            'i18n!community/nls/community',
            'i18n!contact/nls/contact',
            'i18n!dashboard/nls/dashboard',
            'i18n!docs/nls/docs',
            'i18n!report/nls/report',
            'i18n!sms/nls/sms',
            'i18n!survey/nls/survey',
            'i18n!task/nls/task',
            'i18n!todo/nls/todo',
            'i18n!works/nls/works'
        ],
        create: true
    }],
    locale: 'ko',
    skipModuleInsertion: false,
    keepBuildDir: false,
    //optimize: 'none',
    optimize: 'uglify',
    skipDirOptimize: false,
    generateSourceMaps: false,
    normalizeDirDefines: "skip",
    wrap: true,
    cjsTranslate: false,

    uglify: {
        ascii_only: true,
        beautify: false,
        except: ['require'],
        max_line_length: 100000,

        defines: {
            DEBUG: ['name', 'false']
        },
        no_mangle: false
    },

    optimizeCss: "none",

    cssImportIgnore: null,
    inlineText: true,
    useStrict: false,
    preserveLicenseComments: true,
    // true로 설정하면 echart내의 모듈까지 모두 검색한다.
    findNestedDependencies: false,
})
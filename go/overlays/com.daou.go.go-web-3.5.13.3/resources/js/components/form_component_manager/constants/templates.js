define('components/form_component_manager/constants/templates', function() {
    var commonLang = require('i18n!nls/commons');
    var labelTemplate = [
        '<span class="comp_item">{{label}}</span>'
    ];
    // TODO 합쳐야하나..
    return {
        text: {
            template: [
                '<input class="ipt_editor" type="text">'
            ],
            style: 'width: 100%;'
        },
        editor: {
            template: [
                '<span class="comp_editor" style="width: 100%;">' +
                '{{#isAppContent}}{{lang.에디터본문}}}{{/isAppContent}}' +
                '{{^isAppContent}}{{lang.에디터편집기}}{{/isAppContent}}' +
                '</span>'
            ],
            style: 'width: 100%;'
        },
        span: {
            template: labelTemplate
        },
        label: {
            template: labelTemplate
        },
        number: {
            template: [
                '<input class="ipt_editor ipt_editor_num" type="text" style="{{style}}">'
            ]
        },
        currency: {
            template: [
                '<input class="ipt_editor ipt_editor_currency" type="text" style="{{style}}">'
            ]
        },
        textarea: {
            template: [
                '<textarea class="txta_editor"></textarea>'
            ],
            style: 'width: 100%;'
        },
        radio: {
            template: [
                '{{#options}}',
                '<input class="editor_opt" type="radio" name="" value="{{value}}" {{#id}}{{id}}{{/id}}>',
                '<label class="editor_label">{{value}}</label>',
                '{{/options}}'
            ]
        },
        check: {
            template: [
                '{{#options}}',
                '<input class="editor_opt" type="checkbox" name="" value="{{value}}" {{#id}}{{id}}{{/id}}>',
                '<label class="editor_label">{{value}}</label>',
                '{{/options}}'
            ]
        },
        cSel: {
            template: [
                '<select class="editor_slt" style="width:100%">',
                    '{{#options}}',
                    '<option>{{value}}</option>',
                    '{{/options}}',
                    '{{^options}}',
                    '<option>A</option>',
                    '{{/options}}',
                '</select>'
            ]
        },
        cOrg: {
            template: [
                '<span>',
                '<span class="name">',
                '<span class="ic">+</span>',
                '<span class="txt">{{#orgType}}{{lang.부서선택}}{{/orgType}}{{^orgType}}{{lang.사용자선택}}{{/orgType}}</span>',
                '</span>',
                '</span>'
            ]
        },
        calendar: {
            template: [
                '<input class="ipt_editor ipt_editor_date" type="text">'
            ]
        },
        period: {
            template: [
                '<input class="ipt_editor ipt_editor_date" type="text"> ~ ',
                '<input class="ipt_editor ipt_editor_date" type="text">'
            ]
        },
        time: {
            template: [
                '<select class="editor_slt">',
                '<option value="00">00</option><option value="01">01</option>',
                '</select>', commonLang['시'],
                '<select class="editor_slt">',
                '<option value="00">00</option><option value="01">01</option>',
                '</select>', commonLang['분']
            ]
        },
        customSelect: {
            template: [
                '<select class="editor_slt" style="width:100%"></select>'
            ]
        },
        cSum: {
            template: ['<input class="ipt_editor ipt_editor_num" type="text" style="{{style}}">']
        },
        rSum: {
            template: ['<input class="ipt_editor ipt_editor_num" type="text" style="{{style}}">']
        },
        // 이 아래 있는 것들은 label 로 만들면 되는데 왜 다 따로 만들었을까?
        name_pos: {
            template: labelTemplate
        },
        user_name: {
            template: labelTemplate
        },
        user_pos: {
            template: labelTemplate
        },
        user_empno: {
            template: labelTemplate
        },
        user_org: {
            template: labelTemplate
        },
        today: {
            template: labelTemplate
        },
        reg_date: {
            template: labelTemplate
        },
        select: {
            template: [
                '<select class="editor_slt" style="width:100%"></select>'
            ]
        }
    };
});

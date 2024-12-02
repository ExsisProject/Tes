define([
        "jquery",
        "views/mobile/m_org"
    ],
    function ($, OrgView) {
        var approvalLang = {
            'ko': {
                "필수": "필수값 입니다.",
                "(대결)": "(대결)",
                "(전결)": "(전결)",
                "반려": "반려",
                "시": "시",
                "분": "분",
                "부서 추가": "부서 추가",
                "사용자 추가": "사용자 추가",
                "삭제": "삭제",
                "추가": "추가"
            },
            'ja': {
                "필수": "必須値です。",
                "(대결)": "(代決)",
                "(전결)": "(専決)",
                "반려": "却下",
                "시": "時",
                "분": "分",
                "부서 추가": "部署追加",
                "사용자 추가": "ユーザ追加",
                "삭제": "削除",
                "추가": "追加"
            },
            'en': {
                "필수": "That is required.",
                "(대결)": "(Delegation)",
                "(전결)": "(Arbitrary)",
                "반려": "Reject",
                "시": ":",
                "분": "",
                "부서 추가": "Add Department",
                "사용자 추가": "Add User",
                "삭제": "Delete",
                "추가": "Add"
            },
            'zh_CN': {
                "필수": "必须值。",
                "(대결)": "(代决)",
                "(전결)": "(专决)",
                "반려": "驳回",
                "시": "时",
                "분": "分",
                "부서 추가": "追加部门",
                "사용자 추가": "添加用户",
                "삭제": "删除",
                "추가": "追加"
            },
            'zh_TW': {
                "필수": "必須值。",
                "(대결)": "(代決)",
                "(전결)": "(專決)",
                "반려": "駁回",
                "시": "時",
                "분": "分",
                "부서 추가": "追加部門",
                "사용자 추가": "添加用戶",
                "삭제": "刪除",
                "추가": "追加"
            },
            'vi': {
                "필수": "Giá trị bắt buộc.",
                "(대결)": "(Ủy quyền phê duyệt)",
                "(전결)": "(Tự phê duyệt)",
                "반려": "Từ chối",
                "시": ":",
                "분": "",
                "부서 추가": "Thêm phòng ban",
                "사용자 추가": "Thêm người sử dụng",
                "삭제": "Xóa",
                "추가": "Thêm"
            }
        };
        
        var i18n = approvalLang[GO.session('locale')] || approvalLang["ko"];
        
        // 서버에 저장하기위한 포맷
        var serverFormat = {
            span: '<span data-type="span" data-dsl="{{span}}" data-value=""></span>',
            text: '<span data-type="text" data-dsl="{{text}}" data-id="" data-name="" data-value=""></span>',
            number: '<span class="editor_num" data-type="num" data-dsl="{{num}}" data-id="" data-name="" data-value=""></span>',
            currency: '<span class="editor_currency" data-type="currency" data-dsl="{{currency}}" data-id="" data-name="" data-value=""></span>',
            textarea: '<span data-type="textarea" data-dsl="{{textarea}}" data-id="" data-name="" data-value=""></span>',
            editor: '<span class="editor_span" data-type="editor" data-dsl="{{editor}}" data-id="" data-name="" data-value="" style="width:100%"></span>',
            radio: '<span data-type="radio" data-dsl="{{radio}}" data-id="" data-name="" data-label="" data-value="" data-select=""></span>',
            check: '<span data-type="checkbox" data-dsl="{{check}}" data-id="" data-name="" data-label="" data-value=""></span>',
            calendar: '<span data-type="calendar" data-dsl="{{calendar}}" data-id="" data-name="" data-value=""></span>',
            period: '<span data-type="period" data-dsl="{{period}}" data-id="" data-name="" data-value=""></span>',
            time: '<select class="editor_slt" data-dsl="{{select}}" id=""></select>',
            select: '<span data-type="select" data-dsl="{{select}}" data-id="" data-name="" data-value=""></span>',
            name_pos: '<span data-type="system" data-dsl="{{name_pos}}" data-id="" data-name="" data-value=""></span>',
            user_name: '<span data-type="system" data-dsl="{{user_name}}" data-id="" data-name="" data-value=""></span>',
            user_pos: '<span data-type="system" data-dsl="{{user_pos}}" data-id="" data-name="" data-value=""></span>',
            user_empno: '<span data-type="system" data-dsl="{{user_empno}}" data-id="" data-name="" data-value=""></span>',
            user_org: '<span data-type="system" data-dsl="{{user_org}}" data-id="" data-name="" data-value=""></span>',
            today: '<span data-type="system" data-dsl="{{today}}" data-id="" data-name="" data-value=""></span>',
            reg_date: '<span data-type="system" data-dsl="{{reg_date}}" data-id="" data-name="" data-value=""></span>',
            label: '<span data-type="system" data-dsl="{{label}}" data-id="" data-name="" data-value=""></span>',
            customSelect: '<span data-type="customSelect" data-dsl="{{customSelect}}" data-id="" data-name="" data-value=""></span>',
            cSel: '<span data-type="cSel" data-dsl="{{cSel}}" data-selectval=""></span>',
            cSum: '<span class="editor_num" data-type="num" data-dsl="{{cSum}}" data-id="" data-name="" data-value=""></span>',
            rSum: '<span data-type="system" data-dsl="{{rSum}}" data-id="" data-name="" data-value=""></span>',
            cOrg: '<span data-dsl="{{cOrg}}" data-id="" data-selected=""></span>'
        };
        
        //인풋모드에서 보여줄 포맷
        var style = 'vertical-align:middle;width:100%;border:0px;box-shadow: inset 0px 0px 0px rgba(150,150,150,0.2)';
        var inputModeFormat = {
            span: '<span data-type="span" data-dsl="{{span}}" data-value=""></span>',
            text: '<input type="text" class="ipt_editor" data-dsl="{{text}}" name="" id="" value=""/>',
            number: '<input type="text" class="ipt_editor ipt_editor_num" data-dsl="{{num}}" name="" id="" value=""/>',
            currency: '<input type="text" class="ipt_editor ipt_editor_currency" data-dsl="{{currency}}" name="" id="" value=""/>',
            textarea: '<textarea class="txta_editor" data-dsl="{{textarea}}" name="" id="" value=""></textarea>',
            editor: '<span data-dsl="{{editor}}" name="" id="" style="width:100%; min-width: 200px;"></span>',
            radio: '<input type="radio" class="editor_opt" data-dsl="{{radio}}" name="" value="" />',
            check: '<input type="checkbox" class="editor_opt" data-dsl="{{check}}" id="" value=""/>',
            calendar: '<input type="text" readonly class="ipt_editor ipt_editor_date" data-dsl="{{calendar}}" id="" />',
            period: '<input type="text" readonly class="ipt_editor ipt_editor_date" data-dsl="{{calendar}}" id="" />',
            time: '<select data-dsl="{{select}}" id=""></select>',
            select: '<select class="editor_slt" data-dsl="{{select}}" id=""></select>',
            name_pos: '<input type="text" readonly style="' + style + '" data-dsl="{{name_pos}}" name="" id="" value=""/>',
            user_name: '<input type="text" readonly style="' + style + '" data-dsl="{{user_name}}" name="" id="" value=""/>',
            user_pos: '<input type="text" readonly style="' + style + '" data-dsl="{{user_pos}}" name="" id="" value=""/>',
            user_empno: '<input type="text" readonly style="' + style + '" data-dsl="{{user_empno}}" name="" id="" value=""/>',
            user_org: '<input type="text" readonly style="' + style + '" data-dsl="{{user_org}}" name="" id="" value=""/>',
            today: '<input type="text" readonly style="' + style + '" data-dsl="{{today}}" name="" id="" value=""/>',
            reg_date: '<input type="text" readonly style="' + style + '" data-dsl="{{reg_date}}" name="" id="" value=""/>',
            label: '<input type="text" readonly style="' + style + '" data-dsl="{{label}}" name="" id="" value=""/>',
            customSelect: '<select class="editor_slt" data-dsl="{{customSelect}}" id=""></select>',
            cSel: '<select class="editor_slt" data-type="cSel" data-dsl="{{cSel}}" data-selectval=""></select>',
            cSum: '<input type="text" class="ipt_editor ipt_editor_num" data-dsl="{{cSum}}" name="" id="" value=""/>',
            rSum: '<input type="text" readonly style="vertical-align:middle;text-align:right;width:100%;border:0px;box-shadow: inset 0px 0px 0px rgba(150,150,150,0.2)" data-dsl="{{rSum}}" name="" id="" value=""/>',
            cOrg: '<ul class="name_tag" data-dsl="{{cOrg}}" id="" data-selected=""></ul>'
        };
        
        var approvalTpl = {
            'type1': ['<td>',
                '<table class="sign_member" id="activity_{activityId}">',
                '<tbody>',
                '<tr><td><span class="sign_rank">{header}</span></td></tr>',
                '<tr><td class="wrap_name wrap_sign">{body}</td></tr>',
                '<tr><td class="last">',
                '<span class="sign_date" id="date_{activityId}">{completedAt}{status}</span></td></tr>',
                '</tbody>',
                '</table>',
                '</td>'
            ],
            'type1New': [
                '<span class="sign_member_wrap" id="activity_{activityId}">',
                '<span class="sign_member">',
                '<span class="sign_rank_wrap">',
                '<span class="sign_rank">{header}</span>',
                '</span>',
                '<span class="sign_wrap">{body}</span>',
                '<span class="sign_date_wrap">',
                '<span class="sign_date" id="date_{activityId}">{completedAt}{status}</span>',
                '</span>',
                '</span>',
                '</span>'
            ],
            'type2': ['<span class="sign_member" id="activity_{activityId}">',
                '<span class="department">{deptName}</span>',
                '<span class="part">|</span>',
                '<span class="name">{body} {header}</span>',
                '<span class="status"></span>',
                '<span class="date">{completedAt}</span>',
                '</span>'
            ],
            'type2EmptyName': ['<span class="sign_member" id="activity_{activityId}">',
                '<span class="department">{deptName}</span>',
                '<span class="part"></span>',
                '<span class="name"></span>',
                '<span class="status"></span>',
                '<span class="date">{completedAt}</span>',
                '</span>'
            ]
        };
        
        /*결재 팔레트의 결재탭에서 사용하는 id*/
        var approvalInfoIds = [
            "subject", "appContent", "draftUser", "draftDept",
            "draftDate", "docNo", "docNo$componentDocType", "recipient", "preserveDuration",
            "securityLevel", "docClassification", "docReference",
            "draftUserEmail", "fax", "completeDate", "attachFile"
        ];
        
        // jquery replaceWith는 치환된값을 return 하지 않아서 추가함.
        $.fn.replaceWithAndReturnNew = function (htmls) {
            var replaced = $(this)[0];
            var div = document.createElement('DIV');
            div.innerHTML = htmls;
            var replacer = div.firstChild;
            replaced.parentNode.replaceChild(replacer, replaced);
            return $(replacer);
        };
        
        function checkIE910() {
            var ua = window.navigator.userAgent.toLowerCase();
            return (ua.indexOf("msie 9.0") > -1 || ua.indexOf("msie 10.0") > -1);
        }
        
        function convertDslToSpan(tpl) {
            return template(tpl, serverFormat);
        }
        
        function convertFormToSpan(tpl) {
            return template(tpl, inputModeFormat);
        }
        
        function checkRequirePlaceHolder(isExcludeInputMask) {
            // ie에서는 inputmask와 html의 placeholder속성을 동시에 사용하면 정상작동하지 않기때문에
            // ie이고 currency가 필수값 체크되어있다면 placehoder 세팅을 하지 않는다.
            /**
             * cSum 추가. IE 에서 placeholder 를 사용중인 복수의 요소에 inputmask 를 사용하면 무한루프에 빠져버린다.
             */
            if (GO.util.msie() && isExcludeInputMask) {
                return false;
            }
            return true;
        }
        
        function template(tpl, data) {
            return tpl.replace(/{{([^}}]*)}}/g, function (m, key) {
                var dsl;
                var isRequire = false;
                var isEditable = true;
                var isAutoType = false; //전자결재에서 자동결재선 타입인지를 체크하는 flag
                var pattern = /(\$require\$)/gi;
                var editorablePattern = /(\$adminedit\$)/gi;
                var autoTypePattern = /(\$autotype\$)/gi;
                var maxlength = "";
                var width = "";
                var defaultstr = "";
                var skinType = "";
                var orgType = "list";
                var result;
                
                if (pattern.test(key)) {
                    isRequire = true;
                    key = key.replace(pattern, '');
                }
                
                if (autoTypePattern.test(key)) {
                    isAutoType = true;
                    key = key.replace(autoTypePattern, '');
                }
                
                if (editorablePattern.test(key)) {
                    isEditable = false;
                    key = key.replace(editorablePattern, '');
                }
                
                key.replace(/\$maxlength:([0-9]*)\$/g, function (n, lengthKey) {
                    maxlength = lengthKey;
                    key = key.replace(n, '');
                });
                
                key.replace(/\$width:([0-9]*)\$/g, function (n, widthVal) {
                    width = widthVal;
                    key = key.replace(n, '');
                });
                
                key.replace(/\$defaultstr:(.*)\$/g, function (n, str) {
                    defaultstr = str;
                    key = key.replace(n, '');
                });
                
                key.replace(/\$simple\$/g, function (n) {
                    skinType = "simple";
                    key = key.replace(n, '');
                });
                
                key.replace(/\$department\$/g, function (n) {
                    orgType = "department";
                    key = key.replace(n, '');
                });
                
                if (key.search('radio') >= 0 || key.search('check') >= 0) {
                    dsl = key.split('_');
                    // {{check:test}} 일 경우
                    if (dsl[0].search(":") >= 0) {
                        dsl[0] = dsl[0].substring(0, dsl[0].search(":"))
                    }
                    
                    return $(data[dsl[0]]).attr({
                        'data-dsl': m,
                        'data-autotype': !!isAutoType,
                        'data-require': !!isRequire
                    }).prop('outerHTML');
                } else if (key.search('cSel') >= 0 || key.search('currency') >= 0) {
                    dsl = key.split('_');
                    var dataType, id;
                    // {{cSel:test}} 일 경우
                    if (dsl[0].search(":") >= 0) {
                        dataType = dsl[0].substring(0, dsl[0].search(":"));
                        id = dsl[0].substring(dsl[0].search(":") + 1);
                    } else {
                        dataType = dsl[0];
                    }
                    return $(data[dataType]).attr({
                        'data-dsl': m,
                        'data-autotype': !!isAutoType,
                        'id': id,
                        'data-type': dataType
                    }).prop('outerHTML');
                    
                } else if (key.search('period') >= 0 || key.search('time') >= 0) {
                    return data.hasOwnProperty(key) ? data[key] : "";
                } else if (key.search('cOrg') >= 0) {
                    dsl = key.split(':');
                    result = $(data[dsl[0]]).attr({
                        'data-dsl': m,
                        'data-id': dsl[1] ? dsl[1] : '',
                        'data-name': dsl[1] ? dsl[1] : '',
                        'data-orgtype': orgType
                    });
                    return result.prop('outerHTML');
                    
                } else if (key.search('cSum') >= 0) {
                    //cSum:a
                    //cSum_1:a
                    dsl = key.split(':');
                    preDsl = dsl[0];
                    if (preDsl.search('_') >= 0) {
                        var preDsl = preDsl.split('_')[0] ? preDsl.split('_')[0] : dsl[0];
                    }
                    result = $(data[preDsl]).attr({
                        'data-dsl': m,
                        'data-id': dsl[1] ? dsl[1] : '',
                        'data-name': dsl[1] ? dsl[1] : '',
                        'data-require': !!isRequire,
                        'data-maxlength': maxlength,
                        'data-width': width,
                        'data-defaultstr': defaultstr,
                        'data-editable': isEditable
                    });
                    if (skinType == "simple") {
                        result.attr("data-skintype", "simple");
                    }
                    return data.hasOwnProperty(preDsl) ? result.prop('outerHTML') : "";
                } else {
                    dsl = key.split(':');
                    result = $(data[dsl[0]]).attr({
                        'data-dsl': m,
                        'data-id': dsl[1] ? dsl[1] : '',
                        'data-name': dsl[1] ? dsl[1] : '',
                        'data-require': !!isRequire,
                        'data-maxlength': maxlength,
                        'data-width': width,
                        'data-defaultstr': defaultstr,
                        'data-editable': isEditable
                    });
                    if (skinType == "simple") {
                        result.attr("data-skintype", "simple");
                    }
                    
                    return data.hasOwnProperty(dsl[0]) ? result.prop('outerHTML') : "";
                }
            });
        }
        
        function defaultInfoSet() {
            $.each($('form input[data-dsl="{{name_pos}}"]'), function () {
                $(this).attr('data-value', '이름 직위').val('이름 직위');
            });
            
            $.each($('form input[data-dsl="{{user_name}}"]'), function () {
                $(this).attr('data-value', '이름').val('이름');
            });
            
            $.each($('form input[data-dsl="{{user_pos}}"]'), function () {
                $(this).attr('data-value', '직위').val('직위');
            });
            
            $.each($('form input[data-dsl="{{user_empno}}"]'), function () {
                $(this).attr('data-value', '사번').val('사번');
            });
            
            $.each($('form input[data-dsl="{{user_org}}"]'), function () {
                $(this).attr('data-value', '부서').val('부서');
            });
            
            $.each($('form input[data-dsl="{{today}}"]'), function () {
                $(this).attr('data-value', '오늘날짜').val('오늘날짜');
            });
            
            // 기안일
            $.each($('form input[data-dsl="{{reg_date}}"]'), function () {
                $(this).attr('data-value', '기안일').val('기안일');
            });
            
            //문서번호
            $.each($('form span[data-dsl="{{doc_no}}"]'), function () {
                $(this).attr('data-value', '문서번호').text('문서번호');
            });
        }
        
        //결재방 type1,type2 템플릿 치환
        function convertTemplate(tpl, data) {
            return tpl.replace(/{(\w*)}/g, function (m, key) {
                return data.hasOwnProperty(key) ? data[key] : "";
            });
        }
        
        //type에 다른 결재방 마크업 생성
        function approvalActivitiesTpl(type, opt, boxConfig) {
            function makeHeaderName() {
                switch (boxConfig.headerType) {
                    case 'POSITION':
                        return (opt.userPosition) ? opt.userPosition : '';
                    case 'DUTY':
                        if (opt.userDuty) {
                            return (opt.userDuty) ? opt.userDuty : '';
                        } else {
                            return (opt.userPosition) ? opt.userPosition : '';
                        }
                    case 'ACTTYPE':
                        return (opt.name) ? opt.name : '';
                    case 'NAME':
                        return (opt.userName) ? opt.userName : '';
                    case 'DEPT':
                        return opt.deptName;
                    default:
                        return '';
                }
            }
            
            function makeType1Body() {
                if (opt.isArbitrary) {
                    return '<span class="arbitrary"></span>';
                }
                var body = '';
                var text;
                if (boxConfig.bodyElement.sign) {
                    if (opt.status != 'RETURN' && opt.signPath) {
                        body += '<span class="sign_stamp stamp_approved"><img src="' + opt.signPath + '"></span>';
                    } else if (!boxConfig.bodyElement.name) {
                        text = (opt.userName) ? opt.userName : opt.deptName;
                        body += '<span class="sign_name">' + text + '</span>';
                    }
                }
                if (boxConfig.bodyElement.name) {
                    text = (opt.userName) ? opt.userName : opt.deptName;
                    body += '<span class="sign_name">' + text + '</span>';
                }
                if (boxConfig.bodyElement.position) {
                    text = (opt.userPosition) ? opt.userPosition : opt.deptName;
                    body += '<span class="sign_position">' + text + '</span>';
                }
                if (boxConfig.bodyElement.duty) {
                    var userDuty = opt.userDuty;
                    if (!userDuty && !boxConfig.bodyElement.position) {
                        userDuty = (opt.userPosition) ? opt.userPosition : opt.deptName;
                    }
                    body += '<span class="sign_duty">' + userDuty + '</span>';
                }
                if (boxConfig.bodyElement.dept) {
                    body += '<span class="sign_dept">' + opt.deptName + '</span>';
                }
                return body;
            }
            
            function isType2NameEmpty() {
                return !(opt.userName) && (makeHeaderName() == '');
            }
            
            var tplString;
            var commonOption = {
                activityId: (opt.id) ? opt.id : '',
                userId: (opt.userId) ? opt.userId : ''
            };
            if (type == "type1") {
                tplString = convertTemplate(approvalTpl.type1.join(''), _.extend(commonOption, {
                    body: makeType1Body(),
                    header: makeHeaderName(),
                    completedAt: (opt.completedAt) ? GO.util.toMoment(opt.completedAt).format("YYYY/MM/DD") : '',
                    status: (opt.deputyActivity) ? i18n["(대결)"] : (opt.arbitraryStatus) ? i18n["(전결)"] : ''
                }));
            } else if (type === 'type1New') {
                tplString = convertTemplate(approvalTpl.type1New.join(''), _.extend(commonOption, {
                    body: makeType1Body(),
                    header: makeHeaderName(),
                    completedAt: (opt.completedAt) ? GO.util.toMoment(opt.completedAt).format("YYYY/MM/DD") : '',
                    status: (opt.deputyActivity) ? i18n["(대결)"] : (opt.arbitraryStatus) ? i18n["(전결)"] : ''
                }));
            } else {
                if (isType2NameEmpty()) {
                    tplString = convertTemplate(approvalTpl.type2EmptyName.join(''), _.extend(commonOption, {
                        deptName: (opt.deptName) ? opt.deptName : '',
                        completedAt: (opt.completedAt) ? GO.util.toMoment(opt.completedAt).format("YYYY-MM-DD HH:mm") : ''
                    }));
                } else {
                    tplString = convertTemplate(approvalTpl.type2.join(''), _.extend(commonOption, {
                        body: (opt.userName) ? opt.userName : '',
                        header: makeHeaderName(),
                        deptName: (opt.deptName) ? opt.deptName : '',
                        completedAt: (opt.completedAt) ? GO.util.toMoment(opt.completedAt).format("YYYY-MM-DD HH:mm") : ''
                    }));
                }
            }
            return tplString;
        }
        
        function pluginInit() {
            $.each($('form input[data-dsl*="calendar"]'), function () {
                
                $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
                $(this).datepicker({
                    dateFormat: "yy-mm-dd(D)",
                    changeMonth: true,
                    changeYear: true,
                    yearRange: 'c-100:c+10',
                    yearSuffix: "",
                    onSelect: function () {
                        $(this).trigger('change');
                    },
                    beforeShow: function (elplaceholder, object) {
                        object.dpDiv.attr("data-layer", "");
                        var isBeforeCallback = true;
                        $(document).trigger("showLayer.goLayer", isBeforeCallback);
                    },
                    onClose: function () {
                        var isBeforeCallback = true;
                        $(document).trigger("hideLayer.goLayer", isBeforeCallback);
                    }
                }).keydown(function (e) {
                    if (e.keyCode == 8 || e.keyCode == 46) {
                        e.preventDefault();
                        $.datepicker._clearDate(this);
                        $(e.currentTarget).blur();
                    }
                });
            });
            
            var $inputAndTextarea = $('form input,form textarea');
            $inputAndTextarea.bind('focusin', function () {
                $(this).addClass('edit');
            });
            
            $inputAndTextarea.bind('focusout', function () {
                $(this).removeClass('edit');
            });
            
            $.each($('form input[data-dsl*="currency"]'), function () {
                
                var dslKey = $(this).attr('data-dsl');
                var parseKey;
                dslKey.replace(/{{([^}}]*)}}/g, function (m, key) {
                    parseKey = key;
                });
                
                var precision = parseKey.split('_');
                
                $(this).inputmask({
                    'alias': 'decimal',
                    'groupSeparator': ',',
                    'autoGroup': true,
                    'digits': parseInt(precision[1] ? precision[1] : '0'),
                    'allowMinus': true,
                    'onBeforePaste': function (pastedValue) {
                        return pastedValue.replace(/,/gi, "");
                    }
                });
                
            });
            
            $.each($('form input[data-dsl*="number"]'), function () {
                $(this).css('ime-mode', 'disabled');
                $(this).off('keydown');
                $(this).on('keydown', function (e) {
                    //Delete, Backspace, Tab, Esc, Enter, decimal point, period, ,
                    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190, 188, 189]) !== -1 ||
                        // Ctrl+A 허용
                        (e.keyCode == 65 && e.ctrlKey === true) ||
                        // home, end, left, right 허용
                        (e.keyCode >= 35 && e.keyCode <= 39)) {
                        return;
                    }
                    
                    var valid = false; //^[0-9]+$/.test(String.fromCharCode(e.keyCode)); 오른쪽 숫자키가 안됨. String.fromCharCode()로 변경하면서 문제 발생(소문자로 변경됨)
                    if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
                        valid = true;
                    } else {
                        e.preventDefault();
                    }
                    
                    if (e.shiftKey && valid) {
                        e.preventDefault();
                    }
                });
                $(this).on('keyup', function (e) {
                    if (this.value.indexOf("-") == 0) {
                        this.value = "-" + this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                    }else {
                        this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                    }
                    
                });
            });
            
            if ($('form select[data-dsl*="cSel"]').length > 0) {
                $.each($('form select[data-dsl*="cSel"]'), function () {
                    if ($(this).attr('data-selectval')) {
                        $(this).find("select").val($(this).attr('data-selectval'));
                    } else {
                        $(this).find("select option:first").attr("selected", "selected");
                    }
                    $(this).off('change');
                    $(this).on('change', function () {
                        var selectVal = $(this).find(':selected').val();
                        $(this).attr('data-selectval', selectVal);
                    });
                });
            } else {
                $.each($('form select[data-type*="cSel"]'), function () {
                    if ($(this).attr('data-selectval')) {
                        $(this).find("select").val($(this).attr('data-selectval'));
                    } else {
                        $(this).find("select option:first").attr("selected", "selected");
                    }
                    $(this).off('change');
                    $(this).on('change', function () {
                        var selectVal = $(this).find(':selected').val();
                        $(this).attr('data-selectval', selectVal);
                    });
                });
            }
            
            
            $.each($('form input[data-dsl*="cSum"]'), function () {
                var name = $(this).attr('name');
                var dslKey = $(this).attr('data-dsl');
                var parseKey;
                dslKey.replace(/{{([^}}]*)}}/g, function (m, key) {
                    parseKey = key;
                });
                var precisionValue = '0';
                if (parseKey.search('_') >= 0) {
                    precisionValue = parseKey.split('_')[1].split(':')[0];
                }
                $(this).inputmask({
                    'alias': 'decimal',
                    'groupSeparator': ',',
                    'autoGroup': true,
                    'digits': parseInt(precisionValue),
                    'allowMinus': true,
                    'onBeforePaste': function (pastedValue) {
                        return pastedValue.replace(/,/gi, "");
                    }
                });
                var self = $(this);
                self.off('focusout');
                self.on('focusout', function () {
                    var sum = 0;
                    _.each($('form input[data-dsl*="cSum"][name=' + name + ']'), function (item) {
                        var value = $(item).val().replace(/\,/g, "");
                        var num = parseFloat(value) || 0;
                        sum += num;
                    }, this);
                    sum = parseFloat(sum.toFixed(precisionValue));
                    var $el = $('form input[data-dsl*="rSum"][name=' + name + ']');
                    
                    $el.val(sum);
                    $($el).inputmask({
                        'alias': 'decimal',
                        'groupSeparator': ',',
                        'autoGroup': true,
                        'digits': parseInt(precisionValue),
                        'allowMinus': true,
                        'onBeforePaste': function (pastedValue) {
                            return pastedValue.replace(/,/gi, "");
                        }
                    });
                });
            });
            
            $.each($('form ul[data-dsl*="cOrg"] li.creat'), function () {
                var target = $(this).parent();
                var orgType = target.attr("data-orgtype");
                var $id = $("#" + target.attr('id'));
                var title = orgType == 'department' ? i18n['부서 추가'] : i18n['사용자 추가'];
                var multiCompanySupporting = GO.util.store.get('apprConfig.multiCompanySupporting');

                var tplForMobile = Hogan.compile(['<li data-id="{{id}}">',
                    '<span class="name">{{name}}</span>',
                    '<span class="btn_wrap">',
                    '<span class="ic ic_del" title="',
                    i18n['삭제'],
                    '">',
                    '</span>',
                    '</span>',
                    '</li>'].join(""));
                
                var tpl = Hogan.compile(['<li data-id="{{id}}">',
                    '<span class="name">{{name}}</span>',
                    '<span class="btn_wrap">',
                    '<span class="ic_classic ic_del" title="',
                    i18n['삭제'],
                    '">',
                    '</span>',
                    '</span>',
                    '</li>'].join(""));
                
                function getSelectedValue() {
                    var selected = $id.attr('data-selected');
                    var selectedValue = selected ? selected.split(',') : [];
                    return _.map(selectedValue, function(val) {
                        var nameAndId = val.split('#');
                        return {
                            id : nameAndId[1] == undefined ? '' : nameAndId[1],
                            username : nameAndId[0],
                        }
                    });
                };
                
                function convertMembers(members) {
                    return members.map(function(member) {
                        return member.username + '#' + member.id;
                    }).join(',');
                }
                
                $(this).off('click');

                if (GO.util.isMobile() && !GO.util.isMobilePC()) {
                    $(this).on('click', function() {
                        GO.router.navigate(GO.router.getUrl() + '#org',
                            {trigger: false, pushState: true});
                        var orgView = new OrgView({type: orgType});
                        orgView.render({
                            title: title,
                            checkedUser: getSelectedValue(),
                            callback: function(data) {
                                $id.find('li').not(':last').remove();
                                $id.attr('data-selected',
                                    data.map(function(item) {
                                        return item.name + '#' + item.id;
                                    }).join(','));
    
                                var $addBtn = $id.find('li.creat');
                                data.forEach(function(item) {
                                    $addBtn.before(tplForMobile.render({
                                        id: item.id,
                                        name: item.name,
                                    }));
                                });
                                return false;
                            },
                        });
                        GO.EventEmitter.trigger('common', 'layout:scrollToTop',
                            this);
                    });
                    
                } else {
                    $(this).on('click', function () {
                        $.goOrgSlide({
                            header: title,
                            desc: '',
                            type: orgType,   //사용자:list, 부서:department
                            multiCompanyVisible: multiCompanySupporting,
                            callback: function (rs) {
                                //중복체크
                                if (!rs || $id.find('li[data-id="' + rs.id + '"]').length) {
                                    return;
                                }
                                
                                var members = getSelectedValue();
                                members.push({username: rs.name, id: rs.id});
                                $id.attr('data-selected', convertMembers(members));
                                
                                $id.find('li.creat').before(tpl.render({
                                    id: rs.id,
                                    name: rs.name
                                }));
                            },
                            contextRoot: GO.contextRoot
                        });
                    });
                }
                
                $id.off('click', 'li span.ic_del');
                $id.on('click', 'li span.ic_del', function (e) {
                    e.stopPropagation();
                    var $li = $(this).closest('li');
                    if ($li.attr('data-id')) {
                        var value = $li.attr('data-id');
                        var members = getSelectedValue();
                        
                        var resultArr = members.filter(function(member) {
                            return member.id !== value;
                        });
                        
                        $id.attr('data-selected', convertMembers(resultArr));
                    } else {
                        var value = $(this).closest('li').find('span.name').text();
                        var members = getSelectedValue();
                        
                        var resultArr = members.filter(function(member) {
                            return member.username !== value;
                        });
                        
                        $id.attr('data-selected', convertMembers(resultArr));
                    }
                    $li.remove();
                });
            });
            
            $.each($('form input[data-dsl*="$width"]'), function () {
                var width = $(this).attr("data-width");
                $(this).css("width", width + "px");
            });
            
            //최초기안시에만 default 문자 넣는다., 임시저장시에는 동작안함.
            if (GO.util.store.get('document.docStatus') == "CREATE") {
                $.each($('form input[data-dsl*="$defaultstr"], form textarea[data-dsl*="$defaultstr"]'), function (k, v) {
                    
                    var $dsl = $(v).attr("data-dsl");
                    var defaultstr = $(this).attr("data-defaultstr");
                    var valid = /^[0-9]+$/.test(defaultstr);
                    
                    if ($dsl.search('currency') > -1 || $dsl.search('number') > -1) {
                        //디폴트 문자가 숫자가 아니면 입력하지 않는다.
                        if (!valid) {
                            return true;
                        }
                        
                        $(this).val(defaultstr);
                        $(v).focus();
                        
                    } else {
                        $(this).val(defaultstr);
                    }
                });
            }
        }
        
        $.customSettingHandler = {
            setCustomSelect: function (self, options, selectedVal, callback) {
                var optionString = "";
                var defaultLabel = "";
                $.each(options, function (index, option) {
                    var selectedStr = "";
                    if (option.CD == selectedVal) {
                        selectedStr = "selected";
                        defaultLabel = option.CD_NM;
                    }
                    optionString += '<option value="' + option.CD + '" ' + selectedStr + '>' + option.CD_NM + '</option>';
                });
                self.html(optionString);
                
                self.attr('data-label', (defaultLabel) ? defaultLabel : options[0].CD_NM);  //span으로 변환시에 선택 label을 기억하기 위해 설정함(customSelect일때만)
                
                self.off('change');
                self.on('change', function () {
                    var selectLabel = $(this).find(':selected').text();
                    $(this).attr('data-label', selectLabel);
                    if (typeof callback == 'function') {
                        callback();
                    }
                });
            },
            setData: function (self, content) {
                if (self.is(':visible')) {
                    //일반 input,textarea,span
                    if (self[0].tagName == "SPAN") {
                        $(self).html(content);
                    } else {
                        $(self).val(content);
                    }
                } else {
                    //에디터일경우
                    GO.Editor.getInstance($(self).attr('id')).setContent(content);
                }
            }
        };
        
        $.validateHandler = {
            isCompleteRequiredForm: function (self) {
                var result = true;
                
                //input, textarea 체크 (에디터는 2.4.6에서 필수 옵션 설정을 제공하지 않게 됨)
                self.find('input[data-require="true"],textarea[data-require="true"]').each(function () {
                    if ($.trim($(this).val()) == '') {
                        result = false;
                        return false;
                    }
                });
                
                return result;
            },
            getMaxLengthCheck: function (self) {
                var returnObj = {
                    result: true
                };
                
                //input, textarea 체크
                self.find('input[data-maxlength],textarea[data-maxlength]').each(function () {
                    if ($(this).attr("data-maxlength") && ($(this).val().length > parseInt($(this).attr("data-maxlength")))) {
                        returnObj = {
                            result: false,
                            maxlength: $(this).attr("data-maxlength"),
                            errorId: $(this).attr("id")
                        };
                        return false;
                    }
                });
                
                return returnObj;
            }
        };
        
        $.dataHandler = {
            setDocVariables: function (obj, variables) {
                var self = obj;
                /***
                 * GO-19443 전자결재 양식관련 컴포넌트 추가 : 전자결재에서 기안시에
                 * 서버에서 받은 연동데이터(variables)의 프로퍼티 값들을 읽어 화면에 그린다.
                 */
                _.each(variables, function (value, key) {
                    
                    var target = self.find("[id='" + GO.util.replaceBrackets(key) + "']");
                    
                    // GO-29124  cSum, rSum 재기안 오류
                    if (target.attr("data-dsl") && target.attr("data-dsl").search('cSum') >= 0) {
                        return true;
                    }
                    
                    if (target && target.attr('data-id') !== undefined && target.attr('data-type') != 'span' && target.attr('data-value') == "") {
                        target.val(value);
                    } else if (target.attr('data-type') == 'span') {
                        value = value.replace(/</gi, "&lt;");
                        value = value.replace(/>/gi, "&gt;");
                        value = value.replace(/ /gi, "&nbsp;");
                        value = value.replace(/''/gi, "\"");
                        value = value.replace(/\n/gi, '<br/>');
                        target.html(value);
                    }
                });
            },
            getDocVariables: function (self) {
                var varArray = $(self).serializeArray();
                var docVariables = {};
                _.each(varArray, function (v) {
                    if (!_.contains(approvalInfoIds, v.name)) {
                        docVariables[v.name] = v.value;
                    }
                });
                return docVariables;
            },
            changeActivity: function (activity) {
                var target = $('#activity_' + activity.id);
                var type = target.parent().attr('data-group-type');
                var activityHtml = approvalActivitiesTpl(type, activity, 'POSITION');
                target.replaceWith(activityHtml);
            },
            changeActivityGroups: function (options) {
                var activityGroups = options.groups;
                var isReception = options.config.isReception;
                var isDisplayDrafter = options.config.displayDrafter;
                var includeAgreement = options.config.includeAgreement;
                var activityBoxConfig = options.config.activityBox;
                var agreements = [];
                
                // 결재
                $.each(activityGroups, function (index, activityGroup) {
                    agreements = agreements.concat(
                        _.select(activityGroup.activities, function (activity) {
                            return activity.type == "AGREEMENT";
                        })
                    );
                    
                    var targetGroup = $('[data-group-name="' + activityGroup.name + '"]' + ((isReception) ? '[data-is-reception="true"]' : '[data-is-reception!="true"]'));
                    if (targetGroup.length > 1) {
                        targetGroup = $('[data-group-seq="' + index + '"]' + ((isReception) ? '[data-is-reception="true"]' : '[data-is-reception!="true"]'));
                    }
                    
                    var targetType = targetGroup.attr('data-group-type');
                    
                    var isNewType1 = "";
                    
                    if (targetGroup.length) {
                        isNewType1 = targetGroup[0].tagName === 'SPAN' && targetType == "type1"; // 신규 마크업
                    }
                    
                    if (isNewType1) targetType = 'type1New';
                    if (targetType == "type1") {
                        targetGroup.find('table.tb_sign_type1').remove();
                    } else if (isNewType1) {
                        targetGroup.empty();
                    } else {
                        targetGroup.find('span.sign_member').remove();
                    }
                    
                    var activityHtml = '';
                    var activityLen = activityGroup.activities.length;
                    
                    var isArbitrary = false;
                    $.each(activityGroup.activities, function (index, activity) {
                        
                        if (!includeAgreement && activity.type == "AGREEMENT") {// 합의 옵션
                            return true;
                        }
                        
                        if (activity.type == "CHECK") {// 확인 옵션
                            return true;
                        }
                        
                        if (!isDisplayDrafter && activity.type == "DRAFT") { // drafter 옵션
                            return true;
                        }
                        
                        if (isArbitrary) {
                            activity.isArbitrary = true;
                        }
                        
                        //결재방 맨 마지막에 전결 표시를 해줘야하기 때문
                        if (isArbitrary && activityLen - 1 == index) {
                            activity.arbitraryStatus = true;
                        }
                        
                        // 타입에 따른 결재선 마크업 생성
                        activityHtml += approvalActivitiesTpl(targetType, activity, activityBoxConfig);
                        
                        //전결 일경우 그 뒤에 사람부터 사선이미지 추가해야하기때문에.
                        if (activity.status == "ARBITRARY") {
                            isArbitrary = true;
                        }
                        
                    });
                    
                    if (activityLen > 0 && activityHtml != '') {
                        if (targetType == "type1") {
                            activityHtml = [
                                '<table class="tb_sign_type1">',
                                '<tbody>',
                                '<tr>',
                                '<th>' + activityGroup.name + '</th>',
                                activityHtml,
                                '</tr>',
                                '</tbody>',
                                '</table>'
                            ].join('');
                        }
                        if (targetType == 'type1New') {
                            activityHtml = [
                                '<span class="sign_tit_wrap">',
                                '<span class="sign_tit">',
                                '<strong>' + activityGroup.name + '</strong>',
                                '</span>',
                                '</span>',
                                activityHtml
                            ].join('');
                        }
                    }
                    
                    targetGroup.append(activityHtml);
                });
                
                // 합의
                if (!isReception) {
                    var agreementElem = $('#agreementWrap');
                    var agreementType = agreementElem.attr('data-group-type');
                    if (agreementElem.length && agreementElem[0].tagName === 'SPAN' && agreementType === 'type1') {
                        agreementType = 'type1New';
                    }
                    var groupName = agreementElem.attr('data-group-name');
                    agreementElem.find('.sign_member').remove();
                    var agreementHtml = '';
                    
                    if (agreements.length > 0 && agreementElem.find('table').length == 0) {
                        if (agreementType == 'type1') {
                            activityHtml = [
                                '<table class="tb_sign_type1">',
                                '<tbody>',
                                '<tr>',
                                '<th>' + groupName + '</th>',
                                '</tr>',
                                '</tbody>',
                                '</table>'
                            ].join('');
                            agreementElem.append(activityHtml);
                        }
                        if (agreementType == 'type1New') {
                            agreementElem.empty();
                            activityHtml = [
                                '<span class="sign_tit_wrap">',
                                '<span class="sign_tit">',
                                '<strong>' + groupName + '</strong>',
                                '</span>',
                                '</span>'
                            ].join('');
                            agreementElem.append(activityHtml);
                        }
                    }
                    
                    $.each(agreements, function (index, activity) {
                        agreementHtml += approvalActivitiesTpl(agreementType, activity, activityBoxConfig);
                    });
                    
                    if (agreementType == 'type1') {
                        agreementElem.find('tr td').remove();
                        agreementElem.find('tr').append(agreementHtml)
                    } else {
                        agreementElem.append(agreementHtml);
                    }
                    
                    if (agreements.length == 0) {
                        agreementElem.empty();
                    }
                }
            },
            
            getData: function (opt) {
                var $target = opt.target;
                var value = $target.find('#' + opt.destination).val();
                
                //시행문일경우 span에 id가 없기 때문에 data-id로 가져와야함.
                if (typeof value === 'undefined') {
                    return $target.find('span[data-id="' + opt.destination + '"]').text();
                }
                return value;
            },
            setData: function (opt) {
                var $target = opt.target;
                
                //수신처(recipient),문서참조(docReference)에 data가 배열이든 문자열이든 둘다 세팅
                var recipientNode = opt.destination.recipient;
                var docReferenceNode = opt.destination.docReference;
                var docClassification = opt.destination.docClassification;
                var officialDocReceiverNode = opt.destination.officialDocReceiver;
                if (recipientNode) {
                    if (typeof recipientNode == 'object') {
                        opt.destination.recipient = recipientNode.join();
                    }
                }
                if (docReferenceNode) {
                    if (typeof docReferenceNode == 'object') {
                        opt.destination.docReference = docReferenceNode.join();
                    }
                }
                if (docClassification) {
                    if (typeof docClassification == 'object') {
                        opt.destination.docClassification = docClassification.join();
                    }
                }
                if (officialDocReceiverNode) {
                    if (typeof docClassification == 'object') {
                        opt.destination.officialDocReceiver = officialDocReceiverNode.join();
                    }
                }
                $.each(opt.destination, function (k, v) {
                    var target = $target.find('#' + k + ',span[data-id="' + k + '"]');
                    
                    if ($(target).length == 0) {
                        return true;
                    }
                    if ($(target)[0].nodeName == "INPUT") {
                        target.val(v);
                    } else {
                        target.text(v);
                    }
                });
            },
            setUserInfo: function (opts) {
                if (!opts.userProfileApi) {
                    defaultInfoSet();
                    return;
                }
                var isAdmin = opts.isAdmin ? 'ad/' : (GO.instanceType == 'admin' ? 'ad/' : '');
                var url = [opts.contextRoot, isAdmin, opts.userProfileApi + '/' + opts.userId];
                
                $.ajax({
                    url: url.join(''),
                    type: 'get',
                    contentType: 'application/json'
                }).done(function (rs) {
                    
                    var today = new Date();
                    var convertDate = today.getFullYear() + "." + (today.getMonth() + 1) + "." + today.getDate();
                    
                    $.each($('form input[data-dsl="{{name_pos}}"]'), function () {
                        var position = rs.data.position != undefined ? rs.data.position : GO.session('position');
                        var namePos = rs.data.name + " " + position;
                        $(this).attr('data-value', namePos).val(namePos);
                    });
                    
                    $.each($('form input[data-dsl="{{user_name}}"]'), function () {
                        var name = rs.data.name; //GO.session('name');
                        $(this).attr('data-value', name).val(name);
                    });
                    
                    $.each($('form input[data-dsl="{{user_pos}}"]'), function () {
                        var position = rs.data.position != undefined ? rs.data.position : GO.session('position');
                        $(this).attr('data-value', position).val(position);
                    });
                    
                    $.each($('form input[data-dsl="{{user_empno}}"]'), function () {
                        var employeeNumber = rs.data.employeeNumber != undefined ? rs.data.employeeNumber : GO.session('employeeNumber');
                        $(this).attr('data-value', employeeNumber).val(employeeNumber);
                    });
                    
                    $.each($('form input[data-dsl="{{user_org}}"]'), function () {
                        var deptName = opts.deptName;
                        $(this).attr('data-value', deptName).val(deptName);
                    });
                    
                    $.each($('form input[data-dsl="{{today}}"]'), function () {
                        $(this).attr('data-value', convertDate).val(convertDate);
                    });
                    
                    
                    //기안일
                    //수신문서 수정시에는 기안일을 변경하면 안된다. GO-30846
                    if (opts.docType != "RECEIVE") {
                        $.each($("form #draftDate"), function () {
                            $(this).attr('data-value', opts.draftDate).val(opts.draftDate);
                        });
                    }
                });
            }
        };
        $.pluginInitHandler = {
            //보고서 작성시 에디터,켈린더 초기화
            goPluginInit: function (opts) {
                var time = 500,
                    functions = [],
                    context = this;
                
                $.each($('form span[data-dsl*="editor"]'), function (k, v) {
                    var oPattern = $(v).attr('data-dsl');
                    if ((oPattern.search('adminedit') > -1) && !opts.isAdmin) {
                        return true;
                    }
                    
                    //에디터에서는 $defaultstr:xx$ 에서 xx부분을 숨겨진영역의 id로 사용함.
                    var defaultPartId = $(v).attr('data-defaultstr');
                    
                    var self = this;
                    var editorId = $(self).attr('id');
                    
                    var skinType = $(self).attr('data-skintype');
                    if (skinType == 'simple') {
                        $(self).css('min-width', '200px');
                    }
                    
                    if (editorId) {
                        var editorValue = $(this).attr('value');
                        
                        //양식내에 <div id="xx" style="display:none"></div> 로 감싼 내용을 가져옴.
                        if (editorValue == "" && defaultPartId != "" && (GO.util.store.get('document.docStatus') == "CREATE")) {
                            editorValue = $("#" + defaultPartId).html();
                        }
                        
                        var deferred = $(self).goWebEditor({
                            contextRoot: GO.config("contextRoot"),
                            lang: GO.config("locale"),
                            bUseVerticalResizer: false,
                            editorValue: editorValue,
                            theme: skinType // simple,detail
                        });
                        functions.push(deferred);
                    }
                    time += 1300;
                });
                
                setTimeout(function () {
                    $.when(functions).then(function () {
                        $(context).trigger("edit:complete");
                    });
                }, time);
                pluginInit();
            },
            approvalPluginInit: function () {
                pluginInit();
            }
        };
        
        $.editorParser = {
            convertDslToSpan: function (tpl) {
                return convertDslToSpan(tpl);
            },
            getFormData: function (self) {
                var data = self.serializeArray();
                var transMarkup = '';
                var editorMap = [];
                var id = '';
                var formClone = self.clone();
                var $el = $('form span[data-dsl*="editor"]');
                for (var i = 0; i < $el.length; i++) {
                    var editorPart = {};
                    var $editor = $($el[i]);
                    id = $editor.attr('id');
                    editorPart.editorId = id;
                    var editor = GO.Editor.getInstance(id);
                    // WebEditor가 존재하는 경우(문서작성 또는 수정) Editor에서 Contents 를 가져오고,
                    // 그렇지 않은 경우(문서조회), 조회화면의 엘리먼트(SPAN 또는 DIV)에서 Contents 를 가져옴.
                    if (editor && editor.getContent && typeof editor.getContent == 'function') {
                        if ($editor.attr("data-content-type") == "MIME") {
                            editorPart.isMimeType = true;
                        }
                        
                        //결재완료된 문서에서 데이터를 드래그 후 복사한 뒤 새로운 결재 에디터에 붙여넣기 했을때 마크업까지 복사됨
                        //이때 data-dsl등이 들어가서 결재문서에서 데이터를 표현할때 오동작을 일으킴. GO-26364
                        editorPart.editorContent = GO.util.removeDataAttribute(GO.util.escapeXssFromHtml(editor.getContent()));
                        
                    } else {
                        editorPart.editorContent = $('#' + id).html();
                    }
                    editorMap.push(editorPart);
                }
                formClone.find('iframe').remove();
                // input,textarea 마크업을 서버에 저장하기위한 span 으로 변환
                $.each(formClone, function (k, v) {
                    $(v).find('[data-dsl]').each(function () {
                        var attrName = $(this).attr('name');
                        var attrId = $(this).attr('id');
                        //var attrValue = $(self).attr('value');
                        var attrValue = "";
                        /*
                         * GO-19443 전자결재 양식관련 컴포넌트 추가 : 서버에 보낼때 마크업을 변환하여 보낸다. span같은 경우는 value속성이 없으므로 해당 html을 value로 함
                         */
                        if ($(this).attr('data-type') && $(this).attr('data-type').indexOf('span') != -1) {
                            attrValue = $(this).html();
                            attrValue = attrValue.replace(/\n/gi, '');
                        } else {
                            attrValue = $(this).val();
                        }
                        // attrValue가 null일 경우에 대한 예외처리
                        if (attrValue != null) {
                            attrValue = attrValue.replace(/"/gi, "\"");
                        }
                        // ie8에서 임시저장 두번이상할때 문제 GO-12555 - ie8에서만 $(this).val()할때 span사이에 있는 값을 가져온다.
                        if ($(this).attr('data-dsl').search('editor') > -1) {
                            attrValue = "";
                        }
                        
                        var arrtDataLabel = $(this).attr('data-label');
                        var selectType = $(this).attr('data-select-type');
                        
                        var opt = {
                            'data-name': attrName,
                            'data-id': attrId,
                            'data-value': attrValue,
                            'data-label': arrtDataLabel,
                            'data-select': attrValue,
                            'value': attrValue
                        };
                        
                        // TODO 개선해야함.. formparse 를
                        if ($(this).attr("data-content-type") == "MIME") {
                            opt["data-content-type"] = "MIME";
                            opt["data-editor"] = "ActiveDesigner";
                        }
                        
                        
                        //시간 셀렉트 마크업에서 시간이냐 분이냐 구분
                        if (selectType) {
                            opt['data-select-type'] = selectType;
                        }
                        
                        //커스텀 셀렉트({{cSel}}) 을 위한
                        if ($(this).attr("data-selectval")) {
                            opt['data-value'] = "";
                            opt['data-select'] = "";
                            opt['data-selectval'] = $(this).attr("data-selectval");
                        }
                        
                        if ($(this).attr("data-selected")) {
                            opt['data-selected'] = $(this).attr("data-selected");
                        }
                        
                        /*
                         * GO-19443 전자결재 양식관련 컴포넌트 추가 : 전자결재 다운로드 같은 경우 마크업의 text를 화면에 출력하므로 replace후에 마크업 내용을 html로 그려 유지시켜야 한다. 안그러면 다운로드시에 내용이 비어있게됨
                         */
                        if ($(this).attr('data-type') && $(this).attr('data-type').indexOf('span') != -1) {
                            $(this).replaceWithAndReturnNew(convertDslToSpan($(this).attr('data-dsl')))
                            .attr(opt).html(attrValue);
                            
                        } else {
                            $(this).replaceWithAndReturnNew(convertDslToSpan($(this).attr('data-dsl')))
                            .attr(opt).text('');
                        }
                    });
                    transMarkup += $(v).clone().wrapAll("<div/>").parent().html();
                });
                // 보고자가 입력한 값을 span으로 변환한 마크업에 넣는다.
                var dataSetForm = $(transMarkup).clone();
                
                $.each(data, function (i, field) {
                    dataSetForm.find('[data-name="' + field.name + '"]').each(function (k, v) {
                        field.value = field.value.replace(/"/gi, "\"");
                        //textarea에서는 .val() attr('value')로 값을 가져올수 없어서 data-select에 값을 세팅못하기 때문에
                        var $v = $(v);
                        var dataDsl = $v.attr('data-dsl');
                        if (dataDsl.search('textarea') >= 0 || (dataDsl.search('select') && $v.attr('data-type') && $v.attr('data-type').search('select')) >= 0) {
                            $v.attr('data-value', field.value).text(field.value);
                            var parsedText = $v.text().replace(/\n/gi, '<br/>').replace(/ /gi, '&nbsp;'); // 멀티텍스트 컴포넌트에서 작성한 내용이 다운로드, 게시글등록, 메일발송시 개행이 안되는문제
                            $v.html(parsedText);
                        } else if (dataDsl.search('cSel') >= 0) {
                            $v.text(field.value);
                        } else if (dataDsl.search('customSelect') >= 0) {  //customSelect는 수정시에 setCustomSelect를 호출해서 option을 세팅하기때문에 text값만 설정
                            $v.text($v.attr('data-label'));
                        } else {
                            if ($v.attr('data-select') == field.value) {
                                $v.attr('data-value', field.value).text(($v.attr('data-label')) ? $v.attr('data-label') : field.value);
                                // GO-28858 lable이 없는 option을 선택했을 때 대응을 위해 추가된 코드
                                $v.attr('data-select-option', true);
                            }
                        }
                    });
                });
                
                dataSetForm.find('label[data-type="removeSpan"]').remove();
                
                dataSetForm.find('span[data-type="radio"],span[data-type="checkbox"]').each(function () {
                    if ($(this).text() == '') {
                        // GO-28858 lable이 없는 option을 선택했을 때 대응을 위해 추가된 코드
                        if ($(this).attr('data-select-option') == "true") {
                            return true;
                        }
                        $(this).hide().text($(this).attr('data-value'));
                    }
                });
                
                dataSetForm.find('span[data-dsl*="cOrg"]').each(function () {
                    var $this =  $(this);
                    if ($this.text() == '') {
                        $this.text($this.attr('data-selected').split(',').map(function(item) {
                            return item.split('#')[0];
                        }).join(','));
                    }
                });
                
                if (editorMap.length > 0) {
                    for (var k = 0; k < editorMap.length; k++) {
                        if (editorMap[k].isMimeType) {
                            // textarea 태그를 쓰는 이유.
                            // ie8 에서는 textNode 의 \t \r \n 등을 보장해 주지 않기 때문에
                            // 양식에 mime 을 넣었을때 format이 깨지게 된다.
                            // textarea 를 통해 mime format을 유지한다.
                            var textarea = document.createElement("textarea");
                            textarea.appendChild(document.createTextNode(editorMap[k].editorContent));
                            dataSetForm.find('span[data-id="' + editorMap[k].editorId + '"]').html('').html(textarea);
                        } else {
                            dataSetForm.find('span[data-id="' + editorMap[k].editorId + '"]').html('').html(editorMap[k].editorContent);
                        }
                    }
                    //dataSetForm.find('span[data-type="editor"]').html('').html(editorContent);
                }
                
                return dataSetForm.html();
            },
            //getContentFromViewMode : function(content){
            //
            //	$(content).find('input').attr("disabled",false);
            //	var data = content.serializeArray();
            //
            //
            //	var transMarkup = '';
            //	var html = $.parseHTML(content.html(),document,true);
            //	var result = '';
            //	$.each($(html).clone(), function(k,v){
            //		$(v).find('input[data-dsl]').each(function(m,n){
            //			$(this).attr("disabled",false);
            //			var attrName = $(this).attr('name');
            //			var attrId = $(this).attr('id');
            //			var attrValue = $(this).val();
            //			var arrtDataLabel = $(this).attr('data-label');
            //			var opt = {
            //					'data-name':attrName ,
            //					'data-id':attrId ,
            //					'data-value':attrValue ,
            //					'data-label':arrtDataLabel ,
            //					'data-select':attrValue
            //			};
            //			$(this).replaceWithAndReturnNew(convertDslToSpan($(this).attr('data-dsl'))).attr(opt);
            //		});
            //		transMarkup += $(v).clone().wrapAll("<div/>").parent().html();
            //	});
            //
            //	// 보고자가 입력한 값을 span으로 변환한 마크업에 넣는다.
            //	var dataSetForm = $(transMarkup).clone();
            //
            //	$.each(data, function(i, field){
            //		dataSetForm.find('[data-name="'+field.name+'"]').each(function(k,v){
            //			if($(v).attr('data-select') == field.value){
            //				$(v).attr('data-value',field.value).text(($(v).attr('data-label')) ? $(v).attr('data-label') : field.value);
            //			}
            //		});
            //	});
            //
            //	dataSetForm.find('label').remove();
            //
            //	dataSetForm.find('span[data-type="radio"],span[data-type="checkbox"]').each(function(){
            //		if($(this).text() == ''){
            //			$(this).hide().text($(this).attr('data-value'));
            //		}
            //	});
            //	return dataSetForm.html();
            //},
            convertViewMode: function (content) {
                content = GO.util.convertMSWordTag(content);
                
                var html = $.parseHTML(content, document, true);
                var result = '';
                
                $.each($(html).clone(), function (k, v) {
                    $(v).find('span[data-type="radio"],span[data-type="checkbox"]').each(function () {
                        var dslKey = $(this).attr('data-type');
                        var markup = "";
                        var part = "";
                        var labelClass = "";
                        
                        var dataId = $(this).attr('data-id');
                        var dataDsl = $(this).attr('data-dsl');
                        var dataName = $(this).attr('data-name');
                        var dataLabel = $(this).attr('data-label');
                        var dataValue = $(this).attr('data-value');
                        var dataRequire = $(this).attr('data-require');
                        
                        var markupMaker = ['<input type=',
                            '"', dslKey, '"',
                            ' class="editor_opt" data-dsl=',
                            '"', dataDsl, '"',
                            ' id=',
                            '"', dataId, '"',
                            ' name=',
                            '"', dataName, '"',
                            ' data-label=',
                            '"', dataLabel, '"',
                            ' value=',
                            '"', dataValue, '"',
                            ' data-require=',
                            '"', dataRequire, '"'
                        ];
                        //선택하지 않은 경우
                        if ($(this).css('display') == "none") {
                            markupMaker.push('  disabled/>');
                            markup = markupMaker.join('');
                            labelClass = 'inactive';
                        } else {
                            markupMaker.push(' checked disabled/>');
                            markup = markupMaker.join('');
                            labelClass = '';
                        }
                        part += markup + "<label class='editor_label " + labelClass + "'>" + $(this).attr("data-label") + "</label>&nbsp;";
                        $(this).replaceWithAndReturnNew("<span>" + part + "</span>");
                        
                    });
                    
                    // ie에서 전자결재 내용을 복사해서 에디터에 붙이면 컴포넌트 마크업까지 복사해서 들어가는 문제가 있음. (GO-16710)
                    // textarea나 text 형태는 data-value의 값을 치환해서 보여주는데 에디터 내용안에 들어간 컴포넌트 마크업은 치환대상에서 제외함.(기존 생성된 문서를 위해 남겨두어야함)
                    // 추후 수정사항
                    // textarea 값을 저장할때 $(v).attr('data-value',field.value).text(field.value); 식으로 넣는 부분을
                    // $(v).attr('data-value',field.value).html(br,&nbsp; 등으로 치환된 내용); 으로 수정해야할듯..
                    $(v).find('span[data-type="textarea"],span[data-type="text"]').not('span[data-dsl*="editor"] span[data-type=textarea],span[data-dsl*="editor"] span[data-type="text"]').each(function (m, n) {
                        var html = $(n).attr('data-value');
                        html = GO.util.textToHtml(html);
                        $(this).html(html);
                    });
                    
                    result += $(v).clone().wrapAll("<div/>").parent().html();
                });
                return result;
            },
            convertHtml: function (opts) {
                // input mode (마크업으로 변환 모듈)
                var content = opts.data;
                if (opts['angleBracketReplace']) {
                    content = content.replace(/&lt;/gi, "<");
                    content = content.replace(/&gt;/gi, ">");
                }
                
                var html = $.parseHTML(content, document, true);
                var isAdmin = opts.isAdmin;
                var result = '';
                this.cnt = 0;
                var self = this;
                this.getUnusedSeqNum = getUnusedSeqNum;
                
                $.each($(html).clone().wrapAll('<div/>').parent(), function (k, v) {
                    //DB에 input 마크업이 저장되는 경우가 있다. (view모드에서 바로 저장할때)
                    // input으로 저장되는 경우는 radio나 checkbox이기 때문에 이부분은 처리하지 말고 skip한다.
                    // 하지만 disabled 속성은 false로, label에는 data-type="removeSpan" 속성을 추가해야 라벨중복을 막을 수 있다.
                    
                    self.components = $(v).find('span[data-dsl],input[data-dsl]');
                    self.components.each(function () {
                        var dslKey = $(this).attr('data-dsl');
                        var autoType = $(this).attr('data-autotype') == 'true';
                        var parseKey;
                        dslKey.replace(/{{([^}}]*)}}/g, function (m, key) {
                            parseKey = key;
                        });
                        
                        var $form = $(this).attr('data-dsl');
                        var part, selectVal, optionString, convertSpan;
                        var hours = [];
                        var minutes = [];
                        var time = [];
                        if (parseKey.search('radio') >= 0) {
                            var dsl = getDsl(parseKey);
                            part = '';
                            if ($(this).prop("tagName") != "INPUT") {
                                if ($(this).attr('data-select')) {
                                    convertSpan = $(convertFormToSpan($form))
                                    .attr({
                                        'id': $(this).attr('data-id'),
                                        'name': $(this).attr('data-name'),
                                        'data-label': $(this).attr('data-label'),
                                        'value': $(this).attr('data-value')
                                    });
                                    // ie9,10에서는 attr('checked',true)가 동작안함.. prop으로 대체함. 리팩토링 필요
                                    var dataLabel = $(this).attr('data-label');
                                    if (checkIE910()) {
                                        part += convertSpan.prop('checked', $(this).css('display') != 'none')
                                        .clone().wrapAll("<div/>").parent().html() + "<label class='editor_label' data-type='removeSpan'>" + dataLabel + "</label>";
                                    } else {
                                        part += convertSpan.attr('checked', $(this).css('display') != 'none')
                                        .clone().wrapAll("<div/>").parent().html() + "<label class='editor_label' data-type='removeSpan'>" + dataLabel + "</label>";
                                    }
                                    
                                    $(this).replaceWithAndReturnNew("<span>" + part + "</span>");
                                    
                                    var lastOpt = _.last(dsl);
                                    if (_.isEqual(dataLabel, lastOpt)) {
                                        self.cnt++;
                                    }
                                    
                                } else {
                                    if (dsl.length == 1) { //양식에서 {{radio:myRadioId}}로 쓸경우
                                        
                                        var id = dsl[0].split(':')[1];
                                        
                                        var componentId = (id) ? id : $(this).attr('data-id') ? $(this).attr('data-id') : 'editorForm_' + self.getUnusedSeqNum(self.components, this) + '_radio';
                                        part += $(convertFormToSpan($form))
                                        .attr({
                                            'id': componentId,
                                            'name': componentId,
                                            'data-label': '',
                                            'value': (id) ? id : 'none',
                                            'checked': $(this).attr('data-select') == 'none'
                                        })
                                        .clone().wrapAll("<div/>").parent().html();
                                    } else {
                                        var name = '';
                                        for (var i = 1; i < dsl.length; i++) {
                                            var dslStr = dsl[i].split(':');
                                            var label = dslStr[0];
                                            var id = dslStr[1];
                                            
                                            if (autoType) {
                                                /**
                                                 * radio 에 아이디를 부여 하려면 radio:radioID_OptionA_Option 의 형태로 써야한다.
                                                 * 그러나 radio 자동결재선 은 {{radio_옵션:아이디}} 형태로 쓰고 있었다...진짜 노답
                                                 * 잘못 만들어진 기존의 모든 양식을 마이그레이션 할 수 없으니 땜질하자
                                                 */
                                                parseKey.replace(/:apprLineRuleOption/g, function (str) {
                                                    parseKey = parseKey.replace(str, '');
                                                    name = str.replace(':', '');
                                                });
                                                if (!name) name = parseKey.split(':')[1];
                                            } else {
                                                name = (parseKey.search('radio') >= 0) ? 'editorForm_' + self.getUnusedSeqNum(self.components, this) : 'editorForm_' + self.getUnusedSeqNum(self.components, this) + '_' + dsl[i]
                                            }
                                            part += $(convertFormToSpan($form)).attr({
                                                'id': (id) ? id : $(this).attr('data-id') ? $(this).attr('data-id') : 'editorForm_' + self.getUnusedSeqNum(self.components, this) + '_' + dsl[i],
                                                'name': $(this).attr('data-name') ? $(this).attr('data-name') : name,
                                                'data-label': label,
                                                'value': (id) ? id : dsl[i],
                                                'checked': i == 1
                                            }).clone().wrapAll("<div/>").parent().html() + "<label class='editor_label' data-type='removeSpan'>" + dslStr[0] + "</label>";
                                        }
                                    }
                                    
                                    $(this).replaceWithAndReturnNew("<span>" + part + "</span>");
                                    self.cnt++;
                                }
                            } else {
                                $(this).attr("disabled", false);
                                $(this).next().attr("data-type", "removeSpan");
                            }
                            
                        } else if (parseKey.search('check') >= 0) {
                            var dsl = getDsl(parseKey);
                            part = '';
                            if ($(this).prop("tagName") != "INPUT") {
                                if ($(this).attr('data-select')) {
                                    convertSpan = $(convertFormToSpan($form))
                                    .attr({
                                        'id': $(this).attr('data-id'),
                                        'name': $(this).attr('data-name'),
                                        'data-label': $(this).attr('data-label'),
                                        'value': $(this).attr('data-value')
                                    });
                                    // ie9,10에서는 attr('checked',true)가 동작안함.. prop으로 대체함. 리팩토링 필요
                                    var dataLabel = $(this).attr('data-label');
                                    if (checkIE910()) {
                                        part = convertSpan.prop('checked', $(this).css('display') != 'none')
                                        .clone().wrapAll("<div/>").parent().html() + "<label class='editor_label' data-type='removeSpan'>" + dataLabel + "</label>";
                                    } else {
                                        part = convertSpan.attr('checked', $(this).css('display') != 'none')
                                        .clone().wrapAll("<div/>").parent().html() + "<label class='editor_label' data-type='removeSpan'>" + dataLabel + "</label>";
                                    }
                                    
                                    $(this).replaceWithAndReturnNew("<span>" + part + "</span>");
                                    
                                    var lastOpt = _.last(dsl);
                                    if (_.isEqual(dataLabel, lastOpt)) {
                                        self.cnt++;
                                    }
                                    
                                } else {
                                    //{{check}} 일경우
                                    if (dsl.length == 1) {
                                        
                                        var id = dsl[0].split(':')[1];
                                        
                                        part += $(convertFormToSpan($form))
                                        .attr({
                                            'id': (id) ? id : $(this).attr('data-id') ? $(this).attr('data-id') : 'editorForm_' + self.getUnusedSeqNum(self.components, this) + '_check',
                                            'name': $(this).attr('name') ? $(this).attr('name') : 'editorForm_' + self.getUnusedSeqNum(self.components, this) + '_check',
                                            'data-label': '',
                                            'value': (id) ? id : 'none',
                                            'checked': $(this).attr('data-select') == 'none'
                                        })
                                        .clone().wrapAll("<div/>").parent().html();
                                    } else {
                                        for (var i = 1; i < dsl.length; i++) {
                                            var dslStr = dsl[i].split(':');
                                            var label = dslStr[0];
                                            var id = dslStr[1];
                                            
                                            part += $(convertFormToSpan($form))
                                            .attr({
                                                'id': (id) ? id : $(this).attr('data-id') ? $(this).attr('data-id') : 'editorForm_' + self.getUnusedSeqNum(self.components, this) + '_' + dsl[i],
                                                'name': $(this).attr('name') ? $(this).attr('name') : 'editorForm_' + self.getUnusedSeqNum(self.components, this) + '_' + dslStr[0],
                                                'data-label': label,
                                                'value': (id) ? id : dsl[i]
                                            }).attr('checked', $(this).attr('data-select-option') == "true" ? true : false)
                                            .clone().wrapAll("<div/>").parent().html() + "<label class='editor_label' data-type='removeSpan'>" + dslStr[0] + "</label>";
                                        }
                                    }
                                    $(this).replaceWithAndReturnNew("<span>" + part + "</span>");
                                    self.cnt++;
                                }
                            } else {
                                $(this).attr("disabled", false);
                                $(this).next().attr("data-type", "removeSpan");
                            }
                        } else if (parseKey.search('period') >= 0) {
                            part = '';
                            for (var i = 0; i < 2; i++) {
                                part += $(convertFormToSpan($form))
                                .attr({
                                    'id': $(this).attr('data-id') ? $(this).attr('data-id') : 'editorForm_' + self.getUnusedSeqNum(self.components, this),
                                    'name': $(this).attr('data-id') ? $(this).attr('data-id') : 'editorForm_' + self.getUnusedSeqNum(self.components, this)
                                })
                                .clone().wrapAll("<div/>").parent().html();
                                if (i == 0) {
                                    part += " ~ ";
                                }
                                self.cnt++;
                            }
                            //$(this).replaceWithAndReturnNew("<span data-type='period' data-dsl='{{period}}' data-value=''>"+part+"</span>");
                            $(this).replaceWithAndReturnNew("<span data-type='period' data-value=''>" + part + "</span>");
                        } else if (parseKey.search('time') >= 0) {
                            // {{time}} 으로 들어온 문자를 시간선택 마크업으로 변환
                            hours = [];
                            minutes = [];
                            time = [];
                            for (var i = 0; i < 24; i++) {
                                hours.push((i < 10) ? "0" + i : i + "");
                            }
                            
                            for (var k = 0; k < 60; k++) {
                                minutes.push((k < 10) ? "0" + k : k + "");
                            }
                            time.push(hours);
                            time.push(minutes);
                            part = '';
                            for (var i = 0; i < 2; i++) {
                                var selectOptions = '';
                                $.each(time[i], function (k, v) {
                                    selectOptions += '<option value="' + v + '">' + v + '</option>';
                                });
                                
                                part += $(convertFormToSpan($form))
                                .attr({
                                    'id': $(this).attr('data-id') ? $(this).attr('data-id') : 'editorForm_' + self.getUnusedSeqNum(self.components, this),
                                    'name': $(this).attr('data-name') ? $(this).attr('data-name') : 'editorForm_' + self.getUnusedSeqNum(self.components, this),
                                    'data-select-type': (i == 0) ? 'hour' : 'minute',
                                    'class': 'editor_slt'
                                })
                                .append(selectOptions)
                                .clone().wrapAll("<div/>").parent().html();
                                if (i == 0) {
                                    part += i18n["시"] + " ";
                                } else {
                                    part += i18n["분"] + " ";
                                }
                                self.cnt++;
                            }
                            $(this).replaceWithAndReturnNew("<span data-type='time' data-value=''>" + part + "</span>");
                        } else if (parseKey.search('select') >= 0) {
                            //{{select}} 으로 들어온 문자를 시간선택 마크업으로 변환(선택된 값 세팅 포함)
                            
                            hours = [];
                            minutes = [];
                            time = [];
                            for (var i = 0; i < 24; i++) {
                                hours.push((i < 10) ? "0" + i : i + "");
                            }
                            
                            for (var k = 0; k < 60; k++) {
                                minutes.push((k < 10) ? "0" + k : k + "");
                            }
                            
                            part = '';
                            var selectOptions = '';
                            
                            selectVal = $(this).attr('data-value');
                            if ($(this).attr('data-select-type') == "hour") {
                                $.each(hours, function (k, v) {
                                    var selectStr = '';
                                    if (selectVal == v) {
                                        selectStr = 'selected';
                                    }
                                    selectOptions += '<option value="' + v + '" ' + selectStr + '>' + v + '</option>';
                                });
                                part = $(convertFormToSpan($form))
                                .attr({
                                    'id': $(this).attr('data-id') ? $(this).attr('data-id') : 'editorForm_' + self.getUnusedSeqNum(self.components, this),
                                    'name': $(this).attr('data-name') ? $(this).attr('data-name') : 'editorForm_' + self.getUnusedSeqNum(self.components, this),
                                    'data-select-type': 'hour'
                                })
                                .append(selectOptions)
                                .clone().wrapAll("<div/>").parent().html();
                                self.cnt++;
                            } else {
                                $.each(minutes, function (k, v) {
                                    var selectStr = '';
                                    if (selectVal == v) {
                                        selectStr = 'selected';
                                    }
                                    selectOptions += '<option value="' + v + '" ' + selectStr + '>' + v + '</option>';
                                });
                                part = $(convertFormToSpan($form))
                                .attr({
                                    'id': $(this).attr('data-id') ? $(this).attr('data-id') : 'editorForm_' + self.getUnusedSeqNum(self.components, this),
                                    'name': $(this).attr('data-name') ? $(this).attr('data-name') : 'editorForm_' + self.getUnusedSeqNum(self.components, this),
                                    'data-select-type': 'minute'
                                })
                                .append(selectOptions)
                                .clone().wrapAll("<div/>").parent().html();
                                self.cnt++;
                            }
                            $(this).replaceWithAndReturnNew(part);
                        } else if (parseKey.search('cSel') >= 0) {
                            var dsl = getDsl(parseKey);
                            
                            var dataType, id;
                            optionString = "";
                            
                            // {{cSel:test}} 일 경우
                            if (dsl[0].search(":") >= 0) {
                                dataType = dsl[0].substring(0, dsl[0].search(":"));
                                id = dsl[0].substring(dsl[0].search(":") + 1);
                            }
                            
                            selectVal = $(this).attr('data-selectval');
                            
                            for (var i = 1; i < dsl.length; i++) {
                                var selectStr = '';
                                
                                if (dsl[i] == selectVal) {
                                    selectStr = "selected";
                                }
                                optionString += "<option value='" + dsl[i] + "' " + selectStr + ">" + dsl[i] + "</option>";
                            }
                            if (autoType) {
                                part = $(convertFormToSpan($form)).attr({
                                    "id": (id) ? id : "",
                                    "name": (id) ? id : "",
                                    "data-selectval": selectVal
                                }).append(optionString).wrapAll("<div/>").parent().html();
                            } else {
                                part = $(convertFormToSpan($form)).attr({
                                    "id": (id) ? id : "",
                                    "name": $(this).attr('data-name') ? $(this).attr('data-name') : 'editorForm_' + self.getUnusedSeqNum(self.components, this),
                                    "data-selectval": selectVal
                                }).append(optionString).wrapAll("<div/>").parent().html();
                            }
                            
                            self.cnt++;
                            $(this).replaceWithAndReturnNew(part);
                            
                        } else if (parseKey.search('cOrg') >= 0) {
                            var orgType = "list";
                            
                            parseKey.replace(/\$department\$/g, function (n) {
                                orgType = "department";
                                parseKey = parseKey.replace(n, '');
                            });
                            
                            var id = parseKey.split(':')[1];
                            
                            selectVal = $(this).attr('data-selected');
                            var cOrgHtml = "";
                            if (selectVal) {
                                _.each(selectVal.split(','), function (item) {
                                    if (item != '') {
                                        var nameAndId = item.split('#');
                                        var selectTargetValId = nameAndId[1] == undefined ? '' : nameAndId[1];
                                        if (GO.util.isMobile()) {
                                            // 모바일이랑 web 이랑 html 이 다르다.
                                            cOrgHtml += "<li data-id='" + selectTargetValId + "'><span class='name'>" + nameAndId[0] + "</span><span class='btn_wrap'><span title='삭제' class='ic ic_del'></span></span></li>"
                                        } else {
                                            cOrgHtml += "<li data-id='" + selectTargetValId + "'><span class='name'>" + nameAndId[0] + "</span><span class='btn_wrap'><span title='삭제' class='ic_classic ic_del'></span></span></li>"
                                        }
                                    }
                                }, this);
                            }
                            cOrgHtml += "<li class='creat'>";
                            cOrgHtml += "<span class='btn_wrap' id='" + id + '_Add' + "'>";
                            cOrgHtml += " <span class='ic_form ic_addlist'></span>";
                            cOrgHtml += "<span class='txt'>";
                            cOrgHtml += i18n['추가'];
                            cOrgHtml += "</span></span>";
                            cOrgHtml += "</li>";
                            
                            part = $(convertFormToSpan($form))
                            .attr({
                                "id": (id) ? id : "",
                                "data-selected": (selectVal) ? selectVal : "",
                                "data-orgtype": orgType
                            }).append(cOrgHtml).wrapAll("<div/>").parent().html();
                            self.cnt++;
                            $(this).replaceWithAndReturnNew(part);
                            
                        } else if (parseKey.search('calendar') >= 0) {
                            var width = "";
                            var defaultstr = "";
                            var pattern = /(\$require\$)/gi;
                            var isRequire = false;
                            if (pattern.test(parseKey)) {
                                isRequire = true;
                                parseKey = parseKey.replace(pattern, '');
                            }
    
                            parseKey.replace(/\$width:([0-9]*)\$/g, function (n, widthKey) {
                                width = widthKey;
                                parseKey = parseKey.replace(n, '');
                            });
    
                            parseKey.replace(/\$defaultstr:(.*)\$/g, function (n, str) {
                                defaultstr = str;
                                parseKey = parseKey.replace(n, '');
                            });
    
                            var dsl = getDsl(parseKey, ':');
                            var convertDate;
                            var componentId = (dsl[1]) ? dsl[1] : $(this).attr('data-id') ? $(this).attr('data-id') : 'editorForm_' + self.getUnusedSeqNum(self.components, this);
                            try {
                                convertDate = $(this).attr('data-value') ? GO.util.basicDate2($(this).attr('data-value').split('(')[0], null) : '';
                            } catch (e) {}

                            var convertTemplate = $(this).replaceWithAndReturnNew(convertFormToSpan($form))
                            .attr({
                                'id': componentId,
                                'name': componentId,
                                'data-value': convertDate ? convertDate : $(this).html(),
                                'data-require': isRequire,
                                'placeholder': isRequire ? i18n["필수"] : "",
                                'data-width': width,
                                'data-defaultstr': defaultstr,
                                'data-editable': $(this).attr('data-editable') == "true",
                                'value': convertDate ? convertDate : $(this).html()
                            });
    
                            if (isAdmin == false && $(this).attr('data-editable') == "false") {
                                convertTemplate.attr("readonly", true);
                                convertTemplate.html($(this).html());
                            }
                            self.cnt++;
                        } else {
                            var maxlength = "";
                            var width = "";
                            var defaultstr = "";
                            var editorskin = "detail";
                            var pattern = /(\$require\$)/gi;
                            var editablePattern = /(\$adminedit\$)/gi;
                            var isRequire = false;
                            if (pattern.test(parseKey)) {
                                isRequire = true;
                                parseKey = parseKey.replace(pattern, '');
                            }
                            
                            if (editablePattern.test(parseKey)) {
                                parseKey = parseKey.replace(editablePattern, '');
                            }
                            
                            parseKey.replace(/\$maxlength:([0-9]*)\$/g, function (n, lengthKey) {
                                maxlength = lengthKey;
                                parseKey = parseKey.replace(n, '');
                            });
                            
                            parseKey.replace(/\$width:([0-9]*)\$/g, function (n, widthKey) {
                                width = widthKey;
                                parseKey = parseKey.replace(n, '');
                            });
                            
                            parseKey.replace(/\$simple\$/g, function (n) {
                                editorskin = "simple";
                                parseKey = parseKey.replace(n, '');
                            });
                            
                            parseKey.replace(/\$defaultstr:(.*)\$/g, function (n, str) {
                                defaultstr = str;
                                parseKey = parseKey.replace(n, '');
                            });
                            var viewValue = $(this).attr('data-value');
                            viewValue = viewValue && viewValue.replace(/''/gi, "\"");
                            var dsl = getDsl(parseKey, ':');
                            
                            // $(this).attr('data-value') ? $(this).attr('data-id') : 'editorForm_' + self.cnt 으로 설정한 이유.(GO-25740)
                            // 재기안시 editorForm으로 다시 input의 name과 id를 만듬
                            // 줄추가 플러그인의 name생성 규칙은 editorForm_x_y 이기때문에 다시 id와 name을 새로 부여하면
                            // document.js 의 onNewFormMode 함수에서 doc.variable을 세팅하는 과정에서 value들이 꼬인다.
                            // onNewFormMode에서 재기안시 doc.variable을 세팅하지 않을수도 있지만 연동문서의 재기안시 문제가 발생할 소지가 있음.(연동문서의 재기안을 풀어준사이트있음)
                            // convertHtml에서 재기안을 판단하는것이 data-value값의 존재유무이기 때문에 value가 있으면 기존의 data-id와 data-name을 그대로 쓴다.
                            
                            var isExcludeInputMask = false;
                            if (parseKey.search('currency') >= 0 || parseKey.search('cSum') >= 0) {
                                isExcludeInputMask = true;
                            }
                            
                            var componentId = (dsl[1]) ? dsl[1] : $(this).attr('data-id') ? $(this).attr('data-id') : 'editorForm_' + self.getUnusedSeqNum(self.components, this);
                            var convertTemplate = $(this).replaceWithAndReturnNew(convertFormToSpan($form))
                            .attr({
                                'id': componentId,
                                'name': componentId,
                                'data-value': $(this).attr('data-value') ? $(this).attr('data-value') : $(this).html(),
                                'data-require': isRequire,
                                'data-maxlength': maxlength,
                                'data-width': width,
                                'data-defaultstr': defaultstr,
                                'data-editable': $(this).attr('data-editable') == "true",
                                'placeholder': (isRequire && checkRequirePlaceHolder(isExcludeInputMask)) ? i18n["필수"] : "",
                                'value': $(this).attr('data-value') ? viewValue : $(this).html()
                            });
                            // var fontSize = $(this).css('font-size');
                            // if (fontSize) convertTemplate.css('font-size', fontSize);
                            
                            if (isAdmin == false && $(this).attr('data-editable') == "false") {
                                convertTemplate.attr("readonly", true);
                                convertTemplate.html($(this).html());
                            }
                            
                            //테이블에 에디터가 들어가있을때 에디터높이를 감싸고 있는 td에 맞춤
                            if ($(convertTemplate)[0].nodeName == "SPAN" && $(convertTemplate).attr('data-dsl').search('editor') >= 0) {
                                if ($(convertTemplate).parent().height() > 0) {
                                    convertTemplate.height($(convertTemplate).parent().height());
                                } else {
                                    convertTemplate.height(400);
                                }
                                
                                //simple,detail 스킨종류 세팅
                                convertTemplate.attr("data-skintype", editorskin);
                            }
                            /*
                             * GO-19443 전자결재 양식관련 컴포넌트 추가 : 임시저장, 문서수정 할때 호출됨.(기안시에는 불리지 않음. api호출시 데이터들을 input등의 입력할수 있는 마크업으로 변환.)
                             */
                            if ($(convertTemplate)[0].nodeName == "SPAN" && $(this).attr('data-type') && $(this).attr('data-type').search('span') >= 0) {
                                convertTemplate.html(viewValue);
                            }
                            
                            if (convertTemplate[0].nodeName == "TEXTAREA") {
                                convertTemplate.text(viewValue); //ie8에서 에러나기때문에 input에서는 넣으면 안됨.
                            }
                            
                            self.cnt++;
                        }
                    });
                    result += $(v).clone().html();
                    
                    function getDsl(key, patten) {
                        if (!patten) {
                            patten = '_';
                        }
                        return key.split(patten);
                    }
                });
                
                return result;
                
                function getUnusedSeqNum(components, el) {
                    while (true) {
                        var isUsed = false;
                        components.each(function validateUsedDataId(k, v) {
                            if (el != v) {
                                if (($(v).attr('data-id') == 'editorForm_' + this.cnt) ||
                                    ($(v).attr('data-name') == 'editorForm_' + this.cnt)) {
                                    isUsed = true;
                                }
                            }
                        });
                        
                        if (isUsed) {
                            this.cnt++;
                        } else {
                            return this.cnt;
                        }
                    }
                }
            }
        };
    });

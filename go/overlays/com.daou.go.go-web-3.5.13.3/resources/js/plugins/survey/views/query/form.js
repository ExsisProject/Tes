(function() {
    
    define([
        "underscore", 
        "backbone", 
        "app", 
        "survey/models/query", 
        "survey/libs/util", 
        "hgn!survey/templates/query_form", 
        "helpers/form", 
        "i18n!survey/nls/survey", 
        "jquery.go-popup",
        "jquery.go-preloader"
    ], 
    
    function(
        _, 
        Backbone, 
        GO, 
        SurveyQueryModel, 
        SurveyUtil,
        QueryFormTpl, 
        FormHelper, 
        SurveyLang
    ) {
        
        var MIN_OF_QUESTION_LENGTH = 2, 
            MAX_OF_QUESTION_LENGTH = 255, 
            MAX_OF_QUERYCASE = 50, 
            QueryFormView;
        
        QueryFormView = Backbone.View.extend({
            type: 'form', 
            tagName: 'li',
            
            events: {
                "change select[name=query_type]": "changeQueryTypeOption", 
                "change select[name=query_subtype]": "changeSubQueryTypeOption", 
                "click .btn-add-querycase": "addQueryCase", 
                "click .btn-add-querycase-etc": "addQueryCaseEtc", 
                "click .btn-del-querycase": "removeQueryCase", 
                "click .btn-submit": "saveQuery", 
                "click .btn-cancel": "cancel",
                "blur .querycase-item" : "setSelectQueryData"
            }, 
            
            initialize: function() {
                if(!this.model) {
                    this.model = new SurveyQueryModel();
                }
                this.originModel = this.model.clone();
                this.$el.data('view', this);
                // 현재 생성 및 수정중인 폼을 찾기 위해 클래스를 추가
                this.$el.addClass('query-item-editing');
            }, 
            
            render: function() {
                this.$el.append(QueryFormTpl({
                    "question": this.model.get('question'), 
                    "required?": this.model.isRequired() || false, 
                    "max_of_selectable": this.model.getMaxOfSelectable(), 
                    "label": {
                        "question": SurveyLang["질문"], 
                        "query_type": SurveyLang["설문 문항 타입"], 
                        "query_case": SurveyLang["답변"], 
                        "required": SurveyLang["필수 답변"], 
                        "max_of_selectable": SurveyLang["최대 선택 갯수"], 
                        "query_type_select": SurveyLang["선택형"], 
                        "query_type_text": SurveyLang["텍스트형"],
                        "query_type_score": SurveyLang["점수형"], 
                        "finish": SurveyLang["완료"], 
                        "cancel": SurveyLang["취소"],
                        "unlimited": SurveyLang["제한없음"]
                    }
                }));
                
                this.initQueryCase();
            }, 
            
            initQueryCase: function() {
                if(!this.model.isNew()) {
                    this.$el.find('select[name=query_type]').val(this.model.getGroupedType());
                }
                
                this.setSubQueryTypeOption();
                
                if(this.$el.find('.querycase-item-etc').length > 0) {
                    this.$el.find('.btn-add-querycase-etc').hide();
                }
            }, 
            
            // 설문 
            setSelectQueryData : function(){
                var caseData = [],
                    qtype = this.getQueryType();
                
                caseData = getSelectQueryData.call(this, qtype);
                
                this.model.set({"type" : qtype}, {silent: true});
                this.model.set({"cases" : caseData}, {silent: true});
            },
            
            saveQuery: function() {
                var self = this, 
                    defer = $.Deferred(), 
                    caseData = [], 
                    qtype = this.getQueryType(),
                    $qItem = this.$el.find('.querycase-item'); 
                
                // GO-26748 XSS 대응
                $qItem.each(function(i, el) {
                    var $el = $(el), 
                        $desc = $el.find('.querycase-desc'), 
                        desc = $desc.val();
                    
                    // GO-26748 XSS 대응
                    if (GO.util.isXSSPettern(desc)) {
                    	$desc.val(GO.util.escapeXssToBlank(desc));
                    }                    
                });
                
                if(qtype === 'text' || qtype === 'textarea') {
                    caseData.push({ "description": '', "selected": true, "answer": '', "count": 0, "caseType": 'input', "seq": 0});
                } else if(qtype === 'score') {
                    var score = parseInt(this.$el.find('select[name=query_subtype]').val());
                    for(var i=0; i<score; i++) {
                        caseData.push({ "description": (i + 1) + '', "selected": false, "answer": '', "count": 0, "caseType": 'radio', "seq": i});
                    }
                } else {
                    caseData = getSelectQueryData.call(this, qtype);
                }
                
                if(validateForm(this)) {
                    var preloader = $.goPreloader();
                    
                    preloader.render();
                    
                    this.model.save({
                        "type": qtype, 
                        "required": this.$el.find('input[name=required]').is(':checked'), 
                        "question": this.$el.find('input[name=question]').val().trim(), 
                        "cases": caseData, 
                        "responseCount": 0, 
                        "maxOfSelectable": parseInt(qtype === 'mselect' ? $("select#maxOfSelectable > option:selected").val() : 0) || 0
                    }, {
                        success: function(model) {
                            self.$el.trigger('click:edit-end', [model]);
                            defer.resolve();
                        },
                        error: function(resp) {
                            SurveyUtil.raiseRequestError();
                            defer.reject();
                        }
                    }).done(function(){
                        preloader.release();
                    });
                } else {
                    defer.reject();
                }
                
                return defer;
            }, 
            
            cancel: function() {
                this.model = this.originModel;
                
                this.$el.trigger('click:edit-end', [this.model]);
                
                if(this.model.isNew()) {
                    this.remove();
                }
            }, 
            
            setSubQueryTypeOption: function() {
                var 
                    queryType = this.$el.find('select[name=query_type]').val(), 
                    $subType = this.$el.find('select[name=query_subtype]');
                
                $subType
                    .empty()
                    .append(makeSubQueryTypeOptions(this.$el.find('select[name=query_type]').val()));
                
                if(!this.model.isNew() && this.model.getGroupedType() === queryType) {
                    $subType.val(getSubTypeFromQueryModel(this.model));
                }
                
                this.setQueryCaseList();
            }, 
            
            setQueryCaseList: function(type) {
                var html = this.getQueryCaseHtml(), 
                    container = this.$el.find('.query-answer-container');
                
                container.empty();
                
                if(html) {
                    container.append(html);
                } 
                
                this.toggleAnswerRow(html);
                
                if(this.getQueryType() === 'mselect') {
                    this.$el.find('.mselect-only').show();
                    this.$el.find('.querycase-item').each(function(i, value) {
                        var selectVal = i + 1;
                        $('#maxOfSelectable').append('<option value="' + selectVal + '">' + selectVal + '</option>');
                    });
                    $('select#maxOfSelectable > option[value="' + this.model.get('maxOfSelectable') + '"]').attr('selected','true');
                } else {
                    this.$el.find('.mselect-only').hide();
                }
            },
            
            toggleAnswerRow: function(content) {
                var target = this.$el.find('.query-answer-row');
                
                if(content) {
                    target.show();
                } else {
                    target.hide();
                }
            }, 
            
            getNextQueryCaseIndex: function() {
                return this.$el.find('.querycase-item').length + 1;
            }, 
            
            getPresentQueryCaseIndex: function() {
                return this.$el.find('.querycase-item').length;
            },
            
            addQueryCase: function(e) {
                var $target = $(e.currentTarget), 
                    $li = $target.closest('li'), 
                    container = $target.closest('ul'), 
                    inputType = convertCaseTypeToInputType(container.data('type'));
                
                if(this.$el.find('.querycase-item').length < MAX_OF_QUERYCASE) {
                    $li.before(makeSelectTypeQueryCase(
                        inputType, 
                        this.getNextQueryCaseIndex(), {
                            "caseType": $target.hasClass('btn-add-querycase-etc') ? 'input' : inputType
                        }
                    ));
                    this.$el.find('input[name="case_' + this.getPresentQueryCaseIndex() +'"]').focus();
                    if(this.getQueryType() === 'mselect'){
                        $('#maxOfSelectable').append('<option value="'+ this.getPresentQueryCaseIndex() +'">'+ this.getPresentQueryCaseIndex() +'</option>');                   
                    }
                } else {
                    if($target.hasClass('btn-add-querycase-etc')){
                        this.$el.find('.btn-add-querycase-etc').show();
                    } 
                    $.goAlert(GO.i18n(SurveyLang["문항 등록 0개 초과 메시지"], {"arg1": MAX_OF_QUERYCASE}));
                }
                
            }, 
            
            addQueryCaseEtc: function(e) {
                if(this.$el.find('.querycase-item-etc').length < 1) {
                    this.$el.find('.btn-add-querycase-etc').hide();
                    this.addQueryCase(e);
                }
            }, 
            
            removeQueryCase: function(e) {
                var li = $(e.currentTarget).closest('li');
                
                if(li.hasClass('querycase-item-etc')) {
                    this.$el.find('.btn-add-querycase-etc').show();
                }
                
                $('#maxOfSelectable option:last').remove();
                
                li.remove();
            }, 
            
            getQueryCaseHtml: function() {
                var type = this.getQueryType(),
                    html = '';
                
                switch(type) {
                case 'select':
                case 'mselect':
                    html = makeSelectTypeQuery(type, this.model);
                    break;
                case 'text':
                case 'textarea':
                    break;
                default:
                    break;
                }
                
                return html;
            }, 
            
            getQueryType: function() {
                var qtype = this.$el.find('select[name=query_type]').val();
                return (qtype === 'score' ? qtype : this.$el.find('select[name=query_subtype]').val());
            }, 
            
            changeQueryTypeOption: function(e) {
                this.setSubQueryTypeOption();
            },
            
            changeSubQueryTypeOption: function(e) {
                this.setQueryCaseList();
            }
        });
        
        function getSelectQueryData(qtype){
            var caseData = [];
            
            this.$el.find('.querycase-item').each(function(i, el) {
                var $el = $(el), 
                    h = { "description": '', "selected": false, "answer": '', "count": 0, "caseType": $el.data('type'), "seq": i};
                    
                if(qtype === 'select' || qtype === 'mselect') {
                    h.description = $el.find('input[type=text], textarea').val();
                } else if(qtype === 'score'){
                    h.description = (i + '');
                }
                
                caseData.push(h);
            });
            
            return caseData;
        }
        
        function makeSubQueryTypeOptions(type) {
            var result = [],
                queryTypeList = {
                    "select": {"select": SurveyLang["하나만 선택"], "mselect": SurveyLang["복수 선택"]}, 
                    "text": {"text": SurveyLang["단문 입력"], "textarea": SurveyLang["장문 입력"]}, 
                    "score": {"3": printScoreText(3), "5": printScoreText(5), "7": printScoreText(7), "10": printScoreText(10)}
                };
            
            _.each(queryTypeList[type], function(label, value) {
                result.push('<option value="' + value + '">' + label + '</option>');
            });
            
            return result.join("\n");
        }
        
        function printScoreText(score) {
            return GO.i18n(SurveyLang["점수형 점수"], {"arg1": score});
        }
        
        function makeSelectTypeQuery(type, model) {

            var html = [],
                caseData = model.getCases(),
                inputType = convertCaseTypeToInputType(type);
            
            html.push('<ul class="wrap_answer" data-type="'+type+'">');
            
            if(model.isGroupOfSelect()) {
                _.each(caseData, function(item, i) {
                    html.push(makeSelectTypeQueryCase(inputType, i + 1, item));
                });                
            }
            
                html.push('<li>');
                    html.push('<span class="btn-add-querycase wrap_txt disable"><input type="'+inputType+'" name="'+inputType+'" value="-1" disabled="disabled" /><input class="txt wfix_max" type="text" readonly="readonly" value="'+SurveyLang["선택형 문항 추가 가이드 텍스트"]+'"></span>');
                html.push('</li>');
                
                html.push(makeAddQueryCaseEtcBtn());
            html.push('</ul>');
            
            return html.join("\n");
        }
        
        function makeSelectTypeQueryCase(inputType, index, caseData) {
            var html = [], 
                value = caseData.description || '', 
                isUserInput = (caseData.caseType === 'input');
            
            if(isUserInput && !value) {
                value = SurveyLang["기타"];
            }
            
            html.push('<li class="querycase-item' + (isUserInput ? ' querycase-item-etc etc' : '') + '" data-type="'+caseData.caseType+'">');
                html.push('<span class="wrap_txt">');
                    html.push('<input type="'+inputType+'" name="'+inputType+'" value="'+index+'"/>');
                    html.push('<input class="txt wfix_max querycase-desc" type="text" name="case_' + index + '" value="' + value +'">');
                html.push('</span>');
                html.push('<span class="wrap_btn_m btn-del-querycase"><span class="ic_classic ic_del"></span></span>');
            html.push('</li>');
            
            return html.join("\n");
        }
        
        function convertCaseTypeToInputType(caseType) {
            return (caseType === 'mselect' ? 'checkbox' : 'radio');
        }
        
        function getSubTypeFromQueryModel(model) {
            var type = model.get('type');
            
            if(model.isScoreType()) {
                type = '' + model.getCases().length;
            } 
            
            return type;
        }
        
        function makeAddQueryCaseEtcBtn() {
            return '<li class="creat"><span class="btn-add-querycase-etc btn_wrap btn_creat"><span class="ic_form ic_addlist"></span><span class="txt">'+SurveyLang["기타 추가"]+'</span></span></li>';
        }
        
        function validateForm(view) {
            var qtype = view.getQueryType(), 
                $question = view.$el.find('input[name=question]'), 
                question = $question.val(),
                isBanString = false;
            
            if(!isValidQuestion(question)) {
                FormHelper.printError($question, SurveyUtil.getStringLengthError(MIN_OF_QUESTION_LENGTH, MAX_OF_QUESTION_LENGTH));
                return false;
            }
            
            // GO-26748 XSS 대응
            if (GO.util.isXSSPettern(question)) {
            	$question.val(GO.util.escapeXssToBlank(question));
            }
            
            if(_.contains(['select', 'mselect'], qtype)) {
                var $qItem = view.$el.find('.querycase-item'), 
                    roofRes = true;
                
                if($qItem.length < 1) {
                    $.goAlert(SurveyLang["등록 문항 없음 메시지"]);
                    return false;
                }
                
                $qItem.each(function(i, el) {
                    var $el = $(el), 
                        $desc = $el.find('.querycase-desc'), 
                        desc = $desc.val();
                    
                    if(!desc || (desc && (desc.length < 1 || desc.length > 64))) {
                        FormHelper.printError($desc, SurveyUtil.getStringLengthError(1, 64));
                        roofRes = false;
                    }
                });

                if (!roofRes) return false;
            }
            
            return true;
        }
        
        function isValidQuestion(question) {
            if(!question) return false;
            if(question.length < MIN_OF_QUESTION_LENGTH) return false;
            if(question.length > MAX_OF_QUESTION_LENGTH) return false;
            
            return true;
        }
        
        return QueryFormView;

    });
    
})();
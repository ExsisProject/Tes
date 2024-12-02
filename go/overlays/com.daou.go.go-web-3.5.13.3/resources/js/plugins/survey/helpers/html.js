(function() {
    
    define(["app", "i18n!nls/commons", "i18n!survey/nls/survey"], function(GO, CommonLang, SurveyLang) {
        return SurveyHtmlHelper = {
        	getRespStatusText: function(status) {
        		return {'done': SurveyLang["참여완료"], 'none': SurveyLang["미참여"], 'temp': SurveyLang["임시저장"]}[status];
        	}, 
        	
            getStatusTagByResponse: function(status) {
                var status = status || 'none', 
                    classname = {'done': 'finish', 'none': 'notyet', 'temp': 'temp'}[status];
                
                return this.getStatusTag(classname, this.getRespStatusText(status));
            }, 
            
            getStatusTagByStatus: function(status) {
                var attr = {
                    "ready": { "classname": 'temp', "text": SurveyLang["준비중"] }, 
                    "temp": { "classname": 'temp', "text": SurveyLang["임시저장"] },
                    "progress": { "classname": 'ongoing', "text": SurveyLang["진행중"] },
                    "stop": { "classname": 'pause', "text": SurveyLang["중지"] },
                    "finished": { "classname": 'finish', "text": SurveyLang["완료"] }
                }[status];
                
                return this.getStatusTag(attr.classname, attr.text, {"data-status": status});
            }, 
            
            getStatusTag: function(classname, text, attrs) {
            	attrs = attrs || {};
            	
            	var buff = [];
            	
            	_.each(attrs, function(v, k) {
            		buff.push(k + '="' + v + '"');
            	});
            	
                return '<span class="state ' + classname + '"' + (buff.length > 0 ? ' ' + buff.join(' '): '') + '>' + text + '</span>';
            }, 
            
            getReferTag: function() {
                return '<span class="refer">'+SurveyLang['참조']+'</span>' ;
            }, 
            
            getSurveyPeriod: function(model) {
                return [getSurveyTimeFormat(model.get('startTime')), getSurveyTimeFormat(model.get('endTime'))].join(' ~ ');
            }, 
            
            getSelectUserInput: function(inputType, name, caseData) {
                var html = [], 
                	checked = caseData.selected ? ' checked="checked"' : '';
                
                html.push('<span class="wrap_txt">');
                    html.push('<input type="'+inputType+'" name="'+name+'" value="'+caseData.seq+'"'+ checked +'/>');
                    html.push('<span class="wrap_label txt">' + caseData.description + '</span>');
                    html.push('<input class="txt wfix_max" type="text" name="answer" value="'+ (caseData.answer || '') +'">');
                html.push('</span>');
            
                return html.join("\n");
            }, 
            
            getQueryViewTemplate: function(model, wrapTag) {
                var html = [], 
                    tag = wrapTag || 'ul';
                
                html.push('<span class="question">');
                	html.push('<span class="seq">' + model.getQueryNum() +'</span>. ');
                	if(model.isRequired()) {
                		html.push('<span class="necess">[' + SurveyLang["필수"] + ']</span>');
                	}
                	html.push(GO.util.textToHtml(model.get('question')));
                html.push('</span>');
                html.push('<'+tag+' class="wrap_answer"></'+tag+'>');
                
                return html.join("\n");
            }
        };
        
        function getSurveyTimeFormat(datestr) {
            return moment(datestr,'YYYY-MM-DD').format('YYYY-MM-DD');
        }
    });
    
})()
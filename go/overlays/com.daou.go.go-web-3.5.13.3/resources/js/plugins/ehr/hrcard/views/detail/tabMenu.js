define([
        "backbone",
        "app",
        "hgn!hrcard/templates/detail/tabMenu",
        "i18n!hrcard/nls/hrcard"
        ],
function(
		Backbone,
		GO,
		TabTpl,
		hrcardLang
		) {
	//다국어
	var lang = {
		label_title		: hrcardLang["인사정보"],
		label_basic		: hrcardLang["기본"],
		label_detail	: hrcardLang["신상"],
		label_duty		: hrcardLang["직무/담당"],
		label_appoint	: hrcardLang["발령"],
		label_career	: hrcardLang["경력"],
		label_reward	: hrcardLang["포상/징계"],
		label_evaluation: hrcardLang["인사평가"],
		label_edu		: hrcardLang["교육"],
		label_license	: hrcardLang["자격"],
		label_language	: hrcardLang["어학"],
		label_military	: hrcardLang["병역"],
		label_trip		: hrcardLang["해외출장"],
		label_academic	: hrcardLang["학력"],
		label_family	: hrcardLang["가족"],
		label_open		: hrcardLang["펼쳐보기"]
	};
	
	var menuRoot = 'app/ehr/hrcard';
	
	var layoutView = Backbone.View.extend({
        initialize : function(options) {
			this.options = options || {};
       		this.userid = this.options.userid; 
        },
        render : function(args) {
            
            var isActive = function() {
                if(args == this.id) return true;
                return false;
            };
            
            this.$el.html(TabTpl({
                contextRoot : GO.contextRoot,
                lang : lang,
                tabs : [{
                    id : "basic",
                    name : lang['label_basic']
                },{
                    id : "detail",
                    name : lang['label_detail']
                },{
                    id : "duty",
                    name : lang['label_duty']
                },{
                	id : "appoint",
                    name : lang['label_appoint']
                },{
                	id : "career",
                    name : lang['label_career']
                },{
                	id : "reward",
                	name : lang['label_reward']
                },{
                	id : "evaluation",
                	name : lang['label_evaluation']
                },{
                	id : "edu",
                	name : lang['label_edu']
                },{
                	id : "license",
                	name : lang['label_license']
                },{
                	id : "language",
                	name : lang['label_language']
                },{
                	id : "military",
                	name : lang['label_military']
                },{
                    id : "abroad",
                    name : lang['label_trip']
                },{
                    id : "academic",
                    name : lang['label_academic']
                },{
                    id : "family",
                    name : lang['label_family']
                }]
            }));
            return this;
        }
    });
	
	return layoutView;
	
});
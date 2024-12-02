(function() {
	define([
    	"jquery",
		"underscore", 
        "backbone", 
        "app", 
        "hgn!admin/templates/account_detail_appr_absence",
        "hgn!approval/templates/add_org_member",
		"i18n!nls/commons",
        "i18n!approval/nls/approval",
        "jquery.go-orgslide",
        "jquery.go-popup",
        "jquery.ui",
        "jquery.go-validation"
    ], 
    
    function(
        $,  
		_, 
        Backbone, 
        App, 
        AbsenceSettingTpl,
        tplAddOrgMember,
        commonLang,
		approvalLang
    ) {	

		var AbsenceSettingView = Backbone.View.extend({
    		el : "#absenceSetting",
			events: {
				"click .creat" :"_showOrgSlider"
			},
	    	
    		initialize: function(options) {
    			this.release();
    			this.accountId = options.accountId;
    		},
			
    		render : function(){
				var lang = {
						"부재 기간" : approvalLang['부재 기간'],
						"대결자 선택" : approvalLang['대결자 선택'],
						"부재 사유" : approvalLang['부재 사유'],
						"대결자" : approvalLang['대결자'],
						"취소" : commonLang["취소"]
				};
				
				var tpl = AbsenceSettingTpl({
					lang : lang
				});
				
				this.$el.html(tpl);
				this._initDate();
    		},
    		
            _initDate : function(){
    			var self = this;
                $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] ); 
                var startDate = this.$el.find("#startDate"), 
                endDate = this.$el.find("#endDate");
        		
    	        startDate.datepicker({ 
    	            dateFormat: "yy-mm-dd",
    	            changeMonth: true,
    	            changeYear: true,
    	            yearSuffix: "",
    	            minDate : GO.util.now().format("YYYY-MM-DD")
    	        });

    	        endDate.datepicker({
    	            dateFormat: "yy-mm-dd", 
    	            changeMonth: true,
    	            changeYear: true,
    	            yearSuffix: "",
    	            minDate : GO.util.now().format("YYYY-MM-DD")
    	        });
            },
    		
    		addMember : function(data){
    			var self = this;
				var targetEl = $('#addMembers');
				if (self.accountId == data.id) {
					$.goError(approvalLang['현재 사용자 입니다.']);
					return;
				}
				if(targetEl.find('li').not('.creat').length >= 1){
					targetEl.find('li').not('.creat').remove();
				} //한명만 추가 가능
				
				if(data && !targetEl.find('li[data-id="'+data.id+'"]').length) {
					targetEl.find('li.creat').before(tplAddOrgMember(data));
				}
    		},
    		
			_deleteMember : function(e) {
				$(e.currentTarget).parents('li').remove();
			},
			
    		
            /**
            조직도 슬라이드 호출
            @method _showOrgSlider
            @return {Object} 조직도 슬라이드 엘리먼트
            @private
            */ 
            _showOrgSlider: function(e) {
            	var self = this;
                return $.goOrgSlide({
                    header : approvalLang["대결자 선택"],
                    type: 'list', 
					contextRoot : GO.contextRoot,
					zIndex : 200,
					callback : $.proxy(self.addMember, self),
					isAdmin : true
                });
            }, 
    		
	    	release: function() {
				this.$el.off();
				this.$el.empty();
			}
		});

		return AbsenceSettingView;
	});
	
}).call(this);
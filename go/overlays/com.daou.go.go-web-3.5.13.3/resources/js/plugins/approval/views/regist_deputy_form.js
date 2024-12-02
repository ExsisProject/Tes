(function() {
	define([
        // 필수
    	"jquery",
		"underscore", 
        "backbone", 
        "app", 
        "approval/views/content_top",
        "hgn!approval/templates/add_org_member",
        "hgn!approval/templates/regist_deputy_form",
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
    	ContentTopView,
    	tplAddOrgMember,
		RegistDeputyTpl,
        commonLang,
		approvalLang
    ) {	

		var DeputyModel = Backbone.Model.extend({
			url : function(){
				return "/api/approval/usersetting/deputy"
			},
			
	        validate : function(attr, options){
	        	if(_.isEmpty($.trim(attr.absenceContent))){
	        		return approvalLang['부재사유를 입력해주세요'];
	        	}else if(_.isUndefined(attr.deputyUserId)){
	        		return approvalLang['대결자를 선택해주세요'];	        		
	        	}
	        }
		});
		
		var FormView = Backbone.View.extend({
    		el : "#content",
			events: {
				"click li.creat" :"_showOrgSlider",
				'click ul.name_tag li span.ic_del' : '_deleteMember',
				'click #btn-confirm' : '_saveDeputy',
				'click #btn-cancel' : '_cancel'
			},
	    	
    		initialize: function() {
    			this.release();
    			this.contentTop = ContentTopView.getInstance();
    			this.model = new DeputyModel();
    		},
			
	    	render : function(){
				var lang = {
						"종일" : approvalLang['종일'],
						"소속 부서" : approvalLang['소속 부서'],
						"대결자" : approvalLang['대결자'],
						"부재 사유" : approvalLang['부재 사유'],
						"부재 기간" : approvalLang['부재 기간'],
						"대결자 선택" : approvalLang['대결자 선택'],
						"확인" : commonLang["확인"],
						"취소" : commonLang["취소"]
				};

 		
				var tpl = RegistDeputyTpl({
					lang : lang
				});
				
				this.$el.html(tpl);
				this.contentTop.setTitle(approvalLang['부재 추가']);
	    		this.contentTop.render();
	    		this.$el.find('header.content_top').replaceWith(this.contentTop.el);
	    		this._initDate();
    		},
    		
            _initDate : function(){
    			var self = this;
                $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] ); 
               var startDate = this.$el.find("#startDate"), 
                endDate = this.$el.find("#endDate");
    	            
               
    			this.$el.find("#startDate").val(GO.util.now().format("YYYY-MM-DD"));
    			this.$el.find("#endDate").val(GO.util.now().format("YYYY-MM-DD"));
               
    	        startDate.datepicker({ 
    	            dateFormat: "yy-mm-dd",
    	            changeMonth: true,
    	            changeYear: true,
    	            yearSuffix: "",
    	            minDate : GO.util.now().format("YYYY-MM-DD"),
		            onClose: function( selectedDate ) {
		            	self._changeEndDateHandler(selectedDate)
		            }
    	        });

    	        endDate.datepicker({
    	            dateFormat: "yy-mm-dd", 
    	            changeMonth: true,
    	            changeYear: true,
    	            yearSuffix: "",
    	            minDate : GO.util.now().format("YYYY-MM-DD"),
    	            onClose: function( selectedDate ) {
    	            	self._changeStartDateHandler(selectedDate)
		            }
    	        });
    	        
            },
    		
            
            _changeStartDateHandler : function(selectedDate){
                var startDate = this.$el.find("#startDate"), 
                endDate = this.$el.find("#endDate");
                isAfter = GO.util.isAfter(startDate.val(), endDate.val());
                if(isAfter == false){
                	startDate.val(endDate.val())
                }

            },
            
            _changeEndDateHandler : function(selectedDate){
                var startDate = this.$el.find("#startDate"), 
                endDate = this.$el.find("#endDate");
                isAfter = GO.util.isAfter(startDate.val(), endDate.val());
                if(isAfter == false){
                	endDate.val(startDate.val());
                }

            },
    		
    		addMember : function(data){
				var targetEl = $('#addMembers');
				if (App.session('id') == data.id) {
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
			
			_cancel : function(e){
                GO.router.navigate("approval/usersetting/deputy", {trigger: true});
			},
			
			_saveDeputy : function(){
				
				var self = this;
				
				var deputyUserId = $('#addMembers').find('li').not('.creat').attr('data-id');
				var content = $('#textarea-desc').val();
				var startAt = App.util.toISO8601($('#startDate').val());
                var endAt = App.util.toISO8601(App.util.toMoment($('#endDate').val()).add('days',1).subtract('seconds',1));
				if(!$.goValidation.isCheckLength(1,200,content)){
					$.goSlideMessage(App.i18n(approvalLang["{{arg1}}자이상 {{arg2}}이하 입력해야합니다."], {"arg1":"1","arg2":"200"}), 'caution');
					return;
				}
				this.model.set({ 
					'deputyUserId' : deputyUserId,
					'absenceContent' : content,
					'title' : GO.i18n(approvalLang["{{name}}님의 부재정보 입니다."], { 'name': App.session('name') }),
					'startAt' :startAt,
					'endAt' :endAt
				},{ silent : true });
				
	            if (!this.model.isValid()) {
	                $.goError(this.model.validationError);
	                return false;
	            }
				
				$.goConfirm(approvalLang['부재설정을 저장하시겠습니까?'], '' ,function(){
				
					self.model.save({},{
						type : 'POST',
						success : function(model, response) {
							if(response.code == '200') {
								$.goMessage(commonLang['저장되었습니다.']);
				               GO.router.navigate("approval/usersetting/deputy", {trigger: true});
							}
						},
						error : function(model, rs) {
							var responseObj = JSON.parse(rs.responseText);
							if (responseObj.message) {
								$.goError(responseObj.message);
								return false;
							} else {
								$.goError(commonLang['저장에 실패 하였습니다.']);
								return false;
							}
						}
					});
				});				
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
					callback : self.addMember
                });
            }, 
    		
	    	release: function() {
				this.$el.off();
				this.$el.empty();
			}
		});

		return FormView;
		
	});
	
}).call(this);
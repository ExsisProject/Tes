define([
        "backbone",
        "app",
        "hogan",
        
        "hrcard/views/detail/profile",
        "hrcard/views/detail/tabMenu",
        "hrcard/views/detail/tabView",
        
        "hrcard/models/hrInfo",
        "hrcard/collections/info_list",
        
        "hgn!hrcard/templates/my_card",
        
        "i18n!hrcard/nls/hrcard",
        "i18n!nls/commons",
        "i18n!calendar/nls/calendar"
        
],
function(
        Backbone,
        GO,
        Hogan,
        
        Profile,
        Tab,
        TabView,
        
        HrcardInfoModel,
        Collections,
        
        DetailBaseTpl,
        
        hrcardLang,
        commonLang,
        calLang
        
) {
	
	//다국어
	var lang = {
			label_title   : hrcardLang["인사정보"],
			label_date_alert : hrcardLang["날짜형식을맞춰주세요."],
			label_save    : commonLang["저장"],
			label_cancel  : commonLang["취소"],
			label_date_validation : calLang["끝시간은 시작시간보다 이전으로 등록할 수 없습니다."]
	};
	
	var MyCard = Backbone.View.extend({
		events : {
			"click ul.tab_menu li" : "changeTab",
			"click #hrcard_btn_submit" : "hrcardSubmit",
			"click #hrcard_btn_cancel" : "hrcardCancel",
			"click #foldTab" : "foldTab",
			"click #unfoldTab" : "unfoldTab",
			
		},
		
		initialize : function(options) {
			
			this.options = options || {};
        	if(this.options.userid) {
        		this.userid = this.options.userid; 
        	}else {
        		this.userid = GO_Session.id;
        	}
        	
		},
		
		render : function() {
			
			var _this = this;
			
			var params = {
					"userid" : this.userid
			};
			
			this.$el.html(DetailBaseTpl({
				lang : lang
			}));
			
			// 사용자 프로필 View
			var profileView = new Profile({"userid" : this.userid});
			this.$el.find('div.ehr_basic_info').html(profileView.render().el);
			
			// 인사정보 Tab
			var tabView = new Tab(params);
			this.$el.find('div.tab_menu_wrap').html(tabView.render('basic').el);
			
			//인사정보 기본탭 선택
			var callback = function(){
				_this.$el.find("ul.tab_menu li:eq(0)").trigger("click");
			}
			
			//전체 인사정보 데이터 호출
			this.callHrcardModel(callback);
			
			//활동기록
			this.activityRender(params);

			
			return this;
		},
		callHrcardModel : function(callback){
		
			var _this = this;
			
			this.hrcardModel = new HrcardInfoModel({"userid" : this.userid});
			this.hrcardModel.fetch({
				success: function(model, resp) {
					callback();
					
					_this.editable = model.get("editable");					
					if(_this.editable != true){
						$("div.page_action_wrap").hide();					
					} else {
						$("div.page_action_wrap").show();
					}
					
					//사용여부에 따른 탭숨김
					_this.allowTabCheck();
					
				},
				statusCode: {
				403: function() { GO.util.error('403'); },
				404: function() { GO.util.error('404', { "msgCode": "400-common"}); },
				500: function() { GO.util.error('500'); }
			}
			});			
		}, 
		
		allowTabCheck : function(){
			
			var _this = this;
			
			//탭 id를 가져온다.
			var tabArray = [];
			$("ul.tab_menu li").each(function(k,v){
				tabArray.push($(v).attr("id"));
			});
			
			//먼저 모든 탭을 가린다.
			$("ul.tab_menu li").hide();
			
			//항목중 하나라도 활성화된 컬럼이 있으면 탭을 활성화 한다.
			$.each(tabArray,function(k,v){
				$.each(_this.hrcardModel.get(v),function(n,m){
					//기본, 신상일 경우.
					if(typeof n == "string"){
						if(m.useColumn){
							$("#"+v).show();
						}
					//그외에 나머지 탭일경우, 리스트정보이기 때문에 한번더 each문 돌린다.
					}else{				
						$.each(m,function(key,value){							
							if(key == "dataId") return true;  //dataId 일경우는 useColumn이 무조건 true로 내려오기때문에 건너뛴다.
							if(value.useColumn){
								$("#"+v).show();
							}
						});
					}
				})
			});
			
		},
		
		unfoldTab : function(){
			//펼치기
			var _this = this;
			$("#foldTab").show();
			$("#unfoldTab").hide();
			
			var tabArray = [];
			$("ul.tab_menu li").each(function(k,v){
				tabArray.push($(v).attr("id"));
			});
			
			$('div.ehr_con_wrap').html("");
			//저장취소버튼 가리기
			$("div.page_action_wrap").hide();
			
			var allView = "";
			$.each(tabArray,function(k,v){
				
				var options = {
					userid : _this.userid,
					tabType : v,
					data : _this.hrcardModel.get(v),
					editable : false							
				}
				var tabView = new TabView(options);
				
				$('div.ehr_con_wrap').append(tabView.render().el);
				
			});
			
			$('div.ehr_con_wrap h3.tab_title').show();			
		},
		
		foldTab : function(){
			
			$("#foldTab").hide();
			$("#unfoldTab").show();
			
			var selectTabType = $("ul.tab_menu li.active").attr("id");
			this.$el.find("#"+selectTabType).trigger("click");
			
			//저장취소 버튼 
			if(this.editable){
				$("div.page_action_wrap").show();
			}else{
				$("div.page_action_wrap").hide();
			}
			
			$('div.ehr_con_wrap h3.tab_title').hide();
		},
		
		tabRender : function(options){
			
			//탭 클릭시 기존 받아온 모델을 가지고 html만 다시그림.
			// 탭종류만 넘김.
			
			var tabViewT = new TabView(options);
			
			$('div.ehr_con_wrap').html(tabViewT.render().el);
			
			//저장취소 버튼 
			if(this.editable){
				$("div.page_action_wrap").show();
			}else{
				$("div.page_action_wrap").hide();
			}
			$("#foldTab").hide();
			$("#unfoldTab").show();
			
			this.activityRender(options);
		},
		
		toggleTab : function(currentTarget){
			
			/** 기존 활성화된 탭 Class 제거 */
			_.each(currentTarget.closest('ul').find('li'), function(k, v) {
				$(k).removeClass('active');
			});
			/** 활성화 탭 */
			currentTarget.addClass('active');			
		},
		
		changeTab : function(e) {
			
			var $targetEl = $(e.currentTarget);
			
			this.tabType = $targetEl.attr('id');
			
			//탭 active
			this.toggleTab($targetEl);
			
			var options = {
				userid : this.userid,
				tabType : this.tabType,
				data : this.hrcardModel.get($targetEl.attr('id')),
				editable : this.hrcardModel.get('editable') || false
			};
			
			//탭 렌더(공통)
			this.tabRender(options);
			
		},
		
		activityRender : function(options) {
			require(["hrcard/views/detail/activity_log"], function(ActivityView) {
				var activity = new ActivityView(options);
				$('section#hrcardActivity').html(activity.render().el);
				
			});
		},
		
		hrcardSubmit : function(){
			if(this.tabType == "basic" || this.tabType == "detail"){
				this.save();
			}else{
				this.saveAll();
			}
		},
		
		hrcardCancel : function(){
			this.$el.find("#"+this.tabType).trigger("click");
		},
		
		save : function() {
			
			if(!this.isRightDate()){
				$.goMessage(lang.label_date_alert,"caution");
				return;
			}
			
			var _this = this;
			var basic = new HrcardInfoModel();
			var defaultInfo = GO.util.serializeForm($('#data_form'));
			basic.setFromFormData(defaultInfo,this.tabType);
			var isValid = basic.isValid();
			
			if(!isValid){
				 $.goMessage(lang.label_date_validation);
			}
			
			basic.url = [GO.contextRoot + "api/ehr/hrcard/info", this.userid].join('/');
			basic.save({}, {
                type: 'PUT',
                async: false,
                success: function(model, response) {
                    if (response.code == '200') {
                        $.goMessage(commonLang["저장되었습니다."]);
                        
                        var callback = function(){
                        	_this.$el.find("#"+_this.tabType).trigger("click");
                        }
                        
                        var options = {
            					"userid" : _this.userid
            			};
                        
                        _this.callHrcardModel(callback);
                        _this.activityRender(options);
                			
                    }
                },
                error: function(model, response) {
                    $.goMessage(response.responseJSON.message);
                }
            });
			
		},
		
		saveAll : function() {
			
			if(!this.isRightDate()){
				$.goMessage(lang.label_date_alert,"caution");
				return;
			}
			
			var _this = this;
			this.validate = true;
			var wrap = {};
			var collections = new Collections({userid : this.userid, tabType : this.tabType});
			collections.reset();
			
			_.each($('div.viewForm tr.dataRow'), function(key, value) {
				var id = $(key).attr('data-id');
				var array = {};
				
				array['dataId'] = id == '' ? null : id;
				_.each($(key).find('input'), function(k, v) {
					var value = $(k).val();
					if(value != '') {
						array[$(k).attr('name')] = value;
					}
				});
				
				_.each($(key).find('select'), function(k, v){
					var value = $(k).val();
					if(value != '') {
						array[$(k).attr('name')] = value;
					}
				});
				
				if(array.length != 0)  {
					var test = new HrcardInfoModel();
					test.set(array);
					var isValid = test.isValidation(array,_this.tabType);
					if(!isValid){
						_this.validate = false;
						return false;
					}
					collections.add(test);
				}
			});
			
			if(!this.validate){
				$.goMessage(lang.label_date_validation);
				return;
			}
			
			wrap[this.tabType] = collections;
			var basic = new Backbone.Model;
			
			basic.set(wrap);
			
			basic.url = [GO.contextRoot + "api/ehr/hrcard/info", this.userid].join('/');
			basic.save({}, {
                type: 'PUT',
                async: false,
                success: function(model, response) {
                    if (response.code == '200') {
                        $.goMessage(commonLang["저장되었습니다."]);
                        
                        var callback = function(){
                        	_this.$el.find("#"+_this.tabType).trigger("click");
                        }
                        _this.callHrcardModel(callback);
                        
                    }
                },
                error: function(model, response) {
                    $.goMessage(response.responseJSON.message);
                }
            });
		},
		
		isRightDate : function(){
			
			//datepicker input값 체크 9999년 이상으로 입력했을때 moment.js에서 처리못함.
			var isRight = true;
			var validDate = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
			$("input.hasDatepicker").each(function(k,v){
				var value = $(v).val();
				if(value != ""){
					if(value.match(validDate) == null){
						isRight = false;
						return false;
					}
				}
			});
			return isRight;
		}
	});
	
	return MyCard;
});
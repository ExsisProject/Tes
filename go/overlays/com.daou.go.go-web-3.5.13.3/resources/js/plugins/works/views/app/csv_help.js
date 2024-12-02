/**
 * csv 도움말
 */

define("works/views/app/csv_help", function(require) {
	
	var Tmpl = require('hgn!works/templates/app/csv_help');
	require('jquery.bxslider');
	var View = Backbone.View.extend({
		
		className: 'layer_normal layer_mail_print popup',
		el : "body",
		events : {
			'click img.lbutton': '_leftMove',
			'click img.rbutton': '_rightMove'
		},
		initialize : function(){
			this.$el.html(Tmpl);
		},
		render : function() {
			this._setSlider();			
		},		
		_setSlider : function(){
			var _this = this;
			//setTimeout이 없으면 bxSlider가 작동을 안함.
			setTimeout(function(){
				_this.slide = _this.$el.find(".dataCsvSlideGuide").bxSlider({
					auto:false,
					controls:false,
					pager : false,
					onSlideAfter : function($slideElement,oldIndex,newIndex){
						//첫번째 페이지에서는 좌측 버튼을 숨김
						if(newIndex == 0){
							$(".lbutton").hide();
						}else{
							$(".lbutton").show();
						}
					},
					onSliderLoad : function(){
						//최초 로드시 좌측 버튼을 숨김
						$(".lbutton").hide();
					}
				});
			},2000);
			
		},
		_leftMove : function(){
			//bxSlider에서 제공하는 함수
			this.slide.goToPrevSlide();
			return false;
		},
		_rightMove : function(){
			//bxSlider에서 제공하는 함수
			this.slide.goToNextSlide();
			return false;
		}
	});
	
	return View;
});
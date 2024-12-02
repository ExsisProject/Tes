/***
 * 옵션화는 필요할때마다 코딩하여 관리하는게 나을거라 생각함.
 */
define('views/guide_slide_layer', function(require) {
	// dependency
	var Backbone = require('backbone');
	var when = require('when');
	var worksLang = require("i18n!works/nls/works");
	var commonLang = require('i18n!nls/commons');
	
	require('jquery.bxslider');
	
    var lang = {
            '닫기' : commonLang['닫기']
        };
    
    var Tpl = Hogan.compile(['<div class="app_popup_cont">',
                             '<a class="app_popup_close" id="ic_close">{{lang.닫기}}</a>',
                             '</div>'].join(""));
	
	var GuideLayerView = Backbone.View.extend({
		el : ".go_popup .content",
		externalLang : null, //외부에서 주입된 langauge
		contentTpl : null, //실제 contents부분.
		layer : null, // x버튼을 누르면  팝업레이어 닫기를 해야 하는데 close함수를 쓸때 팝업을 찾을수 있도록 popup객체를 받아와서 closePopup이벤트를 걸어줘야함. 
		initialize: function(options) {
			this.options = options || {};
			this.externalLang  = this.options.externalLang;
			this.contentTpl = this.options.contentTpl;
			this.layer = this.options.layer;
			this.initRender();
		},
		
		events : {
			'click #ic_close' : 'closePopup'
		},
		
		closePopup : function(){
			this.layer.close();
		},
		
		initRender : function(){
			this.$el.html(Tpl.render({
				lang : lang
			}));			
		},
		
		render: function() {
			var self = this;

			//TODO en 에 대한 이미지 완료 되면 en 조건 추가
			var localeFolder = "";
			if(GO.session('locale') == 'ja') {
				localeFolder = "ja/";
			} else if(GO.session('locale') == 'en'){
				localeFolder = "en/";
			} else if(GO.session('locale') == 'zh_CN') {
				localeFolder = "cn/";
			} else if(GO.session('locale') == 'zh_TW') {
				localeFolder = "tw/";
			} else if(GO.session('locale') == 'vi') {
				localeFolder = "vi/";
			}
			
			this.$el.find('div.app_popup_cont').append(this.contentTpl({
				lang : _.extend(lang, this.externalLang),
				contextRoot : GO.contextRoot,
				localeFolder : localeFolder
			}));
			this.$el.find('.bxslider').bxSlider({
				mode: 'horizontal',
				captions: false,
				useCSS: false,
				onSliderLoad: function(){
					self.$el.find('a').removeAttr('href');//href속성이 있으면 화면이 깜빡거림
				}
			});
		}
	});
	return GuideLayerView;
});
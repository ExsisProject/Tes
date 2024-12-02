// vpopup.jquery.js
$(function (){
	var deviceFilter = ['win16', 'win32', 'win64','mac','macintel']; 
	var vLayer = {
		alignSep : function (){

			var $dW = 0, 
				$wrap = $('.app_guide'),
				$wrap2 = $('ul.youtube'), 
				$item = $('ul.youtube > li:first-child'),
				$iW = $item.outerWidth(true, true);

			detectOrientation();
			window.onorientationchange = detectOrientation;
			function detectOrientation(){
				var abs = Math.abs(window.orientation);
				if(abs > 0){ $dW = 	window.screen.height;
				}else{ $dW = window.screen.width; }
				
				var rowCnt = parseInt( $dW / $iW);

				$wrap.css({ 'width' :  $dW, 'text-align' : 'center' });
				$wrap2.css({ 'margin-left' : ( $dW - ($iW*rowCnt))/2}); 
			}	

			window.addEventListener("orientationchange", function() {
				detectOrientation();
			}, false);	
			
		},
		videoSet : function(){
			var $videos = $('.popBody iframe'),
				$vBody = $('div.popBody'), $vCont = $('div.popCont');
			var pixW = $(window).width(), pixH = $(window).height();
			if(pixW > pixH) { pixW = pixH - 20; } //width > height
			else { pixW = pixW - 20; } //height > width

			var	RatioH = parseInt((pixW/16)*9); 
			if( pixW > 640 ) { pixW = 640; RatioH = 360; }	

			$vCont.height(RatioH); 	
			$videos.css({'width' : pixW, 'height' : RatioH });
			$vBody.css({ 'left': ($(window).width() - pixW)/2 , 'width' : pixW }); 
		},	
		loadEvt : function(){
			var $that = $(this)[0];
			
			$that.alignSep();
			$that.videoSet();
			
			$(window).resize(function(){
				$that.alignSep();
			});
		}
	}
	var vPopup = {
		deviceSep : function(){
			var pl = navigator.platform.toLowerCase();
			var web = false; 

			if( pl ){
				[].forEach.call(deviceFilter, function(value, key){
					if( value === pl ){  return web = true; }
				});	
				
				if(!web) { //device type is mobile 
					$(this)[0].scrollFix();
				}
			}
		},
		scrollFix : function (){
			var $target = $('div.movie ul.youtube > li, .youtube_close'),
				$fixLayer = $('html, body');
			var tPos =  0;	

			$target.on('click', function(e){
				if(e.target.className == 'youtube_close'){
					$fixLayer.css({ 'overflow' :  'initial' });
					$(window).scrollTop(tPos);
				}else{
					tPos = $(window).scrollTop();
					$fixLayer.css({ 'overflow' : 'hidden' });
					vLayer.loadEvt();
				}
				return false;
			});
		},	
		init : function(){
			var $that = $(this)[0];
			$that.deviceSep();
			vLayer.loadEvt();
		},
		play : function(){
			var $that = $(this)[0];
			$that.init();
		},	
	} 

	vPopup.play();
});

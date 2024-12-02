define([
    'jquery',
    'app', 
    
    'jquery.fancybox',
    'jquery.fancybox-thumbs',
    'jquery.fancybox-buttons'
], 

function($, GO, browser) {
	
	$.fn['goFancybox'] = function() {
		var fancybox = $(this).fancybox({
			type : 'image',	
			padding: 5, 
			openEffect : 'elastic', 
			openSpeed  : 150, 
			closeEffect : 'elastic', 
			closeSpeed  : 150, 
			closeBtn : false,
			live : false,
			helpers : {
				title : {
					type: 'outside'
				},
				buttons	: {
					tpl : '<div id="fancybox-buttons" class="top">' +
						      '<ul>' +
							      '<li><a class="btnPrev" title="Previous" href="javascript:;"></a></li>' +
							  	  '<li><a class="btnPlay" title="Start slideshow" href="javascript:;"></a></li>' +
							  	  '<li><a class="btnNext" title="Next" href="javascript:;"></a></li>' +
							  	  '<li><a class="btnToggle btnDisabled" title="Toggle size" href="javascript:;"></a></li>' +
							  	  '<li><a class="btnSave linkedImage" title="Save" onclick="GO.util.fancyBoxImageDownLoad()">Save</a></li>' +
							  	  '<li><a class="btnClose" title="Close" href="javascript:jQuery.fancybox.close();"></a></li>' +
							  '</ul>' +
						  '</div>'
				},
				thumbs : {
					width: 75,
					height: 50
				}
			},
			afterLoad: function() {
				$('.fancybox-overlay').attr('data-layer', '');
				$(document).trigger("showLayer.goLayer");
			},
			beforeShow : function() {					
				this.title = (this.title ? '' + this.title + '' : '') + '<span style="float:right">' + (this.index + 1) + ' / ' + this.group.length + '</span>';
			},
			afterClose: function() {
				var isBeforeCallback = true;
				$(document).trigger("hideLayer.goLayer", isBeforeCallback); // animation 으로 인해 trigger 시점에 layer가 남아있다.
			}
		});
		
		$('input[placeholder], textarea[placeholder]').placeholder();

		var selector = this.selector;
		this.find('img').on('error', function() {
			var $img = $('<a><img src="' + this.src + '"></a>');
			var closest = $(this).closest(selector);
			var src = closest.attr('href');
			closest.replaceWith($img);
			$img.on('click', function() {
				$("body").append('<iframe id="attachDownload" width="0px" height="0px" name="attachDownload" src="' + src + '" style="border:0;"></iframe>');
			});
		});
	};
});
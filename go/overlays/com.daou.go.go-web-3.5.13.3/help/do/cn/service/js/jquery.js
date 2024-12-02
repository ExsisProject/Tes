$(function(){	
	//layerPopup, youtube play Start
	$('ul.youtube li a.thumb').click(function() {
		var maskHeight = $(document).height();
		var maskWidth = $(window).width();
		
		$('#blackscreen').css({'width':maskWidth,'height':maskHeight});
		
		var winH = $(window).height();
		var winW = $(window).width();
		$('.popBody').css('top',  winH/2-$('.popBody').height()/2);
		$('.popBody').css('left', winW/2-$('.popBody').width()/2);
		
		$('#blackscreen').show();
		
		var videoURL = $(this).parent().children('.popBody').children('div.popCont').attr('data-src');
		$(this).parent().children('.popBody').children('div.popCont').children('iframe').attr('src', videoURL);
		$(this).parent().children('.popBody').fadeIn(300);
	
	});	
	$(window).resize(function () {
	 
		var box = $('.popBody');
		var maskHeight = $(document).height();
		var maskWidth = $(window).width();
	  
		$('#blackscreen').css({'width':maskWidth,'height':maskHeight});
			   
		var winH = $(window).height();
		var winW = $(window).width();

		box.css('top',  winH/2 - box.height()/2);
		box.css('left', winW/2 - box.width()/2);
	 
	});	
		
	$('a.youtube_close').click(function() {
		$('#blackscreen').hide();
		$(this).parent().parent().fadeOut(300);
		$(this).parent().children("iframe").attr("src", "");
	});	
	//layerPopup, youtube play End

});	
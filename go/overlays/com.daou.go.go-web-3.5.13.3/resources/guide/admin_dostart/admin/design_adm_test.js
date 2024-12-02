$(window).load(function(){
	winSize()
	$(window).resize(function(){
		winSize()
	});
	function winSize(){
		var winW = $(window).width();
		var winH = $(window).height();
		$(".wrap_list_position_template").css("height",winH - "470" + "px");
		$(".wrap_list_position").css("height",winH - "470" + "px");
	}
	$(".gnb_tit").on("click",function(e){
		e.preventDefault();
		$(this).toggleClass('folded');
		$(this).siblings(".gnb_sub").slideToggle("fast");
	});
	$(".gnb_menu_manage .gnb_sub li .tit").on("click",function(e){
		e.preventDefault();
		$(this).toggleClass('folded');
		$(this).siblings(".gnb_sub").slideToggle("fast");
	});
	$(".btn_fold").on("click",function(e){
		e.preventDefault();
		$(".wrap_gnb").toggleClass('folded');
	});
	$(".tab_v .menu").on("mouseover",function(e){
		e.preventDefault();
		$(".tab_v li .menu").each(function(){
			if($(this).hasClass("on")){
				$(this).removeClass("on");
			}
			$(".tab_v li .menu").removeClass("on");
		});
		$(this).addClass("on");
	});
	$(".btn_ic_info").on("click",function(){
		$(this).toggleClass("on");
	});
	$(".layer_info .content .ic_btn_x1").on("click",function(){
		$(this).parents(".layer_info").hide();
	});
	/* tab */
	$(function () {	
		tab('#tab',0);	
	});
	function tab(e, num){
		var num = num || 0;
		var menu = $(e).children();
		var con = $(e+'_con').children();
		var select = $(menu).eq(num);
		var i = num;

		select.addClass('active');
		con.eq(num).show();

		menu.click(function(){
			if(select!==null){
				select.removeClass("active");
				con.eq(i).hide();
			}

			select = $(this);	
			i = $(this).index();

			select.addClass('active');
			con.eq(i).show();
		});
	}
	/* //tab */

});
$(document).ready(function(){
	$(".fast").parents(".btn_tool").on("click",function(){
		$(".form_speed").slideToggle("fast");
	});
	$(".btn_submenu").on("click",function(){
		$(this).children(".array_option").toggleClass("on");
	});
	$(".btn_function").on("click",function(){
		$(this).children(".array_option").toggleClass("on");
	});
	$(".lnb h1 .txt").on("click",function(){
		$(this).parents("h1").toggleClass('on');
		$(this).parents("h1").siblings(".side_depth").slideToggle("fast");
	});
	$(".lnb h1 .ic_hide_up").on("click",function(){
		$(this).parents("h1").toggleClass('folded');
		$(this).parents("h1").siblings(".side_depth").slideToggle("fast");
	});

	$(".ic_d_mgmt").parents().on("click",function(){
		$(this).parents(".go-gadget").addClass("wrap_gadget_edit");
	});
	$(".gadget_edit .btn_layer_wrap .btn_minor_s").on("click",function(){
		$(this).parents(".go-gadget").removeClass("wrap_gadget_edit");
		$(this).parents(".go-gadget").removeClass("wrap_gadget_edit");
		$(this).parents(".go-gadget .wrap_gadget_edit").css("display","none");
	});
	$(".go_dashboard_ctrl .optional .btn_ctrl").on("click",function(e){
		e.preventDefault();
		if($(".dashboard_option_gadget").hasClass("toggled")){
			$(".dashboard_option_gadget").animate({"height":"180px"},300).removeClass("toggled");
			} else {
			$(".dashboard_option_gadget").animate({"height":"0px"},300).addClass("toggled");
		}
	});
	$(".txt_form").on("click",function(e){
		e.preventDefault();
		$(this).toggle();
		$('.txt_edit').css({
		"display" : "block"
		});
		$('.btn_ic_side_setting').css({
		"display" : "none"
		});
	});
	$(".ic_done").on("click",function(e){
		e.preventDefault();
		$('.txt_edit').css({
		"display" : "none"
		});
		$('.txt_form').css({
		"display" : "inline-block"
		});
		$('.btn_ic_side_setting').css({
		"display" : "inline-block"
		});
	});
	$(".btn_ic_side_setting").on("click",function(e){
		e.preventDefault();
		$('.btn_ic_side_setting .layer_normal').toggle();
	});
	$('.option_layout li').on('click',function(){
		var result = confirm('다른 레이아웃으로 변경하시면 구성 요소들의 순서가 기본으로 변경됩니다. 레이아웃을 변경하시겠습니까?');
	});
	var duration = 200,
		  easing = "swing";
	$(".btn_list").on("click",function(){
		// if($(".gnb").hasClass("mini")) {
		if($("body").hasClass("mini")) {
			// $(".gnb").removeClass("mini");
			$("body").removeClass("mini");
		} else {
			// $(".gnb").addClass("mini");
			$("body").addClass("mini");
			$(this).css("width","40px");
		}
	});
	$(".btn_ic_list_reorder").on("click",function(){
		$(this).toggle("fast");
		$(this).siblings(".editmode").toggle("fast");
	});
	$(".ic_side.ic_cancel").on("click",function(){
		$(this).toggle("fast");
		$(this).siblings(".editmode").toggle("fast");
		$(this).siblings(".btn_ic_list_reorder").toggle("fast");
	});
	// 오전 일정 보기/숨기기
	$("a.btn_timeline_hide").click(function() {
		$("table.tb_week_body").animate({"margin-top": "-370px"}, 500, function() {
			$("a.btn_timeline_hide").css("display", "none");
			$("a.btn_timeline_show").css("display", "block");
		});
	});
	$("a.btn_timeline_show").click(function() {
		$("table.tb_week_body").animate({"margin-top": "0px"}, 500, function() {
		$("a.btn_timeline_show").css("display", "none");
			$("a.btn_timeline_hide").css("display", "block");
		});
	});

	// 일정 영역 resize
	$("div.resize").css("display", "none");
	$("div.schedule_time").mouseover(function() {
		$(this).children("div.resize").show();
	});
	$("div.schedule_time").mouseout(function() {
		$(this).children("div.resize").hide();
	});
	$(".my_info .profile .photo a").on("click", function(){
		$(".profile .gnb_top_menu").toggleClass("on");
	});
	// nav size
	navResize();
	$(window).resize(function(){navResize()});
	function navResize(){
		var navHight = $(window).height();
		var docWidth = $(window).width();
		$(".go_skin_advanced nav").css("height",navHight - "237");
		$(".go_skin_advanced .go_header").css("height",navHight);
		if(docWidth < 1280){
			$(".gnb").addClass("mini");
		}		
	}
	//  조직도 버튼
	$(".btn_oganization").on("click",function(){
		$(".go_organogram").toggleClass("on");
	});
	$(".go_skin_advanced aside.go_organogram>h1 span.btn_wrap").on("click",function(){
		$(".go_organogram").css("display","none");
	});
	$("h1.logo .btn_multiCompany").on("click",function(){
		$(this).toggleClass("on");
	});
	$(".ic_info").on("click",function(){
		$(this).children(".layer_tail").toggle();
	});
	$(".layer_welcome .step_intro .btn_major").on("click",function(){
		$(".layer_welcome .step_intro").fadeOut();
		$(".layer_welcome .step1").fadeIn();
		$(".welcome_list li").removeClass("on");
		$(".welcome_list li:eq(1)").addClass("on");
	});
	$(".layer_welcome .step1 .btn_major").on("click",function(){
		$(".layer_welcome .step1").fadeOut();
		$(".layer_welcome .step2").fadeIn();
		$(".layer_welcome .step3").fadeOut();
		$(".welcome_list li").removeClass("on");
		$(".welcome_list li:eq(2)").addClass("on");
	});
	$(".layer_welcome .step2 .btn_major").on("click",function(){
		$(".layer_welcome .step1").fadeOut();
		$(".layer_welcome .step2").fadeOut();
		$(".layer_welcome .step3").fadeIn();
		$(".welcome_list li").removeClass("on");
		$(".welcome_list li:eq(3)").addClass("on");
	});
	$(".layer_welcome .step3 .btn_major").on("click",function(){
		$(".layer_welcome ").fadeOut("slow");
	});
	$(".welcome_skip").on("click",function(e){
		e.preventDefault();
		$(".layer_welcome").fadeOut();
	});
	/* linkplus */
	$(".tab_page_content").hide();
	$(".tab_page > li:first a").addClass("on");
	$(".tab_page_content:first").show();
	$(".tab_page li a").click(function(){
		$(".tab_page li a").removeClass("on");
		$(this).addClass("on");
		$(".tab_page_content").hide();

		var activeTab = $(this).attr("href");
		$(activeTab).show();
		return false;
	});
	$(".linkplus_detail .linkplus_detail_header .info .optional .btn_minor").click(function(){
		$(".linkplus_detail").hide();
		return false;
	});
	$(".list_album_thum").click(function(){
		$(".linkplus_detail").show();
		return false;
	});
	$(".linkplus_detail .linkplus_detail_header .info .meta .btn_major").click(function(){
		$(".overlay").show();
		$(".layer_linkplus_apply").show();
		return false;
	});
	$(".btn_linkplus_apply").click(function(){
		$(".overlay").hide();
		$(".layer_linkplus_apply").hide();
		$(".linkplus_detail .linkplus_detail_header .info .meta .btn_major").hide();
		$(".layer_linkplus_apply").hide();
		$(".linkplus_wait").css("display","inline-block");
	});
	$(".tab_page li:first a").click(function(){
		$(".linkplus_none").hide();
		$(".linkplus_my").show();
		$(".linkplus_recommned").hide();
		$(".linkplus_guide").hide();
	});
	$(".list_album .btn_more").click(function(){
		$(this).children(".array_option").show();
		return false;
	});
	$(".list_accordion .subject").click(function(){
		$(this).siblings(".desc").toggleClass("on");
		return false;
	});
	$(".user_guide_thumb").on("click",function(){
		$(".layer_modal_full").toggleClass("on");
	});
	$(".layer_modal_full .ic_x_b_w").on("click",function(){
		$(this).parents(".layer_modal_full").toggleClass("on");
	});
});
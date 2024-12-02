/**
 * Created by daou on 2015-10-08.
 */

(function(){
    var $body = $("body");

    // e-HR 사이드 render Event
    $body.on("admin.ehrSideRender", function(event, isActive){
    	console.info("admin.ehrSideRender");
    	/*sample
    	  require(["hgn!admin/templates/side_menus"], function(Tmpl){ //hgn!admin/templates/side_menus 공통사용
    		var menus =[ //사이드에 필요한 메뉴를 추가
    		    {
    		    	leftName : "side1", //사이드를 구분할 수 있는 값(영어)
                    href : "ehr/ip/side1", //사이드 url
                    name : "사이드1", //사이드 이름
                    isActive : isActive //사이드 클릭 했을때 색 표시를 위한 값
	    		},
	    		{
	    			leftName : "side2",
                    href : "ehr/ip/side2",
                    name : "사이드2",
                    isActive : isActive
	    		}
	    	];
    		
    		//menus 값을 넣어 템플릿을 만든다.
    		var sideTmpl = $(Tmpl({
    			menus : menus
    		}));
    		
    		//원하는 사이드에 붙인다.
    		var $targetSideEl = $("div.admin_side ul.admin li[data-url='ehr/group/list']");   		
    		$targetSideEl.after(sideTmpl);
    	})*/
    });
    
    $body.on("admin.companySideRender", function(event, isActive){
    	console.info("admin.companySideRender");
    });
    
    $body.on("admin.accountSideRender", function(event, isActive){    	
    	console.info("admin.accountSideRender");
    });
    
    $body.on("admin.deptSideRender", function(event, isActive){
    	console.info("admin.deptSideRender");
    });
    
    $body.on("admin.contactSideRender", function(event, isActive){
    	console.info("admin.contactSideRender");
    });
    
    $body.on("admin.calendarSideRender", function(event, isActive){
    	console.info("admin.calendarSideRender");
    });
    
    $body.on("admin.boardSideRender", function(event, isActive){
    	console.info("admin.boardSideRender");
    });
    
    $body.on("admin.communitySideRender", function(event, isActive){
    	console.info("admin.communitySideRender");
    });
    
    $body.on("admin.assetSideRender", function(event, isActive){
    	console.info("admin.assetSideRender");
    });
    
    $body.on("admin.surveySideRender", function(event, isActive){
    	console.info("admin.surveySideRender");
    });
    
    $body.on("admin.reportSideRender", function(event, isActive){
    	console.info("admin.reportSideRender");
    });
    
    $body.on("admin.taskSideRender", function(event, isActive){
    	console.info("admin.taskSideRender");
    });
    
    $body.on("admin.worksSideRender", function(event, isActive){
    	console.info("admin.worksSideRender");
    });
    
    $body.on("admin.approvalSideRender", function(event, isActive){
    	console.info("admin.approvalSideRender");
    });
    
    $body.on("admin.mobileSideRender", function(event, isActive){
    	console.info("admin.mobileSideRender");
    });

})();
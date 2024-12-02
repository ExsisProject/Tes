<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<c:if test="${mobileWeb}">
<%--<footer>
	<div class="btn_footer">
		<a href="javascript:goToPcVersion();"><span class="btn_type2"><tctl:msg key="common.mobile.web.pcversion"/></span></a>
		<a href="/logout"><span class="btn_type2"><tctl:msg key="comn.logout"/></span></a>
        
		<a id="downloadAnchor" style="display: none;"><span class="btn_type2 appDown"><span class="ic ic_appDown"></span> <tctl:msg key="common.mobile.web.appdown"/></span></a>
        
	   <script type="text/javascript">
           jQuery.get("/api/mobile-download-link",null, function(result) {
               var data = result.data;
    
               var url;
               if(isAndroid()){
                   url = data.android;
               } else if (isIphone()){
                   url = data.iphone;
               }
    
               if(url == null) return;
    
               jQuery('#downloadAnchor').attr("href", url);
               jQuery('#downloadAnchor').show();
           });
        </script>
		<a href="#"><span class="btn_type2"><tctl:msg key="common.mobile.web.movetop"/></span></a>
	</div>
</footer>--%>
</c:if>
<a href="javascript:scrollToTop();" id="scrollToTop" class="btn_pageTop" style="display: none; z-index: 999;">
    <span class="ic_v2 ic_pageTop"></span>
</a>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<footer id="goFooter" class="go_footer" style="background:#fff">
<c:if test="${isPcVersionViewFromMobile}">
    <div class="btn_local" style="display:none"> <!-- 하단 영역을 가리기때문에 임시 가림. 홈에서만 보이도록 함 -->
		<a href="javascript:returnToMobileVersionView();"><span class="btn_type3" data-role="button"><span class="ic_mVer"></span><span class="txt"><tctl:msg key="common.mobile.web.mobileversion" /></span></span></a>
	</div>
</c:if>
</footer>
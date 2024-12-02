<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page isELIgnored="false"%>
<%@ taglib prefix="c"  uri="/WEB-INF/tld/c.tld"%>
<%@ taglib prefix="fn"  uri="/WEB-INF/tld/fn.tld"%>
<%@ taglib prefix="fmt"  uri="/WEB-INF/tld/fmt.tld"%>
<%@ taglib prefix="tctl"  uri="/WEB-INF/tld/message.tld"%>

<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta http-equiv="content-type" content="text/html;charset=UTF-8" />
<meta name="viewport" content="initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0">
<title>${message.subject}</title>
<script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery-1.7.2.min.js?rev=${revision}"></script>
<script language="javascript">
	 function downLoadAttach(uid, folder, part){
		var mailUserSeq = jQuery("#mailUserSeq").val();
		var authKey = jQuery("#authKey").val();
		var param = {"folderName":folder, "uid":uid, "part":part,
					"authKey":authKey, "mailUserSeq":mailUserSeq};
		jQuery("#reqFrame").attr("src","/app/mail/secure/attach/download?"+jQuery.param(param));
	}

	function downLoadTnefAttach(uid, folder, part, tnefKey){
		var mailUserSeq = jQuery("#mailUserSeq").val();
		var authKey = jQuery("#authKey").val();
		var param = {"folderName":folder, "uid":uid, "part":part, "type":"tnef", "tnefKey":tnefKey,
					"authKey":authKey, "mailUserSeq":mailUserSeq};
		jQuery("#reqFrame").attr("src","/app/mail/secure/attach/download?"+jQuery.param(param));
	} 
</script>
</head>

<body style="padding:0; margin:0; background:#fff">
<input type="hidden" id="authKey" value="${authKey}"/>
<input type="hidden" id="mailUserSeq" value="${mailUserSeq}"/>
<div style="padding:0; max-width:100%; min-width:320px; margin:15px">
	<div style="background:#2EACB3; border:1px solid #1C99A0; color:#fff;  font:bold 16px/16px arial, gulim, dotum; text-align:left; padding:10px 12px"><tctl:msg key="mail.secure.title"/></div>
	<div style="border:1px solid #ddd; padding:20px">
		<h3 style="font-family:ms pmincho; letter-spacing:-1px; margin-bottom:15px">${fn:escapeXml(message.subject)}</h3>
		<!-- 첨부파일 -->
		<c:if test="${!empty message.attachList}">
		<div style="font-family:ms pmincho; background:#F7F7F7; border:1px solid #EBEBEB; padding:8px; font-size:12px"><tctl:msg key="mail.attach"/></div>
		<div style="border:1px solid #EBEBEB; border-top:0; padding:12px 8px 10px 8px">
			<c:forEach var="fileData" items="${message.attachList}" varStatus="loop">
	   			<c:if test="${fileData.size > 0 }">
					<a href="javascript:;" onclick="downLoadAttach('${message.uid}','${message.folderEncName}','${fileData.path}')" 
						style="display:block; font-size:12px; margin-bottom:7px; text-decoration:none">
						<span class="ic_file ic_${fileData.fileType}"></span>
						${fileData.fileName} (${fileData.fsize})
					</a>	
					<c:if test="${fileData.tnef}">
						<c:if test="${not empty fileData.tnefList}">
							[
							<c:forEach var="tnefFile" items="${fileData.tnefList}" varStatus="idx">
								<c:if test="${idx.index > 0}">
								,
								</c:if>
								<a href="javascript:;" onclick="downLoadTnefAttach('${message.uid}','${message.folderEncName}','${fileData.path}','${tnefFile.attachKey}')" 
									style="display:block; font-size:12px; margin-bottom:7px; text-decoration:none">
									${tnefFile.fileName}
								</a>
							</c:forEach>
							]
						</c:if>
					</c:if>	   		    		   		    
	   		    </c:if>
			</c:forEach>
		</div>
		</c:if>
		<p style="font-family:ms pmincho; font-size:13px; line-height:1.5; margin-top:20px">
			${message.htmlContent}
		</p>
	</div>
</div>
<iframe name="hidden_frame" id="reqFrame" src="about:blank" frameborder="0" width="0" height="0"></iframe>
</body>
</html>


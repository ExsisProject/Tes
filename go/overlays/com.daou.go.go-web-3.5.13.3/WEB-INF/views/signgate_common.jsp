<%
 	String contextPath = (String)request.getAttribute("contextPath");
%>
 
<script>
	GO = {};
    GO["contextRoot"] = "${contextPath}";
</script>

<script type="text/javascript">
	var uaString = window.navigator.userAgent;
	if (uaString.indexOf('MSIE') > 0 || uaString.indexOf('Trident/7.0') > 0) {
		document.write("<script type='text/javascript' src='${contextPath}resources/js/vendors/signgate/activex/secukit.js'><" + "/script>");
	} else {
		document.write("<script type='text/javascript' src='${contextPath}resources/js/vendors/signgate/applet/script/sgj_scripts.js'><" + "/script>");  
		document.write("<script type='text/javascript' src='${contextPath}resources/js/vendors/signgate/applet/script/sgj_util.js'><" + "/script>");  
		document.write("<script type='text/javascript' src='${contextPath}resources/js/vendors/signgate/applet/script/sgj_object.js'><" + "/script>");
	}
</script>


<!DOCTYPE html>

<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<script src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}" type="text/javascript"></script>
<title></title>
<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
<style>
	/* table {
		border-spacing : 0px
	} */
	body, p {
		margin : 0px; padding: 0px
	}
</style>
</head>
<body>
	<div id="editorWrapper"></div>
	
	<script type="text/javascript">	
		var $$ = parent.jQuery;
   		var deferred = $.Deferred();
   		
		function initObject() {
			var id = "twe";
			var width = "100%";
			var height = "100%";
			var classid = "CLSID:976A7D6C-B14C-4e50-A5C3-B43D8C49D8C8";
			var codeBase = "${baseUrl}resources/js/vendors/activeDesigner/tweditor.cab#version=3,7,1,1040";
			// 개발 라이센스. 2016.06.30 까지
			var licenseKey = "i7XqoClfNqmNC+l3yrgSQlbAbgJeD8oFqUUdJ/nbw0p2r1aksszLEfzx0Gj2gcbJbbPHUSWeUPScws18rp9Dk3eMFced/jZUVR8cgKybsycrEU32zETSBhRjIdrjn2soGq+7WIWX4/06xDsHBxZCothdkzNM9IHUMrfjAgDNH/M=";
			var initFile = "${baseUrl}" + ("${isAdmin}" == "true" ? "ad/" : "");
			initFile += "api/editorconfig/${locale}";
			initFile += "${useImage}" == "" ? "" : "?image=${useImage}";

					document.getElementById("editorWrapper").innerHTML = [
				'<object id="' + id + '" name="twe" width="' + width + '" height="' + height + '" CLASSID="' + classid + '" CODEBASE="' + codeBase + '">' +  
			        '<PARAM name="InitFile" value="' + initFile + '"/>' +
			        '<PARAM name="ApplyInitData" VALUE="1"/>' +
			        '<PARAM name="BaseUrl" value="${reqUrl}">' +
			        '<PARAM name="LicenseKey" value="' + licenseKey + '">' +
			        '<PARAM name="DesignName" value="Editor">' +
					'<PARAM name="HtmlName" value="Source">' +
			    '</object>'
		    ].join("");
    	}
		
    	$(function() {
    		$("#editorWrapper").css("height", $(window).height() - 4);
        	$$("#${formId}").data("activeDesigner", deferred);
        	
        	initObject();
    	});
	</script>
	
	<script language="JScript" for="twe" event="OnControlInit()">
		if (window.console) {
	    	window.console.log("OnControlInit");
		}
   		deferred.resolve(document.twe);
    </script>
</body>
</html>
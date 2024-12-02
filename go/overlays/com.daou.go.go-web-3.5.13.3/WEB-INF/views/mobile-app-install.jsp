<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width, target-densitydpi=medium-dpi" />
	<title>${title}</title>
	<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
	<link rel="stylesheet" href="${baseUrl}resources/css/go_m_style.css?${revision}" media="all" />
	<script type="text/javascript">
	    window.addEventListener('load', function() {
	        setTimeout(scrollTo, 0, 0, 1);
	    }, false);
	    
	    var isMobile = {
    	    Android: function() {
    	        return navigator.userAgent.match(/Android/i) ? true : false;
    	    },
    	    BlackBerry: function() {
    	        return navigator.userAgent.match(/BlackBerry/i) ? true : false;
    	    },
    	    iPhone: function() {
                return navigator.userAgent.match(/iPhone/i) ? true : false;
            },
            iPad: function() {
                return navigator.userAgent.match(/iPad/i) ? true : false;
            },
            iPod: function() {
                return navigator.userAgent.match(/iPod/i) ? true : false;
            },
    	    Windows: function() {
    	        return navigator.userAgent.match(/IEMobile/i) ? true : false;
    	    },
            iOS: function() {
                return (isMobile.iPhone() || isMobile.iPad() || isMobile.iPod());
            },
    	    any: function() {
    	        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    	    }
    	};
	    
	    function checkDevice() {
		    if (isMobile.Android()) {
		    	document.getElementById("android_link").style.display = "block";
		    } else if (isMobile.iOS()) {
		    	document.getElementById("iphone_link").style.display = "block";
		    };
	    };
	</script>
</head>
<body onload="checkDevice();">
<div class="go_wrap">
    <header class="go_header">
        <div class="nav"><h1>${title}</h1></div>
    </header>
    <div class="go_body">
        <div class="guide">
            <span class="ic_app"></span>
            <p class="subject">${subject}</p>
            <p class="desc">${desc}</p>
            <div id="iphone_link" class="btn_wrap" style="display:none">
                <a href="${iphone}"><span class="btn_major_f" data-role="button"><span class="txt">${download}</span></span></a>
            </div>
            <div id="android_link" class="btn_wrap" style="display:none">
                <a href="${android}"><span class="btn_major_f" data-role="button"><span class="txt">${download}</span></span></a>
            </div>
            <a href="login"><span class="btn_type3"><span class="txt">${gopc}</span><span></span></span></a>
        </div>
    </div>
</div>
</body>
</html>
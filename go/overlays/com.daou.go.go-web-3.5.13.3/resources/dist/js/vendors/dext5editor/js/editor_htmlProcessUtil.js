function htmlTagRevision(e,t,n){if(0<DEXTTOP.G_CURREDITOR._config.htmlCorrectionLimitLength&&e.length>DEXTTOP.G_CURREDITOR._config.htmlCorrectionLimitLength)return e;var r=e;if(""!=r&&(DEXTTOP.DEXT5.browser.ie&&11>=DEXTTOP.DEXT5.browser.ieVersion||DEXTTOP.DEXT5.browser.gecko))try{var i=r.toLowerCase().indexOf("<body"),s=r.toLowerCase().lastIndexOf("<body");if(-1<i&&-1<s&&i!=s)return e;if("ieplugin"!=DEXTTOP.G_CURREDITOR._config.runtimes&&-1<r.indexOf("mso-fareast-font-family")){var o=RegExp("<[^>]+style=(.*?)>","gi"),u="",i=!1;try{var a=r.match(o);if(a){for(var f=a.length,o=0;o<f;o++)r=r.replace(a[o],"_DEXT_T_S{"+o+"}_");for(o=0;o<f;o++){var l=a[o];-1<l.indexOf("-font-family")&&(l=l.replace("-font-family","-font-dext-family")),s=!1,0>l.indexOf("font-family")&&(s=!0),-1<l.indexOf("-font-dext-family")&&(l=l.replace("-font-dext-family","-font-family")),s&&(l=l.replace(/mso-fareast-font-family/gi,"font-family")),r=r.replace("_DEXT_T_S{"+o+"}_",l)}}}catch(c){i=!0}i&&(r=e)}t&&(r=DEXT5_EDITOR.HTMLParser.RemoveOfficeTag(r,n));var u=r.toLowerCase(),h=realValue2=r,p=u.lastIndexOf("<body"),d=u.indexOf("</body");if(-1<p&&-1<d)try{var v=h.substring(d),m=h.substring(p).indexOf(">"),g=h.substring(0,p+m+1),r=h.substring(p+m+1,d)}catch(y){p=d=-1,r=realValue2}realValue2=null,r=DEXT5_EDITOR.HTMLParser.HTMLtoXML(r,n),-1<p&&-1<d&&(r=g+r+v)}catch(b){return e}else if(r="1"==DEXTTOP.G_CURREDITOR._config.removeComment?r.replace(/(<style[^>]*>\s*\x3c!--)|(\x3c!--.*?--\x3e)|(\x3c!--[\w\W\n\s]+?--\x3e)/gi,"$1"):r.replace(/--\x3e\s</gi,"--><"),"1"==DEXTTOP.G_CURREDITOR._config.removeCarriageReturnInTag)try{for(o=RegExp("(<[^>]*?)\n([^]*?>)","gi");o.test(r);)r=r.replace(o,"$1 $2")}catch(w){}return r}function SetCorrectOfficeHtml(e){var t=e;if(-1<e.indexOf("<meta name=ProgId content=Word.Document>")||-1<e.indexOf('<meta name=Generator content="Microsoft Word'))G_wordProcessorType="DOC",e=GetMsWordHtml(e);else if(-1<e.indexOf("<meta name=ProgId content=Excel.Sheet>"))G_wordProcessorType="XLS",e=GetMsExcelHtml(e);else if(-1<e.indexOf("<meta name=ProgId content=PowerPoint.Slide>")){if(G_wordProcessorType="PPT",e=GetMsPptHtml2(e),"1"==DEXTTOP.G_CURREDITOR._config.removeTdStyleInPastePpt){for(var n=RegExp("<(td|th)([^>]*?)style='([^']*?)(font-size:18.0pt;)([^']*?)'>","gi");n.test(e);)e=e.replace(n,"<$1$2style='$3$5'>");for(n=RegExp('<(td|th)([^>]*?)style="([^"]*?)(font-size:18.0pt;)([^"]*?)">',"gi");n.test(e);)e=e.replace(n,'<$1$2style="$3$5">');for(n=RegExp("<(td|th)([^>]*?)style='([^']*?)(font-family:Arial;)([^']*?)'>","gi");n.test(e);)e=e.replace(n,"<$1$2style='$3$5'>");for(n=RegExp('<(td|th)([^>]*?)style="([^"]*?)(font-family:Arial;)([^"]*?)">',"gi");n.test(e);)e=e.replace(n,'<$1$2style="$3$5">')}}else if(-1<e.indexOf('<meta name=Generator content="Jungum Global">'))G_wordProcessorType="GUL",e=GetJungumHtml(e);else if(isHwpPasteAction(e))G_wordProcessorType="HWP",e=GetHanHwpHtml(e);else if(-1<e.indexOf(' xmlns:m="http://schemas.microsoft.com/office/')){if(G_wordProcessorType="PPT",e=GetMsPptHtml2(e),"1"==DEXTTOP.G_CURREDITOR._config.removeTdStyleInPastePpt){for(n=RegExp("<(td|th)([^>]*?)style=('|\")([^']*?)(font-size:18.0pt;)([^']*?)('|\")>","gi");n.test(e);)e=e.replace(n,"<$1$2style=$3$4$6$7>");for(n=RegExp("<(td|th)([^>]*?)style=('|\")([^']*?)(font-family:Arial;)([^']*?)('|\")>","gi");n.test(e);)e=e.replace(n,"<$1$2style=$3$4$6$7>")}}else-1<e.indexOf('<meta name=Generator content="Microsoft')?(G_wordProcessorType="DOC",e=GetMsWordHtml(e)):DEXTTOP.DEXT5.browser.ie||(t=e.indexOf("<!--StartFragment-->"),n=e.lastIndexOf("<!--EndFragment-->"),-1<t&&-1<n&&(t=e.substr(t+20),n=t.lastIndexOf("<!--EndFragment-->"),-1<n&&(e=t=t.substring(0,n))));return e=DEXTTOP.DEXT5.util.replaceAll(e,"<![if !supportEmptyParas]>",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"<![endif]>",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"<!--[if !supportEmptyParas]-->",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"<!--[if !supportLists]-->",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"<!--[endif]-->",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"<!--StartFragment-->",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"<!--EndFragment-->",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"<![if ppt]>","")}function GetMsWordHtml(e){var t=e,n,t=e.indexOf("/* Style Definitions */"),r=e.indexOf("</head>");-1<t&&-1<r&&(t=e.substr(t+23),r=t.indexOf("</head>"),-1<r&&(n=t.substring(0,r),n=GetStyleMap(n)));var t=e,r=!1,i="<!--StartFragment-->",s="<!--EndFragment-->",o=e.indexOf(i),u=e.indexOf(s);if(-1==o&&-1==u){var i="<body ",s="</body>",a=e.indexOf(i);-1<a&&(u=e.indexOf(">",a),i=e.Mid(a,u-a+1),o=e.indexOf(i),u=e.indexOf(s))}if(-1<o&&-1<u&&(t=e.substr(o+i.length),u=t.indexOf(s),-1<u)){for(;;){if(e=t.indexOf(s,u+s.length),!(-1<e))break;u=e}e=t=t.substring(0,u),r=!0}if(r){e=t;var f="<div class=WordSection1>",s=e.indexOf(f);-1==s&&(f='<div class="WordSection1">',s=e.indexOf(f)),-1<s&&(f=DEXTTOP.DEXT5.util.replaceAll(e,f,""),f.length!=e.length&&(e=f,f=e.lastIndexOf("/"),-1<f&&(e=e.substring(0,f-1)))),i="<!--[if supportFields]>";for(s="<![endif]-->";;){o=e.indexOf(i),-1<o&&(u=e.indexOf(s,o+i.length)),f=e.length;if(o>f||u>f)break;if(!(-1<o&&-1<u))break;if(o<u){var l,t=e.substring(0,o);l=e.substr(u+s.length),e=t+l}u=-1}}if(r){i="<!--[if gte vml 1]>",s="<![if !vml]>";try{o=e.indexOf(i),-1<o&&(u=e.indexOf(s,o+i.length)),-1<o&&-1<u&&(e=e.replace(/\x3c!--\[if gte vml 1\]>(.|\s|\n)*?<!\[if !vml\]>/gi,""))}catch(c){}}i="<!--[if gte mso 9]>",s="<![endif]-->";try{for(;;){o=e.indexOf(i),-1<o&&(u=e.indexOf(s,o+i.length)),f=e.length;if(o>f||u>f){e=DEXTTOP.DEXT5.util.replaceAll(e,i,""),e=DEXTTOP.DEXT5.util.replaceAll(e,s,"");break}if(!(-1<o&&-1<u))break;o>u?(t=e.substring(0,o),l=e.substr(o),t=DEXTTOP.DEXT5.util.replaceAll(t,s,"")):(t=e.substring(0,o),l=e.substr(u+s.length)),e=t+l}}catch(h){}r&&(e=DEXTTOP.DEXT5.util.replaceAll(e,"><![endif]></span>"," /></span>"),e=DEXTTOP.DEXT5.util.replaceAll(e,"<![endif]></span>","</span>"),e=DEXTTOP.DEXT5.util.replaceAll(e,"</span><![endif]>","</span>"),e=DEXTTOP.DEXT5.util.replaceAll(e,"<![endif]>",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"<![if !vml]>","")),e=RepaireSpanInImageTag4MsWord(e);if(0<DEXTTOP.G_CURREDITOR._config.clipImageHex.length){try{var p=RegExp("<img[^>]+file://[^>]+>","gi"),d=e.match(p);if(d){var v=d.length;if(v==DEXTTOP.G_CURREDITOR._config.clipImageHex.length)for(l=0;l<v;l++){var m=DEXTTOP.DEXT5.util.hexToBytes(DEXTTOP.G_CURREDITOR._config.clipImageHex[l].hex),m=DEXTTOP.DEXT5.util.bytesToBase64(m),p=/<img[^>]*src=["']?([^>"']+)["']?[^>]*>/;if(p.test(d[l])){var g=d[l].replace(RegExp.$1,"data:"+DEXTTOP.G_CURREDITOR._config.clipImageHex[l].type+";base64,"+m);e=e.replace(d[l],g)}}}}catch(y){}DEXTTOP.G_CURREDITOR._config.clipImageHex=[]}return e=DEXTTOP.DEXT5.util.replaceAll(e,"<v:rect ","<div "),e=DEXTTOP.DEXT5.util.replaceAll(e,"</v:rect>","</div>"),e=DEXTTOP.DEXT5.util.replaceAll(e,"<v:shadow ","<hr "),e=DEXTTOP.DEXT5.util.replaceAll(e,"<v:shape ","<span "),e=DEXTTOP.DEXT5.util.replaceAll(e,"</v:shape>","</span>"),e=DEXTTOP.DEXT5.util.replaceAll(e,"<v:imagedata","<img border=0"),e=DEXTTOP.DEXT5.util.replaceAll(e,"<![if !supportLists]>",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"<![endif]>",""),e=setPasteClassStyle(n,e,!0)}function GetMsExcelHtml(e){var t=e,n,t=e.indexOf("<style>"),r=e.indexOf("</head>");-1<t&&-1<r&&(t=e.substr(t+7),r=t.indexOf("</head>"),-1<r&&(n=t.substring(0,r),n=GetStyleMap(n)));var t=e,r=!1,i="</body>",s=e.indexOf("<table"),o=e.indexOf(i);-1<s&&-1<o&&(t=e.substr(s),o=t.indexOf(i),-1<o&&(t=t.substring(0,o),r=!0));if(r){r=!1,e=t,t="<!--[if gte vml 1]>",i="<![if !vml]>";try{s=e.indexOf(t),-1<s&&(o=e.indexOf(i,s+t.length)),-1<s&&-1<o&&(e=e.replace(/\x3c!--\[if gte vml 1\]>(.|\s|\n)*?<!\[if !vml\]>/gi,""))}catch(u){}}return r&&(e=DEXTTOP.DEXT5.util.replaceAll(e,"></span><![endif]>"," /></span>"),e=DEXTTOP.DEXT5.util.replaceAll(e,"</span><![endif]>","</span>"),e=DEXTTOP.DEXT5.util.replaceAll(e,"<![endif]>",""),t=_T("<![if !vml]>"),e=DEXTTOP.DEXT5.util.replaceAll(e,t,"")),e=DEXTTOP.DEXT5.util.replaceAll(e,"<v:rect ","<div "),e=DEXTTOP.DEXT5.util.replaceAll(e,"</v:rect>","</div>"),e=DEXTTOP.DEXT5.util.replaceAll(e,"<v:shadow ","<hr "),e=DEXTTOP.DEXT5.util.replaceAll(e,"<v:shape ","<span "),e=DEXTTOP.DEXT5.util.replaceAll(e,"</v:shape>","</span>"),e=DEXTTOP.DEXT5.util.replaceAll(e,"<v:imagedata","<img border=0"),e=DEXTTOP.DEXT5.util.replaceAll(e,"<!--StartFragment-->",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"<!--EndFragment-->",""),t=e.indexOf("<col "),-1<t&&(e=e.substring(0,t)+"\n<colgroup>\n"+e.substring(t,e.length+1)),t=e.indexOf("<tr "),-1<t&&(e=e.substring(0,t)+"\n<tbody>\n"+e.substring(t,e.length+1),t=e.lastIndexOf("</table>"),-1<t&&(e=e.substring(0,t)+"\n</tbody>\n"+e.substring(t,e.length+1))),e=setPasteClassStyle(n,e,!1,!0),"1"==DEXTTOP.G_CURREDITOR._config.officeLineFix&&(e=DEXTTOP.DEXT5.util.replaceAll(e,"border-left:none;",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"border-top:none;",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"border-right:none;",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"border-bottom:none;","")),e=DEXTTOP.DEXT5.util.replaceAll(e,"\r",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"\n","")}function GetMsPptHtml2(e){var t=e,n,t=e.indexOf("<!--tr"),r=e.indexOf("</head>");-1<t&&-1<r&&(t=e.substr(t+6),r=t.indexOf("</head>"),-1<r&&(n=t.substring(0,r),n=GetStyleMap(n))),t=e.indexOf("<!--StartFragment-->"),r=e.indexOf("<!--EndFragment-->");if(-1<t&&-1<r&&(t=e.substr(t+20),r=t.indexOf("<!--EndFragment-->"),-1<r)){for(;;){if(e=t.indexOf("<!--EndFragment-->",r+18),!(-1<e))break;r=e}e=t=t.substring(0,r)}return e=setPasteClassStyle(n,e),"1"==DEXTTOP.G_CURREDITOR._config.officeLineFix&&(e=DEXTTOP.DEXT5.util.replaceAll(e,"border-right:none;","")),n=RegExp("<spanstyle","ig"),e=e.replace(n,"<span style"),e=e.replace(n,"<p style")}function GetJungumHtml(e){if("1"==DEXTTOP.G_CURREDITOR._config.useHtmlProcessByWorker)return e;var t=e.indexOf("<body>"),n=e.indexOf("</body>"),r=!1;-1<t&&-1<n&&(strTemp=e.substr(t+6),n=strTemp.indexOf("</body>"),-1<n&&(e=strTemp=strTemp.substring(0,n),r=!0));if(r){t=document.createElement("div"),t.innerHTML=e,e=t.getElementsByTagName("table");for(var n=e.length,i,s,r=0;r<n;r++)""!=e[r].getAttribute("width")&&(i=parseInt(e[r].getAttribute("width"),10)),""!=e[r].getAttribute("height")&&(s=parseInt(e[r].getAttribute("height"),10)),i&&(e[r].style.width=i+"px"),s&&(e[r].style.height=s+"px");e=t.innerHTML}return e}function GetHanHwpHtml(e){var t=e,t="><!--p.0",n="</head>",r,i=e.indexOf(t),s=e.indexOf(n);-1==i&&(t=">\r\n<!--p.0",i=e.indexOf(t)),-1==i&&(t="<!--p.0",i=e.indexOf(t)),-1==s&&(n="</HEAD>",s=e.indexOf(n)),-1<i&&-1<s&&(t=e.substr(i+(t.length-3)),s=t.indexOf(n),-1<s&&(r=t.substring(0,s),r=GetStyleMap(r)));var t=e,o=!1,u="<!--StartFragment-->",n="<!--EndFragment-->",s=e.indexOf(u),i=e.indexOf(n);if(-1<s&&-1<i&&(t=e.substr(s+u.length),i=t.indexOf(n),-1<i)){for(;;){if(o=t.indexOf(n,i+n.length),!(-1<o))break;i=o}t=t.substring(0,i),o=!0}if(o){o=!1,e=t,u="<!--[if gte vml 1]>",n="<![if !vml]>";try{for(;;){s=e.indexOf(u),-1<s&&(i=e.indexOf(n,s+u.length));var a=e.length;if(a>s||a>i){e=DEXTTOP.DEXT5.util.replaceAll(e,u,""),e=DEXTTOP.DEXT5.util.replaceAll(e,n,"");break}if(!(-1<s&&-1<i))break;if(s>i){var f,t=e.substring(0,s);f=e.substr(s),t=DEXTTOP.DEXT5.util.replaceAll(t,n,""),e=t+f}else t=e.substring(0,s),f=e.substr(i+n.length),e=t+f,o=!0}}catch(l){}}e=setPasteClassStyle(r,e),o&&(e=DEXTTOP.DEXT5.util.replaceAll(e,"/><![endif]>"," />"),e=DEXTTOP.DEXT5.util.replaceAll(e,"</span><![endif]>","</span>"),e=DEXTTOP.DEXT5.util.replaceAll(e,"<![endif]>",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"<![if !vml]>","")),e=DEXTTOP.DEXT5.util.replaceAll(e,"<![if !supportEmptyParas]>&nbsp;<![endif]>",""),e=DEXTTOP.DEXT5.util.replaceAll(e,"<![endif]>","");for(a=RegExp("(<p [^>]*)(background:#000000;)","gi");a.test(e);)e=e.replace(a,"$1");for(a=RegExp("(<[^>]*)(background:#ffffff;)","gi");a.test(e);)e=e.replace(a,"$1");for(a=RegExp("(<[^>]*)(mso-fareast-)","gi");a.test(e);)e=e.replace(a,"$1");for(a=RegExp("(<[^>]*)(mso-hansi-)","gi");a.test(e);)e=e.replace(a,"$1");for(a=RegExp("(<[^>]*)(mso-ascii-)","gi");a.test(e);)e=e.replace(a,"$1");for(a=RegExp("(<[^>]*)(mso-bidi-)","gi");a.test(e);)e=e.replace(a,"$1");for(a=RegExp("(<[^>]*)(mso-)","gi");a.test(e);)e=e.replace(a,"$1");return e}function GetStyleMap(e){var t={};e=e.split("}");for(var n="",r=e.length,i=0;i<r;i++){var s=e[i].split("{"),o=s.length;if(2==o)for(var u=0;u<o-1;u++){var a=s[u],f=s[u+1],a=a.replace(/\r\n/g,""),a=a.replace(/\r/g,""),a=a.replace(/\n/g,""),a=a.replace(/\t/g,""),f=f.replace(/\r\n/g,""),f=f.replace(/\r/g,""),f=f.replace(/\n/g,""),f=f.replace(/\t/g,"");""==n&&"td"==a&&(n=f=DEXTTOP.DEXT5.util.replaceAll(f,"'",'"')),0<a.length&&(f=DEXTTOP.DEXT5.util.replaceAll(f,"'",'"'),"."==a.substring(0,1)&&0<n.length?(f=f.replace(/font-family:&quot,/g,"font-family:"),t[a]=n+f):t[a]=f)}}return t}function RepaireSpanInImageTag4MsWord(e){for(var t,n,r,i,s;;){if(t="<v:shape ",n=e.indexOf(t),-1==n&&(t="<v:shape\r\n",n=e.indexOf(t)),!(-1<n))break;if(r=e.indexOf("</v:shape>",n+t.length),i=e.indexOf("<v:imagedata",n+t.length),!(-1<r&&-1<i&&i<r))break;if(s=e.indexOf("/>",i+12),!(-1<s))break;i=e.substring(0,n),n=e.substr(n,s-n+2),e=e.substr(r+10),n=DEXTTOP.DEXT5.util.replaceAll(n,"<v:imagedata"," "),n=DEXTTOP.DEXT5.util.replaceAll(n,t,"<v:imagedata "),n=DEXTTOP.DEXT5.util.replaceAll(n,">"," "),n=DEXTTOP.DEXT5.util.rtrim(n),n+=">",n=DEXTTOP.DEXT5.util.replaceAll(n,"/>"," />"),n=DEXTTOP.DEXT5.util.replaceAll(n,"  "," "),e=i+n+e}return e}function setPasteClassStyle(e,t,n,r){var i=function(e){return e=DEXTTOP.DEXT5.util.replaceAll(e,"hairline ","dotted "),e=DEXTTOP.DEXT5.util.replaceAll(e," hairline;"," dotted;"),e=DEXTTOP.DEXT5.util.replaceAll(e,"dot-dot-dash ","dotted "),e=DEXTTOP.DEXT5.util.replaceAll(e," dot-dot-dash;"," dotted;"),e=DEXTTOP.DEXT5.util.replaceAll(e,"dot-dash ","dotted "),e=DEXTTOP.DEXT5.util.replaceAll(e," dot-dash;"," dotted;"),e=DEXTTOP.DEXT5.util.replaceAll(e,"dot-dash-slanted ","dotted "),e=DEXTTOP.DEXT5.util.replaceAll(e," dot-dash-slanted;"," dotted;")};if(r&&null!=e.td){var s=i(e.td);t=t.replace(RegExp("(<td[^>]*(.*?))","gi"),function(e){return 0>e.indexOf("class")?setStyleToNonClass(e,"td",s):e})}for(var o in e){r=i(e[o]),o=o.split(",")[0],o=o.substring(o.indexOf("."));if("."==o.substring(0,1)){var u=new RegExp("<[^>]*class=(\"|'|)"+o.substr(1)+"(\"|'|) [\\s\\S]*?>","i");t=setStyleToClass(t,u,o,r),u=new RegExp("<[^>]*class=(\"|'|)"+o.substr(1)+"(\"|'|)>","i"),t=setStyleToClass(t,u,o,r)}if(n&&(u=o.toLowerCase(),(-1<u.indexOf("h1")||-1<u.indexOf("h2")||-1<u.indexOf("h3")||-1<u.indexOf("h4")||-1<u.indexOf("h5")||-1<u.indexOf("h6")||-1<u.indexOf("em"))&&""!=r&&(u=new RegExp("<"+o+"[^>]*>","igm"),u=t.match(u))))for(var a=u.length,f=0;a>f;f++){var l=t.substring(0,t.indexOf(u[f])),c=u[f];t=t.substring(t.indexOf(u[f])+u[f].length);var h=/(style=("|'|))/i,c=1==h.test(c)?c.replace(h,RegExp.$1+r):c.replace(new RegExp("<"+o,"i"),"<"+o+" style='"+r+"'");t=l+c+t}}return t}function setStyleToClass(e,t,n,r){for(var i;i=t.exec(e);){var s=e.substring(0,i.index),o=i[0].toString();e=e.substr(i.index+i[0].length),i=/style=("|'|)/i;if(1==i.test(o)){var u=RegExp.$1;"'"==u?r=r.replace(/'/gi,'"'):'"'==u&&(r=r.replace(/"/gi,"'")),o=o.replace(i,"style="+u+r+" "),i=new RegExp("class=(\"|'|)"+n.substr(1)+"(\"|'|)","i"),o=o.replace(i,"")}else i=new RegExp("class=(\"|'|)"+n.substr(1)+"(\"|'|)","i"),o=o.replace(i,"style='"+r+"'");e=s+o+e}return e}function setStyleToNonClass(e,t,n){t=/style=("|'|)/i;if(1==t.test(e)){var r=RegExp.$1;"'"==r?n=n.replace(/'/gi,'"'):'"'==r&&(n=n.replace(/"/gi,"'")),e=e.replace(t,"style="+r+n+" ")}else e+=" style='"+n+"'";return e}function GetFontSizeForWordH1ToH7Tag(e){var t="",n=e.indexOf("font-size");return-1<n&&(e=e.substr(n),n=e.indexOf(";"),-1<n&&(t=e.substring(0,n),t+=";")),t}function isHwpPasteAction(e){return-1<e.indexOf("><!--p.")||-1<e.indexOf('<META NAME="Generator" CONTENT="Hancom HWP')||-1<e.indexOf("<!--[if !supportEmptyParas]-->")?!0:!1}var G_wordProcessorType="";"undefined"!=typeof DEXTTOP.DEXT5&&"undefined"==typeof DEXTTOP.DEXT5.util.officeClean&&(DEXTTOP.DEXT5.util.officeClean=function(e,t){if(""==e||void 0==e)return"";var n=null,r=[];e=e.replace(/\.0px/g,"px"),e=e.replace(/\t/g,""),e=DEXTTOP.DEXT5.util.removeOfficeDummyTag(e,"<!--[if supportFields]>","<![endif]-->"),n=RegExp("<o:p></o:p>","gi"),e=e.replace(n,""),n=RegExp("<o:p>\\s+</o:p>","gi"),e=e.replace(n,""),n=RegExp("<o:p ([^>]+)></o:p>","gi"),e=e.replace(n,""),n=RegExp("<o:p ([^>]+)>\\s+</o:p>","gi"),e=e.replace(n,""),n=RegExp("<w:sdt[^>]*>","gi"),e=e.replace(n,""),n=RegExp("</w:sdt>","gi"),e=e.replace(n,""),n=RegExp('<[^>]+(lang=["]?en-us["])[^>]*>',"gi");if(n=e.match(n))for(var r=n.length,i=0;i<r;i++){var s=n[i],o=RegExp('\\slang=[\\"]?en-us[\\"]?',"gi"),s=s.replace(o,"");e=e.replace(n[i],s)}n=RegExp("<[^>]+(mso)[^>]*>","gi");if(n=e.match(n))for(r=n.length,i=0;i<r;i++)s=n[i],"1"==DEXTTOP.G_CURREDITOR._config.removeMsoClass&&(o=RegExp('\\sclass=[\\"]?(mso)\\w+[\\"]?',"gi"),s=s.replace(o,"")),s=s.replace(/&quot;/gi,"^"),o=RegExp('(\\s+)?mso-number-format:(\\s+)?"(.+?)"(\\s+)?;',"gi"),s=s.replace(o,""),o=RegExp('(\\s+)?mso-number-format:(\\s+)?"(.+?)"(\\s+)?;?',"gi"),s=s.replace(o,""),o=RegExp("\\s?mso-[\\w\uac00-\ud7a3\\-: ?'\"\\^@%\\.\\\\_]+; ?","gi"),s=s.replace(o,""),o=RegExp("\\s?mso-[\\w\uac00-\ud7a3\\-: ?]+(['\"])","gi"),s=s.replace(o,"$1"),s=s.replace(/\^/gi,"&quot;"),e=e.replace(n[i],s);e=DEXTTOP.DEXT5.util.replaceAll(e,"hairline","dotted");for(i=0;5>i;i++){r=["o:p","span","font"],o=r.length;for(s=0;s<o;s++)n=new RegExp("<"+r[s]+"[^>]*></"+r[s]+">","gi"),e=e.replace(n,""),n=new RegExp("<"+r[s]+"[^>]*>&nbsp;</"+r[s]+">","gi"),e=e.replace(n,"&nbsp;"),"span"!=r[s]&&(n=new RegExp("<"+r[s]+"[^>]*> </"+r[s]+">","gi"),e=e.replace(n,"&nbsp;"));r=["o","v","w","m","x"],o=r.length;for(s=0;s<o;s++)0==s&&(e=e.replace(/<o:p/gi,"<dexto:p")),-1<e.indexOf("<"+r[s])&&(n=new RegExp("<"+r[s]+":[^/>]+/>","gi"),e=e.replace(n,""),n=new RegExp("<"+r[s]+":[^>]+>[^<]*</"+r[s]+":[^>]+>","gi"),e=e.replace(n,""),"v"==r[s]&&(n=new RegExp("<"+r[s]+":[^>]+>","gi"),e=e.replace(n,""),n=new RegExp("</"+r[s]+":[^>]+>","gi"),e=e.replace(n,""))),s==o-1&&(e=e.replace(/<dexto:p/gi,"<o:p"))}e=e.replace(/style=""/gi,""),e=e.replace(/style=''/gi,""),e=e.replace(/\s>/gi,">"),e=DEXTTOP.DEXT5.util.replaceOneSpaceToNbsp(e),e=e.replace(/<\/td>&nbsp;<\/tr>/g,"</td></tr>"),e=e.replace(/<\/td>&nbsp;<\/td>/g,"</td></td>"),e=e.replace(/<\/th>&nbsp;<\/tr>/g,"</th></tr>"),e=e.replace(/<\/th>&nbsp;<\/th>/g,"</th></th>");if(DEXTTOP.DEXT5.browser.ie&&10>DEXTTOP.DEXT5.browser.ieVersion){var n=e.length,s=r=!1,u=o="",a="";if(-1==e.indexOf("<")&&-1==e.indexOf(">"))for(i=0;i<n;i++)o=e.charAt(i),u=e.charAt(i+1)," "!=o&&32!=o.charCodeAt(0)||" "!=u&&32!=u.charCodeAt(0)||(o="&nbsp;"),a+=o;else for(i=0;i<n;i++)o=e.charAt(i),u=e.charAt(i+1),"<"==o?(r=!1,s="p"==u.toLowerCase()?!0:!1):">"==o&&1==s?r=!0:1!=r||" "!=o&&32!=o.charCodeAt(0)||" "!=u&&32!=u.charCodeAt(0)||(o="&nbsp;"),a+=o;e=a}return 0==t&&(e=DEXTTOP.DEXT5.util.removeLocalFileImage(e)),e}),"undefined"!=typeof DEXTTOP.DEXT5&&"undefined"==typeof DEXTTOP.DEXT5.util.removeLocalFileImage&&(DEXTTOP.DEXT5.util.removeLocalFileImage=function(e){return""==e||void 0==e?"":e=e.replace(RegExp("<img[^>]+file:///[^>]+>","gi"),"")}),"undefined"!=typeof DEXTTOP.DEXT5&&"undefined"==typeof DEXTTOP.DEXT5.util.removeOfficeDummyTag&&(DEXTTOP.DEXT5.util.removeOfficeDummyTag=function(e,t,n){var r=e;try{for(var i=e.indexOf(t),s=e.indexOf(n);-1<i&&-1<s;)var o=r.substring(0,i),u=r.substring(s+n.length),r=o+u,i=r.indexOf(t),s=r.indexOf(n)}catch(a){r=e}return r}),"undefined"!=typeof DEXTTOP.DEXT5&&"undefined"==typeof DEXTTOP.DEXT5.util.replaceAll&&(DEXTTOP.DEXT5.util.replaceAll=function(e,t,n){return e&&""!=e&&(e=e.split(t).join(n)),e}),"undefined"!=typeof DEXTTOP.DEXT5&&"undefined"==typeof DEXTTOP.DEXT5.util.replaceOneSpaceToNbsp&&(DEXTTOP.DEXT5.util.replaceOneSpaceToNbsp=function(e){var t=e,n,r="";try{for(var i="span font a b strong i em strike u sup sub".split(" "),s=i.length,o=0;o<s;o++){var u=!0,a=i[o];("font"==a||"b"==a||"em"==a||"sup"==a||"sub"==a)&&0>t.toLowerCase().indexOf("<"+a)&&(u=!1);if(u)for(var f=0;f<s;f++){r=t,n=new RegExp("<"+i[o]+" *([^>?+])*>(\\s+)</"+i[f]+">","gi"),reg_exp2="u"==i[f]?new RegExp("</"+i[o]+">(\\s+)<"+i[f]+"[^l]","gi"):new RegExp("</"+i[o]+">(\\s+)<"+i[f]+" *([^>?+])*>","gi"),reg_exp3=new RegExp("<"+i[o]+" *([^>?+])*>(\\s+)<"+i[f]+">","gi"),reg_exp4="u"==i[f]?new RegExp("</"+i[o]+">(\\s+)</"+i[f]+"[^l]","gi"):new RegExp("</"+i[o]+">(\\s+)</"+i[f]+" *([^>?+])*>","gi");try{var l=t.match(n);if(l)for(var c=l.length,h=0;h<c;h++){var p=l[h];if(!("b"==i[o]&&-1<p.toLowerCase().indexOf("<br")))var d=/>\s+</.exec(p),v=d[0].replace(RegExp("\\s\\s","gi"),"&nbsp;&nbsp;"),p=p.replace(d,v),t=t.replace(l[h],p)}if(l=t.match(reg_exp2))for(c=l.length,h=0;h<c;h++)p=l[h],"b"==i[f]&&-1<p.toLowerCase().indexOf("<br")||(d=/>\s+</.exec(p),v=d[0].replace(RegExp("\\s\\s","gi"),"&nbsp;&nbsp;"),p=p.replace(d,v),t=t.replace(l[h],p));if(l=t.match(reg_exp3))for(c=l.length,h=0;h<c;h++)p=l[h],"b"==i[o]&&-1<p.toLowerCase().indexOf("<br")||(d=/>\s+</.exec(p),v=d[0].replace(RegExp("\\s\\s","gi"),"&nbsp;&nbsp;"),p=p.replace(d,v),t=t.replace(l[h],p));if(l=t.match(reg_exp4))for(c=l.length,h=0;h<c;h++)p=l[h],d=/>\s+</.exec(p),v=d[0].replace(RegExp("\\s\\s","gi"),"&nbsp;&nbsp;"),p=p.replace(d,v),t=t.replace(l[h],p)}catch(m){t=r}}}for(o=0;o<s;o++)if(u=!0,a=i[o],("font"==a||"b"==a||"em"==a||"sup"==a||"sub"==a)&&0>r.toLowerCase().indexOf("<"+a)&&(u=!1),u){"b"==a?(t=t.replace(/<br/gi,"<temp_br"),t=t.replace(/<\/br/gi,"</temp_br")):"u"==a&&(t=t.replace(/<ul/gi,"<temp_ul"),t=t.replace(/<\/ul/gi,"</temp_ul"));for(f=0;f<s;f++)n=new RegExp("/"+i[o]+">\\s<"+i[f],"gi"),t=t.replace(n,"/"+i[o]+">&nbsp;<"+i[f]),n=new RegExp("/"+i[o]+">\\s\\n<"+i[f],"gi"),t=t.replace(n,"/"+i[o]+">&nbsp;<"+i[f]);"b"==a?(t=t.replace(/<temp_br/gi,"<br"),t=t.replace(/<\/temp_br/gi,"</br")):"u"==a&&(t=t.replace(/<temp_ul/gi,"<ul"),t=t.replace(/<\/temp_ul/gi,"</ul"))}}catch(g){t=e}return t}),"undefined"!=typeof DEXTTOP.DEXT5&&"undefined"==typeof DEXTTOP.DEXT5.util.rtrim&&(DEXTTOP.DEXT5.util.rtrim=function(e){return""==e?e:e.replace(/\s+$/,"")}),"undefined"!=typeof DEXTTOP.DEXT5&&"undefined"==typeof DEXTTOP.DEXT5.util.hexToBytes&&(DEXTTOP.DEXT5.util.hexToBytes=function(e){for(var t=[],n=e.length/2,r=0,r=0;r<n;r++)t.push(parseInt(e.substr(2*r,2),16));return t}),"undefined"!=typeof DEXTTOP.DEXT5&&"undefined"==typeof DEXTTOP.DEXT5.util.bytesToBase64&&(DEXTTOP.DEXT5.util.bytesToBase64=function(e){for(var t="",n=e.length,r=0;r<n;r+=3){var i=e.slice(r,r+3),s=i.length,o=[],u=void 0;if(3>s)for(u=s;3>u;u++)i[u]=0;o[0]=(252&i[0])>>2,o[1]=(3&i[0])<<4|i[1]>>4,o[2]=(15&i[1])<<2|(192&i[2])>>6,o[3]=63&i[2];for(u=0;4>u;u++)t+=u<=s?"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(o[u]):"="}return t});var htmlProcessUtilFunctionList={};htmlProcessUtilFunctionList.htmlTagRevision=htmlTagRevision,htmlProcessUtilFunctionList.SetCorrectOfficeHtml=SetCorrectOfficeHtml,htmlProcessUtilFunctionList.GetMsWordHtml=GetMsWordHtml,htmlProcessUtilFunctionList.GetMsExcelHtml=GetMsExcelHtml,htmlProcessUtilFunctionList.GetMsPptHtml2=GetMsPptHtml2,htmlProcessUtilFunctionList.GetJungumHtml=GetJungumHtml,htmlProcessUtilFunctionList.GetHanHwpHtml=GetHanHwpHtml,htmlProcessUtilFunctionList.GetStyleMap=GetStyleMap,htmlProcessUtilFunctionList.RepaireSpanInImageTag4MsWord=RepaireSpanInImageTag4MsWord,htmlProcessUtilFunctionList.setPasteClassStyle=setPasteClassStyle,htmlProcessUtilFunctionList.setStyleToClass=setStyleToClass,htmlProcessUtilFunctionList.GetFontSizeForWordH1ToH7Tag=GetFontSizeForWordH1ToH7Tag,htmlProcessUtilFunctionList.isHwpPasteAction=isHwpPasteAction,htmlProcessUtilFunctionList["DEXTTOP.DEXT5.util.officeClean"]=DEXTTOP.DEXT5.util.officeClean;
function checkScript(){var e=navigator.userAgent;return e.indexOf("Macintosh")!=-1&&e.indexOf("Chrome")?!1:e.indexOf("Macintosh")!=-1&&e.indexOf("Safari")?!1:!0}function setKey(e,t){t="SG_OpenWebKit";var n=checkScript();try{n||(SGXML=document.getElementById(t))}catch(r){alert("Exception getting applet object:\n"+r)}_decoder=new ReplacementFor_kica.ReplacementFor_license.ReplacementFor_licenseDecoder(e);try{_decoder.ReplacementFor_init()}catch(r){alert(r)}try{param1=_decoder.ReplacementFor_getSHA_D(),param2=_decoder.ReplacementFor_licensecode,param3=_decoder.ReplacementFor_getScrRkey()}catch(r){alert(r)}try{n||SGXML.setR(param1,param2,param3)}catch(r){alert("Exception executing applet method setR()\n"+r)}}function setRandom(e){_decoder.ReplacementFor_setAppDecode(e)}function getMac(e){return _decoder.ReplacementFor_getMac(e)}var _decoder,SGXML,param1,param2,param3;
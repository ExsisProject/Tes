
function makePoweruploadOcx(id,locale){
	var pstr = "<object "
	+"ID = 'TPOWERUPLOAD' "
	+"NAME = 'powerupload' id='powerupload' width='100%' height='100px' style='z-index:-100;' "
	+"classid='clsid:E998F99D-CF15-4FDC-853D-B1BB4649E0A8' "
	+"CODEBASE='"+hostInfo+"/resources/ocxcab/TWebPowerUp.cab#version=1,3,4,5'>"
	+"<param name='lang' value='"+locale+"'>"
	+"</object>"
	;
	
	jQuery("#"+id).html(pstr);	
}

function makeNormalUploadOcx(id,locale){
	var pstr = "<object "
	+"ID = 'TPOWERUPLOAD' "
	+"NAME = 'powerupload' id='powerupload' width='100%' height='100px' style='z-index:-100;' "
	+"classid='clsid:E998F99D-CF15-4FDC-853D-B1BB4649E0A8' "
	+"CODEBASE='"+hostInfo+"/resources/ocxcab/TWebPowerUp.cab#version=1,3,4,5'>"
	+"<param name='lang' value='"+locale+"'>"
	+"<param name='style' value='normal'>"
	+"</object>"
	;
	
	jQuery("#"+id).html(pstr);	
}

function makeWebToLocalOcx(id, locale){
	locale = (locale == "jp")?"en":locale;
	var ocxStr ='<object '
	 +'ID="LocalMailAPI" '
	 +'name="sendOcxApi" '
	 +'classid="clsid:65D100C9-E47C-4C0E-8197-A99EF3765B06" '
	 +'CODEBASE="'+hostInfo+'/resources/ocxcab/TWebMail.cab#version=1,0,0,5" '
	// +'CODEBASE="TWebMail.cab#version=1,0,0,1" '
	 +'width="0" height="0"> '
	 +'<param name="moduletype" value="api"> '
	 +'<param name="lang" value="'+locale+'"> '
	+'</object>';
	
	jQuery("#"+id).html(ocxStr);
}

function makeLocalMailBox(id, email,hostInfo,locale){
	locale = (locale == "jp")?"en":locale;
	var ocxStr = '<object '
   +'ID="LocalMailBox" '
   +'name="localmail" '
   +'classid="clsid:65D100C9-E47C-4C0E-8197-A99EF3765B06" '
   +'CODEBASE="'+hostInfo+'/resources/ocxcab/TWebMail.cab#version=1,0,0,5" '
  // +'CODEBASE="./TWebMail.cab#version=1,0,0,1" '
   +'width="100%" height="700"> '
   +'<param name="moduletype" value="ctrl"> '
   +'<param name="cmdbar" value="toolbar"> '
   +'<param name="account" value="'+email+'"> '
   +'<param name="webfolder" value="'+hostInfo+'/mail/localToFolderList.action"> '
   +'<param name="movemessage" value="'+hostInfo+'/mail/moveLocalMessage.action"> '
   +'<param name="sendurl" value="'+hostInfo+'/mail/writeForLocalMessage.action">'
   +'<param name="lang" value="'+locale+'"> '
   +'</object> ';	

	jQuery("#"+id).html(ocxStr); 
}

function makeMessageUploadOcx(id,locale){
	var pstr = "<object "
		+"ID = 'TMESSAGEUPLOAD' "
		+"NAME = 'messageupload' id='messageupload' width='0' height='0' style='z-index:-100;' "
		+"classid='clsid:E998F99D-CF15-4FDC-853D-B1BB4649E0A8' "
		+"CODEBASE='"+hostInfo+"/resources/ocxcab/TWebPowerUp.cab#version=1,3,4,5'>"
		+"<param name='lang' value='"+locale+"'>"
		+"<param name='style' value='normal'>"
		+"</object>"
		;
		
	jQuery("#"+id).html(pstr);	
}

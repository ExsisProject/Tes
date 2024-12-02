
function makePoweruploadOcx(id,locale){	
	locale = (locale == "jp")?"en":locale;
	var pstr = "<object "
	+"ID = 'TPOWERUPLOAD' "
	+"NAME = 'powerupload' id='powerupload' width='100%' height='100px' style='z-index:-100;' "
	+"classid='clsid:E998F99D-CF15-4FDC-853D-B1BB4649E0A8' "
	+"CODEBASE='"+hostInfo+"/resources/ocxcab/TWebPowerUp.cab#version={TWebPowerUp}'>"
	+"<param name='lang' value='"+locale+"'>"
	+"</object>"
	;
	
	$(id).innerHTML = pstr;	
}

function makeNormalUploadOcx(id,locale){
	locale = (locale == "jp")?"en":locale;
	var pstr = "<object "
	+"ID = 'TPOWERUPLOAD' "
	+"NAME = 'powerupload' id='powerupload' width='100%' height='100px' style='z-index:-100;' "
	+"classid='clsid:E998F99D-CF15-4FDC-853D-B1BB4649E0A8' "
	+"CODEBASE='"+hostInfo+"/resources/ocxcab/TWebPowerUp.cab#version={TWebPowerUp}'>"
	+"<param name='lang' value='"+locale+"'>"
	+"<param name='style' value='normal'>"
	+"</object>"
	;
	
	$(id).innerHTML = pstr;	
}

function makeWebToLocalOcx(id, locale){
	locale = (locale == "jp")?"en":locale;
	var ocxStr ='<object '
	 +'ID="LocalMailAPI" '
	 +'name="sendOcxApi" '
	 +'classid="clsid:65D100C9-E47C-4C0E-8197-A99EF3765B06" '
	 +'CODEBASE="'+hostInfo+'/resources/ocxcab/TWebMail.cab#version={TWebMail}" '
	// +'CODEBASE="TWebMail.cab#version=1,0,0,1" '
	 +'width="0" height="0"> '
	 +'<param name="moduletype" value="api"> '
	 +'<param name="lang" value="'+locale+'"> '
	+'</object>';
	
	$(id).innerHTML = ocxStr;
}

function makeLocalMailBox(id, email,hostInfo,locale){
	locale = (locale == "jp")?"en":locale;
	var ocxStr = '<object '
   +'ID="LocalMailBox" '
   +'name="localmail" '
   +'classid="clsid:65D100C9-E47C-4C0E-8197-A99EF3765B06" '
   +'CODEBASE="'+hostInfo+'/resources/ocxcab/TWebMail.cab#version={TWebMail}" '
  // +'CODEBASE="./TWebMail.cab#version=1,0,0,1" '
   +'width="100%" height="700"> '
   +'<param name="moduletype" value="ctrl"> '
   +'<param name="cmdbar" value="toolbar"> '
   +'<param name="account" value="'+email+'"> '
   +'<param name="webfolder" value="'+hostInfo+'/mail/localToFolderList.do"> '
   +'<param name="movemessage" value="'+hostInfo+'/mail/moveLocalMessage.do"> '
   +'<param name="sendurl" value="'+hostInfo+'/mail/writeForLocalMessage.do"> '
   +'<param name="lang" value="'+locale+'"> '
   +'</object> ';
	
   $(id).innerHTML = ocxStr;
   
}

function makeMessageUploadOcx(id,locale){
	locale = (locale == "jp")?"en":locale;
	var pstr = "<object "
		+"ID = 'TMESSAGEUPLOAD' "
		+"NAME = 'messageupload' id='messageupload' width='0' height='0' style='z-index:-100;' "
		+"classid='clsid:E998F99D-CF15-4FDC-853D-B1BB4649E0A8' "
		+"CODEBASE='"+hostInfo+"/resources/ocxcab/TWebPowerUp.cab#version={TWebPowerUp}'>"
		+"<param name='lang' value='"+locale+"'>"
		+"<param name='style' value='normal'>"
		+"</object>"
		;
		
		$(id).innerHTML = pstr;		
}

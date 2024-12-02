/************************JodalUtilApplet*****************************/
function SGJ_getVersion()
{
	var SG = document.getElementById(object_id);
	return SG.getVersion();
}

function SGJ_getVersionDlg()
{
	var SG = document.getElementById(object_id);
	SG.getVersionDlg();
	return;
}

/***********************JodalLoginApplet*****************************/
/**
* 
* @param type						Message Type
* @param data						Original Plain Message
* @param encAlgorithm		Cipher Algorithm
* @param signAlgorithm	Signature Algorithm
* @return PKCS#7 Signed, Enveloped, Signed And Enveloped Message
*/
function SGJ_getLoginInfo( strUserID )
{
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getLoginInfo()" );
		return "";
	}
	
	var loginInfo = SG.getLoginInfo( strUserID );
	if ( isNull(loginInfo) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getLoginInfo()" );
		return "";
	}
	return loginInfo;
}

function SGJ_getLoginInfoUseCert( strUserID, strKmCert )
{
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(strKmCert) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getLoginInfoUseCert()" );
		return "";
	}
	
	self.focus();
	var loginInfo = SG.getLoginInfoUseCert( strUserID, strKmCert );
	if ( isNull(loginInfo) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getLoginInfoUseCert()" );
		return "";
	}
	return loginInfo;
}

function SGJ_getLoginInfoUsePasswd( strUserID, userID, passwd )
{
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID)  || isNull(userID) || isNull(passwd) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getLoginInfoUsePasswd()" );
		return "";
	}
	
	var loginInfo = SG.getLoginInfoUsePasswd( strUserID, userID, passwd );
	if ( isNull(loginInfo) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getLoginInfoUsePasswd()" );
		return "";
	}
	return loginInfo;
}

/**********************JodalSignEnvApplet****************************/
/**
* PKCS#7 Message Generating Method
* @param type						Message Type
* @param data						Original Plain Message
* @param encAlgorithm		Cipher Algorithm
* @param signAlgorithm	Signature Algorithm
* @return PKCS#7 Signed, Enveloped, Signed And Enveloped Message
*/
function SGJ_getPKCS7Data( strUserID, type, kmCert, strMessage )
{
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(type)  || isNull(kmCert) || isNull(strMessage)  )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getPKCS7Data()" );
		return "";
	}
	
	var pkcs7Data = SG.getPKCS7Data( strUserID, type, kmCert, strMessage );
	if ( isNull(pkcs7Data) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getPKCS7Data()" );
		return "";
	}
	return pkcs7Data;
}

function SGJ_signEnvInit( strUserID, kmCert )
{
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(kmCert) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_signEnvInit()" );
		return "";
	}
	
	var strEncryptedSessionKey = SG.signEnvInit( strUserID, kmCert );
	if ( isNull(strEncryptedSessionKey) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_signEnvInit()" );
		return "";
	}
	return strEncryptedSessionKey;
}

function SGJ_signEnvUpdate( strUserID, strMessage )
{
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(strMessage) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_signEnvUpdate()" );
		return "";
	}

	var encStr = SG.signEnvUpdate( strUserID, strMessage );	
	if ( isNull(encStr) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_signEnvUpdate()" );
		return "";
	}
	return encStr;
}

function SGJ_signEnvFinal( strUserID )
{
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_signEnvFinal()" );
		return "";
	}
	
	var strSignValue = SG.signEnvFinal( strUserID );
	if ( isNull(strSignValue) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_decryptRSA()" );
		setErrorFunction( "SGJ_signEnvFinal()" );
		return "";
	}
	return strSignValue;
}

function SGJ_env_encrypt( inputFile, outputFile )
{
	var SG = document.getElementById(object_id);
	if ( isNull(inputFile) || isNull(outputFile) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_env_encrypt()" );
		return false;
	}
	
	var bReturn = SG.env_encrypt( inputFile, outputFile );	
	if( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_env_encrypt()" );
		return bReturn;
	}
	return bReturn;
}

function SGJ_env_encrypt2( strUserID, inputFile, outputFile )
{
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(inputFile) || isNull(outputFile) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_env_encrypt2()" );
		return false;
	}
	
	var bReturn = SG.env_encrypt2( strUserID, inputFile, outputFile );	
	if( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_env_encrypt2()" );
		return bReturn;
	}
	return bReturn;
}

function SGJ_env_decrypt( inputFile, outputFile )
{
	var SG = document.getElementById(object_id);
	if ( isNull(inputFile) || isNull(outputFile) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_env_decrypt()" );
		return false;
	}
	
	var bReturn = SG.env_decrypt( inputFile, outputFile );	
	if( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_env_decrypt()" );
		return false;
	}
	return bReturn;
}

function SGJ_env_decrypt2( strUserID, inputFile, outputFile )
{
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(inputFile) || isNull(outputFile) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_env_decrypt2()" );
		return false;
	}
	
	var bReturn = SG.env_decrypt2( strUserID, inputFile, outputFile );	
	if( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_env_decrypt2()" );
		return false;
	}
	return bReturn;
}

/***********************JodalIssuerApplet****************************/
function SGJ_setUserConfiguration( policyOid, raIp, raPort, caIp, caPort, kmiIp1, kmiPort1, kmiIp2, kmiPort2 )
{
	var SG = document.getElementById(object_id);
	if ( isNull(policyOid) || isNull(raIp) || isNull(raPort) || isNull(caIp) || isNull(caPort) 
			|| isNull(kmiIp1) || isNull(kmiPort1) || isNull(kmiIp2) || isNull(kmiPort2) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_setUserConfiguration()" );
		return false;
	}
	
	var bReturn = SG.setUserConfiguration( policyOid, raIp, raPort, caIp, caPort, kmiIp1, kmiPort1, kmiIp2, kmiPort2);
	if( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_setUserConfiguration()" );
		return false;
	}
	return bReturn;
}

function SGJ_setKicaInfoFromVal(data)
{
	var SG = document.getElementById(object_id);
	if ( isNull(data) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_setKicaInfoFromVal()" );
		return false;
	}
	
	var bReturn = SG.setKicaInfoFromVal(data);
	if( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_setKicaInfoFromVal()" );
		return false;
	}
	return bReturn;
}


function SGJ_setEducationMode()
{
	var SG = document.getElementById(object_id);
	var bReturn = SG.setEducationMode();
	if( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_setEducationMode()" );
		return "";
	}
	return bReturn;
}

function SGJ_issueEncCert( id, bidNumber, username, idn, postnum, addr, tel, fax, email, company, department )
{	
	if ( isNull(id) || isNull(bidNumber) || isNull(username) || isNull(idn) 
			|| isNull(postnum) || isNull(addr) || isNull(tel) || isNull(email) 
			|| isNull(company) || isNull(department))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_issueEncCert()" );
		return false;
	}
	
	var SG = document.getElementById(object_id);
	self.focus();
	var strEncCert = SG.issueEncCert( id, bidNumber, username, idn, postnum, addr, tel, fax, email, company, department );
	if( isNull(strEncCert) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_issueEncCert()" );
		return "";
	}
	return strEncCert;
}

function SGJ_genBidChkInfo( strUserID, bidNumber )
{
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) ||  isNull(bidNumber))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_genBidChkInfo()" );
		return "";
	}
	
	self.focus();
	var strValue = SG.genBidChkInfo( strUserID, bidNumber );
	if( isNull(strValue) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_genBidChkInfo()" );
		return "";
	}
	return strValue;
}

function SGJ_getEncKey( strUserID, passwd, kmCert )
{
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) ||  isNull(passwd) || isNull(kmCert) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getEncKey()" );
		return "";
	}
	
	self.focus();
	var strValue = SG.getEncKey( strUserID, passwd, kmCert );
	if( isNull(strValue) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getEncKey()" );
		return "";
	}
	return strValue;
}

/*************************JodalBioTokenApplet****************************
function SGJ_BHSMGetCSN()
{
	var SG = document.getElementById(object_id);
	var strValue = SG.BHSMGetCSN();
	if( isNull(strValue) )
	{
		setErrorCode( "" );
		setErrorMsg( GetLastErrMsg() );
		setErrorFunction( "BHSMGetCSN()" );
		return "";
	}
	return bReturn;
}

function SGJ_BHSMGetManuFacture()
{
	var SG = document.getElementById(object_id);
	var strValue = SG.BHSMGetManuFacture();
	if( isNull(strValue) )
	{
		setErrorCode( "" );
		setErrorMsg( GetLastErrMsg() );
		setErrorFunction( "BHSMGetManuFacture()" );
		return "";
	}
	return bReturn;
}

function SGJ_BHSMGenDevAuth( id, bidNumber )
{
	var SG = document.getElementById(object_id);
	var strValue = SG.BHSMGenDevAuth( id, bidNumber );
	if( isNull(strValue) )
	{
		setErrorCode( "" );
		setErrorMsg( GetLastErrMsg() );
		setErrorFunction( "BHSMGenDevAuth()" );
		return "";
	}
	return bReturn;
}

function SGJ_selectedMedia( id, type )
{
	var SG = document.getElementById(object_id);
	var strValue = SG.selectedMedia( id, type );
	if( isNull(strValue) )
	{
		setErrorCode( "" );
		setErrorMsg( GetLastErrMsg() );
		setErrorFunction( "selectedMedia()" );
		return "";
	}
	return bReturn;
}
*/

function SGJ_getIdentifiAuthValue( id, kmCert, bidNumber )
{
	var SG = document.getElementById(object_id);
	if ( isNull(id) ||  isNull(kmCert) || isNull(bidNumber) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getIdentifiAuthValue()" );
		return "";
	}
	
	var strAuthValeu = SG.getIdentifiAuthValue( id, kmCert, bidNumber );
	if( isNull(strAuthValeu) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getIdentifiAuthValue()" );
		return "";
	}
	return strAuthValeu;
}

function dec(id, enc_data) 
{	
	var SG = document.getElementById(object_id);
	/* Session 초기화 */
	var init = SG.initSession(id);
	if(!init)
	{
		alert("initSession Error!!");
		return;
	}


	//① SessionKey는 이전에 클라이언트에서 암호화시 발생되었던 세션키를 그대로 
	//	 사용한다.(지금은 이미 메모리에 올라와 있는 상태)
	//② 원문 복호화 : 암호화 데이터로부터 원문데이터 추출
	original_data = SG.decryptData(id, enc_data);
	if ( original_data == "" )
	{
		alert("Error Decrypt Encrypted Data !");
		alert( GetLastErrMsg() );
		return false;
	}

	return original_data;
}


function SGJ_genAlternativeOwnerData( id, dn )
{
	var SG = document.getElementById(object_id);
	if ( isNull(id) ||  isNull(dn))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_genAlternativeOwnerData()" );
		return "";
	}
	
	var strAuthValeu = SG.genAlternativeOwnerData( id, dn);
	if( isNull(strAuthValeu) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_genAlternativeOwnerData()" );
		return "";
	}
	return strAuthValeu;
}

function SGJ_recoverAlternativeOwnerData( id, bidNum, data)
{
	var SG = document.getElementById(object_id);
	
	if ( isNull(id) ||  isNull(bidNum) || isNull(data))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_genAlternativeOwnerData()" );
		return;
	}
	SG.recoverAlternativeOwnerData( id, data, bidNum );
}


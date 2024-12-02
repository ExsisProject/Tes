//*************************************************************************************
//	파일명		: sg_cert.js
//	최종 수정일	: 2012년 12월 21일
//	내용		: 인증서 선택창 및 인증서 정보 관련 함수 모음
//*************************************************************************************

function selectCertificate( strCertID )
{
	if ( strCertID == null || strCertID == "" )
	{
		setErrorCode( "NO_USER_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "selectCertificate()" );
		return false;
	}
	SetSessionID( strCertID );
	
	var bReturn = LoadUserKeyCertDlg( bUseKMCert );
	if ( !bReturn )
	{
		setErrorCode( GetLastErrMsg() );
		setErrorMessage( "" );
		setErrorFunctionName( "selectCertificate()" );
		return false;
	}

	return bReturn;
}

function clearCertificateInfo( strCertID )
{
	if ( strCertID == null || strCertID == "" )
	{
		setErrorCode( "NO_USER_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "clearCertificateInfo()" );
		return false;
	}
	SetSessionID( strCertID );
	UnloadUserKeyCert();

	return true;
}

function reselectCertificate( strCertID )
{
	clearCertificateInfo( strCertID );
	return selectCertificate( strCertID );
}

function getUserSignCert( strCertID )
{
	var bReturn = selectCertificate( strCertID );
	if ( !bReturn )
	{
		setErrorFunctionName( "getUserSignCert()" );
		return "";
	}
	
	var strCert = GetUserSignCert();
	if ( strCert == "" )
	{
		setErrorFunctionName( "getUserSignCert()" );
		return "";
	}

	return strCert;
}

function getUserKMCert( strCertID )
{
	var bReturn = selectCertificate( strCertID );
	if ( !bReturn )
	{
		setErrorFunctionName( "getUserKMCert()" );
		return "";
	}
	
	var strCert = GetUserKMCert();
	if ( strCert == "" )
	{
		setErrorFunctionName( "getUserKMCert()" );
		return "";
	}

	return strCert;	
}

function getUserKMKey( strCertID )
{
	var bReturn = selectCertificate( strCertID );
	if ( !bReturn )
	{
		setErrorFunctionName( "getUserKMKey()" );
		return "";
	}
	
	var strKey = GetUserKMKey();
	if ( strKey == "" )
	{
		setErrorFunctionName( "getUserKMKey()" );
		return "";
	}

	return strKey;
}

function getUserKMKeyWithNewPassword( strCertID, strNewPassword )	//	Added 2005.08.03
{
	var bReturn = selectCertificate( strCertID );
	if ( !bReturn )
	{
		setErrorFunctionName( "getUserKMKeyWithNewPassword()" );
		return "";
	}
	
	var strKey = GetUserKMKeyWithNewPassword( strNewPassword );
	if ( strKey == "" )
	{
		setErrorFunctionName( "getUserKMKeyWithNewPassword()" );
		return "";
	}

	return strKey;
}

function isLoadedCertificate(strCertID)//ver 3.1.10.6
{
	if ( strCertID == null || strCertID == "" )
	{
		setErrorCode( "NO_USER_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "isLoadedCertificate()" );
		return false;
	}
	if(IsLoadedCert(strCertID))
	{
		SetSessionID(strCertID);
		return true;
	}
	else
	{
		return false;
	}
}

function getUserCertKey(type, certString)//ver 3.1.10.7
{
	if(type == null || type == "" || certString == null || certString == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getUserCertKey()" );
		return "";
	}

	var keyString = GetUserCertKey(type, certString);
	if(keyString == "")
	{
		setErrorCode("");
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("getUserCertKey()");
		return "";
	}

	return keyString;
}

function getUserPassword( strCertID )	//	Modified 2005.11.04
{
	return "지원되지 않는 기능입니다.";
}

function getCertPath( strCertID )
{
	var bReturn = selectCertificate( strCertID );
	if ( !bReturn )
	{
		setErrorFunctionName( "getCertPath()" );
		return "";
	}
	
	var strCertPath = GetCertPath();
	if ( strCertPath == "" )
	{
		setErrorFunctionName( "getCertPath()" );
		return "";
	}

	return strCertPath;	
}

function getSerialFromCert( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getCertSerialNumber()" );
		return "";
	}

	var nSerial = GetSerialNumberFromCert(strCert)
	if ( nSerial < 0 )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getSerialFromCert()" );
		return nSerial;
	}

	return nSerial;
}

function getCertSerialNumber( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getCertSerialNumber()" );
		return "";
	}

	var nSerial = GetCertInfoFromCert( strCert, 2 );
	if ( nSerial == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getCertSerialNumber()" );
		return "";
	}

	return nSerial;
}

function getCertSubjectDN( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getCertSubjectDN()" );
		return "";
	}

	var buf = GetSubjectDNFromCert( strCert );
	if ( buf == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getCertSubjectDN()" );
		return "";
	}
	
	return buf;
}

function getCertIssuerDN( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getCertIssuerDN()" );
		return "";
	}

	var buf = GetCertInfoFromCert( strCert, 4 );
	if ( buf == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getCertIssuerDN()" );
		return "";
	}
	
	return buf;
}

function getCertNotBefore( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getCertNotBefore()" );
		return "";
	}

	var buf = GetCertInfoFromCert( strCert, 5 );
	if ( buf == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getCertNotBefore()" );
		return "";
	}
	
	return buf;
}

function getCertNotAfter( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getCertNotAfter()" );
		return "";
	}

	var buf = GetCertInfoFromCert( strCert, 6 );
	if ( buf == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getCertNotAfter()" );
		return "";
	}
	
	return buf;
}

function getCertPublicKey( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getCertPublicKey()" );
		return "";
	}

	var buf = GetCertInfoFromCert( strCert, 8 );
	if ( buf == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getCertPublicKey()" );
		return "";
	}
	
	return buf;
}

function getCertSignatureAlgorithm( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getCertSignatureAlgorithm()" );
		return "";
	}

	var buf = GetCertInfoFromCert( strCert, 3 );
	if ( buf == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getCertSignatureAlgorithm()" );
		return "";
	}
	
	return buf;
}

function getCertKeyUsage( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getCertKeyUsage()" );
		return "";
	}

	var buf = GetCertInfoFromCert( strCert, 9 );
	if ( buf == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getCertKeyUsage()" );
		return "";
	}
	
	return buf;
}

function getCertPolicy( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getCertPolicy()" );
		return "";
	}

	var buf = GetCertInfoFromCert( strCert, 10 );
	if ( buf == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getCertPolicy()" );
		return "";
	}
	
	return buf;
}

function getCertInfo( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getCertInfo()" );
		return "";
	}

	var buf = GetCertInfoFromCert( strCert, 0 );
	if ( buf == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getCertInfo()" );
		return "";
	}
	
	return buf;
}

function checkCertValidity( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "checkCertValidity()" );
		return false;
	}

	var bReturn = ValidateCert( strCert );
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "checkCertValidity()" );
		return false;
	}

	return bReturn;
}

function checkCertValidityWithPolicy(strCert, strAllowedPolicyOID)
{
	var bResult = false;

    if (strAllowedPolicyOID == undefined || strAllowedPolicyOID == '') {
		bResult = SetCertPolicy('ANY');
	} else {
		bResult = SetCertPolicy(strAllowedPolicyOID);
	}

	if (bResult == false) {
		return false;
	}

	return checkCertValidity(strCert);
}

function getRandomNumber( strCertID )
{
	var bReturn = selectCertificate( strCertID );
	if ( !bReturn )
	{
		setErrorFunctionName( "getRandomNumber()" );
		return "";
	}

	var strRandomNumber = GetUserKeyRNumber();
	if ( strRandomNumber == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getRandomNumber()" );
		return "";
	}

	return removeCRLF( strRandomNumber );
}

function getEncryptedRandomNumber( strCertID )
{
	var bReturn = selectCertificate( strCertID );
	if ( !bReturn )
	{
		setErrorFunctionName( "getEncryptedRandomNumber()" );
		return "";
	}

	var strRandomNumber = GetUserKeyRNumber();
	if ( strRandomNumber == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getEncryptedRandomNumber()" );
		return "";
	}

	var strEncryptedRandomNumber = encryptDataString( strCertID, strRandomNumber );
	if ( strEncryptedRandomNumber == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getEncryptedRandomNumber()" );
		return "";
	}

	return removeCRLF( strEncryptedRandomNumber );
}

function checkCertOwner( strCert, strSSN, strRandomNumber )	//	Added 2005.11.04
{
	if ( strCert == null || strCert == "" || strSSN == null || strSSN == "" || strRandomNumber == null || strRandomNumber == ""  )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "checkCertOwner()" );
		return false;
	}

	var bReturn = CheckCertOwner( strCert, strSSN, strRandomNumber )
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "checkCertOwner()" );
		return false;
	}

	return true;
}

function getCertPublicKeyAlgo( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getCertPolicy()" );
		return "";
	}

	var buf = GetCertInfoFromCert( strCert, 11 );
	if ( buf == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getCertPolicy()" );
		return "";
	}
	
	return buf;
}

function getUserSignCertEX( strCertID, encode )
{
	var bReturn = selectCertificate( strCertID );
	if ( !bReturn )
	{
		setErrorFunctionName( "getUserSignCert()" );
		return "";
	}
	
	var strCert = GetUserSignCertEX( encode );
	if ( strCert == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getUserSignCert()" );
		return "";
	}

	return strCert;
}

function getUserKMCertEX( strCertID, encode )
{
	var bReturn = selectCertificate( strCertID );
	if ( !bReturn )
	{
		setErrorFunctionName( "getUserKMCert()" );
		return "";
	}
	
	var strCert = GetUserKMCertEX( encode );
	if ( strCert == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getUserKMCert()" );
		return "";
	}

	return strCert;	
}

function setSitePolicyForCertDlgPolicy( strSiteName, strPolicy )
{
	if ( strSiteName == null || strSiteName == "" 
		|| strPolicy == null || strPolicy == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "setSitePolicyForCertDlgPolicy()" );
		return false;
	}

	var bReturn = SetSiteIniPolicy( strSiteName, strPolicy );
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "setSitePolicyForCertDlgPolicy()" );
		return false;
	}

	return true;
}

function setSiteNameForCertDlgPolicy( strSiteName )
{
	if ( strSiteName == null || strSiteName == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "setSiteNameForCertDlgPolicy()" );
		return false;
	}

	var bReturn = SetSiteName( strSiteName );
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "setSiteNameForCertDlgPolicy()" );
		return false;
	}

	return true;
}

function setDefaultCertDlgModeMedia( ModeFlag, MediaFlag )
{
	var bReturn = SetDefaultDlgParam( ModeFlag, MediaFlag );
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "setDefaultCertDlgModeMedia()" );
		return false;
	}

	return true;
}

function setCertDialogImage(imageURL)
{
	var bReturn = SetCertDialogImage(imageURL);
	if ( !bReturn )
	{
		setErrorCode( "Failed to download Image:" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "setCertDialogImage()" );
		return false;
	}

	return true;
}

function setDefaultDlgPassword(passwd)
{
	return SetDefaultDlgPassword(passwd);
}

function setDefaultDlgDN(dn)
{
	return SetDefaultDlgDN(dn);
}

function setBioHSMInfo(bioInfo)
{
	if (null == bioInfo || "" == bioInfo)
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName("setBioHSMInfo()");
		return false;
	}

	return SetBioHSMInfo(bioInfo);
}

function getMediaType(userID)
{
	if (null == userID || "" == userID)
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName("getMediaType()");
		return 0;
	}

	return GetMediaType(userID);
}


function getDevManufature(userID)//ver 3.1.10.2
{
	if (null == userID || "" == userID)
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName("getDevManufature()");
		return "";
	}

	var manufacture = GetDevManufature(userID);
	if("" == manufacture)
	{
		setErrorCode("");
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("getDevManufature()");
		return "";
	}

	return manufacture;
}
function getDevCSN(userID)//ver 3.1.10.2
{
	if (null == userID || "" == userID)
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName("getDevCSN()");
		return "";
	}

	var csn = GetDevCSN(userID);
	if("" == csn)
	{
		setErrorCode("");
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("getDevCSN()");
		return "";
	}

	return csn;
}
function getDevAuth(userID)//ver 3.1.10.2
{
	if (null == userID || "" == userID)
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName("getDevAuth()");
		return "";
	}

	var authValue = GetDevAuth(userID);
	if ("" == authValue)
	{
		setErrorCode("");
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("getDevAuth()");
		return "";
	}

	return authValue;
}
function setDevAuthParam(keyID, randValue)
{
	if (null == keyID || "" == keyID || null == randValue || "" == randValue)
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName("setDevAuthParam()");
		return false;
	}

	var res = SetDevAuthParam(keyID, randValue);//[id(145)]
	if(false == res)
	{
		setErrorCode("");
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("setDevAuthParam()");
		return false;
	}
	
	return true;
}

function genDevAuth(userID, keyID, randValue)	//ver 3.1.10.8
{
	if (null == userID || "" == userID || null == keyID || "" == keyID || null == randValue || "" == randValue)
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName("genDevAuth()");
		return "";
	}

	var authValue = GenDevAuth(userID, keyID, randValue);//ver 3.1.10.8
	if(null == authValue || "" == authValue)
	{
		setErrorCode("");
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("GenDevAuth()");
		return "";
	}
	
	return authValue;
}

function getDevPID(userID)//ver 3.1.10.3
{
	if (null == userID || "" == userID)
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName("getDevPID()");
		return "";
	}

	var pid = GetDevPID(userID);
	if("" == pid)
	{
		setErrorCode("");
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("getDevPID()");
		return "";
	}

	return pid;
}

function getDevCID(userID)//ver 3.1.10.5
{
	if (null == userID || "" == userID)
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName("getDevCID()");
		return "";
	}

	var cid = GetDevCID(userID);
	if("" == cid)
	{
		setErrorCode("");
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("getDevCID()");
		return "";
	}

	return cid;
}

function setCertPolicy( oid )
{
	if ( oid == null || oid == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "setCertPolicy()" );
		return false;
	}
	
	if (SetCertPolicy(oid) == false)
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "setCertPolicy()" );
		return false;
	}

	return true;
}

function setDynamicMessage(encode, msg)
{
	if ( encode == null || encode == "" || encode < 0 || encode > 3 ||  msg == null || msg == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "setDynamicMessage()" );
		return "";
	}
	
	var bReturn = SetDynamicMessage(encode, msg);	
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "setDynamicMessage()" );
		return false;
	}

	return bReturn;
}


function mobileKeySetSettingInt(eSettingType, nSettingValue)
{
	if(0 != eSettingType || 0 > nSettingValue || 1 < nSettingValue)
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "setDynamicMessage()" );
		return "";
	}

	var bReturn = MobileKeySetSettingInt(eSettingType, nSettingValue);	
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "mobileKeySetSettingInt" );
		return false;
	}

	return bReturn;

	
}

function mobileKeySetSettingString(SettingValue)
{
	if("" == SettingValue)
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "mobileKeySetSettingString" );
		return "";
	}

	var bReturn =  MobileKeySetSettingString(SettingValue);	
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "mobileKeySetSettingString" );
		return false;
	}

	return bReturn;
}

function CaCertSetSettingInt(eSettingType, nSettingValue) 
{    
    if (2 > eSettingType || 3 < eSettingType || null == eSettingType)
    {
        setErrorCode("NO_DATA_VALUE");
        setErrorMessage("2: Save CaCert To Writable Path, 3: Do Not Save Root Ca Cert On Init");
        setErrorFunctionName("CaCertSetSettingInt()");
        return false;
    }

    if( 0 > nSettingValue || 1 < nSettingValue || null == nSettingValue)
    {
        setErrorCode("NO_DATA_VALUE");
        setErrorMessage("1:Run Function, 0:Stop Function)");
        setErrorFunctionName("CaCertSetSettingInt()");
        return false;
    }

    var bReturn = SetSettingInt(eSettingType, nSettingValue);
    if (!bReturn) 
    {
        setErrorCode("");
        setErrorMessage(GetLastErrMsg());
        setErrorFunctionName("CaCertSetSettingInt");
        return false;
    }
    return bReturn;
}

function SetDefaultLocale(nSettingValue) 
{
    if (0 > nSettingValue || 2 < nSettingValue || null == nSettingValue)
    {
        setErrorCode("NO_DATA_VALUE");
        setErrorMessage("1:Run Function, 0:Stop Function)");
        setErrorFunctionName("SetDefaultLocale");
        return "";
    }

    var bReturn = DefaultLocaleSetSettingInt(SettingValue);
    if (!bReturn) 
    {
        setErrorCode("");
        setErrorMessage(GetLastErrMsg());
        setErrorFunctionName("SetDefaultLocale");
        return false;
    }
    return bReturn;
}

function setPasswordMinimumSize( nPasswordSize, strErrorMsg)
{
	if(0 > nPasswordSize )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("setPasswordMinimumSize");
		return false;
	}
	
	var bReturn = SetPasswordMinimumSIze(nPasswordSize, strErrorMsg );
	if (!bReturn) 
	{
		setErrorCode("");
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("setPasswordMinimumSize");
		return false;
	}
	return bReturn;
}

function doNotUseDefaultFocus(nDisableDefaultFocus)
{
	if ((nDisableDefaultFocus == undefined) || (nDisableDefaultFocus < 0 || 1 < nDisableDefaultFocus))
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("1:Run Function, 0:Stop Function)");
		setErrorFunctionName("doNotUseDefaultFocus");
		return false;
	}

	if (DoNotUseDefaultFocus(nDisableDefaultFocus) == false)
	{
		setErrorCode("");
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("doNotUseDefaultFocus");
		return false;
	}

	return true;
}

//function doNotUseDefaultFocus(/*boolean*/ disableDefaultFocus)
//{
//	if (typeof(disableDefaultFocus) != "boolean")
//	{
//		setErrorMessage("doNotUseDefaultFocus() 함수의 호출인자가 잘못되었습니다.");
//		return false;
//	}
//
//	if (DoNotUseDefaultFocus(disableDefaultFocus) == false)
//	{
//		setErrorCode("");
//		setErrorMessage(GetLastErrMsg());
//		setErrorFunctionName("doNotUseDefaultFocus");
//		return false;
//	}
//
//	return true;
//}

function enableVerifyMPKI(nSettingValue)
{
    if (0 > nSettingValue || 1 < nSettingValue || null == nSettingValue)
    {
        setErrorCode("NO_DATA_VALUE");
        setErrorMessage("1:Run Function, 0:Stop Function)");
        setErrorFunctionName("SetDefaultLocale");
        return "";
    }

	var bReturn = EnableVerifyMPKI(enable)
	if (!bReturn) 
  	{
		setErrorCode("");
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("enableVerifyMPKI");
		return false;
	}

	return bReturn;
}


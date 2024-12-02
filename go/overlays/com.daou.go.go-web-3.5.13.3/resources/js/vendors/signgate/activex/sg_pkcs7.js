//*************************************************************************************
//	파일명		: sg_pkcs7.js
//	최종 수정일	: 2012년 6월 1일
//	내용		: PKCS7  서명에 관련 함수 모음
//*************************************************************************************

var nSignerCount = 0;

function generatePKCS7SignedMsg( strCertID, strMessage )
{
	if ( strMessage == null || strMessage == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generatePKCS7SignedMsg()" );
		return "";
	}

	var bReturn = selectCertificate( strCertID );
	if( !bReturn )
	{
		setErrorFunctionName( "generatePKCS7SignedMsg()" );
		return "";
	}

	// 20061114, modified by ojpark
	var strPKCS7Message = GeneratePKCS7MsgSG( 1, strMessage, "", "" );
	if( strPKCS7Message == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "generatePKCS7SignedMsg()" );
		return "";
	}

	return strPKCS7Message;
}

function generatePKCS7SignedFile( strCertID, strInputFilePath, strOutputFilePath )
{
	if ( strInputFilePath == null || strInputFilePath == ""
		|| strOutputFilePath == null || strOutputFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generatePKCS7SignedFile()" );
		return false ;
	}

	var bReturn = selectCertificate( strCertID );
	if( !bReturn )
	{
		setErrorFunctionName( "generatePKCS7SignedFile()" );
		return false;
	}

	// 20061114, modified by ojpark
	bReturn = GeneratePKCS7MsgFileSG( 1, strInputFilePath, "", "", strOutputFilePath );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "generatePKCS7SignedFile()" );
		return false;
	}

	return bReturn;
}

function generatePKCS7SignedFromFile(strCertID, strInputFilePath) 
{
    if (strInputFilePath == null || strInputFilePath == "") 
    {
        setErrorCode("NO_DATA_VALUE");
        setErrorMessage("");
        setErrorFunctionName("generatePKCS7SignedFile()");
        return "";
    }

    var bReturn = selectCertificate(strCertID);
    if (!bReturn) {
        setErrorFunctionName("generatePKCS7SignedFile()");
        return "";
    }

    // 20061114, modified by ojpark
    strPKCS7Message = GeneratePKCS7MsgFromFileSG(1, strInputFilePath, "", "");
    if (strPKCS7Message == "") 
    {
        setErrorCode("");
        setErrorMessage(GetLastErrMsg());
        setErrorFunctionName("generatePKCS7SignedMsgFormFile()");
        return "";
    }

    return strPKCS7Message;
}

function addPKCS7SignMsg( strCertID, strP7Msg )
{
	if( strP7Msg == null || strP7Msg == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "addPKCS7SignMsg()" );
		return "";
	}

	var bReturn = selectCertificate( strCertID );
	if( !bReturn )
	{
		setErrorFunctionName( "addPKCS7SignMsg()" );
		return "";
	}

	var strPKCS7Message = AddPKCS7Signature( strP7Msg );
	if( strPKCS7Message == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "addPKCS7SignMsg()" );
		return "";
	}

	return strPKCS7Message;
}

function addPKCS7SignFile( strCertID, strP7FilePath, strOutputFilePath )
{
	if ( strP7FilePath == null || strP7FilePath == ""
		|| strOutputFilePath == null || strOutputFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "addPKCS7SignFile()" );
		return false;
	}

	var bReturn = selectCertificate( strCertID );
	if( !bReturn )
	{
		setErrorFunctionName( "addPKCS7SignFile()" );
		return false;
	}

	bReturn = AddPKCS7SignatureFile( strP7FilePath, strOutputFilePath );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "addPKCS7SignFile()" );
		return false;
	}

	return bReturn;
}

function addPKCS7SignFromFile(strCertID, strP7FilePath) 
{
    if (strP7FilePath == null || strP7FilePath == "") 
    {
        setErrorCode("NO_DATA_VALUE");
        setErrorMessage("");
        setErrorFunctionName("addPKCS7SignFile()");
        return "";
    }

    var bReturn = selectCertificate(strCertID);
    if (!bReturn) {
        setErrorFunctionName("addPKCS7SignFile()");
        return "";
    }

    var strPKCS7Message = AddPKCS7SignatureFromFile(strP7FilePath);
    if (strPKCS7Message == "") {
        setErrorCode("");
        setErrorMessage(GetLastErrMsg());
        setErrorFunctionName("addPKCS7SignFromFile()");
        return "";
    }

    return strPKCS7Message;
}

function generatePKCS7EnvelopedMsg( strMessage, strMyCert, strRecipientCert )
{
	if ( strMessage == null || strMessage == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generatePKCS7EnvelopedMsg()" );
		return "" ;
	}

	if ( ( strMyCert == null || strMyCert == "" ) && 
		( strRecipientCert == null || strRecipientCert == "" ) )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generatePKCS7EnvelopedMsg()" );
		return "" ;
	}

	// 20061114, modified by ojpark
	var strPKCS7Message = GeneratePKCS7MsgSG( 2, strMessage, strMyCert, strRecipientCert );
	if( strPKCS7Message == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "generatePKCS7EnvelopedMsg()" );
		return "" ;
	}

	return strPKCS7Message ;
}

function generatePKCS7EnvelopedFile( strInputFilePath, strMyCert, strRecipientCert, strOutputFilePath )
{
	if ( strInputFilePath == null || strInputFilePath == ""
		|| strOutputFilePath == null || strOutputFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generatePKCS7EnvelopedFile()" );
		return false;
	}

	if ( ( strMyCert == null || strMyCert == "" ) && 
		( strRecipientCert == null || strRecipientCert == "" ) )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generatePKCS7EnvelopedFile()" );
		return false;
	}

	// 20061114, modified by ojpark
	var bReturn = GeneratePKCS7MsgFileSG( 2, strInputFilePath, strMyCert, strRecipientCert, strOutputFilePath );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "generatePKCS7EnvelopedFile()" );
		return false;
	}

	return bReturn;
}

function generatePKCS7EnvelopedFromFile(strInputFilePath, strMyCert, strRecipientCert) 
{
    if (strInputFilePath == null || strInputFilePath == "") 
    {
        setErrorCode("NO_DATA_VALUE");
        setErrorMessage("");
        setErrorFunctionName("generatePKCS7EnvelopedFromFile()");
        return "";
    }

    if ((strMyCert == null || strMyCert == "") &&
		(strRecipientCert == null || strRecipientCert == "")) 
    {
        setErrorCode("NO_DATA_VALUE");
        setErrorMessage("");
        setErrorFunctionName("generatePKCS7EnvelopedFromFile()");
        return "";
    }

    // 20061114, modified by ojpark
    var strPKCS7Message = GeneratePKCS7MsgFromFileSG(2, strInputFilePath, strMyCert, strRecipientCert);
    if (strPKCS7Message == "") {
        setErrorCode("");
        setErrorMessage(GetLastErrMsg());
        setErrorFunctionName("generatePKCS7EnvelopedFromFile()");
        return "";
    }

    return strPKCS7Message;
}

function generatePKCS7SignedEnvelopedMsg( strCertID, strMessage, strMyCert, strRecipientCert )
{
	if ( strMessage == null || strMessage == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generatePKCS7SignedEnvelopedMsg()" );
		return "" ;
	}

	if ( ( strMyCert == null || strMyCert == "" ) && 
		( strRecipientCert == null || strRecipientCert == "" ) )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generatePKCS7SignedEnvelopedMsg()" );
		return "" ;
	}

	var bReturn = selectCertificate( strCertID );
	if( !bReturn )
	{
		setErrorFunctionName( "generatePKCS7SignedEnvelopedMsg()" );
		return "" ;
	}

	// 20061114, modified by ojpark
	var strPKCS7Message = GeneratePKCS7MsgSG( 3, strMessage, strMyCert, strRecipientCert );
	if( strPKCS7Message == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "generatePKCS7SignedEnvelopedMsg()" );
		return "" ;
	}

	return strPKCS7Message;
}

function generatePKCS7SignedEnvelopedFile( strCertID, strInputFilePath, strMyCert, strRecipientCert, strOutputFilePath )
{
	if ( strInputFilePath == null || strInputFilePath == ""
		|| strOutputFilePath == null || strOutputFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generatePKCS7SignedEnvelopedFile()" );
		return false;
	}

	if ( ( strMyCert == null || strMyCert == "" ) && 
		( strRecipientCert == null || strRecipientCert == "" ) )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generatePKCS7SignedEnvelopedFile()" );
		return false;
	}

	var bReturn = selectCertificate( strCertID );
	if( !bReturn )
	{
		setErrorFunctionName( "generatePKCS7SignedEnvelopedFile()" );
		return false;
	}

	// 20061114, modified by ojpark
	bReturn = GeneratePKCS7MsgFileSG( 3, strInputFilePath, strMyCert, strRecipientCert, strOutputFilePath );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "generatePKCS7SignedEnvelopedFile()" );
		return false;
	}

	return bReturn;
}

function generatePKCS7SignedEnvelopedFromFile(strCertID, strInputFilePath, strMyCert, strRecipientCert) 
{
    if (strInputFilePath == null || strInputFilePath == "") 
    {
        setErrorCode("NO_DATA_VALUE");
        setErrorMessage("");
        setErrorFunctionName("generatePKCS7SignedEnvelopedFile()");
        return "";
    }

    if ((strMyCert == null || strMyCert == "") &&
		(strRecipientCert == null || strRecipientCert == "")) 
    {
        setErrorCode("NO_DATA_VALUE");
        setErrorMessage("");
        setErrorFunctionName("generatePKCS7SignedEnvelopedFile()");
        return "";
    }

    var bReturn = selectCertificate(strCertID);
    if (!bReturn) {
        setErrorFunctionName("generatePKCS7SignedEnvelopedFile()");
        return "";
    }

    // 20061114, modified by ojpark
    var strPKCS7Message = GeneratePKCS7MsgFromFileSG(3, strInputFilePath, strMyCert, strRecipientCert);
    if (strPKCS7Message == "") {
        setErrorCode("");
        setErrorMessage(GetLastErrMsg());
        setErrorFunctionName("generatePKCS7SignedEnvelopedFromFile()");
        return "";
    }

    return strPKCS7Message;
}

function verifyPKCS7SignedMsg( strP7Msg )
{
	if( strP7Msg == null || strP7Msg == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "verifyPKCS7SignedMsg()" );
		return "";
	}

	var strOriginalMessage = VrfPKCS7Msg( strP7Msg );
	if( strOriginalMessage == "")
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "verifyPKCS7SignedMsg()" );
		nSignerCount = 0;
		return "";
	}
	else
	{
		nSignerCount = GetPKCS7SignInfo( strP7Msg );
	}

	return strOriginalMessage;
}

function verifyPKCS7EnvelopedMsg( strCertID, strP7Msg )
{
	if( strP7Msg == null || strP7Msg == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "verifyPKCS7EnvelopedMsg()" );
		return "";
	}

	var bReturn = selectCertificate( strCertID );
	if( !bReturn )
	{
		setErrorFunctionName( "verifyPKCS7EnvelopedMsg()" );
		return "";
	}

	var strOriginalMessage = VrfPKCS7Msg( strP7Msg );
	if( strOriginalMessage == "")
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "verifyPKCS7EnvelopedMsg()" );
		nSignerCount = 0;
		return "";
	}
	else
	{
		nSignerCount = GetPKCS7SignInfo( strP7Msg );
	}

	return strOriginalMessage;
}

function verifyPKCS7SignedFile( strP7FilePath, strOutputFilePath )
{
	if( strP7FilePath == null || strP7FilePath == ""
		|| strOutputFilePath == null || strOutputFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "verifyPKCS7SignedFile()" );
		return false;
	}

	var bReturn = VrfPKCS7MsgFile( strP7FilePath, strOutputFilePath );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "verifyPKCS7SignedFile()" );
		nSignerCount = 0;
		return false;
	}
	else
	{
		nSignerCount = GetPKCS7SignInfoFile( strP7FilePath );
	}

	return bReturn;
}

function verifyPKCS7EnvelopedFile( strCertID, strP7FilePath, strOutputFilePath )
{
	if( strP7FilePath == null || strP7FilePath == ""
		|| strOutputFilePath == null || strOutputFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "verifyPKCS7EnvelopedFile()" );
		return false;
	}

	var bReturn = selectCertificate( strCertID );
	if( !bReturn )
	{
		setErrorFunctionName( "verifyPKCS7EnvelopedFile()" );
		return false;
	}

	var bReturn = VrfPKCS7MsgFile( strP7FilePath, strOutputFilePath );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "verifyPKCS7EnvelopedFile()" );
		nSignerCount = 0;
		return false;
	}
	else
	{
		nSignerCount = GetPKCS7SignInfoFile( strP7FilePath );
	}

	return bReturn;
}

function getPKCS7SignerCount( )
{
	return nSignerCount;
}

function getPKCS7SignerCert( nIndex )
{
	if( isNaN( nIndex) )
	{
		setErrorCode("NOT_INDEX_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getPKCS7SignerCert()" );
		return "" ;
	}

	var strSignerCert = GetPKCS7SignCert( nIndex );
	if( strSignerCert == "")
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getPKCS7SignerCert()" );
		return "" ;
	}

	return strSignerCert;
}

function getPKCS7SigningTime( nIndex )
{
	if( isNaN( nIndex) )
	{
		setErrorCode("NOT_INDEX_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getPKCS7SigningTime()" );
		return "" ;
	}

	var strTimestamp = GetPKCS7SignTime( nIndex );
	if( strTimestamp == "")
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getPKCS7SigningTime()" );
		return "" ;
	}

	return strTimestamp;
}

function clearPKCS7MessageInfo()
{
	nSignerCount = 0;
	ClearPKCS7SignInfo();
	return;
}

function getPKCS7TypeMsg( strP7Msg )
{
	if( strP7Msg == null || strP7Msg == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getPKCS7TypeMsg()" );
		return "" ;
	}

	var strType = "";
	
	var nType = GetPKCS7MessageType( strP7Msg );
	if ( nType == 1 )
	{
		strType = "PKCS7SignedMessage";
	}
	else if ( nType == 2 )
	{
		strType = "PKCS7EnvelopedMessage";
	}
	else if ( nType == 3 )
	{
		strType = "PKCS7SignedAndEnvelopedMessage";
	}
	else
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getPKCS7TypeMsg()" );
		return "" ;
	}
	
	return strType;
}

function getPKCS7TypeFile( strP7FilePath )
{
	if( strP7FilePath == null || strP7FilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getPKCS7TypeFile()" );
		return "" ;
	}

	var strType = "";

	var nType = GetPKCS7MessageTypeFile( strP7FilePath );
	if ( nType == 1 )
	{
		strType = "PKCS7SignedMessage";
	}
	else if ( nType == 2 )
	{
		strType = "PKCS7EnvelopedMessage";
	}
	else if ( nType == 3 )
	{
		strType = "PKCS7SignedAndEnvelopedMessage";
	}
	else
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getPKCS7TypeFile()" );
		return "" ;
	}
	
	return strType;
}

function generatePKCS7DetachedMsg( strCertID, strMessage )
{
	if ( strMessage == null || strMessage == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generatePKCS7DetachedMsg()" );
		return "";
	}

	var bReturn = selectCertificate( strCertID );
	if( !bReturn )
	{
		setErrorFunctionName( "generatePKCS7DetachedMsg()" );
		return "";
	}

	// 20061114, modified by ojpark
	var strPKCS7Message = GenPKCS7DetachedMsg(strMessage);
	if( strPKCS7Message == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "generatePKCS7DetachedMsg()" );
		return "";
	}

	return strPKCS7Message;
}

function verifyPKCS7DetachedMsg( strP7Msg, OriginData )
{
    if (strP7Msg == null || strP7Msg == "" || OriginData == null || OriginData == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "verifyPKCS7DetachedMsg()" );
		return false;
	}

	var bReturn = VrfPKCS7DetachedMsg( strP7Msg, OriginData );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "verifyPKCS7DetachedMsg()" );
		nSignerCount = 0;
		return false;
	}
	else
	{
		nSignerCount = GetPKCS7SignInfo( strP7Msg );
	}

	return true;
}

function generatePKCS7DetachedMsgFileEx( strCertID, strInputFilePath, strOutputFilePath )
{
	if ( strInputFilePath == null || strInputFilePath == "" || strOutputFilePath == null || strOutputFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generatePKCS7DetachedMsgFileEx()" );
		return false ;
	}

	var bReturn = selectCertificate( strCertID );
	if( !bReturn )
	{
		setErrorFunctionName( "generatePKCS7DetachedMsgFileEx()" );
		return false;
	}

	// 20061114, modified by ojpark
	bReturn = GenPKCS7DetachedMsgFileEx(strInputFilePath, strOutputFilePath );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "generatePKCS7DetachedMsgFileEx()" );
		return false;
	}

	return bReturn;
}

function verifyPKCS7DetachedMsgFile( strP7FilePath, OriginFile )
{
	if( strP7FilePath == null || strP7FilePath == "" || OriginFile == null || OriginFile == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName("verifyPKCS7DetachedMsgFile()");
		return false;
	}

	var bReturn = VrfPKCS7DetachedMsgFile( strP7FilePath, OriginFile );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "verifyPKCS7DetachedMsgFile()" );
		nSignerCount = 0;
		return false;
	}
	else
	{
		nSignerCount = GetPKCS7SignInfoFile( strP7FilePath );
	}

	return bReturn;
}

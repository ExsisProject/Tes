//*************************************************************************************
//	파일명		: sg_encrypt.js
//	최종 수정일	: 2012년 12월 4일
//	내용		: 세션키 및 암호화 정의
//*************************************************************************************

function encryptSessionKey( strKeyID, strKmCert )
{
	if ( strKeyID == null || strKeyID == "" )
	{
		setErrorCode( "NO_USER_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "encryptSessionKey()" );
		return "";
	}

	if ( strKmCert == null || strKmCert == "")
	{
		setErrorCode("NO_DATA_VALUE : KmCert");
		setErrorMessage("");
		setErrorFunctionName( "encryptSessionKey()" );
		return "";
	}

	// 20060920, modified by ojpark
	var bReturn = GenSymmetricKeySG( strKeyID );
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "encryptSessionKey()" );
		return "";
	}
	
	// 20060920, modified by ojpark
	var strEncryptedSessionKey = GetEncryptSymmetricKeySG( strKeyID, strKmCert );
 	if ( strEncryptedSessionKey == "" )
   	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "encryptSessionKey()" );
		return "";
  	}

        return removeCRLF( strEncryptedSessionKey );
}

function decryptSessionKey( strKeyID, strEncryptedSessionKey )
{
	if ( strKeyID == null || strKeyID == "" )
	{
		setErrorCode( "NO_USER_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "decryptSessionKey()" );
		return false;
	}

	if ( strEncryptedSessionKey == null || strEncryptedSessionKey == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "decryptSessionKey()" );
		return false;
	}

	var bReturn = selectCertificate( strKeyID );
	if ( !bReturn )
	{
		setErrorFunctionName( "decryptSessionKey()" );
		return false;
	}

	// 20060920, modified by ojpark
	bReturn = SetDecryptSymmetricKeySG( strKeyID, strEncryptedSessionKey );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "decryptSessionKey()" );
        	return false;
    }

	return true;
}

// 20060920, added by ojpark
function decryptSessionKeyEx( strCertID, strKeyID, strEncryptedSessionKey )
{
	if ( strCertID == null || strCertID == "" )
	{
		setErrorCode( "NO_USER_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "decryptSessionKey()" );
		return false;
	}
	if ( strKeyID == null || strKeyID == "" )
	{
		setErrorCode( "NO_KEY_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "decryptSessionKey()" );
		return false;
	}
	if ( strEncryptedSessionKey == null || strEncryptedSessionKey == "" )
	{
		setErrorCode("NO_DATA_VALUE : EncryptedSessionKey");
		setErrorMessage( "" );
		setErrorFunctionName( "decryptSessionKey()" );
		return false;
	}

	var bReturn = selectCertificate( strCertID );
	if ( !bReturn )
	{
		setErrorFunctionName( "decryptSessionKey()" );
		return false;
	}

	bReturn = SetDecryptSymmetricKeySG( strKeyID, strEncryptedSessionKey );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "decryptSessionKey()" );
        	return false;
    }

	return true;
}

function encryptDataString( strKeyID, strMessage )
{
	if ( strKeyID == null || strKeyID == "" )
	{
		setErrorCode( "NO_KEY_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "encryptDataString()" );
		return "";
	}

	if ( strMessage == null || strMessage == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName( "encryptDataString()" );
		return "";
	}

	// 20060920, modified by ojpark
	var strEncryptedData = EncryptDataSG( strKeyID, strMessage );
	if ( strEncryptedData == "" )
	{                                                                    
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "encryptDataString()" );
		return "";
	}

	return removeCRLF( strEncryptedData );
}

function decryptDataString( strKeyID, strEncryptedMessage )
{
	if ( strKeyID == null || strKeyID == "" )
	{
		setErrorCode("NO_KEY_ID");
		setErrorMessage( "" );
		setErrorFunctionName( "decryptDataString()" );
		return "";
	}

	if ( strEncryptedMessage == null || strEncryptedMessage == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName( "decryptDataString()" );
		return "";
	}

	// 20060920, modified by ojpark
	var strDecryptedData = DecryptDataSG( strKeyID, strEncryptedMessage );
	if ( strDecryptedData == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "decryptDataString()" );
		return "";
	}

	return strDecryptedData;
}

function encryptDataFile( strKeyID, strInputFilePath, strOutputFilePath )
{
	if ( strKeyID == null || strKeyID == "" )
	{
		setErrorCode("NO_KEY_ID");
		setErrorMessage( "" );
		setErrorFunctionName( "encryptDataFile()" );
		return false;
	}

	if ( strInputFilePath == null || strInputFilePath == ""
		|| strOutputFilePath == null || strOutputFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName( "encryptDataFile()" );
		return false;
	}

	// 20060920, modified by ojpark
	bReturn = EncryptFileSG( strKeyID, strInputFilePath, strOutputFilePath );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "encryptDataFile()" );
		return false;
	}

	return bReturn;
}

function decryptDataFile( strKeyID, strInputFilePath, strOutputFilePath )
{
	if ( strKeyID == null || strKeyID == "" )
	{
		setErrorCode("NO_KEY_ID");
		setErrorMessage( "" );
		setErrorFunctionName( "decryptDataFile()" );
		return false;
	}

	if ( strInputFilePath == null || strInputFilePath == ""
		|| strOutputFilePath == null || strOutputFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage("");
		setErrorFunctionName( "decryptDataFile()" );
		return false;
	}

	// 20060920, modified by ojpark
	var bReturn = DecryptFileSG( strKeyID, strInputFilePath, strOutputFilePath );
        if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "decryptDataFile()" );
		return false;
	}

	return bReturn;
}

function clearSymmetricKey( strKeyID )
{
	if ( strKeyID == null || strKeyID == "" )
	{
		setErrorCode("NO_KEY_ID");
		setErrorMessage( "" );
		setErrorFunctionName( "clearSymmetricKey()" );
		return false;
	}

	// 20060920, modified by ojpark
	var bReturn = ClearSymmetricKeySG( strKeyID );
    if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "clearSymmetricKey()" );
		return false;
	}
	return bReturn;
}

// 20060920, added by ojpark
function setBase64SymmetricKeyIV( strKeyID, strB64SymKey, strB64IV )
{
	if ( strKeyID == null || strKeyID == "" )
	{
		setErrorCode( "NO_KEY_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "setBase64SymmetricKeyIV()" );
		return false;
	}
	if ( strB64SymKey == null || strB64SymKey == "" 
		|| strB64IV == null || strB64IV == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "setBase64SymmetricKeyIV()" );
		return false;
	}

	bReturn = SetB64SymmetricKeySG( strKeyID, strB64SymKey, strB64IV );
	if( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "setBase64SymmetricKeyIV()" );
        	return false;
    }

	return true;
}

function genSignEnvInit(certString)
{
	if(certString == null || certString == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "genSignEnvInit()" );
		return "";
	}

	var envSymmKey = GenSignEnvInit(certString);
	if("" == envSymmKey)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("genSignEnvInit()");
		return "";
	}
	return envSymmKey;
}
function genSignEnvSelfKey(strCertID)//ver 3.1.10.6
{
	if ( strCertID == null || strCertID == "" )
	{
		setErrorCode( "NO_USER_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "genSignEnvSelfKey()" );
		return "";
	}

	envSymmKey = GenSignEnvelopeSelfKey(strCertID);
	if("" == envSymmKey)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("genSignEnvSelfKey()");
		return "";
	}
	return envSymmKey;
}

function genSignEnvUpdate(inData)
{
	if(inData == null || inData == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "genSignEnvUpdate()" );
		return "";
	}

	var envData = GenSignEnvUpdate(inData);
	if("" == envData)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("genSignEnvUpdate()");
		return "";
	}
	return envData;
}
function genSignEnvUpdateFile(inFile, outFile)
{
	if(inFile == null || inFile == "" || outFile == null || outFile == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "genSignEnvUpdateFile()" );
		return false;
	}

	var isSucceeded = GenSignEnvUpdateFile(inFile, outFile);
	if(false == isSucceeded)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("genSignEnvUpdateFile()");
		return false;
	}
	return true;
}
function genSignEnvFinal()
{
	var signValue = GenSignEnvFinal();
	if("" == signValue)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("genSignEnvFinal()");
		return "";
	}
	return signValue;
}
function vrfSignEnvInit(envSymmKey)
{
	if(envSymmKey == null || envSymmKey == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "vrfSignEnvInit()" );
		return false;
	}

	var isSucceeded = VrfSignEnvInit(envSymmKey);
	if(false == isSucceeded)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("vrfSignEnvInit()");
		return false;
	}
	return true;
}
function vrfSignEnvUpdate(inData)
{
	if(inData == null || inData == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "vrfSignEnvUpdate()" );
		return "";
	}

	var decData = VrfSignEnvUpdate(inData);
	if("" == decData)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("vrfSignEnvUpdate()");
		return "";
	}
	return decData;
}
function vrfSignEnvUpdateFile(inFile, outFile)
{
	if(inFile == null || inFile == "" || outFile == null || outFile == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "genSignEnvUpdateFile()" );
		return false;
	}

	var isSucceeded = VrfSignEnvUpdateFile(inFile, outFile);
	if(false == isSucceeded)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("genSignEnvUpdateFile()");
		return false;
	}
	return true;
}
function vrfSignEnvFinal(signValue, certString)
{
	if(signValue == null || signValue == "" || certString == null || certString == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "vrfSignEnvFinal()" );
		return false;
	}

	var isSucceeded = VrfSignEnvFinal(signValue, certString);
	if(false == isSucceeded)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("vrfSignEnvFinal()");
		return false;
	}
	return true;
}

function SetEncryptSymmetricKey(strCertID, strKeyID, encKey)
{
	if(strCertID == null || strCertID == "" || strKeyID == null || strKeyID == "" || encKey == null || encKey == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "SetEncryptSymmetricKey()" );
		return false;
	}
	
	if(false == isLoadedCertificate(strCertID))
	{
		setErrorCode("");
		setErrorMessage( "Not Loaded Cert" );
		setErrorFunctionName( "SetEncryptSymmetricKey()" );
		return false;
	}
	SetSessionID( strCertID );

	if(false == SetDecryptSymmetricKeySG(strKeyID, encKey) )
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("SetEncryptSymmetricKey()");
		return false;
	}
	return true;
}

function genSignEnvInitEx(certString, SignAlgName)
{
	if(certString == null || certString == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "genSignEnvInitEx()" );
		return "";
	}

	var envSymmKey = GenSignEnvInitEx(certString, SignAlgName);
	if("" == envSymmKey)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("genSignEnvInit()");
		return "";
	}
	return envSymmKey;
}

function vrfSignEnvInitEx(envSymmKey, SignAlgName)
{
	if(envSymmKey == null || envSymmKey == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "vrfSignEnvInit()" );
		return false;
	}

	var isSucceeded = VrfSignEnvInitEx(envSymmKey, SignAlgName);
	if(false == isSucceeded)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("vrfSignEnvInit()");
		return false;
	}
	return true;
}

function getEncSymKeySGForCTL(KeyID, KmCert)
{
	if(KeyID == null || KmCert == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getEncryptSymmetricKeySGForCTL()" );
		return "";
	}
	var envSymmKey = GetEncryptSymmetricKeySGForCTL(KeyID, KmCert);
	if("" == envSymmKey)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("getEncryptSymmetricKeySGForCTL()");
		return "";
	}
	return envSymmKey;
}

function encryptHugeFileSGNew( strKeyID, InFile, OutFile, ToBase64)
{
	if(strKeyID == null || strKeyID == "" || InFile == null || InFile == "" || OutFile == null || OutFile == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "encryptHugeFileSGNew()" );
		return false;
	}
	if(ToBase64 != 0 && ToBase64 != 1)
	{
		setErrorCode("NO_DATA_VALUE");
				setErrorMessage( "ToBase64 : 0(Base64), 1:(File)" );
		setErrorFunctionName( "encryptHugeFileSGNew()" );
		return false;
	}
	
	var bReturn = EncryptHugeFileSGNew(strKeyID, InFile, OutFile);
	if(false == bReturn)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("encryptHugeFileSGNew()");
		return false;
	}
	return true;
}

function decryptHugeFileSGNew( strKeyID, InFile, OutFile, IsBase64)
{
	if(strKeyID == null || strKeyID == "" || InFile == null || InFile == "" || OutFile == null || OutFile == "")
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "decryptHugeFileSGNew()" );
		return false;
	}
	if(IsBase64 != 0 && IsBase64 != 1)
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "IsBase64 : 0(Base64), 1:(File)" );
		setErrorFunctionName( "encryptHugeFileSGNew()" );
		return false;
	}
	
	var bReturn = DecryptHugeFileSGNew(strKeyID, InFile, OutFile, IsBase64);
	if(false == bReturn)
	{
		setErrorCode( "" );
		setErrorMessage(GetLastErrMsg());
		setErrorFunctionName("decryptHugeFileSGNew()");
		return false;
	}
	return true;
}

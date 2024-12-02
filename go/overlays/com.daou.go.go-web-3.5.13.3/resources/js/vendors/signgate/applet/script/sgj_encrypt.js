/**
 * @fileoverview 세션키 암호화 및 대칭키/비대칭키 암/복호화 스크립트
 *
 * @author hychul
 * @version 0.1
 */

/**
* 암호화된 세션키 반환
* @param {String}strUserID 세션ID
* @param  {String}strKmCert PEM 타입의 인증서
* @return {String}암호화된 세션키(BASE64)
*/
function SGJ_encryptSessionKey(strUserID, strKmCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(strKmCert))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_encryptSessionKey()" );
		return "";
	}

	var strEncryptedSessionKey = SG.encryptSessionKey( strUserID, strKmCert );
	if ( isNull(strEncryptedSessionKey))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_encryptSessionKey()" );
		return "";
	}
	return strEncryptedSessionKey;
}

/**
* 복호화된 세션키 반환
* @param {String}strUserID 세션ID
* @param {String}strEncryptedSessionKey 암호화된 세션키
* @return {String}복호화된 세션키
*/
function SGJ_decryptSessionKey( strUserID, strEncryptedSessionKey )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(strEncryptedSessionKey))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_decryptSessionKey()" );
		return "";
	}

	var decryptSessionKey = SG.decryptSessionKey(strUserID, strEncryptedSessionKey);
	if ( isNull(decryptSessionKey))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_decryptSessionKey()" );
		return "";
	}
	return decryptSessionKey;
}

/**
* 세션키로 암호화된 String 반환
* @param {String}strUserID 세션ID
* @param {String}strMessage 원본 메세지(암호화 대상)
* @return {String}대칭키로 암호화된 메세지(BASE64)
*/
function SGJ_encryptData( strUserID, strMessage )
{
	return SGJ_encryptDataWithAlgo(strUserID, strMessage, 'SEED/CBC/PKCS5');
}

/**
* 세션키로 암호화된 String 반환
* @param {String}strUserID 세션ID
* @param {String}strMessage 원본 메세지(암호화 대상)
* @param {String}algorithm 대칭키 알고리즘
* @return {String}대칭키로 암호화된 String
*/
function SGJ_encryptDataWithAlgo( strUserID, strMessage, algorithm )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(strMessage) || isNull(algorithm))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_encryptDataWithAlgo()" );
		return "";
	}

	var encStr = SG.encryptData( strUserID, strMessage, algorithm );

	if ( isNull(encStr))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_encryptDataWithAlgo()" );
		return "";
	}

	return encStr;
}

/**
* 세션키로 복호화된 String 반환
* @param {String}strUserID 세션ID
* @param {String}strEncryptedMessage 암호화된 String
* @return {String}세션키로 복호화된 String
*/
function SGJ_decryptData( strUserID, strEncryptedMessage )
{
	return SGJ_decryptDataWithAlgo( strUserID, strEncryptedMessage, 'SEED/CBC/PKCS5' );
}

/**
* 세션키로 복호화된 String 반환
* @param {String}strUserID 세션ID
* @param {String}strEncryptedMessage 암호화된 String
* @return {String}세션키로 복호화된 String
*/
function SGJ_decryptDataWithAlgo( strUserID, strEncryptedMessage, algorithm )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(strEncryptedMessage) || isNull(algorithm))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_decryptDataWithAlgo()" );
		return "";
	}

	var decStr = SG.decryptData(strUserID, strEncryptedMessage, algorithm);
	if ( isNull(decStr))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_decryptDataWithAlgo()" );
		return "";
	}

	return decStr;
}

/**
* 세션키로 복호화된 String 반환
* @param {String}strUserID 세션식별이 가능한 세션 ID
* @param {String}strEncSessionKey 암호화된 세션키
* @param {String}strEncData 세션키로 암호화된 데이터
* @return {String}세션키로 복호화된 String
*/
function SGJ_decryptDataWithSessionKey( strUserID, strEncSessionKey, strEncData, strCertType)
{
	var algorithm = "SEED/CBC/PKCS5";
	return SGJ_decryptDataWithSessionKeyWithAlgo(strUserID, strEncSessionKey, strEncData, algorithm, strCertType);
}

/**
* 세션키로 복호화된 String 반환
* @param {String}strUserID 세션식별이 가능한 세션 ID
* @param {String}strEncSessionKey 암호화된 세션키
* @param {String}strEncData 세션키로 암호화된 데이터
* @param {String}algorithm 대칭키 암호화 알고리즘
* @return {String}세션키로 복호화된 String
*/
function SGJ_decryptDataWithSessionKeyWithAlgo( strUserID, strEncSessionKey, strEncData, algorithm, strCertType )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(strEncSessionKey) || isNull(strEncData) || isNull(algorithm) || isNull(strCertType))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_decryptDataWithSessionKey()" );
		return "";
	}

	var decStr = SG.decryptDataWithSessionKey(strUserID, strEncSessionKey, strEncData, algorithm, strCertType );
	if ( isNull(decStr))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_decryptDataWithSessionKey()" );
		return "";
	}

	return decStr;
}

/**
* 세션키로 암호화된 파일 반환
* @param {String}strUserID 세션ID
* @param {String}strInputFilePath 암호화할 파일명
* @param {String}strOutputFilePath 암호화된 파일명
* @return {boolean}true 또는 false
*/
function SGJ_encryptFile(strUserID,  strInputFilePath, strOutputFilePath )
{
	return SGJ_encryptFileWithAlgo(strUserID,  strInputFilePath, strOutputFilePath, 'SEED/CBC/PKCS5');
}


/**
* 세션키로 암호화된 파일 반환
* @param {String}strUserID 세션ID
* @param {String}strInputFilePath 암호화할 파일명
* @param {String}strOutputFilePath 암호화된 파일명
* @param {String}algorithm 대칭키 알고리즘
* @return {boolean}true 또는 false
*/
function SGJ_encryptFileWithAlgo(strUserID,  strInputFilePath, strOutputFilePath, algorithm )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(strInputFilePath) || isNull(strOutputFilePath) || isNull(algorithm))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_encryptFileWithAlgo()" );
		return false;
	}

	var bReturn = SG.encryptFile( strUserID, strInputFilePath, strOutputFilePath, algorithm );
	if ( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_encryptFileWithAlgo()" );
		return false;
	}
	return bReturn;
}



/**
* 세션키로 복호화된 파일 반환
* @param {String}strUserID 세션ID
* @param {String}strInputFilePath 복호화할 파일명
* @param {String}strOutputFilePath 복호화된 파일명
* @return {boolean} true 또는 false
*/
function SGJ_decryptFile(strUserID,  strInputFilePath, strOutputFilePath )
{
	return SGJ_decryptFileWithAlgo(strUserID,  strInputFilePath, strOutputFilePath, 'SEED/CBC/PKCS5' );
}

/**
* 세션키로 복호화된 파일 반환
* @param {String}strUserID 세션ID
* @param {String}strInputFilePath 복호화할 파일명
* @param {String}strOutputFilePath 복호화된 파일명
* @param {String}algorithm 대칭키 알고리즘
* @return {boolean} true 또는 false
*/
function SGJ_decryptFileWithAlgo(strUserID,  strInputFilePath, strOutputFilePath, algorithm )
{
	clearError();
	
	var SG = document.getElementById(object_id);

	if ( isNull(strUserID) || isNull(strInputFilePath) || isNull(strOutputFilePath) || isNull(algorithm))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_decryptFileWithAlgo()" );
		return false;
	}
	
	var bReturn = SG.decryptFile(  strUserID, strInputFilePath, strOutputFilePath, algorithm  );
	if ( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_decryptFileWithAlgo()" );
		return false;
	}
	return bReturn;
}

/**
* 주어진 인증서로 암호화된 데이터 반환
* @param {String}strUserID 세션ID
* @param {String}kmCertString PEM 타입의 인증서
* @param {String}data 암호화할 String
* @return {String}RSA 암호화된 String(BASE64)
*/
function SGJ_encryptRSA( strUserID, kmCertString, data )
{
	clearError();
	
	var SG = document.getElementById(object_id);

	if (isNull(strUserID) || isNull(kmCertString) || isNull(data))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_encryptRSA()" );
		return "";
	}

	var encStr = SG.encryptRSA( strUserID, kmCertString, data );

	if ( isNull(encStr))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_encryptRSA()" );
		return "";
	}

	return encStr;
}


/**
* RSA 복호화된 데이터 반환
* @param {String}strUserID 세션ID
* @param {String}encString 암호화된 String
* @return {String}RSA 복호화된 String
*/
function SGJ_decryptRSA( strUserID, encString )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if (isNull(strUserID) || isNull(encString))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_decryptRSA()" );
		return "";
	}
	

	var decStr = SG.decryptRSA(strUserID, encString);
	if ( isNull(decStr))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_decryptRSA()" );
		return "";
	}
	
	return decStr;
}
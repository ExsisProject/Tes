/**
 * @fileoverview 서명 생성 및 검증 스크립트
 *
 * @author hychul
 * @version 0.1
 */

/**
* String에 대한 서명값 반환
* @param {String}strUserID 세션식별이 가능한 세션 ID
* @param {String}strMessage 서명 대상 String
* @return {String} 서명값
*/
function SGJ_getSignature(strUserID, strMessage )
{
	return SGJ_getSignatureWithAlgo(strUserID, strMessage, null);
}

/**
* String에 대한 서명값 반환
* @param {String}strUserID 세션식별이 가능한 세션 ID
* @param {String}strMessage 서명 대상 String
* @param {String}algorithm 서명시 해쉬 알고리즘
* @return {String} 서명값
*/
function SGJ_getSignatureWithAlgo(strUserID, strMessage, algorithm)
{
	clearError();
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(strMessage))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getSignatureWithAlgo()" );
		return "";
	}

	var strSignValue = SG.getSignature( strUserID, strMessage, algorithm );

	if ( isNull(strSignValue))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getSignatureWithAlgo()" );
		return "";
	}

	return strSignValue;
}


/**
* String에 대한 서명검증 결과 반환
* @param {String}strMessage 원본 메세지
* @param {String}strSignValue 서명값
* @param {String}strCert 서명 검증시 사용될 PEM 타입 인증서
* @return {boolean} true 또는 false
*/
function SGJ_verifySignature( strMessage, strSignValue, strCert )
{
	return SGJ_verifySignatureWithAlgo( strMessage, strSignValue, strCert, null);
}

/**
* String에 대한 서명검증 결과 반환
* @param {String}strMessage 원본 메세지
* @param {String}strSignValue 서명값
* @param {String}strCert 서명 검증시 사용될 PEM 타입 인증서
* @param {String}algorithm 검증시 사용할 해쉬 알고리즘
* @return {boolean} true 또는 false
*/
function SGJ_verifySignatureWithAlgo( strMessage, strSignValue, strCert, algorithm )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if (isNull(strMessage) || isNull(strSignValue) || isNull(strCert))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_verifySignatureWithAlgo()" );
		return false;
	}

	var bReturn = SG.verifySignature( strMessage, strSignValue, strCert, algorithm );

	if ( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_verifySignatureWithAlgo()" );
		return false;
	}
	return bReturn;
}

/**
* 파일에 대한 서명값 반환
* @param {String}strUserID 세션식별이 가능한 세션 ID
* @param {String}strFilePath 서명 대상 파일 경로
* @return {String} 파일에 대한 서명값
*/
function SGJ_getSignatureFromFile( strUserID, strFilePath )
{
	return SGJ_getSignatureFromFileWithAlgo( strUserID, strFilePath, null );
}

/**
* 파일에 대한 서명값 반환
* @param {String}strUserID 세션식별이 가능한 세션 ID
* @param {String}strFilePath 서명 대상 파일 경로
* @param {String}algorithm 서명시 사용할 해쉬 알고리즘
* @return {String} 파일에 대한 서명값
*/
function SGJ_getSignatureFromFileWithAlgo( strUserID, strFilePath, algorithm )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(strFilePath))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getSignatureFromFileWithAlgo()" );
		return "";
	}

	var strSignValue = SG.getSignatureFromFile (strUserID, strFilePath, algorithm);
	if ( isNull(strSignValue))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getSignatureFromFileWithAlgo()" );
		return "";
	}
	return strSignValue;
}


/**
* 파일에 대한 서명값 검증 결과 반환
* @param {String}strFilePath 원본 파일 경로
* @param {String}strSignValue 서명값
* @param {String}strCert 서명 검증시 사용될 PEM 타입 인증서
* @return {boolean} 서명검증 결과
*/
function SGJ_verifySignatureFromFile( strFilePath, strSignValue, strCert )
{
	return SGJ_verifySignatureFromFileWithAlgo( strFilePath, strSignValue, strCert, null );
}

/**
* 파일에 대한 서명값 검증 결과 반환
* @param {String}strFilePath 원본 파일 경로
* @param {String}strSignValue 서명값
* @param {String}strCert 서명 검증시 사용될 PEM 타입 인증서
* @param {String}algorithm 서명 검증시 사용할 해쉬 알고리즘
* @return {boolean} 서명검증 결과
*/
function SGJ_verifySignatureFromFileWithAlgo( strFilePath, strSignValue, strCert, algorithm )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strFilePath) || isNull(strSignValue) || isNull(strCert))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_verifySignatureFromFileWithAlgo()" );
		return false;
	}

	var result = SG.verifySignatureFromFile( strFilePath, strSignValue, strCert, algorithm);
	if (!result)
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_verifySignatureFromFileWithAlgo()" );
		return false;
	}
	return result;
}
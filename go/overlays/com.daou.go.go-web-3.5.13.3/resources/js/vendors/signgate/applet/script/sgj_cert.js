/**
 * @fileoverview 인증서 관련 정보 획득 및 신원확인 스크립트
 *
 * @author hychul
 * @version 0.1
 */

/**
* 인증서의 유효성을 검증<br>
* 기본 CRL 저장디렉토리는 USER_HOME<br>
* strCert 값이 null 인경우 세션에 저장된 인증서의 유효성을 검증<br>
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입의 인증서
* @return {boolean} true 또는 false
*/
function SGJ_checkCertValidity(strUserID, strCert)
{
	clearError();
	
	var SG = document.getElementById(object_id);

	if (isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_checkCertValidity()" );
		return false;
	}

	var bReturn = SG.checkCertValidity(strUserID, strCert );

	if ( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_checkCertValidity()" );
		return bReturn;
	}
	return bReturn;
}

/**
* 인증서의 유효성을 검증
* strCert 값이 null 인경우 세션에 저장된 인증서의 유효성을 검증
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입의 인증서
* @param {String}crlPath CRL 저장 경로
* @return {boolean} true 또는 false
*/
function SGJ_checkCertValidityWithPath( strUserID, strCert, crlPath )
{
	clearError();
	
	var SG = document.getElementById(object_id);

	if ( isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_checkCertValidityWithPath()" );
		return false;
	}

	var bReturn = SG.checkCertValidity(strUserID, strCert, crlPath);

	if ( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_checkCertValidityWithPath()" );
		return bReturn;
	}
	return bReturn;
}


/**
* 인증서 사용자의 신원확인
* @param {String}strUserID 세션ID
* @param {String}idn 사용자의 주민번호 또는 사업자 번호
* @param {String}encRandom 암호화된 랜덤값(BASE64 인코딩)
* @return {boolean} true 또는 false
*/
function SGJ_checkCertUserIdentity( strUserID, idn, encRandom )
{
	clearError();
	
	var SG = document.getElementById(object_id);

	if ( isNull(strUserID) || isNull(idn) || isNull(encRandom))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_checkCertUserIdentity()" );
		return false;
	}

	var bReturn = SG.checkCertUserIdentity( strUserID, idn, encRandom );

	if ( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_checkCertUserIdentity()" );
		return bReturn;
	}
	return bReturn;
}

/**
* 신원확인번호 입력창이 뜨는
* 인증서 사용자의 신원확인
* @return {void}
*/
function SGJ_checkCertUserIdentityWithDialog()
{
	clearError();
	
	var SG = document.getElementById(object_id);

	var bReturn = SG.checkCertUserIdentity();

	if ( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_checkCertUserIdentityWithDialog()" );
		return bReturn;
	}
	return bReturn;
}

/**
* 세션에 저장된 인증서 반환
* @param {String}strUserID 세션ID
* @param {String}certType 얻고자 하는 인증서 타입("SIGN" 또는 "KM");
* @return {String}PEM 타입의 인증서
*/
function SGJ_getCert( strUserID, certType )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	
	if ( isNull(strUserID) || isNull(certType))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getCert()" );
		return "";
	}
	
	var strCert = SG.getCert(strUserID, certType);
	
	if (isNull(strCert))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getCert()" );
		return "";
	}
	return strCert;
}

/**
* 세션에 저장된 인증서 바디만 반환
* @param {String}strUserID 세션ID
* @param {String}certType 얻고자 하는 인증서 타입("SIGN" 또는 "KM");
* @return {String}header , footer를 제외한 인증서
*/
function SGJ_getCertOnlyBody( strUserID, certType )
{
	clearError();
	
	var strCert = SGJ_getCert(strUserID ,certType );

	var strCertBody = strCert.replace(/(\-----BEGIN CERTIFICATE-----)+/g,'');
	strCertBody = strCertBody.replace(/(\-----END CERTIFICATE-----)+/g,'');
	strCertBody = strCertBody.replace(/\n/g,'');
	strCertBody = strCertBody.replace(/\r/g,'');

	return strCertBody;
}


//보안토큰 관련 추가 메소드========================================

/**
* 보안토큰에 저장된 개인 사용자 인증서 반환
* @param {String}strUserID 세션ID
* @param {String}certType 얻고자 하는 인증서 타입("SIGN" 또는 "KM");
* @return {String}PEM 타입의 인증서
*/
function SGJ_getBioUserCert( strUserID, certType )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	
	if ( isNull(strUserID) || isNull(certType))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getBioUserCert()" );
		return "";
	}

	var strCert = SG.getBioUserCert(strUserID, certType);

	if ( isNull(strCert))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getBioUserCert()" );
		return "";
	}
	return strCert;
}


/**
* 보안토큰 사용자 인증값 반환
* @param {String}strUserID 세션ID
* @param {String}svrCert 암호화를 위한 서버 인증서;
* @param {String}gonggoNum 공고번호;
* @return {String}사용자 인증값
*/
function SGJ_getAuthValue( strUserID, svrCert, gonggoNum )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	
	if ( isNull(strUserID) || isNull(svrCert) || isNull(gonggoNum))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getAuthValue()" );
		return "";
	}

	var authValue = SG.getAuthValue(strUserID, svrCert, gonggoNum);

	if ( isNull(authValue))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getAuthValue()" );
		return "";
	}
	return authValue;
}


/**
* 보안토큰 기기 인증값 반환
* @param {String}strUserID 세션ID
* @param {String}keyId 기관 번호(조달청은 01);
* @param {String}gonggoNum 공고번호;
* @return {String}보안토큰 기기 인증값
*/
function SGJ_getBioGenDevAuth( strUserID, keyId, gonggoNum )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	
	if ( isNull(strUserID) || isNull(keyId) || isNull(gonggoNum))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getBioGenDevAuth()" );
		return "";
	}

	var devAuthValue = SG.getBioGenDevAuth( strUserID, keyId, gonggoNum );

	if ( isNull(devAuthValue))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getBioGenDevAuth()" );
		return "";
	}
	return devAuthValue;
}

/**
* 보안토큰 개인 사용자 랜덤값 반환
* @param {String}strUserID 세션ID
* @return {String}보안토큰 개인 사용자랜덤값
*/
function SGJ_getBioUserRandom( strUserID )
{
	clearError();
	
	var SG = document.getElementById(object_id);

	if ( isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getBioUserRandom()" );
		return "";
	}
	
	var random = SG.getBioUserRandom(strUserID);

	if ( isNull(random))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getBioUserRandom()" );
		return "";
	}
	return random;
}

/**
* 보안토큰 개인 주민번호 또는 사업자 번호 반환
* @param {String}strUserID 세션ID
* @return {String}보안토큰 개인 주민번호 또는 사업자번호
*/
function SGJ_getBioUserIDN( strUserID )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	
	if (isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getBioUserIDN()" );
		return "";
	}

	var idn = SG.getBioUserIDN(strUserID);

	if ( isNull(idn))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getBioUserIDN()" );
		return "";
	}
	return idn;
}

/**
* 세션키로 암호화된 보안토큰 개인 주민번호 또는 사업자 번호 반환
* @param {String}strUserID 세션ID
* @return {String}세션키로 암호화된 보안토큰 개인 주민번호 또는 사업자번호
*/

function SGJ_getEncryptedBioUserIDN( strUserID )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	
	if (isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getEncryptedBioUserIDN()" );
		return "";
	}

	var idn = SG.getEncryptedBioUserIDN(strUserID);

	if ( isNull(idn))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getEncryptedBioUserIDN()" );
		return "";
	}
	return idn;
}

/**
* 보안토큰 시리얼 번호 반환
* @param {String}strUserID 세션ID
* @return {String}보안토큰 시리얼 번호
*/
function SGJ_getBioCSN( strUserID)
{
	clearError();
	
	var SG = document.getElementById(object_id);

	if (isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getBioCSN()" );
		return "";
	}
	
	var csn = SG.getBioCSN(strUserID);

	if ( isNull(csn))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getBioCSN()" );
		return "";
	}
	return csn;
}
//보안토큰 관련 추가 메소드 끝========================================

/**
* 실제 인증서가 저장된 경로 반환
* @param {String}strUserID 세션ID
* @return {String}인증서 저장경로
*/
function SGJ_getCertPath( strUserID )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	
	if (isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getCertPath()" );
		return "";
	}

	var strCertPath = SG.getCertPath(strUserID);
	if ( isNull(strCertPath) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getCertPath()" );
		return "";
	}
	return strCertPath;
}

/**
* 인증서 시리얼넘버 반환
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입 인증서
* @return {String}인증서 시리얼 넘버
*/
function SGJ_getSerialNumber( strUserID, strCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);

	if ( isNull(strUserID) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getSerialNumber()" );
		return "";
	}

	var nSerial = SG.getSerialNumber( strUserID, strCert );

	if ( isNull(nSerial) || nSerial < 0 )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getSerialNumber()" );
		return "";
	}
	return nSerial;
}

/**
* 인증서의 subjectDN 반환
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입의 인증서
* @return {String}인증서의 subjectDN
*/
function SGJ_getSubjectDN( strUserID, strCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	
	if ( isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getSubjectDN()" );
		return "";
	}
	
	var buf = SG.getSubjectDN( strUserID, strCert );
	if (isNull(buf))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getSubjectDN()" );
		return "";
	}

	return buf;
}

/**
* 인증서의 IssuerDN 반환
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입의 인증서
* @return {String}인증서의 subjectDN
*/
function SGJ_getIssuerDN( strUserID, strCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);

	if ( isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getIssuerDN()" );
		return "";
	}

	var buf = SG.getIssuerDN(strUserID, strCert);
	
	if ( isNull(buf))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getIssuerDN()" );
		return "";
	}

	return buf;
}

/**
* 인증서의 서명알고리즘 반환
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입의 인증서
* @return {String}인증서의 subjectDN
*/
function SGJ_getSigAlgName( strUserID, strCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	
	if ( isNull(strUserID) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getSigAlgName()" );
		return "";
	}
	
	var buf = SG.getSigAlgName(strUserID, strCert);
	if ( isNull(buf))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getSigAlgName()" );
		return "";
	}

	return buf;
}

/**
* 인증서의 유효시작시점 반환
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입의 인증서
* @return {String}인증서의 유효 시작시점
*/

function SGJ_getNotBefore( strUserID, strCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getNotBefore()" );
		return "";
	}

	var buf = SG.getNotBefore( strUserID, strCert );
	if ( isNull(buf))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getNotBefore()" );
		return "";
	}

	return buf;
}

/**
* 인증서의 유효종료시점 반환
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입의 인증서
* @return {String}인증서의 유효 종료시점
*/
function SGJ_getNotAfter( strUserID, strCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getNotAfter()" );
		return "";
	}

	var buf = SG.getNotAfter( strUserID, strCert );
	
	if ( isNull(buf))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getNotAfter()" );
		return "";
	}

	return buf;
}


/**
* 인증서의 공개키 반환
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입의 인증서
* @return {String}인증서의 공개키(Hex)
*/
function SGJ_getPublicKey( strUserID, strCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getPublicKey()" );
		return "";
	}

	var buf = SG.getPublicKey( strUserID, strCert );
	if ( isNull(buf))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getPublicKey()" );
		return "";
	}

	return buf;
}

/**
* 인증서의 키용도키 반환
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입의 인증서
* @return {String}인증서의 키용도
*/
function SGJ_getKeyUsage( strUserID, strCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);

	if ( isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getKeyUsage()" );
		return "";
	}

	var buf = SG.getKeyUsage( strUserID, strCert );
	if ( isNull(buf))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getKeyUsage()" );
		return "";
	}
	return buf;
}

/**
* 인증서의 정책 반환
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입의 인증서
* @return {String}인증서 정책
*/
function SGJ_getPolicy( strUserID, strCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getPolicy()" );
		return "";
	}

	var buf = SG.getPolicy( strUserID, strCert );
	if ( isNull(buf))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getPolicy()" );
		return "";
	}

	return buf;
}

/**
* 인증서 정보 요약
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입의 인증서
* @return {String}인증서 정보 요약
*/
function SGJ_getCertInfo( strUserID, strCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getCertInfo()" );
		return "";
	}

	var buf = SG.getCertInfo( strUserID, strCert );
	if ( isNull(buf))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getCertInfo()" );
		return "";
	}
	return buf;
}

/**
* 인증서 종류 반환
* @param {String}strUserID 세션ID
* @param {String}cert 인증서 스트링;
* @return {String} 인증서 종류("NPKI", "GPKI", "EPKI")
*/
function SGJ_getCertClass ( strUserID, cert )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getCertClass()" );
		return "";
	}
	
	var certClass = SG.getCertClass(strUserID, cert);

	if ( isNull(certClass))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getCertClass()" );
		return "";
	}

	return certClass;
}

/**
* 주어진 인증서를 암호화된 랜덤값 반환
* @param {String}strUserID 세션ID
* @param {String}strCert PEM 타입 인증서
* @return {String}인증서로 암호화된 랜덤값(BASE64)
*/
function SGJ_getEncryptedRandomWithCert(strUserID, strCert)
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID) || isNull(strCert) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getEncryptedRandomWithCert()" );
		return "";
	}

	var strRandomNumber = SG.getEncryptedRandom(strUserID, strCert);

	if ( isNull(strRandomNumber))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getEncryptedRandomWithCert()" );
		return "";
	}
	return strRandomNumber;
}

/**
* 세션키로 암호화된 랜덤값 반환
* @param {String}strUserID 세션ID
* @return {String}세션키로 암호화된 랜덤값(BASE64)
*/
function SGJ_getRandomString(strUserID)
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getRandom()" );
		return "";
	}
	var strRandomNumber = SG.getRandomString(strUserID);
	if ( isNull(strRandomNumber))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getRandom()" );
		return "";
	}
	return strRandomNumber;
}

/**
* 세션키로 암호화된 랜덤값 반환
* @param {String}strUserID 세션ID
* @return {String}세션키로 암호화된 랜덤값(BASE64)
*/
function SGJ_getEncryptedRandom(strUserID)
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getEncryptedRandom()" );
		return "";
	}
	var strRandomNumber = SG.getEncryptedRandom(strUserID);
	if ( isNull(strRandomNumber))
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getEncryptedRandom()" );
		return "";
	}
	return strRandomNumber;
}


/**
* 해당 oid가 개인 범용인지 체크
* @param {String}policyId 정책OID
* @return {boolean} true 또는 false
*/
function SGJ_isGeneralPerson( id, strCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);

	var check = SG.isGeneralPerson(id, strCert);
	if ( !check)
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_isGeneralPerson()" );
		return check;
	}
	return check;
}

/**
* 해당 oid가 사업자 범용인지 체크
* @param {String}policyId 정책OID
* @return {boolean} true 또는 false
*/
function SGJ_isGeneralBiz( id, strCert )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	
	var check = SG.isGeneralBiz(id, strCert);
	if ( !check)
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_isGeneralBiz()" );
		return check;
	}
	return check;
}

/**
* 인증서의 비밀번호 체크
* @param {String}strUserID 세션ID
* @return {boolean} true 또는 false
*/
function SGJ_isCorrectPasswd( strUserID )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_isCorrectPasswd()" );
		return false;
	}
	
	var check = SG.isCorrectPasswd(strUserID);
	if ( !check)
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_isCorrectPasswd()" );
		return check;
	}
	return check;
}

/**
* 인증서 복사
* 
*/
function SGJ_certCopy()
{
	var SG = document.getElementById(object_id);
	SG.certCopy();
}


/**
* 인증서 암호변경
*/
function SGJ_changePass()
{
	var SG = document.getElementById(object_id);
	SG.changePass();
}

/**
* 인증서 발급
* 
* @return {boolean} true 또는 false
*/
function SGJ_issueCert()
{
	clearError();
	
	var SG = document.getElementById(object_id);
	var check =  SG.issueCert();
	if(!check)
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_issueCert()" );
		return check;
	}
	return check;
}


/**
* 인증서 발급
* @param {String}authCode 참조번호
* @param {String}refNumber 인가코드
* @return {boolean} true 또는 false
*/
function SGJ_issueCertWithCode(authCode, refNumber)
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(authCode) || isNull(refNumber))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_issueCert()" );
		return false;
	}
	var check = SG.issueCert(authCode, refNumber);
	if(!check)
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_issueCert()" );
		return check;
	}
	return check;
}


/**
* 인증서 갱신
* 
* @return {boolean} true 또는 false
*/
function SGJ_updateCert()
{
	clearError();
	
	var SG = document.getElementById(object_id);
	var check = SG.updateCert();
	if(!check)
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_updateCert()" );
		return check;
	}
	return check;
}

/**
* 인증서 재발급
* 
* @return {boolean} true 또는 false
*/
function SGJ_reIssueCert()
{
	clearError();
	
	var SG = document.getElementById(object_id);
	var check = SG.reIssueCert();
	if(!check)
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_reIssueCert()" );
		return check;
	}
	return check;
}


/**
* 인증서 재발급
* @param {String}authCode 참조번호
* @param {String}refNumber 인가코드
* @return {boolean} true 또는 false
*/
function SGJ_reIssueCertWithCode(authCode, refNumber)
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(authCode) || isNull(refNumber))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_reIssueCert()" );
		return false;
	}
	var check = SG.reIssueCert(authCode, refNumber);
	if(!check)
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_reIssueCert()" );
		return check;
	}
	return check;
}

/**
* 인증서 폐지
* 
* @return {boolean} true 또는 false
*/
function SGJ_revokeCert()
{
	clearError();
	
	var SG = document.getElementById(object_id);
	var check = SG.revokeCert();
	if(!check)
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_revokeCert()" );
		return check;
	}
	return check;
}

/**
* 인증서 효력정지
* 
* @return {boolean} true 또는 false
*/
function SGJ_stopCert()
{
	clearError();
	
	var SG = document.getElementById(object_id);
	var check = SG.stopCert();
	if(!check)
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_stopCert()" );
		return check;
	}
	return check;
}


/**
* PC에서 모바일 기기로 인증서 내보내기
* @return {void}
*/
function SGJ_pcToMobile()
{
	var SG = document.getElementById(object_id);
	SG.pcToMobile();
}

/**
* 모바일 기기에서 PC로 인증서 내보내기
* @return {void}
*/
function SGJ_mobileToPc()
{
	var SG = document.getElementById(object_id);
	SG.mobileToPc();
}


/**
* 신원정보가 없는 인증서를 신원확인이 있는 인증서로 변환
* @param {String}host 요청을 보낼 CA IP
* @param {int}port 요청을 보낼 CA PORT
*/
function SGJ_addVidToCert(host, port)
{
	clearError();
	
	if (isNull(host) || isNull(port))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_addVidToCert()" );
		return;
	}
	
	var SG = document.getElementById(object_id);
	SG.addVidToCert(host, port);
}
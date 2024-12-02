/**
 * @fileoverview 인증서 선택창 관련 설정 스크립트
 *
 * @author hychul
 * @version 0.1
 */


/**
* 인증서 선택창 띄우는 메소드
* 세션에 이미 인증서 정보가 존재하면 true 반환
* 창을 띄우다 오류가 발생하면 false 반환
* @param {String}strUserID 세션식별이 가능한 세션 ID
* @return {boolean} true 또는 false
*/
function SGJ_selectCertificate( strUserId )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	
	if ( isNull(strUserId))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_selectCertificate()" );
		return false;
	}
	
	//조달청시 이 부분 주석처리
	strUserId = getMac(strUserId) + strUserId;
	var bReturn = SG.selectCertificate(strUserId);
	if ( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_selectCertificate()" );
		return false;
	}
	return bReturn;
}

/**
* 인증서 선택창 배너이미지 설정
* @param {String}imagePath 이미지 Url 경로
* @return {void}
*/
function SGJ_setBannerImage( imagePath )
{
	var SG = document.getElementById(object_id);
	SG.setBannerImage( imagePath );
	return;
}

/**
* 인증서 선택창에 보여질 인증서 정책 설정
* @param {String}policyList 보여질 정책 리스트
* @return {void}
*/
function SGJ_setCertPolicy( policyList )
{
	var SG = document.getElementById(object_id);
	SG.setCertPolicy( policyList );
	return;
}


/**
* 인증서 레이아웃 설정
* @param {String}layout 레이아웃 형태("NORMAL" | "EXT");
* @return {void}
*/
function SGJ_setLayout( layout )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if (isNull(layout))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_setLayout()" );
		return;
	}
	SG.setLayout( layout );
	return;
}

/**
* <pre>
* 활성화 미디어 설정
* mediaType 에 허용 가능한 값
* "" -> 모든 매체 비활성화
* location_hdd -> 하드디스크
* location_removable -> 이동식디스크
* location_token -> 저장토큰
* location_hsm -> 보안토큰
* location_bhsm -> 바이오 보안토큰
* location_mp -> 휴대폰
* 복수로 쓰려면 구분자 "|"를 사용
* ex) location_hdd|location_token
* </pre>
* @param {String}mediaType 활성화 시킬 미디어 타입
* @return {void}
*/
function SGJ_setEnableMedia( mediaType )
{
	var SG = document.getElementById(object_id);
	SG.setEnableMedia( mediaType );
	return;
}

/**
 * 저장매체란에 휴대폰을 나오게 할지 결정한다.
 * @param {boolean}isEnable 활성화 여부
 * @return {void}
 */
function SGJ_setMPEnable( isEnable )
{
	var SG = document.getElementById(object_id);
	SG.setMPEnable( isEnable );
	return;
}

/**
 * 저장매체란에 바이오토큰을 나오게 할지 결정한다.
 * @param {boolean} isEnable 활성화 여부
 * @return {void}
 */
function SGJ_setBIOEnable( isEnable )
{
	var SG = document.getElementById(object_id);
	SG.setBIOEnable( isEnable );
	return;
}

/**
* 서로 다른 세션 연계
* @param {String}strUserId 연계시킬 세션 ID<br>
* @return {void}
*/
function SGJ_setPreSessionId( strUserId )
{
	clearError();
	var SG = document.getElementById(object_id);
	if (isNull(strUserId))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_setPreSessionId()" );
		return;
	}
	SG.setPreSessionId( strUserId );
	return;
}

/**
* 이전 세션에 선택했던 인증서만 보이도록 세팅
* @param {String}strUserId 기존 세션 ID<br>
* @return {void}
*/
function SGJ_setLimitDn( strUserId )
{
	clearError();
	var SG = document.getElementById(object_id);
	SG.setLimitDn(strUserId);
}

/**
* 이전 세션에 선택했던 인증서만 보이도록 세팅
* @param {String}strUserId 기존 세션 ID<br>
* @return {void}
*/
function SGJ_setPreSetting( strUserId )
{
	clearError();
	var SG = document.getElementById(object_id);
	if (isNull(strUserId))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_setPreSessionId()" );
		return;
	}
	return SG.setPreSetting(strUserId);
}


/**
* 이전 세션에 선택했던 인증서만 보이도록 하는 세팅을 초기화
* @return {void}
*/
function SGJ_resetPreSetting()
{
	clearError();
	var SG = document.getElementById(object_id);
	SG.resetPreSetting();
}


/**
* 만료된 인증서를 선택창에 보여줄것인지 세팅
* @param {boolean}viewExpiredCert 만료된 인증서를<br>
* 선택창에 보여줄것인지 세팅<br>
* 디폴트값 true<br>
* 
* @return {void}
*/
function SGJ_setViewExpiredCert(viewExpiredCert)
{
	clearError();
	var SG = document.getElementById(object_id);
	SG.setViewExpiredCert(viewExpiredCert);
}


/**
* 인증서 선택창에서 갱신 경고창을 여부 세팅
* @param {boolean}setting 갱신 경고창 설정 여부<br>
* @return {void}
*/
function SGJ_setUpdateWran ( setting )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if (isNull(setting))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_setUpdateWran()" );
		return;
	}
	
	SG.SGJ_setUpdateWran(setting);
	return;
}


/**
 * 인증서 선택창 설정정보 세팅
 * @return {void}
 */
function SGJ_getConfigMap()
{
	clearError();
	
	var SG = document.getElementById(object_id);
	var obj = SG.getConfigMap();
	if ( isNull(obj) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getConfigMap()" );
		return false;
	}
	return obj;
}

/**
* <pre>
* 사용자가 선택한 인증서가 담긴 미디어 타입 반환
* location_hdd -> 하드디스크
* location_removable -> 이동식디스크
* location_token -> 저장토큰
* location_hsm -> 보안토큰
* location_bhsm -> 바이오 보안토큰
* location_mp -> 휴대폰
* </pre>
* @param {String}strUserID 세션식별이 가능한 세션 ID
* @return {String}사용자가 선택한 인증서가 담긴 미디어 타입
*/

function SGJ_getSelectedMedia( strUserId )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserId) )
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_getSelectedMedia()" );
		return "";
	}
	var result = SG.getSelectedMedia( strUserId );
	if ( isNull(result) )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_getSelectedMedia()" );
		return "";
	}
	return result;
}
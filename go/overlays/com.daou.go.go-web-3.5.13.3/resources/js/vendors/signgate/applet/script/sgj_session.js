/**
 * @fileoverview 세션 관리 스크립트
 *
 * @author hychul
 * @version 0.1
 */

/**
* 주어진 세션 ID 의 정보 삭제
* @param {String}strUserID 세션식별이 가능한 세션 ID
* @return {boolean}true 또는 false
*/
function SGJ_removeSession( strUserID )
{
	clearError();
	
	var SG = document.getElementById(object_id);
	if ( isNull(strUserID))
	{
		setErrorCode( "PARAMETER_NULL" );
		setErrorFunction( "SGJ_removeSession()" );
		return false;
	}
	SG.removeSession(strUserID);
	return true;
}

/**
* 모든 세션 정보 삭제
* @return {boolean}true 또는 false
*/
function SGJ_removeAllSession()
{
	clearError();
	
	var SG = document.getElementById(object_id);
	var bReturn = SG.removeAllSession();
	if ( !bReturn )
	{
		setErrorCode( "INVALID_RETURN_VALUE" );
		setErrorMsg(SGJ_getErrorMsg());
		setErrorFunction( "SGJ_removeAllSession()" );
		return false;
	}
	return bReturn;
}
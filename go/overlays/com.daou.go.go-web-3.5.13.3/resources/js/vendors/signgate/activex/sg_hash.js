//*************************************************************************************
//	파일명		: sg_hash.js
//	작성자		: 안재형
//	최초 작성일	: 2003년 7월 21일
//	최종 수정일	: 2004년 7월 8일
//*************************************************************************************

function getMessageDigest( strMessage )
{
	if ( strMessage == null || strMessage == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getMessageDigest()" );
		return "";
	}

	var strDigest = GenHashValue( strMsgDigestAlg, strMessage );
	if ( strDigest == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getMessageDigest()" );
		return "";
	}
	
	return removeCRLF( strDigest );
}

function getMessageDigestFromFile( strFilePath )
{
	if ( strFilePath == null || strFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "getMessageDigest()" );
		return "";
	}

	var strDigest = GenHashValueFile( strMsgDigestAlg, strFilePath );
	if ( strDigest == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getMessageDigest()" );
		return "";
	}
	
	return removeCRLF( strDigest );
}

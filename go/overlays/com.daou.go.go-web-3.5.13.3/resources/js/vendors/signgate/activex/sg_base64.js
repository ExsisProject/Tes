//*************************************************************************************
//	파일명		: sg_base64.js
//	작성자		: 안재형
//	최초 작성일	: 2003년 7월 21일
//	최종 수정일	: 2003년 8월 9일
//*************************************************************************************

function base64Encode( strMessage )
{
	if ( strMessage == null || strMessage == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "base64Encode()" );
		return "";
	}

	var buf = Base64Encode( strMessage );
	if ( buf == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "base64Encode()" );
		return "";
	}

	return removeCRLF( buf );
}

function base64Decode( strMessage )
{
	if ( strMessage == null || strMessage == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "base64Decode()" );
		return "";
	}

	var buf = Base64Decode( strMessage );
	if ( buf == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "base64Decode()" );
		return "";
	}

	return buf;
}

function base64EncodeFromFile( strInputFilePath, strOutputFilePath )
{
	if ( strInputFilePath == null || strInputFilePath == "" 
		|| strOutputFilePath == null || strOutputFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "base64EncodeFromFile()" );
		return false;
	}

	var bReturn = Base64EncodeFile( strInputFilePath, strOutputFilePath );
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "base64EncodeFromFile()" );
		return false;
	}

	return true;	
}

function base64DecodeFromFile( strInputFilePath, strOutputFilePath )
{
	if ( strInputFilePath == null || strInputFilePath == "" 
		|| strOutputFilePath == null || strOutputFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "base64DecodeFromFile()" );
		return false;
	}

	var bReturn = Base64DecodeFile( strInputFilePath, strOutputFilePath );
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "base64DecodeFromFile()" );
		return false;
	}

	return true;	
}

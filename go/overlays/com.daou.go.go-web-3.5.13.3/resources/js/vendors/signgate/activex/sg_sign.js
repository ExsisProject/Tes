//*************************************************************************************
//	파일명		: sg_sign.js
//	작성자		: 안재형
//	최초 작성일	: 2003년 7월 21일
//	최종 수정자	: 박옥자
//	최종 수정일	: 2006년 9월 20일
//*************************************************************************************

function generateDigitalSignature( strCertID, strMessage )
{
	if ( strMessage == null || strMessage == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generateDigitalSignature()" );
		return "";
	}

	var bReturn = selectCertificate( strCertID );
	if ( !bReturn )
	{
		setErrorFunctionName( "generateDigitalSignature()" );
		return "";		
	}

	// 20060920, modified by ojpark
	var strSignValue = GenerateDigitalSignatureSG( strMessage );
	if ( strSignValue == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "generateDigitalSignature()" );
		return "";
	}

	return removeCRLF( strSignValue );
}

function verifyDigitalSignature( strMessage, strSignValue, strCert )
{
	if ( strSignValue == null || strSignValue == "" 
		|| strCert == null || strCert == "" 
		|| strMessage == null || strMessage == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "verifyDigitalSignature()" );
		return false;
	}
	
	// 20060920, modified by ojpark
	var bReturn = VerifyDigitalSignatureSG( strMessage, strSignValue, strCert );
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "verifyDigitalSignature()" );
		return false;
	}

	return true;
}

function generateDigitalSignatureFromFile( strCertID, strFilePath )
{
	if ( strFilePath == null || strFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "generateDigitalSignatureFromFile()" );
		return "";
	}

	var bReturn = selectCertificate( strCertID );
	if ( !bReturn )
	{
		setErrorFunctionName( "generateDigitalSignatureFromFile()" );
		return "";		
	}

	// 20060920, modified by ojpark
	var strSignValue = GenerateDigitalSignatureFileSG( strFilePath );
	if ( strSignValue == "" )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "generateDigitalSignatureFromFile()" );
		return "";
	}

	return removeCRLF( strSignValue );
}

function verifyDigitalSignatureFromFile( strFilePath, strSignValue, strCert )
{
	if ( strFilePath == null || strFilePath == ""
		|| strSignValue == null || strSignValue == "" 
		|| strCert == null || strCert == ""  )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "verifyDigitalSignatureFromFile()" );
		return false;
	}
	
	// 20060920, modified by ojpark
	bReturn = VerifyDigitalSignatureFileSG( strFilePath, strSignValue, strCert )
	if ( !bReturn )
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "verifyDigitalSignatureFromFile()" );
		return false;
	}

	return true;
}

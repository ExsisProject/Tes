//*************************************************************************************
//	파일명		: sg_util.js
//	작성자		: 안재형
//	최초 작성일	: 2003년 7월 21일
//	최종 수정자	: 안재형
//	최종 수정일	: 2005년 10월 18일
//*************************************************************************************

function getMacAddress(keyID)
{
	if(keyID == null || keyID == "")
	{
		setErrorCode( "NO_USER_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "getMacAddress()" );
		return "";
	}
	var macAddress = GetMacAddress( keyID );
	if ("" == macAddress)
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getMacAddress()" );
		return "";
	}
	return macAddress;
}

function getMacAddress2(keyID, format)
{
	if(keyID == null || keyID == "")
	{
		setErrorCode( "NO_USER_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "getMacAddress2()" );
		return "";
	}
	var macAddress = GetMacAddress2(keyID, format);
	if ("" == macAddress)
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getMacAddress2()" );
		return "";
	}
	return macAddress;
}

function getIPAddress2(keyID, format)
{
	if(keyID == null || keyID == "")
	{
		setErrorCode( "NO_USER_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "getIPAddress2()" );
		return "";
	}
	var ipAddress = GetIPInfo2(keyID, format);
	if ("" == ipAddress)
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getIPAddress2()" );
		return "";
	}
	return ipAddress;
}

function getHDDSerial2(keyID, format)
{
	if(keyID == null || keyID == "")
	{
		setErrorCode( "NO_USER_ID" );
		setErrorMessage( "" );
		setErrorFunctionName( "getHDDSerial2()" );
		return "";
	}
	var hddSerial = GetStorageSerial2(keyID, format);
	if ("" == hddSerial)
	{
		setErrorCode( "" );
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "getHDDSerial2()" );
		return "";
	}
	return hddSerial;
}

//*************************************************************************************
//	이름	: removeCRLF()
//	인자	: str	- 데이터 스트링
//	반환값	: '\r'과 '\n'이 제거된 데이터 스트링
//	기능	: 데이터 스트링으로부터 '\r'과 '\n'을 제거하여 반환한다
//*************************************************************************************
function removeCRLF( str )
{
	var i = 0;
	var buf = "";
	for( i = 0; i < str.length; i++ )
	{
		if ( str.charAt(i) != '\n' && str.charAt(i) != '\r' )
		{
			buf += str.charAt(i);
		}
	}
	return buf;
}

//*************************************************************************************
//	이름	: getLocalPath()
//	인자	: strFileName	- 파일의 상대 경로
//	반환값	: 성공	- 파일의 절대 경로
//		  실패	- ""
//	기능	: 로컬 파일 시스템에 저장된 HTML파일에서
//		  다른 파일의 상대 경로를 절대 경로로 바꾸어 준다
//*************************************************************************************
function getLocalPath( strFileName )
{
	var strLocalPath = "";
	var pos = 0;
	var i = 0;
	
	if ( strFileName == null || strFileName == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		return "";
	}
	
	var buf = location.href.substring( 0, 8 );
	if ( buf != "file:///" )
	{
		setErrorCode( "NOT_LOCAL_FILE" );
		setErrorMessage( "" );
		return "";
	}
	
	buf = location.href.substring( 8, location.href.length );
	
	for ( i = 0; i < buf.length; i++ )
	{
		if ( buf.charAt(i) == "/" )
		{
			strLocalPath += "\\";
			pos = strLocalPath.length;
		} else if ( buf.charAt(i) == "%"
				&& buf.charAt(i+1) == "2"
				&& buf.charAt(i+2) == "0" )
		{
			strLocalPath += " ";
			i += 2;
		} else {
			strLocalPath += buf.charAt(i);
		}
	}
	
	strLocalPath = strLocalPath.substring( 0, pos ) + strFileName;

	return strLocalPath;
}

//*************************************************************************************
//	이름	: insertLFtoPEMCert()
//	인자	: strCert	- '\n' 문자를 제거한 PEM 형식 인증서
//	반환값	: 성공	- '\n'이 포함된 PEM 형식 인증서
//		  실패	- ""
//	기능	: '\n'을 제거한 PEM 형식 인증서에 '\n'을 다시 추가한다
//*************************************************************************************
function insertLFtoPEMCert( strCert )
{
	if ( strCert == null || strCert == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		setErrorFunctionName( "insertLFtoPEMCert()" );
		return "";
	}

	var pemHeader	= "-----BEGIN CERTIFICATE-----";
	var pemTrailer	= "-----END CERTIFICATE-----";
	var buf = removeCRLF( strCert );

	var i = 0;
	var nCount = 0;
	for ( i = 0; i < pemHeader.length; i++ )
	{
		if ( pemHeader.charAt( i ) == buf.charAt( i ) )
		{
			nCount = nCount + 1;
		}
	}
	if  ( nCount != pemHeader.length )
	{
		setErrorCode("NOT_PEM_CERT");
		setErrorMessage( "" );
		setErrorFunctionName( "insertLFtoPEMCert()" );
		return "";
	}

	nCount = 0;
	for ( i = 0; i < pemTrailer.length; i++ )
	{
		if ( pemTrailer.charAt( i ) == buf.charAt( buf.length - pemTrailer.length + i ) )
		{
			nCount = nCount + 1;
		}
	}
	if  ( nCount != pemTrailer.length )
	{
		setErrorCode("NOT_PEM_CERT");
		setErrorMessage( "" );
		setErrorFunctionName( "insertLFtoPEMCert()" );
		return "";
	}

	var strPEMCert = "";
	nCount = 0;
	for ( i = 0; i < buf.length - pemHeader.length - pemTrailer.length; i++ )
	{
		strPEMCert += buf.charAt( i + pemHeader.length );
		nCount = nCount + 1;
		if ( nCount == 64 )
		{
			strPEMCert += '\n';
			nCount = 0;
		}
	}

	strPEMCert = pemHeader + "\n" + strPEMCert + "\n" + pemTrailer;
	
	return strPEMCert;
}

//////////////////////
/// 사라질 함수들....
function fileCopy( inFilePath, outFilePath )
{
	if ( inFilePath == null || inFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		return "";
	}
	if ( outFilePath == null || outFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		return "";
	}
	var strResult = FileCopy(inFilePath, outFilePath);
	if ( strResult == null || strResult == "" )
	{
		setErrorCode("");
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "fileCopy()" );
		return "";
	}
	return strResult;
}
function fileRead( inFilePath, TypeFlag )
{
	if ( inFilePath == null || inFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		return "";
	}
	var strResult = FileRead(inFilePath, TypeFlag);
	if ( strResult == null || strResult == "" )
	{
		setErrorCode("");
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "fileRead()" );
		return "";
	}
	return strResult;
}
function fileRename(inFilePath, outFilePath )
{
	if ( inFilePath == null || inFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		return "";
	}
	if ( outFilePath == null || outFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		return "";
	}
	var strResult = FileRename(inFilePath, outFilePath);
	if ( strResult == null || strResult == "" )
	{
		setErrorCode("");
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "fileRename()" );
		return "";
	}
	return strResult;
}
function fileChange(inFilePath, outFilePath )
{
	if ( inFilePath == null || inFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		return "";
	}
	if ( outFilePath == null || outFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		return "";
	}
	var strResult = FileChange(inFilePath, outFilePath);
	if ( strResult == null || strResult == "" )
	{
		setErrorCode("");
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "fileChange()" );
		return "";
	}
	return strResult;
}
function makeDir(inFilePath)
{
	if ( inFilePath == null || inFilePath == "" )
	{
		setErrorCode("NO_DATA_VALUE");
		setErrorMessage( "" );
		return "";
	}
	var strResult = MakeDir(inFilePath);
	if ( strResult == null || strResult == "" )
	{
		setErrorCode("");
		setErrorMessage( GetLastErrMsg() );
		setErrorFunctionName( "makeDir()" );
		return "";
	}
	return strResult;
}

function setHashAlgOfCryptoApi(HashAlg) 
{
  strHashAlg = HashAlg;
  return;
}

function setEncryptAlgOfCryptoApi(EncryptAlg) 
{
  	strEncryptAlg = EncryptAlg;
    return;
}

function setEncryptKeyLenOfCryptoApi(EncryptKeyLen) 
{
  	szEncryptKeyLen = EncryptKeyLen;
    return;
}

function setMsgDigestAlgofApi(MsgDigestAlg)
{
  	strMsgDigestAlg = MsgDigestAlg;
	return;
}

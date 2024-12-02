//*************************************************************************************
//	���ϸ�		: sg_basic.js
//	���� ������	: 2012�� 12�� 21��
//	����		: SG_CAppAtx.ocx�� �⺻���� �޼ҵ带 �����Ѵ�.
//*************************************************************************************

var bUseKMCert;
var strHashAlg;
var strMsgDigestAlg;
var bCryptoToolkitInstalled = true;
var strAllowedPolicyOID;
// 20060920, added by ojpark, for ARIA
var strEncryptAlg;
var szEncryptKeyLen;
//*************************************************************************************
//	�̸�	: initCryptoApi()
//	���	: SignGATE2 Toolkit Java Script�� ����ϱ� ���ؼ� �ʿ��� �ʱ�ȭ ������ �Ѵ�.
//		  �ʿ信 ��� ������ ���� ���� ������ �����Ͽ� ����� �� ������, �ڵ����� ȣ��ȴ�.
//      strHashAlg�� ����Ʈ ������ ������� �����Ǿ� ������, "SHA256"���� ����ÿ� setHashAlgOfCryptoApi�Լ� ���.
//      strHashAlg�� ���� ����̰ų� NULL�ϰ�쿡 ������������ ���� �˰?���� �̿��Ѵ�.
//	SetCertDialogImage : 380x60 ������ BMP���
//*************************************************************************************
function initCryptoApi() {
	bUseKMCert = true;
	strHashAlg = "";	
	strEncryptAlg = "ARIA-CBC"	// SEED-CBC or ARIA-CBC		: ��ĪŰ �˰?��
	szEncryptKeyLen = 16;		// SEED(16), ARIA(16/24/32) : ��ĪŰ ����
	strMsgDigestAlg = "SHA1";

	if ( bCryptoToolkitInstalled )
	{
		SetCertDialogImage( "" );
		SetCAInfo( 0 );
	}
	return;
}


//*************************************************************************************
//	�̸�	: cryptoToolkitNotInstalled()
//	���	: Ŭ���̾�Ʈ ��Ŷ�� ���������� ��ġ���� �ʾ��� �� ȣ��Ǵ� �Լ���
//		  �ʿ信 ��� ��Ŷ ��ġ �������� �̵��ϵ��� �ϰų�, 
//		  ������ �޼����� �����ֵ��� �����Ͽ� ����� �� �ִ�.
//*************************************************************************************
function cryptoToolkitNotInstalled() {
	bCryptoToolkitInstalled = false;
	if ( confirm( '보안 소프트웨어가 설치되지 않았습니다. 보안 프로그램을 수동으로 설치하시겠습니까?\n\n확인을 누르시면 파일 다운로드 창이 열립니다.\n저장 버튼을 누르시어 보안 소프트웨어 설치 프로그램을 바탕화면에 저장하신 다음에,\n열려있는 웹 브라우저를 모두 닫으신 후에 실행시켜 주십시오.' ))
	{
		location.href = "http://download.signgate.com/download/2048/ews/ewsinstaller_full.exe";
	}
	return;
}

//*************************************************************************************
//	������ �Լ����� ���� ���� ����� �� �����Ƿ�,
//	�������α׷� �ڵ忡�� ���� ���� ȣ���Ͽ� ����Ͽ����� �ȵ˴ϴ�!!
//*************************************************************************************
document.write('<object classid="clsid:9FC84F7D-D177-4A75-A7BB-429DA5BD0A3E" style="display: none;" onError="javascript:cryptoToolkitNotInstalled();" onReadyStateChange="javascript:initCryptoApi()" id="SG_ATL" codeBase="http://download.signgate.com/download/2048/ews/ewsinstaller_full.cab#version=4,0,1,26"> </object>')

function SetCAInfo( CACode )
{
	SG_ATL.SetCAInfo( CACode );//[id(1)]
	return;
}

function SetSessionID( SessionID )
{
	SG_ATL.SetSessionID( SessionID );//[id(72)]
	return;
}

function LoadUserKeyCertDlg( UseKMCert )
{
	return SG_ATL.LoadUserKeyCertDlg( UseKMCert );//[id(4)]
}

function UnloadUserKeyCert()
{
	SG_ATL.UnloadUserKeyCert();//[id(5)]
	return;
}

function GetUserSignCert()
{
	return SG_ATL.GetUserSignCert();//[id(6)]
}

function GetUserKMCert()
{
	return SG_ATL.GetUserKMCert();//[id(7)]
}

function GetUserKMKey()
{
	return SG_ATL.GetUserKMKey( "" );//[id(9)]
}

function GetUserKMKeyWithNewPassword( strNewPassword )
{
	return SG_ATL.GetUserKMKey( strNewPassword );//[id(9)]
}

function GetCertPath()
{
	return SG_ATL.GetCertPath();//[id(94)]
}

function GetUserPassword()
{
	return SG_ATL.GetUserPassword();//[id(10)]
}

function GetSubjectDNFromCert( Cert )
{
	return SG_ATL.GetSubjectDNFromCert( Cert );//[id(12)]
}

function GetSerialNumberFromCert( Cert )
{
	return SG_ATL.GetSerialNumberFromCert( Cert );//[id(13)]
}

function GetCertInfoFromCert( Cert, index )
{
	return SG_ATL.GetCertInfoFromCert( Cert, index );//[id(77)]
}

function SetCertPolicy( Policies )
{	
	return SG_ATL.SetCertPolicy( Policies );//[id(14)]
}

function ValidateCert( Cert )
{
	return SG_ATL.ValidateCert( Cert );//[id(15)]
}

function GetUserKeyRNumber()
{
	return SG_ATL.GetUserKeyRNumber();//[id(16)]
}

function CheckCertOwner( Cert, SSN, RNumber )
{
	return SG_ATL.CheckCertOwner( Cert, SSN, RNumber );//[id(17)]
}

function GenPKCS7SignedMsg_Old( InData )
{
	return SG_ATL.GenPKCS7SignedMsg( InData );//[id(23)]
}

function GenPKCS7SignedMsgFile_Old( InFile, OutFile )
{
	return SG_ATL.GenPKCS7SignedMsgFile( InFile, OutFile );//[id(24)]
}

function AddPKCS7Signature( InData )
{
	return SG_ATL.AddPKCS7Signature( InData );//[id(25)]
}

function AddPKCS7SignatureFile( InFile, OutFile )
{
	return SG_ATL.AddPKCS7SignatureFile( InFile, OutFile );//[id(26)]
}

function GenPKCS7EnvelopedMsg_Old( InData, MyCert, RcvCert )
{
	return SG_ATL.GenPKCS7EnvelopedMsg( InData, MyCert, RcvCert );//[id(27)]
}

function GenPKCS7EnvelopedMsgFile_Old( InFile, MyCert, RcvCert, OutFile )
{
	return SG_ATL.GenPKCS7EnvelopedMsgFile( InFile, MyCert, RcvCert, OutFile );//[id(28)]
}

function GenPKCS7SignedEnvelopedMsg_Old( InData, MyCert, RcvCert )
{
	return SG_ATL.GenPKCS7SignedEnvelopedMsg( InData, MyCert, RcvCert );//[id(29)]
}

function GenPKCS7SignedEnvelopedMsgFile_Old( InFile, MyCert, RcvCert, OutFile )
{
	return SG_ATL.GenPKCS7SignedEnvelopedMsgFile( InFile, MyCert, RcvCert, OutFile );//[id(30)]
}

function VrfPKCS7Msg( InData )
{
	return SG_ATL.VrfPKCS7Msg( InData );//[id(31)]
}

function VrfPKCS7MsgFile( InFile, OutFile )
{
	return SG_ATL.VrfPKCS7MsgFile( InFile, OutFile );//[id(32)]
}

function GetPKCS7SignInfo( InData )
{
	return SG_ATL.GetPKCS7SignInfo( InData );//[id(33)]
}

function GetPKCS7SignInfoFile( InFile )
{
	return SG_ATL.GetPKCS7SignInfoFile( InFile );//[id(34)]
}

function GetPKCS7SignCert( index )
{
	return SG_ATL.GetPKCS7SignCert( index );//[id(35)]
}

function GetPKCS7SignTime( index )
{
	return SG_ATL.GetPKCS7SignTime( index );//[id(36)]
}

function ClearPKCS7SignInfo()
{
	SG_ATL.ClearPKCS7SignInfo();//[id(37)]
	return;
}

function GetPKCS7MessageType( InData )
{
	return SG_ATL.GetPKCS7MessageType( InData );//[id(38)]
}

function GetPKCS7MessageTypeFile( InFile )
{
	return SG_ATL.GetPKCS7MessageTypeFile( InFile );//[id(39)]
}

function GenSignInit()
{
	return SG_ATL.GenSignInit();//[id(40)]
}

function GenSignUpdate( InData )
{
	return SG_ATL.GenSignUpdate( InData );//[id(41)]
}

function GenSignUpdateFile( InFile )
{
	return SG_ATL.GenSignUpdateFile( InFile );//[id(42)]
}

function GenSignFinal()
{
	return SG_ATL.GenSignFinal();//[id(43)]
}

function VrfSignInit()
{
	return SG_ATL.VrfSignInit();//[id(44)]
}

function VrfSignUpdate( InData )
{
	return SG_ATL.VrfSignUpdate( InData );//[id(45)]
}

function VrfSignUpdateFile( InFile )
{
	return SG_ATL.VrfSignUpdateFile( InFile );//[id(46)]
}

function VrfSignFinal( Sign, Cert )
{
	return SG_ATL.VrfSignFinal( Sign, Cert );//[id(47)]
}

function CheckSymmetricKey()
{
	return SG_ATL.CheckSymmetricKey();//[id(78)]
}

function ClearSymmetricKey()
{
	SG_ATL.ClearSymmetricKey();//[id(48)]
	return;
}

function GetSymmetricKey( UserID )
{
	return SG_ATL.GetSymmetricKey( UserID );//[id(82)]
}

function SetSymmetricKey( UserID )
{
	return SG_ATL.SetSymmetricKey( UserID );//[id(83)]
}

function GenSymmetricKey()
{
	return SG_ATL.GenSymmetricKey();//[id(49)]
}

function GenCipherSymKey( Cert )
{
	return SG_ATL.GenCipherSymKey( Cert );//[id(50)]
}

function EncryptSymKey( Cert )
{
	return SG_ATL.EncryptSymKey( Cert );//[id(51)]
}

function DecryptSymKey( CipherSymKey )
{
	return SG_ATL.DecryptSymKey( CipherSymKey );//[id(52)]
}

function EncryptData( InData )
{
	return SG_ATL.EncryptData( InData );//[id(53)]
}

function EncryptFile( InFile, OutFile )
{
	return SG_ATL.EncryptFile( InFile, OutFile );//[id(54)]
}

function DecryptData( InData )
{
	return SG_ATL.DecryptData( InData );//[id(55)]
}

function DecryptFile( InFile, OutFile )
{
	return SG_ATL.DecryptFile( InFile, OutFile );//[id(56)]
}

function Base64Encode( InData )
{
	return SG_ATL.Base64Encode( InData );//[id(57)]
}

function Base64EncodeFile( InFile, OutFile )
{
	return SG_ATL.Base64EncodeFile( InFile, OutFile );//[id(58)]
}

function Base64Decode( InData )
{
	return SG_ATL.Base64Decode( InData );//[id(59)]
}

function Base64DecodeFile( InFile, OutFile )
{
	return SG_ATL.Base64DecodeFile( InFile, OutFile );//[id(60)]
}

function GenHashValue( DigestAlg, InData )
{
	return SG_ATL.GenHashValue( DigestAlg, InData );//[id(76)]
}

function GenHashValueFile( DigestAlg, InFile )
{
	return SG_ATL.GenHashValueFile( DigestAlg, InFile );//[id(81)]
}

function GetLastErrMsg()
{
	return SG_ATL.GetLastErrMsg();//[id(61)]
}

function SetCertDialogImage( strImageUrl )
{
	SG_ATL.SetCertDlgImage( strImageUrl );//[id(84)]
	return;
}

function SymmetricEncryptData( EncKey, Data )
{
	return SG_ATL.SymmetricEncryptData( EncKey, Data );//[id(88)]
}

function SymmetricDecryptData( DecKey, Data )
{
	return SG_ATL.SymmetricDecryptData( DecKey, Data );//[id(89)]	
}

function SymmetricKey( seedKey)
{
	return SG_ATL.SymmetricKey( seedKey );//[id(90)]	
}

function FileRead(inFile, TypeFlag)
{
	return SG_ATL.FileUtil(0, inFile, "", TypeFlag );//[id(95)]
}

function FileCopy(inFile, outFile)
{
	return SG_ATL.FileUtil(2, inFile, outFile, 0);//[id(95)]
}

function FileRename(inFile, outFile)
{
	return SG_ATL.FileUtil(4, inFile, outFile, 0 );//[id(95)]
}

function FileChange(inFile, outFile)
{
	return SG_ATL.FileUtil(5, inFile, outFile, 0 );//[id(95)]
}

function MakeDir(inFile)
{
	return SG_ATL.FileUtil(6, inFile, "", 0 );//[id(95)]
}

function FileUtil(Flag, inFile, outFile, TypeFlag )
{
	return SG_ATL.FileUtil(Flag, inFile, outFile, TypeFlag );//[id(95)]
}

function UseSecureKeyInput( code )
{
	SG_ATL.UseSecureKeyInput( code );//[id(103)]
	return;
}

function UseMobileKeyInput( code )
{
	SG_ATL.UseMobileKeyInput( code );//[id(134)]
	return;
}

function SetCertDlgTitle( DlgTitle )
{
	return SG_ATL.SetCertDlgTitle( DlgTitle );//[id(135)]
}

function SetKMIParam( code, param1, param2 )
{
	SG_ATL.SetKMIParam( code, param1, param2 );//[id(104)]
	return;
}

function SetKMIParamEX( code, param1, param2, param3, param4 )
{
	SG_ATL.SetKMIParamEX( code, param1, param2, param3, param4 );//[id(126)]
	return;
}

function GenerateDigitalSignatureSG( strInData )
{
	return SG_ATL.GenerateDigitalSignatureSG( strHashAlg, strInData );//[id(106)]
}

function VerifyDigitalSignatureSG( strInData, strSignData, signCert )
{
	return SG_ATL.VerifyDigitalSignatureSG( strHashAlg, strInData, strSignData, signCert );//[id(107)]
}

function GenerateDigitalSignatureFileSG( InFile )
{
	return SG_ATL.GenerateDigitalSignatureFileSG( strHashAlg, InFile );//[id(108)]
}

function VerifyDigitalSignatureFileSG( InFile, strSignData, signCert )
{
	return SG_ATL.VerifyDigitalSignatureFileSG( strHashAlg, InFile, strSignData, signCert );//[id(109)]
}

function GenSymmetricKeySG( strKeyID )
{
	return SG_ATL.GenSymmetricKeySG( strKeyID, strEncryptAlg, szEncryptKeyLen );//[id(110)]
}

function GetEncryptSymmetricKeySG( strKeyID, kmCert )
{
	return SG_ATL.GetEncryptSymmetricKeySG( strKeyID, kmCert );//[id(111)]
}

function SetDecryptSymmetricKeySG( strKeyID, strCipherSymKey )
{
	return SG_ATL.SetDecryptSymmetricKeySG( strKeyID, strCipherSymKey );//[id(112)]
}

function GetB64SymmetricKeySG( strKeyID )
{
	return SG_ATL.GetB64SymmetricKeySG( strKeyID );//[id(113)]
}

function SetB64SymmetricKeySG( strKeyID, strB64SymKey )
{
	return SG_ATL.SetB64SymmetricKeySG( strKeyID, strB64SymKey );//[id(114)]
}

function SetB64SymmetricKeyExSG( strKeyID, strB64SymKey, strB64IV )
{
	return SG_ATL.SetB64SymmetricKeyExSG( strKeyID, strEncryptAlg, strB64SymKey, strB64IV );//[id(115)]
}

function ClearSymmetricKeySG( strKeyID )
{
	return SG_ATL.ClearSymmetricKeySG( strKeyID );//[id(116)]
}

function EncryptDataSG( strKeyID, strInData )
{
	return SG_ATL.EncryptDataSG( strKeyID, strInData, 1 );//[id(117)]
}

function DecryptDataSG( strKeyID, strInData )
{
	return SG_ATL.DecryptDataSG( strKeyID, strInData, 1 );//[id(118)]
}

function EncryptFileSG( strKeyID, InFile, OutFile )
{
	return SG_ATL.EncryptFileSG( strKeyID, InFile, OutFile, 0 );//[id(119)]
}

function DecryptFileSG( strKeyID, InFile, OutFile )
{
	return SG_ATL.DecryptFileSG( strKeyID, InFile, OutFile, 0 );//[id(120)]
}

function EncryptHugeFileSG( strKeyID, InFile, OutFile )
{
	return SG_ATL.EncryptHugeFileSG( strKeyID, InFile, OutFile, 0 );//[id(121)]
}

function DecryptHugeFileSG( strKeyID, InFile, OutFile )
{
	return SG_ATL.DecryptHugeFileSG( strKeyID, InFile, OutFile, 0 );//[id(122)]
}

function GeneratePKCS7MsgSG_Old( msgType, strInData, MyCert, RcvCert )
{
	return SG_ATL.GeneratePKCS7MsgSG( msgType, strHashAlg, strEncryptAlg, strInData, MyCert, RcvCert );//[id(123)]
}

function GeneratePKCS7MsgFileSG_Old( msgType, InFile, MyCert, RcvCert, OutFile )
{
	return SG_ATL.GeneratePKCS7MsgFileSG( msgType, strHashAlg, strEncryptAlg, InFile, MyCert, RcvCert, OutFile );//[id(124)]
}

function GetUserSignCertEX( encode )
{
	return SG_ATL.GetUserSignCertEX( encode );
}

function GetUserKMCertEX( encode )
{
	return SG_ATL.GetUserKMCertEX( encode );
}

function GenSignEnvInit(certString)
{
	return SG_ATL.GenSignEnvelopeInit(certString);//[id(63)]
}
function GenSignEnvUpdate(inData)
{
	return SG_ATL.GenSignEnvelopeUpdate(inData);//[id(64)]
}

function GenSignEnvUpdateFile(inFile, outFile)
{
	return SG_ATL.GenSignEnvelopeUpdateFile(inFile, outFile);//[id(65)]
}

function GenSignEnvFinal()
{
	return SG_ATL.GenSignEnvelopeFinal();//[id(66)]
}

function VrfSignEnvInit(cipherKey)
{
	return SG_ATL.VrfSignEnvelopeInit(cipherKey);//[id(67)]
}

function VrfSignEnvUpdate(inData)
{
	return SG_ATL.VrfSignEnvelopeUpdate(inData);//[id(68)]
}

function VrfSignEnvUpdateFile(inFile, outFile)
{
	return SG_ATL.VrfSignEnvelopeUpdateFile(inFile, outFile);//[id(69)]
}

function VrfSignEnvFinal(signValue, certString)
{
	return SG_ATL.VrfSignEnvelopeFinal(signValue, certString);//[id(70)]
}

function SetAlertMsgBoxFlag( flag )
{
	SG_ATL.SetAlertMsgBoxFlag( flag );//[id(97)]
	return;
}

function SetSiteName( SiteName )
{
	return SG_ATL.SetSiteName( SiteName );//[id(128)]
}

function SetSiteIniPolicy( SiteName, Policy )
{    
    strAllowedPolicyOID = Policy
    return SG_ATL.SetSiteIniPolicy( SiteName, Policy );//[id(129)]
}

function SetDefaultDlgParam( ModeFlag, MediaFlag )
{
	return SG_ATL.SetDefaultDlgParam( ModeFlag, MediaFlag );//[id(130)]
}

function SetDefaultDlgPassword(passwd)
{
	return SG_ATL.SetDefaultDlgPassword(passwd);//[id(139)]
}

function SetPrivateCAPathEX( Path1, Path2 )
{
	SG_ATL.SetPrivateCAPathEX( Path1, Path2 );//[id(131)]
	return;
}

function GetMacAddress(keyID)
{
	return SG_ATL.GetMACInfoSG(keyID);//[id(137)]
}

function SetBioHSMInfo(bioInfo)
{
	return SG_ATL.SetBioHSMInfo(bioInfo);//[id(140)]
}

function GetMediaType(userID)
{
	return SG_ATL.GetMediaType(userID);//[id(141)]
}

//ver 3.1.10.2
function GetDevManufature(userID)
{
	return SG_ATL.GetDevManufature(userID);//[id(142)]
}

function GetDevCSN(userID)
{
	return SG_ATL.GetDevCSN(userID);//[id(143)]
}

function GetDevAuth(userID)
{
	return SG_ATL.GetDevAuth(userID);//[id(144)]
}

function SetDevAuthParam(keyID, randValue)
{
	return SG_ATL.SetDevAuthParam(keyID, randValue);//[id(145)]
}

function GetDevPID(userID)
{
	return SG_ATL.GetDevPID(userID);//[id(146)]
}

function GetDevCID(userID)
{
	return SG_ATL.GetDevCID(userID);//[id(147)]
}

function SetDefaultDlgDN(dn)
{
	return SG_ATL.SetDefaultDlgDN(dn);//[id(148)]
}

function IsLoadedCert(idString)
{
	return SG_ATL.IsLoadedCert(idString)//[id(149)]
}

function GenSignEnvelopeSelfKey(idString)
{
	return SG_ATL.GenSignEnvelopeSelfKey(idString)//[id(150)]
}

function GetStorageSerial()
{
	return SG_ATL.GetStorageSerial();//[id(151)]
}

function GetIPInfo() 
{
	return SG_ATL.GetIPInfo();//[id(152)]
}

function GetUserCertKey_Old(type, certString)
{
	return SG_ATL.GetUserCertKey(type, certString);//[id(153)]
}

function GetIPInfo2(keyID, format) 
{
	return SG_ATL.GetIPInfoSG2(keyID, format);//[id(154)]
}

function GetMacAddress2(keyID, format)
{
	return SG_ATL.GetMACInfoSG2(keyID, format);//[id(155)]
}

function GetStorageSerial2(keyID, format)
{
	return SG_ATL.GetStorageSerialSG2(keyID, format);//[id(156)]
}

//ver 3.1.10.8
function GenDevAuth(userID, keyID, randValue)
{
	return SG_ATL.GenDevAuth(userID, keyID, randValue);//[id(157)]
}
function GenSignInitEx(AlgName)
{
	return SG_ATL.GenSignInitEx(AlgName);//[id(158)]
}
function VrfSignInitEx(AlgName)
{
	return SG_ATL.VrfSignInitEx(AlgName);//[id(159)]
}
function GenSignEnvInitEx(certString, SignAlgName)
{
	return SG_ATL.GenSignEnvelopeInitEx(certString, SignAlgName);//[id(160)]
}
function VrfSignEnvInitEx(cipherKey, SignAlgName)
{
	return SG_ATL.VrfSignEnvelopeInitEx(cipherKey, SignAlgName);//[id(161)]
}
function SymmetricKeyEx(seedKey, HashAlgo)
{
	return SG_ATL.SymmetricKeyEx(seedKey, HashAlgo);//[id(162)]
}

//ver 4.0.1.1
function GenPKCS7SignedMsg( InData )
{
	return SG_ATL.GenPKCS7SignedMsgEx( InData );//[id(163)]
}

function GenPKCS7SignedMsgFile( InFile, OutFile )
{
	return SG_ATL.GenPKCS7SignedMsgFileEx( InFile, OutFile );//[id(164)]
}

function GenPKCS7EnvelopedMsg( InData, MyCert, RcvCert )
{
	return SG_ATL.GenPKCS7EnvelopedMsgEx( InData, MyCert, RcvCert );//[id(165)]
}

function GenPKCS7EnvelopedMsgFile( InFile, MyCert, RcvCert, OutFile )
{
	return SG_ATL.GenPKCS7EnvelopedMsgFileEx( InFile, MyCert, RcvCert, OutFile );//[id(166)]
}

function GenPKCS7SignedEnvelopedMsg( InData, MyCert, RcvCert )
{
	return SG_ATL.GenPKCS7SignedEnvelopedMsgEx( InData, MyCert, RcvCert );//[id(167)]
}

function GenPKCS7SignedEnvelopedMsgFile( InFile, MyCert, RcvCert, OutFile )
{
	return SG_ATL.GenPKCS7SignedEnvelopedMsgFileE( InFile, MyCert, RcvCert, OutFile );//[id(168)]
}

function GetUserCertKey(type, certString)
{
	return SG_ATL.GetUserCertKeyEx(type, certString);//[id(169)]
}

function GeneratePKCS7MsgSG( msgType, strInData, MyCert, RcvCert )
{
	return SG_ATL.GeneratePKCS7MsgSGEx( msgType, strHashAlg, strEncryptAlg, strInData, MyCert, RcvCert );//[id(170)]
}

function GeneratePKCS7MsgFileSG( msgType, InFile, MyCert, RcvCert, OutFile )
{
	return SG_ATL.GeneratePKCS7MsgFileSGEx( msgType, strHashAlg, strEncryptAlg, InFile, MyCert, RcvCert, OutFile );//[id(171)]
}

function GetBioErrCodeInfo()
{
	return SG_ATL.GetBioErrCodeInfo();//[id(172)]
}

function SetBioErrCodeInfo()
{
	return SG_ATL.SetBioErrCodeInfo();//[id(173)]
}

function SetDynamicMessage(encode, msg)
{
	return SG_ATL.SetDynamicMessage(encode, msg);//[id(174)]
}

function MobileKeySetSettingInt(eSettingType, nSettingValue)
{
	return SG_ATL.MobileKeySetSettingInt(eSettingType, nSettingValue);//[id(175)]
}

function MobileKeySetSettingString(SettingValue)
{
	return SG_ATL.MobileKeySetSettingString(SettingValue);//[id(176)]
}

function SetSettingInt(eSettingType, nSettingValue)
{
    return SG_ATL.SetSettingInt(eSettingType, nSettingValue);//[id(177)]
}

function GeneratePKCS7MsgFromFileSG( msgType, InFile, MyCert, RcvCert)
{
	return SG_ATL.GeneratePKCS7MsgFromFileSGEx( msgType, strHashAlg, strEncryptAlg, InFile, MyCert, RcvCert);//[id(178)]
}

function AddPKCS7SignatureFromFile( InFile )
{
	return SG_ATL.AddPKCS7SignatureFromFile( InFile);//[id(179)]
}

function GetEncryptSymmetricKeySGForCTL(KeyID, KmCert )
{
	return SG_ATL.GetEncryptSymmetricKeySGForCTL(KeyID, KmCert );//[id(180)]
}

function GenPKCS7DetachedMsg( InData)
{
	return SG_ATL.GenPKCS7DetachedMsgEx(InData);//[id(181)]
}

function VrfPKCS7DetachedMsg( InData, OriginData )
{
	return SG_ATL.VrfPKCS7DetachedMsg(InData, OriginData );//[id(182)]
}

function GenPKCS7DetachedMsgFileEx( InFile, OutFile )
{
	return SG_ATL.GenPKCS7DetachedMsgFileEx(InFile, OutFile );//[id(183)]
}

function VrfPKCS7DetachedMsgFile( InFile, OriginFile )
{

	return SG_ATL.VrfPKCS7DetachedMsgFile( InFile, OriginFile );//[id(184)]
}

function DefaultLocaleSetSettingInt(nSettingValue)//[id(185)]
{
	return SG_ATL.DefaultLocaleSetSettingInt(nSettingValue)
}

function EncryptHugeFileSGNew( strKeyID, InFile, OutFile, ToBase64 )
{
	return SG_ATL.EncryptHugeFileSGNew( strKeyID, InFile, OutFile, ToBase64 );//[id(188)]
}

function DecryptHugeFileSGNew( strKeyID, InFile, OutFile, IsBase64 )
{
	return SG_ATL.DecryptHugeFileSGNew( strKeyID, InFile, OutFile, IsBase64 );//[id(189)]
}

function SetPasswordMinimumSIze( nPasswordSize, strErrorMsg)
{
	return SG_ATL.SetPasswordMinimumSIZE(nPasswordSize, strErrorMsg );//[id(190)]
}

function DoNotUseDefaultFocus(/*boolean*/ disableFocus)
{
	return SG_ATL.DoNotUseDefaultFocus(disableFocus);//[id(190)]
}

function EnableVerifyMPKI(nSettingValue)
{
	return SG_ATL.EnableVerifyMPKI(nSettingValue);//[id(191)]
}

function GenPersonInfoReqest(AgreementString, hasRealName, hasGender, hasNationalInfo, hasBirthDate) 
{
    return SG_ATL.GenPersonInfoReqest(AgreementString, hasRealName, hasGender, hasNationalInfo, hasBirthDate); //[id(192)]
}

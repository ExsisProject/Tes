
/**
* 
* String에 대한 해쉬값 반환
* @param {String}name jar 파일명
* @param {String}version jar 파일 버전
* 
*/
function Jar(name, version)
{
	this.name = name;
	this.version = version;
}

var installFunction = 
{
	getList : function(array)
	{
		var list = { jarlist: '',verlist: ''};
		for(var index in array)
		{
			list.jarlist = list.jarlist + array[index].name + ',';
			list.verlist = list.verlist + array[index].version + ',';
		}
		list.jarlist = list.jarlist.substr(0, list.jarlist.length -1);
		list.verlist = list.verlist.substr(0, list.verlist.length -1);
		return list;
	},
	
	setKeyProtect : function (keyProtect)
	{
		switch(keyProtect)
		{
			case 'INCA':
				libs.push(new Jar('inca.jar', 			'2.0.0.0'));
				libs.push(new Jar('inca_keypad.jar', 	'2.0.0.0'));
				break;
			case 'INCA_KEYPAD':
				libs.push(new Jar('inca.jar', 			'2.0.0.0'));
				libs.push(new Jar('inca_keypad.jar', 	'2.0.0.0'));
				break;
			case 'AHN':
				libs.push(new Jar('aos.jar', 				'2.0.0.0'));
				libs.push(new Jar('jna.jar', 				'2.0.0.0'));
				libs.push(new Jar('jna-3.2.1.jar', 	'2.0.0.0'));
				break;
			default:
				break;
		}
		/*
		if(keyProtect == 'INCA' || keyProtect == 'INCA_KEYPAD')
		{
			//infovine 요청으로 둘 다 내림
			libs.push(new Jar('inca.jar', 			'2.0.0.0'));
			libs.push(new Jar('inca_keypad.jar', 	'2.0.0.0'));
		}
		else if(keyProtect == 'AHN')
		{
			libs.push(new Jar('aos.jar', 				'2.0.0.0'));
			libs.push(new Jar('jna.jar', 				'2.0.0.0'));
			libs.push(new Jar('jna-3.2.1.jar', 	'2.0.0.0'));
		}
		*/
		/*
		else if(keyProtect == 'INCA_KEYPAD')
			libs.push(new Jar('inca_keypad.jar', '2.0.0.0'));
		*/
		return keyProtect;
	}
};

/**
* html meta 태그에 정의된 charset 반환
* 
*/
function getDocumentCharset()
{
	return document.characterSet ? document.characterSet : document.charset;
}

var libs = 
[
	new Jar('signgateCrypto.jar', 			'2.0.0.8'),
	new Jar('kica_provider-1.0.jar', 		'2.0.0.8'),
	new Jar('libgpkiapi_jni.jar', 			'2.0.0.8'),
	new Jar('launcher.jar', 					'2.0.0.8'),
	new Jar('ewscommon.jar', 					'2.0.0.8'),
	new Jar('sgapplet.jar', 					'2.0.0.8'),
	new Jar('images.jar', 						'2.0.0.8'),
	//new Jar('ubikey-1.0.2.4.jar', 			'1.0.2.4'),
];


var dlls = 
[
	"BHSM_JNI2.dll-2.0.0.1",
	"KICAUAC.dll-1.0.0.3",
	"KicaUACJni.dll-1.0.0.2",
	"gpkiapi2.dll-1.5.1.0",
	"gpkiapi.dll-1.2.0.0",
	"nsldap32v11.dll-4224.0.0.8803"
];

var object_id = 'SG_OpenWebKit';
var sessionId = 'localhost';

/**
* 
* <pre>
* loadKICAApplet(운영모드, 키보드보안모듈이름);
* 키보드 보안 INCA, INCA_KEYPAD, AHN, KINGS
* ex) loadKICAApplet('KRS', 'INCA');
* </pre>
* 
* @param {String}mode 로딩모드
* @param {String}keyProtect 연동할 보안 모듈
* 
*/
//loadKICAApplet('KRS', 'INCA_KEYPAD');
loadKICAApplet('KR', '');

function loadKICAApplet(mode, keyProtect)
{
	var attributes = {};
	var parameters = {};
	
	//setting attribute
	attributes.codebase = '/resources/js/vendors/signgate/applet/cab/';
	attributes.id = object_id;
	if(navigator.userAgent.indexOf("Linux") != -1)
	{ attributes.width = 1; attributes.height = 1; }
	else { attributes.width = 0; attributes.height = 0; }
	
	//setting parameters
	parameters.charset = getDocumentCharset();
	parameters.callBack = ''; //콜백 메소드
	parameters.nativeLib = dlls.join(','); //dll 라이브러리
	parameters.keyProtect = installFunction.setKeyProtect(keyProtect); 
	parameters.java_arguments = '-Xmx512m -Djnlp.packEnabled=true';
	//parameters.separate_jvm = 'true';
	parameters.MAYSCRIPT = 'true';
	parameters.codebase_lookup = 'false';
	parameters.scriptable = 'true';
	
	//for infovine 요청에 의해서
	parameters.infovineParam = 'CHANNELNAME:PTBANK_BANKTOWN;CERT_COMPANY:SIGNGATE;KEYCRYP_COMPANY:INCA;VIRTUALKEY_COMPANY:INCA;BROWSER_KEYTYPE:IEONLY_KEYCRYP_AND_NONIE_VIRTUALKEY';
	
	switch(mode)
	{
		case 'KR':
			attributes.code = 'com.sg.openews.client.launcher.LauncherAppletKR';
			break;
		case 'OVERSEA':
			attributes.code = 'com.sg.openews.client.launcher.LauncherAppletEC';
			attributes.archive = 'kica_provider-1.0.jar,launcher.jar,signgateCrypto.jar,libgpkiapi_jni.jar';
			parameters.sgAppletFile = 'sgapplet.jar;ewscommon.jar;images.jar';
			parameters.sgAppletFileVersion = '1.0.50;1.0.51;1.0.43';
			parameters.ProductHome = '/resources/js/vendors/signgate/applet/cab/';
			break;
		case 'PPS':
			attributes.code = 'com.sg.openews.client.jodal.launcher.JodalLauncherApplet';
			libs.push(new Jar('jodalApi.jar', '2.0.0.0'));
			libs.push(new Jar('jodalLauncher.jar', '2.0.0.0'));
			libs.push(new Jar('sg-xml-security-1.1.1.jar', '2.0.0.0'));
			break;
		case 'KRS':
			attributes.code = 'com.sg.openews.client.launcher.LauncherAppletKRS';
			break;
		case 'KRN':
			attributes.code = 'com.sg.openews.client.launcher.LauncherAppletKRN';
			break;
		default:
			break;
	}
	
	var list = installFunction.getList(libs);
	parameters.cache_archive = list.jarlist;
	parameters.cache_version = list.verlist;
	//run applet
	deployJava.runApplet(attributes, parameters, '1.6');
}
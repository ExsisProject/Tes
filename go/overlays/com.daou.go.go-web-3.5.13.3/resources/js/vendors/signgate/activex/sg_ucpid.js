//*************************************************************************************
//	파일명		: sg_ucpid.js
//	최종 수정일	: 2013년 3월 25일
//	내용		: 신원확인을 위한 UCPID 함수
//*************************************************************************************
function generatePersonInfoReqest(AgreementString, hasRealName, hasGender, hasNationalInfo, hasBirthDate) 
{
    if (AgreementString == null || AgreementString == "" || hasRealName == null || hasRealName == "" || hasGender == null || hasGender == "" || hasNationalInfo == null || hasNationalInfo == "" || hasBirthDate == null || hasBirthDate == "") 
    {
        setErrorCode("NO_DATA_VALUE");
        setErrorMessage("");
        setErrorFunctionName("generateMessage()");
        return "";
    }
    var strGeneratedMessage = GenPersonInfoReqest(AgreementString, hasRealName, hasGender, hasNationalInfo, hasBirthDate);
    if (strGeneratedMessage == null || strGeneratedMessage == "") 
    {        
        setErrorMessage(GetLastErrMsg());
        setErrorFunctionName("generateMessage()");
        return "";
    }

    return strGeneratedMessage;
}
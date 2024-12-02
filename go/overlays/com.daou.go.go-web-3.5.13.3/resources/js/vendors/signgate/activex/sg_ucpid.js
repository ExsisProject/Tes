//*************************************************************************************
//	���ϸ�		: sg_ucpid.js
//	���� ������	: 2013�� 3�� 25��
//	����		: �ſ�Ȯ���� ���� UCPID �Լ�
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
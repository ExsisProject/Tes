function SGJ_getVersion(){var e=document.getElementById(object_id);return e.getVersion()}function SGJ_getVersionDlg(){var e=document.getElementById(object_id);e.getVersionDlg();return}function SGJ_getLoginInfo(e){var t=document.getElementById(object_id);if(isNull(e))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_getLoginInfo()"),"";var n=t.getLoginInfo(e);return isNull(n)?(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_getLoginInfo()"),""):n}function SGJ_getLoginInfoUseCert(e,t){var n=document.getElementById(object_id);if(isNull(e)||isNull(t))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_getLoginInfoUseCert()"),"";self.focus();var r=n.getLoginInfoUseCert(e,t);return isNull(r)?(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_getLoginInfoUseCert()"),""):r}function SGJ_getLoginInfoUsePasswd(e,t,n){var r=document.getElementById(object_id);if(isNull(e)||isNull(t)||isNull(n))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_getLoginInfoUsePasswd()"),"";var i=r.getLoginInfoUsePasswd(e,t,n);return isNull(i)?(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_getLoginInfoUsePasswd()"),""):i}function SGJ_getPKCS7Data(e,t,n,r){var i=document.getElementById(object_id);if(isNull(e)||isNull(t)||isNull(n)||isNull(r))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_getPKCS7Data()"),"";var s=i.getPKCS7Data(e,t,n,r);return isNull(s)?(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_getPKCS7Data()"),""):s}function SGJ_signEnvInit(e,t){var n=document.getElementById(object_id);if(isNull(e)||isNull(t))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_signEnvInit()"),"";var r=n.signEnvInit(e,t);return isNull(r)?(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_signEnvInit()"),""):r}function SGJ_signEnvUpdate(e,t){var n=document.getElementById(object_id);if(isNull(e)||isNull(t))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_signEnvUpdate()"),"";var r=n.signEnvUpdate(e,t);return isNull(r)?(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_signEnvUpdate()"),""):r}function SGJ_signEnvFinal(e){var t=document.getElementById(object_id);if(isNull(e))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_signEnvFinal()"),"";var n=t.signEnvFinal(e);return isNull(n)?(setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_decryptRSA()"),setErrorFunction("SGJ_signEnvFinal()"),""):n}function SGJ_env_encrypt(e,t){var n=document.getElementById(object_id);if(isNull(e)||isNull(t))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_env_encrypt()"),!1;var r=n.env_encrypt(e,t);return r?r:(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_env_encrypt()"),r)}function SGJ_env_encrypt2(e,t,n){var r=document.getElementById(object_id);if(isNull(e)||isNull(t)||isNull(n))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_env_encrypt2()"),!1;var i=r.env_encrypt2(e,t,n);return i?i:(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_env_encrypt2()"),i)}function SGJ_env_decrypt(e,t){var n=document.getElementById(object_id);if(isNull(e)||isNull(t))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_env_decrypt()"),!1;var r=n.env_decrypt(e,t);return r?r:(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_env_decrypt()"),!1)}function SGJ_env_decrypt2(e,t,n){var r=document.getElementById(object_id);if(isNull(e)||isNull(t)||isNull(n))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_env_decrypt2()"),!1;var i=r.env_decrypt2(e,t,n);return i?i:(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_env_decrypt2()"),!1)}function SGJ_setUserConfiguration(e,t,n,r,i,s,o,u,a){var f=document.getElementById(object_id);if(isNull(e)||isNull(t)||isNull(n)||isNull(r)||isNull(i)||isNull(s)||isNull(o)||isNull(u)||isNull(a))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_setUserConfiguration()"),!1;var l=f.setUserConfiguration(e,t,n,r,i,s,o,u,a);return l?l:(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_setUserConfiguration()"),!1)}function SGJ_setKicaInfoFromVal(e){var t=document.getElementById(object_id);if(isNull(e))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_setKicaInfoFromVal()"),!1;var n=t.setKicaInfoFromVal(e);return n?n:(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_setKicaInfoFromVal()"),!1)}function SGJ_setEducationMode(){var e=document.getElementById(object_id),t=e.setEducationMode();return t?t:(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_setEducationMode()"),"")}function SGJ_issueEncCert(e,t,n,r,i,s,o,u,a,f,l){if(isNull(e)||isNull(t)||isNull(n)||isNull(r)||isNull(i)||isNull(s)||isNull(o)||isNull(a)||isNull(f)||isNull(l))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_issueEncCert()"),!1;var c=document.getElementById(object_id);self.focus();var h=c.issueEncCert(e,t,n,r,i,s,o,u,a,f,l);return isNull(h)?(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_issueEncCert()"),""):h}function SGJ_genBidChkInfo(e,t){var n=document.getElementById(object_id);if(isNull(e)||isNull(t))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_genBidChkInfo()"),"";self.focus();var r=n.genBidChkInfo(e,t);return isNull(r)?(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_genBidChkInfo()"),""):r}function SGJ_getEncKey(e,t,n){var r=document.getElementById(object_id);if(isNull(e)||isNull(t)||isNull(n))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_getEncKey()"),"";self.focus();var i=r.getEncKey(e,t,n);return isNull(i)?(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_getEncKey()"),""):i}function SGJ_getIdentifiAuthValue(e,t,n){var r=document.getElementById(object_id);if(isNull(e)||isNull(t)||isNull(n))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_getIdentifiAuthValue()"),"";var i=r.getIdentifiAuthValue(e,t,n);return isNull(i)?(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_getIdentifiAuthValue()"),""):i}function dec(e,t){var n=document.getElementById(object_id),r=n.initSession(e);if(!r){alert("initSession Error!!");return}return original_data=n.decryptData(e,t),original_data==""?(alert("Error Decrypt Encrypted Data !"),alert(GetLastErrMsg()),!1):original_data}function SGJ_genAlternativeOwnerData(e,t){var n=document.getElementById(object_id);if(isNull(e)||isNull(t))return setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_genAlternativeOwnerData()"),"";var r=n.genAlternativeOwnerData(e,t);return isNull(r)?(setErrorCode("INVALID_RETURN_VALUE"),setErrorMsg(SGJ_getErrorMsg()),setErrorFunction("SGJ_genAlternativeOwnerData()"),""):r}function SGJ_recoverAlternativeOwnerData(e,t,n){var r=document.getElementById(object_id);if(isNull(e)||isNull(t)||isNull(n)){setErrorCode("PARAMETER_NULL"),setErrorFunction("SGJ_genAlternativeOwnerData()");return}r.recoverAlternativeOwnerData(e,n,t)};
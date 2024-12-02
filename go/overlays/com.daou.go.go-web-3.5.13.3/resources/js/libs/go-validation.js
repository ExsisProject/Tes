(function($){
    
    var Validation = $.goValidation = {};
    
    $.extend(Validation,{
    	validateVersion : function(version) {
    		var versionRegex = new RegExp("^(\\d+)(\\.\\d+)?(\\.\\d+)?(\\.\\d+)?$");
    		return versionRegex.test(version);
    	},
    	validateMenuUrl : function(url) {
            var urlregex = new RegExp(
            "^([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|localhost|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
            return urlregex.test(url);
        },
        
        validateURL : function(url) {
            var urlregex = new RegExp(
            "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|localhost|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&%\$#\=~_\-]+))*$");
            return urlregex.test(url);
        },
		simpleValidateURL : function(url) {
			var urlregex = new RegExp(
				"^(http|https|ftp)\://([^ \"])+$"
			)
			return urlregex.test(url);
		},
        validateNumericAlpha : function(str){
        	var regExp = /^[A-Za-z0-9]*$/;  
        	if (regExp.test(str)) {
	       		 return true;
	       	} else {
	             return false;
	        }
        },
        isValidEmail : function(val){
        	if (val.indexOf("@") < 0){
        		return false;
        	}

        	if(val.length > 255){
        		return false;
        	}

        	var strMember = new Array();
        	strMember = val.split("@"); 

        	if (strMember.length > 2){
        		return false;
        	} 

        	return ( this.isValidEmailId(strMember[0]) && this.isValidDomain(strMember[1]) ); 
        },
        isInvalidEmail : function(email){
            return !this.isValidEmail(email);
        },
        isInvalidEmailId : function(email){
            return !this.isValidEmailId(email);
        },
        isValidEmailId : function(val) {
        	var regExp = /^([0-9a-zA-Z_\-~!#$*+.\/=\?\{\}\'\^\|\`])+$/;
        	if ($.trim(val) == "" || !regExp.test(val)) {
        		 return false;
        	} else {
                return true;
            }
        },
        isValidDomain : function(val) {
		  /*
		  * domain allow character set
		  * 0-9 a-z A-Z '-' '.'
		  */
        	var re1 = /^[0-9a-zA-Z-]+([\.0-9a-zA-Z-]*)$/;

			if(val.length > 128){
				return false;
			}

			if(!re1.test(val)){
				return false;
			}

			if (val.indexOf(".") < 0){
				return false;  
			}

			var domainItems = new Array();
			domainItems = val.split(".");

			for (i = 0 ; i < domainItems.length; i++ ) {
				var item = domainItems[i];
				if(item == "" || item == null || item.length < 1 || item.length > 64) {
					return false;
				}
			}

			if (val.charAt(0) == "." || val.charAt(0) == "-" || val.charAt(val.length-1) == "." || val.charAt(val.length-1) == "-") {
				return false;
			}

			if (val.indexOf(".-") > 0 || val.indexOf("-.") > 0) {
				return false;
			}
   
			return true;
        },
        
        isInvalidTel : function(val) {        	
        	var include = "0123456789-+";
        	for (var inx=0; inx<val.length; inx++) {
        		if(include.indexOf(val.charAt(inx)) < 0)
        			return false;
        	}
        	return true;
        },
        
        isCheckLength : function(minSize, maxSize, val) {
        	if(val.length < minSize) {
        		return false;
        	}
        	
        	if(val.length > maxSize) {
        		return false;
        	}
        	return true;
        },
        
        isValidChar : function (val) {
        	var exclude = ",#$<>;\\\`\'\"\|";
        	return this.charValidation(exclude, val);
        },
        
        isInvalidChar : function(val){
            return !this.isValidChar(val);
        },
        
        isValidCommunityDesc : function (val) {
        	return this.isValidSrc(val);
        },
        
        isValidSrc : function (val){
        	var exclude = "\\|";
        	return this.charValidation(exclude, val);
        },
        
        isInvalidSrc : function(val){
        	return !this.isValidSrc(val);
        },
        
        charValidation : function (exclude, val) {
        	for (var inx=0; inx<val.length; inx++) {
        		if(exclude.indexOf(val.charAt(inx)) > -1)
        			return false;
        	}
        	return true;
        },
        
        realLength : function(str){
        	var real_length = 0;
        	var len = str.length;
        	for (var i = 0; i < len; i++) {
        		ch = str.charCodeAt(i);
        		if (ch >= 0xFFFFFF) {
        			real_length += 4;
        		}
        		else if (ch >= 0xFFFF) {
        			real_length += 3;
        		}
        		else if (ch >= 0xFF) {
        			real_length += 2;
        		}
        		else {
        			real_length++;
        		}
        	}
        	return real_length;
        },
        
        charEllipsis : function(str,charCnt){
        	var strRealLen = this.realLength(str);
        	if(strRealLen > charCnt){
        		return str.substr(0,charCnt) + "...";
        	}
        	return str;
        },
        
        isNumber : function(input){
            var re = /^([0-9])+$/;
            return re.test(input);
        },
        
        isPhoneType : function(val){
        	var include = "0123456789-+().";
        	for (var inx=0; inx<val.length; inx++) {
        		if(include.indexOf(val.charAt(inx)) < 0)
        			return false;
        	}
        	return true;
        },
        
        attachValidate : function(attachItemEl, data, attachSizeLimit, attachNumberLimit, excludeExtention){
        	if(data.type == undefined){
        		throw new Error("NotFoundExtException");
        	}
        	
            if(!_.isUndefined(excludeExtention) && excludeExtention != ""){
                var test = $.inArray(data.type.toLowerCase(), excludeExtention.split(","));
                if(test >= 0){
                    throw new Error("ExtentionException");
                }
            }
            
            if(attachSizeLimit > -1){
                var size = data.size / 1024 / 1024;  //(MB)
                var maxAttachSize = attachSizeLimit;
                if(maxAttachSize < size){
                	throw new Error("AttachSizeException");
                }
            }
            
            if(attachNumberLimit > -1){
                var currentAttachCnt = $(attachItemEl).size();
                if(attachNumberLimit <= currentAttachCnt){     
                    throw new Error("AttachNumberException");
                }
            }
        },
        isInvalidLength : function(minSize, maxSize, val) {
            return !this.isCheckLength(minSize, maxSize, val);
        },
        isInValidEmailChar : function (val) {
        	var exclude = "%&\\";
        	return !this.charValidation(exclude, val);
        },
		containsInvalidFileNameCharacter : function(name) {
			var regex = /[\/\\:*?"<>|]/;
			return regex.test(name);
		}
    });
})(jQuery);
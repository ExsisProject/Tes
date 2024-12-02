(function(name, definition, window, document, undefined) {
    var 
        theModule = definition(), 
        hasDefine = typeof define === 'function' && define.amd, 
        hasExports = typeof module !== 'undefined' && module.exports;

    if ( hasDefine ){
        define(theModule);
    } else if ( hasExports ) {
        module.exports = theModule;
    } else { 
        var obj = null, 
            namespaces = name.split("."),
            scope = this;
        
        for (var i = 0, len = namespaces.length; i < len; i++) {
            var packageName = namespaces[i];
            
            if (obj && i == len - 1) {
                obj[packageName] = theModule;
            } else if (typeof scope[packageName] === "undefined") {
                scope[packageName] = {};
            }
            
            obj = scope[packageName];
        }
    }
})( 'GO.utils', function () {

// jQuery.noConflict 모드에서도 사용할 수 있도록 로컬 변수로 등록해준다.
var $ = window.jQuery, 
    utility = {};

utility.deepClone = function(obj) {
    return $.extend(true, {}, obj);
}
utility.escapeString = function(str) {
    if( !str ) return str;
    str = str.replace(/</gi, "&lt;");
    str = str.replace(/>/gi, "&gt;");
    
    return str;
};

utility.stripTags = function(str) {
    if( !str ) return str;
    return str.replace(/<([^>]+)>/gi, "");
};

utility.stripIllegalTags = function(str) {
    if( !str ) return str;
    str = str.replace(/[java|vb]*script\:/gi, "x-script:");
    str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    str = str.replace(/<marquee\b[^<]*(?:(?!<\/marquee>)<[^<]*)*<\/marquee>/gi, "");

    return str;
};

utility.normalizeQuery = function(str) {
    // strips leading whitespace and condenses all whitespace
    return (str || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
};

// http://stackoverflow.com/a/6969486
utility.escapeRegExChars = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
};

utility.nl2br = function(str) {
    var cloned = '' + str;
    return cloned.replace(/\n/gi, '<br />');
};
utility.isImage = function(fn) {
    var re = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
    return re.test(fn);
}

/**
파일 사이즈를 가독성있게 변경하는 함수

@method getHumanizedFileSize
@param {Number} 파일 사이즈
@return {String} 변환된 문자열
*/
utility.getHumanizedFileSize = function(bytesize) {
    var orgSize = parseInt(bytesize) || 0,
        UNIT = {
            'B': 1,
            'K': 1024,
            'M': 1048576,
            'G': 1.0737e+9,
            'T': 1.0995e+12
        }, baseByte = 0, postfix = 'B';


    if (orgSize > UNIT.T) {
        baseByte = UNIT.T;
        postfix = 'T' + postfix;
    } else if (orgSize > UNIT.G) {
        baseByte = UNIT.G;
        postfix = 'G' + postfix;
    } else if (orgSize > UNIT.M) {
        baseByte = UNIT.M;
        postfix = 'M' + postfix;
    } else if (orgSize > UNIT.K) {
        baseByte = UNIT.K;
        postfix = 'K' + postfix;
    } else {
        baseByte = UNIT.B;
        postfix = 'Byte';
    }

    return (orgSize / baseByte).toFixed(1) + postfix;
}

if(window.amplify) {
    utility.store = (function(amplify) {
        function getStorage(type/*,key, val, options*/) {
            var storeType = type || 'local', 
                args = Array.prototype.slice.apply(arguments), 
                rargs = args.slice(1), 
                func = ((storeType === 'session' && !!window.sessionStorage &&  (typeof amplify.store.sessionStorage == "function")) ? amplify.store.sessionStorage : amplify.store);
            
            return func.apply(amplify, rargs);
        }
        
        return {
            get: function(key) {
                return (getStorage('local', key) || getStorage('session', key));
            }, 
            
            set: function(key, val, options) {
                var opts = _.defaults(options || {}, { type: 'local' });
                return getStorage(opts.type, key, val, _.omit(opts, 'type'));
            }
        };
    })(amplify);
}

return utility;

}, window, document);

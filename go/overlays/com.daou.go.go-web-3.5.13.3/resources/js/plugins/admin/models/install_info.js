(function() {
define([
    "backbone"
],

function(Backbone) {
	
	var instance = null;
	var SystemInfo = Backbone.Model.extend({
		
		url: function() {
			return GO.contextRoot+"ad/api/installinfo";
		},
		
		
		getLocale : function() {
			var companyLocale = "";
			var installLocale = this.get("language");
			
			if(installLocale == 'ja'){ 
				companyLocale = 'jp'; 
			}else if(installLocale == 'zh_CN'){ 
				companyLocale = 'zhcn';
			}else if(installLocale == 'zh_TW'){ 
				companyLocale = 'zhtw'; 
			}else {
				companyLocale = installLocale;
			}
			
			return companyLocale;
		},
		
		isKoLocale : function() {
			return this.getLocale() == "ko";
		},
		
		isEnLocale : function(){
			return this.getLocale() == "en";
		},
		
		isJpLocale : function(){
			return this.getLocale() == "jp";
		},
		
		isZhcnLocale : function(){
			return this.getLocale() == "zhcn";
		},
		
		isZhtwLocale : function(){
			return this.getLocale() == "zhtw";
		},
		isViLocale : function () {
			return this.getLocale() == "vi";
		}
	}); 
	
	return {
		// 호환성을 위해 유지.
	    read : function(){
	        if(instance == null) instance = new SystemInfo;
            instance.fetch({ 
                async : false,
                contentType : 'application/json'
                });
            return instance;
	    },
	    
	    init : function() {
	    	return new SystemInfo();
	    }
	};
});
}).call(this);
(function() {
	
	define([
    	"jquery",
		"underscore", 
        "backbone", 
        "app", 
        "i18n!nls/commons",
        "jquery.go-popup",
	    "jquery.go-sdk"

    ],
    
    function(
		$, 
		_, 
		Backbone, 
		GO,
		commonLang
	) {
		
		var PreviewView = Backbone.View.extend({

			tagName: 'div',

			initialize: function(options) {
				this.options = options || {};
			    this.encrypt = this.options.encrypt;
			    this.isChat = Backbone.history.location.pathname.indexOf('chat')>=0;
            },

			render: function() {
				var url = this.generatePreviewAttachUrl();
				this.$el.append(this.makeLoadingHTML());

				$.go(url, '', {
                    qryType : 'GET',
                    contentType : 'application/json',
                    responseFn : $.proxy(this._onPreviewConvertRequestSuccess, this),
                    error : $.proxy(this._onPreviewConvertRequestError, this)
                });

				return this;
			},

			generatePreviewAttachUrl : function() {
				var url = '/preview/attach/';
                //Chat에서의 접근인 경우 encrypt 구성 방식이 다르기 때문에 API 분기처리 필요
				if(this.isChat) {
					url = '/chat' + url;
				}
				return GO.contextRoot + 'api' + url + this.encrypt;
			},
			
			renderTemp : function() {
				var url = GO.contextRoot + 'api/preview/attachTemp';
				this.$el.append(this.makeLoadingHTML());
				$.go(url, this.options, {
					qryType : 'GET',
					contentType : 'application/json',
					responseFn : $.proxy(this._onPreviewConvertRequestSuccess, this),
					error : $.proxy(this._onPreviewConvertRequestError, this)
				});

				return this;
			},

			makeLoadingHTML: function() {
				return [
					"<div id='popOverlay' class='overlay' style='display:'>",
						"<div class='processing'>",
						"</div>",
					"</div>"
				].join("");
			},

			_onPreviewConvertRequestSuccess: function(response) {
				window.location.href = response.data.str;
			},

			_onPreviewConvertRequestError: function(error){
				var message = this._mapErrorToReadableMessage(error);
				$.goAlert(message, "", function() {
					window.close();
				});
			},

			_mapErrorToReadableMessage: function(error) {
				if (error.responseText) {
					var errorMessageCode = JSON.parse(error.responseText).message;
					switch (errorMessageCode) {
						case 'invalid.file.extension':
							return commonLang['미리보기 시스템 미지원 또는 미지원 확장자'];
						case 'drm':
							return commonLang['미리보기 DRM 불가'];
						case 'encoded':
							return commonLang['미리보기 암호화 불가'];
						case 'unsupported':
							return commonLang['미리보기 미지원 파일'];
						case 'timeout':
							return commonLang['미리보기 요청시간 만료'];
					}
				}else if(error.statusText){
					switch (error.statusText) {
						case 'invalid.file.extension':
							return commonLang['미리보기 시스템 미지원 또는 미지원 확장자'];
						case 'drm':
							return commonLang['미리보기 DRM 불가'];
						case 'encoded':
							return commonLang['미리보기 암호화 불가'];
						case 'unsupported':
							return commonLang['미리보기 미지원 파일'];
						case 'timeout':
							return commonLang['미리보기 요청시간 만료'];
					}
				}

				return commonLang["500 오류페이지 내용"];
			}
		});

		return PreviewView;
	});
})();
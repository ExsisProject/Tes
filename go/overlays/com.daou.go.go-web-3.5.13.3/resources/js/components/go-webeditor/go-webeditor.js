/* dependecy: underscore, jquery */
(function (name, definition, $, undefined){
	
	var theModule = definition($);
	var hasDefine = typeof define === 'function' && define.amd; 

	function createNamespace(name, ctx) {
		var obj = null;
	    var namespaces = name.split(".");
	    var scope = ctx;
	    
	    for (var i = 0, len = namespaces.length; i < len; i++) {
	        var packageName = namespaces[i];
	        
	        if (obj && i == len - 1) {
	            obj[packageName] = theModule;
	        } else if (typeof scope[packageName] === "undefined") {
	            scope[packageName] = {};
	        }
	        
	        obj = scope[packageName];
	    }
	    
	    return obj;
	}
	
	createNamespace(name, this);
	
	if ( hasDefine ){
		define(theModule);
	}
    
})( 'GO.Editor', function ($) {
	var Constants, Editor, EditorTrait;
	
	Constants = {
		classname: 'go-editor',
		instanceId: 'go.editor.id', 
		instanceUUID: 'go.editor.uuid', 
		EditorType: {
			HTML: 'html', 
			ACTIVEX: 'activex'
		}
	};

	Editor = {
		// 멀티 에디터를 관리하기 위한 내부 맵
		__instanceMap__: {}, 
		// 에디터 타입을 체크하기 위한 맵
		__editorTypeMap__: {}
	};
	
	// 타입별 에디터 등록	
	Editor.registry = function(uname, props) {
		if(!uname) {
			console.warn('uname 정의되어 있지 않습니다.');
			return;
		}
		
		this[uname] = extend.call(EditorTrait, props || {});
		this.__editorTypeMap__[uname] = props && props.type ? props.type : Constants.EditorType.HTML;
	};
	
	Editor.isSupported = function(uname) {
		return this[uname] | this.hasOwnProperty(uname);
	};
	
	Editor.isActiveXType = function(uname) {
		if(!this.isSupported(uname)) {
			console.warn('지원하지 않는 타입입니다.');
			return false;
		}
		
		return this.__editorTypeMap__[uname] === Constants.EditorType.ACTIVEX;
	};
	
	Editor.isIE = function() {
		var ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
		return /msie|trident/i.test(ua);
	};
	
	// Factory
	Editor.create = function(uname, ctx, options) {
		var instance;
		var opts = options || {};
		
		if(!this.hasOwnProperty(uname)) {
			console.warn('지원되지 않는 에디터입니다.');
			return;
		}
		
		opts.name = uname;
		instance = new this[uname](ctx, opts);
		instance.render();
		
		return instance;
	};
	
	// 에디터 인스턴스 반환
	Editor.getInstance = function(id) {
		var ctx = this;		
		return ctx.__instanceMap__[id];
	};
	
	// 에디터 인스턴스 맵 반환
	Editor.getInstanceMap = function() {
		return this.__instanceMap__;
	};
	
	Editor.TYPE_HTML = Constants.EditorType.HTML;
	Editor.TYPE_ACTIVEX = Constants.EditorType.ACTIVEX;
	
	Editor.destroyAll = function() {
		_.each(_.keys(this.getInstanceMap()), function(instanceId) {
			this.getInstance(instanceId).destroy();
		}, this);
	};
	
	/**
	 * 템플릿 관리 클래스
	 */
	Editor.TemplateManager = (function() {
		/**
		 * @constructor
		 * @param options {object} 초기값(header, footer, backgroundImg)
		 */
		var Klass = function(options) {
			options = options || {};
			
			this.__header__ = '';
			this.__footer__ = '';
			this.__backgroundImg__ = '';
			this.__editorHeight__ = 0;
			this.__frameHeight__ = 0;
			
			if(options.header) this.setHeader(options.header);
			if(options.footer) this.setFooter(options.footer);
			if(options.backgroundImg) this.setBackgroundImg(options.backgroundImg);
		}
		
		Klass.prototype.setHeader = function(markup) {
			this.__header__ = markup;
		};
		
		Klass.prototype.getHeader = function() {
			return this.__header__;
		};
		
		Klass.prototype.setBackgroundImg = function(imgUrl) {
			this.__backgroundImg__ = imgUrl;
		};
		
		Klass.prototype.getBackgroundImg = function() {
			return this.__backgroundImg__;
		}; 
		
		Klass.prototype.setFooter = function(markup) {
			this.__footer__ = markup;
		};
		
		Klass.prototype.getFooter = function() {
			return this.__footer__;
		};
		
		Klass.prototype.setEditorHeight = function(newHeight) {
			this.__editorHeight__ = newHeight;
		};
		
		Klass.prototype.getEditorHeight = function() {
			return this.__editorHeight__;
		};
		
		Klass.prototype.setFrameHeight = function(newHeight) {
			this.__frameHeight__ = newHeight;
		};
		
		Klass.prototype.getFrameHeight = function() {
			return this.__frameHeight__;
		};
		
		return Klass;
	})();

	EditorTrait = (function(parent) {
		var defaultBeforeFilters = [];
		var defaultAfterFilters = [removeBOMFilter];
		
		/**
		 * 에디터 타입 최상위 클래스
		 * @param {mixed}	ctx		HTML selector 혹은 HTML DOM 객체
		 * @param {object}	options	옵션
		 * @constructor
		 */
		var Klass = function(ctx, options) {
			this.ctx = ctx;
			this.$el = $(this.ctx);
			this.options = {};
			
			this.$el.addClass(Constants.classname);
			
			if(this.$el.prop('id')) {
				this.idAttr = this.$el.prop('id');
			} else {
				this.idAttr = generateUUID();
				this.$el.prop('id', this.idAttr);
			}
			
			$.extend(true, this.options, _.result(this, 'defaults'), convertToCompatibleOptions(options || {}));
			
			if(this.options.name) {
				this.__name__ = this.options.name;
			}
			
			parent.__instanceMap__[this.idAttr] = this;
			
			this.beforeFilter = defaultBeforeFilters.concat(this.beforeFilter);
			this.afterFilter = defaultAfterFilters.concat(this.afterFilter);
			
			this.initialize.apply(this, arguments);
		};
		
		/**
		 * 에디터 타입
		 * 	- html: 웹기반 에디터
		 * 	- activex: 엑티브엑스 에디터
		 * @type: {string}
		 */
		Klass.prototype.type = Constants.EditorType.HTML;
		
		Klass.prototype.beforeFilter = [];
		Klass.prototype.afterFilter = [];
		
		/**
		 * 에디터 타입별 기본 옵션 설정
		 */
		Klass.prototype.defaults = {};
		
		/**
		 * initializer
		 * @param {mixed}	ctx		HTML selector 혹은 HTML DOM 객체
		 * @param {object}	options	옵션
		 */
		Klass.prototype.initialize = function(ctx, options) {};
		
		/**
		 * destructor
		 * 외부에서 직접 에디터 객체를 해제하려고 할 경우 구현
		 */
		Klass.prototype.destroy = function() {}, 
		
		/**
		 * 에디터 렌더링
		 * @desc 에디터 등록시 구현해야 함
		 */
		Klass.prototype.render = function() {};
		
		/**
		 * 에디터 컨텐츠 삽입
		 * @param {string}	content	에디터 컨텐츠
		 */
		Klass.prototype.setContent = function(content, isAppend) {
			_.each(this.beforeFilter, function(func) {
				content = func(content);
			});
			
			this.contentSetter.call(this, content, isAppend);
		};
		
		/**
		 * 에디터 컨텐츠 반환
		 * @return {string}	에디터 컨텐츠
		 */
		Klass.prototype.getContent = function() {
			var content = this.contentGetter.call(this);
			
			_.each(this.afterFilter, function(func) {
				content = func(content);
			});
			
			return content;
		};
		
		/**
		 * 에디터의 HTML 컨텐츠 반환(구현체에서 구현해야 함)
		 */
		Klass.prototype.getHTMLContent = function() {};
		
		/**
		 * 에디터의 MIME 타입 컨텐츠 반환(구현체에서 구현해야 함)
		 * 	- 저장시에는 이 함수를 이용하여 사용해야 함
		 */
		Klass.prototype.getMIMEContent = function() {};

		/**
		 * 에디터의 Html document 반환(구현체에서 구현해야 함)
		 */
		Klass.prototype.getDocument = function() {};
		
		/**
		 * 에디터 로드 후 실행되는 콜백함수
		 * @desc 에디터마다 로드시점이 다르므로 직접 실행시기를 결정해야 함
		 */
		Klass.prototype.onLoad = function(instance) {};
		
		/**
		 * 에디터 언로드시 콜백
		 * @desc 에디터가 언로드 될 때 실행
		 */
		Klass.prototype.onUnload = function(instance) {};
		
		/**
		 * activeX 에디터 활성화
		 * @desc activeX 에디터를 활성화 할 때 실행
		 */
		Klass.prototype.activate = function() {};
		
		/**
		 * activeX 에디터 비활성화
		 * @desc activeX 에디터를 비활성화 할 때 실행
		 */
		Klass.prototype.deactivate = function() {};
		
		/**
		 * 에디터 고유이름 체크
		 * @param uname	{string} 	에디터 고유 이름
		 * @returns {Boolean}
		 */
		Klass.prototype.kindOf = function(uname) {
			return this.__name__ === uname;
		};
		
		/**
		 * 에디터 타입을 체크
		 * @param type
		 * @returns {Boolean}
		 */
		Klass.prototype.typeOf = function(type) {
			return this.type === type;
		};
		
		/**
		 * 에디터 포커싱 함수
		 */
		Klass.prototype.focus = function() {};

		/**
		 * 에디터 컨텐츠에 접근 가능한 상태인지 여부 반환
		 */
		Klass.prototype.isAccessible = function() {
			return true;
		};
		
		/**
		 * 에디터 컨텐츠에 접근 가능한 상태인지 여부 반환
		 */
		Klass.prototype.isAccessible = function() {
			return true;
		};
		
		/**
		 * 서명 첨부
		 * 서명 처리는 스마트 에디터가 기본 에디터이므로 스마트 에디터의 서명 포맷을 기준으로 처리한다.
		 * @param {string} signature  서명 텍스트(혹은 HTML 마크업)
		 */
		Klass.prototype.setSignature = function(signature) {
			var content = this.contentGetter.call(this);
			
			//20160408
			var isBrowserIE = ($.browser.msie || (navigator.userAgent.toUpperCase().indexOf("TRIDENT") != -1 || navigator.userAgent.toUpperCase().indexOf("RV") != -1));
			var appendIESignBlockS = "";
			var appendIESignBlockE = "";
			if (isBrowserIE) {
				appendIESignBlockS = "<div style='display:block'>";
				appendIESignBlockE = "</div>";
			}
			
			// 스마트 에디터를 기준으로 맞춘다.
			if(content.indexOf("<!--sign Area start-->") != -1 && content.indexOf("<!--sign Area end-->") != -1) {
				var prevContent = content.split("<!--sign Area start-->")[0],
	            	nextContent = content.split("<!--sign Area end-->")[1];
				content = prevContent + "<!--sign Area start-->" + appendIESignBlockS + signature + appendIESignBlockE +  "<!--sign Area end-->" + nextContent;
				this.contentSetter.call(this, content);
			}else{
				var sign = "<!--sign Area start-->" + appendIESignBlockS + signature + appendIESignBlockE +  "<!--sign Area end-->";
				$.browser.msie ? sign = ["<P>&nbsp;</P><P>&nbsp;</P>", sign].join("") : sign = ["<P><BR></P><P><BR></P>", sign].join("");
				var isAppend = true;
				this.contentSetter.call(this, sign, isAppend);
			}
		};
		
		/**
		 * 템플릿 적용
		 * @param {object} oTemplateManager  GO.Editor.TemplateManager 객체
		 */
		Klass.prototype.applyTemplate = function(oTemplateManager) {
			if(!oTemplateManager instanceof parent.TemplateManager) {
				throw new Error('TemplateManager 객체가 아닙니다.');
				return;
			}
		};
		
		/**
		 * 템플릿 제거
		 * @param {object} oTemplateManager  GO.Editor.TemplateManager 객체
		 */
		Klass.prototype.removeTemplate = function(oTemplateManager) {};
		
		/**
		 * 에디터 validate. 따로 구현하지 않으면 무조건 통과됨.
		 * @returns {Boolean}
		 */
		Klass.prototype.validate = function() {
			return true;
		};
		
		/**
		 * 에디터가 보여지고 있는지 여부. 
		 * 에디터 place holder 에 siblings(iframe) 으로 에디터가 생성되기 때문에
		 * toggle 할때는 parent 를 toggle 해줘야 한다.
		 * @returns {Boolean}
		 */
		Klass.prototype.isVisible = function() {
			return this.$el.parent().is(":visible");
		};
		
		// static
		Klass.extend = extend;
		
		function convertToCompatibleOptions(options) {
			var result = options || {};
			
			if(options['bUseVerticalResizer']) result.resizable = options.bUseVerticalResizer;
			if(options['bUseToolbar']) result.useToolbar = options.bUseToolbar;
			if(options['bUsePallet']) result.usePallet = options.bUsePallet;
			if(options['bUseApprovalType']) result.bUseApprovalType = options.bUseApprovalType;
			if(options['appLoadCallBack']) result.onLoad = options.appLoadCallBack;
			if(options['editorValue']) result.content = options.editorValue;
			
			return result;
		}
		
		// 공통 필터 관리
		function removeBOMFilter(content) {
			var result = content;
			
			while(result.indexOf(unescape("%uFEFF")) > 0) {
				result = result.replace(unescape("%uFEFF"),'');
			}
			
			return result;
		}
		
		return Klass;
	})(Editor);
	
	// uuid 생성
	function generateUUID() {
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
	    return uuid;
	};
	
	function extend(protoProps, staticProps) {
		var parent = this;	// Klass 자신임
		var child;

		child = function() {
			var instance = parent.apply(this, arguments);
			return instance;
		}
		
		_.extend(child, parent, staticProps || {});
		
		var Surrogate = function(){ this.constructor = child; };
	    Surrogate.prototype = parent.prototype;
	    child.prototype = new Surrogate;
	    
	    if (protoProps) {
	    	_.extend(child.prototype, protoProps);
	    }
	    child.prototype.__super__ = parent.prototype;
		
		return child;
	}
	
	
	return Editor;
}, jQuery);

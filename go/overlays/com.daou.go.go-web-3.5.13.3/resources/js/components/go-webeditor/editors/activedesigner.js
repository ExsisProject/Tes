/* dependency: GO.Editor */
(function(root, $) {	
	// GO.Editor.ActiveDesigner
    var EDITOR_WIDTH = "100%";
    var EDITOR_HEIGHT = "450px";
    var defaultContextRoot = GO.contextRoot || "/";
    var MAXIMUM_MIME_SIZE = 15;
    $.getJSON(defaultContextRoot + "resources/js/conf/editor/editor.config.json", function(data){
    	EDITOR_HEIGHT = data['config'].height + 'px';
	}).fail(function(jqXHR, textStatus, errorThrown) {
		console.warn('height 설정이 없습니다.');
	});
    
    
//    var MAXIMUM_ATTACH_SIZE = 15;
	GO.Editor.registry('ActiveDesigner', {
		type: GO.Editor.TYPE_ACTIVEX, 
		contentSetter: setBodyValue, 
		contentGetter: getBodyValue, 
		
		defaults : function() {
			return {
				contextRoot : defaultContextRoot,
				onLoad : function() {},
				onUnload : function() {},
				content : ""
			};
		},
		
		oEditor: null,
		
		/**
		 * layer show/hide event 를 수신한다.
		 * @Override
		 * @name: initialize
		 */
		initialize: function(ctx, options) {
			this.__super__.initialize.call(this, ctx, options);
			
			this.wrapperId = this.idAttr + "Iframe";
			this.useImage = options.useImage;
			/**
			 * 이벤트 바인딩은 initialize 에서 수행 하지만 
			 * activeX controller 가 init 되기 전에 
			 * 이벤트가 수신되는 경우를 위해 promise object 를 둔다.
			 */
			this.initDefer = $.Deferred();
			this.uuid = generateUUID();
			var self = this;
			// 멀티 에디터 사용시 문제가됨. 해제하지 않는걸로..
//			$(document).off("showLayer.goLayer");
			$(document).on("showLayer.goLayer." + this.uuid, function(e, isBefore) {
				self.initDefer.done(function() {
					var layerLength = $("div[data-layer]:visible").length;
					var hasLayer = isBefore ? layerLength >= 0 : layerLength > 0;
					if (!hasLayer) return;
					self.deactivate();
				});
            });
                
//			$(document).off("hideLayer.goLayer");
            $(document).on("hideLayer.goLayer." + this.uuid, function(e, isBefore) {
            	self.initDefer.done(function() {
            		var layerLength = $("div[data-layer]:visible").length;
            		var hasLayer = isBefore ? layerLength > 1 : layerLength > 0;
            		if (hasLayer) return;
            		self.activate();
            	});
            });
            
            $(document).trigger("showActiveX.editor");
		}, 
		
		/**
		 * @Override
		 * @name: render
		 */
		render: function() {
			if (this.$el.siblings("iframe#" + this.idAttr).length) return;
			
			var self = this;
		    var height = self.$el.height() || EDITOR_HEIGHT;
	    	var template = makeEditorWrapper.call(this) + makeToggleFrame.call(this);
	    	
	    	this.$el.attr("data-content-type", "MIME");
	    	this.$el.attr("data-editor", "ActiveDesigner");
	    	this.$el.after(template);
	    	this.$el.hide();
		    
		    this.$el.siblings("#" + this.wrapperId).load(function() {
		    	var deferred = $(this).data("activeDesigner");
				self.deactivate();
		    	deferred.done(function(editor) {
					self.activate();
		    		self.oEditor = editor;
		    		self.oEditor.BodyValue = self.options.content || ""; 
		    		self.initDefer.resolve();
		    		self.onLoad();
		    	});
		    });
		    
		    this.$el.siblings("#" + this.idAttr + "ToggleFrame").load(function() {
		    	var doc = this.contentWindow.document;
		    	var head = doc.head || doc.getElementsByTagName("head")[0];
		    	var style = doc.createElement("style");
		    	var css = "body, P {margin: 0px;padding: 0px;line-height: 1.5;font-size: 12px;font-family: 돋움,dotum,AppleGothic,arial,Helvetica,sans-serif;}";
		    	
		    	style.type = "text/css";
		    	if (style.styleSheet) { // ie용 코드
		    		style.styleSheet.cssText = css;
		    	} else {
		    		style.appendChild(doc.createTextNode(css));
		    	}
		    	head.appendChild(style);
			});
		    
		    runHideListener.call(this);
		},
		
		getContent : function() {
			return this.oEditor ? this.getMIMEContent() : "";
		},
		
		getMIMEContent : function() {
			return this.oEditor ? this.oEditor.MIMEValue : "";
		},
		
		getHTMLContent : function() {
			return this.oEditor ? this.oEditor.BodyValue : "";
		},
		
		onLoad: function() {
			this.options.onLoad();
		},
		
		activate : function() {
			toggle.call(this, true);
		},
		
		deactivate : function() {
			toggle.call(this, false);
		},
		
		destroy : function() {
			this.$el.siblings("iframe").remove();
			this.onUnload();
			$(document).off("showLayer.goLayer." + this.uuid);
			$(document).off("hideLayer.goLayer." + this.uuid);
			$(document).trigger("hideActiveX.editor");
			stopHideListener.call(this);
		},
		
		validate : function() {
			var returnFlag = true;
			try {
				if (this.oEditor && !this.oEditor.MimeValue) {
					returnFlag = false; // mime이 큰경우 에디터 자체내에서 mimevalue 를 가져오지 못한다.
				}
				if (this.oEditor && this.oEditor.MimeValue.length / 1024 / 1024 > MAXIMUM_MIME_SIZE) {
					returnFlag = false;
				}
			} catch (e) {
				returnFlag = false; // ie8 에서는 memory 문제로 mime 값을 가져오지 못하는 경우가 있다.
			}
			return returnFlag;
		},
		
		hideListener : null,
	});
	
	function setBodyValue(content, isAppend) {
		// isAppend 기본값은 false;
		if(isAppend || false) {
			this.oEditor.BodyValue = getBodyValue.call(this) + content;
		} else {
			this.oEditor.BodyValue = content;
		}
	}
	
	function getBodyValue() {
		return this.oEditor ? this.oEditor.BodyValue : "";
	}
	
	/**
	 * makeEditorWrapper
	 * activeX iframe 을 생성한다.
	 */
	function makeEditorWrapper() {
		return [
	        '<iframe width="' + EDITOR_WIDTH + '" height="' + EDITOR_HEIGHT,
	        '" id="' + this.wrapperId + '" name="' + this.wrapperId, 
	        '" src="' + this.options.contextRoot + 'editor/activedesigner?formId=' + this.wrapperId,
	        this.useImage === undefined ? '' : '&useImage=' + this.useImage,
	        '" style="border:0;" frameBorder="0"></iframe>'].join("");
	}
	
	/**
	 * makeToggleFrame
	 * activeX 에디터를 숨길때 노출 시킬 iframe을 생성한다.
	 */
	function makeToggleFrame() {
		return [
	        "<iframe id='" + this.idAttr + "ToggleFrame'",
	        	"width='" + EDITOR_WIDTH + "' height='" + EDITOR_HEIGHT + "'",
	        	"style='display:none;border:1px solid gray' frameBorder='0'></iframe>"
        ].join("");
	}
	
	/**
	 * toggle
	 * layer의 존재 여부에 따라, activeX 에디터를 toggle한다.
	 * @param {boolean}	true : 에디터 노출, toggleFrame 숨김. false : 에디터 숨김, toggleFrame 노출
	 */
	function toggle(toggleFlag) {
	    if (!hasActiveDesigner.call(this)) return;
               
        var self = this;
        this.$el.siblings("#" + this.wrapperId).toggle(toggleFlag);
        var toggleFrameEl = document.getElementById(this.idAttr + "ToggleFrame");
        $(toggleFrameEl).toggle(!toggleFlag);
        $(toggleFrameEl).ready(function() {
        	if (toggleFrameEl && toggleFrameEl.contentWindow && toggleFrameEl.contentWindow.document.body) {
        		toggleFrameEl.contentWindow.document.body.innerHTML = self.getHTMLContent();
        	} 
        });
	}
	
	/**
	 * hasActiveDesigner
	 * activeX object 가 생성되어있는지 여부
	 */
	function hasActiveDesigner() {
		return this.$el.siblings("#" + this.wrapperId).length > 0;
    }
	
	/**
	 * SPA + IE8 이슈
	 * iframe parent가 ghost 가 되었는데 activeX object 가 브라우저에 보이는 현상. 
	 */
	function runHideListener() {
		var self = this;
		this.hideListener = setTimeout(function() {
			var isVisible = self.$el.parents("body").length > 0;
			if (!isVisible) {
				self.destroy();
				return;
			}
			runHideListener.call(self);
		}, 500);
	};
	
	function stopHideListener() {
		clearTimeout(this.hideListener);
	}
	
	function generateUUID() {
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	    });
	    return uuid;
	};
})(this, jQuery);
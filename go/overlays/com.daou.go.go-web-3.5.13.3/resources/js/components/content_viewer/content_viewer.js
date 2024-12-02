/* dependency: GO, jquery, underscore */
(function (name, definition, $, _, undefined){
	
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
	
})( 'GO.ContentViewer', function () {
		// jQuery.noConflict 모드에서도 사용할 수 있도록 로컬 변수로 등록해준다.
	var $ = window.$ || jQuery;
	var iframeMargin = 17;
	
	var ContentViewer = (function() {
		
		function Klass(options) {
			this.resizeCount = 0;
			this.resizeFlag = false;
			
			this.css = options.css || []; // 선택옵션
			this.setContent(options.content || ""); // 선택옵션
			this.$el = options.$el; // 필수옵션. backbone View 의 특징을 살릴 수 있게 $el 을 받아야 한다.
			this.elId = this.$el.attr("id") || generateUUID();
			this.viewerId = this.elId + "Viewer";
			this.style = options.style; 
		}
		
		Klass.prototype.render = function() {
			var self = this;
			var iframe = makeIframe.call(this);
			this.$el.html(iframe);
			getViewerEl.call(this).load(function(e, a) {
				loadCss.call(self);
				var iframe = this.contentWindow;
				var doc = iframe.document;
				$(doc).find("body").css({"clear": "both"});
				
				var contentEl = doc.getElementById("content");
				if (!contentEl) {
					$(doc).find("body").append("<div id='content'></div>");
				}
				contentEl.innerHTML = GO.util.convertMSWordTag(self.content);
				// setStyle
				if (self.style) {
					var css = self.style;
					var style = doc.createElement("style");
					style.type = "text/css";
			    	if (style.styleSheet) { // ie용 코드
			    		style.styleSheet.cssText = css;
			    	} else {
			    		style.appendChild(doc.createTextNode(css));
			    	}
			    	var head = doc.head || doc.getElementsByTagName("head")[0];
			    	head.appendChild(style);
				}
				// setStyle end
				
				var height = $(doc).outerHeight(true);
				$(this).height(height);
				self.resizeFlag = false;
				self.resizeCount = 0;
				resizeFrame.call(self, this);
			});
		};
		
		Klass.prototype.setContent = function(content) {
			this.content = GO.util.escapeXssFromHtml(content);
		};
		
		Klass.prototype.getContent = function() {
			return this.content;
		};
		
		Klass.prototype.hide = function() {
			this.$el.hide();
		};
		
		Klass.prototype.show = function() {
			this.$el.show();
		};

		function resizeFrame(frame) {
			var self = this;
			var isMarginAdded = false;
			if (!this.resizeFlag && this.resizeCount < 20) {
				var resizeInterval = setInterval(function() {

					if (frame && frame.contentWindow) {
						var height = $(frame.contentWindow.document).height();
						if (!isMarginAdded && ($(frame).width() < $(frame.contentWindow.document).width())) {
							isMarginAdded = true;
							height = height + iframeMargin;
						}
						$(frame).height(height);
					}
					self.resizeCount++;
					if (self.resizeCount === 20) {
						this.resizeFlag = true;
						clearInterval(resizeInterval);
					}
				}, 500);
			}
		};
		
		function loadCss(iframe) {
			if (this.css.length) {
				_.each(this.css, function(css) {
					var $head = this.$el.find("iframe").contents().find("head");
					$head.append($("<link/>", {rel : "stylesheet", href : GO.contextRoot + css, type : "text/css"}));
				}, this);
			}
		}
		
		function makeIframe() {
			return $('<iframe id="' + this.viewerId + '" src="' + GO.contextRoot + 'contentViewer" frameborder="0" height="1px" width="100%" el-content-viewer></iframe>');
		}
		
		function getViewerEl() {
			return this.$el.find("#" + this.viewerId);
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
		
		return Klass;
	})();
	
	return {
		init : function(options) {
			var viewer = new ContentViewer(options);
			viewer.render();
			
			return viewer;
		}
	}
	
}, jQuery, _);
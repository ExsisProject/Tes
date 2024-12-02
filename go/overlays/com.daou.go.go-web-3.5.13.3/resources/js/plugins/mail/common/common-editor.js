var SmartEditorControl = (function(root, $, GO) {
	
	var letterInfo = {};
	var Constants = {
		editorName: {
			SmartEditor: 'SmartEditor', 
			ActiveDesigner: 'ActiveDesigner'
		}	
	};
	var defaultEditor = Constants.editorName.SmartEditor;
	
	function Klass(options) {
		this.options = options;
		this.oEditor = null;
		this.templateManager = null;
	}
	
	Klass.prototype.makeEditor = function(callback) {
		var editorConfig = BASECONFIG.data.editorConfig;
		var curEditorName = decideEditorName(editorConfig && editorConfig.editorName ? editorConfig.editorName : defaultEditor);
		var opts = {
			lang: this.options.locale,
			//content : this.options.content || "",  // GO-26972
			onLoad : callback || function() {},
			useImage: this.options.useImage,
			height : "600px"
		};
		
		if(isSmartEditor(curEditorName)) {
			opts.sSkinURI = getSkinURI.call(this);
		}
		
		this.oEditor = GO.Editor.create(curEditorName, $('#' + this.options.id), opts);
	};
	
	Klass.prototype.getEditor = function() {
		return this.oEditor;
	};
	
	Klass.prototype.setEditorText = function(text) {
		this.oEditor.setContent(text);
	};
	
	Klass.prototype.addEditorText = function(text) {
		this.oEditor.setContent(text, true);
	};
	
	Klass.prototype.getEditorText = function() {
		return this.oEditor.getContent();
	};
	
	Klass.prototype.getHTMLContent = function() {
		return this.oEditor.getHTMLContent();
	};
	
	Klass.prototype.setSignData = function(data) {
		this.oEditor.setSignature(data);
	};
	
	Klass.prototype.makeLetterLayout = function(topImg, body, bottomImg) {
		var self = this;
		this.templateManager = new GO.Editor.TemplateManager({
			header: topImg, 
			footer: bottomImg, 
			backgroundImg: body
		});
		
		this.oEditor.applyTemplate(this.templateManager);
	};
	
	Klass.prototype.cancelLetterLayout = function() {
		this.oEditor.removeTemplate(this.templateManager);
		letterInfo = {};
	};
	
	Klass.prototype.destroy = function() {
		this.oEditor.destroy();
	};
	
	Klass.prototype.showWriteTemplateSelectLink = function() {
		// TODO: smarteditor로 통합
		var editorConfig = BASECONFIG.data.editorConfig;
		var curEditorName = decideEditorName(editorConfig && editorConfig.editorName ? editorConfig.editorName : defaultEditor);
		if(isSmartEditor(curEditorName)) {
			this.oEditor.editorWrapContent.find("#writeTemplateSelect").show();
		}
	};
	
	Klass.prototype.setFocus = function() {
		this.oEditor.focus();
	};

	Klass.prototype.isAccessible = function() {
		this.oEditor.isAccessible();
	};
	
	Klass.prototype.isAccessible = function() {
		this.oEditor.isAccessible();
	};
	
	/**
	 * 에디터 이름 결정
	 * @private
	 */
	function decideEditorName(curEditorName) {
		return !GO.Editor.isIE() && GO.Editor.isActiveXType(curEditorName) ? defaultEditor : curEditorName;
	}
	
	function isSmartEditor(curEditorName) {
		return curEditorName === Constants.editorName.SmartEditor;
	}
	
	function getSkinURI() {
		return "/smarteditor/mail-skin?mode="+((this.options.simpleMode) ? "simple":"");
	}
	
	return Klass;
})(this, jQuery, GO);
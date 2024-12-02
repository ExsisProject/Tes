define([
    'jquery',
    'app', 
    
    'go-webeditor', 
    'go-webeditor/editors/smarteditor', 
    'go-webeditor/editors/activedesigner',
    'go-webeditor/editors/dext5editor'
],

function($, GO, browser) {
	
	var pluginName = 'goWebEditor';
	var defaultEditor = 'SmartEditor';
	var defaultContext = GO.config('contextRoot');
	var editorConfig = GO.config('editorConfig');
	
	$.fn[pluginName] = function(options) {
		var opts = validateOptions(options);
		
		return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, GO.Editor.create(decideEditorName(), this, opts));
            }
        });
		
		function validateOptions(options) {
			if(!options) return {};
			
			if(!options.contextRoot) {
				options.contextRoot = defaultContext;
			}
			
			return options;
		}
		
		function decideEditorName() {
			var editorName = editorConfig && editorConfig.editorName ? editorConfig.editorName : defaultEditor;
			return !GO.Editor.isIE() && GO.Editor.isActiveXType(editorName) ? defaultEditor : editorName;
		}
	}
	
	// 과거 호환성 유지...
	$[pluginName] = {
		getContent: function(id) {
			try {
				var instance = $('#' + id).data('plugin_' + pluginName);
				return instance.getContent();
			} catch(e) {
				console.warn('지원하지 않는 에디터입니다.');
			}
		}
	}
});
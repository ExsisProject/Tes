(function() {
	define([
        "jquery",
	    "backbone",
	    "app",
	    
	    "admin/views/mail/alias_list",
	    "admin/views/mail/alias_tree",
	    
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        
        "GO.util"
	],
	function(
        $,
	    Backbone,
	    App,
	    
	    AliasListView,
	    AliasTreeView,
	    
        commonLang,
        adminLang
	) {
		var instance = null;
		var lang = {
				alias : adminLang["별칭 계정 관리"],
		};
		
		var AliasView = Backbone.View.extend({
			events : {
				"click input[name='aliasDisplayOption']" : "changeDisplayForm",
			},
			
			initialize: function(options) {
				this.options = options || {};
				this.aliasDisplayOption = this.options.aliasDisplayOption;
			},
			
			render: function(options) {
				
				var html = '&nbsp;<span class="option_wrap"> <input type="radio" id="aliasDisplayOptionList" name="aliasDisplayOption" value="list"><label for="aliasDisplayOptionList">' + adminLang["목록형"] + 
                           '</label></span> <span class="option_wrap"><input type="radio" id="aliasDisplayOptionTree" name="aliasDisplayOption" value="tree"><label for="aliasDisplayOptionTree">' + adminLang["트리형"] + '</label></span>';				                           
				this.$el.append(html);
								
				if(this.aliasDisplayOption == 'tree'){
					var aliasTreeView = new AliasTreeView();
					aliasTreeView.render();
					$('#aliasDisplayOptionTree').attr('checked', true);
				}else{
					var aliasListView = new AliasListView();
					aliasListView.render();
					$('#aliasDisplayOptionList').attr('checked', true);
				}
			},
			
			changeDisplayForm : function(e) {
				console.log($(e.currentTarget).val());
				if($(e.currentTarget).val() == 'tree'){
					App.router.navigate('mail/alias/tree', {trigger: true});
					return;
				}
				App.router.navigate('mail/alias', {trigger: true});
			}
		});
		return AliasView
	});
}).call(this);
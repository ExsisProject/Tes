define([
        "jquery",
        "backbone",     
        "app",
        "views/circle",
        "hgn!admin/templates/works/works_config",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "jquery.go-sdk",
        "jquery.jstree",
        "jquery.go-popup",
        "jquery.go-orgslide",
        "jquery.go-validation"
],
function(
		$, 
        Backbone,
        App,
        CircleView,
        configTmpl,
        commonLang,
        adminLang
) {
	var tmplVal = {
		'label_ok' : commonLang["저장"],
        'label_cancel' : commonLang["취소"],
		'앱 생성 권한': adminLang["앱 생성 권한"]
	};
	var View = Backbone.View.extend({
		initialize : function() {
			this.model = new Backbone.Model();
            this.model.url = "/ad/api/worksconfig";
            this.model.fetch({async : false});
		},
		events : {
			"click span#btn_ok" : "_worksConfigSave",
			"click span#btn_cancel" : "_worksConfigCancel",
		},
		render : function() {
			this.$el.empty().html(configTmpl({ 
				lang : tmplVal
			}));
			this._renderAdminView();
			return this.$el;
			
		},
		_renderAdminView : function() {
			var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
        	if(GO.util.isUseOrgService(true)){
        		nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
        	}

            this.adminView = new CircleView({
                selector: '#admin',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get('admin'),
                nodeTypes: nodeTypes
            });

            this.adminView.render();
            this.adminView.show();
		},
		_worksConfigSave : function(e) {
			e.stopPropagation();
			
			var self = this;
			var admins = self.adminView.getData();
			self.model.set('admin', admins);
            
			self.model.save({}, {
            	success : function(model, response) {
					if(response.code == '200') {
						$.goMessage(commonLang["저장되었습니다."]);
						self.render();
					}
				},
				error : function(model, response) {
					var responseData = JSON.parse(response.responseText);
					if(responseData.message != null){
						$.goMessage(responseData.message);
					}else{
						$.goMessage(commonLang["실패했습니다."]);
					}
				}
            });
		},
		_worksConfigCancel : function(e){
			e.stopPropagation();
			
                var self = this;
                $.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function(){
                    self.initialize();
                    self.render();
                    $.goMessage(commonLang["취소되었습니다."]);
                }, commonLang["확인"]);
            }    
	}, {
		attachTo: function(targetEl) {
			var contentView = new View();
			
			targetEl
				.empty()
				.append(contentView.el);
			
			contentView.render();
			
			return contentView;
		}
	});
	
	return View;
});
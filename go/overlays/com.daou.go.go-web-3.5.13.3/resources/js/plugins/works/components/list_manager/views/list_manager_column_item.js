define("works/components/list_manager/views/list_manager_column_item", function(require) {
	
	var commonLang = require("i18n!nls/commons");
	var worksLang = require("i18n!works/nls/works");
	var lang = {
		"컬럼명 변경" : worksLang["컬럼명 변경"],
		"삭제" : commonLang["삭제"],
		"수정" : commonLang["수정"],
		"제목으로 지정" : worksLang["제목으로 지정"],
		"내림차순으로 정렬" : worksLang["내림차순으로 정렬"],
		"오름차순으로 정렬" : worksLang["오름차순으로 정렬"]
	};
	
	var BackdropView = require("components/backdrop/backdrop");
	
	var Template = require("hgn!works/components/list_manager/templates/list_manager_column_item");
		
	return BackdropView.extend({
		
		tagName : "td",
		
		initialize : function(options) {
			this.isPrivate = options.isPrivate;

			this.$el.attr("el-cid", this.model.get("fieldCid"));
			
			this.model.on("unusedItem", this._onChangeUsed, this);
			this.model.on("change:columnName", this._onChangeName, this);

			this.columns = options.columns;
		},
		
		events : {
			"click [el-delete]" : "_onClickDelete",
			"click [el-edit]" : "_onClickEdit",
			"click [el-title]" : "_onClickSetTitle",
			"click [el-sort]" : "_onClickSort",
			"click [el-toggle-management-layer]" : "_onClickToggleManagementLayer"
		},

		render : function() {
			this.$el.html(Template({
				lang : lang,
				model : this.model.toJSON(),
				columnName : this.model.get("columnName") || this.model.get("fieldLabel"),
				isDesc : this.model.isDesc(),
                titleAvailable: !(_.contains(['status', 'docNo'], this.model.get('fieldCid'))) && !this.isPrivate
			}));
			
			return this;
		},
		
		/** 
		 * 순서 중요 view.remove -> model.remove
		 */
		_onChangeUsed : function() {
			this.model.off("unusedItem");
			this.remove();
			this.columns.remove([this.model]);
		},
		
		_onClickDelete : function() {
			this.model.set("isUsed", false); // condition
			this.model.collection.trigger("unuseColumn", this.model);
			this.remove();
		},
		
		_onClickEdit : function(e) {
			var columnName = this.model.get('columnName') || this.model.get('fieldLabel');
			var contentTmpl = [
               '<div class="content">',
					'<p class="desc">',
					lang["컬럼명 변경"],
					'</p>',
					'<div class="form_type">',
						'<input el-new-name class="txt_mini w_max" type="text" value="' + columnName + '">',
					'</div>',
				'</div>'
            ].join("");
			this.popup = $.goPopup({
                modal : true,
                pclass : "layer_normal layer_public_list",
                header : lang["컬럼명 변경"],
                width : 500,
                contents : contentTmpl,
                buttons : [{
                    btext : commonLang["확인"],
                    btype : "confirm", 
                    callback : $.proxy(function() {
                    	var newName = this.popup.find("input[el-new-name]").val();
                    	this.model.set("columnName", newName);
                    }, this)
                }, {
                    btext : commonLang["취소"],
                    btype : "normal", 
                    callback : function() {}
                }]
            });
			
			this.backdropLayer.toggle(false);
			e.stopPropagation();
		},
		
		_onClickSetTitle : function() {
			this.$el.trigger("setTitleColumn", this.model.get("fieldCid"));
		},
		
		_onClickSort : function(event) {
			var sortDirection = $(event.currentTarget).attr("el-sort").toUpperCase();
			this.$el.trigger("setSortColumn", [this.model.get("fieldCid"), sortDirection]);
		},
		
		_onClickToggleManagementLayer : function(event) {
			if (!this.backdropLayer) {
				this._initBackdrop(event);
			}
		},
		
		_onChangeName : function() {
			var name = this.model.get("columnName") || this.model.get("fieldLabel");
			this.$("[el-name]").html(name);
		},
		
		_initBackdrop : function() {
			this.backdropLayer = this.$("[el-column-management-layer]");
			this.backdropToggleEl = this.backdropLayer;
			this.bindBackdrop();
			this.linkBackdrop(this.$("[el-toggle-management-layer]"));
		}
	});
});
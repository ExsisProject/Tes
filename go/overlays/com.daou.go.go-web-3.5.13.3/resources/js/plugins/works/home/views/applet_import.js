define('works/home/views/applet_import', function(require) {
	
	var GridView = require('grid');
	var ImportPopupView = require('works/home/views/applet_import_popup');
	
	var popupTmpl = require('hgn!works/home/templates/applet_import_popup');

	var worksLang = require("i18n!works/nls/works");
	var commonLang = require('i18n!nls/commons');
	
	var lang = {
		'생성일': worksLang['생성일'],
		'앱명': worksLang['앱명'],
		'외': worksLang['외'],
		'총': worksLang['총'],
		'파일찾기': commonLang['파일찾기'],
		'파일 업로드': worksLang['파일 업로드'],
		'개의 가져온 앱이 있습니다.': worksLang['개의 가져온 앱이 있습니다.'],
		'비공개': worksLang['비공개'],
		'공개': worksLang['공개'],
		'삭제': commonLang['삭제'],
		'전사공유' : worksLang['전사공유']
	};
	    
    return Backbone.View.extend({
    	
    	gridView: null,
    	popupView: null,
    	
    	events: _.extend({
    		'click [data-import]' : '_onClickImportBtn',
    		'click a[data-select-file]' : '_onClickSelectFile',
    		'click [data-select-delete]' : '_onClickSelectionDelete',
    		'click [data-public-config]': '_onClickPublicConfigItem'
    	}, GridView.prototype.events),
    	
		initialize: function(options) {
			options = options || {};
			this.collection = options.models
		},
		
		render: function() {
			this.gridView = new GridView({
				tableClass: 'type_normal',
				checkbox: false,
				columns: this._getGridColumns(),
				collection: this.collection,
				usePageSize: true,
				useTableScroll: true,
				useBottomButton: true
			});
			this.$el.append(this.gridView.render().el);
			this.gridView.$el.on('navigate:grid', function(event, id) {
			});
			
			this._renderCustomHeader();
			this._renderCustomBottom();
			
			return this;
		},
		
		_renderCustomHeader:function() {
			this.$el.find('.tool_bar .custom_header').append("<a class='btn_tool' data-import><span class='ic_toolbar search'></span><span class='txt'>" + lang['파일찾기'] + "</span></a><span class='desc'>" + lang['총'] + "<span class='num'>" + this.collection.total + "</span>" + lang['개의 가져온 앱이 있습니다.'] + "</span>");
		},
		
		_renderCustomBottom:function() {
			this.$el.find('.tool_bar .custom_bottom').append("<a class='btn_tool' data-import><span class='ic_toolbar search'></span><span class='txt'>" + lang['파일찾기'] + "</span></a>");
		},
		
		_getGridColumns: function() {
			var self = this;
			var columns = [{
				label: "No",
				sortable: false,
				className: 'num',
				render: function(model) {
					return (model.collection.indexOf(model)) + 1;
				}
			}, {
				name: 'name',
				label: lang['앱명'],
				sortable: true,
				className: 'subject',
			    render: function(model) {
			    	return '<div class="app_list"><span class="txt">' + model.get('name') + '</span></div>';
			    }	
			}, {
				name: 'createdAt',
				label: worksLang['등록자'],
				sortable: true,
				className: 'name',
				render: function(model) {
					return model.get('requester').name;
				}	
			}, {
				name: 'createdAt',
				label : lang['생성일'],
				sortable: true,
				className: 'date',
			    render: function(model) {
			    	return moment(model.get('createdAt')).format('YYYY-MM-DD');
			    }	
			}, {
				name: 'publicConfig',
				label : lang['전사공유'],
				sortable: false,
				className: 'toggle',
			    render: function(model) {			    	
			    	var pubConfigTitle = "on" == model.get('publicConfig') ? lang['공개'] : lang['비공개'];
			    	return '<span class="device_access_setting ic_control ic_ctrl_' + model.get('publicConfig') + '" title="' + pubConfigTitle + '" data-public-config data-template-id="' + model.get('templateId') + '"></span>';
			    }	
			}, {
				name: 'delete',
				label : lang['삭제'],
				sortable: false,
				className: 'del',
			    render: function(model) {
			    	var style = "on" == model.get('publicConfig') ? 'none' : 'block';
		    		return '<span class="ic_side ic_basket_bx" title = "' + lang['삭제'] + '" data-select-delete data-template-id="' + model.get('templateId') + '" style="display: ' + style + '"></span>';
			    }	
			}];
			
			return columns;
		},
		
		_onClickSelectionDelete: function(e) {
			var self = this;
			var $target = $(e.currentTarget);
			var templateId = $target.attr('data-template-id');
			console.log(templateId);
			
			$.goCaution(commonLang["삭제하시겠습니까?"], "", function() {
				$.ajax({
                    type : 'DELETE',
                    contentType: 'application/json',
                    url: GO.contextRoot + "api/works/templates/" + templateId,
                    success: function(resp) {
                    	self.collection.fetch();
						$.goMessage(commonLang["삭제되었습니다."]);
					},
					error: function(resp) {
						$.goError(commonLang["관리 서버에 오류가 발생하였습니다"]);
					}
                }).done(function(data) {
                	
                });
			}, lang['삭제']);
		},
		
		_onClickPublicConfigItem: function(e) {
			var $target = $(e.currentTarget);
			var templateId = $target.attr('data-template-id');
			var isOn = $target.hasClass('ic_ctrl_on');
			if(isOn) {
				this._renderPublicConfigPopup("off", templateId, worksLang['공유한 앱을 해제하시겠습니까?'], worksLang['앱 공유 해제 설명'], worksLang['해제하기']);
			} else {
				this._renderPublicConfigPopup("on", templateId, worksLang['가져온 앱을 공유하시겠습니까?'], worksLang['앱 공유 설명'], worksLang['공유하기']);
			}
		},
		
		_renderPublicConfigPopup: function(publicConfig, templateId, headerText, descText, btnText) {
			var self = this;
			$.goPopup({
				"pclass": 'layer_normal new_layer layer_works_new new_wide',
				"header": headerText,
				"modal": true,
				"width": 450,
				"contents": '<p class="desc">' + descText + '</p>',
				"buttons": [{
					'btext': btnText, 
					'autoclose': true,
					'btype': 'confirm',
					'callback': function() {
						$.ajax({
							type: "PUT",
							contentType: "application/json",
							url: GO.contextRoot + "api/works/templates/" + templateId + "/public/" + publicConfig,
							success: function(resp) {
								self._updatePublicConfig(templateId, publicConfig);
								$.goMessage(commonLang["저장되었습니다."]);
							},
							error: function(resp) {
								$.goError(commonLang["관리 서버에 오류가 발생하였습니다"]);
							}
						});
					}
				}, {
					'btext': commonLang["닫기"],
					'btype': 'cancel'
				}]
			});
		},
		
		_updatePublicConfig: function(templateId, publicConfig) {
			var isOff = "off" == publicConfig;
			var titleText = isOff ? lang['비공개'] : lang['공개'];		
			var $templateItemEl = this.$('[data-id=' + templateId + ']');
			$templateItemEl.find('[data-select-delete]').toggle(isOff);
			$templateItemEl.find('[data-public-config]').attr("title", titleText);
			$templateItemEl.find('[data-public-config]').removeClass('ic_ctrl_on ic_ctrl_off');
			$templateItemEl.find('[data-public-config]').addClass('ic_ctrl_' + publicConfig);
		},
		
		_onClickImportBtn: function(e) {
			this._popupLayer();		
		},
		
		_popupLayer: function() {
			var self = this;
            this.popupLayer = $.goPopup({
                header: lang['파일 업로드'],
                pclass: 'layer_normal layer_upload',
                width : 550,
                buttons : [{
                    btext : commonLang["닫기"],
                    btype : "normal",
                    callback : function() {
						self.collection.fetch();
					}
                }]
            });
            
            this.popupView = new ImportPopupView({}); 
        	this.popupLayer.find('div.content').append(this.popupView.render().el);
        	this.popupView.initFileUpload();
        	this.popupView.$el.on('renderingComplete', $.proxy(function() {
//        		this.popupView.$('div.dataTables_paginate').css({"padding-top" : "0px"});
        		this.popupLayer.reoffset();
        	}, this));
        },
		
		_makeParam: function(ids) {
			return _.map(ids, function(id) {
				return "ids="+id;
			}).join("&");
		}, 
        
    });
});
define('works/home/views/applet_export', function(require) {
	
	var GridView = require('grid');
	
	var worksLang = require("i18n!works/nls/works");
	var commonLang = require('i18n!nls/commons');
	
	var lang = {
		'생성일': worksLang['생성일'],
		'앱명': worksLang['앱명'],
		'외': worksLang['외'],
		'명': commonLang['명'],
		'총': worksLang['총'],
		'내보내기': worksLang['내보내기'],
		'개의 앱이 있습니다.': worksLang['개의 앱이 있습니다.'],
		"선택된 항목이 없습니다." : commonLang["선택된 항목이 없습니다."]
	};
	    
    return Backbone.View.extend({
    	
    	gridView: null,
		
    	events: _.extend({
    		'click [data-export]' : '_onClickExportBtn'
    	}, GridView.prototype.events),
    	
		initialize: function(options) {
			options = options || {};
			this.models = options.models
		},
		
		render: function() {
			this.gridView = new GridView({
				tableClass: 'type_normal',
				checkbox: true,
				columns: this._getGridColumns(),
				collection: this.models,
				usePageSize: true,
				useTableScroll: true,
				useBottomButton: true
			});
			this.$el.append(this.gridView.render().el);
			this.gridView.$el.on('navigate:grid', function(event, id) {
//				$(this).find('input[data-id="' + id + '"]').prop('checked', true);
			});
			
			this._renderCustomHeader();
			this._renderCustomBottom();
			return this;
		},
		
		_renderCustomHeader:function() {
			this.$el.find('.tool_bar .custom_header').append("<a class='btn_tool' data-export><span class='ic_toolbar out'></span><span class='txt'>" + lang['내보내기'] + "</span></a><span class='desc'>" + lang['총'] + "<span class='num'>" + this.models.total + "</span>" + lang['개의 앱이 있습니다.'] + "</span>");
		},
		
		_renderCustomBottom:function() {
			this.$el.find('.tool_bar .custom_bottom').append("<a class='btn_tool' data-export><span class='ic_toolbar out'></span><span class='txt'>" + lang['내보내기'] + "</span></a>");
		},
		
		_getGridColumns: function() {
			var self = this;
			var columns = [{
				name: 'name',
				label: lang['앱명'],
				sortable: true,
				className: 'subject',
			    render: function(model) {
			    	return '<div class="app_list"><div class="wrap_img_ic"><img src="' + model.get('thumbSmall') + '"></div><span class="txt">' + model.get('name') + '</span></div>';
			    }	
			}, {
				name: 'createdAt',
				label: worksLang['등록자'],
				sortable: true,
				className: 'name',
				render: function(model) {
					return model.get('createdBy').name;
				}	
			}, {
				name: 'admins',
				label: worksLang['운영자'],
				sortable: false,
				className: 'name',
				render: function(model) {
					var admins = model.get('admins');
					var adminLabel = admins[0].name;
					if (admins.length > 1) adminLabel += " " + lang['외'] + " " + (admins.length - 1) + lang['명'];
					return adminLabel;
				}	
			}, {
				name: 'createdAt',
				label : lang['생성일'],
				sortable: true,
				className: 'date',
			    render: function(model) {
			    	return moment(model.get('createdAt')).format('YYYY-MM-DD');
			    }	
			}];
			
			return columns;
		},
		
		_onClickExportBtn: function() {
			var appletIds = this.gridView.getCheckedIds();
			if (!appletIds.length) {
				$.goMessage(lang["선택된 항목이 없습니다."]);
				return;
			}

			var index = 0;
			this._downloadFile(appletIds, index);
		},
		
		_downloadFile : function(appletIds, index) {
			var self = this;
			if (index == appletIds.length) {
				return;
			}
			
			var iframe = $("<iframe>").css("display","none").attr("src", GO.contextRoot + "api/works/applets/" + appletIds[index] + "/export");
			$("body").append(iframe);
			// 여러 애플릿을 다운로드 할 경우 브라우저에서 서버호출을 차단현상 발생, 이를 방지를 위해 서버 호출 시 2초 대기 후 다음 애플릿 다운로드 
			setTimeout(function(){
				$(iframe).remove();
				index = index + 1;
				self._downloadFile(appletIds, index);
			}, 2000);
		}
    });
});
define("works/views/app/download_manager_btn", function(require) {
	var worksLang = require("i18n!works/nls/works");
	var commonLang = require('i18n!nls/commons');

	var BackdropView = require("components/backdrop/backdrop");
	var DownloadManagerBtnTmpl = Hogan.compile([
		'<ul class="array_type">',
			'<li id="currentDownload"><span>' + worksLang["현재 페이지 다운로드"] + '</span></li>',
			'<li id="totalDownload"><span>' + worksLang["전체 페이지 다운로드"] + '</span></li>',
		'</ul>'
	].join(""));
	
	return BackdropView.extend({
		className : "array_option list_download",

		events: {
			'click #currentDownload': '_onClickCurrentDownload',
			'click #totalDownload': '_onClickTotalDownload'
		},
		
		initialize : function(options) {
			this.appletId = options.appletId;
			this.conditions = options.conditions;
			this.backdropToggleEl = this.$el;
			this.bindBackdrop();
		},
		
		render : function() {
			this.$el.html(DownloadManagerBtnTmpl.render());
			return this;
		},

		_onClickCurrentDownload: function() {
			window.location.href = this.collection.csvUrl();
		},

		_onClickTotalDownload: function() {
			$.ajax({
				type: "POST",
				contentType: "application/json",
				url: GO.contextRoot + "api/works/applets/" + this.appletId + "/docs/export",
				data: JSON.stringify({
					query: this.collection.queryString,
					conditionText: this.conditions.getLabelTexts()
				}),
				success: _.bind(function() {
					this._renderPopup();
				}, this),
				error: function() {
					$.goError(commonLang["관리 서버에 오류가 발생하였습니다"]);
				}
			});
		},

		_renderPopup: function() {
			$.goPopup({
				"pclass": 'layer_normal new_layer layer_works_new new_wide',
				"header": worksLang["전체 페이지 다운로드"],
				"modal": true,
				"width": 450,
				"contents": '<p class="desc">' + worksLang["전체 페이지 다운로드 설명"] + '</p>',
				"buttons": [{
					'btext': worksLang["관리 페이지 이동"],
					'autoclose': false,
					'btype': 'confirm',
					'callback': _.bind(function() {
						GO.router.navigate('works/applet/' + this.appletId + '/settings/download', true);
					}, this)
				}, {
					'btext': commonLang["닫기"],
					'btype': 'cancel'
				}]
			});
		}
	});
});

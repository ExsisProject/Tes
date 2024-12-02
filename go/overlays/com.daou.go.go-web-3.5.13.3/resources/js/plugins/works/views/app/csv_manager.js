/**
 * csv 관리 메인 뷰
 */

define("works/views/app/csv_manager", function(require) {

	require('jquery.progressbar');

	var worksLang = require("i18n!works/nls/works");
	var adminLang = require("i18n!admin/nls/admin");
	var lang = {
		'일괄 등록': worksLang['일괄 등록'],
		'꿀팁가이드': worksLang['꿀팁가이드'],
		'데이터 가져오기 설명': worksLang['데이터 가져오기 설명'],
		'파일 찾기': worksLang['파일 찾기'],
		'데이터 일괄 등록 도움말': worksLang['데이터 일괄 등록 도움말'],
		'데이터 가져오기 진행 현황': worksLang['데이터 가져오기 진행 현황'],
		'최근 데이터 가져오기 결과': worksLang['최근 데이터 가져오기 결과'],
		'앱 홈으로 이동': worksLang['앱 홈으로 이동'],
		'전체 처리 결과 다운로드': worksLang['전체 처리 결과 다운로드'],
		'등록일': worksLang['등록일'],
		'종료일': worksLang['종료일'],
		'첨부파일의 총 데이터': worksLang['첨부파일의 총 데이터'],
		'모든 컬럼의 값이 반영된 데이터': worksLang['모든 컬럼의 값이 반영된 데이터'],
		'유효성 검증 오류로 일부 데이터의 값이 반영되지 않은 데이터': worksLang['유효성 검증 오류로 일부 데이터의 값이 반영되지 않은 데이터'],
		'데이터 가져오기 설명2': worksLang['데이터 가져오기 설명2']
	};

	var when = require("when");
	var FileUpload = require('file_upload');

	var BaseAppletView = require('works/views/app/base_applet');
	var Applets = require("works/collections/applet_simples");
	var Tmpl = require("hgn!works/templates/app/csv_manager");

	var View = BaseAppletView.extend({

		progressBarOption: {
			boxImage: GO.contextRoot + 'resources/images/progressbar.gif',
			barImage: GO.contextRoot + 'resources/images/progressbg_green_200.gif',
			width: 200,
			max: 100
		},
		isProgress: false,
		statusCheckInterval: 1500,

		initialize : function (options) {
			this.applets = new Applets();

			BaseAppletView.prototype.initialize.apply(this, arguments);

			this.filters.on("changeFilter.filters", this._onChangeFilter, this);
		},

		events : {
			"click #import": "_onClickImport",
			'click #appHome': '_onClickAppHome',
			'click #downloadResult': '_onClickDownloadResult',
			'click #help': '_onClickHelp',
			'click span.ic_del': '_onClickDeleteAttach'
		},

		_initRender : function(){
			this.$el.html(Tmpl({
				lang : lang
			}));

			this._initFileUpload();
			this._checkStatus();

            this.layoutView.getContentElement().removeClass("build_situation");
            $('body#main').removeClass('go_skin_works');
			if (GO.config('locale') !== 'ko') {
				this.$('#help').hide();
				this.$('#help_explain').hide();
			}
		},

		render : function() {
			BaseAppletView.prototype.render.apply(this, arguments)
				.then($.proxy(function renderMe() {
					this._initRender();
				}, this));

			return this;
		},

		_onClickImport: function() {
			if (this.isProgress) return;

			this.isProgress = true;

			var promise = $.ajax({
				url: GO.contextRoot + "api/works/applets/" + this.appletId + "/docs/import/csv",
				contentType: "application/json",
				type: 'POST',
				data: JSON.stringify(this.$("#fileList").find("li").data("attach")),
				success: $.proxy(function(resp) {
					this._checkStatus();
					this.$('#progressBarArea').show();
					this.$('#progressBar').progressBar(0, this.progressBarOption);
				}, this)
			});

			GO.util.preloader(promise);
		},

		_checkStatus: function() {
			var intervalCheck = $.proxy(function() {
				setTimeout(function() {
					checkStatus();
				}, this.statusCheckInterval);
			});

			var checkStatus = $.proxy(function() {
				$.ajax({
					url: GO.contextRoot + "api/works/applets/" + this.appletId + "/docs/import/csv",
					contentType: "application/json",
					success: $.proxy(function(resp) {
						var status = resp.data.jobStatus || '';
						if (typeof resp.data.jobId === 'undefined') {
							this._defaultResult();
						} else {
							if(_.contains(['DOING', 'WAIT'], status)) {
								this.isProgress = true;
								var successCount = resp.data.successCount;
								var failCount = resp.data.failCount;
								var totalCount = resp.data.size;
								var progressBarValue = ((successCount + failCount) / totalCount) * 100;

								this.$('#progressBar').progressBar(progressBarValue, this.progressBarOption);
								this.$('#progressBarArea').show();
								this.$('#result').hide();

								intervalCheck.call(this);
							} else if (status == 'DONE') {
								this.isProgress = false;
								this.$('#import').hide();
								this.$('#progressBarArea').hide();
								this._displayResult(_.extend(resp.data, {startAt: startAt}));
							}
						}
					}, this)
				});
			}, this);

			checkStatus();
		},

		_defaultResult: function() {
			this.$('#result').hide();
			this.$('#downloadResult').hide();
		},

		_displayResult: function(data) {
			this.$('#downloadResult').show();
			this.$('#result').show();
			this.$('#startAt').text(moment(data.startedAt).format('YYYY-MM-DD HH:mm:ss'));
			this.$('#endAt').text(moment(data.endedAt).format('YYYY-MM-DD HH:mm:ss'));
			this.$('#totalCount').text(GO.util.numberWithCommas(data.size));
			this.$('#successCount').text(GO.util.numberWithCommas(data.successCount));
			this.$('#failCount').text(GO.util.numberWithCommas(data.failCount));
		},

		_verify: function(attach) {
        	$.ajax({
        		url: GO.contextRoot + "api/works/applets/" + this.appletId + "/docs/import/csv/verify",
        		contentType: "application/json",
        		type: "POST",
        		data: JSON.stringify(attach),
        		success: $.proxy(function(resp) {
        			this.$("#importDesc").show();

        			if (resp.columnNames) {
        				var columnNames = _.map(resp.columnNames, function(columnName) {
	        				return '[' + columnName + ']';
	        			});
        				this.$("#import").show();
        				this.$("#csvInfo").html(worksLang['데이터 가져오기 설명2']);
	        			this.$("#csvInfo").find('span').text(columnNames.join(", "));
        			} else {
        				this.$('#csvInfo').text(resp.errorMessage);
        			}
        		}, this),
        		error: $.proxy(function(error) {
        			this.$("#import").hide();
        			this.$("#importDesc").hide();
        		}, this)
        	});
        },

        _onClickDownloadResult: function() {
        	window.location.href = GO.contextRoot + "api/works/applets/" + this.appletId + "/docs/import/csv/result";
        },

		_initFileUpload : function(){
            var options = {
                el : this.$('span[el-uploader]'),
                context_root : GO.contextRoot ,
                button_text : "<span class='buttonText'>" + lang["파일 찾기"] + "</span>",
                progressBarUse : true,
                url : "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie')
            };

            (new FileUpload(options))
            .queue(function(e, data){

            })
            .start($.proxy(function(e, data){
                var reExt = new RegExp("(.csv)","gi"),
                    fileExt = data.type.toLowerCase();

                if(!reExt.test(fileExt)){
                	this.$('#importDesc').show();
                    this.$('#csvInfo').text(adminLang["csv 파일만 등록 가능합니다."]);
                    return false;
                }
            }, this))
            .progress(function(e, data){})
            .success($.proxy(function(e, serverData, fileItemEl){
                if(GO.util.fileUploadErrorCheck(serverData)){
                    $.goAlert(GO.util.serverMessage(serverData));
                    return false;
                } else {
                	if(GO.util.isFileSizeZero(serverData)) {
                		$.goAlert(GO.util.serverMessage(serverData));
                		return false;
                	}
                }

                var data = serverData.data;
                var fileTmpl = $([
                    "<li>",
                        "<span class='item_file'>",
                            "<span class='ic_file ic_" , data.fileExt , "'></span>",
                            "<span class='name'>", data.fileName, "</span>",
                            "<span class='size'>(", GO.util.getHumanizedFileSize(data.fileSize), ")</span>",
                            "<span class='btn_wrap'>",
                            	"<span class='ic_classic ic_del'></span>",
                        	"</span>",
                        "</span>",
                    "</li>"
                ].join('')).data("attach", serverData.data);
                this.$("#fileList").html(fileTmpl);

                this._verify(serverData.data);
            }, this))
            .complete(function(e, data){
                console.info(data);
            })
            .error(function(e, data){
                console.info(data);
            });
        },

        _onClickDeleteAttach: function(e) {
        	$(e.currentTarget).closest('li').remove();
        	this.$('#importDesc').hide();
        },

        _onClickAppHome: function(e) {
        	GO.router.navigate('works/applet/' + this.appletId + "/home", true);
        },

        _onClickHelp: function() {
        	var url = window.location.protocol + "//" + window.location.host + GO.contextRoot + 'app/works/csv/help';
        	var option = 'width=1280, height=700, left=0, top=0, scrollbars=1';
        	window.open(url, '', option);
        },

		_onChangeFilter : function() {
			GO.router.navigate("works/applet/" + this.appletId + "/home", true);
		}
	});

	return View;
});
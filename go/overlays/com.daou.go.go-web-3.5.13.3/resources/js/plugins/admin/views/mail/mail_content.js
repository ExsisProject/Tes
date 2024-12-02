(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
	    "hgn!admin/templates/mail/mail_content",
		"i18n!admin/nls/admin"
	], 

	function(
		$, 
		Backbone,
		App,
		mailContentTmpl,
		adminLang
	) {
		var iFrameOptions = {
			"전체메일" : "/site/reportTrendView.action?statCategory=summary&mailType=all&iframe=true",
			"수신메일" : "/site/reportTrendView.action?statCategory=summary&mailType=inbound&isSelectedDomain=none&iframe=true",
			"송신메일" : "/site/reportTrendView.action?statCategory=summary&mailType=outbound&isSelectedDomain=none&iframe=true",
			"정상메일" : "/site/reportTrendView.action?statCategory=normal&iframe=true",
			"스팸메일" : "/site/reportTrendView.action?statCategory=spamCont&iframe=true",
			"바이러스메일" : "/site/reportTrendView.action?statCategory=virus&iframe=true",
			"POP" : "/site/reportTrendView.action?statCategory=pop&iframe=true",
			"IMAP" : "/site/reportTrendView.action?statCategory=imap&iframe=true"
		};

		var MailContentView = App.BaseView.extend({

			events : {
				"change #iFrameOptions" : "onIFrameOptionsChanged"
			},

			initialize : function() {
				this.src = this.options.iframe_src;
			},
			
			render : function() {
				var self = this;
				this.$el.empty();
				var tmpl = mailContentTmpl({
					iframe_src : self.src,
					isMailStatView : self.isMailStatView(),
                    iFrameOptions : _.map(iFrameOptions, function(v, k) { return { key : k, value : v, lang : adminLang[k]} ; })
				});


				this.$el.html(tmpl);
                this.selectOption();

				var iframe = $('#site-viewer');
				iframe.load(function(e, a) {
                    var iframeContents = iframe.contents();

                    var searchEl = null;
                    if(this.src.indexOf("reportTrendView") > 0) { //통계
                        searchEl = '#tPage';
                        var iframeHeight = iframeContents.find(searchEl).outerHeight(true);
                        iframe.height(iframeHeight + 50);
                    } else if(this.src.indexOf('domainCommon.action?initMethod=group') > 0) {
                        /*
                         GO-33756 이슈
                         기본 height: 1200px; 24개의 아이템을 보여줌
                         아이템이 하나씩 추가될시 짤림현상, 아이템 하나당 height값을 50으로 측정
                         메일보관함만 적용.
                         */
                        var count = iframe.contents().find('#groups').children().length;
                        var heightValue = 1200;
                        var defaultCount = 24;

                        if(count > defaultCount) {
                            heightValue += (count - defaultCount) * 50;
                            heightValue += 100;
                        }

                        iframe.height(heightValue + 'px');
                    }
                    else {
                        if(iframe.height() < 1200){
                            iframe.height('1200px');
                        }
                        searchEl = '#domainManagementContent';
                        var target = iframeContents.find(searchEl);
                        target.on("change",function(){
                            if(target.height() > 1200){
                                iframe.height(target.height()+'px');
                            }
                        });
                    }
                    iframe.get(0).contentWindow.GO = GO;

					var $head = iframeContents.find('head');
					$head.find('link').remove();
                    var stylesheets = '<link rel="stylesheet" href="' + GO.contextRoot + 'resources/css/fonts/notosans.css" media="all">\n' +
                        '<link type="text/css" rel="stylesheet" href="' + GO.contextRoot + 'resources/css/go_admin_body.css?rev=' + GO.revision + '" media="screen" />\n' +
                        '<link type="text/css" rel="stylesheet" href="' + GO.contextRoot + 'resources/css/go_prototype.css?rev=' + GO.revision + '" media="screen" />\n' +
                        '<link type="text/css" rel="stylesheet" href="' + GO.contextRoot + 'resources/css/doc_editor.css?rev=' + GO.revision + '" media="screen" />\n' +
                        '<link type="text/css" rel="stylesheet" href="' + GO.contextRoot + 'resources/css/ta_style.css?rev=' + GO.revision + '" media="screen" />\n' +
                        '<link type="text/css" rel="stylesheet" href="' + GO.contextRoot + 'resources/css/adm_style.css?rev=' + GO.revision + '" media="screen" />\n' +
                        '<link type="text/css" rel="stylesheet" href="' + GO.contextRoot + 'resources/css/go_admin_customize.css?rev=' + GO.revision + '" media="screen, print" />\n' +
                        '<link type="text/css" rel="stylesheet" href="' + GO.contextRoot + 'resources/css/prefix.css?rev=' + GO.revision + '" media="screen" />';
					$head.prepend(stylesheets);
                    iframeContents.find('body').css('background', '')


					var first = true;
                    _.forEach(iframeContents.find('.content_body'), function( cb){
                    	if(first ){  first = false; return; }
						$(cb).find('table').addClass('tb')
						_.forEach($(cb).find('tr'), function (tr) {
							var td = $(tr).find('td')
							if( !td || !$(td).css('padding-right') ){
								return;
							}
							$(tr).find('th').addClass('th_left')
							$(tr).find('th').css('text-align', '');
							$(tr).find('th').css('padding-right', '');

							$(tr).find('td').css('text-align', '');
							$(tr).find('td').css('padding-right', '');
						});

					});
				});


			},

			isMailStatView : function() {
				return _.contains(iFrameOptions, this.src);
			},

			selectOption : function() {
				var selectedOption = this.$el.find('#iFrameOptions option[value="' + this.src + '"]');
				selectedOption.attr("selected", true);
			},

            onIFrameOptionsChanged : function(e) {
				var optionBox = $(e.currentTarget);
				var selectedOption = optionBox.find('option:selected');
				var iFrameSrc = selectedOption.val();

                this.src = iFrameSrc;
                this.render();
			}
		});
		return MailContentView;
	});
}).call(this);
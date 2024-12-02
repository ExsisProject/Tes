(function() {

    define([
        "app",
        "views/layouts/default",
        "views/layouts/popup_default",
        "i18n!nls/commons", 
        /*액션에서 require() 함수를 통해서 호출할 경우 
        크롬에서 히스토리를 모두 삭제하고 처음 로드할 경우 
        FullpageLayout을 로딩 못하는 경우가 발생(이유는 알 수 없음)*/
        "views/layouts/fullpage"
    ], 

    function(
        GO,
        DefaultLayout,
        PopupDefaultLayout,
        commonLang, 
        FullpageLayout
    ) {
        var CoreController = (function() {
            var Controller = function() {
            };

            Controller.prototype = {
                renderer : function(leftMenu, contentsPath, sidePath, option) {
                    require([contentsPath, sidePath], function(ContentsView, SideView) {
                        DefaultLayout.render().done(function(layout) {
                            SideView.render(leftMenu);
                            ContentsView.render(option);
                        });
                    });
                },
                
                popupRenderer : function(contentsPath, option) {
                    require([contentsPath], function(ContentsView) {
                        PopupDefaultLayout.render().done(function(layout) {
                            ContentsView.render(option);
                        });
                    });
                },

                userProfile: function(){
                    this.renderer("userProfile", "views/user/user_profile", "views/user/side_user");
                },
                
                userPassword: function(){
                    this.popupRenderer("views/user/user_password");
                },
                
                userConfig: function(){
                    this.renderer("userConfig", "views/user/user_config", "views/user/side_user");
                },
                
                userNoti: function(){
                	require(["views/user/user_noti", "views/user/side_user"], function(ContentsView, SideView) {
                        DefaultLayout.render().done(function(layout) {
                            SideView.render("userNoti");
                            ContentsView.render();
                            this.$el.addClass('do_setting');
                        });
                    });
                },
                
                userDevice: function() {
                	this.renderer("userDevice", "views/user/user_device", "views/user/side_user");
                },
                
                sitelink: function() {
                    var url = GO.router.getSearch('url');
                    if(!url) {
                        GO.router.navigate("/home", {trigger: true, replace: true});
                        return;
                    }

                    var getValidUrlList = $.ajax({
                        type: "GET",
                        url: GO.contextRoot + "api/new-link-menu/url"
                    });

                    getValidUrlList
                        .done(_.bind(this.goToSiteLink, this))
                        .fail(function (resp) {
                            console.log(resp);
                            GO.util.error('404');
                        });
                },

                goToSiteLink : function(urlList) {
                    var url = GO.router.getSearch('url');
                    this.validateSiteLinkUrl(urlList, url);

                    FullpageLayout.render().done(function() {
                        var iframe = $( '<iframe id="site-viewer" width="100%" marginHeight="0" marginWidth="0" frameBorder="0"></iframe>' ).appendTo( '.go_body' );
                        iframe.attr( 'src', decodeURIComponent(url) );
                        resizeIFrame( iframe );

                        $(window).resize(function() {
                            windowResize( resizeIFrame, iframe );
                        });
                    });
                },

                validateSiteLinkUrl : function(urlList, url) {
                    var validUrlList = [];
                    _.each(urlList.data, function(data) {
                        validUrlList.push(data);
                    });

                    if(!_.contains(validUrlList, url)) {
                        GO.util.error('404');
                    }
                },

                preview : function(encrypt){
                    require([
                            "views/preview"
                        ],function(PreviewLayout){
                            var previewLayout = new PreviewLayout({encrypt : encrypt});
                            $("body").append(previewLayout.render().$el);

                        }
                    );
                },

                previewTempFile : function(realname, folder, tempname){
                    require([
                            "views/preview"
                        ],function(PreviewLayout){
                            var previewLayout = new PreviewLayout({realname:realname,folder:folder,tempname:tempname});
                            $("body").append(previewLayout.renderTemp().$el);
                        }
                    );
                },
                
                note : function() {
                	require([
            	        "note/views/note"
        	        ], 
        	        function(View){
            			var view = View.init({
            				attachInfos : []
            			});
            			$("body").css("min-width", "710px");
            			$("body").html(view.el);
        				view.render();
            		});
                },
                
                writeNote : function(type) {
                	require([
            	         "note/views/note_write"
        	        ],
                	function(View){
                		var view = View.init({
                			type : type,
                			attachInfos : []
                		});
                		$("body").css("min-width", "710px");
                		$("body").html(view.el);
                		view.fetch().done(function() {
            				view.render();
            				console.log('note:{"function" : "complete", "param1" : "true"}');
            			}).fail(function() {
            				console.log('note:{"function" : "complete", "param1" : "false"}');
            			});
                	});
                },
                
                readNote : function() {
                	require([
            	         "note/views/note_read"
        	        ],
        	        function(View){
                		var view = new View({
                			attachInfos : []
                		});
                		$("body").css("min-width", "initial");
                		$("body").html(view.el);
                		view.fetch().done(function() {
                			view.render();
                		});
                	});
                }
            };
            
            var ignoreWindowResize = 0, 
                resizeUID = 0;
            
            function windowResize( callback ) {
                var args = Array.prototype.slice.call( arguments, 1 );
                if(!ignoreWindowResize) {
                    var uid = ++resizeUID;
                    setTimeout(function() {
                        if(uid == resizeUID && !ignoreWindowResize) {
                            ignoreWindowResize++;
                            callback.apply(undefined, args);
                            ignoreWindowResize--;
                        }
                    }, 200);
                }
            };
            
            function resizeIFrame( iframe ) {
                var winHeight = $(window).height(); 
                var height = winHeight;
                //차세대에는 advanced일때 header가 왼쪽으로 가기때문에 로직을 다시 점검해야함.
                var headerHeight = $("header.go_header").outerHeight();
                var minHeight = "600px";
                
                $('.go_wrap').children().each(function(i, child) {
                    if($(child).is(":not(.go_body)")) {
                        height -= $(child).outerHeight();
                    }
                });
                
                //GO-31964 최소높이가 600px로 잡혀있어서 브라우저를 최소높이보다 작게 줄일때 iframe하단에 빈 여백이 생김을 방지
                if(height < headerHeight + 600) {
                	minHeight = "auto";
                }
                
                $('.go_body').css({
                	"height" : height,
                	"overflow" : "hidden",
                	"min-height" : minHeight
                });
                iframe.height(height-3);
                
                return;
            };

            return Controller;
        })();

        return new CoreController;
    });
}).call(this);
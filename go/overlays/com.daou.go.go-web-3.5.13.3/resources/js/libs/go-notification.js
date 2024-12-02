(function( $, Strophe, window, document, undefined ) {
    
    var 
        webNotiCloseEventName = 'web-noti:closed', 
        displayedNotiCount = 0, 
        bottomMargin = 5;
    var defaultLocale = "ko";
    var locale = $('meta[name="locale"]').attr('content') || defaultLocale;
	var lang = {
		'ko' : {
			"확인되지 않은 알림 {{arg1}}건이 있습니다." : "확인되지 않은 알림 {{arg1}}건이 있습니다."
		},
		'ja' : {
			"확인되지 않은 알림 {{arg1}}건이 있습니다." : "確認されてない通知{{arg1}}件があります。"
		},
		'en' : {
			"확인되지 않은 알림 {{arg1}}건이 있습니다." : "There is {{arg1}} notifications."
		},
		'zh_CN' : {
			"확인되지 않은 알림 {{arg1}}건이 있습니다." : "有{{arg1}}件通知没有查看。"
		},
		'zh_TW' : {
			"확인되지 않은 알림 {{arg1}}건이 있습니다." : "有{{arg1}}件通知沒有查看。"
		},
		'vi' : {
			"확인되지 않은 알림 {{arg1}}건이 있습니다." : "Có {{arg1}} thông báo chưa được xác nhận."
		}
	};
	
	var i18n = function(str, keyOrVars, value) {
        var compiled = Hogan.compile(str), 
            tvars = {};

        if(typeof keyOrVars === 'object') {
            tvars = keyOrVars;
        } else {
            tvars[keyOrVars] = value;
        }
        
        return compiled.render(tvars);
    };
    
    /**
     * 웹 알림 레이어
     */
    var GOWebNotiLayer = (function() {
        function GOWebNotiLayer( model, options ) {
            this.model = model;
            this.options = $.extend( { timeout: 10000 }, options );
            this.index = $('.web-noti-wrap').length;
            
            this.$el = $( '<div class="noti_wrap web-noti-wrap"></div>' ).css( "z-index", "9999" );
            this.$el.data('instance', this);
            
            this._buildLayer();
        };
        
        GOWebNotiLayer.prototype = {
            render: function() {
                setTimeout( $.proxy(this.close, this), this.options.timeout );
                
                this.delegateEvents();
                this.$el.appendTo("body");
                this.setPosition();
            }, 
            
            setPosition: function() {
                var posY = this.$el.outerHeight() * this.index + bottomMargin;

                this.$el.css( "bottom", posY + "px" );
            }, 
            
            delegateEvents: function() {
            	this.$el.on( "click", "li", $.proxy(function(e) {
                    e.preventDefault();
                    $(document).trigger('web-noti:confirm', [this]);
                }, this));
                
                this.$el.on( "click", "a.btn_layer_x", $.proxy(function(e) {
                    e.preventDefault();
                    this.close();
                }, this));
            }, 
            
            getIndex: function() {
                return this.index;
            }, 
            
            reposition: function() {
                var myHeight = this.$el.outerHeight();
                
                this.index = this.index - 1;
                this.$el.animate({ 'bottom': '-=' + myHeight }, 150);
            }, 
            
            undelegateEvents: function() {
                this.$el.off();
            }, 
            
            remove: function() {
                this.undelegateEvents();
                this.$el.remove();
                displayedNotiCount--;
            }, 
            
            close: function() {
                this.$el.fadeOut(500, $.proxy(function() {
                    var self = this;
                    $(document).trigger( webNotiCloseEventName, [this.getIndex(), function after() {
                        self.remove();
                    }]);
                }, this));
            }, 
            
            _buildLayer: function() {
            	this.$el.append( buildSkeleton() );
                
                this._setIconType();
                this._setProfile();
                this._setMsg();
            }, 
            
            _setIconType: function() {
            	var cn = {
                    "mail": "mail", 
                    "calendar": "cal", 
                    "bbs": "bbs", 
                    "community": "comm",
                    "task" : "task", 
                    "approval": "approval", 
                    "addr": "contact", 
                    "survey": "survey",
                    "report": "report",
                    "todo" : "todo",
                    "alarm" : "alarm",
					"works" : "works",
					"docs" : "docs",
					"asset" : "asset",
					"webfolder" : "file",
                    "ehr" : "ehr",
                    "channel" : "alarm",
                    "manager" : "task"
                };
                
                if( this.model.category && cn[this.model.category.toLowerCase()] ) {
                    this.$el.find( '.ic_gnb' ).addClass( 'ic_type2_' + cn[this.model.category.toLowerCase()] );
                }
            }, 
            
            _setProfile: function() {
            	this.$el.find( '.photo > img' )
                    .attr( 'src', this.model.profile )
                    .attr( 'title', this.model.sender || "" );
            }, 
            
            _setMsg: function() {
        		this.$el.find('a.msg').html( "<strong class=\"type\">" + (this.model.sender || "") + "</strong><span class=\"cont\">" + this._escapeHtml(this.model.message) + "</span>"); 
            },
            
            _escapeHtml: function (content) {
                if (!content) return content;
                content = content.replace(/</gi, "&lt;");
                content = content.replace(/>/gi, "&gt;");
                content = content.replace(/(\n)/gi, "<br>");
                content = content.replace(/ /gi, "&nbsp;");
                return content;
            },
        };
        
        function buildSkeleton() {
            var html = [];
            html.push( '<ul class="type_simple_list simple_list_alarm">' );
            html.push( '<li>' );
            html.push( '<p class="type"><span class="ic_gnb"></span></p>' );
            html.push( '<p class="photo"><img src=""></span></p>' );
            html.push( '<div class="info">' );
            html.push( '<p class="subject">' );
            html.push( '<a href="" data-bypass class="msg"></a>' );
            html.push( '</p>' );
            html.push( '</div>' );
            html.push( '</li>' );
            html.push( '</ul>' );
            html.push( '<a class="btn_layer_x"><span class="ic"></span><span class="txt">close</span></a>' );
            return html.join("\n");
        };
        
        function buildMessage(message) {
        	var header = message.match(/^[\[][^\]]*[\]]*/);
        	if (header) {
        		contents = message.split(header)[1];
        		return "<strong class=\"type\">" + header + "</strong><span class=\"cont\">" + contents + "</span>";
        	} else {
        		return message;
        	};
        };
        
        return GOWebNotiLayer;
    })();
    
    /**
     * 웹킷 확장 알림
     */
    var GOWebkitNoti = (function() {
        function GOWebkitNoti( model ) {
            this.model = model;
        };
        
        GOWebkitNoti.prototype = {
            render: function() {
                var self = this;
                if(hasPermission()) {
                    var notification = window.webkitNotifications.createNotification( 
                        self.model.profile, self.model.category, self.model.message 
                    );
                    
                    notification.onclick = function() {
                    	window.location.href = self.model.linkUrl;
                        notification.close();
                    };
                    
                    notification.show();
                };
            }
        };
        
        function isSupported() {
            return !!window.webkitNotifications;
        };
        
        function hasPermission() {
            return isSupported() && (window.webkitNotifications.checkPermission() === 0);
        };
        
        GOWebkitNoti.isSupported = isSupported;
        GOWebkitNoti.hasPermission = hasPermission;
        
        return GOWebkitNoti;
    })();
    
    
    /**
     * 알림 추상 클래스
     */
    function GONotiFactory( options ) {
        this.options = options;
        this.isWinFocused = true;
        
        this.init();
    }
    
    GONotiFactory.prototype = {
        init: function() {
            var self = this;
            $(window).focus(function() {
                self.isWinFocused = true;
            });
            
            $(window).blur(function() {
                self.isWinFocused = false;
            });
        }, 
        
        getNotiInstance: function( noti ) {            
            if(GOWebkitNoti.hasPermission()) {
                Klass = this.isWinFocused ? GOWebNotiLayer : GOWebkitNoti;
            } else {
                Klass = GOWebNotiLayer;
            }

            return new Klass( noti, this.options );
        }, 
        
        render: function( noti ) {
            this.getNotiInstance( noti ).render();
        },
        
        renderQueuedNoti : function(msgQueue) {
        	var noti = {
        		linkUrl : "/app/noti/unread",
        		category : "alarm",
        		message : i18n(lang[locale]["확인되지 않은 알림 {{arg1}}건이 있습니다."], {arg1 : msgQueue.length}),
        		profile : "/resources/images/photo_profile_small.jpg"
        	};
        	return this.render(noti);
        }
    };
    
    /**
     * GO 웹 알림
     */
    function GONotification( boshUrl, auth, options ) {
        this.boshUrl = boshUrl;
        this.auth = auth;
        
        this.options = $.extend( true, {}, GONotification.options, options );
        this.msgQueue = [];
        
        /**
         *  pause 상태에선 noti를 보여주지 않고 queue 에 가지고 있는다. 
         */
        this.isPause = false; 
        
        this.delegateEvents();
        this.notiFactory = new GONotiFactory( { timeout: this.options.timeout } );
        
        this.boshConn = new Strophe.Connection( this.boshUrl );
    }
    
    GONotification.prototype = {
        run: function() {
            this._connectXmppServer();
        }, 
                
        delegateEvents: function() {
        	var self = this;
             $(document).on( webNotiCloseEventName, $.proxy(function(e, removedIndex, afterCallback) {
                 this.popup();
                 $('.noti_wrap').each(function(i, el) {
                     var instance = $(el).data('instance'), 
                         savedIndex = instance.getIndex();
                 
                     if(savedIndex > +removedIndex) {
                         instance.reposition();
                     }
                 });
                 
                 afterCallback();
             }, this));
             
             /**
              * activeX 에디터가 활성화 되면 noti 를 멈춘다. 
              */
             $(document).on("showActiveX.editor", function() {
            	 /*window.console.log("showActiveX.editor");*/ 
            	 self.isPause = true;
             });
             /**
              * activeX 에디터가 비활성화 되면 noti 를 다시 수행한다.
              * 몇개의 noti가 왔었는지 알려주고 queue 를 비운다. 
              */
             $(document).on("hideActiveX.editor", function() {
            	 /*window.console.log("hideActiveX.editor");*/
            	 self.isPuase = false;
            	 if (!self.msgQueue.length) return;
            	 self.notiFactory.renderQueuedNoti(self.msgQueue);
            	 self.msgQueue = [];
             });
        }, 
        
        release: function() {
             $(document).off( "goNotiClose" );
        }, 
        
        popup: function( noti ) {
            var nextNoti;
            
            if(typeof nextNoti === 'undefined' && this.msgQueue.length > 0) {
                nextNoti = this.msgQueue.shift();
            } else {
                nextNoti = noti;
            }
            
            if(nextNoti) {
                this.notiFactory.render( nextNoti );
                displayedNotiCount++;
            }
        }, 
        
        onMsgReceived: function( msg ) {
            var msgBody = $(msg).find("body:first"), 
                notiMsg = $.parseJSON(msgBody.text());
            
            if(notiMsg.type && notiMsg.type === 'realtime') {
            	$(document).trigger('noti.realtime.' + notiMsg.category, [notiMsg]);
            	/*컴파일시 삼항연산자로 바뀌면서 위의 trigger 결과를 return 하게 된다. 따라서 여기서 반드시 return을 해줘야 한다.*/
            	return true;
    		/**
    		 *  pause 상태에선 noti를 보여주지 않고 queue 에 가지고 있는다. 
    		 */
            } else if(this.isPause) {
            	this.msgQueue.push( notiMsg );
            	return true;
            } else {
            	if( displayedNotiCount >= this.options.maxDisplayCounts ) {
            		this.msgQueue.push( notiMsg );
            	} else {
            		this.popup( notiMsg );
            	}
            	/*콜백 실행*/
            	this.options.onReceiveMessage( msg );
            	/*리턴값 true를 반드시 설정해야 한다. 그렇지 않으면 처음 한번만 동작한다.*/
                return true;
            }
            
            return true;
        }, 
        
        _connectXmppServer: function() {
            var self = this, 
                conn = this.boshConn, 
                auth = this.auth;
    
            conn.connect( auth.jid, auth.password, function (status) {
                if (status === Strophe.Status.CONNECTED) {
                    console.log('[ Strophe - BOSH Server ] Connnected');
                    conn.addHandler($.proxy(self.onMsgReceived, self), null, 'message', 'headline');
                    conn.send($pres());
                } else if (status === Strophe.Status.DISCONNECTED) {
                    console.log('[ Strophe - BOSH Server ] disconnected');
                }
            });
        },
        
        disconnect : function() {
        	var conn = this.boshConn;
        	var auth = this.auth;
        	
        	conn.disconnect(auth.jid, auth.password, function(status) {
        		console.log(status);
        	});
        }
    };
    
    GONotification.options = {
        maxDisplayCounts: 5, 
        timeout: 15000, 
        onReceiveMessage: function() {}
    };
    
    GONotification.option = function( key, value ) {
        if( $.isPlainObject( key ) ){
            this.options = $.extend( true, this.options, key );
        } else if ( key && typeof value === "undefined" ){
            return this.options[ key ];
        } else {
            this.options[ key ] = value;
        };
    };

    window.GONotification = GONotification;
    return GONotification;
    
})( jQuery, Strophe, window, document );

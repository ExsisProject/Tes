(function() {
    define([
        "views/layouts/default",
        "approval/views/side",
        "approval/views/side_company_doc"

    ],

    function(
        DefaultLayout,
        SideView,
        SideCompanyDocView
    ) {

        var __super__ = DefaultLayout.prototype,
            _slice = Array.prototype.slice,
            ApprovalDefaultLayout;

        ApprovalDefaultLayout = DefaultLayout.extend({
            sideView : null,
            contentView: null,

            initialize: function(options) {
                this.options = options || {};
                var args = _slice.call(arguments);
                __super__.initialize.apply(this, args);
                this.sideView = null;
            },
            
            render : function(obj){
                var self = this;
                var toCreate = true;
                if(obj && obj.isCompanyDocFolder){
                	toCreate = this._getAppName() !== 'approval.companydoc'; //appName이 틀리면 side를 새로 그려야함. 전사문서함과 같이 쓰고 있기 때문에 분기가 필요..
                	this.appName = 'approval.companydoc';
                    return __super__.render.apply(this).done(function() {
                        self.renderCompanyDocSide(obj.folderId, toCreate);
                    });
                }else{
                	toCreate = this._getAppName() !== 'approval'; //appName이 틀리면 side를 새로 그려야함.
                	this.appName = 'approval';
                    return __super__.render.apply(this).done(function() {
                        self.renderSide(toCreate);
                    });
                }
            },

            renderSide: function(toCreate) {
                var self = this;
            	if(this.sideView == null || toCreate) {
            		this.sideView = SideView.getInstance();
            	}
            	this.sideView.render();
                self.getContentElement().addClass('go_renew');
            },

            renderCompanyDocSide : function(folderId, toCreate){
                var self = this;
            	if(this.sideView == null || toCreate) {
            		this.sideView = SideCompanyDocView.getInstance();
            		this.sideView.render(folderId); //render를 호출하면 트리가 전부 열리기 때문에 최초 new할때만 그리도록 한다.
            	}else{
            		this.sideView.setSelectFolderStyle(folderId);
            	}
            },

            destroyContent : function(){
                if (this.contentView) {
                    this.contentView.release();
                };
            },

            initSide: function() {
                this.sideView = null;
            },

            // 전자결재의 특이한 레이아웃 구조를 위한 코드.
            // controller 에서 #content 를 지우고 다시 만드는 경우 slideMessage 가 사라진다.
            // #content 는 없는데 div.go_renew 만 있는 경우는 없을거라고 가정한다.
            initDefaultMarkup: function() {
                var $content = $("body").find("#content");
                if ($content.length) {
                    var $parent = $content.parent();
                    $content.remove();
                    $parent.html("<div id='content'></div>");
                } else {
                    $("body").append("<div class='go_renew'><div id='content'></div></div>");
                }
            },

            initPrintPopMarkup: function() {
                $('body').empty().addClass('print wrap_fix_body').append("<div id='content' class='layer_normal layer_mail_print layer_pay_print popup'></div>");
            }
        }, {
            __instance__: null,

            getInstance: function(options) {
                var opt = (options == undefined) ? {} : options

                if(this.__instance__ === null) {
                    this.__instance__ = new this.prototype.constructor({
                        isPopup : (opt.isPopup == undefined) ? false : true
                    });
                }
                return this.__instance__;
            }
        });

        return ApprovalDefaultLayout;
    });
}).call(this);
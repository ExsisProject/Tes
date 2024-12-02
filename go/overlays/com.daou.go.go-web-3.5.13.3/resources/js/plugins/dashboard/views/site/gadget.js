(function(undefined) {

    define([
        "backbone",
        "app",
        "dashboard/models/gadget",
        "hgn!dashboard/templates/site/gadget",
        "i18n!nls/commons",
        "i18n!dashboard/nls/dashboard",
        "jquery.go-popup",
        "go-gadget"
     ],

     function(
        Backbone,
        GO,
        GadgetModel,
        GadgetTemplate,
        CommonLang,
        DashboardLang
     ) {

    	var GadgetView,
    		GADGET_NEW_MARK = 'gadget-not-saved',
    		GADGET_EDIT_WRAP = 'wrap_gadget_edit',
    		GADGET_HIGHLIGHT = 'gadget_design_border';

        /**
         * @name GadgetView
         * @description 가젯뷰
         *
         * @TODO go-gadget.js 로 통합
         */
        GadgetView = Backbone.View.extend({
            className: "go-gadget",
            editMode: false,

            langs: {},

            events: {
                "click .btn-refresh": "refreshContent",
                "click .btn-edit": "setEditMode",
                "click .btn-remove": "removeGadget",
                "click .btn-option-save": "saveGadget",
                "click .btn-option-cancel": "setNormalMode"
            },

            initialize: function(options) {
                this.options = options;
                
                if(!this.model) {
                    this.model = new GadgetModel();
                }

                this.editMode = false;
                this.spec = this.model.get('spec');
                this.locale = this.options.locale || 'ko';
                this.contextRoot = this.options.contextRoot || '/';
                this.canPersonalize = options.canPersonalize || false;

                this.contentProvider = new GO.gadget.ContentProvider(this.el, this.spec, {
                	"methodType": this.model.isNew() ? 'create' : 'update',
                    "locale": this.locale,
                    "contextRoot": this.contextRoot,
                    "canPersonalize": this.canPersonalize,
                    "langs": {
                        "refresh": {
                            "label": CommonLang["새로고침"],
                            "none": DashboardLang["새로고침 안함"],
                            "unit_minute": DashboardLang["분단위 시간 표시"],
                            "unit_hour": DashboardLang["시단위 시간 표시"]
                        },

                        "personalize": {
                            "label": DashboardLang["개인화"],
                            "editable": DashboardLang["편집 가능"],
                            "removable": DashboardLang["삭제 가능"]
                        },

                        "highlight": {
                            "label": DashboardLang["가젯 테두리"],
                            "highlight": DashboardLang["강조"]
                        },

                        "msg": {
                            "load_error": DashboardLang["가젯 로드 오류 메시지"]
                        }
                    }
                });

                updateNewGadgetMark.call(this);

                this.$el
                	.off()
                    .on("gadget:disable-editing", $.proxy(function(e) {
                        this.setNormalMode();
                        e.stopPropagation();
                    }, this))
                    .on('gadget:request-content', $.proxy(this.requestContent, this))
                    .data('view', this);
            },

            load: function() {
                this.render();

                if(this.spec.script && typeof this.spec.script === 'string') {
                    try {
                        var loadFunc = new Function( 'gadget', this.spec.script );
                        var gadgetPositionInfo = {
                        		"layout" : this.model.get("dashboard").boxCount+"_"+this.model.get("dashboard").layout,
                        		"column" : parseInt(this.model.get("boxNumber")) + 1
                        }
                        this.contentProvider.setOption($.extend({},$.parseJSON(this.model.get('options')),gadgetPositionInfo));
                        loadFunc({
                        	"load": $.proxy(function() {
                        		this.contentProvider.load.apply(this.contentProvider, arguments);
                        	}, this)
                        });

                    } catch(e) {
                        this.raiseError();
                    }
                }

                if(this.model.isNew()) {
                    this.$el.find('.btn-mgmt').show();
                    this.setEditMode();
                    this.$el.find('.go-gadget-content').hide();
                }
            },

            render: function() {
            	this.$el.append(GadgetTemplate({
                    "title": getGadgetHeaderTitleOnEdit.call(this),
                    "showConfigButton?": this.model.updatable(),
                    "showRemoveButton?": this.model.removable(),
                    "label": {
                        "setup": CommonLang["설정"],
                        "refresh": CommonLang["새로고침"],
                        "modify": CommonLang["편집"],
                        "remove": CommonLang["삭제"],
                        "save": CommonLang["저장"],
                        "cancel": CommonLang["취소"]
                    }
                }));
            },

            getGadgetId: function() {
            	return this.model.id;
            },

            getSpecName: function() {
            	return this.spec.name;
            },

            move: function(newBoxNumber, newBoxOrder) {
            	var self = this;

            	var isHtmlEditor = this.getSpecName().indexOf("HTML", 0) != -1 ? true : false;
            	if(isHtmlEditor && this.editMode == true){
            		this.setNormalMode();
            	}

            	deferred = $.Deferred();

            	this.model.savePosition(newBoxNumber, newBoxOrder).then(function(model) {

            		var dashboard = model.get('dashboard');
            		self.contentProvider.afterMoved(newBoxNumber + 1, dashboard.boxCount+"_"+dashboard.layout);
            		deferred.resolve(model);
            	}, function() {
            		deferred.reject();
            	});

            	return deferred;
            },

            setPosition: function(newBoxNumber, newBoxOrder) {
            	return this.model.setPosition(newBoxNumber, newBoxOrder);
            },

            getBoxNumber: function() {
            	return this.model.getBoxNumber();
            },

            renderContent: function(el, data) {
                this.contentProvider.renderContent(el, data);
                
                if(!this.editMode){
                	updateEditGadgetClass.call(this,false);
                }
                updateHighlightClass.call(this);
                // TODO a 태그에 data-bypass 속성 추가
                // GO 시스템에서 data-bypass가 아닌 a 태그는 Backbone 라우터가 해석하도록 되어 있기 때문에 필요함
                // GO 시스템의 data-bypass 메커니즘 제거할 때까지 임시로 추가
                $(el).find('a').attr('data-bypass', true);
            },

            requestContent: function(e) {
                var self = this;

                this.contentProvider.requestContent()
                    .progress(function(el) {
                        if(!$(el).find('.img_loader_large').length) {
                            self.setGadgetContent(makeGadgetContentLoadingImg());
                        }
                    })
                    .done(function(el, data) {
                        self.renderContent(el, data);
                    })
                    .fail(function(el) {
                        self.raiseError();
                    })
                    .always(function(el) {
                        $(el).find('.img_loader_large').remove();
                    });
            },

            setGadgetContent: function(content) {
                this.$el.find('.go-gadget-content')
                    .empty()
                    .append(content);

                return this;
            },

            setEditorRunner: function( obj ) {
                this.contentProvider.setEditorRunner( obj );
                return this;
            },

            setEditMode: function(e) {
                if(!!e) {
                    e.preventDefault();
                }

                if(!this.editMode) {
                    this.showConfigPane();
                    this.editMode = true;
                    updateEditGadgetClass.call(this,true);
                }
            },

            setNormalMode: function(e) {
                this.hideConfigPane();
                this.contentProvider.reloadConfig();
                this.editMode = false;
                updateEditGadgetClass.call(this,false);
            },

            refreshContent: function(e) {
                if(!this.editMode) {
                    this.requestContent();
                }
            },

            createGadget: function() {
            	var self = this,
             		defer = $.Deferred(),
             		gadget = this.model;

            	// 기본 옵션값을 서버로 전송한다.
            	gadget.save({"options": JSON.stringify(this.contentProvider.getOption())}, {
            		success: function(model) {
            			updateGadgetContent.call(self);
            			defer.resolve(self, model);
            		},
            		error: function() {
                    	$.goError(DashboardLang["가젯 설정저장 오류 메시지"]);
                    	defer.reject();
                    }
            	});

            	return defer;
            },

            saveGadget: function() {
                var self = this,
                	defer = $.Deferred(),
                	gadget = this.model,
                	isNew = gadget.isNew(),
                	actions = gadget.getActions(),
                    contentProvider = this.contentProvider,
                    formData = contentProvider.serializeForm(),
                    validateResult = contentProvider.validateForm(formData);

                if( validateResult === false ) {

                	if(gadget.isCompanyType() && GO.session('dashboardAdmin')) {
                		actions.updatable = (formData['editable'] === 'Y');
                		actions.removable = (formData['removable'] === 'Y');

                		gadget.set('actions', actions);
                	}

                	gadget.save({'options': JSON.stringify(formData)}, {
                        success: function( model ) {
                        	with(contentProvider) {
                        		setGadgetOptions($.parseJSON(model.get('options')));
                        		setTitle();
                        	}

                        	updateGadgetContent.call(self);
                        	self.setNormalMode();

                        	defer.resolve(self, model);
                        },
                        error: function() {
                        	$.goError(DashboardLang["가젯 설정저장 오류 메시지"]);
                        	defer.reject();
                        }
                    });

                } else {
                    this.$el.find('.error-msg-wrapper')
                        .empty()
                        .append(validateResult);

                    defer.reject();
                }

                return defer;
            },

            removeGadget: function(e) {
            	var self = this;

            	e.preventDefault();

            	if(!this.model.removable()) return;

                if(this.model.isNew()) {
                    this.remove();
                } else {
                    $.goCaution(
                        "'" + this.model.getSpec('name') + "'",
                        DashboardLang["가젯 삭제 메시지"],
                        function() {
                            self.model.destroy({
                                success: function() {
                                	self.remove();
                                },
                                error: function() {
                                	$.goError(DashboardLang["가젯 삭제 오류 메시지"]);
                                }
                            });
                        }
                    );
                }

            },

            showConfigPane: function() {
            	var $pane = this.$el.find('.go-gadget-config');
                if(!$pane.data('initalized')) {
                	this.contentProvider.renderConfig();
                    $pane.data('initalized', true);
                }

                this.contentProvider.loadEditor();
                $pane.show();
            },

            hideConfigPane: function() {
            	if(this.model.isNew()) {
                    this.$el.remove();
                } else {
                    this.$el.find('.go-gadget-config').hide();
                }

            },

            raiseError: function() {
                showGadgetErrorContent.call(this, this.$el.find('.go-gadget-content').get(0));
            },

            /**
             * gadget sdk에서 사용
             */
            getContentProvider: function() {
            	return this.contentProvider;
            }
        }, {
        	NEW_MARK: GADGET_NEW_MARK,

            create: function( options ) {
                var instance = new this.prototype.constructor({
                    "model": new GadgetModel(options.data || {}),
                    "locale": options.locale || 'ko',
                    "contextRoot": options.contextRoot || '/',
                    "canPersonalize": options.canPersonalize || false
                });

                if(!!options.appendTo) {
                    $(options.appendTo).append(instance.el);
                }

                if(!!options.editorRunner) {
                    instance.setEditorRunner(options.editorRunner);
                }

                return instance;
            }
        });

    	function updateGadgetContent() {

    		this.$el.data('view', this)
            	.find('.go-gadget-content')
            		.empty()
            		.show()
            		.end()
            	.find('.error-msg-wrapper')
            		.empty();

    		this.requestContent();
    		updateNewGadgetMark.call(this);
    	}

        function getGadgetHeaderTitleOnEdit() {
     		return this.model.getSpec('name');
    	}

        function updateNewGadgetMark() {
        	if(this.model.isNew()) {
            	this.$el.addClass(GADGET_NEW_MARK);
            } else {
            	this.$el.removeClass(GADGET_NEW_MARK);
            }
        }
        
        function updateEditGadgetClass(isAdd) {
        	if(isAdd){
        		this.$el.addClass(GADGET_EDIT_WRAP);
        	}else{
        		this.$el.removeClass(GADGET_EDIT_WRAP);
        	}
        }
        
        function updateHighlightClass() {
        	var options = JSON.parse(this.model.get("options"));
        	if(options.highlight == "Y"){
        		this.$el.addClass(GADGET_HIGHLIGHT);
        	}else{
        		this.$el.removeClass(GADGET_HIGHLIGHT);
        	}
        }

        function showGadgetErrorContent(target) {
            $(target)
                .empty()
                .append(makeGadgetContentLoadError.call(this));
        }

        function makeGadgetContentLoadError() {
        	var pageTemplate = this.contentProvider.pageTemplate;
        	return pageTemplate.loadError();
        }

        function makeGadgetContentLoadingImg() {
            return '<div class="img_loader_large" title="'+ CommonLang["잠시만 기다려주세요"] +'"></div>';
        }

        return GadgetView;
    });

})();
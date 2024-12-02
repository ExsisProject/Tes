(function() {
    
    define([
        "underscore", 
        "backbone",
        "survey/libs/util", 
        "helpers/form", 
        "survey/models/survey", 
        "survey/collections/queries", 
        "survey/views/query/edit", 
        "attach_file", 
        "hgn!survey/templates/query_list",
        "i18n!nls/commons",
        "i18n!survey/nls/survey",
        "file_upload",
        "jquery.ui", 
        "jquery.cookie",
        "jquery.go-popup",
        "jquery.go-preloader"
    ],
    
    function(
        _, 
        Backbone, 
        SurveyUtil, 
        FormHelper, 
        SurveyModel, 
        SurveyQueries, 
        SurveyQueryEditView, 
        AttachFilesView, 
        SurveyQueryEditorTpl, 
        CommonLang,
        SurveyLang, 
        FileUploader
    ) {
    	var BTN_EDIT_QUERY = '.btn-edit-query', 
    		BTN_COPY_QUERY = '.btn-copy-query', 
    		BTN_REMOVE_QUERY = '.btn-remove-query';
        
        var SurveyQueryEditor = Backbone.View.extend({
            tagName: "div", 
            className: "content_page survey_form go_renew", 
            
            lock: false, 
            
            events: {
                "click #btn-add-query": "_addQueryForm", 
                "click .btn-finished": "_complete", 
            	"click .btn-tempsave": "_tempsave", 
            	"click .btn-previous": "_goToPrev",
            	"keyup textarea[name=survey_guidance]" : "_checkLength"
            }, 
            
            initialize: function() {
                this.lock = false;
                
                if(!this.model) {
                    this.model = new SurveyModel();
                } 
            }, 
            
            render: function() {
                var self = this;
                
                this.model.fetch({
                    success: function(model) {
                    	renderContainer(self);
                    	renderQueryView(self);
                    }
                });
            }, 
            
            freeze: function() {
            	this.$el.find('.survey_list').sortable('disable');
                setPreviewViewLockStatus(true);
                this.lock = true;
                
                hookQueryPreviewEvent(BTN_EDIT_QUERY, 'convertToForm', this);
                hookQueryPreviewEvent(BTN_COPY_QUERY, 'copyQuery', this);
                hookQueryPreviewEvent(BTN_REMOVE_QUERY, 'removeQuery', this);
            }, 
            
            melt: function() {
            	$([BTN_EDIT_QUERY, BTN_COPY_QUERY, BTN_REMOVE_QUERY].join(',')).off('.preview-lock');
            	
            	this.$el.find('.survey_list').sortable('enable');
                setPreviewViewLockStatus(false);
                this.lock = false;
            }, 
            
            renderQueryPreview: function(model) {
                var view = SurveyQueryEditView.preview(model);
                this.attachQueryView(view);
            }, 
            
            renderQueryForm: function(model) {
                var view;
                if(typeof model === 'undefined') {
                    view = SurveyQueryEditView.create(this.model.id);
                } else {
                    view = SurveyQueryEditView.modify(model);
                }
                
                this.attachQueryView(view);
                this.freeze();
            }, 
            
            initSortable: function() {
            	var self = this;
            	
                this.$el.find('.survey_list')
                    .sortable({
                        items: '> li.sortable', 
                        axis: 'y', 
                        containment: 'parent', 
                        placeholder: 'go-gadget-placeholder', 
                        distance: 20, 
                        forceHelperSize: true, 
                        start: function(event, ui) {
                            ui.placeholder.height(ui.item.height());
                            ui.item
                                .addClass('drag_on')
                                .disableSelection();
                        }, 
                        
                        beforeStop: function(event, ui) {
                            var view = ui.item.data('view'), 
                                newSeq = 1;
                            
                            reqReorderQueries.call(self);
                        }, 
                        
                        stop: function(event, ui) {
                            ui.item
                                .removeClass('drag_on')
                                .enableSelection();
                        }
                    });
            }, 
            
            attachQueryView: function(view) {
                this.$el.find('li.action').before(view.el);
                
                // view.$el을 preview 모드와 form 모드가 공유하기 때문에 양쪽에 모두 걸어줘야 한다.
                view.onStart(_.bind(this._publishStartEdit, this));
                view.onComplete(_.bind(this._publishEndEdit, this));
                
                view.$el.on('copied', _.bind(function(e, copiedModel) {
                	this.renderQueryPreview(copiedModel);
                }, this));
                
                view.$el.on('removed', _.bind(function(e, removedModel) {
                	reqReorderQueries.call(this);
                }, this));
            },
            
            hasQuery: function() {
        		return this.$el.find('.query-item').length > 0;
            }, 
            
            _addQueryForm: function(e) {
            	saveEditingForm.call(this).done(_.bind(function() {
        			this.renderQueryForm();
        		}, this));
            },
            
            _complete: function(e) {
            	saveEditingForm.call(this).done(_.bind(function() {
                    $.goConfirm(
                        SurveyLang["설문 작성 알림"], 
                        SurveyLang["설문 작성 알림 설명"], 
                        $.proxy(function() {
                            if(this.hasQuery()) {
                                saveSurvey(this, 'progress');
                            } else {
                                $.goAlert(SurveyLang["등록 질문 없음 메시지"]);
                            }
                        }
                        , this)
                   );
        		}, this));
            }, 
            
            _tempsave: function(e) {
            	saveEditingForm.call(this).done(_.bind(function() {
            		saveSurvey(this, 'temp');
        		}, this));
            }, 
            
            _goToPrev: function(e) {
            	saveEditingForm.call(this).done(_.bind(function() {
            		var self = this;
                	$.goCaution(SurveyLang["이전단계이동질문"], SurveyLang["이전단계이동경고"], function() {
                		GO.router.navigate('survey/'+ self.model.id +'/edit', {trigger: true, pushState: true});
    				}, CommonLang["확인"]);
        		}, this));
            }, 
            
            _checkLength: function(e) {
            	var guidanceEl = $(e.currentTarget);
        		
            	if(guidanceEl && (guidanceEl.val().length > 1000)) {
                    FormHelper.printError(guidanceEl, SurveyUtil.getStringLengthError(0, 1000));
                    guidanceEl.val(guidanceEl.val().substr(0,1000));
                }else {
                	guidanceEl.siblings('.go_error').remove();
                	guidanceEl.removeClass("enter error");
                }
            },
            
            _publishStartEdit: function(e) {
                this.freeze();
            },
            
            _publishEndEdit: function(e) {
                this.melt();
            }, 
            
            _removeAttachFile: function(fileData) {
            	this.model.removeAttachFile(fileData);
            }
        });
                
        function reqReorderQueries() {
        	var num = 0, ids = [];
        	
        	this.$el.find('.query-item').each(function(i, el) {
        		var curView = $(el).data('view');
        		if(!curView.isRemoved()) {
        			ids.push(curView.model.id);
        			curView.updateSeq(++num);
        		}
        	});

        	if (ids.length == 0) {
        	    return;
            }

            $.ajax(GO.config('contextRoot') + 'api/survey/' + this.model.id + '/query/order', {
                type: 'PUT',
                data: JSON.stringify({"ids": ids}),
                dataType: 'json',
                contentType: 'application/json'
            });
        }
        
        function renderQueryView(view) {
        	view.model.getQueryList({
                success: function(collection) {
                    collection.each(view.renderQueryPreview, view);
                    view.initSortable();
                }
            });
        }
        
        function renderContainer(view) {
        	view.$el.append(SurveyQueryEditorTpl({
            	"guidance": view.model.get("guidance"), 
                "label": {
                    "quide_text": SurveyLang["시작 안내 문구"], 
                    "attach_file": SurveyLang["파일 첨부"], 
                    "add_query": SurveyLang["문항 추가"], 
                    "finished": SurveyLang["작성 완료"], 
                    "previous": SurveyLang["이전"],
                    "tempsave": SurveyLang["임시저장"],
                    "guide_desc" : SurveyLang["시작안내문구상세"]
                }
            }));
            
        	view.attachFileView = AttachFilesView.create(
        	    '#survey-attach-placeholder', 
        	    view.model.getAttaches(), 
        	    function(item) {
        	        return GO.config('contextRoot') + 'api/survey/' + view.model.id + '/download/' + item.id;
        	    },
        	    "edit"
        	);
        	view.attachFileView.done(function(attachView) {
        		attachView.$el.on('removedFile', function(e, option){view._removeAttachFile(option);});
        	});
//        	view.attachFileView.on('removedFile', _.bind(view._removeAttachFile, view));
            
            attachFileUploader(view);	
        }
        
        function saveSurvey(view, status) {
            var preloader = $.goPreloader();
            
            preloader.render();
            
        	view.model.save({
                "status": status, 
                "guidance": view.$el.find('textarea[name=survey_guidance]').val()
            }, {
                success: _.bind(function(model) {
                    GO.router.navigate('survey/list/my', {trigger: true, pushState: false});
                }, view)
            }).done(function(){
                preloader.release();
            });
        }
        
        function setPreviewViewLockStatus(bool) {
            $('.query-item').each(function(i, el) {
                var view = $(el).data('view');
                if(view.type !== 'preview') return;                 
                view[(bool ? 'un' : '') + 'delegateEvents'].call(view);
            });
        }
        
        function attachFileUploader(view) {
        	var instance = new FileUploader({
        		el: '.file-uploader', 
        		context_root: GO.config('contextRoot'), 
        		button_text: "<span class='buttonText'>" + SurveyLang["파일 첨부"] + "</span>", 
        		url : "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'), 
        	}).queue(function(e, data){
            }).start(function(e, data){
                if(!GO.config('attachFileUpload')){
                    $.goAlert(CommonLang['파일첨부용량초과']);
                    return false;
                }
        	}).progress(function(e, data){
        	}).success(function(e, resp) {
        		var fileData = {
        			"hostId": resp.data.hostId, 
        			"name": resp.data.fileName, 
        			"path": resp.data.filePath, 
        			"extension": resp.data.fileExt, 
        			"size": resp.data.fileSize,
        			"thumbnail" : resp.data.thumbnail
        		};
        		
        		if(GO.util.fileUploadErrorCheck(resp)){
        			var data = resp.data,
        				errorMessage = CommonLang['첨부파일 명'] + " : ' " + data.fileName + " '" + resp.message;
        			$.goSlideMessage(errorMessage, 'caution');
				}else{
                    if(GO.util.isFileSizeZero(resp)) {
                    	$.goAlert(GO.util.serverMessage(resp));
                    	return false;
                    }
					
					view.model.addAttachFile(fileData);
					view.attachFileView.done(function(attach){
						attach.attach(fileData);
					});
				}
        		
        		
        	}).complete(function(e, data){
            }).error(function(e, data){
            });
        	
        	return instance;
        }
        
        function saveEditingForm() {
        	if(this.lock) {
        		var queryFormView = $('.query-item-editing').data('view');
        		return queryFormView.saveQuery();
        	} else {
        		var defer = $.Deferred();
        		defer.resolve();
        		return defer;
        	}
        }
        
        function hookQueryPreviewEvent(seletorForBtn, callbackFn, context) {
    		$(seletorForBtn).on('click.preview-lock', function(e) {
        		var view = $(e.currentTarget).closest('li.query-item').data('view');
        		saveEditingForm.call(context).done(function() {
        			context.melt();
            		if(view[callbackFn]) view[callbackFn].call(view);
        		});
        	});
    	}
        
        return SurveyQueryEditor;
        
    });
    
})();
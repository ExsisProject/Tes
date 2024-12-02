(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        "i18n!approval/nls/approval",
        "hgn!admin/templates/appr_official_doc_sign",
        "file_upload"
    ],
    function(
        $,
        Backbone,
        App,
        commonLang,
        adminLang,
        approvalLang,
        formTmpl,
        FileUpload
    ) {

        var ApprFormView,
            lang = {
                'head_title' : '직인',
                'title' : commonLang['제목'],
                'sign_img' : '직인 이미지',
                'creation_success_msg' : adminLang['저장되었습니다. 양식 목록으로 이동합니다.'],
                'cancel_and_go_to_list_msg' : adminLang['취소하셨습니다. 이전 화면으로 이동합니다.'],
                'creation_fail_msg' : adminLang['저장할 수 없습니다.'],
                'upload_sign_img' : '직인 올리기',
                'state' : adminLang['사용여부'],
                'hidden' : adminLang['숨김'],
                'normal' : adminLang['정상'],
                'use' : approvalLang["사용"],
                'unuse' : approvalLang['미사용'],
                'name_invalid_length' : adminLang['제목은 20자까지 입력할 수 있습니다.'],
                'name_required' : adminLang['제목을 입력하세요.'],
                'duplicated_name' : adminLang['제목이 중복되었습니다.'],
                'modify' : commonLang['수정'],
                'select' : commonLang['선택'],
                'add' : commonLang['추가'],
                'delete' : commonLang['삭제'],
                'save' : commonLang['저장'],
                'cancel' : commonLang['취소'],
                '직인 등록 필수' : '직인에 사용할 이미지를 등록해주세요.'
            };


        /**
        *
        * 직인 뷰이다. 생성과 수정에 사용된다.
        *
        */
        OfficialDocSignView = Backbone.View.extend({
            
            el : '#layoutContent',
            model: null,

            initialize : function(options){
                this.model = options.model;
                this.initBindingEvents();
            },

            initBindingEvents: function() {
                this.$el.off('click', '#save_btn');
                this.$el.off('click', '#cancel_btn');
                this.$el.on('click', '#save_btn', $.proxy(this._onSaveClicked, this));
                this.$el.on('click', '#cancel_btn', $.proxy(this._onCancelClicked, this));
            },
            
            render : function() {
                this.$el.html(formTmpl(this._makeTmplData(this.model)));
                this.initSignUpload();
            },
            
            _makeTmplData: function(model) {
                var default_thumbnail_path = GO.contextRoot + "resources/images/admin/no_stamp.png";
                var hasPath = !_.isEmpty(model.get('path'));
                model.set('hasPath', hasPath);
                if(!hasPath){
                	model.set('defaultPath', default_thumbnail_path);
                }
            	
                var wrappedState = function() {
                    return function(text) {
                        return text.replace('value="' + this.state + '"', 'value="' + this.state + '" checked');
                    };
                };
                
                var data = {
                    lang : lang,
                    wrappedState: wrappedState
                };
                
                return _.extend(data, model.toJSON());
            },
            
            initSignUpload : function(){
                var _this = this,
                    options = {
                        el : "#swfupload-control",
                        context_root : GO.contextRoot ,
                        button_text : "<span class='buttonText' style='font-size : 12px'>"+lang['upload_sign_img']+"</span>",
                        button_style : "color:#ffffff; font-size:12px; text-align:center;",
                        button_height : 22,
                        button_width : 80,
                        progressBarUse : false,
                        url : "ad/api/file?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
                    };
                
                (new FileUpload(options))
                .queue(function(e, data){
                    
                })
                .start(function(e, data){

                })
                .progress(function(e, data){
                    
                })
                .success(function(e, serverData, fileItemEl){
                    if(GO.util.fileUploadErrorCheck(serverData)){
                        $.goMessage(GO.util.serverMessage(serverData));
                        return false;
                    }
                    
                    var data = serverData.data,
                        fileName = data.fileName,
                        filePath = data.filePath,
                        hostId = data.hostId,
                        thumbnail = data.thumbnail,
                        fileExt = data.fileExt.toLowerCase(),
                        re =  new RegExp("(jpeg|jpg|gif|png|bmp)","gi");
                    var test = re.test(fileExt);
                    if(test){
                        $("#thumbnail_image")
                            .attr("src",thumbnail)
                            .attr("data-filepath",filePath)
                            .attr("data-filename",fileName)
                            .attr("host-id", hostId);
                        _this.model.set('hasPath', true);
                    }else{
                        $.goMessage(commonLang["포멧 경고"]);
                    }
                })
                .complete(function(e, data){
                    console.info(data);
                })
                .error(function(e, data){
                    console.info(data);
                });
            },
            
            _onSaveClicked: function() {
            	var self = this;
                this.model.set('name', this.$el.find('input[name=name]').val());
                this.model.set('state', this.$el.find('input[name=state]:checked').val());
                if (!this.model.isValid()) {
                	if(this.model.validationError == 'name_invalid_length' || this.model.validationError == 'name_required'){
                        $.goMessage(lang[this.model.validationError]);
                        this.$el.find(':input[name=name]').select();
                	}else{
                        $.goMessage(lang[this.model.validationError]);                		
                	}
                    return false;
                }
                var $thumbnail = $("#thumbnail_image");
                if(!this.model.get('hasPath') && this.model.isNew()){
                	$.goMessage(lang['직인 등록 필수']);
                	return false;
                }
                thumbnail_image = {
                    filePath : $thumbnail.attr("data-filepath"),
                    fileName : $thumbnail.attr("data-filename"),
                    hostId : $thumbnail.attr("host-id")
                };
                
                if(thumbnail_image["filePath"] == undefined && thumbnail_image["fileName"] == undefined){
                    thumbnail_image = null;
                    
                }
                
                this.model.set('sign', thumbnail_image);
                
                if (this.requestProcessing) {
                    return;
                } else {
                    this.requestProcessing = true;
                }
                this.model.save({}, {
                	url : GO.contextRoot + 'ad/api/approval/manage/official/sign/',
                    success: $.proxy(function(model, resp, opts) {
                            $.goAlert(lang['creation_success_msg'], "", this._goToFormListView);
                        }, this),
                        
                    error: function(model, resp, opts) {
                        var message = lang['creation_fail_msg'];
                        if ( _.contains(resp['responseJSON']['name'], 'bad.request') ) {
                            message = lang['duplicated_name'];
                        }
                        
                        $.goMessage(message);
                        return false;
                    },
                    
                    complete: function() {
                        self.requestProcessing = false;
                    }
                });
            },
            
            _onCancelClicked: function() {
                $.goAlert(lang['cancel_and_go_to_list_msg'], "", $.proxy(this._goToFormListView, this));
                return false;
            },

            _goToFormListView: function() {
                GO.router.navigate('approval/manage/official', {trigger: true});
                return false;
            }
        });
        
        return OfficialDocSignView;
    });
}).call(this);
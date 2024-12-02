// 결재이력
define([
        // 필수
        "jquery",
        "backbone",
        "app",

        "views/mobile/header_toolbar",

        "hgn!approval/templates/mobile/document/m_appr_form_select",
        "i18n!nls/commons",
        "i18n!approval/nls/approval"
    ],

    function(
        $,
        Backbone,
        App,

        HeaderToolbarView,

        ApprFormListTbl,
        commonLang,
        approvalLang
    ) {

        var DrafterDeptFolderCollection = Backbone.Collection.extend({
            url: function(){
                return '/api/approval/drafterdeptfolder';
            }
        });

        var DocumentFormModel = Backbone.Collection.extend({
            url: function() {
                return '/api/approval/apprform/tree/mobile';
            }
        });

        var ApprFlowView = Backbone.View.extend({

            events : {
                "click #apprFormUl a" : "_selectForm"
            },
            initialize : function(options){
                this.options = options || {};
                this.toolBarData = this.options.toolBarData;
                this.release();
                this.formModel = new DocumentFormModel();
                this.drafterDeptFolderCol = new DrafterDeptFolderCollection();

                this.formModel.bind('reset', this._renderFormList, this);
            },

            render : function() {
                var self = this;
                this.headerToolbarView = HeaderToolbarView;
                this.headerToolbarView.render(this.toolBarData);
                var defer = $.Deferred();
                App.util.preloader(defer);
                $.when(
                    this.formModel.fetch({reset : true}),
                    this.drafterDeptFolderCol.fetch({
                        async:false,
                        success : function(model) {
                            if(model.length < 1) return;
                            self.drafterDeptFolderInfos = model.toJSON();
                            self.deptId = self.drafterDeptFolderInfos[0].deptId;
                        }
                    })
                ).done($.proxy(function(){
                    defer.resolve(this);
                },this));
               // App.util.preloader(this.formModel.fetch({reset : true}));
                return this;
            },
            _renderFormList: function(formList) {
                this.$el.html(ApprFormListTbl({
                    data : formList.toJSON(),
                    empty_msg: approvalLang['등록된 양식이 없습니다.']
                }));
            },
            _selectForm : function(e) {
                if(!this.deptId) {
                    GO.util.toastMessage(approvalLang['소속된 부서가 없습니다']);
                    return;
                }
                var formId = $(e.currentTarget).attr('data-formid');
                GO.router.navigate("/approval/document/new/"+this.deptId+"/"+formId, {trigger: true});
            },
            release: function() {
                this.$el.off();
                this.$el.empty();
            }
        });

        return ApprFlowView;
    });
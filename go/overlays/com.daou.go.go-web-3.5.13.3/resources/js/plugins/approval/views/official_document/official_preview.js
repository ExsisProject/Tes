define([
        "backbone",
        "app",
        "when",
        "approval/models/official_preview",
        "i18n!nls/commons",
        "i18n!approval/nls/approval",
        "hgn!approval/templates/official_document/official_preview",

        'formutil',
        "jquery.fancybox",
        "jquery.go-popup",
        "jquery.ui",
        "json",
        "json2",
        "jquery.placeholder"
    ],
    function (Backbone,
              App,
              when,
              OfficialPreviewModel,
              commonLang,
              approvalLang,
              MainTpl) {

        var lang = {
            "인쇄 미리보기": commonLang['인쇄 미리보기'],
            "인쇄": commonLang['인쇄']
        };

        var ToolbarTpl = ['<div id="toolbar" class="header_print">',
            '<h1 class="approval_print_title">{{lang.인쇄 미리보기}}',
            '<span class="btn_wrap">',
            '<span class="btn_minor_s" id="printDoc" title="{{lang.인쇄}}">',
            '<span class="ic_print"></span><span class="txt">{{lang.인쇄}}</span>',
            '</span>',
            '</span>',
            '</h1>',
            '</div>'].join('');

        var MainView = Backbone.View.extend({
            el: '#content',
            htmlContent: null,
            initialize: function (options) {
                this.options = options || {};
                this.docId = this.options.docId;
                //opener로부터 데이터를 가져온후 폐기한다.
                if (!GO.util.store.get('official-preview-data')) {
                    GO.util.store.set('official-preview-data', window.opener.GO.util.store.get('official-preview-data'));
                    window.opener.GO.util.store.set('official-preview-data', null);
                }
                this.model = new OfficialPreviewModel(GO.util.store.get('official-preview-data'));
            },

            render: function () {
                when(this.fetchModel())
                    .then(_.bind(function renderMe() {
                        this.$el.html(MainTpl({
                            lang: lang
                        }));
                        this.$el.prepend(Hogan.compile(ToolbarTpl).render({lang: lang})); //content보다 상위에 toolbar가 위치하는 마크업이므로 parent에 render한다.
                        this.docContents = $('#document_content');
                        var content = GO.util.escapeXssFromHtml(this.htmlContent);
                        this.docContents.html(content);
                        // GO-23996 공문서 인쇄시 보존년한 0년 처리
                        this.showPreserveYears();

                        $("body").addClass("print");
                        if (GO.util.isIE8()) {
                            $("body").css("min-width", "300px");
                        }
                        this.unbindEvent();
                        this.bindEvent();
                    }, this))
                    .otherwise(function printError(err) {
                        console.log(err.stack);
                    });
            },

            unbindEvent: function () {
                this.$el.parent().off("click", "#printDoc");
            },
            bindEvent: function () {
                this.$el.parent().on("click", "#printDoc", $.proxy(this.printDoc, this));
            },

            printDoc: function () {
                GO.util.print(this.$el);
            },

            prepend: function (view, selector) {
                this.$(selector).prepend(view.render().el);
            },

            setContent: function (htmlContent) {
                this.htmlContent = htmlContent;
            },

            // DOCUSTOM-8823 공문서 인쇄시 보존년한 0년 처리
            showPreserveYears: function () {
                var returnValue = '',
                    docDuration = $(content).find('span[data-id=preserveDuration]');

                if (docDuration.text() == '0년') {
                    returnValue = docDuration.text('영구');
                } else {
                    returnValue = docDuration.text();
                }
                return returnValue;
            },

            // DOCUSTOM-8823 공문서 인쇄시 보존년한 0년 처리
            showPreserveYears: function () {
                var returnValue = '',
                    docDuration = $(content).find('span[data-id=preserveDuration]');

                if (docDuration.text() == '0년') {
                    returnValue = docDuration.text('영구');
                } else {
                    returnValue = docDuration.text();
                }
                return returnValue;
            },

            fetchModel: function () {
                var self = this;
                var defer = when.defer();
                $.go(this.model.url(), JSON.stringify(this.model.toJSON()), {
                    qryType: 'PUT',
                    contentType: 'application/json',
                    responseFn: function (rs) {
                        if (rs.code == 200) {
                            self.setContent(rs.data);
                            defer.resolve();
                        } else {
                            defer.reject();
                        }
                    },
                    error: function (rs) {
                        var responseObj = JSON.parse(rs.responseText);
                        if (responseObj.message) {
                            $.goError(responseObj.message);
                        }
                        defer.reject();
                    }
                });

                return defer.promise;
            }
        });

        return MainView;

    });

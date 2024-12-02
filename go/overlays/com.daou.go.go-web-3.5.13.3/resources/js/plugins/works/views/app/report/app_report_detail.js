define('works/views/app/report/app_report_detail', function (require) {
    var commonLang = require("i18n!nls/commons");
    var worksLang = require("i18n!works/nls/works");
    var adminLang = require("i18n!admin/nls/admin");
    var taskLang = require("i18n!task/nls/task");
    var constants = require("works/components/report/constants");

    var lang = {
        "저장": commonLang["저장"],
        "삭제": commonLang["삭제"],
        "완료": commonLang["완료"],
        "차트": worksLang["차트"],
        "카드": worksLang["카드"],
        "데이터": worksLang["데이터"],
        "텍스트": commonLang["텍스트"],
        "사진": commonLang["사진"],
        "사용자": commonLang["사용자"],
        "부서": adminLang["부서"],
        "직위": adminLang["직위"],
        "직급": adminLang["직급"],
        "직책": adminLang["직책"],
        "사용자그룹": adminLang["사용자그룹"],
        "추가": commonLang["추가"],
        "공유설정": taskLang["공유설정"],
        "앱 사용자 전체": worksLang["앱 사용자 전체"],
        "직접선택": taskLang["직접선택"],
        "새 리포트": worksLang["새 리포트"],
        "PDF 내보내기": worksLang["PDF 내보내기"],
        "메일로 보내기": worksLang["메일로 보내기"],
        "리포트 공유 설정 안내문구": worksLang["리포트 공유 설정 안내문구"],
        "리포트명": worksLang["리포트명"],
        "리포트의 명칭을 변경합니다": worksLang["리포트의 명칭을 변경합니다"],
        "리포트": worksLang["리포트"],
        "설정": commonLang["설정"],
        "닫기": commonLang["닫기"],
        "공유": taskLang["공유"],
        "수정완료" : commonLang["수정완료"],
        "편집" : commonLang["편집"],
        "아이템 없을 경우 안내문구": worksLang["리포트 아이템 없을 경우 안내문구"]
    };

    var GridManger = require("works/views/app/report/works_report_gridstack_manager");
    var BaseAppletView = require('works/views/app/base_applet');
    var HeaderTemplate = require("hgn!works/components/report/template/editor_header");
    var SettingContentTemplate = require("hgn!works/components/report/template/report_setting_content");
    var SettingHeaderTemplate = require("hgn!works/components/report/template/report_setting_header");
    var BackdropView = require('components/backdrop/backdrop');
    var CircleView = require("views/circle");

    var Report = require('works/models/report');
    var Fields = require("works/collections/fields");
    var html2canvas = require("html2canvas");
    var jspdf = require("jspdf");

    return BaseAppletView.extend({
        events: {
            "click a[el-setting]": "_onClickSetting",
            "click a[el-save]": "_onClickSave",
            "click a[el-output]": "_onClickOutput",
            "click li[el-pdf-export], a[el-pdf-export]": "_onClickExportPdf",
            "click li[el-email-export], a[el-email-export]": "_onClickExportEmail",
            "click li[el-delete_report]": "_onClickDeleteReport",
            "click li[el-add-item]" : "_onClickAddItem",
            "click span[el-title-edit]" : "_onClickTitleEdit",
            "click span[el-title-save]" : "_onClickTitleSave",
        },

        initialize: function (options) {
            BaseAppletView.prototype.initialize.apply(this, arguments);
            this.reportId = options.reportId;
            this.isCrete = options.reportId ? false : true;

            this.fields = new Fields([], {
                appletId: this.appletId,
                includeProperty: true,
            });

            this.report = new Report({
                appletId: this.appletId,
                reportId: this.reportId
            });
        },

        render: function () {
            if (this.isCrete) {
                $.when(
                    BaseAppletView.prototype.render.apply(this, arguments),
                    this.accessibleForms.length > 0 ? this.fields.fetch() : this._renderNoExistForm(this.$el)
                ).then($.proxy(function () {
                    this.report.set('title', worksLang["새 리포트"]);
                    this.report.set('shareModel', {'public': false});
                    this.report.set('shared', false);
                    this._rendGrid();
                }, this));
            } else {
                $.when(
                    BaseAppletView.prototype.render.apply(this, arguments),
                    this.accessibleForms.length > 0 ? this.fields.fetch() : this._renderNoExistForm(this.$el),
                    this.report.fetch()
                ).then($.proxy(function () {
                    this._rendGrid();
                }, this)).fail($.proxy(function (err) {
                    this._renderNoExistReport(this.$el);
                }, this));
            }
        },

        _rendGrid: function () {
            if (this.accessibleForms.length < 1) {
                return;
            }
            this.isAdmin = this.baseConfigModel.isAdmin(GO.session('id'));

            this.$el.append(HeaderTemplate({
                'lang': lang,
                'title': this.report.get('title'),
                'itemSize': constants.ITEM_SIZE
            }));

            this.gridManger = new GridManger({
                appletId: this.appletId,
                reportId: this.reportId,
                fields: this.fields,
                report: this.report
            });

            this.gridManger.render();

            if (!this.report.get('writer') && !this.isCrete) {
                $('div.report_tool_bar').hide();
                //$('a[el-output]').hide();
                $('a[el-save]').hide();
                $('a[el-setting]').hide();
                $('span[el-title-edit]').hide();
                this.gridManger.disable();
            }

            var self = this;
            $(window).scroll(function (event) {
                var height = $(this).scrollTop();
                if (height > 94) {
                    self.$el.find('.report_header').addClass('fix_header');
                    return;
                }
                self.$el.find('.report_header').removeClass('fix_header');
            });

            //디자인 요청
            this.$el.closest('.go_content').addClass('go_works_report');
        },

        _onClickSetting: function () {
            var self = this;
            var buttons = [{
                btype: 'confirm',
                btext: lang['저장'],
                autoclose: false,
                callback: function (popupEl) {
                    self.report.set('shared', $('#isShare').is(":checked"));
                    self.report.set('shareModel', {
                        'public': 'public' == $('input[name=shareType]:checked').val(),
                        'circle': self.circleView.getData()
                    });

                    self.gridManger.saveEnabled();
                    self._onClickSave();
                    popupEl.close();
                }
            }];

            buttons.push({
                'btext': commonLang["취소"],
                'btype': 'cancel'
            });
            $.goPopup({
                pclass: 'layer_normal layer_report_set go_renew',
                headerHtml: SettingHeaderTemplate({lang: lang}),
                contents: SettingContentTemplate({
                    lang: lang,
                    isPublic: this.report.get('shareModel').public,
                    isShared: this.report.get('shared'),
                    title: this.report.get('title'),
                }),
                buttons: buttons,
            });

            $('#isShare').on('change', function (e) {
                if ($(e.target).is(":checked")) {
                    $('#shareArea').show();
                    if ($('input[name=shareType]:checked').val() == "custom") {
                        $('#circleArea').show();
                    } else {
                        $('#circleArea').hide();
                    }
                } else {
                    $('#shareArea').hide();
                    $('#circleArea').hide();
                }
            });

            $('input[name=shareType]').on('change', function (e) {
                if ($(e.target).val() == "custom") {
                    $('#circleArea').show();
                } else {
                    $('#circleArea').hide();
                }
            });

            $('#isShare').trigger('change');

            this.circleView = new CircleView({
                selector: '#accessUser',
                isAdmin: false,
                isWriter: true,
                zIndex: 999,
                circleJSON: this.report.get('shareModel').circle,
                nodeTypes: ['user', 'department', 'position', 'grade', 'duty', 'usergroup']
            });
            this.circleView.render();
        },

        _onClickSave: function () {
            var self = this;
            if (this.gridManger.isSaveDisabled()) {
                return;
            }

            this.gridManger.save().done(function (response) {
                if (!self.reportId) {
                    GO.router.navigate('works/applet/' + self.appletId + '/report/' + response.data, true);
                }
            });
        },

        _onClickOutput: function (event) {
            this.backdropView = new BackdropView();
            this.backdropView.backdropToggleEl = $('#output_selector');
            if (this.backdropView.backdropToggleEl.is(":visible")) {
                this.backdropView.backdropToggleEl.hide();
                return;
            }
            this.backdropView.linkBackdrop($(event.currentTarget));
        },

        _onClickExportPdf: function () {
            var self = this;
            this._createReportPdf()
                .then(function (pdf) {
                    var saveName = self.report.get('title') || 'Report'
                    pdf.save(saveName + ".pdf");
                });
        },

        _createReportPdf: function () {
            return html2canvas(document.querySelector(".report_body")).then(function (canvas) {
                var pdf = new jspdf.jsPDF('p', 'mm', 'a4');
                var yMargin = 6;
                var imgWidth = pdf.internal.pageSize.getWidth();
                var pageHeight = pdf.internal.pageSize.getHeight();
                var innerPageWidth = imgWidth;
                var innerPageHeight = pageHeight - yMargin;
                var pxFullHeight = canvas.height;
                var pxPageHeight = Math.floor(canvas.width * (pageHeight / imgWidth));
                var nPages = Math.ceil(pxFullHeight / pxPageHeight);

                var pageHeight = innerPageHeight;
                var pageCanvas = document.createElement('canvas');
                var pageCtx = pageCanvas.getContext('2d');
                pageCanvas.width = canvas.width;
                pageCanvas.height = pxPageHeight;

                for (var page = 0; page < nPages; page++) {
                    var yPosition = 0;
                    if (page == (nPages - 1) && (pxFullHeight % pxPageHeight) != 0) {
                        pageCanvas.height = pxFullHeight % pxPageHeight;
                        pageHeight = (pageCanvas.height * innerPageWidth) / pageCanvas.width;
                    }
                    if (page > 0) {
                        yPosition = yMargin;
                        pdf.addPage();
                    }
                    var w = pageCanvas.width;
                    var h = pageCanvas.height;
                    pageCtx.fillStyle = 'white';
                    pageCtx.fillRect(0, 0, w, h);
                    pageCtx.drawImage(canvas, 0, page * pxPageHeight, w, h, 0, 0, w, h);
                    var imgData = pageCanvas.toDataURL('image/png');
                    pdf.addImage(imgData, 'png', 0, yPosition, innerPageWidth, pageHeight);
                }
                return pdf;
            });
        },

        _setTitle: function (title) {
            $('span.tit').empty();
            $('span.tit').append(title);
        },

        _onClickExportEmail: function () {
            var self = this;
            if (this.reportId) {
                this._exportReportMailTemplate(this.reportId);
                return;
            }
            this.gridManger.save().done(function (response) {
                var newReportId = response.data;
                self._exportReportMailTemplate(newReportId);
                GO.router.navigate('works/applet/' + self.appletId + '/report/' + newReportId, true);
            });
        },

        _onClickDeleteReport: function () {
            var self = this;
            $.goConfirm(commonLang['삭제하시겠습니까?'], '', function () {
                var url = GO.contextRoot + 'api/works/applet/' + self.appletId + '/report/' + self.reportId;
                var promise = $.ajax({
                    contentType: "application/json",
                    dataType: 'json',
                    type: 'DELETE',
                    url: url
                });

                promise.done(function (response) {
                    $.goSlideMessage(worksLang['삭제에 성공했습니다']);
                    $('a[el-create]').trigger("refresh");
                });
                promise.fail(function (xhr, status, err) {
                    var responseObj = JSON.parse(xhr.responseText);
                    if (!_.isUndefined(responseObj) && responseObj.message) {
                        $.goAlert(responseObj.message);
                    } else {
                        $.goAlert(commonLang["500 오류페이지 타이틀"]);
                    }
                });

                GO.router.navigate('works/applet/' + self.appletId + '/reports', true);
            });
        },

        _exportReportMailTemplate: function (reportId) {
            var self = this;
            this._createReportPdf()
                .then(function (pdf) {
                    var formData = new FormData();
                    formData.append('file', pdf.output('blob'));
                    var url = GO.contextRoot + 'api/works/applet/' + self.appletId + '/report/' + reportId + '/mail';
                    var promise = $.ajax({
                        contentType: false,
                        processData: false,
                        data: formData,
                        type: 'POST',
                        url: url
                    });
                    promise.done(function (response) {
                        var data = response.data;
                        var attaches = _.map(data.attachModels, function (attachFile) {
                            var attachString = attachFile.path + ":"
                                + attachFile.name + ":"
                                + attachFile.size + ":"
                                + attachFile.id + "\n";
                            return attachString;
                        });
                        self._openEmailPopup(data.subject, data.body, attaches);
                    });
                });
        },

        _openEmailPopup: function (subject, content, attachModels) {
            var windowName = Math.floor(Math.random() * 10000);
            var windowFeatures = "scrollbars=yes,resizable=yes,width=1280,height=760";
            window.open("", windowName, windowFeatures);

            var form = document.createElement("form");
            var hiddenData = document.createElement("input");
            var param = {};
            var attachFiles = [];
            _.each(attachModels, function (attr) {
                attachFiles.push(attr);
            });
            param.subject = subject
            param.content = content;
            param.attachFiles = attachFiles;
            hiddenData.type = "hidden";
            hiddenData.name = "data";
            hiddenData.value = JSON.stringify(param);

            form.appendChild(hiddenData);
            form.action = GO.contextRoot + "app/mail/popup/process";
            form.method = "post";
            form.target = windowName;
            document.body.appendChild(form);
            form.submit();
            $('#subject').val(subject);
            document.body.removeChild(form);
        },

        _onClickAddItem: function (evt) {
            var type = $(evt.target).closest('[grid-type]').attr('grid-type');
            this.gridManger.addItem(type);
        },

        _onClickTitleEdit: function () {
            this.$el.find('#title-view-wrap').hide();
            this.$el.find('#title-edit-wrap').show();
        },

        _onClickTitleSave: function () {
            var title = this.$el.find('#report_edit_title').val();
            if (title.length < 1 || title.length > 20) {
                $.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."], {arg1: 1, arg2: 20}),
                    this.$el.find('#report_edit_title'), false, true);
                return;
            }

            this.report.set('title', title);
            this.$el.find('#report_view_title').text(title);

            this.$el.find('#title-view-wrap').show();
            this.$el.find('#title-edit-wrap').hide();
            this.gridManger.saveEnabled();
        }
    });
});

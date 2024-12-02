define('works/views/app/report/report_item_text', function (require) {
    var ReportItem = require('works/views/app/report/report_item');
    var ReportTextView = require("works/views/app/report/report_text_view");
    var WorksEditor = require("works/views/app/report/report_text_editor");

    return ReportItem.extend({
        initialize: function (options) {
            ReportItem.prototype.initialize.call(this, options);
            this.textView = null;
            this.editMode = false;
            this.type = 'text';
            this.appletId = options.appletId;
            this.content = options.content || '';
            this.contentWrap = $(options.contentWrap);
            this.render();
        },

        render: function () {
            this._initTextView();
        },

        renderAfter: function () {
            DEXT5.config.ToolBar1 = 1;
            DEXT5.config.StatusBarItem = "design";
            $("#editor").goWebEditor({
                contextRoot: GO.config("contextRoot"),
                lang: GO.session('locale'),
                editorValue: this.textView.getContent(),
                onLoad: function () {
                    $("#editor").trigger("edit:complete");
                }
            });
        },

        reload_setting: function () {
            if (this.editMode && GO.Editor.getInstance("editor")) {
                this.content = GO.Editor.getInstance("editor").getContent();
            }
            this._initTextView();
            return true;
        },

        reload_filter: function () {

        },

        getSettingTmpl: function () {
            this.editMode = true;
            var content = this.textView.getContent();
            var worksEditor = new WorksEditor({content: content || ''});
            return worksEditor.render().el;
        },

        getFilterTmpl: function () {
            return {};
        },

        _initTextView: function () {
            this.editMode = false;
            this.textView = new ReportTextView({
                content: this.content,
                rid: this.rid
            });
            this.contentWrap.empty();
            this.contentWrap.append(this.textView.el);
            this.textView.render();
        },

        getRid: function () {
            if (this.rid) {
                return this.rid;
            }
        },

        toJSON: function () {
            var content = this.content || '';
            content = content.split('line-height: 150%').join('line-height: 1.5');
            return {
                type: this.type,
                content: content
            };
        },

        toObject: function (item) {
            if (item && item.data) {
                this.content = item.data.content;
            }
        }
    })
})


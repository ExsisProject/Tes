define('docs/views/mobile/docs_reject', function (require) {

    var Backbone = require('backbone');

    var RejectTemplate = require('hgn!docs/templates/mobile/docs_reject');
    var approvalLang = require("i18n!approval/nls/approval");
    var docsLang = require("i18n!docs/nls/docs");
    var HeaderToolbarView = require("views/mobile/header_toolbar");

    var lang = {
        "의견을 작성해 주세요" : approvalLang['의견을 작성해 주세요']
    };

    return Backbone.View.extend({

        initialize: function (options) {
            this.options = options;
            this.docsId = this.options.docsId;
            GO.EventEmitter.off("trigger-action");
            GO.EventEmitter.on('trigger-action','docs-doReject', this.doReject, this);
        },


        render: function () {

            $(".content_page").html(RejectTemplate({
                lang : lang
            }));
            this._renderHeader();
            return this;
        },

        _renderHeader: function (){
            var toolBarData = {
                isClose : true,
                actionMenu : [{
                    id : "docs-doReject",
                    text :  approvalLang['반려'],
                    triggerFunc : "docs-doReject"
                }]
            };
            HeaderToolbarView.render(toolBarData);
        },

        doReject : function(){
            var model = new Backbone.Model();
            model.id = this.docsId;
            model.url = GO.config('contextRoot') + 'api/docs/' + this.docsId + '/rejected';
            model.set("str" , $("#textarea-desc").val());

            if(this.validate(model) == false){
                return;
            }

            model.save(null, {
                type : 'PUT',
                contentType: 'application/json',
                success : function() {
                    GO.router.navigate("docs/folder/approvewaiting", true);
                }
            });
        },

        validate : function(docs) {
            if (docs.get("str").length > 64 || docs.get("str").length < 2) {
                var errorMsg = GO.i18n(docsLang["0은 0자이상 0자이하 입력해야 합니다."], {"arg0":docsLang["반려의견"], "arg1":"2","arg2":"64"});
                $.goError(errorMsg, $("#textarea-desc"), false, true);
                return false;
            }
            return true;
        }
    });
});
define('docs/views/docs_reply', function(require) {

    var Backbone = require('backbone');
    
    var replyTmpl = require("hgn!docs/templates/docs_reply");
    var tplDocsReaderList = require("hgn!docs/templates/docs_reader_list");
    
    var CommentView = require("comment");

    var commonLang = require('i18n!nls/commons');
    
    require("jquery.go-grid")

    var DocsReplyView =  Backbone.View.extend({

        events: {
            'click a#listDocsReader' : 'showPostReader'
        },

        initialize: function (options) {
            this.options = options;
            this.docsModel = this.options.docsModel;
        },

        render: function () {

            this.$el.html(replyTmpl({
                replyCnt : this.docsModel.getCommentCount(),
                readCnt : this.docsModel.getReadCount(),
                lang : {
                	"댓글" : commonLang["댓글"],
                	"조회" : commonLang["조회"]
                }
            }));

            this.commentView = CommentView.init({
                el : this.$el.find("#replyArea"),
                typeUrl : "docs/docsInfo",
                typeId :  this.docsModel.getDocsInfoId(),
                isPrintMode : false,
                rootId : this.docsModel.id,
                rootUrl : "docs",
                isReply : true,
                isWritable : true
            });
            this.commentView.render();
            this.commentView.fetchComments(false);
            var self = this;
            this.commentView.$el.on("comment:change", function(e, type, count) {
                self.$('#replyCnt').text(count);
            });
            return this;
        },

        refreshReadCount : function(count){
            $('#listDocsReader').empty().append(count);
        },

        isCurrentLayer : function(e) {
            return $(e.currentTarget).hasClass("on");
        },

        showPostReader : function(e) {
            if (this.isCurrentLayer(e)) return;

            var popup = null,
                tplPopupHeader = ['<ul class="tab_nav tab_nav2"><li class="first on"><span>','조회',
                    '</span></li></ul>'];

            popup = $.goPopup({
                pclass: 'layer_normal layer_reader',
                headerHtml : tplPopupHeader.join(''),
                contents: tplDocsReaderList(),
                buttons : [{
                    btype : 'confirm',
                    btext : commonLang['확인']
                }]
            });

            $.goGrid({
                el : '#readerList',
                url : GO.contextRoot + 'api/docs/docsInfo/'+this.docsModel.getDocsInfoId()+'/reader',
                displayLength : 5,
                displayLengthSelect : false,
                emptyMessage : '',
                numbersShowPages : 5,
                method : 'GET',
                defaultSorting : [],
                sDom : 'rt<"tool_bar"<"critical custom_bottom">p>',
                bProcessing : false,
                columns :  [{
                    "mData" : null, "bSortable": false, "sClass" : "align_l", "fnRender" : function(obj) {
                        var data = obj.aData,
                            returnArr =  [data.reader.name,' ',data.reader.positionName, '&nbsp;<span class="date">', GO.util.basicDate(data.updatedAt), '</span>'];
                        return returnArr.join('');
                    }
                }, {
                    "mData" : null, "sWidth" : "80px","sClass" : "align_l", "bSortable": false, "fnRender" : function(obj) {
                        var data = obj.aData;
                        return ['<span class="plus_num">',commonLang['조회'], data.count,'</span>&nbsp;'].join('');
                    }
                }],
                fnDrawCallback : function(tables, oSettings, listParams) {
                    var toolBar = popup.find('.tool_bar');
                    if(oSettings._iRecordsTotal < oSettings._iDisplayLength) {
                        $(this.el).find('tr:last-child>td').css('border-bottom', 0);
                        toolBar.hide();
                    } else {
                        toolBar.show();
                        toolBar.find('div.dataTables_paginate').css('margin-top', 0);
                    }
                    popup.find('.dataTables_wrapper').css('margin-bottom', 0);
                    popup.reoffset();
                }
            });
        }
    });

    return DocsReplyView;
});
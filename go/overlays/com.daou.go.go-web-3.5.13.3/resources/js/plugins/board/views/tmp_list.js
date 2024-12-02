// 클래식형 게시판 글목록
(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "i18n!board/nls/board",
            'i18n!nls/commons',
            "hgn!board/templates/tmp_list",
            "board/collections/clipboard"
        ],
        function ($,
                  Backbone,
                  App,
                  boardLang,
                  commonLang,
                  TpltmpList,
                  clipBoardCollection) {
            var lang = {
                'no_more': boardLang['임시 저장된 글이 없습니다.'],
                'delete': commonLang['삭제']
            };
            var View = Backbone.View.extend({
                el: '.go_popup .content',
                manage: false,
                initialize: function () {
                    this.collection = new clipBoardCollection();
                    var _this = this;
                    this.collection.fetch({
                        success: function (data) {
                            //날짜 계산
                            var dateParse = function (date) {
                                return GO.util.snsDate(this.createdAt);
                            };

                            var tpltmpList = TpltmpList({
                                dataset: data.toJSON(),
                                dateParse: dateParse,
                                lang: lang
                            });
                            _this.$el.html(tpltmpList);
                            _this.$el.find('ul.list_line li:last-child').addClass('last');
                        },
                        error: function (data, res) {
                            console.log(res);
                        }
                    });

                },
                events: {
                    "click span.subject": "clickSubject",
                    "click span.ic_del": "clickDelete"
                },

                render: function () {
                    this.$el.css({
                        "overflow": "auto",
                        "overflow-x": "hidden",
                        "overflow-y": "auto"
                    });
                },

                clickDelete: function (e) {

                    var url = GO.contextRoot + "api/clipboard/" + $(e.target).attr("data-tmpId");

                    $.go(url, {}, {
                        qryType: 'DELETE',
                        contentType: 'application/json',
                        responseFn: function (rs) {
                            $(e.target).parents('li').remove();
                            $("#tmpCnt").html($('.go_popup li').length);
                            if (parseInt($('.go_popup li').length) == 0) {
                                $.goPopup.close();
                            }
                        }
                    });

                },
                clickSubject: function (e) {
                    $.goPopup.close();
                    $('#fileWrap').children("li").remove();
                    $('#imgWrap').children("li").remove();
                    var subject = GO.util.unescapeHtml($(e.target).html());
                    var content = $(e.target).attr("data-tmpContent");
                    var tempPostId = $(e.target).attr("data-tmpid");
                    $("#subject").val('').val(subject);
                    GO.Editor.getInstance("editor").setContent(content);
                    $("div.editor a.btn_temp_list").attr('data-tmpid', tempPostId);

                    var tempData = _.find(this.collection.models, function (data) {
                        return data.id == tempPostId;
                    });
                    var attachData = tempData.get("attaches");
                    var templete = "";

                    _.each(attachData, function (attach) {
                        var size = GO.util.getHumanizedFileSize(attach.size);
                        if (GO.util.isImage(attach.extention)) {
                            templete = '<li class="" data-clipboard="' + attach.clipboard + '" data-tmpname="' + attach.path + '" data-name="' + attach.name + '" data-hostid="' + 'unknown' + '" + data-id="' + attach.id + '">' +
                                '<span class="item_image">' +
                                '<span class="thumb">' +
                                '<img src="' + attach.thumbSmall + '" alt="' + attach.name + '" />' +
                                '</span>' +
                                '<span class="name">' + attach.name + '</span>' +
                                '<span class="size">(' + size + ')</span>' +
                                '</span>' +
                                '<span class="btn_wrap">' +
                                '<span class="ic_classic ic_del"></span>' +
                                '</span>' +
                                '</li>';
                            $('#imgWrap').append(templete);

                        } else {
                            var fileType = "def";
                            if (GO.util.fileExtentionCheck(attach.extention)) {
                                fileType = attach.extention;
                            }
                            templete = '<li class="" data-clipboard="' + attach.clipboard + '"  data-tmpname="' + attach.path + '" data-name="' + attach.name + '" data-hostid="' + 'unknown' + '" data-id="' + attach.id + '">' +
                                '<span class="item_file">' +
                                '<span class="ic_file ic_' + fileType + '"></span>' +
                                '<span class="name">' + attach.name + '</span>' +
                                '<span class="size">(' + size + ')</span>' +
                                '<span class="btn_bdr">' +
                                '<span class="ic_classic ic_del"></span>' +
                                '</span>' +
                                '</span>' +
                                '</li>';
                            $('#fileWrap').append(templete);
                        }
                    }, this);
                    $('.go_popup').remove();
                }
            });

            return {
                render: function (boardId) {
                    var view = new View();
                    return view.render();
                }
            };
        });
}).call(this);

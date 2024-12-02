define(function (require) {
    var $ = require('jquery');
    var Backbone = require('backbone');
    var App = require('app');
    var Template = require('hgn!system/templates/laboratory/feedback/list');

    require("jquery.go-sdk");
    require("jquery.go-grid");

    return App.BaseView.extend({

        events: {
            "click #use_config_btn": "_clickUseConfig",
            "click #add_config": "_clickAddConfig",
            "click #delete_config": "_clickDeleteConfig"
        },

        initialize: function () {
            $('.breadcrumb .path').html("실험실 피드백 설정 목록");
            this.useLabFeedback = GO.useLabFeedback;
            this.feedbackConfigGrid = null;
        },

        render: function () {
            this.$el.html(Template({
                useLabFeedback: this.useLabFeedback
            }));

            if (this.useLabFeedback) {
                this._renderGrid();
            }

            return this.$el;
        },

        _renderGrid: function () {
            this.feedbackConfigGrid = $.goGrid({
                el: '#feedback_config_table',
                method: 'GET',
                destroy: true,
                url: GO.contextRoot + 'ad/api/laboratory/feedback/configs',
                params: this.searchParams,
                emptyMessage: "<p class='data_null'> " +
                    "<span class='ic_data_type ic_no_data'></span>" +
                    "<span class='txt'>없음</span>" + "</p>",
                defaultSorting: [[1, "desc"]],
                sDomType: 'admin',
                checkbox: true,
                checkboxData: 'id',
                displayLength: GO.session('adminPageBase'),
                columns: [
                    {mData: "id", sWidth: "100px", bSortable: true},
                    {mData: "title", sClass: "subject", bSortable: true},
                    {mData: "appliedVersion", bSortable: true},
                    {
                        mData: "startDate", bSortable: true, fnRender: function (data) {
                            var startDate = moment(data.aData.startDate).format('YYYY-MM-DD');
                            var endDate = moment(data.aData.endDate).format('YYYY-MM-DD');
                            return startDate + " ~ " + endDate;
                        }
                    },
                    {
                        mData: "createdAt", sWidth: "200px", bSortable: true, fnRender: function (data) {
                            return moment(data.aData.createdAt).format('YYYY-MM-DD HH:mm:ss');
                        }
                    },
                    {
                        mData: "useConfig", bSortable: true, fnRender: function (data) {
                            if (data.aData.useConfig) {
                                return '<input type="radio" name="usgConfig" value=' + data.aData.id + ' data-id=' + data.aData.id + ' checked> <label>사용중</label>'
                            } else {
                                return '<input type="radio" name="usgConfig" value=' + data.aData.id + ' data-id=' + data.aData.id + '> <span class="btn_tool" id="use_config_btn" data-id=' + data.aData.id + '>사용변경</span>';
                            }
                        }
                    },
                    {
                        mData: null, sClass: "last action", bSortable: false, fnRender: function (data) {
                            return '<span class="btn_s" data-id=' + data.aData.id + '>설정</span>';
                        }
                    }
                ],
                fnDrawCallback: $.proxy(function () {
                    this.$el.find('.toolbar_top .custom_header').append(this.$el.find('#controlButtons').show());
                    this.$el.find('tr>td.last span.btn_s').css('cursor', 'pointer').click(function (e) {
                        var url = "system/extension/laboratory/feedback/config/" + $(e.currentTarget).attr("data-id");
                        GO.router.navigate(url, {trigger: true});
                    });
                }, this)
            }).tables;
        },

        _clickUseConfig: function (e) {
            var _this = this;
            var targetBtnId = $(e.currentTarget).attr("data-id");
            var checkedId = $('input[name=usgConfig]:checked').val();

            if (targetBtnId !== checkedId) {
                $.goMessage("선택한 설정과 상이합니다. 다시 선택 후 클릭해 주세요.");
                return;
            }

            $.goConfirm("사용변경", "사용할 피드백 설정을 변경 하시겠습니까?", function () {
                $.ajax({
                    type: 'PUT',
                    async: true,
                    dataType: 'json',
                    contentType: "application/json",
                    url: GO.config("contextRoot") + 'ad/api/laboratory/feedback/config/change/' + checkedId
                }).done(function (response) {
                    $.goMessage("사용할 설정이 변경되었습니다.");
                    _this.feedbackConfigGrid.reload();
                });
            });
        },

        _clickAddConfig: function () {
            GO.router.navigate('system/extension/laboratory/feedback/config/create', {trigger: true});
        },

        _clickDeleteConfig: function () {
            var _this = this;
            var ids = this.feedbackConfigGrid.getCheckedIds();

            var checkCnt = $('#feedback_config_table').find('tbody input[type="checkbox"]:checked').length;
            if (checkCnt !== ids.length) return;
            if (ids.length === 0) {
                $.goMessage("선택한 항목이 없습니다.");
                return;
            }

            $.goConfirm("설정삭제", "선택하신 설정(들)을 삭제하시겠습니까?", function () {
                $.ajax({
                    type: 'DELETE',
                    async: true,
                    data: JSON.stringify({ids: ids}),
                    dataType: 'json',
                    contentType: "application/json",
                    url: GO.config("contextRoot") + 'ad/api/laboratory/feedback/configs'
                }).done(function (response) {
                    $.goMessage("삭제되었습니다");
                    _this.feedbackConfigGrid.reload();
                });
            });
        }

    });

});


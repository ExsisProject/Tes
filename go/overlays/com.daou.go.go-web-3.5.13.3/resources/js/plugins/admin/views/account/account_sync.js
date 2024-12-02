define([
        "jquery",
        "backbone",
        "app",
        "hgn!admin/templates/account_sync",
        "hgn!admin/templates/account_sync_item_head",
        "i18n!admin/nls/admin",
        "i18n!nls/commons",
        "jquery.go-grid",
        "GO.util"
    ],

    function (
        $,
        Backbone,
        App,
        BaseTmpl,
        AccountSyncItemHeadTmpl,
        adminLang,
        commonLang
    ) {

        var tmplVal = {
            'deleteJob': commonLang['삭제'],
            'detailJob': commonLang['상세'],
            'doSyncJob': commonLang['수행']
        };

        var AccountSync = Backbone.View.extend({

            events: {
                "click #sync_start": "syncStart",
                "click #sync_detail": "syncDetail",
                "click #sync_delete": "syncDelete",

                "click #redo_checked_item": "syncCheckedJobItem",
                "click #redo_all_failed_item": "syncAllFailedJobItem",
                "click #redo_all_data_change": "syncAllDataChange"
            },

            initialize: function () {
                console.info("sync call !!!!");

            },


            render: function () {
                var self = this;

                this.$el.empty();
                var tmpl = BaseTmpl({
                    lang: tmplVal,
                });
                this.$el.html(tmpl);
                this.renderSyncAdminJob();
                $('.breadcrumb .path').html(adminLang["AdminJob 관리"]);
                return this.$el;
            },


            syncStart: function () {

                $.go(GO.contextRoot + 'ad/api/sync/job', '', {
                    qryType: "post",
                    async: false,
                    contentType: 'application/json',
                    responseFn: function () {
                        $.goMessage(adminLang["수행이 완료되었습니다."]);
                        App.router.navigate('account/synchronization', {trigger: true});
                    },
                    error: function (data) {
                        $.goMessage(data.responseJSON.message);
                    }
                });
            },

            syncDetail: function () {
                var checkedEls = $("#admin_job_list tbody input[type=checkbox]:checked");
                if (checkedEls.length == 0) {
                    return $.goMessage(adminLang["항목이 선택되지 않았습니다."]);
                }

                if (checkedEls.length > 1) {
                    return $.goMessage(adminLang["항목은 한개만 선택가능합니다."]);
                }

                var jobId = checkedEls[0].value;
                var jobName = checkedEls.parent().parent().find('td:last').text();

                if (this.adminJobItemList) {
                    this.adminJobItemList.tables.fnDestroy();
                }
                this.renderAdminJobItemList(jobId, "all", jobName);
                $('#admin_job_item_list').attr('job_id', jobId);
            },

            syncDelete: function () {
                var self = this;

                var checkedEls = $("#admin_job_list tbody input[type=checkbox]:checked");
                if (checkedEls.length == 0) {
                    return $.goMessage(adminLang["항목이 선택되지 않았습니다."]);
                }

                if (checkedEls.length > 1) {
                    return $.goMessage(adminLang["항목은 한개만 선택가능합니다."]);
                }

                var jobId = checkedEls[0].value;

                $.go(GO.contextRoot + 'ad/api/adminjob/' + jobId, '', {
                    qryType: "delete",
                    async: false,
                    contentType: 'application/json',
                    responseFn: function () {
                        $.goMessage(adminLang["삭제가 완료되었습니다."]);
                        App.router.navigate('account/synchronization', {trigger: true});
                    },
                    error: function (data) {
                        $.goMessage(data.responseJSON.message);
                    }
                });


            },

            syncCheckedJobItem: function (e) {
                var param = {};
                var dataList = [];
                var jobId = $('#admin_job_item_list').attr('job_id')
                var checkedItemIds = this.adminJobItemList.tables.getCheckedIds();
                if(checkedItemIds.length==0) {
                    $.goMessage(adminLang["항목이 선택되지 않았습니다."]);
                    return;
                }

                for (var j = 0; j < checkedItemIds.length; j++) {
                    dataList[j] = $('textarea[id=' + checkedItemIds[j] + ']').val();
                }

                param = {
                    itemIds : checkedItemIds,
                    data : dataList
                };
                $.go(GO.contextRoot + 'ad/api/adminjob/retry/site/'+jobId, JSON.stringify(param), {
                    qryType : "post",
                    async : false,
                    contentType : 'application/json',
                    responseFn : function(){
                        $.goMessage(adminLang["수행이 완료되었습니다."]);
                        App.router.navigate('account/synchronization', {trigger: true});
                    },
                    error : function(data){
                        $.goMessage(data.responseJSON.message);
                    }
                });
            },

            syncAllFailedJobItem: function (e) {
                var jobId = $('#admin_job_item_list').attr('job_id');

                var statusFailData = $('textarea[name=FAIL]').map(function (k, v) {
                    return $(v).val();
                }).get();

                var param = JSON.stringify(statusFailData);
                $.go(GO.contextRoot + 'ad/api/adminjob/retry/all/site/' + jobId, param, {
                    qryType: "post",
                    async: false,
                    contentType: 'application/json',
                    responseFn: function () {
                        $.goMessage(adminLang["수행이 완료되었습니다."]);
                        App.router.navigate('account/synchronization', {trigger: true});
                    },
                    error: function (data) {
                        $.goMessage(data.responseJSON.message);
                    }
                });
            },

            getJobItem: function (jobItemId) {
                var deferred = $.Deferred();
                $.go(GO.contextRoot + 'ad/api/adminjob/item/' + jobItemId, '', {
                    qryType: "get",
                    async: false,
                    contentType: 'application/json',
                    responseFn: function (response) {
                        deferred.resolve(response.data);
                    },
                    error: function (data) {
                        $.goMessage(data.responseJSON.message);
                    }
                });
                return deferred.promise();
            },

            renderSyncAdminJob: function () {
                var self = this;
                this.$tableEl = this.$el.find('#admin_job_list');
                this.adminJobList = $.goGrid({
                    el: '#admin_job_list',
                    method: 'GET',
                    destroy: true,
                    url: GO.contextRoot + 'ad/api/site/adminjob/list',
                    params: this.searchParams,
                    emptyMessage: "<p class='data_null'> " +
                        "<span class='ic_data_type ic_no_data'></span>" +
                        '<span class="txt">' + commonLang["없음"] + '</span>' +
                        "</p>",
                    defaultSorting: [[6, "desc"]],
                    sDomType: 'admin',
                    checkbox: true,
                    checkboxData: 'jobId',
                    columns: [
                        {mData: "jobId", sWidth: '100px', bSortable: false},
                        {mData: "companyId", sWidth: "100px", bSortable: true},
                        {mData: "size", sWidth: "100px", bSortable: true},
                        {mData: "successCount", sWidth: "100px", bSortable: true},
                        {mData: "failCount", sWidth: "100px", bSortable: true},
                        {
                            mData: "startedAt", bSortable: true, fnRender: function (obj) {
                                return GO.util.basicDate(obj.aData.startedAt);
                            }
                        },
                        {
                            mData: "endedAt", bSortable: true, fnRender: function (obj) {
                                return GO.util.basicDate(obj.aData.endedAt);
                            }
                        },
                        {
                            mData: null, sWidth: "150px", bSortable: false, fnRender: function (obj) {
                                if (obj.aData.operator != undefined) {
                                    return obj.aData.operator.name;
                                } else {
                                    return "";
                                }
                            }
                        },
                        {mData: "jobName", bSortable: true},
                    ],

                    fnDrawCallback: function (obj, oSettings, listParams) {
                        self.$el.find('#admin_job_list_wrapper .toolbar_top .custom_header').append(self.$el.find('#controlButtons1').show());
                    }
                });

            },

            renderAdminJobItemList: function (jobId, status) {
                var self = this;
                var btnTpl =
                    '<div id="controlButtons3" style="display: none">' +
                    '<span class="btn_tool" id="redo_checked_item">' + adminLang["선택데이터 재수행"] + '</span>' +
                    '<span class="btn_tool" id="redo_all_failed_item">' + adminLang["모든 실패데이터 재수행"] + '</span>'

                this.$el.find('#admin_job_item_container').append(btnTpl);

                this.$tableEl = this.$el.find('#admin_job_item_list');
                this.$tableEl.html('');
                this.$tableEl.append(AccountSyncItemHeadTmpl());

                this.adminJobItemList = $.goGrid({
                    el: '#admin_job_item_list',
                    method: 'GET',
                    destroy: true,
                    url: GO.contextRoot + 'ad/api/adminjob/' + jobId + '/item/' + status,
                    params: this.searchParams,
                    checkbox : true,
                    checkboxData: 'id',
                    emptyMessage: "<p class='data_null'> " +
                        '<span class="ic_data_type ic_no_data"></span>' +
                        '<span class="txt">' + commonLang["없음"] + '</span>' +
                        "</p>",
                    defaultSorting: [[1, "asc"]],
                    sDomType: 'admin',
                    displayLength: App.session('adminPageBase'),
                    columns: [
                        {mData: "id", sWidth: '100px', bSortable: true},
                        {mData: "jobId", sWidth: "100px", bSortable: true},
                        {mData: "orgItemId", sWidth: "100px", bSortable: true},
                        {mData: "status", sWidth: "100px", bSortable: true},
                        {mData: "data", bSortable: true, fnRender: function (data) {
                            return '<textarea class="txtarea w_max" name="' + data.aData.status + '" id="' + data.aData.id + '" cols="80" rows="2" style="width: 700px">' + data.aData.data + '</textarea>'
                        }},
                        {mData: "message", bSortable: true}
                    ],

                    fnDrawCallback: function (e) {
                        self.$el.find('#admin_job_item_list_wrapper .toolbar_top .custom_header').append(self.$el.find('#controlButtons3').show());
                    }
                });
                console.log(this.adminJobItemList);
            }

        });
        return AccountSync;

    });

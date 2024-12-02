(function() {
    define([
        "jquery",
        "backbone",     
        "app",
        "system/models/licenseModel",
        "hgn!system/templates/search_indexing_list",
        "hgn!system/templates/list_empty",
        "i18n!nls/commons",
        "i18n!board/nls/board",
        "i18n!admin/nls/admin",
        "jquery.go-grid",
        "jquery.go-sdk",
        "GO.util",
    ], 

function(
    $, 
    Backbone,
    App,
    LicenseModel,
    SearchIndexingListTmpl,
    emptyTmpl,
    commonLang,
    boardLang,
    adminLang
) {
    var tmplVal = {
        label_title : adminLang["검색 인덱싱"],
        label_task : commonLang["업무"],
        label_works : commonLang["Works"],
        label_board : commonLang["게시판"],
        label_community : commonLang["커뮤니티"],
        label_calendar : commonLang["캘린더"],
        label_report : commonLang["보고"],
        label_todo : commonLang["ToDO+"],
        label_execution : adminLang['실행'],
        label_approval : commonLang['전자결재'],
        label_siteName : adminLang['사이트명'],
        label_draftDateBase : adminLang['기안일 기준'],
        label_boardCreatedDateBase : boardLang['글 등록 기준'],
        label_docs : commonLang['문서관리'],
        label_base_date: adminLang['기준일'],
        label_true_false: adminLang['유무'],
        label_works_indexType: adminLang['인덱싱 타입'],
        label_works_url_sample_desc: adminLang['works reindexing url desc'],
        label_works_only_all_appletid: adminLang['all_appletId만 해당'],
        label_works_attachIndexable_true_false: adminLang['첨부파일 인덱싱 유무']
    };
    var searchIndexingList = Backbone.View.extend({

        events : {
            "click span.btn_execution" : "executeJob",
            "change #worksIndexTypeSelect" : "_worksIndexTypeSelect"
        },

        initialize : function() {
            this.globalListE = '#indexingList';
            this.dataTable = null;
            this.licenseModel = LicenseModel.read();
        },

        render : function() {
            var self = this;
            
            $('.breadcrumb .path').html(adminLang['검색 인덱싱']);
            this.$el.empty();
            
            var hasSocialPack = self.licenseModel.get('socialServicePack'),
                hasCollaborationPack = self.licenseModel.get('collaborationServicePack'),
                hasApprovalServicePack = self.licenseModel.get('approvalServicePack');
            
            this.$el.html(SearchIndexingListTmpl({
                    lang : tmplVal,
                    hasSocialPack : hasSocialPack,
                    hasCollaborationPack : hasCollaborationPack,
                    hasApprovalServicePack : hasApprovalServicePack
            }));

            self.setCompanyList();
            self.initDate("approval");
            self.initDate("board");
            self.initDate("works");
            $('select.companyList').val(GO.session("companyId"));
        },

        executeJob : function(e){
            var self = this;
            var appName = $(e.currentTarget).attr("id"),
                jobName = $(e.currentTarget).attr("name");

            var url = this.getUrl(appName);

            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            $.go(url, "", {
                qryType : 'GET',    
                contentType : 'application/json',
                timeout : 3000,
                responseFn : function(response) {
                    if(response.code == 200) {
                        $.goMessage(App.i18n(adminLang["{{arg1}} 실행 성공"],{"arg1": jobName}));
                    }else {
                        $.goMessage(App.i18n(adminLang["{{arg1}} 실행 실패"],{"arg1": jobName}));
                    }
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    
                },
                error: function(response){
                    var errorMsg = App.i18n(adminLang["{{arg1}} 실행 실패"],{"arg1": jobName});
                    if(response.statusText == "timeout"){
                        errorMsg = App.i18n(adminLang["{{arg1}} 실행 성공"],{"arg1": jobName});
                    } else {
                        if(response.responseJSON.message) {
                            errorMsg += "["+ response.responseJSON.message + "]";
                        }
                    }

                    $.goMessage(errorMsg);
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                }
            });
        },

        initDate : function(prefix){
            var self = this;
            $.datepicker.setDefaults( $.datepicker.regional[ GO.config("locale") ] ); 
            var startDate = this.$el.find("#"+prefix+"StartDate");
            var endDate = this.$el.find("#"+prefix+"EndDate");

            startDate.val(GO.util.now().format("YYYY-MM-DD"));
            endDate.val(GO.util.now().format("YYYY-MM-DD"));
           
            startDate.datepicker({ 
                dateFormat: "yy-mm-dd",
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                maxDate : endDate.val()
            });

            endDate.datepicker({
                dateFormat: "yy-mm-dd", 
                changeMonth: true,
                changeYear: true,
                yearSuffix: "",
                onClose : function(selectedDate){
                    startDate.datepicker('option', 'maxDate', selectedDate);
                }
            });
        },
        
        setCompanyList : function(){
            var url = GO.contextRoot + "ad/api/system/companies?offset=999";
            
            $.go(url, "", {
                qryType : 'GET',
                async : false,
                responseFn : function(response) {
                    $.each(response.data, function(i, item){
                        $('select.companyList').append('<option value="' +item.id+ '">' + item.name +'</option>');
                    });

                },
                error: function(response){
                    var responseData = JSON.parse(response.responseText);
                    $.goMessage(responseData.message);
                }
            });
        },
        
        getUrl : function(appName){
            
            var url = GO.contextRoot + "ad/api/search/"+appName+"/full-import";
            
            if(appName =='approvalPeriod'){ //전자결재 사이트별 + 기간별 실행
                var companyId = $("#approvalCompanyList").val();
                var draftedAtFrom = GO.util.toISO8601(GO.util.toMoment($("#approvalStartDate").val()));
                var draftedAtTo = GO.util.toISO8601(GO.util.toMoment($("#approvalEndDate").val()).add("days",1).subtract("seconds",1));
                url = GO.contextRoot + "ad/api/search/approval/full-import-with-draftedAt"+"?"+$.param({draftedAtFrom: draftedAtFrom, draftedAtTo: draftedAtTo,companyId: companyId});
            }else if(appName =='boardPeriod'){ //게시판 사이트별 + 기간별 실행
                var companyId = $("#boardCompanyList").val();
                var createdAtFrom = GO.util.toISO8601(GO.util.toMoment($("#boardStartDate").val()));
                var createdAtTo = GO.util.toISO8601(GO.util.toMoment($("#boardEndDate").val()).add("days",1).subtract("seconds",1));
                url = GO.contextRoot + "ad/api/search/board/full-import-with-createdAt"+"?"+$.param({createdAtFrom: createdAtFrom, createdAtTo: createdAtTo,companyId: companyId});
            } else if(appName =='worksPeriod') {
                var indexType = $("#worksIndexTypeSelect").val();
                var isClearSolr = $("#clear_solr").is(':checked');
                var attachIndexable = $("#attach_Indexable").is(':checked');

                if(indexType == "docIds") {
                    var ids = $("#worksDocIds").val().replace(/ /gi, "").replace(/,/gi , "&id=");
                    url = GO.contextRoot + "ad/api/search/works/reindex/docIds?id=" + ids;
                } else {
                    var appletId = $("#appletId").val() || null;
                    var from = $("#worksStartDate").val() ? GO.util.toISO8601(GO.util.toMoment($("#worksStartDate").val())) : null;
                    var to = $("#worksEndDate").val() ? GO.util.toISO8601(GO.util.toMoment($("#worksEndDate").val()).add("days",1).subtract("seconds",1)) : null;
                    url = GO.contextRoot + "ad/api/search/works/reindex/type/" + indexType + "?" + $.param({isClearSolr: isClearSolr, attachIndexable: attachIndexable, appletId: appletId, from:from, to:to});
                }
            }
            
            return url;
            
        },

        _worksIndexTypeSelect: function (e) {
            var $target = $(e.currentTarget);
            this._worksIndexRender($target.val());
        },

        _worksIndexRender: function(indexType) {
            if(indexType === 'all') {
                this._renderWithTypeAll();
            } else if(indexType === 'appletId') {
                this._renderWithTypeAppletId();
            } else if(_.contains(['createdAt', 'updatedAt'], indexType)) {
                this._renderWithTypeDate();
            } else if(_.contains(['createdAtWithAppletId', 'updatedAtWithAppletId'], indexType)) {
                this._renderWithTypeDateAndAppletId();
            } else if(indexType === 'docIds') {
                this.$("#clear_solr_wrap").show();
                this.$("#applet_id_wrap").hide();
                this.$("#from_to_date_wrap").hide();
            }
            this._commonRenderingForWorks(indexType);
        },

        _renderWithTypeAll: function() {
            this.$("#clear_solr_wrap").show();
            this.$("#applet_id_wrap").hide();
            this.$("#from_to_date_wrap").hide();
        },

        _renderWithTypeAppletId: function() {
            this.$("#clear_solr_wrap").show();
            this.$("#applet_id_wrap").show();
            this.$("#from_to_date_wrap").hide();
        },

        _renderWithTypeDate: function() {
            this.$("#clear_solr_wrap").hide();
            this.$("#applet_id_wrap").hide();
            this.$("#from_to_date_wrap").show();
        },

        _renderWithTypeDateAndAppletId: function () {
            this.$("#clear_solr_wrap").hide();
            this.$("#applet_id_wrap").show();
            this.$("#from_to_date_wrap").show();
        },

        _commonRenderingForWorks: function (indexType) {
            var isDocIdsType = indexType === "docIds" || false;
            if(isDocIdsType) {
                this.$("#worksDocIds").val("");
                this.$("#docIds_wrap").show();
            } else {
                this.$("#docIds_wrap").hide();
            }
            this.$("#clear_solr").prop('checked', false).prop('disabled', isDocIdsType);
            this.$("#attach_Indexable").prop('checked', true).prop('disabled', isDocIdsType);
        }

    },{
            __instance__: null
    });
    
        return searchIndexingList;
    });
}).call(this);
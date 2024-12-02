(function () {
    define([
            "backbone",
            "app",
            "hgn!welfare/templates/company_manage_config",
            "i18n!welfare/nls/welfare",
            "i18n!nls/commons",
            "file_upload"
        ],

        function (
            Backbone,
            GO,
            Tmpl,
            WelfareLang,
            CommonLang,
            FileUpload
        ) {

            var lang = {
                "복지포인트 설정" : WelfareLang["복지포인트 설정"],
                "양식 다운로드" : WelfareLang["양식 다운로드"],
                "복지포인트 파일 등록" : WelfareLang["복지포인트 파일 등록"],
            }

            var Manage = Backbone.View.extend({
                events: {
                    "click #upload_ok" : "excel_regist",
                    "click #btn_ok" : "save",
                    "click #btn_cancel" : "cancel",
                    "click #sample_download" : "sample_download"
                },

                initialize: function () {
                },

                render: function () {
                    this.$el.html(Tmpl({
                        lang : lang
                    }));

                    setTimeout(this.initFileUpload,200);

                    return this;
                },

                sample_download : function(){
                    var url = GO.contextRoot + "api/ehr/welfare/company/upload/sample";
                    window.location.href = url;
                },

                excel_regist : function(){
                    var self = this;
                    if(jQuery("ul.file_wrap li").length < 1) {
                        return;
                    }
                    var $file = jQuery("ul.file_wrap li");
                    if($file.length < 1) {
                        return;
                    }

                    var url = GO.contextRoot+"api/ehr/welfare/excelUpload",
                        options = {
                            fileName : $file.attr("data-name"),
                            filePath : $file.attr("data-path"),
                            fileExt : $file.attr("data-ext"),
                            hostId : $file.attr("host-id")
                        };

                    GO.EventEmitter.trigger('common', 'layout:setOverlay', "로딩중");
                    $.go(url,JSON.stringify(options), {
                        qryType : 'POST',
                        timeout : 0,
                        contentType : 'application/json',
                        responseFn : function(response) {
                            if(response.code=="200"){
                                GO.EventEmitter.trigger('common', 'layout:clearOverlay');
                                $.goAlert(CommonLang["저장되었습니다."]);
                                $("#fileComplete").empty();
                            }else{
                                self.displayUploadErrMsg(response);
                            }
                        },
                        error : function(error){
                            clearInterval(this.interval);
                            $.goAlert(error.responseJSON.message);
                        }
                    });
                },

                initFileUpload : function(){
                    var _this = this,
                        options = {
                            el : "#file_upload",
                            context_root : GO.contextRoot ,
                            button_text : "<span class='buttonText'>" + lang["복지포인트 파일 등록"] + "</span>",
                            button_width : "132px",
                            progressBarUse : true,
                            url : "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie')
                        };

                    (new FileUpload(options))
                        .queue(function(e, data){

                        })
                        .start(function(e, data){
                            var reExt = new RegExp("(.xls|.xlsx)","gi"),
                                fileExt = data.type.toLowerCase();

                            if(!reExt.test(fileExt)){
                                $.goAlert("Excel 파일만 등록 가능합니다.");
                                $("#progressbar").hide();
                                return false;
                            }
                        })
                        .progress(function(e, data){

                        })
                        .success(function(e, serverData, fileItemEl){
                            var $fileComplete = $("#fileComplete");
                            var registBtn = $("<a id='upload_ok' data-bypass='' class='btn_minor_s' data-role='button' style=''><span class='txt'>등록</span></a>");


                            fileItemEl.attr("data-ext", serverData.data.fileExt);

                            fileItemEl.find("span.ic_del").on("click", function(e){
                                var $currentEl = $(e.currentTarget);
                                $currentEl.closest("li").remove();
                            });

                            fileItemEl.find(".item_file").append(registBtn);
                            $fileComplete.html(fileItemEl);

                        })
                        .complete(function(e, data){
                            console.info(data);
                        })
                        .error(function(e, data){
                            console.info("error" + data);
                        });

                },

            });

            return Manage;

        });

})();
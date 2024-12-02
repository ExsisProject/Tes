;(function () {
    define([
            "backbone",
            "GO.util"
        ],
        function (
            Backbone
        ) {
            var AttachFileView = Backbone.View.extend({
                initialize: function (options) {

                },
            }, {
                create: function (placeholder, attaches, downloadUrl, mode) {
                    var deferred = agentFactory();
                    var returnDeferred = $.Deferred();
                    deferred.done(function (AttachFile) {
                        var attachFile = AttachFile.create(placeholder, attaches, downloadUrl, mode);
                        returnDeferred.resolve(attachFile);
                    });

                    return returnDeferred;
                },

                edit: function (placeholder, attaches, downloadUrl, editable) {
                    var deferred = agentFactory();
                    var returnDeferred = $.Deferred();
                    deferred.done(function (AttachFile) {
                        var attachFile = AttachFile.edit(placeholder, attaches, downloadUrl, editable);
                        returnDeferred.resolve(attachFile);
                    });

                    return returnDeferred;
                },

                makeTempItem: function (attache, downloadUrl) {
                    var deferred = agentFactory();
                    var returnDeferred = $.Deferred();
                    deferred.done(function (AttachFile) {

                        var tempAttachItem = {
                            id: attache.id,
                            name: attache.fileName,
                            extention: attache.fileExt,
                            filePath: attache.filePath,
                            size: attache.fileSize,
                            thumbSmall: attache.thumbnail,
                            preview: attache.preview,
                            hostId: attache.hostId,
                            download: false,
                            mode: attache.mode
                        };

                        var attachFile = AttachFile.makeItem(tempAttachItem, downloadUrl);
                        returnDeferred.resolve(attachFile);
                    });

                    return returnDeferred;
                }
            });

            function agentFactory() {
                var deferred = $.Deferred();

                if (isMobileWeb()) {
                    require(["components/attach_file/views/m_attach_files"], function (MobileAttachFile) {
                        deferred.resolve(MobileAttachFile);
                    });
                } else {
                    require(["components/attach_file/views/attach_files"], function (AttachFile) {
                        deferred.resolve(AttachFile);
                    });
                }

                return deferred;
            }

            // TODO: 공통 유틸로 빼야 함...
            // 아직 빼지 않은 이유... go-util.js에 $.cookie 플러그인이 묶이게 되는데, 먼저 로드되리라는 보장이 없기 때문...
            function isMobileWeb() {
                var deviceType = GO.config('deviceType');
                var pcVersion = $.cookie('pcVersion');
                var result = true;

                switch (deviceType) {
                    // 디바이스 타입이 pc이면 모바일웹 아님
                    case 'pc':
                        result = false;
                        break;
                    // 태블릿일 경우
                    case 'tablet':
                        // pcVersion 쿠키가 없으면 모바일웹 아님
                        if (!pcVersion) {
                            result = false;
                            // pcVersion 쿠키가 있고 값이 true 이면 모바일웹 아님
                        } else if (pcVersion && pcVersion === 'true') {
                            result = false;
                            // 그외에는 모바일웹 버전
                        }

                        break;
                    // 모바일일 경우
                    case 'mobile':
                        // pcVersion 쿠키가 있고 true이면 모바일웹 아님
                        if (pcVersion && pcVersion === 'true') {
                            result = false;
                            // 그외에는 모바일웹
                        }

                        break;
                }

                return result;
            }

            return AttachFileView;
        });
}).call(this);
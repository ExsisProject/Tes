(function() {

    define([
        "jquery",
        "backbone",
        "app",
        "components/attach_file/views/base_attach_files",

        "jquery.fancybox-buttons",
	    "jquery.fancybox-thumbs",
	    "jquery.fancybox",
	    'go-fancybox'
    ],

    function(
        $,
        Backbone,
        GO,
        BaseAttachFile
    ) {

        var __super__ = BaseAttachFile.prototype;

        var PcAttachFilesView = BaseAttachFile.extend({
            /**
             * TODO: 첨부파일에 대한 퍼미션 구현(삭제 가능 여부)
             */
            render: function() {
                __super__.render.apply(this, arguments);
                initFancyBox.call(this);
            }
        });

        function initFancyBox() {
        	this.$el.find('.fancybox-thumbs').goFancybox();
		}

        return PcAttachFilesView;

    });

})();
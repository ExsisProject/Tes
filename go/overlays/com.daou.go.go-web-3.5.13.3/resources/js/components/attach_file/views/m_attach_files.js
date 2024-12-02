(function() {
    define([
        "jquery", 
        "backbone", 
        "app", 
        "components/attach_file/views/base_attach_files"
    ], 
    
    function(
        $,
        Backbone,
        GO, 
        BaseAttachFile
    ) {
        var __super__ = BaseAttachFile.prototype;

        var MobileAttachFilesView = BaseAttachFile.extend({
            events: {
                "vclick .imageview": "viewImage"
            },

            initialize: function(options) {
                $.extend(this.events, __super__.events);
                __super__.initialize.apply(this, arguments);
            },

            render: function() {
            	__super__.render.apply(this, arguments);
            	addBtnClassForMobile.call(this);
            },
            
    		viewImage : function(e){
                e.preventDefault();
                var $target = $(e.currentTarget),
	                $imagesWrapper = $target.parents('.img_wrap'),
	                $siblings = $imagesWrapper.find('a[data-fancybox-group="' + $target.attr('data-fancybox-group') + '"]'),
	                selectedId = $target.parent().parent().parent().attr('data-id'),
	                selectedIndex = 0,
	                images = [];

	            $.each($siblings, function(k,v) {
	                var $v = $(v);
	                images.push({
	                    fileName : $v.attr('title'),
	                    url : $v.attr('href')
	                });
	                if($v.parent().parent().parent().attr('data-id') == selectedId) selectedIndex = k;
	            });
	            
	            GO.util.attachImages(images, selectedIndex);
	            return false;
    		}
    		/*
            download : function(e) {
            	var targetEl = $(e.currentTarget);
            	
				var $eTarget = $(e.currentTarget);
				var host = location.protocol+"//"+window.location.host;
				var saveUrl = GO.contextRoot + 'api/board/'+$eTarget.attr('data-boardId')+'/post/'+$eTarget.attr('data-postId')+'/attaches/'+$eTarget.attr('data-id');
				var fileName = $eTarget.attr('title');
				var fileSize = $eTarget.attr('data-size');
            	
            	GO.util.attachFiles(host+saveUrl,fileName,fileSize);
            }*/
        });
        
        function addBtnClassForMobile() {
        	this.$el.find('.btn-preview .btn-text').addClass('ic_nav ic_nav_search');
        	this.$el.find('.btn-download .btn-text').addClass('ic ic_file_download');
        }
        
        return MobileAttachFilesView;
        
    });
    
})();
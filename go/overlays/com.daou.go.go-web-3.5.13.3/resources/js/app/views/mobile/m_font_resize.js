;define('views/mobile/m_font_resize', function (require) {

    var Backbone = require('backbone');
    var GO = require('app');
    var FontResizeTpl = require('hgn!templates/mobile/m_font_resize');
    var BackdropView = require('components/backdrop/backdrop');
    var instance = null;

    var SearchHeader = Backbone.View.extend({
        events : {
            'vclick #fontResizeBtn' : '_toggleFontResizeLayer',
            'touchmove #fontResizeLayer ul.list_fs' : '_moveFontSizeSlide',
            'change #fontResizeLayer input[name=inpFont]' : '_changeFontSize'
        },
        initialize : function (options){
            this.targetContentEl = options.targetContentEl;
            this.$el.addClass('wrap_fontsize');
        },
        render : function (){
            var fontSize = this._getFontSize();
            this.$el.html(FontResizeTpl());
            this.$el.find("#fontResizeLayer li input[value="+fontSize+"]").prop("checked", true);
            GO.util.contentsParsingForFontSizeResizing($(this.targetContentEl));
            this.$el.show();
            if(this.isResizableContent()){
                this._resizeFontSize(fontSize);
            }
            return this.el;
        },
        
        isResizableContent: function(){
            return (this.$el.length > 0);
        },
    
        _restoreFontsize : function() {
            GO.util.rollbackFontSizeResizing($(this.targetContentEl));
        },

        _getFontSize : function() {
            var lastFontSize = GO.util.getLocalStorage("lastFontSize_"+GO.session().id);
            return lastFontSize ? lastFontSize : 40;
        },
        _toggleFontResizeLayer : function(e) {
            this.backdropView = new BackdropView();
            this.backdropView.backdropToggleEl = $("#fontResizeLayer");
            if(this.backdropView.backdropToggleEl.is(":visible")) {
                this.backdropView.backdropToggleEl.hide();
                return;
            }
            this.backdropView.linkBackdrop($(e.currentTarget));
        },
        _moveFontSizeSlide : function(e) {
            var pos = e.originalEvent.touches[0];
            var dragDom = document.elementFromPoint(pos.pageX, pos.pageY);
            if($(dragDom)[0] && $(dragDom)[0].nodeName == "INPUT"){
                $(dragDom).trigger("click");
            }
        },
        _changeFontSize : function(e) {
            var target =  $(e.currentTarget);
            var fontsize = target.val();
            this._resizeFontSize(parseInt(fontsize));
            GO.util.setLocalStorage("lastFontSize_"+GO.session().id, fontsize);
        },
        _hasIframe : function() {
            return $(this.targetContentEl).find('iframe').length > 0;
        },
        _resizeFontSize : function(percent) {

            $(this.targetContentEl).find('span[data-font-resize]').each(function(){
                var originFontSize = $(this).attr("data-origin-fontsize");
                var originLineHeight = $(this).attr("data-origin-lineheight");
                var fontSize = parseFloat(originFontSize) + parseFloat(originFontSize * (percent * 0.01));
                var lineHeight = parseFloat(originLineHeight) + parseFloat(originLineHeight * (percent * 0.01));
                $(this).css({
                    'font-size' : fontSize.toFixed(3) + 'px',
                    'line-height' : lineHeight.toFixed(3) + 'px'
                });
            });

            if(this._hasIframe()){
                $.each($(this.targetContentEl).find('iframe'),function(){
                    $(this).contents().find('span[data-font-resize]').each(function(){
                        var originFontSize = $(this).attr("data-origin-fontsize");
                        var originLineHeight = $(this).attr("data-origin-lineheight");
                        var fontSize = parseFloat(originFontSize) + parseFloat(originFontSize * (percent * 0.01));
                        var lineHeight = parseFloat(originLineHeight) + parseFloat(originLineHeight * (percent * 0.01));
                        $(this).css({
                            'font-size' : fontSize.toFixed(3) + 'px',
                            'line-height' : lineHeight.toFixed(3) + 'px'
                        });
                    });
                });
            }
            setTimeout(function(){
                GO.util.iscrollRefresh();
            },500);

        }
    });
    return {
        render : function(options) {
            instance = new SearchHeader(options);
            return instance.render();
        },
        
        restore : function() {
            if (instance != null) {
                instance._restoreFontsize();
            }
        }
    };
});

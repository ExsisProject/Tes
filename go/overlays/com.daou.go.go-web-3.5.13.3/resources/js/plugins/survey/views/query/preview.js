(function() {
    
    define([
        "underscore", 
        "survey/models/query", 
        "survey/views/query/response",
        "i18n!nls/commons", 
    ], 
    
    function(
        _, 
        QueryModel, 
        QueryResponseView,
        CommonLang
    ) {
    
        var QueryPreviewView = QueryResponseView.extend({  
            type: 'preview', 
            removeFlag: false, 
            
            events: {
                "click .btn-edit-query": "convertToForm", 
                "click .btn-copy-query": "copyQuery", 
                "click .btn-remove-query": "removeQuery"
            }, 
            
            initialize: function() {
            	QueryResponseView.prototype.initialize.apply(this, arguments);
                this.template = makePreviewTemplate(this.template);
                this.$el.data('view', this);
                
                this.removeFlag = false;
            }, 
            
            updateSeq: function(newSeq) {
                this.model.set('seq', +newSeq);
                this.$el.find('.question > .seq').text(newSeq);
            }, 
            
            convertToForm: function(e) {
                e.preventDefault();
                this.$el.trigger('click:edit-start');
            }, 
            
            copyQuery: function(e) {
                e.preventDefault();
            	var newModel = this.model.copy();
            	
            	newModel.save(null, {
            		success: _.bind(function(model) {
            			this.$el.trigger('copied', [model]);
            		}, this)
            	});
            }, 
            
            removeQuery: function(e) {
                e.preventDefault();
            	this.model.destroy({
                    success: _.bind(function(model) {
                    	// $el을 통해서 이벤트를 전달해야 하므로 먼저 삭제대상 플래그로 지정해서 이벤트를 수신받을 수 있도록 함.
                    	this.removeFlag = true;
                    	this.$el.trigger('removed', [model]);
                    	// 실제로 삭제
                        this.remove();
                    }, this)
                });
            }, 
            
            isRemoved: function() {
            	return this.removeFlag;
            }
        });
        
        function makePreviewTemplate(queryViewTemplate) {
            var html = [];
            
            html.push('<div class="reserach_preview">');
            html.push(queryViewTemplate);
            html.push('</div>');
            html.push('<div class="action_wrap">');
                html.push('<a class="btn_ic24 btn-edit-query" title=' + CommonLang["수정"] + '><span class="ic_toolbar write"></span></a>');
                html.push('<a class="btn_ic24 btn-copy-query" title=' + CommonLang["복사"] + '><span class="ic_toolbar copy"></span></a>');
                html.push('<a class="btn_ic24 btn-remove-query" title=' + CommonLang["삭제"] + '><span class="ic_toolbar del"></span></a>');
            html.push('</div>');
            html.push('<span class="drag_area"></span>');
            
            return html.join("\n");
        }
        
        return QueryPreviewView;
        
    });
    
})();
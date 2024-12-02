(function() {
    define([
    "backbone", 
    "app"
    ],

    function(
    Backbone,
    GO
    ) {

        var ImageFileItemView = Backbone.View.extend({
            tagName : "li",
            events : {
                "span.ic_del click" : "remove"
            },

            initialize : function() {

            },

            render : function() {

            },
            
            remove : function(e){
                var targetEl = $(e.currentTarget),
                    attachArea = targetEl.parents("div#commentAttachPart");
                
                targetEl.parents("li[data-name]").remove();
                
                var count = attachArea.find("li").length;
                if (!count) attachArea.removeClass("option_display");
            }

        });

        function privateFunc(view, param1, param2) {

        }

        return ImageFileItemView;

    });

})();
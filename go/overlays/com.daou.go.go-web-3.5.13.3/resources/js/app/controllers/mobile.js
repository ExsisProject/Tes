(function() {

    define([
        "app"
    ], 

    function(
        GO
    ) {
        var CoreController = (function() {
            // Constructor
            var Controller = function() {
            };

            Controller.prototype = {
                
                home: function() {
                	location.href = GO.contextRoot + "app/home";
                	/*require(["views/mobile/m_home"], function(HomeView) {
                		 	
							HomeView.render();
					});*/
                },
                
                preview : function(encrypt){
                    require([
                             "views/preview"
                             ],function(PreviewLayout){
                            var previewLayout = new PreviewLayout({encrypt : encrypt});
                            $("body").append(previewLayout.render().$el);
                            
                        }
                    );
                }
            };

            return Controller;
        })();

        return new CoreController;
    });
}).call(this);
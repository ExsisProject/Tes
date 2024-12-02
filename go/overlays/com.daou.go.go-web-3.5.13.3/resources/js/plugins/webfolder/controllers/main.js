define('webfolder/controllers/main', function(require) {
    var FullPageLayout = require("views/layouts/fullpage");
    var r = {};

    /**
     * 자료실 홈
     */
    r.renderHome = function() {
        require(['webfolder/views/home'], function(WebFolderHome) {
            GO.config('workspace_expansion_button_visible', true);
            var layout = FullPageLayout.create();
            layout.render();
            var content = layout.$el.find("div.go_body");
            var homeView = new WebFolderHome();
            content.html(homeView.$el);
            homeView.render();
        });
    };

    return r;
});
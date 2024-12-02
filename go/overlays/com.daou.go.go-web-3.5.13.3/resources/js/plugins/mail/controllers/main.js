define('mail/controllers/main', function(require) {
    var FullPageLayout = require("views/layouts/fullpage");
    var r = {};

    /**
     * 메일 홈
     */
    r.renderHome = function() {
        require(['mail/views/home'], function(MailHome) {
            GO.config('workspace_expansion_button_visible', true);
            var layout = FullPageLayout.create();
            layout.render();
            var content = layout.$el.find("div.go_body");
            var homeView = new MailHome();
            content.html(homeView.$el);
            homeView.render();
        });
    };

    return r;
});
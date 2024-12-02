define('laboratory/controllers/main', function (require) {

    var DefaultLayout = require('laboratory/views/layouts/default');

    return {

        renderLabDetail: function () {
            require(['laboratory/views/lab_detail'], function (ContentsView) {
                DefaultLayout.render().done(function (layout) {
                    var contentView = new ContentsView({})
                    layout.setContent(contentView);
                    contentView.render(layout.baseConfig.labFeedbackConfigModel);
                });
            });
        }
    }

});
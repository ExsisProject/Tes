define('admin/views/uploadManager/step4', function (require) {
    var Backbone = require('backbone');

    var adminLang = require("i18n!admin/nls/admin");

    require("GO.util");
    require("jquery.go-grid");

    var PopupView = Backbone.View.extend({
        tagName: "div",
        className: "step4",

        initialize: function () {
        },

        render: function () {
            this.$el.html('<h2>'+adminLang["등록이 완료 되었습니다"]+'</h2>' +
                '<br><h3>'+adminLang["계정 > 부서 관리 > 조직도 관리 에서 등록된 조직원을 확인해주세요"]+'</h3>');
        }
    });

    return PopupView;
});
define('works/views/app/report/report_item', function (require) {
    var Backbone = require('backbone');
    var ClientIdGenerator = require('works/components/formbuilder/core/cid_generator');

    return Backbone.View.extend({
        initialize: function (options) {
            this.rid = options.rid ? options.rid : ClientIdGenerator.generate();
        },

        getRid: function () {
            return this.rid;
        },

        toJson: function () {
            //상속 받은 아이들이 개별 구현 필수
            console.log('toJson');
        },

        toObject: function () {
            //상속 받은 아이들이 개별 구현 필수
            console.log('toObject');
        }
    });
})

define('admin/models/layout/readed_guide', function (require) {

    var Backbone = require('backbone');
    var _ = require('underscore');

    var ReadedGuide= Backbone.Model.extend({

        initialize: function (key){
            this.key =  key;
            this.readed = false;
            this.readCheck();
        },
        getMenuKey: function () {
            return this.uid ? this.uid : this.adminMenuKey;
        },
        url:function(){
            return    encodeURI(GO.contextRoot + "ad/api/user/readed/guide/" + this.key);
        },
        readCheck:function(){
            var self = this;
            $.ajax({
                url: this.url(),
                type: 'GET',
                async:false,
                contentType: 'application/json',
                success: function (res) {
                   self.readed = res.data;
                    if( self.readed) {
                        GO.EventEmitter.trigger("guide", "read", self.key);
                    }
                }
            })
        },
        updateReaded:function(){
            if( this.readed){ return; }
            $.ajax({
                url: this.url(),
                type: 'PUT',
                contentType: 'application/json'
            });
            GO.EventEmitter.trigger("guide", "update", this.key);
        },
        isAlreadyRead:function(){
            return this.readed;
        },
        isNotyetRead:function(){
           return !this.readed ;
        }
    });
    return ReadedGuide;
});
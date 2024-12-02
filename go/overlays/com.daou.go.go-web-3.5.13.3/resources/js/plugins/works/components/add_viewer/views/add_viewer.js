define('works/components/add_viewer/views/add_viewer', function(require){
    var Backbone = require('backbone');
    var Template = require('hgn!works/components/add_viewer/templates/add_viewer');
    var AddCollections = require('works/components/add_viewer/collections/added_collection');

    var ItemTmpl = Hogan.compile('<li data-id="{{id}}">' +
                                    '<span class="name">{{name}} {{position}}</span>' +
                                    '<span class="btn_wrap" data-btntype="attendeeDelete">' +
                                    '<span class="ic ic_del"></span></span>' +
                                 '</li>');

    var AddViewer = Backbone.View.extend({
        events: {
            "vclick span .ic_del" : "deleteEl"
        },

        initialize : function(options){
            this.checkedScroll = null;
            this.checkedCollection = new AddCollections();
            this.checkedCollection.bind('add', this._onAdd);
            this.checkedCollection.bind('remove', this._onRemove);
            if(options.hasOwnProperty('removeCallBack')) this.removeCallBack = options.removeCallBack;
        },

        render : function(){
            this.$el.html(Template);
            return this;
        },

        _onAdd : function(model, collection, options){
            if(this.checkedScroll == null) {
                $('#checkedScroll')
                    .css({'position' : 'relative', 'max-height' : '98px'})
                    .find('ul').css('padding' , '5 0');

                // ios 모바일 웹일경우만 예외 처리.
                var isIOSMobileWeb = !GO.util.isMobileApp() && (GO.util.checkOS() == 'iphone' || GO.util.checkOS() == 'ipad');
                this.checkedScroll = new IScroll('#checkedScroll', {
                    bounce: false,
                    disablePointer: true, // important to disable the pointer events that causes the issues
                    disableMouse: false, // false if you want the slider to be usable with a mouse (desktop)
                    disableTouch: isIOSMobileWeb, // false if you want the slider to be usable with touch devices
                    preventDefault: isIOSMobileWeb
                });

                if (!isIOSMobileWeb) {
                    this.checkedScroll.on('zoomStart', function(e) {
                        $("#checkedScroll")
                            .css('overflow-x', '')
                            .css('overflow-y', '');
                    });
                    this.checkedScroll.on('zoomEnd', function(e) {
                        $("#checkedScroll")
                            .css('overflow-x', 'scroll')
                            .css('overflow-y', 'hidden');
                    });
                }
            } else {
                this.checkedScroll.refresh();
            }
            $('#checkedEls').append(ItemTmpl.render(model.attributes));

        },

        _onRemove : function(model, collection, options){
            console.log('_onRemove');
            $('#checkedEls').find('li[data-id="'+model.get('id')+'"]').remove();
        },

        add : function(params){
            console.log('add');
            this.checkedCollection.add(params);
        },

        remove : function(params){
            console.log('remove');
            this.checkedCollection.remove(params);
        },

        setCollection : function(collection){
            this.checkedCollection.set(collection);
        },

        removeAllCollection : function(){
            this.checkedCollection.set();
        },

        getCollection : function(){
            return this.checkedCollection;
        },

        deleteEl : function(e) {
            var $userEl = $(e.currentTarget).parents('li');
            var deleteId = $userEl.data('id');
            this.checkedCollection.remove(this.checkedCollection.getById(deleteId));
            this.removeCallBack(deleteId);
        }
    });

    return AddViewer;

});
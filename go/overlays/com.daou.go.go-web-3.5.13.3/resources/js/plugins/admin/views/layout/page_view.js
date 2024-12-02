define('admin/views/layout/page_view', function (require) {

    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var App = require('app');

    return Backbone.View.extend({

        className:'tool_bar',
        events: {
            'click .paginate_button': 'movePage',
            'change .data_offset_sel' :'changedOffset',
        },

        initialize: function (options) {
            if( !options) { options = {}; }
            var pageOpt = options.page ? options.page : {};
            this.view = options.self;
            this.offsets = _.isArray(pageOpt.offset) ? pageOpt.offset : [20, 40, 60, 80, 100];
            this.viewPageCnt = _.isNumber(pageOpt.viewPageCnt) ? pageOpt.viewPageCnt : 5;
            this.pageChangeCb= _.isFunction(options.pageCb) ? options.pageCb: null;
            this.offsetChangeCb= _.isFunction(options.offsetCb) ? options.offsetCb: null;
            this.updatePage(pageOpt);
        },
        updatePage: function (options) {
            if( !options) { options = {}; }
            var opt = options.page ? options.page : options;

            this.page = _.isNumber(opt.page) ? opt.page : 0;
            this.offset = _.isNumber(opt.offset) ? opt.offset : 20;
            this.total = _.isNumber(opt.total) ? opt.total : 1;
            this.totalPage = _.isNumber(opt.totalPage) ? opt.totalPage :
                (this.total / this.offset + ((this.total % this.offset) === 0 ? 0 : 1));

            this.lastPageNum = this.totalPage-1;
            this.firstPage = this.page < 1;
            this.lastPage = this.page >= (this.lastPageNum);

            this.viewPage = [];
            var firstViewPage = (this.page - Math.floor( this.viewPageCnt / 2))  ;
            if( firstViewPage < 0 ){
                firstViewPage = 0 ;
            }
            var lastViewPage = firstViewPage + this.viewPageCnt;
            if( lastViewPage > this.totalPage){
                lastViewPage = this.totalPage ;
            }

            for( var i = firstViewPage ; i < lastViewPage; i ++ ){
                this.viewPage[this.viewPage.length] = i;
            }
            this.render();
        },
        tpl: function () {
            var self = this;
            var tpl = '<div class="tool_bar">' +
                '<div class="critical custom_bottom"></div>' +
                '<div class="dataTables_length"><label>' +
                '<select size="1" class="data_offset_sel" name="deptList_length" aria-controls="deptList">' ;

                _.forEach(this.offsets, function(offset){
                        tpl += '<option value="(val)" (sel)>(val)</option>'.replace('(val)', offset).replace('(val)', offset)
                        .replace('(sel)', self.offset === offset ? '"selected"' :'')
                });
                tpl += '</select></label></div>' +

                '<div class="dataTables_paginate paging_full_numbers" id="deptList_paginate">' +
                '<a tabindex="0" class="first paginate_button (disable)" title="맨앞" id="deptList_first" data-bypass="true"></a>'
                    .replace('(disable)', this.firstPage ? 'paginate_button_disabled' :'' ) +
                '<a tabindex="(targetPage)" class="previous paginate_button (disable)" title="이전" id="deptList_previous" data-bypass="true"></a>'
                    .replace('(disable)', this.firstPage ? 'paginate_button_disabled' :'' ).replace('(targetPage)', ((this.page -1 ) +'') ) +
                '<span>' ;

                _.forEach(this.viewPage, function(page){
                    tpl += '<a tabindex="(targetPage)" class="paginate_(active)" data-bypass="true">(viewPage)</a>'.replace('(targetPage)', page)
                        .replace('(active)', self.page === page ? 'active' : 'button')
                        .replace('(viewPage)', page + 1)
                });
                tpl += '</span>' +
                '<a tabindex="(targetPage)" class="next paginate_button (disable)" title="다음" id="deptList_next" data-bypass="true"></a>'
                    .replace('(disable)', this.lastPage ? 'paginate_button_disabled' :'' ).replace('(targetPage)', ((this.page +1 ) +'') ) +
                '<a tabindex="(targetPage)" class="last paginate_button (disable)" title="맨뒤" id="deptList_last" data-bypass="true"></a>'
                    .replace('(disable)', this.lastPage ? 'paginate_button_disabled' :'' ).replace('(targetPage)', ((this.lastPageNum ) +'') ) +
                '</div>' +
                '</div>';
            return tpl;
        },

        changedOffset:function(e){
            var target= $(e.currentTarget);
            var offset= target.val();
            if(this.offsetChangeCb){
                this.offsetChangeCb(this.view, offset);
            }
        },
        movePage:function(e){
            var target= $(e.currentTarget);
            var page = target.attr('tabindex');
            if( page < 0 || page > this.lastPageNum){ return; }
            if( page === this.page){ return; }
            if(this.pageChangeCb){
                this.pageChangeCb(this.view, page);
            }
        },
        render: function () {
            this.$el.html(this.tpl());
            this.$el.find('.data_offset_sel').val(this.offset);
            return this;
        },
    });
});
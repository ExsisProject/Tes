// 결재이력
define([
    // 필수
	"jquery",
	"underscore",
    "backbone",
    "app",
    
    "views/profile_card",
    
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
],

function(
    $,
	_,
    Backbone,
    App,
    
    ProfileCardView,
    
    commonLang,
	approvalLang
) {

	/**
     * 문서 열람자 히스토리 Collection
     */
    var ReaderHistoryCollection = Backbone.Collection.extend({
        url: function() {
            if (this.isAdmin) {
                return '/ad/api/approval/manage/document/' + this.docId + '/readerhistory';
            } else {
                return '/api/approval/document/' + this.docId + '/readerhistory';
            }
        },
        initialize: function(options) {
            this.docId = options.docId;
            this.isAdmin = options.isAdmin;
        }
    });

    /**
     * 문서 열람자 히스토리 목록 View
     */
    var ReaderHistoryListView = Backbone.View.extend({
    	tagName: 'div',
        className: 'aside_wrapper_body',
        
        events: {
            "click a[data-userid]" : "_showUserProfile"
        },

        initialize: function(options) {
            this.docId = options.docId;
            this.isAdmin = options.isAdmin;
            
            if (!_.isObject(this.options.collection)) {
            	this.collection = new ReaderHistoryCollection({ 
                    isAdmin : this.isAdmin,
                    docId : this.docId
                });
            	this.collection.fetch({ async : false });
			}else{
				this.collection = new ReaderHistoryCollection(this.options.collection);
			}
        },

        render: function() {
            var compiled = Hogan.compile(this._renderTemplate());
            var histories = [];

            this.collection.each(function(model) {
                histories.push(_.extend(model.toJSON(), {
                    'latestReadAt' : GO.util.basicDate(model.get('latestReadAt'))
                }));
            });

            this.$el.html(compiled.render({
                histories: histories,
                lang: {
                    '조회수': approvalLang['조회수'],
                    'no_histories' : approvalLang['열람기록이 존재하지 않습니다.']
                }
            }));

            return this;
        },

        show: function() {
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        },

        _renderTemplate: function() {
            var htmls = [];
            htmls.push('{{#histories}}');
            htmls.push('<ul class="reply">');
            htmls.push('    <li>');
            htmls.push('        <span class="photo"><a data-userid="{{readerId}}">');
            htmls.push('            <img src="{{#readerThumbnail}}{{readerThumbnail}}{{/readerThumbnail}}{{^readerThumbnail}}resources/images/photo_profile_small.jpg{{/readerThumbnail}}">');
            htmls.push('        </a></span>');
            htmls.push('        <div class="msg_wrap">');
            htmls.push('            <div class="info">');
            htmls.push('                <span class="name">{{readerName}} {{readerPosition}}</span>');
            htmls.push('                <span class="department">{{lang.조회수}} {{readCount}}</span>');
            htmls.push('                <span class="date">{{latestReadAt}}</span>');
            htmls.push('            </div>');
            htmls.push('        </div>');
            htmls.push('    </li>');
            htmls.push('</ul>');
            htmls.push('{{/histories}}');
            htmls.push('{{^histories}}');
            htmls.push('<ul class="reply">');
            htmls.push('    <li class="inactive last" style="margin-left: 10px">{{lang.no_histories}}</li>');
            htmls.push('</ul>');
            htmls.push('{{/histories}}');
            return htmls.join('');
        },

        _showUserProfile : function(e) {
            if(!$(e.currentTarget).attr('data-userid')){
                return;
            }

            ProfileCardView.render($(e.currentTarget).attr('data-userid'), e.currentTarget);
        }
    });

	return ReaderHistoryListView;
});
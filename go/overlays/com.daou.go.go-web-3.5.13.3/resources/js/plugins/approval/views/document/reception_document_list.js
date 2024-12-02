// 결재이력
define([
    // 필수
	"jquery",
	"underscore",
    "backbone",
    "app",
    
    "approval/models/doclist_item",
    
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
],

function(
    $,
	_,
    Backbone,
    App,
    
    DocListItemModel,
    
    commonLang,
	approvalLang
) {

	/**
     * 특정 문서의 수신 문서 Collection
     */
    var ReceptionDocumentCollection = Backbone.Collection.extend({
        model: DocListItemModel,
        url: function() {
            if (this.isAdmin) {
                return ['/ad/api/approval/manage/document', this.docId , 'reception'].join('/');
            } else {
                return ['/api/approval/document', this.docId , 'reception'].join('/');
            }
        },
        initialize: function(options) {
            this.docId = options.docId;
            this.isAdmin = options.isAdmin;
        }
    });
    
    /**
     * 특정 문서 수신 문서 목록 View
     */
    var ReceptionDocumentListView = Backbone.View.extend({
    	tagName: 'div',
        className: 'aside_wrapper_body',
        
        initialize: function(options) {
            this.docId = options.docId;
            this.isAdmin = options.isAdmin;
            if (!_.isObject(this.options.collection)) {
            	this.collection = new ReceptionDocumentCollection({ 
                    isAdmin: this.isAdmin, 
                    docId: this.docId 
                });
            	this.collection.fetch({ async : false });
			}else{
				this.collection = new ReceptionDocumentCollection(this.options.collection);
			}
        },
        render: function() {
        	var receptions = [];
            this.collection.each(function(model) {
                receptions.push({
                    'statusName' : model.getDocStatusName(),
                    'statusClass' : model.getDocStatusClass(),
                    'receiverDeptName' : model.get('receiverDeptName'),
                    'receiverUserName' : model.get('receiverUserName'),
                    'receivedDocOwnerDeptName' : model.get('receivedDocOwnerDeptName'),
                    'returnComment' : model.get('returnComment')
                });
            });

            this.$el.html(Hogan.compile(this._renderTemplate()).render({
                receptions: receptions,
                lang: {
                    'no_receptions' : approvalLang['수신자로 지정된 곳이 없습니다.']
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
            htmls.push('{{#receptions}}');
            htmls.push('<ul class="list_line">');
            htmls.push('    <li>');
            htmls.push('        <span class="state {{statusClass}}">{{statusName}}</span><span class="department">{{receivedDocOwnerDeptName}} {{#receiverUserName}}({{receiverDeptName}} {{receiverUserName}}){{/receiverUserName}}</span>');
            htmls.push('		{{#returnComment}}<span class="" style="display: block;line-height: 1.4;color: #333;position: relative;margin-left: 57px;">{{returnComment}}</span>{{/returnComment}}');
            htmls.push('    </li>');
            htmls.push('</ul>');
            htmls.push('{{/receptions}}');
            htmls.push('{{^receptions}}');
            htmls.push('<ul class="reply">');
            htmls.push('    <li class="inactive last" style="margin-left: 10px">{{lang.no_receptions}}</li>');
            htmls.push('</ul>');
            htmls.push('{{/receptions}}');
            return htmls.join('');
        }
    });

	return ReceptionDocumentListView;
});
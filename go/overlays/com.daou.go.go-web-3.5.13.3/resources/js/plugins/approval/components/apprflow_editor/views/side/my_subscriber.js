define("approval/components/apprflow_editor/views/side/my_subscriber", [
    "approval/components/apprflow_editor/views/base_tab_item", 
    "hgn!approval/components/apprflow_editor/templates/side/my_subscriber",
    
    "approval/models/subscriber_group",
    "approval/collections/subscriber_groups",
    
    "i18n!nls/commons",
    "i18n!approval/nls/approval",
], 

function(
	BaseTabItemView, 
	MySubscribersTmpl, 
	
	SubscriberModel, 
	SubscriberCollection, 
	commonLang,
    approvalLang
) {
	var lang = {
        'delete' : commonLang['삭제'],
        'group_count_title': approvalLang['{{count}}개의 결재선이 있습니다.'], 
        'msg_empty_my_subscribers' : approvalLang['개인 그룹이 없습니다.']
    };
	
	/**
     * 탭 뷰 (나의 결재선, 조직도 포함)
     */
    var MyApprLineSideView = BaseTabItemView.extend({
    	
    	tabId: "mysubscriber",
    	// TODO: 다국어 처리
    	tabName: approvalLang['개인 그룹'], 
    	
    	docStatus: null,
        observer: null, 
        
        events: {
        	"click a.my_line_a": "_onItemSelected", 
        	"click a.ic_del": "_onItemDeleted"
        }, 
        
        initialize: function(options) {
        	options = options || {};
        	BaseTabItemView.prototype.initialize.apply(this, arguments);
        	
            this.collection = new SubscriberCollection();
            this.observer = options.observer;
            this.docStatus = options.docStatus;
            
            this.$el.addClass('content_tab_wrap');
            
            this.listenTo(this.observer, 'reloadMySubscriber', this.render);
            this.listenTo(this.observer, 'deselectSubscriber', this.deselectSubscriber);
        },
        
        render: function() {
            this.$el.empty();
			if (GO.util.isIE8()) {
				this.$el.css({'min-height': '353px', 'max-height' : '353px'});
			}else{
				this.$el.css({'min-height': '339px', 'max-height' : '339px'});				
			}
            this.collection.fetch({
                success: $.proxy(this._renderMySubscriberList, this)
            });
        },
        
        show: function() {
            this.$el.show();
        },
        
        hide: function() {
            this.$el.hide();
        },
        
        isShowing: function() {
            return true;
        },
        
        isHiding: function() {
            return true;
        },
        
        deselectSubscriber : function(){
        	this.collection.each(function(model) {
        		model.set("isSelected", false);
        	});
        	this._renderMySubscriberList(this.collection)
        },
        
        _renderMySubscriberList: function(collection, response, options) {
        	
            this.$el.html(MySubscribersTmpl({
                'lang' : lang,
                'hasMySubscribers': !collection.isEmpty(),
                'mySubscribers' : collection.map(function(model) {
                    return {
                        'id' : model.get('id'),
                        'title' : model.get('title'),
                        'groupCount' : model.get('subscriber').nodes.length,
                        'groupCountTitle' : GO.i18n(lang['group_count_title'], "count", model.get('subscriber').nodes.length),
                        'isSelected' : model.get('isSelected') || false,
                        'delete' : lang['delete'],
                    	'apply' : lang['apply']
                    };
                })
            }));
        },
        
        _onItemSelected: function(e) {
        	var self = this;
        	var $target = $(e.currentTarget);
        	
        	e.preventDefault();
        	
            var $li = $target.parents('li.feed');
        	if ($li.hasClass('inactive')) {
        		return false;
        	}
        	var lineId = $li.find('a.my_line_a').data('id');
        	
        	this.collection.each(function(model) {
        		model.set("isSelected", false);
        	});
        	
            var model = this.collection.get(lineId);
            model.set('isSelected', true);
            this.observer.trigger('mySubscriberSelected', model.get('subscriber'));
            
            this.render();
        },
        
        _onItemDeleted: function(e) {
        	var pid = 'gopopup-delmysubscriber';
            var aButton = $(e.target).parent().find('a.my_line_a');
            var confirmCallback = $.proxy(this._deleteAsPeronalSubscriberOkButtonCallback, this, aButton.attr('data-id'), targetEl);
            
            e.preventDefault();
            
            // GO-16964: 더블클릭시 복수개의 창이 호출되는 것을 방지하기 위해 $.goConfirm을 $.goPopup을 쓰도록 변경
            if($('#' + pid).length > 0) return;
            
            $.goPopup({
            	id: pid, 
            	title : lang['delete_as_my_line'],
				message : approvalLang['선택한 항목을 삭제하시겠습니까?'],
				modal : true,
				allowPrevPopup : true,
				closeIconVisible : false,
				buttons : [{
					'btext' : commonLang['확인'],
					'btype' : 'confirm',
					'callback' : confirmCallback
				}, {
					'btext' : commonLang['취소'],
					'btype' : 'normal',
					'callback' : function() {}
				}]
            });
            
            e.stopPropagation();
        },
        
        _deleteAsPeronalSubscriberOkButtonCallback: function(subscriberId, targetEl, rs, event){
            var subscriberModel = new SubscriberModel();
            subscriberModel.save({
                id : subscriberId
            }, 
            {
                type : 'DELETE',
                success: $.proxy(function(model, resp, opts) {
                    $.goMessage(commonLang['삭제되었습니다.']);
                    this.render();
                    $(targetEl).closest('li').remove();
                    rs.close('', event);
                }, this),
                error: function(model, resp, opts) {
                    $.goMessage(commonLang['관리 서버에 오류가 발생하였습니다']);
                }
            });
        }, 
    	
    	/**
    	 * @Override
    	 */
    	checkAuth: function() {
    		return true;
    	}
    });
    
    return MyApprLineSideView;
});
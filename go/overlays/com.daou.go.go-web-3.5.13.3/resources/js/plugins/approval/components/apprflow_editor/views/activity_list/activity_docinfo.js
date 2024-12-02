define("approval/components/apprflow_editor/views/activity_list/activity_docinfo", [
	"backbone",
	"text!approval/components/apprflow_editor/templates/activity_list/empty_activity.html", 
	
	"i18n!nls/commons", 
	"i18n!approval/nls/approval"
], 

function(
	Backbone, 
	emptyActivityTpl, 
	
	commonLang, 
	approvalLang
) {

	var DEFAULT_DROPPABLE_CLASSNAME = 'appr-activity';
	
	/**
	 * ActivityGroupView의 activities를 그리기 위한 뷰
	 */
	var ActivityDocInfoView = Backbone.View.extend({
		tagName: 'table', 
		className: 'type_normal tb_approval_line', 
		dndDropTarget: DEFAULT_DROPPABLE_CLASSNAME,
		
		__disabled__: false, 
		
		template: function() {}, 
		
		events: {
			"click .btn-remove": "_onClickRemove"
		}, 
		
		lang: function() {
			return {
				"name": commonLang["이름"], 
				"department": commonLang["부서"], 
				"email": commonLang["이메일"], 
				"remove": commonLang["삭제"],
				"emptyMessage": this.isDisabled() ? approvalLang["항목을 추가할 수 없습니다"] : approvalLang["드래그하여 항목을 추가할 수 있습니다"]
			};
		},
		
		initialize: function(options) {
			options = options || {};
			
			if(options.dndDropTarget) {
				this.dndDropTarget = options.dndDropTarget;
			}
			
			if(options.observer && options.observer.hasOwnProperty('bind')) {
    			this.observer = options.observer;
    		} else {
    			this.observer = _.extend({}, Backbone.Events);
    		}
			
			this.__disabled__ = false;
			
			if(options.disable) {
				this.disable();
			}
			
			this.listenTo(this.collection, 'add remove', this.render);
		}, 
		
		render: function() {
			if(_.isFunction(this.template)) {
				this.$el.html(this.template({
					// 사이드 조직도의 dndDropTarget 값과 맞추어야 한다..
					"dndDropClassName": this.dndDropTarget, 
					"activities": this.parseActivities(),
					"isEnabled": !this.isDisabled(),
					"lang": _.result(this, 'lang')
				}, {
					"emptyActivity": emptyActivityTpl
				}));
				this.observer.trigger('activateDNDDroppable');
			}
		}, 
		
		/**
		 * 삭제, 정렬 등에 사용하기 위한 model의 고유 키 정의(Overridable)
		 */
		getUniqId: function(model) {
			return model.id;
		},
		
		sortByIds: function(uniqIds) {
			var newModels = [];
			
			if(!_.isArray(uniqIds)) {
				uniqIds = [uniqIds];
			}
			
			_.each(uniqIds, function(uid) {
				var m = this.collection.find(function(model) {
					// 둘다 같은 문자타입으로 만들어준다.
					return '' + this.getUniqId(model) === '' + uid;
				}, this);
				
				newModels.push(m)
			}, this);
			
			this.collection.reset(newModels);
		}, 
		
		drawDropHelper: function(targetActivitySeq) {
			var $target;
						
			if (targetActivitySeq === 'last') {
				$target = this.$el.find('tr.activity:last');
			} else {
				// 조직도에서 dropCheck시 주는 seq가 +1이 되어있다. 왜 +1을 했는지는 알수 없음
				$target = this.$el.find('tr.activity:eq(' + (targetActivitySeq - 1) + ')');
			}
			
			var timeoutMillisecondsForDraggableUIDelay = 10; // DraggableUI에서 dropOut에 대한 callback 실행이 조금 뒤늦게 발생함에 따른 처리. => dropCheck보다 dropOut이 뒤에 발생하는 경우를 처리한다.
			setTimeout(function() {				
				$target.find('td').each(function() {
					$(this).css({
                       'border-bottom': '2px solid black'
                   });
				})
				
			}, timeoutMillisecondsForDraggableUIDelay);
		}, 
		
		clearDropHelper: function() {
			this.$el.find('td').each(function() {
				$(this).attr('style', '');
			})
		}, 
		
		/**
		 * 하나의 액티비티를 지운다
		 * 
		 * @param any id 지우는 기준이 되는 고유 키값
		 * model의 구조가 다르기 때문에 하위 뷰에서 별도로 구현해준다.
		 */
		remove: function(id) {
			var targetModel = this.collection.find(function(model) {
				return this.getUniqId(model) === id;
			}, this);
			this.collection.remove(targetModel);
		},
		
		/**
		 * 목록 리스트를 파싱하여 반환한다.
		 */
		parseActivities: function() {
			return this.collection.toJSON();
		}, 
		
		_onClickRemove: function(e) {
			var $target = $(e.currentTarget);
			var targetId = $target.data('id');
			
			e.preventDefault();
			this.remove(targetId);
		}, 
		
		disable: function() {
			this.__disabled__ = true;
		}, 
		
		isDisabled: function() {
			return this.__disabled__;
		}
	});
	
	return ActivityDocInfoView;
});
/**
 * 코딩 순서
 * 	가. 기본 코드 작성 ( 1번 과정)
 * 	나. 뷰 및 이벤트 선언 ( 2번 ~ 3번 )
 *  다. 뷰 액션들 선언( 4번 )
 *  라. private function 정의
 *  
 *  
 */
(function() {
	
	/**
	 * 1. 의존 라이브러리 선언합니다.
	 * 	- jquery, backbone, underscore, app은 항상 포함
	 */
	define([
        // 필수
    	"jquery",
		"underscore", 
        "backbone", 
        "app", 
        
        // 뷰에 따라 달라짐
        "path/to/child_view", 
        "hgn!path/to/parent_template"
    ], 
    
    function(
		$, 
		_, 
		Backbone, 
		GO, 
		
		ChildView, 
		ParentTemplate
	) {
		
		/**
		 * 2. 뷰를 선언합니다..
		 * 	- 뷰 이름 규칙: 파일명에 View를 후미에 붙인다.(CamelCase)
		 */
		var ParentView = Backbone.View.extend({
			tagName: 'div', 
			className: 'class1 class2', 
			
			/**
			 * 2.3 이벤트 정의합니다.
			 */
			events: {
				"click .btn-submit": "_submit"
			}, 
			
			/**
			 * 2.1 뷰 초기화합니다.
			 * 	- 템플릿이 있으면 템플릿에 대한 초기화 작업을 합니다.
			 */
			initialize: function() {
				// 단일 모델일 경우 model 초기화
				if(!this.model) {
					this.model = new ParentModel();
				}
				
				// 리스트형일 경우 collection 초기화
				if(!this.collection) {
					this.collection = new ParentCollection();
				}
				
				// 그외 option 값에 대한 초기화가 필요한 경우 수행(옵션)
				_.defaults(this.options, {
					'attr1': false,
					//...
				});
				
				this.$el.data('instance', this);
			}, 
			
			/**
			 * 2.2 뷰를 렌더링 합니다.
			 * 	- 템플릿을 가져와서 변수 치환하고 엘리먼트에 append
			 */
			render: function() {
				this.$el.append(ParentTemplate({
					'attr1': false, 
					'attr2': 'some text',
					//...
				}));
				
				/**
				 * 자식이 한개의 뷰를 가질 경우
				 */
				this.childView = new ChildView({ "model": this.model });
				this.$el.find('.selector').append(this.childView.el);
				this.childView.render();
				
				/**
				 * 자식이 목록형일 경우
				 */
				this.childrenView = [];
				this.collection.each(function(model) {
					var childView = new ChildView({ "model": this.model });
					this.childrenView.push(childView);
					this.$el.find('.selector').append(childView);
					childView.render();
				}, this);
				
				/**
				 * 자식뷰에서 발생한 이벤트를 전달받아야 할 경우
				 */
				this.childView.$el.on('changeStatus', function(e, childView, param1, param2) {
					
				});
			}, 
			
			/**
			 * 2.2 뷰를 해제합니다.
			 */
			release: function() {
				this.$el.off();
				this.$el.empty();
				this.remove();
			}, 
			
			/**
			 * 4. 뷰의 액션들을 정의합니다.
			 * 	- 외부에서 호출되는 액션 함수들 정의
			 */
			show: function() {
				// private 메소드 호출하는 경우
				privateFunc(this, 1, 2);
				this.$el.show();
			}, 
			
			hide: function() {
				this.$el.hide();
			}, 
			
			
			/**
			 * 3. 이벤트 함수들을 정의합니다.
			 * 	- events 속성에 정의된 명칭과 1:1 매핑
			 */
			_submit: function(e) {
				
			}
		}, 
		
		/**
		 * 정적 함수들 선언합니다.(필요시에만 선언)
		 */
		{
			// 뷰가 싱글톤 객체여야 하는 경우 다음과 같이 생성
			__instance__: null, 
			
			create: function() {
                if(this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
                return this.__instance__;
            } 
		});
		
		/**
		 * 5. private method 선언
		 * 	- 필요한 경우 view 객체를 파라메터로 전달
		 */
		function privateFunc(view, param1, param2) {
			
		}
		
		return ParentView;
		
	});
	
})();
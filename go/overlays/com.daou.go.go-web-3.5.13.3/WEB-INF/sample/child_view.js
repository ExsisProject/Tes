/**
 * 코딩 순서
 * 	가. 기본 코드 작성 ( 1번 과정)
 * 	나. 뷰 및 이벤트 선언 ( 2번 ~ 3번 )
 *  다. 뷰 액션들 선언( 4번 )
 *  라. private function 정의
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
        "hgn!path/to/child_template"
    ], 
    
    function(
		$, 
		_, 
		Backbone, 
		GO, 
		
		ChildTemplate
	) {
		
		/**
		 * 2. 뷰를 선언합니다..
		 * 	- 뷰 이름 규칙: 파일명에 View를 후미에 붙인다.(CamelCase)
		 */
		var ChildView = Backbone.View.extend({
			tagName: 'div', 
			className: 'class1 class2', 
			
			/**
			 * 2.3 이벤트 정의합니다.
			 */
			events: {
				
			}, 
			
			/**
			 * 2.1 뷰 초기화합니다.
			 * 	- 템플릿이 있으면 템플릿에 대한 초기화 작업을 합니다.
			 */
			initialize: function() {
				
			}, 
			
			/**
			 * 2.2 뷰를 렌더링 합니다.
			 * 	- 템플릿을 가져와서 변수 치환하고 엘리먼트에 append
			 */
			render: function() {
				
			}, 
			
			/**
			 * 2.2 뷰를 해제합니다.
			 */
			release: function() {
				
			}, 
			
			/**
			 * 4. 뷰의 액션들을 정의합니다.
			 * 	- 외부에서 호출되는 액션 함수들 정의
			 */
			changeStatus: function() {
				// 부모뷰에 이벤트를 전달할 경우...
				this.$el.trigger('changeStatus', [this, 1, 2]);
			}, 
			
			/**
			 * 3. 이벤트 함수들을 정의합니다.
			 * 	- events 속성에 정의된 명칭과 1:1 매핑
			 */
		});
		
		return ChildView;
		
	});
	
})();
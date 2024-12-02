define('board/models/board', function(require) {
	
	var Backbone = require('backbone');
	var GO = require('app');
	
	var TYPE_CLASSIC = 'CLASSIC';
	var TYPE_STREAM = 'STREAM';
	
	/**
	 * SimpleBoardModel
	 */
	var BoardModel = Backbone.Model.extend({
		
		getIconType: function() {
			var result;
			
			if(this.isStreamType()) {
				result = 'feed';
			} else if(this.isClassicType()) {
				result = 'classic';
			}
			
			return result;
		}, 
		
		isStreamType: function() {
			return this.get('type') === TYPE_STREAM;
		}, 
		
		isClassicType: function() {
			return this.get('type') === TYPE_CLASSIC;
		}, 
		
		/**
		 * 주의) 이 항목은 게시판이 다른 부서에 공유되어 있는지의 여부이다.
		 */
		isSharedBoard: function() {
			return !!this.get('sharedFlag');
		}, 
		
		isAnonmyBoard: function() {
			return this.get('anonmyFlag');
		},
		
		/**
		 * 주의: 현재 flag가 반대로 내려온다. publicFlag가 false여야 공개게시판이다.
		 */
		isPrivateBoard: function() {
			return !!this.get('publicFlag');
		}, 
		
		hasNewPost: function() {
			return this.get('lastPostedAt') && GO.util.isCurrentDate(this.get('lastPostedAt'));
		},
		
		/**
		 * 게시판 운영자 이름 목록
		 */
		getManagerNames: function() {
			return this.get('managerName') || [];
		}
	});
	
	var BoardCollection = Backbone.Collection.extend({
		model: BoardModel
	});
	
	return {
		Model: BoardModel, 
		Collection: BoardCollection
	};
	
});
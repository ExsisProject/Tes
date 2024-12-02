define('works/models/applet_simple', function(require) {
	// dependency
	var Backbone = require('backbone');
	var GO = require('app');
	var when = require('when');

	/**
	 * 애플릿 폼 모델(SimpleAppletModel)
	 * 참고: http://wiki.daou.co.kr/display/go/SimpleAppletModel
	 * 
	 * 애플릿의 기본 정보를 표현하는 가장 단순한 애플릿 모델
	 */
	return Backbone.Model.extend({

		url: function() {
			return GO.config('contextRoot') + 'api/works/applets/'; 
		},

        isFavorite: function() {
            return this.get('favoriteFlag') == true;
        },

		addFavorite: function() {
            return this._toggleFavorite(true);
		},

        removeFavorite: function() {
            return this._toggleFavorite(false);
        },

        _toggleFavorite: function(flag) {
            return this.save({}, {
                url: [_.result(this, 'urlRoot'), 'applets', 'favorites', this.id].join('/'),
                type: flag ? 'POST' :'DELETE',
                success: $.proxy(function() {
                    this.set('favoriteFlag', flag);
                }, this)
            });
        },
        
        isAdmin : function(){
        	return this.get('admin') == true;
        },
        
		urlRoot: function() {
			return GO.config('contextRoot') + 'api/works';
		},
		
		isRecent : function(createAt) {
			return createAt ? GO.util.isCurrentDate(createAt, 1) : false;
		}
	});
});
(function() {
  define(function(require) {
    var Backbone = require("backbone"), 
        App = require("app"); 
    
    var model = Backbone.Model.extend({
      url: function() {
        // mock 모델을 가지고 온다.
        return App.fixture.getUrl("profile");
        // 실서비스는 다음으로 변경
        // return "/api/user/profilecard";
      }
    });
    
    return model;
  });
}).call(this);


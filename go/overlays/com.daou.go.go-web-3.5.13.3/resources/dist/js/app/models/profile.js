(function(){define(function(require){var e=require("backbone"),t=require("app"),n=e.Model.extend({url:function(){return t.fixture.getUrl("profile")}});return n})}).call(this);
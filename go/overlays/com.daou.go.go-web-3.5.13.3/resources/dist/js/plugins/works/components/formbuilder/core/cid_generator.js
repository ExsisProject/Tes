define("works/components/formbuilder/core/cid_generator",function(require){var e=require("underscore"),t="_";return{generate:function(){return t+Math.random().toString(36).substr(2,9)}}});
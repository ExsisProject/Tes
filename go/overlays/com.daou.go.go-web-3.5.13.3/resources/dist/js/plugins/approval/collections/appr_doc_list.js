define(["jquery","approval/collections/appr_base_doclist"],function(e,t){var n=t.extend({url:function(){return"/api/approval/doclist/approve/"+this.type+"?"+this._makeParam()},getCsvURL:function(){return"/api/approval/doclist/approve/all/csv?"+this._makeParam()}});return n});
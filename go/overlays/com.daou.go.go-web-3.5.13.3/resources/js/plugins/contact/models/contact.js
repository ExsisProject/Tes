define(function(require){
    var Backbone = require("backbone");
	var _ = require("underscore");

    var model = Backbone.Model.extend({

        getBookOwner : function(){
            return this.get("bookOwner");
        },

        isDepartment : function(){
			return _.isEqual(this.getBookOwner()["ownerType"],"DEPARTMENT");
        },

        isCompany : function(){
			return _.isEqual(this.getBookOwner()["ownerType"],"COMPANY");
        },

        isUser : function(){
			return _.isEqual(this.getBookOwner()["ownerType"],"USER");
        },

		getOwnerType : function(){
			return this.getBookOwner()["ownerType"];
		},

		/**
		 * 부서 주소록에서 사용
		 * @returns {*}
         */
		getDeptId : function(){
			if(!this.isDepartment()){
				return null;
			}

			return this.getBookOwner()["ownerId"];
		},

		getId : function(){
			return this.get("id");
		},

		/**
		 * 전사 주소록의 경우 group을 1개만 가질수 있음.
		 * @returns {*}
         */
		getCompanyGroupId : function(){
			return this.get("groups")[0]["id"];
		}
    });
    return model;
});
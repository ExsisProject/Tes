define("works/components/filter/models/filter",function(require){var e=require("backbone"),t=require("i18n!nls/commons"),n=require("i18n!works/nls/works"),r=require("works/components/filter/collections/filter_conditions");return e.Model.extend({type:"mine",initialize:function(e){e=e||{},this.type=e.type||this.type,this.modelName="filter",this.useDocNo=e.useDocNo},defaults:{name:t["\uac80\uc0c9"],conditions:[]},urlRoot:function(){var e=this.isOthersFilter()?"mine":this.type;return GO.contextRoot+"api/works/applets/"+this.get("appletId")+"/filters/"+e},getSearchQuery:function(){var e=new r(this.get("conditions")),t=[],n=e.getSearchQueryString(),i=this.get("searchKeyword");n&&t.push(n);if(i){var s='textContent:"'+this._escapeSpecialCharacter(i)+'"';this.useDocNo&&(s="("+s+' OR docNo:"'+this._escapeSpecialCharacter(i)+'")'),t.push(s)}return t.join(" AND ")},validate:function(e){if(e.name.length>64||e.name.length<1)return GO.i18n(t["0\uc790\uc774\uc0c1 0\uc774\ud558 \uc785\ub825\ud574\uc57c\ud569\ub2c8\ub2e4."],{arg1:1,arg2:64})},setType:function(e){this.type=e},isOthersFilter:function(){return this.type==="others"},_escapeSpecialCharacter:function(e){return e.replace(/[\\+!():^\[\]{}~*?|&;\/-\\"]/g,"\\$&")}},{getCreatedByFilterOptions:function(){return{name:n["\ub0b4\uac00 \ub4f1\ub85d\ud55c \ub370\uc774\ud130"],conditions:r.getCreatedByConditions()}}})});
define(["jquery","underscore","backbone","app","models/user_profile","hgn!approval/templates/document/doc_receive","i18n!nls/commons","i18n!approval/nls/approval","jquery.go-sdk","jquery.go-popup"],function(e,t,n,r,i,s,o,u){var a={"\uc218\uc2e0 \ubd80\uc11c \uc7ac\uc9c0\uc815":u["\uc218\uc2e0 \ubd80\uc11c \uc7ac\uc9c0\uc815"],"\uc18c\uc18d\ub41c \ubd80\uc11c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4":u["\uc18c\uc18d\ub41c \ubd80\uc11c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4"],"\ub2f4\ub2f9\uc790\ub97c \uc9c0\uc815\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4":u["\ub2f4\ub2f9\uc790\ub97c \uc9c0\uc815\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4"],"\ub2f4\ub2f9\ubd80\uc11c":u["\ub2f4\ub2f9\ubd80\uc11c"],"\ucde8\uc18c":o["\ucde8\uc18c"],"\ud655\uc778":o["\ud655\uc778"]},f=n.Model.extend({defaults:{id:0,deptId:0},initialize:function(e){this.docId=e},url:function(){return"/api/approval/document/"+this.docId+"/receptiondept"}}),l=n.View.extend({el:".layer_normal .content",initialize:function(e){this.docId=e.docId,this.receiverDeptId=e.receiverDeptId,this.receiverUserId=e.receiverUserId,this.model=i.read(GO.session().id)},render:function(e,t){var n=this._makeTemplate(),r=this;e.find(t).html(n.render({lang:a,deptMembers:this.model.get("deptMembers")}))},assignReceiver:function(t,n){if(e("#ressignDept option:selected").val()==""){e.goMessage(a["\ub2f4\ub2f9\uc790\ub97c \uc9c0\uc815\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4"]);return}var r=(new f(this.docId)).save({id:this.receiverUserId,deptId:e("#ressignDept option:selected").val()});r.done(t).fail(n)},_makeTemplate:function(){return Hogan.compile(['<p class="desc">{{lang.\uc218\uc2e0 \ubd80\uc11c \uc7ac\uc9c0\uc815}}</p>',"<br>",'<div id="receiverPopupArea">',"    <dl>","        <dt>{{lang.\ub2f4\ub2f9\ubd80\uc11c}}</dt>","        <dd>",'            <select id="ressignDept">',"                {{#deptMembers}}",'                <option value = "{{deptId}}"> {{deptName}}</option>',"                {{/deptMembers}}","                {{^deptMembers}}",'                <option value = ""> {{lang.\uc18c\uc18d\ub41c \ubd80\uc11c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4}}</option>',"                {{/deptMembers}}","            </select>","        </dd>","    </dl>","</div>"].join("\n"))},release:function(){this.$el.off(),this.$el.empty()}});return l});
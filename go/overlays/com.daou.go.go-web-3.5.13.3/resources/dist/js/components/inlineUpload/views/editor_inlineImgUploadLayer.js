(function(){define(["backbone","app","i18n!nls/commons","file_upload","jquery.go-validation"],function(e,t,n,r){var i={upload:n["\uc0ac\uc9c4 \uc62c\ub9ac\uae30"],select_file:n["\ud30c\uc77c \uc120\ud0dd"],alert_max_attach_size:n["\ucca8\ubd80\ud560 \uc218 \uc788\ub294 \ucd5c\ub300 \uc0ac\uc774\uc988\ub294 0MB \uc785\ub2c8\ub2e4."],alert_format:n["\ud3ec\uba67 \uacbd\uace0"]},s=e.View.extend({events:{},initialize:function(e){this.options=e||{},this.elPlaceHolder=this.options.elPlaceHolder},render:function(){var e=$.goPopup({header:i.upload,width:"250px",pclass:"layer_normal layer_date_set",contents:'<div style="text-align:center"><span class="btn_minor_s" id="imgUpload" style="padding:0 !important;"></span></div>',modal:!0,allowPrevPopup:!0});return this.initFileUpload(this.elPlaceHolder,e),this},initFileUpload:function(e,n){var s=this,o=i.select_file,u={el:"#imgUpload",context_root:GO.contextRoot,button_text:"<span class='buttonText'>"+o+"</span>",url:(GO.instanceType=="admin"?"ad/":"")+"api/file?GOSSOcookie="+$.cookie("GOSSOcookie"),file_type:"*.jpeg;*.jpg;*.gif;*.png;*.bmp",file_types_description:"",accept:"image/*"},a=0;(new r(u)).queue(function(){a++}).start(function(e,n){var r=n.size/1024/1024;if(10<r)return $.goSlideMessage(t.i18n(i.alert_max_attach_size,"arg1","10"),"caution"),!1;var s=n.type.toLowerCase().substring(1),o=new RegExp("(jpeg|jpg|gif|png|bmp)","gi"),u=o.test(s);if(!u)return $.goSlideMessage(i.alert_format,"caution"),!1}).progress(function(e,t){}).success(function(e,t){var t=t.data,n=GO.contextRoot+"thumb/temp/"+t.hostId+"/original"+t.filePath,r='<img data-filename="'+t.fileName+'" data-filepath="'+t.filePath+'" data-hostid="'+t.hostId+'" data-inline="true" src="'+n+'">',i=GO.Editor.getInstance(s.elPlaceHolder);i.setContent(r,!0)}).complete(function(e){a--,a==0&&n.close("",e)}).error(function(e,t){})}});return s})}).call(this);
define(["jquery","backbone","app","approval/components/appr_integrator_function"],function(e,t,n,r){var i={select:[{el:"#cseltest",key:"selCond1",data_id:"val2",data_text:"val3"}],check:[{el:"#checktest",key:"rdoCond3",data_id:"id",data_text:"val3"}],radio:[{el:"#radiotest1",key:"rdoCond1",data_id:"id",data_text:"val3"},{el:"#radiotest2",key:"rdoCond2",data_id:"id",data_text:"val3"}],table:[{el:"#testTable",key:"tData",data_colums:["id","val1","val2"]}]},s=t.Model.extend({initialize:function(e){}}),o=t.View.extend({initialize:function(e){this.options=e||{},this.docModel=this.options.docModel,this.variables=this.options.variables,this.config=i,this.formCode=this.infoData.formCode,this.integratorFunction=new r({variables:this.variables,config:this.config,infoData:this.infoData}),this.infoData=this.options.infoData,this.model=new s,this.addEventToFormIntegrator()},render:function(){this.integratorFunction.render(),this.unBindEvent(),this.bindEvent(),e("#cseltest").trigger("change")},bindEvent:function(){e("#cseltest").on("change",e.proxy(this.changeSelect,this))},unBindEvent:function(){e("#cseltest").off("change")},changeSelect:function(t){var r=this,i=e(t.currentTarget).find("option:selected").attr("data-id");this.model.fetch({url:n.contextRoot+"api/approval/integration/eventinvoker/"+this.formCode+"/showDesc",async:!0,data:{val2:i},success:function(e){var t=e.toJSON();r.renderTableByData(t.returnData.returnDesc)}})},renderTableByData:function(t){e("#testTable tbody td").empty(),e("#testTable tbody td").html(Hogan.compile("<span>{{#data}}{{{val3}}}<br>{{/data}}</span>").render({data:t}))},getIntegrationData:function(){return this.variables.getDocNum="1111",this.variables.getStatus="1111",this.variables.selectValue1=e('input[name="radiotest1"]:checked').val(),this.variables.selectValue2=e('input[name="radiotest2"]:checked').val(),this.variables.selectValue3=e('input[name="radiotest1"]:checked').val(),this.variables.getId="1111",this.variables},validateIntegrationData:function(){return!0},clearEmptyIntegrationData:function(){},addEventToFormIntegrator:function(){e.goIntegrationForm={getIntegrationData:_.bind(this.getIntegrationData,this),validateIntegrationData:_.bind(this.validateIntegrationData,this),clearEmptyIntegrationData:_.bind(this.clearEmptyIntegrationData,this)}}});return o});
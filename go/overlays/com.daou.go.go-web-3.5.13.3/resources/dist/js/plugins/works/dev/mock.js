define(function(require){require("jquery.mockjax"),$.mockjax({url:GO.contextRoot+"api/works/applets/1/filters",responseText:[{id:1,appletId:1,name:"\ud544\ud1301"},{id:2,appletId:1,name:"\ud544\ud1302"}]}),$.mockjax({url:GO.contextRoot+"api/works/applets/1/fields",responseText:[{cid:"c1",label:"\ud14d\uc2a4\ud2b8",fieldType:"text"},{cid:"c2",label:"\uba40\ud2f0\uc120\ud0dd",fieldType:"listbox",options:[{value:10,displayText:"\uba40\ud2f0\uc120\ud0dd-1"},{value:20,displayText:"\uba40\ud2f0\uc120\ud0dd-2"},{value:30,displayText:"\uba40\ud2f0\uc120\ud0dd-3"},{value:40,displayText:"\uba40\ud2f0\uc120\ud0dd-4"}]},{cid:"c3",label:"\ud0c0\uc784",fieldType:"time"},{cid:"c4",label:"\ub370\uc774\ud2b8\ud0c0\uc784",fieldType:"datetime"},{cid:"c5",label:"\ub370\uc774\ud2b8",fieldType:"date"},{cid:"c6",label:"\ub118\ubc84",fieldType:"number"},{cid:"c7",label:"\uba40\ud2f0 \ud14d\uc2a4\ud2b8",fieldType:"textarea"},{cid:"c8",label:"\uc5d0\ub514\ud130",fieldType:"editor"},{cid:"c9",label:"\ub2e8\uc77c\uc120\ud0dd",fieldType:"radio",options:[{value:10,displayText:"\ub2e8\uc77c\uc120\ud0dd-1"},{value:20,displayText:"\ub2e8\uc77c\uc120\ud0dd-2"},{value:30,displayText:"\ub2e8\uc77c\uc120\ud0dd-3"},{value:40,displayText:"\ub2e8\uc77c\uc120\ud0dd-4"}]},{cid:"c10",label:"\uccb4\ud06c\ubc15\uc2a4",fieldType:"checkbox",options:[{value:10,displayText:"\uccb4\ud06c\ubc15\uc2a4-1"},{value:20,displayText:"\uccb4\ud06c\ubc15\uc2a4-2"},{value:30,displayText:"\uccb4\ud06c\ubc15\uc2a4-3"},{value:40,displayText:"\uccb4\ud06c\ubc15\uc2a4-4"}]},{cid:"c11",label:"\ub4dc\ub86d\ubc15\uc2a4",fieldType:"select",options:[{value:10,displayText:"\ub4dc\ub86d\ubc15\uc2a4-1"},{value:20,displayText:"\ub4dc\ub86d\ubc15\uc2a4-2"},{value:30,displayText:"\ub4dc\ub86d\ubc15\uc2a4-3"},{value:40,displayText:"\ub4dc\ub86d\ubc15\uc2a4-4"}]},{cid:"c12",label:"\ud30c\uc77c\ucca8\ubd80",fieldType:"file"},{cid:"c13",label:"\uc0ac\uc6a9\uc790\uc120\ud0dd",fieldType:"org",options:[]},{cid:"c14",label:"\uacf5\ubc31",fieldType:"blank"},{cid:"c15",label:"\ub77c\uc778",fieldType:"hr"},{cid:"c16",label:"\ub77c\ubca8",fieldType:"label"},{cid:"c17",label:"\uc139\uc158",fieldType:"column"},{cid:"c21",label:"\uba40\ud2f0\ud50c-\ud14d\uc2a4\ud2b8",multiple:!0,fieldType:"text"},{cid:"c23",label:"\uba40\ud2f0\ud50c-\ud0c0\uc784",multiple:!0,fieldType:"time"},{cid:"c24",label:"\uba40\ud2f0\ud50c-\ub370\uc774\ud2b8\ud0c0\uc784",multiple:!0,fieldType:"datetime"},{cid:"c25",label:"\uba40\ud2f0\ud50c-\ub370\uc774\ud2b8",multiple:!0,fieldType:"date"},{cid:"c26",label:"\uba40\ud2f0\ud50c-\ub118\ubc84",multiple:!0,fieldType:"number"},{cid:"c31",label:"\uba40\ud2f0\ud50c-\ub4dc\ub86d\ubc15\uc2a4",multiple:!0,fieldType:"select",options:[{value:10,displayText:"\ub4dc\ub86d\ubc15\uc2a4-1"},{value:20,displayText:"\ub4dc\ub86d\ubc15\uc2a4-2"},{value:30,displayText:"\ub4dc\ub86d\ubc15\uc2a4-3"},{value:40,displayText:"\ub4dc\ub86d\ubc15\uc2a4-4"}]},{cid:"create_date",label:"\ub4f1\ub85d\uc77c",fieldType:"create_date"},{cid:"creator",label:"\ub4f1\ub85d\uc790",fieldType:"creator"},{cid:"update_date",label:"\uc218\uc815\uc77c",fieldType:"update_date"},{cid:"updater",label:"\ubcc0\uacbd\uc790",fieldType:"updater"},{cid:"status",label:"\uc0c1\ud0dc",fieldType:"status"}]}),$.mockjax({url:GO.contextRoot+"api/works/applets/1/filters/1",responseText:{id:1,appletId:1,name:"\ud544\ud1301",searchKeyword:"",conditions:[{id:1,fieldCid:"c1",conditionType:"TEXT",values:{text:"\ud14d\uc2a4\ud2b8value"}},{id:2,fieldCid:"c2",conditionType:"SELECT",values:{values:[10,20,30]}},{id:3,fieldCid:"c3",conditionType:"TIME",values:{fromTime:"12:34",toTime:"23:45"}},{id:4,fieldCid:"c4",conditionType:"DATETIME",values:{fromDateTime:new Date((new Date).setDate((new Date).getDate()-10)),toDateTime:new Date((new Date).setDate((new Date).getDate()+10))}},{id:5,fieldCid:"c5",conditionType:"DATE",values:{fromDate:"20150101",toDate:"20151231"}},{id:6,fieldCid:"c6",conditionType:"NUMBER",values:{minValue:"123456",maxValue:"234567"}},{id:7,fieldCid:"c7",conditionType:"TEXT",values:{text:"\uba40\ud2f0\ud14d\uc2a4\ud2b8value"}},{id:8,fieldCid:"c8",conditionType:"TEXT",values:{text:"\uc5d0\ub514\ud130value"}},{id:9,fieldCid:"c9",conditionType:"SELECT",values:{values:[20,30,40]}},{id:10,fieldCid:"c10",conditionType:"SELECT",values:{values:[10,30,40]}},{id:11,fieldCid:"c11",conditionType:"SELECT",values:{values:[10,20,40]}},{id:12,fieldCid:"c12",conditionType:"TEXT",values:{text:"\ud30c\uc77cvalue"}},{id:13,fieldCid:"c13",conditionType:"SELECT",values:{values:[10,20,40]}},{id:14,fieldCid:"c21",conditionType:"TEXT",values:{text:"\uba40\ud2f0\ud50c-\ud14d\uc2a4\ud2b8value"}},{id:15,fieldCid:"c23",conditionType:"TIME",values:{fromTime:"12:34",toTime:"23:45"}},{id:16,fieldCid:"c24",conditionType:"DATETIME",values:{fromDateTime:new Date((new Date).setDate((new Date).getDate()-10)),toDateTime:new Date((new Date).setDate((new Date).getDate()+10))}},{id:17,fieldCid:"c25",conditionType:"DATE",values:{fromDate:"20150101",toDate:"20151231"}},{id:18,fieldCid:"c26",conditionType:"NUMER",values:{minValue:"123456",maxValue:"234567"}},{id:19,fieldCid:"c31",conditionType:"SELECT",values:{values:[10,30,40]}}]}}),$.mockjax({url:GO.contextRoot+"api/works/applets/1/filters/2",responseText:{id:2,appletId:1,name:"\ud544\ud1302",searchKeyword:"",conditions:[{id:21,fieldCid:"c1",conditionType:"TEXT",values:{text:"\ud544\ud130\ucef4\ud3ec\ub10c\ud2b82"}},{id:22,fieldCid:"c2",conditionType:"SELECT",values:{values:[20,30,40]}},{id:23,fieldCid:"c3",conditionType:"TIME",values:{fromTime:"12:35",toTime:"23:46"}},{id:24,fieldCid:"c4",conditionType:"RELATIVE_DATETIME",values:{fromValue:2,toValue:3,fromUnit:"now",toUnit:"day"}},{id:25,fieldCid:"c5",conditionType:"RELATIVE_DATE",values:{fromValue:2,toValue:3,fromUnit:"month",toUnit:"day"}},{id:26,fieldCid:"c6",conditionType:"NUMBER",values:{minValue:"2345678",maxValue:"3456789"}},{id:27,fieldCid:"c7",conditionType:"TEXT",values:{text:"\uba40\ud2f0\ud14d\uc2a4\ud2b8value"}},{id:28,fieldCid:"c8",conditionType:"TEXT",values:{text:"\uc5d0\ub514\ud130value"}},{id:29,fieldCid:"c9",conditionType:"SELECT",values:{values:[10,30,40]}},{id:30,fieldCid:"c10",conditionType:"SELECT",values:{values:[10,20,30]}},{id:31,fieldCid:"c11",conditionType:"SELECT",values:{values:[10,20,40]}},{id:32,fieldCid:"c12",conditionType:"TEXT",values:{text:"\ud30c\uc77cvalue"}},{id:33,fieldCid:"c13",conditionType:"SELECT",values:{values:[10,20,40]}},{id:34,fieldCid:"c21",conditionType:"TEXT",values:{text:"\uba40\ud2f0\ud50c-\ud14d\uc2a4\ud2b8value"}},{id:35,fieldCid:"c23",conditionType:"TIME",values:{fromTime:"12:34",toTime:"23:45"}},{id:36,fieldCid:"c24",conditionType:"RELATIVE_DATETIME",values:{fromValue:2,toValue:3,fromUnit:"month",toUnit:"day"}},{id:37,fieldCid:"c25",conditionType:"RELATIVE_DATE",values:{fromValue:2,toValue:3,fromUnit:"month",toUnit:"day"}},{id:38,fieldCid:"c26",conditionType:"NUMBER",values:{minValue:"123456",maxValue:"234567"}},{id:39,fieldCid:"c31",conditionType:"SELECT",values:{values:[10,30,40]}}]}}),$.mockjax({url:GO.contextRoot+"api/works/applets/1/listview",responseText:{id:1,showDescription:!0,charts:[{id:1,title:"\ucc28\ud2b81",fieldCid:"c1",periodOption:"ALL"}],columns:[{id:1,fieldCid:"c1",columnName:"\ud14d\uc2a4\ud2b8!"},{id:2,fieldCid:"c2",columnName:"\uba40\ud2f0\uc120\ud0dd@"},{id:3,fieldCid:"c3",columnName:"\ud0c0\uc784#"},{id:4,fieldCid:"c4",columnName:"\ub370\uc774\ud2b8\ud0c0\uc784$"},{id:5,fieldCid:"c5",columnName:"\ub370\uc774\ud2b8%"},{id:6,fieldCid:"c6",columnName:"\ub118\ubc84^"},{id:7,fieldCid:"c9",columnName:"\ub2e8\uc77c\uc120\ud0dd&"},{id:8,fieldCid:"c10",columnName:"\uccb4\ud06c\ubc15\uc2a4*"},{id:9,fieldCid:"c11",columnName:"\ub4dc\ub86d\ubc15\uc2a4("},{id:10,fieldCid:"c13",columnName:"\uc720\uc800!)"},{id:11,fieldCid:"create_date",columnName:"\ub4f1\ub85d\uc77c!!"},{id:12,fieldCid:"creator",columnName:"\ub4f1\ub85d\uc790!@"},{id:13,fieldCid:"update_date",columnName:"\uc218\uc815\uc77c!#"},{id:14,fieldCid:"updater",columnName:"\ubcc0\uacbd\uc790!$"},{id:15,fieldCid:"status",columnName:"\uc0c1\ud0dc!%"}],titleColumnIndex:4,sortColumnIndex:1,sortDirection:"DESC"}});var e=function(){function e(e){e=e||Math.floor(Math.random()*10);var t=[];for(var n=0;n<e;n++){var r=(Math.floor(Math.random()*10)+1)*10;t.push(r)}return t}return{id:1,appletId:1,values:{c1:"\ud14d\uc2a4\ud2b8"+(Math.floor(Math.random()*100)+1),c2:_.union(e()),c3:"\ud0c0\uc784"+(Math.floor(Math.random()*100)+1),c4:"\ub370\uc774\ud2b8\ud0c0\uc784"+(Math.floor(Math.random()*100)+1),c5:"\ub370\uc774\ud2b8"+(Math.floor(Math.random()*100)+1),c6:"\ub118\ubc84"+(Math.floor(Math.random()*100)+1),c9:_.union(e(1)),c10:_.union(e()),c11:_.union(e(1)),c13:_.union(e(1)),create_date:"\ub4f1\ub85d\uc77c"+(Math.floor(Math.random()*100)+1),creator:"\ub4f1\ub85d\uc790"+(Math.floor(Math.random()*100)+1),update_date:"\uc218\uc815\uc77c"+(Math.floor(Math.random()*100)+1),updater:"\ubcc0\uacbd\uc790"+(Math.floor(Math.random()*100)+1),status:"\uc0c1\ud0dc"+(Math.floor(Math.random()*100)+1)},createdAt:new Date,updatedAt:new Date,createdBy:{id:4,name:"\uc724\uc5ec\uc9c41",email:"test3@daou.co.kr",position:"\ucc28\uc7a5",thumbnail:"/go/resources/images/photo_profile_small.jpg"},updatedBy:{id:4,name:"\uc724\uc5ec\uc9c41",email:"test3@daou.co.kr",position:"\ucc28\uc7a5",thumbnail:"/go/resources/images/photo_profile_small.jpg"}}},t=[],n=20;for(var r=0;r<n;r++){var i=new e;i.id=r+1,t.push(i)}$.mockjax({url:GO.contextRoot+"api/works/applets/1/docs",responseText:{data:t,page:{page:0,offset:20,total:21,sort:[{direction:"DESC",property:"finishedAt",ignoreCase:!1,nullHandling:"NATIVE",ascending:!1}],lastPage:!1}}});var t=[],n=1;for(var r=0;r<n;r++){var i=new e;i.id=r+1,t.push(i)}$.mockjax({url:GO.contextRoot+"api/works/applets/1/docs?page=1&offset=20",responseText:{data:t,page:{page:1,offset:20,total:21,sort:[{direction:"DESC",property:"finishedAt",ignoreCase:!1,nullHandling:"NATIVE",ascending:!1}],lastPage:!1}}}),$.mockjax({url:GO.contextRoot+"api/works/applets/1/filters/1",type:"DELETE",responseText:{code:"200"}}),$.mockjax({url:GO.contextRoot+"api/works/applets/1/filters",type:"POST",responseText:{code:"200"}}),$.mockjax({url:GO.contextRoot+"api/works/applets/10/integration",responseText:{id:10,producers:[{producer:{id:1,name:"App1"},producerFieldCid:"create_date",consumer:{id:11,name:"App11"},consuerFieldCid:"create_date",privileges:["SHOW_LIST"],createdBy:{id:4,name:"\uc724\uc5ec\uc9c41",email:"test3@daou.co.kr",position:"\ucc28\uc7a5",thumbnail:"/go/resources/images/photo_profile_small.jpg"},createdAt:new Date,updatedBy:{id:4,name:"\uc724\uc5ec\uc9c41",email:"test3@daou.co.kr",position:"\ucc28\uc7a5",thumbnail:"/go/resources/images/photo_profile_small.jpg"},updatedAt:new Date},{producer:{id:2,name:"App2"},producerFieldCid:"update_date",consumer:{id:12,name:"App12"},consuerFieldCid:"update_date",privileges:["SHOW_DOC"],createdBy:{id:4,name:"\uc724\uc5ec\uc9c41",email:"test3@daou.co.kr",position:"\ucc28\uc7a5",thumbnail:"/go/resources/images/photo_profile_small.jpg"},createdAt:new Date,updatedBy:{id:4,name:"\uc724\uc5ec\uc9c41",email:"test3@daou.co.kr",position:"\ucc28\uc7a5",thumbnail:"/go/resources/images/photo_profile_small.jpg"},updatedAt:new Date}],consumers:[{producer:{id:3,name:"App3"},producerFieldCid:"create_date",consumer:{id:13,name:"App13"},consumerFieldCid:"create_date",privileges:["SHOW_LIST"],createdBy:{id:4,name:"\uc724\uc5ec\uc9c41",email:"test3@daou.co.kr",position:"\ucc28\uc7a5",thumbnail:"/go/resources/images/photo_profile_small.jpg"},createdAt:new Date,updatedBy:{id:4,name:"\uc724\uc5ec\uc9c41",email:"test3@daou.co.kr",position:"\ucc28\uc7a5",thumbnail:"/go/resources/images/photo_profile_small.jpg"},updatedAt:new Date},{producer:{id:4,name:"App4"},producerFieldCid:"update_date",consumer:{id:14,name:"App14"},consumerFieldCid:"update_date",privileges:["SHOW_DOC"],createdBy:{id:4,name:"\uc724\uc5ec\uc9c41",email:"test3@daou.co.kr",position:"\ucc28\uc7a5",thumbnail:"/go/resources/images/photo_profile_small.jpg"},createdAt:new Date,updatedBy:{id:4,name:"\uc724\uc5ec\uc9c41",email:"test3@daou.co.kr",position:"\ucc28\uc7a5",thumbnail:"/go/resources/images/photo_profile_small.jpg"},updatedAt:new Date}]}}),$.mockjax({url:GO.contextRoot+"api/works/applets/10/doc/1/consumers",responseText:[{applet:{id:10,name:"App1",admins:[],desc:"description",showDescription:!0,thumbSmall:"",iconUrl:"",useProcess:!0,privateOption:"OPEN"},accessable:!0,count:7,fieldCid:"update_date"},{applet:{id:11,name:"App2",admins:[],desc:"description",showDescription:!0,thumbSmall:"",iconUrl:"",useProcess:!0,privateOption:"OPEN"},accessable:!0,count:7,fieldCid:"update_date"}]}),$.mockjax({url:GO.contextRoot+"api/works/applets/10/form",responseText:{appletId:10,id:10,data:{type:"canvas",cid:"cxx1",multiple:!1,components:[{cid:"_zzv3du17w",components:[],multiple:!1,properties:{label:"\uc81c\ubaa9",hideLabel:!1,guide:""},type:"text",valueType:"STEXT"},{cid:"_zzv3du17s",components:[],multiple:!1,properties:{label:"\uc5f0\ub3d9",hideLabel:!1,guide:"",selectedDisplayFields:["_zzv3du17w","_zi5k4oa1v"]},type:"applet_docs",valueType:"APPLETDOCS"}]}}})});
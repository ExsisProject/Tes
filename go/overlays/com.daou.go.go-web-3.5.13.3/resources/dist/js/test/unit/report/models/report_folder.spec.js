define(["report/models/report_folder","jquery.mockjax"],function(e){describe("report folder model test",function(){it("static get() test",function(){$.mockjax({url:"/api/report/folder/1",responseText:{data:{id:1,createdAt:"2013-10-25T17:15:04",updatedAt:"2014-10-01T00:10:00",recurrence:"FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=-1",name:"\uc6d4\uac04\ubcf4\uace0",description:"",formFlag:!1,totalCount:169,totalSeries:13,type:"PERIODIC",publicOption:"OPEN",status:"ACTIVE",department:{id:61,name:"GroupWare\uac1c\ubc1c\ud300",code:"0000000598",email:"cncdev@daou.co.kr",emailId:"cncdev",memberCount:23,childrenCount:1,parentId:197,parentCode:"0000000658",sortOrder:2,depth:0,deptAlias:"cncdev",deletedDept:!1,sortFlag:!1},reporter:{id:19,nodes:[{id:86,nodeId:696,nodeType:"user",nodeValue:"\ubc31\uae08\ucca0 \ucc45\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:87,nodeId:929,nodeType:"user",nodeValue:"\uad8c\uc138\ud0dd \ucc45\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:88,nodeId:864,nodeType:"user",nodeValue:"\uae40\uacbd\uc778 \uc120\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:89,nodeId:1120,nodeType:"user",nodeValue:"\uac15\ubd09\uc218 \uc120\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:90,nodeId:1551,nodeType:"user",nodeValue:"\ud5c8\uc6a9\uc120 \uc120\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:91,nodeId:294,nodeType:"user",nodeValue:"\ubc15\uad00\ud6c4 \uc120\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:92,nodeId:1619,nodeType:"user",nodeValue:"\uc870\uc2ac\uae30 \uc5f0\uad6c\uc6d0",members:[]},{id:93,nodeId:889,nodeType:"user",nodeValue:"\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:94,nodeId:780,nodeType:"user",nodeValue:"\uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:95,nodeId:855,nodeType:"user",nodeValue:"\uae40\ud0dc\ud658 \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:96,nodeId:1165,nodeType:"user",nodeValue:"\uc815\ud574\uc6b4 \uc5f0\uad6c\uc6d0",members:[]},{id:97,nodeId:1235,nodeType:"user",nodeValue:"\uc7a5\uc778\uc120 \uc5f0\uad6c\uc6d0",members:[]},{id:98,nodeId:1633,nodeType:"user",nodeValue:"\uad8c\uad6c\uc131 \uc5f0\uad6c\uc6d0",members:[]}]},referrer:{id:18,nodes:[]},admin:{id:17,nodes:[{id:84,nodeId:855,nodeType:"user",nodeValue:"\uae40\ud0dc\ud658 \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:85,nodeId:321,nodeType:"user",nodeValue:"\uc1a1\ub3d9\uc218 \uc804\ubb38\uc704\uc6d0",members:[]}]},form:{content:""},actions:{updatable:!1,removable:!1,writable:!0,managable:!1,readable:!1},favorite:!1,attachSize:10600550,newReport:!1},message:"OK",code:"200",__go_checksum__:!0}});var t=e.get(1);expect(t.get("id")).toBe(1)}),it("init \ucd08\uae30\uac12 \uc124\uc815",function(){var t=e.init();expect(t.id).toBe(null)}),it("isOpen \uacf5\uc6a9 \ubcf4\uace0\uc11c \ud3f4\ub354\uc778\uac00?",function(){var t=new e;t.set("publicOption","OPEN"),expect(!0).toBe(t.isOpen())}),it("isReporterOpen \ubcf4\uace0\uc790\uac04 \uacf5\uac1c \ubcf4\uace0\uc11c \ud3f4\ub354\uc778\uac00?",function(){var t=new e;t.set("publicOption","CLOSED"),expect(!0).toBe(t.isReporterOpen())}),it("isPrivate \ubcf4\uace0\uc790\uac04 \ube44\uacf5\uac1c \ubcf4\uace0\uc11c \ud3f4\ub354\uc778\uac00?",function(){var t=new e;t.set("publicOption","PRIVATE"),expect(!0).toBe(t.isPrivate())}),it("\ubd80\uc11c\uc6d0 \uc804\uccb4\uac00 \ubcf4\uace0\uc11c\ub97c \uc791\uc131\ud560 \uc218 \uc788\ub294\uac00?",function(){var t=new e;t.set("reporter",{nodes:[{id:15781,nodeId:61,nodeType:"department",nodeDeptId:61,nodeValue:"GroupWare\uac1c\ubc1c\ud300",members:[]}]}),expect(!0).toBe(t.isMemberWrite())}),it("\ud558\uc704 \ubd80\uc11c\uc6d0 \uc804\uccb4\uac00 \ubcf4\uace0\uc11c\ub97c \uc791\uc131\ud560 \uc218 \uc788\ub294\uac00?",function(){var t=new e;t.set("reporter",{nodes:[{id:15781,nodeId:61,nodeType:"subdepartment",nodeDeptId:61,nodeValue:"GroupWare\uac1c\ubc1c\ud300",members:[]}]}),expect(!0).toBe(t.isDescendantWrite())}),it("\uc9c1\uc811\uc9c0\uc815\ud55c \ubcf4\uace0\uc790\ub9cc \uc791\uc131\ud560 \uc218 \uc788\ub294\uac00?",function(){var t=new e;t.set("reporter",{nodes:[{id:15783,nodeId:1106,nodeType:"user",nodeValue:"\uae40\ud0dc\ud55c \ucc28\uc7a5",members:[]}]}),expect(!0).toBe(t.isSpecifiedWrite())}),it("\uc815\uae30\ubcf4\uace0\uc11c \uc778\uac00?",function(){var t=new e;t.set("type","PERIODIC"),expect(!0).toBe(t.isPeriodic())}),it("\uc218\uc2dc\ubcf4\uace0\uc11c \uc778\uac00?",function(){var t=new e;t.set("type","OCCASIONAL"),expect(!0).toBe(t.isOccasional())}),it("\ubcf4\uace0\uc790 \uad8c\ud55c \ud655\uc778",function(){var t=new e;t.set("reporter",{id:4892,nodes:[{id:15786,nodeId:889,nodeType:"user",nodeValue:"\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:15785,nodeId:780,nodeType:"user",nodeValue:"\uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]}]}),expect([{id:889,title:"\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0",options:{removable:!0}},{id:780,title:"\uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0",options:{removable:!0}}]).toEqual(t.reportersNameTag())}),it("\ucc38\uc870\uc790 \uad8c\ud55c \ud655\uc778",function(){var t=new e;t.set("referrer",{id:4891,nodes:[{id:15792,nodeId:889,nodeType:"user",nodeValue:"\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:15791,nodeId:780,nodeType:"user",nodeValue:"\uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]}]}),expect([{id:889,title:"\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0",options:{removable:!0}},{id:780,title:"\uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0",options:{removable:!0}}]).toEqual(t.referrersNameTag())}),it("\uad00\ub9ac\uc790 \uad8c\ud55c \ud655\uc778",function(){var t=new e;t.set("admin",{id:4890,nodes:[{id:15790,nodeId:889,nodeType:"user",nodeValue:"\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]}]}),expect([{id:889,title:"\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0",options:{removable:!0}}]).toEqual(t.adminsNameTag())}),it("\uc815\uc0c1 \ubcf4\uace0\uc11c\uc778\uac00?",function(){var t=new e;t.set("status","ACTIVE"),expect(!0).toEqual(t.isActive())}),it("\uc815\uc9c0\ub41c \ubcf4\uace0\uc11c\uc778\uac00?",function(){var t=new e;t.set("status","INACTIVE"),expect(!0).toEqual(t.isInactive())}),it("\ubcf4\uace0\uc790 \uc774\ub984 \ucd9c\ub825\uc774 \uc815\uc0c1\uc801\uc73c\ub85c \ub418\ub294\uac00?",function(){var t=new e;t.set("reporter",{id:4892,nodes:[{id:15786,nodeId:889,nodeType:"user",nodeValue:"\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:15785,nodeId:780,nodeType:"user",nodeValue:"\uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]}]}),expect("\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0, \uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0").toEqual(t.reporterNames())}),it("\ubcf4\uace0\uc790 \ubc0f \ud558\uc704 \ubd80\uc11c\uc6d0 \ud3ec\ud568 \uc774\ub984 \ucd9c\ub825\uc774 \uc815\uc0c1\uc801\uc73c\ub85c \ub418\ub294\uac00?",function(){var t=new e;t.set("reporter",{nodes:[{id:15781,nodeId:61,nodeType:"subdepartment",nodeDeptId:61,nodeValue:"GroupWare\uac1c\ubc1c\ud300",members:[]},{id:15786,nodeId:889,nodeType:"user",nodeValue:"\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:15785,nodeId:780,nodeType:"user",nodeValue:"\uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]}]}),expect("GroupWare\uac1c\ubc1c\ud300 (\ud558\uc704 \ubd80\uc11c\uc6d0 \ud3ec\ud568 ) , \ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0, \uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0").toEqual(t.reporterNames())}),it("\ubcf4\uace0\uc790 \uc5c6\uc744 \uacbd\uc6b0 \ucd9c\ub825\uc774 \uc815\uc0c1\uc801\uc73c\ub85c \ub418\ub294\uac00?",function(){var t=new e;t.set("reporter",{nodes:[]}),expect("\uc5c6\uc74c").toEqual(t.reporterNames())}),it("\ucc38\uc870\uc790 \uc774\ub984 \ucd9c\ub825 \ud655\uc778",function(){var t=new e;t.set("referrer",{id:4891,nodes:[{id:15792,nodeId:889,nodeType:"user",nodeValue:"\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:15791,nodeId:780,nodeType:"user",nodeValue:"\uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]}]}),expect("\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0, \uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0").toEqual(t.referrerNames())}),it("\ucc38\uc870\uc790 \uc5c6\ub294 \uacbd\uc6b0 \ud655\uc778",function(){var t=new e;t.set("referrer",{nodes:[]}),expect("\uc5c6\uc74c").toEqual(t.referrerNames())}),it("\uad00\ub9ac\uc790 \uc774\ub984 \ucd9c\ub825 \ud655\uc778",function(){var t=new e;t.set("admin",{id:4891,nodes:[{id:15792,nodeId:889,nodeType:"user",nodeValue:"\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]},{id:15791,nodeId:780,nodeType:"user",nodeValue:"\uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0",members:[]}]}),expect("\ubc15\uc0c1\uc624 \uc8fc\uc784\uc5f0\uad6c\uc6d0, \uc870\uac74\ud76c \uc8fc\uc784\uc5f0\uad6c\uc6d0").toEqual(t.adminNames())}),it("\uad00\ub9ac\uc790 \uc5c6\uc744 \uacbd\uc6b0 \uc774\ub984 \ucd9c\ub825 \ud655\uc778",function(){var t=new e;t.set("admin",[]),expect("\uc5c6\uc74c").toEqual(t.adminNames())})})});
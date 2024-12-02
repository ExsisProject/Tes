var webfolderPopupControl
var WebfolderPopupControl = function() {
	this.listFolderDataAction = "/api/webfolder/folder/tree";
    this.viewFolderAction = "/api/webfolder/folder/list";
    
	this.listParam = {};
	this.attachSizeMax;
	this.currentPage;
	this.pageCount;
	this.loader;
	this.quotaInfo;
	this.groupSelect;
	this.currentFolder;
	this.auth;
	this.sharedUserList;
	this.sharedFolderUid;
	this.type;
	var _this = this;

	this.loadWebfolderList = function() {
		ActionLoader.getGoLoadAction(_this.listFolderDataAction, {"type":"user"}, _this.printWebfolderList, "json"); 
	};
	this.loadShareWebfolderList = function() {
		ActionLoader.getGoLoadAction(_this.listFolderDataAction, {"type":"share"}, _this.printShareWebfolderList, "json"); 
	};
	this.loadPublicWebfolderList = function() {
		ActionLoader.getGoLoadAction(_this.listFolderDataAction, {"type":"public"}, _this.printPublicWebfolderList, "json"); 
	};
	this.printWebfolderList = function(data) {
		jQuery("#webFolderList").handlebars("webfoler_left_tmpl", data);
	};
	this.printPublicWebfolderList = function(data) {
		jQuery("#publicWebFolderList").handlebars("webfoler_left_tmpl", data);
	};
	this.printShareWebfolderList = function(data) {
		jQuery("#webShareFolderList").handlebars("webfoler_share_left_tmpl",
				data);
	};
	this.loadViewWebFolder = function(param) {
		if (!param) {
			param = {
				"path" : "/",
				"fullPath" : "/"
			};
		}
		_this.listParam = param;
		ActionLoader.getGoLoadAction(_this.viewFolderAction, param, _this.printViewfolder, "json"); 
	};
	this.titleOn = function(data){
       if(!data.isRoot || data.type!="user"){
            jQuery("#webfolderLeft p").removeClass("on");
            var webFolderId  = data.type+(replaceAll(data.realPath,".", "-"));
            jQuery(document.getElementById(webFolderId)).addClass("on");
        }else{
            jQuery("#webfolderLeft p").removeClass("on");
        } 
    };
	this.printViewfolder = function(data) {
		_this.currentFolder = data.path;
		_this.type = data.type;
		_this.titleOn(data);
		jQuery("#viewFolder").handlebars("webfoler_view_popup_tmpl", data);
		jQuery("#viewFolderBody").append(
                getHandlebarsTemplate("webfoler_view_popup_page_tmpl", data));
		_this.movePage(data);
	};
	this.movePage = function(data) {
		_this.currentPage = data.currentPage;
		_this.pageCount = data.pageCount;
		/*
		 * jQuery('#viewFolder').waypoint({ offset: 'bottom-in-view', handler:
		 * function(direction) { if(direction =="down" && _this.currentPage !=
		 * _this.pageCount && _this.pageCount != 0){
		 */
		for (var i = 1; i < _this.pageCount; i++) {
			var param = _this.listParam;
			_this.currentPage = _this.currentPage + 1;
			param.currentPage = _this.currentPage;
			ActionLoader.getGoLoadAction(_this.viewFolderAction, param, _this.printWebfolderListPage, "json"); 
		}

		/*
		 * } } });
		 */
	};
	this.printWebfolderListPage = function(data) {
		jQuery("#viewFolderBody").append(
				getHandlebarsTemplate("webfoler_view_popup_page_tmpl", data));
		jQuery('#memberListFooter').waypoint({
			offset : '100%'
		});
		jQuery.waypoints('refresh');
	};
	this.makeLeftEvent = function() {
		jQuery("#webfolderLeft").on("click", "a,span", function(event) {
			event.preventDefault();
			var type = jQuery(this).attr("evt-rol");
			if (type == "viewFolderLeft") {
				var param = {};
				var realPath = jQuery(this).attr("real-path");
				var type = jQuery(this).attr("type");
				if (type == "share") {
					var userSeq = jQuery(this).attr("user-seq");
					var sroot = jQuery(this).attr("sroot");
					param.sroot = sroot;
					param.userSeq = userSeq;

				}
				param.fullPath = realPath;
				param.type = type;

				goFolder(param);
			} else if (type == "toggleFolder") {
				toggleWebfolderList(jQuery(this).attr("type"));
			}
		});
	};
	this.makeContentEvent = function() {
		jQuery("#webFolderContent").on(
				"click",
				"a,span",
				function(event) {
					event.preventDefault();
					var type = jQuery(this).attr("evt-rol");
					if (type == "viewFolder") {
						var param = {};
						var realPath = jQuery(this).parent().parent().attr(
								"real-path");
						var nodeNumber = jQuery(this).parent().parent().attr(
								"node-number");
						var type = jQuery(this).parent().parent().attr("type");
						if (type == "share") {
							var userSeq = jQuery(this).parent().parent().attr(
									"user-seq");
							var sroot = jQuery(this).parent().parent().attr(
									"sroot");
							param.sroot = sroot;
							param.userSeq = userSeq;

						}
						param.fullPath = realPath;
						param.nodeNum = nodeNumber;
						param.type = type;

						goFolder(param);

					} else if (type == "preFolder") {
						var path = jQuery(this).attr("ppath");
						var nodeId = jQuery(this).attr("node-num");
						var type = jQuery(this).attr("type");
						var param = {};
						if (nodeId.length > 1) {
							nodeId = nodeId.substr(0, nodeId.lastIndexOf("|"));
							nodeId = nodeId.substr(0,
									nodeId.lastIndexOf("|") + 1);
						}
						if (type == "share") {
							var userSeq = jQuery(this).attr("user-seq");
							var sroot = jQuery(this).attr("sroot");
							param.sroot = sroot;
							param.userSeq = userSeq;

						}
						param.fullPath = path;
						param.nodeNum = nodeId;
						param.type = type;

						goFolder(param);

					} else if (type == "sortFolderList") {
						var sortby = jQuery(this).attr("sort-data");
						var param = _this.listParam;
						param.sortby = sortby;
						var sortDirClass = jQuery(this).parent().attr("class");
						var sortDir;
						if (sortDirClass.indexOf("asc") > -1) {
							sortDir = "desc";
						} else {
							sortDir = "asc";
						}
						param.sortDir = sortDir;
						goFolder(param);
					} else if (type == "movePage") {
						var page = jQuery(this).attr("page");
						_this.listParam.currentPage = page;
						goFolder(_this.listParam);
					}
				});

		jQuery("#webFolderContent")
				.on(
						"click",
						"input ",
						function(event) {
							var type = jQuery(this).attr("evt-rol");
							if (type == "list-select-all") {
								var checked = jQuery(this).attr("checked");
								var checkbox = jQuery("#viewFolder input:checkbox");
								if (checked) {
									checkbox.attr("checked", true);
								} else {
									checkbox.attr("checked", false);
								}
								var fids = jQuery(
										'#viewFolder input:checkbox:checked')
										.map(
												function() {
													var fid = jQuery(this)
															.parent().parent()
															.attr("fid");
													if (!fid)
														return;
													return fid;
												}).get();
								var uids = jQuery(
										'#viewFolder input:checkbox:checked')
										.map(
												function() {
													var uid = jQuery(this)
															.parent().parent()
															.attr("uid");
													if (!uid)
														return;
													return uid;
												}).get();

								jQuery("#toolbar a")
										.each(
												function() {
													var toolbarType = jQuery(
															this).attr(
															"evt-rol");
													if (toolbarType == "createFolderView") {
														return;
													}
													jQuery(this).addClass(
															"disable");
												});

								if (fids.length > 0 && uids.length == 0) {
									jQuery("#toolbar a")
											.each(
													function() {
														var toolbarType = jQuery(
																this).attr(
																"evt-rol");
														if (_this.auth == "W"
																&& (toolbarType == "removeFolder"
																		|| toolbarType == "copyFolder" || toolbarType == "moveFolder")) {
															jQuery(this)
																	.removeClass(
																			"disable");
														}
														if (toolbarType == "copyFolder") {
															jQuery(this)
																	.removeClass(
																			"disable");
														}
													});

								} else if (fids.length == 0 && uids.length > 0) {
									jQuery("#toolbar a")
											.each(
													function() {
														var toolbarType = jQuery(
																this).attr(
																"evt-rol");
														if (_this.auth == "W") {
															if (toolbarType == "removeFolder"
																	|| toolbarType == "moveFolder") {
																jQuery(this)
																		.removeClass(
																				"disable");
															}
														}

														if (toolbarType == "downloadFolderList"
																|| toolbarType == "sendMail"
																|| toolbarType == "copyFolder") {
															jQuery(this)
																	.removeClass(
																			"disable");
														}
													});
								} else if (fids.length > 0 && uids.length > 0) {
									jQuery("#toolbar a")
											.each(
													function() {
														var toolbarType = jQuery(
																this).attr(
																"evt-rol");
														if (_this.auth == "W"
																&& (toolbarType == "removeFolder"
																		|| toolbarType == "copyFolder" || toolbarType == "moveFolder")) {
															jQuery(this)
																	.removeClass(
																			"disable");
														}
														if (toolbarType == "copyFolder") {
															jQuery(this)
																	.removeClass(
																			"disable");
														}
													});
								}
							} else if (type == "list-select") {
								var fids = jQuery(
										'#viewFolder input:checkbox:checked')
										.map(
												function() {
													var fid = jQuery(this)
															.parent().parent()
															.attr("fid");
													if (!fid)
														return;
													return fid;
												}).get();
								var uids = jQuery(
										'#viewFolder input:checkbox:checked')
										.map(
												function() {
													var uid = jQuery(this)
															.parent().parent()
															.attr("uid");
													if (!uid)
														return;
													return uid;
												}).get();

								jQuery("#toolbar a")
										.each(
												function() {
													var toolbarType = jQuery(
															this).attr(
															"evt-rol");
													if (toolbarType == "createFolderView") {
														return;
													}
													jQuery(this).addClass(
															"disable");
												});

								if (fids.length > 0 && uids.length == 0) {
									jQuery("#toolbar a")
											.each(
													function() {
														var toolbarType = jQuery(
																this).attr(
																"evt-rol");
														if (_this.auth == "W"
																&& (toolbarType == "removeFolder"
																		|| toolbarType == "copyFolder" || toolbarType == "moveFolder")) {
															jQuery(this)
																	.removeClass(
																			"disable");
														}
														if (toolbarType == "copyFolder") {
															jQuery(this)
																	.removeClass(
																			"disable");
														}
													});

								} else if (fids.length == 0 && uids.length > 0) {
									jQuery("#toolbar a")
											.each(
													function() {
														var toolbarType = jQuery(
																this).attr(
																"evt-rol");
														if (_this.auth == "W") {
															if (toolbarType == "removeFolder"
																	|| toolbarType == "moveFolder") {
																jQuery(this)
																		.removeClass(
																				"disable");
															}
														}

														if (toolbarType == "downloadFolderList"
																|| toolbarType == "sendMail"
																|| toolbarType == "copyFolder") {
															jQuery(this)
																	.removeClass(
																			"disable");
														}
													});
								} else if (fids.length > 0 && uids.length > 0) {
									jQuery("#toolbar a")
											.each(
													function() {
														var toolbarType = jQuery(
																this).attr(
																"evt-rol");
														if (_this.auth == "W"
																&& (toolbarType == "removeFolder"
																		|| toolbarType == "copyFolder" || toolbarType == "moveFolder")) {
															jQuery(this)
																	.removeClass(
																			"disable");
														}
														if (toolbarType == "copyFolder") {
															jQuery(this)
																	.removeClass(
																			"disable");
														}
													});
								}

							}

						});

	};

}

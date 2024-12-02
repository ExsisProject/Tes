/**
 * @version	0.0.1
 * @require 	jQuery , go-style.css
 * @author 	hyungmin@daou.co.kr
 * 
 *  overlay 옵션은 추가예정.
 *  그외 필요하신 기능은 요청해주세요~  
 */
(function($) {
	
	var GP = $.goPopup = function () {
		return GP.render(arguments[0]);
	};

	$.extend(GP,{
		version : '0.0.1',
		defaults : {
			pid : 'gpopupLayer',
			targetEl : '.go_body',
			width : 400,
			modal : true,
			btype : {
				"normal" : "btn_minor_s",
				"caution" : "btn_caution_s",
				"confirm" : "btn_major_s"
			},
			buttons : {
				'ok' : { btext : mailMsg.comn_confirm, btype : 'confirm' },
				'move' : { btext : mailMsg.comn_move, btype : 'confirm' }, 
				'save' : { btext : mailMsg.comn_btn_save, btype : 'confirm' },
				'close' : { btext : mailMsg.comn_close, btype : 'normal' }, 
				'cancel' : { btext : mailMsg.comn_cancel, btype : 'normal' },
				'del' : { btext : mailMsg.comn_del,  btype : 'caution'  },
				'search' : { btext : mailMsg.comn_search, btype : 'confirm' }
			},
			tpl : {
				'wrap' : [
				   '<div class="go_popup {pclass}" id="{pid}" data-close="false" style="display:none" data-layer>',
				   '<header><h1>{header}</h1>{headerHtml}<a class="btn_layer_x" data-bypass><span class="ic"></span><span class="txt">'+mailMsg.comn_close+'</span></a></header>',
				   '<div class="content">{pTitle}{message}{contents}</div>{buttonwrap}</div>'
				 ],
				'wrapSearch' : [
	                '<div class="go_popup detail_search_wrap{pclass}" style="display:" data-layer>',
	                '<div class="detail_search">', '<header><h1>{header}</h1>',
	                '<a class="btn_layer_x" data-bypass><span class="ic"></span><span class="txt">'+mailMsg.comn_close+'</span></a>',
	                '</header>','<span class="layer_tail_top"><i></i></span>',
	                '<div class="content">{contents}</div>', '{buttonwrap}', '</div>','</div>'
                ],
			    'pTitle' : '<p class="q">{pTitle}</p>',
			    'message' : '<p class="add">{message}</add>',
			    'buttonwrap' : '<footer class="btn_layer_wrap"></footer>',
			    'button' : '<a class="{bclass}" data-bypass style="margin-right:5px"><span class="ic"></span><span class="txt">{btext}</span></a>',
			    'overlay' : '<div id="popOverlay" class="overlay" data-overlay></div>'
			}
		},
		error : function(message) {
			/*var messageTpl = ['<div class="alert_wrap" style="position:fixed;top:45%;left:50%;margin-left:-150px;width:300px;padding:10px;border-radius:10px;z-index:101;color:red">',message,'</div>'];
			$(messageTpl.join('')).appendTo('body').delay(2000).fadeOut();*/
			GP.slideMessage(message,"caution");
			return;
		},
		
		/*
		 *  deprecate : goMessage 는 향후 사용하지 않을 계획입니다. -> slideMessage 로 전환
		 */
		message : function(message) {
		    /*$("#go_message").remove();
			var messageTpl = ['<div id="go_message" class="alert_wrap" style="position:fixed;top:45%;left:50%;margin-left:-150px;width:305px;padding:10px;border-radius:10px;z-index:101">',message,'</div>'];
			$(messageTpl.join('')).appendTo('body').delay(2000).fadeOut();*/
			GP.slideMessage(message);
			return;
		},
		slideMessage : function(message,stype) {
			if(window.opener || !window.top.$){
                $("#go_slideMessage").remove();
                var messageTpl;
                if(stype == "caution") {
                    messageTpl = ['<div id="go_slideMessage" class="alert_wrap go_error" style="display:none"><ins class="ic_con ic_alert_caution"></ins><span class="txt">',message,'</span><span class="btn_wrap" alt="레이어 닫기"><span class="btn_del_light"></span></span>'];
                } else {
                    messageTpl = ['<div id="go_slideMessage" class="alert_wrap" style="display:none"><ins class="ic_con ic_alert"></ins><span class="txt">',message,'</span><span class="btn_wrap" alt="레이어 닫기"><span class="btn_del_light"></span></span>'];
                }
                $(messageTpl.join('')).appendTo('body');

                $("#go_slideMessage").slideDown(200,function(){
                    $("#go_slideMessage").delay(2000).slideUp(200,function(){
                        $("#go_slideMessage").remove();
                    });
                    $(".btn_del_light").bind("click", function() {
                        $("#go_slideMessage").remove();
                    });
                });
			}else{
                window.top.$.goSlideMessage(message, stype);
            }
			return;
		},
		alert : function(title, message, callback, btntext) {
			return GP.render({
				title : title,
				message : message,
				modal : true,
				buttons : [{
					'btext' : btntext || GP.defaults.buttons.close.btext,
					'btype' : 'normal',
					'callback' : callback
				}]
			});
		},
		confirm : function(title, message, callback, callbackCancel, btntext) {
			return GP.render({
				title : title,
				message : message,
				modal : true,
				buttons : [{
					'btext' : btntext || GP.defaults.buttons.ok.btext,
					'btype' : 'confirm',
					'callback' : callback
				}, {
					'btext' : GP.defaults.buttons.cancel.btext,
					'btype' : 'normal',
					'callback' : callbackCancel
				}]
			});
		},
		caution : function(title, message, callback, callbackCancel, btntext ) {
			return GP.render({
				title : title,
				message : message,
				modal : true,
				buttons : [{
					'btext' : btntext || GP.defaults.buttons.del.btext,
					'btype' : 'caution',
					'callback' : callback
				}, {
					'btext' : GP.defaults.buttons.cancel.btext,
					'bclass' : GP.defaults.buttons.cancel.bclass,
					'callback' : callbackCancel
				}]
			});
		},
		search : function(toptions) {
			var classnames = " layer_normal", 
				callback = null;

			if('pclass' in toptions) {
				classnames = [classnames ,toptions.pclass].join(' ');
				delete toptions['pclass'];
			}
			if('callback' in toptions) {
				callback = toptions.callback;
				delete toptions['callback'];
			}

			var options = $.extend({
				width: 460, 
				wrapTpl : GP.defaults.tpl.wrapSearch, 
				pclass: classnames, 
				buttons : [{
					btype : GP.defaults.buttons.search.btype,
					btext : GP.defaults.buttons.search.btext,
					autoclose : false,
					callback : callback
				}, GP.defaults.buttons.cancel]
			}, toptions);

			return GP.render(options);
		},
		template : function(tpl,data){ 
			return tpl.replace(/{(\w*)}/g,function(m,key){return data.hasOwnProperty(key)?data[key]:"";}); 
		},
		close : function(closeCallback) {
			if(typeof closeCallback == 'function') closeCallback();
			ocxUploadVisible(true);
			$(document).unbind('.gopop');

			$('.go_popup').remove();
			if(getLayerLength() == 0){
				$('#popOverlay').remove();

				if(!window.opener && window.top.$) {
					window.top.$(".overlay").remove();

					//어드밴스드일때 오른쪽 상단 info, 햄버거 메뉴 처리
					window.top.$("div.gnb").removeClass('adv_overlay');
				}
			}

			//GO-32610 이슈 재오픈
			// if(!window.opener && window.top.$){
            //     window.top.$(".overlay").remove();
            // }

			if (GP.toggleTrigger) $(document).trigger("hideLayer.goLayer");

		},
		renderPopup : function(options) {

			var popupEl = null,
				wrapTpl = options.wrapTpl || GP.defaults.tpl.wrap;
				pid = options['id'] || GP.defaults.pid,
				targetEl = options.targetEl || GP.defaults.targetEl,
				header = options.header || '',
				headerHtml = options.headerHtml || '',
				pclass = options.pclass ? options.pclass : header ? 'layer_normal' : 'layer_confim',
				width = options.width || GP.defaults.width,
				pTitle = options.title || '',
				message = options.message || '',
				contents = options.contents || '',
				buttons = options.buttons || '',		
				buttonwrap = buttons ?  GP.defaults.tpl.buttonwrap : '',
				openCallback = options.openCallback || '',
				closeCallback = options.closeCallback || '',
				addCss = (width < 0 ? {} : { width : width }),
				modal =  options.hasOwnProperty('modal') ? options.modal : GP.defaults.modal,
				isDrag =  options.hasOwnProperty('modal') ? options.isDrag : false,
				isLock = options.isLock,
				appendTarget = options.appendTarget || 'body',
				handle = options.handle || "";
				// activeX toggle 여부. layer 가 뜰때 기본적으로 토글을 수행. 
				// activeX를 숨기지 않아야 할때는 toggleTrigger = false;
			GP.toggleTrigger = options.toggleTrigger != false ? true : false;

            var deferred = $.Deferred();

            var isClose = options.isClose || false;
            if(!isClose) {
                GP.close();
            }

			if(modal && ($('div[data-overlay]').length == 0)) {
				$(appendTarget).append(GP.defaults.tpl.overlay);

                if(!window.opener && window.top.$) {
                    var height = window.top.$("header.go_header").outerHeight();
                    //메일에서 팝업열때 advanced 일때 상단 top이 아니라 좌측부분을 가려야한다.....
					// 그래서 width와 height를 동시에 구한다.
					var width = window.top.$("header.go_header").outerWidth();
                    //window.top.$("body").append("<div class='overlay' data-layer style='height: "+ height +"px '></div>");
					window.top.$("body").append("<div class='overlay' data-overlay style='height: "+height+"px;width: "+ width +"px '></div>");
					//어드밴스드일때 오른쪽 상단 info, 햄버거 메뉴 처리
					window.top.$("div.gnb").addClass('adv_overlay');
                }
			}
			//alert(pTitle);
			popupEl = $(GP.template(wrapTpl.join(''), { 
				'pid' : pid,
				'header' : header,
				'pTitle' : pTitle ? GP.template(GP.defaults.tpl.pTitle,{pTitle : pTitle}) : '',
				'pclass' : pclass,
				'headerHtml' : headerHtml,
				'width' : width,
				'message' : message ? GP.template(GP.defaults.tpl.message,{message : message}) : '',
				'contents' : contents,
				'buttonwrap' : buttonwrap
			})).appendTo(appendTarget);
			ocxUploadVisible(false);
			popupEl.css('z-index', '70');
			var popupDragged = false;
			if (!isLock) {
				popupEl.draggable({
					containment: "parent",
					handle : handle ? handle : (isDrag?'go_popup':'header, footer'),
					cursor : 'move',
					delay: 200,
					stop : function(e, ui) {
                    	popupDragged = true;
                    }
				});		
			}
			if (openCallback) openCallback(popupEl);
			if(buttons) {
				var buttonWrap = popupEl.find('.btn_layer_wrap');
				$(buttons).each(function(k,v) {
					buttonWrap.append(
						$(GP.template(GP.defaults.tpl.button, $.extend(v,{
							'bclass' : eval('GP.defaults.btype.'+v.btype) || GP.defaults.btype.normal
						}))).bind('click.gopop', function(e) {
							e.stopPropagation();
							if (popupDragged) {
								popupDragged = false;
								return false;
							}
							v.autoclose = v.hasOwnProperty('autoclose') ? v.autoclose : true;
							if(typeof v.callback == 'function') v.callback(popupEl);							
							if(v.autoclose) GP.close(closeCallback);
						})
					);					
				});
			}
			
			popupEl.reoffset = function() {
				if(options.offset) {
					$.extend(addCss, options.offset ,{ position : "absolute", margin	: 0 });
				} else {
					$.extend(addCss, { position : "fixed", left : '50%', top: '50%', marginTop	: ((popupEl.height()/2+13) * -1) + 'px', marginLeft : ((popupEl.width()/2) * -1) + 'px'});
				}
				popupEl.css(addCss).show();
			};
			popupEl.close = GP.close; 
			popupEl.reoffset();
			
			popupEl.find('.btn_layer_x').bind('click.gopop' , function(){ 
				GP.close(closeCallback); 
			});
			
			jQuery(window).trigger("resize").trigger("resize");
			
			deferred.resolveWith(this, [popupEl]);
			
			return deferred;
		},
		render : function(options) {
            var returnEl = null;
            GP.renderPopup(options).done(function(popupEl) {
                returnEl = popupEl;
				var buttonWrap = popupEl.find(".click.gopop")
                $(buttonWrap).bind('click.gopop', function(e) {
                    if($('.go_popup').length && $('.go_popup').attr('data-close') == 'true'
						&& !$(e.target).parents('.go_popup').length && ($(e.target).attr('id') != 'fileReader')) {
                        if($('#popOverlay').length || $(e.target).hasClass('paginate_button')) return false;
                        if($('.ui-datepicker').length > 0 && $('.ui-datepicker').is(':visible')) return false;
                        GP.close(closeCallback);
                    }
                    $('.go_popup').attr('data-close', true);
                });

                if (options.toggleTrigger != false) {
                    $(document).trigger("showLayer.goLayer");
                }
            });
            return returnEl;
        },
        _error : function(){
        }
	});
	
	$.goAlert = GP.alert;
	$.goConfirm = GP.confirm;
	$.goCaution = GP.caution;
	$.goMessage = GP.message;
	$.goError = GP.error;
	$.goSearch = GP.search;
	$.goSlideMessage = GP.slideMessage;
	
})(jQuery);
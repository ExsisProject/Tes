(function(e){var t={tooltip:!1,tooltipOpts:{content:"%s | X: %x | Y: %y",xDateFormat:null,yDateFormat:null,shifts:{x:10,y:20},defaultTheme:!0,onHover:function(e,t){}}},n=function(e){this.tipPosition={x:0,y:0},this.init(e)};n.prototype.init=function(t){function r(e){var t={};t.x=e.pageX,t.y=e.pageY,n.updateTooltipPosition(t)}function i(e,t,r){var i=n.getDomElement();if(r){var s;s=n.stringFormat(n.tooltipOptions.content,r),i.html(s),n.updateTooltipPosition({x:t.pageX,y:t.pageY}),i.css({left:n.tipPosition.x+n.tooltipOptions.shifts.x,top:n.tipPosition.y+n.tooltipOptions.shifts.y}).show(),typeof n.tooltipOptions.onHover=="function"&&n.tooltipOptions.onHover(r,i)}else i.hide().html("")}var n=this;t.hooks.bindEvents.push(function(t,s){n.plotOptions=t.getOptions();if(n.plotOptions.tooltip===!1||typeof n.plotOptions.tooltip=="undefined")return;n.tooltipOptions=n.plotOptions.tooltipOpts;var o=n.getDomElement();e(t.getPlaceholder()).bind("plothover",i),e(s).bind("mousemove",r)}),t.hooks.shutdown.push(function(t,n){e(t.getPlaceholder()).unbind("plothover",i),e(n).unbind("mousemove",r)})},n.prototype.getDomElement=function(){var t;return e("#flotTip").length>0?t=e("#flotTip"):(t=e("<div />").attr("id","flotTip"),t.appendTo("body").hide().css({position:"absolute"}),this.tooltipOptions.defaultTheme&&t.css({background:"#fff","z-index":"100",padding:"0.4em 0.6em","border-radius":"0.5em","font-size":"12px",border:"1px solid #111",display:"none","white-space":"nowrap"})),t},n.prototype.updateTooltipPosition=function(t){var n=e("#flotTip").outerWidth()+this.tooltipOptions.shifts.x,r=e("#flotTip").outerHeight()+this.tooltipOptions.shifts.y;t.x-e(window).scrollLeft()>e(window).innerWidth()-n&&(t.x-=n),t.y-e(window).scrollTop()>e(window).innerHeight()-r&&(t.y-=r),this.tipPosition.x=t.x,this.tipPosition.y=t.y},n.prototype.stringFormat=function(e,t){var n=/%p\.{0,1}(\d{0,})/,r=/%s/,i=/%x\.{0,1}(?:\d{0,})/,s=/%y\.{0,1}(?:\d{0,})/,o=t.datapoint[0],u=t.datapoint[1];return typeof e=="function"&&(e=e(t.series.label,o,u,t)),typeof t.series.percent!="undefined"&&(e=this.adjustValPrecision(n,e,t.series.percent)),typeof t.series.label!="undefined"&&(e=e.replace(r,t.series.label)),this.isTimeMode("xaxis",t)&&this.isXDateFormat(t)&&(e=e.replace(i,this.timestampToDate(o,this.tooltipOptions.xDateFormat))),this.isTimeMode("yaxis",t)&&this.isYDateFormat(t)&&(e=e.replace(s,this.timestampToDate(u,this.tooltipOptions.yDateFormat))),typeof o=="number"&&(e=this.adjustValPrecision(i,e,o)),typeof u=="number"&&(e=this.adjustValPrecision(s,e,u)),typeof t.series.xaxis.tickFormatter!="undefined"&&(e=e.replace(i,t.series.xaxis.tickFormatter(o,t.series.xaxis))),typeof t.series.yaxis.tickFormatter!="undefined"&&(e=e.replace(s,t.series.yaxis.tickFormatter(u,t.series.yaxis))),e},n.prototype.isTimeMode=function(e,t){return typeof t.series[e].options.mode!="undefined"&&t.series[e].options.mode==="time"},n.prototype.isXDateFormat=function(e){return typeof this.tooltipOptions.xDateFormat!="undefined"&&this.tooltipOptions.xDateFormat!==null},n.prototype.isYDateFormat=function(e){return typeof this.tooltipOptions.yDateFormat!="undefined"&&this.tooltipOptions.yDateFormat!==null},n.prototype.timestampToDate=function(t,n){var r=new Date(t);return e.plot.formatDate(r,n)},n.prototype.adjustValPrecision=function(e,t,n){var r,i=t.match(e);return i!==null&&RegExp.$1!==""&&(r=RegExp.$1,n=n.toFixed(r),t=t.replace(e,n)),t};var r=function(e){new n(e)};e.plot.plugins.push({init:r,options:t,name:"tooltip",version:"0.6.1"})})(jQuery);
/*
* Print Element Plugin 2.0
*
* Copyright (c) 2012 Erik Zaadi
*
*  Home Page : http://projects.erikzaadi/jQuery.printElement
*  Issues (bug reporting) : http://github.com/erikzaadi/jQuery.printElement/issues
*  jQuery plugin page : http://plugins.jquery.com/project/printElement
*
* Dual licensed under the MIT and GPL licenses:
*   http://www.opensource.org/licenses/mit-license.php
*   http://www.gnu.org/licenses/gpl.html
*
*/
/*global window,focus,setTimeout,navigator*/
(function (window, undefined) {
    var document = window.document;
    var $ = window.jQuery;
    $.fn.printElement = function (options) {
        var mainOptions = $.extend({}, $.fn.printElement.defaults, options);
        //iframe mode is not supported for opera and chrome 3.0 (it prints the entire page).
        //http://www.google.com/support/forum/p/Webmasters/thread?tid=2cb0f08dce8821c3&hl=en
        if (mainOptions.printMode === 'iframe') {
            //GO-10349 : ie8.0 에서는 iframe방식으로 인쇄시 비율이 줄어들지 않아 popup형태로 변경
            // ie8 뿐만 아니라 모든 ie 에서 iframe 방식으로 인쇄시 정상적으로 출력되지 않음.
            var ua = navigator.userAgent.toLowerCase();
            if ($.browser.opera || (/chrome/.test(ua)) || GO.util.msie()){
                mainOptions.printMode = 'popup';
            }
        }
        //Remove previously printed iframe if exists
        $("[id^='printElement_']").remove();

        return this.each(function () {
            //Support Metadata Plug-in if available
            var opts = $.meta ? $.extend({}, mainOptions, $(this).data()) : mainOptions;
            _printElement($(this), opts);
        });
    };
    $.fn.printElement.defaults = {
        "printMode": 'iframe', //Usage : iframe / popup
        "pageTitle": '', //Print Page Title
        "overrideElementCSS": null,
        /* Can be one of the following 3 options:
        * 1 : boolean (pass true for stripping all css linked)
        * 2 : array of $.fn.printElement.cssElement (s)
        * 3 : array of strings with paths to alternate css files (optimized for print)
        */
        "printBodyOptions": {
            "styleToAdd": '', // 2015 인쇄대란. padding, margin 빼야함. GO-20492
            //"styleToAdd": 'padding:10px;margin:10px;', //style attributes to add to the body of print document
            "classNameToAdd": '' //css class to add to the body of print document
        },
        "leaveOpen": false, // in case of popup, leave the print page open or not
        "iframeElementOptions": {
            "styleToAdd": 'border:none;position:absolute;width:0px;height:0px;bottom:0px;left:0px;', //style attributes to add to the iframe element
            "classNameToAdd": '' //css class to add to the iframe element
        }
    };
    $.fn.printElement.cssElement = {
        "href": '',
        "media": ''
    };
    function _printElement(element, opts) {
        //Create markup to be printed
        var html = _getMarkup(element, opts);

        var popupOrIframe = null;
        var documentToWriteTo = null;
        if (opts.printMode.toLowerCase() === 'popup') {
            popupOrIframe = window.open('about:blank', 'printElementWindow', 'width=720,height=440,scrollbars=yes');
            documentToWriteTo = popupOrIframe.document;
        } else {
            //The random ID is to overcome a safari bug http://www.cjboco.com.sharedcopy.com/post.cfm/442dc92cd1c0ca10a5c35210b8166882.html
            var printElementID = "printElement_" + (Math.round(Math.random() * 99999)).toString();
            //Native creation of the element is faster..
            var iframe = document.createElement('IFRAME');
            $(iframe).attr({
                style: opts.iframeElementOptions.styleToAdd,
                id: printElementID,
                className: opts.iframeElementOptions.classNameToAdd,
                frameBorder: 0,
                scrolling: 'no',
                src: 'about:blank'
            });
            document.body.appendChild(iframe);
            documentToWriteTo = (iframe.contentWindow || iframe.contentDocument);
            if (documentToWriteTo.document) {
                documentToWriteTo = documentToWriteTo.document;
            }
            iframe = document.frames ? document.frames[printElementID] : document.getElementById(printElementID);
            popupOrIframe = iframe.contentWindow || iframe;
        }
        focus();
        documentToWriteTo.open();
        documentToWriteTo.write(html);
        documentToWriteTo.close();
        _callPrint(popupOrIframe);
    }

    function _callPrint(element) {
    	var ua = navigator.userAgent.toLowerCase();
        if (element && element.printPage) {
            setTimeout(function () {
                element.printPage();
            }, 50);
        } else {
            setTimeout(function () {
                _callPrint(element);
            }, 50);
        }
    }

    function _getElementHTMLIncludingFormElements(element) {
        var $element = $(element);
        var clone = $element.clone();
        //Radiobuttons and checkboxes
        $(":checked", clone).each(function () {
            this.setAttribute('checked', 'checked');
        });
        //simple text inputs
        $("input[type='text'],input[type='number']", clone).each(function () {
            this.setAttribute('value', $(this).val());
        });
        $("select", clone).each(function () {
            var $select = $(this);
            $("option", $select).each(function () {
                if ($select.val() === $(this).val()) {
                    this.setAttribute('selected', 'selected');
                }
            });
        });
        $("textarea", clone).each(function () {
            //Thanks http://blog.ekini.net/2009/02/24/jquery-getting-the-latest-textvalue-inside-a-textarea/
            var value = $(this).attr('value');
            //fix for issue 7 (http://plugins.jquery.com/node/13503 and http://github.com/erikzaadi/jQueryPlugins/issues#issue/7)
            if (this.firstChild) {
                this.firstChild.textContent = value;
            } else {
                this.innerHTML = value;
            }
        });
        //http://dbj.org/dbj/?p=91
        var elementHtml = $('<div></div>').append(clone).html();
        return elementHtml;
    }

    function _getBaseHref() {
        var port = (window.location.port) ? ':' + window.location.port : '';
        return window.location.protocol + '//' + window.location.hostname + port + window.location.pathname;
    }

    function _getMarkup(element, opts) {
        var $element = $(element);
        var elementHtml = _getElementHTMLIncludingFormElements(element);

        var html = [];
        
        // DOCTYPE 이 없으면 height 속성이 다른 방식으로 동작한다.
        html.push('<!DOCTYPE html><html><head><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"><title>' + opts["pageTitle"] + '</title>');
        if (opts.overrideElementCSS) {
            if (opts.overrideElementCSS.length > 0) {
                for (var x = 0; x < opts.overrideElementCSS.length; x += 1) {
                    var current = opts.overrideElementCSS[x];
                    if (typeof (current) === 'string') {
                        html.push('<link type="text/css" rel="stylesheet" href="' + current + '" >');
                    } else {
                        var media = current.media || '';
                        html.push('<link type="text/css" rel="stylesheet" href="' + current.href + '" media="' + media + '" >');
                    }
                }
            }
        } else {
            $("link", document).filter(function () {
                return $(this).attr("rel").toLowerCase() === "stylesheet";
            }).each(function () {
                var media = $(this).attr('media') || '';
                html.push('<link type="text/css" rel="stylesheet" href="' + $(this).attr("href") + '" media="' + media + '" >');
            });
        }
        //Ensure that relative links work
        html.push('<base href="' + _getBaseHref() + '" />');
        html.push('</head><body style="' + opts.printBodyOptions.styleToAdd + '" class="' + opts.printBodyOptions.classNameToAdd + '">');
        html.push('<div class="' + $element.attr('class') + '">' + elementHtml + '</div>');
        html.push('<script type="text/javascript">function printPage(){focus();print();' + ((!opts.leaveOpen && opts.printMode.toLowerCase() === 'popup') ? 'close();' : '') + '}</script>');
        html.push('</body></html>');

        return html.join('');
    }
}(window));

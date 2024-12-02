/**
 * 에디터가 지원하지 못하는 html validation 을 위한 코드
 * p 태그 하위에 block 요소가 들어가게 되면 html 구조가 깨지게 된다.
 * 이러한 경우 상위의 p 태그를 제거해 주도록 하자.
 */

define('components/form_component_manager/html_converter', function(require) {

    var BLOCK_ELEMENTS = [
        'address', 'article', 'aside', 'audio', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'fieldset',
        'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup',
        'hr', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table', 'tfoot', 'ul', 'video'
    ];

    var CLOSE_P_TAG = '</p>';
    var HTMLConverter = function() {};

    HTMLConverter.prototype.convert = function(html) {
        //this.html = '<p><span><div>1</div></span></p>';
        this.html = html;
        this.cursor = 0;
        var count = 0;
        while (this.hasNext()) {
            if (this.hasBlockElementInPTag()) {
                this.unWrapPTag();
                console.log(++count);
            }
            this.forward();
        }
        return this.html;
    };

    HTMLConverter.prototype.hasNext = function() {
        return this.html.length > this.cursor;
    };

    HTMLConverter.prototype.forward = function() {
        this.cursor++;
    };

    HTMLConverter.prototype.findPTag = function() {
        return this.html.substring(this.findOpenPTagEndIndex(), this.findClosePTagStartIndex());
    };

    HTMLConverter.prototype.findOpenPTagStartIndex = function() {
        return this.html.indexOf('<p');
    };

    HTMLConverter.prototype.findOpenPTagEndIndex = function() {
        return this.html.indexOf('>', this.findOpenPTagStartIndex()) + 1;
    };

    HTMLConverter.prototype.findClosePTagStartIndex = function() {
        return this.html.indexOf(CLOSE_P_TAG);
    };

    HTMLConverter.prototype.findClosePTagEndIndex = function() {
        return this.html.indexOf(CLOSE_P_TAG) + CLOSE_P_TAG.length;
    };

    HTMLConverter.prototype.hasBlockElementInPTag = function() {
        var p = this.findPTag();
        var hasBlockElement = false;
        _.each(BLOCK_ELEMENTS, function(blockElement) {
            if (p.indexOf('<' + blockElement) > -1) {
                hasBlockElement = true;
                return false;
            }
        }, this);
        return hasBlockElement;
    };

    HTMLConverter.prototype.unWrapPTag = function() {
        var contentBeforePTag = this.html.substring(0, this.findOpenPTagStartIndex());
        var unWrapContent = this.html.substring(this.findOpenPTagEndIndex(), this.findClosePTagStartIndex());
        var contentAfterPTag = this.html.substring(this.findClosePTagEndIndex(), this.html.length);
        this.html = contentBeforePTag + unWrapContent + contentAfterPTag;
        console.log(this.html);
        this.cursor = (contentBeforePTag + unWrapContent).length;
    };

    return HTMLConverter;
});

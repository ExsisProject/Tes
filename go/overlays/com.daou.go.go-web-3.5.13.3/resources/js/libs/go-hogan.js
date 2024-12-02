/**
 * Hogan 을 사용하는 경우 이곳에서 강제로 XSS 방어를 한다.
 * hogan.js 의 codegen['{'] 부분을 오버라이드 한다.
 *
 * https://issue.daou.co.kr/browse/GO-19421
 */

define(function(require) {
    var Hogan = require('hogan');

    _.extend(Hogan.codegen, {
        '{': function(node, context) {
            var rQuot = /\"/g,
                rNewline =  /\n/g,
                rCr = /\r/g,
                rSlash = /\\/g,
                rLineSep = /\u2028/,
                rParagraphSep = /\u2029/;

            context.code += 't.b(GO.util.escapeXssFromHtml(t.t(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0))));';

            function esc(s) {
                return s.replace(rSlash, '\\\\')
                    .replace(rQuot, '\\\"')
                    .replace(rNewline, '\\n')
                    .replace(rCr, '\\r')
                    .replace(rLineSep, '\\u2028')
                    .replace(rParagraphSep, '\\u2029');
            }

            function chooseMethod(s) {
                return (~s.indexOf('.')) ? 'd' : 'f';
            }
        }
    });

    return Hogan;
});
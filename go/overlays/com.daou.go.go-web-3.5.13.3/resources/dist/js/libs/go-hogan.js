define(function(require){var e=require("hogan");return _.extend(e.codegen,{"{":function(e,t){function a(e){return e.replace(s,"\\\\").replace(n,'\\"').replace(r,"\\n").replace(i,"\\r").replace(o,"\\u2028").replace(u,"\\u2029")}function f(e){return~e.indexOf(".")?"d":"f"}var n=/\"/g,r=/\n/g,i=/\r/g,s=/\\/g,o=/\u2028/,u=/\u2029/;t.code+="t.b(GO.util.escapeXssFromHtml(t.t(t."+f(e.n)+'("'+a(e.n)+'",c,p,0))));'}}),e});
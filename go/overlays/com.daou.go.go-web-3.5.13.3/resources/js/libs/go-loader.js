(function() {
    var GO, 
        global = this;

    // GO Namespace
    if(typeof global.GO === 'undefined') GO = global.GO = {};

    var loader = (function() {
        var $D = document;

        // Constructor
        var Constr = function(basename) {
            this.basename = basename;
            this.path = this.findPath();
        };

        Constr.prototype.findPath = function() {
            if ($D.getElementById("boot")) {
                src = $D.getElementById("boot").getAttribute("src");
            } else {
                scripts = $D.getElementsByTagName("script");
                for (_i = 0, _len = scripts.length; _i < _len; _i++) {
                    script = scripts[_i];
                    curSrc = script.getAttribute("src");
                    if (new RegExp(this.basename).test(curSrc)) {
                        src = curSrc;
                    }
                }
            }
            return src.replace(this.basename, "");
        };

        Constr.prototype.load = function(rpath, charset) {
            var element;
            element = $D.createElement("script");
            element.setAttribute("type", "text/javascript");
            element.setAttribute("src", this.path + rpath);
            element.setAttribute("charset", charset || "utf-8");
            element.setAttribute("async", "");
            return $D.getElementsByTagName("head")[0].appendChild(element);
        };

        return Constr;
    })();

    GO.loader = loader;
}).call(this);
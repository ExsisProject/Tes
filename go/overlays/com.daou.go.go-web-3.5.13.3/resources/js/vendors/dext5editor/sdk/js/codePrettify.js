
!function () {
    var a = null;
    window.PR_SHOULD_USE_CONTINUATION = !0;
    (function () {
        function h(J) {
            function G(O) {
                var M = O.charCodeAt(0);
                if (M !== 92) {
                    return M
                }
                var N = O.charAt(1);
                return (M = p[N]) ? M : "0" <= N && N <= "7" ? parseInt(O.substring(1), 8) : N === "u" || N === "x" ? parseInt(O.substring(2), 16) : O.charCodeAt(1)
            }
            function F(M) {
                if (M < 32) {
                    return (M < 16 ? "\\x0" : "\\x") + M.toString(16)
                }
                M = String.fromCharCode(M);
                return M === "\\" || M === "-" || M === "]" || M === "^" ? "\\" + M : M
            }
            function I(R) {
                var M = R.substring(1, R.length - 1).match(/\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\[0-3][0-7]{0,2}|\\[0-7]{1,2}|\\[\S\s]|[^\\]/g)
                  , R = []
                  , O = M[0] === "^"
                  , S = ["["];
                O && S.push("^");
                for (var O = O ? 1 : 0, Q = M.length; O < Q; ++O) {
                    var P = M[O];
                    if (/\\[bdsw]/i.test(P)) {
                        S.push(P)
                    } else {
                        var P = G(P), N;
                        O + 2 < Q && "-" === M[O + 1] ? (N = G(M[O + 2]),
                        O += 2) : N = P;
                        R.push([P, N]);
                        N < 65 || P > 122 || (N < 65 || P > 90 || R.push([Math.max(65, P) | 32, Math.min(N, 90) | 32]),
                        N < 97 || P > 122 || R.push([Math.max(97, P) & -33, Math.min(N, 122) & -33]))
                    }
                }
                R.sort(function (U, T) {
                    return U[0] - T[0] || T[1] - U[1]
                });
                M = [];
                Q = [];
                for (O = 0; O < R.length; ++O) {
                    P = R[O],
                    P[0] <= Q[1] + 1 ? Q[1] = Math.max(Q[1], P[1]) : M.push(Q = P)
                }
                for (O = 0; O < M.length; ++O) {
                    P = M[O],
                    S.push(F(P[0])),
                    P[1] > P[0] && (P[1] + 1 > P[0] && S.push("-"),
                    S.push(F(P[1])))
                }
                S.push("]");
                return S.join("")
            }
            function L(Q) {
                for (var N = Q.source.match(/\[(?:[^\\\]]|\\[\S\s])*]|\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\\d+|\\[^\dux]|\(\?[!:=]|[()^]|[^()[\\^]+/g), S = N.length, R = [], P = 0, O = 0; P < S; ++P) {
                    var M = N[P];
                    M === "(" ? ++O : "\\" === M.charAt(0) && (M = +M.substring(1)) && (M <= O ? R[M] = -1 : N[P] = F(M))
                }
                for (P = 1; P < R.length; ++P) {
                    -1 === R[P] && (R[P] = ++K)
                }
                for (O = P = 0; P < S; ++P) {
                    M = N[P],
                    M === "(" ? (++O,
                    R[O] || (N[P] = "(?:")) : "\\" === M.charAt(0) && (M = +M.substring(1)) && M <= O && (N[P] = "\\" + R[M])
                }
                for (P = 0; P < S; ++P) {
                    "^" === N[P] && "^" !== N[P + 1] && (N[P] = "")
                }
                if (Q.ignoreCase && y) {
                    for (P = 0; P < S; ++P) {
                        M = N[P],
                        Q = M.charAt(0),
                        M.length >= 2 && Q === "[" ? N[P] = I(M) : Q !== "\\" && (N[P] = M.replace(/[A-Za-z]/g, function (T) {
                            T = T.charCodeAt(0);
                            return "[" + String.fromCharCode(T & -33, T | 32) + "]"
                        }))
                    }
                }
                return N.join("")
            }
            for (var K = 0, y = !1, D = !1, C = 0, H = J.length; C < H; ++C) {
                var E = J[C];
                if (E.ignoreCase) {
                    D = !0
                } else {
                    if (/[a-z]/i.test(E.source.replace(/\\u[\da-f]{4}|\\x[\da-f]{2}|\\[^UXux]/gi, ""))) {
                        y = !0;
                        D = !1;
                        break
                    }
                }
            }
            for (var p = {
                b: 8,
                t: 9,
                n: 10,
                v: 11,
                f: 12,
                r: 13
            }, v = [], C = 0, H = J.length; C < H; ++C) {
                E = J[C];
                if (E.global || E.multiline) {
                    throw Error("" + E)
                }
                v.push("(?:" + L(E) + ")")
            }
            return RegExp(v.join("|"), D ? "gi" : "g")
        }
        function g(C, G) {
            function F(H) {
                var I = H.nodeType;
                if (I == 1) {
                    if (!y.test(H.className)) {
                        for (I = H.firstChild; I; I = I.nextSibling) {
                            F(I)
                        }
                        I = H.nodeName.toLowerCase();
                        if ("br" === I || "li" === I) {
                            E[D] = "\n",
                            p[D << 1] = v++,
                            p[D++ << 1 | 1] = H
                        }
                    }
                } else {
                    if (I == 3 || I == 4) {
                        I = H.nodeValue,
                        I.length && (I = G ? I.replace(/\r\n?/g, "\n") : I.replace(/[\t\n\r ]+/g, " "),
                        E[D] = I,
                        p[D << 1] = v,
                        v += I.length,
                        p[D++ << 1 | 1] = H)
                    }
                }
            }
            var y = /(?:^|\s)nocode(?:\s|$)/
              , E = []
              , v = 0
              , p = []
              , D = 0;
            F(C);
            return {
                a: E.join("").replace(/\n$/, ""),
                d: p
            }
        }
        function t(v, C, y, p) {
            C && (v = {
                a: C,
                e: v
            },
            y(v),
            p.push.apply(p, v.g))
        }
        function f(v) {
            for (var C = void 0, y = v.firstChild; y; y = y.nextSibling) {
                var p = y.nodeType
                  , C = p === 1 ? C ? v : y : p === 3 ? e.test(y.nodeValue) ? v : C : C
            }
            return C === v ? void 0 : C
        }
        function A(y, E) {
            function D(R) {
                for (var K = R.e, J = [K, "pln"], Q = 0, L = R.a.match(C) || [], F = {}, H = 0, O = L.length; H < O; ++H) {
                    var P = L[H], S = F[P], T = void 0, N;
                    if (typeof S === "string") {
                        N = !1
                    } else {
                        var M = v[P.charAt(0)];
                        if (M) {
                            T = P.match(M[1]),
                            S = M[0]
                        } else {
                            for (N = 0; N < p; ++N) {
                                if (M = E[N],
                                T = P.match(M[1])) {
                                    S = M[0];
                                    break
                                }
                            }
                            T || (S = "pln")
                        }
                        if ((N = S.length >= 5 && "lang-" === S.substring(0, 5)) && !(T && typeof T[1] === "string")) {
                            N = !1,
                            S = "src"
                        }
                        N || (F[P] = S)
                    }
                    M = Q;
                    Q += P.length;
                    if (N) {
                        N = T[1];
                        var I = P.indexOf(N)
                          , G = I + N.length;
                        T[2] && (G = P.length - T[2].length,
                        I = G - N.length);
                        S = S.substring(5);
                        t(K + M, P.substring(0, I), D, J);
                        t(K + M + I, N, s(S, N), J);
                        t(K + M + G, P.substring(G), D, J)
                    } else {
                        J.push(K + M, S)
                    }
                }
                R.g = J
            }
            var v = {}, C;
            (function () {
                for (var J = y.concat(E), G = [], F = {}, M = 0, H = J.length; M < H; ++M) {
                    var I = J[M]
                      , L = I[3];
                    if (L) {
                        for (var K = L.length; --K >= 0;) {
                            v[L.charAt(K)] = I
                        }
                    }
                    I = I[1];
                    L = "" + I;
                    F.hasOwnProperty(L) || (G.push(I),
                    F[L] = a)
                }
                G.push(/[\S\s]/);
                C = h(G)
            })();
            var p = E.length;
            return D
        }
        function u(v) {
            var D = []
              , C = [];
            v.tripleQuotedStrings ? D.push(["str", /^(?:'''(?:[^'\\]|\\[\S\s]|''?(?=[^']))*(?:'''|$)|"""(?:[^"\\]|\\[\S\s]|""?(?=[^"]))*(?:"""|$)|'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$))/, a, "'\""]) : v.multiLineStrings ? D.push(["str", /^(?:'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$)|`(?:[^\\`]|\\[\S\s])*(?:`|$))/, a, "'\"`"]) : D.push(["str", /^(?:'(?:[^\n\r'\\]|\\.)*(?:'|$)|"(?:[^\n\r"\\]|\\.)*(?:"|$))/, a, "\"'"]);
            v.verbatimStrings && C.push(["str", /^@"(?:[^"]|"")*(?:"|$)/, a]);
            var p = v.hashComments;
            p && (v.cStyleComments ? (p > 1 ? D.push(["com", /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, a, "#"]) : D.push(["com", /^#(?:(?:define|e(?:l|nd)if|else|error|ifn?def|include|line|pragma|undef|warning)\b|[^\n\r]*)/, a, "#"]),
            C.push(["str", /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h(?:h|pp|\+\+)?|[a-z]\w*)>/, a])) : D.push(["com", /^#[^\n\r]*/, a, "#"]));
            v.cStyleComments && (C.push(["com", /^\/\/[^\n\r]*/, a]),
            C.push(["com", /^\/\*[\S\s]*?(?:\*\/|$)/, a]));
            if (p = v.regexLiterals) {
                var y = (p = p > 1 ? "" : "\n\r") ? "." : "[\\S\\s]";
                C.push(["lang-regex", RegExp("^(?:^^\\.?|[+-]|[!=]=?=?|\\#|%=?|&&?=?|\\(|\\*=?|[+\\-]=|->|\\/=?|::?|<<?=?|>>?>?=?|,|;|\\?|@|\\[|~|{|\\^\\^?=?|\\|\\|?=?|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\\s*(" + ("/(?=[^/*" + p + "])(?:[^/\\x5B\\x5C" + p + "]|\\x5C" + y + "|\\x5B(?:[^\\x5C\\x5D" + p + "]|\\x5C" + y + ")*(?:\\x5D|$))+/") + ")")])
            }
            (p = v.types) && C.push(["typ", p]);
            p = ("" + v.keywords).replace(/^ | $/g, "");
            p.length && C.push(["kwd", RegExp("^(?:" + p.replace(/[\s,]+/g, "|") + ")\\b"), a]);
            D.push(["pln", /^\s+/, a, " \r\n\t\u00a0"]);
            p = "^.[^\\s\\w.$@'\"`/\\\\]*";
            v.regexLiterals && (p += "(?!s*/)");
            C.push(["lit", /^@[$_a-z][\w$@]*/i, a], ["typ", /^(?:[@_]?[A-Z]+[a-z][\w$@]*|\w+_t\b)/, a], ["pln", /^[$_a-z][\w$@]*/i, a], ["lit", /^(?:0x[\da-f]+|(?:\d(?:_\d+)*\d*(?:\.\d*)?|\.\d\+)(?:e[+-]?\d+)?)[a-z]*/i, a, "0123456789"], ["pln", /^\\[\S\s]?/, a], ["pun", RegExp(p), a]);
            return A(D, C)
        }
        function q(J, G, F) {
            function I(M) {
                var P = M.nodeType;
                if (P == 1 && !K.test(M.className)) {
                    if ("br" === M.nodeName) {
                        L(M),
                        M.parentNode && M.parentNode.removeChild(M)
                    } else {
                        for (M = M.firstChild; M; M = M.nextSibling) {
                            I(M)
                        }
                    }
                } else {
                    if ((P == 3 || P == 4) && F) {
                        var O = M.nodeValue
                          , N = O.match(y);
                        if (N) {
                            P = O.substring(0, N.index),
                            M.nodeValue = P,
                            (O = O.substring(N.index + N[0].length)) && M.parentNode.insertBefore(D.createTextNode(O), M.nextSibling),
                            L(M),
                            P || M.parentNode.removeChild(M)
                        }
                    }
                }
            }
            function L(N) {
                function M(P, U) {
                    var T = U ? P.cloneNode(!1) : P
                      , S = P.parentNode;
                    if (S) {
                        var S = M(S, 1)
                          , R = P.nextSibling;
                        S.appendChild(T);
                        for (var Q = R; Q; Q = R) {
                            R = Q.nextSibling,
                            S.appendChild(Q)
                        }
                    }
                    return T
                }
                for (; !N.nextSibling;) {
                    if (N = N.parentNode,
                    !N) {
                        return
                    }
                }
                for (var N = M(N.nextSibling, 0), O; (O = N.parentNode) && O.nodeType === 1;) {
                    N = O
                }
                H.push(N)
            }
            for (var K = /(?:^|\s)nocode(?:\s|$)/, y = /\r\n?|\n/, D = J.ownerDocument, C = D.createElement("li") ; J.firstChild;) {
                C.appendChild(J.firstChild)
            }
            for (var H = [C], E = 0; E < H.length; ++E) {
                I(H[E])
            }
            G === (G | 0) && H[0].setAttribute("value", G);
            var p = D.createElement("ol");
            p.className = "linenums";
            for (var G = Math.max(0, G - 1 | 0) || 0, E = 0, v = H.length; E < v; ++E) {
                C = H[E],
                C.className = "L" + (E + G) % 10,
                C.firstChild || C.appendChild(D.createTextNode("\u00a0")),
                p.appendChild(C)
            }
            J.appendChild(p)
        }
        function B(v, C) {
            for (var y = C.length; --y >= 0;) {
                var p = C[y];
                w.hasOwnProperty(p) ? z.console && console.warn("cannot override language handler %s", p) : w[p] = v
            }
        }
        function s(p, v) {
            if (!p || !w.hasOwnProperty(p)) {
                p = /^\s*</.test(v) ? "default-markup" : "default-code"
            }
            return w[p]
        }
        function o(ad) {
            var aa = ad.h;
            try {
                var X = g(ad.c, ad.i)
                  , ac = X.a;
                ad.a = ac;
                ad.d = X.d;
                ad.e = 0;
                s(aa, ac)(ad);
                var J = /\bMSIE\s(\d+)/.exec(navigator.userAgent)
                  , J = J && +J[1] <= 8
                  , aa = /\n/g
                  , C = ad.a
                  , R = C.length
                  , X = 0
                  , U = ad.d
                  , T = U.length
                  , ac = 0
                  , ab = ad.g
                  , V = ab.length
                  , K = 0;
                ab[V] = R;
                var Q, Z;
                for (Z = Q = 0; Z < V;) {
                    ab[Z] !== ab[Z + 2] ? (ab[Q++] = ab[Z++],
                    ab[Q++] = ab[Z++]) : Z += 2
                }
                V = Q;
                for (Z = Q = 0; Z < V;) {
                    for (var O = ab[Z], D = ab[Z + 1], I = Z + 2; I + 2 <= V && ab[I + 1] === D;) {
                        I += 2
                    }
                    ab[Q++] = O;
                    ab[Q++] = D;
                    Z = I
                }
                ab.length = Q;
                var Y = ad.c, W;
                if (Y) {
                    W = Y.style.display,
                    Y.style.display = "none"
                }
                try {
                    for (; ac < T;) {
                        var S = U[ac + 2] || R, M = ab[K + 2] || R, I = Math.min(S, M), N = U[ac + 1], F;
                        if (N.nodeType !== 1 && (F = C.substring(X, I))) {
                            J && (F = F.replace(aa, "\r"));
                            N.nodeValue = F;
                            var y = N.ownerDocument
                              , P = y.createElement("span");
                            P.className = ab[K + 1];
                            var E = N.parentNode;
                            E.replaceChild(P, N);
                            P.appendChild(N);
                            X < S && (U[ac + 1] = N = y.createTextNode(C.substring(I, S)),
                            E.insertBefore(N, P.nextSibling))
                        }
                        X = I;
                        X >= S && (ac += 2);
                        X >= M && (K += 2)
                    }
                } finally {
                    if (Y) {
                        Y.style.display = W
                    }
                }
            } catch (H) {
                z.console && console.log(H && H.stack || H)
            }
        }
        var z = window
          , r = ["break,continue,do,else,for,if,return,while"]
          , x = [[r, "auto,case,char,const,default,double,enum,extern,float,goto,inline,int,long,register,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile"], "catch,class,delete,false,import,new,operator,private,protected,public,this,throw,true,try,typeof"]
          , n = [x, "alignof,align_union,asm,axiom,bool,concept,concept_map,const_cast,constexpr,decltype,delegate,dynamic_cast,explicit,export,friend,generic,late_check,mutable,namespace,nullptr,property,reinterpret_cast,static_assert,static_cast,template,typeid,typename,using,virtual,where"]
          , m = [x, "abstract,assert,boolean,byte,extends,final,finally,implements,import,instanceof,interface,null,native,package,strictfp,super,synchronized,throws,transient"]
          , l = [m, "as,base,by,checked,decimal,delegate,descending,dynamic,event,fixed,foreach,from,group,implicit,in,internal,into,is,let,lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,var,virtual,where"]
          , x = [x, "debugger,eval,export,function,get,null,set,undefined,var,with,Infinity,NaN"]
          , k = [r, "and,as,assert,class,def,del,elif,except,exec,finally,from,global,import,in,is,lambda,nonlocal,not,or,pass,print,raise,try,with,yield,False,True,None"]
          , j = [r, "alias,and,begin,case,class,def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,rescue,retry,self,super,then,true,undef,unless,until,when,yield,BEGIN,END"]
          , d = [r, "as,assert,const,copy,drop,enum,extern,fail,false,fn,impl,let,log,loop,match,mod,move,mut,priv,pub,pure,ref,self,static,struct,true,trait,type,unsafe,use"]
          , r = [r, "case,done,elif,esac,eval,fi,function,in,local,set,then,until"]
          , i = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)\b/
          , e = /\S/
          , c = u({
              keywords: [n, l, x, "caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END", k, j, r],
              hashComments: !0,
              cStyleComments: !0,
              multiLineStrings: !0,
              regexLiterals: !0
          })
          , w = {};
        B(c, ["default-code"]);
        B(A([], [["pln", /^[^<?]+/], ["dec", /^<!\w[^>]*(?:>|$)/], ["com", /^<\!--[\S\s]*?(?:--\>|$)/], ["lang-", /^<\?([\S\s]+?)(?:\?>|$)/], ["lang-", /^<%([\S\s]+?)(?:%>|$)/], ["pun", /^(?:<[%?]|[%?]>)/], ["lang-", /^<xmp\b[^>]*>([\S\s]+?)<\/xmp\b[^>]*>/i], ["lang-js", /^<script\b[^>]*>([\S\s]*?)(<\/script\b[^>]*>)/i], ["lang-css", /^<style\b[^>]*>([\S\s]*?)(<\/style\b[^>]*>)/i], ["lang-in.tag", /^(<\/?[a-z][^<>]*>)/i]]), ["default-markup", "htm", "html", "mxml", "xhtml", "xml", "xsl"]);
        B(A([["pln", /^\s+/, a, " \t\r\n"], ["atv", /^(?:"[^"]*"?|'[^']*'?)/, a, "\"'"]], [["tag", /^^<\/?[a-z](?:[\w-.:]*\w)?|\/?>$/i], ["atn", /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i], ["lang-uq.val", /^=\s*([^\s"'>]*(?:[^\s"'/>]|\/(?=\s)))/], ["pun", /^[/<->]+/], ["lang-js", /^on\w+\s*=\s*"([^"]+)"/i], ["lang-js", /^on\w+\s*=\s*'([^']+)'/i], ["lang-js", /^on\w+\s*=\s*([^\s"'>]+)/i], ["lang-css", /^style\s*=\s*"([^"]+)"/i], ["lang-css", /^style\s*=\s*'([^']+)'/i], ["lang-css", /^style\s*=\s*([^\s"'>]+)/i]]), ["in.tag"]);
        B(A([], [["atv", /^[\S\s]+/]]), ["uq.val"]);
        B(u({
            keywords: n,
            hashComments: !0,
            cStyleComments: !0,
            types: i
        }), ["c", "cc", "cpp", "cxx", "cyc", "m"]);
        B(u({
            keywords: "null,true,false"
        }), ["json"]);
        B(u({
            keywords: l,
            hashComments: !0,
            cStyleComments: !0,
            verbatimStrings: !0,
            types: i
        }), ["cs"]);
        B(u({
            keywords: m,
            cStyleComments: !0
        }), ["java"]);
        B(u({
            keywords: r,
            hashComments: !0,
            multiLineStrings: !0
        }), ["bash", "bsh", "csh", "sh"]);
        B(u({
            keywords: k,
            hashComments: !0,
            multiLineStrings: !0,
            tripleQuotedStrings: !0
        }), ["cv", "py", "python"]);
        B(u({
            keywords: "caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END",
            hashComments: !0,
            multiLineStrings: !0,
            regexLiterals: 2
        }), ["perl", "pl", "pm"]);
        B(u({
            keywords: j,
            hashComments: !0,
            multiLineStrings: !0,
            regexLiterals: !0
        }), ["rb", "ruby"]);
        B(u({
            keywords: x,
            cStyleComments: !0,
            regexLiterals: !0
        }), ["javascript", "js"]);
        B(u({
            keywords: "all,and,by,catch,class,else,extends,false,finally,for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,throw,true,try,unless,until,when,while,yes",
            hashComments: 3,
            cStyleComments: !0,
            multilineStrings: !0,
            tripleQuotedStrings: !0,
            regexLiterals: !0
        }), ["coffee"]);
        B(u({
            keywords: d,
            cStyleComments: !0,
            multilineStrings: !0
        }), ["rc", "rs", "rust"]);
        B(A([], [["str", /^[\S\s]+/]]), ["regex"]);
        var b = z.PR = {
            createSimpleLexer: A,
            registerLangHandler: B,
            sourceDecorator: u,
            PR_ATTRIB_NAME: "atn",
            PR_ATTRIB_VALUE: "atv",
            PR_COMMENT: "com",
            PR_DECLARATION: "dec",
            PR_KEYWORD: "kwd",
            PR_LITERAL: "lit",
            PR_NOCODE: "nocode",
            PR_PLAIN: "pln",
            PR_PUNCTUATION: "pun",
            PR_SOURCE: "src",
            PR_STRING: "str",
            PR_TAG: "tag",
            PR_TYPE: "typ",
            prettyPrintOne: z.prettyPrintOne = function (v, C, y) {
                var p = document.createElement("div");
                p.innerHTML = "<pre>" + v + "</pre>";
                p = p.firstChild;
                y && q(p, y, !0);
                o({
                    h: C,
                    j: y,
                    c: p,
                    i: 1
                });
                return p.innerHTML
            }
            ,
            prettyPrint: z.prettyPrint = function (T, Q) {
                function N() {
                    for (var v = z.PR_SHOULD_USE_CONTINUATION ? R.now() + 250 : Infinity; L < G.length && R.now() < v; L++) {
                        for (var Y = G[L], W = M, U = Y; U = U.previousSibling;) {
                            var p = U.nodeType
                              , X = (p === 7 || p === 8) && U.nodeValue;
                            if (X ? !/^\??prettify\b/.test(X) : p !== 3 || /\S/.test(U.nodeValue)) {
                                break
                            }
                            if (X) {
                                W = {};
                                X.replace(/\b(\w+)=([\w%+\-.:]+)/g, function (ab, aa, ac) {
                                    W[aa] = ac
                                });
                                break
                            }
                        }
                        U = Y.className;
                        if ((W !== M || P.test(U)) && !C.test(U)) {
                            p = !1;
                            for (X = Y.parentNode; X; X = X.parentNode) {
                                if (O.test(X.tagName) && X.className && P.test(X.className)) {
                                    p = !0;
                                    break
                                }
                            }
                            if (!p) {
                                Y.className += " prettyprinted";
                                p = W.lang;
                                if (!p) {
                                    var p = U.match(H), Z;
                                    if (!p && (Z = f(Y)) && D.test(Z.tagName)) {
                                        p = Z.className.match(H)
                                    }
                                    p && (p = p[1])
                                }
                                if (y.test(Y.tagName)) {
                                    X = 1
                                } else {
                                    var X = Y.currentStyle
                                      , V = E.defaultView
                                      , X = (X = X ? X.whiteSpace : V && V.getComputedStyle ? V.getComputedStyle(Y, a).getPropertyValue("white-space") : 0) && "pre" === X.substring(0, 3)
                                }
                                V = W.linenums;
                                if (!(V = V === "true" || +V)) {
                                    V = (V = U.match(/\blinenums\b(?::(\d+))?/)) ? V[1] && V[1].length ? +V[1] : !0 : !1
                                }
                                V && q(Y, V, X);
                                F = {
                                    h: p,
                                    c: Y,
                                    j: V,
                                    i: X
                                };
                                o(F)
                            }
                        }
                    }
                    L < G.length ? setTimeout(N, 250) : "function" === typeof T && T()
                }
                for (var S = Q || document.body, E = S.ownerDocument || document, S = [S.getElementsByTagName("pre"), S.getElementsByTagName("code"), S.getElementsByTagName("xmp")], G = [], I = 0; I < S.length; ++I) {
                    for (var K = 0, J = S[I].length; K < J; ++K) {
                        G.push(S[I][K])
                    }
                }
                var S = a
                  , R = Date;
                R.now || (R = {
                    now: function () {
                        return +new Date
                    }
                });
                var L = 0, F, H = /\blang(?:uage)?-([\w.]+)(?!\S)/, P = /\bprettyprint\b/, C = /\bprettyprinted\b/, y = /pre|xmp/i, D = /^code$/i, O = /^(?:pre|code|xmp)$/i, M = {};
                N()
            }
        };
        typeof define === "function" && define.amd && define("google-code-prettify", [], function () {
            return b
        })
    })()
}();
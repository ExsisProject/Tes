(function(window) {
    var // 상수 정의
        DEFAULT_INSTANCE_TYPE = "app", 
        pathinfo = {
            "src": "resources/js/", 
            "dist": "resources/dist/js/"
        };

    if(!window.GO) {
        window.GO = {};
    }
    
    function parseUrl(path) {
        var location = window.location, 
            _ta = document.createElement('a'), 
            parsedHash = {};

        _ta.setAttribute('href', path);

        parsedHash = {
            protocol: /^(http|https)/.test(_ta.protocol) ? _ta.protocol : location.protocol, 
            host: _ta.host ? _ta.host : location.host, 
            hostname: _ta.hostname ? _ta.hostname : location.hostname, 
            port: _ta.port ? _ta.port : location.port, 
            pathname: _ta.pathname[0] === '/' ? _ta.pathname : '/' + _ta.pathname, 
            search: _ta.search ? _ta.search : '',
            href: _ta.href, 
            hash: _ta.hash? _ta.hash : location.hash
        };
        
        return parsedHash;
    }

    // Context URL이 포함되지 않은 URL을 Context URL을 포함하도록 변경
    function fixUrlPathname(url) {
        var parsedUrl = parseUrl(url), 
            contextRoot = (GO.contextRoot || getContextRoot()), 
            pn = parsedUrl.pathname, 
            pns = pn[0] === '/' ? pn.slice(1) : pn;

        if(contextRoot && pn.indexOf(contextRoot) !== 0) {
            pn = contextRoot + pns;
        }
        return [pn, parsedUrl.search, parsedUrl.hash].join('');
    }

    function getMetaValue( key, defaults ) {
        var metaTags = document.getElementsByTagName('meta'), 
            result = defaults || '';

        for(var i=0, len=metaTags.length; i < len; i++) {
            if(metaTags[i].name === key) {
                result = metaTags[i].content;
            }
        }

        return result;
    }
    
    function getContextRoot() {
        return '/';
    }
    
    function getLocale() {
        return 'ko';
    }
    
    function getDeviceType() {
        return 'pc';
    }
    
    function getRevision() {
        return (new Date()).getTime();
    }
    
    function getInstanceType() {
        return "app";
    }
    
    function getProfile() {
        return 'production';
    }
    
    function findPath() {
        return "/";
    }

    // API 등록
    GO.contextRoot = getContextRoot();
    GO.locale = getLocale();
    GO.instanceType = getInstanceType();
    GO.deviceType = getDeviceType();
    GO.revision = getRevision();
    GO.profile = getProfile();
    GO.baseUrl = findPath();
    GO.util = {
        parseUrl: parseUrl, 
        findPath: findPath, 
        fixUrlPathname: fixUrlPathname
    };
})( window );

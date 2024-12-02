define('docs/controllers/main', function(require) {
    var r = {};

    /**
     * 문서관리 홈
     */
    r.renderHome = function() {
        require(['docs/views/home'], function(DocsHome) {
            new DocsHome().render();
        });
    };

    /**
     * 문서관리 등록
     */
    r.renderCreate = function(folderId) {
        require(['docs/views/create'], function(DocsCreate) {
            var DocsCreateView = new DocsCreate({
                folderId : folderId
            });
            DocsCreateView.dataFetchForCreate().then(function(){
               DocsCreateView.render();
            });
        });
    };

    /**
     * 문서 수정
     */
    r.renderEdit = function(docsId) {
        require(['docs/views/create'], function(DocsEdit) {
            var DocsEditView = new DocsEdit({
                docsId : docsId
            });
            DocsEditView.dataFetchForEdit().then(function(){
                DocsEditView.render();
            });
        });
    };

    /**
     * 문서 상세
     */
    r.renderDetail = function(docsId) {
        require(['docs/views/detail'], function(DocsDetail) {
            if(docsId && docsId.indexOf("?") != -1){
                docsId = docsId.split("?")[0];
            }
            var DocsDetailView = new DocsDetail({
                docsId : docsId
            });
            DocsDetailView.dataFetch().then(function(){
                DocsDetailView.render();
            });
        });
    };

    /**
     * 문서 인쇄
     */
    r.renderPrint = function(docsId) {
        require(['docs/views/detail', 'print'], function(DocsDetail, PrintView) {
            if(docsId && docsId.indexOf("?") != -1){
                docsId = docsId.split("?")[0];
            }
            var printView = new PrintView();
            var DocsDetailView = new DocsDetail({
                docsId : docsId
            });
            DocsDetailView.dataFetch().then(function(){
                printView.setContent(DocsDetailView.renderForPrint().el);
                $("body").html(printView.render().el);
            });
        });
    };

    r.search = function () {
        require(['docs/search/views/search'], function(View) {
            (new View()).render();
        });
    };
    
    r.renderLatestRead = function() {
    	require(['docs/views/docslist/latest_read'], function(LatestReadView) {
    		(new LatestReadView()).render();
        });
    };
    
    r.renderLatestUpdate = function() {
    	require(['docs/views/docslist/latest_update'], function(LatestUpdateView) {
    		(new LatestUpdateView()).render();
        });
    };

    r.renderFolderList = function(folderId) {
    	require(['docs/views/docslist/normal_list'], function(DocsListView) {
    		var listView = new DocsListView({
                folderId : folderId
            });
            listView.fetchFolderInfo().then(function(){
                listView.render();
            });
        });
    };

    r.renderApproveWaiting = function() {
    	require(['docs/views/docslist/approve_waiting'], function(ApproveWaitingView) {
    		(new ApproveWaitingView()).render();
        });
    };
    
    r.renderRegistWaiting = function() {
    	require(['docs/views/docslist/regist_waiting'], function(RegistWaitingView) {
    		(new RegistWaitingView()).render();
        });
    }

    return r;
});
/**
 * Created by daou on 2015-10-08.
 */

(function(){
    var $body = $("body");

    // 사이드 render Event
    $body.on("approval.sideRender", function(){
        console.info("approval:sideRender");
    });

    // 문서 상세보기 페이지의 일반 사용자 toolbar
    $body.on("approval.toolbarRender", function(){
        console.info("approval.toolbarRender");
    });

    // 문서 상세보기 페이지의 관리자용 toolbar
    $body.on("approval.manageToolbarRender", function(){
        console.info("approval.manageToolbarRender");
    });
})();
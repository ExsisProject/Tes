/**
 * Created by daou on 2015-10-08.
 */

(function(){
    var $body = $("body");

    // 사이드 render Event
    $body.on("ehr.sideRender", function(){
        console.info("ehr:sideRender");
    });

    // 내 근태현황
    $body.on("ehr.myListRender", function(){
        console.info("ehr:myListRender call");
    });

    // 부서 & 전사 근태현황 render Event
    $body.on("ehr.attndListRender", function(){
        console.info("ehr.attndListRender call");
    });

    // 부서 & 전사 통계 현황 render Event
    $body.on("ehr.statListRender", function(){
        console.info("ehr.:statListRender call");
    });
})();
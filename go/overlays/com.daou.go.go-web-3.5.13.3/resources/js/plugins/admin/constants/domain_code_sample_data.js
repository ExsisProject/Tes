define("admin/constants/domain_code_sample_data", function(require) {
    var adminLang = require("i18n!admin/nls/admin");
    //var positionLang = require("i18n!admin/nls/position");
    var poKoLang = require("json!lang/ko/position.json");
    var poEnLang = require("json!lang/en/position.json");
    var poJaLang = require("json!lang/ja/position.json");
    var poZhcnLang = require("json!lang/zh-cn/position.json");
    var poZhtwLang = require("json!lang/zh-tw/position.json");
    var poViLang = require("json!lang/vi/position.json");

    var positionSample = [{
        category : adminLang['사무직'],
        data : [
            { code : "P010010", langKey : '회장' },
            { code : "P010020", langKey : '부회장' },
            { code : "P010030", langKey : '대표이사' },
            { code : "P010040", langKey : '사장' },
            { code : "P010050", langKey : '부사장' },
            { code : "P010060", langKey : '전무' },
            { code : "P010070", langKey : '상무' },
            { code : "P010080", langKey : '이사' },
            { code : "P010090", langKey : '부장' },
            { code : "P010100", langKey : '차장' },
            { code : "P010110", langKey : '과장' },
            { code : "P010120", langKey : '계장' },
            { code : "P010130", langKey : '대리' },
            { code : "P010140", langKey : '주임' },
            { code : "P010150", langKey : '사원' },
            { code : "P010160", langKey : '감사' },
            { code : "P010170", langKey : '고문' },
            { code : "P010180", langKey : '인턴' },
            { code : "P010190", langKey : '파트/알바' },
            { code : "P010200", langKey : '업무위탁사원' },
            { code : "P010210", langKey : '상임고문' },
            { code : "P010220", langKey : '전문위원' }
        ]}, {
        category : adminLang['연구직'],
        data : [
            { code : "P020010", langKey : '수석연구원' },
            { code : "P020020", langKey : '책임연구원' },
            { code : "P020030", langKey : '선임연구원' },
            { code : "P020040", langKey : '전임연구원' },
            { code : "P020050", langKey : '주임연구원' },
            { code : "P020060", langKey : '연구원' }

        ]}, {
        category : adminLang['생산직'],
        data : [
            { code : "P030010", langKey : '기원' },
            { code : "P030020", langKey : '기술사원' },
            { code : "P030030", langKey : '기술기사보' },
            { code : "P030040", langKey : '기술기사' },
            { code : "P030050", langKey : '기술주임' },
            { code : "P030060", langKey : '기술선임' },
            { code : "P030070", langKey : '직장' },
            { code : "P030080", langKey : '반장' },
            { code : "P030090", langKey : '조장' },
            { code : "P030100", langKey : '사원(제)' }

        ]}, {
        category : adminLang['매니저'],
        data : [
            { code : "P040010", langKey : '총괄매니저' },
            { code : "P040020", langKey : '부매니저' },
            { code : "P040030", langKey : '수석매니저' },
            { code : "P040040", langKey : '책임매니저' },
            { code : "P040050", langKey : '선임매니저' },
            { code : "P040060", langKey : '주임매니저' },
            { code : "P040070", langKey : '매니저' },
            { code : "P040080", langKey : '수습매니저' },
            { code : "P040090", langKey : '지원매니저' }

        ]}, {
        category : adminLang['병원/학원'],
        data : [
            { code : "P050010", langKey : '원장(H)' },
            { code : "P050020", langKey : '부원장(H)' },
            { code : "P050030", langKey : '수석부장(H)' },
            { code : "P050040", langKey : '부장(H)' },
            { code : "P050050", langKey : '차장(H)' },
            { code : "P050060", langKey : '선임과장(H)' },
            { code : "P050070", langKey : '과장(H)' },
            { code : "P050080", langKey : '대리(H)' },
            { code : "P050090", langKey : '사원(H)' },
            { code : "P050100", langKey : '수석기사(H)' },
            { code : "P050110", langKey : '기사(H)' },
            { code : "P050120", langKey : '간호부원장' },
            { code : "P050130", langKey : '간호부장' },
            { code : "P050140", langKey : '간호과장' },
            { code : "P050150", langKey : '수간호사' },
            { code : "P050160", langKey : '책임간호사' },
            { code : "P050170", langKey : '주임간호사' },
            { code : "P050180", langKey : '평간호사' },
            { code : "P050190", langKey : '간호사' },
            { code : "P050200", langKey : '간호조무사' }

        ]}
    ];

    var dutySample = [
        {
            category : adminLang['공통'],
            data : [
                { code : "DU0010", langKey : '대표이사' },
                { code : "DU0020", langKey : '팀장' },
                { code : "DU0030", langKey : '팀원' },
                { code : "DU0040", langKey : '부팀장' },
                { code : "DU0050", langKey : '파트장' },
                { code : "DU0060", langKey : '부서장' },
                { code : "DU0070", langKey : '실장' },
                { code : "DU0080", langKey : '본부장' },
                { code : "DU0090", langKey : '그룹장' },
                { code : "DU0100", langKey : '부문장' },
                { code : "DU0110", langKey : 'CEO' },
                { code : "DU0120", langKey : 'COO' },
                { code : "DU0130", langKey : 'CFO' },
                { code : "DU0140", langKey : 'CTO' },
                { code : "DU0150", langKey : 'CIO' },
                { code : "DU0160", langKey : 'CMO' },
                { code : "DU0170", langKey : '연구소장' },
                { code : "DU0180", langKey : '사업부장' },
                { code : "DU0190", langKey : '전문임원' },
                { code : "DU0200", langKey : '지사장' },
                { code : "DU0210", langKey : '소장' },
                { code : "DU0220", langKey : '담당' },
                { code : "DU0230", langKey : '점장' },
                { code : "DU0240", langKey : '지점장' },
                { code : "DU0250", langKey : '센터장' },
                { code : "DU0260", langKey : '공장장' },
                { code : "DU0270", langKey : '법인장' },
                { code : "DU0280", langKey : 'PD' },
                { code : "DU0290", langKey : 'PM' }

            ]
        }
    ];

    var gradeSample = [
        {
            category : adminLang["사무직"]+'('+adminLang["명칭"]+')',
            data : [
                { code : "GSMB4", langKey : '부장4' },
                { code : "GSMB3", langKey : '부장3' },
                { code : "GSMB2", langKey : '부장2' },
                { code : "GSMB1", langKey : '부장1' },
                { code : "GSMC3", langKey : '차장3' },
                { code : "GSMC2", langKey : '차장2' },
                { code : "GSMC1", langKey : '차장1' },
                { code : "GSMK5", langKey : '과장5' },
                { code : "GSMK4", langKey : '과장4' },
                { code : "GSMK3", langKey : '과장3' },
                { code : "GSMK2", langKey : '과장2' },
                { code : "GSMK1", langKey : '과장1' },
                { code : "GSMD4", langKey : '대리4' },
                { code : "GSMD3", langKey : '대리3' },
                { code : "GSMD2", langKey : '대리2' },
                { code : "GSMD1", langKey : '대리1' },
                { code : "GSMJ3", langKey : '주임3' },
                { code : "GSMJ2", langKey : '주임2' },
                { code : "GSMJ1", langKey : '주임1' },
                { code : "GSMS3", langKey : '사원3' },
                { code : "GSMS2", langKey : '사원2' },
                { code : "GSMS1", langKey : '사원1' }

            ]
        }, {
            category : adminLang["사무직"]+'('+adminLang["코드"]+')',
            data : [
                { code : "GSCB4", langKey : 'B4' },
                { code : "GSCB3", langKey : 'B3' },
                { code : "GSCB2", langKey : 'B2' },
                { code : "GSCB1", langKey : 'B1' },
                { code : "GSCC3", langKey : 'C3' },
                { code : "GSCC2", langKey : 'C2' },
                { code : "GSCC1", langKey : 'C1' },
                { code : "GSCK5", langKey : 'K5' },
                { code : "GSCK4", langKey : 'K4' },
                { code : "GSCK3", langKey : 'K3' },
                { code : "GSCK2", langKey : 'K2' },
                { code : "GSCK1", langKey : 'K1' },
                { code : "GSCD4", langKey : 'D4' },
                { code : "GSCD3", langKey : 'D3' },
                { code : "GSCD2", langKey : 'D2' },
                { code : "GSCD1", langKey : 'D1' },
                { code : "GSCJ3", langKey : 'J3' },
                { code : "GSCJ2", langKey : 'J2' },
                { code : "GSCJ1", langKey : 'J1' },
                { code : "GSCS3", langKey : 'S3' },
                { code : "GSCS2", langKey : 'S2' },
                { code : "GSCS1", langKey : 'S1' }

            ]
        }, {
            category : adminLang["연구직"]+'('+adminLang["명칭"]+')',
            data : [
                { code : "GRESU4", langKey : '수석연구원4' },
                { code : "GRESU3", langKey : '수석연구원3' },
                { code : "GRESU2", langKey : '수석연구원2' },
                { code : "GRESU1", langKey : '수석연구원1' },
                { code : "GRECH3", langKey : '책임연구원3' },
                { code : "GRECH2", langKey : '책임연구원2' },
                { code : "GRECH1", langKey : '책임연구원1' },
                { code : "GRESE5", langKey : '선임연구원5' },
                { code : "GRESE4", langKey : '선임연구원4' },
                { code : "GRESE3", langKey : '선임연구원3' },
                { code : "GRESE2", langKey : '선임연구원2' },
                { code : "GRESE1", langKey : '선임연구원1' },
                { code : "GREJE4", langKey : '전임연구원4' },
                { code : "GREJE3", langKey : '전임연구원3' },
                { code : "GREJE2", langKey : '전임연구원2' },
                { code : "GREJE1", langKey : '전임연구원1' },
                { code : "GREJU3", langKey : '주임연구원3' },
                { code : "GREJU2", langKey : '주임연구원2' },
                { code : "GREJU1", langKey : '주임연구원1' },
                { code : "GREYE3", langKey : '연구원3' },
                { code : "GREYE2", langKey : '연구원2' },
                { code : "GREYE1", langKey : '연구원1' },

            ]
        }, {
            category : adminLang["연구직"]+'('+adminLang["코드"]+')',
            data : [
                { code : "GRCSU4", langKey : 'SU4' },
                { code : "GRCSU3", langKey : 'SU3' },
                { code : "GRCSU2", langKey : 'SU2' },
                { code : "GRCSU1", langKey : 'SU1' },
                { code : "GRCCH3", langKey : 'CH3' },
                { code : "GRCCH2", langKey : 'CH2' },
                { code : "GRCCH1", langKey : 'CH1' },
                { code : "GRCSE5", langKey : 'SE5' },
                { code : "GRCSE4", langKey : 'SE4' },
                { code : "GRCSE3", langKey : 'SE3' },
                { code : "GRCSE2", langKey : 'SE2' },
                { code : "GRCSE1", langKey : 'SE1' },
                { code : "GRCJE4", langKey : 'JE4' },
                { code : "GRCJE3", langKey : 'JE3' },
                { code : "GRCJE2", langKey : 'JE2' },
                { code : "GRCJE1", langKey : 'JE1' },
                { code : "GRCJU3", langKey : 'JU3' },
                { code : "GRCJU2", langKey : 'JU2' },
                { code : "GRCJU1", langKey : 'JU1' },
                { code : "GRCYE3", langKey : 'YE3' },
                { code : "GRCYE2", langKey : 'YE2' },
                { code : "GRCYE1", langKey : 'YE1' }

            ]
        }, {
            category : adminLang["공무원"],
            data : [
                { code : "GPO1", langKey : '1급' },
                { code : "GPO2", langKey : '2급' },
                { code : "GPO3", langKey : '3급' },
                { code : "GPO4", langKey : '4급' },
                { code : "GPO5", langKey : '5급' },
                { code : "GPO105", langKey : '1급5호봉' },
                { code : "GPO104", langKey : '1급4호봉' },
                { code : "GPO103", langKey : '1급3호봉' },
                { code : "GPO102", langKey : '1급2호봉' },
                { code : "GPO101", langKey : '1급1호봉' },
                { code : "GPO205", langKey : '2급5호봉' },
                { code : "GPO204", langKey : '2급4호봉' },
                { code : "GPO203", langKey : '2급3호봉' },
                { code : "GPO202", langKey : '2급2호봉' },
                { code : "GPO201", langKey : '2급1호봉' },
                { code : "GPO305", langKey : '3급5호봉' },
                { code : "GPO304", langKey : '3급4호봉' },
                { code : "GPO303", langKey : '3급3호봉' },
                { code : "GPO302", langKey : '3급2호봉' },
                { code : "GPO301", langKey : '3급1호봉' },
                { code : "GPO405", langKey : '4급5호봉' },
                { code : "GPO404", langKey : '4급4호봉' },
                { code : "GPO403", langKey : '4급3호봉' },
                { code : "GPO402", langKey : '4급2호봉' },
                { code : "GPO401", langKey : '4급1호봉' },
                { code : "GPO505", langKey : '5급5호봉' },
                { code : "GPO504", langKey : '5급4호봉' },
                { code : "GPO503", langKey : '5급3호봉' },
                { code : "GPO502", langKey : '5급2호봉' },
                { code : "GPO501", langKey : '5급1호봉' }

            ]
        }
    ];

    var usergroupSample = [
        {
            category : adminLang["공통"],
            data : [
                { code : "UG0010", langKey : '정직원' },
                { code : "UG0020", langKey : '계약직' },
                { code : "UG0030", langKey : '관리자' },
                { code : "UG0040", langKey : '임원' },
                { code : "UG0050", langKey : '임직원' },
                { code : "UG0060", langKey : '경영진' },
                { code : "UG0070", langKey : '부서장' },
                { code : "UG0080", langKey : '대표' },
                { code : "UG0090", langKey : '수습' },
                { code : "UG0100", langKey : '인턴' },
                { code : "UG0110", langKey : '알바' },
                { code : "UG0120", langKey : '파견' },
                { code : "UG0130", langKey : '영업' },
                { code : "UG0140", langKey : '외부협력지원' },
                { code : "UG0150", langKey : '본사' },
                { code : "UG0160", langKey : '계열사'}

            ]
        }
    ];

    function appendMultiLang(sample_data) {
        var multiLangAppendedList= [];
        sample_data.forEach(function(bundle) {
            var multiLangAppendedBundle = {};
            multiLangAppendedBundle.category = bundle.category;
            multiLangAppendedBundle.data = [];
            bundle.data.forEach(function (datum) {
                datum.koName = poKoLang[datum.langKey];
                datum.enName = poEnLang[datum.langKey];
                datum.jpName = poJaLang[datum.langKey];
                datum.zhcnName = poZhcnLang[datum.langKey];
                datum.zhtwName = poZhtwLang[datum.langKey];
                datum.viName = poViLang[datum.langKey];
                multiLangAppendedBundle.data.push(datum);
            });
            multiLangAppendedList.push(multiLangAppendedBundle);
        });
        return multiLangAppendedList;
    };

    return {
        positionSample : appendMultiLang(positionSample),
        dutySample : appendMultiLang(dutySample),
        gradeSample : appendMultiLang(gradeSample),
        usergroupSample : appendMultiLang(usergroupSample)
    };
});
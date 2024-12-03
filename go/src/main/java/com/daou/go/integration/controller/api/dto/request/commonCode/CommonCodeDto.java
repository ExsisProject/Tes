package com.daou.go.integration.controller.api.dto.request.commonCode;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommonCodeDto {
    private String majorCd;         // 주요 코드
    private String minorCd;         // 하위 코드
    private String codeName;        // 코드 이름
    private int sortSeq;            // 정렬 순서
    private String useYn;           // 사용 여부 (y/n)

    public CommonCodeDto(String majorCd, String minorCd, String codeName, int sortSeq, String useYn) {
        this.majorCd = majorCd;
        this.minorCd = minorCd;
        this.codeName = codeName;
        this.sortSeq = sortSeq;
        this.useYn = useYn;
    }
}


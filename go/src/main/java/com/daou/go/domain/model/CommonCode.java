package com.daou.go.domain.model;


import com.daou.go.integration.controller.api.dto.request.commonCode.CommonCodeDto;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.*;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity
@ToString
@Table(name = "tes_common_code")
public class CommonCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "common_code_id")
    private Long id;

    @Column(name = "major_cd", nullable = false)
    private String majorCd;

    @Column(name = "minor_cd", nullable = false)
    private String minorCd;

    @Column(name = "code_name", nullable = false)
    private String codeName;

    @Column(name = "sort_seq", nullable = true)
    private int sortSeq;

    @Column(name = "use_yn", nullable = false)
    private String useYn = "y";


    public CommonCode(CommonCodeDto commonCodeDto) {
        this.majorCd = commonCodeDto.getMajorCd();
        this.minorCd = commonCodeDto.getMinorCd();
        this.codeName = commonCodeDto.getCodeName();
        this.sortSeq = commonCodeDto.getSortSeq();
        this.useYn = commonCodeDto.getUseYn();
    }
}

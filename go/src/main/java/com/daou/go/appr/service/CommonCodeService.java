package com.daou.go.appr.service;


import com.daou.go.domain.model.CommonCode;
import com.daou.go.domain.repository.CommonCodeRepository;
import com.daou.go.integration.controller.api.dto.request.commonCode.CommonCodeDto;
import com.daou.go.integration.controller.api.dto.request.Ids;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class CommonCodeService {

    private final CommonCodeRepository repository;

    @Transactional(rollbackFor = Exception.class)
    public void register(List<CommonCodeDto> dtoList) {
        ArrayList<CommonCode> commonCodeList = new ArrayList<>();
        dtoList.forEach(c -> {
            commonCodeList.add(new CommonCode(c));
        });
        repository.save(commonCodeList);
    }

    @Transactional(readOnly = true)
    public List<CommonCode> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public CommonCode findById(Long id) throws Exception {
        return repository.findById(id).orElseThrow(() -> new Exception("Not Found CommonCode id = " + id));
    }

    @Transactional(readOnly = true)
    public List<CommonCode> findAllByMajorCode(String majorCode) {
        return repository.findAllByMajorCd(majorCode);
    }

    @Transactional(readOnly = true)
    public List<CommonCode> findByMajorCodeAndCommonCode(String majorCode, String minorCode) {
        return repository.findAllByMajorCdAndMinorCd(majorCode, minorCode);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Ids ids) {
        ids.getIds().forEach(id -> {repository.delete(id);});
    }
}

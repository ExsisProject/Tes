package com.daou.go.domain.repository;

import com.daou.go.domain.model.CommonCode;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommonCodeRepository extends JpaRepository<CommonCode, Long> {

    List<CommonCode> findAll(Sort sort);

    Optional<CommonCode> findById(Long id);

    List<CommonCode> findAllByMajorCd(String majorCd);

    List<CommonCode> findAllByMajorCdAndMinorCd(String majorCd,String minorCd);

    void delete(Long id);
}

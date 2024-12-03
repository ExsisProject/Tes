package com.daou.go.integration.controller.api;

import com.daou.go.appr.service.CommonCodeService;
import com.daou.go.core.controller.api.ApiController;
import com.daou.go.integration.controller.api.dto.request.commonCode.CommonCodeDto;
import com.daou.go.integration.controller.api.dto.request.Ids;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommonCodeController extends ApiController {

    private final CommonCodeService commonCodeService;


    @Operation(description = "공통 데이터 추가", method = "POST")
    @PostMapping("/common")
    public ResponseEntity<?> registerCommonCode(@RequestBody List<CommonCodeDto> commonCodeDto) {
        try {
            commonCodeService.register(commonCodeDto);
            return new ResponseEntity<>("공통 데이터를 추가했습니다.", HttpStatus.OK);
        } catch (Exception e) {
            e.getStackTrace();
            return new ResponseEntity<>("공통 코드 조회시 에러가 발생했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    @Operation(description = "공통 데이터 전체 조회", method = "GET")
    @GetMapping("/common/all")
    public ResponseEntity<?> findAll() {
        try {
            return new ResponseEntity<>(commonCodeService.findAll(), HttpStatus.OK);
        } catch (Exception e) {
            e.getStackTrace();
            return new ResponseEntity<>("공통 코드 삭제시 에러가 발생했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    @Operation(description = "공통 데이터 id 조회", method = "GET")
    @GetMapping("/common/{id}")
    public ResponseEntity<?> findById(@PathVariable("id") Long id) {
        try {
            return new ResponseEntity<>(commonCodeService.findById(id), HttpStatus.OK);
        } catch (Exception e) {
            e.getStackTrace();
            return new ResponseEntity<>("공통 코드 삭제시 에러가 발생했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    @Operation(description = "공통 데이터 대분류 조회", method = "GET")
    @GetMapping("/common/find/{majorCode}")
    public ResponseEntity<?> findAllByMajorCode(@PathVariable("majorCode") String majorCode) {
        try {
            return new ResponseEntity<>(commonCodeService.findAllByMajorCode(majorCode), HttpStatus.OK);
        } catch (Exception e) {
            e.getStackTrace();
            return new ResponseEntity<>("공통 코드 조회시 에러가 발생했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    @Operation(description = "공통 데이터 조건 조회", method = "GET")
    @GetMapping("/common/find/{majorCode}/{minorCode}")
    public ResponseEntity<?> findByMajorCodeAndCommonCode(@PathVariable("majorCode") String majorCode,
                                                          @PathVariable("minorCode") String minorCode) {
        try {
            return new ResponseEntity<>(commonCodeService.findByMajorCodeAndCommonCode(majorCode, minorCode), HttpStatus.OK);
        } catch (Exception e) {
            e.getStackTrace();
            return new ResponseEntity<>("공통 코드 조건 조회 도중 에러가 발생했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    @Operation(description = "공통 데이터 삭제", method = "GET")
    @DeleteMapping("/common")
    public ResponseEntity<?> deleteCommonCode(@RequestBody Ids ids) {
        try {
            commonCodeService.delete(ids);
            return new ResponseEntity<>("공통 데이터 삭제 완료했습니다.", HttpStatus.OK);
        } catch (Exception e) {
            e.getStackTrace();
            return new ResponseEntity<>("공통 코드 삭제 도중 에러가 발생했습니다.", HttpStatus.BAD_REQUEST);
        }
    }
}

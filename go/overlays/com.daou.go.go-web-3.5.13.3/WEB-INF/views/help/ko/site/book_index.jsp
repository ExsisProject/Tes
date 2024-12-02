<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions"  prefix="fn"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<link rel="stylesheet" href="${baseUrl}help/${brandUrl}/${locale}/site/css/book.css" type="text/css" />
<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>

<body class="bookLeft">
<div class="bookLeft">
	<ul class="depth_1">
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/getting_started.html" target="bookBody"><span class="txt">사이트 어드민 시작하기</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/getting_started.html#r_b9afbbf3cece2f28" target="bookBody"><span class="txt">1. 어드민이란</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/getting_started.html#r_55cb5869e1cd2925" target="bookBody"><span class="txt">2. 어드민 접속</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/getting_started.html#r_a374b71df66f1cdb" target="bookBody"><span class="txt">2.1 관리자 설정정보 수정</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html" target="bookBody"><span class="txt">설정</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_2ce39b569644f3c9" target="bookBody"><span class="txt">1. 기본 정보</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_e1fa37642c88690d" target="bookBody"><span class="txt">2. 메뉴 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_0a20691344d39b90" target="bookBody"><span class="txt">2.1 메뉴 목록</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_d030f725b27cc25c" target="bookBody"><span class="txt">2.2 메뉴 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_5e0e2da71d934f8d" target="bookBody"><span class="txt">2.3 메뉴 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_fa3a07f21cf116ed" target="bookBody"><span class="txt">2.4 메뉴 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_d6ab551f03a7d1a2" target="bookBody"><span class="txt">2.5 초기메뉴 지정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_f3f09bff0caf6ced" target="bookBody"><span class="txt">2.6 순서 바꾸기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_d2ba1874f10d777b" target="bookBody"><span class="txt">2.7 들여쓰기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_2644188b4b39028f" target="bookBody"><span class="txt">3. 기능 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_f95571c18648b3a2" target="bookBody"><span class="txt">3.1 기능 설정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_8c5352f9b028940b" target="bookBody"><span class="txt">3.2 바로가기 버튼 설정</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_50fe48ccd32eb922" target="bookBody"><span class="txt">바로가기 버튼 추가</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_3ec2cce491d544ac" target="bookBody"><span class="txt">바로가기 버튼 수정</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_bc80292877d02554" target="bookBody"><span class="txt">바로가기 버튼 삭제</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_d44c28cd2ede2424" target="bookBody"><span class="txt">4. 로그인 설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_c3e97957617c456b" target="bookBody"><span class="txt">5. 대시보드 설정</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_d31b72b4b1c5bced" target="bookBody"><span class="txt">5.1 대시보드 운영자 설정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_2f0547e8dc7ebb96" target="bookBody"><span class="txt">5.2 대시보드 가젯 공개 설정</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_804011a8297cec4f" target="bookBody"><span class="txt">6. 보안 설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_90f433762c966da6" target="bookBody"><span class="txt">7. 팝업 공지 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_e157020b70f12eab" target="bookBody"><span class="txt">7.1 공지 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_7293106b9e96adbd" target="bookBody"><span class="txt">7.2 공지 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_6552a87a64627313" target="bookBody"><span class="txt">7.3 공지 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_1341c60028b30304" target="bookBody"><span class="txt">7.4 공지 검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_8392d654890baba3" target="bookBody"><span class="txt">8. 관리자 목록</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_b2516abf132e78d2" target="bookBody"><span class="txt">9. 관리자 업무 기록</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_92983fd5904a0912" target="bookBody"><span class="txt">10. 기타</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html" target="bookBody"><span class="txt">통계</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_310e9136af351348" target="bookBody"><span class="txt">1. 개요</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_80da8ada1dba5036" target="bookBody"><span class="txt">1.1 통계 정보 검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_56919e754d4da8e4" target="bookBody"><span class="txt">1.2 통계 결과 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_c5c9ccf8f0efc74e" target="bookBody"><span class="txt">1.3 통계 결과 인쇄</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_79899ca0e9d012a9" target="bookBody"><span class="txt">2. 이메일</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_4f67192ab56bfbd8" target="bookBody"><span class="txt">2.1 요약</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_e6143fb6bd3a33fb" target="bookBody"><span class="txt">2.2 정상 메일</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_e2e09bf100f9c543" target="bookBody"><span class="txt">2.3 스팸 메일</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_19b86630c325405c" target="bookBody"><span class="txt">2.4 피싱 메일</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_5c4a01a8f7516388" target="bookBody"><span class="txt">2.5 바이러스 메일</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_0fcdd5bce77d2055" target="bookBody"><span class="txt">2.6 POP</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_adf046b879f4d1c2" target="bookBody"><span class="txt">2.7 IMAP</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html" target="bookBody"><span class="txt">계정관리</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_26cd469e1adec662" target="bookBody"><span class="txt">1. 계정 목록</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_bddf037ffadabc5c" target="bookBody"><span class="txt">1.1 계정 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_9c695bf4019d847f" target="bookBody"><span class="txt">1.2 계정 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_55ea5b3d97a94518" target="bookBody"><span class="txt">1.3 계정 중지</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_4fea97b11628999a" target="bookBody"><span class="txt">1.4 계정 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_12820f7d927c5d01" target="bookBody"><span class="txt">1.5 클래스 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_917399580a5984ae" target="bookBody"><span class="txt">1.6 계정 목록 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_155acb2f615f1583" target="bookBody"><span class="txt">1.7 계정 검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_ace7456e2e53cbb5" target="bookBody"><span class="txt">2. 계정 일괄등록</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_3994eccd463282cd" target="bookBody"><span class="txt">3. 삭제계정 목록</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_0e51a83db54f830c" target="bookBody"><span class="txt">3.1 삭제계정 목록 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_61bc194ce5ec9442" target="bookBody"><span class="txt">3.2 삭제계정 검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_a16c25afccd819ae" target="bookBody"><span class="txt">4. 클래스 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_0643be83444d387b" target="bookBody"><span class="txt">4.1 클래스 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_9976e294fbe7a959" target="bookBody"><span class="txt">4.2 클래스 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_a02c933cf4bdbf53" target="bookBody"><span class="txt">4.3 클래스 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_e24cf24a4f5146be" target="bookBody"><span class="txt">4.4 클래스 목록 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_d25e94c28f8b07d8" target="bookBody"><span class="txt">4.5 클래스 순서 바꾸기</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html" target="bookBody"><span class="txt">부서관리</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_35c860dd128fffee" target="bookBody"><span class="txt">1. 조직도 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_746f25b8abf144db" target="bookBody"><span class="txt">1.1 부서 추가</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_a0b817df6687dae4" target="bookBody"><span class="txt">부서 메일아이디 설정하기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_c111bc712b167882" target="bookBody"><span class="txt">부서코드 설정하기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_022dd88052b908bb" target="bookBody"><span class="txt">부서 약어 설정하기</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_337a201c166603a0" target="bookBody"><span class="txt">1.2 부서 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_178fda2ef1dbae41" target="bookBody"><span class="txt">1.3 부서 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_dd514d12a1533657" target="bookBody"><span class="txt">1.4 부서 목록 가져오기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_82126999607f5bad" target="bookBody"><span class="txt">1.5 부서 목록 내보내기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_0d2787e7d9624a88" target="bookBody"><span class="txt">1.6 부서원 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_01932e7e6ff4ba30" target="bookBody"><span class="txt">1.7 부서원 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_99f436056b8f3301" target="bookBody"><span class="txt">1.8 부서원 순서 설정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_f463273a1562838d" target="bookBody"><span class="txt">1.9 부서원 목록 가져오기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_f785501d697f59c6" target="bookBody"><span class="txt">1.10 부서원 목록 내보내기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_7d11fece5924ea8d" target="bookBody"><span class="txt">1.11 부서원 이동</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_4bdfb705d7e26a65" target="bookBody"><span class="txt">1.12 부서원 순서 바꾸기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_7e1d55a2512527ed" target="bookBody"><span class="txt">2. 부서 목록</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_b80dbb748727312b" target="bookBody"><span class="txt">2.1 부서 추가하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_5302cfa5a0c4d0ca" target="bookBody"><span class="txt">2.2 부서 목록 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_719ee7db141e50fc" target="bookBody"><span class="txt">2.3 부서 검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_337304c3ae3529db" target="bookBody"><span class="txt">2.4 부서 상세정보 보기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_ab397fb9874a708c" target="bookBody"><span class="txt">3. 삭제 부서 목록</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_d7b017cda9daa6f3" target="bookBody"><span class="txt">3.1 삭제 부서 목록 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_1479a1e94debd477" target="bookBody"><span class="txt">3.2 삭제 부서 첨부파일 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_159e73b0bc51cfa0" target="bookBody"><span class="txt">3.3 삭제 부서 상세정보 보기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_dc7d4870b4010eea" target="bookBody"><span class="txt">3.4 삭제 부서 검색</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html" target="bookBody"><span class="txt">메일</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_be7e5c0a15a909c3" target="bookBody"><span class="txt">1. 메일 기본 설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_ffee17aa68241c82" target="bookBody"><span class="txt">2. 메일 배너 설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_4b322c21ae95c4ac" target="bookBody"><span class="txt">3. 메일 그룹 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_18cd4f7258f73f84" target="bookBody"><span class="txt">3.1 메일 그룹 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_056a592ca782431d" target="bookBody"><span class="txt">3.2 메일 그룹 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_cdd730343635520a" target="bookBody"><span class="txt">3.3 메일그룹 삭제</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_200dbf84560d2ab2" target="bookBody"><span class="txt">4. 휴면 계정 관리</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_7ebe22e2920c710d" target="bookBody"><span class="txt">5. 별칭 계정 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_572dff9499079cfe" target="bookBody"><span class="txt">5.1 별칭 계정 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_99064b94a1e00ed4" target="bookBody"><span class="txt">5.2 별칭 계정 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_6ce47fb9a05c704b" target="bookBody"><span class="txt">5.3 별칭 계정 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_4d70a161817ae9a2" target="bookBody"><span class="txt">5.4 별칭 계정 이동</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_a3555ffc9c0d31c8" target="bookBody"><span class="txt">5.5 별칭 계정 검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_6fa208916d0df22b" target="bookBody"><span class="txt">6. 대량메일 발송자 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_1128d23475c5b08a" target="bookBody"><span class="txt">6.1 대량메일 발송 권한 설정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_bfbd9e889de75edb" target="bookBody"><span class="txt">6.2 수신자목록 업로드 사용자 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_fd98db8f13348d27" target="bookBody"><span class="txt">6.3 수신자목록 업로드 사용자 삭제</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_b1799a4959be1c5c" target="bookBody"><span class="txt">7. 도메인 메일함 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_30b5e2b8d3341211" target="bookBody"><span class="txt">7.1 도메인 메일함 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_b565673d50e9594b" target="bookBody"><span class="txt">7.2 도메인 메일함 삭제</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_b27a6d04dea8b4d6" target="bookBody"><span class="txt">8. 편지지 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_aec77b4b0236539e" target="bookBody"><span class="txt">8.1 편지지 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_09a4943362e12d09" target="bookBody"><span class="txt">8.2 편지지 삭제</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_2c114078fa54f0bd" target="bookBody"><span class="txt">9. 문서템플릿 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_07b0c30db5c0b5a9" target="bookBody"><span class="txt">9.1 문서템플릿 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_4513add3c18d320e" target="bookBody"><span class="txt">9.2 문서템플릿 삭제</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html" target="bookBody"><span class="txt">주소록</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_bca94d0498a91788" target="bookBody"><span class="txt">1. 주소록 기본설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_217960c8f67860cf" target="bookBody"><span class="txt">2. 공용 주소록 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_7de2f5b91a9255eb" target="bookBody"><span class="txt">2.1 주소록 그룹 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_cd7695f2c47f4730" target="bookBody"><span class="txt">2.2 주소록 그룹 순서 바꾸기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_6f1527435a3068a1" target="bookBody"><span class="txt">3. 전체 주소록 통계</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_4b5689179e691370" target="bookBody"><span class="txt">3.1 전체 주소록 통계 목록 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_da71f1a893bb5924" target="bookBody"><span class="txt">3.2 전체 주소록 통계 검색</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/storage.html" target="bookBody"><span class="txt">자료실</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/storage.html#r_49cada4e8d8a137b" target="bookBody"><span class="txt">1. 자료실 기본설정</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/calendar.html" target="bookBody"><span class="txt">캘린더</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/calendar.html#r_dc83760a83d60230" target="bookBody"><span class="txt">1. 캘린더 기본설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/calendar.html#r_ea8dd3ae6597408f" target="bookBody"><span class="txt">2. 전사 기념일 / 공휴일 설정</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/calendar.html#r_60cba2b9b29ee07c" target="bookBody"><span class="txt">2.1 기념일 / 공휴일 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/calendar.html#r_f78ccc2ada4fb55e" target="bookBody"><span class="txt">2.2 기념일 / 공휴일 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/calendar.html#r_29a458da0013a1dd" target="bookBody"><span class="txt">2.3 기념일 / 공휴일 목록 다운로드</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html" target="bookBody"><span class="txt">게시판</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_e27a6268dfdbd1f4" target="bookBody"><span class="txt">1. 게시판 기본설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_e1295b8cbbfbb711" target="bookBody"><span class="txt">2. 전사 게시판 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_256de1e3d9460373" target="bookBody"><span class="txt">2.1 전사 게시판 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_90d9b360fe5b8fd5" target="bookBody"><span class="txt">2.2 전사 게시판 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_d60de446d55ca1fc" target="bookBody"><span class="txt">2.3 전사 게시판 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_2b9cf334e97b006a" target="bookBody"><span class="txt">2.4 전사 게시판 순서 바꾸기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_61b8f5b833479bc3" target="bookBody"><span class="txt">2.5 전사 게시판 구분선 추가하기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_f9c0189ad54bda2f" target="bookBody"><span class="txt">3. 전체 게시판 통계</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_f41d2d833169abad" target="bookBody"><span class="txt">3.1 전체 게시판 통계 목록 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_8373a09c08c4c93b" target="bookBody"><span class="txt">3.2 전체 게시판 통계 검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_4f4f306b13fd7daf" target="bookBody"><span class="txt">4. 부서별 게시판 통계</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_ff77887558953858" target="bookBody"><span class="txt">4.1 부서별 게시판 통계 목록 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_7acfac0c71643136" target="bookBody"><span class="txt">4.2 부서별 게시판 검색</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html" target="bookBody"><span class="txt">커뮤니티</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_2233f0e66084b910" target="bookBody"><span class="txt">1. 커뮤니티 기본설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_c90fd10c69d796b3" target="bookBody"><span class="txt">2. 개설신청 커뮤니티</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_9adf50e59d189e0d" target="bookBody"><span class="txt">2.1 커뮤니티 개설신청 수락</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_5051ffbabd7a9ebc" target="bookBody"><span class="txt">2.2 커뮤니티 개설신청 반려</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_9e6a841bc1c0f272" target="bookBody"><span class="txt">3. 전체 커뮤니티 조회</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_46488218fbecf4b3" target="bookBody"><span class="txt">3.1 커뮤니티 목록 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_45308159312515af" target="bookBody"><span class="txt">3.2 커뮤니티 검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_a66e62a0ca249452" target="bookBody"><span class="txt">4. 커뮤니티 전체게시판 통계</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_d51a559f93732c18" target="bookBody"><span class="txt">4.1 커뮤니티 전체게시판 통계 목록 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_7b727d65d2c7407c" target="bookBody"><span class="txt">4.2 커뮤니티 전체게시판 통계 검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_b83b9836f1d2bf64" target="bookBody"><span class="txt">5. 커뮤니티별 게시판 통계</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_b6f2c1bfb1758bb4" target="bookBody"><span class="txt">5.1 커뮤니티별 전체게시판 통계 목록 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_67a97f9d090803a4" target="bookBody"><span class="txt">5.2 커뮤니티별 게시판 통계 검색</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/reserve.html" target="bookBody"><span class="txt">예약</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/reserve.html#r_963910d698cd4c50" target="bookBody"><span class="txt">1. 자산 추가</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/reserve.html#r_1e74c9d157fe1804" target="bookBody"><span class="txt">2. 자산 수정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/reserve.html#r_8d202320410600a2" target="bookBody"><span class="txt">3. 자산 사용중지</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/reserve.html#r_096da79b2c401d83" target="bookBody"><span class="txt">4. 자산 삭제</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/reserve.html#r_75f9010deefc017b" target="bookBody"><span class="txt">5. 자산 순서바꾸기</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/survey.html" target="bookBody"><span class="txt">설문</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/survey.html#r_0e0a75269a7f2ed4" target="bookBody"><span class="txt">1. 설문 기본설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/survey.html#r_87770a7a3f7b8039" target="bookBody"><span class="txt">2. 전체 설문 보기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/survey.html#r_7a9f78081cd0c0c9" target="bookBody"><span class="txt">2.1 설문 상태 변경</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/survey.html#r_740ea52e10213242" target="bookBody"><span class="txt">2.2 설문 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/survey.html#r_006b183b2f7dbf8e" target="bookBody"><span class="txt">2.3 설문 검색</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html" target="bookBody"><span class="txt">보고</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html#r_53cb1d070957acca" target="bookBody"><span class="txt">1. 양식 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html#r_f47e6395cf915fc5" target="bookBody"><span class="txt">1.1 새 양식 만들기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html#r_a035244787ff6847" target="bookBody"><span class="txt">1.2 양식 사본 만들기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html#r_ccdbb9cf445004e5" target="bookBody"><span class="txt">1.3 양식 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html#r_37828ce7b0165105" target="bookBody"><span class="txt">1.4 양식 미리보기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html#r_bd43231d9ba7ceb3" target="bookBody"><span class="txt">2. 양식 검색</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html" target="bookBody"><span class="txt">업무</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_eb5d279fc3713266" target="bookBody"><span class="txt">1. 업무 기본설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_9fd75a080a47da00" target="bookBody"><span class="txt">2. 전사 업무 폴더 통계</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_39b87b9a6b9f673b" target="bookBody"><span class="txt">2.1 전사 업무 폴더 목록 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_328c4e9cc36d61f8" target="bookBody"><span class="txt">2.2 전사 업무 폴더 목록 검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_6b7acbbdebb37fe0" target="bookBody"><span class="txt">3. 유형별 업무 진행 설정</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_45b1bfb3f02d602f" target="bookBody"><span class="txt">3.1 업무 유형 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_e85d81e1f5f09359" target="bookBody"><span class="txt">3.2 업무 유형 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_760f9d6442fd8816" target="bookBody"><span class="txt">3.3 업무 유형 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_9aa83de578840431" target="bookBody"><span class="txt">3.4 업무 유형 검색</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html" target="bookBody"><span class="txt">전자결재</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_0d6b1133e3a646f4" target="bookBody"><span class="txt">1. 결재 양식 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_31819aa1597b4ef6" target="bookBody"><span class="txt">1.1 결재 양식 폴더</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_ddcdf6f4d50d05d5" target="bookBody"><span class="txt">결재 양식 폴더 추가</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_cdef9437ebf5aa72" target="bookBody"><span class="txt">결재 양식 폴더 수정</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_ced451857825e5e5" target="bookBody"><span class="txt">결재 양식 폴더 삭제</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_c62a03f85df6a776" target="bookBody"><span class="txt">결재 양식 폴더 이동</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_03bbe22e2f0fce0f" target="bookBody"><span class="txt">1.2 결재 양식</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_ada3496cf7bfe569" target="bookBody"><span class="txt">결재 양식 추가</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_03fd3a628774f90d" target="bookBody"><span class="txt">결재 양식 수정</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_27128fbf58526000" target="bookBody"><span class="txt">결재 양식 이동</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_fc196bb7513cbdc3" target="bookBody"><span class="txt">결재 양식 삭제</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_d4c2ea745ecaea9d" target="bookBody"><span class="txt">결재 양식 순서 바꾸기</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_17bd49295e3f18ba" target="bookBody"><span class="txt">2. 전사 문서함 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_79010e46347d26d6" target="bookBody"><span class="txt">2.1 전사 문서함 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_80fd74f8d37605f2" target="bookBody"><span class="txt">2.2 전사 문서함 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_f90310a8ccd8184d" target="bookBody"><span class="txt">2.3 전사 문서함 삭제</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_629c85bd4a437991" target="bookBody"><span class="txt">3. 부서 문서함 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_a0266b8cce2a51c2" target="bookBody"><span class="txt">3.1 특정 부서의 결재 문서 목록보기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_36d3cf184e0eda68" target="bookBody"><span class="txt">3.2 부서 문서함 관리하기 (추가/삭제)</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_52159d4c9c4dcf4d" target="bookBody"><span class="txt">3.3 문서함 분류하기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_378d4d8cf1fd8229" target="bookBody"><span class="txt">4. 결재 관리자 설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_c94bf55f54c6f802" target="bookBody"><span class="txt">5. 전자결재 설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_76056d31ac8416eb" target="bookBody"><span class="txt">6. 서명 일괄등록</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_a90f6d0cfe703fb5" target="bookBody"><span class="txt">7. 전자결재 문서번호 설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_2f1df58eb089d691" target="bookBody"><span class="txt">8. 결재문서 관리</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_888b8e27ee316c52" target="bookBody"><span class="txt">9. 보안등급 관리</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_4474d0677b7aa764" target="bookBody"><span class="txt">10. 전자결재 일자별 통계</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_d33b033de29f9b84" target="bookBody"><span class="txt">11. 전자결재 부서별 통계</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html" target="bookBody"><span class="txt">모빌리티</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_072f3ea6f2398ec6" target="bookBody"><span class="txt">1. 인증기기 접근 설정</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_c8fb54c91384f1cb" target="bookBody"><span class="txt">1.1 모바일 접근 제한</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_b2ba63e58d24bd7f" target="bookBody"><span class="txt">1.2 허용 모바일 기기 관리</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_b1e6fb042ac64f00" target="bookBody"><span class="txt">허용 모바일 기기 추가</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_9a1d8b17a31afe18" target="bookBody"><span class="txt">허용 모바일 기기 삭제</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_0ef088d378e7d948" target="bookBody"><span class="txt">허용 모바일 기기 검색</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_bf608b57551be1f9" target="bookBody"><span class="txt">2. 모바일 보안</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_65530946af0bc549" target="bookBody"><span class="txt">2.1 첨부파일 다운로드</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_e6d5e83e0660cc2a" target="bookBody"><span class="txt">3. 메신저 설정</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_aa7e4883fd9a67aa" target="bookBody"><span class="txt">3.1 기본 설정</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
	</ul>
</div></body></html>

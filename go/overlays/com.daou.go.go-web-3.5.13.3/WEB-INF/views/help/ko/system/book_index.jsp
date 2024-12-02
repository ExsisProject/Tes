<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions"  prefix="fn"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<link rel="stylesheet" href="${baseUrl}help/${brandUrl}/${locale}/system/css/book.css" type="text/css" />
<link rel="stylesheet" href="css/book.css" type="text/css" />
<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>

<body class="bookLeft">
<div class="bookLeft">
	<ul class="depth_1">
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/getting_started.html" target="bookBody"><span class="txt">시스템 어드민 시작하기</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/getting_started.html#r_f384f4473d9bdec7" target="bookBody"><span class="txt">1. 어드민이란</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/getting_started.html#r_27b4c65de64f306c" target="bookBody"><span class="txt">2. 어드민 접속</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/getting_started.html#r_b3da6da6f7255eb5" target="bookBody"><span class="txt">2.1 관리자 설정정보 수정</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/home.html" target="bookBody"><span class="txt">메인홈</span></a></p>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html" target="bookBody"><span class="txt">시스템 관리</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_7f655f8000bcb251" target="bookBody"><span class="txt">1. 개요</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_ff675e99e0906290" target="bookBody"><span class="txt">2. 장비 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_88a9fb40f7e9471a" target="bookBody"><span class="txt">2.1 장비 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_01dbb794f9f66739" target="bookBody"><span class="txt">2.2 장비 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_b2927b439f7ed78d" target="bookBody"><span class="txt">2.3 장비 삭제</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_5a85817fcc647745" target="bookBody"><span class="txt">3. 라이선스</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_adb56c9b01245d7b" target="bookBody"><span class="txt">4. 업데이트</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_506b5289878dd60b" target="bookBody"><span class="txt">4.1 소프트웨어 업데이트</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_edd699c79ba139ea" target="bookBody"><span class="txt">업데이트 파일 등록</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_e0a69f3474076261" target="bookBody"><span class="txt">업데이트</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_2dd685d75997c031" target="bookBody"><span class="txt">릴리즈 노트</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_54e5e7085b6b26ac" target="bookBody"><span class="txt">4.2 업데이트 Proxy 서버 설정</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_5068709f714522a0" target="bookBody"><span class="txt">5. 서비스 설정</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_a4ba19fb2bcfa31a" target="bookBody"><span class="txt">5.1 이메일서버</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_ed5f91d43e731317" target="bookBody"><span class="txt">송수신환경</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_ef850103fe3e34b1" target="bookBody"><span class="txt">기본환경</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_bac8ca1c3088a78a" target="bookBody"><span class="txt">수신도메인변경</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_077aa7a85dea060c" target="bookBody"><span class="txt">수신주소변경</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_74aabb6594593044" target="bookBody"><span class="txt">메일송신옵션</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_0244481eec10058d" target="bookBody"><span class="txt">송신허용정책</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_726bb72e777fb8c1" target="bookBody"><span class="txt">송수신실패정책</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_d4a9edd458925a48" target="bookBody"><span class="txt">예약메일설정</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_95cf42c05724eca4" target="bookBody"><span class="txt">프로세스설정</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_cb92dbe8ce8ed001" target="bookBody"><span class="txt">수신서버설정</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_53e35c7a56eec8eb" target="bookBody"><span class="txt">송신서버설정</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_852c239884013b49" target="bookBody"><span class="txt">전달서버설정</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_32651d9512713008" target="bookBody"><span class="txt">POP서버설정</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_d22df9be6f0865b8" target="bookBody"><span class="txt">IMAP서버설정</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_25a9588f9f851528" target="bookBody"><span class="txt">이메일 검색 설정</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_e0a40cf2117eaf25" target="bookBody"><span class="txt">성능 튜닝</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_9a8348a665a986df" target="bookBody"><span class="txt">반송 메일</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_c2c783673388a8fd" target="bookBody"><span class="txt">메일 첨부 관리</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_9333e14225288757" target="bookBody"><span class="txt">TMA 연동</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html" target="bookBody"><span class="txt">도메인/사이트 관리</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_6339fe8a2a9b8d82" target="bookBody"><span class="txt">1. 도메인 목록</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_caa60a7afc4b9def" target="bookBody"><span class="txt">1.1 도메인 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_8a2ea87e2a52d14b" target="bookBody"><span class="txt">1.2 도메인 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_484b8676834bcdc8" target="bookBody"><span class="txt">1.3 도메인 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_a0fbbeedae484afd" target="bookBody"><span class="txt">1.4 도메인 검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_8fed319e817cc1f3" target="bookBody"><span class="txt">2. 사이트 목록</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_e971f41098447be9" target="bookBody"><span class="txt">2.1 사이트 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_884d3aaa45f4facb" target="bookBody"><span class="txt">2.2 사이트 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_6a866e193f3c6e63" target="bookBody"><span class="txt">2.3 사이트 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_8a6ffd76dff71459" target="bookBody"><span class="txt">2.4 사이트 검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_6bf721eb8d956d57" target="bookBody"><span class="txt">2.5 사이트 어드민으로 이동</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_aecbe2c608518291" target="bookBody"><span class="txt">3. 사이트 그룹 목록</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_a6f8f7a31f604801" target="bookBody"><span class="txt">3.1 사이트 그룹 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_966cb7042454be71" target="bookBody"><span class="txt">3.2 사이트 그룹 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_c4f97ceec02e549e" target="bookBody"><span class="txt">3.3 사이트 그룹 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_d524e6af020bb5e6" target="bookBody"><span class="txt">3.4 사이트 그룹 검색</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html" target="bookBody"><span class="txt">보안 설정</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_8bff744c541da82a" target="bookBody"><span class="txt">1. 공통</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_88af2463984baef0" target="bookBody"><span class="txt">1.1 안티바이러스</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_c76117bb11b2b447" target="bookBody"><span class="txt">1.2 인증서</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_aff77d64ce098f67" target="bookBody"><span class="txt">기본 인증서</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_137039393fc08b9a" target="bookBody"><span class="txt">자가 인증서</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_10e4bf108333ace3" target="bookBody"><span class="txt">신뢰받은 인증서</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_8dda5e4bf574d4a5" target="bookBody"><span class="txt">1.3 API접근 설정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_8fa60bc11d99d410" target="bookBody"><span class="txt">1.4 해외 로그인 차단 허용 설정</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_a8481fbec99e3b4c" target="bookBody"><span class="txt">2. 이메일 보안</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_5b5d5fe8dac60612" target="bookBody"><span class="txt">2.1 안티 스팸</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_929c347118e336a2" target="bookBody"><span class="txt">컨텐츠 필터</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_5c2ce53678546620" target="bookBody"><span class="txt">허용/차단 규칙 추가</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_7421b5d63dd4ab7e" target="bookBody"><span class="txt">허용/차단 규칙 수정</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_f3d763be480f5627" target="bookBody"><span class="txt">허용/차단 규칙 삭제</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_6cf86d2fe904d461" target="bookBody"><span class="txt">허용/차단 규칙의 사용 및 사용안함 설정</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_72c787e29f1b9449" target="bookBody"><span class="txt">필터 검색</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_1d96db20fecf804b" target="bookBody"><span class="txt">컨텐츠 룰 업데이트</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_b8f9458b73e30f1a" target="bookBody"><span class="txt">접속 단계 차단</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_5bccf551aa0117a2" target="bookBody"><span class="txt">발송 IP 차단</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_9d374bc79e0813b9" target="bookBody"><span class="txt">시간당 접속 횟수 제한</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_38a887e5e680a5f0" target="bookBody"><span class="txt">동시 접속 횟수 제한</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_f61036af287bcd78" target="bookBody"><span class="txt">RBL</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_3cbcddf1aa99c942" target="bookBody"><span class="txt">접속 단계 허용</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_7ddd1aee807f975a" target="bookBody"><span class="txt">SMTP 단계 차단</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_2a30b92ff3e49d64" target="bookBody"><span class="txt">DNS 검사</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_6cdb0dac23570bab" target="bookBody"><span class="txt">SPF</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_3cda185a33af9d41" target="bookBody"><span class="txt">송신자 차단</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_7ac117cbde54f519" target="bookBody"><span class="txt">송신자 시간당 제한</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_ba53cf85b4c06c77" target="bookBody"><span class="txt">수신자 차단</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_447656ad64de23a7" target="bookBody"><span class="txt">수신자 시간당 제한</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_b03f44cc4ae0ac6b" target="bookBody"><span class="txt">동보 응답 지연</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_8352219ccb424b88" target="bookBody"><span class="txt">SMTP 단계 허용</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_3fb200775bb4cf64" target="bookBody"><span class="txt">필터 멤버 정책</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_52642c0bdb0c771e" target="bookBody"><span class="txt">필터 멤버 정책 추가</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_396ccbc78c91177d" target="bookBody"><span class="txt">필터 멤버 정책 수정</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_eb512c563e6f9e5f" target="bookBody"><span class="txt">필터 멤버 정책 삭제</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_226c20f20a323379" target="bookBody"><span class="txt">필터 멤버 정책 사용/사용안함 설정</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_4e26ab74d805708d" target="bookBody"><span class="txt">필터 멤버 정책 순서 적용</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_93fe885116b251a5" target="bookBody"><span class="txt">필터 멤버 정책 검색</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_dab099df75895707" target="bookBody"><span class="txt">필터 환경 설정</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_b06d1f2660f9ac9a" target="bookBody"><span class="txt">필터 정보 관리 서버</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_dad8d347259795e1" target="bookBody"><span class="txt">로컬 도메인, 호스트 허용 정책</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_1a8780b997bf2441" target="bookBody"><span class="txt">로컬 베이시안</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_4461e380ed881e10" target="bookBody"><span class="txt">필터 검색</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_bbf874ac534e0a11" target="bookBody"><span class="txt">2.2 메일 정보 필터</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_384d5c449b943c0b" target="bookBody"><span class="txt">유출 감시 모니터링</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_0927297ca0224503" target="bookBody"><span class="txt">정보 보호 필터</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_110823a8c12a535d" target="bookBody"><span class="txt">감시 대상 설정</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_372f209048537671" target="bookBody"><span class="txt">차단 알림메일 설정</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_34f9515aa7ccd69a" target="bookBody"><span class="txt">메일 정보 보호 폴더 관리</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_10ecf8a8204c69cd" target="bookBody"><span class="txt">2.3 메일 데이터 보안</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_296bab7e09c27301" target="bookBody"><span class="txt">2.4 SSL/TLS 접속설정</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_d1c3d189284bcebc" target="bookBody"><span class="txt">SMTP</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_ae57cc2adcb47e6f" target="bookBody"><span class="txt">POP</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_ad3def3ae68fd9bf" target="bookBody"><span class="txt">IMAP</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_a03472c59d6c8704" target="bookBody"><span class="txt">3. WAS 보안</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_d7e76daaca89bd55" target="bookBody"><span class="txt">3.1 접속차단</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_d9e74af0c0a9e4d8" target="bookBody"><span class="txt">3.2 세션검증</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_ddd0d86b7662ac46" target="bookBody"><span class="txt">3.3 HTTPS 설정</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html" target="bookBody"><span class="txt">통계</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_9ccb879ca892a916" target="bookBody"><span class="txt">1. 개요</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_250e91f41a68cd64" target="bookBody"><span class="txt">1.1 통계 정보 검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_869c8c434d928b04" target="bookBody"><span class="txt">1.2 통계 결과 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_d0271362eebc40e5" target="bookBody"><span class="txt">1.3 통계 결과 인쇄</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_50450dc98f7d8357" target="bookBody"><span class="txt">2. 이메일</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_84f0f089414f2b38" target="bookBody"><span class="txt">2.1 요약</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_3272be930d4441ef" target="bookBody"><span class="txt">2.2 정상 메일</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_a0725f3ff55c3a47" target="bookBody"><span class="txt">2.3 스팸 메일</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_72f5f554c628f394" target="bookBody"><span class="txt">모든 단계</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_9d09dae527c0485d" target="bookBody"><span class="txt">접속 단계</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_1247fc28a869300b" target="bookBody"><span class="txt">SMTP 단계</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_984e5e6ddae25b3d" target="bookBody"><span class="txt">컨텐츠 단계</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_c30e1d045b8960c3" target="bookBody"><span class="txt">2.4 피싱 메일</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_15ac97e8f95a45c8" target="bookBody"><span class="txt">2.5 바이러스 메일</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_810e825b519007ea" target="bookBody"><span class="txt">2.6 POP</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_fcaa5bc59617ed51" target="bookBody"><span class="txt">2.7 IMAP</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_47d5b8cddda92e25" target="bookBody"><span class="txt">3. 시스템</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_d8a68af01dc281b0" target="bookBody"><span class="txt">3.1 CPU</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_2858592bccf8228b" target="bookBody"><span class="txt">3.2 메모리</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_3a268f8e7e7fd8bb" target="bookBody"><span class="txt">3.3 디스크</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_d5db3c361b0bfe80" target="bookBody"><span class="txt">4. 통계 보고서</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_0db60b4a9e0802fb" target="bookBody"><span class="txt">4.1 통계 보고서 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_d7b154cee54d5fb3" target="bookBody"><span class="txt">4.2 통계 보고서 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_3c1028a6d59c2178" target="bookBody"><span class="txt">4.3 통계 보고서 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_cc1dea95e193e92c" target="bookBody"><span class="txt">4.4 통계 보고서 설정</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html" target="bookBody"><span class="txt">모니터링</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_1cd5f480d6456a50" target="bookBody"><span class="txt">1. 개요</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_e588a0fb759578b8" target="bookBody"><span class="txt">2. 실시간 현황</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_6d9f0d53cefdb438" target="bookBody"><span class="txt">3. 로그</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_8d79185572330026" target="bookBody"><span class="txt">3.1 이메일 로그</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_4ae8519165b246eb" target="bookBody"><span class="txt">이메일 로그 검색</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_ee6bd8b01e6d192a" target="bookBody"><span class="txt">스팸메일/정상메일 등록</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_3bbbc646f1cc9f65" target="bookBody"><span class="txt">이메일 로그 새로고침</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_17095a0b372ed3ea" target="bookBody"><span class="txt">3.2 로그 설정</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_47b40455ec5ad878" target="bookBody"><span class="txt">4. 시스템현황</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_e9ffdf3bdd20889e" target="bookBody"><span class="txt">4.1 프로세스 현황</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_d33016e01b059a30" target="bookBody"><span class="txt">4.2 리소스 현황</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_43a528bded3b40a8" target="bookBody"><span class="txt">4.3 메일처리 현황</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_fbad37e75ba7c4eb" target="bookBody"><span class="txt">4.4 수신 처리 현황</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_c289944be1a72863" target="bookBody"><span class="txt">4.5 필터된 IP 검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_6eb85bcda560e7e6" target="bookBody"><span class="txt">4.6 큐 현황</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_b6bc7341e10e8330" target="bookBody"><span class="txt">큐 검색</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_67d50b5d139a3d6f" target="bookBody"><span class="txt">큐 삭제</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_04d5631ed2c1adce" target="bookBody"><span class="txt">큐 전송</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_f5b74c8fa4b84b74" target="bookBody"><span class="txt">5. 문의 및 지원</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_8f240f877a5cd57c" target="bookBody"><span class="txt">5.1 메일문의</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_86d6414c7ebc7cb2" target="bookBody"><span class="txt">5.2 경고 메일 설정</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/mobility.html" target="bookBody"><span class="txt">모빌리티</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/mobility.html#r_0d77f5d532505c9c" target="bookBody"><span class="txt">1. 모바일 앱 버전 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/mobility.html#r_04f6ad910a3129de" target="bookBody"><span class="txt">1.1 모바일 앱 버전 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/mobility.html#r_ba9477ef3c21bda6" target="bookBody"><span class="txt">1.2 모바일 앱 버전 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/mobility.html#r_f6e38ea0ccd7a958" target="bookBody"><span class="txt">1.3 모바일 앱 버전 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/mobility.html#r_726ccd7cdff1ce40" target="bookBody"><span class="txt">1.4 모바일 앱 버전 필터링</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html" target="bookBody"><span class="txt">기타 설정</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_a45b1b294b8a756d" target="bookBody"><span class="txt">1. IP 그룹 설정</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_96b046253c8b44d3" target="bookBody"><span class="txt">1.1 IP 그룹 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_399807058e2af99a" target="bookBody"><span class="txt">1.2 IP 그룹 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_050cf7af1d3c8f86" target="bookBody"><span class="txt">1.3 IP 그룹 삭제</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_7237c36383c938a7" target="bookBody"><span class="txt">2. 초기화</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_52b7f3d026f737fe" target="bookBody"><span class="txt">3. 보관 기간 설정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_b470fdb35d31777f" target="bookBody"><span class="txt">4. 비밀번호 찾기 설정</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html" target="bookBody"><span class="txt">관리자</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_3e1a8973edd9635c" target="bookBody"><span class="txt">1. 관리자 목록</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_35fa028581a3989a" target="bookBody"><span class="txt">1.1 관리자 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_b6869fbf08f4cabf" target="bookBody"><span class="txt">1.2 관리자 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_c084f00c16a0783f" target="bookBody"><span class="txt">1.3 관리자 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_3d03bf812c9099c0" target="bookBody"><span class="txt">1.4 관리자 검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_5baa076fb0c2da69" target="bookBody"><span class="txt">2. 관리자 로그</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_6f76ceb43e79119f" target="bookBody"><span class="txt">2.1 관리자 로그 목록</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_7d58a8880fd05ee5" target="bookBody"><span class="txt">2.2 관리 내역 검색</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
	</ul>
</div></body></html>

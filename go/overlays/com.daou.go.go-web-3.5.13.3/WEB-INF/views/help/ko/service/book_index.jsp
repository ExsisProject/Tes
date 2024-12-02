<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions"  prefix="fn"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<link rel="stylesheet" href="${baseUrl}help/${brandUrl}/${locale}/service/css/book.css" type="text/css" />
<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>

<body class="bookLeft">
<div class="bookLeft">
	<ul class="depth_1">		
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html" target="bookBody"><span class="txt">시작하기</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html#r_c9d6861f6aa370c7" target="bookBody"><span class="txt">${brandName}란?</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html#r_a8d646e860355d3b" target="bookBody"><span class="txt">주요 기능</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html#r_cf051e0f5c87fa83" target="bookBody"><span class="txt">메일</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html#r_a8d9095e84fb0f97" target="bookBody"><span class="txt">자료실</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html#r_77549409dcfb2f12" target="bookBody"><span class="txt">주소록</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html#r_61b0e544a77640da" target="bookBody"><span class="txt">캘린더</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/part_one.html" target="bookBody"><span class="txt">Part I. Web</span></a></p>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html" target="bookBody"><span class="txt">접속하기</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_0b65c744991fc65c" target="bookBody"><span class="txt">1. 로그인</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_e895f89c33089318" target="bookBody"><span class="txt">2. 로그아웃</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_b9beaa4da2c5e963" target="bookBody"><span class="txt">3. 개인정보 수정</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_5f67c5ea9032a065" target="bookBody"><span class="txt">3.1 기본정보 수정하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_44711a0ee39d9422" target="bookBody"><span class="txt">3.2 비밀번호 변경하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_3306276685dfdcd6" target="bookBody"><span class="txt">3.3 외부 메일 주소 등록하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_cef55192cf5fdd1e" target="bookBody"><span class="txt">3.4 환경설정</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html" target="bookBody"><span class="txt">홈</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_c7d3a63c6c650930" target="bookBody"><span class="txt">1. 대시보드란</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_9b26bbbfc6ab792b" target="bookBody"><span class="txt">2. 대시보드 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_727a75c9a5c2a071" target="bookBody"><span class="txt">2.1 대시보드 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_36bf77ee6869905c" target="bookBody"><span class="txt">2.2 대시보드 편집</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_7cbfe586c35cf008" target="bookBody"><span class="txt">2.3 대시보드 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_96c9dcd91dbc245b" target="bookBody"><span class="txt">2.4 레이아웃 설정</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_666c3d291436ac75" target="bookBody"><span class="txt">3. 대시보드 설정</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_150534d55e9132ba" target="bookBody"><span class="txt">3.1 가젯 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_aa40dc3348584ee5" target="bookBody"><span class="txt">3.2 가젯 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_f9e2fcae8b90b4de" target="bookBody"><span class="txt">3.3 가젯 설정 변경</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_e6ee2ac45434202b" target="bookBody"><span class="txt">3.4 가젯 순서 변경</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_69ad23bd00dcdd53" target="bookBody"><span class="txt">4. 통합검색</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html" target="bookBody"><span class="txt">메일</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_8bb3a0265325f2e1" target="bookBody"><span class="txt">1. 메일 읽기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_4ac407825216d7ab" target="bookBody"><span class="txt">1.1 메일 본문 읽기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_eada86e3920fff45" target="bookBody"><span class="txt">1.2 메일 본문 구성</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_132cf5e19e45a58f" target="bookBody"><span class="txt">1.3 메일 답장</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_59c022ea6a9e8b8e" target="bookBody"><span class="txt">1.4 메일 전달</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_bf4ccb955ac7f8cf" target="bookBody"><span class="txt">1.5 메일 이동</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_d8598803608c88f8" target="bookBody"><span class="txt">1.6 메일 복사</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_68aff19a8a37910d" target="bookBody"><span class="txt">1.7 메일 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_475ba23ae0c96fb3" target="bookBody"><span class="txt">1.8 메일 읽음/안읽음 표시</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_ff16a956b632f9f0" target="bookBody"><span class="txt">1.9 메일 저장</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_d9584dc286aacce2" target="bookBody"><span class="txt">1.10 메일 인쇄</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_10c595b41553ccdf" target="bookBody"><span class="txt">1.11 메일 자동분류</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_6c383ef4fd04d6b2" target="bookBody"><span class="txt">1.12 메일 스팸신고</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_7a9b639eb1c500e5" target="bookBody"><span class="txt">1.13 메일 수신거부</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_94239f7cbcb6e24f" target="bookBody"><span class="txt">1.14 메일 수신허용</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_d2138be591eee728" target="bookBody"><span class="txt">1.15 메일 올리기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_923fd840f6feba8e" target="bookBody"><span class="txt">1.16 일정 바로 등록</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_e205796c1b04e28f" target="bookBody"><span class="txt">1.17 아카이브 센터</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_8be398dac97b66a6" target="bookBody"><span class="txt">2. 메일 쓰기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_087c5fa5553ed289" target="bookBody"><span class="txt">2.1 수신자 지정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_2fd918deb94f4ed5" target="bookBody"><span class="txt">2.2 파일 첨부</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_22891a805e55914a" target="bookBody"><span class="txt">파일 첨부 방식</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_66f043a7ae6a53ab" target="bookBody"><span class="txt">파일 첨부 방법</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_a522afb285dabcbb" target="bookBody"><span class="txt">2.3 본문 작성</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_7c69308d6ff49c63" target="bookBody"><span class="txt">2.4 옵션 설정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_540cffd7b0d2de27" target="bookBody"><span class="txt">2.5 미리보기 / 임시저장</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_ac4102a9c035464a" target="bookBody"><span class="txt">2.6 수신확인 / 발송취소</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_5ffbeb88b981f1de" target="bookBody"><span class="txt">2.7 메일 다시 보내기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_2ab82a49d084dd9a" target="bookBody"><span class="txt">2.8 대량메일 수신파일 업로드</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_de1d43276654dfce" target="bookBody"><span class="txt">3. 메일 검색</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_040c95eadeda2569" target="bookBody"><span class="txt">3.1 빠른검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_120f149ab398e855" target="bookBody"><span class="txt">3.2 기본검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_49ef09862062b3d2" target="bookBody"><span class="txt">3.3 상세검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_a910944a52f42c59" target="bookBody"><span class="txt">3.4 검색조건</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_ca3423cba88971d8" target="bookBody"><span class="txt">검색조건 저장하기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_45704f77f3bf9798" target="bookBody"><span class="txt">검색조건을 이용하여 검색하기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_0988fe5919d11219" target="bookBody"><span class="txt">검색조건 삭제하기</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_f395702970aec58d" target="bookBody"><span class="txt">4. 즐겨찾기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_e8120aab74206597" target="bookBody"><span class="txt">4.1 즐겨찾기 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_0bd7df439314dbed" target="bookBody"><span class="txt">4.2 즐겨찾기 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_9ae6cdafe282bab1" target="bookBody"><span class="txt">4.3 즐겨찾기 순서 바꾸기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_70f09bbede1b896f" target="bookBody"><span class="txt">5. 태그 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_4d486d0fdf382d67" target="bookBody"><span class="txt">5.1 태그 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_ffae3f991060f98a" target="bookBody"><span class="txt">5.2 태그 수정/삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_b381817cb4b3d4a6" target="bookBody"><span class="txt">5.3 태그 지정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_da58555a02cf7cb7" target="bookBody"><span class="txt">5.4 태그 해제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_053452880d3d33cf" target="bookBody"><span class="txt">5.5 태그 필터링</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_a7535843ad607f2c" target="bookBody"><span class="txt">6. 메일함 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_4f04a8eaefe359aa" target="bookBody"><span class="txt">6.1 메일함 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_c97a634ae7d82413" target="bookBody"><span class="txt">6.2 하위 메일함 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_e3b9adcafa6a428a" target="bookBody"><span class="txt">6.3 메일함 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_ff6d78759efe2626" target="bookBody"><span class="txt">6.4 메일함 이동</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_dab86e5312d62c86" target="bookBody"><span class="txt">6.5 메일함 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_850030a6ed3848cc" target="bookBody"><span class="txt">6.6 메일함 공유</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_2a61510654789baf" target="bookBody"><span class="txt">6.7 메일함 비우기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_a8f4b2cbee69dd7a" target="bookBody"><span class="txt">7. 외부메일 다운로드</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_43c62c6393d5c168" target="bookBody"><span class="txt">8. 메일환경설정</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_e0f2173fe52c49a1" target="bookBody"><span class="txt">8.1 기본환경</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_1fdb0803f434b590" target="bookBody"><span class="txt">8.2 서명관리</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_e6553f8412b5820c" target="bookBody"><span class="txt">8.3 메일함 관리</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_61c85da91d60e7b5" target="bookBody"><span class="txt">기본 메일함 관리</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_a435d2b3114037b3" target="bookBody"><span class="txt">개인메일함 관리</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_e2e672ac8cbcdf6b" target="bookBody"><span class="txt">개인메일함 추가</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_1aa7615ff46cc2bb" target="bookBody"><span class="txt">개인메일함 삭제</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_4fb8e5fc582b2f2f" target="bookBody"><span class="txt">개인메일함 이동</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_f61c77c14339ed59" target="bookBody"><span class="txt">개인메일함 공유</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_b8f47a1d9adaf7ee" target="bookBody"><span class="txt">개인메일함 보관기간 설정</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_42462ad55c78f03f" target="bookBody"><span class="txt">메일 올리기(업로드)</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_ab42b57fab2a7339" target="bookBody"><span class="txt">메일함 백업</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_39cc128af70cad5b" target="bookBody"><span class="txt">메일함 비우기</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_a384e57e0dbe65c6" target="bookBody"><span class="txt">태그 관리</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_dba196cef983e037" target="bookBody"><span class="txt">8.4 스팸 관리</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_f1ba5c2953693c68" target="bookBody"><span class="txt">수신 허용 메일 추가</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_a20eb5df775a633a" target="bookBody"><span class="txt">수신 거부 메일 추가</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_a17b47cd1a579529" target="bookBody"><span class="txt">8.5 자동분류</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_803475d9ada6d83d" target="bookBody"><span class="txt">8.6 자동전달</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_0c5f277604965eae" target="bookBody"><span class="txt">8.7 부재중응답</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_1e8a0580b130a912" target="bookBody"><span class="txt">8.8 외부메일</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_abf580b5371ec5c8" target="bookBody"><span class="txt">8.9 최근메일</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html" target="bookBody"><span class="txt">주소록</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_8c60e88813af0ced" target="bookBody"><span class="txt">1. 그룹 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_c724965b0463b732" target="bookBody"><span class="txt">1.1 그룹 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_9b930e1fd3990019" target="bookBody"><span class="txt">1.2 그룹 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_d17225347a0d3809" target="bookBody"><span class="txt">1.3 그룹 삭제</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_c23bb513b422d14a" target="bookBody"><span class="txt">2. 연락처 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_791b8bedc233a6bb" target="bookBody"><span class="txt">2.1 연락처 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_ac82d9a3638c17b3" target="bookBody"><span class="txt">2.2 연락처 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_6194cce6bdedc508" target="bookBody"><span class="txt">2.3 연락처 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_65f1ebfb09f84046" target="bookBody"><span class="txt">2.4 연락처 그룹지정/그룹해제</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_0d6659aa0da7eaba" target="bookBody"><span class="txt">3. 가져오기/내보내기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_c689c0f315a0677d" target="bookBody"><span class="txt">3.1 연락처 가져오기</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_52897f8f727b8d5f" target="bookBody"><span class="txt">CSV 파일 가져오기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_dc82e60bfece29eb" target="bookBody"><span class="txt">조직도 정보 가져오기</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_fe18f530c1dca8b7" target="bookBody"><span class="txt">3.2 연락처 내보내기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_2536e7016ee97a95" target="bookBody"><span class="txt">4. 주소록 인쇄</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_c57abb60c2d7ab85" target="bookBody"><span class="txt">5. 연락처 검색</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_5cab469407d63dff" target="bookBody"><span class="txt">5.1 기본검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_4fded122f52124dd" target="bookBody"><span class="txt">5.2 상세검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_a6918b42956ba55a" target="bookBody"><span class="txt">6. 그룹에 메일 보내기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_763b6b918cbba5ef" target="bookBody"><span class="txt">7. 공용 주소록</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html" target="bookBody"><span class="txt">캘린더</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_2b45dbd77c30d908" target="bookBody"><span class="txt">1. 내 캘린더 관리하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_48a16d47a47fcea8" target="bookBody"><span class="txt">1.1 캘린더 추가하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_a59b74715f7e8d4d" target="bookBody"><span class="txt">1.2 캘린더 삭제하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_109bdde443e90456" target="bookBody"><span class="txt">1.3 캘린더 이름 바꾸기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_e6b1f9bef55d22c9" target="bookBody"><span class="txt">1.4 캘린더 순서바꾸기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_edad2cf6e25bf93c" target="bookBody"><span class="txt">2. 일정 등록하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_d58909beca8c0482" target="bookBody"><span class="txt">2.1 반복일정 등록하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_cde3f4398b5534f5" target="bookBody"><span class="txt">2.2 참석자 추가하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_859ec532dc7dad8a" target="bookBody"><span class="txt">2.3 알람 설정하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_918bfbd94a70abcd" target="bookBody"><span class="txt">2.4 자산 예약하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_7b90add5f1056c79" target="bookBody"><span class="txt">2.5 일정 수정하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_eb87669ff312545c" target="bookBody"><span class="txt">2.6 일정 삭제하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_d8eb69c77d5eea23" target="bookBody"><span class="txt">2.7 참석자에서 빠지기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_5366b74397bb155d" target="bookBody"><span class="txt">3. 일정 확인하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_61dc223ec6978acc" target="bookBody"><span class="txt">3.1 댓글</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_595af52a1d522f7d" target="bookBody"><span class="txt">3.2 변경이력 보기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_80619e35b94de481" target="bookBody"><span class="txt">4. 조직도로 다른 사용자 일정 확인하기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_6450f1c4b3d250a9" target="bookBody"><span class="txt">5. 관심 캘린더 관리하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_102ab11c6945551c" target="bookBody"><span class="txt">5.1 관심 캘린더 추가하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_9ebcf592a0cec540" target="bookBody"><span class="txt">5.2 관심 캘린더 삭제하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_ce29e4bd89d6c585" target="bookBody"><span class="txt">5.3 관심 캘린더 추가 취소하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_279b4917f52b3c4a" target="bookBody"><span class="txt">5.4 관심 캘린더 신청 수락하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_6f772c0564028095" target="bookBody"><span class="txt">5.5 내 일정을 보고 있는 사용자 확인하기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_a79678a7ab465d62" target="bookBody"><span class="txt">6. 캘린더 환경설정</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_721ae4259787a806" target="bookBody"><span class="txt">6.1 캘린더 추가하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_61e6e6d1722a2060" target="bookBody"><span class="txt">6.2 캘린더 삭제하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_ac1e50d65790e1bb" target="bookBody"><span class="txt">6.3 캘린더 이름 바꾸기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_03c6065fd9cf666b" target="bookBody"><span class="txt">6.4 캘린더 순서바꾸기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_a0a281efb68de743" target="bookBody"><span class="txt">6.5 캘린더 공개 설정하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_bcaa131f894afbfc" target="bookBody"><span class="txt">6.6 기본 캘린더 설정하기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_f244eccbf8fbe48d" target="bookBody"><span class="txt">7. 일정검색</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_05c306dc6f5bd715" target="bookBody"><span class="txt">7.1 기본검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_d6cd72458ed4fd62" target="bookBody"><span class="txt">7.2 상세검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_445519e5a09ebee9" target="bookBody"><span class="txt">8. 전사일정 등록하기</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html" target="bookBody"><span class="txt">게시판</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_f9c568a5ec1c9bff" target="bookBody"><span class="txt">1. 게시판이란</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_88531d3650d84bbb" target="bookBody"><span class="txt">2. 부서게시판 만들기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_a02c5afdca1edca9" target="bookBody"><span class="txt">3. 부서게시판 설정하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_46ccecbe72c06abf" target="bookBody"><span class="txt">3.1 게시판 공유하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_04867b392e0c66ed" target="bookBody"><span class="txt">3.2 비공개 게시판 만들기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_c9bc25620989c656" target="bookBody"><span class="txt">3.3 말머리 설정하기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_058ed4f18dc4de88" target="bookBody"><span class="txt">4. 부서게시판 관리하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_7a6ad5053a62385a" target="bookBody"><span class="txt">4.1 게시판 순서 바꾸기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_7fcb91e6f18e319b" target="bookBody"><span class="txt">4.2 구분선 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_8e30112c0fbd3cfe" target="bookBody"><span class="txt">4.3 게시판 중지</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_3582569d60b76daa" target="bookBody"><span class="txt">4.4 게시판 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_fb03b4b6c1aa6306" target="bookBody"><span class="txt">4.5 게시판 이관</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_ff9904bafd128f19" target="bookBody"><span class="txt">5. 즐겨찾기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_1b7deeb7bf997805" target="bookBody"><span class="txt">6. 게시물 보기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_bbb08a888cc75a28" target="bookBody"><span class="txt">6.1 클래식형 게시판 게시물 보기</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_d968a71a2d66415e" target="bookBody"><span class="txt">게시물 조회 멤버 목록 보기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_ab53b3c02ae62324" target="bookBody"><span class="txt">좋아요 멤버 보기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_0ef17e32e4acd4be" target="bookBody"><span class="txt">게시물 메일로 보내기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_279d75a1a1d644dc" target="bookBody"><span class="txt">게시물 삭제하기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_f19220467242471d" target="bookBody"><span class="txt">게시물 이동하기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_259945788a014236" target="bookBody"><span class="txt">게시물 복사하기</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_aa8f1568ac74c87a" target="bookBody"><span class="txt">6.2 피드형 게시판 게시물 보기</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_861a5d9a0342071a" target="bookBody"><span class="txt">좋아요 멤버 보기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_302a7e7ff98df355" target="bookBody"><span class="txt">게시물 메일로 보내기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_83feed33fe8afb38" target="bookBody"><span class="txt">게시물 정렬 설정하기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_29c73d0437ee4390" target="bookBody"><span class="txt">게시물 삭제하기</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_816bf16afbee8fde" target="bookBody"><span class="txt">6.3 이메일 수신 신청하기(구독하기)</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_b442ea78700486a7" target="bookBody"><span class="txt">6.4 공개/공유 현황 보기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_91217bf4389c25e6" target="bookBody"><span class="txt">7. 게시물 쓰기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_9399adf82f0df8fd" target="bookBody"><span class="txt">7.1 클래식형 게시판 글 작성하기</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_6bc6c85cbb0bc530" target="bookBody"><span class="txt">비공개로 작성하기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_bf9ba1858e6851c6" target="bookBody"><span class="txt">임시저장하기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_d7d0883a6a89f40a" target="bookBody"><span class="txt">공지로 등록하기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_fa3e79a90966eacb" target="bookBody"><span class="txt">부서원에게 알리기</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_e85527a567b9a6eb" target="bookBody"><span class="txt">7.2 피드형 게시판 글 작성하기</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_6181d1d803318a88" target="bookBody"><span class="txt">첨부하기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_9bd7e3cd752531f6" target="bookBody"><span class="txt">부서원에게 알리기</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_b3ae3ca6a2d9588e" target="bookBody"><span class="txt">8. 게시물 검색</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_576a15b73288c59b" target="bookBody"><span class="txt">8.1 기본검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_01d64e3df0a671d1" target="bookBody"><span class="txt">8.2 상세검색</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html" target="bookBody"><span class="txt">커뮤니티</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_f7b5232beea97be9" target="bookBody"><span class="txt">1. 커뮤니티 시작하기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_55cf153e9b2aec20" target="bookBody"><span class="txt">2. 커뮤니티 만들기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_7e6750ca53258570" target="bookBody"><span class="txt">3. 커뮤니티 초대하기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_a056265d2e10c0de" target="bookBody"><span class="txt">4. 커뮤니티 가입 신청하기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_cb784a8ec8101562" target="bookBody"><span class="txt">5. 커뮤니티 탈퇴하기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_19ffa0e8e4e4fa52" target="bookBody"><span class="txt">6. 커뮤니티 관리하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_3d8584e0826ef659" target="bookBody"><span class="txt">6.1 커뮤니티 정보 수정하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_690a598e6a6758ab" target="bookBody"><span class="txt">6.2 커뮤니티 폐쇄하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_906d5f930f4f3886" target="bookBody"><span class="txt">6.3 커뮤니티 멤버 보기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_e10eb2438dd96c9e" target="bookBody"><span class="txt">6.4 커뮤니티 멤버에게 메일 보내기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_4a1c7bf7a302ec7e" target="bookBody"><span class="txt">6.5 가입 승인하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_c0a788230e052f05" target="bookBody"><span class="txt">6.6 커뮤니티 게시판 관리하기</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_0617f8f2fe82d1a6" target="bookBody"><span class="txt">게시판 순서 바꾸기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_8f2b618ba1d4f663" target="bookBody"><span class="txt">구분선 추가하기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_1ff89a2423496c51" target="bookBody"><span class="txt">게시판 중지</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_8578e41abf349285" target="bookBody"><span class="txt">게시판 삭제</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_31611328a897ce8f" target="bookBody"><span class="txt">7. 커뮤니티로 가기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_8a813391caa31389" target="bookBody"><span class="txt">7.1 게시판 만들기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_e85f6d1d2252ef5f" target="bookBody"><span class="txt">7.2 게시판 설정하기</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_14f6c7a8ba9c4320" target="bookBody"><span class="txt">비공개 게시판 만들기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_1c234958fac1f945" target="bookBody"><span class="txt">말머리 설정하기</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_7ee683babb478be9" target="bookBody"><span class="txt">7.3 게시물 보기</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_be4458bf5aab944c" target="bookBody"><span class="txt">클래식형 게시판 게시물 보기</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_2676383e6840b58f" target="bookBody"><span class="txt">게시물 조회 멤버 목록 보기</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_9b0629afaa71f571" target="bookBody"><span class="txt">좋아요 멤버 보기</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_4dc22b95c5c7561a" target="bookBody"><span class="txt">게시물 삭제하기</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_e7de664448db0154" target="bookBody"><span class="txt">게시물 이동하기</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_bf4494bce8c89a7e" target="bookBody"><span class="txt">게시물 복사하기</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_bf01ed512866692b" target="bookBody"><span class="txt">피드형 게시판 게시물 보기</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_dde9ae18b820f655" target="bookBody"><span class="txt">좋아요 멤버 보기</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_7f93e51ef4ade0b5" target="bookBody"><span class="txt">게시물 정렬 설정하기</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_29a5f677dcd4c41a" target="bookBody"><span class="txt">게시물 삭제하기</span></a></p>
										</li>
									</ul>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_ec482e73fa6c226b" target="bookBody"><span class="txt">7.4 이메일 수신 신청하기(구독하기)</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_858c0ac969926ed2" target="bookBody"><span class="txt">7.5 게시물 쓰기</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_0e6e7f4edac10ee9" target="bookBody"><span class="txt">클래식형 게시판 글 작성하기</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_8c4e21183e41b4fb" target="bookBody"><span class="txt">비공개로 작성하기</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_b6c42525d8f2d61d" target="bookBody"><span class="txt">임시저장하기</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_bb669c7dfb221c8a" target="bookBody"><span class="txt">공지로 등록하기</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_ad842f597b672659" target="bookBody"><span class="txt">가입멤버에게 알리기</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_7faba141697e5d7e" target="bookBody"><span class="txt">피드형 게시판 글 작성하기</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_960f1ae737e40239" target="bookBody"><span class="txt">첨부하기</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_9d928346232a50d9" target="bookBody"><span class="txt">가입멤버에게 알리기</span></a></p>
										</li>
									</ul>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_d8061feeb5da581f" target="bookBody"><span class="txt">8. 커뮤니티 검색</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_f536daa01814d1ea" target="bookBody"><span class="txt">8.1 기본검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_71999c80c283e9cf" target="bookBody"><span class="txt">8.2 상세검색</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html" target="bookBody"><span class="txt">예약</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_ae24db13a31e1130" target="bookBody"><span class="txt">1. 내 예약/대여 현황</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_eb9c50d6892ad634" target="bookBody"><span class="txt">2. 자산 예약/대여하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_07d8f320065edce8" target="bookBody"><span class="txt">2.1 자산 예약하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_3281c69ddf1b468a" target="bookBody"><span class="txt">2.2 자산 대여하기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_03af12a41e1ee985" target="bookBody"><span class="txt">3. 자산 예약 취소하기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_3ab4b995641ae8f8" target="bookBody"><span class="txt">4. 자산 반납하기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_9be0b6e53093c312" target="bookBody"><span class="txt">5. 자산 검색하기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_54aa924bdacd0401" target="bookBody"><span class="txt">6. 자산 설정하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_3a3265988ecdbee6" target="bookBody"><span class="txt">6.1 이용안내</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_556f5a31ccc646d3" target="bookBody"><span class="txt">6.2 자산정보관리</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_f73a2eaa3b7cd76d" target="bookBody"><span class="txt">6.3 자산관리</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_25f42007916048df" target="bookBody"><span class="txt">6.4 이용정보</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html" target="bookBody"><span class="txt">보고</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_7a7180ea8530dde4" target="bookBody"><span class="txt">1. 보고서</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_ea67b09c407968bf" target="bookBody"><span class="txt">1.1 보고서 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_0d532fe549b975c7" target="bookBody"><span class="txt">1.2 보고서 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_ebb6aabfbeecddf6" target="bookBody"><span class="txt">1.3 보고서 관리</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_5bc2d7bf99ff1880" target="bookBody"><span class="txt">보고서 순서 바꾸기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_dbfcb4eccd5dcc75" target="bookBody"><span class="txt">구분선 추가</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_66949e60de134eb6" target="bookBody"><span class="txt">보고서 중지</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_d6de20e1ab7ef1ce" target="bookBody"><span class="txt">보고서 삭제</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_c8b152c58064a1b2" target="bookBody"><span class="txt">보고서 이관</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_01690f35f6f78950" target="bookBody"><span class="txt">1.4 보고서 상태 변경</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_9ded947691b7712c" target="bookBody"><span class="txt">1.5 보고서 즐겨찾기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_1a4c1e58ee2bf495" target="bookBody"><span class="txt">2. 정기 보고서</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_f435d5fcdf8d5c7a" target="bookBody"><span class="txt">2.1 보고 확인</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_4e023965b5f0619a" target="bookBody"><span class="txt">2.2 보고하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_2e30b4745af07576" target="bookBody"><span class="txt">2.3 보고 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_6ced11a54a2b2497" target="bookBody"><span class="txt">2.4 변경이력 보기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_3992a8eb4c0e7159" target="bookBody"><span class="txt">2.5 보고 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_84a215fcbb9f95a2" target="bookBody"><span class="txt">2.6 보고 인쇄</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_3a4f2ff672a9ac05" target="bookBody"><span class="txt">2.7 보고자 제외</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_a218b2e07075427b" target="bookBody"><span class="txt">3. 수시 보고서</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_9424ee5d43caeb41" target="bookBody"><span class="txt">3.1 보고 확인</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_18512466e99800be" target="bookBody"><span class="txt">3.2 보고하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_c5a83b6a51b74439" target="bookBody"><span class="txt">3.3 보고 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_4222c00801c47e8f" target="bookBody"><span class="txt">3.4 보고 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_46cb2cad5ddba1bc" target="bookBody"><span class="txt">3.5 보고 인쇄</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_978669f7d5486133" target="bookBody"><span class="txt">4. 하위 부서 보고서 조회</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_f4e6101e73d9355b" target="bookBody"><span class="txt">5. 보고서 검색</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_3ce36cf767eccd8a" target="bookBody"><span class="txt">5.1 기본검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_515d83c4b6ee59e0" target="bookBody"><span class="txt">5.2 상세검색</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_5b5d907f8e3e849f" target="bookBody"><span class="txt">6. 보고양식</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_cdc6be736985fa15" target="bookBody"><span class="txt">6.1 양식 만들기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_04835cd74da97b04" target="bookBody"><span class="txt">6.2 다른 양식 불러오기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_de022a35e59fd126" target="bookBody"><span class="txt">6.3 양식 미리보기</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html" target="bookBody"><span class="txt">설문</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_8d819cf558dee596" target="bookBody"><span class="txt">1. 설문 참여</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_86348a7b29019d4d" target="bookBody"><span class="txt">2. 설문 작성</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_eccca17e6f77dd15" target="bookBody"><span class="txt">2.1 문항 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_f23d2b640e577329" target="bookBody"><span class="txt">2.2 문항 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_9207e223936ab0fe" target="bookBody"><span class="txt">2.3 문항 복사</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_040b29bb27da36c3" target="bookBody"><span class="txt">2.4 문항 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_b0873bec72e1a82a" target="bookBody"><span class="txt">2.5 문항 순서바꾸기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_0b98a55318244e46" target="bookBody"><span class="txt">3. 설문 수정</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_b7e4dad593c6f722" target="bookBody"><span class="txt">4. 설문 상태 변경</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_2c32edc75e562045" target="bookBody"><span class="txt">5. 설문 삭제</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_b0b32e70cb6344ce" target="bookBody"><span class="txt">6. 미참여자에게 알림 보내기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_cc86a54cf4aa9890" target="bookBody"><span class="txt">7. 설문 결과 보기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_4a04402a108de99e" target="bookBody"><span class="txt">7.1 결과 요약보기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_5fd6283238f7e052" target="bookBody"><span class="txt">7.2 결과 상세보기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_1a8c2d4ba8f1a221" target="bookBody"><span class="txt">8. 설문 검색</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html" target="bookBody"><span class="txt">업무</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_32af360d5b41d768" target="bookBody"><span class="txt">1. 업무란</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_7389e26f81864c83" target="bookBody"><span class="txt">1.1 업무 종류</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_90a4cd418e991414" target="bookBody"><span class="txt">1.2 업무 등록</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_3054c77fccc53866" target="bookBody"><span class="txt">1.3 업무 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_b50a4f5906f383c1" target="bookBody"><span class="txt">1.4 업무 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_4e0ce5a582c46776" target="bookBody"><span class="txt">1.5 업무 상태 변경</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_1615e28367fedb02" target="bookBody"><span class="txt">1.6 업무 변경이력 보기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_98665548e598b459" target="bookBody"><span class="txt">2. 업무 폴더</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_89b5b0d8089b6176" target="bookBody"><span class="txt">2.1 업무 폴더 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_fa0c34e905643c26" target="bookBody"><span class="txt">2.2 업무 폴더 수정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_85f2462bf5d77257" target="bookBody"><span class="txt">2.3 업무 폴더 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_8b089249df6c4aa3" target="bookBody"><span class="txt">2.4 업무 폴더 관리</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_5596dec4d2edebb2" target="bookBody"><span class="txt">업무 폴더 순서 바꾸기</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_fe4654efb8938404" target="bookBody"><span class="txt">구분선 추가</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_7c1ebb379d30e350" target="bookBody"><span class="txt">업무 폴더 중지</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_18caaf579105459b" target="bookBody"><span class="txt">업무 폴더 삭제</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_5ca99d76e2e1cfe8" target="bookBody"><span class="txt">업무 폴더 이관</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_9a3522c9964b5e2f" target="bookBody"><span class="txt">2.5 업무 폴더 상태 변경</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_5dd7bae9316575aa" target="bookBody"><span class="txt">2.6 업무 폴더 즐겨찾기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_8e0d78cd34c3ae04" target="bookBody"><span class="txt">3. 업무 검색</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_5ac1ce1ba8720fee" target="bookBody"><span class="txt">3.1 기본검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_36f27cf758acde4b" target="bookBody"><span class="txt">3.2 상세검색</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html" target="bookBody"><span class="txt">자료실</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_35f15cf735799e65" target="bookBody"><span class="txt">1. 개인 자료실</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_4adb3ce134ae5218" target="bookBody"><span class="txt">1.1 폴더 관리</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_a26989cbbb61c723" target="bookBody"><span class="txt">폴더 추가</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_8f014215cf5d5632" target="bookBody"><span class="txt">폴더 수정</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_3cccd7c801fab2b5" target="bookBody"><span class="txt">폴더 삭제</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_23680d2d94ccad76" target="bookBody"><span class="txt">1.2 파일 업로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_036cf0e1ecdc7297" target="bookBody"><span class="txt">1.3 파일 다운로드</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_6b548a911064689a" target="bookBody"><span class="txt">1.4 폴더(파일) 이동</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_7cbb87fdca7779b7" target="bookBody"><span class="txt">1.5 폴더(파일) 복사</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_81879162267c4dff" target="bookBody"><span class="txt">1.6 메일보내기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_e38d0b90dd8d172b" target="bookBody"><span class="txt">1.7 폴더 공유</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_793ba741361b5cb1" target="bookBody"><span class="txt">2. 전사자료실</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_18f75c6273357e5c" target="bookBody"><span class="txt">3. 자료실 검색</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html" target="bookBody"><span class="txt">전자결재</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_8ef93454943015d2" target="bookBody"><span class="txt">1. 결재 요청(기안 작성)</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_49984be214b14e81" target="bookBody"><span class="txt">1.1 임시저장<label> & </label>임시저장 불러오기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_0e825bef6b3835e2" target="bookBody"><span class="txt">1.2 재 기안</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_f8248d0ab5a6af25" target="bookBody"><span class="txt">1.3 결재선 지정</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_0f4970b3f05319d1" target="bookBody"><span class="txt">1.4 결재 문서 회수(상신 취소)</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_46d06814d0ca7b53" target="bookBody"><span class="txt">1.5 참조자 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_2c26397721aaea43" target="bookBody"><span class="txt">1.6 수신처 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_dff48fed90defc68" target="bookBody"><span class="txt">1.7 자주 쓰는 양식으로 추가</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_219478e087296da1" target="bookBody"><span class="txt">2. 결재하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_5076592463c0fcf5" target="bookBody"><span class="txt">2.1 결재/합의/확인</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_5d306e0601f46bf1" target="bookBody"><span class="txt">2.2 전결</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_a6ef376eda72132e" target="bookBody"><span class="txt">2.3 대결</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_d4d726693abc78d7" target="bookBody"><span class="txt">2.4 선결재</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_88abcab01c843628" target="bookBody"><span class="txt">2.5 후열/후결</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_0127b8d316a794c8" target="bookBody"><span class="txt">2.6 결재 취소</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_62b150dcf26428e8" target="bookBody"><span class="txt">2.7 강제 반려</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_7b1efa6491af5044" target="bookBody"><span class="txt">2.8 수신 문서 처리</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_179efbea22abccbd" target="bookBody"><span class="txt">담당자 지정</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_af2d268a54e5ba8e" target="bookBody"><span class="txt">수신 문서 접수</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_98209e40f52bd82f" target="bookBody"><span class="txt">3. 결재 완료</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_1c355b8166d24076" target="bookBody"><span class="txt">3.1 공문서 발송</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_8a30af184e3ddc6d" target="bookBody"><span class="txt">3.2 부서 문서함 분류</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_3817ed35a4422300" target="bookBody"><span class="txt">3.3 문서 열람자 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_16621d4e5085f6e6" target="bookBody"><span class="txt">3.4 메일 보내기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_a392728df1afdb8d" target="bookBody"><span class="txt">3.5 게시판 게시</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_664a6e6bab77b53e" target="bookBody"><span class="txt">3.6 결재 문서 삭제</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_0ff6ef8e5bc53a9b" target="bookBody"><span class="txt">4. 결재상태 확인</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_83dbd6eb2961fd0e" target="bookBody"><span class="txt">5. 전자결재 환경설정</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_c72a68c2aa3f1e69" target="bookBody"><span class="txt">5.1 전자결재 서명관리</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_993ee64dbebc8ebb" target="bookBody"><span class="txt">5.2 전자결재 비밀번호 관리</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_d2a5dc8e2abdfe09" target="bookBody"><span class="txt">5.3 새창으로 결재 문서 작성하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_a25501b25d18b485" target="bookBody"><span class="txt">5.4 부재/위임 설정</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_6b36093e5d25e8a7" target="bookBody"><span class="txt">6. 문서함</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_dbf5213bff9f1cd0" target="bookBody"><span class="txt">6.1 개인 문서함</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_4313a6432a9855a8" target="bookBody"><span class="txt">6.2 부서 문서함</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_9ffb7a261cb2eacc" target="bookBody"><span class="txt">부서 문서함 관리</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_142ce89f406473da" target="bookBody"><span class="txt">부서 문서함 담당자 설정</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_6a7e5dd9cd36ea95" target="bookBody"><span class="txt">부서 문서함 이관</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_4204d40d28d82ffb" target="bookBody"><span class="txt">7. 양식별 문서 조회</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_daeafe884406a387" target="bookBody"><span class="txt">8. 결재문서 목록 다운로드</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_3c1e3cc1ee68fdfd" target="bookBody"><span class="txt">9. 결재문서 인쇄</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_24716c64a2d107d6" target="bookBody"><span class="txt">10. 결재문서 검색</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_efd7225b11611797" target="bookBody"><span class="txt">10.1 기본검색</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_9d66f1b72a809c31" target="bookBody"><span class="txt">10.2 상세검색</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/documents.html" target="bookBody"><span class="txt">전사문서함</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/documents.html#r_2d8938ba3a015e79" target="bookBody"><span class="txt">1. 전사 문서함이란</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/documents.html#r_2d508c98896b865a" target="bookBody"><span class="txt">2. 전사 문서함 목록</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/documents.html#r_611afeadf1496f07" target="bookBody"><span class="txt">3. 전사 문서함 관리자</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html" target="bookBody"><span class="txt">ToDO+</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_a0455676b6951c23" target="bookBody"><span class="txt">1. ToDO+ 시작하기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_e7f30cd91586be1a" target="bookBody"><span class="txt">2. 보드 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_e8421b023724857e" target="bookBody"><span class="txt">2.1 보드 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_9181f20998000837" target="bookBody"><span class="txt">2.2 보드 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_50fa5b9a1ed146ca" target="bookBody"><span class="txt">2.3 보드에서 나가기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_578f8fb936967ab4" target="bookBody"><span class="txt">2.4 보드 즐겨찾기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_64d616dd0dc21f3c" target="bookBody"><span class="txt">2.5 멤버 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_fb78883b30dae25f" target="bookBody"><span class="txt">2.6 멤버 제외</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_195cebbe75af21d0" target="bookBody"><span class="txt">2.7 운영자 권한 변경</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_e9c75c0032900090" target="bookBody"><span class="txt">3. 칼럼 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_1520ea3a13ea0f4b" target="bookBody"><span class="txt">3.1 칼럼 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_f3058a047b5f24c2" target="bookBody"><span class="txt">3.2 칼럼 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_cca5947f86576d68" target="bookBody"><span class="txt">3.3 칼럼 순서 변경</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_c578649c0ce96d87" target="bookBody"><span class="txt">4. 카드 관리</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_7110ef60e9d194c3" target="bookBody"><span class="txt">4.1 카드 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_233643aac93466be" target="bookBody"><span class="txt">4.2 카드 삭제</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_1bec0a72c2bfbf06" target="bookBody"><span class="txt">4.3 카드 이동</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_02c96fe6ed75448a" target="bookBody"><span class="txt">4.4 카드 액션</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_c50c1ca387b96289" target="bookBody"><span class="txt">담당자 지정</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_58675735780c9ca8" target="bookBody"><span class="txt">라벨</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_3fd1c594a5817bfc" target="bookBody"><span class="txt">기한일 설정</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_78ab159d4681057e" target="bookBody"><span class="txt">파일 첨부</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_085715e3852a363b" target="bookBody"><span class="txt">체크리스트</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_88aaba2052d2431e" target="bookBody"><span class="txt">5. 캘린더로 보기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_f3612717df7b98b4" target="bookBody"><span class="txt">6. 추이 그래프로 보기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_f1b10ac1a786c1ef" target="bookBody"><span class="txt">7. ToDO+ 검색</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/part_two.html" target="bookBody"><span class="txt">Part II. Mobile</span></a></p>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_getting_started.html" target="bookBody"><span class="txt">앱 시작하기</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_getting_started.html#r_ed273f0de7cb5237" target="bookBody"><span class="txt">1. 설치방법</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_getting_started.html#r_95d71ababf419e48" target="bookBody"><span class="txt">2. 앱 로그인</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_getting_started.html#r_0a634533a0cd6260" target="bookBody"><span class="txt">3. 앱 로그아웃</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html" target="bookBody"><span class="txt">앱 사용하기</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_35aeafa7eff5f6ef" target="bookBody"><span class="txt">1. 앱 화면구성</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_68045307f73017ac" target="bookBody"><span class="txt">2. 메일</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_a37708b69c4a406a" target="bookBody"><span class="txt">2.1 메일 읽기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_6ebcaa906061f528" target="bookBody"><span class="txt">2.2 메일 쓰기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_9ed10bf4ec3e2aa7" target="bookBody"><span class="txt">3. 임직원 정보</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_646bc533ca18666e" target="bookBody"><span class="txt">3.1 임직원 정보 보기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_3112229f663718fe" target="bookBody"><span class="txt">3.2 임직원 상세정보 보기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_8293af993b3cd718" target="bookBody"><span class="txt">3.3 임직원 검색하기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_5338a0154c566a07" target="bookBody"><span class="txt">4. 대화하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_eca98adb3bf1c5ab" target="bookBody"><span class="txt">4.1 1:1 대화하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_9e9e2dda7f6dd6ef" target="bookBody"><span class="txt">4.2 그룹대화하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_528b05025b5102f4" target="bookBody"><span class="txt">4.3 대화자 목록 확인하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_b6b015bee06b5a33" target="bookBody"><span class="txt">4.4 부가기능</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_56e20e67140c4a66" target="bookBody"><span class="txt">4.5 수신확인하기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_090349015e562767" target="bookBody"><span class="txt">5. 발신자 표시 기능</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_9500d83f80d2e4a6" target="bookBody"><span class="txt">6. 설정하기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_0adead197c5d7d9b" target="bookBody"><span class="txt">7. 버전 업데이트</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html" target="bookBody"><span class="txt">캘린더, 주소록 동기화하기</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html#r_813b7aa9f6f2ce6b" target="bookBody"><span class="txt">1. 아이폰 동기화 설정하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html#r_a24dcfb1dff63852" target="bookBody"><span class="txt">1.1 캘린더 동기화 설정하기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html#r_5e3587f553539e3a" target="bookBody"><span class="txt">1.2 연락처 동기화 설정하기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html#r_0b87adf940611ccd" target="bookBody"><span class="txt">2. 안드로이드 폰 동기화 설정하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html#r_b220ea707944b6b5" target="bookBody"><span class="txt">2.1 캘린더 보기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html#r_a998f0fef36451d1" target="bookBody"><span class="txt">2.2 캘린더/연락처 동기화하기</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/part_three.html" target="bookBody"><span class="txt">Part III. PC</span></a></p>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_getting_started.html" target="bookBody"><span class="txt">PC 메신저 시작하기</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_getting_started.html#r_e83db8cf53c523fc" target="bookBody"><span class="txt">1. PC 메신저 설치</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_getting_started.html#r_ae031a0f0a6ffc0d" target="bookBody"><span class="txt">2. PC 메신저 로그인</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_getting_started.html#r_0a7fd3acbb08709d" target="bookBody"><span class="txt">3. PC 메신저 기능</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html" target="bookBody"><span class="txt">PC 메신저 사용하기</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_2f236598007cf79a" target="bookBody"><span class="txt">1. PC 메신저 화면 구성</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_9a89873264477a9c" target="bookBody"><span class="txt">2. 채팅하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_cc9634a0ed3448d2" target="bookBody"><span class="txt">2.1 파일 보내기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_8a0b26beb10d00bc" target="bookBody"><span class="txt">2.2 캡처 보내기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_f374313f5966fc60" target="bookBody"><span class="txt">2.3 동료 추가</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_75b6bdadf1ad7498" target="bookBody"><span class="txt">2.4 대화내용 저장하기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_1496b32197190cec" target="bookBody"><span class="txt">3. 그룹 채팅하기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_0d10c3bb26c9a6b4" target="bookBody"><span class="txt">4. 쪽지하기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_5a7157c945a69d24" target="bookBody"><span class="txt">4.1 쪽지 쓰기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_34432bd661cef604" target="bookBody"><span class="txt">4.2 쪽지 읽기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_1d38d3cad1178671" target="bookBody"><span class="txt">4.3 쪽지 답장</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_15c1a248887f3a33" target="bookBody"><span class="txt">4.4 쪽지 전달</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_44981d887540455c" target="bookBody"><span class="txt">4.5 쪽지 삭제</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_6f3a7dbc6cdc761c" target="bookBody"><span class="txt">5. 동료 검색하기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_301b83c9f376f8a9" target="bookBody"><span class="txt">6. 동료 프로필 보기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_b893212ea0919f18" target="bookBody"><span class="txt">7. 즐겨찾기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_48350bb4062beb15" target="bookBody"><span class="txt">8. PC 메신저 설정</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html" target="bookBody"><span class="txt">부록. 조직도</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html#r_64c414ad58de1d75" target="bookBody"><span class="txt">1. 조직도란</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html#r_a8ce46135b43102b" target="bookBody"><span class="txt">2. 조직도 펼치기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html#r_e96030b48d2138e6" target="bookBody"><span class="txt">3. 프로필 보기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html#r_9a4064748833edf9" target="bookBody"><span class="txt">4. 메일 보내기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html#r_07f0f97bd8a0bf12" target="bookBody"><span class="txt">5. 일정 보기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html#r_ccc2fe5cd584b54b" target="bookBody"><span class="txt">6. 검색하기</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/import_contacts.html" target="bookBody"><span class="txt">부록. 연락처 가져오기</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/import_contacts.html#r_a10a4a6abe9f7a13" target="bookBody"><span class="txt">1. Outlook 주소록으로 CSV 파일 만들기</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/import_contacts.html#r_e31f011a06aa3ecd" target="bookBody"><span class="txt">2. Outlook Express 주소록으로 CSV 파일 만들기</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html" target="bookBody"><span class="txt">부록. 연락처 내보내기</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html#r_1758ca5e450be375" target="bookBody"><span class="txt">1. 연락처 내보내기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html#r_f79cedc5a5846d0b" target="bookBody"><span class="txt">1.1 Outlook 형식으로 내보내기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html#r_7b2d23b928a4d49f" target="bookBody"><span class="txt">1.2 Outlook Express 형식으로 내보내기</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html#r_66a1a36986ae7d98" target="bookBody"><span class="txt">2. 연락처 가져오기</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html#r_401e34eeb13a1dd9" target="bookBody"><span class="txt">2.1 Outlook에 주소록 가져오기</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html#r_13367598b172e601" target="bookBody"><span class="txt">2.2 Outlook Express에 주소록 가져오기</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
	</ul>
</div></body></html>

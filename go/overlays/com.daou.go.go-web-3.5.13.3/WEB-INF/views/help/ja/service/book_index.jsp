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
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html" target="bookBody"><span class="txt">始めに</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html#r_b4446483e51634e7" target="bookBody"><span class="txt">${brandName}とは?</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html#r_07953ee833ad7d03" target="bookBody"><span class="txt">主な機能</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html#r_c8f9b5db775b1082" target="bookBody"><span class="txt">メール</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html#r_e58da730f4d7ecfd" target="bookBody"><span class="txt">Webフォルダ</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html#r_0125ab60b286e035" target="bookBody"><span class="txt">アドレス帳</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/front_matter_01.html#r_2efe5a47dc4ef976" target="bookBody"><span class="txt">カレンダー</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/part_one.html" target="bookBody"><span class="txt">Web</span></a></p>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html" target="bookBody"><span class="txt">ログイン/ログアウト</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_3785658f196c46ea" target="bookBody"><span class="txt">1 ログイン</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_a59d22772053131f" target="bookBody"><span class="txt">2 ログアウト</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_88fa0b9b73dc8169" target="bookBody"><span class="txt">3 個人情報（プロフィール）の変更</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_f752104e1aff237d" target="bookBody"><span class="txt">3.1 基本情報変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_ae88e762681fef65" target="bookBody"><span class="txt">3.2 パスワード変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_ae88e762681fef65" target="bookBody"><span class="txt">3.3 外部メールアドレス登録</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/connect.html#r_9cba10e224eb88f8" target="bookBody"><span class="txt">3.4 環境設定</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html" target="bookBody"><span class="txt">ホーム</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_957c838a092110de" target="bookBody"><span class="txt">1 ダッシュボードとは</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_e0198ffaeb668917" target="bookBody"><span class="txt">2 ダッシュボード管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_6f8394ebe3dc4f4d" target="bookBody"><span class="txt">2.1 ダッシュボード追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_f394438c10734dd6" target="bookBody"><span class="txt">2.2 ダッシュボード編集</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_440eaf372f1f28ec" target="bookBody"><span class="txt">2.3 ダッシュボード削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_eb70204614a80e25" target="bookBody"><span class="txt">2.4 レイアウト設定</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_46e778f14fc5993e" target="bookBody"><span class="txt">3 ダッシュボード設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_5cf9f767154f3591" target="bookBody"><span class="txt">3.1 ガジェットの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_da3af9b865b6a912" target="bookBody"><span class="txt">3.2 ガジェットの削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_6a00a7cb5ca54b57" target="bookBody"><span class="txt">3.3 ガジェットの設定変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_5399ac3da5863098" target="bookBody"><span class="txt">3.4 ガジェットの順番入替え</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/home.html#r_4723264d971abb65" target="bookBody"><span class="txt">4 統合検索</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html" target="bookBody"><span class="txt">メール</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_472d24610ad3fda4" target="bookBody"><span class="txt">1 メール確認</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_eeb804c9bae8ebbb" target="bookBody"><span class="txt">1.1 メール内容の確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_599de614c9015bcb" target="bookBody"><span class="txt">1.2 メール内容の構成</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_d906988852afa41e" target="bookBody"><span class="txt">1.3 メールの返信</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_a7175028b48d2164" target="bookBody"><span class="txt">1.4 メールの転送</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_df0001f8a9515246" target="bookBody"><span class="txt">1.5 メールの移動</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_7bd37ad6000bd8ee" target="bookBody"><span class="txt">1.6 メールのコピー</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_53cbe07ab714a38b" target="bookBody"><span class="txt">1.7 メールの削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_522f27cfb9fd112b" target="bookBody"><span class="txt">1.8 メールの未読/既読</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_cd68dc8d3b15d146" target="bookBody"><span class="txt">1.9 メールの保存</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_11b47bc9a7a4d669" target="bookBody"><span class="txt">1.10 メールの印刷</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_e91a61ee8a7eeedf" target="bookBody"><span class="txt">1.11 メールの自動振り分け</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_168a804650d392d3" target="bookBody"><span class="txt">1.12 メールのスパム申告</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_198b827b2477b30d" target="bookBody"><span class="txt">1.13 メールの受信遮断</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_75c522c1500f9bc3" target="bookBody"><span class="txt">1.14 メールの受信許可</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_c83e296bf305ad1c" target="bookBody"><span class="txt">1.15 メールのアップロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_5df86880871d9209" target="bookBody"><span class="txt">1.16 予定登録</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_5fa5c7a2c8c17d21" target="bookBody"><span class="txt">1.17 アーカイブセンタ</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_44dfa348456c8feb" target="bookBody"><span class="txt">2 メール作成</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_0185d636f40e09e4" target="bookBody"><span class="txt">2.1 受信者の指定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_c9cfae9d46a8b87a" target="bookBody"><span class="txt">2.2 ファイルの添付</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_73094da23d7dd642" target="bookBody"><span class="txt">ファイルの添付方式</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_6c19c840dfb6b41b" target="bookBody"><span class="txt">ファイルの添付方法</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_6cdada90eade0ff2" target="bookBody"><span class="txt">2.3 本文の作成</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_c871005c7f09b615" target="bookBody"><span class="txt">2.4 オプション設定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_0153b8579c7f1e14" target="bookBody"><span class="txt">2.5 プレビュー / 下書き</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_f319292931bdb9e9" target="bookBody"><span class="txt">2.6 開封確認 / 送信キャンセル</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_b0e4e4f43e23835c" target="bookBody"><span class="txt">2.7 再送信</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_ab8b9feda70c7b15" target="bookBody"><span class="txt">2.8 受信先リストのアップロード</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_4b09dee17b294f68" target="bookBody"><span class="txt">3 メール検索</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_893825cd7c4cc11b" target="bookBody"><span class="txt">3.1 メール分類</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_68b4a68d8e0d3486" target="bookBody"><span class="txt">3.2 基本検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_ef37775eacec5d8e" target="bookBody"><span class="txt">3.3 詳細検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_e86731899d6dcdb7" target="bookBody"><span class="txt">3.4 検索条件</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_cf2a6b9d716bc82b" target="bookBody"><span class="txt">検索条件の保存</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_b7841747fad5d3ef" target="bookBody"><span class="txt">保存した検索条件の使用</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_9b530d238662f135" target="bookBody"><span class="txt">検索条件の削除</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_0098e30ba18d623d" target="bookBody"><span class="txt">4 お気に入り</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_dc31fae053266273" target="bookBody"><span class="txt">4.1 お気に入りに追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_2fb38c9c8c42cba5" target="bookBody"><span class="txt">4.2 お気に入りから削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_21f943889578a110" target="bookBody"><span class="txt">4.3 お気に入りの並べ替え</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_0faff26d834cd393" target="bookBody"><span class="txt">5 タグ</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_9fddff67654adebf" target="bookBody"><span class="txt">5.1 タグの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_1458d5a5e807cc87" target="bookBody"><span class="txt">5.2 タグの変更/削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_0cf2950f8894fff6" target="bookBody"><span class="txt">5.3 タグの指定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_6393cba72c95da36" target="bookBody"><span class="txt">5.4 タグの解除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_ff785ee72407a649" target="bookBody"><span class="txt">5.5 タグ付きメールの確認</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_ee11207ef3fdb5ba" target="bookBody"><span class="txt">6 メールフォルダ管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_f83de69b6f8a6962" target="bookBody"><span class="txt">6.1 フォルダの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_6cf506cf3e50b4ea" target="bookBody"><span class="txt">6.2 下位フォルダの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_5b2bc8c3c42898c7" target="bookBody"><span class="txt">6.3 フォルダ名の変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_91e29a8d5049ad93" target="bookBody"><span class="txt">6.4 フォルダ移動</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_d0260a6176adeb02" target="bookBody"><span class="txt">6.5 フォルダの削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_ee228f064e800147" target="bookBody"><span class="txt">6.6 フォルダの共有</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_8425af633126a997" target="bookBody"><span class="txt">6.7 フォルダを空にする</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_5675897d914763e0" target="bookBody"><span class="txt">7 外部メールの取込</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_8fc89cd311719cfd" target="bookBody"><span class="txt">8 メール環境設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_899709606a9447f1" target="bookBody"><span class="txt">8.1 基本環境</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_21f0cc9687f22144" target="bookBody"><span class="txt">8.2 署名管理</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_04fa36565ce0cc44" target="bookBody"><span class="txt">8.3 フォルダ</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_53949a888d59e3d0" target="bookBody"><span class="txt">基本フォルダの管理</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_22154802be03414c" target="bookBody"><span class="txt">個人フォルダの管理</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_9f8e172b066eed7a" target="bookBody"><span class="txt">個人フォルダの追加</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_85933abe66e420d8" target="bookBody"><span class="txt">個人フォルダの削除</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_6ac3717a7ab191d6" target="bookBody"><span class="txt">フォルダ移動</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_b11770ae572e0111" target="bookBody"><span class="txt">個人フォルダの共有</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_d1e0a3386f6c3183" target="bookBody"><span class="txt">個人フォルダの保存期間設定</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_c7a1d664c7a49131" target="bookBody"><span class="txt">メールのアップロード</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_db2a59b2c32efa9c" target="bookBody"><span class="txt">バックアップ</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_45b9fa391ccb631a" target="bookBody"><span class="txt">空にする</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_6fcf39c4f625370b" target="bookBody"><span class="txt">タグ</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_1bac7bd98911925a" target="bookBody"><span class="txt">8.4 スパムメール</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_59d3c07378bba77c" target="bookBody"><span class="txt">受信許可リストに追加</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_16e1b446c0e09dd6" target="bookBody"><span class="txt">受信遮断リストに追加</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_4a2d050dd14bce96" target="bookBody"><span class="txt">8.5 自動振り分け</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_0e53530e3b22e634" target="bookBody"><span class="txt">8.6 自動転送</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_178508cf44eccbea" target="bookBody"><span class="txt">8.7 不在通知</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_c933a23582bbeadb" target="bookBody"><span class="txt">8.8 外部メール</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/mail.html#r_4f9c687eed32d124" target="bookBody"><span class="txt">8.9 直近送信先</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html" target="bookBody"><span class="txt">アドレス帳</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_7c23817428ae298e" target="bookBody"><span class="txt">1 グループ管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_c3756c67b78013e0" target="bookBody"><span class="txt">1.1 グループの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_4ebd8faa030ec5cb" target="bookBody"><span class="txt">1.2 グループ名の変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_96c10efbe7ca7c19" target="bookBody"><span class="txt">1.3 グループの削除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_cecfd71758fa5fdc" target="bookBody"><span class="txt">2 連絡先管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_82f18bd796770a74" target="bookBody"><span class="txt">2.1 連絡先の追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_16ead92782d26ac7" target="bookBody"><span class="txt">2.2 連絡先の変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_4ec987b39c8b5c3b" target="bookBody"><span class="txt">2.3 連絡先の削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_05e2e996700c7269" target="bookBody"><span class="txt">2.4 連絡先グループ指定/グループ解除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_bb259b74277aef7a" target="bookBody"><span class="txt">3 インポート/エクスポート</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_a97faf71e4a6a7d1" target="bookBody"><span class="txt">3.1 アドレス帳のインポート</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_8a6a0ede1f26a2bf" target="bookBody"><span class="txt">CSV ファイルインポート</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_af080b58cfaef872" target="bookBody"><span class="txt">組織図情報インポート</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_c842333df18a403e" target="bookBody"><span class="txt">3.2 アドレス帳のエクスポート</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_7fc38332711d5c1f" target="bookBody"><span class="txt">4 印刷</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_0ebb9a99794eda51" target="bookBody"><span class="txt">5 検索</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_60422925527df3fd" target="bookBody"><span class="txt">5.1 基本検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_dd39217fd8aee1d7" target="bookBody"><span class="txt">5.2 詳細検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_7ce2ab6a4568c053" target="bookBody"><span class="txt">6 グループにメール送信</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/contacts.html#r_677b78479f7b886d" target="bookBody"><span class="txt">7 共有アドレス帳</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html" target="bookBody"><span class="txt">カレンダー</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_170b5d22c41a3263" target="bookBody"><span class="txt">1 マイカレンダー管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_c85c9cd605b8e4ab" target="bookBody"><span class="txt">1.1 カレンダー追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_a2f2c4ed20e2cd2d" target="bookBody"><span class="txt">1.2 カレンダー削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_5da5af97b83afd82" target="bookBody"><span class="txt">1.3 カレンダーの名前変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_78b162aecb5b7f1f" target="bookBody"><span class="txt">1.4 カレンダー順番変更</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_93c09cc5f7908563" target="bookBody"><span class="txt">2 予定登録</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_555deb067623afad" target="bookBody"><span class="txt">2.1 繰り返し予定の登録</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_a7a28076741149b9" target="bookBody"><span class="txt">2.2 参加者の追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_5ec0137286be2f1b" target="bookBody"><span class="txt">2.3 予定の通知</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_055a31660ad89e3d" target="bookBody"><span class="txt">2.4 設備の予約</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_d6f2a58b6a7a7105" target="bookBody"><span class="txt">2.5 予定の変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_20c117fa85b86b9f" target="bookBody"><span class="txt">2.6 予定の削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_f7caa2883f6424e4" target="bookBody"><span class="txt">2.7 参加者から削除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_c3e900007da44320" target="bookBody"><span class="txt">3 予定確認</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_69f459d0c00bd968" target="bookBody"><span class="txt">3.1 コメント</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_214b9b1e6c3e2b1e" target="bookBody"><span class="txt">3.2 変更履歴確認</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_ee27b947aa556acf" target="bookBody"><span class="txt">4 組織図から予定確認</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_6a33c43a0804133d" target="bookBody"><span class="txt">5 関心カレンダー</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_590c0881522656ac" target="bookBody"><span class="txt">5.1 関心カレンダー追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_e1d29ea7a8b80b56" target="bookBody"><span class="txt">5.2 関心カレンダー削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_d4b732d41d21c4af" target="bookBody"><span class="txt">5.3 関心メンバー申請のキャンセル</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_28b74f82cb03f2de" target="bookBody"><span class="txt">5.4 関心カレンダー申請の承諾</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_db442e31751a0180" target="bookBody"><span class="txt">5.5 マイ予定を確認するメンバーを確認</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_7210698e52ed29d9" target="bookBody"><span class="txt">6 カレンダー環境設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_8ba322b7b9c5c8f5" target="bookBody"><span class="txt">6.1 カレンダー追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_4f46a9a49fd2cc07" target="bookBody"><span class="txt">6.2 カレンダー削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_122c56daed5b6ba1" target="bookBody"><span class="txt">6.3 カレンダー名変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_fe6643ae1b04816e" target="bookBody"><span class="txt">6.4 カレンダー順番入替え</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_ddb31c27c5573b67" target="bookBody"><span class="txt">6.5 カレンダー公開設定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_d576cf9ff0ea8bdb" target="bookBody"><span class="txt">6.6 基本カレンダー設定</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_0259b9881a222de8" target="bookBody"><span class="txt">7 予定検索</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_3a1276ae5d4cec5d" target="bookBody"><span class="txt">7.1 基本検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_21cb9084798ffec2" target="bookBody"><span class="txt">7.2 詳細検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/calendar.html#r_f358f3b97f90d898" target="bookBody"><span class="txt">8 全体予定の登録</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html" target="bookBody"><span class="txt">掲示板</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_aa48b0465fa3172f" target="bookBody"><span class="txt">1 掲示板とは</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_6adee83c5e14137a" target="bookBody"><span class="txt">2 部署掲示板の作成</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_e17bb3277c58912e" target="bookBody"><span class="txt">3 部署掲示板の設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_7b0014f579c9edd7" target="bookBody"><span class="txt">3.1 掲示板の共有</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_811c8bda806d61fb" target="bookBody"><span class="txt">3.2 非公開掲示板の作成</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_5ac364ba328b3965" target="bookBody"><span class="txt">3.3 タグの設定</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_a7ff01f32bf4111f" target="bookBody"><span class="txt">4 部署掲示板管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_c62e3fc017aeb160" target="bookBody"><span class="txt">4.1 掲示板順序の並び替え</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_58f0c798497fc3b8" target="bookBody"><span class="txt">4.2 区分線の追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_b6a5a59dd3758883" target="bookBody"><span class="txt">4.3 掲示板中止</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_976ab8c7b4737901" target="bookBody"><span class="txt">4.4 掲示板削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_cb38bb57736b959e" target="bookBody"><span class="txt">4.5 掲示板移動</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_88da9889b0ccbb74" target="bookBody"><span class="txt">5 お気に入り</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_8ceba05533928557" target="bookBody"><span class="txt">6 投稿の確認</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_a52888c10a15da25" target="bookBody"><span class="txt">6.1 クラシック型掲示板の投稿確認</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_e9708204984e75ec" target="bookBody"><span class="txt">照会メンバーの確認</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_788173e1b99e28a9" target="bookBody"><span class="txt">プラスメンバーの確認</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_ede2a6246721c176" target="bookBody"><span class="txt">投稿をメールで送信</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_8987f47b9ea959e1" target="bookBody"><span class="txt">投稿の削除</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_c2b256620698b36a" target="bookBody"><span class="txt">投稿の移動</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_5f1d4a0d9af07382" target="bookBody"><span class="txt">投稿のコピー</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_dae4c2f9856bd7b8" target="bookBody"><span class="txt">6.2 フィード型掲示板のトーク確認</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_842eef754ec12a9a" target="bookBody"><span class="txt">プラスメンバーの確認</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_d9ac3bc9007f78d3" target="bookBody"><span class="txt">トークをメールで送信</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_8a791001a59482c8" target="bookBody"><span class="txt">トークの並べ替え</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_6e5445fc0bfac8ba" target="bookBody"><span class="txt">トークの削除</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_76c95b3eacf3dbc2" target="bookBody"><span class="txt">6.3 メール受信の設定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_3388e64957daaa60" target="bookBody"><span class="txt">6.4 公開/共有状況の確認</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_325180ae5739f32d" target="bookBody"><span class="txt">7 投稿する</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_4ae7dc1b2b50cc91" target="bookBody"><span class="txt">7.1 クラシック型掲示板の投稿</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_62cac3e1608bfed2" target="bookBody"><span class="txt">非公開で作成</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_2cfe6b9f8eb6004e" target="bookBody"><span class="txt">一時保存</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_95c049c1bae5b5e2" target="bookBody"><span class="txt">お知らせに登録</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_156051a96c6766a1" target="bookBody"><span class="txt">部署員に通知する</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_f6e1970b01b33502" target="bookBody"><span class="txt">7.2 フィード型掲示板のトーク</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_75b0e43fd5120640" target="bookBody"><span class="txt">ファイル等の添付</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_cd51b0361b95e89e" target="bookBody"><span class="txt">部署員に通知</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_3baea943ac6e6bff" target="bookBody"><span class="txt">8 投稿の検索</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_019cbf2fd2878d49" target="bookBody"><span class="txt">8.1 基本検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/boards.html#r_7314875ba1df57d3" target="bookBody"><span class="txt">8.2 詳細検索</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html" target="bookBody"><span class="txt">コミュニティ</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_2076ddecdaf7c8d1" target="bookBody"><span class="txt">1 コミュニティを開設</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_d760352d9ac9cc77" target="bookBody"><span class="txt">2 コミュニティの開設</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_87c0e4c419d3bbe8" target="bookBody"><span class="txt">3 コミュニティに招待</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_87d01ac789d37966" target="bookBody"><span class="txt">4 コミュニティへの参加申請</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_3aca234fd03228d8" target="bookBody"><span class="txt">5 コミュニティから退会</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_8e0d0a554a54253d" target="bookBody"><span class="txt">6 コミュニティの管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_907ad3b6c9f26ce7" target="bookBody"><span class="txt">6.1 コミュニティ情報の変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_22f1236ea795e0bb" target="bookBody"><span class="txt">6.2 コミュニティの閉鎖</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_2c48a883e9fd6efd" target="bookBody"><span class="txt">6.3 コミュニティのメンバーを確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_496d9ba3b0216049" target="bookBody"><span class="txt">6.4 コミュニティメンバーにメールを送信</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_8f10157a52bdf584" target="bookBody"><span class="txt">6.5 参加を承認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_28fd0585143ec9ff" target="bookBody"><span class="txt">6.6 コミュニティの掲示板管理</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_95f87ac8b6564715" target="bookBody"><span class="txt">掲示板順序を変更</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_f020c606d8e31d3a" target="bookBody"><span class="txt">区分線を追加</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_8c9b92eb8e5f5d5f" target="bookBody"><span class="txt">6.7 掲示板中止</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_00db4e3b6ccafa92" target="bookBody"><span class="txt">6.8 掲示板削除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_c51c74e60a315a45" target="bookBody"><span class="txt">7 コミュニティの利用</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_a00865510711d246" target="bookBody"><span class="txt">7.1 掲示板を作成</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_e560d0bd52ff9073" target="bookBody"><span class="txt">7.2 掲示板を管理</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_c76450abfc20a7e8" target="bookBody"><span class="txt">非公開掲示板を作成</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_8ccc1372ccfff3e3" target="bookBody"><span class="txt">タグを設定</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_9c8031d0f2b70eb0" target="bookBody"><span class="txt">7.3 投稿を確認</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_b5afd7668cd1ab48" target="bookBody"><span class="txt">クラシック型掲示板の投稿確認</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_5baab43412866c07" target="bookBody"><span class="txt">照会メンバーを確認</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_44300e7a628e0904" target="bookBody"><span class="txt">プラスメンバーを確認</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_e10c268c7758158f" target="bookBody"><span class="txt">投稿の削除</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_cb929f83290e395f" target="bookBody"><span class="txt">投稿の移動</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_68a1f5538fe47254" target="bookBody"><span class="txt">投稿のコピー</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_3e0e3e29ddcd8651" target="bookBody"><span class="txt">フィード型掲示板の投稿確認</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_c20a193d4939d9ab" target="bookBody"><span class="txt">プラスメンバーを確認</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_70abdedc6d70d46c" target="bookBody"><span class="txt">表示の並べ替え</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_8ec81710cdf3dbce" target="bookBody"><span class="txt">投稿を削除</span></a></p>
										</li>
									</ul>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_042f42dd76f7a8c6" target="bookBody"><span class="txt">7.4 メール受信の設定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_2d8dce2233db245c" target="bookBody"><span class="txt">7.5 投稿の作成</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_6c0de54cc0225631" target="bookBody"><span class="txt">クラシック型掲示板の作成</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_243e4d822fcfb133" target="bookBody"><span class="txt">非公開で作成</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_69f0166a32623a77" target="bookBody"><span class="txt">一時保存</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_5fc5fbd3ce14475c" target="bookBody"><span class="txt">お知らせに登録</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_5d4e57f26b413343" target="bookBody"><span class="txt">メンバーに通知する</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_463e6318b49c6bd8" target="bookBody"><span class="txt">フィード型掲示板の作成</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_74ce6fffa8033824" target="bookBody"><span class="txt">ファイル等を添付</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_5c421c6de1129eed" target="bookBody"><span class="txt">メンバーに通知する</span></a></p>
										</li>
									</ul>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_eccd3913f6d24a06" target="bookBody"><span class="txt">8 コミュニティの検索</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_e596172c8ee2aaf3" target="bookBody"><span class="txt">8.1 基本検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/communities.html#r_3e6c76bc0397ae9e" target="bookBody"><span class="txt">8.2 詳細検索</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html" target="bookBody"><span class="txt">予約</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_e23862ee01919eb8" target="bookBody"><span class="txt">1 マイ予約/貸出状況</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_b037cffbe0586458" target="bookBody"><span class="txt">2 設備(備品)の予約/貸出</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_1be3cc6093f4efe5" target="bookBody"><span class="txt">2.1 設備の予約</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_6d5cda73e6e0963a" target="bookBody"><span class="txt">2.2 備品の貸出</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_a82f5bf3ee98d627" target="bookBody"><span class="txt">3 設備予約のキャンセル</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_802ca5ab1c5e62e6" target="bookBody"><span class="txt">4 備品の返却</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_6ecd5465e0469ab8" target="bookBody"><span class="txt">5 設備(備品)の検索</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_579eef91ee9809e6" target="bookBody"><span class="txt">6 設備(備品)の設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_f22ea716f729af47" target="bookBody"><span class="txt">6.1 利用案内</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_2bc4cbf3b7757f8b" target="bookBody"><span class="txt">6.2 設備情報管理</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_a90ab6f5262bbb5b" target="bookBody"><span class="txt">6.3 設備管理</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/reserve.html#r_f436e9163ab896c3" target="bookBody"><span class="txt">6.4 利用情報</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html" target="bookBody"><span class="txt">レポート</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_09012befab3c54eb" target="bookBody"><span class="txt">1 レポート</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_3a1546b89f6e0163" target="bookBody"><span class="txt">1.1 レポート追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_cdcde0303ec6ae20" target="bookBody"><span class="txt">1.2 レポート修正</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_2efbc411d78f9024" target="bookBody"><span class="txt">1.3 レポート管理</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_beb1273e4265f01b" target="bookBody"><span class="txt">レポート順番変更</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_065bc0050a30a5a7" target="bookBody"><span class="txt">区分線追加</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_4fac74453429bf43" target="bookBody"><span class="txt">レポート中止</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_48169914d0a3e757" target="bookBody"><span class="txt">レポート削除</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_cdbb3a92ac1191eb" target="bookBody"><span class="txt">レポート移管</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_fffb2ef620ff0e58" target="bookBody"><span class="txt">1.4 レポート状態変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_6fd6095e97187469" target="bookBody"><span class="txt">1.5 レポートお気に入り</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_983ad00bfb751952" target="bookBody"><span class="txt">2 定期レポート</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_bd76da3efc345c1f" target="bookBody"><span class="txt">2.1 レポート確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_c5f27301c857fec1" target="bookBody"><span class="txt">2.2 レポート</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_f4e28bdeab45d6a8" target="bookBody"><span class="txt">2.3 レポート修正</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_897c622d03f4fe26" target="bookBody"><span class="txt">2.4 変更履歴確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_7ca4c2a541d8f398" target="bookBody"><span class="txt">2.5 レポート削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_28cd0e1db7ba6086" target="bookBody"><span class="txt">2.6 レポート印刷</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_b04a08142d941fc3" target="bookBody"><span class="txt">2.7 報告者除外</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_db0a58622dd34cf6" target="bookBody"><span class="txt">3 不定期レポート</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_7d16c895a07d7b11" target="bookBody"><span class="txt">3.1 レポート確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_8d2f247357ba7652" target="bookBody"><span class="txt">3.2 レポート</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_e5c2b995b0447bd7" target="bookBody"><span class="txt">3.3 レポート修正</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_a7e39feaf218a14e" target="bookBody"><span class="txt">3.4 レポート削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_0964300e1c40a9a6" target="bookBody"><span class="txt">3.5 レポート印刷</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_bcea2a7a5b40d814" target="bookBody"><span class="txt">4 下位部署レポート照会</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_397a6284bf9754f3" target="bookBody"><span class="txt">5 レポート検索</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_8d436e774f835a9f" target="bookBody"><span class="txt">5.1 基本検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_1cb805364683655a" target="bookBody"><span class="txt">5.2 詳細検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_adec7c4edeb1647f" target="bookBody"><span class="txt">6 レポート書式</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_e7d39b83a32d02dd" target="bookBody"><span class="txt">6.1 書式作成</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_ddfe9adeaafd1b4f" target="bookBody"><span class="txt">6.2 他の書式をインポート</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/report.html#r_7e3e59f217b380f8" target="bookBody"><span class="txt">6.3 書式プレビュー</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html" target="bookBody"><span class="txt">アンケート</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_e6c63d014234c785" target="bookBody"><span class="txt">1 アンケートへの参加</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_e841a287501e1d60" target="bookBody"><span class="txt">2 アンケートの作成</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_390e7a5fcb633bdf" target="bookBody"><span class="txt">2.1 質問の追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_1745dfd867073234" target="bookBody"><span class="txt">2.2 質問の変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_31901d00de74eced" target="bookBody"><span class="txt">2.3 質問のコピー</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_6d171d047d683256" target="bookBody"><span class="txt">2.4 質問の削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_a3072de900641717" target="bookBody"><span class="txt">2.5 質問の順番入替え</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_c6a3d6095833b197" target="bookBody"><span class="txt">3 アンケートの変更</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_a41f4e9a7c35af71" target="bookBody"><span class="txt">4 アンケート状態の変更</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_22ede9ed3c0e2afe" target="bookBody"><span class="txt">5 アンケートの削除</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_aff89a31b943220e" target="bookBody"><span class="txt">6 対象者に通知</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_cf7ba3ec98faf499" target="bookBody"><span class="txt">7 アンケートの結果確認</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_cdb18ed1133a5ee5" target="bookBody"><span class="txt">7.1 サマリーの確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_1b059e523ee5a6a4" target="bookBody"><span class="txt">7.2 詳細内容の確認</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/survey.html#r_45d771f0a58c0ab0" target="bookBody"><span class="txt">8 アンケートの検索</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html" target="bookBody"><span class="txt">タスク</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_986422d974ff7964" target="bookBody"><span class="txt">1 タスクとは</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_c24768e4b107ef97" target="bookBody"><span class="txt">1.1 タスク種類</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_cdba1512409a2ea7" target="bookBody"><span class="txt">1.2 タスク登録</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_80235eb660a2dc62" target="bookBody"><span class="txt">1.3 タスク削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_5f597de206ecf2d8" target="bookBody"><span class="txt">1.4 タスクダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_fa52d6b4ca79d7eb" target="bookBody"><span class="txt">1.5 タスク状態変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_bae98c8283ea9298" target="bookBody"><span class="txt">1.6 タスク開始</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_68dd4b6437343354" target="bookBody"><span class="txt">1.7 タスク変更履歴確認</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_3ebe6ba9ae3d86c1" target="bookBody"><span class="txt">2 タスクフォルダ</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_d57b963800db506e" target="bookBody"><span class="txt">2.1 タスクフォルダ追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_450638255ac99b07" target="bookBody"><span class="txt">2.2 タスクフォルダ修正</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_f2eda46a0ae3d1c6" target="bookBody"><span class="txt">2.3 タスクフォルダ削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_fae83e4302c3710b" target="bookBody"><span class="txt">2.4 タスクフォルダ管理</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_ed739ac9ee850605" target="bookBody"><span class="txt">タスクフォルダ順番入替え</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_dd62ecece353d5f9" target="bookBody"><span class="txt">区分線追加</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_5ac98238ced67ecb" target="bookBody"><span class="txt">タスクフォルダ中止</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_f60ad3ab85311da2" target="bookBody"><span class="txt">タスクフォルダ削除</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_d6eda988753d1ab5" target="bookBody"><span class="txt">タスクフォルダ移管</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_0dfbb4ae198ffe8d" target="bookBody"><span class="txt">2.5 タスクフォルダ状態変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_04115abf02b51789" target="bookBody"><span class="txt">2.6 タスクフォルダのお気に入り</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_0e1fe86fab7731d6" target="bookBody"><span class="txt">3 タスク検索</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_0eb6664c74052534" target="bookBody"><span class="txt">3.1 基本検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/task.html#r_53e2eb79dcfbe0c5" target="bookBody"><span class="txt">3.2 詳細検索</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html" target="bookBody"><span class="txt">Webフォルダ</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_b279b4c37ab5fb4e" target="bookBody"><span class="txt">1 個人Webフォルダ</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_7cf625a8317ca66c" target="bookBody"><span class="txt">1.1 フォルダの管理</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_85041d75342a6413" target="bookBody"><span class="txt">フォルダの追加</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_93460e83e6f259c4" target="bookBody"><span class="txt">フォルダの変更</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_335876e8e448fcf0" target="bookBody"><span class="txt">フォルダの削除</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_0669fe449a467ec8" target="bookBody"><span class="txt">1.2 ファイルのアップロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_93e8a0df5133f962" target="bookBody"><span class="txt">1.3 ファイルのダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_80e0aa6a62db745b" target="bookBody"><span class="txt">1.4 フォルダ（ファイル）の移動</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_0e8777eae94e21e0" target="bookBody"><span class="txt">1.5 フォルダ（ファイル）をコピー</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_90f79514e2cf1deb" target="bookBody"><span class="txt">1.6 ファイルのメール送信</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_faadc5fb8a38598f" target="bookBody"><span class="txt">1.7 フォルダの共有</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_d2cde815c04627a6" target="bookBody"><span class="txt">2 パブリックフォルダ</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/storage.html#r_9b7ad347737220d2" target="bookBody"><span class="txt">3 Webフォルダの検索</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html" target="bookBody"><span class="txt">ワークフロー</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_5c10203df6147303" target="bookBody"><span class="txt">1 決裁要請(起案作成)</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_1d0b458839aeb69e" target="bookBody"><span class="txt">1.1 一時保存 <label> & </label> 一時保存を開く</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_22266c3b35c54429" target="bookBody"><span class="txt">1.2 再起案</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_02e6a1c49ddb5794" target="bookBody"><span class="txt">1.3 決裁ルート指定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_094f47b2af260a27" target="bookBody"><span class="txt">1.4 決裁文書回数(上申取消)</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_acad1ccead90e6de" target="bookBody"><span class="txt">1.5 参照者追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_3dcf6a328cdf75e0" target="bookBody"><span class="txt">1.6 宛先追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_5e737a829f1cb0c2" target="bookBody"><span class="txt">1.7 よく使うフォームに追加</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_8099943f8c68badb" target="bookBody"><span class="txt">2 決裁</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_312679c730ad859d" target="bookBody"><span class="txt">2.1 決裁/合議/確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_1ca638d69ee58b2c" target="bookBody"><span class="txt">2.2 専決</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_a0fef2a6aa465560" target="bookBody"><span class="txt">2.3 代決</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_6a144862a2a07733" target="bookBody"><span class="txt">2.4 先決裁</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_41977334b6d120d8" target="bookBody"><span class="txt">2.5 後列/後決</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_0e382415c29cee24" target="bookBody"><span class="txt">2.6 決裁取消</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_108c6686f1398425" target="bookBody"><span class="txt">2.7 強制却下</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_f8b5c3a7ba429bb4" target="bookBody"><span class="txt">2.8 受信文書処理</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_0eec1fc8ceba0ce5" target="bookBody"><span class="txt">担当者指定</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_307f521e3f1ceca3" target="bookBody"><span class="txt">受信文書受付</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_16136ea869c3adc6" target="bookBody"><span class="txt">3 決裁完了</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_9a0e8560be5411d1" target="bookBody"><span class="txt">3.1 公文書送信</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_798aad26f8253285" target="bookBody"><span class="txt">3.2 部署文書箱分類</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_41c2613a0d8ba865" target="bookBody"><span class="txt">3.3 文書分類追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_ed075cb53837152e" target="bookBody"><span class="txt">3.4 メール送信</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_ea84bc0891d363be" target="bookBody"><span class="txt">3.5 掲示板投稿</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_0a42fcc173d81b18" target="bookBody"><span class="txt">3.6 決裁文書削除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_9f849a181f6dff60" target="bookBody"><span class="txt">4 決裁状態確認</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_21fb68ab0d58293d" target="bookBody"><span class="txt">5 ワークフロー環境設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_a3ca9466ce411ca3" target="bookBody"><span class="txt">5.1 ワークフロー署名管理</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_4224d78ca4f22248" target="bookBody"><span class="txt">5.2 ワークフローパスワード管理</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_3663924a3b4d126f" target="bookBody"><span class="txt">5.3 新しいウィンドウで決裁文書作成</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_b8f9ff0d04728c41" target="bookBody"><span class="txt">5.4 不在/委任設定</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_f2503228376c427b" target="bookBody"><span class="txt">6 文書箱</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_8404e197097df2fb" target="bookBody"><span class="txt">6.1 個人文書箱</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_3773014827a2e757" target="bookBody"><span class="txt">6.2 部署文書箱</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_3bc1f973ae073dbb" target="bookBody"><span class="txt">部署文書箱管理</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_2398caf912ee90ff" target="bookBody"><span class="txt">部署文書箱管理者設定</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_a2921baf7c84551e" target="bookBody"><span class="txt">部署文書箱移管</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_5f7c6b05bb74d459" target="bookBody"><span class="txt">7 フォーム別文書参照</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_1e5ed6778b34872f" target="bookBody"><span class="txt">8 決裁文書リストダウンロード</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_3ace0c0feb968d8b" target="bookBody"><span class="txt">9 決裁文書印刷</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_cc646e4554824485" target="bookBody"><span class="txt">10 決裁文書検索</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_df5d5fe98a0bbbf2" target="bookBody"><span class="txt">10.1 基本検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/approval.html#r_a0bfcd7ac83650e4" target="bookBody"><span class="txt">10.2 詳細検索</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/documents.html" target="bookBody"><span class="txt">全体文書箱</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/documents.html#r_69a20afd48c76893" target="bookBody"><span class="txt">1 全体文書箱とは</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/documents.html#r_a876b3af2c1d9563" target="bookBody"><span class="txt">2 全体文書箱リスト</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/documents.html#r_75117d5ced63b501" target="bookBody"><span class="txt">3 全体文書箱管理者</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html" target="bookBody"><span class="txt">ToDO+</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_df6e523757a13d62" target="bookBody"><span class="txt">1 ToDO+ 開始</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_af1d1608e96eefaa" target="bookBody"><span class="txt">2 ボード管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_5dc5e8eef9b2cd72" target="bookBody"><span class="txt">2.1 ボード追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_95b20ef42f612945" target="bookBody"><span class="txt">2.2 ボード削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_78005debac22d36f" target="bookBody"><span class="txt">2.3 ボードから退出</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_4ec6f01fc90484f4" target="bookBody"><span class="txt">2.4 ボードお気に入り</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_89a13bb9ed60cda3" target="bookBody"><span class="txt">2.5 メンバー追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_eb0f6f0c96121599" target="bookBody"><span class="txt">2.6 メンバー除外</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_81777b0451a0c51e" target="bookBody"><span class="txt">2.7 管理者権限変更</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_7e81f9e1425492d0" target="bookBody"><span class="txt">3 コラム管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_1d600e0f5fc3f5ff" target="bookBody"><span class="txt">3.1 コラム追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_5b911b748352398f" target="bookBody"><span class="txt">3.2 コラム削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_558e484e37e60ecd" target="bookBody"><span class="txt">3.3 コラム順番変更</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_00c93c8654dda44b" target="bookBody"><span class="txt">4 カード管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_14a2d8c37c761445" target="bookBody"><span class="txt">4.1 カード追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_5ee44a03be311b16" target="bookBody"><span class="txt">4.2 カード削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_1cee2449ede41432" target="bookBody"><span class="txt">4.3 カード移動</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_363bda9890b58887" target="bookBody"><span class="txt">4.4 カードアクション</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_5d5f5f92e61012a3" target="bookBody"><span class="txt">担当者ー指定</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_d1f5a3b55efc039b" target="bookBody"><span class="txt">ラベル</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_7cc110f3889a22e7" target="bookBody"><span class="txt">期限日設定</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_746a682a082b77fe" target="bookBody"><span class="txt">ファイル添付</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_f69373c08606f0d5" target="bookBody"><span class="txt">チェックリスト</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_a23fa3449074f411" target="bookBody"><span class="txt">5 カレンダーで確認</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_5f9b79e1e3405023" target="bookBody"><span class="txt">6 推移グラフで確認</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/to_do_plus.html#r_7e28f60d89a263f2" target="bookBody"><span class="txt">7 ToDO+ 検索</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/part_two.html" target="bookBody"><span class="txt">Mobile</span></a></p>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_getting_started.html" target="bookBody"><span class="txt">アプリを始める</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_getting_started.html#r_af4eb34c81e6cffa" target="bookBody"><span class="txt">1 インストール方法</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_getting_started.html#r_6f031d2a8efed788" target="bookBody"><span class="txt">2 アプリにログイン</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_getting_started.html#r_0d98d81f4a2d9ee2" target="bookBody"><span class="txt">3 DaouOffice アプリのログアウト</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html" target="bookBody"><span class="txt">アプリを使用する</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_c900f8d8c6785db4" target="bookBody"><span class="txt">1 アプリのメイン画面</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_033ec38de844dce1" target="bookBody"><span class="txt">2 メール</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_aea2de6488c7a18b" target="bookBody"><span class="txt">2.1 メールの確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_4c3fd1a71b13d14d" target="bookBody"><span class="txt">2.2 メールの作成</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_6037363babc4285e" target="bookBody"><span class="txt">3 メンバー</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_05648890bdb7e13c" target="bookBody"><span class="txt">3.1 メンバーを確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_6b4dd3d0ec0265da" target="bookBody"><span class="txt">3.2 メンバー情報の確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_dd163b084fd1bd65" target="bookBody"><span class="txt">3.3 メンバーを検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_005340c5025c68b7" target="bookBody"><span class="txt">4 チャット</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_f733dc4da7a3524f" target="bookBody"><span class="txt">4.1 1:1チャット</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_37e50bfcc9c6df83" target="bookBody"><span class="txt">4.2 グループチャット</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_7d4dde04f6e70c87" target="bookBody"><span class="txt">4.3 チャット一覧の確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_3f362b882fe421ca" target="bookBody"><span class="txt">4.4 付加機能</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_f3f42dbd12fb5ca3" target="bookBody"><span class="txt">4.5 未読/既読の確認</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_2330d775e66690fc" target="bookBody"><span class="txt">5 送信者表示機能</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_d3cc6999272616cb" target="bookBody"><span class="txt">6 設定する</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/app_usage.html#r_232602b4ae2e9ddd" target="bookBody"><span class="txt">7 バージョンアップデート</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html" target="bookBody"><span class="txt">予定、連絡先を同期する</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html#r_ac35382dee447164" target="bookBody"><span class="txt">1 iphone同期化設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html#r_82298f22152abf63" target="bookBody"><span class="txt">2 カレンダー同期設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html#r_ea9d3bb3875d6978" target="bookBody"><span class="txt">2.1 連絡先同期化設定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html#r_4485e3a7783adf7f" target="bookBody"><span class="txt">2.2 Android端末同期化設定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html#r_ec912ca56cf13e0d" target="bookBody"><span class="txt">2.3 カレンダー確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/sync_calendar_contacts.html#r_e111e0ab752502fc" target="bookBody"><span class="txt">2.4 カレンダー/連絡先同期化</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/part_three.html" target="bookBody"><span class="txt">PC: メッセンジャー</span></a></p>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_getting_started.html" target="bookBody"><span class="txt">PCメッセンジャーを始める</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_getting_started.html#r_5da13ffdc3aa928e" target="bookBody"><span class="txt">1 PCメッセンジャーのインストール</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_getting_started.html#r_4250b8e1b6c06880" target="bookBody"><span class="txt">2 PCメッセンジャーログイン</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_getting_started.html#r_a91a8cffebdb9739" target="bookBody"><span class="txt">3 PCメッセンジャー機能</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html" target="bookBody"><span class="txt">PCメッセンジャーを使用する</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_aa0b95c5110b85ae" target="bookBody"><span class="txt">1 PCメッセンジャーの画面構成</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_19351cfebeb6cb54" target="bookBody"><span class="txt">2 チャットする</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_46fc111bd824ff1a" target="bookBody"><span class="txt">2.1 ファイル転送</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_ee8a597fe204ece7" target="bookBody"><span class="txt">2.2 キャプチャを送る</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_804c8d6839bf5153" target="bookBody"><span class="txt">2.3 メンバー追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_0d4408036027e9cf" target="bookBody"><span class="txt">2.4 チャット内容保存</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_5b4a5ad7e2f468f3" target="bookBody"><span class="txt">3 グループチャット</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_446a8760680a64b6" target="bookBody"><span class="txt">4 メモ</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_8613c396a8b63f52" target="bookBody"><span class="txt">4.1 メモの作成</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_aa7330502381fd39" target="bookBody"><span class="txt">4.2 メモ確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_9591ae085bcf8401" target="bookBody"><span class="txt">4.3 メモ返信</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_398ec925643d2fae" target="bookBody"><span class="txt">4.4 メモ転送</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_532720b8d72cbb85" target="bookBody"><span class="txt">4.5 メモ削除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_9f1b259eea664def" target="bookBody"><span class="txt">5 メンバーの検索</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_8c423690c2b07f4e" target="bookBody"><span class="txt">6 メンバーのプロフィールを見る</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_360ac6015158186e" target="bookBody"><span class="txt">7 お気に入り</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/messenger_usage.html#r_8d4b8ad8a974d441" target="bookBody"><span class="txt">8 PCメッセンジャー設定</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html" target="bookBody"><span class="txt">付録. 組織図</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html#r_10da2bcc8f9da9b0" target="bookBody"><span class="txt">1 組織図とは</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html#r_9128e5ff48713456" target="bookBody"><span class="txt">2 組織図を開く</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html#r_1762907c8d333588" target="bookBody"><span class="txt">3 プロフィール確認</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html#r_393f2578cb988116" target="bookBody"><span class="txt">4 メール送信</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html#r_b1460c921016423c" target="bookBody"><span class="txt">5 予定確認</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/org_tree.html#r_4284d18338f32729" target="bookBody"><span class="txt">6 メンバー検索</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/import_contacts.html" target="bookBody"><span class="txt">付録. アドレス帳のインポート</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/import_contacts.html#r_c23a03c618f721f4" target="bookBody"><span class="txt">1 Outlook形式のCSVファイル作成</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/import_contacts.html#r_57c138489a4ab3fe" target="bookBody"><span class="txt">2 Outlook Express形式のCSVファイル作成</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html" target="bookBody"><span class="txt">付録. アドレス帳のエクスポート</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html#r_019daafc6f4eec6b" target="bookBody"><span class="txt">1 アドレス帳のエクスポート</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html#r_bbd5dfb22b5eb48b" target="bookBody"><span class="txt">1.1 Outlook形式にエクスポート</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html#r_ca5be6df259495d6" target="bookBody"><span class="txt">1.2 Outlook Express形式にエクスポート</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html#r_057d504a42643c90" target="bookBody"><span class="txt">2 アドレス帳をクライアントにインポート</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html#r_6d7848c91459ad6d" target="bookBody"><span class="txt">2.1 Outlookにアドレス帳をインポート</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/service/export_contacts.html#r_4d3437fa4b171d58" target="bookBody"><span class="txt">2.2 Outlook Expressにアドレス帳のインポート</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
	</ul>
</div></body></html>

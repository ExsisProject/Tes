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
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/getting_started.html" target="bookBody"><span class="txt">サイト管理者画面の紹介</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/getting_started.html#r_6b03938a3dddffce" target="bookBody"><span class="txt">1 Web管理者画面とは</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/getting_started.html#r_7e202c8af5775ef7" target="bookBody"><span class="txt">2 Web管理者画面へログイン</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/getting_started.html#r_1742d80e0a6ac5c4" target="bookBody"><span class="txt">2.1 管理者情報変更</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html" target="bookBody"><span class="txt">設定</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_af2768b6e8784a3e" target="bookBody"><span class="txt">1 基本情報</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_69776ae44022f084" target="bookBody"><span class="txt">2 メニュー管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_957335ba094d1793" target="bookBody"><span class="txt">2.1 メニューリスト</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_b8b2474e436c1c02" target="bookBody"><span class="txt">2.2 メニュー追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_6fca06a208d3e8e6" target="bookBody"><span class="txt">2.3 メニューの修正</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_d9778f5e0f7e4c18" target="bookBody"><span class="txt">2.4 メニューの削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_29291199f8e6b55d" target="bookBody"><span class="txt">2.5 ホームメニュー設定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_e8356a5537c0fda5" target="bookBody"><span class="txt">2.6 順番入れ替え</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_758629faf4747cf6" target="bookBody"><span class="txt">2.7 インデント</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_7bde608e9287aa41" target="bookBody"><span class="txt">3 機能管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_d84bd8453713e395" target="bookBody"><span class="txt">3.1 機能設定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_72312cd7c7da2200" target="bookBody"><span class="txt">3.2 ショートカットボタン設定</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_af7e75feaa95266f" target="bookBody"><span class="txt">ショートカットボタン追加</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_41fb99d51064bed5" target="bookBody"><span class="txt">ショートカットボタン変更</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_400ae31f3ef95645" target="bookBody"><span class="txt">ショートカットボタン削除</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_3812c4465cea8411" target="bookBody"><span class="txt">4 ログイン設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_f4b19918e074510f" target="bookBody"><span class="txt">5 ダッシュボードの設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_1d94ffdf5b092ba9" target="bookBody"><span class="txt">5.1 ダッシュボード管理者設定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_eb923d813a4ae508" target="bookBody"><span class="txt">5.2 ダッシュボードガジェット公開設定</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_f724630480113dc0" target="bookBody"><span class="txt">6 セキュリティ設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_6237838e27478214" target="bookBody"><span class="txt">7 ポップアップお知らせ管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_97f682eb8974c17e" target="bookBody"><span class="txt">7.1 お知らせ追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_4e07889f1feca165" target="bookBody"><span class="txt">7.2 お知らせ修正</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_33758b8764db5357" target="bookBody"><span class="txt">7.3 お知らせ削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_79a4cd4e41d08f2a" target="bookBody"><span class="txt">7.4 お知らせ検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_c0bda2a0428fd324" target="bookBody"><span class="txt">8 管理者リスト</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_f836a2d4f85214a7" target="bookBody"><span class="txt">9 管理者タスク記録</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/settings.html#r_82b18db31f7bdc4e" target="bookBody"><span class="txt">10 その他</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html" target="bookBody"><span class="txt">統計</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_1e2b2c10702ebe76" target="bookBody"><span class="txt">1 概要</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_4ca02ade2493da2c" target="bookBody"><span class="txt">1.1 統計情報の取得</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_4263b60f623c6399" target="bookBody"><span class="txt">1.2 統計結果のダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_f2cc6972b75d7f61" target="bookBody"><span class="txt">1.3 統計結果の印刷</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_633eb2c3e986f31b" target="bookBody"><span class="txt">2 メール</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_a700b9688ea4380f" target="bookBody"><span class="txt">2.1 概要</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_1cedcfa6e4ccf905" target="bookBody"><span class="txt">2.2 正常メール</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_37640c09ee1769a5" target="bookBody"><span class="txt">2.3 スパムメール</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_4707b210793c9f20" target="bookBody"><span class="txt">2.4 フィッシングメール</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_e02c9102770b36da" target="bookBody"><span class="txt">2.5 ウィルスメール</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_88604c3bd28ba6bf" target="bookBody"><span class="txt">2.6 POP</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/stats.html#r_d5ad2f966e2c725b" target="bookBody"><span class="txt">2.7 IMAP</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html" target="bookBody"><span class="txt">アカウント</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_837c905c646ca264" target="bookBody"><span class="txt">1 アカウントリスト</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_0dd29afffd0a50dd" target="bookBody"><span class="txt">1.1 アカウント追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_b788bba102f26507" target="bookBody"><span class="txt">1.2 アカウント修正</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_416f6b5f100aa19a" target="bookBody"><span class="txt">1.3 アカウント停止</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_6cea1800f7d4c42a" target="bookBody"><span class="txt">1.4 アカウント削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_6712fd9a5fc3b36c" target="bookBody"><span class="txt">1.5 クラス変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_fd5f0cb6a9799df8" target="bookBody"><span class="txt">1.6 アカウントリストのダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_c5974823206d387d" target="bookBody"><span class="txt">1.7 アカウント検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_e902284ca075aa18" target="bookBody"><span class="txt">2 アカウント一括登録</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_949275b44491bce1" target="bookBody"><span class="txt">3 削除アカウントリスト</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_05a3090b8e0cd712" target="bookBody"><span class="txt">3.1 削除アカウントリストのダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_082e28ab1408cecd" target="bookBody"><span class="txt">3.2 削除アカウントの検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_ba19bd889da6a940" target="bookBody"><span class="txt">4 クラス管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_30862244976eb45d" target="bookBody"><span class="txt">4.1 クラス追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_cbe5ce857dbe2efe" target="bookBody"><span class="txt">4.2 クラス変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_428dea0da172033e" target="bookBody"><span class="txt">4.3 クラス削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_c8033e265b987570" target="bookBody"><span class="txt">4.4 クラスリストのダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/accounts.html#r_2f3d0ad078c7a26e" target="bookBody"><span class="txt">4.5 クラス順番の入れ替え</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html" target="bookBody"><span class="txt">部署管理</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_b290659f10753ccf" target="bookBody"><span class="txt">1 組織図管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_0d16111d92d0fbb9" target="bookBody"><span class="txt">1.1 部署の追加</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_ca57f32fa3a8596e" target="bookBody"><span class="txt">部署のメールIDを設定</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_f83e1838a6273b63" target="bookBody"><span class="txt">部署コード設定</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_1489baa0d7d28827" target="bookBody"><span class="txt">部署略語の設定</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_9af6bc3673d9774a" target="bookBody"><span class="txt">1.2 部署名の変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_d58110803c639613" target="bookBody"><span class="txt">1.3 部署を削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_a8e9b82f60b3c79a" target="bookBody"><span class="txt">1.4 部署員順番入替え設定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_7c8400aefb2924ae" target="bookBody"><span class="txt">1.5 部署リストのインポート</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_bd05dbccabc3bd7d" target="bookBody"><span class="txt">1.6 部署リストのエクスポート</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_5233d0c54e7e03a9" target="bookBody"><span class="txt">1.7 部署員を追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_ca8f00af820accde" target="bookBody"><span class="txt">1.8 部署員の削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_86cfba6375cf2185" target="bookBody"><span class="txt">1.9 部署員順序設定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_e3139522335ea7b2" target="bookBody"><span class="txt">1.10 部署員リストのインポート</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_fc7583ed616157e9" target="bookBody"><span class="txt">1.11 部署員リストのエクスポート</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_d43a992ad5fed8fc" target="bookBody"><span class="txt">1.12 部署員の移動</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_be8111d77ec25912" target="bookBody"><span class="txt">1.13 部署員の順番入れ替え</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_7fce6644bc21e2b2" target="bookBody"><span class="txt">2 部署リスト</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_94bf9e7718f5bc6e" target="bookBody"><span class="txt">2.1 部署を追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_8798272e2c988ebf" target="bookBody"><span class="txt">2.2 部署リストのダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_8ee68c7895a3d79d" target="bookBody"><span class="txt">2.3 部署検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_ac493088bda2c23b" target="bookBody"><span class="txt">2.4 部署詳細情報を確認</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_7142206e82bddf09" target="bookBody"><span class="txt">3 削除部署リスト</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_e568d3324d8e1b0f" target="bookBody"><span class="txt">3.1 削除部署リストのダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_38b641296602081c" target="bookBody"><span class="txt">3.2 削除部署添付ファイル削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_4848d7b5703726af" target="bookBody"><span class="txt">3.3 削除部署詳細情報確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/departments.html#r_371cd83a0deb01b4" target="bookBody"><span class="txt">3.4 削除部署を検索</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html" target="bookBody"><span class="txt">メール</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_e483ee3ed2156843" target="bookBody"><span class="txt">1 メール基本設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_f55926a3f07f63e7" target="bookBody"><span class="txt">2 メールバナー設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_34b307512aa52f50" target="bookBody"><span class="txt">3 メールグループ</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_4b444aca85c93805" target="bookBody"><span class="txt">3.1 メールグループの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_d4aa90315f9d6766" target="bookBody"><span class="txt">3.2 メールグループの変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_e71438c49ade5532" target="bookBody"><span class="txt">3.3 メールグループの削除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_aa2fc950d89b49f7" target="bookBody"><span class="txt">4 休止状態管理</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_8d868007853ad474" target="bookBody"><span class="txt">5 エイリアス管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_cbc742b681f93789" target="bookBody"><span class="txt">5.1 エイリアスユーザの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_77cc30011f8cb02b" target="bookBody"><span class="txt">5.2 エイリアスユーザの変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_5315ddadff6d88a7" target="bookBody"><span class="txt">5.3 エイリアスユーザの削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_00205dc644cede7f" target="bookBody"><span class="txt">5.4 エイリアスユーザ移動</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_6e0236c2efe1185e" target="bookBody"><span class="txt">5.5 エイリアスユーザの検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_13fb9a9f31125bd5" target="bookBody"><span class="txt">6 大量メール送信者の管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_0d5780c6d0ae3cb0" target="bookBody"><span class="txt">6.1 大量メール送信権限の設定</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_378e60d7a84055fe" target="bookBody"><span class="txt">6.2 受信先リストのアップロード可能なユーザの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_4baeb324b864505d" target="bookBody"><span class="txt">6.3 受信先リストのアップロード可能なユーザの削除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_a537de332e05abd6" target="bookBody"><span class="txt">7 ドメインメールフォルダの管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_d754472bdf53e211" target="bookBody"><span class="txt">7.1 ドメインメールフォルダの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_be97df7e2932fa6a" target="bookBody"><span class="txt">7.2 ドメインメールフォルダの削除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_c986b3897a996c75" target="bookBody"><span class="txt">8 壁紙</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_b9e4ff36cd7d73de" target="bookBody"><span class="txt">8.1 壁紙の追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_b79a366f8779c959" target="bookBody"><span class="txt">8.2 壁紙の削除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_81f2dd69e78c4e25" target="bookBody"><span class="txt">9 文書テンプレート</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_38c56c067fec11f1" target="bookBody"><span class="txt">9.1 テンプレートの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mail.html#r_53fa508d2fb67b08" target="bookBody"><span class="txt">9.2 テンプレートの削除</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html" target="bookBody"><span class="txt">アドレス帳</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_77350b4037a79929" target="bookBody"><span class="txt">1 アドレス帳の設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_fb11cae8e8ad706b" target="bookBody"><span class="txt">2 共有アドレス帳の管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_c9bd82aa974d2c24" target="bookBody"><span class="txt">2.1 アドレス帳グループの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_ffe68deb3c4157d9" target="bookBody"><span class="txt">2.2 アドレス帳のグループの並べ替え</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_c524f8451d5b0b81" target="bookBody"><span class="txt">3 全アドレス帳の統計</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_ef68c40ef2d30dd6" target="bookBody"><span class="txt">3.1 全アドレス帳の統計リストのダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/contacts.html#r_e4ba4a617acac0ec" target="bookBody"><span class="txt">3.2 全アドレス帳の統計検索</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/storage.html" target="bookBody"><span class="txt">Webフォルダ</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/storage.html#r_9b04e0bfd0e654fe" target="bookBody"><span class="txt">1 Webフォルダの基本設定</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/calendar.html" target="bookBody"><span class="txt">カレンダー</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/calendar.html#r_0aad71ca2621bf72" target="bookBody"><span class="txt">1 カレンダーの設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/calendar.html#r_e729757158b05bd2" target="bookBody"><span class="txt">2 休日/記念日設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/calendar.html#r_8d44dabdb892f458" target="bookBody"><span class="txt">2.1 休日/記念日の追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/calendar.html#r_d510127af3012b38" target="bookBody"><span class="txt">2.2 休日/記念日削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/calendar.html#r_a70581140d340761" target="bookBody"><span class="txt">2.3 休日/記念日のリストダウンロード</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html" target="bookBody"><span class="txt">掲示板</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_b06b719d4add2b55" target="bookBody"><span class="txt">1 掲示板の基本設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_8b913724b9ec66d9" target="bookBody"><span class="txt">2 全体掲示板の管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_e7a11f127dbebd72" target="bookBody"><span class="txt">2.1 全体掲示板の追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_a79cf22de9e756d2" target="bookBody"><span class="txt">2.2 全体掲示板の修正</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_940cf70000fe1f45" target="bookBody"><span class="txt">2.3 全体掲示板の削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_a78033b1fba36fde" target="bookBody"><span class="txt">2.4 全体掲示板の順序の変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_df43492ae0c54bf2" target="bookBody"><span class="txt">2.5 全体掲示板 区分線を追加する</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_a8437abe5ee65104" target="bookBody"><span class="txt">3 全体掲示板の統計</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_e64ab462ed42a200" target="bookBody"><span class="txt">3.1 全体掲示板統計リストのダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_50869faa90338bca" target="bookBody"><span class="txt">3.2 全掲示板の統計検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_6147c63f1783443e" target="bookBody"><span class="txt">4 部署別の掲示板統計</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_5cd89ed8ccd970f0" target="bookBody"><span class="txt">4.1 部署別の掲示板統計リストのダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/boards.html#r_cbd709e42fbfe510" target="bookBody"><span class="txt">4.2 部署別の掲示板検索</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html" target="bookBody"><span class="txt">コミュニティ</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_1c75c9a93f814da0" target="bookBody"><span class="txt">1 コミュニティ 基本設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_1e7c4405db987497" target="bookBody"><span class="txt">2 開設申込コミュニティ</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_be14cb384d1950ad" target="bookBody"><span class="txt">2.1 コミュニティ開設申込承諾</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_0a12b4acb0c3b067" target="bookBody"><span class="txt">2.2 コミュニティ開設申請却下</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_d9abdd7ad9f68114" target="bookBody"><span class="txt">3 コミュニティ全体の検索</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_6517e5c241c43d94" target="bookBody"><span class="txt">3.1 コミュニティリストのダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_3f7a04bed47d4045" target="bookBody"><span class="txt">3.2 コミュニティの検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_5e984aa73a929848" target="bookBody"><span class="txt">4 全コミュニティ統計</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_63b2c20f4ecb4b75" target="bookBody"><span class="txt">4.1 全コミュニティ統計リストのダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_7a2081533217bf4c" target="bookBody"><span class="txt">4.2 全コミュニティ統計を検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_90cdcf8069f106b9" target="bookBody"><span class="txt">5 コミュニティ別統計</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_3c3e7905a33bbe87" target="bookBody"><span class="txt">5.1 コミュニティ別統計のリストをダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/communities.html#r_67a3be827afb17f5" target="bookBody"><span class="txt">5.2 コミュニティ別統計を検索</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/reserve.html" target="bookBody"><span class="txt">予約</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/reserve.html#r_3249436c49d898ad" target="bookBody"><span class="txt">1 設備の追加</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/reserve.html#r_d8b443ef3c330fc8" target="bookBody"><span class="txt">2 設備の変更</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/reserve.html#r_a8bf29cf11aee27e" target="bookBody"><span class="txt">3 設備の使用停止</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/reserve.html#r_907ed76d138c4988" target="bookBody"><span class="txt">4 設備削除</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/reserve.html#r_9fe9d79aaf7b88d1" target="bookBody"><span class="txt">5 設備の並べ替え</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/survey.html" target="bookBody"><span class="txt">アンケート</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/survey.html#r_aadf8d22f185b10f" target="bookBody"><span class="txt">1 アンケート基本設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/survey.html#r_c8ca04e7917e5e82" target="bookBody"><span class="txt">2 全アンケート</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/survey.html#r_d54431bd1e080226" target="bookBody"><span class="txt">2.1 アンケート状態の変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/survey.html#r_5c3fcb7cc6030e45" target="bookBody"><span class="txt">2.2 アンケート削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/survey.html#r_4247d7aab7cc412d" target="bookBody"><span class="txt">2.3 アンケート検索</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html" target="bookBody"><span class="txt">レポート</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html#r_655c92d14f9b58ba" target="bookBody"><span class="txt">1 共有書式管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html#r_5c03e1414f384db1" target="bookBody"><span class="txt">1.1 新しい書式の作成</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html#r_0bf743a305b4bdb5" target="bookBody"><span class="txt">1.2 書式のコピー作成</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html#r_4ea361ad001a937c" target="bookBody"><span class="txt">1.3 書式削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html#r_3fa22237d813e55e" target="bookBody"><span class="txt">1.4 書式プレビュー</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/report.html#r_937a0b4af6990dc0" target="bookBody"><span class="txt">2 書式検索</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html" target="bookBody"><span class="txt">タスク</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_5aa290a32a9d911b" target="bookBody"><span class="txt">1 タスク基本設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_6b51be34fb16f1ca" target="bookBody"><span class="txt">2 全体タスクフォルダ現況</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_c72ef79446c9703e" target="bookBody"><span class="txt">2.1 リストダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_48fd0c57efbdce21" target="bookBody"><span class="txt">2.2 全体タスクフォルダリスト検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_ba33249d8785a1b1" target="bookBody"><span class="txt">3 タイプ別タスク進行設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_011241e9089142ec" target="bookBody"><span class="txt">3.1 タスクタイプ追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_087a203a0f9b7181" target="bookBody"><span class="txt">3.2 タスクタイプ修正</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_0268a0a5e9f80f83" target="bookBody"><span class="txt">3.3 タスクタイプ削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/task.html#r_9bb036128fdd1459" target="bookBody"><span class="txt">3.4 タスクタイプ検索</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html" target="bookBody"><span class="txt">ワークフロー</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_e49e5223ee6195e9" target="bookBody"><span class="txt">1 フォーム管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_c823ae7e64ebdd8d" target="bookBody"><span class="txt">1.1 決裁フォーム管理</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_4d603604e31ca08b" target="bookBody"><span class="txt">決裁フォームフォルダ追加</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_3e2a9d6f6bc16dbb" target="bookBody"><span class="txt">決裁フォームフォルダ変更</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_e4a2bf6b7ecf038b" target="bookBody"><span class="txt">決裁フォームフォルダ削除</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_a18cca8db4ffd572" target="bookBody"><span class="txt">決裁フォームフォルダ移動</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_711ad5656cef4c8c" target="bookBody"><span class="txt">1.2 決裁フォーム</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_57a432045c26bf6c" target="bookBody"><span class="txt">決裁フォーム追加</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_2434daf3d100f234" target="bookBody"><span class="txt">決裁フォーム変更</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_b493fd5f99550539" target="bookBody"><span class="txt">決裁フォーム移動</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_eb6459663bad836a" target="bookBody"><span class="txt">決裁フォーム削除</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_5221ee108506a25c" target="bookBody"><span class="txt">決裁フォーム順番入替え</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_95397f9c524730fa" target="bookBody"><span class="txt">2 全体文書箱管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_3930fa9501ef9164" target="bookBody"><span class="txt">2.1 全体文書箱追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_238979c24acf9ae2" target="bookBody"><span class="txt">2.2 全体文書箱修正</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_4c893ef879dc930e" target="bookBody"><span class="txt">2.3 全体文書箱削除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_9b96bfe2a4937d3e" target="bookBody"><span class="txt">3 部署文書箱管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_665da6c059d5422d" target="bookBody"><span class="txt">3.1 特定部署の決裁文書リスト確認</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_89803b1ad62a3e80" target="bookBody"><span class="txt">3.2 部署文書箱管理 (追加/削除)</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_6043e60efec2c62b" target="bookBody"><span class="txt">3.3 文書箱分類</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_a3b13a7f45c1c5a0" target="bookBody"><span class="txt">4 決裁管理者設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_a1b33b3e376f7afc" target="bookBody"><span class="txt">5 ワークフロー設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_a3fd091b2ee6a938" target="bookBody"><span class="txt">6 署名一括登録</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_23033194123dc9de" target="bookBody"><span class="txt">7 ワークフロー文書番号設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_58dbfb6642621436" target="bookBody"><span class="txt">8 決裁文書管理</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_3f014470de9a4050" target="bookBody"><span class="txt">9 セキュリティレベル管理</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_786ea1f4d08e2d48" target="bookBody"><span class="txt">10 ワークフロー日別統計</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/approval.html#r_cef0989dd93942f8" target="bookBody"><span class="txt">11 ワークフロー部署別統計</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html" target="bookBody"><span class="txt">モバイル</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_9d1f7f356c3a8e39" target="bookBody"><span class="txt">1 モバイル端末アクセス設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_176b8a3084dcda46" target="bookBody"><span class="txt">1.1 アクセス制限</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_807055d94c7f2a40" target="bookBody"><span class="txt">1.2 モバイル端末管理</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_35120e01da039a34" target="bookBody"><span class="txt">モバイル端末の追加</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_a760472ba398dfa3" target="bookBody"><span class="txt">モバイル端末の削除</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_7376f77be81cbe97" target="bookBody"><span class="txt">モバイル端末の検索</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_1d29a369f98a661a" target="bookBody"><span class="txt">2 モバイルセキュリティ</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_46e622937e0b62f4" target="bookBody"><span class="txt">2.1 添付ファイルダウンロード</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_0ffea35ecef014a4" target="bookBody"><span class="txt">3 メッセンジャー設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/site/mobility.html#r_488b43bb171ffd51" target="bookBody"><span class="txt">3.1 基本設定</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
	</ul>
</div></body></html>

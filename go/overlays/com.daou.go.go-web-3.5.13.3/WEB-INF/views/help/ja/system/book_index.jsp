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
<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>

<body class="bookLeft">
<div class="bookLeft">
	<ul class="depth_1">		
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/getting_started.html" target="bookBody"><span class="txt">はじめに</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/getting_started.html#r_96c3b69b94a8ca3f" target="bookBody"><span class="txt">1 Web管理者画面とは</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/getting_started.html#r_84765667c81b8348" target="bookBody"><span class="txt">2 Web管理者画面へ接続</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/getting_started.html#r_b1d47de52dbd02ef" target="bookBody"><span class="txt">2.1 管理者情報変更</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/home.html" target="bookBody"><span class="txt">サマリー</span></a></p>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html" target="bookBody"><span class="txt">システム</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_03a5dc5356d4a1b5" target="bookBody"><span class="txt">1 概要</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_ce76fc7f95748b7a" target="bookBody"><span class="txt">2 サーバ管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_66059fbf293efc81" target="bookBody"><span class="txt">2.1 サーバの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_bccda32426d0db6b" target="bookBody"><span class="txt">2.2 サーバの変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_34385400fa82bdaa" target="bookBody"><span class="txt">2.3 サーバの削除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_f99b871cdc92f32c" target="bookBody"><span class="txt">3 ライセンス</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_82b12bfbca01d8a8" target="bookBody"><span class="txt">4 アップデート</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_45b4b7aceb06fa9f" target="bookBody"><span class="txt">4.1 S/Wアップデート</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_f21d7b10501b16fd" target="bookBody"><span class="txt">アップデートファイル登録</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_a54ea08f7239847d" target="bookBody"><span class="txt">アップデート</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_3c992ee7115f153a" target="bookBody"><span class="txt">リリースノート</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_19e65c05fff15d99" target="bookBody"><span class="txt">4.2 Proxyサーバ設定</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_62c2477d6123e0d6" target="bookBody"><span class="txt">5 サービス</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_3d2197b96f045a7e" target="bookBody"><span class="txt">5.1 メール</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_3bb5e9362693cd61" target="bookBody"><span class="txt">送受信環境</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_c6e13f1a2c0dfbac" target="bookBody"><span class="txt">基本環境</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_a6562ac098c506f8" target="bookBody"><span class="txt">送受信ドメイン書き換え</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_50a7e39c779ab459" target="bookBody"><span class="txt">受信者アドレス書き換え</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_fc07626e13d95f33" target="bookBody"><span class="txt">メール送信オプション</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_10212d8f5ff5b0fa" target="bookBody"><span class="txt">リレー許可ポリシー</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_feeb1be62eaa3090" target="bookBody"><span class="txt">送受信キューポリシー</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_8c28152d4d197607" target="bookBody"><span class="txt">予約メール</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_dfa1d88cce517034" target="bookBody"><span class="txt">プロセス</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_55652a638fdeca6b" target="bookBody"><span class="txt">受信サーバ</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_1220e438c4febc3c" target="bookBody"><span class="txt">送信サーバ</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_ba301f89a6e2e6df" target="bookBody"><span class="txt">配信サーバ</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_e76a5d7763676d3b" target="bookBody"><span class="txt">POPサーバ</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_d0ff89a6a6287112" target="bookBody"><span class="txt">IMAPサーバ</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_087946fa48f67eb2" target="bookBody"><span class="txt">メール検索</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_50331a8b72d87460" target="bookBody"><span class="txt">性能チューニング</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_b9e55462058f0dd1" target="bookBody"><span class="txt">リターンメール(NDR)</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_bf47a76c3a46eab1" target="bookBody"><span class="txt">メール添付管理</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/system_management.html#r_24bc1747d39aeffb" target="bookBody"><span class="txt">TMA連動</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html" target="bookBody"><span class="txt">ドメイン/サイト管理</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_a7d0894c1fedd0b0" target="bookBody"><span class="txt">1 ドメインリスト</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_12610ddf55f42c5a" target="bookBody"><span class="txt">1.1 ドメイン追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_d7d75c8024f30f04" target="bookBody"><span class="txt">1.2 ドメイン変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_32416d3cd55c0b48" target="bookBody"><span class="txt">1.3 ドメイン削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_84438ebffbe461b5" target="bookBody"><span class="txt">1.4 ドメイン検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_5e8834a60fe07242" target="bookBody"><span class="txt">2 サイト一覧</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_e7912df89c9beb99" target="bookBody"><span class="txt">2.1 サイトの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_67b67bf28e7d3ae1" target="bookBody"><span class="txt">2.2 サイトの変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_87d8bc3dbce54241" target="bookBody"><span class="txt">2.3 サイトの削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_501fe525886c4638" target="bookBody"><span class="txt">2.4 サイトの検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_77480823021c1de9" target="bookBody"><span class="txt">2.5 サイト管理者画面に移動</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_dcd46f578ca06960" target="bookBody"><span class="txt">3 サイトグループリスト</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_1430e89f961a0020" target="bookBody"><span class="txt">3.1 サイトグループ追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_0d02601ecb2fb661" target="bookBody"><span class="txt">3.2 サイトグループ変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_afe66eecb36cff48" target="bookBody"><span class="txt">3.3 サイトグループ削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/domains_and_sites.html#r_70ae3d7db94281a2" target="bookBody"><span class="txt">3.4 サイトグループ検索</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html" target="bookBody"><span class="txt">セキュリティ</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_61d81243293d22a0" target="bookBody"><span class="txt">1 共通</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_7c28d2748b6e66e0" target="bookBody"><span class="txt">1.1 アンチウイルス</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_3db8d4f6cb8051e1" target="bookBody"><span class="txt">1.2 証明証</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_0ce794714c7a6c4b" target="bookBody"><span class="txt">基本証明書</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_1313c79f3b50d048" target="bookBody"><span class="txt">自己証明書</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_33016972247c3afe" target="bookBody"><span class="txt">認証局証明書</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_bad619efb8ffab37" target="bookBody"><span class="txt">1.3 APIアクセス</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_b880697991b99258" target="bookBody"><span class="txt">1.4 海外ログイン遮断許可設定</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_c22b8a09ec785614" target="bookBody"><span class="txt">2 メール</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_091799f2a149cf81" target="bookBody"><span class="txt">2.1 アンチスパム</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_0ac23151034f4acc" target="bookBody"><span class="txt">コンテンツフィルタ</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_5c22c16329a684eb" target="bookBody"><span class="txt">許可/遮断ルールの追加</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_69f8750677b38850" target="bookBody"><span class="txt">許可/遮断ルール変更</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_ed5c207210595cc3" target="bookBody"><span class="txt">許可/遮断ルールの削除</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_c1bef9f5de0b6068" target="bookBody"><span class="txt">許可/遮断ルールの設定</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_87c7b1397fe3bfaa" target="bookBody"><span class="txt">フィルタ検査</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_5fb7086c7d87d212" target="bookBody"><span class="txt">ライブアプデート</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_3d3d84f61dca0be3" target="bookBody"><span class="txt">接続段階遮断</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_f0573d818c9ae461" target="bookBody"><span class="txt">IP遮断</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_687d82d606fd4e54" target="bookBody"><span class="txt">IPフィルタ</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_5c511c4cf67e34e3" target="bookBody"><span class="txt">同時接続数制限</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_9a179267745c3330" target="bookBody"><span class="txt">RBL</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_bea6b02561769302" target="bookBody"><span class="txt">接続段階許可</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_9080ecf173a7df12" target="bookBody"><span class="txt">SMTP段階遮断</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_f9a1d3260da531a1" target="bookBody"><span class="txt">DNS検査</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_50717dca660dda65" target="bookBody"><span class="txt">SPF検査</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_bb4677f5b6a78f96" target="bookBody"><span class="txt">送信者遮断</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_f990717c14dfacc9" target="bookBody"><span class="txt">送信者フィルタ</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_3252bbd9d426b096" target="bookBody"><span class="txt">受信者遮断</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_1a1d5b07d07a7eec" target="bookBody"><span class="txt">受信者フィルタ</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_a9e0581c77fb276e" target="bookBody"><span class="txt">同報メール応答遅延</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_7c4c731169f3fb56" target="bookBody"><span class="txt">SMTP段階許可</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_2c9af33893f3af57" target="bookBody"><span class="txt">グループポリシー</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_d66a388575f7f832" target="bookBody"><span class="txt">グループポリシー追加</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_60b7d6da93e5518f" target="bookBody"><span class="txt">グループポリシー変更</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_9c9f5be0f11f4bb8" target="bookBody"><span class="txt">グループポリシー削除</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_b3948b1591aa619f" target="bookBody"><span class="txt">グループポリシーの適用設定</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_41d80db34b94aba1" target="bookBody"><span class="txt">グループポリシー適用順位</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_399dbae0e60e67e0" target="bookBody"><span class="txt">グループポリシー検索</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_83388bcea3fdc386" target="bookBody"><span class="txt">フィルタ情報ポリシー</span></a></p>
									<ul class="depth_5">
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_86c890a445613fbe" target="bookBody"><span class="txt">フィルタ情報管理サーバ</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_a8a295588da6c464" target="bookBody"><span class="txt">ローカルサーバの許可</span></a></p>
										</li>
										<li class="depth_5">
											<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_e976682461f39916" target="bookBody"><span class="txt">ローカル学習型フィルタ</span></a></p>
										</li>
									</ul>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_810559ede90aff9f" target="bookBody"><span class="txt">フィルタ検索</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_a2b156905e7eff70" target="bookBody"><span class="txt">2.2 情報漏洩防止</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_a9ab3b9757f810ee" target="bookBody"><span class="txt">情報漏洩モニタリング</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_4e6f84c54d6a4a51" target="bookBody"><span class="txt">情報保護フィルタ</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_ecc66bffcad454ec" target="bookBody"><span class="txt">保護対象設定</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_b6e3af56eb2c242d" target="bookBody"><span class="txt">遮断メール通知設定</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_845f600b55847a19" target="bookBody"><span class="txt">情報漏洩防止機能のフォルダ管理</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_555941d1b2de06ac" target="bookBody"><span class="txt">2.3 メール保存ポリシー</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_9ee1fecfcebc66ed" target="bookBody"><span class="txt">2.4 SSL/TLS設定</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_585c27f149eb43ee" target="bookBody"><span class="txt">SMTP</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_3aeec32546bfb3ac" target="bookBody"><span class="txt">POP</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_890359377507cac7" target="bookBody"><span class="txt">IMAP</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_b817ac481b2648ba" target="bookBody"><span class="txt">3 WAS</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_3504bf89bcc6b61f" target="bookBody"><span class="txt">3.1 アクセス制限</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_7f4810a7f0a0968d" target="bookBody"><span class="txt">3.2 セッション検証</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/security.html#r_33f954764bca2e02" target="bookBody"><span class="txt">3.3 HTTPS設定</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html" target="bookBody"><span class="txt">統計</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_50d14dff0e1b904a" target="bookBody"><span class="txt">1 概要</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_2ab1228977565f4d" target="bookBody"><span class="txt">1.1 統計情報の検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_77412eb8847dbbd4" target="bookBody"><span class="txt">1.2 統計情報のダウンロード</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_58a55beca1f1bd4b" target="bookBody"><span class="txt">1.3 統計情報の印刷</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_c2b0f96b41500e76" target="bookBody"><span class="txt">2 メール</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_6c9217f6006ae1ef" target="bookBody"><span class="txt">2.1 要約</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_579e9564a1a439fb" target="bookBody"><span class="txt">2.2 正常メール</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_4d5acd4633060930" target="bookBody"><span class="txt">2.3 スパムメール</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_51c9ec2149933e98" target="bookBody"><span class="txt">全段階</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_3980a2e184d80b6f" target="bookBody"><span class="txt">接続段階</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_199c4ab1e9eb1af4" target="bookBody"><span class="txt">SMTP段階</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_44c9ed5fc2b755ed" target="bookBody"><span class="txt">コンテンツ段階</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_7653f7d6dc4e661d" target="bookBody"><span class="txt">2.4 フィッシングメール</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_7d4f4a35a59d1af8" target="bookBody"><span class="txt">2.5 ウイルスメール</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_23d3c1500c1daea0" target="bookBody"><span class="txt">2.6 POP</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_52b068abb843620a" target="bookBody"><span class="txt">2.7 IMAP</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_a8ffee843c8623df" target="bookBody"><span class="txt">3 システム</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_cfdbf14f53d41cdf" target="bookBody"><span class="txt">3.1 CPU</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_ce93b4cfefad34e5" target="bookBody"><span class="txt">3.2 メモリ</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_2af8df855f587492" target="bookBody"><span class="txt">3.3 ディスク</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_5d8606dcedca9952" target="bookBody"><span class="txt">4 統計レポート</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_d07a3b480768b70c" target="bookBody"><span class="txt">4.1 統計レポートの追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_71f1851451987b78" target="bookBody"><span class="txt">4.2 統計レポート変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_c0fe48e249bec4fe" target="bookBody"><span class="txt">4.3 統計レポートの削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/stats.html#r_d74ddc1ba457c501" target="bookBody"><span class="txt">4.4 統計レポート設定</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html" target="bookBody"><span class="txt">モニタリング</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_01ef860dd2316d79" target="bookBody"><span class="txt">1 概要</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_d6bdb506a39c4423" target="bookBody"><span class="txt">2 送受信メールステータス</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_7698ebb3892f7c4f" target="bookBody"><span class="txt">3 ログ</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_e89ad81782738a7b" target="bookBody"><span class="txt">3.1 メールログ</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_fd5cd9f242f40d62" target="bookBody"><span class="txt">メールログの検索</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_8d3a126932a43866" target="bookBody"><span class="txt">スパムメール/正常メール登録</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_f5043770b2911299" target="bookBody"><span class="txt">メールログ更新</span></a></p>
								</li>
							</ul>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_41458db078529749" target="bookBody"><span class="txt">3.2 ログ設定</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_73e42701e825374f" target="bookBody"><span class="txt">4 システムステータス</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_8cde56481b152488" target="bookBody"><span class="txt">4.1 プロセスステータス</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_76fe5b6af6c553cd" target="bookBody"><span class="txt">4.2 リソースステータス</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_429a175bcfadf3ab" target="bookBody"><span class="txt">4.3 メール処理ステータス</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_fca1e1b80e3d4d56" target="bookBody"><span class="txt">4.4 MTAスレッドステータス</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_a8853079c76923d5" target="bookBody"><span class="txt">4.5 遮断中のIPアドレス検索</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_fcd5b4d39c76489c" target="bookBody"><span class="txt">4.6 キューモニタリング</span></a></p>
							<ul class="depth_4">
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_c05134a8addd4561" target="bookBody"><span class="txt">キュー検索</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_98a5f25a24eb3c95" target="bookBody"><span class="txt">キュー削除</span></a></p>
								</li>
								<li class="depth_4">
									<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_b2ef4739976e6117" target="bookBody"><span class="txt">キュー転送</span></a></p>
								</li>
							</ul>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_562a40b3a1d63abd" target="bookBody"><span class="txt">5 お問合わせ/警告メール</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_19c7bba7043518a8" target="bookBody"><span class="txt">5.1 お問合わせ</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/monitoring.html#r_4c3e5a55997ca555" target="bookBody"><span class="txt">5.2 警告メール設定</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/mobility.html" target="bookBody"><span class="txt">モバイル</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/mobility.html#r_99ae7076c9163470" target="bookBody"><span class="txt">1 モバイルアプリのバージョン管理</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/mobility.html#r_ef0a5ba8ff02dcca" target="bookBody"><span class="txt">1.1 モバイルアプリのバージョン追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/mobility.html#r_247a29bd4312bf18" target="bookBody"><span class="txt">1.2 モバイルアプリのバージョン追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/mobility.html#r_cb32d043196d4e5b" target="bookBody"><span class="txt">1.3 モバイルアプリのバージョン削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/mobility.html#r_ca7712ad913804a7" target="bookBody"><span class="txt">1.4 モバイルアプリバージョンフィルタリング</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html" target="bookBody"><span class="txt">その他</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_4e8228e68914cd6c" target="bookBody"><span class="txt">1 IPグループ設定</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_30fb26353d20af5a" target="bookBody"><span class="txt">1.1 IPグループ追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_de511ec7c4fbd063" target="bookBody"><span class="txt">1.2 IPグループ更新</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_7f042543cf1a1010" target="bookBody"><span class="txt">1.3 IPグループ削除</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_79ac39650fd97f2f" target="bookBody"><span class="txt">2 初期化</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_d40e2e60b533bd52" target="bookBody"><span class="txt">3 保存期間設定</span></a></p>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/others.html#r_f59be3f3d243133e" target="bookBody"><span class="txt">4 パスワード探し設定</span></a></p>
				</li>
			</ul>
		</li>
		<li class="depth_1">
			<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html" target="bookBody"><span class="txt">管理者</span></a></p>
			<ul class="depth_2">
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_de0980da9b43c422" target="bookBody"><span class="txt">1 管理者リスト</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_9e7b015baacf10ea" target="bookBody"><span class="txt">1.1 管理者の追加</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_083cf3cd00763b15" target="bookBody"><span class="txt">1.2 管理者の変更</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_cf48350c60cdc9eb" target="bookBody"><span class="txt">1.3 管理者の削除</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_60920f9d64bff684" target="bookBody"><span class="txt">1.4 管理者検索</span></a></p>
						</li>
					</ul>
				</li>
				<li class="depth_2">
					<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_fda649bf15a01aa8" target="bookBody"><span class="txt">2 管理者ログ</span></a></p>
					<ul class="depth_3">
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_1b914e749a1c7196" target="bookBody"><span class="txt">2.1 管理者ログのリスト</span></a></p>
						</li>
						<li class="depth_3">
							<p class="title"><a href="${baseUrl}help/${brandUrl}/${locale}/system/admins.html#r_b86362f3c9db8f96" target="bookBody"><span class="txt">2.2 管理履歴の検索</span></a></p>
						</li>
					</ul>
				</li>
			</ul>
		</li>
	</ul>
</div></body></html>

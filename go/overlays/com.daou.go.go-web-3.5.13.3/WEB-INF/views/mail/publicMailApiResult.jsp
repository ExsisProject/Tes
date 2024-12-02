<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page isELIgnored="false"%>
<%@ taglib prefix="c"  uri="/WEB-INF/tld/c.tld"%>
<%@ taglib prefix="fn"  uri="/WEB-INF/tld/fn.tld"%>
<!DOCTYPE html>
<head>
<script type="text/javascript" src="/resources/js/vendors/jquery/jquery-1.7.2.min.js"></script>

<title><c:if test="${apiType eq 'read'}">${messageRead.subject}</c:if></title>
</head>
<body>
	<c:if test="${apiType eq 'list'}">
		<table border="1" width="100%">
			<tbody>
				<tr>
					<th>msgUid</th>
					<th>subject</th> 
					<th>personName</th>
					<th>personEmail</th>
					<th>sentDate</th>
					<th>size</th>
				</tr>
				<c:forEach var="message" items="${messagelist}">
				<tr>
					<th>${message.uid}</th>
					<th>${message.subject}</th>
					<th>${message.fromToSimple}</th>
					<th>${message.from}</th>
					<th>${message.sentDateUtc}</th>
					<th>${message.size}</th>
				</tr>
				</c:forEach>	
			</tbody>
		</table>
	</c:if>
	<c:if test="${apiType eq 'read'}">
	<table border="1" width="100%">
		<tbody>
			<tr>
				<th>folder</th>
				<td>${messageRead.folderFullName}</td>
			</tr>
			<tr>
				<th>sentDate</th>
				<td>${messageRead.dateUtc}</td>
			</tr>
			<tr>
				<th>from</th>
				<td>
					<c:choose>
						<c:when test="${empty messageRead.from}">
							${messageRead.fromHidden}
						</c:when>
						<c:otherwise>
							${messageRead.from}&lt;${messageRead.fromHidden}&gt;
						</c:otherwise>
					</c:choose>					
				</td>
			</tr>
			<tr>
				<th>to</th>
				<td>
					<c:forEach var="to" items="${messageRead.toList}" varStatus="loop">						
						<c:choose>
							<c:when test="${empty to.personal}">
								${to.address}
							</c:when>
							<c:otherwise>
								"${to.personal}"&lt;${to.address}&gt;
							</c:otherwise>
						</c:choose>
						${!loop.last ? ',' : ''}
					</c:forEach>
				</td>
			</tr>
			<tr>
				<th>cc</th>
				<td>
					<c:forEach var="cc" items="${messageRead.ccList}" varStatus="loop">						
						<c:choose>
							<c:when test="${empty cc.personal}">
								${cc.address}
							</c:when>
							<c:otherwise>
								"${cc.personal}"&lt;${cc.address}&gt;
							</c:otherwise>
						</c:choose>
						${!loop.last ? ',' : ''}
					</c:forEach>
				</td>
			</tr>
			<tr>
				<th>
					contents
				</th>
			<td>
			${messageRead.htmlContent}
			</div>
			</td>
	</tr>
	</tbody></table>
	</c:if>
</body>
</html>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page session="false" %>
<!DOCTYPE html>
<html>
<head>
	<script type="text/javascript" src="/resources/js/core-lib/jquery-1.7.2.js"></script>
	<script type="text/javascript" src="/resources/js/go-lib/go-jssdk.js"></script>	
	<script type="text/javascript" src="/resources/js/sample/json2.js"></script>
	<script type="text/javascript" src="/resources/js/sample/go-w.js"></script>
	
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Hello~ GO! - GroupOffice Home</title>
  <link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
  <script type="text/javascript">
 		 
  </script> 
</head>
<body>
  <h1>Terrace Mail Suite Users</h1> <a href="<c:url value="/logout"/>"><B>Logout</B></a>
  <p>Total : <c:out value="${totalCount}" /></p>
  <p>page/total : <c:out value="${page}" /> / <c:out value="${totalPage}" /></p>  
  <table border="1" cellspacing="1" width="90%">
    <tr>
      <th>id</th>
      <th>title</th>
      <th>email</th>
    </tr>    
    <c:forEach items="${users}" var="user">
    <tr>
      <td><c:out value="${user.id}"/></td>
      <td><c:out value="${user.name}"/></td>
      <td><c:out value="${user.email}"/></td>
    </tr>
    </c:forEach>
  </table>
  <p>
      <c:forEach var="index" begin="1" end="${totalPage}" step="1">
      <a href="<c:url value="/user/list"><c:param name="page" value="${index}" /></c:url>">[${index}]</a>
      </c:forEach>
  </p>
  <p>
    <form name="userSearch" action="<c:url value="/user/search" />" method="post">
        <input type="text" name="keyword" value="" />
        <input type="submit" name="submitButton" value="Search" /> 
    </form>
  </p>
  
  <p> <a href="javascript:GO.userListTest()"> JSON </a> </p>  

  <div id="resultPanel"></div>
  
</body>
</html>
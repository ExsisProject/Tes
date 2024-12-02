<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>

<%@page import="com.daou.go.common.util.DeviceUtil"%>
<%@page import="org.springframework.mobile.device.Device"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions"  prefix="fn"%>
<%@taglib uri="http://www.springframework.org/tags" prefix="spring"%>

<%
    if(DeviceUtil.isMobile(request)){
%>
	<jsp:include page="mobile_500.jsp"></jsp:include>
<%
	}else{
%>
	<jsp:include page="web_500.jsp"></jsp:include>
<%
	    
	}
%>
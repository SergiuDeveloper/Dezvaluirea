<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf8");
header("Access-Control-Allow_Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-Width");

define("HTTP_OK", 200);
define("HTTP_BAD_REQUEST", 400);
define("HTTP_INTERNAL_SERVER_ERROR", 500);

error_reporting(0);

foreach ($_GET as $urlParameterKey => $urlParameterValue) {
	$isValidParameter = TRUE;
	
	$urlParameterValueCopy = str_replace(' ', '', $urlParameterValue);
	$isValidParameter = ctype_alnum($urlParameterValueCopy);
	
	if (!$isValidParameter)
	{
		http_response_code(HTTP_BAD_REQUEST);
		exit;
	}
}

class EndPointLogic {
	public static function SendHTTPResponse($responseObject) {
		echo json_encode($responseObject, JSON_UNESCAPED_UNICODE); 
	}
}

?>
<?php

include_once "CommonLogic/EndPointLogic.php";
include_once "Models/ArticleModel.php";
include_once "../Logic/ArticleLogic.php";

$successfullyRetrievedArticle = TRUE;

try {
	$articleID = $_GET["ArticleID"];
	
	$article = ArticleLogic::GetArticle($articleID);
	
	$articleModel = new ArticleModel();
	$articleModel->Article = $article;
	
	EndPointLogic::SendHTTPResponse($articleModel);
}
catch (Exception $exception) {
	$successfullyRetrievedArticle = FALSE;
}

http_response_code($successfullyRetrievedArticle ? HTTP_OK : HTTP_INTERNAL_SERVER_ERROR);

?>
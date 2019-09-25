<?php

include_once "CommonLogic/EndPointLogic.php";
include_once "Models/ArticlePreviewsModel.php";
include_once "../Logic/ArticlePreviewsLogic.php";

$successfullyRetrievedArticlePreviews = TRUE;

try {
	$categoryID = $_GET["CategoryID"];
	$articlesToSkipCount = $_GET["ArticlesToSkipCount"];
	$articlesToTakeCount = $_GET["ArticlesToTakeCount"];
	
	$articlePreviews = ArticlePreviewsLogic::GetArticlePreviews($categoryID, $articlesToSkipCount, $articlesToTakeCount);
	
	$articlePreviewsModel = new ArticlePreviewsModel();
	$articlePreviewsModel->ArticlePreviewsArray = $articlePreviews;
	
	EndPointLogic::SendHTTPResponse($articlePreviewsModel);
}
catch (Exception $exception) {
	$successfullyRetrievedArticlePreviews = FALSE;
}

http_response_code($successfullyRetrievedArticlePreviews ? HTTP_OK : HTTP_INTERNAL_SERVER_ERROR);

?>
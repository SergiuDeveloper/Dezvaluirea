<?php

include_once "CommonLogic/EndPointLogic.php";
include_once "Models/ArticlePreviewsModel.php";
include_once "../Logic/ArticlePreviewsLogic.php";

$successfullyRetrievedArticlePreviews = TRUE;

try {
	$categoryID = $_GET["CategoryID"];
	$searchKeywords = $_GET["SearchKeywords"];
	$articlesToSkipCount = $_GET["ArticlesToSkipCount"];
	$articlesToTakeCount = $_GET["ArticlesToTakeCount"];
	
	$useCategoryID = ($categoryID != null);
	
	$articlePreviews = ArticlePreviewsLogic::GetArticlePreviews($useCategoryID, $useCategoryID ? $categoryID : $searchKeywords, $articlesToSkipCount, $articlesToTakeCount);
	
	$articlePreviewsModel = new ArticlePreviewsModel();
	$articlePreviewsModel->ArticlePreviewsArray = $articlePreviews;
	
	EndPointLogic::SendHTTPResponse($articlePreviewsModel);
}
catch (Exception $exception) {
	$successfullyRetrievedArticlePreviews = FALSE;
}

http_response_code($successfullyRetrievedArticlePreviews ? HTTP_OK : HTTP_INTERNAL_SERVER_ERROR);

?>
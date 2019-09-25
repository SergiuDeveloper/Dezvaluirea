<?php

include_once "CommonLogic/EndPointLogic.php";
include_once "Models/CategoriesModel.php";
include_once "../Logic/CategoriesLogic.php";

$successfullyRetrievedCategories = TRUE;

try {
	$categories = CategoriesLogic::GetCategories();
	
	$categoriesModel = new CategoriesModel();
	$categoriesModel->CategoriesArray = $categories;
	
	EndPointLogic::SendHTTPResponse($categoriesModel);
}
catch (Exception $exception) {
	$successfullyRetrievedCategories = FALSE;
}

http_response_code($successfullyRetrievedCategories ? HTTP_OK : HTTP_INTERNAL_SERVER_ERROR);

?>
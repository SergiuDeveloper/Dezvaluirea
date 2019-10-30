<?php

include_once "CommonLogic/DatabaseLogic.php";
include_once "../Classes/ArticlePreview.php";

class ArticlePreviewsLogic {
	public static function GetArticlePreviews($useCategoryID, $searchTerm, $articlesToSkipCount, $articlesToTakeCount) {
		if (!$useCategoryID)
			$searchTerm = str_replace(" ", "|", $searchTerm);
		
		$databaseConnection = DatabaseLogic::GetConnection();
		
		$getArticlePreviewsQuery = sprintf($useCategoryID ? self::$getArticlePreviewsByCategoryIDQuery : self::$getArticlePreviewsByKeywordsQuery, $searchTerm, $articlesToTakeCount, $articlesToSkipCount);
		
		$dbStatement = $databaseConnection->prepare($getArticlePreviewsQuery);
		$dbStatement->execute();
		
		$articlePreviews = array();
		while ($dbArticlePreview = $dbStatement->fetch(PDO::FETCH_ASSOC)) {
			extract($dbArticlePreview);
			
			$getArticlePreviewThumbnailQueryToExecute = sprintf(self::$getArticlePreviewThumbnailQuery, $ID);
			
			$dbSecondaryStatement = $databaseConnection->prepare($getArticlePreviewThumbnailQueryToExecute);
			$dbSecondaryStatement->execute();
			
			$dbArticlePreviewThumbnailURL = $dbSecondaryStatement->fetch(PDO::FETCH_ASSOC);
			extract($dbArticlePreviewThumbnailURL);
			
			$articlePreview = new ArticlePreview();
			$articlePreview->ID = $ID;
			$articlePreview->Title = $Title;
			$articlePreview->Content = $Content;
			$articlePreview->ThumbnailURL = $ThumbnailURL;
			
			array_push($articlePreviews, $articlePreview);
		}
		
		return $articlePreviews;
	}
	
	private static $getArticlePreviewsByCategoryIDQuery = "
		SELECT wp_posts.ID AS ID, wp_posts.post_title AS Title, wp_posts.post_content AS Content
			FROM wp_posts
			INNER JOIN wp_term_relationships
					ON wp_posts.ID = wp_term_relationships.object_id
			INNER JOIN wp_term_taxonomy
					ON wp_term_relationships.term_taxonomy_id = wp_term_taxonomy.term_taxonomy_id
			WHERE wp_posts.post_type = 'post' AND wp_posts.post_status = 'publish' AND wp_term_taxonomy.taxonomy = 'category' AND wp_term_taxonomy.term_taxonomy_id = %d
				ORDER BY wp_posts.post_date DESC
			LIMIT %d
			OFFSET %d
	";
	
	private static $getArticlePreviewsByKeywordsQuery = "
		SELECT wp_posts.ID AS ID, wp_posts.post_title AS Title, wp_posts.post_content AS Content
		FROM wp_posts
		WHERE wp_posts.post_type = 'post' AND wp_posts.post_status = 'publish' AND CONCAT(wp_posts.post_title, wp_posts.post_content) REGEXP '%s'
        ORDER BY wp_posts.post_date DESC
		LIMIT %d
		OFFSET %d
	";
	
	private static $getArticlePreviewThumbnailQuery = "
		SELECT wp_posts.guid as ThumbnailURL
			FROM wp_posts
			INNER JOIN wp_postmeta
				ON wp_posts.ID = wp_postmeta.meta_value
			WHERE wp_postmeta.post_id = %d AND wp_posts.post_type = 'attachment' AND wp_postmeta.meta_key = '_thumbnail_id'
			LIMIT 1
	";
}

?>
<?php

include_once "CommonLogic/DatabaseLogic.php";
include_once "../Classes/Article.php";
include_once "../Classes/ArticleMedia.php";

class ArticleLogic {
	public static function GetArticle($articleID) {
		$databaseConnection = DatabaseLogic::GetConnection();
		
		$dbStatement = $databaseConnection->prepare(self::$getArticleQuery);
		$dbStatement->bindValue(1, $articleID, PDO::PARAM_INT);
		$dbStatement->execute();
		
		$dbArticle = $dbStatement->fetch(PDO::FETCH_ASSOC);
		extract($dbArticle);
		
		$dbSecondaryStatement = $databaseConnection->prepare(self::$getArticleCategoriesQuery);
		$dbSecondaryStatement->bindValue(1, $articleID, PDO::PARAM_INT);
		$dbSecondaryStatement->execute();
		
		$CategoryNamesArray = array();
		while ($dbCategory = $dbSecondaryStatement->fetch(PDO::FETCH_ASSOC)) {
			extract($dbCategory);
			
			$categoryName = $Name;
			
			array_push($CategoryNamesArray, $categoryName);
		}
		
		$dbTertiaryStatement = $databaseConnection->prepare(self::$getArticleThumbnailURLQuery);
		$dbTertiaryStatement->bindValue(1, $articleID, PDO::PARAM_INT);
		$dbTertiaryStatement->execute();
		
		$dbThumbnailURL = $dbTertiaryStatement->fetch(PDO::FETCH_ASSOC);
		extract($dbThumbnailURL);
		
		$MediaArray = array();
		
		$imageIDsArray = self::GetImageIDs($Content);
		$imageIDsParamsPattern = implode(",", array_fill(0, count($imageIDsArray), "?"));
		self::$getArticleImagesArrayQuery = str_replace("?", $imageIDsParamsPattern, self::$getArticleImagesArrayQuery);
		
		$dbQuaternaryStatement = $databaseConnection->prepare(self::$getArticleImagesArrayQuery);
		$imageIDsIterator = 1;
		foreach ($imageIDsArray as $imageID) {
			$dbQuaternaryStatement->bindValue($imageIDsIterator, $imageID, PDO::PARAM_INT);
			++$imageIDsIterator;
		}
		$dbQuaternaryStatement->execute();
		
		while ($dbImage = $dbQuaternaryStatement->fetch(PDO::FETCH_ASSOC)) {
			extract($dbImage);
			
			$media = new ArticleMedia();
			$media->ID = $ID;
			$media->URL = $MediaURL;
			
			array_push($MediaArray, $media);
		}
		
		$dbQuinaryStatement = $databaseConnection->prepare(self::$getArticleVideosArrayQuery);
		$dbQuinaryStatement->bindValue(1, $articleID, PDO::PARAM_INT);
		$dbQuinaryStatement->execute();
		
		while ($dbVideo = $dbQuinaryStatement->fetch(PDO::FETCH_ASSOC)) {
			extract($dbVideo);
			
			$media = new ArticleMedia();
			$media->ID = $ID;
			$media->URL = $MediaURL;
			
			array_push($MediaArray, $media);
		}
		
		$article = new Article();
		$article->Title = $Title;
		$article->Content = $Content;
		$article->CreationDate = $CreationDate;
		$article->CategoryNamesArray = $CategoryNamesArray;
		$article->ThumbnailURL = $ThumbnailURL;
		$article->MediaArray = $MediaArray;
		
		return $article;
	}
	
	private static function GetImageIDs($articleContent) {
		$stringFindOffset = 0;
		$imageIDsArray = array();
  
		$foundString = TRUE;
		while ($foundString) {
			$stringFindLeftResult = strpos($articleContent, self::$galleryTagLeftDelimiter, $stringFindOffset);
  
			if (getType($stringFindLeftResult) == 'boolean' && $stringFindLeftResult == FALSE)
			$foundString = FALSE;
			else {
				$stringFindRightResult = strpos($articleContent, self::$galleryTagRightDelimiter, $stringFindLeftResult + strlen(self::$galleryTagLeftDelimiter));
   
				if (getType($stringFindRightResult) == 'boolean' && $stringFindRightResult == FALSE)
					$foundString = FALSE;
				else {
					$imageIDsString = substr($articleContent, $stringFindLeftResult + strlen(self::$galleryTagLeftDelimiter), $stringFindRightResult - $stringFindLeftResult - strlen(self::$galleryTagLeftDelimiter));
					$imageIDs = explode(self::$galleryTagImageIDsDelimiter, $imageIDsString);
              
					foreach ($imageIDs as $imageID)
						array_push($imageIDsArray, $imageID);
              
					$stringFindOffset = $stringFindRightResult + strlen(self::$galleryTagRightDelimiter);
				}
			}
		}
  
		return $imageIDsArray;
	}
	
	private static $getArticleQuery = "
		SELECT post_title as Title, post_content as Content, post_date as CreationDate 
			FROM wp_posts
			WHERE ID = ? AND post_type = 'post' AND post_status = 'publish'
			LIMIT 1
	";
	
	private static $getArticleCategoriesQuery = "
		SELECT wp_terms.name AS Name
			FROM wp_term_taxonomy
			INNER JOIN wp_terms
				ON wp_term_taxonomy.term_id = wp_terms.term_id
           	INNER join wp_term_relationships
            	ON wp_term_taxonomy.term_taxonomy_id = wp_term_relationships.term_taxonomy_id
			WHERE wp_term_taxonomy.taxonomy = 'category' AND wp_term_taxonomy.count > 0 AND wp_term_relationships.object_id = ?
	";
	
	private static $getArticleThumbnailURLQuery = "
		SELECT wp_posts.guid as ThumbnailURL
			FROM wp_posts
			INNER JOIN wp_postmeta
				ON wp_posts.ID = wp_postmeta.meta_value
			WHERE wp_postmeta.post_id = ? AND wp_posts.post_type = 'attachment' AND wp_postmeta.meta_key = '_thumbnail_id'
			LIMIT 1
	";
	
	private static $getArticleImagesArrayQuery = "
		SELECT ID as ID, guid as MediaURL 
			FROM wp_posts
			WHERE ID IN (?) AND post_type = 'attachment'
	";
	
	private static $getArticleVideosArrayQuery = "
		SELECT meta_id AS ID, meta_value as MediaURL
			FROM wp_postmeta
			WHERE post_id = ? AND meta_key = 'enclosure'
	";
	
	private static $galleryTagLeftDelimiter = 'ids="';
	
	private static $galleryTagRightDelimiter = '"';
	
	private static $galleryTagImageIDsDelimiter = ',';
}

?>
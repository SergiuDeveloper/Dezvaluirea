<?php

include_once "CommonLogic/DatabaseLogic.php";
include_once "../Classes/Category.php";

class CategoriesLogic {
	public static function GetCategories() {
		$databaseConnection = DatabaseLogic::GetConnection();
		
		$dbStatement = $databaseConnection->prepare(self::$getCategoriesQuery);
		$dbStatement->execute();
		
		$categories = array();
		while ($dbCategory = $dbStatement->fetch(PDO::FETCH_ASSOC)) {
			extract($dbCategory);
			
			$category = new Category();
			$category->ID = $ID;
			$category->Name = $Name;
			
			array_push($categories, $category);
		}
		
		return $categories;
	}
	
	private static $getCategoriesQuery = "
		SELECT wp_term_taxonomy.term_id AS ID, wp_terms.name AS Name
			FROM wp_term_taxonomy
			INNER JOIN wp_terms
				ON wp_term_taxonomy.term_id = wp_terms.term_id
			WHERE wp_term_taxonomy.taxonomy = 'category' AND wp_term_taxonomy.count > 0
	";
}

?>
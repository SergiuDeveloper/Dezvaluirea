<?php

class DatabaseLogic {
	public static function GetConnection() {
		$dbConnection = new PDO(sprintf("mysql:host=%s;dbname=%s;charset=UTF8", self::$dbHost, self::$dbName), self::$dbUsername, self::$dbPassword);
		
		return $dbConnection;
	}
	
	private static $dbHost = "localhost";
	private static $dbName = "r55657dezv_2018";
	private static $dbUsername = "r55657dezv";
	private static $dbPassword = "=9ftl11]J53;";
}

?>
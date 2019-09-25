<?php

class DatabaseLogic {
	public static function GetConnection() {
		$dbConnection = new PDO('mysql:host=' . self::$host . ';dbname=' . self::$db_name . ';charset=UTF8', self::$username, self::$password);
		
		return $dbConnection;
	}
	
	private static $host = '*';
	private static $db_name = '*';
	private static $username = '*';
	private static $password = '*';
}

?>
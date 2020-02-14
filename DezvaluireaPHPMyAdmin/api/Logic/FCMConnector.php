<?php

include_once "CommonLogic/DatabaseLogic.php";
include_once "../Classes/FCMNotification.php";
include_once "../Classes/HTTPRequestHeader.php";
include_once "../Classes/FCMHTTPRequestData.php";

class FCMConnector {
    public static function SendNotifications() {
        $databaseConnection = DatabaseLogic::GetConnection();

        $dbStatement = $databaseConnection->prepare(self::$getFCMNotificationPostIDsQuery);
        $dbStatement->execute();

        $notificationPostIDs = array();
        while ($dbNotificationPostID = $dbStatement->fetch(PDO::FETCH_ASSOC)) {
            extract($dbNotificationPostID);

            array_push($notificationPostIDs, $PostID);
        }

        foreach ($notificationPostIDs as $notificationPostID) {
            $dbSecondaryStatement = $databaseConnection->prepare(self::$getArticleQuery);
            $dbSecondaryStatement->bindValue(1, $notificationPostID, PDO::PARAM_INT);
            $dbSecondaryStatement->execute();

            $dbArticle = $dbSecondaryStatement->fetch(PDO::FETCH_ASSOC);
            extract($dbArticle);

            $dbTertiaryStatement = $databaseConnection->prepare(self::$deleteFCMNotificationPostIDQuery);
            $dbTertiaryStatement->bindValue(1, $notificationPostID, PDO::PARAM_INT);
            $dbTertiaryStatement->execute();

            self::SendNotification($Title, $Content);
        }
    }

    private static function SendNotification($notificationTitle, $notificationMessage) {
        if (strlen($notificationTitle) > self::$FCMNotificationTitleSizeLimit) {
            $notificationTitle = substr($notificationTitle, 0, self::$FCMNotificationTitleSizeLimit);
            $notificationTitle = sprintf("%s...", $notificationTitle);
        }
        if (strlen($notificationMessage) > self::$FCMNotificationBodySizeLimit) {
            $notificationMessage = substr($notificationMessage, 0, self::$FCMNotificationBodySizeLimit);
            $notificationMessage = sprintf("%s...", $notificationMessage);
        }

        $httpHeader = [
            "Authorization: key=" . self::$FCMAPI,
            "Content-Type: application/json"
        ];
        
        $notificationObject = [
            "title" => $notificationTitle,
            "body"  => $notificationMessage,
            "icon"  => "",
            "sound" => ""
        ];

        $extraNotificationDataObject = [
            "message" => $notificationObject
        ];

        $androidNotificationDataObject = [
            "priority" => "high"
        ];

        $fcmNotificationObject = [
            "to"           => self::$FCMNotificationTarget,
            "notification" => $notificationObject,
            "data"         => $extraNotificationDataObject,
            "priority"     => "high",
            "android"      => $androidNotificationDataObject
        ];

        $curlObject = curl_init();
        curl_setopt($curlObject, CURLOPT_URL, self::$FCMURL);
        curl_setopt($curlObject, CURLOPT_POST, true);
        curl_setopt($curlObject, CURLOPT_HTTPHEADER, $httpHeader);
        curl_setopt($curlObject, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curlObject, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curlObject, CURLOPT_POSTFIELDS, json_encode($fcmNotificationObject));
        
        $result = curl_exec($curlObject);
        curl_close($curlObject);
    }

    private static $FCMNotificationTitleSizeLimit = 32;
    private static $FCMNotificationBodySizeLimit = 128;

    private static $FCMNotificationTarget = "/topics/all";
    private static $FCMAPI = "AAAAqvroSys:APA91bH23_nceNv-Esd2O4sJDkbObfXpJxAX3zHApwO3tAcXCxHX7po494ZOW0piIlGVs-vSTjC_cOs-0_TsITatkaMV524JBi0wnAKvF-Zz1HVuHexiN7VH5gof9eqKhvM_KewHgr0R";
    private static $FCMURL = "https://fcm.googleapis.com/fcm/send";

    private static $getFCMNotificationPostIDsQuery = "
        SELECT WP_POSTS_ID AS PostID FROM FCM_Notifications_Queue
    ";

    private static $deleteFCMNotificationPostIDQuery = "
        DELETE FROM FCM_Notifications_Queue
            WHERE WP_POSTS_ID = ?
    ";

    private static $getArticleQuery = "
		SELECT post_title as Title, post_content as Content
			FROM wp_posts
			WHERE ID = ? AND post_type = 'post' AND post_status = 'publish'
			LIMIT 1
	";
}

?>
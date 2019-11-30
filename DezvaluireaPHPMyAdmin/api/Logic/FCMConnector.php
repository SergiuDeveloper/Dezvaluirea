<?php

include_once "CommonLogic/DatabaseLogic.php";
include_once "../Classes/FCMNotification.php";
include_once "../Classes/HTTPRequestHeader.php";
include_once "../Classes/FCMHTTPRequestData.php";
include_once "../Classes/FCMHTTPRequestDataNotification.php";

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
            $getArticleQueryToExecute = sprintf(self::$getArticleQuery, $notificationPostID);

            $dbSecondaryStatement = $databaseConnection->prepare($getArticleQueryToExecute);
            $dbSecondaryStatement->execute();

            $dbArticle = $dbSecondaryStatement->fetch(PDO::FETCH_ASSOC);
            extract($dbArticle);

            $getArticleThumbnailURLQueryToExecute = sprintf(self::$getArticleThumbnailURLQuery, $notificationPostID);

            $dbTertiaryStatement = $databaseConnection->prepare($getArticleThumbnailURLQueryToExecute);
            $dbTertiaryStatement->execute();

            $dbArticleThumbnailURL = $dbTertiaryStatement->fetch(PDO::FETCH_ASSOC);
            extract($dbArticleThumbnailURL);

            $deleteFCMNotificationPostIDQueryToExecute = sprintf(self::$deleteFCMNotificationPostIDQuery, $notificationPostID);

            $dbQuaternaryStatement = $databaseConnection->prepare($deleteFCMNotificationPostIDQueryToExecute);
            $dbQuaternaryStatement->execute();

            self::SendNotification($Title, $ThumbnailURL, $Content);
        }
    }

    private static function SendNotification($notificationTitle, $notificationImageURL, $notificationMessage) {
        $fcmNotification = new FCMNotification();
        $fcmNotification->Title = $notificationTitle;
        $fcmNotification->Image = $notificationImageURL;
        $fcmNotification->Message = $notificationMessage;

        self::SendNotificationPostRequest($fcmNotification);
    }

    private static function SendNotificationPostRequest($fcmNotification) {
        $postRequestHeader = new HTTPRequestHeader();
        $postRequestHeader->Authorization = sprintf("key=%s", self::$FCMAPI);
        $postRequestHeader->ContentType = "application/json";

        $postRequestData = new HTTPRequestData();
        $postRequestData->To = self::$FCMNotificationTarget;
        $postRequestData->Notification = new FCMHTTPRequestDataNotification();
        $postRequestData->Notification->Title = $fcmNotification->Title;
        $postRequestData->Notification->Body = $fcmNotification->Message;
        $postRequestData->Data = $fcmNotification;
        $postRequestDataJSON = json_encode($postRequestData);
    
        $curlHandler = curl_init();

        curl_setopt($curlHandler, CURLOPT_URL, self::$FCMURL);
        curl_setopt($curlHandler, CURLOPT_POST, true);
        curl_setopt($curlHandler, CURLOPT_HTTPHEADER, $postRequestHeader);
        curl_setopt($curlHandler, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curlHandler, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curlHandler, CURLOPT_POSTFIELDS, $postRequestDataJSON);

        curl_exec($curlHandler);
    }

    private static $FCMNotificationTarget = "/topics/all";
    private static $FCMAPI = "AIzaSyBAEFfxPoUnW3DW5YW1jjHcnwq76pslfVI";
    private static $FCMURL = "https://fcm.googleapis.com/fcm/send";

    private static $getFCMNotificationPostIDsQuery = "
        SELECT WP_POSTS_ID AS PostID FROM FCM_Notifications_Queue
    ";

    private static $deleteFCMNotificationPostIDQuery = "
        DELETE FROM FCM_Notifications_Queue
            WHERE PostID = %d
    ";

    private static $getArticleQuery = "
		SELECT post_title as Title, post_content as Content
			FROM wp_posts
			WHERE ID = %d AND post_type = 'post' AND post_status = 'publish'
			LIMIT 1
	";

    private static $getArticleThumbnailURLQuery = "
		SELECT wp_posts.guid as ThumbnailURL
			FROM wp_posts
			INNER JOIN wp_postmeta
				ON wp_posts.ID = wp_postmeta.meta_value
			WHERE wp_postmeta.post_id = %d AND wp_posts.post_type = 'attachment' AND wp_postmeta.meta_key = '_thumbnail_id'
			LIMIT 1
	";
}

?>
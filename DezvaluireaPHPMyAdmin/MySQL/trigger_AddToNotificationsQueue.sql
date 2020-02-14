IF NEW.post_type = 'post' AND NEW.post_status = 'publish' THEN
	INSERT INTO FCM_Notifications_Queue(WP_POSTS_ID) VALUES(NEW.ID);
END IF
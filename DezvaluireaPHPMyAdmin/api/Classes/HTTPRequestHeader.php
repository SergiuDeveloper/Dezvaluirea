<?php

class HTTPRequestHeader {
    public $Authorization;
    public $ContentType;

    public function GetEncodedHTTPHeader() {
        $encodedHTTPHeader = array(
            sprintf("%s%s", self::AuthorizationTemplate, $this->Authorization),
            sprintf("%s%s", self::ContentTypeTemplate, $this->ContentType)
        );

        return $encodedHTTPHeader;
    }
    
    public static $AuthorizationTemplate = "Authorization: ";
    public static $ContentTypeTemplate = "Content-Type: ";
}

?>
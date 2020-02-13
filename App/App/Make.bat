@ECHO OFF

cordova platform rm android && ^
cordova platform add android@6.2.2 && ^
cordova run android --device
rem cordova platform add https://github.com/apache/cordova-android
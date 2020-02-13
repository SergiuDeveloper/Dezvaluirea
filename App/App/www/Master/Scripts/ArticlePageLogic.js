"use strict";

class ArticleBinder {
    static async Populate(articleID) {
        $('#loadMoreArticlePreviewsButton').hide();
        $('#loadingAnimation').show();

        GlobalVariables.ArticlesToSkipCount = 0;
        $('#contentPlaceholder')[0].innerHTML = PageInitialization.ClearPageContent($('#contentPlaceholder')).innerHTML;
        $('#categoryName').hide();

        var templateHTMLControl = (await ControlsBinder.GetControlTemplate('Article'))[0];
        if (templateHTMLControl == null || typeof templateHTMLControl === 'undefined')
            return;

        var categoryTemplateHTMLControl = (await ControlsBinder.GetControlTemplate('CategoryLabel'))[0];
        if (categoryTemplateHTMLControl == null || typeof categoryTemplateHTMLControl === 'undefined')
            return;

        var articleHTTPGetParameters = {
            ArticleID: articleID
        };
        var articleControl = (await EndPointsHandler.Get('Article', articleHTTPGetParameters)).Article;
        if (articleControl == null || typeof articleControl === 'undefined')
            return;

        var populatedTemplateHTMLControl = templateHTMLControl;

        populatedTemplateHTMLControl.getElementsByClassName('articleTitle')[0].innerHTML = articleControl.Title;
        populatedTemplateHTMLControl.getElementsByClassName('articleDate')[0].textContent = articleControl.CreationDate;
        populatedTemplateHTMLControl.getElementsByClassName('articleThumbnail')[0].src = articleControl.ThumbnailURL;

        var categoryNamesArray = articleControl.CategoryNamesArray;
        var populatedCategoryTemplateHTMLControl;
        categoryNamesArray.forEach(function (categoryNamesIterator) {
            populatedCategoryTemplateHTMLControl = document.createElement('label');
            populatedCategoryTemplateHTMLControl.innerHTML = categoryTemplateHTMLControl.innerHTML;

            populatedCategoryTemplateHTMLControl.getElementsByClassName('categoryName')[0].textContent = categoryNamesIterator;

            populatedTemplateHTMLControl.getElementsByClassName('articleCategoriesLister')[0].append(populatedCategoryTemplateHTMLControl);
        });

        populatedTemplateHTMLControl.getElementsByClassName('articleContent')[0].innerHTML = articleControl.Content;
        populatedTemplateHTMLControl.getElementsByClassName('articleContent')[0].innerHTML =
            ArticleBinder.AddMediaToArticleContentObject(populatedTemplateHTMLControl.getElementsByClassName('articleContent')[0], articleControl.MediaArray);
        
        $('#contentPlaceholder').append($(populatedTemplateHTMLControl));

        $('#loadingAnimation').hide();
    }

    static AddMediaToArticleContentObject(articleContentObject, mediaArray) {
        var articleContentObjectType = $(articleContentObject).prop('tagName');

        var auxilliaryArticleContentObject = document.createElement(articleContentObjectType);
        auxilliaryArticleContentObject.innerHTML = '';

        var lastGalleryLinkRightLimitIndex = 0;
        var galleryLinkLeftDelimiterIndex;
        var galleryLinkRightDelimiterIndex;
        var galleryLinksIDsArrayString;
        var galleryLinksIDsArray;
        var galleryLinkID;
        var mediaURL;
        var mediaControl;
        while ((galleryLinkLeftDelimiterIndex = articleContentObject.innerHTML.indexOf(GlobalVariables.GalleryLinkLeftDelimiter, lastGalleryLinkRightLimitIndex)) != -1 &&
            (galleryLinkRightDelimiterIndex =
            articleContentObject.innerHTML.indexOf(GlobalVariables.GalleryLinkRightDelimiter, galleryLinkLeftDelimiterIndex + GlobalVariables.GalleryLinkLeftDelimiter.length)) != -1) {
            auxilliaryArticleContentObject.innerHTML += articleContentObject.innerHTML.substring(lastGalleryLinkRightLimitIndex, galleryLinkLeftDelimiterIndex);

            galleryLinksIDsArrayString = articleContentObject.innerHTML.substring(galleryLinkLeftDelimiterIndex + GlobalVariables.GalleryLinkLeftDelimiter.length, galleryLinkRightDelimiterIndex);
            galleryLinksIDsArray = galleryLinksIDsArrayString.split(GlobalVariables.GalleryLinkIDDelimiter);
            for (var galleryLinksIDsArrayIterator = 0; galleryLinksIDsArrayIterator < galleryLinksIDsArray.length; ++galleryLinksIDsArrayIterator) {
                galleryLinkID = parseInt(galleryLinksIDsArray[galleryLinksIDsArrayIterator]);

                mediaURL = ArticleBinder.GetMediaURLByMediaID(mediaArray, galleryLinkID);
                if (mediaURL != null) {
                    mediaControl = document.createElement('img');
                    mediaControl.className = 'article_image_attachment';
                    mediaControl.src = mediaURL;

                    auxilliaryArticleContentObject.appendChild(mediaControl);
                }
            }

            lastGalleryLinkRightLimitIndex = galleryLinkRightDelimiterIndex + GlobalVariables.GalleryLinkRightDelimiter.length;
        }

        auxilliaryArticleContentObject.innerHTML += articleContentObject.innerHTML.substring(lastGalleryLinkRightLimitIndex);

        articleContentObject.innerHTML = '';
        var lastVideoLinkRightLimitIndex = 0;
        var videoLinkLeftDelimiterIndex;
        var videoLinkRightDelimiterIndex;
        var videoURL;
        while ((videoLinkLeftDelimiterIndex = auxilliaryArticleContentObject.innerHTML.indexOf(GlobalVariables.VideoLinkLeftDelimiter, lastVideoLinkRightLimitIndex)) != -1 &&
            (videoLinkRightDelimiterIndex =
            auxilliaryArticleContentObject.innerHTML.indexOf(GlobalVariables.VideoLinkRightDelimiter, videoLinkLeftDelimiterIndex + GlobalVariables.VideoLinkLeftDelimiter.length)) != -1) {
            articleContentObject.innerHTML += auxilliaryArticleContentObject.innerHTML.substring(lastVideoLinkRightLimitIndex, videoLinkLeftDelimiterIndex);

            videoURL = auxilliaryArticleContentObject.innerHTML.substring(videoLinkLeftDelimiterIndex + GlobalVariables.VideoLinkLeftDelimiter.length, videoLinkRightDelimiterIndex);
            if (videoURL != '') {
                mediaControl = document.createElement('video');
                mediaControl.className = 'article_video';
                mediaControl.src = videoURL;
                mediaControl.setAttribute("controls", "controls");

                articleContentObject.appendChild(mediaControl);
            }

            lastVideoLinkRightLimitIndex = videoLinkRightDelimiterIndex + GlobalVariables.VideoLinkRightDelimiter.length;
        }

        articleContentObject.innerHTML += auxilliaryArticleContentObject.innerHTML.substring(lastVideoLinkRightLimitIndex);

        return articleContentObject.innerHTML;
    }

    static GetMediaURLByMediaID(mediaArray, mediaID) {
        for (var mediaArrayIterator = 0; mediaArrayIterator < mediaArray.length; ++mediaArrayIterator)
            if (mediaArray[mediaArrayIterator].ID == mediaID)
                return mediaArray[mediaArrayIterator].URL;

        return null;
    }
}
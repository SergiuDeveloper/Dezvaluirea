"use strict";

class ArticlePreviewListerBinder {
    static async Populate(reloadResults, searchByCategoryID, searchTerm, categoryName, isBackButtonClick) {
        if (reloadResults) {
            GlobalVariables.ArticlesToSkipCount = 0;

            $('#contentPlaceholder')[0].innerHTML = PageInitialization.ClearPageContent($('#contentPlaceholder')).innerHTML;

            if (!isBackButtonClick) {
                GlobalVariables.CurrentSearchIsByCategoryID = searchByCategoryID;

                if (GlobalVariables.CurrentSearchIsByCategoryID)
                    GlobalVariables.CurrentSearchCategoryID = searchTerm;
                else {
                    searchTerm = ArticlePreviewListerBinder.ValidateSearchKeywords(searchTerm);

                    GlobalVariables.CurrentSearchKeywords = searchTerm;
                }

                $('#categoryName')[0].textContent = (searchByCategoryID ? categoryName : GlobalVariables.SearchKeywordsCategoryName);
            }
        }

        var articlePreviewsHTTPGetParameters = {
            ArticlesToSkipCount: GlobalVariables.ArticlesToSkipCount,
            ArticlesToTakeCount: GlobalVariables.ArticlesToTakeCount
        };
        if (GlobalVariables.CurrentSearchIsByCategoryID)
            articlePreviewsHTTPGetParameters.CategoryID = GlobalVariables.CurrentSearchCategoryID;
        else
            articlePreviewsHTTPGetParameters.SearchKeywords = GlobalVariables.CurrentSearchKeywords;

        var templateHTMLControl = (await ControlsBinder.GetControlTemplate('ArticlePreview'))[0];
        if (templateHTMLControl == null || typeof templateHTMLControl === 'undefined')
            return;

        var articlePreviewsArrayObject = await EndPointsHandler.Get('ArticlePreviews', articlePreviewsHTTPGetParameters);
        if (articlePreviewsArrayObject == null || typeof articlePreviewsArrayObject === 'undefined')
            return;

        var articlePreviewsArray = articlePreviewsArrayObject.ArticlePreviewsArray;
        if (articlePreviewsArray == null || typeof articlePreviewsArray === 'undefined')
            return;

        var articlePreviewsListerInnerHTML = '';

        var populatedHTMLControl;
        articlePreviewsArray.forEach(function (articlePreviewsIterator) {
            articlePreviewsIterator.Title = ArticlePreviewListerBinder.ValidateArticleTextField(articlePreviewsIterator.Title, GlobalVariables.MaximumArticlePreviewTitleLength);
            articlePreviewsIterator.Content = ArticlePreviewListerBinder.ValidateArticleTextField(articlePreviewsIterator.Content, GlobalVariables.MaximumArticlePreviewTextContentLength);

            populatedHTMLControl = document.createElement('div');
            populatedHTMLControl.innerHTML = templateHTMLControl.innerHTML;

            populatedHTMLControl.getElementsByClassName('articlePreviewTitle')[0].textContent = articlePreviewsIterator.Title;
            populatedHTMLControl.getElementsByClassName('articlePreviewThumbnail')[0].src = articlePreviewsIterator.ThumbnailURL;
            populatedHTMLControl.getElementsByClassName('articlePreviewContent')[0].textContent = articlePreviewsIterator.Content;
            populatedHTMLControl.getElementsByClassName('articlePreviewArticleLink')[0].href =
                populatedHTMLControl.getElementsByClassName('articlePreviewArticleLink')[0].href.replace('{ArticleID}', articlePreviewsIterator.ID);
            populatedHTMLControl.getElementsByClassName('articlePreviewThumbnailArticleLink')[0].href = populatedHTMLControl.getElementsByClassName('articlePreviewArticleLink')[0].href;

            $('#contentPlaceholder').append($(populatedHTMLControl));

            ++GlobalVariables.ArticlesToSkipCount;
        });

        $('#loadMoreArticlePreviewsButton').show();
        $('#categoryName').show();
    }

    static async LoadMoreArticlePreviews() {
        ArticlePreviewListerBinder.Populate(false, GlobalVariables.CurrentSearchIsByCategoryID,
            GlobalVariables.CurrentSearchIsByCategoryID ? GlobalVariables.CurrentSearchCategoryID : GlobalVariables.CurrentSearchKeywords);
    }

    static ValidateArticleTextField(articleTextField, maximumTextFieldLength) {
        var auxiliaryHTMLElement = document.createElement('div');
        auxiliaryHTMLElement.innerHTML = articleTextField;
        articleTextField = auxiliaryHTMLElement.innerText;

        var newArticleTextField = '';
        var lastGalleryLinkRightLimitIndex = 0;
        var galleryLinkLeftDelimiterIndex;
        var galleryLinkRightDelimiterIndex;
        while ((galleryLinkLeftDelimiterIndex = articleTextField.indexOf(GlobalVariables.GalleryLinkLeftDelimiter, lastGalleryLinkRightLimitIndex)) != -1 &&
            (galleryLinkRightDelimiterIndex =
            articleTextField.indexOf(GlobalVariables.GalleryLinkRightDelimiter, galleryLinkLeftDelimiterIndex + GlobalVariables.GalleryLinkLeftDelimiter.length)) != -1) {
            newArticleTextField += articleTextField.substring(lastGalleryLinkRightLimitIndex, galleryLinkLeftDelimiterIndex);

            lastGalleryLinkRightLimitIndex = galleryLinkRightDelimiterIndex + GlobalVariables.GalleryLinkRightDelimiter.length;
        }

        newArticleTextField += articleTextField.substring(lastGalleryLinkRightLimitIndex);
        articleTextField = newArticleTextField;

        newArticleTextField = '';
        var lastVideoLinkRightLimitIndex = 0;
        var videoLinkLeftDelimiterIndex;
        var videoLinkRightDelimiterIndex;
        while ((videoLinkLeftDelimiterIndex = articleTextField.indexOf(GlobalVariables.VideoLinkLeftDelimiter, lastVideoLinkRightLimitIndex)) != -1 &&
            (videoLinkRightDelimiterIndex =
            articleTextField.indexOf(GlobalVariables.VideoLinkRightDelimiter, videoLinkLeftDelimiterIndex + GlobalVariables.VideoLinkLeftDelimiter.length)) != -1) {
            newArticleTextField += articleTextField.substring(lastVideoLinkRightLimitIndex, videoLinkLeftDelimiterIndex);

            lastVideoLinkRightLimitIndex = videoLinkRightDelimiterIndex + GlobalVariables.VideoLinkRightDelimiter.length;
        }

        newArticleTextField += articleTextField.substring(lastVideoLinkRightLimitIndex);
        articleTextField = newArticleTextField;

        if (articleTextField.length > maximumTextFieldLength) {
            if (articleTextField[maximumTextFieldLength] == ' ')
                while (maximumTextFieldLength > 0 && articleTextField[maximumTextFieldLength] == ' ')
                    --maximumTextFieldLength;
            else
                while (maximumTextFieldLength < articleTextField.length - 1 && articleTextField[maximumTextFieldLength + 1] != ' ')
                    ++maximumTextFieldLength;
            ++maximumTextFieldLength;

            if (articleTextField.length > maximumTextFieldLength)
                articleTextField = articleTextField.substring(0, maximumTextFieldLength);
            articleTextField += '...';
        }

        return articleTextField;
    }

    static ValidateSearchKeywords(searchKeywords) {
        if (typeof searchKeywords === 'undefined' || searchKeywords == null || searchKeywords == '')
            return '';

        var validatedSearchKeywords = '';

        var currentChar;
        var isCharValid;
        var isCharAlphaNumeric;
        var isCharSpace;
        var isPreviousCharSpace = false;
        for (var searchTermIterator = 0; searchTermIterator < searchKeywords.length; ++searchTermIterator) {
            currentChar = searchKeywords[searchTermIterator];
            isCharAlphaNumeric = Miscellaneous.IsCharAlphaNumeric(currentChar);
            isCharSpace = Miscellaneous.IsCharSpace(currentChar);

            isCharValid = false;
            if (isCharAlphaNumeric)
                isCharValid = true;
            if (isCharSpace && !isPreviousCharSpace)
                isCharValid = true;

            if (isCharValid)
                validatedSearchKeywords += currentChar;

            isPreviousCharSpace = isCharSpace;
        }

        validatedSearchKeywords = validatedSearchKeywords.trim();

        if (typeof validatedSearchKeywords === 'undefined' || validatedSearchKeywords == null || validatedSearchKeywords == '')
            return '';

        return validatedSearchKeywords;
    }
}
class ArticlePreviewListerBinder {
    static async Populate(categoryID, articlesToSkipCount, articlesToTakeCount) {
        var templateHTMLControl = (await ControlsBinder.GetControlTemplate('ArticlePreview'))[0];
        if (templateHTMLControl == null || templateHTMLControl == undefined)
            return;

        var articlePreviewsHTTPGetParameters = {
            CategoryID: categoryID,
            ArticlesToSkipCount: articlesToSkipCount,
            ArticlesToTakeCount: articlesToTakeCount
        };
        var articlePreviewsArrayObject = await EndPointsHandler.Get('ArticlePreviews', articlePreviewsHTTPGetParameters);
        if (articlePreviewsArrayObject == null || articlePreviewsArrayObject == undefined)
            return;

        var articlePreviewsArray = articlePreviewsArrayObject.ArticlePreviewsArray;
        if (articlePreviewsArray == null || articlePreviewsArray == undefined)
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
            populatedHTMLControl.getElementsByClassName('articlePreviewArticleLink')[0].setAttribute('data-articleid', articlePreviewsIterator.ID);

            $('#contentPlaceholder').append($(populatedHTMLControl));
        });
    }

    static ValidateArticleTextField(articleTextField, maximumTextFieldLength) {
        var auxiliaryHTMLElement = document.createElement("div");
        auxiliaryHTMLElement.innerHTML = articleTextField;
        articleTextField = auxiliaryHTMLElement.innerText;

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
}
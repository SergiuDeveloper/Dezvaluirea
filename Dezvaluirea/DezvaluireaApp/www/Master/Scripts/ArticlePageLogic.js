"use strict";

class ArticleBinder {
    static async Populate(articleID) {
        $('#loadMoreArticlePreviewsButton').hide();

        GlobalVariables.ArticlesToSkipCount = 0;
        $('#contentPlaceholder')[0].innerHTML = PageInitialization.ClearPageContent($('#contentPlaceholder')).innerHTML;
        $('#categoryName')[0].textContent = '';

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
        
        $('#contentPlaceholder').append($(populatedTemplateHTMLControl));
    }
}
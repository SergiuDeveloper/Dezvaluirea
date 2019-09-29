class ControlsBinder {
    GetControlTemplate(controlName) {
        var categoryLinkTemplate;

        window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + 'www/PageControls/' + controlName + '.html', (fileEntry) => {
            fileEntry.file(function (fileEntity) {
                var fileReader = new FileReader();

                fileReader.onloadend = function () {
                    categoryLinkTemplate = this.result;
                }

                fileReader.readAsText(fileEntity);
            });
        });

        return categoryLinkTemplate;
    }
}

class EndPointsHandler {
    Get(endPointName, endPointParameters) {
        var jsonDecodedObject;

        $.get('https://www.dezvaluirea.ro/api/EndPoints/' + endPointName + 'EndPoint.php', endPointParameters, function (retrievedData) {
            jsonDecodedObject = JSON.parse(retrievedData);
        });

        return jsonDecodedObject;
    }
}

class CategoryListerBinder {
    Populate() {
        var categoryLinkTemplate = ControlsBinder.GetControlTemplate('CategoryLink');

        var categoriesArray = EndPointsHandler.Get('Categories');

        var categoryLinksListerInnerHTML = '';

        var populatedCategoryLinkTemplate;
        categoriesArray.forEach((categoryIterator) => {
            populatedCategoryLinkTemplate = categoryLinkTemplate;

            populatedCategoryLinkTemplate = populatedCategoryLinkTemplate.replace('{0}', categoryIterator.ID);
            populatedCategoryLinkTemplate = populatedCategoryLinkTemplate.replace('{1}', categoryIterator.Name);

            categoryLinksListerInnerHTML += populatedCategoryLinkTemplate + '<br>';
        });

        categoryLinksLister.innerHTML = categoryLinksListerInnerHTML;
    }
}

class ArticlePreviewListerBinder {
    Populate(categoryID, articlesToSkipCount, articlesToTakeCount) {
        var articlePreviewLinkTemplate = ControlsBinder.GetControlTemplate('ArticlePreview');

        var articlePreviewsHTTPGetParameters = {
            CategoryID: categoryID,
            ArticlesToSkipCount: articlesToSkipCount,
            ArticlesToTakeCount: articlesToTakeCount
        };
        var articlePreviewsArray = EndPointsHandler.Get('ArticlePreviews', articlePreviewsHTTPGetParameters);

        var articlePreviewsListerInnerHTML = '';

        var populatedArticlePreviewLinkTemplate;
        categoriesArray.forEach((categoryIterator) => {
            populatedArticlePreviewLinkTemplate = categoryLinkTemplate;

            populatedArticlePreviewLinkTemplate = populatedArticlePreviewLinkTemplate.replace('{0}', categoryIterator.Title);
            populatedArticlePreviewLinkTemplate = populatedArticlePreviewLinkTemplate.replace('{1}', categoryIterator.ThumbnailURL);
            populatedArticlePreviewLinkTemplate = populatedArticlePreviewLinkTemplate.replace('{2}', categoryIterator.Content);
            populatedArticlePreviewLinkTemplate = populatedArticlePreviewLinkTemplate.replace('{3}', categoryIterator.ID);

            articlePreviewsListerInnerHTML += populatedArticlePreviewLinkTemplate + '<br>';
        });

        articlePreviewsLister.innerHTML = articlePreviewsListerInnerHTML;
    }
}

$(document).on('deviceready', function () {
});
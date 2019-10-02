"use strict";

class GlobalVariables {
    static CategoryIDStorageVariableName = 'CategoryID';

    static DefaultCategoryID = null;
    static DefaultCategoryName = 'Deschidere';

    static ArticlesToTakeCount = 10;
    static ArticlesToSkipCount = 0;

    static MaximumArticlePreviewTitleLength = 100;
    static MaximumArticlePreviewTextContentLength = 300;
}

class ControlsBinder {
    static async GetControlTemplate(controlName) {
        var controlHTMLContent;

        await $.ajax({
            url: '../PageControls/' + controlName + '.html',
            type: 'GET'
        }).done(function (retrievedData) {
            controlHTMLContent = retrievedData;
        }).fail(function () {
            controlHTMLContent = null;
        });

        return controlHTMLContent;
    }
}

class EndPointsHandler {
    static async Get(endPointName, endPointParameters) {
        var jsonDecodedObject;

        await $.ajax({
            url: 'https://www.dezvaluirea.ro/api/EndPoints/' + endPointName + 'EndPoint.php',
            type: 'GET',
            data: endPointParameters,
            dataType: 'json'
        }).done(function (retrievedData) {
            jsonDecodedObject = retrievedData;
        }).fail(function () {
            jsonDecodedObject = null;
        });

        return jsonDecodedObject;
    }
}

class CategoryListerBinder {
    static async Populate() {
        var categoryLinkTemplate = await ControlsBinder.GetControlTemplate('CategoryLink');
        if (categoryLinkTemplate == null || categoryLinkTemplate == undefined)
            return;

        var categoriesArrayObject = await EndPointsHandler.Get('Categories');
        if (categoriesArrayObject == null || categoriesArrayObject == undefined)
            return;
        var categoriesArray = categoriesArrayObject.CategoriesArray;
        if (categoriesArray == null || categoriesArray == undefined)
            return;

        var categoryLinksListerInnerHTML = '';

        var populatedCategoryLinkTemplate;
        categoriesArray.forEach(function (categoryIterator) {
            populatedCategoryLinkTemplate = categoryLinkTemplate;

            populatedCategoryLinkTemplate = populatedCategoryLinkTemplate.replace('{ID}', categoryIterator.ID);
            populatedCategoryLinkTemplate = populatedCategoryLinkTemplate.replace('{Name}', categoryIterator.Name);

            categoryLinksListerInnerHTML += populatedCategoryLinkTemplate + '<br>';

            if (categoryIterator.Name == GlobalVariables.DefaultCategoryName)
                GlobalVariables.DefaultCategoryID = categoryIterator.ID;
        });

        categoryLinksLister.innerHTML = categoryLinksListerInnerHTML;
    }
}

class ArticlePreviewListerBinder {
    static async Populate(categoryID, articlesToSkipCount, articlesToTakeCount) {
        var articlePreviewLinkTemplate = await ControlsBinder.GetControlTemplate('ArticlePreview');
        if (articlePreviewLinkTemplate == null || articlePreviewLinkTemplate == undefined)
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

        var populatedArticlePreviewLinkTemplate;
        articlePreviewsArray.forEach(function (categoryIterator) {
            categoryIterator.Title = ArticlePreviewListerBinder.ValidateArticleTextField(categoryIterator.Title, GlobalVariables.MaximumArticlePreviewTitleLength);
            categoryIterator.Content = ArticlePreviewListerBinder.ValidateArticleTextField(categoryIterator.Content, GlobalVariables.MaximumArticlePreviewTextContentLength);

            populatedArticlePreviewLinkTemplate = articlePreviewLinkTemplate;

            populatedArticlePreviewLinkTemplate = populatedArticlePreviewLinkTemplate.replace('{Title}', categoryIterator.Title);
            populatedArticlePreviewLinkTemplate = populatedArticlePreviewLinkTemplate.replace('{ThumbnailURL}', categoryIterator.ThumbnailURL);
            populatedArticlePreviewLinkTemplate = populatedArticlePreviewLinkTemplate.replace('{Content}', categoryIterator.Content);
            populatedArticlePreviewLinkTemplate = populatedArticlePreviewLinkTemplate.replace('{ID}', categoryIterator.ID);

            articlePreviewsListerInnerHTML += populatedArticlePreviewLinkTemplate + '<br>';
        });

        articlePreviewsLister.innerHTML = articlePreviewsListerInnerHTML;
    }

    static ValidateArticleTextField(articleTextField, maximumTextFieldLength) {
        if (articleTextField.length > maximumTextFieldLength)
            articleTextField = articleTextField.substring(0, maximumTextFieldLength);

        var auxiliaryHTMLElement = document.createElement("div");
        auxiliaryHTMLElement.innerHTML = articleTextField;
        articleTextField = auxiliaryHTMLElement.innerText;

        return articleTextField;
    }
}

async function onDeviceReady() {
    await CategoryListerBinder.Populate();

    var categoryID = window.localStorage.getItem(GlobalVariables.CategoryIDStorageVariableName);

    var isStartingPage = (categoryID == null || categoryID == '');
    ArticlePreviewListerBinder.Populate(isStartingPage ? GlobalVariables.DefaultCategoryID : parseInt(categoryID), GlobalVariables.ArticlesToSkipCount, GlobalVariables.ArticlesToTakeCount);

    window.localStorage.removeItem(GlobalVariables.CategoryIDStorageVariableName);
}

document.addEventListener('deviceready', onDeviceReady, false);
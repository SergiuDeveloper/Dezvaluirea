﻿"use strict";

class GlobalVariables {
    static DefaultCategoryID = null;
    static DefaultCategoryName = 'Deschidere';
    static ForbiddenCategoryName = 'Uncategorized'

    static ArticlesToTakeCount = 10;
    static ArticlesToSkipCount = 0;

    static MaximumArticlePreviewTitleLength = 100;
    static MaximumArticlePreviewTextContentLength = 300;
}

class ControlsBinder {
    static async GetControlTemplate(controlName) {
        var templateHTMLControl = $(document.createElement('div'));
        templateHTMLControl.load('../PageControls/' + controlName + '.html');

        return templateHTMLControl;
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
        var templateHTMLControl = (await ControlsBinder.GetControlTemplate('CategoryLink'))[0];
        if (templateHTMLControl == null || templateHTMLControl == undefined)
            return;

        var categoriesArrayObject = await EndPointsHandler.Get('Categories');
        if (categoriesArrayObject == null || categoriesArrayObject == undefined)
            return;
        var categoriesArray = categoriesArrayObject.CategoriesArray;
        if (categoriesArray == null || categoriesArray == undefined)
            return;

        categoriesArray = CategoryListerBinder.ValidateCategoriesArray(categoriesArray);

        var populatedHTMLControl;
        categoriesArray.forEach(function (categoryIterator) {
            if (categoryIterator.Name == GlobalVariables.ForbiddenCategoryName)
                return; //  continue with the next forEach iteration

            populatedHTMLControl = document.createElement('div');
            populatedHTMLControl.innerHTML = templateHTMLControl.innerHTML;

            populatedHTMLControl.getElementsByClassName('categoryURL')[0].textContent = categoryIterator.Name;
            populatedHTMLControl.getElementsByClassName('categoryURL')[0].setAttribute('data-categoryid', categoryIterator.ID);

            $('#categoryLinksLister').append(populatedHTMLControl);

            if (categoryIterator.Name == GlobalVariables.DefaultCategoryName)
                GlobalVariables.DefaultCategoryID = categoryIterator.ID;
        });
    }

    static ValidateCategoriesArray(categoriesArray) {
        var defaultCategoryIndex = categoriesArray.findIndex(x => x.Name == GlobalVariables.DefaultCategoryName);
        if (defaultCategoryIndex != -1) {
            var swapVariable = categoriesArray[0];

            categoriesArray[0] = categoriesArray[defaultCategoryIndex];
            categoriesArray[defaultCategoryIndex] = swapVariable;
        }

        var forbiddenCategoryIndex = categoriesArray.findIndex(x => x.Name == GlobalVariables.ForbiddenCategoryName);
        if (forbiddenCategoryIndex != -1)
            categoriesArray.splice(forbiddenCategoryIndex, 1);

        return categoriesArray;
    }
}

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

            $('#articlePreviewsLister').append($(populatedHTMLControl));
        });
    }

    static ValidateArticleTextField(articleTextField, maximumTextFieldLength) {
        var auxiliaryHTMLElement = document.createElement("div");
        auxiliaryHTMLElement.innerHTML = articleTextField;
        articleTextField = auxiliaryHTMLElement.innerText;

        if (articleTextField.length > maximumTextFieldLength) {
            articleTextField = articleTextField.substring(0, maximumTextFieldLength);
            articleTextField += '...';
        }

        return articleTextField;
    }
}

async function onDeviceReady() {
    await CategoryListerBinder.Populate();
    ArticlePreviewListerBinder.Populate(GlobalVariables.DefaultCategoryID, GlobalVariables.ArticlesToSkipCount, GlobalVariables.ArticlesToTakeCount);
}

document.addEventListener('deviceready', onDeviceReady, false);
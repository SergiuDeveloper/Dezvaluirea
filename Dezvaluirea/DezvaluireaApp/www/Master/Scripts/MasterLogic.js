"use strict";

class GlobalVariables {
    static DefaultCategoryID = null;
    static DefaultCategoryName = 'Deschidere';
    static ForbiddenCategoryName = 'Uncategorized';
    static SearchKeywordsCategoryName = 'Rezultate Cautare';

    static ArticlesToTakeCount = 10;
    static ArticlesToSkipCount = 0;

    static CurrentSearchIsByCategoryID = true;
    static CurrentSearchCategoryID = -1;
    static CurrentSearchKeywords = '';

    static MaximumArticlePreviewTitleLength = 100;
    static MaximumArticlePreviewTextContentLength = 300;
}

class PageInitialization {
    static ClearPageContent(pageContentControl) {
        pageContentControl.innerHTML = '';

        return pageContentControl;
    }
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
        $('#categoryLinksLister').innerHTML = '';

        var templateHTMLControl = (await ControlsBinder.GetControlTemplate('CategoryLink'))[0];
        if (templateHTMLControl == null || typeof templateHTMLControl === 'undefined')
            return;

        var categoriesArrayObject = await EndPointsHandler.Get('Categories');
        if (categoriesArrayObject == null || typeof categoriesArrayObject === 'undefined')
            return;
        var categoriesArray = categoriesArrayObject.CategoriesArray;
        if (categoriesArray == null || typeof categoriesArray === 'undefined')
            return;

        categoriesArray = CategoryListerBinder.ValidateCategoriesArray(categoriesArray);

        GlobalVariables.DefaultCategoryID = CategoryListerBinder.GetDefaultCategoryID(categoriesArray);

        var populatedHTMLControl;
        categoriesArray.forEach(function (categoryIterator) {
            populatedHTMLControl = document.createElement('div');
            populatedHTMLControl.innerHTML = templateHTMLControl.innerHTML;

            populatedHTMLControl.getElementsByClassName('categoryURL')[0].textContent = categoryIterator.Name;
            populatedHTMLControl.getElementsByClassName('categoryURL')[0].href =
                populatedHTMLControl.getElementsByClassName('categoryURL')[0].href.replace('{CategoryID}', categoryIterator.ID).replace('{CategoryName}', categoryIterator.Name);

            $('#categoryLinksLister').append(populatedHTMLControl);
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

    static GetDefaultCategoryID(categoriesArray) {
        var defaultCategoryIndex = categoriesArray.findIndex(x => x.Name == GlobalVariables.DefaultCategoryName);
        if (defaultCategoryIndex == -1)
            return null;

        return categoriesArray[defaultCategoryIndex].ID;
    }
}
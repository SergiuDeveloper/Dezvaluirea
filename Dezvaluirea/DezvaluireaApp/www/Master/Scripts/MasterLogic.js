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

class MasterLogic {
    static async OnDeviceReady() {
        await CategoryListerBinder.Populate();
        ArticlePreviewListerBinder.Populate(GlobalVariables.DefaultCategoryID, GlobalVariables.ArticlesToSkipCount, GlobalVariables.ArticlesToTakeCount);
    }
}
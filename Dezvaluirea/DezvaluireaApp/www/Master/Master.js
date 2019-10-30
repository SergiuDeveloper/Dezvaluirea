"use strict";

document.addEventListener('deviceready', async function () {
    await CategoryListerBinder.Populate();

    ArticlePreviewListerBinder.Populate(true, true, GlobalVariables.DefaultCategoryID, GlobalVariables.DefaultCategoryName);
});
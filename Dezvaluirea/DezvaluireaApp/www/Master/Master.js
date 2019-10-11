"use strict";

document.addEventListener('deviceready', async function () {
    await CategoryListerBinder.Populate();
    ArticlePreviewListerBinder.Populate(GlobalVariables.DefaultCategoryID, GlobalVariables.DefaultCategoryName);
});
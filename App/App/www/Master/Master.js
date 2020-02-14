"use strict";

document.addEventListener("deviceready", async function () {
    FirebaseRegistration.Register();

    await CategoryListerBinder.Populate();

    ArticlePreviewListerBinder.Populate(true, true, GlobalVariables.DefaultCategoryID, GlobalVariables.DefaultCategoryName);
});
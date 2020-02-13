class SearchFunctionality {
    static SearchArticlesByKeywords() {
        var searchKeywordsInputText = $('#fixed-header-drawer-exp').val();
        if (searchKeywordsInputText.length == 0)
            searchKeywordsInputText = ' ';

        ArticlePreviewListerBinder.Populate(true, false, searchKeywordsInputText);

        $('#fixed-header-drawer-exp').val('');
    }
}
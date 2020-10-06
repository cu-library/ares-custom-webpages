// Copyright (c) 2018 Atlas Systems, Inc.
// Ares LTI Content Item functionality

$(function () {
    //Check if page is loaded with the AresLTI container from the Ares WebService
    if (window.name == 'AresLtiContentSelection_Web') {

        //Adds select buttons if the page has an ItemTable
        addContentItemSelectionButtons();

        //Hide features that should not display when loading via LTI Content Items
        ChangeToSingleColumnLayout();
    }
});

function ChangeToSingleColumnLayout() {
    //Remove the left sidebar menu
    $("utility").hide();

    //Change to single column layout
    $("body").attr('id', 'type-a');
}


function addContentItemSelectionButtons() {
    //Get all of the rows of the item table
    var itemTableRows = $('#ItemTable').find('tr');
    $(itemTableRows).each(function (index) {
        //Look for the first visible cell of the row
        var firstCell = $(this).find('td:visible:first');
        //Add a select button
        var itemId = $(firstCell).closest('[data-itemid]').attr('data-itemid');
        if (itemId > 0) {
            var cell = $(firstCell).prepend(createSelectButton(itemId));
        }
    });
}

function createSelectButton(itemId) {
    //Create a select button for a given item id
    var selectButton = $('<input/>').attr({
        type: 'button',
        class: 'ltiItemSelection',
        id: 'ltiSelectItem-' + itemId,
        value: 'Select'
    }).click(function (e) {
        e.preventDefault();
        selectLtiItem(itemId);
    });

    return selectButton
}

function selectLtiItem(itemId) {
    window.parent.postMessage(itemId, '*');
}
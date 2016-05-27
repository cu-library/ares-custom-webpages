// Copyright (c) 2015 Atlas Systems, Inc.
// Ares Batch Editing

function ToggleBatchTag(enabled, tableId, menuId) {
    $('#' + menuId).toggle();

    if (enabled) {
        if ($('#' + tableId + ' tbody tr[data-itemid]').length > 0) {
            //Enable batch tagging indicator on table
            $('#' + tableId).attr('data-batch-tagging-active', 1);

            //Show the batch tag columns
            $('#' + tableId + ' th.batchTag, #' + tableId + ' td.batchTag').show();

            //Add an empty header to the table title footer row
            $('#' + tableId + ' tfoot tr td').attr('colspan', $('#' + tableId + ' tfoot tr td').attr('colspan') + 1);

            if (ariaAlert) {
                ariaAlert('A batch edit form has been added to the page below this button. Use this form to specify the tags you wish to apply to multiple items. The course item table below now has a column to indicate if that course item should be included in the item batch.');
            }
        }
    }
    else {
        //Disable batch tagging indicator on table
        $('#' + tableId).attr('data-batch-tagging-active', 0);

        //Hide the batch tag columns
        $('th.batchTag,td.batchTag').hide();

        //Remove one of the columns from the footer colspan
        $('#' + tableId + ' tfoot tr td').attr('colspan', $('#' + tableId + ' tfoot tr td').attr('colspan') - 1);

        ariaAlert('The batch edit form has been removed from the page below this button. The Batch Edit checkbox column has been removed from the course items table below.');
    }
}

function UpdateItemTags(baseAjaxUrl, itemId) {
    var itemTags = $('#ItemTags' + itemId);

    //Look for ItemTags block for the item id. Only proceed if it can be found
    if (typeof itemTags !== "undefined") {
        var tagType = itemTags.attr('data-tagtype');

        $.ajax({
            method: 'GET',
            url: baseAjaxUrl,
            data: { Value: itemId, TagType: tagType },
            datatype: 'xml'
        })
        .done(function (data) {
            var code = $(data).find('araj_code');
            var message = $(data).find('araj_message');
            if ((typeof code !== "undefined") && (typeof message !== "undefined")) {
                if (code.text() === '1') {
                    $(itemTags).html(message.text());
                }
            }
            else {
                $(itemTags).append('<span class="error">Error updating tags</span>')
            }
        })
        .fail(function () {
            $(itemTags).append('<span class="error">Error updating tags</span>')
        });
    }
}

jQuery(document).ready(function ($) {
    //Determine if the button for batch editing should be visible
    $.each($('button.EnableBatchEditing'), function (index, button) {
        var tableId = $(button).attr('data-batchTable');
        if ($('#' + tableId + ' tbody tr[data-itemid]').length === 0) {
            //Remove the batch editing button if there are no items to batch edit
            $(button).remove();
        }
        else {
            //Add the batch editing columns as soon as the form is loaded. Toggling will later show/hide the columns.
            if ($('#' + tableId + ' tbody tr[data-itemid]').length > 0) {
                //Add an empty header to the table title header row
                $('#' + tableId + ' thead tr.row-header').prepend('<th class="batchTag" style="display:none;"></th>');

                //Add Batch Edit checkbox column header
                $('#' + tableId + ' thead tr.row-headings').prepend('<th class="batchTag" style="display:none;" scope="col" tabindex="0" aria-label="This column contains checkboxes that indicate if the tags specified in the batch edit form are applied to this row\'s item.">Batch Edit</th>');

                //Add Batch Edit checkbox to each row
                $('#' + tableId + ' tbody tr').prepend('<td class="batchTag" style="display:none;"><input class="addTag" type=checkbox aria-label="This checkbox indicates the tags specified in the batch edit form will be applied to this row\'s item." value="' + $(this).attr('data-itemid') + '"></td>');

                $('button[name=AddBatchTags]').attr('data-batchTable', tableId);
            }
        }
    });

    //Handle the clicking of the batch editing button
    $('button.EnableBatchEditing').click(function () {
        var button = $(this);
        var enabled = ($(button).text() === $(button).attr('data-enabletext'));

        if (enabled) {
            //Set the text to the disable text
            $(button).text($(button).attr('data-disabletext'));
        }
        else {
            //Set the text to the enable text
            $(button).text($(button).attr('data-enabletext'));
        }
        //Toggle the batch editing based on if we are enabling or disabling batch processing
        ToggleBatchTag(enabled, $(button).attr('data-batchTable'), $(button).attr('data-batchMenu'));
    });

    $('button[name=AddBatchTags]').click(function (event) {
        event.preventDefault();
        var baseAjaxUrl = $(this).attr('data-baseUrl');

        var tag = $('#batchForm').find('input[name=tag]').val();
        var tagger = $('#batchForm').find('input[name=tagger]:checked').val();

        var itemTable = $(this).attr('data-batchTable');

        //Get the checked items
        var checkedItemsArray = $('#' + itemTable).find('input:checkbox:checked').map(function () {
            return $(this).closest('tr').attr('data-itemid');
        }).get();

        var checkedItems = checkedItemsArray.join(',');

        var errors = new Array();

        if (tag === '') {
            errors.push('Please enter a tag');
        }

        if (checkedItems === '') {
            errors.push('Please select items to tag');
        }

        //Clear the errors regardless if success or not
        $('#batchErrors').html('');
        $('#batchErrors').removeClass('error success');

        if (errors.length === 0) {
            $.ajax({
                method: 'POST',
                url: baseAjaxUrl,
                data: { Tag: tag, Tagger: tagger, Items: checkedItems },
                datatype: 'xml'
            })
            .done(function (data) {
                var code = $(data).find('araj_code');
                var message = $(data).find('araj_message');
                if ((typeof code !== "undefined") && (typeof message !== "undefined")) {
                    if (code.text() === '1') {
                        $('#batchErrors').addClass('success');
                        $('#batchErrors').html('Updated tags');

                        //loop through each item id and get the tags for it

                        //Modify the ajax url to retrieve item tags, preserving the host & session id
                        var getItemTagsBaseUrl = baseAjaxUrl.replace('Type=787', 'Type=788');
                        for (var i = 0; i < checkedItemsArray.length; i++) {
                            UpdateItemTags(getItemTagsBaseUrl, checkedItemsArray[i]);
                        }

                        //Clear the tag textbox
                        $('#batchForm').find('input[name=tag]').val('');
                    }
                    else {
                        $('#batchErrors').addClass('error');
                        $('#batchErrors').html('Error: ' + message.text());
                    }
                }
                else {
                    $('#batchErrors').addClass('error');
                    $('#batchErrors').html('Error updating tags');
                }
            })
            .fail(function () {
                $('#batchErrors').addClass('error');
                $('#batchErrors').html('Error updating tags');
            });
        }
        else {
            //Build the individual errors
            var errorString = '';
            $.each(errors, function (index, value) {
                errorString = errorString + '<li>' + value + '</li>';
            });

            //Update the errors
            $('#batchErrors').addClass('error');
            $('#batchErrors').html('<ul>' + errorString + '</ul>');
        }
    });
});
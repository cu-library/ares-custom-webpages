// Copyright (c) 2018 Atlas Systems, Inc.
// Ares Batch Editing

(function () {
    // Queue for processing tag update retrievals
    var updateItemTagsQueue = async.queue(function (task, callback) {
        async.setImmediate(function () {
            UpdateItemTags(task.baseUrl, task.itemID, callback);
        });
    }, 5);

    // Drain for tag update retrieval processing queue
    updateItemTagsQueue.drain = function () {
        //Clear the tag textbox
        $('#batchForm').find('input[name=tag]').val('');
    };

    function ToggleBatchTag(enabled, batchElement, menuId) {
        $('#' + menuId).toggle();

        if (enabled) {

            if (($('#' + batchElement + ' tbody tr[data-itemid]').length > 0) || 
            ($('#' + batchElement + ' div.group-row').length > 0)) {
                //Enable batch tagging indicator on table
                $('#' + batchElement).attr('data-batch-tagging-active', 1);

                //Show the batch tag columns/divs
                $('#' + batchElement + ' th.batchTagHeader, #' + batchElement + ' td.batchTag, #' + batchElement + ' div.batchTag').show();

                //Add an empty header to the table title footer row
                $('#' + batchElement + ' tfoot tr td').attr('colspan', $('#' + batchElement + ' tfoot tr td').attr('colspan') + 1);

                if (ariaAlert) {
                    ariaAlert('A batch edit form has been added to the page below this button. Use this form to specify the tags you wish to apply to multiple items. The course items below now has a checkbox to indicate if that course item should be included in the item batch.');
                }
            }
            
            $('#' + menuId).find('button[name=AddBatchTags]').attr('data-batchElement', batchElement);

        }
        else {
            //Disable batch tagging indicator on table
            $('#' + batchElement).attr('data-batch-tagging-active', 0);

            $('#' + menuId).find('button[name=AddBatchTags]').attr('data-batchElement', null);

            //Hide the batch tag columns
            $('th.batchTagHeader,td.batchTag,div.batchTag').hide();

            //Remove one of the columns from the footer colspan
            $('#' + batchElement + ' tfoot tr td').attr('colspan', $('#' + batchElement + ' tfoot tr td').attr('colspan') - 1);

            ariaAlert('The batch edit form has been removed from the page below this button. The Batch Edit checkbox column has been removed from the course items below.');
        }
    }

    function UpdateItemTags(baseAjaxUrl, itemId, callback) {
        var items = itemId.split(',');

        $(items).each(function(index, value) {

            var itemTags = $('#ItemTags' + value);

            var courseIdParam = 0;
            if ((typeof courseId !== 'undefined') && (courseId !== null)) { 
                courseIdParam = courseId;
            }

            //Look for ItemTags block for the item id. Only proceed if it can be found
            if (typeof itemTags !== "undefined") {
                $.ajax({
                    method: 'GET',
                    url: baseAjaxUrl,
                    data: { Value: value, TagType:  itemTags.attr('data-tagtype'), CourseId: courseIdParam },
                    datatype: 'xml',
                    cache: false
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
        });
        callback();
    }

    function EnableBatchEditing(elementId, button) {
        
        if (($('#' + elementId + ' tbody tr[data-itemid]').length === 0) && 
            ($('#' + elementId + ' div.group-row').length === 0)) {
            //Remove the batch editing button if there are no items to batch edit
            $(button).remove();
        }
        else {
            //Add the batch editing columns as soon as the form is loaded. Toggling will later show/hide the columns.
            
            //Add an empty header to the table title header row
            $('#' + elementId).find('thead tr.row-header').prepend('<th class="batchTagHeader" style="display:none;"></th>');

            //Add Batch Edit checkbox column header
            $('#' + elementId).find('thead tr.row-headings').prepend('<th class="batchTagHeader" style="display:none;" scope="col" tabindex="0" aria-label="This column contains checkboxes that indicate if the tags specified in the batch edit form are applied to this row\'s item.">Batch Edit</th>');

            //Add Batch Edit checkbox to each row in table
            var batchCheckbox = $('<label class="batchTagLabel"><input class="addTag" type=checkbox aria-label="This checkbox indicates the tags specified in the batch edit form will be applied to this row\'s item."/></label>');

            //Add label text to checkbox
            if ($(button).attr('data-batchTagLabel')) {
                batchCheckbox.append($(button).attr('data-batchTagLabel'));
            }
            
            
            $('#' + elementId).find('tbody tr').addClass('batchEditTableRow').prepend($('<td/>').css({ display: 'none' }).addClass('batchTag'));
            
            //Add Batch Edit checkbox to each row when using group elements            
            $('#' + elementId).find('.batchEditGroup .group-row').after($('<div/>').css({ display: 'none' }).addClass('batchTag'));

            $('#' + elementId).find('.batchTag').append(batchCheckbox);

            $('#' + elementId).find('input.addTag').each(function() {
                var dataItemId = null;

                //Get the item-id of the current and descendents
                var parent = $(this).closest('.batchEditGroup[data-itemid],.batchEditTableRow[data-itemid]');
                var dataItems = $.merge(parent, $(this).closest('.batchEditGroup,.batchEditTableRow').find('[data-itemid]'));

                //Concatenate all of the data-itemids into a comma-separated list
                dataItemId = dataItems.map(function() { return $(this).attr('data-itemid'); }).get().join();

                $(this).val(dataItemId);
              });
        }
    }

    jQuery(document).ready(function ($) {
        //Determine if the button for batch editing should be visible
        $.each($('button.EnableBatchEditing'), function (index, button) {
            
            /* data-batchTable is the legacy attribute used for determining which element should have batch tagging added */
            var batchElement = $(button).attr('data-batchElement');
            if (!batchElement) {
                batchElement = $(button).attr('data-batchTable');
            }
            
            if (batchElement) {
                EnableBatchEditing(batchElement, button);
            }

            $(button).click(function () {
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
                ToggleBatchTag(enabled, batchElement, $(button).attr('data-batchMenu'));
            });
        });

        //Handle the clicking of the batch editing button
        $('button[name=AddBatchTags]').click(function (event) {
            event.preventDefault();
            var baseAjaxUrl = $(this).attr('data-baseUrl');

            var tag = $('#batchForm').find('input[name=tag]').val();
            var tagger = $('#batchForm').find('input[name=tagger]:checked').val();

            var batchElement = $(this).attr('data-batchElement');
            if (!batchElement) {
                batchElement = $(this).attr('data-batchTable');
            }
            //Get the checked items
            var checkedItemsArray = $('#' + batchElement).find('input:checkbox:checked.addTag').map(function () {
                return $(this).val();
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
                    datatype: 'xml',
                    cache: false
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
                                var task = {
                                    itemID: checkedItemsArray[i],
                                    baseUrl: getItemTagsBaseUrl
                                }

                                updateItemTagsQueue.push(task, function (err) {
                                    // Item processed
                                });
                            }
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
})();
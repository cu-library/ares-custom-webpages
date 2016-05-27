// Copyright (c) 2015 Atlas Systems, Inc.
// Ares DataTables for filtering grids
// Using http://datatables.net functionality

jQuery(document).ready(function ($) {

    //Add an input tag to every table header
    $('table.filterTable thead tr.row-headings th').each(function () {
        //First check if there is a column title. 
        var title = $(this).text();

        //If a title displays, allow filtering
        if (title !== '') {
            //Also check to make sure the data inside is text and not an input tag
            var items = [];

            // get row, cell, value
            var cellIndex = $(this).getNonColSpanIndex();

            //Iterate all td's in column to make sure there is text to filter
            $(this).closest('table').find('tbody tr td:nth-child(' + (cellIndex + 1) + ')').each(function () {
                //add item to array
                var text = jQuery.trim($(this).text());
                if (text !== '') {
                    items.push(text);
                }
            });

            //restrict array to unique items
            items = $.unique(items);

            if (items.length > 0) {
                //Add input to the column header. Size it to be the length of the placeholder text
                $(this).append('<br/><input class="dataTablesInputFilter" type="text" title="Column filter text" placeholder="Search ' + title + '" size="' + (title.length + 7) + '" />');
            }
        }
    });

    //Initialize the DataTable, removing paging, info, and the default search box that allows searching across all tables. 
    var table = $('table.filterTable').DataTable({
        "ordering": false,
        "paging": false,
        "dom": 'tr' //Filtering is removed so the default search box will not display above the table. 'l' - Length changing, 'f' - Filtering input, 't' - The table, 'i' - Information, 'p' - Pagination, 'r' - pRocessing 
    }).columns().every(function () {
        var that = this;

        $('input.dataTablesInputFilter', this.header()).on('keyup change', function () {
            //Add temporary activeFilterTable for limiting the FixRowStyles            
            $(this).closest('table').addClass('activeFilterTable');

            //Perform the search and update the table
            that
                .search(this.value)
                .draw();

            //Redo the alternating Ares row styles
            FixRowStyles("table.activeFilterTable", "row-odd", "row-even");

            //If batch tagging is active on table, redo the toggling if any changes were made
            if ($(this).closest('table').attr('data-batch-tagging-active') == 1) {
                $(this).closest('table').find('th.batchTag,td.batchTag').show();
            }
            else {
                $(this).closest('table').find('th.batchTag,td.batchTag').hide();
            }

            //Remove the temporary activeFilterTable used for limiting the FixRowStyles
            $(this).closest('table').removeClass('activeFilterTable');
        });
    });

    //Remove the aria roles that aren't correctly implemented
    $('tr[role="row"]').removeAttr('role');
    $('table[role="grid"]').removeAttr('role');

});

$.fn.getNonColSpanIndex = function () {
    if (!$(this).is('td') && !$(this).is('th'))
        return -1;

    var allCells = this.parent('tr').children();
    var normalIndex = allCells.index(this);
    var nonColSpanIndex = 0;

    allCells.each(
        function (i, item) {
            if (i == normalIndex)
                return false;

            var colspan = $(this).attr('colspan');
            colspan = colspan ? parseInt(colspan) : 1;
            nonColSpanIndex += colspan;
        }
    );

    return nonColSpanIndex;
};
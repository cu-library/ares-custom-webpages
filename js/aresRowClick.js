/*
 * Clicking on a row of a .student-table or a .instructor-table navigates to 
 * the href of the first a.row-click in that row. This script takes the 
 * anchor's original target into account, defaulting to _self.
*/
$(document).ready(function() {
    $('.instructor-table, .student-table').find('tbody > tr').find('td, td *').click(
        function(event) {
            
            var element = $(this);
            var parentRow = element.parents('tr').first();
            var link = parentRow.find('a.row-click').first();

            var validRowClick =
                // Make sure this row has a row-click link.
                link.length &&

                // The following elements should retain their default click
                // event handlers.
                !element.is('a') &&
                !element.is('input') &&
                !element.is('textarea') &&
                
                // Ignore cells that have input boxes, which are likely table 
                // column filters.
                !element.find('input').length &&
                !element.find('textarea').length;


            if (validRowClick) {
                window.open(link.attr('href'), link.attr('target') || '_self');
            }

            // Prevent this event from firing more than once, preserving other
            // click event handlers such as link navigation for <a> tags.
            event.stopPropagation();
        }
    );
});

function ariaAlert(message) {
    ariaAlertDiv = $("#aria-alert-div");

    if (ariaAlertDiv.length == 0) {
        ariaAlertDiv = $("<div></div>");
        ariaAlertDiv.attr("id", "aria-alert-div");
        ariaAlertDiv.attr("aria-live", "polite");
        ariaAlertDiv.addClass("offscreen");
        $(document.documentElement).append(ariaAlertDiv);
    }

    ariaAlertDiv.text(message);
}

function GetSemesterStartStop(semesterName) {   
    $.ajax({
        method: "GET",
        url: "ares.dll",
        data: { action: 70, type: 780, Value: semesterName },
        datatype: "xml"
    })
    .done(function (data) {
        var code = $(data).find("araj_code");
        var startDate = $(data).find("start");
        var endDate = $(data).find("end");

        if (typeof code !== "undefined") {
            if (code.text() === "1") {
                $("input[type=text][name^='ADate'").val(startDate.text());
                $("input[type=text][name^='IDate'").val(endDate.text());

                ariaAlert("Semester date ranges updated in table.");
            }
        }
    });
}

function DeleteAlert(alertID) {
    $.ajax({
        method: "GET",
        url: "ares.dll",
        data: { action: 70, type: 781, Value: alertID, SessionId: sessionid },
        datatype: "xml"
    })
    .done(function (data) {
        var code = $(data).find("araj_code");
        var removedAlertId = $(data).find("alertid");
        
        if ((typeof code !== "undefined") && (removedAlertId != "undefined")) {
            if (code.text() === "1") {
                //This will replace the Alert div with text                
                //$("#alert" + alertID).html("Alert deleted");

                //Uncomment to hide the alert that was deleted                
                //$("#alert" + alertID).hide();

                //This will make the alert message appear to slide up and disappear
                $("#alert" + alertID).slideUp();
            }
        }
    });
}

function ToggleHotList(obj,Action) {
    var actionType = 782; //Add to hot list    
    if (Action == 'del') {
        actionType = 783;        
    }

    $("input[name^='HotList']:checked").each(function () {
        var itemId = $(this).attr("name").replace("HotList", "");        
        $.ajax({
            method: "GET",
            url: "ares.dll",
            data: { action: 70, type: actionType, Value: itemId, SessionId: sessionid },
            async: true,
            datatype: "xml"
        })
        .done(function (data) {
            var code = $(data).find("araj_code");
            var hotListItemId = $(data).find("itemid");

            if ((typeof code !== "undefined") && (hotListItemId != "undefined")) {
                if (code.text() === "1") {                    

                    var actionMessage = "";
                    if ($(data).find("hotlistaction").text() == "del") {
                        actionMessage = "Removed";
                    }
                    else {
                        actionMessage = "Added";
                    }

                    $("input[name='HotList" + hotListItemId.text() + "']").parent().html(actionMessage);
                }
            }
        });
    });
}

function GetName(Username) {
    $.ajax({
        method: "GET",
        url: "ares.dll",
        data: { action: 70, type: 784, Value: Username },
        datatype: "xml"
    })
    .done(function (data) {
        var code = $(data).find("araj_code");
        var user = $(data).find("user");

        if ((typeof code !== "undefined") && (typeof user !== "undefined")) { 
            if (code.text() === "1") {
                var firstName = $(user).find("firstname").text();
                var lastName = $(user).find("lastname").text();
                
                $("#CourseInstructor").val(lastName + ', ' + firstName);
            }
        }
    });
}

function checkUniqueUsername(Username) {
    $.ajax({
        method: "GET",
        url: "ares.dll",
        data: { action: 70, type: 784, Value: Username },
        datatype: "xml"
    })
    .done(function (data) {
        var code = $(data).find("araj_code");
        var user = $(data).find("user");

        if ((typeof code !== "undefined") && (typeof user !== "undefined")) {
            if (code.text() === "1") {
                $("#usernamespan").addClass("usernameinuse").html("Username already in use.");
                $("#Username").focus();
            }
            else {
                $("#usernamespan").removeClass("usernameinuse fade").html("");
            }
        }
    });
}

$(function() {
    // 
    // Sets up state management for the getNewLoanPeriods function, then assigns the getNewLoanPeriods function.
    // 
    
    if ($('#PickupLocation').length <= 0) {
        return;
    }

    var _defaultLoanPeriodControl = $('<label for="LoanPeriod"><strong>Loan Period for Physical Items</strong><select name="LoanPeriod" id="LoanPeriod"></select><br></label>');
    var _loanPeriodControlSelect = $('');
    var _loanPeriodControlHidden = $('<input type="hidden" id="LoanPeriod" name="LoanPeriod" value="">');

    if ($('#LoanPeriodDiv select#LoanPeriod').length !== 0) {
        _loanPeriodControlSelect = $('#LoanPeriodDiv').children().clone();
        _loanPeriodControlSelect.find('option').remove();
    }
    else {
        _loanPeriodControlSelect = _defaultLoanPeriodControl.clone();
    }

    $('#PickupLocation').change(function (e) {
        //
        // GETs new loan periods from the Ares server based on the specified PickupLocation, then populates the #LoanPeriodDiv accordingly.
        //     - 0 loan period options clears the LoanPeriodDiv
        //     - 1 loan period option populates a hidden input tag
        //     - Otherwise, a select tag is populated with the available options
        //
        
        pickupLocation = $(this).val();
        
        $.ajax({
            method: 'GET',
            url: 'ares.dll',
            data: { action: 70, type: 785, PickupLocation: pickupLocation },
            datatype: 'xml'
        })
        .done(function (data) {

            var code = $(data).find('araj_code');
            
            if (typeof code === 'undefined' || code.text() !== '0') {
                return;
            }

            var newLoanPeriods = $(data).find('lp_options');
            
            if (typeof newLoanPeriods === 'undefined') {
                return;
            }
                        
            $('#LoanPeriodDiv').empty();
            
            var newLoanPeriodOptions = $.parseHTML(newLoanPeriods.text());
            var enabledOptions = $(newLoanPeriodOptions).not(':disabled');
            var loanPeriodControlTemplate;

            if (enabledOptions.length == 0) {
                loanPeriodControlTemplate = '';
                ariaAlert('There are no loan period options for the selected pickup location. The field has been hidden.');
            }
            else if (enabledOptions.length == 1) {
                loanPeriodControlTemplate = _loanPeriodControlHidden.clone();
                loanPeriodControlTemplate.val(enabledOptions.first().val());
                ariaAlert('The only loan period option for the selected pickup location is "' + enabledOptions.first().text() + '". The field has been hidden.');
            }
            else {
                loanPeriodControlTemplate = _loanPeriodControlSelect.clone();
                loanPeriodControlTemplate.find('#LoanPeriod').append(newLoanPeriodOptions);
                ariaAlert('The loan periods have been updated for the selected pickup location.');
            }

            $('#LoanPeriodDiv').append(loanPeriodControlTemplate);    
        });
    });
});

function ResortItems(SessionId, ClassId, SortField) {
    if (SortField != '') {
        window.location = 'ares.dll?SessionId=' + SessionId + '&Action=10&Form=60&Value=' + ClassId + '&orderby=' + SortField;
    }
}

function EnableSortPersistence(tableName) {
    var tableSelector = "#" + tableName;
    $(function () {
        $(tableSelector).sortable({
            items: '.row-odd, .row-even',
            axis: 'y',
			helper: 'clone',
            stop: function (event, ui) { FixRowStyles(tableSelector, "row-odd", "row-even"); }
        });
    });
}

function FixRowStyles(tableSelector, oddStyle, evenStyle) {
    var rowSelector = tableSelector + " ." + oddStyle + ", " + tableSelector + " ." + evenStyle;

    $(rowSelector).each(function (index) {
        var isEven = index % 2 == 0;

        if (isEven && !$(this).hasClass(evenStyle)) {
            $(this).removeClass(oddStyle);
            $(this).addClass(evenStyle);
        }
        else if (!isEven && !$(this).hasClass(oddStyle)) {
            $(this).removeClass(evenStyle);
            $(this).addClass(oddStyle);
        }
    });
}

function SaveSortOrder(tableName, sortColumn, baseAjaxUrl) {
    var tableSelector = "#" + tableName;

    var tnColIndex = GetColumnIndex($(tableSelector), sortColumn);

    var itemString = "";

    $(tableSelector + " .row-odd, " + tableSelector + " .row-even").each(function (index) {
        var tdVal = $(this).find("td:eq(" + tnColIndex + ")").text();

        itemString += tdVal + "|";
    })

    itemString = itemString.substring(0, itemString.length - 1);

    $.ajax({
        url: baseAjaxUrl + "&Value=" + itemString,
        cache: false
    });
}

function GetColumnIndex(tableJQObject, columnName) {
    return tableJQObject.find("th:contains('" + columnName + "')").index();
}

function ToggleCheckboxes(checked, id, className) {
    var collection = document.getElementById(id).getElementsByTagName('INPUT');
    for (var x = 0; x < collection.length; x++) {
        if (collection[x].type.toUpperCase() == 'CHECKBOX') {
            if (!className || (collection[x].className && collection[x].className.toUpperCase() == className.toUpperCase())) {
                collection[x].checked = checked;
            }
        }
    }
}

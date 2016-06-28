/* ares-ris-file-upload - https://github.com/cu-library/ares-ris-file-upload */

/* Uses fam fam fam icons. */

/* Create a AresRISFileUpload namespace by creating an empty object,
   in which we can define our data and functions. */
var AresRISFileUpload = AresRISFileUpload || {};

/* Init function. */
AresRISFileUpload.init = function (jq) {

    "use strict";
    var parent = AresRISFileUpload;
    parent.jq = jq;
    parent.items = [];
    parent.totalitems = 0;

    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      alert('The File APIs are not fully supported in this browser. Not showing the option to upload RIS files.');
      return;
    } 
   
    var appendLink = '<hr><span id="risupload" style="float:left; text-align: center; padding: 10px 20 px 20px 20px; clear: both;">\n';
    appendLink +=    '  <img src="images/Large/favs_32.gif" height="32" width="32" alt="Upload RIS File" title="Upload RIS File">';
    appendLink +=    '  <br>';
    appendLink +=    '  <span aria-hidden="true">Upload RIS File</span>';
    appendLink +=    '  <br>';
    appendLink +=    '  <input type="file" id="risfileinput" accept=".ris" style="margin: 20px;">';
    appendLink +=    '</span>';    
    jq("#content div:first-child").append(appendLink);
    
    var appenddiv = '<div id="risoutput" style="clear:left;"></div>'
    jq("#content div:first-child").append(appenddiv);  
    
    jq("#risfileinput").change( function( event ) {
        if (event.target.files.length == 1){        
            parent.processupload(event.target.files[0]);
            jq("#risupload").remove();                       
        }
    });      
    
};

AresRISFileUpload.processupload = function( risfile ) {
    "use strict";
    var parent = AresRISFileUpload;
    var jq = parent.jq;    
   
    var reader = new FileReader();
    reader.onload = function( event ) { 
        var contents = event.target.result;        
        parent.processcontents(contents.split("\n"));
        parent.totalitems = parent.items.length;
        jq("#risoutput").html('<span>Processed 0/'+ parent.items.length + '</span>');         
        parent.addFormFrame();    
    }
    reader.readAsText(risfile);
}

AresRISFileUpload.processcontents = function( risfilearray ) {
    "use strict";
    var parent = AresRISFileUpload;
    var jq = parent.jq;    
   
    var index = 0;
    
    var item = {
        "id": index, 
    };   

    while (risfilearray.length > 0) {
        var nextline = jq.trim(risfilearray.shift());               
        var tag = nextline.substring(0,2);
        var value = "";
        if (nextline.length > 6) {         
            value = nextline.substring(6, nextline.length);
        }        
        if (tag == "ER") {
        
            // Reached the end of the record. Make sure required fields
            // are there or unknown.
            item['TY'] = item['TY'] || "Unknown";      
            switch (item['TY']) {
                case "JOUR":
                    item['TY'] = "Article";
                    break;
                case "BOOK":
                    item['TY'] = "Book / e-Book";
                    break;
                case "CHAP":
                    item['TY'] = "Chapter";
                    break;
            }    
            item['T1'] = item['T1'] || "Unknown";    
            item['A1'] = item['A1'] || "Unknown";    
            item['Y1'] = item['Y1'] || "Unknown";
            item['JF'] = item['JF'] || "Unknown";  
            item['JF'] = item['JF'].split(" ").map(function(i){return i[0].toUpperCase() + i.substring(1).toLowerCase()}).join(" ");
            item['SP'] = item['SP'] || "Unknown";              
            item['EP'] = item['EP'] || "Unknown";  
            
            item['VL'] = item['VL'] || "";
            item['IS'] = item['IS'] || "",
            item['SN'] = item['SN'] || "",
            item['DO'] = item['DO'] || "",
            item['UR'] = item['UR'] || "",
            
            console.log(item);
            parent.items.push(item);         
            
            //parent.outputItemToDOM(item);
            //parent.uploadItem(item);
            
            index += 1;     

            item = {
                "id": index,
            };
            
        } else if (tag != "") {
            if (tag in item) {
                item[tag] = item[tag] + ", " + value;                      
            } else {
                item[tag] = value;
            }            
        } 
    }     

}

AresRISFileUpload.addFormFrame = function () {
    "use strict";
    var parent = AresRISFileUpload;
    var jq = parent.jq;
    
    if (parent.items.length == 0){
        return;    
    }
    
    var item = parent.items.shift();
    
    var iframeurl = '/ares.dll?SessionID='+sessionid+'&CourseID='+courseid
    
    switch (item['TY']) {
        case "Article":
        
            iframeurl += '&Action=10&Form=2&Value=IRFArticle_frame';                   
            jq("#risoutput").append('<iframe id="risiframe" style="width: 100%; height: 900px;"/></iframe>'); 

            jq('#risiframe').load( function() {            
                var content = jq(this).contents();            
                content.find("#Title").val(item['JF']);
                content.find("#Volume").val(item['VL']);
                content.find("#Issue").val(item['IS']);
                content.find("#JournalYear").val(item['Y1']);
                content.find("#ArticleTitle").val(item['T1']);
                content.find("#Author").val(item['A1']);
                content.find("#ISXN").val(item['SN']);
                content.find("#DOI").val(item['DO']);
                content.find("#Pages").val(item['SP'] + ' - ' + item['EP']);
                content.find("#URL").val(item['UR']);
                content.find("#WebLink").attr("checked", "checked");
                content.find("#File").parent().remove();
                content.find("label[for=SupplyMethod] fieldset").append('<span style="color:darkred;">File upload not available when processing items through RIS upload. If required, please add files to items after RIS item processing.</span>');
            }); 
            jq('#risiframe').attr("src", iframeurl);          
            break;
        case "Book / e-Book":
            break;
        case "Chapter":
            break;           
    }       

}

AresRISFileUpload.uploadItem = function ( item ) {
    "use strict";
    var parent = AresRISFileUpload;
    var jq = parent.jq;

    switch (item['TY']) {
        case "Article":        
            var payload = {
                "Action": 11,
                "Type": 10,
                "CopyrightRequired": "Yes",
                "ItemType": "SER",
                "format": "Article",                
                "CourseID": courseid,
                "SessionID": sessionid,
                "Title": item['JF'],
                "Volume": item['VL'] || "",
                "Issue": item['IS'] || "",
                "JournalYear":  item['Y1'],
                "ArticleTitle": item['T1'],
                "Author": item['A1'],
                "ISXN": item['SN'] || "", 
                "DOI": item['DO'] || "",
                "ItemNote": "Item added through Ares RIS file upload.",
                "Pages": item['SP'] + ' - ' + item['EP'],
                "URL": item['UR'] || "",
                "SupplyMethod": "WebLink",
                "SubmitButton": "Submit Item",
            }            
            payload["Course"+courseid] = "on";           
            var articleaddrequest = jq.post( "https://" + window.location.hostname + "/ares.dll", payload);                
            break;
        case "Book / e-Book":
            break;
        case "Chapter":

            break;           
    }    
}

AresRISFileUpload.outputItemToDOM = function( item ) {
    "use strict";
    var parent = AresRISFileUpload;
    var jq = parent.jq;
   
    var itemappend = '<div style="margin-bottom: 10px;" id="risitem' + item['id'] + '">';
    
    itemappend += '<div class="ristype"><strong>'+item['TY']+'</strong></div>';
    if ('UR' in item){
        itemappend += '<div><a target="_blank" href="'+item['UR']+'">'+item['T1']+'</a></div>';
    } else {
        itemappend += '<div>'+item['T1']+'</div>';
    }                
    itemappend += '<div>'+item['A1']+'</div>';
    itemappend += '<div>'+item['Y1']+'</div>';
    if (! (item['TY'] === "Book / e-Book") ){
        itemappend += '<div>'+item['JF']+'</div>';
    }  

    itemappend += '</div>';

    jq("#risoutput").append(itemappend);
}


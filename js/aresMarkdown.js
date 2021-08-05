function ConvertMarkdown(){
	var converter = new showdown.Converter();
    messageRows = document.querySelectorAll("tr");
    for (i=0; i<messageRows.length; i++){
		var messageCell = messageRows[i].cells[messageRows[i].cells.length-1];
		messageCell.innerHTML = DOMPurify.sanitize(converter.makeHtml(messageCell.textContent));
    }
}

function ConvertMarkdownItemText(){
	var converter = new showdown.Converter();
    messageRows = $(".item-text");
    for (i=0; i<messageRows.length; i++){
        messageRows[i].innerHTML = DOMPurify.sanitize(converter.makeHtml(messageRows[i].textContent));
    }
}

function InitializeEditor(element){
	pell = window.pell;
	text = document.getElementById(element);
	editor = document.getElementById("editor");
	text.hidden = true;
	editor.hidden = false;
	var converter = new showdown.Converter();
	pell.init({
		element: editor,
		onChange: (html) => {
		text.innerHTML = converter.makeMarkdown(html);
	}})
}
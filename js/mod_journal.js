// Mod: Journal for Xin Calendar 2 (In-Page/Popup-Window)
// Copyright 2004  Xin Yang    All Rights Reserved.

function xc_dh(){var hb=xcLinkBasePath+xcLinkPrefix+xc_fv(this.date,xc_da,xcLinkDateFormat)+xcLinkSuffix;if(xcLinkTargetWindow){return ['window.open("'+hb+'","'+xcLinkTargetWindow+'","'+xcLinkTargetWindowPara+'");',0]}else{return ['location.href="'+hb+'";',0]}};

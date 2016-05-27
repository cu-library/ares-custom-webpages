// Mod: Date Link for Xin Calendar 2 (In-Page/Popup-Window)
// Copyright 2004  Xin Yang    All Rights Reserved.

function addDateLink(co,cu,cv,ec,date,jy){xc_eg(co,"eh",xc_fv(date,ec||xcDateFormat,xc_da),[cu,cv,jy],0)};function xc_dh(){var gg=xc_bi(this);if(gg){if(xcLinkTargetWindow){return ['window.open("'+xcLinkBasePath+gg[2]+'","'+xcLinkTargetWindow+'","'+xcLinkTargetWindowPara+'");',0]}else{return ['location.href="'+xcLinkBasePath+gg[2]+'";',0]}}else{return ["",1]}};function xc_dk(){var gg=xc_bi(this);if(gg){return 'this.title="'+xcLinkBasePath+gg[2]+'";'}else{return ""}};function xc_bi(bj){return bj.gd("eh",bj.date)};xc_fc[xc_fc.length]=xc_bi;

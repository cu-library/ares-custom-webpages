// Xin Calendar 2.10 (Popup Window Core/Window Control)
// Copyright 2004  Xin Yang    All Rights Reserved.

// Last Modified: 22-Dec-2005
// Web Site: yxScripts.com
// Email: m_yangxin@hotmail.com

var xc_gb=null;function xc_cq(){return(window.opener&&typeof(window.opener.closed)!="undefined"&&!window.opener.closed&&window.opener.xcCore&&window.opener.xcCore==2)?window.opener:null};function xc_dr(gw,dy){xc_gb=xc_cq();if(xc_gb){xc_gb.xc_dr(gw,dy)}};function xc_dq(gw,dm){xc_gb=xc_cq();if(xc_gb){xc_gb.xc_dq(gw,dm)}};function xc_bc(gw){xc_gb=xc_cq();if(xc_gb){xc_gb.xc_bc(gw)}};function xc_ec(gw,date){xc_gb=xc_cq();if(xc_gb){xc_gb.xc_ec(gw,date)}};function xc_er(gw){xc_gb=xc_cq();if(xc_gb){xc_gb.xc_er(gw)}};function xc_cv(gw){xc_gb=xc_cq();if(xc_gb){xc_gb.xc_cv(gw)}};function xc_es(gw,y){xc_gb=xc_cq();if(xc_gb){xc_gb.xc_es(gw,y)}};function xc_ep(gw,m){xc_gb=xc_cq();if(xc_gb){xc_gb.xc_ep(gw,m)}};function xc_eu(){xc_gb=xc_cq();if(xc_gb){xc_gb.xc_eu(this.gw)}};function xc_ej(){xc_gb=xc_cq();if(xc_gb){xc_gb.xc_ej(this.gw)}};function xc_eq(gw){xc_gb=xc_cq();if(xc_gb){xc_gb.xc_eq(gw)}};function xc_cj(id){return id==""?null:document.getElementById(id)};function xc_et(e,gw,name){xc_gb=xc_cq();var l=xc_cj("xcPopup");if(l&&xc_gb){var ij=location.search.substring(1);var id=gw?gw:/^id=(xc\d+)\&/.test(ij)?(RegExp.$1):(window.name||"");document.gw=id;document.onmouseover=xc_ej;document.onmouseout=xc_eu;document.title=unescape(name||ij.substring(ij.indexOf("title=")+6));xc_gb.xc_cy(l,id)}};window.onload=xc_et;

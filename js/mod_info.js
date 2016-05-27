// Mod: Date Info for Xin Calendar 2 (In-Page/Popup-Window)
// Copyright 2004  Xin Yang    All Rights Reserved.

function addDateInfo(co,cr,ct,cs,ec,date,gy,hk){var ip=getDateNumbers(date,ec||xcDateFormat);xc_eg(co,"eg",(hk?ip[0]:"")+ip[1]+ip[2],[cr,ct,cs||"",gy],0)};function xc_cl(date){return date.substring(4)};function xc_bq(style,cp,width,fo){if(this.date!=""){var gf=this.gd("eg",this.date)||this.gd("eg",xc_cl(this.date));if(gf){cp+=xcDIV(gf[2],gf[3],"")}};return xc_ff(style,cp,width,fo)};function xc_bh(bj){return bj.gd("eg",bj.date)||bj.gd("eg",xc_cl(bj.date))};xc_fc[xc_fc.length]=xc_bh;

//	WebFontAnywhere Object.
function WebFontAnywhere() {
	var self = this;
	this.uni_code = '';	
	this.unicode = new Array(6400);
	this.Gaijis = new Array();
	this.RegisterIDs;	
	for(i=0;i<this.unicode.length;i++)
		this.unicode[i] = 0;
	getExtBWords();
	getAllGaijiWords();
	this.isGaiji = function (HDOC) {
		var pattern = /[\uE000-\uF8FF]/g;
		var strResult = '', strSource = '', strTemp = '';
		strTemp = HDOC.value;
		if((result = pattern.exec(strTemp)) != null) {
			strSource = strTemp.split("");
			for(i = 0; i < strSource.length; i++) {
				if((strSource[i].charCodeAt(0) >= 0xE000) && (strSource[i].charCodeAt(0) <= 0xFEFF)) {
					this.unicode[(strSource[i].charCodeAt(0))] = 1;
					this.uni_code += this.toHex(strSource[i].charCodeAt(0)) + ',';
					HDOC.style.fontFamily = this.Config.DeclareFontName;
					HDOC.getAttribute('style').cssText += this.Config.FONTTAG["FONT_SIZE"];
				}
			}
		}
	};
	this.RemoteRef = {
		 include : function (redomain, ref) {		 			 			 	
			var script = document.createElement('script');
			script.setAttribute('lang', 'text/javascript');
			script.setAttribute('src', redomain + ref);
			if (script != "") {				
				document.getElementsByTagName("head").item(0).appendChild(script);
			}
		}
	};
	this.Hooks = {
		RegisterHooks : function () {
			self.RegisterIDs = setInterval(this.HandlerHooks, 10);
		},
		HandlerHooks : function () {
			var ReadytoGo = true;
			if (ReadytoGo == parent.FontCenterState) {
				if (self.Gaijis.length >= 1) {
					self.Config._DeclareCss.HEAD(parent.cssPath);
				} else if(self.Gaijis.length == 1) {	
				}
				clearInterval(self.RegisterIDs);
			}
		}
	};
}
//	WebFontAnywhere Initial Method.
WebFontAnywhere.prototype.initial = function() {
	this.getTextContent(document);	
}
// WebFontAnywhere
WebFontAnywhere.prototype._form = function() {
	var pattern = /[\uE000-\uF8FF]/g;
	var strTemp = "", strResult = "", strSource = "";	
	for(i=0;i<document.forms.length;i++)
		for(j=0;j<document.forms[i].length;j++)
			if((document.forms[i][j].type == 'text') || (document.forms[i][j].type == 'textarea'))
				if(pattern.exec(document.forms[i][j].value) != '') {															
					strTemp = document.forms[i][j].value;
					strResult = strTemp.split("");
					for(var k=0;k<strResult.length;k++) {
						strSource += strResult[k];
					}
					for(var l=0;l<strSource.length;l++) {						
						if((strSource.charAt(l).charCodeAt(0) >= 0xE000) && (strSource.charAt(l).charCodeAt(0) <= 0xFEFF)) {
							this.unicode[(strSource.substr(l, 1).charCodeAt(0))] = 1;							
							this.uni_code += this.toHex(strSource.substr(l, 1).charCodeAt(0)) + ',';
						}
					}										
					document.forms[i][j].value = strSource;					
					//alert(978)
					document.forms[i][j].style.fontFamily = this.Config.FONTTAG["FONT_FAMILY"];
					if(BrowserVer=='IE6'){
						document.forms[i][j].style.letterSpacing = WIME_LetterSpace;
						var inps = document.getElementsByTagName("input");
						var inp_len = inps.length;
						for (n = 0; n < inp_len; n++) {
							if (inps[n].type == 'text'){
							}			
						}
					}else{
						
						var inps = document.getElementsByTagName("input");
						var inp_len = inps.length;						
						if(DTDstate){
							for (n = 0; n < inp_len; n++) {
								if (inps[n].type == 'text'){
								}			
							}
						}else{
							for (n = 0; n < inp_len; n++) {
								if (inps[n].type == 'text'){
								}			
							}							
						}
						
					}
					strSource = '';
				}
}
//	
WebFontAnywhere.prototype._dropdownlist = function() {
	var pattern = /[\uE000-\uF8FF]/g;
	var strTemp = "", strResult = "", strSource = "";
	for(i=0;i<document.forms.length;i++)
		for(j=0;j<document.forms[i].length;j++)
			if(document.forms[i][j].type == 'select-one' || document.forms[i][j].type == 'select-multiple')
				for(var k = 0; k < document.forms[i][j].options.length; k++) {					
					if(pattern.exec(document.forms[i][j].options[k].text) != null) {																		
						document.forms[i][j].style.fontFamily = this.Config.FONTTAG["FONT_FAMILY"];
						document.forms[i][j].style.fontSize = this.Config.FONTTAG["FONT_SIZE"];
						strTemp = document.forms[i][j].options[k].text;
						strResult = strTemp.split("");
						for(var l=0;l<strResult.length;l++)
							strSource += strResult[l];
						for(var m=0;m<strSource.length;m++) {
							if((strSource.charAt(m).charCodeAt(0) >= 0xE000) && (strSource.charAt(m).charCodeAt(0) <= 0xFEFF)) {
								this.unicode[(strSource.substr(m,1).charCodeAt(0))] = 1;								
								this.uni_code += this.toHex(strSource.substr(m,1).charCodeAt(0)) + ',';
							}
						}
						document.forms[i][j].options[k].text = strSource;
						strSource = "";
					}
					if(pattern.exec(document.forms[i][j].options[k].value) != null) {						
						document.forms[i][j].style.fontFamily = this.Config.FONTTAG["FONT_FAMILY"];
						document.forms[i][j].style.fontSize = this.Config.FONTTAG["FONT_SIZE"];
						strTemp = document.forms[i][j].options[k].value;
						strResult = strTemp.split("");
						for(var l=0;l<strResult.length;l++)
							strSource += strResult[l];
						for(var m=0;m<strSource.length;m++) {
							if((strSource.charAt(m).charCodeAt(0) >= 0xE000) && (strSource.charAt(m).charCodeAt(0) <= 0xFEFF)) {
								this.unicode[(strSource.substr(m,1).charCodeAt(0))] = 1;
								this.uni_code += this.toHex(strSource.substr(m,1).charCodeAt(0)) + ',';
							}
						}
						document.forms[i][j].options[k].value = strSource;
						strSource = "";
					}
				}
}
//
WebFontAnywhere.prototype.trim = function(str) {
	ptntrim = /(^\s*)|(\s*$)/g;
	return str.replace(ptntrim, "");
}
//	
WebFontAnywhere.prototype.toHex = function(n) {
	var hex_result = '';
	var the_start = true;
	for(var i=32;i>0;) {
		i -= 4;
		var one_digit = (n >> i) & 0xf;
		if(!the_start || one_digit != 0) {
			the_start = false;						
			hex_result += this.Config.DIGIT()[one_digit];
		}
	}	
	return (hex_result == '' ? '0' : hex_result);
}
WebFontAnywhere.prototype.isGaijis = function(data) {
	var pattern = /[\uE000-\uF8FF]/g;
	var strTemp = data;
	if((result = pattern.exec(strTemp)) != null) {
		return true;
	} else {
		return false;
	}
}
//	a real replace gaijis function.
WebFontAnywhere.prototype.replaceGaijis = function (data, node) {
	//ExtB Version
	var pattern = /[\uE000-\uF8FF]/g;
	var strResult = '', strSource = '', strTemp = '';
	strTemp = data;
	if((result = pattern.exec(strTemp)) != null) {
		strSource = strTemp.split("");
		for(i = 0; i < strSource.length; i++) {
			if((strSource[i].charCodeAt(0) >= 0xE000) && (strSource[i].charCodeAt(0) <= 0xFEFF)) {
				this.unicode[(strSource[i].charCodeAt(0))] = 1;
				this.uni_code += this.toHex(strSource[i].charCodeAt(0)) + ',';
				strResult += this.Config.FONTTAG["BEGIN"]() + strSource[i] + this.Config.FONTTAG["END"];
			}else if( (strSource[i].charCodeAt(0) >= 0xD800) && (strSource[i].charCodeAt(0) <= 0xDBFF) ) {
				strResult += this.Config.FONTTAG["BEGIN"]() + strSource[i];
			}else if( (strSource[i].charCodeAt(0) >= 0xDC00) && (strSource[i].charCodeAt(0) <= 0xDFFF) ){
				strResult += strSource[i] + this.Config.FONTTAG["END"];
			}else {
				strResult += strSource[i];
			}
		}
		return strResult;
	}else {
		return data;
	}
}
function getExtBWords(){
	extB_Array = [];
	var innerHTML = document.body.innerHTML;
	var	AllWords = innerHTML.split("");
	for(i=0;i<AllWords.length;i++){
		if((AllWords[i].charCodeAt(0) >= 0xD800) && (AllWords[i].charCodeAt(0) <= 0xDBFF) ){
			if((AllWords[i+1].charCodeAt(0) >= 0xDC00) && (AllWords[i+1].charCodeAt(0) <= 0xDFFF)){
				var extB_high = "0x" + (escape(AllWords[i])).substr(2,4);
				var extB_low  = "0x" + (escape(AllWords[i+1])).substr(2,4);
				var extB_sn = parseInt(AllWords[i].charCodeAt(0)) + "" + (AllWords[i+1].charCodeAt(0));
				extB_Array[extB_sn] =  String.fromCharCode(extB_high) + String.fromCharCode(extB_low);
			}
		}else{
		}
	}
}
 //Novarese
function getAllGaijiWords(){
	var words = document.body.innerHTML;
	var pattern = /[\uE000-\uF8FF]/g;
	var AllWordArr = words.split('');
	gaijisArr = new Array;
	for(i=0;i<AllWordArr.length;i++){
		if((AllWordArr[i].charCodeAt(0) >= 0xE000) && (AllWordArr[i].charCodeAt(0) <= 0xFEFF)) {
			var sn = AllWordArr[i].charCodeAt();
			gaijisArr[sn] = AllWordArr[i];
		}		
	}
}

WebFontAnywhere.prototype.getTextContent = function(n) {
	var s = '';
	var x = 1;
	var children = n.childNodes;	
	for(var i = 0; i < children.length; i++) {
		var child = children[i];
		if(child.nodeType == 3) {
			if (child.parentNode.getAttribute('tagName') != 'TEXTAREA') {
				if (this.isGaijis(child.data) == true) {										
					var data = child.data;
					if(BrowserVer == 'IE9'){
						var non_tag = document.createElement("font");
					}else{
						var non_tag = document.createElement("");
					}
					non_tag.innerHTML = this.replaceGaijis(data, child);
					child.parentNode.replaceChild(non_tag, child);
				}
			}
		} else {
			s += this.getTextContent(child);
		}
	}
	return s;
}
WebFontAnywhere.prototype.GaijiSort = function() {
	var count = 0;
	for(i=0;i<this.unicode.length;i++){
		if(this.unicode[i] == 1) {
			this.Gaijis[count] = String.fromCharCode((i));
			count++;
		}
	}
	for(extB in extB_Array){
		count++;
		this.Gaijis[count] = extB_Array[extB];
	}	
}
WebFontAnywhere.prototype.Query = function () {
	FN = this.Config._Random["SCORE"]();
	
	//Novarese
	//Gather Gaijis by new Method
	var i=0;
	if(gaijisArr.length != 0){
		for(x in gaijisArr){
			//alert(gaijisArr[x])	
			//alert(escape(gaijisArr[x]))
			this.Gaijis += gaijisArr[x];
			i++
		}	
	};
	//	
	//alert(this.Gaijis.length);
	TESTTEMPNUM = this.Gaijis.length;
	if (this.Gaijis.length == 0) {
		return false;
	} else {
		//if(this.Gaijis.length == 1) {
		if(this.Gaijis.length <= 0) {			//STOP 一字一檔
			if(debugMode){alert("wfa 354: " + this.Config.FontAliasPath + WFA_FontAlias + "/");};
			FN = this.toHex(this.Gaijis[0].charCodeAt(0)) + this.Config._Random["EXTEND"];
			this.RemoteRef["include"](this.Config.QUERYOBJ.QueryString(this.Config.FontFileName, this.Gaijis, FN, this.Config.DeclareFontName, (this.Config.FontAliasPath + WFA_FontAlias + "/" + FN)) , '');
			this.Hooks["RegisterHooks"]();

			//Novarese ----------------------
			//classNameArray from wfs.user.js
			var classNameString="";
			for (clsNm in WeDo_classNameArray){
				classNameString += WeDo_classNameArray[clsNm]
			}
			$(classNameString).css("font-family","DF-WA");
			//Novarese ----------------------			
			
		} else {
			this.RemoteRef["include"](this.Config.QUERYOBJ.QueryString(this.Config.FontFileName, this.Gaijis, FN, this.Config.DeclareFontName, (this.Config.PngPath + FN)) , '');
			this.Hooks["RegisterHooks"]();

		}
	}
}

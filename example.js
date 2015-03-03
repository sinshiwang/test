
var myGoogleMap = {
	id:"myNewGMAP",
	init : function(){
		if(typeof(Storage) !== "undefined") {
			isReady = "";
			var saved = localStorage.getItem("GMAP_FREQUENCY_STATIONS");
			if(saved!==null){
				this.thisTurnStations = saved.split(",");
			};
		};
		this.myLatlng = new google.maps.LatLng(this.Data.CenterLatlng.TAIWAN.lat,this.Data.CenterLatlng.TAIWAN.lng);
		this.mapOptions = {
			center: this.myLatlng,
			zoom: this.Data.defaultZoom,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		items = new Array;		
		var w = this.clientState.currentSize.width	||  this.config.mapWidth;
		var h = this.clientState.currentSize.height	||	this.config.mapHeight;
		document.getElementById(this.config.mapID).style.width = w + "px";
		document.getElementById(this.config.mapID).style.height = h + "px";			
		this.map = new google.maps.Map(document.getElementById(this.config.mapID),this.mapOptions);	
		this.markerColor = "#FF3300";
		this.setMarkers(this.map, mapData);
		this.getClientScreen();
		this.getClientLocation();
		this.appendEvt();
		$("#gmap_itemDetail_win").draggable();	
		$("#radarDivWin").draggable();		
		options_catalogue();
	},
	needFullscreen : function(){
		if(this.config.confirmFullScreen){
			if(!this.state.isAskedFullScreen){
				if(confirm("切換成 「滿版面顯示」  嗎？")) {
					this.fillScreen();
				};
				this.state.isAskedFullScreen = true;
				$("#gmap_help_content").fadeIn(500);
				this.showMessage("可以開始使用市集地圖，請善用滑鼠的 「  滾、點、拖 」功能。");	
				if(!this.config.enableFSstatus){document.getElementById("express2status").style.display="none"};
			};
		};
	},
	clientLocation : [],
	getClientLocation : function(){
		var self = this;
		if(navigator.geolocation) {
			browserSupportFlag = true;
			navigator.geolocation.getCurrentPosition(function(position) {
				self.clientLocation[0] = position.coords.latitude;
				self.clientLocation[1] = position.coords.longitude;	
				self.getNearStation();
				setTimeout("myGoogleMap.needFullscreen()",300);
			});
		};
	},
	nearestStaions : [],
	thisTurnStations :[],
	insertToThisTurn : function(station){
		var counts = this.thisTurnStations.length; 
		if(counts==0){
			this.thisTurnStations.push(station);
		}else{
			var isExist = false;
			for(var i=0;i<this.thisTurnStations.length;i++){
				if(this.thisTurnStations[i] == station){
					isExist = true;
					break;
				};
			};
			if(!isExist){this.thisTurnStations.push(station)};
		};
		if(typeof(Storage) !== "undefined") {
			localStorage.setItem("GMAP_FREQUENCY_STATIONS", this.thisTurnStations );
		};
		refreshTab_historic();
	},	
	getNearStation : function(){
		var self = this;
		var lat = this.clientLocation[0];
		var lng = this.clientLocation[1];		
		this.nearestStaions = [];
		for(var i=0;i<stations.length;i++){
			var nlat = stations[i][4];
			var nlng = stations[i][5];
			var disX = Math.abs(lat - nlat);
			var disY = Math.abs(lng - nlng);			
			if ( disX <= this.config.nearRange ){
				if( disY <= this.config.nearRange ){
					this.nearestStaions.push(stations[i][2]);
				};
			};
		};
		if(this.nearestStaions.length==0){
			this.config.nearRange = this.config.nearRange*2;
			this.getNearStation();
			return false
		};
		var tab = document.getElementById("tabs-4");
		$(".tagStyle4").remove();
		for(var s=0; s<this.nearestStaions.length;s++){
			var div = document.createElement("div");
			div.className = "tagStyle4";
			div.style.margin = "2px";
			div.innerHTML = this.nearestStaions[s];
			div.onmouseover = function(){
				this.style.backgroundColor = "#FF99CC";
			};
			div.onmouseout = function(){
				this.style.backgroundColor = "#FFFFFF";
			};		
			div.onclick = function(){
				myGoogleMap.moveNzoom( this.innerHTML ,16 );	
				myGoogleMap.showMessage("移動到「"+this.innerHTML+"」");	
			};
			tab.appendChild(div);
		};
		if(myGoogleMap.clientLocation[0]!==undefined){
			var disTimes = myGoogleMap.config.nearRange / 0.01;
			var distance = disTimes * 0.54;
			document.getElementById("currentLatlng").innerHTML = " 概略位置約 " + (parseInt(distance)+0.1) +"公里內 (僅供參考)" ;
		};
	},
	getMouseXY : function(e){
		var tempX = 0;
		var tempY = 0;
		if(document.all){
			tempX = event.clientX + document.body.scrollLeft;
			tempY = event.clientY + document.body.scrollTop;
		}else{
			tempX = e.pageX;
			tempY = e.pageY;
		};  
		if(tempX < 0){tempX = 0};
		if(tempY < 0){tempY = 0}; 
		return {
			X: tempX,
			Y: tempY,
		};	  
	},
	hideExpressMenu : function(){
		$("#expressMenu").hide(30);
	},
	appendEvt : function(){
		var self = this;
		var elem = document.getElementById ("gmap_infowin");
		if (elem.addEventListener){/* all browsers except IE before version 9*/
			elem.addEventListener("mousewheel", self.infoWinWheel, false);
			elem.addEventListener("DOMMouseScroll", self.infoWinWheel, false);
		}else {
			if(elem.attachEvent){
				elem.attachEvent("onmousewheel",self.infoWinWheel);
			};
		};
		google.maps.event.addListener(this.map, 'dblclick', function(event) { 
		}); 
		google.maps.event.addListener(this.map, 'click', function(e) { 
			$("#expressMenu").hide(30);
			$("#markMenu").hide(30);
		});
		 google.maps.event.addListener(this.map, 'rightclick', function(e) { 
			$("#markMenu").hide(30);
			var position = self.getMouseXY(event);	/*CHROME*/
			var eMH = 173;
			var eMW = 150;
			var fixX = ( (position["X"] + eMW + 10 )>= document.documentElement.clientWidth)?(position["X"]-eMW):(position["X"]);
			var fixY = ( (position["Y"] + eMH + 10 )>= document.documentElement.clientHeight)?(position["Y"]-eMH):(position["Y"]);
			$("#expressMenu").css("left",fixX);						
			$("#expressMenu").css("top",fixY);			
			if(self.state.isFullscreen){
				document.getElementById("express2fill").innerHTML = "01版面顯示";
				$("#express2full").hide();
			}else{
				document.getElementById("express2fill").innerHTML = "滿版面顯示";						
				$("#express2full").show();			
			};
			$("#expressMenu").clearQueue();
			$("#expressMenu").show(100);
		});
		
		if(self.clientState.isIE){ 
			google.maps.event.addListener(this.map, 'center_changed', function() {
				localStorage.setItem("saveCurrentCenter",self.map.getCenter());
			});	
		};
		
		google.maps.event.addListener(this.map, 'zoom_changed', function() {
			$('#gmap_quick_infowin').clearQueue();
			$('#gmap_quick_infowin').fadeOut(self.config.gmap_QV_fadeDuration);
			/*$('#gmap_quick_infowin').css("display","none");*/
			var isZoomIn = this.zoom > self.lastZoomMem ? true : false ;
			if(this.zoom >= self.config.maxZoom) {
				self.map.setZoom(self.config.maxZoom-1);
			};			
			for(var i=0;i<self.config.skipZoom.length;i++){
				if(this.zoom== self.config.skipZoom[i]){
					if(isZoomIn){
						self.map.setZoom(this.zoom+1);
						break;
					}else{
						self.map.setZoom(this.zoom-1);
						break;
					};
				};
			};
			if(this.zoom <= self.config.minZoom) {
				self.map.setZoom(self.config.minZoom+1);
			};
			self.changeZoom(this.zoom);
		});	
	},
	useKeyboard : function(e){
		var key = window.event ? event.keyCode : e.which;
	},
	resizeWinContral : function(){
		myGoogleMap.infoWinReset();
	},
	changeZoom : function(zoom){
		this.clearQuickInfoWinState();
		if(!this.state.isStopQuickInfo){
			this.state.isStopQuickInfo = true;
			setTimeout(function(){myGoogleMap.state.isStopQuickInfo = false;},1500);
		};
		
		if(zoom==3){
			this.markerColor = this.config.markerColor.taiwan;
			this.setAllMarker(null);
			this.markers = [];
			this.setMarkers(this.map,oneTaiwan);
		}else if(zoom==4 || zoom==5){
			this.markerColor = this.config.markerColor.region;
			this.setAllMarker(null);
			this.markers = [];
			this.setMarkers(this.map,regions);
		}else if(zoom==6 || zoom==7){
			this.markerColor = this.config.markerColor.eightCities;
			this.setAllMarker(null);
			this.markers = [];
			this.setMarkers(this.map,eightCities);			
		}else if(zoom>=8 && zoom<=12){
			this.markerColor = this.config.markerColor.sixteenCities;
			this.setAllMarker(null);
			this.markers = [];
			this.setMarkers(this.map,sixteenCities);
		}else if(zoom>=13 && zoom<=18) {
			this.markerColor = this.config.markerColor.station;
			this.setAllMarker(null);
			this.markers = [];
			this.setMarkers(this.map,stations);
		};
	},	
	entireFullScreen : function(){
		this.toggleFullScreen();
		if(!this.state.isFullscreen){
			this.state.isFullscreen = false;
			this.fillScreen();
		};
	},
	toggleFullScreen : function(){
		if((document.fullScreenElement && document.fullScreenElement !== null) || (!document.mozFullScreen && !document.webkitIsFullScreen)){
			if(document.documentElement.requestFullScreen){  
				document.documentElement.requestFullScreen();  
			}else if(document.documentElement.mozRequestFullScreen){  
				document.documentElement.mozRequestFullScreen();  
			}else if(document.documentElement.webkitRequestFullScreen){  
				document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
			};
			this.state.isEntireFullscreen = true;
		}else{  
			if(document.cancelFullScreen){
				document.cancelFullScreen();  
			}else if(document.mozCancelFullScreen){  
				document.mozCancelFullScreen();  
			}else if(document.webkitCancelFullScreen){  
				document.webkitCancelFullScreen();  
			};
			this.state.isEntireFullscreen = false;
		};  
	},	
	fillScreen : function(){
		this.infoWinReset();
		$("#expressMenu").hide(30);
		if(this.state.isEntireFullscreen){
			this.toggleFullScreen();
		};
		/*radar*/
		searchDragonBall(0);
		this.state.initDragonBallRadar = false;		
		if(!this.state.isFullscreen){
			$("#radarDivWin").css("left","50%");
			$("#radarDivWin").css("top","5px");
			$("#radarDivWin").css("margin-top","0px");
			$("#radarDivWin").css("margin-left","100px");			
		}else{
			$("#radarDivWin").css("left","50%");
			$("#radarDivWin").css("top","50%");
			$("#radarDivWin").css("margin-top","-375px");
			$("#radarDivWin").css("margin-left","-25px");									
		};
		if(!this.state.isFullscreen){
			document.getElementById("map_canvas").style.top = "15px";
			$("#gmap_popup_window").show(100);
			var oldNode = document.getElementById("gmap_package");
			var newNode = document.getElementById("virtua_node");
			document.getElementById("main").style.cssText = "border:0px;min-height:905px;";						
			if(!this.state.isEntireFullscreen){
				var h = (window.innerHeight) - 30;
				var w = $(document).width()-15;
				$('#outterest').css("height",window.innerHeight);	
				$('#outterest').css("overflow","hidden");
				this.clientState.currentSize.width = w;
				this.clientState.currentSize.height = h;
			}else{
				$('#outterest').css("height",window.screen.height);	
				$('#outterest').css("overflow","hidden");
				var h =	this.clientState.screenSize.height -30;
				var w =	this.clientState.screenSize.width -30;
				this.clientState.currentSize.width = w;
				this.clientState.currentSize.height = h;				
			};
			document.getElementById("map_canvas").style.width = w + "px";
			document.getElementById("map_canvas").style.height = h+ "px";		
			$("#gmap_tools_win").animate({left: (w-360+ 45)+ "px", top:"55px" });
			$("#tabsHistoryBox").animate({left: (w-360+ 45)+ "px",top:"410px"});	
			document.getElementById("gmap_help_content").style.left =  (w-123) + "px";
			document.getElementById("gmap_help_content").style.top = "10px";	
			
			if(window.screen.height>768 && window.screen.height<=800){
				$("#interestList").animate({height:"169px" });
				$("#browseHistoryList").animate({height:"169px" });
			}else if(window.screen.height<=768){
				$("#interestList").animate({height:"140px" });
				$("#browseHistoryList").animate({height:"140px" });
			};
			$("#gmap_quick_infowin").animate({left: "100px",top:"100px"});				
			document.getElementById("tabs").style.boxShadow = "0px 1px 8px #bbbbbb";
			document.getElementById("tabsSearch").style.boxShadow = "0px 1px 8px #bbbbbb";		
			document.getElementById("gmap_quick_infowin").style.boxShadow = "0px 1px 8px #bbbbbb";		
			document.getElementById("tabsHistoryBox").style.boxShadow = "0px 1px 8px #bbbbbb";
			if(this.config.enableFSstatus){
				document.getElementById("express2status").style.display="";	
			};			
			if(myGoogleMap.config.enableFSstatus){
				if(!myGoogleMap.state.isStopStatus){
					$("#gmap_status_info_fs").clearQueue();
					$("#gmap_status_info_fs").fadeIn(300);
				};
			};
			this.map = new google.maps.Map(document.getElementById(this.config.mapID),this.mapOptions);	
			this.markerColor = "#FF3300";
			this.setMarkers(this.map, mapData);			
			this.appendEvt();
			$("#gmap_tools_win").draggable();
			$("#gmap_quick_infowin").draggable();	
			$("#tabsHistoryBox").draggable();
			$("#gmap_status_info_fs").draggable();	
			
			$(".betaimg").css("display","none");
		}else{
			/*to innerWindow*/
			$(".betaimg").css("display","");
			document.getElementById("map_canvas").style.top = "5px";
			document.getElementById("gmap_help_content").style.left = "507px";
			document.getElementById("gmap_help_content").style.top = "89px";
			
			$("#gmap_tools_win").show(100);	
			$("#tabsHistoryBox").show(100);
			document.getElementById("express2tool").innerHTML = "關閉工具視窗";
			document.getElementById("express2list").innerHTML = "關閉商品清單視窗";			
			document.getElementById("express2status").style.display="none";					
			this.state.isStopToolWin = false;
			this.state.isStopListWin = false;			
			$('#outterest').css("height","auto");
			$('#outterest').css("overflow","auto");			
			document.getElementById("main").style.cssText = "border:0px;min-height:830px;";	
			document.getElementById(this.config.mapID).style.width = this.config.mapWidth + "px";
			document.getElementById(this.config.mapID).style.height = this.config.mapHeight + "px";		
			this.clientState.currentSize.width = this.config.mapWidth;
			this.clientState.currentSize.height = this.config.mapHeight;			
			$("#gmap_tools_win").draggable('destroy');
			$("#gmap_quick_infowin").draggable('destroy');
			$("#tabsHistoryBox").draggable('destroy');	
			$("#gmap_status_info_fs").draggable('destroy');				
			this.map = new google.maps.Map(document.getElementById(this.config.mapID),this.mapOptions);			
			this.markerColor = "#FF3300";
			this.setMarkers(this.map, mapData);			
			this.appendEvt();
			$("#gmap_popup_window").hide(100);
			document.getElementById("gmap_popup_window").style.display= "none";		
			var oldNode = document.getElementById("virtua_node");
			var newNode = document.getElementById("gmap_package");		
			$("#gmap_tools_win").animate({left:"655px",top:"95px"});
			$("#tabsHistoryBox").animate({left:"655px",top:"475px"});				
			$("#gmap_quick_infowin").animate({left:"655px",top:"475px"});
			$("#gmap_status_info_fs").fadeOut(100);
			if(window.screen.height<=800){
				$("#interestList").animate({height:"354px" });
				$("#browseHistoryList").animate({height:"354px" });
			};
			document.getElementById("tabs").style.boxShadow = "";
			document.getElementById("tabsSearch").style.boxShadow = "";	
			document.getElementById("gmap_quick_infowin").style.boxShadow = "";						
			document.getElementById("tabsHistoryBox").style.boxShadow = "";
			this.state.isDetailWinDragged = false;			
		};
		document.getElementById("gmap_attached_window").removeChild(oldNode);
		document.getElementById("gmap_popup_window").removeChild(newNode);
		document.getElementById("gmap_attached_window").appendChild(newNode);
		document.getElementById("gmap_popup_window").appendChild(oldNode);		
		this.state.isFullscreen = !this.state.isFullscreen;
	},
	markers : [],
	infowindow : [],
	thisMarker : [],
	thisMarkerOver : [],
	markerColor : "#CCFF33",
	setAllMarker : function(m){
		for (var i=0; i<this.markers.length; i++) {
			this.markers[i].setMap(m);
		};
	},
	countsItems : function(zoom,tgt){
		if( typeof(countsOfItems) == "string"){
			alert("沒有資料");
			console.error("沒有資料，countsOfItems是空字串");
		};
		if(zoom<=3){
			var count = (countsOfItems.city["台北市"]||0) + (countsOfItems.city["新北市"]||0) + (countsOfItems.city["基隆市"]||0) + (countsOfItems.city["桃園市"]||0) + (countsOfItems.city["新竹"]||0) 
						+ (countsOfItems.city["台中市"]||0) + (countsOfItems.city["彰化縣"]||0) + (countsOfItems.city["南投縣"]||0) + (countsOfItems.city["苗栗縣"]||0)
						+ (countsOfItems.city["雲林縣"]||0) + (countsOfItems.city["嘉義"]||0) + (countsOfItems.city["台南市"]||0) + (countsOfItems.city["高雄市"]||0) + (countsOfItems.city["屏東縣"]||0)
						+ (countsOfItems.city["宜蘭縣"]||0) + (countsOfItems.city["花蓮縣"]||0) + (countsOfItems.city["台東縣"]||0);
		}else if(zoom==4 || zoom==5){
			switch (tgt){
				case "北部":
					var count = (countsOfItems.city["台北市"]||0) + (countsOfItems.city["新北市"]||0) + (countsOfItems.city["基隆市"]||0) + (countsOfItems.city["桃園市"]||0) + (countsOfItems.city["新竹"]||0);
				break;
				case "中部":
					var count = (countsOfItems.city["台中市"]||0) + (countsOfItems.city["彰化縣"]||0) + (countsOfItems.city["南投縣"]||0) + (countsOfItems.city["苗栗縣"]||0);
				break;
				case "南部":
					var count = (countsOfItems.city["雲林縣"]||0) + (countsOfItems.city["嘉義"]||0) + (countsOfItems.city["台南市"]||0) + (countsOfItems.city["高雄市"]||0) + (countsOfItems.city["屏東縣"]||0);
				break;
				case "東部":
					var count = (countsOfItems.city["宜蘭縣"]||0) + (countsOfItems.city["花蓮縣"]||0) + (countsOfItems.city["台東縣"]||0);
				break;
			};			
		}else if(zoom==6 || zoom==7){
			switch (tgt){
				case "北北基":
					var count = (countsOfItems.city["台北市"]||0) + (countsOfItems.city["新北市"]||0) + (countsOfItems.city["基隆市"]||0);
				break;				
				case "桃竹苗":
					var count = (countsOfItems.city["桃園市"]||0) + (countsOfItems.city["新竹"]||0) + (countsOfItems.city["苗栗縣"]||0);
				break;
				case "中彰投":
					var count = (countsOfItems.city["台中市"]||0) + (countsOfItems.city["彰化縣"]||0) + (countsOfItems.city["南投縣"]||0);
				break;
				case "雲嘉南":
					var count = (countsOfItems.city["雲林縣"]||0) + (countsOfItems.city["嘉義"]||0) + (countsOfItems.city["台南市"]||0);
				break;
				case "高屏":
					var count = (countsOfItems.city["高雄市"]||0) + (countsOfItems.city["屏東縣"]||0);
				break;
				case "宜蘭縣":
					var count = (countsOfItems.city[tgt] == undefined  )? 0 : countsOfItems.city[tgt];
				break;
				case "花蓮縣":
					var count = (countsOfItems.city[tgt] == undefined  )? 0 : countsOfItems.city[tgt];				
				break;
				case "台東縣":
					var count = (countsOfItems.city[tgt] == undefined  )? 0 : countsOfItems.city[tgt];
				break;					
			};
		}else if(zoom>=8 && zoom<=12){
			var count = (countsOfItems.city[tgt] == undefined  )? 0 : countsOfItems.city[tgt];
			if(tgt=="台北市"){
				count = count + ((countsOfItems.city["新北市"] == undefined  )? 0 : countsOfItems.city["新北市"]);
			};
		}else if(zoom>=13){
			var count = (countsOfItems.station[tgt] == undefined  )? 0 : countsOfItems.station[tgt];
		};	
	
		return count
	},
	setInfowindows : function(map,datas){
		for(var i = 0; i < datas.length; i++) {
			var data = datas[i];
			var count = this.countsItems(this.map.zoom, data[2]);
			var myLatLng = new google.maps.LatLng(data[4], data[5]);
			this.infowindow[i] = new google.maps.InfoWindow({
				content: data[2],
				position: myLatLng
			});
			this.infowindow[i].open(this.map);
		};	
	},
	lastZoomMem: 0,	
	setMarkers : function (map,datas){
		var size = this.config.zoom2Size[this.map.zoom];
		var self = this	;
		for(var i = 0; i < datas.length; i++) {
			var data = datas[i];
			var count = self.countsItems(this.map.zoom, data[2]);
			var sys = data[0];
			this.thisMarker[i] = this.drawMark(i,count,size,sys); 
			this.thisMarkerOver[i] = this.drawMarkOver(i,count,size,sys); 			
			var myLatLng = new google.maps.LatLng(data[4], data[5]);
			self.infowindow[i] = new google.maps.InfoWindow({
				content:  data[2] + "<br>" + "(" +  data[4] + "," + data[5] + ")",
				position: myLatLng
			});
			self.markers[i] = new google.maps.Marker({
				position: myLatLng,
				sn : i,
				count : count,
				map: map,
				icon: this.thisMarker[i].toDataURL(), 
				title: data[2],
				nameID : data[7],
				draggable : self.config.markerDraggable
			});
			self.markers.push(self.markers[i]);
			google.maps.event.addListener(self.markers[i], 'click', function() {
				/*20141111 PAUSE QUICKVIEW IF ENABLED*/
				if(!self.state.isStopQuickInfo){
					self.state.isStopQuickInfo = true;
					setTimeout(function(){myGoogleMap.state.isStopQuickInfo = false;},1000);
				};		
					
				$("#expressMenu").hide(30);
				self.infowindow[this.sn].content = "這個範圍的資料量太大，請先縮小範圍。";
				self.clientState.currentMarkerNameID = this.nameID; 	
				if(this.map.zoom <= 12){
					if(this.count<=1000){
						self.infoWinOpen(this.title);
						self.showMessage('「' + this.title + '」商品讀取中');
					}else{
						if(this.map.zoom>=8 && this.map.zoom <= 12){
							self.moveNzoom(this.title,13);
						}else if(this.map.zoom>=6 && this.map.zoom<=7){
							self.moveNzoom(this.title,8);						
						}else if(this.map.zoom>=4 && this.map.zoom<=5){
							self.moveNzoom(this.title,6);						
						}else if(this.map.zoom==3){
							self.moveNzoom(this.title,4);						
						}else if(this.map.zoom==2){
							self.moveNzoom(this.title,3);												
						};
						self.showMessage('由於數量超過1000筆，分站顯示。');
					};					
				}else{
					self.insertToThisTurn(this.title);
					self.infoWinOpen(this.title);
					self.showMessage('「' + this.title + '」商品讀取中');
				};
			});				
			google.maps.event.addListener(self.markers[i], 'mouseover', function() {
				this.setIcon(self.thisMarkerOver[this.sn].toDataURL());	
				self.clientState.currentMarkerNameID = this.nameID; 	
				self.clientState.quickLocation = this.title;
				if(this.count==0){
					self.clientState.currentMarkerNameID = this.nameID;
					return false
				};
				if(self.infoWinTimeOut!== 0){
					clearTimeout(self.infoWinTimeOut);
				};						
								
				if(self.state.isStopQuickInfo){return false};
				
				if(self.clientState.lastMarker==null){
					self.clientState.lastMarker = this.sn;
					if(self.infoWinTimeOut!== 0){
						clearTimeout(self.infoWinTimeOut);
					};				
					self.clientState.currentMarkerNameID = this.nameID;						
					self.quickInfoWinOpen(this.title);					
				}else{
					if(this.sn==self.clientState.lastMarker){
						$("#gmap_quick_infowin").clearQueue();
						$("#gmap_quick_infowin").stop();	
						$('#gmap_quick_infowin').css("display","");
					}else{
						if(self.infoWinTimeOut!== 0){
							clearTimeout(self.infoWinTimeOut);
							self.clientState.lastMarker = this.sn;
							self.clientState.currentMarkerNameID = this.nameID;					
							self.quickInfoWinOpen(this.title);
							$('#gmap_quick_infowin').css("display","");
						};				
					};
					
				};
			});				
			google.maps.event.addListener(self.markers[i], 'mouseout', function() {
				self.clearQuickInfoWinState();	
				self.infoWinTimeOut = setTimeout("myGoogleMap.quickInfoWinClose()",self.config.infoWinTimeOutDuration);
				this.setIcon(self.thisMarker[this.sn].toDataURL());
			});
			google.maps.event.addListener(self.markers[i], 'rightclick', function() {
				if(this.map.zoom>=13){
					$("#expressMenu").hide(30);
					var position = self.getMouseXY(event);	/*CHROME*/
					var mMH = 82;
					var mMW = 148;
					var fixX = ((position["X"] + mMW + 10)>= document.documentElement.clientWidth)?(position["X"]-mMW):(position["X"]);
					var fixY = ((position["Y"] + mMH + 10)>= document.documentElement.clientHeight)?(position["Y"]-mMH):(position["Y"]);
					$("#markMenu").css("left",fixX+5);			
					$("#markMenu").css("top",fixY+5);			
					$("#markMenu").clearQueue();
					$("#markMenu").show(100);
				};
			});
			
		};
		this.lastZoomMem = this.map.zoom;	
	},
	getRandomizer : function(m, M){
		return Math.floor(Math.random()*(1+M-m))+m;
	},	
	infoWinTimeOut : 0,
	quickInfoWinOpen : function(data){
		if(!this.state.isQuickInfoWinEnabled){
			this.state.isQuickInfoWinEnabled = true;
			this.beTheTop(document.getElementById("gmap_quick_infowin"));
			this.userItems.markerDistrict = data;
			this.appendData("quickInfo");
		};	
	},
	userItems : {
		markerDistrict : ""
	},
	setTips : function(timer,left,top,content,width,height,arrow_pos){
		$("#tip").hide();
		var arrow_pos = arrow_pos || 20;
		$("#tip").clearQueue();
		$("#tip_arrow").css("left",arrow_pos);	
		$("#tip").css("left",left).css("top",top).css("width",width).css("height",height);
		$("#tip").clearQueue();
		$("#tip").delay(1200).fadeIn(300).delay(timer).fadeOut(500);
		$("#tip_text").html(content);
	},
	quickInfoWinClose : function(){
		$("#gmap_quick_infowin").clearQueue();
		$("#gmap_quick_infowin").stop();		
		$("#gmap_quick_infowin").fadeOut(this.config.gmap_QV_fadeDuration,function(){
			myGoogleMap.state.isQuickInfoWinEnabled = false;
			$("#gmap_quick_infowin").clearQueue();
		});
		this.clearQuickInfoWinState();
	},
	clearQuickInfoWinState : function(){
		this.state.isQuickInfoWinEnabled = false;
		this.state.isQuestFromQuickInfo = false;	
	},
	quickInfo2Detail : function(obj){
		if(document.getElementById("hiddenBG")!==null){
			document.getElementById("gmap_package").removeChild(document.getElementById("hiddenBG"));
		};	
		this.infoWinBGButton();				
		this.state.isItemDetailClicked = true;
		this.clientState.currentItemID = obj.getAttribute("item_id");
		this.appendData('itemDetail');		
		this.state.isQuestFromQuickInfo = true;
	},
	set2QuickInfoWin :function(){
		var self = this;		
		document.getElementById("gmap_quick_infowin_head").innerHTML = myGoogleMap.userItems.markerDistrict + " 隨機瀏覽";	
		var num=0;
		if(typeof(quickInfo)!=="object"){
			return false		
		};
		for(var x in quickInfo){num++;};
		for(var i=0;i<num;i++){
			var img = document.createElement("img");
			if(quickInfo[i].i!==""){
				img.src = this.config.imgServerPathQV + (quickInfo[i].i).split("/")[0] 	+ "/" + (quickInfo[i].i).split("/")[1] + "/" +  (((quickInfo[i].i).split("/")[2]).substr(6,(quickInfo[i].i).length - 1));
			}else{
				img.src= "";
			};
		};
		ready2setQV();
		function ready2setQV(){
			for(var i=0;i<num;i++){
				document.getElementById("quickRnd_" + i).setAttribute("item_id",quickInfo[i].id);
				document.getElementById("quickRnd_" + i + "_name").parentNode.parentNode.style.display = "";	
				if((quickInfo[i].i)!==""){
					document.getElementById("quickRnd_" + i + "_img").src = self.config.imgServerPathQV 
					+ (quickInfo[i].i).split("/")[0] 
					+ "/" 
					+ (quickInfo[i].i).split("/")[1] 
					+ "/" +  (((quickInfo[i].i).split("/")[2]).substr(6,(quickInfo[i].i).length - 1));					
				};	
				var img = document.getElementById("quickRnd_" + i + "_img");
				img.onload = function(){
					var ow = this.width;
					var oh = this.height;
					if(ow > oh){
						var nH = (oh*158)/ow;
						this.style.width= "158px"; 
						this.style.height = nH + "px";				
						this.style.marginTop = (158-nH)/2  + "px"; 				
					}else{
						var nW = (150*ow)/oh;
						this.style.height= "159px";
						this.style.width= nW + "px";
						this.style.marginLeft = (150-nW)/2  + "px"; 						
					};
					if(ow==0){
						this.style.cssText = "display: block; width:159px; max-width:159px; height: auto; cursor:pointer; margin:auto"; 
					};					
				};
				if( (quickInfo[i].t).length > 24){
					var title = (quickInfo[i].t).substr(0,24) + "... ";
				}else{
					var title = quickInfo[i].t;			
				};
				document.getElementById("quickRnd_" + i + "_name").innerHTML = title;
				document.getElementById("quickRnd_" + i + "_price").innerHTML = " 目前價格 " + quickInfo[i].p;						
			};		
		};

	},
	infoWinOption : function(){
		if(this.state.isInfoWinOptionTips){$("#tip").hide();}
		if(!this.state.isInfoWinOptionEnabled){
			if(this.clientState.require.catalog!==0){
				var optionStr = this.config.cataclogID[this.clientState.require.catalog];
				if(optionStr.length>=5){ optionStr = optionStr.substr(0,5)+ "..." };
				document.getElementById("filter_catalog_txt").innerHTML = optionStr;
				document.getElementById("filter_catalog_txt").className = "";
			}else{
				document.getElementById("filter_catalog_txt").className = "more";
			};			
			this.beTheTop(document.getElementById("gmap_infowin_options"));
			$("#gmap_infowin_options").clearQueue();
			$("#gmap_infowin_options").show(200);
			this.state.isInfoWinOptionEnabled = true;
		}else{
			this.beTheTop(document.getElementById("gmap_infowin_options"));			
			$("#gmap_infowin_options").hide();	
			$("#gmap_infowin_options_itemnew").hide();		
			$("#gmap_infowin_options_itemchange").hide();
			$("#gmap_infowin_options_catalogue").hide();			
							
			this.state.isInfoWinOptionEnabled = false;			
		};
	},
	infoWinOption_catalogue : function(obj){
		var catalogueID = obj.getAttribute("value");
		var catalogueStr = obj.innerHTML;		
		this.clientState.currentCategoryID_option_tmp = catalogueID; 
		if(catalogueID==0){
			this.state.isInfoWinOptionEnabled = false;
			document.getElementById("filter_catalog_txt").innerHTML="不分類";
			$('input[name="infowin_filter"]')[3].checked = false;
			$("#gmap_infowin_options_catalogue").hide();
			return false;
		}else{
			$('input[name="infowin_filter"]')[0].checked = false;	
		
		};
		var tgt = document.getElementById("filter_catalog_txt");
		this.state.isInfoWinOptionSetCatalog = true;
		$('input[name="infowin_filter"]')[3].checked = true;
		tgt.setAttribute("value",catalogueID);		
		if(catalogueStr.length>6){
			tgt.innerHTML = catalogueStr.substr(0,5) + "...";
		}else{
			tgt.innerHTML = catalogueStr.substr(0,6);
		};
		$("#gmap_infowin_options_catalogue").hide();
	},
	infoWinOption_isnew : function(obj){
		var isnewID = obj.getAttribute("value");
		var isnewStr = obj.innerHTML;		
		var tgt = document.getElementById("filter_isnew_txt");
		if(isnewID==1){
			tgt.innerHTML = "新舊不拘";
			$('input[name="infowin_filter"]')[1].checked = false;
		}else{
			tgt.innerHTML = isnewStr; 
			$('input[name="infowin_filter"]')[1].checked = true;
			$('input[name="infowin_filter"]')[0].checked = false;		
		};
		$('input[name="infowin_filter"]')[1].value = isnewID ;
		$("#gmap_infowin_options_itemnew").hide();
	},
	infoWinOption_ischange : function(obj){
		var ischangeID = obj.getAttribute("value");
		var ischangeStr = obj.innerHTML;		
		var tgt = document.getElementById("filter_changewanted_txt");		
		if(ischangeID==2){
			tgt.innerHTML = "交換 | 徵求";
			$('input[name="infowin_filter"]')[2].checked = false;
		}else{
			tgt.innerHTML = ischangeStr; 
			$('input[name="infowin_filter"]')[2].checked = true;
			$('input[name="infowin_filter"]')[0].checked = false;			
		};
		$('input[name="infowin_filter"]')[2].value = ischangeID ;
		$("#gmap_infowin_options_itemchange").hide();
	},
	infoWinOption_set : function(){
		if(this.clientState.require.catalog==0){
			$("#gmap_infowin_options_catalogue").clearQueue();
			$("#gmap_infowin_options_catalogue").fadeIn(200);
		};
		$("#gmap_infowin_options_itemnew").fadeOut(200);
		$("#gmap_infowin_options_itemchange").fadeOut(200);
		document.getElementById("gmap_infowin_options_catalogue").style.zIndex = this.topZindex;
	},
	infoWinOption_set2 : function(){
		$("#gmap_infowin_options_catalogue").fadeOut(200);
		$("#gmap_infowin_options_itemnew").fadeIn(200);
		$("#gmap_infowin_options_itemchange").fadeOut(200);
		document.getElementById("gmap_infowin_options_itemnew").style.zIndex = this.topZindex;
	},	
	infoWinOption_set3 : function(){
		$("#gmap_infowin_options_catalogue").fadeOut(200);
		$("#gmap_infowin_options_itemnew").fadeOut(200);
		$("#gmap_infowin_options_itemchange").fadeIn(200);
		document.getElementById("gmap_infowin_options_itemchange").style.zIndex = this.topZindex;
	},		
	infoWinOpen : function(d){
		this.clientState.require.location = d;
		this.infoWinReset();
		this.infoWinGetData(d);
		$("#gmap_quick_infowin").clearQueue();
		$("#gmap_quick_infowin").stop();		
		$("#gmap_quick_infowin").fadeOut(this.config.gmap_QV_fadeDuration);
		$("#gmap_quick_infowin").clearQueue();
		document.getElementById("gmap_infowin_title").innerHTML = d;
		this.beTheTop(document.getElementById("gmap_infowin"));
		if(!this.state.isInfoWinOptionTips){
			var content = "<span style='color:#555555;font-size:12px;'>這裡是 過濾器篩選功能<br>可以在這裡篩選新品、中古品、交換品或是徵求品。</span>";
			this.state.isInfoWinOptionTips = true;
		};
		$("#gmap_infowin").clearQueue();
		$("#gmap_infowin").fadeIn(300);
		$("#gmap_infowin").css("background-Color","rgba(255,255,255,0.95)");
		$("#gmap_infowin").delay(300).animate({left: (0)+ "px"});
		this.infoWinBGButton();		
		this.state.isInfoWinOpened = true;
	},
	infoWinBGButton : function(){
		var self = this;
		var h = $(document).height();
		var w = $(document).width();	
		var hiddenBG = document.createElement("div");
		hiddenBG.id = "hiddenBG";
		hiddenBG.style.position = "absolute";
		hiddenBG.style.left = "0px";
		hiddenBG.style.top = "0px";		
		hiddenBG.style.width = w + "px";
		hiddenBG.style.height = h + "px";
		hiddenBG.style.zIndex = 1;
		var top = self.topZindex - 1;	
		hiddenBG.style.zIndex =  top;
		hiddenBG.style.backgroundColor = "rgba(0,0,0,0.4)";		
		hiddenBG.onclick = function(){
			if(typeof(dbp) === 'undefined'){
			}else{
				$("#dragon_msg").remove();			
			};
		
			if(self.state.isInfoWinOpened){
				if(self.state.isItemDetailOpened){
					self.itemDetailWinClose(300);
				}else{
					self.infoWinClose();			
				};			
			}else{
				self.infoWinClose();
				self.itemDetailWinClose(300);
			};
			self.state.isQuestFromQuickInfo = false;
		};
		hiddenBG.onmouseover = function(){
			if(!self.state.isMobileDevice){
				$("#itemList_previous").fadeOut();
				$("#itemList_next").fadeOut();			
			};
		};			
		document.getElementById("gmap_package").appendChild(hiddenBG);
	},
	infoWinGetData : function(key){
		var key = this.transLocation(key);
		this.clientState.require.location = key;
		this.appendData("list");
	},
	transLocation : function(name){
		switch (name){
			case "台北市" :
				var key = "1,2";
				return key;				
			break;
			case "北北基" :
				var key = "1,2,3";
				return key;				
			break;
			case "桃竹苗" :
				var key = "4,5,6,7";
				return key;				
			break;
			case "中彰投" :
				var key = "8,9,10";
				return key;				
			break;
			case "雲嘉南" :
				var key = "11,12,13,14";
				return key;	
			break;
			case "高屏" :
				var key = "15,16";
				return key;				
			break;
			case "北部" :
				var key = "1,2,3,4,5,6";
				return key;				
			break;		
			case "中部" :
				var key = "7,8,9,10";
				return key;				
			break;		
			case "南部" :
				var key = "11,12,13,14,15,16";
				return key;				
			break;		
			case "東部" :
				var key = "17,18,19";
				return key;				
			break;												
			case "台灣" :
				var key = "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19";
				return key;				
			break;	
			default:
				var key = name;
				return key;
			break;
		};	
	},
	infoWinWheel : function(event){
			var e = event || window.event;
			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			myGoogleMap.infoWinSetData(0,delta);	
	},
	infoWinReset : function(){
		this.state.isQueryData = false;
		if(this.state.isInfoWinOptionTips){$("#tip").hide();}
		var margin = 150;
		var w=400;
		var h = $(window).height() - margin*1.5;
		$("#gmap_infowin").width(400); 
		var h2 = Math.floor((h-30)/100)*100 + 30;
		$("#gmap_infowin").height(h2); 	
		$("#gmap_infowin").css("left",- (405));
		$("#gmap_infowin").css("top",60);		
		this.state.isInfoWinOptionEnabled = false;		
		$("#gmap_infowin_options").hide();
		$("#gmap_infowin_options_catalogue").hide();
		$("#gmap_infowin_options_itemnew").hide();	
		$("#gmap_infowin_options_itemchange").hide();
		document.getElementById("filter_catalog_txt").innerHTML = "不分類";
		document.getElementById("filter_catalog_txt").setAttribute("value",0);	
		this.state.isInfoWinOptionSetCatalog = false;	
		this.itemDetailWinClose(0);
		$('input[name="infowin_filter"]')[0].disabled =false;		
		$('input[name="infowin_filter"]')[1].disabled =false;
		$('input[name="infowin_filter"]')[2].disabled =false;
		$('input[name="infowin_filter"]')[3].disabled =false;		
		$('input[name="infowin_filter"]')[0].checked =true;	
		$('input[name="infowin_filter"]')[1].checked =false;
		$('input[name="infowin_filter"]')[2].checked =false;
		$('input[name="infowin_filter"]')[3].checked =false;		
		$('input[name="infowin_filter"]')[1].value = 1;
		$('input[name="infowin_filter"]')[2].value = 2;
		$('input[name="infowin_filter"]')[3].value = 3;				
		document.getElementById("brickBox").innerHTML = "";		
		this.currentPage = 0;
		this.tempFilterData = "";
		document.getElementById("gmap_infowin_item_index").innerHTML = "資料讀取中...";
		if(isReady !== ""){
			clearInterval(isReady);
		};
	},
	infoWinClose : function(){
		$("#gmap_infowin_preview").hide();
		$("#gmap_infowin_options").hide();	
		$("#gmap_infowin_options_catalogue").hide();	
		$("#gmap_infowin_options_itemnew").hide();	
		$("#gmap_infowin_options_itemchange").hide();
		document.getElementById("filter_catalog_txt").innerHTML = "不分類";
		document.getElementById("filter_catalog_txt").setAttribute("value",0);
		document.getElementById("filter_catalog_txt").innerHTML = "不分類";
		document.getElementById("filter_catalog_txt").setAttribute("value",0);	
		$('input[name="infowin_filter"]')[1].value = 1;		
		document.getElementById("filter_isnew_txt").innerHTML = "新舊不拘";			
		this.state.isInfoWinOptionSetCatalog = false;				
		$("#gmap_infowin").animate({left: -($("#gmap_infowin").width()+20)+ "px"});
		if(this.state.isInfoWinOptionTips){$('#tip').css('display','none')};
		this.state.isInfoWinOpened = false;		
		document.getElementById("gmap_package").removeChild(document.getElementById("hiddenBG"));
	},
	currentPage : 0,
	tempFilterData : "",
	infoWinSetData : function(filter,isNext){
		var filter = filter || 0;
		var isNext = isNext || (-1);		
		var toPage = (isNext==-1)?(1):(-1);
		var self = this;
		var items = this.tempFilterData || this.infoWinFilterData(filter);
		var items_count = items.length;
		var isFinal= false;
		var originCapacity; 
		
		var wH = document.getElementById("gmap_infowin").offsetHeight;
		var head = 30;
		var rows = Math.floor((wH - head)/ 100);
		var capacity = 4*rows;
		if(items_count<=capacity){
			capacity = items_count;
		};		
		var pages = Math.ceil(items_count/capacity);
		this.currentPage = this.currentPage + toPage;
		if(this.currentPage>pages){
			this.currentPage = pages;
			return false;
		};
		if(this.currentPage<=0){
			this.currentPage = 1;
			return false;
		};	
		if(this.currentPage == pages){
			originCapacity = capacity;
			capacity = items_count-((this.currentPage-1)*capacity);
			isFinal = true;
		};	
		var mom = document.getElementById("brickBox");
		mom.onmouseover = function(){
			if(pages>1){
			
				if(self.currentPage!==1){
					$("#itemList_previous").clearQueue();
					$("#itemList_previous").fadeIn(100);
				};
				if(self.currentPage!==pages){
					$("#itemList_next").clearQueue();
					$("#itemList_next").fadeIn(100);
				};				
			};
		};		
		if(items_count==0){
			var resultStr = "<div style='color:#336633;margin:10px;line-height:22px;;font-family:微軟正黑體'>很抱歉，目前沒有符合您設定條件的商品。<br>請重新設定條件。</div>"; 
			mom.innerHTML = resultStr;
			pages = 1;
			this.currentPage = 1;
			document.getElementById("gmap_infowin_item_index").innerHTML = "目前頁數 " + this.currentPage + " / " + pages;
			return false;
		}else{
			if(this.currentPage == pages || this.currentPage==1){
				mom.innerHTML = "";
				var previous = document.createElement("div");
				previous.title = "上一頁";		
				previous.id = "itemList_previous";
				if(!self.state.isMobileDevice){
					previous.style.cssText = "position:absolute; height:100%; width:30px;left:0px; background:rgba(0,0,0,0.10);z-index:100;display:none";
				}else{
					previous.style.cssText = "position:absolute; height:100%; width:30px;left:0px; background:rgba(0,0,0,0.10);z-index:100;";
				};
				previous.onclick = function(){
					self.infoWinSetData(0,1);
				};
				var img = document.createElement("img");
				img.style.cssText = "position:absolute;top:0;bottom:0;left:1px;margin:auto;";
				img.src = "http://attach2.mobile01.com/images/marketplace/pre_m3h_previous.png";				
				
				previous.appendChild(img);
				mom.appendChild(previous);
				var next = document.createElement("div");
				next.title = "下一頁";			
				next.id = "itemList_next";
				if(!self.state.isMobileDevice){
					next.style.cssText = "position:absolute; height:100%; width:30px;right:0px; background:rgba(0,0,0,0.10);z-index:100;display:none; ";
				}else{
					next.style.cssText = "position:absolute; height:100%; width:30px;right:0px; background:rgba(0,0,0,0.10);z-index:100;";
				};
				next.onclick = function(){
					self.infoWinSetData(0,-1);
				};
				var img = document.createElement("img");
				img.style.cssText = "position:absolute;top:0;bottom:0;left:1px;margin:auto;";
				img.src = "http://attach2.mobile01.com/images/marketplace/pre_m3h_next.png";
				next.appendChild(img);
				mom.appendChild(next);				
			}else{
				$("#imgLoader").remove();
				$(".brick").remove();			
			};
		};	
		document.getElementById("gmap_infowin_item_index").innerHTML = "目前頁數 " + this.currentPage + " / " + pages;
		$("#brickBox").hide().delay(200).fadeIn(500);
		$("#gmap_infowin_preview").hide();
		for(var i=0; i<capacity; i++){
			var sn = (this.currentPage-1)*capacity + i ;
			var img = document.createElement("img");
			if(itemList[items[sn]].i !==""){
				img.src = self.config.imgServerPath + itemList[items[sn]].i; 	
			};		
		};
		ready2setList();
		function ready2setList(){
			for(var i=0; i<capacity; i++){
				if(!isFinal){
					var sn = (self.currentPage-1)*capacity + i ;
				}else{
					var sn = (self.currentPage-1)*originCapacity + i ;
				};
				var div = document.createElement("div");
				div.className = "brick";
				div.setAttribute("itemListSN",items[sn]);
				div.setAttribute("pid",itemList[items[sn]].id);				
				div.setAttribute("new",itemList[items[sn]].n);
				div.setAttribute("exchange",itemList[items[sn]].e);
				div.setAttribute("catalog",itemList[items[sn]].c);
				div.setAttribute("wanted",itemList[items[sn]].w);						
				div.onclick = function(){
					if(!self.state.isItemDetailClicked){
						self.state.isItemDetailClicked = true;
						var itemSN 		= this.getAttribute("itemListSN");
						var itemNew 	= this.getAttribute("new");
						var itemChange  = this.getAttribute("exchange");
						var itemWanted  = this.getAttribute("wanted");				
						if(itemList[itemSN].id == 4701){
							var u = "api/event/mpdragonball_api.php";
							$.ajax({
								url: u,
								type:"POST",
								data: {
									c : this.getAttribute("catalog") ,
									n : this.getAttribute("new") , 
									e : this.getAttribute("exchange") 
								},
								dataType:'html',
								success: function(html){
									if(myGoogleMap.state.isFullscreen){
										$('#gmap_popup_window').append(html);									
									}else{
										$('#gmap_attached_window').append(html);	
									};
									if(typeof(isWishMade) !== "undefined"){
										$("#radarDivWin").innerHTML = "";
										$("#radarDivWin").html("<img id='reh' src='http://attach2.mobile01.com/images/marketplace/event/dragonball/db_icon.png' title='神龍許願'/>");
										$("#radarDivWin").animate({width  : "30px",height : "30px"});
										$("#reh").click(function(){	
											var u = "api/event/mpdragonball_api.php";
											$.ajax({
												url: u,
												type:"POST",
												data: {
													t : "wish"
												},
												dataType:'html',
												success: function(html){
													var o = document.getElementById("dragon_msg");
													
													if(o==null){
														if(myGoogleMap.state.isFullscreen){
															$('#gmap_popup_window').append(html);									
														}else{
															$('#gmap_attached_window').append(html);	
														};
													};
													$("#godragon").click(function(){	
														var u2 = "api/event/mpdragonballwish_api.php";
														$.ajax({
															url: u2,
															type:"POST",
															dataType:'html',
															data : {D:this.getAttribute("data-type")},
															success: function(msg){
																if(msg){
																	document.getElementById("dragon").src = "http://attach2.mobile01.com/images/marketplace/event/dragonball/dragonball3.jpg";
																	$("#wording").html(msg);
																	$("#dragon_msg").fadeOut(15000);
																	document.getElementById("dbgtrophy").innerHTML="";
																	$("#dbgtrophy").append(wish_list);																		
																	
																}
															},
															error:function(xhr, ajaxOptions, thrownError){ 
															}
														});	
													});														
												},
												error:function(xhr, ajaxOptions, thrownError){ 
													alert(xhr)
												}
											});
										});											
									}else{
										searchDragonBall(0);
										myGoogleMap.state.initDragonBallRadar = false;	
										var t = dbp.split(",");
										dbp = "";
										for(var i=0;i<t.length;i++){
											if((t[i]).substr(8,(t[i]).length-11)!==  (myGoogleMap.clientState.currentMarkerNameID).toString(2)){
												dbp = dbp + t[i] + ",";
											};
										};
										dbp = dbp.substr(0,dbp.length-1);
										localStorage.setItem("dbpinfo", dbp );									
									
									};
									$("#godragon").click(function(){	
										var u2 = "api/event/mpdragonballwish_api.php";
										$.ajax({
											url: u2,
											type:"POST",
											dataType:'html',
											data : {D:this.getAttribute("data-type")},
											success: function(msg){
												if(msg){
													document.getElementById("dragon").src = "http://attach2.mobile01.com/images/marketplace/event/dragonball/dragonball3.jpg";
													$("#wording").html(msg);
													$("#dragon_msg").fadeOut(15000);
													document.getElementById("dbgtrophy").innerHTML="";
													$("#dbgtrophy").append(wish_list);													
												}
											},
											error:function(xhr, ajaxOptions, thrownError){ 
											}
										});	
									});									

									
								},
								error:function(xhr, ajaxOptions, thrownError){ 
									alert(xhr)
								}
							});								
							
						}else{
							self.clientState.currentItemID = itemList[itemSN].id;
							self.appendData('itemDetail');
							self.showMessage( "「"  + (itemList[itemSN].t).substr(0,14) + "...」 讀取中");
						};
					};
				};
				div.onmouseover = function(){
					currentForContextMenu = this;
					var gmap_infowin_height = document.getElementById("gmap_infowin").offsetHeight;
					var mySN = this.getAttribute("itemListSN");
					this.style.cursor="pointer";
					self.beTheTop(document.getElementById("gmap_infowin_preview"));
					if(itemList[mySN].i!==""){
						document.getElementById("infowin_img_preview").src = self.config.imgServerPathQV 
						+ (itemList[mySN].i).split("/")[0]
						+ "/"
						+ (itemList[mySN].i).split("/")[1]
						+ "/" 
						+ (((itemList[mySN].i).split("/")[2]).substr(6,(itemList[mySN].i).length - 1));
						
					}else{
						document.getElementById("infowin_img_preview").src = "http://attach2.mobile01.com/images/marketplace/gmapnoimage.gif";
					};
					
					if((itemList[mySN].t).length >=20){
						var title = (itemList[mySN].t).substr(0,18) + "... ";
					}else{
						var title = itemList[mySN].t;
					};
					document.getElementById("gmap_infowin_preview_intro").innerHTML = title;		
					document.getElementById("gmap_infowin_preview_price").innerHTML = "目前出價 " + itemList[mySN].p + " 元";
					document.getElementById("gmap_infowin_preview_itemid").innerHTML = "";		
					
					/*FOR DRAGONBALL*/
					var pid = this.getAttribute("pid");
					if(pid==4701){
						document.getElementById("infowin_img_preview").src = this.childNodes[0].src;
						document.getElementById("gmap_infowin_preview_price").innerHTML = "請點擊取得" + title
					};
						
					if((this.offsetTop + 180) >= gmap_infowin_height){
						if( ((gmap_infowin_height-30) - this.offsetTop) <= 50 ){
							document.getElementById("gmap_infowin_preview").style.top = ((gmap_infowin_height) - 180 +80  ) + "px";	
							document.getElementById("infowin_img_preview_arrow").style.top = "135px";	
						}else{
							document.getElementById("gmap_infowin_preview").style.top = (this.offsetTop + 100) - 180 +80 + "px";		
							document.getElementById("infowin_img_preview_arrow").style.top = "105px";						
						}
					}else{
						document.getElementById("gmap_infowin_preview").style.top = (this.offsetTop +80) + "px";				
						document.getElementById("infowin_img_preview_arrow").style.top = "25px";					
					};
					$("#gmap_infowin_preview").show();
				};
				div.onmouseout = function(){
					$("#gmap_infowin_preview").hide();
				};
				var img = document.createElement("img");
				if(itemList[items[sn]].i !==""){
					img.src = self.config.imgServerPath + itemList[items[sn]].i;
				}else{
					img.src = "";
				};
				img.style.display = "none";
				img.onload = function(){
					var oW = 0;
					var oH = 0;
					oW = this.width;
					oH = this.height;
					if(oW>=oH){
						var nH = (oH*98)/oW;
						this.style.width= "98px"; 
						this.style.height = nH + "px";				
						this.style.marginTop = (98-nH)/2  + "px";
						this.style.display = "";						
					}else{
						var nW = (98*oW)/oH;
						this.style.height= "98px"; 
						this.style.width = nH + "px";				
						this.style.marginLeft = (98-nW)/2  + "px"; 							
						this.style.display = "";						
					};
					this.parentNode.style.backgroundImage = "";
				};
				div.appendChild(img);
				mom.appendChild(div);
				img.parentNode.style.backgroundImage = "url(http://attach2.mobile01.com/images/marketplace/gmapnoimage.gif)";
			};
		};
	},
	infoWinFilterData : function(filter){
		var data = [];
		switch (typeof(filter)) {
			case "number":
				for(var sn in itemList){
					data.push(sn);
				};				
			break;
			case "object":
				if(filter.indexOf("1")!==-1){
					var n=2;
				}else if(filter.indexOf("1.1")!==-1){
					var n=1;
				}else if(filter.indexOf("1.2")!==-1){
					var n=0;				
				}else{
					var n=2;
				};	
				if(filter.indexOf("2")!==-1){
					var e=2;
					var w=2;
				}else if(filter.indexOf("2.1")!==-1){
					var e=1;
					var w=0;				
				}else if(filter.indexOf("2.2")!==-1){
					var e=0;
					var w=1;				
				}else{
					var e=2;
					var w=2;
				};
				if(filter.indexOf("3")!==-1){
					var c = (document.getElementById("filter_catalog_txt")).getAttribute("value");
				}else{
					c = 0;
				};				
				for(var sn in itemList){
					var pass = true;
					if(n==2){
					}else if(itemList[sn].n == n){
					}else{
						pass = false;
					};
					if(e==2){
					}else if(itemList[sn].e == e){
					}else{
						pass = false;
					};					
					if(w==2){
					}else if(itemList[sn].w == w){
					}else{
						pass = false;
					};
					if(c==0){
					}else{
						if(itemList[sn].c==c){
						}else{
							pass = false;
						};
					};
					if(pass){
						data.push(sn)
					};				
				};	
				this.tempFilterData = data;
			break;
		};
		return data
	},
	infoWinSetOption : function(m){
		if( 0 <= m &&  m<=3){
			switch(m){
				case 0 :
					if(	$('input[name="infowin_filter"]')[0].checked){
						$('input[name="infowin_filter"]')[1].disabled =false;
						$('input[name="infowin_filter"]')[2].disabled =false;
						$('input[name="infowin_filter"]')[3].disabled =false;						
						$('input[name="infowin_filter"]')[1].checked =false;
						$('input[name="infowin_filter"]')[2].checked =false;
						$('input[name="infowin_filter"]')[3].checked =false;	
						$('input[name="infowin_filter"]')[1].value=1;
						$('input[name="infowin_filter"]')[2].value=2;
						if(this.clientState.require.catalog==0){						
							document.getElementById("filter_catalog_txt").innerHTML = "不分類";
						};
						document.getElementById("filter_isnew_txt").innerHTML = "新舊不拘";
						document.getElementById("filter_changewanted_txt").innerHTML = "交換 | 徵求";						
						this.state.isInfoWinOptionSetCatalog = false;	
						document.getElementById("filter_catalog_txt").setAttribute("value",0);	
						$("#gmap_infowin_options_catalogue").hide(200);
					}else{
						$('input[name="infowin_filter"]')[1].disabled =false;
						$('input[name="infowin_filter"]')[2].disabled =false;
						$('input[name="infowin_filter"]')[3].disabled =false;	
					};
					$("#gmap_infowin_options_catalogue").fadeOut(200);				
				break;

				case 1 :
					if(	!$('input[name="infowin_filter"]')[1].checked){
						document.getElementById("filter_isnew_txt").innerHTML = "新舊不拘";
						document.getElementById("filter_isnew_txt").setAttribute("value",0);					
						$('input[name="infowin_filter"]')[1].value=1;
						$('input[name="infowin_filter"]')[1].checked = false;
			
					}else{
						$('input[name="infowin_filter"]')[1].checked = false;
					};
					$("#gmap_infowin_options_catalogue").fadeOut(200);
				break;			
			
				case 2 :
					if(	!$('input[name="infowin_filter"]')[2].checked){
						document.getElementById("filter_changewanted_txt").innerHTML = "交換 | 徵求";
						document.getElementById("filter_changewanted_txt").setAttribute("value",0);					
						$('input[name="infowin_filter"]')[2].value=2;
						$('input[name="infowin_filter"]')[2].checked = false;
					}else{
						$('input[name="infowin_filter"]')[2].checked = false;
					};				
					$("#gmap_infowin_options_catalogue").fadeOut(200);
				break;	
			
				case 3 :
					if(	$('input[name="infowin_filter"]')[3].checked){
						$('input[name="infowin_filter"]')[3].checked = false;
					}else{
						this.clientState.currentCategoryID_option_tmp = null;
						document.getElementById("filter_catalog_txt").innerHTML = "不分類";
						document.getElementById("filter_catalog_txt").setAttribute("value",0);	
						$("#gmap_infowin_options_catalogue").fadeOut(200);
					};
				break;
			};
		}else if(m=="exec"){
			var opts = [];
			this.tempFilterData = "";
			this.currentPage = 0;
			$('input[name="infowin_filter"]:checked').each(function() {
				console.log(this.value);
				opts.push(this.value);
			});			
			if(opts.length!==0){
				if(opts.indexOf("0")!== -1 || opts==1){
					this.infoWinSetData(0);
				}else {
					this.infoWinSetData(opts);				
				};
				this.state.isInfoWinOptionEnabled = false;		
				$("#gmap_infowin_options").hide(200);
				this.showMessage("篩選中...");
			};
			$("#gmap_infowin_options_catalogue").hide(0);
			$("#gmap_infowin_options_itemnew").hide(0);	
			$("#gmap_infowin_options_itemchange").hide(0);
		};
	},
	drawMark : function(i,count,size,sys){
		var size= size || 30;
		this.drawMark[i]= document.createElement('canvas'),
		this.drawMark[i].width = size;
		this.drawMark[i].height = size;		
		context = this.drawMark[i].getContext('2d');
		context.beginPath();
		context.arc(size/2,size/2,size/2 -3,0,2*Math.PI);
		context.stroke();
		switch(sys){
			case "台鐵":
				var markerColor = this.config.markerColor[sys];
			break;

			case "北捷":
				var markerColor = this.config.markerColor[sys];
			break;	

			case "高捷":
				var markerColor = this.config.markerColor[sys];
			break;			
			
			case "高鐵":
				var markerColor = this.config.markerColor[sys];
			break;
			default :
				var markerColor = this.markerColor ;				
			break;
		};
		var RGB = this.hex2RGB( markerColor );
		context.fillStyle = "rgba(" + RGB["R"] + ", "+ RGB["G"] +", "+ RGB["B"] +", 0.50)";
		context.fill();
		context.textAlign = 'center';
		context.font = 'bold 12pt Calibri';
		context.fillStyle = "#000000";
		context.fillText( count , size/2, size/2 + 5);	
		context.closePath();			
		return this.drawMark[i]
	},
	drawMarkOver : function(i,count,size,sys){
		var size= size || 30;
		this.drawMark[i]= document.createElement('canvas'),
		this.drawMark[i].width = size;
		this.drawMark[i].height = size;		
		context = this.drawMark[i].getContext('2d');
		context.beginPath();
		context.arc(size/2,size/2,size/2 -3,0,2*Math.PI);
		context.stroke();
		var RGB = this.hex2RGB( this.config.markerColor.onover );
		context.fillStyle = "rgba(" + RGB["R"] + ", "+ RGB["G"] +", "+ RGB["B"] +", 0.50)";		
		context.fill();
		context.textAlign = 'center';
		context.font = 'bold 12pt Calibri';
		context.fillStyle = "#000000";
		context.fillText( count , size/2, size/2 + 5);	
		context.closePath();			
		return this.drawMark[i]
	},
	moveCenter : function(lat,lng){
		var lat = lat || this.Data.CenterLatlng.TAIWAN.lat;
		var lng = lng || this.Data.CenterLatlng.TAIWAN.lng;		
		var center = new google.maps.LatLng(lat,lng);
    	this.map.panTo(center);
	},
	zoomTo : function(zoom){
		this.map.setZoom(zoom);		
	},
	moveNzoom : function(tgt,zoom){
		if(typeof(tgt)=="string"){
			var city2station = {
				台北市 :"台北火車站",
				新北市 :"板橋火車站",
				基隆市 :"基隆火車站",
				桃園市 :"桃園火車站",
				新竹   :"新竹火車站",
				台中市 :"台中火車站",
				彰化縣 :"員林火車站",
				南投縣 :"集集火車站",
				苗栗縣 :"苗栗火車站",
				雲林縣 :"斗六火車站",
				嘉義   :"嘉義火車站",
				台南市 :"台南火車站",
				高雄市 :"高雄火車站",
				屏東縣 :"屏東火車站",
				宜蘭縣 :"宜蘭火車站",
				花蓮縣 :"花蓮火車站",
				台東縣 :"台東火車站"
			};
			if(city2station[tgt]!==undefined){
				tgt = city2station[tgt];
			};	
			for(var i=0;i<stations.length;i++){
				if(stations[i][2] == tgt){
					var lat = stations[i][4];
					var lng = stations[i][5];					
				};
			};
		}else if(typeof(tgt)=="object"){
			var lat = tgt[0];
			var lng = tgt[1];			
		};
		this.moveCenter(lat, lng);
		this.zoomTo(zoom);	
	},
	getClientScreen : function(){
		this.clientState.screenSize.height = window.screen.height;
		this.clientState.screenSize.width = window.screen.width;	
	},
	insertFavorStation : function(){
		$("#markMenu").hide(30);
		var isRepeat = false;		
		var self = this; 
		var thisID = ( typeof(this.clientState.currentMarkerNameID)=="string")?(this.clientState.currentMarkerNameID.split(",")[0]):(this.clientState.currentMarkerNameID);
		if(thisID == undefined){
			alert("目前並無對應的車站，請至問題回報。");
			return false
		};
		if(this.clientState.favoriteStations!==""){
			if(typeof(myGoogleMap.clientState.favoriteStations)=="string"){
				var favStations = this.clientState.favoriteStations.split(","); 
				for(var i=0;i<favStations.length;i++){
					if(favStations[i] == thisID){
						isRepeat = true;
						break;
					};
				};				
			};
		};
		var tmp = this.clientState.favoriteStations;
		if(!isRepeat){
			if(this.clientState.favoriteStations==""){
				this.clientState.favoriteStations = thisID;
			}else{
				this.clientState.favoriteStations = this.clientState.favoriteStations + "," + thisID;
			};
			if(typeof(this.clientState.favoriteStations)== "number"){
			}else if(typeof(this.clientState.favoriteStations)== "string"){
				var favStations = this.clientState.favoriteStations.split(",");
				if(favStations.length>8){
					self.showMessage('最多只能儲存8個最愛車站，請先至 「編輯管理」 選擇要移除的車站。');
					return false;
				};
			}else{
				return false;	
			};
			var favor_token = document.getElementById("favor_token").value;
			var favor_time = document.getElementById("favor_time").value;				
			var URL = "/api/mpgmap_favor_api.php?token=" + favor_token + "&time=" + favor_time + "&station=" + this.clientState.favoriteStations ;
			$.ajax({
				url: URL,
				type:"POST",
				dataType:'text',
				success: function(msg){
					if(msg=="unlogin"){
						alert("您尚未登入帳號");
						myGoogleMap.clientState.favoriteStations = tmp;
						return false;
					}else{
						self.showMessage("「" + stationID[thisID] + "」 已成功加入最愛車站");
						refreshTab();
					}
				},
				error:function(xhr, ajaxOptions, thrownError){ 
				}
			});				
		}else{
			self.showMessage( "「" + stationID[thisID] + "」 已存在最愛車站");
		};
	},
	link2FastPublish : function(){
		$("#markMenu").hide(30);
		window.open("mpezaddproduct.php?t=" + this.clientState.currentMarkerNameID);
	},
	lookArround : function(){
		var station = stationID[this.clientState.currentMarkerNameID];
		for(var i=0;i<stations.length;i++){
			if(stations[i][2] == station){
				var lat = stations[i][4];
				var lng2 = stations[i][5];
				var lng = (lng2+"").substr(0,8);
				
			};
		};
		var angle = 20;
		/*
		alert(station + " ==> " + lat + "," + lng );
		window.open(shareURL[n] + "http://www.mobile01.com/mpitemdetail.php?id=" + myGoogleMap.clientState.currentItemID, "postItem", "width=600, height=400, left=300,top=300");
		document.getElementById("tt").src = "http://maps.googleapis.com/maps/api/streetview?size=800x400&location=" + latLng + "&heading="+ angle + "&pitch=-0.76&sensor=false";
		*/
		window.open("http://maps.googleapis.com/maps/api/streetview?size=800x400&location=" + lat + "," + lng + "&heading="+ 60.78 + "&pitch=-0.76&sensor=false", "postItem", "width=600, height=400, left=300,top=300");
		
	},
	showMessage : function(txt,mode){
		var m = mode || 0;	
		var timer = (m==0)?((txt.length>=20)?(2500):(1000)):(10000);
		$("#gmap_status_info").text(txt);
		$("#gmap_status_info").clearQueue();
		$("#gmap_status_info").fadeIn(500).delay(timer).fadeOut(500);	
		$("#gmap_status_info_fs_msg").text(txt);
		$("#gmap_status_info_fs_msg").clearQueue();
		$("#gmap_status_info_fs_msg").fadeIn(500).delay(timer).fadeOut(500);	
	},
	clientState :{
		lastMarker : null,
		quickLocation : "",
		isIE : false,
		screenSize: {
			width:0,
			height:0
		},
		currentSize:{
			width :"",
			height  : ""
		},
		require:{
			location : "",
			keyword : "",
			catalog : "",
			itemsStatus : []
		},
		favoriteStations  : "",
		currentCategoryID : null,
		currentCategoryID_option_tmp : null,
		currentMarkerNameID : null,		
		currentItemID : null
	},	
	hex2RGB : function(hex){
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			R: parseInt(result[1], 16),
			G: parseInt(result[2], 16),
			B: parseInt(result[3], 16)
		} : null;
	},
	unlockKeyWord : function(){
		document.getElementById("searchButton").disabled = false;
	},
	toSearch : function(){
		this.clientState.require.location = "";
		this.clientState.require.locationID = "";
		this.clientState.require.keyword = "";
		this.clientState.require.catalog = "";
		this.clientState.require.itemsStatus = [];	
		var keyword = document.getElementById("user_keyword").value;
		if(keyword!==""){
			this.clientState.require.keyword = keyword;
			$(currentCategory).css("background","#ffffff");
			currentCategory = null;
			this.appendData('counts');
			document.getElementById("searchButton").disabled=true;	
			setTimeout("myGoogleMap.unlockKeyWord()",3000);
			var str = '關鍵字搜尋 "' + keyword + '"';
			if(str.length>15){
				str = str.substr(0,15) + '..."';
			};
			if(myGoogleMap.config.enableFSstatus){
				document.getElementById("gmap_status_info_fs_cata").innerHTML = str;
			};
			this.showMessage("搜尋完成");
		};
	}, 
	autoUnlockQueryData : function(){
		this.state.isQueryData = false;
		this.state.isItemDetailClicked = false;
		clearTimeout(tid);
	},
	appendData : function(mode){
		if(this.state.isQueryData){
			return false
		}else{
			this.state.isQueryData = true;
			this.state.tryTimes = 0;	
			tid = setTimeout("myGoogleMap.autoUnlockQueryData()",this.config.triggerTimer[mode]);
		};
		var self = this;
		var keyword =  myGoogleMap.clientState.require.keyword;
		var catalog = myGoogleMap.clientState.require.catalog;
		var location = myGoogleMap.clientState.require.location;
		var locationID = myGoogleMap.clientState.currentMarkerNameID;
		var opts = [];
		var status;
		$('input[name="user_filter"]:checked').each(function() {
			opts.push(this.value);
		});	
		if(opts.indexOf("0")!== -1){status = 0};
		if(opts.indexOf("1")!==-1  && opts.indexOf("2")!==-1 &&opts.indexOf("3")!==-1 && opts.indexOf("4")!==-1 ){
			status=0;
		}else{
			status = opts;
		};
		self.clientState.require.keyword = keyword;
		self.clientState.require.itemsStatus = status;
		var url = this.config.APIs[mode];
		var script = document.createElement("script");
		switch (mode){
			case "counts":
				searchID = this.getRandomizer(0,99999999);
			
				if(catalog!==""){
					script.src = encodeURI(url + "&rndnum=" + searchID + "&c=" + catalog);
				}else if(keyword!==""){
					script.src = encodeURI(url + "&rndnum=" + searchID + "&k=" + keyword);	
				};
				document.body.appendChild(script);				
				isReady = setInterval(this.isDataReturn.counts,500);
			break; 
			case "list":
				searchID = this.getRandomizer(0,99999999);
				if(catalog!==""){
					script.src = encodeURI(url + "&rndnum=" + searchID + "&c=" + catalog + "&t=" + locationID) ;
				}else if(keyword!==""){
					script.src = encodeURI(url + "&rndnum=" + searchID + "&t=" + locationID +  "&k=" + keyword) ;
				}else{
					script.src = encodeURI(url + "&rndnum=" + searchID + "&t=" + locationID);
				};				
				document.body.appendChild(script);			
				var img = document.createElement("img");
				img.id = "imgLoader";
				img.src="http://attach2.mobile01.com/images/marketplace/ajax-loader2.gif";
				img.style.position="absolute";
				img.style.top="50%";
				img.style.marginTop="-80px";
				img.style.left="50%";		
				img.style.marginLeft="-49px";						
				document.getElementById("brickBox").appendChild(img);
				isReady = setInterval(this.isDataReturn.itemList,1000);
			break;
			case "itemDetail":
				searchID = this.getRandomizer(0,99999999);
				script.src = encodeURI(url + "?id=" + self.clientState.currentItemID + "&mode=2");
				document.body.appendChild(script);			
				isSuccess = false;
				isReady = setInterval(this.isDataReturn.itemDetail,500);
			break; 	
			case "quickInfo":
				searchIDQV = this.getRandomizer(0,99999999);
				document.getElementById("gmap_quick_infowin_head").innerHTML = "資料載入中...";		
				for(var i=0;i<4;i++){
					document.getElementById("quickRnd_" + i + "_img").src = "";
					document.getElementById("quickRnd_" + i + "_img").style.cssText = "";
					document.getElementById("quickRnd_" + i + "_name").innerHTML = "";
					document.getElementById("quickRnd_" + i + "_price").innerHTML = "";
					document.getElementById("quickRnd_" + i + "_name").parentNode.parentNode.style.display = "none";		
				};				
			
				var location = this.transLocation(myGoogleMap.clientState.quickLocation);
				if(catalog!==""){
					script.src = encodeURI(url + "&rndnum=" + searchIDQV + "&c=" + catalog + "&t=" + locationID) ;
				}else if(keyword!==""){
					script.src = encodeURI(url + "&rndnum=" + searchIDQV + "&t=" + locationID +  "&k=" + keyword) ;
				}else{
					script.src = encodeURI(url + "&rndnum=" + searchIDQV + "&t=" + locationID);
				};					
				document.body.appendChild(script);	
				isReadyQV = setInterval(this.isDataReturn.quickInfo,500);				
			break;			
			
		};
	},
	isDataReturn : {
		counts : function(){
			myGoogleMap.state.tryTimes++;
			if(myGoogleMap.state.tryTimes>=myGoogleMap.config.dataFeedbackTimes){
				console.log("2800 : 超過" + myGoogleMap.config.dataFeedbackTimes + "次要不到資料，停止request!" );
				clearInterval(isReady);myGoogleMap.state.tryTimes = 0;};
			if(searchID == returnID){
				searchID = null;
				returnID = null;
				clearInterval(isReady);
				myGoogleMap.state.tryTimes = 0;	
				myGoogleMap.init();
				refresh_PAGE_SHOW();
			};
		},
		itemList : function(){
			myGoogleMap.state.tryTimes++;
			console.log("questID: " + searchID + " tryTimes :" + myGoogleMap.state.tryTimes);						
			if(myGoogleMap.state.tryTimes>=myGoogleMap.config.dataFeedbackTimes){
				console.log("2820 : 超過"+ myGoogleMap.config.dataFeedbackTimes +"次要不到資料，停止request!" );
				clearInterval(isReady);myGoogleMap.state.tryTimes = 0;	
				myGoogleMap.dataReturnFailHandle()};
			if(searchID == returnID){
				console.log("returnID: " + searchID);			
				myGoogleMap.infoWinSetData();
				searchID = null;
				returnID = null;
				clearInterval(isReady);
				myGoogleMap.state.tryTimes = 0;	
			};		
		},
		quickInfo : function(){
			myGoogleMap.state.tryTimesQV++;
			if(myGoogleMap.state.tryTimesQV>=myGoogleMap.config.dataFeedbackTimes){
				console.log("2830 : quickInfo 超過"+myGoogleMap.config.dataFeedbackTimes+"次要不到資料，停止request!" );
				clearInterval(isReadyQV);
				myGoogleMap.state.tryTimesQV = 0;	
				myGoogleMap.dataReturnFailHandle()
			};			
			if(searchIDQV == returnID){
				searchIDQV = null;
				returnID = null;
				clearInterval(isReadyQV);
				myGoogleMap.state.tryTimesQV = 0;			
				myGoogleMap.set2QuickInfoWin();
			};
		}, 
		itemDetail : function(){
			myGoogleMap.state.tryTimes++;
			if(myGoogleMap.state.tryTimes>=20){
				console.log("2432 : 超過20次要不到資料，停止request!" );
				clearInterval(isReady);myGoogleMap.state.tryTimes = 0; 
				myGoogleMap.dataReturnFailHandle();};			
			if(isSuccess == true){
				searchID = null;
				itemdetail_checkID = null;
				clearInterval(isReady);	
				myGoogleMap.state.tryTimes = 0;								
				myGoogleMap.itemDetailWinOpen();
			};
		}
	},
	dataReturnFailHandle : function(){
		console.log("dataReturnFailHandle")
	},	
	itemDetailWinOpen : function(){
		var self = this;
		document.getElementById("gmap_itemDetail_photo").innerHTML = "";
		document.getElementById("gmap_itemDetail_preview_navi").innerHTML = "";	
		document.getElementById("share_to_SNS").style.display = "";	
		if(!this.state.isFullscreen){
			document.getElementById("gmap_itemDetail_win").style.top = "25px";
			document.getElementById("gmap_itemDetail_win").style.left = "25px";			
		}else{
			if(!this.state.isDetailWinDragged){
				if(!myGoogleMap.state.isLowDefiScreen){
					document.getElementById("gmap_itemDetail_win").style.top = "80px";
					document.getElementById("gmap_itemDetail_win").style.left = "420px";
				}else{
					document.getElementById("gmap_itemDetail_win").style.top = (($(window).height()/2)-$("#gmap_itemDetail_win").height()/2 ) + "px";
					document.getElementById("gmap_itemDetail_win").style.left = (($(window).width()/2)-475 ) + "px";
				};
				this.state.isDetailWinDragged = true;
			};
		};
		if(this.state.isMobileDevice){
			document.getElementById("gmap_itemDetail_win").style.top = "45%";
			document.getElementById("gmap_itemDetail_win").style.marginTop = "-371px";
			document.getElementById("gmap_itemDetail_win").style.left = "50%";
			document.getElementById("gmap_itemDetail_win").style.marginLeft = "-476px";
		};		
		this.beTheTop(document.getElementById("gmap_itemDetail_win"));
		document.getElementById("hiddenBG").style.zIndex =  (this.topZindex)-2;		
		document.getElementById("gmap_infowin").style.zIndex =  (this.topZindex)-1;		
		$("#gmap_itemDetail_win").clearQueue();
		$("#gmap_itemDetail_win").fadeIn(300,function(){
			self.state.isItemDetailClicked = false;
		});
		this.state.isItemDetailOpened = true; 
		this.itemDetailGetReady(this.clientState.currentItemID);
	},
	itemDetailWinClose : function(duration){
		$("#gmap_itemDetail_win").fadeOut(duration);
		this.state.isItemDetailOpened = false;	
		this.state.isItemDetailClicked = false;
		document.getElementById("gmap_itemDetail_photo").innerHTML = "";
		document.getElementById("gmap_itemDetail_preview_navi").innerHTML = "";
		document.getElementById("preview_navi_next").style.display = "";	
		$("#gmap_itemDetail_preview_navi").animate({left: 0 + "px"});	
		var ArrowIMG = document.getElementById("img_preview_arrow");
		ArrowIMG.src = "http://attach2.mobile01.com/images/marketplace/pre_m3h_next.png";
		ArrowIMG.setAttribute("state",1);			
		if(this.state.isQuestFromQuickInfo){
			if(document.getElementById("hiddenBG")!==null){
				document.getElementById("gmap_package").removeChild(document.getElementById("hiddenBG"));
				this.state.isQuestFromQuickInfo = false;
			};	
		};
	},
	img_info : [],
	itemData : "",
	itemDetailGetReady : function(itemID){
		var self = this;
		if(this.errHandle(itemID)){
			this.clearDetailData();
			this.itemData = items[itemID];
			this.state.isDetailLackPic = true;
			if(detailTimer!==null){
				clearTimeout(detailTimer);
			};
			if(this.Data == undefined){return false};		
			var img_counts=0;
			this.img_info = [];
			for (imgs in this.itemData.img){
				img_counts++;
			};
			self.itemDetailSetData(img_counts);
		}
	},
	setItem2History : function(pid,pname){
		var tgt = document.getElementById("browseHistoryList");
		var div = document.createElement("div");
		var self = this;
		div.style.width = "286px";	
		div.style.color ="#777777";	
		div.style.height = "22px";
		div.style.lineHeight = "22px";
		div.style.textOverflow = "ellipsis";
		div.style.overflow = "hidden";
		div.style.cursor = "pointer";
		div.style.fontSize = "11px";
		div.style.marginBottom = "2px";
		div.style.borderBottom = "1px solid #dddddd";
		div.setAttribute("pid",pid);
		div.innerHTML = pname;
		div.onmouseover = function(){
			this.style.color ="#99CC33";
		};
		div.onmouseout = function(){
			this.style.color ="#777777";
		};
		div.onclick = function(){
			if(document.getElementById("hiddenBG")!==null){
				document.getElementById("gmap_package").removeChild(document.getElementById("hiddenBG"));
			};	
			self.infoWinBGButton();		
			self.state.isQuestFromQuickInfo = true;									
			self.clientState.currentItemID = this.getAttribute("pid");
			self.appendData('itemDetail');				
		};
		$(tgt).prepend(div);
	},
	clearDetailData : function(){
		document.getElementById("gmap_itemDetail_qanum").style.display = "";
		document.getElementById("gmap_itemDetail_name").innerHTML = "";
		document.getElementById("gmap_itemDetail_descriptMore").innerHTML="";
		document.getElementById("saler_label").innerHTML = "";
		document.getElementById("saler_name").innerHTML = "";
		document.getElementById("bid_sofar").innerHTML = "";
		document.getElementById("bid_begin").innerHTML = "";
		document.getElementById("direct_price").innerHTML = "";				
		document.getElementById("discountStr").innerHTML="";
		document.getElementById("origin_price").innerHTML = "";	
		document.getElementById("direct_price2").innerHTML = "";	
		document.getElementById("direct_price3").innerHTML = "";
		document.getElementById("isBidItem").style.display = "none";
		document.getElementById("isNotBidItem").style.display = "none";		
		document.getElementById("isWantedItem").style.display = "none";		
		document.getElementById("wanted_price_min").innerHTML = "";
		document.getElementById("wanted_price_max").innerHTML = "";	
		document.getElementById("item_btn1").innerHTML = 0;	
		document.getElementById("item_btn2").innerHTML = 0;					
	},
	itemDetailSetData : function (img_counts){
		var self = this;
		var Data = this.itemData;
		this.itemData = "";
		this.setItem2History(Data.id,Data.name);
		document.getElementById("gmap_itemDetail_name").innerHTML = Data.name 
			+ "<br>"
			+ "<span style='font-size:14px;color:#0033FF;margin-left:2px;'>" 
			+ Data.status + "</span>" 
			+ "<span id='descriiptString' style='font-size:14px;color:#666666'> (" + Data.descript + ")</span>";
		if(Data.descript==""){
			document.getElementById("descriiptString").style.display="none";
		};
		var isWantedEvt = (Data.bid.price==null)?(true):(false);
		if(isWantedEvt){
			document.getElementById("item_btn1_label").innerHTML = "提供";
			document.getElementById("item_btn1").innerHTML = Data.qty;
		}else{
			if(Data.owner.isStore){
				document.getElementById("item_btn1_label").innerHTML = "已售";			
				document.getElementById("item_btn1").innerHTML = Data.bid.soldNum;				
			}else{
				document.getElementById("item_btn1_label").innerHTML = "出價";
				document.getElementById("item_btn1").innerHTML = Data.bid.bidNum;						
			};
		};		
		document.getElementById("item_btn2").innerHTML = Data.bid.qaNum;	
		document.getElementById("gmap_itemDetail_descriptMore").innerHTML = Data.descriptMore ;
		var isBidItem = (Data.bid.endtime !== null)?(true):(false);
		if(isBidItem){
			document.getElementById("isBidItem").style.display = "";
			document.getElementById("isNotBidItem").style.display = "none";		
			document.getElementById("isWantedItem").style.display = "none";				
			document.getElementById("bid_sofar").innerHTML = Data.bid.price.sofar;
			document.getElementById("bid_begin").innerHTML = Data.bid.price.begin;
			document.getElementById("direct_price").innerHTML = Data.bid.price.direct;			
		}else{
			if(Data.bid.price==null){
				document.getElementById("isWantedItem").style.display = "";	
				document.getElementById("isBidItem").style.display = "none";
				document.getElementById("isNotBidItem").style.display = "none";		
				document.getElementById("wanted_price_min").innerHTML = Data.wanted.price.min;
				document.getElementById("wanted_price_max").innerHTML = Data.wanted.price.max;
				document.getElementById("gmap_itemDetail_qanum").style.display = "none";
			}else{
				document.getElementById("isNotBidItem").style.display = "";		
				if(parseInt(Data.bid.price.discount)!==0){
					document.getElementById("discountItem").style.display = "";	
					document.getElementById("NoDiscountItem").style.display = "none";	
					var numToChinese = {0:"",1:"一",2:"二",3:"三",4:"四",5:"五",6:"六",7:"七",8:"八",9:"九"};
					var discountStr = "";
					for(var i=0;i<(Data.bid.price.discount).length;i++){
						discountStr = discountStr + numToChinese[(Data.bid.price.discount)[i]];
					};
					document.getElementById("origin_price").innerHTML = Data.bid.price.origin;				
					document.getElementById("direct_price3").innerHTML = Data.bid.price.direct;
					var obj = document.getElementById("direct_price3");				
					document.getElementById("discountStr").innerHTML = discountStr + "折";				
					document.getElementById("discountStr").style.marginLeft = (obj.offsetLeft - 35) + "px";
				}else{
					document.getElementById("discountItem").style.display = "none";						
					document.getElementById("NoDiscountItem").style.display = "";					
					document.getElementById("direct_price2").innerHTML = Data.bid.price.direct;
				};				
			};
		};
		document.getElementById("linkOpen").href = "mpitemdetail.php?id=" + Data.id;
		document.getElementById("linkOpenBid").href = "mpitembid.php?id=" + Data.id + "#bid";
		document.getElementById("linkOpenQA").href = "mpitemqa.php?id=" + Data.id + "#qa";				
		if(Data.owner.isStore){document.getElementById("saler_label").innerHTML = ""}else{document.getElementById("saler_name").innerHTML = Data.owner.uname};
		if(Data.bid.station==0){document.getElementById("saler_label").style.display = "none"}else{document.getElementById("saler_station").innerHTML = Data.bid.station };
		document.getElementById("saler_eval_percent").innerHTML = Data.owner.eval_percent;
		document.getElementById("saler_evaluate").innerHTML = "(" + Data.owner.evaluate + ")";
		document.getElementById("salert_city").innerHTML = Data.bid.location;		
		var imgMom = document.getElementById("gmap_itemDetail_photo");
		var currentSN = 0;
		var img = document.createElement("img");
		img.src = Data.img[currentSN];
		var tmp = (img.src).split("/");
		var fn = ((tmp[tmp.length-1]).split("."))[0];
		if(Data.imgSize[currentSN].w !==0){
			var w = Data.imgSize[currentSN].w;
			var h = Data.imgSize[currentSN].h;
		}else{
			img.src = "http://attach2.mobile01.com/image/mpnoimage.gif";
			var w = 630;
			var h = 470;		
		};
		if(parseInt(w)>parseInt(h)){
			var nH = self.config.imgLimitW *h / w;
			if(nH > self.config.imgLimitH){
				var nW = self.config.imgLimitH *w/h;
				img.style.cssText= "display: block; height:"+ self.config.imgLimitH + "px; max-height:" + self.config.imgLimitH +"px; cursor:pointer; margin:auto ; " +  "margin-left:" + ((self.config.imgLimitW - nW)/2 - 3) + "px"; 
			}else{
				img.style.cssText= "display: block; width:" + self.config.imgLimitW + "px; max-width:" + self.config.imgLimitW + "px; height: auto; cursor:pointer; margin:auto ; " +  "margin-top:" + ((self.config.imgLimitH - nH)/2 - 3) + "px"; 
			};
		}else{
			if(!self.state.isLowDefiScreen){
				img.className = "img_detail_vertical";	
				img.style.marginTop = 0;
			}else{
				img.className = "img_detail_vertical lowDefiScreen";
			};
		};		
		img.id = "detail_display_photo";
		img.onclick = function(){
			currentSN++;
			if(currentSN<0){
				currentSN=img_counts-1;
			}else if(currentSN>=img_counts){
				currentSN = 0;
			};			
			rollIMG(currentSN);
		};
		if (img.addEventListener){
			img.addEventListener("mousewheel", wheelIMG, false);
			img.addEventListener("DOMMouseScroll", wheelIMG, false);
		}else {
			if(img.attachEvent){
				img.attachEvent("onmousewheel",wheelIMG);
			};
		};
		imgMom.appendChild(img);	
		var to_previous = document.createElement("div");
		to_previous.id= "gmap_itemDetail_photo_previous";
		to_previous.className = (!self.state.isLowDefiScreen)?("gmap_itemDetail_photo_previous"):("gmap_itemDetail_photo_previous isLowDef");
		to_previous.style.opacity = 0.25;
		to_previous.style.cursor = "pointer";
		var img = document.createElement("img");
		img.src = "http://attach2.mobile01.com/images/marketplace/pre_m3h_previous.png";
			
		to_previous.appendChild(img);
		var to_next = document.createElement("div");		
		to_next.id = "gmap_itemDetail_photo_next";
		to_next.className = (!self.state.isLowDefiScreen)?("gmap_itemDetail_photo_next"):("gmap_itemDetail_photo_next isLowDef");
		to_next.style.opacity = 0.25;
		to_next.style.cursor = "pointer";		
		var img = document.createElement("img");
		img.src = "http://attach2.mobile01.com/images/marketplace/pre_m3h_next.png";
		to_next.appendChild(img);
		to_previous.onmouseover = function(){
			this.style.opacity=0.95;
		};	
		to_previous.onmouseout = function(){
			this.style.opacity=0.25;
		};			
		to_previous.onclick = function(){
			currentSN--;
			if(currentSN<0){
				currentSN=img_counts-1;
			}else if(currentSN>=img_counts){
				currentSN = 0;
			};
			rollIMG(currentSN);	
		};
		to_next.onmouseover = function(){
			this.style.opacity=0.95;
		};	
		to_next.onmouseout = function(){
			this.style.opacity=0.25;
		};			
		to_next.onclick = function(){
			currentSN++;
			if(currentSN<0){
				currentSN=img_counts-1;
			}else if(currentSN>=img_counts){
				currentSN = 0;
			};
			rollIMG(currentSN);	
		};
		imgMom.appendChild(to_previous);	
		imgMom.appendChild(to_next);	
		function wheelIMG(event){
			var e = event || window.event;
			var delta = Math.max(-1, Math.min(1,(e.wheelDelta || -e.detail)));
			if(delta==-1){
				currentSN++;
			}else{
				currentSN--;
			};
			if(currentSN<0){
				currentSN=img_counts-1;
			}else if(currentSN>=img_counts){
				currentSN = 0;
			};			
			rollIMG(currentSN);			
		};
		function rollIMG(currentSN){
			var tgt = document.getElementById("detail_display_photo");
			tgt.className = "";		
			tgt.style.cssText="";	
			tgt.src = Data.img[currentSN];
			var tmp = (Data.img[currentSN]).split("/");
			var fn = ((tmp[tmp.length-1]).split("."))[0];
			if(Data.imgSize[currentSN].w !==0){
				var w = Data.imgSize[currentSN].w;
				var h = Data.imgSize[currentSN].h;
			}else{
				tgt.src = "http://attach2.mobile01.com/image/mpnoimage.gif";
				var w = 630;
				var h = 470;		
			};
			if(parseInt(w)>parseInt(h)){
				var nH = myGoogleMap.config.imgLimitW*h / w;
				if(nH > myGoogleMap.config.imgLimitH){
					var nW = myGoogleMap.config.imgLimitH*w/h;
					tgt.style.cssText= "display: block; height:" + myGoogleMap.config.imgLimitH + "px; max-height:" 
					+ myGoogleMap.config.imgLimitH +"px; cursor:pointer; margin:auto;" 
					+ "margin-left:" + ((myGoogleMap.config.imgLimitW - nW)/2 - 3) + "px"; 
				}else{
					tgt.style.cssText= "display: block; width:" + myGoogleMap.config.imgLimitW +"px; max-width:" 
					+ myGoogleMap.config.imgLimitW + "px; height: auto; cursor:pointer; margin:auto;" 
					+ "margin-top:" + ((myGoogleMap.config.imgLimitH - nH)/2 - 3) + "px"; 
				};				
			}else{
				if(!myGoogleMap.state.isLowDefiScreen){
					tgt.className = "img_detail_vertical";	
					tgt.style.marginTop = 0;
				}else{
					tgt.className = "img_detail_vertical lowDefiScreen";	
				};			
			};						
		};

		var Navi = document.getElementById("gmap_itemDetail_preview_navi");
		var alpha = 0.5;		
		for(var n=0;n< img_counts ;n++){
			var Border = document.createElement("div");
			Border.style.cssText = "border:1px solid #CCCCCC;width:99px;height:99px;margin-right:10px;float:left; line-height:99px ;cursor:pointer";
			Border.id = n;
			Border.onmouseover = function(){
				var simg = this.childNodes[0];
				this.style.border = "1px solid #99CC00";
				this.style.backgroundColor = "#e5f3d6";
				simg.style.opacity = 1.0;
			};
			Border.onmouseout = function (){
				var simg = this.childNodes[0];	
				this.style.border = "1px solid #CCCCCC";
				this.style.backgroundColor = "#FFFFFF";		
				simg.style.opacity = alpha;		
			};	
			Border.onclick = function (){
				currentSN = this.id;
				rollIMG(currentSN);	
			};
			var  IMG = document.createElement("img");
			IMG.src = Data.img[n];
			var tmp = (Data.img[n]).split("/");
			var fn = ((tmp[tmp.length-1]).split("."))[0];
			if(Data.imgSize[n].w !==0){
				var w = Data.imgSize[n].w;
				var h = Data.imgSize[n].h;
				if( parseInt(w) > parseInt(h)  ){
					var ratioH = h/Math.ceil(w/97);
					IMG.style.cssText= "display: block; width:97px; max-width:97px; height: auto; cursor:pointer; margin:auto ; " 
					+  "margin-top:" + ((98 - ratioH)/2 - 3) + "px"; 
					IMG.style.opacity = alpha;	
				}else{
					var ratioH = Math.ceil(h * (h / w )) + 2;			
					IMG.style.cssText= "display: block; height:97px; max-height:97px; width: auto; cursor:pointer; margin:auto ; " ;
					IMG.style.opacity = alpha;	
				};	
			}else{
				IMG.src = "http://attach2.mobile01.com/image/mpnoimage.gif";
				IMG.style.width = "99px";
				IMG.style.height = "73px";
				IMG.style.marginTop = "12px";		
			};			
			Border.appendChild(IMG);
			Navi.appendChild(Border);
		};
		if(img_counts==1){
			document.getElementById("gmap_itemDetail_photo_previous").style.display = "none";
			document.getElementById("gmap_itemDetail_photo_next").style.display = "none";			
		};
		if(img_counts<=5){
			document.getElementById("preview_navi_next").style.display = "none";	
		};	
	},
	express : {
		toolBox : function(obj){
			if(myGoogleMap.state.isStopToolWin){
				myGoogleMap.state.isStopToolWin = false;				
				obj.innerHTML = "關閉工具視窗";
				$("#gmap_tools_win").show(100);				
				myGoogleMap.showMessage("開啟工具視窗");				
			}else{
				myGoogleMap.state.isStopToolWin = true;
				obj.innerHTML = "開啟工具視窗";	
				$("#gmap_tools_win").hide(100);	
				myGoogleMap.showMessage("關閉工具視窗");
			};
			$("#expressMenu").hide(30);
		},
		quickView : function(obj){
			if(myGoogleMap.state.isStopQuickInfo){
				myGoogleMap.state.isStopQuickInfo = false;				
				obj.innerHTML = "停用隨機瀏覽功能";
				myGoogleMap.showMessage("啟用隨機瀏覽功能");						
			}else{
				myGoogleMap.state.isStopQuickInfo = true;
				obj.innerHTML = "啟用隨機瀏覽功能";	
				myGoogleMap.showMessage("停用隨機瀏覽功能");						
				$("#gmap_quick_infowin").hide(100);	
				myGoogleMap.state.isQuickInfoWinEnabled = false;
				myGoogleMap.state.isQuestFromQuickInfo = false;
			};
			$("#expressMenu").hide(30);
		},
		listWin : function(obj){
			if(myGoogleMap.state.isStopListWin){
				myGoogleMap.state.isStopListWin = false;				
				obj.innerHTML = "關閉商品清單視窗";
				$("#tabsHistoryBox").show(100);
				myGoogleMap.showMessage("開啟商品清單視窗");					
			}else{
				myGoogleMap.state.isStopListWin = true;
				obj.innerHTML = "開啟商品清單視窗";	
				myGoogleMap.showMessage("關閉商品清單視窗");					
				$("#tabsHistoryBox").hide(100);	
			};
			$("#expressMenu").hide(30);
		},
		status : function(obj){
			if(myGoogleMap.state.isStopStatus){
				myGoogleMap.state.isStopStatus = false;				
				obj.innerHTML = "關閉訊息欄";
				$("#gmap_status_info_fs").show(100);
				myGoogleMap.showMessage("開啟訊息欄");					
			}else{
				myGoogleMap.state.isStopStatus = true;
				obj.innerHTML = "開啟訊息欄";	
				myGoogleMap.showMessage("關閉訊息欄");					
				$("#gmap_status_info_fs").hide(100);	
			};
			$("#expressMenu").hide(30);			
		}
	},
	errHandle : function(itemID){
		document.getElementById('item_trace').style.display ="";
		document.getElementById('gmap_itemDetail_win_left').style.display ="";
		document.getElementById('gmap_itemDetail_win_right').style.display ="";	
		document.getElementById('gmap_itemDetail_win').style.background = "url(http://attach2.mobile01.com/images/marketplace/itemdetail_bg1.png)";	
		document.getElementById('share_to_SNS').style.display ="";		
		if(document.getElementById('msgBox')!==null){
			document.getElementById('msgBox').parentNode.removeChild(document.getElementById('msgBox'));
			document.getElementById('msgBox2').parentNode.removeChild(document.getElementById('msgBox2'));				
		};
		if(items[itemID] == undefined){
			document.getElementById('gmap_itemDetail_win_left').style.display ="none";
			document.getElementById('gmap_itemDetail_win_right').style.display ="none";	
			document.getElementById('item_trace').style.display ="none";
			document.getElementById("share_to_SNS").style.display = "none";	
			document.getElementById('gmap_itemDetail_win').style.background = "#ffffff"; 
			var msgBox = document.createElement("div"); 
			msgBox.id="msgBox";
			msgBox.style.cssText = "position:absolute;width:800px;height:40px;;line-height:40px;background-color:#ffffdd;border:1px solid #cccccc;top:100px;left:50%;margin-left:-400px;font-family:微軟正黑體;font-size:14px;color:#454545";
			msgBox.innerHTML = "<img src='http://attach2.mobile01.com/images/smile/6.gif' style='vertical-align:middle'>發生錯誤了...";
			document.getElementById('gmap_itemDetail_win_main').appendChild(msgBox);
			var msgBox2 = document.createElement("div"); 
			msgBox2.id="msgBox2";
			msgBox2.style.cssText = "position:absolute;width:800px;height:40px;;line-height:40px;top:160px;left:50%;margin-left:-400px;font-size:16px;color:#333333;font-family:微軟正黑體;";
			msgBox2.innerHTML = endCause;	
			document.getElementById('gmap_itemDetail_win_main').appendChild(msgBox2);
			return false;
		}else{
			return true;
		};
	}, 
	showTips : function(){
		this.showMessage("小提示：" + this.config.tipContent[this.getRandomizer(0,8)],1);
	},	
	share2social : function(n){
		var shareURL = {
			0 : "https://www.facebook.com/sharer/sharer.php?u=",
			1 : "https://plus.google.com/share?url=",
			2 : "http://twitter.com/home/?status="
		};	
		window.open(shareURL[n] + "http://www.mobile01.com/mpitemdetail.php?id=" + myGoogleMap.clientState.currentItemID, "postItem", "width=600, height=400, left=300,top=300");
	},
	state : {
		tryTimes : 0,
		tryTimesQV : 0,		
		isFullscreen :  false,
		isEntireFullscreen : false,
		isStopQuickInfo :false,
		isStopToolWin : false,
		isStopListWin : false,
		isStopStatus : false,
		isQueryData : false,		
		isQuickInfoWinEnabled : false,
		isQuestFromQuickInfo : false,
		isInfoWinOpened : false,		
		isInfoWinOptionEnabled : false,
		isInfoWinOptionTips : false,
		isInfoWinOptionSetCatalog : false,
		isItemDetailClicked: false,
		isAskedFullScreen : false,
		isDetailWinDragged : false,
		isLowDefiScreen : false,
		isDetailLackPic : false,
		isMobileDevice : false ,
		initDragonBallRadar : false
	},
	topZindex : 100000,
	beTheTop : function(obj){
		this.topZindex = this.topZindex + 1;
		obj.style.zIndex = this.topZindex; 
	},
	Data : {
		CenterLatlng :{
			TAIWAN : {
				lat : "23.704887484663833",
				lng : "120.91687910736789"
			}
		},
		defaultZoom : 8,
		defaultCatalog :0
	},
	config : {
		key : "",
		mapID : "map_canvas",
		gmap_QV_fadeDuration : 50,
		dataFeedbackTimes : 40,
		mapWidth : 610,
		mapHeight : 800,
		minZoom : 1,		
		maxZoom : 17,
		skipZoom : [4,6,9,11,12,14],
		infoWinTimeOutDuration : 2000,			
		nearRange :0.01,
		iconVector : true,
		iconPath : "gmap/images/",
		icons :{
			"DEFAULT" : "m01.png"
		},
		imgServerPath : "http://attach4.mobile01.com/mp/",
		imgServerPathQV : "http://download.mobile01.com/160x120/mp/",
		APIs : {
			counts : "/api/mpgmap_api.php?m=1",
			list : "/api/mpgmap_api.php?m=2",
			quickInfo : "/api/mpgmap_api.php?m=3",			
			itemDetail : "/mpindex_new_detail_ajax.php"	
		},		
		markerDraggable : false,
		markerColor :{
			taiwan : "#FFCC00",
			region : "#FF9900",
			eightCities : "#CCFF00",
			sixteenCities :"#FF0000",
			station :"#FF6699",
			onover :"#FFFF99",			
			"台鐵" : "#57F0FD",
			"高鐵" : "#FF9900",
			"北捷" : "#FF6699",			
			"高捷" : "#99FF00"
			
		},
		imgLimitW : 630,
		imgLimitH : 540,
		triggerTimer : {
			counts : 1200,
			list :1200,
			quickInfo :1000,
			itemDetail : 1500
		},		
		cataclogID : {
			1 : "電腦資訊",
			2 : "手持通訊",
			3 : "攝影器材",
            4 : "數位家電",
			5 : "休閒娛樂",
			7 : "生活用品",
			1300 : "汽車",
			1301 : "機車",
			117 : "自行車",
			865 : "男性時尚",
			6 : "女性流行",
			239 : "代購與虛擬物品",
			87 : "房屋地產",
			0 : "不分類"
		},
		autoTips : true,
		tipsTimer : 30000,
		tipContent : {
			0 : "開啟產品列表時，當滑鼠在列表上方時，可使用滑鼠滾輪滾動換頁。",
			1 : "開啟產品詳細內容時，當滑鼠在圖片上方時，可使用滑鼠滾輪滾動換圖。",
			2 : "在地圖畫面上，按滑鼠右鍵可開啟快速選單。",
			3 : "在車站標示上，按滑鼠右鍵可將車站加入最愛。",
			4 : "在產品列表上，按滑鼠右鍵可將商品加入關注商品。",
			5 : "注意！關注商品並不會儲存，網頁關閉或重整後將消失。",
			6 : "您點過的車站，可以在歷史車站中檢視。",
			7 : "您本次點過的商品，可以在瀏覽記錄中檢視。",
			8 : "重要商品，請記得加入追蹤！",
			9 : "建議切換成全螢幕或全版面，操作會更順暢。",
			10 : "建議最低解析度1024x768以上。"
		},
		enableFSstatus : true,
		confirmFullScreen : true,
		contextMenu : true,
		zoom2Size : {
			3 : 80, 
			4 : 30,
			5 : 50,
			6 : 50,
			7 : 60,
			8 : 55,
			9 : 105,
			10 : 200,
			11 : 370,
			12 : 700,
			13 : 30,
			14 : 45,
			15 : 55,
			16 : 55,
			17 : 55,
			18 : 60																																										
		},		
		defaultLocation: "25.04630461,121.51758865"	,
		level : 1
	}	
};
 
google.maps.event.addDomListener(window, 'load', getReadyMyGoogleMap);
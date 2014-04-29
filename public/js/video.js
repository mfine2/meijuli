(function() {
	var videoWrap = $("videoWrap");
	var videoEl = $("video");
	var playEl = $("play");
	var listEl = $("list");
	var wordsEl = $("words");
	var lowSpeedEl = $("lowSpeed");
	var normalSpeedEl = $("normalSpeed");
	var highSpeedEl = $("highSpeed");
	var langZhEl = $("langZh");
	var langEnEl = $("langEn");
	var langZhEnEl = $("langZhEn");
	var langEnLineEl = $("langEnLine");
	var langZhLineEl = $("langZhLine");
	var dictEl = $("dict");
	var dictDetailEl = $("dictDetail");
	var leftPannel = $("leftPannel");
	var rightPannel = $("rightPannel");
	var touchTip = $("touchTip");
	var scriptEl = $("script");

	var srtArr = null;
	var srtTimer = null;
	var reqInfo = null;
	var sidePannelTimer = null;
	var srtSpeed = 1;
	
	var playFn = function(e) {
		if (videoEl.paused) {
			videoEl.play();
			playEl.textContent = "||";
		} else {
			videoEl.pause();
			playEl.innerHTML = ">";
		}
	}
	var canPlayFn = function(e) {
		//not fired
	}
	var listFn = function(e) {
		location.href = "list.html";
	}
	var wordsFn = function(e) {
		location.href = "words.html";
	}
	var keyupFn = function(e) {
		switch(e.keyCode){
			case 32: {//space
				playFn(e);
				break;
			}
			case 69: {//e En
				langEnFn(e);
				break;
			}
			case 90: {//z Zh
				langZhFn(e);
				break;
			}
			case 84: {//t Two
				langEnZhFn(e);
				break;
			}
			case 76: {//l lowSpeed
				lowSpeedFn(e);
				break;
			}
			case 78: {//n normalSpeed
				normalSpeedFn(e);
				break;
			}
			case 72: {//l highSpeed
				highSpeedFn(e);
				break;
			}
			case 68: {//d dictfn
				dictFn(e);
				break;
			}
		}

	}

	var setSpeed = function(rate) {
		videoEl.playbackRate = rate || 0;
		srtSpeed = rate;
	}

	var lowSpeedFn= function(e) {
		var rate = lowSpeedEl.getAttribute("data-speed");
		setSpeed(parseFloat(rate));
	}
	var normalSpeedFn = function(e) {
		var rate = normalSpeedEl.getAttribute("data-speed");
		setSpeed(parseFloat(rate));
	}
	var highSpeedFn = function(e) {
		var rate = highSpeedEl.getAttribute("data-speed");
		setSpeed(parseFloat(rate));
	}

	var setLang = function(lang) {
		switch(lang) {
			case "en": {
				showOrNot(langEnLineEl, true);
				break;
			}
			case "zh": {
				showOrNot(langZhLineEl, true);
				break;
			}
			case "zh-en": {
				if(langEnLineEl.style.visibility === "visible" && langZhLineEl.style.visibility === "visible") {
					langEnLineEl.style.visibility  = "hidden";
					langZhLineEl.style.visibility = "hidden";
				} else {
					langEnLineEl.style.visibility = "visible";
					langZhLineEl.style.visibility = "visible";
				}
				break;
			}
		}
	}

	var langZhFn = function(e) {
		setLang("zh");
	}
	var langEnFn = function(e) {
		setLang("en");
	}
	var langEnZhFn = function(e) {
		setLang("zh-en");
	}

	var langEnLineFn = function(e) {

		var selectText;
		if(window.getSelection) {
			selectText = window.getSelection().toString();
		} else if(document.getSelection) {
			selectText = document.getSelection().toString();
		}else if (document.selection) {
			selectText = document.selection.createRange().text;
		}
		if(selectText && trim(selectText)) {
			getDict(selectText);
		}
	}
	
	var dictFn = function(e){
		showOrNot(dictDetailEl);
	}
	var getLocalInfo = function(){
		var str = localStorage.getItem("meijuli-toplay");
		var obj = JSON.parse(str);
		return obj;
	}
	var getCurTimeLocal = function() {
		return +localStorage.getItem("meijuli-curTime");
	}
	var setCurTimeLocal = function(curTime) {
		localStorage.setItem("meijuli-curTime", curTime + "");
	}

	var getSrcAndSrt = function(srcFn, srtFn) {
		var url = "info/" + reqInfo.series + "/" + reqInfo.season + "/" + reqInfo.episode;
		sendAjax(url, function(obj) {
			srcFn(obj.mp4);
			sendAjax(obj.srt, function(data){
				srtArr = data;
				srtFn();
			});
		});
	}

	var tickSrt = function(srtIndex) {
		srtIndex = srtIndex || 0;
		srtTimer = setTimeout(function() {
			var item = srtArr[srtIndex];
			var preItem = srtArr[srtIndex - 1];
			var srtElapsed = videoEl.currentTime * 1000;
			if(item) {
				if(srtElapsed >= item.start && srtElapsed <= item.end) {
					srtIndex++;
					renderSrt(item);
				} else if(preItem && srtElapsed > preItem.end) {
					renderSrt();
				}
				tickSrt(srtIndex);
			} else {
				clearTimeout(srtTimer);
			}
		}, 20);
	}

	var updateTickSrt = function(curTime){
		clearTimeout(srtTimer);

		var srtElapsed = (curTime && (curTime * 1000)) || (videoEl.currentTime * 1000);
		var firstItem = srtArr[0];
		if(firstItem && srtElapsed <= firstItem.start) {
				tickSrt(0);
				return;
		}
		for(var i = 0, len = srtArr.length; i < len; i++) {
			var preItem = srtArr[i - 1];
			var item = srtArr[i];
			if((preItem && preItem.end < srtElapsed && srtElapsed <= item.start) || (item.start <=srtElapsed && srtElapsed <= item.end)) {
				tickSrt(i);
				return;
			}		
		}
	}

	var renderSrt = function(item) {
		if(item) {
			langEnLineEl.innerHTML = item.en;
			langZhLineEl.innerHTML = item.zh;
		} else {
			langEnLineEl.innerHTML = "";
			langZhLineEl.innerHTML = "";
		}
	}
	window.dictCallback = function(obj) {
		var tmpl = "";
		dictDetailEl.style.display = "block";
		if(obj.errorCode !== 0) {
			dictDetailEl.innerHTML = "";
		} else {
			if(obj.basic) {
				tmpl = tmpl + "<h3>" + obj.iquery + "<span>[" + obj.basic.phonetic + "]</span>" + "</h3>";
				tmpl = tmpl + "<p>" +obj.basic.explains.join("</br>") + "</p>";
				dictDetailEl.innerHTML = tmpl;
			} else {
				dictDetailEl.innerHTML = "";
			}
		}
	}
	var getDict = function(words) {
		//var url = "http://fanyi.youdao.com/openapi.do?keyfrom=meijuli&key=945441113&type=data&doctype=jsonp&callback=dictCallback&version=1.1&q=" + words;
		//var script= document.createElement("script");   
		//script.type= "text/javascript";   
		//script.src= url;   
		//scriptEl.innerHTML = "";
		//scriptEl.appendChild(script);

		var url = "vocabulariy/" + reqInfo.series + "/" + reqInfo.season + "/" + reqInfo.episode + "/" + words;
		sendAjax(url, function(obj) {
			dictCallback(obj);
		});
	}
	var setViewSize = function(el, w, h) {
		w = w || 960;
		h = h || 540;
		var viewWidth = window.innerWidth;
		var viewHeight = window.innerHeight;
		
		var resultWidth;
		var resultHeight;

		if(w <= viewWidth && h <= viewHeight) {
			resultWidth = w;
			resultHeight = h;
		}
		if(w > viewWidth && h <= viewHeight) {
			resultWidth = viewWidth;
			resultHeight = Math.floor(resultWidth * h / w);
		} 	
		if(h > viewHeight && w <= viewWidth) {
			resultHeight = viewHeight;
			resultWidth = Math.floor(w * resultHeight / h);
		} 	
		if(w > viewWidth && h > viewHeight) {
			if((w / viewWidth) <= (h / viewHeight)) {
				resultHeight = viewHeight;
				resultWidth = Math.floor(w * resultHeight / h);
			} else {
				resultWidth = viewWidth;
				resultHeight = Math.floor(resultWidth * h / w);
			}
		}
		el.style.marginTop = (Math.abs(viewHeight - resultHeight) / 2) + "px";
		el.style.width = resultWidth + "px";
		el.style.height = resultHeight + "px";
	}

	var volumeFn = function(deltaY, isFinished) {
		var volume = videoEl.volume;
		var deltaYCal = (-deltaY) / 500;//50 is 0.1
		var curVolume = +(volume + deltaYCal).toFixed(1);
		var showVolume;
		if(curVolume >= 0 && curVolume <= 1) {
			videoEl.volume = curVolume;//ios not support
			showVolume = curVolume;
		} else if(curVolume < 0) {
			showVolume = 0.0;
		} else if(curVolume > 1) {
			showVolume = 1.0;
		}
		if(isFinished) {
			setTimeout(function() {
				touchTip.innerHTML = "";
				touchTip.style.display = "none";
			}, 800);
		} else {
			touchTip.style.display = "block";
		}
		touchTip.innerHTML = "volume: " + showVolume;
	}

	var progressFn = function(deltaX, isFinished){
		videoEl.pause();
		var time = videoEl.currentTime;
		var totalTime = videoEl.duration;
		var deltaXCal = (deltaX) / 10;//10 is 1s
		var curTime = +(time + deltaXCal).toFixed(2);
		if(curTime < 0) {
			curTime = 0;
		}
		if(curTime > totalTime) {
			curTime = totalTime;
		}

		touchTip.innerHTML = formatSeconds(curTime) + " / " + formatSeconds(totalTime);
		if(isFinished) {
			videoEl.currentTime = curTime;
			updateTickSrt(curTime);
			videoEl.play();
			setTimeout(function() {
				touchTip.innerHTML = "";
				touchTip.style.display = "none";
			}, 800);
		} else {
			touchTip.style.display = "block";
		}
	}

	var hideSidePannel = function() {
		sidePannelTimer = setTimeout(function(){
			leftPannel.style.display = "none";
			rightPannel.style.display = "none";
		}, 5000);
		
	}

	var showSidePannel = function() {
		clearTimeout(sidePannelTimer);
		leftPannel.style.display = "block";
		rightPannel.style.display = "block";
	}

	var touchObj = {
            startX: 0,
            startY: 0,
	    direction: "",//horizontal, vertical
            start: function(e) {
                var touches = e.changedTouches;
                if(touches.length > 1 || (e.scale && e.scale !==1)) {
                    return;
                }
                var touch = touches[0];
                this.startX = touch.pageX;
                this.startY = touch.pageY;
		showSidePannel();
                e.preventDefault();
                e.stopPropagation();
            },
            move: function(e) {
                var touch = e.changedTouches[0];
		var deltaX = touch.pageX - this.startX;
		var deltaY = touch.pageY - this.startY;
		if(this.direction === "") {
			if(Math.abs(deltaX) >= Math.abs(deltaY)) {
				this.direction = "horizontal"
			} else {
				this.direction = "vertical"
			}
		}
		if(this.direction === "horizontal") {
			progressFn(deltaX);
		} else if(this.direction === "vertical") {
			volumeFn(deltaY);
		}
                e.preventDefault();
                e.stopPropagation();
            },
            end: function(e) {
                var touch = e.changedTouches[0];
		var deltaX = touch.pageX - this.startX;
		var deltaY = touch.pageY - this.startY;
		if(this.direction === "horizontal") {
			progressFn(deltaX, true);
		} else if(this.direction === "vertical") {
			volumeFn(deltaY, true);
		}
		this.startX = 0;
		this.startY = 0;
		this.direction = "";
		hideSidePannel();
                e.preventDefault();
                e.stopPropagation();
            }
        }

	var mouseObj = {
            startX: 0,
            startY: 0,
	    direction: "",//horizontal, vertical
            start: function(e) {
                this.startX = e.clientX;
                this.startY = e.clientY;

		showSidePannel();
		videoEl.addEventListener("mousemove", mouseObj.move, false);
                e.preventDefault();
                e.stopPropagation();
            },
            move: function(e) {
		var deltaX = e.pageX - this.startX;
		var deltaY = e.pageY - this.startY;
		if(this.direction === "") {
			if(Math.abs(deltaX) >= Math.abs(deltaY)) {
				this.direction = "horizontal"
			} else {
				this.direction = "vertical"
			}//if delta is 0 nothing todo
		}
		if(this.direction === "horizontal") {
			progressFn(deltaX);
		} else if(this.direction === "vertical") {
			volumeFn(deltaY);
		}
                e.preventDefault();
                e.stopPropagation();
            },
            end: function(e) {
		var deltaX = e.pageX - this.startX;
		var deltaY = e.pageY - this.startY;
		if(this.direction === "horizontal") {
			progressFn(deltaX, true);
		} else if(this.direction === "vertical") {
			volumeFn(deltaY, true);
		}
		this.startX = 0;
		this.startY = 0;
		this.direction = "";
		hideSidePannel();
		videoEl.removeEventListener("mousemove", mouseObj.move, false);
                e.preventDefault();
                e.stopPropagation();
            }
        }
	
	var currentTimeTimer = function() {
		setInterval(function(){
			setCurTimeLocal(videoEl.currentTime);
		}, 5000);
	}

	var initListener = function() {
		playEl.addEventListener("click", playFn, false);
		playEl.addEventListener("canPlay", canPlayFn, false);
		listEl.addEventListener("click", listFn, false);
		wordsEl.addEventListener("click", wordsFn, false);
		lowSpeedEl.addEventListener("click", lowSpeedFn, false);
		normalSpeedEl.addEventListener("click", normalSpeedFn, false);
		highSpeedEl.addEventListener("click", highSpeedFn, false);
		langZh.addEventListener("click", langZhFn, false);
		langEn.addEventListener("click", langEnFn, false);
		langZhEn.addEventListener("click", langEnZhFn, false);
		langEnLineEl.addEventListener("click", langEnLineFn, false);
		dictEl.addEventListener("click", dictFn, false);
		document.addEventListener("keyup", keyupFn ,false);
		if('ontouchend' in window) {
			langEnLineEl.addEventListener("touchend", langEnLineFn, false);
			videoEl.addEventListener("touchstart", touchObj.start, false);
			videoEl.addEventListener("touchmove", touchObj.move, false);
			videoEl.addEventListener("touchend", touchObj.end, false);
		}else {
			langEnLineEl.addEventListener("click", langEnLineFn, false);
			videoEl.addEventListener("mousedown", mouseObj.start, false);
			videoEl.addEventListener("mouseup", mouseObj.end, false);
		}

	}
	var initVideo = function() {
		videoEl.volume = 0.5;
		videoEl.poster="images/poster.jpg";
		videoEl.preload="load";
		videoEl.playcount="1";
	}
	var init = function() {
		initVideo();
		setViewSize(videoWrap, 1440, 810);//almost mean fullscreen
		initListener();

		reqInfo = getLocalInfo()

		var curTime = getCurTimeLocal();
		if(!reqInfo) {
			location.href="list.html";
		} else {
			document.title = "S" + reqInfo.season + ".E" + reqInfo.episode + "." + reqInfo.series + " meijuli.try4.org";
		}
		getSrcAndSrt(function(src) {
			videoEl.src=src;
			//videoEl.currentTime = curTime;
		}, function(){
			updateTickSrt(curTime);
			//currentTimeTimer();
		});
	}

	init();
})(window, undefined);

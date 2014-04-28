var $ = function(id) {
	return document.getElementById(id);
}
var showOrNot = function(el, isV) {
	if(!isV) {
		el.style.display === "none" ? el.style.display = "block": el.style.display = "none";
	} else {
		el.style.visibility === "hidden" ? el.style.visibility = "visible": el.style.visibility = "hidden";
	}
}
var sendAjax = function(url, fn) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			var obj = JSON.parse(xmlhttp.responseText);
			fn(obj);
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}
var after = function(count, fn) {
	var num = 0;
	return function() {
		num++;
		if(count === num) {
			fn && fn();
		}
	}
}
var trim = function(str) {
    return str.replace(/(^\s*)|(\s*$)/, "");
}
var fixedZero = function(str, num) {
	str = str || "";
	num = num || 2;
	var prestr = "";
	for(var i = (str + "").length; i < num; i++) {
		prestr = prestr + "0";
	}
	return prestr + str;
}
var formatSeconds = function(seconds) {
	var hour = Math.floor(seconds / 3600);
	var minute = Math.floor(seconds % 3600 / 60);
	var second = Math.floor(seconds % 3600 % 60);
	return fixedZero(hour) + ":" + fixedZero(minute) + ":" + fixedZero(second);
}

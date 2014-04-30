(function() {
	var wordsEl = $("words");

	var templateObj = function(obj) {
		var tmpl = "";
		if(obj.errorCode === 0 && obj.basic) {
			tmpl = tmpl + "<li class='words-item'><h6><b>" + obj.iquery + "</b><span>[" + (obj.basic.phonetic || " ") + "]</span>" + "</h6>";
			tmpl = tmpl + "<p>" +obj.basic.explains.join("</br>") + "</p></li>";
		}
		return tmpl;
	}
	
	var render = function(arr) {
		var tmpl = "";
		for(var i = 0, l = arr.length; i < l; i++) {
			tmpl = tmpl + templateObj(arr[i]);	
		}
		wordsEl.innerHTML = tmpl;
	}

	var url = "vocabularies";

	sendAjax(url, function(arr){
		render(arr);
	});

})(window, undefined);

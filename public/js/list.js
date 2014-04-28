(function() {
	var listEl = $("list");

	function goToPlayFn(e) {
		var target = e.target;
		if(target.tagName.toLowerCase() === "a") {
			var series = target.getAttribute("data-series");
			var season = target.getAttribute("data-season");
			var episode = target.getAttribute("data-episode");
			var obj = {series: series, season: season, episode: episode};
			var str = JSON.stringify(obj);
			localStorage.setItem("meijuli-toplay", str);
			localStorage.setItem("meijuli-curTime", "");
			location.href = "index.html";
		}
		
	}

	listEl.addEventListener("click", goToPlayFn, false);
})(window, undefined);

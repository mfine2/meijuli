var MongoClient = require("mongodb").MongoClient;

var db;
var collList;

//var season = "01";
var season = "02";
var series = "Friends";
var done = null;

var COUNT = 24;

MongoClient.connect("mongodb://localhost:27017/meijuli", {native_parser: true}, function(err, db) {
	if(err) {
		throw err;
	}
	db = db;
	collList = db.collection("list");
	console.log("connected to mongodb meijuli");

	done = after(COUNT, function(){
		db.close();
	});
	
	for(var i = 1; i <= COUNT; i++) {
		var fixedI = fixedZero(i);
		var obj = {series: series, season: season, episode: fixedI};
		//obj.mp4 = "mp4/Friends.Season01/Friends.S01E" + fixedI + ".1080p.BluRay.x264-maximersk.mp4";
		//obj.srt = "srt/Friends.Season01/Friends.S01E" + fixedI + ".720p.BluRay.x264-PSYCHD.eng&chs.json";
		
		obj.mp4 = "mp4/Friends.Season02/friends.s02e" + fixedI + ".720p.bluray.x264-psychd.mp4";
		obj.srt = "srt/Friends.Season02/Friends.S02E" + fixedI + ".720p.BluRay.x264-PSYCHD.eng&chs.json";
		(function(i) {
			collList.insert(obj, function(err, data){
				if(err) {
					done("failed")
					console.log("insert " + i +  "th node failed");
				} else {
					done("success")
					console.log("insert " + i +  "th node success");
				}
			});
		})(i);
	}
});

function fixedZero(str, num) {
	str = str || "";
	num = num || 2;
	var prestr = "";
	for(var i = (str + "").length; i < num; i++) {
		prestr = prestr + "0";
	}
	return prestr + str;
}


function after(count, fn) {
	var num = 0;
	return function() {
		num++;
		if(count === num) {
			fn && fn();
		}
	}
}

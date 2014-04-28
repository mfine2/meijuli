var http = require("http");
var parse = require("url").parse;
var iconv = require("iconv-lite");

var express = require("express");
var app = express();

var MongoClient = require("mongodb").MongoClient;

var db;
var collVo;
var collList;

MongoClient.connect("mongodb://localhost:27017/meijuli", {native_parser: true}, function(err, db) {
	if(err) {
		throw err;
	}
	db = db;
	collVo = db.collection("vocabularies");
	collList = db.collection("list");
	console.log("connected to mongodb meijuli");
});

app.use(express.static(__dirname + "/public"));

app.get("/vocabulariy/:series/:season/:episode/:word", function(req, res){//series, season, episode are all fixed with 0, so to be careful
	var series = trim(req.params.series);
	var season = trim(req.params.season);
	var episode = trim(req.params.episode);
	var word = trim(req.params.word);
	collVo.findOne({iquery: word, iseries: series, iseason: season, iepisode: episode}, function(err, doc){
		if(doc) {
			res.send(JSON.stringify(doc));
		}else{
			var url = "http://fanyi.youdao.com/openapi.do?keyfrom=meijuli&key=945441113&type=data&doctype=json&version=1.1&q=" + word;
			getUrl({url: url}, function(err, obj){
				var vo = JSON.parse(obj.body);
				if(vo.errorCode == 0) {//i is for our
					vo.iquery = word;
					vo.iseries = series;
					vo.iseason = season;
					vo.iepisode = episode;
					collVo.insert(vo, function(err, voc){
						if(!err) {
							res.send(JSON.stringify(voc[0]));
						} else {
							res.send(JSON.stringify({errorCode: 1}));
						}
					});
				} else {
					res.json(JSON.stringify(vo));
				}
			});
		}
	});
});

app.get("/info/:series/:season/:episode", function(req, res){
	var series = trim(req.params.series);
	var season = trim(req.params.season);
	var episode = trim(req.params.episode);
	collList.findOne({series: series, season: season, episode: episode}, function(err, doc){
		if(doc) {
			res.send(JSON.stringify(doc));
		}else{
			res.send(JSON.stringify({src: "", srt: []}));
		}
	});
});

app.get("/vocabularies", function(req, res){
	collVo.find({iseries: "Friends"}).toArray(function(err, docs){
		if(docs) {
			res.send(JSON.stringify(docs));
		}else{
			res.send(JSON.stringify([]));
		}
	});
});

app.listen(80);
console.log("server started on 80")

function merge(obj1, obj2) {
    var prop, obj = {};
    for (prop in obj1) {
        obj[prop] = obj1[prop];
    }
    for (prop in obj2) {
        obj[prop] = obj2[prop];
    }
    return obj;
}

function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/, "");
}

function getUrl (options, callback) {
    var defaults = {
        url: "http://baidu.com",
        encoding: "utf-8",
        reqTimeout: 5000,
        resTimeout: 5000
    };

    options = merge(defaults, options);

    var urlInfo = parse(options.url),
        reqOpt = {
            host: urlInfo.hostname,
            port: urlInfo.port || 80,
            path: urlInfo.path,
            headers: options.headers,
            method: "GET"
        };

    var req = null,
        reqTimeout = null;

    reqTimeout = setTimeout(function() {
        reqTimeout = null;
        req.abort();
        callback(new Error("Request Timeout"));
    }, options.reqTimeout);

    console.log("crawling: " + options.url);

    req = http.request(reqOpt, function(res) {
        clearTimeout(reqTimeout);

        var chunks = [],
            length = 0,
            responseTimeout = null;

        resTimeout = setTimeout(function() {
            resTimeout = null;
            req.abort();
            callback(new Error("Response Timeout"));
        }, options.resTimeout);

        res.on("data", function(chunk) {
            length += chunk.length;
            chunks.push(chunk);
        }).on("end", function() {
            if(resTimeout) {
                clearTimeout(resTimeout);

                var data = new Buffer(length);

                for(var i = 0, pos = 0, len = chunks.length; i < len; i++) {
                    chunks[i].copy(data, pos);
                    pos += chunks[i].length;
                }

                res.body = iconv.decode(data, options.encoding);
                callback(null, res);
            }
        }).on("error", function(err) {
            clearTimeout(resTimeout);
            callback(err, res);
        }).on("aborted", function() {
            if(resTimeout) {
                callback(new Error("Response Aborted"), res);
            }
        });
    }).on("error", function(err) {
        if(reqTimeout) {
            clearTimeout(reqTimeout);
            callback(err);
        }
    });
    req.end();
}

var fs = require("fs");
var path = require("path");

var trim = function(str) {
	return str.replace(/^\s*|\s*$/g, "");
}

var millisecond = function(str) {
	if(!str) {
		return "";
	}
	var result = /(\d{2}):(\d{2}):(\d{2}),(\d{3})/.exec(str);
	var ms = parseInt(result[1], 10) * 3600 * 1000 + parseInt(result[2], 10) * 60 * 1000 + parseInt(result[3], 10) * 1000 + parseInt(result[4], 10);
	return ms;
}

var isSrtFile = function(fileName) {//temp for eng&chs
	return /.+eng&chs\.srt$/.test(fileName);
}

var getFileList = function() {
	var pathOrFile = process.argv[2];
	var isExist = fs.existsSync(pathOrFile);
	var state;
	var fileList = [];
	var tempPath;
	var tempFileList;
	if(isExist) {
		state = fs.lstatSync(pathOrFile);
		if(state.isFile()) {
			if(isSrtFile(pathOrFile)) {
				fileList.push(pathOrFile);
			}
		} else if(state.isDirectory()) {
			tempFileList = fs.readdirSync(pathOrFile);
			tempFileList.forEach(function(v, i ) {
				tempPath = path.join(pathOrFile, v);		
				if(isSrtFile(tempPath)) {
					fileList.push(tempPath);
				}
			});
		}
	} else {
		console.log("no such file or directory " + pathOrFile);
	}
	return fileList;
}

var parse2Obj = function(str) {
	var arr = str.split(/\n\s*\r/g);//why??? is \r\nxxx\r\n ?
	var result = [];
	for(var i = 0, l = arr.length; i < l; i++) {
		var itemObj = {};
		var timeRange = [];
		var items = arr[i];
		var itemArr = items.replace(/\n/g, "").split(/\r/g);
		var itemLen = itemArr.length - 1;
		if(itemLen === 4) {
			itemObj.en = itemArr[2];
			itemObj.zh = itemArr[3];
		} else if(itemLen === 3) {
			itemObj.extra = itemArr[2];
			continue;
		} else {
			continue;
		}
		timeRange = /(.+?)\s*-->\s*(.+)/.exec(itemArr[1]);
		itemObj.start = millisecond(timeRange[1]);
		itemObj.end = millisecond(timeRange[2]);
		result.push(itemObj);
	}
	return result;
}

var parseSrtFiles = function() {
	var fileList = getFileList();
	if(fileList.length === 0) {
		console.log("no .srt files found");
		return;
	}
	var outputDir = process.argv[3] || path.dirname(fileList[0]);
	var outputFile;
	var fileName;
	var obj;

	if(!path.existsSync(outputDir)){
		fs.mkdirSync(outputDir);
	}

	fileList.forEach(function(v, i) {
		fs.readFile(v, "utf16le", function(err, data) {
			if (err) {
				throw err;
			}
			obj = parse2Obj(data);
			if(obj) {
				fileName = path.basename(v, ".srt");
				outputFile= path.join(outputDir, fileName + ".json");
				(function(outputFile){
					fs.writeFile(outputFile, JSON.stringify(obj), function (err) {
						console.log(outputFile+ " saved!");
					});
				})(outputFile);
			}
		});
	});
}

parseSrtFiles();

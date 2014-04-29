#!/bin/sh
function mkv2mp4(){
	inpath=$1
	outpath=$2
	if [ -f $inpath ]; then  
		dirname=$(dirname $inpath)"/"
		fullFileName=$(basename $inpath)
		filename=${fullFileName%.*}
		extname=${fullFileName##*.} 
		if [ ! -d $outpath ]; then
			outpath=$dirname"mp4/"
		fi
		logpath=$outpath"log.txt"
		$(mkdir -p $outpath)

		if [ $extname = "mkv" ]; then
			echo $inpath "convert to mp4 start"
			$(ffmpeg -i $inpath -vcodec libx264 -s 960x540  $outpath$filename.mp4)
			if [ $? -eq 0 ]; then
			       echo $inpath "convert to mp4 successed"
			       echo $inpath "convert to mp4 successed" $(date '+%Y-%m-%d %H:%M:%S') >> $logpath
				
			else
			       echo $inpath "convert to mp4 failed" 
			       echo $inpath "convert to mp4 failed" $(date '+%Y-%m-%d %H:%M:%S') >> $logpath
			fi
		else
		       echo $inpath "is not mkv format"
		fi
	fi  
}

function convertDir(){
	mydir=$1;
	for myfile in $(ls $mydir)
	do
		len=${#mydir}
		laststr=${mydir:(len-1):len}
		if [ $laststr = "/" ]; then
			mkv2mp4 $mydir$myfile $2
		else
			mkv2mp4 $$mydir"/"myfile $2
		fi
	done
}

function convertFile(){
	mkv2mp4 $1 $2
}

myPathOrFile=$1;
if [ $# -lt 1  ]; then  
	myPathOrFile=$(pwd)
fi

#can not get it is a file or a path by [-d path] or [-f path]
$(cd $myPathOrFile 1>&- 2>&- )
if [ $? -eq 0 ]; then
	convertDir $myPathOrFile $2
else
	convertFile $myPathOrFile $2
fi

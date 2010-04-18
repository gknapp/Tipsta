#!/bin/bash
# Script to compile minified version of Tipsta

JSSRC="../jquery.tipsta.js"
JSMIN="../jquery.tipsta.min.js"
COMPRESSOR="yuicompressor-2.4.2.jar"

if [ ! -f $JSSRC ]; then
    echo "Source file does not exist: $JSSRC"
    exit 1
fi

if [ ! -s $JSSRC ]; then
    echo "Nothing to do. Input file 0 bytes"
    exit 2
fi

function filesize {
    local arg="-f %z"
    
    # args for stat differ between Linux and OSX
    if [ `uname` != "Darwin" ]; then
        local arg="-c %s"
    fi
    
    echo $(stat $arg "$1")
}

filesize=$(filesize $JSSRC)

echo -n "Minifying javascript: $filesize bytes -> "

sed -n '/^\/\*/p; /^ \*/p' < $JSSRC > $JSMIN
java -jar $COMPRESSOR $JSSRC >> $JSMIN

minsize=$(filesize $JSMIN)
percent=$(echo "($minsize / $filesize) * 100" | bc -l | xargs printf "%.1f")

echo "$minsize bytes ($percent%) done."

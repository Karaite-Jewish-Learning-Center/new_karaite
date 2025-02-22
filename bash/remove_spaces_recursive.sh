#!/bin/bash

# Find all files recursively and process them
find . -type f -name "* *" | while read file; do
    dir=$(dirname "$file")
    oldname=$(basename "$file")
    newname=$(echo "$oldname" | tr ' ' '_')
    
    mv "$dir/$oldname" "$dir/$newname"
    echo "Renamed: $dir/$oldname -> $dir/$newname"
done 
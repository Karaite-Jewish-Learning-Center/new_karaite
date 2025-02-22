#!/bin/bash

# Loop through all files in current directory
for file in *; do
    # Check if it's a file (not a directory)
    if [ -f "$file" ]; then
        # Create new filename by replacing spaces with underscores
        newname=$(echo "$file" | tr ' ' '_')
        
        # Only rename if the filename actually contained spaces
        if [ "$file" != "$newname" ]; then
            mv "$file" "$newname"
            echo "Renamed: $file -> $newname"
        fi
    fi
done 
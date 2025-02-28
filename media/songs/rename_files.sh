#!/bin/bash

# Loop through all MP3 files in current directory
for file in *.mp3; do
    # Check if it's a file (and not the literal "*.mp3" when no matches exist)
    if [ -f "$file" ]; then
        # Create new name by replacing spaces with underscores
        newname=$(echo "$file" | tr ' ' '_')
        
        # Rename only if the name would change
        if [ "$file" != "$newname" ]; then
            mv "$file" "$newname"
            echo "Renamed: $file -> $newname"
        fi
    fi
done 
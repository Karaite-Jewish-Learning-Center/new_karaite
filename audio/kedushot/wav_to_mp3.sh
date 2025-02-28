#!/bin/bash

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: ffmpeg is not installed. Please install it first."
    echo "You can install it with: sudo apt-get install ffmpeg"
    exit 1
fi

# Convert all wav files in current directory to mp3
for wav_file in *.wav; do
    # Skip if no wav files found
    [ -f "$wav_file" ] || continue
    
    # Get filename without extension
    filename="${wav_file%.wav}"
    
    # Convert to mp3
    ffmpeg -i "$wav_file" -codec:a libmp3lame -qscale:a 2 "${filename}.mp3" -hide_banner -loglevel error
    
    if [ $? -eq 0 ]; then
        echo "Converted: $wav_file -> ${filename}.mp3"
    else
        echo "Error converting $wav_file"
    fi
done

echo "Conversion complete" 
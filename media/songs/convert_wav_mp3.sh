#!/bin/bash

# Loop through all wav files in current directory
for wav_file in *.wav; do
    # Check if wav files exist
    if [ -f "$wav_file" ]; then
        # Get filename without extension
        filename="${wav_file%.*}"
        
        # Convert wav to mp3 using ffmpeg
        ffmpeg -i "$wav_file" -codec:a libmp3lame -qscale:a 2 "${filename}.mp3"
        
        echo "Converted: $wav_file -> ${filename}.mp3"
    fi
done

echo "Conversion complete!"
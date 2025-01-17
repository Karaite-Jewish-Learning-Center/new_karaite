#/bin/zsh

for file in *.wav; do
  ffmpeg -i "$file" -vn -ar 44100 -ac 2 -b:a 192k "${file%.wav}.mp3"
done

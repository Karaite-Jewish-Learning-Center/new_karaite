# convert srt to json
import sys
import json


def main():
    json_list = []
    # open file
    print(sys.argv[1])
    print(sys.argv[2])
    with open(sys.argv[1], 'r') as f:
        # read file
        for line in f.readlines():
            srt = line.strip()
            if len(srt) == 0:
                continue
            if srt.isdigit():
                continue
            if srt[0].isdigit():
                duration = srt
                continue
            json_list.append({'duration': duration, 'text': srt})

    open(sys.argv[2], 'w').write(json.dumps(json_list, indent=4))


if __name__ == '__main__':
    main()

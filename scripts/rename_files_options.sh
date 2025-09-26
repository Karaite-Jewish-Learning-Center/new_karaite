#!/bin/zsh

# Script to rename files by trimming leading and trailing spaces (default), collapsing consecutive spaces, replacing spaces with underscores, removing Hebrew characters, or removing a specified character

# Function to trim leading and trailing spaces in current directory
trim_spaces_in_current_dir() {
    for file in *; do
        if [[ -f "$file" ]]; then
            new_name=$(echo "$file" | perl -pe 's/^ +| +$//g')
            if [[ "$file" != "$new_name" ]]; then
                mv "$file" "$new_name"
                echo "Renamed: '$file' -> '$new_name'"
            fi
        fi
    done
}

# Function to trim leading and trailing spaces recursively
trim_spaces_recursively() {
    find . -type f | while read -r file; do
        dir=$(dirname "$file")
        basename=$(basename "$file")
        new_basename=$(echo "$basename" | perl -pe 's/^ +| +$//g')
        new_path="$dir/$new_basename"
        if [[ "$basename" != "$new_basename" ]]; then
            mv "$file" "$new_path"
            echo "Renamed: '$file' -> '$new_path'"
        fi
    done
}

# Function to collapse consecutive spaces to one space in current directory
collapse_spaces_in_current_dir() {
    for file in *; do
        if [[ -f "$file" ]]; then
            new_name=$(echo "$file" | perl -pe 's/ +/ /g')
            if [[ "$file" != "$new_name" ]]; then
                mv "$file" "$new_name"
                echo "Renamed: '$file' -> '$new_name'"
            fi
        fi
    done
}

# Function to collapse consecutive spaces to one space recursively
collapse_spaces_recursively() {
    find . -type f | while read -r file; do
        dir=$(dirname "$file")
        basename=$(basename "$file")
        new_basename=$(echo "$basename" | perl -pe 's/ +/ /g')
        new_path="$dir/$new_basename"
        if [[ "$basename" != "$new_basename" ]]; then
            mv "$file" "$new_path"
            echo "Renamed: '$file' -> '$new_path'"
        fi
    done
}

# Function to rename files in current directory (spaces to underscores)
rename_files_in_current_dir() {
    for file in *\ *; do
        if [[ -f "$file" ]]; then
            new_name="${file// /_}"
            mv "$file" "$new_name"
            echo "Renamed: '$file' -> '$new_name'"
        fi
    done
}

# Function to rename files recursively (spaces to underscores)
rename_files_recursively() {
    find . -name "* *" -type f | while read -r file; do
        dir=$(dirname "$file")
        basename=$(basename "$file")
        new_basename="${basename// /_}"
        new_path="$dir/$new_basename"
        mv "$file" "$new_path"
        echo "Renamed: '$file' -> '$new_path'"
    done
}

# Function to remove Hebrew characters from filenames in current directory
remove_hebrew_in_current_dir() {
    for file in *; do
        if [[ -f "$file" ]]; then
            new_name=$(echo "$file" | perl -CSD -pe 's/[\x{0590}-\x{05FF}]//g')
            if [[ "$file" != "$new_name" ]]; then
                mv "$file" "$new_name"
                echo "Renamed: '$file' -> '$new_name'"
            fi
        fi
    done
}

# Function to remove Hebrew characters from filenames recursively
remove_hebrew_recursively() {
    find . -type f | while read -r file; do
        dir=$(dirname "$file")
        basename=$(basename "$file")
        new_basename=$(echo "$basename" | perl -CSD -pe 's/[\x{0590}-\x{05FF}]//g')
        new_path="$dir/$new_basename"
        if [[ "$basename" != "$new_basename" ]]; then
            mv "$file" "$new_path"
            echo "Renamed: '$file' -> '$new_path'"
        fi
    done
}

# Function to remove a specified character from filenames in current directory
remove_char_in_current_dir() {
    char="$1"
    for file in *; do
        if [[ -f "$file" ]]; then
            new_name="${file//$char/}"
            if [[ "$file" != "$new_name" ]]; then
                mv "$file" "$new_name"
                echo "Renamed: '$file' -> '$new_name'"
            fi
        fi
    done
}

# Function to remove a specified character from filenames recursively
remove_char_recursively() {
    char="$1"
    find . -type f | while read -r file; do
        dir=$(dirname "$file")
        basename=$(basename "$file")
        new_basename="${basename//$char/}"
        new_path="$dir/$new_basename"
        if [[ "$basename" != "$new_basename" ]]; then
            mv "$file" "$new_path"
            echo "Renamed: '$file' -> '$new_path'"
        fi
    done
}

# Check for command line argument
case "$1" in
    -r|--recursive)
        echo "Trimming leading and trailing spaces recursively..."
        trim_spaces_recursively
        ;;
    --collapse)
        echo "Collapsing consecutive spaces to one space in current directory..."
        collapse_spaces_in_current_dir
        ;;
    --collapse-recursive)
        echo "Collapsing consecutive spaces to one space recursively..."
        collapse_spaces_recursively
        ;;
    -h|--remove-hebrew)
        echo "Removing Hebrew characters from filenames in current directory..."
        remove_hebrew_in_current_dir
        ;;
    -hr|--remove-hebrew-recursive)
        echo "Removing Hebrew characters from filenames recursively..."
        remove_hebrew_recursively
        ;;
    -c|--remove-char)
        if [[ -z "$2" ]]; then
            echo "Error: No character specified to remove."
            exit 1
        fi
        echo "Removing character '$2' from filenames in current directory..."
        remove_char_in_current_dir "$2"
        ;;
    -cr|--remove-char-recursive)
        if [[ -z "$2" ]]; then
            echo "Error: No character specified to remove."
            exit 1
        fi
        echo "Removing character '$2' from filenames recursively..."
        remove_char_recursively "$2"
        ;;
    --underscore)
        echo "Renaming files in current directory only (spaces to underscores)..."
        rename_files_in_current_dir
        ;;
    --underscore-recursive)
        echo "Renaming files recursively (spaces to underscores)..."
        rename_files_recursively
        ;;
    *)
        echo "Trimming leading and trailing spaces in current directory..."
        trim_spaces_in_current_dir
        ;;
esac

echo "Renaming complete!"

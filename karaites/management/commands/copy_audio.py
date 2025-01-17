import sys
import os
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Copy audio files from source to destination'
    help = 'Copy audio files from source to destination'
    help += 'Example: python manage.py copy_audio source destination'

    # get arguments
    def add_arguments(self, parser):
        parser.add_argument('source', type=str, help='source directory')
        parser.add_argument('destination', type=str, help='destination directory')

    def handle(self, *args, **options):
        """
           copy audio files from source to destination
           replace all spaces with underscores
        """

        if options['source'] == options['destination']:
            sys.stdout.write('source and destination directories are the same')
            return

        if not os.path.isdir(options['source']):
            sys.stdout.write('source directory does not exist')
            return

        if not os.path.isdir(options['destination']):
            sys.stdout.write('destination directory does not exist')
            return

        for root, dirs, files in os.walk(options['source']):
            for file in files:
                if file.endswith('.mp3') or file.endswith('.wav'):
                    source_file = os.path.join(root, file)
                    destination_file = os.path.join(options['destination'], file.replace(' ', '_'))
                    sys.stdout.write('copying {} to {}'.format(source_file, destination_file))
                    # use pythons file copy
                    with open(source_file, 'rb') as src, open(destination_file, 'wb') as dest:
                        sys.stdout.write('copying {} to {}'.format(source_file, destination_file))
                        dest.write(src.read())
                    sys.stdout.write('done')


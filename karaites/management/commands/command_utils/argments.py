""" Argument parser for the karaites management command. """


def arguments(parser):
    parser.add_argument(
        '--all',
        default=False,
        action='store_true',
        help='Process all books',
    )
    parser.add_argument(
        '--comments',
        dest='comments',
        action='store_false',
        default=False,
        help='Process comments books',
    )
    parser.add_argument(
        '--liturgy',
        dest='liturgy',
        action='store_true',
        default=False,
        help='Process liturgy books',
    )
    parser.add_argument(
        '--halakhah',
        dest='halakhah',
        action='store_true',
        default=False,
        help='Process halakhah books',
    )
    parser.add_argument(
        '--polemic',
        dest='polemic',
        action='store_true',
        default=False,
        help="Process polemic books",
    )
    parser.add_argument(
        '--poetry',
        dest='poetry',
        action='store_true',
        default=False,
        help="Process poetry books",
    )
    parser.add_argument(
        '--list',
        action='store_true',
        default=False,
        help="List all books",
    )
    parser.add_argument(
        '--id',
        dest='book_id',
        default=0,
        help='Process a single book',
    )
    parser.add_argument(
        '--exhortatory',
        dest='exhortatory',
        action='store_true',
        default=False,
        help='Process exhortatory books',
    )
    return parser

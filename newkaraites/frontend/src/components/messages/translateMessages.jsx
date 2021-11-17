// translate error messages, in a way that is more user friendly
// add some action to every error

export const translateMessage = (error) => {
    switch (error.message) {
        case 'Cannot read properties of undefined (reading \'indexOf\')':
            // todo add action where !
            return 'This Bible reference is unknown! A message was sent to site administrators'
        default: {
            // todo add action where !
            return 'Unknown error message.'
        }
    }
}
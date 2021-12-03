
export const languageDirection = (language: string): string => {
    switch (language) {
        case 'en':
            return 'LTR'
        case 'he':
            return 'RTL'
        default: {
            return 'Error'
        }
    }
}

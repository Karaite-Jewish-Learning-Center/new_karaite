
const ClearLiturgyLocalStorage = () => {
    localStorage.removeItem('liturgyScrollPosition');
    localStorage.removeItem('liturgyMenuOpen');
    localStorage.removeItem('liturgyExpandedSections');
}

export default ClearLiturgyLocalStorage;
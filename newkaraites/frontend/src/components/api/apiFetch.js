async function timeoutFetch(url, options = {}) {
    const {timeout = 5000} = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

export const apiFetch = async (url, options = {}) => {
    try {
        const response = await timeoutFetch(url, options)
        return await response.json()
    } catch (error) {
        console.log(error.message)
    }
}
export const fetchData = async (url: string): Promise<any> => {
    const response = await fetch(url);
    if (response.ok) {
        return await response.json()
    } else {
        return Promise.reject('error')
    }
}


export const dataFetch = async <T, >(url: string): Promise<T> => {
    const response = await fetch(url);
    return await response.json();
}

function getFirst(value: string | string[] | undefined): string|undefined {

    if (!value) {
        return value;
    }

    if (Array.isArray(value)) {
        return value[0];
    }
    
    return value;
}

export {
    getFirst
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function flattenObject(obj: any, prefix = ''): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Object.keys(obj).reduce((acc: any, k: string) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return undefined;

    // Direct match shortcut
    if (path in obj) return obj[path];

    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length; i++) {
        if (current === undefined || current === null) return undefined;

        // Greedy match: try to find the longest matching key starting from current part
        let matchKey = "";
        let matchLen = 0;

        // Try combinations of parts: "1", "1.Information", etc.
        for (let j = 1; j <= parts.length - i; j++) {
            const potentialKey = parts.slice(i, i + j).join('.');
            // Check if this potential key exists in the current object
            if (typeof current === 'object' && potentialKey in current) {
                matchKey = potentialKey;
                matchLen = j;
                break; // Found a valid key, assume this is the path (greedy/first match)
            }
        }

        if (matchKey) {
            current = current[matchKey];
            i += matchLen - 1; // Advance loop by the number of consumed parts
        } else {
            // No matching key found, returns undefined (path invalid)
            return undefined;
        }
    }

    return current;
}

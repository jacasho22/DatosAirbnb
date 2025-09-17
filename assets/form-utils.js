// Utilities extracted for unit testing
export function parseCheckInData(jsonString) {
    if (!jsonString) return null;
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return null;
    }
}

export function normalizeCheckInData(data) {
    if (!data) return null;
    if (!data.guestsCount && data.numGuests) {
        data.guestsCount = data.numGuests;
    } else if (!data.guestsCount) {
        data.guestsCount = 2; // default
    }
    if (!data.language) data.language = 'es';
    return data;
}

export function progressText(current, total, i18n) {
    if (i18n && typeof i18n.getText === 'function') {
        const template = i18n.getText('progress') || '{current} de {total}';
        return template.replace('{current}', current).replace('{total}', total);
    }
    return `${current} de ${total}`;
}

export default { parseCheckInData, normalizeCheckInData, progressText };

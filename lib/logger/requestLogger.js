let isLoggingEnabled = false;
const requestLog = [];


export function enable_request_logging() {
    isLoggingEnabled = true;
}

// Disables request logging for this axios instance
export function disable_request_logging() {
    isLoggingEnabled = false;
}

// Returns a copy of the current request log
export function get_request_log () {
    return [...requestLog];
}

// Clears all the logged request entries
export function clear_request_log () {
    requestLog.length = 0;
}

/**
 * Logs a successful response.
 * @param {Object} response - The Axios response object.
 */
export function logResponse(response) {
    if (isLoggingEnabled) {
        requestLog.push({
            method: response.config.method.toUpperCase(),
            url: response.config.url,
            status: response.status
        });
    }
}

/**
 * Logs an error response if available.
 * @param {Object} error - The Axios error object.
 */
export function logError(error) {
    if (isLoggingEnabled && error.response) {
        requestLog.push({
            method: error.config.method.toUpperCase(),
            url: error.config.url,
            status: error.response.status
        });
    }
}
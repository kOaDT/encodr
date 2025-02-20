export class EncodrError extends Error {
    constructor(message, type = 'error') {
        super(message);
        this.name = 'EncodrError';
        this.type = type; // 'error', 'warning', 'info'
    }
}

export const ErrorTypes = {
    INVALID_INPUT: 'invalid_input',
    ENCODING_ERROR: 'encoding_error',
    DECODING_ERROR: 'decoding_error',
    JWT_ERROR: 'jwt_error',
    CLIPBOARD_ERROR: 'clipboard_error',
    INPUT_TOO_LARGE: 'input_too_large',
    INVALID_FORMAT: 'invalid_format',
    INVALID_CHARACTERS: 'invalid_characters'
};

export const ErrorMessages = {
    [ErrorTypes.INVALID_INPUT]: 'Please provide valid input',
    [ErrorTypes.ENCODING_ERROR]: 'Unable to encode the input',
    [ErrorTypes.DECODING_ERROR]: 'Unable to decode the input',
    [ErrorTypes.JWT_ERROR]: 'Invalid JWT format or signature',
    [ErrorTypes.CLIPBOARD_ERROR]: 'Unable to access clipboard',
    [ErrorTypes.INPUT_TOO_LARGE]: 'Input size exceeds maximum limit',
    [ErrorTypes.INVALID_FORMAT]: 'Invalid input format',
    [ErrorTypes.INVALID_CHARACTERS]: 'Input contains invalid characters'
}; 
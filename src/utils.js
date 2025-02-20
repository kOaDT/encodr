import { EncodrError } from './errorHandler.js';

export function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const messageText = document.createElement('span');
    messageText.textContent = message;
    notification.appendChild(messageText);
    
    document.body.appendChild(notification);
    
    notification.offsetHeight;
    
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

export function handleError(error, inputElement = null) {
    if (error instanceof EncodrError) {
        showNotification(error.message, error.type);
    } else {
        showNotification(error.message, 'error');
    }

    if (inputElement) {
        inputElement.classList.add('input-error');
        setTimeout(() => inputElement.classList.remove('input-error'), 1000);
    }
} 
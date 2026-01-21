import React, { useEffect } from 'react';
import './Toast.css';

/**
 * Toast notification component
 * @param {string} message - Message to display
 * @param {string} type - 'success' | 'error' | 'info'
 * @param {function} onClose - Callback when toast closes
 * @param {number} duration - Auto-dismiss duration in ms (default: 5000)
 */
function Toast({ message, type = 'info', onClose, duration = 5000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'info':
            default:
                return 'ℹ️';
        }
    };

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-icon">{getIcon()}</span>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={onClose}>×</button>
        </div>
    );
}

export default Toast;

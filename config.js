/**
 * Configuration file for AI Chat Assistant
 * 
 * This file contains default settings and can be modified to customize
 * the chat behavior and appearance.
 */

const ChatAssistantConfig = {
    // API Configuration
    api: {
        // n8n webhook URL - replace with your actual webhook endpoint
        webhookUrl: 'https://dgri5zej5qva2.cloudfront.net/webhook-test/dbd70933-6501-474c-b75e-3e3c35d7b221',
        
        // Request timeout in milliseconds
        timeout: 30000,
        
        // Retry configuration
        maxRetries: 3,
        retryDelay: 1000, // milliseconds
        
        // Request headers (optional)
        headers: {
            'Content-Type': 'application/json',
            // Add any custom headers here if needed
            // 'Authorization': 'Bearer your-token',
            // 'X-API-Key': 'your-api-key'
        }
    },

    // UI Configuration
    ui: {
        // Chat popup dimensions
        width: 380,
        height: 500,
        
        // Position (bottom-right by default)
        position: {
            bottom: 90,
            right: 20
        },
        
        // Button styling
        button: {
            size: 60,
            position: {
                bottom: 20,
                right: 20
            }
        },
        
        // Theme colors
        theme: {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b'
        },
        
        // Animation settings
        animations: {
            enabled: true,
            duration: 300, // milliseconds
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
    },

    // Chat behavior settings
    chat: {
        // Maximum message length
        maxMessageLength: 1000,
        
        // Maximum chat history to store
        maxHistorySize: 100,
        
        // Auto-save chat history
        autoSaveHistory: true,
        
        // Show typing indicator
        showTypingIndicator: true,
        
        // Welcome message
        welcomeMessage: {
            enabled: true,
            text: "👋 Hello! I'm your AI assistant. Ask me anything about this website or software."
        },
        
        // Auto-resize input field
        autoResizeInput: true,
        
        // Timestamp format
        timestampFormat: {
            hour: '2-digit',
            minute: '2-digit'
        }
    },

    // Storage configuration
    storage: {
        // Local storage keys
        keys: {
            isVisible: 'chatPopupVisible',
            webhookUrl: 'chatWebhookUrl',
            chatHistory: 'chatHistory',
            userPreferences: 'chatUserPreferences'
        },
        
        // Storage limits
        maxHistorySize: 1000000, // bytes
        
        // Auto-cleanup old messages after days
        autoCleanupDays: 30
    },

    // Feature flags
    features: {
        // Enable settings panel
        enableSettings: true,
        
        // Enable chat history
        enableHistory: true,
        
        // Enable clear chat function
        enableClearChat: true,
        
        // Enable file uploads (future feature)
        enableFileUpload: false,
        
        // Enable voice messages (future feature)
        enableVoiceMessages: false,
        
        // Enable emoji picker (future feature)
        enableEmojiPicker: false
    },

    // URL patterns to exclude the chat from
    excludeUrls: [
        // Example patterns:
        // 'https://admin.*',
        // '*/login',
        // '*/checkout'
    ],

    // URL patterns to include the chat on (if empty, includes all)
    includeUrls: [
        // Example patterns:
        // 'https://mywebsite.com/*',
        // 'https://*.mycompany.com/*'
    ],

    // Debug settings
    debug: {
        enabled: false,
        logLevel: 'info', // 'error', 'warn', 'info', 'debug'
        logToConsole: true
    },

    // Accessibility settings
    accessibility: {
        // High contrast mode
        highContrast: false,
        
        // Reduced motion
        reducedMotion: false,
        
        // Screen reader support
        screenReaderSupport: true,
        
        // Keyboard navigation
        keyboardNavigation: true
    }
};

// Helper function to get configuration value with fallback
function getConfigValue(path, fallback = null) {
    const keys = path.split('.');
    let value = ChatAssistantConfig;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return fallback;
        }
    }
    
    return value;
}

// Helper function to update configuration
function updateConfig(path, newValue) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = ChatAssistantConfig;
    
    for (const key of keys) {
        if (!(key in target)) {
            target[key] = {};
        }
        target = target[key];
    }
    
    target[lastKey] = newValue;
}

// Validate configuration on load
function validateConfig() {
    const required = [
        'api.webhookUrl',
        'ui.width',
        'ui.height',
        'chat.maxMessageLength'
    ];
    
    const missing = [];
    
    for (const path of required) {
        if (getConfigValue(path) === null || getConfigValue(path) === undefined) {
            missing.push(path);
        }
    }
    
    if (missing.length > 0) {
        console.warn('Chat Assistant: Missing required configuration values:', missing);
    }
    
    return missing.length === 0;
}

// Environment-specific configurations
const EnvironmentConfigs = {
    development: {
        debug: {
            enabled: true,
            logLevel: 'debug'
        },
        api: {
            timeout: 10000
        }
    },
    
    staging: {
        debug: {
            enabled: true,
            logLevel: 'info'
        }
    },
    
    production: {
        debug: {
            enabled: false,
            logLevel: 'error'
        },
        api: {
            timeout: 30000
        }
    }
};

// Auto-detect environment and apply config
function applyEnvironmentConfig() {
    let environment = 'production'; // default
    
    // Simple environment detection
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
        environment = 'development';
    } else if (window.location.hostname.includes('staging') || window.location.hostname.includes('test')) {
        environment = 'staging';
    }
    
    const envConfig = EnvironmentConfigs[environment];
    if (envConfig) {
        // Merge environment-specific config
        Object.keys(envConfig).forEach(key => {
            if (typeof envConfig[key] === 'object' && !Array.isArray(envConfig[key])) {
                Object.assign(ChatAssistantConfig[key], envConfig[key]);
            } else {
                ChatAssistantConfig[key] = envConfig[key];
            }
        });
    }
    
    if (ChatAssistantConfig.debug.enabled) {
        console.log(`Chat Assistant: Environment detected as '${environment}'`);
    }
}

// Initialize configuration
if (typeof window !== 'undefined') {
    applyEnvironmentConfig();
    validateConfig();
}

// Export for use in userscript (if in browser environment)
if (typeof window !== 'undefined') {
    window.ChatAssistantConfig = ChatAssistantConfig;
    window.getConfigValue = getConfigValue;
    window.updateConfig = updateConfig;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ChatAssistantConfig,
        getConfigValue,
        updateConfig,
        validateConfig,
        applyEnvironmentConfig
    };
} 
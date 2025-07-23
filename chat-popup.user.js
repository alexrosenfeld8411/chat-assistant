// ==UserScript==
// @name         AI Chat Assistant Popup
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Inject a chat popup for AI assistance on any website
// @author       Assistant
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // Configuration object for easy management
    const ChatConfig = {
        webhookUrl: '', // Will be set from saved configuration
        apiTimeout: 30000, // 30 seconds timeout
        maxMessageLength: 1000,
        storageKeys: {
            isVisible: 'chatPopupVisible',
            webhookUrl: 'chatWebhookUrl',
            chatHistory: 'chatHistory'
        }
    };

    // Chat state management
    class ChatState {
        constructor() {
            this.isVisible = GM_getValue(ChatConfig.storageKeys.isVisible, false);
            this.chatHistory = this.loadChatHistory();
            this.isWaitingForResponse = false;
        }

        loadChatHistory() {
            try {
                const saved = GM_getValue(ChatConfig.storageKeys.chatHistory, '[]');
                return JSON.parse(saved);
            } catch (error) {
                console.error('Failed to load chat history:', error);
                return [];
            }
        }

        saveChatHistory() {
            try {
                GM_setValue(ChatConfig.storageKeys.chatHistory, JSON.stringify(this.chatHistory));
            } catch (error) {
                console.error('Failed to save chat history:', error);
            }
        }

        addMessage(message, isUser = true) {
            const messageObj = {
                id: Date.now(),
                text: message,
                isUser: isUser,
                timestamp: new Date().toISOString()
            };
            this.chatHistory.push(messageObj);
            this.saveChatHistory();
            return messageObj;
        }

        clearHistory() {
            this.chatHistory = [];
            this.saveChatHistory();
        }
    }

    // Chat UI management
    class ChatUI {
        constructor(chatState) {
            this.chatState = chatState;
            this.initializeUI();
        }

        initializeUI() {
            this.createChatButton();
            this.createChatPopup();
            this.attachEventListeners();
            this.updateVisibility();
        }

        createChatButton() {
            this.chatButton = document.createElement('div');
            this.chatButton.id = 'ai-chat-button';
            this.chatButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 13.54 2.36 15.01 3.01 16.31L2 22L7.69 20.99C8.99 21.64 10.46 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C10.74 20 9.54 19.75 8.46 19.3L8.19 19.15L4.95 19.85L5.65 16.61L5.5 16.34C5.05 15.26 4.8 14.06 4.8 12.8C4.8 7.58 8.78 3.6 14 3.6C19.22 3.6 23.2 7.58 23.2 12.8C23.2 18.02 19.22 22 14 22H12Z" fill="white"/>
                </svg>
            `;
            document.body.appendChild(this.chatButton);
        }

        createChatPopup() {
            this.chatPopup = document.createElement('div');
            this.chatPopup.id = 'ai-chat-popup';
            this.chatPopup.innerHTML = `
                <div class="chat-header">
                    <div class="chat-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="3" fill="#10b981"/>
                            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="#6b7280" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <span>AI Assistant</span>
                    </div>
                    <div class="chat-controls">
                        <button class="chat-settings-btn" title="Settings">⚙️</button>
                        <button class="chat-clear-btn" title="Clear Chat">🗑️</button>
                        <button class="chat-close-btn" title="Close">✕</button>
                    </div>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="welcome-message">
                        <p>👋 Hello! I'm your AI assistant. Ask me anything about this website or software.</p>
                    </div>
                </div>
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <textarea 
                            id="chat-input" 
                            placeholder="Type your question here..." 
                            rows="1"
                            maxlength="${ChatConfig.maxMessageLength}">
                        </textarea>
                        <button id="chat-send-btn" class="chat-send-btn" title="Send message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                    <div class="chat-status" id="chat-status"></div>
                </div>
                <div class="chat-settings-panel" id="chat-settings-panel">
                    <div class="settings-content">
                        <h3>Settings</h3>
                        <div class="setting-group">
                            <label for="webhook-url">Webhook URL:</label>
                            <input type="url" id="webhook-url" placeholder="Enter your n8n webhook URL">
                            <button id="save-webhook">Save</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(this.chatPopup);
        }

        attachEventListeners() {
            // Toggle chat visibility
            this.chatButton.addEventListener('click', () => this.toggleChat());
            this.chatPopup.querySelector('.chat-close-btn').addEventListener('click', () => this.toggleChat());

            // Settings panel
            this.chatPopup.querySelector('.chat-settings-btn').addEventListener('click', () => this.toggleSettings());

            // Clear chat
            this.chatPopup.querySelector('.chat-clear-btn').addEventListener('click', () => this.clearChat());

            // Send message
            const sendBtn = this.chatPopup.querySelector('#chat-send-btn');
            const inputField = this.chatPopup.querySelector('#chat-input');
            
            sendBtn.addEventListener('click', () => this.sendMessage());
            inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Auto-resize textarea
            inputField.addEventListener('input', () => this.autoResizeInput());

            // Save webhook URL
            this.chatPopup.querySelector('#save-webhook').addEventListener('click', () => this.saveWebhookUrl());

            // Load saved webhook URL
            this.loadWebhookUrl();
        }

        toggleChat() {
            this.chatState.isVisible = !this.chatState.isVisible;
            GM_setValue(ChatConfig.storageKeys.isVisible, this.chatState.isVisible);
            this.updateVisibility();
            
            if (this.chatState.isVisible) {
                this.renderChatHistory();
                this.focusInput();
            }
        }

        toggleSettings() {
            const settingsPanel = this.chatPopup.querySelector('#chat-settings-panel');
            settingsPanel.classList.toggle('visible');
        }

        updateVisibility() {
            this.chatPopup.classList.toggle('visible', this.chatState.isVisible);
            this.chatButton.classList.toggle('chat-open', this.chatState.isVisible);
        }

        renderChatHistory() {
            const messagesContainer = this.chatPopup.querySelector('#chat-messages');
            const welcomeMessage = messagesContainer.querySelector('.welcome-message');
            
            // Clear all messages except welcome
            const existingMessages = messagesContainer.querySelectorAll('.message');
            existingMessages.forEach(msg => msg.remove());

            // Render chat history
            this.chatState.chatHistory.forEach(message => {
                this.appendMessageToUI(message.text, message.isUser, false);
            });

            this.scrollToBottom();
        }

        clearChat() {
            if (confirm('Are you sure you want to clear the chat history?')) {
                this.chatState.clearHistory();
                this.renderChatHistory();
                this.showStatus('Chat history cleared', 'success');
            }
        }

        async sendMessage() {
            const inputField = this.chatPopup.querySelector('#chat-input');
            const message = inputField.value.trim();
            
            if (!message || this.chatState.isWaitingForResponse) {
                return;
            }

            // Add user message
            this.chatState.addMessage(message, true);
            this.appendMessageToUI(message, true);
            inputField.value = '';
            this.autoResizeInput();

            // Send to webhook
            this.chatState.isWaitingForResponse = true;
            this.showTypingIndicator();

            try {
                const response = await this.sendToWebhook(message);
                this.hideTypingIndicator();
                
                // Add AI response
                this.chatState.addMessage(response, false);
                this.appendMessageToUI(response, false);
                
            } catch (error) {
                this.hideTypingIndicator();
                console.error('Chat error:', error);
                this.appendMessageToUI('Sorry, I encountered an error. Please try again.', false);
                this.showStatus('Failed to send message', 'error');
            } finally {
                this.chatState.isWaitingForResponse = false;
            }
        }

        async sendToWebhook(message) {
            const webhookUrl = GM_getValue(ChatConfig.storageKeys.webhookUrl, '');
            
            if (!webhookUrl) {
                throw new Error('Webhook URL not configured. Please set it in settings.');
            }

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: webhookUrl,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify({
                        message: message,
                        timestamp: new Date().toISOString(),
                        url: window.location.href,
                        domain: window.location.hostname
                    }),
                    timeout: ChatConfig.apiTimeout,
                    onload: function(response) {
                        try {
                            const data = JSON.parse(response.responseText);
                            resolve(data.response || data.message || 'Response received');
                        } catch (e) {
                            resolve(response.responseText || 'Response received');
                        }
                    },
                    onerror: function(error) {
                        reject(new Error('Network error occurred'));
                    },
                    ontimeout: function() {
                        reject(new Error('Request timed out'));
                    }
                });
            });
        }

        appendMessageToUI(message, isUser, animate = true) {
            const messagesContainer = this.chatPopup.querySelector('#chat-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}${animate ? ' animate-in' : ''}`;
            
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${this.formatMessage(message)}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
            
            messagesContainer.appendChild(messageDiv);
            this.scrollToBottom();
        }

        formatMessage(message) {
            // Basic formatting for URLs, line breaks, etc.
            return message
                .replace(/\n/g, '<br>')
                .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        }

        showTypingIndicator() {
            const messagesContainer = this.chatPopup.querySelector('#chat-messages');
            const typingDiv = document.createElement('div');
            typingDiv.id = 'typing-indicator';
            typingDiv.className = 'message ai-message typing';
            typingDiv.innerHTML = `
                <div class="message-content">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            messagesContainer.appendChild(typingDiv);
            this.scrollToBottom();
        }

        hideTypingIndicator() {
            const typingIndicator = this.chatPopup.querySelector('#typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        autoResizeInput() {
            const inputField = this.chatPopup.querySelector('#chat-input');
            inputField.style.height = 'auto';
            inputField.style.height = Math.min(inputField.scrollHeight, 120) + 'px';
        }

        focusInput() {
            setTimeout(() => {
                const inputField = this.chatPopup.querySelector('#chat-input');
                inputField.focus();
            }, 100);
        }

        scrollToBottom() {
            const messagesContainer = this.chatPopup.querySelector('#chat-messages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        showStatus(message, type = 'info') {
            const statusElement = this.chatPopup.querySelector('#chat-status');
            statusElement.textContent = message;
            statusElement.className = `chat-status ${type}`;
            statusElement.style.display = 'block';
            
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        }

        saveWebhookUrl() {
            const urlInput = this.chatPopup.querySelector('#webhook-url');
            const url = urlInput.value.trim();
            
            if (url && this.isValidUrl(url)) {
                GM_setValue(ChatConfig.storageKeys.webhookUrl, url);
                this.showStatus('Webhook URL saved successfully', 'success');
                this.toggleSettings();
            } else {
                this.showStatus('Please enter a valid URL', 'error');
            }
        }

        loadWebhookUrl() {
            const urlInput = this.chatPopup.querySelector('#webhook-url');
            const savedUrl = GM_getValue(ChatConfig.storageKeys.webhookUrl, '');
            urlInput.value = savedUrl;
        }

        isValidUrl(string) {
            try {
                new URL(string);
                return true;
            } catch (_) {
                return false;
            }
        }
    }

    // Initialize the chat system
    function initializeChat() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startChat);
        } else {
            startChat();
        }
    }

    function startChat() {
        try {
            const chatState = new ChatState();
            const chatUI = new ChatUI(chatState);
            
            console.log('AI Chat Assistant initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AI Chat Assistant:', error);
        }
    }

    // Start the application
    initializeChat();

})(); 
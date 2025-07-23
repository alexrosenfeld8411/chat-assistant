# AI Chat Assistant Popup

A modern, responsive chat interface that can be injected into any website using Tampermonkey and Stylus extensions. This chat assistant connects to your n8n workflow via webhooks to provide AI-powered assistance while browsing.

## 🚀 Features

- **Universal Compatibility**: Works on any website
- **Modern UI**: Clean, responsive design with smooth animations
- **Chat History**: Persistent conversation storage
- **Customizable**: Extensive configuration options
- **Mobile Friendly**: Responsive design for all screen sizes
- **Dark Mode**: Automatic dark mode support
- **Settings Panel**: Easy webhook configuration
- **Typing Indicators**: Visual feedback during conversations
- **Error Handling**: Graceful error recovery with user feedback

## 📦 Installation

### Prerequisites

1. **Google Chrome** with the following extensions:
   - [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) - For running the userscript
   - [Stylus](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne) - For applying CSS styles

2. **n8n Workflow** - Set up your n8n workflow with webhook endpoint

### Step 1: Install the Userscript

1. Open Tampermonkey Dashboard
2. Click **"Create a new script"**
3. Delete the default content
4. Copy and paste the entire content of `chat-popup.user.js`
5. Press **Ctrl+S** to save
6. The script will be automatically enabled

### Step 2: Install the Styles

1. Open Stylus extension
2. Click **"Write new style"**
3. Set the style to apply to **"URLs matching the regexp"**: `.*`
4. Copy and paste the entire content of `chat-popup.css`
5. Give it a name like "AI Chat Assistant Styles"
6. Click **Save**

### Step 3: Configure Webhook URL

1. Visit any website
2. Click the chat button that appears in the bottom-right corner
3. Click the settings gear icon (⚙️) in the chat header
4. Enter your n8n webhook URL in the settings panel
5. Click **Save**

## ⚙️ Configuration

### Basic Setup

Edit the `config.js` file or use the in-app settings to configure:

```javascript
// Basic webhook configuration
api: {
    webhookUrl: 'https://your-n8n-instance.com/webhook/chat-assistant',
    timeout: 30000
}
```

### Advanced Configuration

The configuration file supports extensive customization:

#### API Settings
```javascript
api: {
    webhookUrl: 'your-webhook-url',
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    headers: {
        'Content-Type': 'application/json'
        // Add custom headers if needed
    }
}
```

#### UI Customization
```javascript
ui: {
    width: 380,
    height: 500,
    position: { bottom: 90, right: 20 },
    theme: {
        primary: '#667eea',
        secondary: '#764ba2'
    }
}
```

#### Chat Behavior
```javascript
chat: {
    maxMessageLength: 1000,
    maxHistorySize: 100,
    autoSaveHistory: true,
    showTypingIndicator: true
}
```

## 🔧 n8n Webhook Setup

Your n8n workflow should expect a POST request with this structure:

### Request Format
```json
{
    "message": "User's question",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "url": "https://current-website.com/page",
    "domain": "current-website.com"
}
```

### Response Format
Your n8n workflow should return:

```json
{
    "response": "AI assistant's response text"
}
```

Or simply return the response as plain text.

### Example n8n Workflow Structure

1. **Webhook Trigger** - Receives the chat message
2. **Data Processing** - Extract message and context
3. **AI Integration** - Send to your AI service (OpenAI, etc.)
4. **Response Formatting** - Format the AI response
5. **HTTP Response** - Return formatted response

## 🎨 Customization

### Styling

The CSS is fully customizable. Key areas for modification:

- **Colors**: Update CSS custom properties
- **Positioning**: Modify `#ai-chat-popup` and `#ai-chat-button` positions
- **Animations**: Adjust transition durations and effects
- **Typography**: Change font families and sizes

### Features

Enable/disable features in config:

```javascript
features: {
    enableSettings: true,
    enableHistory: true,
    enableClearChat: true,
    enableFileUpload: false, // Future feature
    enableVoiceMessages: false // Future feature
}
```

### URL Filtering

Control where the chat appears:

```javascript
// Exclude from specific URLs
excludeUrls: [
    'https://admin.*',
    '*/login',
    '*/checkout'
],

// Include only on specific URLs (if empty, includes all)
includeUrls: [
    'https://mywebsite.com/*'
]
```

## 🛠️ Development

### File Structure
```
customerChatbotTest/
├── chat-popup.user.js    # Main Tampermonkey userscript
├── chat-popup.css        # Stylus stylesheet
├── config.js            # Configuration file
└── README.md            # This documentation
```

### Testing

1. **Local Testing**: Use localhost URLs for development
2. **Debug Mode**: Enable in config for detailed logging
3. **Console Logs**: Check browser console for errors

### Debug Mode

Enable debugging in the configuration:

```javascript
debug: {
    enabled: true,
    logLevel: 'debug',
    logToConsole: true
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Chat not appearing**
   - Check if Tampermonkey script is enabled
   - Verify Stylus is active
   - Check browser console for errors

2. **Messages not sending**
   - Verify webhook URL is correct
   - Check n8n workflow is running
   - Look for CORS issues

3. **Styling issues**
   - Ensure Stylus is enabled for the domain
   - Check for conflicting CSS from the website
   - Verify CSS selectors aren't being overridden

### Error Messages

- **"Webhook URL not configured"**: Set the webhook URL in settings
- **"Network error occurred"**: Check internet connection and webhook URL
- **"Request timed out"**: n8n workflow is taking too long to respond

## 🚦 Browser Support

- ✅ Chrome (Recommended)
- ✅ Firefox (with Greasemonkey)
- ✅ Edge (with Tampermonkey)
- ⚠️ Safari (Limited support)

## 📱 Mobile Support

The chat interface is fully responsive and works on mobile devices when accessed through compatible browsers.

## 🔒 Privacy & Security

- Chat history is stored locally in browser storage
- No data is sent to third parties except your configured n8n webhook
- Webhook URLs are stored securely in browser storage
- All communications use HTTPS (ensure your n8n instance uses HTTPS)

## 🔄 Updates

To update the chat assistant:

1. **Userscript**: Replace content in Tampermonkey
2. **Styles**: Update CSS in Stylus
3. **Configuration**: Modify config.js as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section
2. Enable debug mode for detailed logs
3. Check browser console for errors
4. Verify n8n webhook configuration

## 🔮 Future Features

- File upload support
- Voice message integration
- Emoji picker
- Multiple language support
- Chat themes
- Export chat history
- Advanced authentication

---

**Happy chatting! 🤖💬** 
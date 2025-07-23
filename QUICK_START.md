# Quick Start Guide 🚀

Get your AI Chat Assistant running in 5 minutes!

## Prerequisites

1. Install [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) extension
2. Install [Stylus](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne) extension

## Step 1: Install Userscript (2 minutes)

1. Open **Tampermonkey Dashboard** (click the extension icon → Dashboard)
2. Click **"Create a new script"**
3. **Delete all** existing content
4. **Copy & paste** the entire `chat-popup.user.js` file
5. Press **Ctrl+S** to save

## Step 2: Install Styles (1 minute)

1. Click **Stylus extension** icon
2. Click **"Write new style"**
3. Set to **"URLs matching the regexp"**: `.*`
4. **Copy & paste** the entire `chat-popup.css` file
5. Name it "AI Chat Assistant" and click **Save**

## Step 3: Configure Webhook (1 minute)

1. Visit **any website**
2. Click the **chat button** (bottom-right corner)
3. Click **settings gear** ⚙️ in chat header
4. Enter your **n8n webhook URL**
5. Click **Save**

## Step 4: Test It!

1. Type a message in the chat
2. Press Enter or click send
3. You should see a response from your AI

## n8n Webhook Format

Your n8n workflow receives:
```json
{
    "message": "user question",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "url": "https://current-site.com",
    "domain": "current-site.com"
}
```

Should return:
```json
{
    "response": "AI assistant response"
}
```

## Troubleshooting

- **Chat not visible?** → Check if both extensions are enabled
- **Messages not sending?** → Verify webhook URL in settings
- **Console errors?** → Enable debug mode in userscript

## Need Help?

Check the full [README.md](README.md) for detailed configuration and troubleshooting.

---

**That's it! Your AI chat assistant is ready to help on any website! 🎉** 
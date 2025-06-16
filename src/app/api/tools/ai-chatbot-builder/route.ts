import { NextRequest, NextResponse } from 'next/server'
import { FileService, AppError } from '@/lib/file-service';
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

interface ChatbotConfig {
  id: string
  name: string
  description: string
  personality: 'professional' | 'friendly' | 'casual' | 'formal' | 'helpful' | 'expert'
  domain: string
  language: string
  responseStyle: 'concise' | 'detailed' | 'balanced'
  welcomeMessage: string
  fallbackMessage: string
  knowledgeBase: Array<{
    question: string
    answer: string
    category?: string
  }>
  integrations: {
    website?: boolean
    slack?: boolean
    discord?: boolean
    telegram?: boolean
    api?: boolean
  }
  appearance: {
    primaryColor: string
    position: 'bottom-right' | 'bottom-left' | 'bottom-center'
    size: 'small' | 'medium' | 'large'
    avatar?: string
  }
}

interface BuildRequest {
  config: ChatbotConfig
  outputFormat: 'json' | 'html' | 'javascript' | 'webhook'
  includeTraining?: boolean
  generateCode?: boolean
  platform?: 'web' | 'slack' | 'discord' | 'telegram' | 'api'
}

interface BuildResponse {
  success: boolean
  chatbotId?: string
  outputFileId?: string
  outputFileName?: string
  downloadUrl?: string
  config?: ChatbotConfig
  generatedCode?: string
  webhookUrl?: string
  deploymentInstructions?: string
  processingTime?: number
  error?: string
}

// FileService handles directory paths
const CHATBOTS_DIR = join(process.cwd(), 'chatbots')

async function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }
}

async function ensureChatbotsDir() {
  if (!existsSync(CHATBOTS_DIR)) {
    await mkdir(CHATBOTS_DIR, { recursive: true })
  }
}

// Generate chatbot implementation code
function generateChatbotCode(config: ChatbotConfig, platform: string): string {
  switch (platform) {
    case 'web':
      return generateWebChatbot(config)
    case 'slack':
      return generateSlackBot(config)
    case 'discord':
      return generateDiscordBot(config)
    case 'telegram':
      return generateTelegramBot(config)
    case 'api':
      return generateAPIBot(config)
    default:
      return generateWebChatbot(config)
  }
}

function generateWebChatbot(config: ChatbotConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.name} - AI Chatbot</title>
    <style>
        /* Chatbot Styles */
        .chatbot-container {
            position: fixed;
            ${config.appearance.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
            bottom: 20px;
            width: ${config.appearance.size === 'large' ? '400px' : config.appearance.size === 'medium' ? '350px' : '300px'};
            height: 500px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 1000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: none;
        }
        
        .chatbot-header {
            background: ${config.appearance.primaryColor};
            color: white;
            padding: 15px;
            border-radius: 10px 10px 0 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .chatbot-title {
            font-weight: 600;
            font-size: 16px;
        }
        
        .chatbot-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        }
        
        .chatbot-messages {
            height: 350px;
            overflow-y: auto;
            padding: 15px;
            background: #f8f9fa;
        }
        
        .message {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
        }
        
        .message.user {
            justify-content: flex-end;
        }
        
        .message-content {
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 18px;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .message.bot .message-content {
            background: white;
            border: 1px solid #e0e0e0;
        }
        
        .message.user .message-content {
            background: ${config.appearance.primaryColor};
            color: white;
        }
        
        .chatbot-input {
            padding: 15px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
        }
        
        .chatbot-input input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
            font-size: 14px;
        }
        
        .chatbot-send {
            background: ${config.appearance.primaryColor};
            color: white;
            border: none;
            border-radius: 20px;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .chatbot-toggle {
            position: fixed;
            ${config.appearance.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
            bottom: 20px;
            width: 60px;
            height: 60px;
            background: ${config.appearance.primaryColor};
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 1001;
        }
    </style>
</head>
<body>
    <!-- Chatbot Toggle Button -->
    <button class="chatbot-toggle" onclick="toggleChatbot()">💬</button>
    
    <!-- Chatbot Container -->
    <div class="chatbot-container" id="chatbot">
        <div class="chatbot-header">
            <div class="chatbot-title">${config.name}</div>
            <button class="chatbot-close" onclick="toggleChatbot()">×</button>
        </div>
        
        <div class="chatbot-messages" id="messages">
            <div class="message bot">
                <div class="message-content">${config.welcomeMessage}</div>
            </div>
        </div>
        
        <div class="chatbot-input">
            <input type="text" id="messageInput" placeholder="Type your message..." onkeypress="handleKeyPress(event)">
            <button class="chatbot-send" onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        // Chatbot Configuration
        const chatbotConfig = ${JSON.stringify(config, null, 2)};
        
        // Knowledge Base
        const knowledgeBase = ${JSON.stringify(config.knowledgeBase, null, 2)};
        
        // Chatbot Functions
        function toggleChatbot() {
            const chatbot = document.getElementById('chatbot');
            chatbot.style.display = chatbot.style.display === 'none' ? 'block' : 'none';
        }
        
        function addMessage(content, isUser = false) {
            const messagesContainer = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${isUser ? 'user' : 'bot'}\`;
            messageDiv.innerHTML = \`<div class="message-content">\${content}</div>\`;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function findBestResponse(userMessage) {
            const lowerMessage = userMessage.toLowerCase();
            
            // Look for exact or partial matches in knowledge base
            for (const item of knowledgeBase) {
                const lowerQuestion = item.question.toLowerCase();
                if (lowerMessage.includes(lowerQuestion) || lowerQuestion.includes(lowerMessage)) {
                    return item.answer;
                }
            }
            
            // Fallback response
            return chatbotConfig.fallbackMessage;
        }
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Add user message
            addMessage(message, true);
            input.value = '';
            
            // Simulate typing delay
            setTimeout(() => {
                const response = findBestResponse(message);
                addMessage(response);
            }, 500 + Math.random() * 1000);
        }
        
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }
        
        // Auto-show chatbot after 3 seconds (optional)
        setTimeout(() => {
            // Uncomment to auto-show: toggleChatbot();
        }, 3000);
    </script>
</body>
</html>`
}

function generateSlackBot(config: ChatbotConfig): string {
  return `// Slack Bot Implementation for ${config.name}
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Knowledge Base
const knowledgeBase = ${JSON.stringify(config.knowledgeBase, null, 2)};

// Configuration
const botConfig = ${JSON.stringify(config, null, 2)};

// Message handler
app.message(async ({ message, say }) => {
  const userMessage = message.text.toLowerCase();
  
  // Find best response from knowledge base
  let response = botConfig.fallbackMessage;
  
  for (const item of knowledgeBase) {
    const lowerQuestion = item.question.toLowerCase();
    if (userMessage.includes(lowerQuestion) || lowerQuestion.includes(userMessage)) {
      response = item.answer;
      break;
    }
  }
  
  await say(response);
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ ${config.name} Slack bot is running!');
})();

// Installation Instructions:
// 1. npm install @slack/bolt
// 2. Set environment variables: SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET
// 3. Run: node slack-bot.js`
}

function generateDiscordBot(config: ChatbotConfig): string {
  return `// Discord Bot Implementation for ${config.name}
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Knowledge Base
const knowledgeBase = ${JSON.stringify(config.knowledgeBase, null, 2)};

// Configuration
const botConfig = ${JSON.stringify(config, null, 2)};

client.on('ready', () => {
  console.log(\`✅ \${client.user.tag} is online!\`);
});

client.on('messageCreate', (message) => {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Only respond to mentions or DMs
  if (!message.mentions.has(client.user) && message.channel.type !== 'DM') return;
  
  const userMessage = message.content.toLowerCase();
  
  // Find best response from knowledge base
  let response = botConfig.fallbackMessage;
  
  for (const item of knowledgeBase) {
    const lowerQuestion = item.question.toLowerCase();
    if (userMessage.includes(lowerQuestion) || lowerQuestion.includes(userMessage)) {
      response = item.answer;
      break;
    }
  }
  
  message.reply(response);
});

client.login(process.env.DISCORD_TOKEN);

// Installation Instructions:
// 1. npm install discord.js
// 2. Set environment variable: DISCORD_TOKEN
// 3. Run: node discord-bot.js`
}

function generateTelegramBot(config: ChatbotConfig): string {
  return `// Telegram Bot Implementation for ${config.name}
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Knowledge Base
const knowledgeBase = ${JSON.stringify(config.knowledgeBase, null, 2)};

// Configuration
const botConfig = ${JSON.stringify(config, null, 2)};

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, botConfig.welcomeMessage);
});

// Message handler
bot.on('message', (msg) => {
  // Skip commands
  if (msg.text && msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const userMessage = msg.text.toLowerCase();
  
  // Find best response from knowledge base
  let response = botConfig.fallbackMessage;
  
  for (const item of knowledgeBase) {
    const lowerQuestion = item.question.toLowerCase();
    if (userMessage.includes(lowerQuestion) || lowerQuestion.includes(userMessage)) {
      response = item.answer;
      break;
    }
  }
  
  bot.sendMessage(chatId, response);
});

console.log('🚀 ${config.name} Telegram bot is running!');

// Installation Instructions:
// 1. npm install node-telegram-bot-api
// 2. Set environment variable: TELEGRAM_TOKEN
// 3. Run: node telegram-bot.js`
}

function generateAPIBot(config: ChatbotConfig): string {
  return `// API Bot Implementation for ${config.name}
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Knowledge Base
const knowledgeBase = ${JSON.stringify(config.knowledgeBase, null, 2)};

// Configuration
const botConfig = ${JSON.stringify(config, null, 2)};

// Find best response function
function findBestResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const item of knowledgeBase) {
    const lowerQuestion = item.question.toLowerCase();
    if (lowerMessage.includes(lowerQuestion) || lowerQuestion.includes(userMessage)) {
      return {
        response: item.answer,
        category: item.category || 'general',
        confidence: 0.8
      };
    }
  }
  
  return {
    response: botConfig.fallbackMessage,
    category: 'fallback',
    confidence: 0.1
  };
}

// Chat endpoint
app.post('/api/chat', (req, res) => {
  const { message, sessionId } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  const result = findBestResponse(message);
  
  res.json({
    success: true,
    botResponse: result.response,
    category: result.category,
    confidence: result.confidence,
    sessionId: sessionId || 'default',
    timestamp: new Date().toISOString()
  });
});

// Bot info endpoint
app.get('/api/bot-info', (req, res) => {
  res.json({
    name: botConfig.name,
    description: botConfig.description,
    personality: botConfig.personality,
    domain: botConfig.domain,
    language: botConfig.language,
    knowledgeBaseSize: knowledgeBase.length
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', bot: botConfig.name });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`🤖 \${botConfig.name} API bot running on port \${PORT}\`);
});

// Installation Instructions:
// 1. npm install express cors
// 2. Run: node api-bot.js
// 3. Test: POST /api/chat with { "message": "hello" }`
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    await ensureOutputDir()
    await ensureChatbotsDir()
    
    const body: BuildRequest = await request.json()
    const { 
      config, 
      outputFormat = 'json',
      includeTraining = false,
      generateCode = true,
      platform = 'web'
    } = body
    
    if (!config || !config.name) {
      return NextResponse.json<BuildResponse>({
        success: false,
        error: 'Chatbot configuration with name is required'
      }, { status: 400 })
    }
    
    if (!config.knowledgeBase || config.knowledgeBase.length === 0) {
      return NextResponse.json<BuildResponse>({
        success: false,
        error: 'Knowledge base with at least one Q&A pair is required'
      }, { status: 400 })
    }
    
    // Generate unique chatbot ID
    const chatbotId = config.id || uuidv4()
    config.id = chatbotId
    
    // Validate configuration
    const requiredFields = ['name', 'description', 'personality', 'welcomeMessage', 'fallbackMessage']
    for (const field of requiredFields) {
      if (!config[field as keyof ChatbotConfig]) {
        return NextResponse.json<BuildResponse>({
          success: false,
          error: `Required field '${field}' is missing from configuration`
        }, { status: 400 })
      }
    }
    
    // Set defaults
    config.domain = config.domain || 'general'
    config.language = config.language || 'English'
    config.responseStyle = config.responseStyle || 'balanced'
    config.integrations = config.integrations || {}
    config.appearance = config.appearance || {
      primaryColor: '#007bff',
      position: 'bottom-right',
      size: 'medium'
    }
    
    let generatedContent = ''
    let fileExtension = 'json'
    let mimeType = 'application/json'
    
    // Generate content based on output format
    if (generateCode && platform !== 'json') {
      generatedContent = generateChatbotCode(config, platform)
      fileExtension = platform === 'web' ? 'html' : 'js'
      mimeType = platform === 'web' ? 'text/html' : 'text/javascript'
    } else {
      // JSON configuration
      generatedContent = JSON.stringify(config, null, 2)
    }
    
    // Generate output filename
    const outputFileId = uuidv4()
    const outputFileName = `${outputFileId}_${config.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-chatbot.${fileExtension}`
    const outputPath = FileService.generateOutputPath(outputFileId, outputFileName)
    
    // Save chatbot configuration and code
    await writeFile(outputPath, generatedContent, 'utf-8')
    
    // Also save chatbot config in chatbots directory for future reference
    const configPath = join(CHATBOTS_DIR, `${chatbotId}.json`)
    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
    
    const processingTime = Date.now() - startTime
    
    // Generate deployment instructions
    const deploymentInstructions = generateDeploymentInstructions(platform, config)
    
    // Generate webhook URL for API integration
    const webhookUrl = platform === 'api' ? `https://your-domain.com/api/chatbots/${chatbotId}/webhook` : undefined
    
    // Log chatbot creation
    const chatbotMetadata = {
      chatbotId,
      outputFileId,
      fileName: outputFileName,
      filePath: outputPath,
      fileSize: Buffer.from(generatedContent, 'utf-8').length,
      mimeType,
      platform,
      outputFormat,
      knowledgeBaseSize: config.knowledgeBase.length,
      personality: config.personality,
      domain: config.domain,
      language: config.language,
      processingTime,
      createdAt: new Date().toISOString()
    }
    
    console.log('AI chatbot creation completed:', chatbotMetadata)
    
    return NextResponse.json<BuildResponse>({
      success: true,
      chatbotId,
      outputFileId,
      outputFileName,
      downloadUrl: `/api/files/download?fileId=${outputFileId}`,
      config,
      generatedCode: generateCode ? generatedContent : undefined,
      webhookUrl,
      deploymentInstructions,
      processingTime
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('AI chatbot building error:', error)
    
    return NextResponse.json<BuildResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error during chatbot creation',
      processingTime
    }, { status: 500 })
  }
}

function generateDeploymentInstructions(platform: string, config: ChatbotConfig): string {
  const instructions = {
    web: \`## Web Deployment Instructions

1. **Download** the generated HTML file
2. **Upload** to your web server or hosting platform
3. **Customize** colors and styling in the CSS section
4. **Test** the chatbot functionality
5. **Optional**: Integrate with analytics or CRM systems

The chatbot will appear as a floating widget on your website.\`,

    slack: \`## Slack Bot Deployment Instructions

1. **Create** a Slack app at https://api.slack.com/apps
2. **Install** dependencies: \`npm install @slack/bolt\`
3. **Set** environment variables:
   - SLACK_BOT_TOKEN=your_bot_token
   - SLACK_SIGNING_SECRET=your_signing_secret
4. **Run** the bot: \`node slack-bot.js\`
5. **Invite** the bot to your Slack channels\`,

    discord: \`## Discord Bot Deployment Instructions

1. **Create** a Discord application at https://discord.com/developers/applications
2. **Install** dependencies: \`npm install discord.js\`
3. **Set** environment variable: DISCORD_TOKEN=your_bot_token
4. **Run** the bot: \`node discord-bot.js\`
5. **Invite** the bot to your Discord server\`,

    telegram: \`## Telegram Bot Deployment Instructions

1. **Create** a bot with @BotFather on Telegram
2. **Install** dependencies: \`npm install node-telegram-bot-api\`
3. **Set** environment variable: TELEGRAM_TOKEN=your_bot_token
4. **Run** the bot: \`node telegram-bot.js\`
5. **Start** chatting with your bot\`,

    api: \`## API Bot Deployment Instructions

1. **Install** dependencies: \`npm install express cors\`
2. **Deploy** to your server or cloud platform
3. **Set** PORT environment variable (optional)
4. **Test** endpoints:
   - POST /api/chat - Send messages
   - GET /api/bot-info - Get bot information
   - GET /health - Health check
5. **Integrate** with your applications\`
  }
  
  return instructions[platform as keyof typeof instructions] || instructions.web
}

// GET endpoint for chatbot capabilities and templates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const chatbotId = searchParams.get('chatbotId')
  
  if (chatbotId) {
    // Get specific chatbot configuration
    try {
      const configPath = join(CHATBOTS_DIR, `${chatbotId}.json`)
      const configContent = await readFile(configPath, 'utf-8')
      const config = JSON.parse(configContent)
      
      return NextResponse.json({
        success: true,
        data: config
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Chatbot not found'
      }, { status: 404 })
    }
  }
  
  // Return general capabilities and templates
  return NextResponse.json({
    success: true,
    capabilities: {
      supportedPlatforms: ['web', 'slack', 'discord', 'telegram', 'api'],
      supportedPersonalities: ['professional', 'friendly', 'casual', 'formal', 'helpful', 'expert'],
      supportedLanguages: ['English'], // Expand as needed
      responseStyles: ['concise', 'detailed', 'balanced'],
      outputFormats: ['json', 'html', 'javascript', 'webhook'],
      maxKnowledgeBase: 1000,
      features: [
        'Custom personality configuration',
        'Multi-platform deployment',
        'Knowledge base management',
        'Appearance customization',
        'Integration ready',
        'Export capabilities'
      ]
    },
    templates: {
      customer_support: {
        name: 'Customer Support Bot',
        personality: 'helpful',
        domain: 'customer service',
        welcomeMessage: 'Hello! I\'m here to help you with any questions or issues you might have.',
        fallbackMessage: 'I\'m sorry, I don\'t have information about that. Please contact our support team for further assistance.'
      },
      sales_assistant: {
        name: 'Sales Assistant',
        personality: 'professional',
        domain: 'sales',
        welcomeMessage: 'Hi! I\'m here to help you learn more about our products and services.',
        fallbackMessage: 'Let me connect you with a sales representative who can better assist you with that question.'
      },
      faq_bot: {
        name: 'FAQ Bot',
        personality: 'friendly',
        domain: 'general',
        welcomeMessage: 'Welcome! I can answer frequently asked questions about our company and services.',
        fallbackMessage: 'I don\'t have that information in my knowledge base. Please check our FAQ page or contact us directly.'
      }
    }
  })
}`
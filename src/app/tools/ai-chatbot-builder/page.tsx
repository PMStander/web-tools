"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  MessageSquare,
  Sparkles,
  Download,
  Upload,
  CheckCircle,
  Settings,
  Bot,
  Zap,
  Brain,
  Send
} from "lucide-react"

export default function AIChatbotBuilderPage() {
  const [botName, setBotName] = useState("")
  const [botPersonality, setBotPersonality] = useState("helpful")
  const [knowledgeBase, setKnowledgeBase] = useState("")
  const [chatbotType, setChatbotType] = useState("customer-service")
  const [isBuilding, setIsBuilding] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", message: "Hello! I'm your AI assistant. How can I help you today?" }
  ])
  const [currentMessage, setCurrentMessage] = useState("")

  const handleBuildChatbot = async () => {
    if (!botName.trim()) return
    
    setIsBuilding(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsBuilding(false)
  }

  const sendMessage = () => {
    if (!currentMessage.trim()) return
    
    setChatMessages(prev => [
      ...prev,
      { role: "user", message: currentMessage },
      { role: "bot", message: `Thank you for your message: "${currentMessage}". I'm a demo chatbot built with the AI Chatbot Builder. I can be customized to handle various types of conversations based on your specific needs.` }
    ])
    setCurrentMessage("")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Bot className="mr-2 h-3 w-3" />
                  AI Chatbot Builder
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Build Intelligent
                <span className="block text-purple-600">AI Chatbots</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Create sophisticated chatbots with natural language processing. 
                No coding required - just configure, train, and deploy your AI assistant.
              </p>
            </div>
          </div>
        </section>

        {/* Main Tool Interface */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configuration Panel */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Chatbot Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="botName">Chatbot Name</Label>
                      <Input
                        id="botName"
                        placeholder="e.g., Customer Support Assistant"
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Chatbot Type</Label>
                      <RadioGroup value={chatbotType} onValueChange={setChatbotType}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="customer-service" id="customer-service" />
                          <Label htmlFor="customer-service" className="font-medium">Customer Service</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sales" id="sales" />
                          <Label htmlFor="sales" className="font-medium">Sales Assistant</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="support" id="support" />
                          <Label htmlFor="support" className="font-medium">Technical Support</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="general" id="general" />
                          <Label htmlFor="general" className="font-medium">General Assistant</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Personality</Label>
                      <RadioGroup value={botPersonality} onValueChange={setBotPersonality}>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="helpful" id="helpful" />
                            <Label htmlFor="helpful" className="text-sm">Helpful</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="friendly" id="friendly" />
                            <Label htmlFor="friendly" className="text-sm">Friendly</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="professional" id="professional" />
                            <Label htmlFor="professional" className="text-sm">Professional</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="casual" id="casual" />
                            <Label htmlFor="casual" className="text-sm">Casual</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="knowledgeBase">Knowledge Base</Label>
                      <Textarea
                        id="knowledgeBase"
                        placeholder="Enter information your chatbot should know about your business, products, or services..."
                        value={knowledgeBase}
                        onChange={(e) => setKnowledgeBase(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">AI Features</h4>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Natural language understanding</li>
                        <li>• Context-aware responses</li>
                        <li>• Multi-language support</li>
                        <li>• Learning from conversations</li>
                        <li>• Integration with external APIs</li>
                      </ul>
                    </div>

                    <Button 
                      onClick={handleBuildChatbot} 
                      className="w-full" 
                      size="lg"
                      disabled={isBuilding || !botName.trim()}
                    >
                      {isBuilding ? (
                        <>
                          <Brain className="mr-2 h-5 w-5 animate-pulse" />
                          Building Chatbot...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Build Chatbot
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Preview */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Chatbot Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-80 border rounded-lg p-4 overflow-y-auto bg-gray-50">
                      <div className="space-y-3">
                        {chatMessages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                msg.role === "user"
                                  ? "bg-blue-500 text-white"
                                  : "bg-white border"
                              }`}
                            >
                              {msg.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message to test your chatbot..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <Button onClick={sendMessage} size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Natural language processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Custom personality settings</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Knowledge base integration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Multi-platform deployment</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Customer support</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Lead generation</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• FAQ automation</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Website assistance</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Intelligent Chatbot Creation
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Build sophisticated AI assistants without any coding knowledge.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">AI-Powered</h3>
                <p className="text-gray-600">
                  Advanced natural language processing for human-like conversations.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">No-Code Builder</h3>
                <p className="text-gray-600">
                  Create sophisticated chatbots without any programming knowledge.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Multi-Platform</h3>
                <p className="text-gray-600">
                  Deploy your chatbot across websites, apps, and messaging platforms.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

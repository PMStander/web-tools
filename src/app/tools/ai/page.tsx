"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { ToolCard } from "@/components/tools/ToolCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sparkles, 
  Brain, 
  FileText, 
  MessageSquare, 
  Search,
  Wand2,
  Zap,
  Shield,
  Star,
  Users,
  Upload,
  Download,
  Bot,
  Lightbulb,
  Target
} from "lucide-react"

const aiTools = [
  {
    title: "AI Document Analyzer",
    description: "Intelligent document analysis with AI-powered insights and summaries",
    icon: "/file.svg",
    href: "/tools/ai-document-analyzer",
    category: "AI Tools",
    isNew: true,
    isFeatured: true,
    rating: 4.9,
    usageCount: 15420,
    estimatedTime: "30s",
    quickActions: [
      { label: "Quick Analysis", action: () => console.log("Quick analysis") },
      { label: "Deep Scan", action: () => console.log("Deep scan") }
    ]
  },
  {
    title: "AI Text Generator",
    description: "Generate high-quality content with advanced AI language models",
    icon: "/file.svg",
    href: "/tools/ai-text-generator",
    category: "AI Tools",
    isPopular: true,
    rating: 4.8,
    usageCount: 28750,
    estimatedTime: "15s",
    quickActions: [
      { label: "Blog Post", action: () => console.log("Generate blog post") },
      { label: "Email", action: () => console.log("Generate email") }
    ]
  },
  {
    title: "AI Image Enhancer",
    description: "Enhance and upscale images using cutting-edge AI technology",
    icon: "/file.svg",
    href: "/tools/ai-image-enhancer",
    category: "AI Tools",
    rating: 4.7,
    usageCount: 19340,
    estimatedTime: "45s",
    quickActions: [
      { label: "Upscale 2x", action: () => console.log("Upscale 2x") },
      { label: "Enhance Quality", action: () => console.log("Enhance quality") }
    ]
  },
  {
    title: "AI Chatbot Builder",
    description: "Create intelligent chatbots with natural language processing",
    icon: "/file.svg",
    href: "/tools/ai-chatbot-builder",
    category: "AI Tools",
    isNew: true,
    rating: 4.6,
    usageCount: 8920,
    estimatedTime: "2m",
    quickActions: [
      { label: "Quick Setup", action: () => console.log("Quick setup") },
      { label: "Custom Bot", action: () => console.log("Custom bot") }
    ]
  }
]

const categories = [
  { name: "All Tools", icon: <Sparkles className="h-4 w-4" />, count: aiTools.length },
  { name: "Document AI", icon: <FileText className="h-4 w-4" />, count: 1 },
  { name: "Content Generation", icon: <Wand2 className="h-4 w-4" />, count: 1 },
  { name: "Image AI", icon: <Target className="h-4 w-4" />, count: 1 },
  { name: "Conversational AI", icon: <MessageSquare className="h-4 w-4" />, count: 1 }
]

const features = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: "Advanced AI Models",
    description: "Powered by state-of-the-art machine learning algorithms"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Real-time Processing",
    description: "Get instant results with our optimized AI infrastructure"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Privacy First",
    description: "Your data is processed securely and never stored permanently"
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: "Smart Insights",
    description: "Discover patterns and insights you never knew existed"
  }
]

export default function AIToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Tools")
  
  const filteredTools = selectedCategory === "All Tools" 
    ? aiTools 
    : aiTools.filter(tool => {
        switch (selectedCategory) {
          case "Document AI":
            return tool.title.includes("Document")
          case "Content Generation":
            return tool.title.includes("Text Generator")
          case "Image AI":
            return tool.title.includes("Image")
          case "Conversational AI":
            return tool.title.includes("Chatbot")
          default:
            return true
        }
      })

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Sparkles className="mr-2 h-3 w-3" />
                  AI-Powered Tools
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Intelligent AI
                <span className="block text-purple-600">Tool Suite</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Harness the power of artificial intelligence to automate tasks, generate content, 
                and unlock insights from your data with cutting-edge AI tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Bot className="mr-2 h-5 w-5" />
                  Try AI Tools
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="w-full py-8 border-b">
          <div className="container px-4 md:px-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.name)}
                  className="flex items-center gap-2"
                >
                  {category.icon}
                  {category.name}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                {selectedCategory === "All Tools" ? "All AI Tools" : selectedCategory}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Revolutionary AI tools that transform how you work with documents, images, and content.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => (
                <ToolCard
                  key={tool.title}
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  href={tool.href}
                  category={tool.category}
                  isNew={tool.isNew}
                  isPopular={tool.isPopular}
                  isFeatured={tool.isFeatured}
                  rating={tool.rating}
                  usageCount={tool.usageCount}
                  estimatedTime={tool.estimatedTime}
                  quickActions={tool.quickActions}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Why Choose Our AI Tools?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the future of productivity with our advanced AI-powered solutions.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  CheckCircle,
  Settings,
  Wand2,
  RefreshCw
} from "lucide-react"

export default function AITextGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [contentType, setContentType] = useState("article")
  const [tone, setTone] = useState("professional")
  const [length, setLength] = useState("medium")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedText, setGeneratedText] = useState("")

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Simulate generated content
    setGeneratedText(`# ${contentType === "article" ? "Article" : contentType === "blog" ? "Blog Post" : "Marketing Copy"}

Based on your prompt: "${prompt}"

This is a sample generated text that demonstrates the AI text generation capabilities. The content would be tailored to your specific requirements including the ${tone} tone and ${length} length you specified.

## Key Points

- High-quality content generation
- Customizable tone and style
- Multiple content types supported
- Professional writing assistance

The AI would generate comprehensive, well-structured content that matches your exact specifications and requirements.`)
    
    setIsGenerating(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText)
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
                  <Sparkles className="mr-2 h-3 w-3" />
                  AI Text Generator
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Generate High-Quality
                <span className="block text-purple-600">Content with AI</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Create compelling articles, blog posts, marketing copy, and more with advanced AI. 
                Customize tone, style, and length to match your exact needs.
              </p>
            </div>
          </div>
        </section>

        {/* Main Tool Interface */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Input and Settings */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5" />
                      Content Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="prompt">Content Prompt</Label>
                      <Textarea
                        id="prompt"
                        placeholder="Describe what you want to write about... (e.g., 'Write an article about sustainable energy solutions for small businesses')"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Content Type</Label>
                        <RadioGroup value={contentType} onValueChange={setContentType}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="article" id="article" />
                            <Label htmlFor="article" className="text-sm">Article</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="blog" id="blog" />
                            <Label htmlFor="blog" className="text-sm">Blog Post</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="marketing" id="marketing" />
                            <Label htmlFor="marketing" className="text-sm">Marketing Copy</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="social" id="social" />
                            <Label htmlFor="social" className="text-sm">Social Media</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Tone</Label>
                        <RadioGroup value={tone} onValueChange={setTone}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="professional" id="professional" />
                            <Label htmlFor="professional" className="text-sm">Professional</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="casual" id="casual" />
                            <Label htmlFor="casual" className="text-sm">Casual</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="friendly" id="friendly" />
                            <Label htmlFor="friendly" className="text-sm">Friendly</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="formal" id="formal" />
                            <Label htmlFor="formal" className="text-sm">Formal</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Length</Label>
                        <RadioGroup value={length} onValueChange={setLength}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="short" id="short" />
                            <Label htmlFor="short" className="text-sm">Short</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium" className="text-sm">Medium</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="long" id="long" />
                            <Label htmlFor="long" className="text-sm">Long</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <Button 
                      onClick={handleGenerate} 
                      className="w-full" 
                      size="lg"
                      disabled={isGenerating || !prompt.trim()}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                          Generating Content...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generate Content
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {generatedText && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Generated Content
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={copyToClipboard}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                          {generatedText}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Info Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Content Types</h4>
                      <p className="text-sm text-gray-600">
                        Articles, blogs, marketing copy, social media posts
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Tone Control</h4>
                      <p className="text-sm text-gray-600">
                        Professional, casual, friendly, or formal writing styles
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Length Options</h4>
                      <p className="text-sm text-gray-600">
                        Short snippets to long-form content
                      </p>
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
                      <span>Advanced AI models</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Customizable tone & style</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Multiple content types</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Export & copy options</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Content marketing</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Blog writing</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Social media content</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Business communications</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

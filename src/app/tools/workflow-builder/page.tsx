"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Workflow, 
  Plus, 
  Play, 
  Settings, 
  FileText, 
  Image, 
  Video,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle,
  Sparkles
} from "lucide-react"

const workflowSteps = [
  {
    id: 1,
    title: "Upload Files",
    description: "Select multiple files to process",
    icon: <Plus className="h-5 w-5" />,
    type: "input"
  },
  {
    id: 2,
    title: "Convert to PDF",
    description: "Convert all files to PDF format",
    icon: <FileText className="h-5 w-5" />,
    type: "process"
  },
  {
    id: 3,
    title: "Merge PDFs",
    description: "Combine all PDFs into one document",
    icon: <Workflow className="h-5 w-5" />,
    type: "process"
  },
  {
    id: 4,
    title: "Download Result",
    description: "Get your processed file",
    icon: <CheckCircle className="h-5 w-5" />,
    type: "output"
  }
]

const templates = [
  {
    name: "Document Processing",
    description: "Convert, merge, and optimize documents",
    steps: 4,
    category: "PDF",
    popular: true
  },
  {
    name: "Image Batch Convert",
    description: "Convert multiple images to different formats",
    steps: 3,
    category: "Image",
    popular: false
  },
  {
    name: "Video Compression",
    description: "Compress multiple videos for web",
    steps: 3,
    category: "Video",
    popular: true
  },
  {
    name: "AI Content Analysis",
    description: "Analyze documents with AI insights",
    steps: 5,
    category: "AI",
    popular: false
  }
]

export default function WorkflowBuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)

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
                  <Workflow className="mr-2 h-3 w-3" />
                  Automation Platform
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Workflow
                <span className="block text-purple-600">Builder</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Create automated file processing workflows without coding. 
                Chain multiple tools together and process files in bulk with intelligent automation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => setIsBuilding(true)}>
                  <Plus className="mr-2 h-5 w-5" />
                  Create Workflow
                </Button>
                <Button variant="outline" size="lg">
                  <Play className="mr-2 h-5 w-5" />
                  View Templates
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Builder Interface */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Builder */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Visual Workflow Builder</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                    <Button size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Run Workflow
                    </Button>
                  </div>
                </div>

                {/* Workflow Canvas */}
                <Card className="min-h-[500px]">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {workflowSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            step.type === 'input' ? 'bg-blue-100 text-blue-600' :
                            step.type === 'process' ? 'bg-purple-100 text-purple-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <Card className="border-2 border-dashed border-gray-200 hover:border-primary transition-colors cursor-pointer">
                              <CardContent className="p-4">
                                <h3 className="font-semibold mb-1">{step.title}</h3>
                                <p className="text-sm text-gray-600">{step.description}</p>
                              </CardContent>
                            </Card>
                          </div>
                          {index < workflowSteps.length - 1 && (
                            <ArrowRight className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      ))}
                      
                      {/* Add Step Button */}
                      <div className="flex justify-center">
                        <Button variant="outline" className="border-dashed">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Step
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Workflow Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">4</div>
                      <div className="text-sm text-gray-600">Steps</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">~2min</div>
                      <div className="text-sm text-gray-600">Est. Time</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">Auto</div>
                      <div className="text-sm text-gray-600">Mode</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Tool Palette */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-1">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs">PDF Tools</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-1">
                        <Image className="h-4 w-4" />
                        <span className="text-xs">Image Tools</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-1">
                        <Video className="h-4 w-4" />
                        <span className="text-xs">Video Tools</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col gap-1">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs">AI Tools</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {templates.map((template, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate === template.name
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTemplate(template.name)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          {template.popular && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{template.steps} steps</span>
                          <span>•</span>
                          <span>{template.category}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Play className="mr-2 h-4 w-4" />
                      Test Workflow
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Clock className="mr-2 h-4 w-4" />
                      Schedule Run
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Zap className="mr-2 h-4 w-4" />
                      Auto-optimize
                    </Button>
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
                Automation Features
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Build powerful workflows that save time and eliminate repetitive tasks.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Workflow className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Visual Builder</h3>
                <p className="text-gray-600">
                  Drag and drop tools to create complex workflows without any coding required.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Automation</h3>
                <p className="text-gray-600">
                  AI-powered optimization suggests the best workflow configuration for your needs.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Scheduled Runs</h3>
                <p className="text-gray-600">
                  Set up workflows to run automatically on a schedule or trigger them with events.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

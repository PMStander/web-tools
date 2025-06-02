"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { ToolCard } from "@/components/tools/ToolCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Image,
  Crop,
  Archive,
  Palette,
  Scissors,
  Sparkles,
  Upload,
  Download,
  Zap,
  Shield,
  Star,
  Users,
  ArrowRight,
  Layers,
  Maximize,
  FileImage
} from "lucide-react"

const imageTools = [
  {
    title: "Image Converter",
    description: "Convert images between formats (JPEG, PNG, WebP, AVIF) with quality control",
    icon: "/window.svg",
    href: "/tools/image-converter",
    category: "Image Tools",
    isPopular: true,
    rating: 4.7,
    usageCount: 32150,
    estimatedTime: "10s",
    quickActions: [
      { label: "To WebP", action: () => console.log("To WebP") },
      { label: "To PNG", action: () => console.log("To PNG") }
    ]
  },
  {
    title: "Image Resize",
    description: "Resize images with precision control over dimensions and aspect ratio",
    icon: "/window.svg",
    href: "/tools/image/resize",
    category: "Image Tools",
    rating: 4.6,
    usageCount: 28940,
    estimatedTime: "8s",
    quickActions: [
      { label: "Quick Resize", action: () => console.log("Quick resize") },
      { label: "Custom", action: () => console.log("Custom resize") }
    ]
  },
  {
    title: "Image Compress",
    description: "Reduce image file size while maintaining visual quality with smart compression",
    icon: "/window.svg",
    href: "/tools/image/compress",
    category: "Image Tools",
    rating: 4.8,
    usageCount: 45230,
    estimatedTime: "12s",
    quickActions: [
      { label: "Auto Compress", action: () => console.log("Auto compress") },
      { label: "Custom", action: () => console.log("Custom compress") }
    ]
  },
  {
    title: "Add Watermark",
    description: "Add text or image watermarks to protect your images with customizable positioning",
    icon: "/window.svg",
    href: "/tools/image/watermark",
    category: "Image Tools",
    rating: 4.5,
    usageCount: 19850,
    estimatedTime: "15s",
    quickActions: [
      { label: "Text Watermark", action: () => console.log("Text watermark") },
      { label: "Image Watermark", action: () => console.log("Image watermark") }
    ]
  },
  {
    title: "Background Remover",
    description: "Remove backgrounds from images automatically using AI-powered detection",
    icon: "/window.svg",
    href: "/tools/image/background-remove",
    category: "Image Tools",
    isNew: true,
    aiRecommended: true,
    rating: 4.9,
    usageCount: 15420,
    estimatedTime: "20s",
    quickActions: [
      { label: "Auto Remove", action: () => console.log("Auto remove") },
      { label: "Manual", action: () => console.log("Manual remove") }
    ]
  },
  {
    title: "Image Enhancer",
    description: "Enhance image quality with AI-powered upscaling and noise reduction",
    icon: "/window.svg",
    href: "/tools/image/enhance",
    category: "Image Tools",
    isNew: true,
    aiRecommended: true,
    rating: 4.8,
    usageCount: 12340,
    estimatedTime: "30s",
    quickActions: [
      { label: "Auto Enhance", action: () => console.log("Auto enhance") },
      { label: "Upscale 2x", action: () => console.log("Upscale 2x") }
    ]
  }
]

const categories = [
  { name: "All Tools", icon: <Image className="h-4 w-4" />, count: imageTools.length },
  { name: "Convert", icon: <FileImage className="h-4 w-4" />, count: 1 },
  { name: "Resize & Crop", icon: <Crop className="h-4 w-4" />, count: 1 },
  { name: "Optimize", icon: <Archive className="h-4 w-4" />, count: 1 },
  { name: "Effects", icon: <Palette className="h-4 w-4" />, count: 2 },
  { name: "AI Tools", icon: <Sparkles className="h-4 w-4" />, count: 2 }
]

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description: "Process images in seconds with GPU-accelerated algorithms"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Privacy Protected",
    description: "Images are processed securely and deleted automatically"
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "AI-Powered",
    description: "Advanced AI for background removal and image enhancement"
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Batch Processing",
    description: "Process multiple images simultaneously for efficiency"
  }
]

const supportedFormats = [
  { name: "JPEG", description: "Universal compatibility" },
  { name: "PNG", description: "Transparency support" },
  { name: "WebP", description: "Modern web format" },
  { name: "AVIF", description: "Next-gen compression" },
  { name: "GIF", description: "Animation support" },
  { name: "TIFF", description: "Professional quality" }
]

export default function ImageToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Tools")
  
  const filteredTools = selectedCategory === "All Tools" 
    ? imageTools 
    : imageTools.filter(tool => {
        switch (selectedCategory) {
          case "Convert":
            return tool.title.includes("Converter")
          case "Resize & Crop":
            return tool.title.includes("Resize")
          case "Optimize":
            return tool.title.includes("Compress")
          case "Effects":
            return tool.title.includes("Watermark") || tool.title.includes("Background")
          case "AI Tools":
            return tool.aiRecommended
          default:
            return true
        }
      })

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Image className="mr-2 h-3 w-3" />
                  Professional Image Tools
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Complete Image
                <span className="block text-blue-600">Processing Suite</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Transform, optimize, and enhance your images with professional-grade tools. 
                Convert formats, resize, compress, and apply AI-powered effects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Images
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Try AI Tools
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
                {selectedCategory === "All Tools" ? "All Image Tools" : selectedCategory}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional image processing tools with AI-powered features and lightning-fast performance.
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
                  rating={tool.rating}
                  usageCount={tool.usageCount}
                  estimatedTime={tool.estimatedTime}
                  aiRecommended={tool.aiRecommended}
                  quickActions={tool.quickActions}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Supported Formats */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Supported Formats
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Work with all major image formats, from legacy to cutting-edge.
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              {supportedFormats.map((format, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{format.name}</h3>
                    <p className="text-sm text-gray-600">{format.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Why Choose Our Image Tools?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Built for professionals, designed for everyone. Experience the difference.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Simple, fast, and secure image processing in three easy steps.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold">Upload Your Images</h3>
                <p className="text-gray-600">
                  Drag and drop your images or click to browse. Support for all major formats up to 50MB.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold">Choose Your Tool</h3>
                <p className="text-gray-600">
                  Select the operation and customize settings. Preview changes before processing.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold">Download Results</h3>
                <p className="text-gray-600">
                  Your processed images are ready! Download instantly with perfect quality.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

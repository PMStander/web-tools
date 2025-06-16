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
  FileImage,
  Settings
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
    title: "Image Crop",
    description: "Crop images with custom dimensions, aspect ratios, and smart positioning",
    icon: "/window.svg",
    href: "/tools/image/crop",
    category: "Image Tools",
    isNew: true,
    rating: 4.6,
    usageCount: 8950,
    estimatedTime: "5s",
    quickActions: [
      { label: "Square Crop", action: () => console.log("Square crop") },
      { label: "16:9 Ratio", action: () => console.log("16:9 crop") }
    ]
  },
  {
    title: "Image Rotate",
    description: "Rotate images by any angle with smart background filling",
    icon: "/window.svg",
    href: "/tools/image/rotate",
    category: "Image Tools",
    isNew: true,
    rating: 4.5,
    usageCount: 7230,
    estimatedTime: "5s",
    quickActions: [
      { label: "90° Right", action: () => console.log("Rotate 90") },
      { label: "180°", action: () => console.log("Rotate 180") }
    ]
  },
  {
    title: "Image Flip",
    description: "Flip images horizontally, vertically, or both directions",
    icon: "/window.svg",
    href: "/tools/image/flip",
    category: "Image Tools",
    isNew: true,
    rating: 4.4,
    usageCount: 6180,
    estimatedTime: "3s",
    quickActions: [
      { label: "Horizontal", action: () => console.log("Flip horizontal") },
      { label: "Vertical", action: () => console.log("Flip vertical") }
    ]
  },
  {
    title: "Background Removal",
    description: "Remove or replace image backgrounds with AI-powered precision",
    icon: "/window.svg",
    href: "/tools/image/background-removal",
    category: "Image Tools",
    isNew: true,
    aiRecommended: true,
    rating: 4.8,
    usageCount: 15420,
    estimatedTime: "15s",
    quickActions: [
      { label: "Auto Remove", action: () => console.log("Auto remove bg") },
      { label: "Color Based", action: () => console.log("Color remove") }
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
  },
  {
    title: "Image Blur",
    description: "Apply various blur effects including Gaussian, motion, and selective blur",
    icon: "/window.svg",
    href: "/tools/image/blur",
    category: "Image Tools",
    isNew: true,
    rating: 4.3,
    usageCount: 5670,
    estimatedTime: "8s",
    quickActions: [
      { label: "Gaussian Blur", action: () => console.log("Gaussian blur") },
      { label: "Motion Blur", action: () => console.log("Motion blur") }
    ]
  },
  {
    title: "Brightness & Contrast",
    description: "Adjust brightness, contrast, gamma, and exposure with precision controls",
    icon: "/window.svg",
    href: "/tools/image/brightness-contrast",
    category: "Image Tools",
    isNew: true,
    rating: 4.4,
    usageCount: 8920,
    estimatedTime: "5s",
    quickActions: [
      { label: "Auto Adjust", action: () => console.log("Auto adjust") },
      { label: "High Contrast", action: () => console.log("High contrast") }
    ]
  },
  {
    title: "Color Saturation",
    description: "Adjust saturation, vibrance, hue, and color balance for perfect colors",
    icon: "/window.svg",
    href: "/tools/image/saturation",
    category: "Image Tools",
    isNew: true,
    rating: 4.5,
    usageCount: 7340,
    estimatedTime: "5s",
    quickActions: [
      { label: "Enhance Colors", action: () => console.log("Enhance colors") },
      { label: "Desaturate", action: () => console.log("Desaturate") }
    ]
  },
  {
    title: "Grayscale Converter",
    description: "Convert images to grayscale using multiple algorithms and methods",
    icon: "/window.svg",
    href: "/tools/image/grayscale",
    category: "Image Tools",
    isNew: true,
    rating: 4.2,
    usageCount: 6180,
    estimatedTime: "3s",
    quickActions: [
      { label: "Standard", action: () => console.log("Standard grayscale") },
      { label: "Luminance", action: () => console.log("Luminance grayscale") }
    ]
  },
  {
    title: "Add Border",
    description: "Add solid, gradient, pattern, or shadow borders to your images",
    icon: "/window.svg",
    href: "/tools/image/border",
    category: "Image Tools",
    isNew: true,
    rating: 4.3,
    usageCount: 4920,
    estimatedTime: "7s",
    quickActions: [
      { label: "Solid Border", action: () => console.log("Solid border") },
      { label: "Shadow", action: () => console.log("Shadow border") }
    ]
  },
  {
    title: "Sepia Effect",
    description: "Apply vintage sepia tone effects with adjustable intensity",
    icon: "/window.svg",
    href: "/tools/image/sepia",
    category: "Image Tools",
    isNew: true,
    rating: 4.1,
    usageCount: 3450,
    estimatedTime: "3s",
    quickActions: [
      { label: "Light Sepia", action: () => console.log("Light sepia") },
      { label: "Strong Sepia", action: () => console.log("Strong sepia") }
    ]
  },
  {
    title: "Negative Effect",
    description: "Create negative/inverted color effects for artistic images",
    icon: "/window.svg",
    href: "/tools/image/negative",
    category: "Image Tools",
    isNew: true,
    rating: 4.0,
    usageCount: 2890,
    estimatedTime: "3s",
    quickActions: [
      { label: "Full Negative", action: () => console.log("Full negative") },
      { label: "Preserve Alpha", action: () => console.log("Preserve alpha") }
    ]
  },
  {
    title: "Round Corners",
    description: "Add rounded corners to images with customizable radius and styles",
    icon: "/window.svg",
    href: "/tools/image/round-corners",
    category: "Image Tools",
    isNew: true,
    rating: 4.2,
    usageCount: 4560,
    estimatedTime: "5s",
    quickActions: [
      { label: "Subtle Rounds", action: () => console.log("Subtle rounds") },
      { label: "Circle", action: () => console.log("Circle") }
    ]
  },
  {
    title: "Image Metadata",
    description: "Extract, remove, or modify image metadata and EXIF information",
    icon: "/window.svg",
    href: "/tools/image/metadata",
    category: "Image Tools",
    isNew: true,
    rating: 4.1,
    usageCount: 3780,
    estimatedTime: "2s",
    quickActions: [
      { label: "Extract Info", action: () => console.log("Extract metadata") },
      { label: "Remove All", action: () => console.log("Remove metadata") }
    ]
  },
  {
    title: "Image Collage",
    description: "Create beautiful collages from multiple images with various layouts",
    icon: "/window.svg",
    href: "/tools/image/collage",
    category: "Image Tools",
    isNew: true,
    rating: 4.6,
    usageCount: 9230,
    estimatedTime: "20s",
    quickActions: [
      { label: "Grid Layout", action: () => console.log("Grid collage") },
      { label: "Custom Layout", action: () => console.log("Custom collage") }
    ]
  }
]

const categories = [
  { name: "All Tools", icon: <Image className="h-4 w-4" />, count: imageTools.length },
  { name: "Convert", icon: <FileImage className="h-4 w-4" />, count: 2 },
  { name: "Transform", icon: <Crop className="h-4 w-4" />, count: 5 },
  { name: "Optimize", icon: <Archive className="h-4 w-4" />, count: 1 },
  { name: "Effects", icon: <Palette className="h-4 w-4" />, count: 8 },
  { name: "AI Tools", icon: <Sparkles className="h-4 w-4" />, count: 2 },
  { name: "Utilities", icon: <Settings className="h-4 w-4" />, count: 2 }
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
            return tool.title.includes("Converter") || tool.title.includes("Grayscale Converter")
          case "Transform":
            return tool.title.includes("Resize") || tool.title.includes("Crop") || tool.title.includes("Rotate") || tool.title.includes("Flip") || tool.title.includes("Round Corners")
          case "Optimize":
            return tool.title.includes("Compress")
          case "Effects":
            return tool.title.includes("Watermark") || tool.title.includes("Background") || tool.title.includes("Blur") || tool.title.includes("Brightness") || tool.title.includes("Saturation") || tool.title.includes("Sepia") || tool.title.includes("Negative") || tool.title.includes("Border")
          case "AI Tools":
            return tool.aiRecommended
          case "Utilities":
            return tool.title.includes("Metadata") || tool.title.includes("Collage")
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

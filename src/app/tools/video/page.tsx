"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { ToolCard } from "@/components/tools/ToolCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Video,
  Scissors,
  Archive,
  Download,
  Upload,
  Zap,
  Shield,
  Star,
  Users,
  FileVideo,
  Music,
  Image as ImageIcon
} from "lucide-react"

const videoTools = [
  {
    title: "Video Converter",
    description: "Convert videos between formats (MP4, AVI, MOV, WebM) with quality control",
    icon: "/window.svg",
    href: "/tools/video/convert",
    category: "Video Tools",
    isPopular: true,
    rating: 4.7,
    usageCount: 28940,
    estimatedTime: "2min",
    quickActions: [
      { label: "To MP4", action: () => console.log("To MP4") },
      { label: "To WebM", action: () => console.log("To WebM") }
    ]
  },
  {
    title: "Video Compressor",
    description: "Reduce video file size while maintaining quality with smart compression",
    icon: "/window.svg",
    href: "/tools/video/compress",
    category: "Video Tools",
    rating: 4.6,
    usageCount: 22150,
    estimatedTime: "3min",
    quickActions: [
      { label: "Quick Compress", action: () => console.log("Quick compress") },
      { label: "Custom", action: () => console.log("Custom compress") }
    ]
  },
  {
    title: "Video Trimmer",
    description: "Cut and trim video clips with precision timing and preview",
    icon: "/window.svg",
    href: "/tools/video/trim",
    category: "Video Tools",
    rating: 4.5,
    usageCount: 19850,
    estimatedTime: "1min",
    quickActions: [
      { label: "Quick Trim", action: () => console.log("Quick trim") },
      { label: "Advanced", action: () => console.log("Advanced trim") }
    ]
  },
  {
    title: "Audio Extractor",
    description: "Extract audio tracks from videos in various formats (MP3, WAV, AAC)",
    icon: "/window.svg",
    href: "/tools/video/extract-audio",
    category: "Video Tools",
    rating: 4.8,
    usageCount: 35670,
    estimatedTime: "90s",
    quickActions: [
      { label: "To MP3", action: () => console.log("To MP3") },
      { label: "To WAV", action: () => console.log("To WAV") }
    ]
  },
  {
    title: "Thumbnail Generator",
    description: "Generate video thumbnails and preview images at specific timestamps",
    icon: "/window.svg",
    href: "/tools/video/thumbnail",
    category: "Video Tools",
    rating: 4.4,
    usageCount: 15420,
    estimatedTime: "30s",
    quickActions: [
      { label: "Auto Generate", action: () => console.log("Auto generate") },
      { label: "Custom Time", action: () => console.log("Custom time") }
    ]
  },
  {
    title: "Video Merger",
    description: "Combine multiple video files into a single video with transitions",
    icon: "/window.svg",
    href: "/tools/video/merge",
    category: "Video Tools",
    isNew: true,
    rating: 4.6,
    usageCount: 12340,
    estimatedTime: "4min",
    quickActions: [
      { label: "Simple Merge", action: () => console.log("Simple merge") },
      { label: "With Transitions", action: () => console.log("With transitions") }
    ]
  },
  {
    title: "Video Splitter",
    description: "Split videos into multiple segments with precise timing control",
    icon: "/window.svg",
    href: "/tools/video/split",
    category: "Video Tools",
    isNew: true,
    rating: 4.5,
    usageCount: 9870,
    estimatedTime: "2min",
    quickActions: [
      { label: "Equal Parts", action: () => console.log("Equal parts") },
      { label: "Custom Times", action: () => console.log("Custom times") }
    ]
  },
  {
    title: "Video Watermark",
    description: "Add text or image watermarks to your videos with custom positioning",
    icon: "/window.svg",
    href: "/tools/video/watermark",
    category: "Video Tools",
    isNew: true,
    rating: 4.4,
    usageCount: 8650,
    estimatedTime: "3min",
    quickActions: [
      { label: "Text Watermark", action: () => console.log("Text watermark") },
      { label: "Image Watermark", action: () => console.log("Image watermark") }
    ]
  },
  {
    title: "Video Speed Control",
    description: "Adjust video playback speed from slow motion to fast forward",
    icon: "/window.svg",
    href: "/tools/video/speed",
    category: "Video Tools",
    isNew: true,
    rating: 4.3,
    usageCount: 7420,
    estimatedTime: "2min",
    quickActions: [
      { label: "2x Speed", action: () => console.log("2x speed") },
      { label: "0.5x Speed", action: () => console.log("0.5x speed") }
    ]
  },
  {
    title: "Video Rotator",
    description: "Rotate videos by 90, 180, or 270 degrees to fix orientation",
    icon: "/window.svg",
    href: "/tools/video/rotate",
    category: "Video Tools",
    isNew: true,
    rating: 4.2,
    usageCount: 6340,
    estimatedTime: "90s",
    quickActions: [
      { label: "90° Right", action: () => console.log("90 degrees") },
      { label: "180°", action: () => console.log("180 degrees") }
    ]
  },
  {
    title: "Video Mute",
    description: "Remove or partially mute audio from videos with fade effects",
    icon: "/window.svg",
    href: "/tools/video/mute",
    category: "Video Tools",
    isNew: true,
    rating: 4.1,
    usageCount: 5280,
    estimatedTime: "60s",
    quickActions: [
      { label: "Complete Mute", action: () => console.log("Complete mute") },
      { label: "Partial Mute", action: () => console.log("Partial mute") }
    ]
  },
  {
    title: "Video Optimizer",
    description: "Optimize videos for web, mobile, streaming, and social media platforms",
    icon: "/window.svg",
    href: "/tools/video/optimize",
    category: "Video Tools",
    isNew: true,
    rating: 4.7,
    usageCount: 11560,
    estimatedTime: "3min",
    quickActions: [
      { label: "Web Optimize", action: () => console.log("Web optimize") },
      { label: "Social Media", action: () => console.log("Social media") }
    ]
  }
]

const categories = [
  { name: "All Tools", icon: <Video className="h-4 w-4" />, count: videoTools.length },
  { name: "Convert", icon: <FileVideo className="h-4 w-4" />, count: 3 },
  { name: "Edit", icon: <Scissors className="h-4 w-4" />, count: 6 },
  { name: "Extract", icon: <Music className="h-4 w-4" />, count: 2 },
  { name: "Optimize", icon: <Archive className="h-4 w-4" />, count: 2 }
]

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Fast Processing",
    description: "Hardware-accelerated video processing for maximum speed"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Quality Preserved",
    description: "Advanced algorithms maintain video quality during processing"
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: "Professional Results",
    description: "Industry-standard output suitable for any platform"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Batch Processing",
    description: "Process multiple videos simultaneously for efficiency"
  }
]

const supportedFormats = [
  { name: "MP4", description: "Universal compatibility" },
  { name: "AVI", description: "High quality video" },
  { name: "MOV", description: "Apple QuickTime" },
  { name: "WebM", description: "Web optimized" },
  { name: "MKV", description: "Open standard" },
  { name: "WMV", description: "Windows Media" }
]

export default function VideoToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Tools")
  
  const filteredTools = selectedCategory === "All Tools"
    ? videoTools
    : videoTools.filter(tool => {
        switch (selectedCategory) {
          case "Convert":
            return tool.title.includes("Converter") || tool.title.includes("Extract") || tool.title.includes("Optimizer")
          case "Edit":
            return tool.title.includes("Trimmer") || tool.title.includes("Merger") || tool.title.includes("Splitter") ||
                   tool.title.includes("Watermark") || tool.title.includes("Speed") || tool.title.includes("Rotator") ||
                   tool.title.includes("Mute")
          case "Extract":
            return tool.title.includes("Audio") || tool.title.includes("Thumbnail")
          case "Optimize":
            return tool.title.includes("Compressor") || tool.title.includes("Optimizer")
          default:
            return true
        }
      })

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-purple-50 to-violet-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <Video className="mr-2 h-3 w-3" />
                  Professional Video Tools
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Complete Video
                <span className="block text-purple-600">Processing Suite</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Convert, compress, edit, and optimize your videos with professional-grade tools. 
                Fast processing with quality preservation for all your video needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Video
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Download className="mr-2 h-5 w-5" />
                  View Examples
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
                {selectedCategory === "All Tools" ? "All Video Tools" : selectedCategory}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional video processing tools with hardware acceleration and quality preservation.
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
                Supported Video Formats
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Work with all major video formats, from legacy to modern web standards.
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              {supportedFormats.map((format, index) => (
                <div key={index} className="text-center p-4 bg-white rounded-lg border">
                  <h3 className="font-bold text-lg mb-1">{format.name}</h3>
                  <p className="text-sm text-gray-600">{format.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Why Choose Our Video Tools?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional-grade video processing with speed and quality you can trust.
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

        {/* How It Works */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Simple, fast, and secure video processing in three easy steps.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold">Upload Your Video</h3>
                <p className="text-gray-600">
                  Drag and drop your video files or click to browse. Support for files up to 2GB.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-2xl font-bold">
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
                <h3 className="text-xl font-bold">Download Result</h3>
                <p className="text-gray-600">
                  Your processed video is ready! Download with optimized quality and compression.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

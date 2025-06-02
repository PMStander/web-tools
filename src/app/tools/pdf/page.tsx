"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { ToolCard } from "@/components/tools/ToolCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Scissors,
  Archive,
  Shield,
  FileImage,
  Type,
  Merge,
  Split,
  Lock,
  Unlock,
  Droplets,
  Search,
  Download,
  Upload,
  Zap,
  Star,
  Clock,
  Users
} from "lucide-react"

const pdfTools = [
  {
    title: "PDF Merge",
    description: "Combine multiple PDF files into a single document with drag-and-drop simplicity",
    icon: "/file.svg",
    href: "/tools/pdf-merge",
    category: "PDF Tools",
    isPopular: true,
    rating: 4.8,
    usageCount: 45230,
    estimatedTime: "15s",
    quickActions: [
      { label: "Quick Merge", action: () => console.log("Quick merge") },
      { label: "Advanced", action: () => console.log("Advanced merge") }
    ]
  },
  {
    title: "PDF Split",
    description: "Split large PDF files into smaller documents by pages, ranges, or file size",
    icon: "/file.svg",
    href: "/tools/pdf/split",
    category: "PDF Tools",
    rating: 4.7,
    usageCount: 32150,
    estimatedTime: "10s",
    quickActions: [
      { label: "By Pages", action: () => console.log("Split by pages") },
      { label: "By Range", action: () => console.log("Split by range") }
    ]
  },
  {
    title: "PDF Compress",
    description: "Reduce PDF file size while maintaining quality with intelligent compression",
    icon: "/file.svg",
    href: "/tools/pdf/compress",
    category: "PDF Tools",
    rating: 4.6,
    usageCount: 28940,
    estimatedTime: "20s",
    quickActions: [
      { label: "Quick Compress", action: () => console.log("Quick compress") },
      { label: "Custom", action: () => console.log("Custom compress") }
    ]
  },
  {
    title: "PDF Protect",
    description: "Add password protection, encryption, and watermarks to secure your PDFs",
    icon: "/file.svg",
    href: "/tools/pdf/protect",
    category: "PDF Tools",
    rating: 4.9,
    usageCount: 19850,
    estimatedTime: "12s",
    quickActions: [
      { label: "Add Password", action: () => console.log("Add password") },
      { label: "Watermark", action: () => console.log("Add watermark") }
    ]
  },
  {
    title: "PDF to Images",
    description: "Convert PDF pages to high-quality JPG, PNG, or other image formats",
    icon: "/file.svg",
    href: "/tools/pdf/to-images",
    category: "PDF Tools",
    rating: 4.5,
    usageCount: 35670,
    estimatedTime: "25s",
    quickActions: [
      { label: "To JPG", action: () => console.log("To JPG") },
      { label: "To PNG", action: () => console.log("To PNG") }
    ]
  },
  {
    title: "PDF OCR",
    description: "Extract text from scanned PDFs and images with advanced OCR technology",
    icon: "/file.svg",
    href: "/tools/pdf/ocr",
    category: "PDF Tools",
    isNew: true,
    rating: 4.8,
    usageCount: 12340,
    estimatedTime: "45s",
    quickActions: [
      { label: "Extract Text", action: () => console.log("Extract text") },
      { label: "Searchable PDF", action: () => console.log("Make searchable") }
    ]
  }
]

const categories = [
  { name: "All Tools", icon: <FileText className="h-4 w-4" />, count: pdfTools.length },
  { name: "Merge & Split", icon: <Merge className="h-4 w-4" />, count: 2 },
  { name: "Optimize", icon: <Archive className="h-4 w-4" />, count: 1 },
  { name: "Security", icon: <Shield className="h-4 w-4" />, count: 1 },
  { name: "Convert", icon: <FileImage className="h-4 w-4" />, count: 1 },
  { name: "Extract", icon: <Type className="h-4 w-4" />, count: 1 }
]

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description: "Process PDFs in seconds with our optimized algorithms"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Processing",
    description: "Files are encrypted and automatically deleted after processing"
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: "Professional Quality",
    description: "Maintain document quality with industry-standard processing"
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Batch Processing",
    description: "Handle multiple files simultaneously for efficiency"
  }
]

export default function PDFToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Tools")
  
  const filteredTools = selectedCategory === "All Tools" 
    ? pdfTools 
    : pdfTools.filter(tool => {
        switch (selectedCategory) {
          case "Merge & Split":
            return tool.title.includes("Merge") || tool.title.includes("Split")
          case "Optimize":
            return tool.title.includes("Compress")
          case "Security":
            return tool.title.includes("Protect")
          case "Convert":
            return tool.title.includes("to Images")
          case "Extract":
            return tool.title.includes("OCR")
          default:
            return true
        }
      })

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <FileText className="mr-2 h-3 w-3" />
                  Professional PDF Tools
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Complete PDF
                <span className="block text-red-600">Tool Suite</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Everything you need to work with PDF files. Merge, split, compress, protect, 
                convert, and extract - all with professional quality and security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload PDF
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
                {selectedCategory === "All Tools" ? "All PDF Tools" : selectedCategory}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Professional-grade PDF processing tools trusted by millions of users worldwide.
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

        {/* Features Section */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Why Choose Our PDF Tools?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Built for professionals, designed for everyone. Experience the difference.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
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
        <section className="w-full py-16">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Simple, fast, and secure PDF processing in three easy steps.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold">Upload Your PDF</h3>
                <p className="text-gray-600">
                  Drag and drop your PDF files or click to browse. We support files up to 100MB.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold">Choose Your Tool</h3>
                <p className="text-gray-600">
                  Select the operation you want to perform and customize settings if needed.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold">Download Result</h3>
                <p className="text-gray-600">
                  Your processed PDF is ready! Download it instantly and securely.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

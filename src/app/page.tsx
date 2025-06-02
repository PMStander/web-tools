"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { ToolCard } from "@/components/tools/ToolCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  Image,
  Video,
  Zap,
  Star,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  TrendingUp,
  Globe
} from "lucide-react"

const featuredTools = [
  {
    title: "AI Document Analyzer",
    description: "Intelligent document analysis with content extraction and insights",
    icon: "/file.svg",
    href: "/tools/ai-document-analyzer",
    category: "AI Tools",
    isNew: true,
    isFeatured: true,
    aiRecommended: true,
    rating: 4.9,
    usageCount: 15420,
    estimatedTime: "30s"
  },
  {
    title: "PDF Merge",
    description: "Combine multiple PDF files into one document",
    icon: "/file.svg",
    href: "/tools/pdf-merge",
    category: "PDF Tools",
    isPopular: true,
    rating: 4.7,
    usageCount: 45230,
    estimatedTime: "15s"
  },
  {
    title: "Collaborative Editor",
    description: "Real-time collaborative editing for documents and images",
    icon: "/window.svg",
    href: "/tools/collaborative-editor",
    category: "Collaboration",
    isNew: true,
    isFeatured: true,
    rating: 4.8,
    usageCount: 8920,
    estimatedTime: "Instant"
  },
  {
    title: "Image Converter",
    description: "Convert images between different formats with AI optimization",
    icon: "/window.svg",
    href: "/tools/image-converter",
    category: "Image Tools",
    rating: 4.6,
    usageCount: 32150,
    estimatedTime: "10s"
  },
  {
    title: "Workflow Builder",
    description: "Create automated file processing workflows without coding",
    icon: "/globe.svg",
    href: "/tools/workflow-builder",
    category: "Automation",
    isNew: true,
    aiRecommended: true,
    rating: 4.9,
    usageCount: 5680,
    estimatedTime: "5min"
  },
  {
    title: "Smart File Organizer",
    description: "AI-powered file organization and management assistant",
    icon: "/file.svg",
    href: "/tools/file-organizer",
    category: "AI Tools",
    isNew: true,
    aiRecommended: true,
    rating: 4.8,
    usageCount: 12340,
    estimatedTime: "2min"
  }
]

const categories = [
  { name: "PDF Tools", icon: <FileText className="h-5 w-5" />, count: 15, color: "bg-red-500" },
  { name: "Image Tools", icon: <Image className="h-5 w-5" />, count: 12, color: "bg-blue-500" },
  { name: "Video Tools", icon: <Video className="h-5 w-5" />, count: 8, color: "bg-purple-500" },
  { name: "AI Tools", icon: <Sparkles className="h-5 w-5" />, count: 6, color: "bg-green-500" },
  { name: "Converters", icon: <Globe className="h-5 w-5" />, count: 20, color: "bg-orange-500" },
  { name: "Collaboration", icon: <Users className="h-5 w-5" />, count: 4, color: "bg-pink-500" }
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Manager",
    company: "TechCorp",
    content: "This platform has revolutionized our document workflow. The AI features are incredible!",
    rating: 5,
    avatar: "SC"
  },
  {
    name: "Michael Rodriguez",
    role: "Freelance Designer",
    company: "Independent",
    content: "The collaborative editing feature saved me hours of back-and-forth with clients.",
    rating: 5,
    avatar: "MR"
  },
  {
    name: "Emily Johnson",
    role: "Project Manager",
    company: "StartupXYZ",
    content: "Best file processing platform I've used. Fast, reliable, and incredibly intuitive.",
    rating: 5,
    avatar: "EJ"
  }
]

const stats = [
  { label: "Files Processed", value: "2.5M+", icon: <FileText className="h-5 w-5" /> },
  { label: "Happy Users", value: "50K+", icon: <Users className="h-5 w-5" /> },
  { label: "Tools Available", value: "200+", icon: <Zap className="h-5 w-5" /> },
  { label: "Uptime", value: "99.9%", icon: <Shield className="h-5 w-5" /> }
]

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredTools = selectedCategory
    ? featuredTools.filter(tool => tool.category === selectedCategory)
    : featuredTools

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
          <div className="absolute inset-0 bg-gray-100/5" />
          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4">
                <Badge variant="outline" className="mb-4">
                  <Sparkles className="mr-2 h-3 w-3" />
                  AI-Powered File Processing
                </Badge>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Transform Your Files with
                  <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Intelligent Tools
                  </span>
                </h1>
                <p className="mx-auto max-w-[800px] text-gray-600 md:text-xl lg:text-2xl/relaxed">
                  Experience the future of file processing with our AI-powered platform.
                  Convert, edit, collaborate, and automate with 200+ professional tools.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Play className="mr-2 h-5 w-5" />
                  Start Processing
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Explore AI Tools
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      {stat.icon}
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                    <span className="text-sm text-gray-500">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="w-full py-16 bg-gray-50/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Explore by Category
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover tools organized by type. From PDF manipulation to AI-powered analysis.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    selectedCategory === category.name ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCategory(
                    selectedCategory === category.name ? null : category.name
                  )}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center text-white mx-auto mb-3`}>
                      {category.icon}
                    </div>
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {category.count} tools
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Tools Section */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                  {selectedCategory ? `${selectedCategory}` : 'Featured Tools'}
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  {selectedCategory
                    ? `Professional ${selectedCategory.toLowerCase()} for every need`
                    : 'Our most popular and innovative tools, powered by AI'
                  }
                </p>
              </div>
              {selectedCategory && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory(null)}
                  className="hidden md:flex"
                >
                  View All Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.title}
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  href={tool.href}
                  category={tool.category}
                  isNew={tool.isNew}
                  isFeatured={tool.isFeatured}
                  isPopular={tool.isPopular}
                  rating={tool.rating}
                  usageCount={tool.usageCount}
                  estimatedTime={tool.estimatedTime}
                  aiRecommended={tool.aiRecommended}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="w-full py-16 bg-gray-50/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Loved by Professionals
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join thousands of users who trust our platform for their daily file processing needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {testimonial.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-gray-500">
                          {testimonial.role} at {testimonial.company}
                        </p>
                      </div>
                    </div>
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
                Why Choose Our Platform?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Built for professionals, designed for everyone. Experience the difference.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast</h3>
                <p className="text-gray-600">
                  Process files in seconds with our optimized algorithms and cloud infrastructure.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Secure & Private</h3>
                <p className="text-gray-600">
                  Your files are encrypted and automatically deleted after processing for maximum security.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">AI-Powered</h3>
                <p className="text-gray-600">
                  Intelligent features that learn from your usage patterns and optimize results.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold">Collaborative</h3>
                <p className="text-gray-600">
                  Work together in real-time with advanced collaboration and sharing features.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 bg-gradient-to-r from-primary to-purple-600">
          <div className="container px-4 md:px-6">
            <div className="text-center text-white space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Join thousands of professionals who have already upgraded their file processing experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  <Play className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  View Pricing
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">WebTools Pro</h3>
              <p className="text-sm text-gray-600">
                The most advanced file processing platform with AI-powered tools and collaboration features.
              </p>
              <div className="flex gap-4">
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Tools</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <a href="/tools/pdf" className="text-gray-600 hover:text-primary">PDF Tools</a>
                <a href="/tools/image" className="text-gray-600 hover:text-primary">Image Tools</a>
                <a href="/tools/video" className="text-gray-600 hover:text-primary">Video Tools</a>
                <a href="/tools/ai" className="text-gray-600 hover:text-primary">AI Tools</a>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <a href="#" className="text-gray-600 hover:text-primary">About Us</a>
                <a href="#" className="text-gray-600 hover:text-primary">Blog</a>
                <a href="#" className="text-gray-600 hover:text-primary">Careers</a>
                <a href="#" className="text-gray-600 hover:text-primary">Contact</a>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <nav className="flex flex-col space-y-2 text-sm">
                <a href="#" className="text-gray-600 hover:text-primary">Help Center</a>
                <a href="#" className="text-gray-600 hover:text-primary">Privacy Policy</a>
                <a href="#" className="text-gray-600 hover:text-primary">Terms of Service</a>
                <a href="#" className="text-gray-600 hover:text-primary">API Docs</a>
              </nav>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © 2024 WebTools Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                99.9% Uptime
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="mr-1 h-3 w-3" />
                SOC 2 Compliant
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

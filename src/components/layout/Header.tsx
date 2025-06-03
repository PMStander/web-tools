"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"
import { FileText, Image as ImageIcon, Video, Sparkles } from "lucide-react"

const SmartNavigation = dynamic(() => import("./SmartNavigation").then((mod) => mod.SmartNavigation), {
  ssr: true,
  loading: () => (
    <Button
      variant="outline"
      className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
      disabled
    >
      <div className="mr-2 h-4 w-4 animate-pulse bg-gray-300 rounded" />
      <span className="hidden lg:inline-flex">Search tools...</span>
      <span className="inline-flex lg:hidden">Search...</span>
    </Button>
  )
});

const categories = [
  {
    id: "PDF Tools",
    name: "PDF Tools",
    icon: <FileText className="h-4 w-4" />,
    color: "bg-red-500",
    tools: [
      {
        id: "pdf-merge",
        name: "PDF Merge",
        description: "Combine multiple PDF files into one document",
        category: "PDF Tools",
        href: "/tools/pdf-merge",
        icon: <FileText className="h-4 w-4" />,
        keywords: ["pdf", "merge", "combine", "join"],
        isPopular: true,
        usageCount: 45230
      }
    ]
  },
  {
    id: "Image Tools",
    name: "Image Tools",
    icon: <ImageIcon className="h-4 w-4" />,
    color: "bg-blue-500",
    tools: [
      {
        id: "image-converter",
        name: "Image Converter",
        description: "Convert images between different formats",
        category: "Image Tools",
        href: "/tools/image-converter",
        icon: <ImageIcon className="h-4 w-4" />,
        keywords: ["image", "convert", "format", "jpg", "png"],
        usageCount: 32150
      }
    ]
  },
  {
    id: "AI Tools",
    name: "AI Tools",
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-green-500",
    tools: [
      {
        id: "ai-document-analyzer",
        name: "AI Document Analyzer",
        description: "Intelligent document analysis with AI",
        category: "AI Tools",
        href: "/tools/ai-document-analyzer",
        icon: <Sparkles className="h-4 w-4" />,
        keywords: ["ai", "analyze", "document", "smart"],
        isNew: true,
        isFeatured: true,
        usageCount: 15420
      }
    ]
  }
]

const recentTools = [
  {
    id: "pdf-merge",
    name: "PDF Merge",
    description: "Combine multiple PDF files",
    category: "PDF Tools",
    href: "/tools/pdf-merge",
    icon: <FileText className="h-4 w-4" />,
    keywords: ["pdf", "merge"],
    lastUsed: "2h ago" // Static string to avoid hydration issues
  }
]

const featuredTools = [
  {
    id: "ai-document-analyzer",
    name: "AI Document Analyzer",
    description: "Intelligent document analysis",
    category: "AI Tools",
    href: "/tools/ai-document-analyzer",
    icon: <Sparkles className="h-4 w-4" />,
    keywords: ["ai", "analyze"],
    isNew: true,
    isFeatured: true
  }
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="hidden font-bold sm:inline-block text-xl">
              WebTools Pro
            </span>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/tools/pdf"
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              PDF Tools
            </Link>
            <Link
              href="/tools/image"
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1"
            >
              <ImageIcon className="h-4 w-4" />
              Image Tools
            </Link>
            <Link
              href="/tools/video"
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1"
            >
              <Video className="h-4 w-4" />
              Video Tools
            </Link>
            <Link
              href="/tools/ai"
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1"
            >
              <Sparkles className="h-4 w-4" />
              AI Tools
              <Badge variant="outline" className="text-xs ml-1">New</Badge>
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SmartNavigation
              categories={categories}
              recentTools={recentTools}
              featuredTools={featuredTools}
              suppressHydrationWarning
            />
          </div>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Get Pro
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

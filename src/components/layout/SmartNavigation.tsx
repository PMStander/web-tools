"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { 
  Search, 
  Star, 
  Clock, 
  TrendingUp,
  Command,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Tool {
  id: string
  name: string
  description: string
  category: string
  href: string
  icon: React.ReactNode
  isNew?: boolean
  isPopular?: boolean
  isFeatured?: boolean
  keywords: string[]
  usageCount?: number
  lastUsed?: string
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  tools: Tool[]
}

interface SmartNavigationProps {
  categories: Category[]
  recentTools?: Tool[]
  featuredTools?: Tool[]
  onToolSelect?: (tool: Tool) => void
  className?: string
  suppressHydrationWarning?: boolean // Add this line
}

export function SmartNavigation({
  categories,
  recentTools = [],
  featuredTools = [],
  onToolSelect,
  className
}: SmartNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Track when component is mounted on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Flatten all tools for searching
  const allTools = categories.flatMap(cat => cat.tools)

  // Filter tools based on search query and category
  const filteredTools = allTools.filter(tool => {
    const matchesSearch = searchQuery === "" || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === null || tool.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Group filtered tools by category
  const groupedResults = categories.map(category => ({
    ...category,
    tools: filteredTools.filter(tool => tool.category === category.id)
  })).filter(category => category.tools.length > 0)

  // Handle keyboard navigation - only when mounted
  useEffect(() => {
    if (!isMounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => searchInputRef.current?.focus(), 100)
      }

      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearchQuery("")
        setSelectedCategory(null)
      }

      if (isOpen && filteredTools.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setHighlightedIndex(prev =>
            prev < filteredTools.length - 1 ? prev + 1 : 0
          )
        }

        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredTools.length - 1
          )
        }

        if (e.key === 'Enter') {
          e.preventDefault()
          const selectedTool = filteredTools[highlightedIndex]
          if (selectedTool) {
            handleToolSelect(selectedTool)
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMounted, isOpen, filteredTools, highlightedIndex])

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchQuery, selectedCategory])

  const handleToolSelect = (tool: Tool) => {
    onToolSelect?.(tool)
    setIsOpen(false)
    setSearchQuery("")
    setSelectedCategory(null)
  }



  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className={cn(
          "relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search tools...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 p-4">
            <Card className="w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center border-b px-4 py-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools, features, or keywords..."
                  className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                  autoFocus={isMounted}
                  disabled={!isMounted}
                />
                <div className="ml-auto flex items-center gap-2">
                  <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 hidden sm:inline-flex">
                    ESC
                  </kbd>
                </div>
              </div>

              <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
                {/* Category Filters */}
                {searchQuery === "" && (
                  <div className="p-4 border-b">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedCategory === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                        className="text-xs"
                        disabled={!isMounted}
                      >
                        All Tools
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                          className="text-xs"
                          disabled={!isMounted}
                        >
                          <span className="mr-1">{category.icon}</span>
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Tools */}
                {searchQuery === "" && recentTools.length > 0 && (
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Recent Tools
                    </h3>
                    <div className="space-y-1">
                      {recentTools.slice(0, 3).map((tool) => (
                        <Link
                          key={tool.id}
                          href={tool.href}
                          onClick={() => handleToolSelect(tool)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                            {tool.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{tool.name}</p>
                            <p className="text-xs text-gray-500">
                              {tool.lastUsed}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 opacity-50" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Tools */}
                {searchQuery === "" && featuredTools.length > 0 && (
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Featured Tools
                    </h3>
                    <div className="space-y-1">
                      {featuredTools.slice(0, 3).map((tool) => (
                        <Link
                          key={tool.id}
                          href={tool.href}
                          onClick={() => handleToolSelect(tool)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
                            {tool.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{tool.name}</p>
                              {tool.isNew && (
                                <Badge variant="secondary" className="text-xs">New</Badge>
                              )}
                              {tool.isFeatured && (
                                <Badge variant="default" className="text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1">{tool.description}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 opacity-50" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {searchQuery !== "" && (
                  <div className="p-4">
                    {filteredTools.length === 0 ? (
                      <div className="text-center py-8">
                        <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No tools found for &quot;{searchQuery}&quot;</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try searching for PDF, image, video, or converter
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {groupedResults.map((category) => (
                          <div key={category.id}>
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                              {category.icon}
                              {category.name}
                              <Badge variant="outline" className="text-xs">
                                {category.tools.length}
                              </Badge>
                            </h3>
                            <div className="space-y-1">
                              {category.tools.map((tool) => {
                                const globalIndex = filteredTools.indexOf(tool)
                                return (
                                  <Link
                                    key={tool.id}
                                    href={tool.href}
                                    onClick={() => handleToolSelect(tool)}
                                    className={cn(
                                      "flex items-center gap-3 p-2 rounded-lg transition-colors",
                                      globalIndex === highlightedIndex 
                                        ? "bg-primary/10 border border-primary/20" 
                                        : "hover:bg-gray-50"
                                    )}
                                  >
                                    <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                                      {tool.icon}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{tool.name}</p>
                                        {tool.isNew && (
                                          <Badge variant="secondary" className="text-xs">New</Badge>
                                        )}
                                        {tool.isPopular && (
                                          <Badge variant="outline" className="text-xs">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Popular
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500 line-clamp-1">{tool.description}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 opacity-50" />
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="border-t p-3 text-xs text-gray-500 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">↵</kbd>
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">ESC</kbd>
                      Close
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Command className="h-3 w-3" />
                    <span>Smart Search</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}

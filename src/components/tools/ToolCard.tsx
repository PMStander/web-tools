"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Star, Clock, Users, Zap, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickAction {
  label: string
  action: () => void
}

interface ToolCardProps {
  title: string
  description: string
  icon: string
  href: string
  category?: string
  isNew?: boolean
  isFeatured?: boolean
  isPopular?: boolean
  rating?: number
  usageCount?: number
  lastUsed?: string
  estimatedTime?: string
  quickActions?: QuickAction[]
  aiRecommended?: boolean
  className?: string
}

export function ToolCard({
  title,
  description,
  icon,
  href,
  category,
  isNew = false,
  isFeatured = false,
  isPopular = false,
  rating,
  usageCount,
  lastUsed,
  estimatedTime,
  quickActions = [],
  aiRecommended = false,
  className
}: ToolCardProps) {
  const formatUsageCount = (count: number) => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`
    return `${(count / 1000000).toFixed(1)}m`
  }



  return (
    <Link href={href} className="block group">
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50/50",
        isFeatured && "ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-primary/10",
        className
      )}>
        {/* Status badges */}
        <div className="absolute top-3 right-3 flex gap-1">
          {isNew && (
            <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
              New
            </Badge>
          )}
          {isFeatured && (
            <Badge variant="default" className="text-xs bg-primary">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          {isPopular && (
            <Badge variant="secondary" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
          {aiRecommended && (
            <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Pick
            </Badge>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className={cn(
              "rounded-xl p-3 transition-all duration-300 group-hover:scale-110",
              isFeatured
                ? "bg-primary/10 group-hover:bg-primary/20"
                : "bg-gray-100 group-hover:bg-gray-200"
            )}>
              <Image
                src={icon}
                alt={title}
                width={28}
                height={28}
                className="h-7 w-7"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {title}
                </CardTitle>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
              </div>
              <CardDescription className="text-sm text-gray-600 line-clamp-2">
                {description}
              </CardDescription>
              {category && (
                <Badge variant="outline" className="text-xs w-fit">
                  {category}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Metrics */}
          {(rating || usageCount || estimatedTime || lastUsed) && (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
              {usageCount && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{formatUsageCount(usageCount)} uses</span>
                </div>
              )}
              {estimatedTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{estimatedTime}</span>
                </div>
              )}
              {lastUsed && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{lastUsed}</span>
                </div>
              )}
            </div>
          )}

          {/* Quick actions */}
          {quickActions.length > 0 && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {quickActions.slice(0, 2).map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={(e) => {
                    e.preventDefault()
                    action.action()
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>

        {/* Hover gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Subtle animation overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      </Card>
    </Link>
  )
}

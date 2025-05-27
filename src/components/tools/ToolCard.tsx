import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

interface ToolCardProps {
  title: string
  description: string
  icon: string
  href: string
}

export function ToolCard({ title, description, icon, href }: ToolCardProps) {
  return (
    <Link href={href}>
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-gray-100 p-2">
              <Image
                src={icon}
                alt={title}
                width={24}
                height={24}
                className="h-6 w-6"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">
                {title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 to-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
      </Card>
    </Link>
  )
}

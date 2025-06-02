"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Users, 
  Share2, 
  Edit3, 
  MessageSquare, 
  Clock, 
  Eye,
  Download,
  Settings,
  UserPlus,
  Sparkles
} from "lucide-react"

export default function CollaborativeEditorPage() {
  const [documentTitle, setDocumentTitle] = useState("Untitled Document")
  const [documentContent, setDocumentContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const collaborators = [
    { name: "Sarah Chen", avatar: "SC", status: "online", role: "Editor" },
    { name: "Mike Johnson", avatar: "MJ", status: "online", role: "Viewer" },
    { name: "Emily Davis", avatar: "ED", status: "away", role: "Editor" }
  ]

  const recentChanges = [
    { user: "Sarah Chen", action: "Added paragraph", time: "2 min ago" },
    { user: "Mike Johnson", action: "Left comment", time: "5 min ago" },
    { user: "You", action: "Updated title", time: "8 min ago" }
  ]

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
                  <Users className="mr-2 h-3 w-3" />
                  Real-time Collaboration
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Collaborative
                <span className="block text-blue-600">Document Editor</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Work together in real-time on documents, spreadsheets, and presentations. 
                See changes instantly, leave comments, and collaborate seamlessly.
              </p>
            </div>
          </div>
        </section>

        {/* Editor Interface */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Editor */}
              <div className="lg:col-span-3 space-y-6">
                {/* Toolbar */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Input
                          value={documentTitle}
                          onChange={(e) => setDocumentTitle(e.target.value)}
                          className="text-lg font-semibold border-none shadow-none p-0 h-auto"
                          placeholder="Document title..."
                        />
                        <Badge variant="outline" className="text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          Auto-saved
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Editor */}
                <Card className="min-h-[500px]">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Edit3 className="h-4 w-4" />
                        <span>Click to start editing</span>
                        <div className="flex items-center gap-1 ml-auto">
                          {collaborators.slice(0, 3).map((collaborator, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium"
                              title={collaborator.name}
                            >
                              {collaborator.avatar}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Textarea
                        value={documentContent}
                        onChange={(e) => setDocumentContent(e.target.value)}
                        placeholder="Start typing your document here... Your collaborators will see changes in real-time."
                        className="min-h-[400px] border-none shadow-none resize-none text-base leading-relaxed"
                        onFocus={() => setIsEditing(true)}
                        onBlur={() => setIsEditing(false)}
                      />
                      
                      {documentContent.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                          <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg mb-2">Start your collaborative document</p>
                          <p className="text-sm">Type anywhere to begin. Your team will see changes instantly.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Demo Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold mb-1">Real-time Sync</h3>
                      <p className="text-sm text-gray-600">See changes instantly as your team types</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold mb-1">Comments</h3>
                      <p className="text-sm text-gray-600">Leave feedback and suggestions inline</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h3 className="font-semibold mb-1">Version History</h3>
                      <p className="text-sm text-gray-600">Track all changes with automatic versioning</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Collaborators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      Collaborators
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {collaborators.map((collaborator, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {collaborator.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{collaborator.name}</p>
                          <p className="text-xs text-gray-500">{collaborator.role}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Others
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5" />
                      Recent Changes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentChanges.map((change, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">{change.user}</p>
                        <p className="text-gray-600">{change.action}</p>
                        <p className="text-xs text-gray-400">{change.time}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Mode
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Link
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
                Collaboration Features
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need for seamless team collaboration on documents.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Real-time Editing</h3>
                <p className="text-gray-600">
                  See changes as they happen. Multiple people can edit simultaneously without conflicts.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Comments</h3>
                <p className="text-gray-600">
                  Leave contextual feedback and suggestions directly on the document content.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Version Control</h3>
                <p className="text-gray-600">
                  Automatic version history with the ability to restore any previous version.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

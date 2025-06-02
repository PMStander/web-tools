"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  Download,
  Upload,
  Settings,
  CheckCircle,
  Key,
  FileText,
  Droplets
} from "lucide-react"

export default function PDFProtectPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [watermarkText, setWatermarkText] = useState("")
  const [permissions, setPermissions] = useState({
    printing: true,
    copying: true,
    editing: false,
    commenting: true
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleProtect = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsProcessing(false)
  }

  const passwordStrength = (pwd: string) => {
    if (pwd.length < 6) return { strength: 'weak', color: 'text-red-600' }
    if (pwd.length < 10) return { strength: 'medium', color: 'text-yellow-600' }
    return { strength: 'strong', color: 'text-green-600' }
  }

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
                  <Shield className="mr-2 h-3 w-3" />
                  PDF Security Tool
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Protect PDF
                <span className="block text-red-600">Files</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Secure your PDF documents with password protection, encryption, and watermarks. 
                Control who can view, edit, print, or copy your sensitive documents.
              </p>
            </div>
          </div>
        </section>

        {/* Main Tool Interface */}
        <section className="w-full py-16">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload and Settings */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload PDF File
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFileSelect={handleFileUpload}
                      acceptedTypes={['.pdf']}
                      maxSize={100 * 1024 * 1024}
                    />
                    {uploadedFile && (
                      <div className="mt-4 flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>File uploaded: {uploadedFile.name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {uploadedFile && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Protection Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="password" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="password">Password</TabsTrigger>
                          <TabsTrigger value="permissions">Permissions</TabsTrigger>
                          <TabsTrigger value="watermark">Watermark</TabsTrigger>
                        </TabsList>

                        <TabsContent value="password" className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter a strong password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            {password && (
                              <p className={`text-sm ${passwordStrength(password).color}`}>
                                Password strength: {passwordStrength(password).strength}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="Confirm your password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {confirmPassword && password !== confirmPassword && (
                              <p className="text-sm text-red-600">Passwords do not match</p>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="permissions" className="space-y-4">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="printing"
                                checked={permissions.printing}
                                onCheckedChange={(checked) => 
                                  setPermissions(prev => ({ ...prev, printing: checked as boolean }))
                                }
                              />
                              <Label htmlFor="printing">Allow printing</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="copying"
                                checked={permissions.copying}
                                onCheckedChange={(checked) => 
                                  setPermissions(prev => ({ ...prev, copying: checked as boolean }))
                                }
                              />
                              <Label htmlFor="copying">Allow copying text and images</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="editing"
                                checked={permissions.editing}
                                onCheckedChange={(checked) => 
                                  setPermissions(prev => ({ ...prev, editing: checked as boolean }))
                                }
                              />
                              <Label htmlFor="editing">Allow editing</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="commenting"
                                checked={permissions.commenting}
                                onCheckedChange={(checked) => 
                                  setPermissions(prev => ({ ...prev, commenting: checked as boolean }))
                                }
                              />
                              <Label htmlFor="commenting">Allow commenting and form filling</Label>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="watermark" className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="watermarkText">Watermark Text</Label>
                            <Input
                              id="watermarkText"
                              placeholder="e.g., CONFIDENTIAL, Company Name"
                              value={watermarkText}
                              onChange={(e) => setWatermarkText(e.target.value)}
                            />
                            <p className="text-sm text-gray-600">
                              Add a text watermark to all pages of your PDF
                            </p>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <Button 
                        onClick={handleProtect} 
                        className="w-full mt-6" 
                        size="lg"
                        disabled={isProcessing || !password || password !== confirmPassword}
                      >
                        {isProcessing ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <Shield className="mr-2 h-5 w-5" />
                            Protect PDF
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Info Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-blue-600" />
                      <span>256-bit AES encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Key className="h-4 w-4 text-green-600" />
                      <span>Password protection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span>Permission controls</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Droplets className="h-4 w-4 text-orange-600" />
                      <span>Custom watermarks</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Protection Levels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Basic Protection</h4>
                      <p className="text-sm text-gray-600">
                        Password protection for viewing
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Advanced Security</h4>
                      <p className="text-sm text-gray-600">
                        Restrict printing, copying, and editing
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Watermark Protection</h4>
                      <p className="text-sm text-gray-600">
                        Add visible watermarks to deter copying
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        1
                      </div>
                      <span className="text-sm">Upload your PDF</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        2
                      </div>
                      <span className="text-sm">Set password & permissions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                        3
                      </div>
                      <span className="text-sm">Download protected PDF</span>
                    </div>
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
                Why Protect Your PDFs?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Secure your sensitive documents with enterprise-grade protection.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold">Data Security</h3>
                <p className="text-gray-600">
                  Protect confidential information from unauthorized access.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Access Control</h3>
                <p className="text-gray-600">
                  Control who can view, edit, print, or copy your documents.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Compliance</h3>
                <p className="text-gray-600">
                  Meet regulatory requirements for document security.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

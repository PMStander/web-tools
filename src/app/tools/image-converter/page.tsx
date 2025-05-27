"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const IMAGE_FORMATS = [
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
  { value: "gif", label: "GIF" }
]

export default function ImageConverterPage() {
  const [convertedImage, setConvertedImage] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState<string>("jpeg")

  const handleUpload = async (files: File[]) => {
    // In a real implementation, we would:
    // 1. Send files to an API endpoint
    // 2. Convert the image server-side
    // 3. Return the converted image
    console.log("Files to convert:", files)
    console.log("Target format:", targetFormat)
    
    // For demo purposes, we'll just show a success message
    setTimeout(() => {
      setConvertedImage(`converted.${targetFormat}`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Image Converter</h1>
            <p className="text-gray-500">
              Convert your images to different formats
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Convert Image</CardTitle>
              <CardDescription>
                Select an image and choose your desired output format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Output Format</label>
                <Select
                  value={targetFormat}
                  onValueChange={setTargetFormat}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FileUpload
                accept={{
                  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"]
                }}
                maxFiles={1}
                onUpload={handleUpload}
              />
            </CardContent>
          </Card>

          {convertedImage && (
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">Success!</CardTitle>
                <CardDescription className="text-green-600">
                  Your image has been converted successfully
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Download Converted Image
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold">Supported formats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {IMAGE_FORMATS.map((format) => (
                <div
                  key={format.value}
                  className="p-4 rounded-lg bg-gray-50 text-center"
                >
                  <p className="font-medium">{format.label}</p>
                  <p className="text-sm text-gray-500">.{format.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

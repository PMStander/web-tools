"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PDFMergePage() {
  const [mergedFile, setMergedFile] = useState<string | null>(null)

  const handleUpload = async (files: File[]) => {
    // In a real implementation, we would:
    // 1. Send files to an API endpoint
    // 2. Process the PDFs server-side
    // 3. Return the merged PDF
    console.log("Files to merge:", files)
    
    // For demo purposes, we'll just show a success message
    setTimeout(() => {
      setMergedFile("merged.pdf")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">PDF Merge</h1>
            <p className="text-gray-500">
              Combine multiple PDF files into a single document
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload PDF Files</CardTitle>
              <CardDescription>
                Select or drag and drop the PDF files you want to merge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept={{
                  "application/pdf": [".pdf"]
                }}
                maxFiles={10}
                onUpload={handleUpload}
              />
            </CardContent>
          </Card>

          {mergedFile && (
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">Success!</CardTitle>
                <CardDescription className="text-green-600">
                  Your PDFs have been merged successfully
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Download Merged PDF
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold">How to merge PDF files</h2>
            <ol className="text-left space-y-2 list-decimal list-inside text-gray-600">
              <li>Upload your PDF files using the form above</li>
              <li>Wait for the files to be processed</li>
              <li>Download your merged PDF file</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}

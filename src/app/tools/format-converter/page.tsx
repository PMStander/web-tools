"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CONVERSION_TYPES = {
  document: [
    { value: "pdf", label: "PDF" },
    { value: "docx", label: "Word (DOCX)" },
    { value: "txt", label: "Text" },
    { value: "rtf", label: "Rich Text" },
  ],
  spreadsheet: [
    { value: "xlsx", label: "Excel (XLSX)" },
    { value: "csv", label: "CSV" },
  ],
  presentation: [
    { value: "pptx", label: "PowerPoint (PPTX)" },
    { value: "pdf", label: "PDF" },
  ],
}

export default function FormatConverterPage() {
  const [convertedFile, setConvertedFile] = useState<string | null>(null)
  const [targetFormat, setTargetFormat] = useState<string>("pdf")
  const [activeTab, setActiveTab] = useState("document")

  const handleUpload = async (files: File[]) => {
    // In a real implementation, we would:
    // 1. Send files to an API endpoint
    // 2. Convert the file server-side
    // 3. Return the converted file
    console.log("Files to convert:", files)
    console.log("Target format:", targetFormat)
    
    // For demo purposes, we'll just show a success message
    setTimeout(() => {
      setConvertedFile(`converted.${targetFormat}`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Format Converter</h1>
            <p className="text-gray-500">
              Convert your files between different formats
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Convert File</CardTitle>
              <CardDescription>
                Select a file type and choose your desired output format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="document">Documents</TabsTrigger>
                  <TabsTrigger value="spreadsheet">Spreadsheets</TabsTrigger>
                  <TabsTrigger value="presentation">Presentations</TabsTrigger>
                </TabsList>
                <TabsContent value="document" className="space-y-4">
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
                        {CONVERSION_TYPES.document.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                <TabsContent value="spreadsheet" className="space-y-4">
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
                        {CONVERSION_TYPES.spreadsheet.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                <TabsContent value="presentation" className="space-y-4">
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
                        {CONVERSION_TYPES.presentation.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              <FileUpload
                accept={{
                  "application/*": [
                    ".pdf", ".doc", ".docx", ".txt", ".rtf",
                    ".xls", ".xlsx", ".csv",
                    ".ppt", ".pptx"
                  ]
                }}
                maxFiles={1}
                onUpload={handleUpload}
              />
            </CardContent>
          </Card>

          {convertedFile && (
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">Success!</CardTitle>
                <CardDescription className="text-green-600">
                  Your file has been converted successfully
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Download Converted File
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Supported Formats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {CONVERSION_TYPES.document.map((format) => (
                      <li key={format.value}>{format.label}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Spreadsheets</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {CONVERSION_TYPES.spreadsheet.map((format) => (
                      <li key={format.value}>{format.label}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Presentations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {CONVERSION_TYPES.presentation.map((format) => (
                      <li key={format.value}>{format.label}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

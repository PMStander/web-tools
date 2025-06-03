# Development Guidelines - Adding New Tools

## Quick Start Checklist

When adding a new tool to the Web Tools platform, follow this checklist to ensure consistency and prevent navigation issues:

### ✅ Pre-Development
- [ ] Determine if tool should be category-based or featured
- [ ] Choose appropriate URL structure
- [ ] Identify design theme/gradient colors
- [ ] Plan tool functionality and UI components

### ✅ File Creation
- [ ] Create directory structure
- [ ] Create page.tsx file
- [ ] Implement tool page following template
- [ ] Add proper TypeScript interfaces

### ✅ Navigation Updates
- [ ] Update category page (if category tool)
- [ ] Update homepage (if featured tool)
- [ ] Update header navigation (if new category)
- [ ] Test all navigation links

### ✅ Quality Assurance
- [ ] Test tool functionality
- [ ] Verify responsive design
- [ ] Check accessibility
- [ ] Validate TypeScript compilation
- [ ] Test navigation from all entry points

## URL Structure Decision Tree

```
Is this a main/featured tool?
├── YES → Use `/tools/tool-name`
│   └── Examples: pdf-merge, image-converter, ai-document-analyzer
└── NO → Use category structure
    └── `/tools/category/tool-name`
        └── Examples: /tools/pdf/split, /tools/image/crop
```

## File Structure Templates

### Category Tool Structure
```
src/app/tools/[category]/[tool-name]/
└── page.tsx
```

### Featured Tool Structure
```
src/app/tools/[tool-name]/
└── page.tsx
```

## Component Template

### Basic Tool Page Template
```tsx
"use client"

import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { FileUpload } from "@/components/tools/FileUpload"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  // Import relevant icons
  Upload,
  Download,
  CheckCircle,
  Settings
} from "lucide-react"

export default function ToolNamePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleProcess = async () => {
    if (!uploadedFile) return
    
    setIsProcessing(true)
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsProcessing(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-[category-color]-50 to-[category-color]-50">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="mb-4">
                  <ToolIcon className="mr-2 h-3 w-3" />
                  Tool Category
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Tool Name
                <span className="block text-[category-color]-600">Action/Benefit</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl">
                Tool description and benefits. What problem does it solve?
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
                      Upload File
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onFileSelect={handleFileUpload}
                      acceptedTypes={['.pdf', '.jpg', '.png']} // Adjust as needed
                      maxSize={50 * 1024 * 1024}
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
                        Tool Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Add tool-specific settings here */}
                      
                      <Button 
                        onClick={handleProcess} 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <ToolIcon className="mr-2 h-5 w-5" />
                            Process File
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
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Feature 1</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Feature 2</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Feature 3</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">• Use case 1</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Use case 2</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">• Use case 3</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
```

## Design System

### Color Themes by Category
```scss
// PDF Tools
.pdf-gradient {
  background: linear-gradient(to bottom right, #fef2f2, #fed7aa);
  --primary-color: #dc2626; // red-600
}

// Image Tools  
.image-gradient {
  background: linear-gradient(to bottom right, #eff6ff, #e0e7ff);
  --primary-color: #2563eb; // blue-600
}

// Video Tools
.video-gradient {
  background: linear-gradient(to bottom right, #faf5ff, #f3e8ff);
  --primary-color: #9333ea; // purple-600
}

// AI Tools
.ai-gradient {
  background: linear-gradient(to bottom right, #fdf2f8, #fce7f3);
  --primary-color: #c026d3; // fuchsia-600
}

// Main/Featured Tools
.main-gradient {
  background: linear-gradient(to bottom right, #f0fdf4, #d1fae5);
  --primary-color: #059669; // emerald-600
}
```

### Icon Guidelines
- Use Lucide React icons consistently
- Primary action icons: 24px (h-6 w-6)
- Secondary action icons: 20px (h-5 w-5)  
- Feature list icons: 16px (h-4 w-4)
- Badge icons: 12px (h-3 w-3)

## Navigation Integration

### Adding to Category Page
```tsx
// In src/app/tools/[category]/page.tsx
const tools = [
  // ... existing tools
  {
    title: "New Tool Name",
    description: "Brief description of what the tool does",
    href: "/tools/category/new-tool",
    icon: ToolIcon,
    badge: "New" // Optional
  }
]
```

### Adding Featured Tool to Homepage
```tsx
// In src/app/page.tsx - Featured Tools section
{
  title: "New Featured Tool",
  description: "Description for homepage",
  href: "/tools/new-featured-tool",
  icon: ToolIcon
}
```

## Testing Checklist

### Functionality Testing
- [ ] File upload works with correct file types
- [ ] File size validation works
- [ ] Processing simulation works
- [ ] Error states display correctly
- [ ] Success states display correctly
- [ ] Download functionality works (if applicable)

### UI/UX Testing
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Gradient background displays correctly
- [ ] Icons render properly
- [ ] Typography is consistent
- [ ] Color contrast meets accessibility standards
- [ ] Loading states are clear

### Navigation Testing
- [ ] Tool accessible from category page
- [ ] Tool accessible from homepage (if featured)
- [ ] Header navigation works
- [ ] Back navigation works
- [ ] URL structure is correct
- [ ] No broken links

### Performance Testing
- [ ] Page loads quickly
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Bundle size impact is reasonable

## Common Pitfalls to Avoid

### ❌ Don't Do This
- Create files without updating navigation
- Use inconsistent color themes
- Skip responsive design testing
- Forget to add TypeScript interfaces
- Use different component patterns
- Skip accessibility considerations

### ✅ Do This Instead
- Follow the complete checklist
- Use established design patterns
- Test on multiple devices
- Add proper TypeScript types
- Follow component templates
- Include accessibility features

## Getting Help

### Resources
- **Component Library**: Check existing tools for patterns
- **Design System**: Follow color and spacing guidelines
- **TypeScript**: Use proper interfaces and types
- **Testing**: Test thoroughly before deployment

### Code Review Checklist
Before submitting new tools for review:
- [ ] Follows file structure guidelines
- [ ] Uses correct design theme
- [ ] Navigation is properly updated
- [ ] All functionality works
- [ ] Responsive design tested
- [ ] TypeScript compiles cleanly
- [ ] No console errors
- [ ] Documentation updated

This ensures consistent, high-quality tool implementations that integrate seamlessly with the existing platform.

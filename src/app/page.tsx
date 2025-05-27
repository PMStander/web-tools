import { Header } from "@/components/layout/Header"
import { ToolCard } from "@/components/tools/ToolCard"
import { Button } from "@/components/ui/button"

const tools = [
  {
    title: "PDF Merge",
    description: "Combine multiple PDF files into one document",
    icon: "/file.svg",
    href: "/tools/pdf-merge",
    category: "PDF Tools"
  },
  {
    title: "Image Converter",
    description: "Convert images between different formats",
    icon: "/window.svg",
    href: "/tools/image-converter",
    category: "Image Tools"
  },
  {
    title: "Format Converter",
    description: "Convert files between different formats",
    icon: "/globe.svg",
    href: "/tools/format-converter",
    category: "Converters"
  }
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                All Your File Tools in One Place
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Free online tools for PDF, images, and file conversion. Easy to use, no installation required.
              </p>
            </div>
            <div className="space-x-4">
              <Button size="lg">Get Started</Button>
              <Button variant="outline" size="lg">View All Tools</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section className="bg-gray-50 py-20">
        <div className="container px-4 md:px-6">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">Popular Tools</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => (
              <ToolCard
                key={index}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                href={tool.href}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-white py-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Fast & Easy</h3>
              <p className="text-gray-500">
                Process your files quickly with our optimized tools
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Secure</h3>
              <p className="text-gray-500">
                Your files are automatically deleted after processing
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Free to Use</h3>
              <p className="text-gray-500">
                All basic tools are completely free
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-gray-500">
              © 2024 TinyWow Clone. All rights reserved.
            </p>
            <nav className="flex gap-4">
              <a href="#" className="text-sm text-gray-500 hover:underline">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-500 hover:underline">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:underline">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

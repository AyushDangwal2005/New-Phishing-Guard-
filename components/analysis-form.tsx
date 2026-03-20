"use client"

import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Link2, 
  Upload, 
  X, 
  FileImage, 
  FileAudio, 
  FileIcon,
  Loader2,
  Shield,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"
import { RealTimeAnalyzer } from "@/components/real-time-analyzer"

interface AnalysisFormProps {
  onAnalyze: (data: FormData) => Promise<void>
  isLoading?: boolean
  loadingStep?: string
}

const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

export function AnalysisForm({ onAnalyze, isLoading = false, loadingStep }: AnalysisFormProps) {
  const [text, setText] = useState("")
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("text")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!text && !url && !file) {
      toast.error("Please provide content to analyze")
      return
    }

    const formData = new FormData()
    if (text) formData.append("text", text)
    if (url) formData.append("url", url)
    if (file) formData.append("file", file)

    await onAnalyze(formData)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      if (ACCEPTED_FILE_TYPES.includes(droppedFile.type)) {
        setFile(droppedFile)
        setActiveTab("file")
      } else {
        toast.error("Unsupported file type")
      }
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
        setFile(selectedFile)
      } else {
        toast.error("Unsupported file type")
      }
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return FileImage
    if (type.startsWith("audio/")) return FileAudio
    return FileIcon
  }

  const FileIconComponent = file ? getFileIcon(file.type) : FileIcon

  return (
    <Card 
      className={cn(
        "glass transition-all",
        dragActive && "ring-2 ring-primary ring-offset-2"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="text" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">URL</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">File</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Paste suspicious email, SMS, or message content here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-40 resize-none bg-background/50"
                disabled={isLoading}
              />
              {text && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => setText("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the full text content of suspicious messages for AI analysis
            </p>
            {text.length > 10 && (
              <RealTimeAnalyzer text={text} className="mt-3" />
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://suspicious-website.com/page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 bg-background/50"
                disabled={isLoading}
              />
              {url && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 -translate-y-1/2 right-2 h-6 w-6"
                  onClick={() => setUrl("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a URL to check for phishing indicators and domain reputation
            </p>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES.join(",")}
              onChange={handleFileSelect}
              className="hidden"
              disabled={isLoading}
            />
            
            {file ? (
              <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileIconComponent className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full p-8 border-2 border-dashed rounded-lg transition-colors",
                  "hover:border-primary hover:bg-primary/5",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  dragActive && "border-primary bg-primary/5"
                )}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-10 w-10" />
                  <p className="font-medium">Drop file here or click to upload</p>
                  <p className="text-sm">Images, Audio, PDF, Documents</p>
                </div>
              </button>
            )}
            <p className="text-xs text-muted-foreground">
              Upload screenshots, voice messages, or documents for OCR and content analysis
            </p>
          </TabsContent>
        </Tabs>

        {/* Combined URL input for text tab */}
        {activeTab === "text" && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Optional: Include URL from message</p>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="https://link-from-message.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 bg-background/50"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || (!text && !url && !file)}
          className="w-full mt-6 gap-2"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingStep || "Analyzing..."}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze with AI
            </>
          )}
        </Button>

        {/* Loading Progress */}
        {isLoading && loadingStep && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <Shield className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm">{loadingStep}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

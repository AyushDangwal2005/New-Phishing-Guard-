"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileImage, 
  FileAudio, 
  FileText, 
  File,
  Eye,
  Volume2,
} from "lucide-react"

interface FilePreviewProps {
  file: File
  className?: string
}

export function FilePreview({ file, className }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)

  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else if (file.type.startsWith("text/")) {
      const reader = new FileReader()
      reader.onload = (e) => setTextContent(e.target?.result as string)
      reader.readAsText(file)
    }

    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [file, preview])

  const getFileIcon = () => {
    if (file.type.startsWith("image/")) return FileImage
    if (file.type.startsWith("audio/")) return FileAudio
    if (file.type.startsWith("text/") || file.type === "application/pdf") return FileText
    return File
  }

  const FileIcon = getFileIcon()

  return (
    <Card className={cn("glass overflow-hidden", className)}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          File Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Image Preview */}
        {file.type.startsWith("image/") && preview && (
          <div className="relative rounded-lg overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-auto max-h-64 object-contain"
            />
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs">
              Image will be analyzed using OCR
            </div>
          </div>
        )}

        {/* Audio Preview */}
        {file.type.startsWith("audio/") && (
          <div className="p-6 bg-muted rounded-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Volume2 className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  Audio will be transcribed and analyzed
                </p>
              </div>
              <audio 
                controls 
                className="w-full max-w-sm"
                src={URL.createObjectURL(file)}
              >
                Your browser does not support audio playback
              </audio>
            </div>
          </div>
        )}

        {/* Text/PDF Preview */}
        {(file.type.startsWith("text/") || file.type === "application/pdf") && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground mb-2">
                  {file.type === "application/pdf" 
                    ? "PDF content will be extracted and analyzed" 
                    : "Text content will be analyzed"}
                </p>
                {textContent && (
                  <div className="mt-3 p-3 bg-background/50 rounded border border-border max-h-32 overflow-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {textContent.slice(0, 500)}
                      {textContent.length > 500 && "..."}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generic File */}
        {!file.type.startsWith("image/") && 
         !file.type.startsWith("audio/") && 
         !file.type.startsWith("text/") && 
         file.type !== "application/pdf" && (
          <div className="p-6 bg-muted rounded-lg text-center">
            <div className="p-4 bg-primary/10 rounded-full inline-flex mb-3">
              <File className="h-8 w-8 text-primary" />
            </div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

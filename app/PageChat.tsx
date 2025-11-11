'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  Upload, 
  FileText,
  Image as ImageIcon,
  X
} from 'lucide-react'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import { formatFileSize } from '@/lib/utils'

/**
 * PageChat - ChatGPT-Style Conversational Interface
 * 
 * Features:
 * - Conversational AI assistant
 * - Chat-based order/project creation
 * - Inline file uploads (images + PDFs)
 * - Progressive disclosure of information
 * - Natural language interactions
 * 
 * Best for: Users who prefer guided experiences, consultative workflows
 */

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachments?: Array<{
    type: 'image' | 'pdf'
    name: string
    size: number
    url?: string
  }>
  status?: 'sending' | 'sent' | 'processing'
  showActions?: boolean
}

export default function PageChat() {
  const { resetBatch, createBatch } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showProcessingPopup, setShowProcessingPopup] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0 && uploadedImages.length === 0) return

    // Combine uploaded images from the middle section with attached files
    const allFiles = [...uploadedImages, ...attachedFiles]

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: allFiles.map(file => ({
        type: file.type.startsWith('image/') ? 'image' : 'pdf',
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file)
      })),
      status: 'sent'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachedFiles([])
    setUploadedImages([])
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = getAIResponse(userMessage)
      setIsTyping(false)
      
      responses.forEach((response, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: `ai-${Date.now()}-${index}`,
            role: 'assistant',
            content: response,
            timestamp: new Date(),
            status: 'sent',
            showActions: index === responses.length - 1 && response.toLowerCase().includes('would you like')
          }])
        }, index * 1000)
      })
    }, 1500)
  }

  const getAIResponse = (userMessage: Message): string[] => {
    const content = userMessage.content.trim()
    const contentLower = content.toLowerCase()
    const hasAttachments = userMessage.attachments && userMessage.attachments.length > 0
    const hasImages = userMessage.attachments?.some(a => a.type === 'image')
    const hasPDF = userMessage.attachments?.some(a => a.type === 'pdf')
    const imageCount = userMessage.attachments?.filter(a => a.type === 'image').length || 0
    const pdfCount = userMessage.attachments?.filter(a => a.type === 'pdf').length || 0

    // Always start with a confirmation message if there are files or instructions
    const responses: string[] = []

    if (hasAttachments || content) {
      // Confirmation message with files and instructions
      let confirmationMessage = "✅ **Confirmation Received**\n\n"
      
      if (hasAttachments) {
        confirmationMessage += "**Files Uploaded:**\n"
        userMessage.attachments?.forEach((attachment, index) => {
          const size = formatFileSize(attachment.size)
          confirmationMessage += `${index + 1}. ${attachment.name} (${size}) - ${attachment.type.toUpperCase()}\n`
        })
        confirmationMessage += "\n"
      }

      if (content) {
        confirmationMessage += "**Your Instructions:**\n"
        confirmationMessage += `"${content}"\n\n`
      }

      confirmationMessage += "I've received your request and will process it accordingly."
      responses.push(confirmationMessage)
    }

    // Additional context-specific responses
    if (hasImages && hasPDF) {
      responses.push("I'm analyzing your requirements and the PDF document...")
      responses.push("Based on your files and instructions, I recommend:\n\n1. **Background Enhancement** - Remove and replace backgrounds\n2. **Color Correction** - Optimize brightness and contrast\n3. **Quality Improvement** - Enhance resolution and sharpness\n\nWould you like me to proceed with these settings, or would you prefer to customize them?")
    } else if (hasImages && content) {
      responses.push(`Processing ${imageCount} image(s) with your specified requirements...`)
      responses.push("I'll apply the transformations you've requested. The processing will begin shortly.")
    } else if (hasImages) {
      responses.push(`I've received ${imageCount} image(s). Please provide instructions on what you'd like me to do with them.`)
    } else if (hasPDF) {
      responses.push("Thanks for the PDF! I'm reading through your instructions...")
      responses.push("Please upload the images you'd like me to process, and I'll apply the specifications from your document.")
    } else if (contentLower.includes('background') || contentLower.includes('remove')) {
      responses.push("I can definitely help with background removal and replacement!")
      responses.push("Please upload your images, and I'll:\n• Remove existing backgrounds\n• Add clean white or custom backgrounds\n• Ensure consistent quality across all images\n\nJust click the attachment button or drag and drop your files.")
    } else if (contentLower.includes('batch') || contentLower.includes('multiple') || contentLower.includes('many')) {
      responses.push("I'm optimized for batch processing! I can handle hundreds of images at once.")
      responses.push("Just upload all your images and let me know what you'd like done. I'll process them all consistently and efficiently.")
    } else if (!hasAttachments && !content) {
      responses.push("I can help with that! To get started, please:\n\n1. Upload your images (drag & drop or click attach)\n2. Tell me what you'd like done, or attach a PDF brief\n3. I'll process everything and show you the results\n\nReady when you are!")
    }

    return responses.length > 0 ? responses : ["Thank you! I've received your message."]
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
  }

  const onDropImages = useCallback((acceptedFiles: File[]) => {
    setUploadedImages(prev => [...prev, ...acceptedFiles])
    toast.success(`${acceptedFiles.length} image(s) uploaded`)
  }, [])

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onDropImages,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    multiple: true,
  })

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleYesNo = (response: 'yes' | 'no', messageId: string) => {
    // Add user response
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: response === 'yes' ? 'Yes, proceed with these settings.' : 'No, I would like to customize them.',
      timestamp: new Date(),
      status: 'sent'
    }

    // Remove action buttons from the message that triggered this
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, showActions: false } : msg
    ))
    
    // Add user response
    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = response === 'yes' 
        ? "Great! I'll begin processing your images with the recommended settings. You'll receive a notification once the processing is complete."
        : "Sure! Please let me know what specific adjustments you'd like to make to the processing settings."
      
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        status: 'sent'
      }])

      // If user said yes, create batch and redirect to order detail page
      if (response === 'yes') {
        setTimeout(() => {
          setShowProcessingPopup(true)
          
          // Create batch with uploaded images
          const batchId = `ORD-${Date.now()}`
          const imageCount = uploadedImages.length || 1
          const instructions = messages
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join(' ')
          
          createBatch(batchId, instructions, imageCount)
          
          // After 3 seconds, redirect to the specific order detail page
          setTimeout(() => {
            setShowProcessingPopup(false)
            window.location.href = `/processing/${batchId}`
          }, 3000)
        }, 1000)
      }
    }, 1500)
  }

  const renderMessageContent = (content: string) => {
    const lines = content.split('\n')
    
    return lines.map((line, lineIdx) => {
      const parts: (string | JSX.Element)[] = []
      let keyCounter = 0

      // Parse bold (**text**) and yes/no highlighting
      const boldPattern = /\*\*(.*?)\*\*/g
      let lastIndex = 0
      let match

      while ((match = boldPattern.exec(line)) !== null) {
        // Add text before bold
        if (match.index > lastIndex) {
          const beforeText = line.substring(lastIndex, match.index)
          parts.push(...highlightYesNo(beforeText, `${lineIdx}-${keyCounter++}`))
        }

        // Add bold text
        const boldText = match[1]
        parts.push(
          <strong key={`${lineIdx}-bold-${keyCounter++}`}>
            {highlightYesNo(boldText, `${lineIdx}-${keyCounter++}`)}
          </strong>
        )

        lastIndex = match.index + match[0].length
      }

      // Add remaining text
      if (lastIndex < line.length) {
        const remainingText = line.substring(lastIndex)
        parts.push(...highlightYesNo(remainingText, `${lineIdx}-${keyCounter++}`))
      }

      return (
        <span key={lineIdx}>
          {parts.length > 0 ? parts : line}
          {lineIdx < lines.length - 1 && <br />}
        </span>
      )
    })
  }

  const highlightYesNo = (text: string, baseKey: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = []
    const yesPattern = /\b(yes|yeah|yep|yup|sure|ok|okay|affirmative|correct|right|agree|approved|accept)\b/gi
    const noPattern = /\b(no|nope|nah|never|deny|reject|refuse|disagree|wrong|incorrect|declined|rejected)\b/gi
    
    let keyCounter = 0
    let lastIndex = 0

    // Find all yes matches
    const yesMatches: Array<{ start: number; end: number; text: string; type: 'yes' }> = []
    let match
    while ((match = yesPattern.exec(text)) !== null) {
      yesMatches.push({ start: match.index, end: match.index + match[0].length, text: match[0], type: 'yes' })
    }
    yesPattern.lastIndex = 0

    // Find all no matches
    const noMatches: Array<{ start: number; end: number; text: string; type: 'no' }> = []
    while ((match = noPattern.exec(text)) !== null) {
      noMatches.push({ start: match.index, end: match.index + match[0].length, text: match[0], type: 'no' })
    }
    noPattern.lastIndex = 0

    // Combine and sort all matches
    const allMatches = [...yesMatches, ...noMatches].sort((a, b) => a.start - b.start)

    // Build parts array
    allMatches.forEach((match) => {
      if (match.start > lastIndex) {
        parts.push(text.substring(lastIndex, match.start))
      }
      parts.push(
        <span
          key={`${baseKey}-${keyCounter++}`}
          className={match.type === 'yes' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}
        >
          {match.text}
        </span>
      )
      lastIndex = match.end
    })

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? parts : [text]
  }

  return (
    <main className="flex h-screen flex-col bg-background overflow-hidden">
      <Header />
      
      {/* Two Column Layout */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Column - Image Upload Section */}
        <div className="w-96 border-r bg-muted/30 flex flex-col shrink-0">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Images
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Upload images to process
            </p>
          </div>
          
          {/* Upload Dropzone */}
          <div className="p-4 shrink-0">
            <Card>
              <CardContent className="p-0">
                <div
                  {...getImageRootProps()}
                  className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    isImageDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary/50'
                  }`}
                >
                  <input {...getImageInputProps()} />
                  <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="mb-1 text-sm font-medium">
                    {isImageDragActive ? 'Drop images here' : 'Drag & drop images'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse (PNG, JPG, WEBP)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Uploaded Images List - Scrollable */}
          {uploadedImages.length > 0 && (
            <div className="flex-1 min-h-0 border-t flex flex-col">
              <div className="p-4 shrink-0 border-b">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{uploadedImages.length} image(s)</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedImages.reduce((acc, file) => acc + file.size, 0))} total
                  </p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  <AnimatePresence>
                    {uploadedImages.map((file, index) => {
                      const previewUrl = URL.createObjectURL(file)
                      const uploadDate = new Date(file.lastModified)
                      return (
                        <motion.div
                          key={file.name + index}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="group flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors bg-background"
                        >
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                            <img
                              src={previewUrl}
                              alt={file.name}
                              className="h-full w-full object-cover"
                              onLoad={() => URL.revokeObjectURL(previewUrl)}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {uploadDate.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeUploadedImage(index)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Chat Interface */}
        <div className="flex flex-1 flex-col min-w-0 min-h-0">
        {/* Messages Area */}
          <ScrollArea className="flex-1 min-h-0 px-4 py-6">
            {/* Empty State - Centered Instruction */}
            {messages.length === 0 ? (
              <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
                <div className="text-center max-w-3xl px-4">
                  <h2 className="text-2xl font-bold text-foreground leading-tight">
                    Upload your document with reference images in the chatbox below and explain your requirements.
                  </h2>
                </div>
              </div>
            ) : (
              /* Messages */
          <div className="mx-auto max-w-3xl space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                      <Bot className="h-6 w-6 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div className={`flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <Card className={`px-4 py-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {renderMessageContent(message.content)}
                        </div>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 rounded-lg p-2 ${
                                message.role === 'user' ? 'bg-primary-foreground/10' : 'bg-background'
                              }`}
                            >
                              {attachment.type === 'image' ? (
                                <ImageIcon className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              <span className="flex-1 truncate text-xs">
                                {attachment.name}
                              </span>
                              <span className="text-xs opacity-70">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                      
                      {/* Action Buttons (Yes/No) */}
                      {message.role === 'assistant' && message.showActions && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => handleYesNo('yes', message.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Yes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleYesNo('no', message.id)}
                            className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            No
                          </Button>
                        </div>
                      )}
                    
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <Card className="bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="h-2 w-2 rounded-full bg-foreground/40"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="h-2 w-2 rounded-full bg-foreground/40"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="h-2 w-2 rounded-full bg-foreground/40"
                      />
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>
            )}
        </ScrollArea>

        {/* Input Area */}
          <div className="border-t bg-background shrink-0">
          <div className="mx-auto max-w-3xl p-4">
            {/* Attached Files Preview */}
            <AnimatePresence>
              {attachedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 flex flex-wrap gap-2"
                >
                  {attachedFiles.map((file, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-2 py-2 pr-1"
                    >
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="h-3 w-3" />
                      ) : (
                        <FileText className="h-3 w-3" />
                      )}
                      <span className="text-xs">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Box */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <div className="relative flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                    placeholder="Upload your SOP in the chatbox and explain..."
                  className="min-h-[60px] resize-none pr-12"
                />
                <Button
                  onClick={handleSend}
                  size="icon"
                    disabled={!input.trim() && attachedFiles.length === 0 && uploadedImages.length === 0}
                  className="absolute bottom-2 right-2 h-8 w-8"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Popup */}
      <AnimatePresence>
        {showProcessingPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent"
                  />
                </div>
                <h3 className="text-xl font-semibold text-center">Processing Your Images</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Please wait while we process your images with the selected settings...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}


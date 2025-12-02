'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
import Image from 'next/image'
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
  const router = useRouter()
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

          // After 3 seconds, redirect to the processing page
          setTimeout(() => {
            setShowProcessingPopup(false)
            router.push('/processing')
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
          className={match.type === 'yes' ? 'text-primary font-semibold' : 'text-destructive font-semibold'}
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
    <main className="flex h-screen flex-col bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar - Uploaded Images */}
        <AnimatePresence>
          {uploadedImages.length > 0 && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r bg-muted/30 flex-shrink-0 overflow-hidden"
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      Uploaded Images
                    </h3>
                    <Badge variant="secondary">
                      {uploadedImages.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedImages.reduce((acc, file) => acc + file.size, 0))} total
                  </p>
                </div>

                {/* Images List */}
                <ScrollArea className="flex-1">
                  <div className="p-3 space-y-2">
                    <AnimatePresence>
                      {uploadedImages.map((file, index) => {
                        const previewUrl = URL.createObjectURL(file)
                        return (
                          <motion.div
                            key={`sidebar-${file.name}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="group relative rounded-xl border bg-card hover:shadow-md transition-all overflow-hidden"
                          >
                            <div className="flex gap-3 p-3">
                              {/* Thumbnail */}
                              <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                <Image
                                  src={previewUrl}
                                  alt={file.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>

                              {/* Metadata */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate mb-1">
                                  {file.name}
                                </p>
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {file.type.split('/')[1]?.toUpperCase() || 'IMAGE'}
                                  </p>
                                </div>
                              </div>

                              {/* Remove Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeUploadedImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Container */}
        <div className="flex flex-1 flex-col min-w-0 min-h-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 min-h-0 px-4 py-6">
            {/* Empty State */}
            {messages.length === 0 ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-250px)]">
                <div className="text-center max-w-2xl px-4 space-y-8">
                  {/* AI Avatar */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg"
                  >
                    <Bot className="h-10 w-10 text-white" />
                  </motion.div>

                  {/* Welcome Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                  >
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Hi! I'm your AI assistant
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      Upload images and tell me what you'd like to do with them
                    </p>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid gap-3 md:grid-cols-2 mt-8"
                  >
                    <Card 
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                          <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-sm mb-1">Upload Images</h3>
                          <p className="text-xs text-muted-foreground">
                            Drag & drop or click to browse
                          </p>
                        </div>
                      </div>
                    </Card>
                    <Card 
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary/50"
                      onClick={() => document.getElementById('chat-input')?.focus()}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                          <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-sm mb-1">Add Instructions</h3>
                          <p className="text-xs text-muted-foreground">
                            Describe what you need
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Example Prompts */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="pt-4"
                  >
                    <p className="text-xs text-muted-foreground mb-3">Try asking:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        "Remove background",
                        "Enhance colors",
                        "Resize images",
                        "Add shadows"
                      ].map((prompt) => (
                        <Badge
                          key={prompt}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => setInput(prompt)}
                        >
                          {prompt}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="mx-auto max-w-4xl space-y-6 pb-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-md">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}

                      <div className={`flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border'
                        }`}>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {renderMessageContent(message.content)}
                          </div>

                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {message.attachments.map((attachment, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-2 rounded-lg p-2 text-xs ${
                                    message.role === 'user' 
                                      ? 'bg-primary-foreground/10' 
                                      : 'bg-muted'
                                  }`}
                                >
                                  {attachment.type === 'image' ? (
                                    <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                                      {attachment.url && (
                                        <Image
                                          src={attachment.url}
                                          alt={attachment.name}
                                          fill
                                          className="object-cover"
                                          unoptimized
                                        />
                                      )}
                                    </div>
                                  ) : (
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                      <FileText className="h-5 w-5" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate font-medium">{attachment.name}</p>
                                    <p className="text-xs opacity-70">
                                      {formatFileSize(attachment.size)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons (Yes/No) */}
                        {message.role === 'assistant' && message.showActions && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-2"
                          >
                            <Button
                              size="sm"
                              onClick={() => handleYesNo('yes', message.id)}
                              className="rounded-full px-6"
                            >
                              ✓ Yes, proceed
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleYesNo('no', message.id)}
                              className="rounded-full px-6"
                            >
                              ✗ No, customize
                            </Button>
                          </motion.div>
                        )}

                        <span className="text-xs text-muted-foreground px-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {message.role === 'user' && (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/60 border-2 border-border">
                          <User className="h-5 w-5" />
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
                      className="flex gap-3"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-md">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="rounded-2xl bg-card border px-4 py-3 shadow-sm">
                        <div className="flex gap-1.5">
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                            className="h-2 w-2 rounded-full bg-primary"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                            className="h-2 w-2 rounded-full bg-primary"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                            className="h-2 w-2 rounded-full bg-primary"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-background shrink-0">
            <div className="mx-auto max-w-4xl p-6">
              {/* Attached Files Preview (PDFs and other non-image files) */}
              <AnimatePresence>
                {attachedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {attachedFiles.length} file(s) attached
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {attachedFiles.map((file, index) => (
                        <motion.div
                          key={`attached-${index}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-full border-2 border-border hover:border-primary transition-colors bg-muted"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium max-w-[200px] truncate">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Box */}
              <div className="relative">
                <input {...getImageInputProps()} />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Drag & Drop Overlay */}
                {isImageDragActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-3xl z-10 pointer-events-none border-2 border-primary border-dashed"
                  >
                    <div className="text-center">
                      <Upload className="h-10 w-10 text-primary mx-auto mb-2" />
                      <p className="text-sm font-semibold text-primary">Drop your images here</p>
                    </div>
                  </motion.div>
                )}

                <div 
                  {...getImageRootProps()}
                  className={`flex items-end gap-3 p-4 rounded-3xl border-2 transition-all ${
                    isImageDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    className="flex-shrink-0 h-11 w-11 rounded-2xl hover:bg-background"
                    title="Attach files"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>

                  <Textarea
                    id="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="min-h-[44px] max-h-[200px] resize-none border-0 focus-visible:ring-0 shadow-none text-base bg-transparent placeholder:text-muted-foreground/60"
                    onClick={(e) => e.stopPropagation()}
                    rows={1}
                  />

                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSend()
                    }}
                    size="icon"
                    disabled={!input.trim() && attachedFiles.length === 0 && uploadedImages.length === 0}
                    className="flex-shrink-0 h-11 w-11 rounded-2xl"
                    title="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Popup */}
      <AnimatePresence>
        {
          showProcessingPopup && (
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
                className="bg-background rounded-lg shadow-2xl p-4 sm:p-8 max-w-md w-full mx-4"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-center">Processing Your Images</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Please wait while we process your images with the selected settings...
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence >
    </main >
  )
}


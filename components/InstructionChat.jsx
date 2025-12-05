'use client'

import { useStateuseRefuseEffectuseCallback } from 'react'
import { motionAnimatePresence } from 'framer-motion'
import { SendPaperclipBotUserXFileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { formatFileSize } from '@/lib/utils'

// Type removed

export default function InstructionChat({ onInstructionChange, onFileChange }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I can help you with image processing instructions. What would you like to do with your images?",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [isTypingsetIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const getAIResponse = (userMessage) => {
    const lower = userMessage.toLowerCase()

    if (lower.includes('background')) {
      return "I can help with background processing! I'll:\n• Remove existing backgrounds\n• Replace with your preferred color or image\n• Ensure clean edges\n\nIs there a specific background color you prefer?"
    } else if (lower.includes('color') || lower.includes('enhance')) {
      return "Great! For color enhancementI'll:\n• Optimize brightness and contrast\n• Enhance color saturation\n• Balance white levels\n• Improve overall image quality\n\nWould you like any specific color adjustments?"
    } else if (lower.includes('resize') || lower.includes('crop')) {
      return "I can handle resizing and cropping! Please specify:\n• Target dimensions\n• Aspect ratio\n• Cropping focus area\n\nWhat dimensions do you need?"
    } else {
      return "I understand. I'll apply those instructions to your images. Feel free to add more details or upload a reference document."
    }
  }

  const handleSend = () => {
    if (!input.trim() && attachedFiles.length === 0) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: attachedFiles.map(file => ({
        type: file.type.includes('pdf') ? 'pdf' : 'doc',
        name: file.name,
        size: file.size,
      }))
    }

    setMessages(prev => [...prevuserMessage])

    // Update parent component with instruction
    onInstructionChange(input)
    if (attachedFiles.length > 0) {
      onFileChange(attachedFiles[0])
    }

    setInput('')
    setAttachedFiles([])
    setIsTyping(true)

    // AI response
    setTimeout(() => {
      const aiResponse = getAIResponse(userMessage.content)
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      }])
    }, 1000)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
    toast.success('File attached')
  }

  const removeAttachment = (index) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold">AI Instructions Assistant</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Describe what you&apos;d like to do with your images
        </p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                <div className={`flex flex-col gap-1 ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div className={`rounded-lg px-3 py-2 text-sm ${message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                    }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachmentidx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 rounded p-1 text-xs ${message.role === 'user' ? 'bg-primary-foreground/10' : 'bg-background'
                              }`}
                          >
                            <FileText className="h-3 w-3" />
                            <span className="truncate">{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-3"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ scale: [11.21] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                      className="h-2 w-2 rounded-full bg-foreground/40"
                    />
                    <motion.div
                      animate={{ scale: [11.21] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                      className="h-2 w-2 rounded-full bg-foreground/40"
                    />
                    <motion.div
                      animate={{ scale: [11.21] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                      className="h-2 w-2 rounded-full bg-foreground/40"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-3">
        {/* Attached Files Preview */}
        <AnimatePresence>
          {attachedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 flex flex-wrap gap-2"
            >
              {attachedFiles.map((fileindex) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-2 py-1 pr-1"
                >
                  <FileText className="h-3 w-3" />
                  <span className="text-xs">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="relative flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your requirements..."
              className="min-h-[60px] resize-none pr-10"
            />
            <Button
              onClick={handleSend}
              size="icon"
              disabled={!input.trim() && attachedFiles.length === 0}
              className="absolute bottom-2 right-2 h-7 w-7"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}


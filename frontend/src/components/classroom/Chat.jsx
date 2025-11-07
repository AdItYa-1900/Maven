import { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Send } from 'lucide-react'
import { getInitials } from '../../lib/utils'

export default function Chat({ socket, classroomId, userId, userName }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!socket) return

    socket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socket.off('receive-message')
    }
  }, [socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !socket) return

    socket.emit('send-message', {
      classroomId,
      message: newMessage,
      senderId: userId
    })

    setNewMessage('')
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.sender_id === userId
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${isOwn ? 'bg-primary' : 'bg-gray-400'}`}>
                  {getInitials(userName)}
                </div>
                <div className={`flex-1 max-w-xs ${isOwn ? 'text-right' : ''}`}>
                  <div className={`inline-block px-4 py-2 rounded-lg ${isOwn ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                    {msg.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Send, X, MessageSquare } from 'lucide-react'
import { getInitials } from '../../lib/utils'

export default function ChatPopup({ socket, classroomId, userId, userName, partner }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!socket) {
      console.log('💬 Chat: No socket yet')
      return
    }

    console.log('💬 Chat: Setting up message listener')

    socket.on('receive-message', (message) => {
      console.log('💬 Received message:', message)
      setMessages(prev => [...prev, message])
      if (!isOpen) {
        setUnreadCount(prev => prev + 1)
      }
    })

    return () => {
      socket.off('receive-message')
    }
  }, [socket, isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !socket) {
      console.log('💬 Cannot send:', !newMessage.trim() ? 'empty message' : 'no socket')
      return
    }

    const message = {
      classroomId,
      message: newMessage,
      senderId: userId,
      senderName: userName,
      timestamp: new Date().toISOString()
    }

    console.log('💬 Sending message:', message)
    socket.emit('send-message', message)
    // Don't add locally - backend will broadcast to all including sender
    setNewMessage('')
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110 z-50"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Chat</h3>
                <p className="text-xs text-white/80">{partner?.name || 'Partner'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isOwn = msg.sender_id === userId
                return (
                  <div
                    key={idx}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                      isOwn ? 'bg-primary' : 'bg-gray-400'
                    }`}>
                      {getInitials(isOwn ? userName : (partner?.name || 'P'))}
                    </div>
                    <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                      <div className={`inline-block px-4 py-2 rounded-2xl max-w-[85%] break-words ${
                        isOwn 
                          ? 'bg-primary text-white rounded-br-sm' 
                          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                      }`}>
                        {msg.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-2xl">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full"
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

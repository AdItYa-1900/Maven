import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getClassroomByMatch, startSession, endSession } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import io from 'socket.io-client'
import VideoCall from '../components/classroom/VideoCall'
import Whiteboard from '../components/classroom/Whiteboard'
import ChatPopup from '../components/classroom/ChatPopup'
import ReviewModal from '../components/classroom/ReviewModal'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Video, Palette, X } from 'lucide-react'
import { getInitials } from '../lib/utils'

export default function Classroom() {
  const { matchId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [classroom, setClassroom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const [activeView, setActiveView] = useState('video')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [partner, setPartner] = useState(null)
  const [sessionStartTime, setSessionStartTime] = useState(null)

  useEffect(() => {
    loadClassroom()
  }, [matchId])

  useEffect(() => {
    if (classroom && user) {
      console.log('🔌 Connecting to socket...')
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
        transports: ['websocket', 'polling']
      })
      
      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id)
        console.log('📍 Joining classroom:', classroom.id, 'User:', user.id)
        
        newSocket.emit('join-classroom', {
          classroomId: classroom.id,
          userId: user.id
        })
      })

      newSocket.on('user-joined', ({ userId }) => {
        console.log('👋 User joined:', userId)
        toast({
          title: 'Partner joined!',
          description: 'Your partner has joined the session'
        })
      })

      newSocket.on('user-left', ({ userId }) => {
        console.log('👋 User left:', userId)
        toast({
          title: 'Partner left',
          description: 'Your partner has left the session',
          variant: 'destructive'
        })
      })

      setSocket(newSocket)

      return () => {
        console.log('🔌 Disconnecting socket...')
        newSocket.emit('leave-classroom', {
          classroomId: classroom.id,
          userId: user.id
        })
        newSocket.disconnect()
      }
    }
  }, [classroom, user])

  const loadClassroom = async () => {
    try {
      const response = await getClassroomByMatch(matchId)
      setClassroom(response.data)
      
      // Determine partner
      const match = response.data.match
      const partnerUser = match.user1.id === user.id ? match.user2 : match.user1
      setPartner(partnerUser)

      // Start session
      await startSession(matchId)
      setSessionStartTime(Date.now())
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to load classroom',
        variant: 'destructive'
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleEndSession = async () => {
    try {
      await endSession(matchId)
      
      // Only show review modal if session lasted more than 2 minutes
      const sessionDuration = sessionStartTime ? (Date.now() - sessionStartTime) / 1000 / 60 : 0
      
      if (sessionDuration >= 2) {
        setShowReviewModal(true)
      } else {
        toast({
          title: 'Session too short',
          description: 'Session ended. No review needed for sessions under 2 minutes.',
        })
        navigate('/dashboard')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end session',
        variant: 'destructive'
      })
    }
  }

  const handleReviewComplete = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading classroom...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {getInitials(partner?.name || 'P')}
            </div>
            <div>
              <h2 className="font-semibold text-lg">{partner?.name}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live Session
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1.5 shadow-inner">
            <button
              onClick={() => setActiveView('video')}
              className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 font-medium ${
                activeView === 'video' 
                  ? 'bg-white shadow-md text-primary' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Video className="w-4 h-4" />
              <span className="text-sm">Video</span>
            </button>
            <button
              onClick={() => setActiveView('whiteboard')}
              className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 font-medium ${
                activeView === 'whiteboard' 
                  ? 'bg-white shadow-md text-primary' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span className="text-sm">Whiteboard</span>
            </button>
          </div>
          
          <Button variant="destructive" onClick={handleEndSession} className="shadow-lg">
            <X className="w-4 h-4 mr-2" />
            End Session
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'video' ? (
          <VideoCall
            socket={socket}
            classroomId={classroom.id}
            userId={user.id}
            partnerId={partner?.id}
            compact={false}
          />
        ) : (
          // Whiteboard view with compact videos on the right
          <div className="h-full flex gap-4 p-4">
            <div className="flex-1 rounded-2xl overflow-hidden shadow-xl">
              <Whiteboard
                socket={socket}
                classroomId={classroom.id}
              />
            </div>
            <div className="w-72 flex-shrink-0">
              <VideoCall
                socket={socket}
                classroomId={classroom.id}
                userId={user.id}
                partnerId={partner?.id}
                compact={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Chat Popup - always available */}
      <ChatPopup
        socket={socket}
        classroomId={classroom.id}
        userId={user.id}
        userName={user.name}
        partner={partner}
      />

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          matchId={matchId}
          partnerId={partner?.id}
          partnerName={partner?.name}
          onComplete={handleReviewComplete}
        />
      )}
    </div>
  )
}

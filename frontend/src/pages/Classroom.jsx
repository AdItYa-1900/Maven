import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getClassroomByMatch, startSession, endSession } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import io from 'socket.io-client'
import VideoCall from '../components/classroom/VideoCall'
import Whiteboard from '../components/classroom/Whiteboard'
import Chat from '../components/classroom/Chat'
import ReviewModal from '../components/classroom/ReviewModal'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Video, MessageSquare, Palette, X, Users } from 'lucide-react'
import { getInitials } from '../lib/utils'

export default function Classroom() {
  const { matchId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [classroom, setClassroom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const [activeTab, setActiveTab] = useState('video')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [partner, setPartner] = useState(null)

  useEffect(() => {
    loadClassroom()
  }, [matchId])

  useEffect(() => {
    if (classroom) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001')
      setSocket(newSocket)

      newSocket.emit('join-classroom', {
        classroomId: classroom._id,
        userId: user._id
      })

      return () => {
        newSocket.emit('leave-classroom', {
          classroomId: classroom._id,
          userId: user._id
        })
        newSocket.disconnect()
      }
    }
  }, [classroom])

  const loadClassroom = async () => {
    try {
      const response = await getClassroomByMatch(matchId)
      setClassroom(response.data)
      
      // Determine partner
      const match = response.data.match_id
      const partnerUser = match.user1_id._id === user._id ? match.user2_id : match.user1_id
      setPartner(partnerUser)

      // Start session
      await startSession(response.data._id)
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
      await endSession(classroom._id)
      setShowReviewModal(true)
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
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              {getInitials(partner?.name || 'P')}
            </div>
            <div>
              <h2 className="font-semibold">{partner?.name}</h2>
              <p className="text-xs text-muted-foreground">Skill Exchange Session</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded ${activeTab === 'video' ? 'bg-white shadow' : ''}`}
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('whiteboard')}
              className={`px-4 py-2 rounded ${activeTab === 'whiteboard' ? 'bg-white shadow' : ''}`}
            >
              <Palette className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded ${activeTab === 'chat' ? 'bg-white shadow' : ''}`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
          
          <Button variant="destructive" onClick={handleEndSession}>
            <X className="w-4 h-4 mr-2" />
            End Session
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'video' && (
          <VideoCall
            socket={socket}
            classroomId={classroom._id}
            userId={user._id}
            partnerId={partner?._id}
          />
        )}
        
        {activeTab === 'whiteboard' && (
          <Whiteboard
            socket={socket}
            classroomId={classroom._id}
          />
        )}
        
        {activeTab === 'chat' && (
          <Chat
            socket={socket}
            classroomId={classroom._id}
            userId={user._id}
            userName={user.name}
          />
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          matchId={matchId}
          partnerId={partner?._id}
          partnerName={partner?.name}
          onComplete={handleReviewComplete}
        />
      )}
    </div>
  )
}

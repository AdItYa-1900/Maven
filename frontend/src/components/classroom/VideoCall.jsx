import { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/Button'
import { Video, VideoOff, Mic, MicOff } from 'lucide-react'

export default function VideoCall({ socket, classroomId, userId, partnerId, compact = false }) {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [peerConnection, setPeerConnection] = useState(null)
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  useEffect(() => {
    initializeMedia()
    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      if (peerConnection) {
        peerConnection.close()
      }
    }
  }, [])

  useEffect(() => {
    if (socket && localStream && !peerConnection) {
      setupWebRTC()
    }
  }, [socket, localStream])

  // Listen for user joined to initiate connection
  useEffect(() => {
    if (!socket) return

    socket.on('user-joined', ({ userId: joinedUserId }) => {
      console.log('User joined:', joinedUserId)
      if (peerConnection && localStream) {
        // Create offer for the new user
        createOffer(peerConnection)
      }
    })

    return () => {
      socket.off('user-joined')
    }
  }, [socket, peerConnection, localStream])

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
    }
  }

  const setupWebRTC = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    }

    const pc = new RTCPeerConnection(configuration)
    setPeerConnection(pc)

    // Add local stream tracks
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream)
    })

    // Handle incoming tracks
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0])
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate')
        socket.emit('webrtc-ice-candidate', {
          classroomId,
          candidate: event.candidate,
          userId
        })
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState)
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.log('Connection failed, attempting to reconnect...')
        // Could implement reconnection logic here
      }
    }

    // Socket event handlers
    socket.on('webrtc-offer', async ({ offer, userId: senderId }) => {
      if (senderId !== userId) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('webrtc-answer', {
          classroomId,
          answer,
          userId
        })
      }
    })

    socket.on('webrtc-answer', async ({ answer, userId: senderId }) => {
      if (senderId !== userId) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      }
    })

    socket.on('webrtc-ice-candidate', async ({ candidate, userId: senderId }) => {
      if (senderId !== userId) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })

    // Create and send offer
    createOffer(pc)
  }

  const createOffer = async (pc) => {
    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('webrtc-offer', {
        classroomId,
        offer,
        userId
      })
    } catch (error) {
      console.error('Error creating offer:', error)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      setVideoEnabled(videoTrack.enabled)
      
      socket?.emit('toggle-video', {
        classroomId,
        userId,
        enabled: videoTrack.enabled
      })
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setAudioEnabled(audioTrack.enabled)
      
      socket?.emit('toggle-audio', {
        classroomId,
        userId,
        enabled: audioTrack.enabled
      })
    }
  }

  if (compact) {
    // Compact vertical layout for whiteboard mode
    return (
      <div className="h-full flex flex-col gap-3">
        {/* Local Video - Compact */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video group">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs font-medium z-20">
            You
          </div>
          
          {/* Modern overlay controls - always slightly visible */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                audioEnabled 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                videoEnabled 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>

          {!videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
              <div className="text-center">
                <VideoOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Camera Off</p>
              </div>
            </div>
          )}
        </div>

        {/* Remote Video - Compact */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
          {remoteStream ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs font-medium z-20">
                Partner
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-white">
              <div className="text-center">
                <div className="animate-pulse mb-2">
                  <Video className="w-10 h-10 mx-auto text-gray-400" />
                </div>
                <p className="text-xs">Waiting...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Full layout for video mode
  return (
    <div className="h-full bg-gray-900 relative">
      <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
        {/* Local Video */}
        <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl group">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium z-20">
            You
          </div>
          
          {/* Modern overlay controls - always slightly visible */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 opacity-60 group-hover:opacity-100 transition-all duration-300 z-20">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full backdrop-blur-md shadow-lg transition-all transform hover:scale-110 ${
                audioEnabled 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              }`}
              title={audioEnabled ? 'Mute' : 'Unmute'}
            >
              {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full backdrop-blur-md shadow-lg transition-all transform hover:scale-110 ${
                videoEnabled 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              }`}
              title={videoEnabled ? 'Stop Video' : 'Start Video'}
            >
              {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          </div>

          {!videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
              <div className="text-center">
                <VideoOff className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg font-medium">Camera Off</p>
                <p className="text-gray-500 text-sm mt-2">Hover to see controls</p>
              </div>
            </div>
          )}
          
          {!audioEnabled && (
            <div className="absolute top-4 right-4 bg-red-500 p-2 rounded-full animate-pulse z-20">
              <MicOff className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Remote Video */}
        <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          {remoteStream ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium z-20">
                Partner
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-white">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <Video className="w-20 h-20 mx-auto text-gray-400" />
                </div>
                <p className="text-lg">Waiting for partner to join...</p>
                <p className="text-sm text-gray-400 mt-2">They'll appear here once connected</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

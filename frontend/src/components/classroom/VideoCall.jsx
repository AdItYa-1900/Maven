import { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/Button'
import { Video, VideoOff, Mic, MicOff } from 'lucide-react'

export default function VideoCall({ socket, classroomId, userId, partnerId }) {
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
    if (socket && localStream) {
      setupWebRTC()
    }
  }, [socket, localStream])

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
        socket.emit('webrtc-ice-candidate', {
          classroomId,
          candidate: event.candidate,
          userId
        })
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

  return (
    <div className="h-full bg-gray-900 relative">
      <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-2 p-4">
        {/* Local Video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
            You
          </div>
          {!videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <VideoOff className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Remote Video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          {remoteStream ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                Partner
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-white">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <Video className="w-16 h-16 mx-auto text-gray-400" />
                </div>
                <p>Waiting for partner to join...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        <Button
          size="lg"
          variant={audioEnabled ? 'default' : 'destructive'}
          onClick={toggleAudio}
          className="rounded-full w-14 h-14"
        >
          {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>
        <Button
          size="lg"
          variant={videoEnabled ? 'default' : 'destructive'}
          onClick={toggleVideo}
          className="rounded-full w-14 h-14"
        >
          {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>
      </div>
    </div>
  )
}

import { useRef, useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Eraser, Trash2 } from 'lucide-react'

export default function Whiteboard({ socket, classroomId }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(2)
  const [tool, setTool] = useState('pen')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    context.lineCap = 'round'
    context.lineJoin = 'round'

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on('whiteboard-draw', (drawData) => {
      drawLine(drawData)
    })

    socket.on('whiteboard-clear', () => {
      clearCanvas()
    })

    return () => {
      socket.off('whiteboard-draw')
      socket.off('whiteboard-clear')
    }
  }, [socket])

  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const context = canvas.getContext('2d')
    context.beginPath()
    context.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const drawData = {
      x,
      y,
      color: tool === 'eraser' ? '#FFFFFF' : color,
      lineWidth: tool === 'eraser' ? 20 : lineWidth
    }

    drawLine(drawData)

    // Emit to other users
    socket?.emit('whiteboard-draw', {
      classroomId,
      drawData
    })
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const drawLine = ({ x, y, color, lineWidth }) => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    context.strokeStyle = color
    context.lineWidth = lineWidth
    context.lineTo(x, y)
    context.stroke()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleClear = () => {
    clearCanvas()
    socket?.emit('whiteboard-clear', { classroomId })
  }

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="border-b p-4 flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={tool === 'pen' ? 'default' : 'outline'}
            onClick={() => setTool('pen')}
          >
            Pen
          </Button>
          <Button
            size="sm"
            variant={tool === 'eraser' ? 'default' : 'outline'}
            onClick={() => setTool('eraser')}
          >
            <Eraser className="w-4 h-4 mr-2" />
            Eraser
          </Button>
        </div>

        <div className="flex gap-2">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-900 scale-110' : 'border-gray-300'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">Size:</label>
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm w-6">{lineWidth}</span>
        </div>

        <div className="ml-auto">
          <Button variant="destructive" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ backgroundColor: '#FFFFFF' }}
        />
      </div>
    </div>
  )
}

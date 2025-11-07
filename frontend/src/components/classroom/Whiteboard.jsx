import { useRef, useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Eraser, Trash2, Pen, Undo } from 'lucide-react'

export default function Whiteboard({ socket, classroomId }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(3)
  const [tool, setTool] = useState('pen')
  const [history, setHistory] = useState([])
  const lastPosRef = useRef({ x: 0, y: 0 })

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

  const getPosition = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Handle both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const pos = getPosition(e)
    lastPosRef.current = pos

    const context = canvasRef.current.getContext('2d')
    context.beginPath()
    context.moveTo(pos.x, pos.y)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()

    const pos = getPosition(e)

    const drawData = {
      x0: lastPosRef.current.x,
      y0: lastPosRef.current.y,
      x1: pos.x,
      y1: pos.y,
      color: tool === 'eraser' ? '#FFFFFF' : color,
      lineWidth: tool === 'eraser' ? 20 : lineWidth
    }

    drawLine(drawData)
    lastPosRef.current = pos

    // Emit to other users
    socket?.emit('whiteboard-draw', {
      classroomId,
      drawData
    })
  }

  const stopDrawing = (e) => {
    if (e) e.preventDefault()
    setIsDrawing(false)
  }

  const drawLine = ({ x0, y0, x1, y1, color, lineWidth }) => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    context.strokeStyle = color
    context.lineWidth = lineWidth
    context.lineCap = 'round'
    context.lineJoin = 'round'
    
    context.beginPath()
    context.moveTo(x0, y0)
    context.lineTo(x1, y1)
    context.stroke()
    context.closePath()
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

  const colors = [
    { value: '#000000', name: 'Black' },
    { value: '#EF4444', name: 'Red' },
    { value: '#3B82F6', name: 'Blue' },
    { value: '#10B981', name: 'Green' },
    { value: '#F59E0B', name: 'Yellow' },
    { value: '#8B5CF6', name: 'Purple' },
    { value: '#EC4899', name: 'Pink' },
    { value: '#FFFFFF', name: 'White' }
  ]

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Modern Toolbar */}
      <div className="border-b bg-gradient-to-r from-gray-50 to-white p-4 flex items-center gap-6 flex-wrap">
        {/* Tools */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={tool === 'pen' ? 'default' : 'outline'}
            onClick={() => setTool('pen')}
            className="transition-all"
          >
            <Pen className="w-4 h-4 mr-2" />
            Pen
          </Button>
          <Button
            size="sm"
            variant={tool === 'eraser' ? 'default' : 'outline'}
            onClick={() => setTool('eraser')}
            className="transition-all"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Eraser
          </Button>
        </div>

        {/* Colors */}
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium text-gray-600">Color:</span>
          <div className="flex gap-2">
            {colors.map(c => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                title={c.name}
                className={`w-8 h-8 rounded-full transition-all transform hover:scale-110 ${
                  color === c.value 
                    ? 'ring-4 ring-primary ring-offset-2 scale-110' 
                    : 'border-2 border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Size:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-32 accent-primary"
          />
          <div 
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
            style={{
              width: `${Math.max(lineWidth * 2, 20)}px`,
              height: `${Math.max(lineWidth * 2, 20)}px`,
              backgroundColor: tool === 'eraser' ? '#f3f4f6' : color,
              border: tool === 'eraser' ? '2px dashed #9ca3af' : 'none'
            }}
          />
        </div>

        {/* Actions */}
        <div className="ml-auto flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClear}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full touch-none"
          style={{ 
            cursor: tool === 'eraser' ? 'cell' : 'crosshair',
            backgroundColor: '#FFFFFF'
          }}
        />
        
        {/* Watermark */}
        <div className="absolute bottom-4 right-4 text-xs text-gray-300 pointer-events-none">
          Maven Whiteboard
        </div>
      </div>
    </div>
  )
}

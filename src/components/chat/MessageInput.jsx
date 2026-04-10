import { useState, useRef } from 'react'
import { Send, Mic, Square, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MessageInput({ onSend, onSendAudio }) {
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data)
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' })
        onSendAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.current.start()
      setIsRecording(true)
    } catch (err) {
      toast.error('No se pudo acceder al micrófono')
    }
  }

  const stopRecording = () => {
    mediaRecorder.current.stop()
    setIsRecording(false)
  }

  return (
    <div className="p-4 bg-white border-t border-primary-100">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isRecording}
            placeholder={isRecording ? "Grabando audio..." : "Escribe un mensaje..."}
            className={`
              w-full py-3 pl-4 pr-12 rounded-xl text-sm transition-all
              bg-primary-50 border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-600
              ${isRecording ? 'animate-pulse' : ''}
            `}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Square size={18} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="p-2 text-primary-400 hover:text-primary-600 hover:bg-primary-100/50 rounded-lg transition-all"
              >
                <Mic size={18} />
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isRecording}
          className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:bg-primary-200 transition-all shadow-md active:scale-95"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

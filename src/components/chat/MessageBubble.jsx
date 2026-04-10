import { format } from 'date-fns'

export default function MessageBubble({ message }) {
  const isInbound = message.direction === 'inbound'
  const date = new Date(message.timestamp)

  return (
    <div className={`flex ${isInbound ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}>
      <div className={`
        max-w-[75%] px-4 py-2 shadow-sm
        ${isInbound ? 'bubble-inbound' : 'bubble-outbound'}
      `}>
        {message.media_type === 'audio' && (
          <div className="mb-2">
            <audio src={message.media_url} controls className="h-8 max-w-full" />
          </div>
        )}
        
        {message.content && (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        )}
        
        <div className={`text-[10px] mt-1 text-right ${isInbound ? 'text-primary-400' : 'text-primary-200'}`}>
          {format(date, 'HH:mm')}
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../types';
import { cn } from '../utils/cn';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  streamingContent: string;
  onSendMessage: (content: string) => void;
}

export function ChatPanel({ messages, isLoading, streamingContent, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
        if (match) {
          const language = match[1] || 'lua';
          const code = match[2].trim();
          return (
            <div key={index} className="my-3 rounded-lg overflow-hidden">
              <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 flex justify-between items-center">
                <span>{language.toUpperCase()}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="hover:text-white transition-colors"
                >
                  Copy
                </button>
              </div>
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ margin: 0, borderRadius: 0 }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          );
        }
      }
      
      // Parse markdown-style formatting
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part.split(/(\*\*.*?\*\*)/g).map((segment, i) => {
            if (segment.startsWith('**') && segment.endsWith('**')) {
              return <strong key={i}>{segment.slice(2, -2)}</strong>;
            }
            return segment;
          })}
        </span>
      );
    });
  };

  const quickPrompts = [
    "Create a coin collection system",
    "Make a player respawn script",
    "Build a basic inventory system",
    "Add a sprint mechanic"
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Roblox AI Copilot</h2>
            <p className="text-xs text-gray-400">Powered by Ollama</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Start Building</h3>
            <p className="text-gray-400 text-sm mb-6">Ask me to help you create Roblox scripts</p>
            
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(prompt)}
                  className="p-3 text-left text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[80%] rounded-xl p-4",
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              )}
            >
              {renderContent(message.content)}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Streaming response */}
        {isLoading && streamingContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="max-w-[80%] rounded-xl p-4 bg-gray-800 text-gray-100">
              {renderContent(streamingContent)}
              <span className="inline-block w-2 h-4 bg-red-400 animate-pulse ml-1" />
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to build something for Roblox..."
            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

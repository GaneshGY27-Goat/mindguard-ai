import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, ChevronDown, ShieldAlert } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/api';

interface AssistantChatProps {
  onTriggerBreathing: () => void;
  onTriggerMood: () => void;
  onTriggerTrends: () => void;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({
  onTriggerBreathing,
  onTriggerMood,
  onTriggerTrends
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: "Hello! I am your MindGuard Assistant. I'm here to offer non-medical supportive guidance, breathing exercises, and help you track your wellness signals. How are you feeling right now?",
      timestamp: new Date().toISOString(),
      quickActions: [
        { label: 'Breathing Exercise', action: 'START_BREATHING' },
        { label: 'Log Mood', action: 'LOG_MOOD' },
        { label: 'View Trends', action: 'VIEW_TRENDS' }
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const botResponse = await sendChatMessage(text);
      setMessages((prev) => [...prev, botResponse]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'START_BREATHING':
        onTriggerBreathing();
        break;
      case 'LOG_MOOD':
        onTriggerMood();
        break;
      case 'VIEW_TRENDS':
        onTriggerTrends();
        break;
      default:
        handleSend(action);
        break;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-xs shadow-2xl shadow-teal-500/30 transition transform hover:scale-105 active:scale-95"
        >
          <Bot className="w-5 h-5 text-slate-950" />
          <span>MindGuard Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
        </button>
      ) : (
        <div className="w-[360px] sm:w-[400px] h-[520px] glass-panel rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Top Bar */}
          <div className="bg-slate-900/90 border-b border-slate-800 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  MindGuard Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </h4>
                <span className="text-[10px] text-slate-400">
                  Supportive, non-diagnostic AI
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Conversation history */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-teal-500 text-slate-950 font-medium rounded-br-none shadow-md'
                        : 'bg-slate-850/90 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Quick action pill buttons */}
                  {!isUser && msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.quickActions.map((qa, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(qa.action)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800/80 hover:bg-teal-500/20 border border-slate-700 hover:border-teal-500/40 text-teal-300 transition"
                        >
                          {qa.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 italic bg-slate-850/60 p-2.5 rounded-xl max-w-[120px]">
                <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick preset chips */}
          <div className="px-3 py-1.5 bg-slate-900/40 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => handleSend("I'm feeling quite stressed and overwhelmed today.")}
              className="whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60"
            >
              "I feel stressed"
            </button>
            <button
              onClick={() => handleSend("Why is my sleep score low?")}
              className="whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60"
            >
              "Sleep insights"
            </button>
            <button
              onClick={() => handleSend("Explain how the stress risk score works")}
              className="whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60"
            >
              "How scoring works"
            </button>
          </div>

          {/* Message input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about wellness, breathing, vitals..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 disabled:opacity-30 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Disclaimer footer */}
          <div className="bg-slate-950 px-3 py-1 text-center border-t border-slate-900">
            <span className="text-[9px] text-slate-500">
              Not a medical doctor. For acute emergencies, call 988 or local emergency services.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

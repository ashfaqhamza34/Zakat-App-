import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Send,
  Bot,
  User,
  Sparkles,
  RotateCcw,
  WifiOff,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  MessageSquare,
  ShieldAlert,
  Info,
  X,
} from 'lucide-react';
import { ChatMessage, CalculationResult, AssetInputs } from '../types';
import { formatPKR } from '../utils/formatters';

interface ChatScreenProps {
  calculationResult: CalculationResult;
  inputs: AssetInputs;
  isOnline: boolean;
  onOpenOfflineModal: () => void;
}

const PRESET_QUESTIONS = [
  'Is Zakat due on personal use gold jewelry?',
  'Can I give Zakat to my needy brother or sister?',
  'How is Zakat calculated on residential plots?',
  'Can I deduct my bank loan installments?',
  'Is Zakat due on Provident Fund or Gratuity?',
  'How does the Silver Nisab rule apply to mixed assets?',
];

const INITIAL_GREETING: ChatMessage = {
  id: 'greeting-msg',
  role: 'assistant',
  content: `**Assalamu Alaikum wa Rahmatullahi wa Barakatuh!** 🌙

I am your **AI Zakat & Wealth Assistant**, knowledgeable in Islamic jurisprudence and Zakat standards followed across Pakistan.

How may I assist you today? You can ask about:
- **Nisab thresholds** (Gold vs Silver standards in PKR)
- **Jewelry, cash, business merchandise & real estate** rulings
- **Deductible debts & liabilities**
- **Eligible recipients** (*Masarif-e-Zakat* per Surah At-Tawbah 9:60)

Feel free to pick one of the quick questions below or type your personal question!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const ChatScreen: React.FC<ChatScreenProps> = ({
  calculationResult,
  inputs,
  isOnline,
  onOpenOfflineModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('zakat_chat_history_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read chat history', e);
    }
    return [INITIAL_GREETING];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const [showContextCard, setShowContextCard] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDisclaimerDismissed, setIsDisclaimerDismissed] = useState<boolean>(() => {
    return localStorage.getItem('zakat_ai_disclaimer_dismissed') === 'true';
  });
  const [showFullDisclaimerModal, setShowFullDisclaimerModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Persist messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem('zakat_chat_history_v1', JSON.stringify(messages));
    } catch (e) {
      // safe fallback
    }
  }, [messages]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_GREETING]);
    try {
      localStorage.removeItem('zakat_chat_history_v1');
    } catch (e) {
      // safe fallback
    }
  };

  const handleSendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isLoading) return;

    if (!isOnline) {
      onOpenOfflineModal();
      return;
    }

    const newMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: newMsgId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const userContextPayload = includeContext
        ? {
            cashSavings: inputs.cashSavings,
            goldGrams: inputs.goldGrams,
            goldPurity: inputs.goldPurity,
            goldValue: calculationResult.goldValue,
            silverGrams: inputs.silverGrams,
            silverValue: calculationResult.silverValue,
            businessValue: inputs.businessValue,
            liabilities: inputs.liabilities,
            netWealth: calculationResult.netWealth,
            nisabMethod: calculationResult.nisabMethod,
            nisabThresholdPKR: calculationResult.nisabThresholdPKR,
            isEligible: calculationResult.isEligible,
            zakatDue: calculationResult.zakatDue,
          }
        : null;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userContext: userContextPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned error ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I could not generate an answer right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        isError: true,
        content:
          "Assalamu Alaikum! I encountered a connection issue while reaching the AI service. If you are offline or using a custom proxy, please check your network connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputPrompt);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-h-[820px] max-w-lg mx-auto bg-slate-50 dark:bg-slate-950">
      {/* Top Banner: Context Awareness & Reset */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-heading font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>Mufti AI Assistant</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded font-semibold">
                  Gemini
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Islamic Zakat & Fiqh Guidance • Pakistan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              id="toggle-context-card-btn"
              onClick={() => setShowContextCard((prev) => !prev)}
              className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border transition font-medium ${
                includeContext
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              title="Share your calculator totals with AI"
            >
              <span>{includeContext ? 'Context Linked' : 'Context Off'}</span>
              {showContextCard ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            <button
              type="button"
              id="clear-chat-btn"
              onClick={handleClearHistory}
              title="Clear chat history"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Calculator Context Summary */}
        {showContextCard && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs animate-fade-in space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Active Calculation Snapshot
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeContext}
                  onChange={(e) => setIncludeContext(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-300">
                  Provide to AI for tailored answers
                </span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <div>Net Zakatable Wealth:</div>
              <div className="text-right font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                PKR {formatPKR(calculationResult.netWealth, false)}
              </div>
              <div>Nisab Standard:</div>
              <div className="text-right font-semibold text-slate-900 dark:text-slate-100 uppercase">
                {calculationResult.nisabMethod} (PKR {formatPKR(calculationResult.nisabThresholdPKR, false)})
              </div>
              <div>Status:</div>
              <div className={`text-right font-bold ${calculationResult.isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                {calculationResult.isEligible ? `Due: PKR ${formatPKR(calculationResult.zakatDue, false)}` : 'Below Nisab'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Accuracy & Scholarly Disclaimer Banner */}
      {!isDisclaimerDismissed && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60 px-3 py-2 text-xs text-amber-900 dark:text-amber-200 shrink-0 flex items-start justify-between gap-2 transition-all">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold text-amber-950 dark:text-amber-100">
                AI can make mistakes:
              </span>{' '}
              This assistant provides educational guidance based on Pakistani Hanafi consensus. References and figures should be verified.
              <button
                type="button"
                onClick={() => setShowFullDisclaimerModal(true)}
                className="ml-1 text-amber-800 dark:text-amber-300 font-semibold underline hover:text-amber-900 inline"
              >
                Learn more
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsDisclaimerDismissed(true);
              localStorage.setItem('zakat_ai_disclaimer_dismissed', 'true');
            }}
            className="p-1 text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 rounded-md transition"
            title="Dismiss notice"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Offline Alert if disconnected */}
      {!isOnline && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shrink-0">
          <div className="flex items-center gap-2">
            <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>You are offline. Connect to Wi-Fi to chat with AI.</span>
          </div>
          <button
            type="button"
            onClick={onOpenOfflineModal}
            className="underline font-semibold text-amber-800 dark:text-amber-300"
          >
            Details
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F4C3A] text-white shadow-xs text-xs font-bold mt-1">
                  ☪
                </div>
              )}

              <div
                className={`relative max-w-[88%] rounded-2xl p-3.5 text-xs shadow-2xs leading-relaxed ${
                  isUser
                    ? 'bg-[#0F4C3A] text-white rounded-br-xs'
                    : msg.isError
                    ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200 rounded-bl-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                }`}
              >
                {/* Message Content */}
                <div className="prose prose-xs dark:prose-invert max-w-none break-words">
                  <Markdown>{msg.content}</Markdown>
                </div>

                {/* Footer metadata & copy action */}
                <div
                  className={`mt-2 flex items-center justify-between text-[10px] gap-2 pt-1 border-t ${
                    isUser
                      ? 'border-white/20 text-white/70'
                      : 'border-slate-100 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="tabular-nums">{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.id, msg.content)}
                      className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 transition"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs mt-1">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-2.5 justify-start animate-fade-in">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0F4C3A] text-white shadow-xs text-xs font-bold mt-1">
              ☪
            </div>
            <div className="rounded-2xl rounded-bl-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 shadow-2xs text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <span className="flex gap-1 items-center">
                <span className="h-2 w-2 rounded-full bg-[#0F4C3A] dark:bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-[#0F4C3A] dark:bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-[#0F4C3A] dark:bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="text-[11px] text-slate-500">Consulting Islamic Zakat rulings...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Questions Slider */}
      {messages.length <= 3 && !isLoading && (
        <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-1 mb-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <HelpCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:border-emerald-500/40 transition shrink-0 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputPrompt);
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              id="ai-chat-input"
              rows={1}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isOnline ? "Ask any question about Zakat..." : "Connect internet to ask AI..."}
              disabled={isLoading || !isOnline}
              className="w-full resize-none rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 disabled:opacity-60 max-h-24 overflow-y-auto"
            />
          </div>

          <button
            type="submit"
            id="ai-chat-send-btn"
            disabled={!inputPrompt.trim() || isLoading || !isOnline}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#0F4C3A] hover:bg-[#0c3c2e] active:scale-95 text-white shadow-xs transition disabled:opacity-40 disabled:pointer-events-none"
            title="Send question"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-1.5 flex items-center justify-center gap-2 text-center text-[10px] text-slate-400">
          <span>AI can make mistakes. Consider checking important rulings with a Mufti.</span>
          <button
            type="button"
            onClick={() => setShowFullDisclaimerModal(true)}
            className="text-emerald-700 dark:text-emerald-400 underline font-medium hover:text-emerald-800"
          >
            Disclaimer
          </button>
        </div>
      </div>

      {/* Full Islamic Scholarly & AI Advisory Modal */}
      {showFullDisclaimerModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setShowFullDisclaimerModal(false)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 text-slate-800 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-bold">AI Advisory Notice</h3>
                  <p className="text-[11px] text-slate-500">Zakat & Islamic Jurisprudence</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFullDisclaimerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>Educational Purpose Only:</strong> The AI Assistant utilizes an advanced language model to help summarize mainstream Islamic rulings (predominantly Hanafi Fiqh observed in Pakistan).
              </p>
              <p>
                <strong>Potential for Errors:</strong> Like all generative artificial intelligence, the assistant may occasionally hallucinate citation numbers, confuse secondary details, or provide general answers that might not capture your family's unique financial contract.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Recommended Pakistani Darul Iftas:</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5 pl-1">
                  <li>Darul Uloom Karachi (Mufti Taqi Usmani)</li>
                  <li>Jamia Binoria Aalamia, Site Karachi</li>
                  <li>Jamia Ashrafia, Lahore</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowFullDisclaimerModal(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0F4C3A] hover:bg-[#0c3c2e] text-white text-xs font-semibold shadow-xs transition"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

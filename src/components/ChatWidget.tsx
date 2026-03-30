import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Loader2, User, Bot, HelpCircle, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Welcome to Morphlume Studio. I am your concierge for artistic intelligence. How may I assist your creative process today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const { getUserApiKey } = await import('../services/aiService');
      const apiKey = getUserApiKey() || "";
      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-2.5-flash"; 

      const systemInstruction = `You are a sophisticated concierge for "Morphlume Studio", an exclusive AI creative suite that transforms images and videos into high-end artistic masterpieces.

Key Features to guide users:
1. Visual Atelier (Image Tool):
   - Upload visuals (drag & drop or click).
   - Refinement tab for precision cropping and rotation.
   - Artistry tab to select from 20+ curated intelligence models.
   - LITE (Local, Free, Unlimited) for instant results.
   - PRO (Cloud, High-End) for superior artistic depth.
   - Download your creation to your device.

2. Motion Atelier (Video Tool):
   - Upload cinematic footage.
   - Curate styles.
   - Preview Frame to witness the intelligence.
   - Motion Atelier (Free) for instant flipbook sequences.
   - Master Motion for high-fidelity video transformation (Requires Pro API Key).

3. Intelligence Engines:
   - LITE: Local browser-based intelligence. 100% private, free, and unlimited.
   - PRO: Cloud-based Gemini 2.5 architecture. Professional-grade artistry.

4. Artistic Models:
   - Noir Aesthetic: Dramatic B&W.
   - Renaissance AI: Classical painterly style.
   - Vogue Motion: High-fashion aesthetic.
   - And many more curated models.

Guidance:
- Maintain a professional, sophisticated, and helpful tone.
- Refer to tools as "Ateliers" and features as "Intelligence Models".
- Be encouraging of the user's creative vision.

Keep responses concise and elegant.`;

      const client = new GoogleGenAI({ apiKey });

      const response = await client.models.generateContent({
        model: model,
        contents: [
          { role: 'system', parts: [{ text: systemInstruction }] },
          ...messages.slice(1).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ]
      });

      let botResponse = "I apologize, but I couldn't generate a response at this time.";
      
      try {
        // In @google/genai, response is often returned directly with candidates
        if (response.candidates?.[0]?.content?.parts) {
          const parts = response.candidates[0].content.parts;
          botResponse = parts.map(p => p.text || "").join(" ").trim() || botResponse;
        } else if ((response as any).text) {
           botResponse = (response as any).text;
        }
      } catch (e) {
        console.warn("Chat model failed to return text:", e);
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "I am experiencing a momentary lapse in connectivity. Please try again shortly." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 sm:w-96 glass rounded-[32px] shadow-2xl border border-white/10 overflow-hidden flex flex-col h-[550px]"
          >
            {/* Header */}
            <div className="bg-black p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center shadow-lg shadow-gold/20">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-white font-serif font-bold text-base">Morphlume Concierge</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></span>
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.2em]">Atelier Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/40 custom-scrollbar">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-white/10 ml-3' : 'bg-gold/10 mr-3 border border-gold/20'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-white/60" /> : <Bot className="w-4 h-4 text-gold" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-white/5 text-white/90 rounded-br-none border border-white/10' 
                        : 'bg-gold/5 text-white/90 border border-gold/10 rounded-bl-none italic font-light'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <Loader2 className="w-4 h-4 text-gold animate-spin" />
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Consulting Intelligence...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-black border-t border-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Inquire here..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-gold/30 focus:border-gold/50 transition-all text-white placeholder:text-white/20"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gold text-black rounded-xl hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gold/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-white/20 mt-4 text-center font-bold uppercase tracking-[0.2em]">
                Morphlume Intelligence Atelier
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 border border-white/10 ${
          isOpen 
            ? 'bg-white text-black' 
            : 'bg-gold text-black hover:shadow-gold/40'
        }`}
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-7 h-7" />
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5] 
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-5 h-5 text-black/40 fill-black/40" />
            </motion.div>
          </div>
        )}
      </motion.button>
    </div>
  );
};

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, Navigation, Trash2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const TypingMessage = ({ text, onComplete, children, animate = true }) => {
    const [displayedText, setDisplayedText] = useState(animate ? '' : text);
    const [isTyping, setIsTyping] = useState(animate);

    useEffect(() => {
        if (!animate) {
            setDisplayedText(text);
            setIsTyping(false);
            return;
        }

        let index = 0;
        setDisplayedText('');
        setIsTyping(true);

        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(interval);
                setIsTyping(false);
                if (onComplete) onComplete();
            }
        }, 30);

        return () => clearInterval(interval);
    }, [text, animate]);

    return (
        <div>
            <p className="whitespace-pre-wrap">{displayedText}</p>
            {!isTyping && children}
        </div>
    );
};

const AIChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm QuickBites AI. 🍔 ask me about restaurants, your orders, or what to eat!",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useUser();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleClearChat = () => {
        setMessages([{
            id: Date.now(),
            text: "Hello! I'm QuickBites AI. 🍔 ask me about restaurants, your orders, or what to eat!",
            sender: 'ai',
            timestamp: new Date(),
            hasTyped: false
        }]);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleActionClick = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    const suggestedPrompts = [
        "📦 Track Order",
        "🥗 Veg Options",
        "🍔 Suggest Lunch",
        "❓ Help"
    ];

    const handleChipClick = (prompt) => {
        const text = prompt.replace(/^[\p{Emoji}\s]+/gu, '');
        sendMessage(text);
    };

    const sendMessage = async (text) => {
        if (!text.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({
                    message: userMessage.text,
                    userId: user?._id
                })
            });

            const data = await response.json();

            if (data.success) {
                let replyText = data.reply;
                let actions = [];

                const navRegex = /\[NAVIGATE:([^\]]+)\]/g;
                let match;

                while ((match = navRegex.exec(replyText)) !== null) {
                    actions.push(match[1]);
                }

                replyText = replyText.replace(navRegex, '').trim();

                const aiMessage = {
                    id: Date.now() + 1,
                    text: replyText,
                    sender: 'ai',
                    timestamp: new Date(),
                    actions: actions
                };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error(data.message || 'Failed to get response');
            }

        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.",
                sender: 'ai',
                timestamp: new Date(),
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-[90vw] sm:w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl mb-4 overflow-hidden flex flex-col pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 pt-5 pb-5 text-white flex justify-between items-center shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                    <Sparkles className="w-5 h-5 text-yellow-200" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">QuickBites AI</h3>
                                    <div className="flex items-center gap-1.5 opacity-90">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-xs font-medium">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleClearChat}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    aria-label="Clear chat"
                                    title="Clear Chat"
                                >
                                    <Trash2 className="w-4 h-4 text-white/90" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    aria-label="Close chat"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={`flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-orange-100 text-orange-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                        }`}>
                                        {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>

                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-orange-500 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                        } ${msg.isError ? 'bg-red-50 text-red-600 border-red-100' : ''}`}>

                                        {msg.sender === 'ai' ? (
                                            <TypingMessage
                                                text={msg.text}
                                                animate={!msg.hasTyped}
                                                onComplete={() => {
                                                    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, hasTyped: true } : m));
                                                    scrollToBottom();
                                                }}
                                            >
                                                {/* Action Buttons inside TypingMessage to show AFTER typing */}
                                                {msg.actions && msg.actions.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {msg.actions.map((action, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleActionClick(action)}
                                                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors w-full text-xs font-semibold border border-blue-100 text-left animate-fade-in"
                                                            >
                                                                <Navigation className="w-3 h-3 flex-shrink-0" />
                                                                <span className="truncate">
                                                                    {action.includes('track-order') ? 'Track Order' :
                                                                        action.includes('search=') ? `View ${decodeURIComponent(action.split('search=')[1])}` :
                                                                            'Take me there'}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </TypingMessage>
                                        ) : (
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        )}

                                        {/* Fallback for User Messages to show actions if any (though unlikely for user) */}
                                        {msg.sender === 'user' && msg.actions && msg.actions.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {/* ... actions ... */}
                                                {/* Simplified: User messages usually don't have actions in this flow */}
                                            </div>
                                        )}

                                        <span className={`text-[10px] mt-1 block opacity-60 ${msg.sender === 'user' ? 'text-orange-100' : 'text-gray-400'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>


                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex items-center gap-2 text-gray-400 text-sm ml-10">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Thinking...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Prompts (Chips) */}
                        <div className="px-4 pb-2 bg-white flex gap-2 overflow-x-auto scrollbar-hide">
                            {suggestedPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleChipClick(prompt)}
                                    disabled={isLoading}
                                    className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-full transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            {/* Form uses sendMessage now? No, need to keep handleSendMessage for form, but refactor form submit */}
                            <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputText); }} className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Ask about food, orders..."
                                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl border-transparent focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none text-sm"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isLoading}
                                    className="bg-orange-500 text-white p-2.5 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-orange-200"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto bg-gradient-to-r from-orange-500 to-red-600 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl hover:shadow-orange-200 transition-all z-50"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X className="w-7 h-7" />
                        </motion.div>
                    ) : (
                        <motion.div key="chat" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
                            <MessageCircle className="w-7 h-7" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

export default AIChatBot;

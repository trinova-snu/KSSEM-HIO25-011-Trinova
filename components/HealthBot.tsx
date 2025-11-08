import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useLanguage } from '../contexts/LanguageContext';
import { UserIcon, BotIcon, CloseIcon, MicrophoneIcon } from './icons';

// Fix for SpeechRecognition TypeScript error. This is a browser API.
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: any) => void) | null;
    onresult: ((event: any) => void) | null;
    start: () => void;
    stop: () => void;
}

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

interface HealthBotProps {
    onClose: () => void;
}

const HealthBot: React.FC<HealthBotProps> = ({ onClose }) => {
    const { t, language } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Fix for SpeechRecognition TypeScript error by accessing via `any` and removing ts-ignore.
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        const recognition: SpeechRecognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        const langMap: { [key: string]: string } = {
            'en': 'en-US', 'es': 'es-ES', 'hi': 'hi-IN', 'fr': 'fr-FR', 'de': 'de-DE', 'ta': 'ta-IN'
        };
        recognition.lang = langMap[language] || 'en-US';

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);
        };
        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setInput(transcript);
        };
        recognitionRef.current = recognition;
    }, [language]);


    useEffect(() => {
        const languageMap: { [key: string]: string } = {
            'en': 'English', 'es': 'Spanish', 'hi': 'Hindi', 'fr': 'French', 'de': 'German', 'ta': 'Tamil'
        };
        const currentLanguageName = languageMap[language] || 'English';
        const systemInstruction = `You are a friendly and knowledgeable HealthBot. You can help users create diet plans, answer health-related questions, and provide general wellness advice. Always remind the user that you are not a medical professional and they should consult a doctor for any serious health concerns. Keep your responses concise and easy to understand. IMPORTANT: The user is speaking ${currentLanguageName}. You MUST respond in ${currentLanguageName}.`;
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
            },
        });

        // Reset messages and add welcome message in the new language
        setMessages([{
            sender: 'bot',
            text: t('healthBot.welcome'),
        }]);

    }, [t, language]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await chatRef.current.sendMessageStream({ message: input });
            let botResponse = '';
            setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

            for await (const chunk of stream) {
                botResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = botResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: t('healthBot.error') }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleRecording = () => {
        if (!recognitionRef.current) return;
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setInput(''); // Clear input for new recording
            recognitionRef.current.start();
        }
    };

    const renderMessage = (msg: Message, index: number) => {
        const isUser = msg.sender === 'user';
        return (
            <div key={index} className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
                {!isUser && (
                    <div className="bg-light-bg p-2 rounded-full border border-border-color flex-shrink-0">
                        <BotIcon className="w-5 h-5 text-primary" />
                    </div>
                )}
                <div className={`max-w-md md:max-w-lg rounded-xl p-4 ${isUser ? 'bg-primary text-white' : 'bg-light-bg text-text-light'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                 {isUser && (
                    <div className="bg-light-bg p-2 rounded-full border border-border-color flex-shrink-0">
                        <UserIcon className="w-5 h-5 text-secondary" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-dark-bg/50 rounded-2xl border border-border-color max-w-4xl mx-auto flex flex-col h-full shadow-2xl w-full">
            <div className="relative p-4 border-b border-border-color text-center">
                <h2 className="text-xl font-bold text-primary">{t('healthBot.title')}</h2>
                 <button
                    onClick={onClose}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-text-dark hover:text-text-light transition-colors"
                    aria-label="Close HealthBot"
                >
                    <CloseIcon />
                </button>
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {messages.map(renderMessage)}
                {isLoading && messages[messages.length - 1].sender === 'user' && (
                     <div className="flex items-start gap-3">
                        <div className="bg-light-bg p-2 rounded-full border border-border-color">
                            <BotIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="max-w-md md:max-w-lg rounded-xl p-4 bg-light-bg text-text-light">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-border-color">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('healthBot.placeholder')}
                        className="flex-1 bg-light-bg border border-border-color rounded-full px-5 py-3 text-text-light focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                    />
                    {recognitionRef.current && (
                         <button
                            type="button"
                            onClick={handleToggleRecording}
                            className={`flex-shrink-0 text-white p-3.5 rounded-full transition-colors ${
                                isRecording ? 'bg-danger animate-pulse' : 'bg-secondary hover:bg-blue-500'
                            }`}
                        >
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button type="submit" className="bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-hover transition-colors disabled:opacity-50" disabled={isLoading || !input.trim()}>
                        Send
                    </button>
                </form>
                 <p className="text-xs text-text-dark text-center mt-3 px-4">{t('healthBot.disclaimer')}</p>
            </div>
        </div>
    );
};

export default HealthBot;
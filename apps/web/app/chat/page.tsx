'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Database, Code, Table2, Home, Users, ChevronDown as ChevronDownIcon } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sql?: string;
    results?: any[];
    timestamp: Date;
}

export default function ChatWithDataPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat-with-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: input }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message || 'Query executed successfully',
                sql: data.sql,
                results: data.results,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error: any) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Error: ${error.message}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div className="w-64 bg-white border-r border-gray-200 p-6 hidden lg:flex flex-col">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            A
                        </div>
                        <div>
                            <div className="text-gray-900 font-semibold">Analytics</div>
                        </div>
                        <ChevronDownIcon className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                </div>

                <div className="mb-8 flex-1">
                    <nav className="space-y-1">
                        <Link href="/chat" className="flex items-center p-2.5 rounded-lg bg-blue-50 text-blue-600 font-medium">
                            <Users className="w-4 h-4 mr-3" /> Chat with Data
                        </Link>
                        <Link href="/" className="flex items-center p-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                            <Home className="w-4 h-4 mr-3" /> Dashboard
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">F</span>
                        </div>
                        <span className="text-gray-900 font-bold text-sm">Flowbit AI</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="bg-white border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Database className="w-6 h-6 text-blue-600" />
                            <h1 className="text-2xl font-extrabold text-gray-900">Chat with Data</h1>
                        </div>
                        <p className="text-sm text-gray-500 hidden sm:block">Natural Language Analytics</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-20">
                            <Database className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                            <p className="text-xl font-bold text-gray-900 mb-2">Start a conversation</p>
                            <p className="text-sm text-gray-600 mb-6">Ask questions about your data in plain English</p>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto">
                                <h3 className="text-sm font-semibold text-blue-900 mb-3">💡 Example Questions</h3>
                                <ul className="text-xs text-blue-800 space-y-2 text-left">
                                    <li>• What's the total spend in the last 90 days?</li>
                                    <li>• List top 5 vendors by spend</li>
                                    <li>• Show overdue invoices as of today</li>
                                    <li>• What's the average invoice value?</li>
                                    <li>• How many invoices were processed this month?</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-3xl rounded-xl p-6 shadow-sm ${
                                    message.role === 'user'
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                        : 'bg-white border border-gray-200'
                                }`}
                            >
                                <p className="whitespace-pre-wrap">{message.content}</p>

                                {message.sql && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Code className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-700">Generated SQL:</span>
                                        </div>
                                        <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                                            {message.sql}
                                        </pre>
                                    </div>
                                )}

                                {message.results && message.results.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Table2 className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-700">
                                                Results ({message.results.length} rows):
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-xs border border-gray-300">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        {Object.keys(message.results[0]).map((key) => (
                                                            <th
                                                                key={key}
                                                                className="px-3 py-2 text-left font-semibold text-gray-700 border-b"
                                                            >
                                                                {key}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {message.results.slice(0, 10).map((row: any, idx: number) => (
                                                        <tr key={idx} className="border-b">
                                                            {Object.values(row).map((val: any, colIdx: number) => (
                                                                <td
                                                                    key={colIdx}
                                                                    className="px-3 py-2 text-gray-700"
                                                                >
                                                                    {String(val)}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {message.results.length > 10 && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Showing first 10 of {message.results.length} rows
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-end space-x-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask a question about your data..."
                            className="flex-1 min-h-[60px] max-h-[200px] p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-gray-50 transition-all"
                            rows={2}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium transition-all shadow-sm"
                        >
                            <Send className="w-4 h-4" />
                            <span>Send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


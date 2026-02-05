'use client';

import { motion } from 'framer-motion';
import {
    MessageSquare,
    Search,
    Plus,
    MoreVertical,
    User,
    Send,
    Phone,
    Video,
    Info,
    CheckCheck,
    Users,
    Paperclip,
    Smile
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
    const [selectedChat, setSelectedChat] = useState<number | null>(1);

    const chats = [
        { id: 1, name: "Klasse 4A", lastMsg: "Wann ist der Abgabetermin für...", time: "12:30", unread: 3, type: "class", avatar: "4A" },
        { id: 2, name: "Max Mustermann", lastMsg: "Ich habe eine Frage zum Modul 2", time: "Gestern", unread: 0, type: "student", avatar: "M" },
        { id: 3, name: "Support Team", lastMsg: "Ihre Lizenzanfrage wurde...", time: "Mo", unread: 0, type: "support", avatar: "S" },
        { id: 4, name: "Kollege Wagner", lastMsg: "Schickst du mir die Unterlagen?", time: "2. Feb", unread: 0, type: "teacher", avatar: "W" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[calc(100vh-160px)] flex gap-6"
        >
            {/* Sidebar List */}
            <div className="w-full md:w-80 lg:w-96 flex flex-col gap-6 shrink-0">
                <div className="flex justify-between items-center px-4">
                    <h1 className="text-3xl font-black text-slate-900">Nachrichten</h1>
                    <Button variant="ghost" size="icon" className="rounded-xl bg-white shadow-sm border border-slate-100">
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                <div className="relative group mx-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Suchen..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium outline-none shadow-sm focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 px-4 custom-scrollbar">
                    {chats.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => setSelectedChat(chat.id)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all group relative",
                                selectedChat === chat.id
                                    ? "bg-white shadow-xl shadow-blue-500/5 ring-1 ring-blue-50"
                                    : "hover:bg-white/50"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm shrink-0",
                                chat.type === 'class' ? "bg-indigo-100 text-indigo-700" :
                                    chat.type === 'support' ? "bg-blue-100 text-blue-700" :
                                        "bg-slate-100 text-slate-700"
                            )}>
                                {chat.avatar}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-slate-900 truncate pr-2">{chat.name}</h4>
                                    <span className="text-[10px] uppercase font-black text-slate-400 shrink-0">{chat.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 truncate font-medium">
                                    {chat.lastMsg}
                                </p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="absolute top-4 right-4 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-blue-500/20">
                                    {chat.unread}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat View */}
            <Card className="flex-1 premium-card border-none bg-white shadow-xl rounded-[2.5rem] overflow-hidden flex flex-col min-w-0">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black text-lg">
                                    {chats.find(c => c.id === selectedChat)?.avatar}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg">
                                        {chats.find(c => c.id === selectedChat)?.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full w-fit">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                    <Phone className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                    <Video className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50/30">
                            <div className="flex flex-col items-center">
                                <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm border border-slate-50">
                                    Heute
                                </span>
                            </div>

                            {/* Message Bubble - Left */}
                            <div className="flex gap-4 max-w-[80%]">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 font-bold text-xs">M</div>
                                <div className="space-y-1">
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-50">
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed text-pretty">
                                            Hallo Max! Wie kommst du mit dem Abschlussprojekt voran? Brauchst du Hilfe bei der Datenbank-Struktur?
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 ml-1">12:30</span>
                                </div>
                            </div>

                            {/* Message Bubble - Right */}
                            <div className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
                                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 font-bold text-xs text-white">L</div>
                                <div className="space-y-1 flex flex-col items-end">
                                    <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none shadow-lg shadow-blue-500/10">
                                        <p className="text-sm font-medium text-white leading-relaxed text-pretty">
                                            Danke der Nachfrage! Ich hänge gerade noch beim UI-Design, aber die Logik steht eigentlich schon fast. 👍
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-[10px] font-bold text-slate-400">12:45</span>
                                        <CheckCheck className="w-3 h-3 text-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-slate-50">
                            <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-[2rem] border border-slate-100 group focus-within:ring-4 focus-within:ring-blue-600/5 focus-within:bg-white transition-all">
                                <Button variant="ghost" size="icon" className="rounded-full text-slate-400 shrink-0">
                                    <Plus className="w-5 h-5" />
                                </Button>
                                <input
                                    type="text"
                                    placeholder="Nachricht schreiben..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium px-2 py-1 placeholder:text-slate-400"
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
                                        <Smile className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
                                        <Paperclip className="w-5 h-5" />
                                    </Button>
                                    <Button className="bg-blue-600 text-white rounded-full w-10 h-10 p-0 shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform">
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-6">
                        <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-600 shadow-inner">
                            <MessageSquare className="w-12 h-12" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Ihre Nachrichten</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                Wählen Sie einen Chat aus der Liste aus, um Nachrichten zu lesen oder eine neue Unterhaltung zu beginnen.
                            </p>
                        </div>
                        <Button className="bg-slate-900 text-white rounded-xl font-bold px-8 h-12 shadow-xl shadow-slate-900/10">
                            Chat starten
                        </Button>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}

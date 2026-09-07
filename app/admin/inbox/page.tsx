"use client";

import { useState, useEffect } from "react";
import { Mail, MailOpen, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

const SUBJECT_COLORS: Record<string, string> = {
  "General Enquiry": "bg-gray-100 text-gray-700",
  "News Tip / Story Idea": "bg-yellow-100 text-yellow-800",
  "Advertise with Us": "bg-green-100 text-green-800",
  "Correction Request": "bg-red-100 text-red-800",
  "Partnership": "bg-blue-100 text-blue-800",
  "Other": "bg-gray-100 text-gray-700",
};

export default function InboxPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMessages(); }, []);

  async function fetchMessages() {
    setLoading(true);
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages((data as Message[]) || []);
    setLoading(false);
  }

  async function openMessage(msg: Message) {
    setSelected(msg);
    if (!msg.is_read) {
      await supabase.from("contact_messages").update({ is_read: true }).eq("id", msg.id);
      setMessages(messages.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages(messages.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Inbox
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">Contact form submissions from your website.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex min-h-[500px]">
        {/* Message List */}
        <div className="w-full md:w-80 border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="animate-spin mr-2" size={18} /> Loading...
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm px-4">
              <Mail size={32} className="mx-auto mb-3 opacity-40" />
              No messages yet
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {messages.map(msg => (
                <li
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={`px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selected?.id === msg.id ? "bg-blue-50 border-l-2 border-blue-600" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold text-sm ${!msg.is_read ? "text-gray-900" : "text-gray-600"}`}>
                      {msg.name}
                    </span>
                    {!msg.is_read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate mb-1">{msg.subject}</div>
                  <div className="text-xs text-gray-400 truncate">{msg.message}</div>
                  <div className="text-xs text-gray-400 mt-1.5">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Message Detail */}
        <div className="flex-1 p-8">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.subject}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${SUBJECT_COLORS[selected.subject] || "bg-gray-100 text-gray-700"}`}>
                      {selected.subject}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                    className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MailOpen size={15} /> Reply
                  </a>
                  <button
                    onClick={() => deleteMessage(selected.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <div className="text-sm font-medium text-gray-500 mb-0.5">From</div>
                <div className="font-bold text-gray-900">{selected.name}</div>
                <a href={`mailto:${selected.email}`} className="text-blue-600 text-sm hover:underline">{selected.email}</a>
              </div>

              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                {selected.message}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
              <Mail size={48} className="mb-4 opacity-30" />
              <p className="text-sm">Select a message to read it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

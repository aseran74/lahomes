"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from './messages.d';

export default function MessagesList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) return <div className="p-4 text-gray-500">Loading messages...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Messages</h2>
      <div className="space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">{message.sender_name}</span>
              <span className="text-sm text-gray-500">
                {new Date(message.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-700">{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

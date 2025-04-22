export interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_email: string;
  created_at: string;
  updated_at?: string;
  is_read?: boolean;
}


export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  interest?: string;
  role: UserRole;
  createdAt: number;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnail: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

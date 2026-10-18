export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  image?: string;
  imageUrl?: string;
  plan?: "free" | "premium" | "business";
}

export interface Participant {
  id?: string;
  userId?: string;
  name: string;
  email?: string;
  image?: string;
  joinedAt?: string;
  leftAt?: string | null;
  isHost?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isHandRaised?: boolean;
}

export interface ChatMessage {
  id: string;
  meetingId?: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  text: string;
  timestamp: string;
  time?: string;
  isLocal?: boolean;
  isSystem?: boolean;
}

export interface Meeting {
  id: number | string;
  meetingId: string;
  title: string;
  description?: string;
  status: "active" | "scheduled" | "ended";
  createdAt: string;
  scheduledFor?: string;
  duration?: number; // duration in minutes
  endedAt?: string | null;
  passcode?: string;
  requirePasscode?: boolean;
  waitingRoom?: boolean;
  muteOnEntry?: boolean;
  host: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  participants?: Participant[];
  messages?: ChatMessage[];
  recordingUrl?: string;
}

export interface Recording {
  id: string;
  meetingId: string;
  title: string;
  date: string;
  duration: string; // e.g. "45 min"
  fileSize: string; // e.g. "342 MB"
  thumbnail: string;
  videoUrl: string;
  hostName: string;
  views: number;
}

export interface MeetingStats {
  plan: string;
  monthlyCount: number;
  monthlyLimit: number | null;
  maxParticipants: number;
  totalMinutes: number;
  activeMeetingsCount: number;
}

export interface UserSettings {
  preferredCameraId?: string;
  preferredMicId?: string;
  preferredSpeakerId?: string;
  blurBackground: boolean;
  noiseSuppression: boolean;
  hdVideo: boolean;
  mirrorCamera: boolean;
  emailReminders: boolean;
  browserNotifications: boolean;
  soundAlerts: boolean;
  theme: "light" | "dark" | "system";
}

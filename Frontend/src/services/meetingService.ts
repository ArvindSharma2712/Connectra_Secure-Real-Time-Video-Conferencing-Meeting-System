import type { Meeting, MeetingStats, Recording, User, UserSettings } from "../types";

// Base URL for future Express backend integration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const defaultMockUser: User = {
  id: "user_mock_001",
  fullName: "Alex Rivera",
  firstName: "Alex",
  lastName: "Rivera",
  name: "Alex Rivera",
  email: "alex.rivera@example.com",
  imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
  plan: "premium",
};

export const defaultMockStats: MeetingStats = {
  plan: "premium",
  monthlyCount: 8,
  monthlyLimit: null, // Unlimited for premium
  maxParticipants: 100,
  totalMinutes: 1420,
  activeMeetingsCount: 1,
};

const INITIAL_SESSIONS: Meeting[] = [
  {
    id: 1,
    meetingId: "qwe-rty-uio",
    title: "Sprint Planning & Roadmap Review",
    description: "Aligning team on Q3 deliverables, architecture revamps, and timeline estimates.",
    status: "ended",
    createdAt: "2026-08-14T09:30:00.000Z",
    endedAt: "2026-08-14T10:45:00.000Z",
    duration: 75,
    host: {
      id: "user_mock_001",
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    },
    participants: [
      {
        userId: "user_mock_001",
        name: "Alex Rivera",
        email: "alex.rivera@example.com",
        joinedAt: "2026-08-14T09:30:00.000Z",
        leftAt: "2026-08-14T10:45:00.000Z",
        isHost: true,
      },
      {
        userId: "user_mock_002",
        name: "Sarah Chen",
        email: "sarah.chen@example.com",
        joinedAt: "2026-08-14T09:31:12.000Z",
        leftAt: "2026-08-14T10:44:20.000Z",
      },
      {
        userId: "user_mock_003",
        name: "Marcus Vance",
        email: "marcus.vance@example.com",
        joinedAt: "2026-08-14T09:32:05.000Z",
        leftAt: "2026-08-14T10:45:00.000Z",
      },
      {
        userId: "user_mock_004",
        name: "Elena Rostova",
        email: "elena.rostova@example.com",
        joinedAt: "2026-08-14T09:35:40.000Z",
        leftAt: "2026-08-14T10:40:15.000Z",
      },
    ],
    messages: [
      {
        id: "m1",
        senderId: "user_mock_001",
        senderName: "Alex Rivera",
        text: "Welcome everyone! Let's kick off with the Q3 milestone updates.",
        timestamp: "2026-08-14T09:31:00.000Z",
      },
      {
        id: "m2",
        senderId: "user_mock_002",
        senderName: "Sarah Chen",
        text: "The frontend redesign is 90% completed and currently in QA review.",
        timestamp: "2026-08-14T09:34:10.000Z",
      },
      {
        id: "m3",
        senderId: "user_mock_003",
        senderName: "Marcus Vance",
        text: "Backend API endpoints are ready on staging server.",
        timestamp: "2026-08-14T09:36:22.000Z",
      },
      {
        id: "m4",
        senderId: "user_mock_001",
        senderName: "Alex Rivera",
        text: "Awesome work team. Let's aim for shipping next Wednesday!",
        timestamp: "2026-08-14T09:42:00.000Z",
      },
    ],
  },
  {
    id: 2,
    meetingId: "zxc-vbn-mas",
    title: "Product Design Critique & Demo",
    description: "Interactive walkthrough of high-fidelity design components and user journey maps.",
    status: "active",
    createdAt: new Date().toISOString(),
    scheduledFor: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    duration: 45,
    host: {
      id: "user_mock_002",
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
    participants: [
      {
        userId: "user_mock_002",
        name: "Sarah Chen",
        email: "sarah.chen@example.com",
        joinedAt: new Date().toISOString(),
        isHost: true,
      },
      {
        userId: "user_mock_001",
        name: "Alex Rivera",
        email: "alex.rivera@example.com",
        joinedAt: new Date().toISOString(),
      },
      {
        userId: "user_mock_005",
        name: "David Kim",
        email: "david.kim@example.com",
        joinedAt: new Date().toISOString(),
      },
    ],
    messages: [
      {
        id: "m10",
        senderId: "user_mock_002",
        senderName: "Sarah Chen",
        text: "Sharing my screen now to show the updated mobile layout.",
        timestamp: new Date().toISOString(),
      },
      {
        id: "m11",
        senderId: "user_mock_001",
        senderName: "Alex Rivera",
        text: "The new sidebar drawer looks super clean!",
        timestamp: new Date().toISOString(),
      },
    ],
  },
  {
    id: 3,
    meetingId: "abc-def-ghi",
    title: "Weekly Engineering Standup",
    description: "Weekly sync on blockers, CI/CD pipeline health, and deploy schedules.",
    status: "scheduled",
    createdAt: "2026-08-13T10:00:00.000Z",
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    duration: 30,
    host: {
      id: "user_mock_001",
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    },
    participants: [
      {
        userId: "user_mock_001",
        name: "Alex Rivera",
        email: "alex.rivera@example.com",
        isHost: true,
      },
      {
        userId: "user_mock_004",
        name: "Elena Rostova",
        email: "elena.rostova@example.com",
      },
    ],
    messages: [],
  },
  {
    id: 4,
    meetingId: "cnt-892-xpk",
    title: "Quarterly Strategy & Leadership Review",
    description: "Executive presentation and budget allocations for H2 initiatives.",
    status: "scheduled",
    createdAt: new Date().toISOString(),
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), // 3 days later
    duration: 60,
    host: {
      id: "user_mock_001",
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    },
    participants: [
      {
        userId: "user_mock_001",
        name: "Alex Rivera",
        email: "alex.rivera@example.com",
        isHost: true,
      },
    ],
  },
];

const INITIAL_RECORDINGS: Recording[] = [
  {
    id: "rec_001",
    meetingId: "qwe-rty-uio",
    title: "Sprint Planning & Roadmap Review",
    date: "August 14, 2026",
    duration: "1h 15m",
    fileSize: "428 MB",
    thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    hostName: "Alex Rivera",
    views: 14,
  },
  {
    id: "rec_002",
    meetingId: "arc-design-392",
    title: "Design System Architecture Sync",
    date: "August 10, 2026",
    duration: "48m",
    fileSize: "275 MB",
    thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    hostName: "Sarah Chen",
    views: 29,
  },
  {
    id: "rec_003",
    meetingId: "sec-audit-102",
    title: "Security & SOC2 Compliance Briefing",
    date: "August 04, 2026",
    duration: "32m",
    fileSize: "189 MB",
    thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    hostName: "Elena Rostova",
    views: 8,
  },
];

const STORAGE_KEYS = {
  MEETINGS: "connectra_meetings",
  RECORDINGS: "connectra_recordings",
  SETTINGS: "connectra_settings",
};

function getStoredMeetings(): Meeting[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error("Failed to load meetings from storage:", err);
  }
  return INITIAL_SESSIONS;
}

function saveStoredMeetings(meetings: Meeting[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  } catch (err) {
    console.error("Failed to save meetings to storage:", err);
  }
}

export const meetingService = {
  // Sync user profile to Neon PostgreSQL
  async syncUserWithBackend(user: User): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/users/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          clerkId: user.id,
          email: user.email,
          name: user.name || user.fullName || "User",
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.image || user.imageUrl,
          plan: user.plan || "free",
        }),
      });
    } catch (err) {
      console.warn("Could not sync user with backend:", err);
    }
  },

  async getMeetings(): Promise<Meeting[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/meetings`);
      if (res.ok) {
        const data = await res.json();
        saveStoredMeetings(data);
        return data;
      }
    } catch {}
    return getStoredMeetings();
  },

  async getMeetingById(meetingId: string): Promise<Meeting | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/meetings/${meetingId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const meetings = getStoredMeetings();
    const found = meetings.find(
      (m) => m.meetingId.toLowerCase() === meetingId.toLowerCase() || String(m.id) === meetingId
    );
    return found || null;
  },

  async createMeeting(params: {
    title: string;
    description?: string;
    scheduledFor?: string;
    duration?: number;
    passcode?: string;
    waitingRoom?: boolean;
    muteOnEntry?: boolean;
    hostUser?: User;
  }): Promise<Meeting> {
    try {
      const res = await fetch(`${API_BASE_URL}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const created = await res.json();
        const existing = getStoredMeetings();
        saveStoredMeetings([created, ...existing]);
        return created;
      }
    } catch {}

    const letters = "abcdefghijklmnopqrstuvwxyz";
    const part = (len: number) =>
      Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
    const newMeetingId = `${part(3)}-${part(3)}-${part(3)}`;

    const newMeeting: Meeting = {
      id: Date.now(),
      meetingId: newMeetingId,
      title: params.title || "Instant Meeting",
      description: params.description || "",
      status: params.scheduledFor ? "scheduled" : "active",
      createdAt: new Date().toISOString(),
      scheduledFor: params.scheduledFor || new Date().toISOString(),
      duration: params.duration || 45,
      passcode: params.passcode,
      requirePasscode: Boolean(params.passcode),
      waitingRoom: params.waitingRoom ?? true,
      muteOnEntry: params.muteOnEntry ?? false,
      host: {
        id: params.hostUser?.id || defaultMockUser.id,
        name: params.hostUser?.name || defaultMockUser.name,
        email: params.hostUser?.email || defaultMockUser.email,
        image: params.hostUser?.image || defaultMockUser.image,
      },
      participants: [
        {
          userId: params.hostUser?.id || defaultMockUser.id,
          name: params.hostUser?.name || defaultMockUser.name,
          email: params.hostUser?.email || defaultMockUser.email,
          isHost: true,
          joinedAt: new Date().toISOString(),
        },
      ],
      messages: [],
    };

    const existing = getStoredMeetings();
    const updated = [newMeeting, ...existing];
    saveStoredMeetings(updated);
    return newMeeting;
  },

  async updateMeeting(id: number | string, data: Partial<Meeting>): Promise<Meeting | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.meeting;
      }
    } catch {}

    const meetings = getStoredMeetings();
    const index = meetings.findIndex((m) => m.id === id || m.meetingId === id);
    if (index === -1) return null;

    meetings[index] = { ...meetings[index], ...data };
    saveStoredMeetings(meetings);
    return meetings[index];
  },

  async deleteMeeting(id: number | string): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/meetings/${id}`, { method: "DELETE" });
    } catch {}

    const meetings = getStoredMeetings();
    const filtered = meetings.filter((m) => m.id !== id && m.meetingId !== id);
    saveStoredMeetings(filtered);
    return true;
  },

  async getRecordings(): Promise<Recording[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/recordings`);
      if (res.ok) return await res.json();
    } catch {}

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECORDINGS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_RECORDINGS;
  },

  async createRecording(data: {
    meetingId: string;
    title: string;
    duration: string;
    fileSize: string;
    thumbnail?: string;
    videoUrl?: string;
    hostName: string;
  }): Promise<Recording> {
    try {
      const res = await fetch(`${API_BASE_URL}/recordings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {}

    const newRec: Recording = {
      id: `rec_${Date.now()}`,
      meetingId: data.meetingId,
      title: data.title,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      duration: data.duration,
      fileSize: data.fileSize,
      thumbnail: data.thumbnail || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
      videoUrl: data.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      hostName: data.hostName,
      views: 0,
    };

    try {
      const existing = await this.getRecordings();
      const updated = [newRec, ...existing];
      localStorage.setItem(STORAGE_KEYS.RECORDINGS, JSON.stringify(updated));
    } catch {}

    return newRec;
  },

  async getStats(): Promise<MeetingStats> {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      if (res.ok) return await res.json();
    } catch {}

    const meetings = getStoredMeetings();
    return {
      ...defaultMockStats,
      monthlyCount: meetings.length,
      activeMeetingsCount: meetings.filter((m) => m.status === "active").length,
    };
  },

  async getUserSettings(): Promise<UserSettings> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      blurBackground: false,
      noiseSuppression: true,
      hdVideo: true,
      mirrorCamera: true,
      emailReminders: true,
      browserNotifications: true,
      soundAlerts: true,
      theme: "light",
    };
  },

  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  },
};

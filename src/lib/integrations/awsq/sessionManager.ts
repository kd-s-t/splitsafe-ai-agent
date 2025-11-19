export interface QSession {
  sessionId: string;
  conversationId?: string;
  createdAt: number;
  lastUsedAt: number;
  messageCount: number;
}

class SessionManager {
  private sessions: Map<string, QSession> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_SESSIONS = 10;

  createSession(): QSession {
    this.cleanupExpiredSessions();

    const session: QSession = {
      sessionId: this.generateSessionId(),
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      messageCount: 0
    };

    this.sessions.set(session.sessionId, session);
    return session;
  }

  getSession(sessionId: string): QSession | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    if (this.isSessionExpired(session)) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  updateSession(sessionId: string, updates: Partial<QSession>): void {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      Object.assign(session, updates, {
        lastUsedAt: Date.now()
      });
    }
  }

  incrementMessageCount(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.messageCount++;
      session.lastUsedAt = Date.now();
    }
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  clearAllSessions(): void {
    this.sessions.clear();
  }

  private isSessionExpired(session: QSession): boolean {
    return Date.now() - session.lastUsedAt > this.SESSION_TIMEOUT;
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastUsedAt > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId);
      }
    }

    expiredSessions.forEach(sessionId => this.sessions.delete(sessionId));

    // If still too many sessions, remove oldest ones
    if (this.sessions.size > this.MAX_SESSIONS) {
      const sortedSessions = Array.from(this.sessions.entries())
        .sort((a, b) => a[1].lastUsedAt - b[1].lastUsedAt);

      const toRemove = sortedSessions.slice(0, this.sessions.size - this.MAX_SESSIONS);
      toRemove.forEach(([sessionId]) => this.sessions.delete(sessionId));
    }
  }

  private generateSessionId(): string {
    return `q-session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  getActiveSessions(): QSession[] {
    this.cleanupExpiredSessions();
    return Array.from(this.sessions.values());
  }

  getSessionStats(sessionId: string): {
    messageCount: number;
    duration: number;
    isActive: boolean;
  } | null {
    const session = this.getSession(sessionId);
    
    if (!session) {
      return null;
    }

    return {
      messageCount: session.messageCount,
      duration: Date.now() - session.createdAt,
      isActive: !this.isSessionExpired(session)
    };
  }
}

export const qSessionManager = new SessionManager();

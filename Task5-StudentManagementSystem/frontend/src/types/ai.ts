export interface Recommendation {
  id: string;
  studentId: string;
  type: 'ACADEMIC_RISK' | 'EXCELLENCE' | 'ATTENDANCE_WARNING' | 'CAREER_PATH';
  title: string;
  description: string;
  confidence: number; // 0 to 1
  suggestedAction: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

// Digital Portfolio configuration templates and service wrappers
export interface PortfolioItem {
  id: string;
  studentId: string;
  title: string;
  category: 'PROJECT' | 'CERTIFICATE' | 'RESEARCH' | 'VOLUNTEER';
  description: string;
  url?: string;
  dateAwarded: string;
}

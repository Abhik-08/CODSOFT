export interface ProjectItem {
  title: string;
  description: string;
  link?: string;
  technologies?: string;
  role?: string;
}

export interface AchievementItem {
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface CertificateItem {
  name: string;
  issuingOrganization?: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface Portfolio {
  id?: string;
  studentId: string | number;
  portfolioName: string;
  templateType: string; // e.g. "Developer", "Data Analyst", "AI Engineer", etc.
  title: string;
  summary: string;
  skills: string[];
  projects: ProjectItem[];
  achievements: AchievementItem[];
  certificates: CertificateItem[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioStatus: 'DRAFT' | 'PUBLISHED';
  createdAt?: string;
  updatedAt?: string;
  firestoreId?: string;
  published?: boolean;
  portfolioUrl?: string;
  
  // Custom frontend properties for presentation
  theme: string; // e.g. "Nexus Dark", "Aurora Glass", "Quantum Blue", "Minimal Elite", "Creative Pulse"
  about?: string;
  email?: string;
  phone?: string;
  socialLinks?: Record<string, string>;
}

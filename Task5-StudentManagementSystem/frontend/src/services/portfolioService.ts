import { doc, getDoc, addDoc, updateDoc, deleteDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { portfoliosCollection } from './firestoreService'
import type { Portfolio } from '../types/portfolio'

export const portfolioService = {
  async getAll(): Promise<Portfolio[]> {
    const querySnapshot = await getDocs(portfoliosCollection)
    const list: Portfolio[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      list.push({
        id: doc.id,
        studentId: data.studentId,
        portfolioName: data.portfolioName || '',
        templateType: data.templateType || 'Developer',
        title: data.title || '',
        summary: data.summary || '',
        skills: data.skills || [],
        projects: data.projects || [],
        achievements: data.achievements || [],
        certificates: data.certificates || [],
        githubUrl: data.githubUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        portfolioStatus: data.portfolioStatus || 'DRAFT',
        theme: data.theme || 'Nexus Dark',
        about: data.about || '',
        email: data.email || '',
        phone: data.phone || '',
        socialLinks: data.socialLinks || {},
        createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toISOString() : undefined
      })
    })
    return list
  },

  async getById(id: string): Promise<Portfolio> {
    const docRef = doc(db, 'portfolios', id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      throw new Error(`Portfolio with ID ${id} not found`)
    }
    const data = docSnap.data()
    return {
      id: docSnap.id,
      studentId: data.studentId,
      portfolioName: data.portfolioName || '',
      templateType: data.templateType || 'Developer',
      title: data.title || '',
      summary: data.summary || '',
      skills: data.skills || [],
      projects: data.projects || [],
      achievements: data.achievements || [],
      certificates: data.certificates || [],
      githubUrl: data.githubUrl || '',
      linkedinUrl: data.linkedinUrl || '',
      portfolioStatus: data.portfolioStatus || 'DRAFT',
      theme: data.theme || 'Nexus Dark',
      about: data.about || '',
      email: data.email || '',
      phone: data.phone || '',
      socialLinks: data.socialLinks || {},
      createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toISOString() : undefined
    }
  },

  async getByStudentId(studentId: string | number): Promise<Portfolio[]> {
    const q = query(portfoliosCollection, where('studentId', '==', studentId))
    const querySnapshot = await getDocs(q)
    const list: Portfolio[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      list.push({
        id: doc.id,
        studentId: data.studentId,
        portfolioName: data.portfolioName || '',
        templateType: data.templateType || 'Developer',
        title: data.title || '',
        summary: data.summary || '',
        skills: data.skills || [],
        projects: data.projects || [],
        achievements: data.achievements || [],
        certificates: data.certificates || [],
        githubUrl: data.githubUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        portfolioStatus: data.portfolioStatus || 'DRAFT',
        theme: data.theme || 'Nexus Dark',
        about: data.about || '',
        email: data.email || '',
        phone: data.phone || '',
        socialLinks: data.socialLinks || {},
        createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toISOString() : undefined
      })
    })
    return list
  },

  async create(portfolio: Omit<Portfolio, 'id'>): Promise<Portfolio> {
    const docRef = await addDoc(portfoliosCollection, {
      ...portfolio,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return {
      id: docRef.id,
      ...portfolio
    }
  },

  async update(id: string, portfolio: Partial<Portfolio>): Promise<Portfolio> {
    const docRef = doc(db, 'portfolios', id)
    const updateData = {
      ...portfolio,
      updatedAt: serverTimestamp()
    }
    await updateDoc(docRef, updateData)
    return this.getById(id)
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'portfolios', id)
    await deleteDoc(docRef)
  },

  async duplicate(id: string): Promise<Portfolio> {
    const source = await this.getById(id)
    const duplicateData: Omit<Portfolio, 'id'> = {
      studentId: source.studentId,
      portfolioName: `${source.portfolioName} (Copy)`,
      templateType: source.templateType,
      title: source.title,
      summary: source.summary,
      skills: source.skills,
      projects: source.projects,
      achievements: source.achievements,
      certificates: source.certificates,
      githubUrl: source.githubUrl,
      linkedinUrl: source.linkedinUrl,
      portfolioStatus: 'DRAFT',
      theme: source.theme,
      about: source.about,
      email: source.email,
      phone: source.phone,
      socialLinks: source.socialLinks
    }
    return this.create(duplicateData)
  }
}

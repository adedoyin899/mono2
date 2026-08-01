import { PROJECTS, SERVICES, TRANSACTIONS, SUPPORT_TICKETS } from "../mocks";
import type { Project, ServiceRateCard, Transaction, SupportTicket, Applicant } from "@monologg/types";

export interface TalentProfileState {
  name: string;
  email: string;
  bio: string;
  location: string;
  niche: string;
  verified: boolean;
  avatarUrl?: string | null;
}

export interface ClientProfileState {
  name: string;
  email: string;
  orgName: string;
  orgType: string;
  location: string;
  bio: string;
  avatarUrl?: string | null;
}

export interface BankDetailsState {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface BalanceState {
  available: number;
  pending: number;
  withdrawnTotal: number;
}

const STORAGE_KEYS = {
  TALENT_PROFILE: "monologg_talent_profile",
  CLIENT_PROFILE: "monologg_client_profile",
  BANK_DETAILS: "monologg_bank_details",
  BALANCE: "monologg_balance",
  SERVICES: "monologg_services",
  PROJECTS: "monologg_projects",
  TRANSACTIONS: "monologg_transactions",
  SUPPORT_TICKETS: "monologg_support_tickets",
  APPLICANTS: "monologg_applicants",
};

const DEFAULT_TALENT_PROFILE: TalentProfileState = {
  name: "Emeka Johnson",
  email: "emeka@example.com",
  bio: "Specializing in intense dramatic monologues, voice-overs, and Nollywood screen roles. 10+ years stage and screen experience in Lagos.",
  location: "Lagos, Nigeria",
  niche: "ACTOR",
  verified: true,
  avatarUrl: null,
};

const DEFAULT_CLIENT_PROFILE: ClientProfileState = {
  name: "Sarah Jenkins",
  email: "sarah@filmcraft.com",
  orgName: "FilmCraft Studios",
  orgType: "STUDIO",
  location: "Lagos, Nigeria",
  bio: "Independent film production studio specializing in feature films and commercial casting.",
  avatarUrl: null,
};

const DEFAULT_BANK_DETAILS: BankDetailsState = {
  bankName: "GTBank",
  accountNumber: "0123456789",
  accountName: "EMEKA JOHNSON",
};

const DEFAULT_BALANCE: BalanceState = {
  available: 450000,
  pending: 120000,
  withdrawnTotal: 0,
};

const DEFAULT_APPLICANTS: Record<string, Applicant[]> = {
  "proj-1": [
    { id: "app-1", talentId: "mock-creator", name: "Emeka Johnson", headshotUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80&fit=crop", appliedAt: "2 hours ago", status: "APPLIED", pitch: "I'd love to bring my stage background to this lead role!" },
  ],
};

type Listener = () => void;

class StateSyncBus {
  private listeners: Set<Listener> = new Set();
  private talentProfile: TalentProfileState;
  private clientProfile: ClientProfileState;
  private bankDetails: BankDetailsState;
  private balance: BalanceState;
  private services: ServiceRateCard[];
  private projects: Project[];
  private transactions: Transaction[];
  private supportTickets: SupportTicket[];
  private applicants: Record<string, Applicant[]>;

  constructor() {
    this.talentProfile = this.load(STORAGE_KEYS.TALENT_PROFILE, DEFAULT_TALENT_PROFILE);
    this.clientProfile = this.load(STORAGE_KEYS.CLIENT_PROFILE, DEFAULT_CLIENT_PROFILE);
    this.bankDetails = this.load(STORAGE_KEYS.BANK_DETAILS, DEFAULT_BANK_DETAILS);
    this.balance = this.load(STORAGE_KEYS.BALANCE, DEFAULT_BALANCE);
    this.services = this.load(STORAGE_KEYS.SERVICES, SERVICES);
    this.projects = this.load(STORAGE_KEYS.PROJECTS, PROJECTS);
    this.transactions = this.load(STORAGE_KEYS.TRANSACTIONS, TRANSACTIONS);
    this.supportTickets = this.load(STORAGE_KEYS.SUPPORT_TICKETS, SUPPORT_TICKETS);
    this.applicants = this.load(STORAGE_KEYS.APPLICANTS, DEFAULT_APPLICANTS);

    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (Object.values(STORAGE_KEYS).includes(e.key ?? "")) {
          this.reloadFromStorage();
          this.notify();
        }
      });
    }
  }

  private load<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  private save(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  }

  private reloadFromStorage() {
    this.talentProfile = this.load(STORAGE_KEYS.TALENT_PROFILE, DEFAULT_TALENT_PROFILE);
    this.clientProfile = this.load(STORAGE_KEYS.CLIENT_PROFILE, DEFAULT_CLIENT_PROFILE);
    this.bankDetails = this.load(STORAGE_KEYS.BANK_DETAILS, DEFAULT_BANK_DETAILS);
    this.balance = this.load(STORAGE_KEYS.BALANCE, DEFAULT_BALANCE);
    this.services = this.load(STORAGE_KEYS.SERVICES, SERVICES);
    this.projects = this.load(STORAGE_KEYS.PROJECTS, PROJECTS);
    this.transactions = this.load(STORAGE_KEYS.TRANSACTIONS, TRANSACTIONS);
    this.supportTickets = this.load(STORAGE_KEYS.SUPPORT_TICKETS, SUPPORT_TICKETS);
    this.applicants = this.load(STORAGE_KEYS.APPLICANTS, DEFAULT_APPLICANTS);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((l) => l());
  }

  // Talent Profile
  getTalentProfile(): TalentProfileState {
    return { ...this.talentProfile };
  }

  updateTalentProfile(updates: Partial<TalentProfileState>) {
    this.talentProfile = { ...this.talentProfile, ...updates };
    this.save(STORAGE_KEYS.TALENT_PROFILE, this.talentProfile);
    this.notify();
  }

  // Client Profile
  getClientProfile(): ClientProfileState {
    return { ...this.clientProfile };
  }

  updateClientProfile(updates: Partial<ClientProfileState>) {
    this.clientProfile = { ...this.clientProfile, ...updates };
    this.save(STORAGE_KEYS.CLIENT_PROFILE, this.clientProfile);
    this.notify();
  }

  // Bank Details
  getBankDetails(): BankDetailsState {
    return { ...this.bankDetails };
  }

  updateBankDetails(updates: Partial<BankDetailsState>) {
    this.bankDetails = { ...this.bankDetails, ...updates };
    this.save(STORAGE_KEYS.BANK_DETAILS, this.bankDetails);
    this.notify();
  }

  // Financial Balance & Withdrawal
  getBalance(): BalanceState {
    return { ...this.balance };
  }

  withdrawFunds(amountNaira: number): boolean {
    if (amountNaira <= 0 || amountNaira > this.balance.available) return false;
    this.balance.available -= amountNaira;
    this.balance.withdrawnTotal += amountNaira;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      direction: "payout",
      amountFormatted: `₦${amountNaira.toLocaleString()}`,
      amountKobo: amountNaira * 100,
      currency: "NGN",
      state: "PAYOUT_COMPLETED",
      description: `Payout to ${this.bankDetails.bankName} (${this.bankDetails.accountNumber.slice(-4)})`,
      createdAt: new Date().toISOString(),
    };

    this.transactions = [newTx, ...this.transactions];
    this.save(STORAGE_KEYS.BALANCE, this.balance);
    this.save(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    this.notify();
    return true;
  }

  // Services / Rate Cards
  getServices(): ServiceRateCard[] {
    return [...this.services];
  }

  addService(service: Omit<ServiceRateCard, "id">): ServiceRateCard {
    const newService: ServiceRateCard = {
      id: `srv-${Date.now()}`,
      ...service,
    };
    this.services = [newService, ...this.services];
    this.save(STORAGE_KEYS.SERVICES, this.services);
    this.notify();
    return newService;
  }

  updateService(id: string, updates: Partial<ServiceRateCard>): ServiceRateCard | null {
    const idx = this.services.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.services[idx] = { ...this.services[idx]!, ...updates };
    this.save(STORAGE_KEYS.SERVICES, this.services);
    this.notify();
    return this.services[idx]!;
  }

  deleteService(id: string) {
    this.services = this.services.filter((s) => s.id !== id);
    this.save(STORAGE_KEYS.SERVICES, this.services);
    this.notify();
  }

  // Projects
  getProjects(): Project[] {
    return [...this.projects];
  }

  addProject(input: {
    projectName: string;
    projectType: string;
    nicheReq: string[];
    budget: string;
    budgetAmount: number;
    budgetCurrency: string;
    clientName?: string;
    applicantCap?: number | null;
  }): Project {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      projectName: input.projectName,
      projectType: input.projectType,
      nicheReq: input.nicheReq,
      budget: input.budget,
      budgetAmount: input.budgetAmount,
      budgetCurrency: input.budgetCurrency,
      clientName: input.clientName || this.clientProfile.orgName || "FilmCraft Studios",
      applicantCap: input.applicantCap ?? 10,
      applicationsOpen: true,
      applicantCount: 0,
      postedAt: new Date().toISOString(),
      myApplication: null,
    };

    this.projects = [newProject, ...this.projects];
    this.save(STORAGE_KEYS.PROJECTS, this.projects);
    this.notify();
    return newProject;
  }

  // Project Applications & Shortlisting
  listApplicants(projectId: string): Applicant[] {
    return this.applicants[projectId] ?? [];
  }

  updateApplicantStatus(projectId: string, applicationId: string, status: Applicant["status"]): boolean {
    const projectApplicants = this.applicants[projectId] ?? [];
    const idx = projectApplicants.findIndex((a) => a.id === applicationId);
    if (idx === -1) return false;
    projectApplicants[idx]!.status = status;
    this.applicants[projectId] = projectApplicants;
    this.save(STORAGE_KEYS.APPLICANTS, this.applicants);
    this.notify();
    return true;
  }

  applyToProject(projectId: string, pitch?: string): boolean {
    const projIdx = this.projects.findIndex((p) => p.id === projectId);
    if (projIdx === -1) return false;

    this.projects[projIdx]!.applicantCount += 1;
    this.projects[projIdx]!.myApplication = { id: `app-${Date.now()}`, status: "APPLIED", pitch: pitch || null };

    const projectApplicants = this.applicants[projectId] ?? [];
    projectApplicants.push({
      id: `app-${Date.now()}`,
      talentId: "mock-creator",
      name: this.talentProfile.name,
      headshotUrl: this.talentProfile.avatarUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80&fit=crop",
      appliedAt: "Just now",
      status: "APPLIED",
      pitch: pitch || null,
    });
    this.applicants[projectId] = projectApplicants;

    this.save(STORAGE_KEYS.PROJECTS, this.projects);
    this.save(STORAGE_KEYS.APPLICANTS, this.applicants);
    this.notify();
    return true;
  }

  // Transactions
  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  // Support Tickets
  getSupportTickets(): SupportTicket[] {
    return [...this.supportTickets];
  }

  submitSupportTicket(subject: string, message: string): SupportTicket {
    const ticket: SupportTicket = {
      id: `st-${Date.now()}`,
      subject,
      status: "OPEN",
      lastUpdated: "Just now",
      createdAt: new Date().toISOString(),
      messages: [{ id: `stm-${Date.now()}`, sender: "client", text: message, timestamp: "Just now" }],
    };
    this.supportTickets = [ticket, ...this.supportTickets];
    this.save(STORAGE_KEYS.SUPPORT_TICKETS, this.supportTickets);
    this.notify();
    return ticket;
  }
}

export const appStateSync = new StateSyncBus();

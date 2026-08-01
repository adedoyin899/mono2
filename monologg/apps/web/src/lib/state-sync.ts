import { PROJECTS } from "../mocks";
import type { Project } from "@monologg/types";

export interface TalentProfileState {
  name: string;
  email: string;
  bio: string;
  location: string;
  niche: string;
  verified: boolean;
}

export interface ClientProfileState {
  name: string;
  email: string;
  orgName: string;
  orgType: string;
  location: string;
  bio: string;
}

const STORAGE_KEYS = {
  TALENT_PROFILE: "monologg_talent_profile",
  CLIENT_PROFILE: "monologg_client_profile",
  PROJECTS: "monologg_projects",
};

const DEFAULT_TALENT_PROFILE: TalentProfileState = {
  name: "Elias Thorne",
  email: "elias@example.com",
  bio: "Specializing in intense dramatic monologues and authoritative voice-overs. 10+ years stage experience.",
  location: "Lagos, Nigeria",
  niche: "ACTOR",
  verified: true,
};

const DEFAULT_CLIENT_PROFILE: ClientProfileState = {
  name: "Sarah Jenkins",
  email: "sarah@filmcraft.com",
  orgName: "FilmCraft Studios",
  orgType: "STUDIO",
  location: "Lagos, Nigeria",
  bio: "Independent film production studio specializing in feature films and commercial casting.",
};

type Listener = () => void;

class StateSyncBus {
  private listeners: Set<Listener> = new Set();
  private talentProfile: TalentProfileState;
  private clientProfile: ClientProfileState;
  private projects: Project[];

  constructor() {
    this.talentProfile = this.load(STORAGE_KEYS.TALENT_PROFILE, DEFAULT_TALENT_PROFILE);
    this.clientProfile = this.load(STORAGE_KEYS.CLIENT_PROFILE, DEFAULT_CLIENT_PROFILE);
    this.projects = this.load(STORAGE_KEYS.PROJECTS, PROJECTS);

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
    this.projects = this.load(STORAGE_KEYS.PROJECTS, PROJECTS);
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
}

export const appStateSync = new StateSyncBus();

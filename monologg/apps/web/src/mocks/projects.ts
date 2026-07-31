import type { Applicant, MyApplication, Project } from "@monologg/types";

// features.md Phase 14 (FA-2) — mock-mode fixtures for talent-side project
// discovery (PWA-14), the applicant status list (PWA-16), and the client's
// applicant-management view (PWA-17).

export const PROJECTS: Project[] = [
  {
    id: "P-001",
    projectName: "Nike Q1 Campaign",
    projectType: "Voice-Over",
    nicheReq: ["VO_ARTIST"],
    budget: "₦200,000",
    budgetAmount: 20_000_000,
    budgetCurrency: "NGN",
    clientName: "General Casting Co",
    applicantCap: 10,
    applicationsOpen: true,
    applicantCount: 8,
    postedAt: "2026-07-14T00:00:00.000Z",
    myApplication: { id: "myapp-1", status: "APPLIED", pitch: "I've voiced three prior Nike regional spots." },
  },
  {
    id: "P-004",
    projectName: "Film Auditions Jan 2025",
    projectType: "Actor",
    nicheReq: ["ACTOR"],
    budget: "₦500,000",
    budgetAmount: 50_000_000,
    budgetCurrency: "NGN",
    clientName: "General Casting Co",
    applicantCap: 20,
    applicationsOpen: false,
    applicantCount: 21,
    postedAt: "2026-07-05T00:00:00.000Z",
    myApplication: null,
  },
  {
    id: "P-005",
    projectName: "Fintech Explainer Series",
    projectType: "Voice-Over",
    nicheReq: ["VO_ARTIST", "CONTENT_CREATOR"],
    budget: "₦95,000",
    budgetAmount: 9_500_000,
    budgetCurrency: "NGN",
    clientName: "Sahara Media Group",
    applicantCap: null,
    applicationsOpen: true,
    applicantCount: 2,
    postedAt: "2026-07-20T00:00:00.000Z",
    myApplication: null,
  },
];

export const MY_APPLICATIONS: MyApplication[] = [
  {
    id: "myapp-1",
    status: "APPLIED",
    pitch: "I've voiced three prior Nike regional spots.",
    createdAt: "2026-07-15T00:00:00.000Z",
    brief: { id: "P-001", projectName: "Nike Q1 Campaign", projectType: "Voice-Over", budget: "₦200,000", clientName: "General Casting Co" },
  },
  {
    id: "myapp-2",
    status: "SHORTLISTED",
    pitch: "Bilingual EN/FR delivery available.",
    createdAt: "2026-07-10T00:00:00.000Z",
    brief: { id: "P-002", projectName: "Tech Summit Compere", projectType: "Compere", budget: "₦120,000", clientName: "EventPro Abuja" },
  },
  {
    id: "myapp-3",
    status: "REJECTED",
    pitch: null,
    createdAt: "2026-06-28T00:00:00.000Z",
    brief: { id: "P-006", projectName: "Radio Drama Pilot", projectType: "Voice-Over", budget: "₦60,000", clientName: "Brand Agency NG" },
  },
];

export const APPLICANTS: Applicant[] = [
  {
    applicationId: "myapp-1",
    status: "APPLIED",
    pitch: "I've voiced three prior Nike regional spots — happy to share reels.",
    appliedAt: "2026-07-15T00:00:00.000Z",
    creator: { id: "seed-creator-adaeze", name: "Adaeze Obi", role: "Voice-Over Artist", location: "Lagos", avatar: "AO", verified: true, tags: ["Warm", "Multilingual", "Corporate"], price: "₦28,000" },
  },
  {
    applicationId: "myapp-4",
    status: "SHORTLISTED",
    pitch: "Bilingual EN/FR delivery available if the campaign runs across West Africa.",
    appliedAt: "2026-07-16T00:00:00.000Z",
    creator: { id: "seed-creator-amara", name: "Amara Diallo", role: "Voice-Over Artist", location: "Accra", avatar: "AD", verified: true, tags: ["Storytelling", "Animated", "French"], price: "₦35,000" },
  },
];

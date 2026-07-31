import type { ClientProject } from "@monologg/types";

export const CLIENT_PROJECTS: ClientProject[] = [
  { id: "P-001", name: "Nike Q1 Campaign", niche: "Voice-Over", budget: "₦200,000", status: "active", applicants: 8, applicantCap: 10, applicationsOpen: true, posted: "Dec 14" },
  { id: "P-002", name: "Tech Summit Compere", niche: "Compere", budget: "₦120,000", status: "in_review", applicants: 3, applicantCap: null, applicationsOpen: true, posted: "Dec 10" },
  { id: "P-003", name: "Fintech Radio Ads", niche: "Voice-Over", budget: "₦80,000", status: "draft", applicants: 0, applicantCap: null, applicationsOpen: true, posted: "Dec 8" },
  { id: "P-004", name: "Film Auditions Jan 2025", niche: "Actor", budget: "₦500,000", status: "active", applicants: 21, applicantCap: 20, applicationsOpen: false, posted: "Dec 5" },
];

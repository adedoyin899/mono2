import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Avatar } from "../components/ui/Avatar";
import { Logo } from "../components/ui/Logo";
import { WebGLHeroCanvas } from "../components/ui/WebGLHeroCanvas";
import { useTheme } from "../Root";
import { Modal } from "../components/ui/Modal";
import { appStateSync } from "../../lib/state-sync";
import { apiClient } from "../../lib/api-client";
import {
  Star, Shield, Mic, Video, User,
  Sun, Moon, Check, ChevronDown,
  Menu, X, UploadCloud, Lock, RefreshCw, Sparkles, MessageSquare,
  Play, Pause, ArrowRight, Smartphone, QrCode, DollarSign, Repeat, Zap, ExternalLink, ArrowUpRight, Copy, MapPin, Globe, Volume2, AlertTriangle,
  LayoutDashboard, Settings as SettingsIcon, Receipt, FileText, LogOut,
} from "lucide-react";
import { CURRENCIES, convertCurrency, getRandomLimitError, LimitError } from "../../lib/currency";

// ── 7 Curated Talent Profiles for Infinite Auto-Looping Carousel ──
const CAROUSEL_TALENTS = [
  {
    id: "t1",
    name: "Emeka Johnson",
    category: "Dramatic Voice Artist",
    location: "Lagos · Remote",
    rate: "₦120,000 / day",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80&fit=crop",
    tags: ["Deep Tone", "Nollywood", "High Energy"],
    rating: 4.98,
    reviews: 142,
    verified: true,
  },
  {
    id: "t2",
    name: "Amara Kalu",
    category: "Commercial Lead Actor",
    location: "Abuja · On-Site",
    rate: "₦250,000 / day",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop",
    tags: ["Charismatic", "Lead Presence", "Brand Spot"],
    rating: 5.0,
    reviews: 98,
    verified: true,
  },
  {
    id: "t3",
    name: "Tariq Mansoor",
    category: "Live Event Compere",
    location: "Accra · International",
    rate: "₦180,000 / event",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80&fit=crop",
    tags: ["Stage Command", "Multilingual", "Corporate"],
    rating: 4.95,
    reviews: 84,
    verified: true,
  },
  {
    id: "t4",
    name: "Zainab Bello",
    category: "Stunt & Motion Performer",
    location: "Kano · On-Location",
    rate: "₦210,000 / day",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80&fit=crop",
    tags: ["Martial Arts", "High Agility", "Cinema"],
    rating: 4.99,
    reviews: 67,
    verified: true,
  },
  {
    id: "t5",
    name: "David Osei",
    category: "Radio & Podcast Host",
    location: "Kumasi · Remote",
    rate: "₦150,000 / episode",
    img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=80&fit=crop",
    tags: ["Baritone", "Storytelling", "Live FM"],
    rating: 4.92,
    reviews: 115,
    verified: true,
  },
  {
    id: "t6",
    name: "Chidinma Nwosu",
    category: "High-Fashion Commercial Model",
    location: "Lagos · International",
    rate: "₦300,000 / day",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80&fit=crop",
    tags: ["Runway", "Editorial", "Vogue Africa"],
    rating: 5.0,
    reviews: 89,
    verified: true,
  },
  {
    id: "t7",
    name: "Kofi Mensah",
    category: "Afrobeat Stage Choreographer",
    location: "Accra · Remote/On-Site",
    rate: "₦190,000 / routine",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80&fit=crop",
    tags: ["Stage Sync", "High Tempo", "Tour Ready"],
    rating: 4.96,
    reviews: 73,
    verified: true,
  },
];

// ── Sci-Fi Radar Nodes (Africa & Global Creative Hubs) ──
const RADAR_NODES = [
  {
    id: "lagos",
    city: "Lagos, Nigeria",
    flag: "🇳🇬",
    coords: { x: "50.8%", y: "52%" },
    talentName: "Adaeze Obi",
    category: "Senior Voice Artist",
    quote: "Booked 12 Netflix voice-overs via Monologg Escrow with 0 commission.",
    earnings: "₦3,800,000",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&fit=crop",
  },
  {
    id: "accra",
    city: "Accra, Ghana",
    flag: "🇬🇭",
    coords: { x: "48%", y: "53%" },
    talentName: "Kwame Asante",
    category: "Commercial Lead Actor",
    quote: "International casting directors book me directly in USD & GHS.",
    earnings: "$8,400 USD",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&fit=crop",
  },
  {
    id: "nairobi",
    city: "Nairobi, Kenya",
    flag: "🇰🇪",
    coords: { x: "59.5%", y: "56%" },
    talentName: "Wanjiku Kimani",
    category: "Documentary Narrator",
    quote: "Thespian AI tagged my vocal range in 30 seconds. Seamless payouts.",
    earnings: "KSh 420,000",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80&fit=crop",
  },
  {
    id: "joburg",
    city: "Johannesburg, SA",
    flag: "🇿🇦",
    coords: { x: "56.5%", y: "74%" },
    talentName: "Sipho Dlamini",
    category: "Film Stunt Lead",
    quote: "FINCRA Escrow locked full payment before I stepped on stage.",
    earnings: "R 95,000",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop",
  },
  {
    id: "london",
    city: "London, UK",
    flag: "🇬🇧",
    coords: { x: "48.5%", y: "28%" },
    talentName: "Elena Vance",
    category: "Global Brand Director",
    quote: "Sourced 5 African voice talents for our campaign in 20 minutes.",
    earnings: "80+ Hours Saved",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80&fit=crop",
  },
  {
    id: "newyork",
    city: "New York, USA",
    flag: "🇺🇸",
    coords: { x: "28%", y: "34%" },
    talentName: "Marcus Sterling",
    category: "Ad Agency Producer",
    quote: "Monologg's escrow protocol is lightyears ahead of traditional talent reps.",
    earnings: "$24,000 Spent",
    img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80&fit=crop",
  },
];

// ── Vector World Map SVG Component (vector-map.svg Asset) ──
function VectorWorldMap({ activeNode, onSelectNode }: { activeNode: number; onSelectNode: (idx: number) => void }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 select-none">
      {/* Real High-Resolution Vector World Map SVG Asset */}
      <img
        src="/vector-map.svg"
        alt="Vector World Map"
        className="w-full h-full object-contain opacity-50 dark:opacity-40 transition-opacity hover:opacity-75 pointer-events-none filter dark:invert"
      />

      {/* Interactive Location Pin Badges Over Geographic Coordinates */}
      {RADAR_NODES.map((node, index) => {
        const isActive = index === activeNode;
        return (
          <button
            key={node.id}
            onClick={() => onSelectNode(index)}
            style={{ left: node.coords.x, top: node.coords.y }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none transition-all duration-300 ${
              isActive ? "z-30 scale-110" : "z-10 opacity-60 hover:opacity-100 hover:scale-110"
            }`}
          >
            <span className="relative flex items-center justify-center">
              {isActive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-[#F13030] opacity-60" />
                  <span className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono bg-[#F13030] text-white border border-[#F13030] shadow-[0_0_24px_rgba(241,48,48,0.8)]">
                    <span className="text-sm">{node.flag}</span>
                    <span className="font-bold tracking-wide">{node.city.split(",")[0]}</span>
                  </span>
                </>
              ) : (
                <span className="relative flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full bg-[#16161A] border border-[#34343E] hover:border-[#F13030] text-sm flex items-center justify-center shadow-md transition-all group-hover:bg-[#F13030]/20">
                    {node.flag}
                  </span>
                  {/* Subtle Tooltip on Hover for Inactive Pins */}
                  <span className="absolute bottom-full mb-1.5 hidden group-hover:flex items-center px-2 py-0.5 rounded-md bg-[#16161A] text-[10px] font-semibold text-[#F5F5F0] border border-[#26262E] whitespace-nowrap shadow-xl">
                    {node.city.split(",")[0]}
                  </span>
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── 3-Step Process ──
const STEPS = [
  {
    num: "01",
    title: "Upload Reel & AI Vibe Scan",
    body: "Upload your performance reel. Proprietary Thespian AI extracts tone, diction, and dramatic presence — building your verified style card in under 30 seconds.",
  },
  {
    num: "02",
    title: "Define Purchasable Rate Cards",
    body: "Turn your craft into transparent booking packages. Set fixed prices for voice-overs, film appearances, commercial spots, and live hosting.",
  },
  {
    num: "03",
    title: "Instant Escrow Lock & Release",
    body: "Clients book and lock funds into Monologg Escrow. Funds auto-release directly to your bank account upon deliverable signoff with zero chasing.",
  },
];

// ── FAQ Accordion ──
const FAQS = [
  {
    q: "What fee does Monologg charge creators?",
    a: "Monologg charges a flat 9% platform commission on completed talent bookings. Profile creation, rate cards, and AI style tagging are 100% free forever.",
  },
  {
    q: "How does the Monologg Escrow Protocol work?",
    a: "When a client places an order, full contract payment is securely locked in FINCRA Escrow. Talent works with complete peace of mind, and funds auto-release immediately when deliverables are approved.",
  },
  {
    q: "How does Thespian AI Style Tagging work?",
    a: "Upload any 30-90 second performance reel (audio or video up to 150MB). Thespian AI analyzes vocal resonance, pacing, and dramatic timbre to tag your profile automatically.",
  },
  {
    q: "Which countries and currencies are supported?",
    a: "Monologg supports multi-currency escrow payouts in NGN (Nigerian Naira), GHS (Ghanaian Cedi), KES (Kenyan Shilling), ZAR (South African Rand), EUR, USD, and GBP.",
  },
];

// ── Multi-Currency Support Definitions ──

function MonologgEscrowCalculator() {
  const [selectedCurr, setSelectedCurr] = useState(CURRENCIES[0]);
  const [amount, setAmount] = useState(CURRENCIES[0].defaultAmount);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sliderMax, setSliderMax] = useState(CURRENCIES[0].max);
  const escrowFee = Math.round(amount * 0.12);
  const talentEarnings = amount;
  const clientTotal = amount + escrowFee;

  const [clientTotalInputStr, setClientTotalInputStr] = useState(
    clientTotal.toLocaleString("en-US")
  );

  const [limitError, setLimitError] = useState<LimitError | null>(null);

  // Sync sliderMax when selected currency changes
  useEffect(() => {
    setSliderMax(prev => Math.max(prev, selectedCurr.max));
  }, [selectedCurr]);

  // Sync string value when amount changes
  useEffect(() => {
    setClientTotalInputStr(clientTotal.toLocaleString("en-US"));
  }, [amount]);

  const handleCurrencySelect = (curr: typeof CURRENCIES[0]) => {
    const converted = convertCurrency(amount, selectedCurr.code, curr.code);
    setSelectedCurr(curr);
    const roundedConverted = Math.round(converted);
    setAmount(roundedConverted);
    setSliderMax(Math.max(curr.max, roundedConverted));
    setShowDropdown(false);
  };

  const handleClientTotalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numericStr = rawVal.replace(/\D/g, "");
    
    if (numericStr.length > 15 || (numericStr.length === 15 && parseInt(numericStr, 10) > 999999999999999)) {
      const isMobile = window.innerWidth < 500;
      setLimitError(getRandomLimitError(isMobile));
      return;
    }
    
    setClientTotalInputStr(numericStr);
    
    const totalVal = numericStr ? parseInt(numericStr, 10) : 0;
    const baseVal = Math.round(totalVal / 1.12);
    setAmount(baseVal);
    if (baseVal > sliderMax) {
      setSliderMax(baseVal);
    }
  };

  const handleClientTotalInputFocus = () => {
    setClientTotalInputStr(clientTotal === 0 ? "" : clientTotal.toString());
  };

  const handleClientTotalInputBlur = () => {
    setClientTotalInputStr(clientTotal.toLocaleString("en-US"));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setAmount(val);
    
    // Auto-expand range if dragging near the edge (>= 95%)
    if (val >= sliderMax * 0.95) {
      setSliderMax(prev => Math.round(prev * 1.5));
    }
  };

  return (
    <div className="p-6 md:p-8 rounded-[28px] bg-[#16161A] text-white border border-[#26262E] shadow-2xl space-y-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F13030] animate-pulse shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#F13030] truncate">
            <span className="hidden min-[400px]:inline">Monologg Escrow Protocol</span>
            <span className="inline min-[400px]:hidden">Escrow Protocol</span>
          </span>
        </div>
        <div className="bg-[#F13030]/20 text-[#FF4D4D] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold font-mono border border-[#F13030]/30 shrink-0">
          <span className="hidden min-[400px]:inline">100% Guaranteed Payout</span>
          <span className="inline min-[400px]:hidden">100% Payout</span>
        </div>
      </div>

      <div className="bg-[#1B1B20] rounded-[18px] p-4 border border-[#26262E] space-y-1 relative">
        <div className="flex justify-between items-center text-xs text-[#A6A6B0] font-medium">
          <span>Client Pays Total Contract</span>
          <span className="font-mono">FINCRA Locked</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-2xl font-bold font-mono text-[#F5F5F0]">
            <span>{selectedCurr.symbol}</span>
            <input
              type="text"
              className="bg-transparent font-bold font-mono text-[#F5F5F0] focus:outline-none w-full max-w-[200px] border-b border-transparent focus:border-white/20 transition-colors"
              value={clientTotalInputStr}
              onChange={handleClientTotalInputChange}
              onFocus={handleClientTotalInputFocus}
              onBlur={handleClientTotalInputBlur}
            />
          </div>

          {/* Interactive Multi-Currency Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-[#232329] hover:bg-[#2c2c34] px-3 py-1.5 rounded-full text-xs font-bold text-white shrink-0 border border-white/15 transition-all active:scale-95"
            >
              <span className="w-5 h-5 rounded-full bg-[#F13030] text-white text-[10px] flex items-center justify-center font-black">
                {selectedCurr.flag}
              </span>
              <span>{selectedCurr.code}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Currency Menu Modal */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#16161A] border border-[#34343E] rounded-2xl p-1.5 shadow-2xl z-50 space-y-1 backdrop-blur-xl">
                <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-[#A6A6B0] border-b border-white/10">
                  Select Currency
                </div>
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => handleCurrencySelect(curr)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      selectedCurr.code === curr.code
                        ? "bg-[#F13030] text-white font-bold"
                        : "hover:bg-[#232329] text-[#F5F5F0]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{curr.flag}</span>
                      <span>{curr.code} ({curr.symbol})</span>
                    </span>
                    {selectedCurr.code === curr.code && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 px-2 text-xs text-white/80">
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-[#A6A6B0]">Talent Base Rate</span>
          <span className="font-mono font-bold text-[#FF4D4D]">
            {selectedCurr.symbol}{amount.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-white/10">
          <span className="text-[#A6A6B0]">Escrow Processing Fee (12%)</span>
          <span className="font-mono text-[#A6A6B0]">
            {selectedCurr.symbol}{escrowFee.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="font-bold text-white">Talent Receives (Net Payout)</span>
          <span className="font-mono font-extrabold text-white text-base">
            {selectedCurr.symbol}{talentEarnings.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="pt-2">
        <div className="flex justify-between items-center text-[11px] text-[#FF4D4D] mb-1 font-mono">
          <span>Adjust Booking Amount ({selectedCurr.code})</span>
          <span>{selectedCurr.symbol}{amount.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={selectedCurr.min}
          max={sliderMax}
          step={selectedCurr.step}
          value={amount}
          onChange={handleSliderChange}
          className="w-full accent-[#F13030] cursor-pointer"
        />
      </div>

      <div className="pt-2">
        <button className="w-full py-3.5 px-6 rounded-full bg-[#F13030] text-white font-bold text-sm hover:bg-[#d31f20] transition-all flex items-center justify-center gap-2 shadow-lg">
          <Lock className="w-4 h-4 shrink-0" />
          <span className="hidden min-[500px]:inline">Lock Contract in Monologg Escrow ({selectedCurr.code})</span>
          <span className="inline min-[500px]:hidden">Lock in Escrow ({selectedCurr.code})</span>
        </button>
      </div>

      {limitError && (
        <Modal onClose={() => setLimitError(null)} align="center" strength="strong">
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-[#26262E] rounded-[28px] p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F13030]/10 flex items-center justify-center text-[#F13030]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-display text-[#16161A] dark:text-white">
                {limitError.heading}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#A6A6B0] font-body leading-relaxed">
                {limitError.subtext}
              </p>
            </div>
            <button
              onClick={() => setLimitError(null)}
              className="w-full py-3 rounded-full bg-[#F13030] text-white font-bold text-sm hover:bg-[#d31f20] transition-all shadow-lg active:scale-95"
            >
              Adjust Amount
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Sci-Fi Interactive Global Radar Map ──
function SciFiTrustMap() {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % RADAR_NODES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = RADAR_NODES[activeNode];

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-[32px] bg-[#0D0D0F] border border-[#26262E] p-6 sm:p-10 overflow-hidden shadow-2xl text-white">
      {/* Sci-Fi Grid Lines & Glowing Radar Rings */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full bg-[radial-gradient(#F13030_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center justify-between">
        {/* Left Vector World Map Canvas Simulator (vector map.svg) */}
        <div className="relative w-full lg:w-3/5 h-[360px] bg-[#16161A] rounded-[24px] border border-[#26262E] overflow-hidden">
          <VectorWorldMap activeNode={activeNode} onSelectNode={setActiveNode} />

          <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-mono text-white/90 flex items-center gap-2 border border-white/10 shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#F13030] animate-pulse" />
            <span>GLOBAL RADAR: {current.flag} {current.city.toUpperCase()}</span>
          </div>
        </div>

        {/* Right Popping Performer Sci-Fi Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full lg:w-2/5 p-6 rounded-[24px] bg-[#16161A] border border-[#26262E] space-y-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <img
                src={current.img}
                alt={current.talentName}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#F13030]"
              />
              <div>
                <div className="font-bold text-lg font-display text-white flex items-center gap-1.5">
                  {current.talentName}
                  <Shield className="w-4 h-4 text-[#F13030]" />
                </div>
                <div className="text-xs text-gray-400 font-body flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#F13030]" />
                  {current.flag} {current.city}
                </div>
              </div>
            </div>

            <p className="text-xs italic text-gray-300 leading-relaxed font-body">
              "{current.quote}"
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-[#26262E]">
              <div>
                <div className="text-[10px] text-gray-500 font-mono uppercase">Verified Payout</div>
                <div className="text-sm font-bold font-mono text-[#FF4D4D]">{current.earnings}</div>
              </div>
              <div className="px-3 py-1 rounded-full bg-[#F13030]/20 text-[#FF4D4D] text-[10px] font-mono border border-[#F13030]/30 flex items-center gap-1">
                <Volume2 className="w-3 h-3 animate-pulse" />
                <span>Audio Reel Verified</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Single Talent Card Component ──
function TalentCardItem({ talent }: { talent: (typeof CAROUSEL_TALENTS)[0] }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="w-[280px] min-[400px]:w-[320px] sm:w-[360px] shrink-0 rounded-[24px] bg-white dark:bg-[#16161A] border border-gray-200 dark:border-[#26262E] p-3 min-[400px]:p-4 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[4/3] rounded-[18px] overflow-hidden mb-3 min-[400px]:mb-4 bg-gray-100 dark:bg-[#1B1B20]">
        <img
          src={talent.img}
          alt={talent.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] min-[400px]:text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/20">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
          <span>{talent.rating}</span>
          <span className="text-white/60">({talent.reviews})</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setPlaying(!playing);
          }}
          className="absolute bottom-3 right-3 w-8 h-8 min-[400px]:w-10 min-[400px]:h-10 rounded-full bg-[#F13030] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          {playing ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>
      </div>

      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm min-[400px]:text-base flex items-center gap-1.5 font-display text-[#16161A] dark:text-[#F5F5F0] truncate">
            {talent.name}
            {talent.verified && <Shield className="w-3.5 h-3.5 text-[#F13030] fill-[#F13030]/20 shrink-0" />}
          </h3>
          <span className="text-xs min-[400px]:text-sm font-bold font-mono text-[#F13030] dark:text-[#FF4D4D] shrink-0">
            {talent.rate}
          </span>
        </div>

        <p className="text-[10px] min-[400px]:text-xs text-gray-600 dark:text-[#A6A6B0] font-body truncate">
          {talent.category} · {talent.location}
        </p>

        <div className="flex flex-wrap gap-1 min-[400px]:gap-1.5 pt-1">
          {talent.tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] min-[400px]:text-[11px] font-semibold px-2 py-0.5 min-[400px]:px-2.5 min-[400px]:py-1 rounded-full bg-[#FFECEC] text-[#F13030] dark:bg-[#F13030]/20 dark:text-[#FF4D4D] border border-[#F13030]/20"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Infinite Auto-Scrolling Talent Carousel with Edge Fade Gradient Masks ──
function TalentCarousel() {
  const [paused, setPaused] = useState(false);
  const extendedTalents = [...CAROUSEL_TALENTS, ...CAROUSEL_TALENTS];

  return (
    <div
      className="relative w-full overflow-hidden py-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Edge Fade Mask Overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--color-bg-surface-2)] via-[var(--color-bg-surface-2)]/60 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--color-bg-surface-2)] via-[var(--color-bg-surface-2)]/60 to-transparent z-20 pointer-events-none" />

      <motion.div
        className="flex gap-6 w-max"
        animate={{ x: paused ? undefined : ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 45,
        }}
      >
        {extendedTalents.map((talent, idx) => (
          <TalentCardItem key={`${talent.id}-${idx}`} talent={talent} />
        ))}
      </motion.div>
    </div>
  );
}

// ── Interactive QR Code Scan Modal Overlay ──
function QRCodeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-sm rounded-[28px] bg-[#16161A] text-white border border-[#26262E] p-6 text-center space-y-5 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <h3 className="font-bold text-xl font-display text-white">Scan Monologg App QR</h3>
          <p className="text-xs text-gray-400 font-body">Scan with your camera to open instant PWA web app.</p>
        </div>

        <div className="relative mx-auto w-52 h-52 bg-white p-3 rounded-[20px] flex items-center justify-center shadow-inner">
          <QrCode className="w-full h-full text-[#16161A]" />
          {/* Animated Sci-Fi Scanning Laser */}
          <div className="absolute left-2 right-2 h-1 bg-[#F13030] shadow-[0_0_12px_#F13030] animate-bounce" />
        </div>

        <div className="space-y-2">
          <Button
            variant="red"
            className="w-full h-11 text-xs font-bold"
            onClick={() => {
              onClose();
              navigate("/auth");
            }}
          >
            Launch Web App Storefront Directly
          </Button>
          <div className="text-[11px] font-mono text-gray-500">Works on iOS &amp; Android Camera</div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Floating QR App Badge ──
function FloatingQRBadge({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 hidden lg:flex items-center gap-3 p-3 rounded-[18px] bg-[#16161A] text-white border border-[#26262E] shadow-2xl hover:scale-105 transition-transform cursor-pointer"
    >
      <div className="w-12 h-12 bg-white p-1 rounded-[12px] flex items-center justify-center shrink-0">
        <QrCode className="w-full h-full text-[#16161A]" />
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#F13030]">
          Get Monologg App
        </div>
        <div className="text-[10px] text-white/70">Click to scan QR code</div>
      </div>
    </motion.div>
  );
}

export function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  // Signed-in state for the header — replaces Sign In / Launch Storefront
  // with an avatar + account menu once a user session exists.
  const [loggedInUser, setLoggedInUserState] = useState(() => appStateSync.getLoggedInUser());
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null | undefined>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncUser = () => {
      const u = appStateSync.getLoggedInUser();
      setLoggedInUserState(u);
      if (u) {
        const profile = u.userType === "CLIENT" ? appStateSync.getClientProfile() : appStateSync.getTalentProfile();
        setUserAvatarUrl(profile.avatarUrl);
      }
    };
    syncUser();
    return appStateSync.subscribe(syncUser);
  }, []);

  useEffect(() => {
    if (!showUserMenu) return;
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showUserMenu]);

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await apiClient.logout();
    navigate("/");
  };

  const userInitials = loggedInUser?.name
    ? loggedInUser.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("")
    : "U";

  const userMenuItems = loggedInUser?.userType === "CLIENT"
    ? [
        { label: "Dashboard", icon: LayoutDashboard, path: "/client" },
        { label: "Post a Project", icon: FileText, path: "/brief" },
        { label: "Transactions", icon: Receipt, path: "/transactions" },
        { label: "Settings", icon: SettingsIcon, path: "/settings?role=client" },
      ]
    : [
        { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { label: "My Media Kit", icon: FileText, path: "/media-kit" },
        { label: "Transactions", icon: Receipt, path: "/transactions" },
        { label: "Settings", icon: SettingsIcon, path: "/settings?role=talent" },
      ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  const handleCopyLink = () => {
    const inviteUrl = window.location.origin;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] font-body text-base">
      {/* ── Top Announcement Bar ── */}
      <div className="h-[40px] bg-[#16161A] text-[#F5F5F0] flex items-center justify-between px-6 text-xs font-semibold border-b border-[#26262E] z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F13030] animate-ping" />
          <span className="uppercase tracking-widest text-[10px] text-[#F13030]">
            Monologg Marketplace v3.0 Live
          </span>
        </div>
        <div className="flex items-center gap-4 text-white/80 text-[11px]">
          <span>FINCRA Escrow Secured</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline font-mono">3,200+ Verified Talent Profiles</span>
        </div>
      </div>

      {/* ── Fixed Sticky Header ── */}
      <header className="h-[68px] sticky top-0 z-50 px-6 md:px-16 flex items-center justify-between backdrop-blur-xl border-b border-[var(--color-hairline)] bg-[var(--color-bg-glass)] shadow-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <Logo className="h-6 w-auto text-[var(--color-text-primary)]" title="Monologg" />
        </div>

        {/* Pill Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--color-bg-surface-2)] p-1.5 rounded-full border border-[var(--color-hairline)]">
          {["Features", "Talent Roster", "How it Works", "Escrow Calculator"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-all"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--color-hairline)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors active:scale-95"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {loggedInUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-1 rounded-full p-0.5 pr-1.5 border border-[var(--color-hairline)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] transition-colors active:scale-95"
                aria-label="Account menu"
                aria-expanded={showUserMenu}
              >
                <Avatar size="sm" src={userAvatarUrl ?? undefined} background="var(--color-accent-glow)" color="var(--color-accent)">
                  {userInitials}
                </Avatar>
                <ChevronDown className={`w-3.5 h-3.5 text-[var(--color-text-tertiary)] transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl shadow-xl overflow-hidden z-50"
                    style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" }}
                  >
                    <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
                      <Avatar size="md" src={userAvatarUrl ?? undefined} background="var(--color-accent-glow)" color="var(--color-accent)">
                        {userInitials}
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate font-body" style={{ color: "var(--color-text-primary)" }}>{loggedInUser.name}</div>
                        <div className="text-xs truncate font-body" style={{ color: "var(--color-text-tertiary)" }}>{loggedInUser.email}</div>
                      </div>
                    </div>

                    <div className="py-1.5">
                      {userMenuItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => { setShowUserMenu(false); navigate(item.path); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-left hover:bg-[var(--color-bg-elevated)] transition-colors"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          <item.icon className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="py-1.5" style={{ borderTop: "1px solid var(--color-hairline)" }}>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-left hover:bg-[var(--color-bg-elevated)] transition-colors"
                        style={{ color: "var(--color-error)" }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Button
                variant="outline-pill"
                className="h-10 px-5 text-xs font-bold hidden sm:inline-flex"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>

              <Button
                variant="red"
                className="h-10 px-5 text-xs font-bold"
                onClick={() => navigate("/auth")}
              >
                Launch Storefront
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* ── HERO SECTION (Refined Kerning, SVG Red Squiggle & Status Quo Grid Reveal) ── */}
        <section className="relative pt-24 pb-32 px-6 md:px-16 overflow-hidden min-h-[85vh] flex items-center">
          <WebGLHeroCanvas opacityMultiplier={0.2} />

          <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#FFECEC] text-[#F13030] dark:bg-[#F13030]/20 dark:text-[#FF4D4D] border border-[#F13030]/30 shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current text-[#F13030]" />
              <span>THE FIRST BRIEF-TO-BOOKING PIPELINE FOR PERFORMING ARTS</span>
            </div>

            {/* Oversized Display Headline with Red Squiggle Underline */}
            <h1 className="font-wise-sans text-[48px] sm:text-[72px] md:text-[96px] font-black tracking-[-0.04em] leading-[0.9] text-[var(--color-text-primary)] uppercase max-w-5xl mx-auto">
              YOUR CRAFT. ON YOUR TERMS.<br />
              <span className="relative inline-block text-[#F13030] dark:text-[#FF4D4D]">
                INSTANTLY BOOKED.
                <svg
                  className="absolute left-0 -bottom-2 w-full h-4 text-[#F13030] pointer-events-none"
                  viewBox="0 0 300 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 15Q75 2 150 15T295 12"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto font-body leading-relaxed font-normal">
              Verified performer profiles, Monologg Escrow Protocol, and proprietary Thespian AI vibe scanner. Zero middlemen, zero gatekeeping.
            </p>

            {/* Email Form with Working Copy Link Button & High-Contrast Dark Mode Inputs */}
            <div className="max-w-lg mx-auto pt-2">
              {!submitted ? (
                <form
                  onSubmit={handleSubmit}
                  className="p-1.5 min-[480px]:p-2 rounded-[24px] min-[480px]:rounded-full bg-white dark:bg-[#16161A] border border-gray-200 dark:border-[#26262E] shadow-xl flex flex-col min-[480px]:flex-row items-stretch min-[480px]:items-center gap-2"
                >
                  <input
                    type="email"
                    placeholder="Enter email for instant invite"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-2.5 min-[480px]:px-5 min-[480px]:py-3 text-sm bg-transparent outline-none text-[#16161A] dark:text-[#F5F5F0] placeholder:text-gray-400 dark:placeholder:text-[#A6A6B0] text-center min-[480px]:text-left"
                  />
                  <Button
                    type="submit"
                    variant="red"
                    className="h-11 px-6 text-xs font-bold w-full min-[480px]:w-auto rounded-full shrink-0"
                  >
                    Get Early Access <ArrowRight className="w-4 h-4 ml-1 inline" />
                  </Button>
                </form>
              ) : (
                <div className="p-3 px-5 rounded-[24px] min-[480px]:rounded-full bg-[#FFECEC] text-[#F13030] dark:bg-[#F13030]/20 dark:text-[#FF4D4D] border border-[#F13030] flex flex-col min-[480px]:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2 text-xs font-bold truncate">
                    <Check className="w-4 h-4 text-[#F13030] shrink-0" />
                    <span className="truncate">You're #347 in queue!</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1 rounded-full bg-[#F13030] text-white text-xs font-bold hover:bg-[#d31f20] transition-all flex items-center gap-1.5 shrink-0 w-full min-[480px]:w-auto justify-center"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied Link!" : "Copy Invite Link"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3-Column Stats */}
            <div className="grid grid-cols-3 gap-2 min-[400px]:gap-6 max-w-3xl mx-auto pt-12 border-t border-[var(--color-hairline)] text-center">
              <div>
                <div className="text-2xl min-[400px]:text-3xl md:text-5xl font-black font-mono text-[#F13030] dark:text-[#FF4D4D]">
                  97%
                </div>
                <div className="text-[10px] min-[400px]:text-xs text-[var(--color-text-secondary)] font-medium mt-1 leading-tight">
                  On-Time Delivery Rate
                </div>
              </div>
              <div>
                <div className="text-2xl min-[400px]:text-3xl md:text-5xl font-black font-mono text-[#F13030] dark:text-[#FF4D4D]">
                  2.9 hrs
                </div>
                <div className="text-[10px] min-[400px]:text-xs text-[var(--color-text-secondary)] font-medium mt-1 leading-tight">
                  Avg Brief to Booking
                </div>
              </div>
              <div>
                <div className="text-2xl min-[400px]:text-3xl md:text-5xl font-black font-mono text-[#F13030] dark:text-[#FF4D4D]">
                  3,200+
                </div>
                <div className="text-[10px] min-[400px]:text-xs text-[var(--color-text-secondary)] font-medium mt-1 leading-tight">
                  Verified Talent Profiles
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED TALENT ROSTER CAROUSEL (Infinite Auto-Looping with Edge Fade Masks) ── */}
        <section id="talent-roster" className="py-24 bg-[var(--color-bg-surface-2)] border-y border-[var(--color-hairline)]">
          <div className="max-w-6xl mx-auto px-6 md:px-16 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F13030] dark:text-[#FF4D4D]">
                Verified Performer Marketplace
              </span>
              <h2 className="font-wise-sans text-3xl md:text-5xl font-bold uppercase tracking-tight text-[var(--color-text-primary)]">
                Discover &amp; Book Top Performing Artists Instantly
              </h2>
            </div>
            <Button variant="outline-pill" className="h-10 px-5 text-xs font-bold shrink-0" onClick={() => navigate("/auth")}>
              Explore Directory (3,200+)
            </Button>
          </div>

          <TalentCarousel />
        </section>

        {/* ── MONOLOGG ESCROW CALCULATOR SECTION ── */}
        <section id="escrow-calculator" className="relative py-24 px-6 md:px-16 bg-[#0D0D0F] text-white overflow-hidden">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#F13030] text-white">
                <Shield className="w-3.5 h-3.5 fill-current" />
                <span>Monologg Escrow Protocol</span>
              </div>

              <h2 className="font-wise-sans text-4xl md:text-6xl font-bold uppercase tracking-tight leading-[0.95] text-white">
                PAYMENT SECURITY.<br />
                <span className="text-[#FF4D4D]">AUTOMATED IN ESCROW.</span>
              </h2>

              <p className="text-base text-white/80 leading-relaxed font-body">
                Contracts are funded upfront into FINCRA Escrow prior to recording or performance. Talent works with 100% confidence, and clients enjoy automated deliverable signoff.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F13030] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">Zero Non-Payment Risk for Talent</h4>
                    <p className="text-sm text-white/70">Escrow funds are locked securely prior to project kickoff.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F13030] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">Instant Payouts on Approval</h4>
                    <p className="text-sm text-white/70">Direct bank transfer release within 24 hours of client signoff.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <MonologgEscrowCalculator />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS (High Contrast Dark Mode Cards) ── */}
        <section id="how-it-works" className="py-24 px-6 md:px-16 bg-[var(--color-bg-canvas)]">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F13030] dark:text-[#FF4D4D]">
                Simple Workflow
              </span>
              <h2 className="font-wise-sans text-3xl md:text-5xl font-bold uppercase tracking-tight text-[var(--color-text-primary)]">
                Go Live in 3 Easy Steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-[28px] bg-white dark:bg-[#16161A] border border-gray-200 dark:border-[#26262E] space-y-4 relative shadow-sm hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FFECEC] text-[#F13030] dark:bg-[#F13030]/20 dark:text-[#FF4D4D] font-mono font-bold text-lg flex items-center justify-center">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-lg font-display text-[#16161A] dark:text-[#F5F5F0]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-[#A6A6B0] leading-relaxed font-body">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCI-FI INTERACTIVE GLOBAL TRUST MAP ── */}
        <section className="py-24 px-6 md:px-16 bg-[var(--color-bg-surface-2)] border-t border-[var(--color-hairline)]">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F13030] dark:text-[#FF4D4D]">
                Endorsed by Performers &amp; Brands
              </span>
              <h2 className="font-wise-sans text-3xl md:text-5xl font-bold uppercase tracking-tight text-[var(--color-text-primary)]">
                Trusted Across the Continent
              </h2>
            </div>

            <SciFiTrustMap />
          </div>
        </section>

        {/* ── FAQ ACCORDION (High Contrast Dark Mode Fix) ── */}
        <section className="py-24 px-6 md:px-16 bg-[var(--color-bg-canvas)]">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="font-wise-sans text-3xl md:text-5xl font-bold uppercase text-center tracking-tight text-[var(--color-text-primary)]">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-[18px] bg-white dark:bg-[#16161A] border border-gray-200 dark:border-[#26262E] overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-6 flex items-center justify-between text-left font-bold text-base text-[#16161A] dark:text-[#F5F5F0]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-200 shrink-0 text-gray-400 dark:text-[#A6A6B0] ${
                        openFaq === i ? "rotate-180 text-[#F13030] dark:text-[#FF4D4D]" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-sm text-gray-600 dark:text-[#A6A6B0] leading-relaxed border-t border-gray-100 dark:border-[#26262E] pt-4 font-body">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CONVERSION CTA ── */}
        <section className="relative py-28 px-6 md:px-16 bg-[#16161A] text-white text-center border-t border-white/10 overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            <h2 className="font-wise-sans text-4xl md:text-7xl font-bold uppercase tracking-tight leading-[0.9] text-white">
              TAKE CONTROL OF YOUR CRAFT.
            </h2>
            <p className="text-base text-white/80 max-w-xl mx-auto font-body">
              Join over 3,200 verified actors, voice talent, and comperes getting booked directly with zero commission on their first booking.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button
                variant="red"
                className="h-12 px-8 text-sm font-bold shadow-xl"
                onClick={() => navigate("/auth")}
              >
                Launch Storefront Free
              </Button>
              <Button
                variant="outline-pill"
                className="h-12 px-8 text-sm font-bold border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate("/auth")}
              >
                Post a Project Brief
              </Button>
            </div>
          </div>
        </section>
      </main>

      <FloatingQRBadge onClick={() => setShowQrModal(true)} />
      <QRCodeModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />

      {/* ── OVERSIZED LOGOTYPE FOOTER ── */}
      <footer className="pt-20 pb-12 px-6 md:px-16 bg-[#0D0D0F] text-white border-t border-white/10 relative overflow-hidden">
        <WebGLHeroCanvas opacityMultiplier={0.2} />
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 text-sm">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Logo className="h-7 w-auto text-white" />
              </div>
              <p className="text-xs text-white/60 max-w-xs leading-relaxed font-body">
                The world's first brief-to-booking pipeline for performing arts and the creator economy.
              </p>
              <div className="text-xs font-mono text-[#FF4D4D] pt-2">
                hello@monologg.app
              </div>
              <div className="flex items-center gap-3 pt-2 text-white/70">
                <a href="#" className="hover:text-white flex items-center gap-1 text-xs">
                  <span>X (Twitter)</span> <ArrowUpRight className="w-3 h-3" />
                </a>
                <a href="#" className="hover:text-white flex items-center gap-1 text-xs">
                  <span>LinkedIn</span> <ArrowUpRight className="w-3 h-3" />
                </a>
                <a href="#" className="hover:text-white flex items-center gap-1 text-xs">
                  <span>Instagram</span> <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-white/50 font-mono">Product</h4>
              <ul className="space-y-2 text-xs text-white/70 font-body">
                <li><a href="#talent-roster" className="hover:text-white transition-colors">Talent Directory</a></li>
                <li><a href="#escrow-calculator" className="hover:text-white transition-colors">Monologg Escrow</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Thespian AI Scanner</a></li>
                <li><a href="/design-system" className="hover:text-white transition-colors">Design System</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-white/50 font-mono">Solutions</h4>
              <ul className="space-y-2 text-xs text-white/70 font-body">
                <li><a href="/auth" className="hover:text-white transition-colors">For Voice Talent</a></li>
                <li><a href="/auth" className="hover:text-white transition-colors">For Lead Actors</a></li>
                <li><a href="/auth" className="hover:text-white transition-colors">For Event Comperes</a></li>
                <li><a href="/auth" className="hover:text-white transition-colors">For Brand Directors</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-white/50 font-mono">Company &amp; Legal</h4>
              <ul className="space-y-2 text-xs text-white/70 font-body">
                <li><a href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">NDPA Data Protection</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FINCRA Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/50 font-mono gap-4">
            <div>© {new Date().getFullYear()} Monologg Inc. All rights reserved.</div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">✓ NDPA Compliant</span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">✓ FINCRA Escrow Verified</span>
            </div>
          </div>

          <div className="pt-8 text-center select-none overflow-hidden">
            <h1 className="font-wise-sans text-[64px] sm:text-[120px] md:text-[180px] font-black uppercase tracking-tighter leading-none text-white/10 hover:text-white/20 transition-colors pointer-events-none">
              MONOLOGG
            </h1>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Avatar } from "../components/ui/Avatar";
import { WebsiteFooter } from "../components/ui/WebsiteFooter";
import { useTheme } from "../Root";
import { appStateSync } from "../../lib/state-sync";
import { apiClient } from "../../lib/api-client";
import {
  ChevronDown,
  LayoutDashboard,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";

// ── Local Figma Assets from 178359:17305 (/assets/product/...) ──

// Header
const imgHeaderLogoMask = "/assets/product/421a9122738c7030bca32dfdc9e66e861b17a1e0.svg";
const imgHeaderLogoMark = "/assets/product/42406d6b92ad6d49dc99bf1748474b2457bf8974.svg";
const imgHeaderLogoWordmark = "/assets/product/b715a74e897fed863a52c5d7246006146e5893aa.svg";
const imgThemeToggleSvg = "/assets/product/c63a178a4b21cf2ea20dd9e61b037e06863d22b7.svg";

// Background blur gradients
const imgGradientBackgroundLeft = "/assets/product/7df413b3f4e2638cded294bde801b9a5794d9c38.svg";
const imgGradientBackgroundRight = "/assets/product/b24bf99929f977e20cb983048a0ea314029e259b.svg";

// Hero & CTA Buttons
const imgIconArrowRightWhite = "/assets/product/516903b6b524bafd57d55118edffff86c955eb80.svg";
const imgIconArrowRightRed = "/assets/product/10a8bb1ae813ccff638e74e1fb37b6b799179e49.svg";

// 7-Step Stepper Card State Icons (Active / Default / Completed)
const imgArrowCircleRight = "/assets/product/81db1c32dcabe58f2679bbc4723008ac3152faff.svg";
const imgSpinner = "/assets/product/d992e1c0bcf7201e7672eff69bed533992e67ce3.svg";
const imgCheckCircle = "/assets/product/5d95f1f313a1d448e7041b57c9347d098fcc237c.svg";

// Shared 300x300 Phone Mask
const imgPhoneMask = "/assets/product/2edd4450f001dd0abfe2d83e8c81067819f49f0c.svg";

// Step 01: Interactive AI Agent (178359:17452 / 178359:17732)
const imgStep01PhoneBody = "/assets/product/3a85c108ecf2721153ba2f5118796f89a6d72382.svg";
const imgStep01BubbleFrame = "/assets/product/a60f8b95cfd30c76f134221bc2779d4f2d1f8b99.svg";
const imgStep01Circle = "/assets/product/efa04d61cc372d212fb4c5eed6855a9bea697808.svg";
const imgStep01ChatIcon = "/assets/product/a4db2e9564fac0339cf8fe3f5cd9edc2684a8304.svg";
const imgStep01LineTop = "/assets/product/1a9311e1abc41ebc2249545a054bb967d2ac6bf7.svg";
const imgStep01LineBottom = "/assets/product/5488e8f4c49a968639556eea4eded19210791f1a.svg";
const imgStep01CheckIcon = "/assets/product/e0d473433fbcb9fc12639572915a756cfba6d28a.svg";

// Step 02: Custom Rate Cards & Micro-Deliverables (178359:17521)
const imgStep02PhoneBody = "/assets/product/d662e29af64b905d5d500a1c06b5fe019294e308.svg";
const imgStep02PillFrame = "/assets/product/7bbbb0d18b1f2164efadb0be13ebd4066611fa41.svg";
const imgStep02RateIcon = "/assets/product/83c5181ce4dd2c124171398fa0bd74f47a47102d.svg";
const imgStep02PillLine = "/assets/product/46d1d3714f7474baa93edb08f354d6bb5aeb592f.svg";

// Step 03: Real-Time Performer Analytics & Visitor Intelligence (178359:17585)
const imgStep03PhoneBody = "/assets/product/14bcf404ca3688e6ed543428217b2c5de31a495d.svg";
const imgStep03HubFrame = "/assets/product/a9053c3b6a7c8645c784864ba4bdbcbd7e41146d.svg";
const imgStep03HubIcon = "/assets/product/1bfcc7e0109be2a6c8bb87fb481bc04746608178.svg";

// Step 04: Escrow Security (178359:17620)
const imgStep04PhoneBody = "/assets/product/874bbe30d4f9b498a38de7b5b1bb5ca56ea3e852.svg";
const imgStep04BadgeFrame = "/assets/product/4eb9198ee00f29496235f51eb6c08430abdf4bc6.svg";
const imgStep04ShieldIcon = "/assets/product/5c37f98ec79739d7128a8702b4ed7c1f80c12f45.svg";

// Step 05: Direct Proposal Bidding: (178359:17653)
const imgStep05PhoneBody = "/assets/product/c1e035c3634a11199b1029a5ff44eab493b16e78.svg";
const imgStep05FilterBar = "/assets/product/552aa295674ee823edf5c156483fe1acaaba40ad.svg";
const imgStep05SearchIcon = "/assets/product/05b6e061dd5c1c012a510c20211a97082da141fd.svg";
const imgStep05PillBorder = "/assets/product/2264de4b028464876784085ebf22068f8f81c49e.svg";
const imgStep05Pill1Line = "/assets/product/544554d56364b84261fc108ad6b7d0e1f1107302.svg";
const imgStep05Pill2Fill = "/assets/product/5abffb6f60e8f8f15df9d96a397bc72e7190844f.svg";
const imgStep05Pill2Line = "/assets/product/e15e17a59f0a349e70b5ded2a66e1e7ce79b8495.svg";
const imgStep05Pill3Line = "/assets/product/6bf06fd73c837312fce3d7772f6bb9da80758aa5.svg";

// Step 06: Sleek Bio Storefront (178359:17485)
const imgStep06PhoneBody = "/assets/product/5c606eea80385fe45b8481474f3a9b6ec0257a19.svg";
const imgStep06CardFrame = "/assets/product/b9864c3dc11d0ba0cad4ace419563215a419fc45.svg";
const imgStep06Circle = "/assets/product/e52ccd7489c94b5dd178f3412987dd40e0831526.svg";
const imgStep06AvatarIcon = "/assets/product/c6a7e07166a406c0aaf2eda728f2e76d2891c21e.svg";
const imgStep06LineTop = "/assets/product/a4b28ddcb786fceb51cb243a3154166b126ae1f9.svg";
const imgStep06LineBottom = "/assets/product/0c81cf78681d1bb7e2aab16b506878d4d7a434f0.svg";

// Step 07: Integrated Scheduling (178359:17700)
const imgStep07PhoneBody = "/assets/product/c3e53e3181c45ec3fd10f37c8145d5903f3a0e25.svg";
const imgStep07CalendarIcon = "/assets/product/adc4df54f07ad4b503764edfa4640e14d936b3e8.svg";

// Client Portal Icons & Dividers (178359:17765)
const imgSealCheck = "/assets/product/06e5d2fa6ae96a377a3e7d3af99609cbceb4ec2d.svg";
const imgClientVertDivider = "/assets/product/d5d92b724711f1d25ef4d3eceee5cbcb81e2ab3d.svg";
const imgChat4Fill = "/assets/product/6570ec056926e13f3904c8913939c4666fb548b9.svg";
const imgClientHorizDivider = "/assets/product/6e560c10559038fb8b15ddb80bdfaba942e1077b.svg";
const imgNotePencil = "/assets/product/36eaa778b44188f5263f7c2fe32385baf98dba66.svg";
const imgLockFill = "/assets/product/ec8e464fa6f32cff40f0a10d263eeab24e5df24b.svg";

// 6 Media House Logos (178359:17816)
const imgVimeo = "/assets/product/f003d68d2249c84fece7cc7393564ca5da806ef7.svg";
const imgNetflix = "/assets/product/500574fbcd5ba3e7a335dbacfb2577603f491e06.svg";
const imgAmazonPrime = "/assets/product/885f1320cc62aa3e7499c0c6d685b5dd6a4b9f32.svg";
const imgDisney = "/assets/product/6af24080b5b11fb194570daadce4dd29ef64f831.svg";
const imgHulu = "/assets/product/9652a2fa7e1cbe77e46fb1911c09e7d7a74b6088.svg";
const imgTwitch = "/assets/product/f8ec10a74c55b3653d9b0d426c7187b0010ca711.svg";

// Section Dividers & Thespian AI Dividers (178359:17831)
const imgDashedDivider = "/assets/product/7dc94ccc0ee6370325d0ef6f15631b8f8b00d4c2.svg";
const imgThespianVert116 = "/assets/product/0ea607751a150fba84c44e04467701ab827a2a73.svg";
const imgThespianHoriz910 = "/assets/product/53e4874d36f89d43a8bff9fd94a731c57addaa21.svg";
const imgThespianVert60 = "/assets/product/e33eaa19c1e453995eaf9b69cc28a873ef337604.svg";
const imgThespianWideDivider = "/assets/product/11132c5419787d075ad3c0035763e5d22dfe5f91.svg";

// FAQ Icons (178359:17958)
const imgFaqPlus = "/assets/product/0f468a50f646f4cf0717649c47ca00c3757b7265.svg";

/**
 * Renders the exact 300x300 Figma SVG illustration for each of the 7 steps (0..6),
 * extracted directly from 178359:17452 and 178359:17481 (Frame 2147228146).
 */
function StepIllustration({ stepIndex }: { stepIndex: number }) {
  switch (stepIndex) {
    // 01 — Interactive AI Agent (178359:17452 / 178359:17732)
    case 0:
      return (
        <div
          className="overflow-clip relative shrink-0 size-[300px]"
          data-node-id="178359:17452"
          data-testid="step-illustration-01"
        >
          <div className="absolute contents inset-0" data-name="Mask group">
            <div
              className="absolute inset-[8.75%_14.38%_-6.25%_14.37%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[-43.125px_-26.25px] mask-size-[300px_300px]"
              style={{
                maskImage: `url("${imgPhoneMask}")`,
                WebkitMaskImage: `url("${imgPhoneMask}")`,
              }}
            >
              <div className="absolute inset-[-0.16%_-0.22%]">
                <img alt="" className="block max-w-none size-full" src={imgStep01PhoneBody} />
              </div>
            </div>
          </div>
          <div className="absolute inset-[26.25%_22.5%_55%_12.5%]">
            <div className="absolute inset-[-0.83%_-0.24%]">
              <img alt="" className="block max-w-none size-full" src={imgStep01BubbleFrame} />
            </div>
          </div>
          <div className="absolute inset-[30.63%_74.38%_59.38%_15.63%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep01Circle} />
          </div>
          <div className="absolute inset-[32.83%_76.58%_61.58%_17.83%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep01ChatIcon} />
          </div>
          <div className="absolute inset-[31.25%_49.38%_66.12%_29.38%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep01LineTop} />
          </div>
          <div className="absolute inset-[36.56%_43.13%_60.44%_29.38%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep01LineBottom} />
          </div>
          <div className="absolute inset-[34.22%_27.4%_62.62%_68.2%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep01CheckIcon} />
          </div>
        </div>
      );

    // 02 — Custom Rate Cards & Micro-Deliverables (178359:17521)
    case 1:
      return (
        <div
          className="overflow-clip relative shrink-0 size-[300px]"
          data-node-id="178359:17521"
          data-testid="step-illustration-02"
        >
          <div className="absolute contents inset-0" data-name="Mask group">
            <div
              className="absolute inset-[8.75%_14.38%_-6.25%_14.37%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[-43.125px_-26.25px] mask-size-[300px_300px]"
              style={{
                maskImage: `url("${imgPhoneMask}")`,
                WebkitMaskImage: `url("${imgPhoneMask}")`,
              }}
            >
              <div className="absolute inset-[-0.16%_-0.22%]">
                <img alt="" className="block max-w-none size-full" src={imgStep02PhoneBody} />
              </div>
            </div>
          </div>
          <div className="absolute inset-[13.75%_47.5%_73.75%_12.5%]">
            <div className="absolute inset-[-1.25%_-0.39%]">
              <img alt="" className="block max-w-none size-full" src={imgStep02PillFrame} />
            </div>
          </div>
          <div className="absolute inset-[17.64%_76.27%_77.64%_18.14%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep02RateIcon} />
          </div>
          <div className="absolute inset-[18.75%_53.75%_78.75%_27.5%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep02PillLine} />
          </div>
        </div>
      );

    // 03 — Real-Time Performer Analytics & Visitor Intelligence (178359:17585)
    case 2:
      return (
        <div
          className="overflow-clip relative shrink-0 size-[300px]"
          data-node-id="178359:17585"
          data-testid="step-illustration-03"
        >
          <div className="absolute contents inset-0" data-name="Mask group">
            <div
              className="absolute inset-[8.75%_14.38%_-6.25%_14.37%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[-43.125px_-26.25px] mask-size-[300px_300px]"
              style={{
                maskImage: `url("${imgPhoneMask}")`,
                WebkitMaskImage: `url("${imgPhoneMask}")`,
              }}
            >
              <div className="absolute inset-[-0.16%_-0.22%]">
                <img alt="" className="block max-w-none size-full" src={imgStep03PhoneBody} />
              </div>
            </div>
          </div>
          <div className="absolute bottom-1/2 left-[40%] right-[40%] top-[30%]">
            <div className="absolute inset-[-0.78%]">
              <img alt="" className="block max-w-none size-full" src={imgStep03HubFrame} />
            </div>
          </div>
          <div className="absolute inset-[36.56%_45.94%_55.94%_45.94%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep03HubIcon} />
          </div>
        </div>
      );

    // 04 — Escrow Security (178359:17620)
    case 3:
      return (
        <div
          className="overflow-clip relative shrink-0 size-[300px]"
          data-node-id="178359:17620"
          data-testid="step-illustration-04"
        >
          <div className="absolute contents inset-0" data-name="Mask group">
            <div
              className="absolute inset-[8.75%_14.38%_-6.25%_14.37%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[-43.125px_-26.25px] mask-size-[300px_300px]"
              style={{
                maskImage: `url("${imgPhoneMask}")`,
                WebkitMaskImage: `url("${imgPhoneMask}")`,
              }}
            >
              <div className="absolute inset-[-0.16%_-0.22%]">
                <img alt="" className="block max-w-none size-full" src={imgStep04PhoneBody} />
              </div>
            </div>
          </div>
          <div className="absolute inset-[4.38%_41.87%_79.38%_41.88%]">
            <div className="absolute inset-[-0.96%]">
              <img alt="" className="block max-w-none size-full" src={imgStep04BadgeFrame} />
            </div>
          </div>
          <div className="absolute inset-[9.49%_46.72%_83.67%_46.72%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep04ShieldIcon} />
          </div>
        </div>
      );

    // 05 — Direct Proposal Bidding: (178359:17653)
    case 4:
      return (
        <div
          className="overflow-clip relative shrink-0 size-[300px]"
          data-node-id="178359:17653"
          data-testid="step-illustration-05"
        >
          <div className="absolute contents inset-0" data-name="Mask group">
            <div
              className="absolute inset-[8.75%_14.38%_-6.25%_14.37%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[-43.125px_-26.25px] mask-size-[300px_300px]"
              style={{
                maskImage: `url("${imgPhoneMask}")`,
                WebkitMaskImage: `url("${imgPhoneMask}")`,
              }}
            >
              <div className="absolute inset-[-0.16%_-0.22%]">
                <img alt="" className="block max-w-none size-full" src={imgStep05PhoneBody} />
              </div>
            </div>
          </div>
          <div className="absolute inset-[16.25%_12.5%_70%_12.5%]">
            <div className="absolute inset-[-1.14%_-0.21%]">
              <img alt="" className="block max-w-none size-full" src={imgStep05FilterBar} />
            </div>
          </div>
          <div className="absolute inset-[20.33%_76.27%_74.08%_18.14%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep05SearchIcon} />
          </div>
          <div className="absolute inset-[20%_58.75%_73.75%_27.5%]">
            <div className="absolute inset-[-2.5%_-1.14%]">
              <img alt="" className="block max-w-none size-full" src={imgStep05PillBorder} />
            </div>
          </div>
          <div className="absolute inset-[22.38%_61.88%_76%_30.63%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep05Pill1Line} />
          </div>
          <div className="absolute inset-[20%_40%_73.75%_43.75%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep05Pill2Fill} />
          </div>
          <div className="absolute inset-[22.38%_43.13%_76%_46.88%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep05Pill2Line} />
          </div>
          <div className="absolute inset-[20%_23.75%_73.75%_62.5%]">
            <div className="absolute inset-[-2.5%_-1.14%]">
              <img alt="" className="block max-w-none size-full" src={imgStep05PillBorder} />
            </div>
          </div>
          <div className="absolute inset-[22.38%_26.88%_76%_65.63%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep05Pill3Line} />
          </div>
        </div>
      );

    // 06 — Sleek Bio Storefront (178359:17485)
    case 5:
      return (
        <div
          className="overflow-clip relative shrink-0 size-[300px]"
          data-node-id="178359:17485"
          data-testid="step-illustration-06"
        >
          <div className="absolute contents inset-0" data-name="Mask group">
            <div
              className="absolute inset-[8.75%_14.38%_-6.25%_14.37%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[-43.125px_-26.25px] mask-size-[300px_300px]"
              style={{
                maskImage: `url("${imgPhoneMask}")`,
                WebkitMaskImage: `url("${imgPhoneMask}")`,
              }}
            >
              <div className="absolute inset-[-0.16%_-0.22%]">
                <img alt="" className="block max-w-none size-full" src={imgStep06PhoneBody} />
              </div>
            </div>
          </div>
          <div className="absolute bottom-1/2 left-[36.25%] right-[36.25%] top-[18.75%]">
            <div className="absolute inset-[-0.5%_-0.57%]">
              <img alt="" className="block max-w-none size-full" src={imgStep06CardFrame} />
            </div>
          </div>
          <div className="absolute inset-[23.13%_44.38%_65.63%_44.38%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep06Circle} />
          </div>
          <div className="absolute inset-[25.94%_46.95%_68.44%_46.95%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep06AvatarIcon} />
          </div>
          <div className="absolute inset-[37.5%_41.87%_60%_41.88%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep06LineTop} />
          </div>
          <div className="absolute inset-[42.5%_40%_55%_40%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep06LineBottom} />
          </div>
        </div>
      );

    // 07 — Integrated Scheduling (178359:17700)
    case 6:
    default:
      return (
        <div
          className="overflow-clip relative shrink-0 size-[300px]"
          data-node-id="178359:17700"
          data-testid="step-illustration-07"
        >
          <div className="absolute contents inset-0" data-name="Mask group">
            <div
              className="absolute inset-[8.75%_14.38%_-6.25%_14.37%] mask-intersect mask-luminance mask-no-clip mask-no-repeat mask-position-[-43.125px_-26.25px] mask-size-[300px_300px]"
              style={{
                maskImage: `url("${imgPhoneMask}")`,
                WebkitMaskImage: `url("${imgPhoneMask}")`,
              }}
            >
              <div className="absolute inset-[-0.16%_-0.22%]">
                <img alt="" className="block max-w-none size-full" src={imgStep07PhoneBody} />
              </div>
            </div>
          </div>
          <div className="absolute inset-[13.75%_47.5%_73.75%_12.5%]">
            <div className="absolute inset-[-1.25%_-0.39%]">
              <img alt="" className="block max-w-none size-full" src={imgStep02PillFrame} />
            </div>
          </div>
          <div className="absolute inset-[16.99%_76.48%_77.42%_18.36%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep07CalendarIcon} />
          </div>
          <div className="absolute inset-[18.75%_53.75%_78.75%_27.5%]">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStep02PillLine} />
          </div>
        </div>
      );
  }
}

export function ProductPage() {
  const navigate = useNavigate();
  const { toggle } = useTheme();

  const [loggedInUser, setLoggedInUser] = useState(appStateSync.getLoggedInUser());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Active step in the 7-step interactive showcase (0-indexed: 0..6)
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isStepPaused, setIsStepPaused] = useState<boolean>(false);

  // Thespian AI in-place role switch ("performer" | "client")
  const [thespianRole, setThespianRole] = useState<"performer" | "client">("performer");

  // FAQ open item (null or index)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    try {
      window.scrollTo?.(0, 0);
    } catch {}
  }, []);

  useEffect(() => {
    return appStateSync.subscribe(() => {
      setLoggedInUser(appStateSync.getLoggedInUser());
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-cycle through the 7 steps every 4.5s unless paused by hover/interaction
  useEffect(() => {
    if (isStepPaused) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 7);
    }, 4500);
    return () => clearInterval(timer);
  }, [isStepPaused]);

  const handleSignOut = async () => {
    try {
      await apiClient.logout();
    } catch {}
    appStateSync.setLoggedInUser(null);
    setShowUserMenu(false);
    navigate("/");
  };

  const userInitials = loggedInUser?.name
    ? loggedInUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const talentProfile = loggedInUser ? appStateSync.getTalentProfile() : null;
  const userAvatarUrl = talentProfile?.avatarUrl;

  const userMenuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: loggedInUser?.userType === "TALENT" ? "/dashboard" : "/client",
    },
    { label: "Settings", icon: SettingsIcon, path: "/settings" },
  ];

  // 7 Interactive Showcase Steps (Figma 178359:17392)
  const steps = [
    {
      id: "01",
      title: "Interactive AI Agent",
      description:
        "Ditch scattered bio links for a mobile storefront that showcases your video monologues, audio reels, reach metrics, and verified reviews all in one place.",
    },
    {
      id: "02",
      title: "Custom Rate Cards & Micro-Deliverables",
      description:
        "Set clear baseline prices for gigs and fan requests so clients can book your auditions, MC hosting, voiceovers, or personalized shoutouts instantly.",
    },
    {
      id: "03",
      title: "Real-Time Performer Analytics & Visitor Intelligence",
      description:
        "See exactly who is visiting your page, which monologues they play, where they find your link, and how many views turn into paid bookings.",
    },
    {
      id: "04",
      title: "Escrow Security",
      description:
        "Never worry about non-payment or client ghosting again. Funds for gigs and custom shoutouts are deposited safely into escrow prior to production or recording and released immediately upon project completion.",
    },
    {
      id: "05",
      title: "Direct Proposal Bidding:",
      description:
        "Browse open casting briefs posted by verified studios and commercial media vendors; submit auditions and proposals in seconds.",
    },
    {
      id: "06",
      title: "Sleek Bio Storefront",
      description:
        "Ditch scattered bio links for a mobile storefront that showcases your video monologues, audio reels, reach metrics, and verified reviews all in one place.",
    },
    {
      id: "07",
      title: "Integrated Scheduling",
      description:
        "Sync your calendar so visitors can book audition slots, phone consultations, or quick custom messages without back-and-forth emails.",
    },
  ];

  // 6 Media House Logos (Figma 178359:17816)
  const studioBadges = [
    { name: "Vimeo", src: imgVimeo, nodeId: "178359:17819" },
    { name: "Netflix", src: imgNetflix, nodeId: "178359:17821" },
    { name: "Amazon Prime", src: imgAmazonPrime, nodeId: "178359:17823" },
    { name: "Disney+", src: imgDisney, nodeId: "178359:17825" },
    { name: "Hulu", src: imgHulu, nodeId: "178359:17827" },
    { name: "Twitch", src: imgTwitch, nodeId: "178359:17829" },
  ];

  // 10 FAQs (Figma 178359:17958)
  const faqs = [
    {
      question: "What is Monologg and how does it work?",
      answer:
        "Monologg is like Upwork for Actors, Public speakers, Comperes, Comedians, Streamers, Artists, Musicians, and Creators. Performers get a personalized link to showcase their work, set prices, and manage bookings. Clients such as studios, directors, and event organizers use it to find verified talent, post jobs, and pay securely through the platform.",
    },
    {
      question: "What currency does Monologg support?",
      answer:
        "Currently, all transactions are processed in Nigerian Naira (₦) through secure payment gateways such as Paystack. Future updates will include support for Dollar (USD) and Pound (GBP) payments.",
    },
    {
      question: "How does escrow payment protection work?",
      answer:
        "To ensure safety for all parties, clients deposit the agreed payment into an escrow account managed by Monologg before the performance begins. Once the job is completed and both parties provide feedback, the funds are released to the performer immediately.",
    },
    {
      question: "What are the platform fees?",
      answer:
        "Monologg charges a total fee of 16% for each booking, divided between performers and clients: 7% deducted from performer earnings, which is less than the typical 20% to 25% taken by traditional agents; clients bear an additional 9% on their invoices to ensure payment protection.",
    },
    {
      question: "How does Thespian AI work?",
      answer:
        "When performers upload their monologues or voice reels, Thespian AI analyzes the audio to identify key elements like accent, emotional tone, comedic timing, and performance style, automatically tagging the profile with relevant descriptors.",
    },
    {
      question: "What data can performers see?",
      answer:
        "Performers are provided with a user-friendly dashboard that tracks metrics such as profile views, video plays, traffic sources (e.g., Instagram, TikTok), and revenue generated from various packages.",
    },
    {
      question: "How does Monologg ensure safety for payments?",
      answer:
        "Monologg uses an escrow system to secure payments. Funds are held safely until the performer completes the job or delivers the shoutout, ensuring that clients only pay for work they approve.",
    },
    {
      question: "What features does Monologg offer to performers?",
      answer:
        "Performers can create personalized profiles, upload portfolios, set their own rates, and manage bookings seamlessly. They can also receive feedback from clients and showcase their experience, increasing their visibility and opportunities.",
    },
    {
      question: "How does Monologg support communication between clients and performers?",
      answer:
        "Monologg features an integrated messaging system that allows clients and performers to communicate directly, discuss project details, and finalize arrangements efficiently.",
    },
    {
      question: "What type of gigs can clients post on Monologg?",
      answer:
        "Clients can post a variety of gigs ranging from acting roles, public speaking events, and comedy performances to music gigs and custom video requests, catering to diverse entertainment needs.",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-start bg-white dark:bg-[#000000] text-[#1a1a1a] dark:text-[#f9f9f9] antialiased overflow-x-clip relative isolate w-full"
      data-node-id="178359:17305"
    >
      {/* ── Ambient Blur Background Layer (178359:17353) ── */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-[2349px] w-[1440px] h-[2316px] z-0 overflow-hidden"
        data-node-id="178359:17353"
      >
        <div
          className="absolute h-[249.229px] left-[-185.75px] top-[851.24px] w-[206.047px]"
          data-node-id="178359:17354"
        >
          <div className="absolute inset-[-91.79%_-108.2%]">
            <img alt="" className="block max-w-none size-full" src={imgGradientBackgroundLeft} />
          </div>
        </div>
        <div
          className="absolute h-[249.229px] left-[1064.25px] top-[115.24px] w-[206.047px]"
          data-node-id="178359:17359"
        >
          <div className="absolute inset-[-91.79%_-108.2%]">
            <img alt="" className="block max-w-none size-full" src={imgGradientBackgroundRight} />
          </div>
        </div>
      </div>

      {/* ── 1. Top Announcement Bar (178359:17306) ── */}
      <div
        className="bg-[#1a1a1a] border-b border-[#333333] flex h-[40px] items-center justify-between px-4 sm:px-[24px] relative shrink-0 w-full z-50"
        data-node-id="178359:17306"
      >
        <div className="flex gap-[8px] items-center shrink-0" data-node-id="178359:17307">
          <div
            className="bg-[#f13030] rounded-full shrink-0 size-[8px]"
            data-node-id="178359:17308"
          />
          <div className="flex items-center" data-node-id="178359:17309">
            <p
              className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-white text-[11px] leading-[15px] whitespace-nowrap"
              data-node-id="178359:17310"
            >
              Monologg is in Alpha 🥳 🥳
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-[16px] items-center shrink-0" data-node-id="178359:17311">
          <p
            className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[11px] text-[rgba(255,255,255,0.8)] leading-[15px] whitespace-nowrap"
            data-node-id="178359:17313"
          >
            Paystack Secured
          </p>
          <p
            className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[11px] text-[rgba(255,255,255,0.8)] leading-[15px]"
            data-node-id="178359:17315"
          >
            ·
          </p>
          <p
            className="font-['JetBrains_Mono',monospace] font-bold text-[11px] text-[rgba(255,255,255,0.8)] leading-[15px] whitespace-nowrap"
            data-node-id="178359:17317"
          >
            25+ Verified Performers
          </p>
        </div>
      </div>

      {/* ── 2. Sticky Header (178359:17318) ── */}
      <header
        className="backdrop-blur-[12px] bg-white/95 dark:bg-[#000000]/95 border-[#e8e8e8] dark:border-[#1a1a1a] border-b border-solid flex h-[68px] items-center justify-between px-4 sm:px-8 lg:px-[64px] shrink-0 sticky top-0 w-full z-50 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.06),0px_2px_4px_-2px_rgba(0,0,0,0.06)]"
        data-node-id="178359:17318"
      >
        <div
          className="pointer-events-none absolute inset-0 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]"
          data-node-id="178359:17319"
        />

        <div className="flex gap-[12px] items-center relative shrink-0 z-10" data-node-id="178359:17320">
          {/* Monologg SVG Logo (178359:17321) */}
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer h-[24px] overflow-clip relative shrink-0 w-[105.109px]"
            data-node-id="178359:17321"
            role="button"
            aria-label="Monologg Home"
          >
            <div className="absolute contents inset-[14.02%_80.78%_14.25%_3.55%]">
              <div
                className="absolute inset-[14.93%_81%_15.21%_3.77%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-0.226px_-0.219px] mask-size-[16.466px_17.215px]"
                style={{
                  maskImage: `url("${imgHeaderLogoMask}")`,
                  WebkitMaskImage: `url("${imgHeaderLogoMask}")`,
                }}
              >
                <div className="absolute inset-[-1.33%_-1.39%_-1.65%_-1.39%]">
                  <img alt="" className="block max-w-none size-full dark:invert" src={imgHeaderLogoMark} />
                </div>
              </div>
            </div>
            <div className="absolute inset-[22.1%_1.22%_6.52%_24.14%]">
              <img alt="Monologg" className="absolute block inset-0 max-w-none size-full dark:invert" src={imgHeaderLogoWordmark} />
            </div>
          </div>

          {/* Nav Links (178359:17333) */}
          <nav className="hidden md:flex gap-[4px] items-center relative shrink-0" data-node-id="178359:17333">
            <button
              onClick={() => navigate("/product")}
              className="flex flex-col items-start px-[16px] py-[6px] relative rounded-full shrink-0 cursor-pointer"
              data-node-id="178359:17334"
            >
              <div className="flex gap-[10px] items-center justify-center relative shrink-0" data-node-id="178359:17335">
                <div
                  className="bg-[rgba(241,48,48,0.8)] border border-[rgba(241,48,48,0.4)] border-solid relative rounded-full shrink-0 size-[8px]"
                  data-node-id="178359:17336"
                />
                <span
                  className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#f25757] text-[12px] leading-[16px] whitespace-nowrap"
                  data-node-id="178359:17337"
                >
                  Product
                </span>
              </div>
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="flex flex-col items-start px-[16px] py-[6px] relative rounded-full shrink-0 cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#484848] dark:text-[#bababa] hover:text-[#1a1a1a] dark:hover:text-[#f9f9f9] text-[12px] leading-[16px] transition-colors whitespace-nowrap"
              data-node-id="178359:17338"
            >
              Pricing
            </button>
            <button
              onClick={() => navigate("/resources")}
              className="flex flex-col items-start px-[16px] py-[6px] relative rounded-full shrink-0 cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[#484848] dark:text-[#bababa] hover:text-[#1a1a1a] dark:hover:text-[#f9f9f9] text-[12px] leading-[16px] transition-colors whitespace-nowrap"
              data-node-id="178359:17340"
            >
              Resources
            </button>
          </nav>
        </div>

        {/* Right Controls (178359:17344) */}
        <div className="flex gap-[12px] items-center relative shrink-0 z-10" data-node-id="178359:17344">
          <button
            onClick={toggle}
            className="bg-white dark:bg-[#000000] border border-[#e8e8e8] dark:border-[#1a1a1a] border-solid flex items-center justify-center relative rounded-full shrink-0 size-[36px] cursor-pointer hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] transition-colors"
            data-node-id="178359:17345"
            aria-label="Toggle theme"
          >
            <div className="relative shrink-0 size-[16px]" data-node-id="178359:17346">
              <img alt="" className="absolute block inset-0 max-w-none size-full dark:invert" src={imgThemeToggleSvg} />
            </div>
          </button>

          {loggedInUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-full p-1 pr-2 border border-[#e8e8e8] dark:border-[#1a1a1a] bg-white dark:bg-[#000000] hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] transition-all active:scale-95 shadow-sm cursor-pointer"
                aria-label="Account menu"
              >
                <Avatar
                  size="sm"
                  src={userAvatarUrl ?? undefined}
                  background="#F13030"
                  color="#FFFFFF"
                >
                  {userInitials}
                </Avatar>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#767676] dark:text-[#a3a3a3] transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl shadow-xl overflow-hidden z-50 bg-white dark:bg-[#000000] border border-[#e8e8e8] dark:border-[#1a1a1a]"
                  >
                    <div className="flex items-center gap-3 p-4 border-b border-[#e8e8e8] dark:border-[#1a1a1a]">
                      <Avatar
                        size="md"
                        src={userAvatarUrl ?? undefined}
                        background="#F13030"
                        color="#FFFFFF"
                      >
                        {userInitials}
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate text-[#1a1a1a] dark:text-[#f9f9f9]">
                          {loggedInUser.name}
                        </div>
                        <div className="text-xs truncate text-[#767676] dark:text-[#a3a3a3]">
                          {loggedInUser.email}
                        </div>
                      </div>
                    </div>
                    <div className="py-1.5">
                      {userMenuItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate(item.path);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-[#1a1a1a] dark:text-[#f9f9f9] hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                        >
                          <item.icon className="w-4 h-4 text-[#767676] dark:text-[#a3a3a3]" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="py-1.5 border-t border-[#e8e8e8] dark:border-[#1a1a1a]">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-[#f13030] hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] transition-colors font-medium cursor-pointer"
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
            <div className="flex items-center gap-[12px]">
              <button
                onClick={() => navigate("/auth?mode=signin")}
                className="border border-[#d1d1d1] dark:border-[#1a1a1a] border-solid flex h-[40px] items-center justify-center pb-[11.5px] pt-[10.5px] px-[20px] relative rounded-full shrink-0 font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1a1a1a] dark:text-[#f9f9f9] text-[12px] leading-[16px] tracking-[-0.12px] hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                data-node-id="178359:17348"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="bg-[#f13030] hover:bg-[#d31f20] flex h-[40px] items-center justify-center pb-[12.5px] pt-[11.5px] px-[20px] relative rounded-full shrink-0 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-white text-[12px] leading-[16px] tracking-[-0.12px] transition-all active:scale-95 cursor-pointer"
                data-node-id="178359:17350"
              >
                Sign up free
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="flex-1 flex flex-col items-center w-full relative z-10">
        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 1: PERFORMER PORTAL (178359:17364)
            Includes Hero (178359:17378) + 7-Step Interactive Showcase (178359:17392)
            with 3 states per card (default / active / completed) and the 7 extracted
            300x300 Figma SVG illustrations in the right-hand preview box (no duplicate section).
        ════════════════════════════════════════════════════════════════════════ */}
        <section
          className="bg-white dark:bg-[#000000] flex flex-col gap-[80px] items-center px-4 sm:px-8 xl:px-[200px] py-[80px] lg:py-[112px] relative w-full"
          data-node-id="178359:17364"
        >
          {/* Performer Portal Hero Header (178359:17378) */}
          <div
            className="flex flex-col gap-[32px] items-center relative shrink-0 w-full max-w-[1040px]"
            data-node-id="178359:17378"
          >
            <div
              className="flex flex-col gap-[20px] items-center relative shrink-0"
              data-node-id="178359:17379"
            >
              <div
                className="flex flex-col gap-[12px] items-center relative shrink-0"
                data-node-id="178359:17380"
              >
                <div
                  className="flex gap-[10px] items-center justify-center relative shrink-0"
                  data-node-id="178359:17381"
                >
                  <div
                    className="bg-[rgba(241,48,48,0.8)] border border-[rgba(241,48,48,0.4)] border-solid relative rounded-full shrink-0 size-[8px]"
                    data-node-id="178359:17382"
                  />
                  <span
                    className="font-['Geist_Mono',monospace] font-normal text-[#f13030] text-[14px] leading-[18px] tracking-[1.26px] uppercase whitespace-nowrap"
                    data-node-id="178359:17383"
                  >
                    Performer Portal
                  </span>
                </div>
                <h1
                  className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[40px] sm:text-[56px] lg:text-[64px] leading-tight sm:leading-[1.1] text-center tracking-[-1.92px] max-w-[820px]"
                  data-node-id="178359:17384"
                >
                  Build your personal <br className="hidden sm:inline" />digital stage
                </h1>
              </div>
              <p
                className="font-['Inter_Tight',sans-serif] font-normal leading-[26px] text-[#767676] dark:text-[#a3a3a3] text-[18px] text-center tracking-[0.54px] max-w-[664px]"
                data-node-id="178359:17385"
              >
                Pitch on live casting briefs, set your custom service rates, track customer
                analytics, and get paid securely.
              </p>
            </div>

            <div className="flex items-center relative shrink-0" data-node-id="178359:17386">
              <button
                onClick={() => navigate("/onboarding")}
                className="bg-[#f13030] hover:bg-[#d31f20] flex gap-[8px] h-[40px] items-center justify-center overflow-clip px-[24px] py-[8px] relative rounded-[23px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] shrink-0 cursor-pointer transition-all active:scale-95"
                data-node-id="178359:17387"
              >
                <span
                  className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] leading-[16px] text-center text-white tracking-[-0.12px] whitespace-nowrap"
                  data-node-id="178359:17389"
                >
                  Get started for free
                </span>
                <div className="relative shrink-0 size-[16px]" data-node-id="178359:17390">
                  <img
                    alt=""
                    className="absolute block inset-0 max-w-none size-full"
                    src={imgIconArrowRightWhite}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* 7-Step Interactive Feature Showcase (178359:17392) */}
          <div
            className="flex flex-col items-start justify-center relative shrink-0 w-full max-w-[1040px]"
            data-node-id="178359:17392"
            onMouseEnter={() => setIsStepPaused(true)}
            onMouseLeave={() => setIsStepPaused(false)}
          >
            <div
              className="flex flex-col lg:flex-row gap-[24px] items-start relative shrink-0 w-full"
              data-node-id="178359:17393"
            >
              {/* Left Column: 7 Step Cards with 3 States (default / active / completed) (178359:17394) */}
              <div
                className="flex flex-col gap-[12px] items-start relative rounded-[20px] shrink-0 w-full lg:w-[491px]"
                data-node-id="178359:17394"
              >
                {steps.map((step, idx) => {
                  const cardState: "completed" | "active" | "default" =
                    idx < activeStep
                      ? "completed"
                      : idx === activeStep
                        ? "active"
                        : "default";

                  // ── ACTIVE STATE (Frame 11 / Frame 19) ──
                  if (cardState === "active") {
                    return (
                      <motion.div
                        layout
                        key={step.id}
                        onClick={() => setActiveStep(idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActiveStep(idx);
                          }
                        }}
                        data-step-state="active"
                        data-testid={`step-card-${step.id}`}
                        className="bg-[#f9f9f9] dark:bg-[#141414] border border-[#e8e8e8] dark:border-[#1a1a1a] border-solid flex gap-[24px] items-start p-[24px] relative rounded-[12px] shrink-0 w-full cursor-pointer transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03)] outline-none focus:outline-none focus-visible:outline-none"
                      >
                        <motion.div
                          className="relative shrink-0 size-[24px]"
                          data-name="ArrowCircleRight"
                          whileHover={{ x: 3 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <img
                            alt=""
                            className="absolute block inset-0 max-w-none size-full dark:invert"
                            src={imgArrowCircleRight}
                          />
                        </motion.div>
                        <div className="[word-break:break-word] flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative">
                          <h3 className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] w-full">
                            {step.title}
                          </h3>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden w-full"
                          >
                            <p className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] tracking-[0.48px] w-full pt-1">
                              {step.description}
                            </p>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  }

                  // ── COMPLETED STATE (Frame 20) ──
                  if (cardState === "completed") {
                    return (
                      <motion.div
                        layout
                        key={step.id}
                        onClick={() => setActiveStep(idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActiveStep(idx);
                          }
                        }}
                        data-step-state="completed"
                        data-testid={`step-card-${step.id}`}
                        className="bg-white dark:bg-[#000000] border border-[#e8e8e8] dark:border-[#1a1a1a] border-solid flex gap-[24px] items-start p-[24px] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-[#f9f9f9] dark:hover:bg-[#141414] transition-all outline-none focus:outline-none focus-visible:outline-none"
                      >
                        <div className="font-['Switzer',sans-serif] font-medium text-[#333333] dark:text-[#d1d1d1] text-[18px] leading-[24px] whitespace-nowrap shrink-0">
                          {step.id}
                        </div>
                        <div className="flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative">
                          <h3 className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] w-full">
                            {step.title}
                          </h3>
                        </div>
                        <motion.div
                          initial={{ scale: 0.75, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 420, damping: 24 }}
                          className="relative shrink-0 size-[24px]"
                          data-name="CheckCircle"
                        >
                          <img
                            alt="Completed"
                            className="absolute block inset-0 max-w-none size-full"
                            src={imgCheckCircle}
                          />
                        </motion.div>
                      </motion.div>
                    );
                  }

                  // ── DEFAULT STATE (Frame 13) ──
                  return (
                    <motion.div
                      layout
                      key={step.id}
                      onClick={() => setActiveStep(idx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveStep(idx);
                        }
                      }}
                      data-step-state="default"
                      data-testid={`step-card-${step.id}`}
                      className="bg-white dark:bg-[#000000] border border-[#e8e8e8] dark:border-[#1a1a1a] border-solid flex gap-[24px] items-start p-[24px] relative rounded-[12px] shrink-0 w-full cursor-pointer hover:bg-[#f9f9f9] dark:hover:bg-[#141414] transition-all outline-none focus:outline-none focus-visible:outline-none"
                    >
                      <div className="font-['Switzer',sans-serif] font-medium text-[#bababa] dark:text-[#767676] text-[18px] leading-[24px] whitespace-nowrap shrink-0">
                        {step.id}
                      </div>
                      <div className="flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px relative">
                        <h3 className="font-['Switzer',sans-serif] font-medium text-[#484848] dark:text-[#bababa] text-[18px] leading-[24px] w-full">
                          {step.title}
                        </h3>
                      </div>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 3,
                          ease: "linear",
                        }}
                        className="relative shrink-0 size-[24px] opacity-70 group-hover:opacity-100 transition-opacity"
                        data-name="Spinner"
                      >
                        <img
                          alt="Pending"
                          className="absolute block inset-0 max-w-none size-full dark:invert"
                          src={imgSpinner}
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right Column: Dynamic 525x484 Stage Rendering the Active Step's 300x300 Figma SVG Illustration (178359:17450) */}
              <div
                className="bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#e8e8e8] dark:border-[#1a1a1a] flex h-[484px] items-center justify-center relative rounded-[20px] shrink-0 w-full lg:w-[525px] lg:sticky lg:top-[100px]"
                data-node-id="178359:17450"
              >
                <div
                  className="bg-[#f9f9f9] dark:bg-[#1a1a1a] flex flex-col h-full items-center justify-center overflow-clip relative rounded-[20px] shrink-0"
                  data-node-id="178359:17451"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, scale: 0.96, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -6 }}
                      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <StepIllustration stepIndex={activeStep} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Dashed Horizontal Divider (178359:17764) ── */}
        <div className="h-0 relative shrink-0 w-full overflow-hidden" data-node-id="178359:17764">
          <div className="relative w-full h-[2px]">
            <img alt="" className="block w-full h-full object-cover dark:opacity-30 dark:invert" src={imgDashedDivider} />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 2: CLIENT PORTAL (178359:17765)
            Includes Header (178359:17766) + 2x2 Feature Grid (178359:17785) +
            6 Studio Logos Bar (178359:17816)
        ════════════════════════════════════════════════════════════════════════ */}
        <section
          className="bg-white dark:bg-[#000000] flex flex-col gap-[80px] items-center px-4 sm:px-8 xl:px-[200px] py-[80px] lg:py-[112px] relative w-full"
          data-node-id="178359:17765"
        >
          {/* Client Portal Header (178359:17766) */}
          <div
            className="flex flex-col gap-[32px] items-center relative shrink-0 w-full max-w-[948px]"
            data-node-id="178359:17766"
          >
            <div
              className="flex flex-col gap-[20px] items-center relative shrink-0 w-full"
              data-node-id="178359:17767"
            >
              <div
                className="flex flex-col gap-[12px] items-center relative shrink-0 w-full"
                data-node-id="178359:17768"
              >
                <div
                  className="flex gap-[10px] items-center justify-center relative shrink-0"
                  data-node-id="178359:17769"
                >
                  <div
                    className="bg-[rgba(241,48,48,0.8)] border border-[rgba(241,48,48,0.4)] border-solid relative rounded-full shrink-0 size-[8px]"
                    data-node-id="178359:17770"
                  />
                  <span
                    className="font-['Geist_Mono',monospace] font-normal text-[#f13030] text-[14px] leading-[18px] tracking-[1.26px] uppercase whitespace-nowrap"
                    data-node-id="178359:17771"
                  >
                    client Portal
                  </span>
                </div>
                <h2
                  className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[40px] sm:text-[56px] lg:text-[64px] leading-none text-center tracking-[-1.92px] max-w-[948px]"
                  data-node-id="178359:17772"
                >
                  The Upwork for Performer Acquisition
                </h2>
              </div>
              <p
                className="font-['Inter_Tight',sans-serif] font-normal leading-[26px] text-[#767676] dark:text-[#a3a3a3] text-[18px] text-center tracking-[0.54px] max-w-[546px]"
                data-node-id="178359:17773"
              >
                A professional performer acquisition network built for production houses,
                casting directors, brand managers, live event organizers, and fans.
              </p>
            </div>

            <button
              onClick={() => navigate("/onboarding")}
              className="bg-[#f13030] hover:bg-[#d31f20] flex gap-[8px] h-[40px] items-center justify-center overflow-clip px-[24px] py-[8px] relative rounded-[23px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] shrink-0 cursor-pointer transition-all active:scale-95"
              data-node-id="178359:17774"
            >
              <span
                className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[14px] leading-[16px] text-center text-white tracking-[-0.12px] whitespace-nowrap"
                data-node-id="178359:17776"
              >
                Get started for free
              </span>
              <div className="relative shrink-0 size-[16px]" data-node-id="178359:17777">
                <img
                  alt=""
                  className="absolute block inset-0 max-w-none size-full"
                  src={imgIconArrowRightWhite}
                />
              </div>
            </button>
          </div>

          {/* 2x2 Feature Grid + Bottom Trust Bar (178359:17784) */}
          <div
            className="flex flex-col items-center relative shrink-0 w-full max-w-[1040px]"
            data-node-id="178359:17784"
          >
            {/* Top 2x2 Bordered Box (178359:17785) */}
            <div
              className="bg-white dark:bg-[#000000] border-[#e8e8e8] dark:border-[#1a1a1a] border-l border-r border-solid border-t flex flex-col gap-[32px] items-center p-6 sm:p-[32px] relative rounded-tl-[20px] rounded-tr-[20px] shrink-0 w-full max-w-[1000px]"
              data-node-id="178359:17785"
            >
              {/* Row 1 (178359:17786) */}
              <div
                className="bg-white dark:bg-[#000000] flex flex-col md:flex-row gap-[24px] items-center relative shrink-0 w-full"
                data-node-id="178359:17786"
              >
                {/* Card 1: Verified Creator Pool */}
                <div
                  className="flex flex-[1_0_0] flex-col items-start min-w-px relative w-full"
                  data-node-id="178359:17787"
                >
                  <div
                    className="flex flex-col gap-[32px] items-center relative shrink-0 w-full"
                    data-node-id="178359:17788"
                  >
                    <div
                      className="relative shrink-0 size-[24px]"
                      data-node-id="178359:17789"
                      data-name="SealCheck"
                    >
                      <img
                        alt=""
                        className="absolute block inset-0 max-w-none size-full dark:invert"
                        src={imgSealCheck}
                      />
                    </div>
                    <div
                      className="flex flex-col gap-[20px] items-center relative shrink-0 w-full"
                      data-node-id="178359:17790"
                    >
                      <h3
                        className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] text-center whitespace-nowrap"
                        data-node-id="178359:17792"
                      >
                        Verified Creator Pool
                      </h3>
                      <p
                        className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] text-center tracking-[0.48px] w-full"
                        data-node-id="178359:17793"
                      >
                        Browse rich, data-verified candidate pipelines across Actors,
                        Comedians, Voiceover Artistes, Comperes, Musicians, Public speakers,
                        Streamers, and Content Creators.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider (178359:17794) */}
                <div
                  className="hidden md:block h-[148px] relative shrink-0 w-0 dark:opacity-30 dark:invert"
                  data-node-id="178359:17794"
                >
                  <div className="absolute inset-[0_-0.5px]">
                    <img
                      alt=""
                      className="block max-w-none size-full"
                      src={imgClientVertDivider}
                    />
                  </div>
                </div>

                {/* Card 2: Chat with AI Performer Profiles */}
                <div
                  className="flex flex-[1_0_0] flex-col items-start min-w-px relative w-full"
                  data-node-id="178359:17795"
                >
                  <div
                    className="flex flex-col gap-[32px] items-center relative shrink-0 w-full"
                    data-node-id="178359:17796"
                  >
                    <div
                      className="relative shrink-0 size-[24px]"
                      data-node-id="178359:17797"
                      data-name="chat-4-fill"
                    >
                      <img
                        alt=""
                        className="absolute block inset-0 max-w-none size-full dark:invert"
                        src={imgChat4Fill}
                      />
                    </div>
                    <div
                      className="flex flex-col gap-[20px] items-center relative shrink-0 w-full"
                      data-node-id="178359:17798"
                    >
                      <h3
                        className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] text-center whitespace-nowrap"
                        data-node-id="178359:17799"
                      >
                        Chat with AI Performer Profiles
                      </h3>
                      <p
                        className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] text-center tracking-[0.48px] w-full"
                        data-node-id="178359:17800"
                      >
                        Instant Q&amp;A with a performer&apos;s AI agent to verify
                        availability, review project fits, book audition slots, or request
                        custom video drops in seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Divider (178359:17801) */}
              <div className="h-0 relative shrink-0 w-full dark:opacity-30 dark:invert" data-node-id="178359:17801">
                <div className="absolute inset-[-0.5px_0]">
                  <img
                    alt=""
                    className="block max-w-none size-full"
                    src={imgClientHorizDivider}
                  />
                </div>
              </div>

              {/* Row 2 (178359:17802) */}
              <div
                className="bg-white dark:bg-[#000000] flex flex-col md:flex-row gap-[24px] items-center relative shrink-0 w-full"
                data-node-id="178359:17802"
              >
                {/* Card 3: Post Gigs & Micro-Briefs */}
                <div
                  className="flex flex-[1_0_0] flex-col items-center min-w-px relative w-full"
                  data-node-id="178359:17803"
                >
                  <div
                    className="flex flex-col gap-[32px] items-center relative shrink-0 w-full"
                    data-node-id="178359:17804"
                  >
                    <div
                      className="relative shrink-0 size-[24px]"
                      data-node-id="178359:17805"
                      data-name="NotePencil"
                    >
                      <img
                        alt=""
                        className="absolute block inset-0 max-w-none size-full dark:invert"
                        src={imgNotePencil}
                      />
                    </div>
                    <div
                      className="flex flex-col gap-[20px] items-center relative shrink-0 text-center w-full"
                      data-node-id="178359:17806"
                    >
                      <h3
                        className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] w-full"
                        data-node-id="178359:17807"
                      >
                        Post Gigs &amp; Micro-Briefs
                      </h3>
                      <p
                        className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] tracking-[0.48px] w-full"
                        data-node-id="178359:17808"
                      >
                        Publish creative briefs, indie movie roles, corporate event jobs, or
                        direct shoutout requests in minutes and receive direct, structured
                        applications or instant fulfillments.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider (178359:17809) */}
                <div
                  className="hidden md:block h-[148px] relative shrink-0 w-0 dark:opacity-30 dark:invert"
                  data-node-id="178359:17809"
                >
                  <div className="absolute inset-[0_-0.5px]">
                    <img
                      alt=""
                      className="block max-w-none size-full"
                      src={imgClientVertDivider}
                    />
                  </div>
                </div>

                {/* Card 4: Secure Contracts & Escrow Payments */}
                <div
                  className="flex flex-[1_0_0] flex-row items-center self-stretch w-full"
                  data-node-id="178359:17810"
                >
                  <div className="flex flex-[1_0_0] flex-col h-full items-center min-w-px relative w-full">
                    <div
                      className="flex flex-col gap-[32px] items-center relative shrink-0 w-full"
                      data-node-id="178359:17811"
                    >
                      <div
                        className="relative shrink-0 size-[24px]"
                        data-node-id="178359:17812"
                        data-name="lock-fill"
                      >
                        <img
                          alt=""
                          className="absolute block inset-0 max-w-none size-full dark:invert"
                          src={imgLockFill}
                        />
                      </div>
                      <div
                        className="flex flex-col gap-[20px] items-center relative shrink-0 w-full"
                        data-node-id="178359:17813"
                      >
                        <h3
                          className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] text-center whitespace-nowrap"
                          data-node-id="178359:17814"
                        >
                          Secure Contracts &amp; Escrow Payments
                        </h3>
                        <p
                          className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] text-center tracking-[0.48px] w-full"
                          data-node-id="178359:17815"
                        >
                          Sign standard digital agreements with built-in milestones and escrow
                          payment safety.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Attached Bar: 6 Studio Logos & Trust Copy (178359:17816) */}
            <div
              className="bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#e8e8e8] dark:border-[#1a1a1a] border-solid flex gap-[12px] items-center justify-center px-[32px] py-[16px] relative rounded-bl-[20px] rounded-br-[20px] shrink-0 w-full max-w-[1000px]"
              data-node-id="178359:17816"
            >
              <div
                className="flex items-start justify-center relative shrink-0 pr-[8.585px]"
                data-node-id="178359:17817"
              >
                {studioBadges.map((studio) => (
                  <div
                    key={studio.name}
                    className="bg-white dark:bg-[#000000] border-[#e8e8e8] dark:border-[#1a1a1a] border-[0.277px] border-solid flex items-center mr-[-8.585px] p-[8.862px] relative rounded-full shrink-0"
                    title={studio.name}
                  >
                    <div
                      className="relative shrink-0 size-[17.723px]"
                      data-node-id={studio.nodeId}
                    >
                      <img
                        alt={studio.name}
                        className="absolute block inset-0 max-w-none size-full dark:invert"
                        src={studio.src}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p
                className="font-['Inter_Tight',sans-serif] font-normal leading-[20px] text-[#767676] dark:text-[#a3a3a3] text-[12px] text-center tracking-[0.36px] whitespace-nowrap"
                data-node-id="178359:17830"
              >
                Trusted by top media houses
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 3: THESPIAN AI (178359:17831)
            Renders the exact Performer AI 5-row table (178359:17846) AND Client AI
            3-row table (178359:17909) from Figma 178359:17831
        ════════════════════════════════════════════════════════════════════════ */}
        <section
          className="bg-white dark:bg-[#000000] flex flex-col gap-[80px] items-center px-4 sm:px-8 xl:px-[200px] relative w-full"
          data-node-id="178359:17831"
        >
          {/* Top Dashed Divider (178359:17832) */}
          <div className="h-0 relative shrink-0 w-full overflow-hidden" data-node-id="178359:17832">
            <div className="relative w-full h-[2px]">
              <img alt="" className="block w-full h-full object-cover dark:opacity-30 dark:invert" src={imgDashedDivider} />
            </div>
          </div>

          {/* Thespian AI Section Header (178359:17833) */}
          <div
            className="flex items-start justify-center relative shrink-0 w-full"
            data-node-id="178359:17833"
          >
            <div
              className="flex flex-col gap-[20px] items-center relative shrink-0 w-full max-w-[710px]"
              data-node-id="178359:17834"
            >
              <div
                className="flex flex-col gap-[12px] items-center relative shrink-0"
                data-node-id="178359:17835"
              >
                <div
                  className="flex gap-[10px] items-center justify-center relative shrink-0"
                  data-node-id="178359:17836"
                >
                  <div
                    className="bg-[rgba(241,48,48,0.8)] border border-[rgba(241,48,48,0.4)] border-solid relative rounded-full shrink-0 size-[8px]"
                    data-node-id="178359:17837"
                  />
                  <span
                    className="font-['Geist_Mono',monospace] font-normal text-[#f13030] text-[14px] leading-[18px] tracking-[1.26px] uppercase whitespace-nowrap"
                    data-node-id="178359:17838"
                  >
                    Thespian ai
                  </span>
                </div>
                <h2
                  className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[40px] sm:text-[56px] lg:text-[64px] leading-none text-center tracking-[-1.92px] max-w-[670px]"
                  data-node-id="178359:17839"
                >
                  Performance Intelligence Engine
                </h2>
              </div>
              <p
                className="font-['Inter_Tight',sans-serif] font-normal leading-[26px] text-[#767676] dark:text-[#a3a3a3] text-[18px] text-center tracking-[0.54px] max-w-[710px]"
                data-node-id="178359:17840"
              >
                Say goodbye to manual form fatigue and endless email threads. Thespian AI works
                for both sides of the stage` acting as an untiring, 24/7 digital agent for
                performers and an automated casting butler for studios.
              </p>
            </div>
          </div>

          {/* ── Sub-Block A: What Thespian AI Does for the Performer (178359:17846) ── */}
          <div
            className={`flex-col items-center justify-center overflow-clip relative rounded-[32px] shrink-0 w-full ${
              thespianRole === "performer" ? "flex" : "hidden"
            }`}
            data-node-id="178359:17846"
          >
            <div
              className="flex flex-col gap-[40px] items-center relative shrink-0 w-full max-w-[910px]"
              data-node-id="178359:17847"
            >
              {/* Role Indicator + Subheading (178359:17848) */}
              <div
                className="flex flex-col gap-[12px] items-center relative shrink-0"
                data-node-id="178359:17848"
              >
                <div
                  className="flex gap-[8px] items-center p-1 bg-[#f5f5f5] dark:bg-[#1a1a1a] rounded-full border border-[#e8e8e8] dark:border-[#1a1a1a]"
                  data-node-id="178359:17849"
                >
                  <button
                    type="button"
                    aria-label="Performers"
                    onClick={() => setThespianRole("performer")}
                    className="flex gap-[8px] items-center px-4 py-1.5 rounded-full bg-white dark:bg-[#333333] text-[#1a1a1a] dark:text-[#f9f9f9] shadow-sm font-semibold transition-all duration-200 cursor-pointer"
                  >
                    <div
                      className="bg-[rgba(0,0,0,0.8)] dark:bg-[#f9f9f9] border border-[rgba(0,0,0,0.4)] dark:border-[#1a1a1a] border-solid relative rounded-full shrink-0 size-[8px]"
                      data-node-id="178359:17851"
                    />
                    <span
                      className="font-['Geist_Mono',monospace] font-normal text-[14px] leading-[18px] text-[#1a1a1a] dark:text-[#f9f9f9] tracking-[1.26px] uppercase whitespace-nowrap"
                      data-node-id="178359:17852"
                    >
                      PERFORMER
                    </span>
                  </button>
                  <span
                    className="font-['Geist_Mono',monospace] font-normal text-[14px] leading-[18px] text-[#bababa] dark:text-[#767676] tracking-[1.26px] uppercase whitespace-nowrap"
                    data-node-id="178359:17854"
                  >
                    |
                  </span>
                  <button
                    type="button"
                    aria-label="Clients"
                    onClick={() => setThespianRole("client")}
                    className="flex gap-[8px] items-center px-4 py-1.5 rounded-full text-[#767676] dark:text-[#a3a3a3] hover:text-[#1a1a1a] dark:hover:text-[#f9f9f9] opacity-60 hover:opacity-100 transition-all duration-200 cursor-pointer"
                  >
                    <span
                      className="font-['Geist_Mono',monospace] font-normal text-[14px] leading-[18px] tracking-[1.26px] uppercase whitespace-nowrap"
                      data-node-id="178359:17857"
                    >
                      CLIENT
                    </span>
                  </button>
                </div>

                <div
                  className="flex flex-col font-['Switzer',sans-serif] font-medium items-center text-[#1a1a1a] dark:text-[#f9f9f9] text-[24px] sm:text-[32px] text-center tracking-[-0.96px]"
                  data-node-id="178359:17858"
                >
                  <h3 className="leading-[40px]" data-node-id="178359:17859">
                    What Thespian AI Does for the Performer
                  </h3>
                  <p className="leading-[40px] opacity-30 text-[#1a1a1a] dark:text-[#f9f9f9]" data-node-id="178359:17860">
                    Your Digital AI Agent
                  </p>
                </div>
              </div>

              {/* Performer AI 5-Row Feature Table (178359:17861) */}
              <div
                className="flex flex-col gap-[24px] items-center relative rounded-[20px] shrink-0 w-full max-w-[910px]"
                data-node-id="178359:17861"
              >
                {/* Row 1: Instant AI Onboarding (178359:17863) */}
                <div
                  className="hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] flex flex-col md:flex-row items-start md:items-center justify-between p-[24px] relative rounded-[20px] shrink-0 w-full gap-4 transition-all duration-200 ease-out hover:scale-[1.005] cursor-pointer group"
                  data-node-id="178359:17863"
                >
                  <div
                    className="flex flex-col gap-[10px] items-start justify-center relative shrink-0"
                    data-node-id="178359:17864"
                  >
                    <h4
                      className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] w-[160px]"
                      data-node-id="178359:17866"
                    >
                      Instant AI Onboarding
                    </h4>
                  </div>
                  <div
                    className="hidden md:block h-[116px] relative shrink-0 w-0 dark:opacity-30 dark:invert"
                    data-node-id="178359:17867"
                  >
                    <div className="absolute inset-[0_-0.5px]">
                      <img alt="" className="block max-w-none size-full" src={imgThespianVert116} />
                    </div>
                  </div>
                  <p
                    className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] tracking-[0.48px] w-full md:w-[462px]"
                    data-node-id="178359:17868"
                  >
                    Upload a monologue or audio reel, Thespian AI analyzes your media to
                    automatically detect your vocal texture (pitch, accent, projection),
                    comedic timing, and stage presence filling out your performance attributes
                    automatically without having to fill tedious forms.
                  </p>
                </div>

                {/* Divider */}
                <div className="h-0 relative shrink-0 w-full dark:opacity-30 dark:invert" data-node-id="178359:17869">
                  <div className="absolute inset-[-0.5px_0]">
                    <img alt="" className="block max-w-none size-full" src={imgThespianHoriz910} />
                  </div>
                </div>

                {/* Row 2: 24/7 AI Booking Agent (178359:17870) */}
                <div
                  className="hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] flex flex-col md:flex-row items-start md:items-center justify-between p-[24px] relative rounded-[20px] shrink-0 w-full gap-4 transition-all duration-200 ease-out hover:scale-[1.005] cursor-pointer group"
                  data-node-id="178359:17870"
                >
                  <div
                    className="flex flex-col gap-[10px] items-start justify-center relative shrink-0"
                    data-node-id="178359:17873"
                  >
                    <span
                      className="font-['Geist_Mono',monospace] font-normal text-[#767676] dark:text-[#a3a3a3] text-[12px] leading-[16px] tracking-[1.26px] uppercase whitespace-nowrap"
                      data-node-id="178359:17874"
                    >
                      coming soon
                    </span>
                    <h4
                      className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] w-[160px]"
                      data-node-id="178359:17875"
                    >
                      24/7 AI Booking Agent
                    </h4>
                  </div>
                  <div
                    className="hidden md:block h-[60px] relative shrink-0 w-0 dark:opacity-30 dark:invert"
                    data-node-id="178359:17876"
                  >
                    <div className="absolute inset-[0_-0.5px]">
                      <img alt="" className="block max-w-none size-full" src={imgThespianVert60} />
                    </div>
                  </div>
                  <p
                    className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] tracking-[0.48px] w-full md:w-[462px]"
                    data-node-id="178359:17877"
                  >
                    Let visitors chat with your profile about your roles and book auditions
                    directly onto your calendar anytime.
                  </p>
                </div>

                {/* Divider */}
                <div className="h-0 relative shrink-0 w-full dark:opacity-30 dark:invert" data-node-id="178359:17878">
                  <div className="absolute inset-[-0.5px_0]">
                    <img alt="" className="block max-w-none size-full" src={imgThespianHoriz910} />
                  </div>
                </div>

                {/* Row 3: Automatic Gig Pitching (178359:17879) */}
                <div
                  className="hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] flex flex-col md:flex-row items-start md:items-center justify-between p-[24px] relative rounded-[20px] shrink-0 w-full gap-4 transition-all duration-200 ease-out hover:scale-[1.005] cursor-pointer group"
                  data-node-id="178359:17879"
                >
                  <div
                    className="flex flex-col gap-[10px] items-start justify-center relative shrink-0"
                    data-node-id="178359:17882"
                  >
                    <span
                      className="font-['Geist_Mono',monospace] font-normal text-[#767676] dark:text-[#a3a3a3] text-[12px] leading-[16px] tracking-[1.26px] uppercase whitespace-nowrap"
                      data-node-id="178359:17883"
                    >
                      coming soon
                    </span>
                    <h4
                      className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] w-[160px]"
                      data-node-id="178359:17884"
                    >
                      Automatic Gig Pitching
                    </h4>
                  </div>
                  <div
                    className="hidden md:block h-[60px] relative shrink-0 w-0 dark:opacity-30 dark:invert"
                    data-node-id="178359:17885"
                  >
                    <div className="absolute inset-[0_-0.5px]">
                      <img alt="" className="block max-w-none size-full" src={imgThespianVert60} />
                    </div>
                  </div>
                  <p
                    className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] tracking-[0.48px] w-full md:w-[462px]"
                    data-node-id="178359:17886"
                  >
                    Thespian constantly scans script PDFs and casting calls, pitching your
                    profile the moment a role matches your talent and rates.
                  </p>
                </div>

                {/* Divider */}
                <div className="h-0 relative shrink-0 w-full dark:opacity-30 dark:invert" data-node-id="178359:17887">
                  <div className="absolute inset-[-0.5px_0]">
                    <img alt="" className="block max-w-none size-full" src={imgThespianHoriz910} />
                  </div>
                </div>

                {/* Row 4: Contract Guardrails (178359:17888) */}
                <div
                  className="hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] flex flex-col md:flex-row items-start md:items-center justify-between p-[24px] relative rounded-[20px] shrink-0 w-full gap-4 transition-all duration-200 ease-out hover:scale-[1.005] cursor-pointer group"
                  data-node-id="178359:17888"
                >
                  <div
                    className="flex gap-[10px] items-center justify-center relative shrink-0"
                    data-node-id="178359:17889"
                  >
                    <h4
                      className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] w-[160px]"
                      data-node-id="178359:17891"
                    >
                      Contract Guardrails
                    </h4>
                  </div>
                  <div
                    className="hidden md:block h-[60px] relative shrink-0 w-0 dark:opacity-30 dark:invert"
                    data-node-id="178359:17892"
                  >
                    <div className="absolute inset-[0_-0.5px]">
                      <img alt="" className="block max-w-none size-full" src={imgThespianVert60} />
                    </div>
                  </div>
                  <p
                    className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] tracking-[0.48px] w-full md:w-[462px]"
                    data-node-id="178359:17893"
                  >
                    AI automatically checks briefs for unfair terms and ensures booking funds
                    are safely in escrow before you work.
                  </p>
                </div>

                {/* Divider */}
                <div className="h-0 relative shrink-0 w-full dark:opacity-30 dark:invert" data-node-id="178359:17894">
                  <div className="absolute inset-[-0.5px_0]">
                    <img alt="" className="block max-w-none size-full" src={imgThespianHoriz910} />
                  </div>
                </div>

                {/* Row 5: AI Rehearsal Partner (178359:17895) */}
                <div
                  className="hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] flex flex-col md:flex-row items-start md:items-center justify-between p-[24px] relative rounded-[20px] shrink-0 w-full gap-4 transition-all duration-200 ease-out hover:scale-[1.005] cursor-pointer group"
                  data-node-id="178359:17895"
                >
                  <div
                    className="flex flex-col gap-[8px] items-start relative shrink-0"
                    data-node-id="178359:17896"
                  >
                    <span
                      className="font-['Geist_Mono',monospace] font-normal text-[#767676] dark:text-[#a3a3a3] text-[12px] leading-[16px] tracking-[1.26px] uppercase whitespace-nowrap"
                      data-node-id="178359:17897"
                    >
                      coming soon
                    </span>
                    <h4
                      className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] w-[160px]"
                      data-node-id="178359:17898"
                    >
                      AI Rehearsal Partner
                    </h4>
                  </div>
                  <div
                    className="hidden md:block h-[60px] relative shrink-0 w-0 dark:opacity-30 dark:invert"
                    data-node-id="178359:17899"
                  >
                    <div className="absolute inset-[0_-0.5px]">
                      <img alt="" className="block max-w-none size-full" src={imgThespianVert60} />
                    </div>
                  </div>
                  <p
                    className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] tracking-[0.48px] w-full md:w-[462px]"
                    data-node-id="178359:17900"
                  >
                    Upload audition scripts to get character breakdowns and practice your
                    lines with an interactive AI reader.
                  </p>
                </div>

                {/* Divider */}
                <div className="h-0 relative shrink-0 w-full dark:opacity-30 dark:invert" data-node-id="178359:17901">
                  <div className="absolute inset-[-0.5px_0]">
                    <img alt="" className="block max-w-none size-full" src={imgThespianHoriz910} />
                  </div>
                </div>

                {/* Bottom CTA Bar (178359:17902) */}
                <div
                  className="bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#e8e8e8] dark:border-[#1a1a1a] flex items-center justify-between px-[20px] py-[16px] relative rounded-[20px] shrink-0 w-full"
                  data-node-id="178359:17902"
                >
                  <p
                    className="font-['Inter_Tight',sans-serif] font-normal leading-[20px] text-[#1a1a1a] dark:text-[#f9f9f9] text-[14px] tracking-[0.42px]"
                    data-node-id="178359:17903"
                  >
                    Start hiring today
                  </p>
                  <button
                    onClick={() => navigate("/onboarding")}
                    className="flex gap-[12px] h-[24px] items-center justify-end py-[4px] relative shrink-0 cursor-pointer group"
                    data-node-id="178359:17904"
                  >
                    <span
                      className="font-['Inter_Tight',sans-serif] font-medium leading-[20px] text-[#f13030] text-[14px] tracking-[0.42px] whitespace-nowrap group-hover:underline"
                      data-node-id="178359:17905"
                    >
                      Get started for free
                    </span>
                    <div className="relative shrink-0 size-[16px]" data-node-id="178359:17906">
                      <img
                        alt=""
                        className="absolute block inset-0 max-w-none size-full"
                        src={imgIconArrowRightRed}
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sub-Block B: What Thespian AI Does for the Client (178359:17909) ── */}
          <div
            className={`flex-col gap-[40px] items-center relative shrink-0 w-full max-w-[910px] ${
              thespianRole === "client" ? "flex" : "hidden"
            }`}
            data-node-id="178359:17909"
          >
            {/* Role Indicator + Subheading (178359:17910) */}
            <div
              className="flex flex-col gap-[12px] items-center relative shrink-0 w-full"
              data-node-id="178359:17910"
            >
              <div
                className="flex gap-[8px] items-center p-1 bg-[#f5f5f5] dark:bg-[#1a1a1a] rounded-full border border-[#e8e8e8] dark:border-[#1a1a1a]"
                data-node-id="178359:17911"
              >
                <button
                  type="button"
                  aria-label="Performers"
                  onClick={() => setThespianRole("performer")}
                  className="flex gap-[8px] items-center px-4 py-1.5 rounded-full text-[#767676] dark:text-[#a3a3a3] hover:text-[#1a1a1a] dark:hover:text-[#f9f9f9] opacity-60 hover:opacity-100 transition-all duration-200 cursor-pointer"
                >
                  <span
                    className="font-['Geist_Mono',monospace] font-normal text-[14px] leading-[18px] tracking-[1.26px] uppercase whitespace-nowrap"
                    data-node-id="178359:17914"
                  >
                    PERFORMER
                  </span>
                </button>
                <span
                  className="font-['Geist_Mono',monospace] font-normal text-[14px] leading-[18px] text-[#bababa] dark:text-[#767676] tracking-[1.26px] uppercase whitespace-nowrap"
                  data-node-id="178359:17916"
                >
                  |
                </span>
                <button
                  type="button"
                  aria-label="Clients"
                  onClick={() => setThespianRole("client")}
                  className="flex gap-[8px] items-center px-4 py-1.5 rounded-full bg-white dark:bg-[#333333] text-[#1a1a1a] dark:text-[#f9f9f9] shadow-sm font-semibold transition-all duration-200 cursor-pointer"
                >
                  <div
                    className="bg-[rgba(0,0,0,0.8)] dark:bg-[#f9f9f9] border border-[rgba(0,0,0,0.4)] dark:border-[#1a1a1a] border-solid relative rounded-full shrink-0 size-[8px]"
                    data-node-id="178359:17918"
                  />
                  <span
                    className="font-['Geist_Mono',monospace] font-normal text-[14px] leading-[18px] text-[#1a1a1a] dark:text-[#f9f9f9] tracking-[1.26px] uppercase whitespace-nowrap"
                    data-node-id="178359:17919"
                  >
                    CLIENT
                  </span>
                </button>
              </div>

              <div
                className="flex flex-col font-['Switzer',sans-serif] font-medium items-center text-[#1a1a1a] dark:text-[#f9f9f9] text-[24px] sm:text-[32px] text-center tracking-[-0.96px]"
                data-node-id="178359:17920"
              >
                <h3 className="leading-[40px]" data-node-id="178359:17921">
                  What Thespian AI Does for the Client
                </h3>
                <p className="leading-[40px] opacity-30 text-[#1a1a1a] dark:text-[#f9f9f9]" data-node-id="178359:17922">
                  Your Automated Casting Butler
                </p>
              </div>
            </div>

            {/* Client AI 3-Row Feature Table (178359:17923) */}
            <div
              className="flex flex-col gap-[24px] items-center relative shrink-0 w-full"
              data-node-id="178359:17923"
            >
              {/* Top Divider (178359:17924) */}
              <div className="h-0 relative shrink-0 w-full dark:opacity-30 dark:invert" data-node-id="178359:17924">
                <div className="absolute inset-[-0.5px_0]">
                  <img alt="" className="block max-w-none size-full" src={imgThespianHoriz910} />
                </div>
              </div>

              {/* Row 1: Vibe & Texture Matching (178359:17925) */}
              <div
                className="hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] flex flex-col md:flex-row items-start md:items-center justify-between p-[24px] relative rounded-[20px] shrink-0 w-full gap-4 transition-all duration-200 ease-out hover:scale-[1.005] cursor-pointer group"
                data-node-id="178359:17925"
              >
                <div
                  className="flex flex-col gap-[10px] items-start justify-center relative shrink-0"
                  data-node-id="178359:17926"
                >
                  <div
                    className="relative shrink-0 size-[24px]"
                    data-node-id="178359:17927"
                    data-name="NotePencil"
                  >
                    <img
                      alt=""
                      className="absolute block inset-0 max-w-none size-full dark:invert"
                      src={imgNotePencil}
                    />
                  </div>
                  <h4
                    className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] w-[160px]"
                    data-node-id="178359:17928"
                  >
                    Vibe &amp; Texture Matching
                  </h4>
                </div>
                <div
                  className="hidden md:block h-[116px] relative shrink-0 w-0 dark:opacity-30 dark:invert"
                  data-node-id="178359:17929"
                >
                  <div className="absolute inset-[0_-0.5px]">
                    <img alt="" className="block max-w-none size-full" src={imgThespianVert116} />
                  </div>
                </div>
                <p
                  className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] tracking-[0.48px] w-full md:w-[462px]"
                  data-node-id="178359:17930"
                >
                  Match performers based on actual artistic texture, including comedic timing,
                  vocal cadence, accent, and stage presence.
                </p>
              </div>

              {/* Divider */}
              <div className="h-0 relative shrink-0 w-full dark:opacity-30 dark:invert" data-node-id="178359:17931">
                <div className="absolute inset-[-0.5px_0]">
                  <img alt="" className="block max-w-none size-full" src={imgThespianHoriz910} />
                </div>
              </div>

              {/* Row 2: Automated Logistics (178359:17932) */}
              <div
                className="hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] flex flex-col md:flex-row items-start md:items-center justify-between p-[24px] relative rounded-[20px] shrink-0 w-full gap-4 transition-all duration-200 ease-out hover:scale-[1.005] cursor-pointer group"
                data-node-id="178359:17932"
              >
                <div
                  className="flex flex-col gap-[10px] items-start justify-center relative shrink-0"
                  data-node-id="178359:17935"
                >
                  <span
                    className="font-['Geist_Mono',monospace] font-normal text-[#767676] dark:text-[#a3a3a3] text-[12px] leading-[16px] tracking-[1.26px] uppercase whitespace-nowrap"
                    data-node-id="178359:17936"
                  >
                    coming soon
                  </span>
                  <h4
                    className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] w-[160px]"
                    data-node-id="178359:17937"
                  >
                    Automated Logistics
                  </h4>
                </div>
                <div
                  className="hidden md:block h-[60px] relative shrink-0 w-0 dark:opacity-30 dark:invert"
                  data-node-id="178359:17938"
                >
                  <div className="absolute inset-[0_-0.5px]">
                    <img alt="" className="block max-w-none size-full" src={imgThespianVert60} />
                  </div>
                </div>
                <p
                  className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] tracking-[0.48px] w-full md:w-[462px]"
                  data-node-id="178359:17939"
                >
                  Automatically handle identity verification, availability checks, audition
                  invites, calendar scheduling, and escrow protection.
                </p>
              </div>

              {/* Divider */}
              <div className="h-0 relative shrink-0 w-full dark:opacity-30 dark:invert" data-node-id="178359:17940">
                <div className="absolute inset-[-0.5px_0]">
                  <img alt="" className="block max-w-none size-full" src={imgThespianHoriz910} />
                </div>
              </div>

              {/* Row 3: Script & Prompt Parsing (178359:17941) */}
              <div
                className="hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] flex flex-col md:flex-row items-start md:items-center justify-between p-[24px] relative rounded-[20px] shrink-0 w-full gap-4 transition-all duration-200 ease-out hover:scale-[1.005] cursor-pointer group"
                data-node-id="178359:17941"
              >
                <div
                  className="flex flex-col gap-[8px] items-start relative shrink-0"
                  data-node-id="178359:17944"
                >
                  <span
                    className="font-['Geist_Mono',monospace] font-normal text-[#767676] dark:text-[#a3a3a3] text-[12px] leading-[16px] tracking-[1.26px] uppercase whitespace-nowrap"
                    data-node-id="178359:17945"
                  >
                    coming soon
                  </span>
                  <h4
                    className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px] w-[160px]"
                    data-node-id="178359:17946"
                  >
                    Script &amp; Prompt Parsing
                  </h4>
                </div>
                <div
                  className="hidden md:block h-[60px] relative shrink-0 w-0 dark:opacity-30 dark:invert"
                  data-node-id="178359:17947"
                >
                  <div className="absolute inset-[0_-0.5px]">
                    <img alt="" className="block max-w-none size-full" src={imgThespianVert60} />
                  </div>
                </div>
                <p
                  className="font-['Inter_Tight',sans-serif] font-normal leading-[24px] text-[#767676] dark:text-[#a3a3a3] text-[16px] tracking-[0.48px] w-full md:w-[462px]"
                  data-node-id="178359:17948"
                >
                  Drop in a PDF script or creative brief, and the AI reads the dialogue to
                  generate a curated performer shortlist instantly.
                </p>
              </div>

              {/* Divider */}
              <div className="h-0 relative shrink-0 w-full dark:opacity-30 dark:invert" data-node-id="178359:17949">
                <div className="absolute inset-[-0.5px_0]">
                  <img alt="" className="block max-w-none size-full" src={imgThespianHoriz910} />
                </div>
              </div>

              {/* Bottom CTA Bar (178359:17950) */}
              <div
                className="bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#e8e8e8] dark:border-[#1a1a1a] flex items-center justify-between px-[20px] py-[16px] relative rounded-[20px] shrink-0 w-full"
                data-node-id="178359:17950"
              >
                <p
                  className="font-['Inter_Tight',sans-serif] font-normal leading-[20px] text-[#1a1a1a] dark:text-[#f9f9f9] text-[14px] tracking-[0.42px]"
                  data-node-id="178359:17951"
                >
                  Start hiring today
                </p>
                <button
                  onClick={() => navigate("/onboarding")}
                  className="flex gap-[12px] h-[24px] items-center justify-end py-[4px] relative shrink-0 cursor-pointer group"
                  data-node-id="178359:17952"
                >
                  <span
                    className="font-['Inter_Tight',sans-serif] font-medium leading-[20px] text-[#f13030] text-[14px] tracking-[0.42px] whitespace-nowrap group-hover:underline"
                    data-node-id="178359:17953"
                  >
                    Get started for free
                  </span>
                  <div className="relative shrink-0 size-[16px]" data-node-id="178359:17954">
                    <img
                      alt=""
                      className="absolute block inset-0 max-w-none size-full"
                      src={imgIconArrowRightRed}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Divider (178359:17955) */}
          <div className="h-0 relative shrink-0 w-full max-w-[1040px]" data-node-id="178359:17955">
            <div className="absolute inset-[-0.5px_-22.69%]">
              <img alt="" className="block max-w-none size-full dark:opacity-30 dark:invert" src={imgThespianWideDivider} />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 4: FAQ SECTION (178359:17958)
        ════════════════════════════════════════════════════════════════════════ */}
        <section
          className="bg-white dark:bg-[#000000] flex flex-col gap-[80px] items-center justify-center px-4 sm:px-8 xl:px-[200px] py-[80px] lg:py-[120px] relative w-full"
          data-node-id="178359:17958"
        >
          <div className="flex flex-col gap-[24px] items-center relative shrink-0">
            <h2 className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[36px] sm:text-[48px] leading-[48px] tracking-[-1.44px] text-center">
              Frequently Asked Questions
            </h2>
            <p className="font-['Inter_Tight',sans-serif] font-normal text-[#767676] dark:text-[#a3a3a3] text-[16px] leading-[24px] text-center tracking-[0.48px] max-w-[372px]">
              Got questions about how payments, escrow, or Thespian AI work? Here are the
              answers.
            </p>
          </div>

          <div className="flex flex-col gap-[12px] items-center relative shrink-0 w-full max-w-[910px]">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#000000] border border-transparent dark:border-[#1a1a1a] flex flex-col py-[24px] px-[8px] relative rounded-[12px] shrink-0 w-full hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] transition-colors duration-150"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex gap-[24px] items-start justify-between text-left w-full cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex flex-[1_0_0] flex-col gap-[12px] items-start min-w-px relative">
                      <span className="font-['Switzer',sans-serif] font-medium text-[#1a1a1a] dark:text-[#f9f9f9] text-[18px] leading-[24px]">
                        {faq.question}
                      </span>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="answer"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                              opacity: { duration: 0.2, ease: "linear" },
                            }}
                            className="overflow-hidden w-full"
                          >
                            <p className="font-['Inter_Tight',sans-serif] font-normal text-[#767676] dark:text-[#a3a3a3] text-[16px] leading-[24px] tracking-[0.48px] pt-1">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex items-center justify-center relative shrink-0 p-1">
                      <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ type: "spring", stiffness: 360, damping: 25 }}
                        className="flex-none"
                      >
                        <div className="relative size-[24px]">
                          <img
                            alt={isOpen ? "Close" : "Expand"}
                            className="absolute block inset-0 max-w-none size-full dark:invert"
                            src={imgFaqPlus}
                          />
                        </div>
                      </motion.div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 5: FOOTER (178359:17959)
        ════════════════════════════════════════════════════════════════════════ */}
        <WebsiteFooter />
      </main>
    </div>
  );
}

// BnB CRM v2026-04-12-final
import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "./supabase.js";

// ─── BRAND ───────────────────────────────────────────────────────────────────
const B = {
  primary:"#2d3a8c", secondary:"#1a91c7", accent:"#f0b429",
  dark:"#1a2057", light:"#eef0fb", success:"#059669", danger:"#dc2626",
  warn:"#d97706", purple:"#7c3aed",
  grad:"linear-gradient(135deg,#1a2057 0%,#2d3a8c 50%,#1a91c7 100%)",
};

const ROLES = { CEO:"CEO", COUNSELOR:"Counselor", PROCESSING:"Processing Officer", ACCOUNTS:"Accounts", BRANCH_MANAGER:"Branch Manager", FINANCE:"Finance Officer" };
const BRANCHES_DEFAULT = ["Lahore (HQ)","Karachi","Islamabad"];
const ALL_COUNTRIES = [
  "🇬🇧 UK","🇦🇺 Australia","🇺🇸 USA","🇨🇦 Canada",
  "🇳🇿 New Zealand","🇮🇪 Ireland","🇨🇾 North Cyprus","🇨🇾 South Cyprus",
  "🇰🇷 South Korea","🇲🇾 Malaysia","🇹🇷 Turkey","🇸🇪 Sweden",
  "🇫🇮 Finland","🇩🇪 Germany","🇮🇹 Italy",
  "🇨🇦 Canada Immigration","🇦🇺 Australia Immigration",
  "🇩🇪 Germany Job Seeker","🇩🇪 Germany Opportunity Card","🇸🇪 Sweden Job Seeker"
];
const COUNTRIES = ALL_COUNTRIES; // alias
const LEAD_SOURCES_DEFAULT = ["Social Media (Facebook)","Social Media (Instagram)","WhatsApp","CEO Personal Reference","Existing Client Referral","Staff Referral","Walk-in","Website","Sub-Agent","Phone Call","Other"];
const CONTACT_TYPES = ["Call","WhatsApp","Email","Walk-in","Other"];
const QUALIFICATIONS = ["Matric (SSC)","Intermediate (HSSC)","O-Levels","A-Levels","Bachelor's Degree","Master's Degree","PhD","Diploma","Other"];

// ─── PROCESSING STAGES (researched, country-specific) ─────────────────────────
// Map plain country names to PROCESSING_STAGES keys
const COUNTRY_KEY_MAP = {
  "UK":"🇬🇧 UK","United Kingdom":"🇬🇧 UK","uk":"🇬🇧 UK",
  "Australia":"🇦🇺 Australia","AUS":"🇦🇺 Australia","australia":"🇦🇺 Australia",
  "Canada":"🇨🇦 Canada","CAD":"🇨🇦 Canada","canada":"🇨🇦 Canada",
  "USA":"🇺🇸 USA","United States":"🇺🇸 USA","usa":"🇺🇸 USA",
  "Germany":"🇩🇪 Germany","germany":"🇩🇪 Germany",
  "Ireland":"🇮🇪 Ireland","ireland":"🇮🇪 Ireland",
  "North Cyprus":"🇨🇾 North Cyprus","N-Cyprus":"🇨🇾 North Cyprus","north cyprus":"🇨🇾 North Cyprus",
  "South Cyprus":"🇨🇾 South Cyprus","south cyprus":"🇨🇾 South Cyprus",
  "South Korea":"🇰🇷 South Korea","south korea":"🇰🇷 South Korea",
  "Malaysia":"🇲🇾 Malaysia","malaysia":"🇲🇾 Malaysia",
  "Turkey":"🇹🇷 Turkey","turkey":"🇹🇷 Turkey",
  "Sweden":"🇸🇪 Sweden","sweden":"🇸🇪 Sweden",
  "Finland":"🇫🇮 Finland","finland":"🇫🇮 Finland",
  "Italy":"🇮🇹 Italy","italy":"🇮🇹 Italy",
  "Malta":"🇲🇹 Malta","malta":"🇲🇹 Malta",
  "New Zealand":"🇳🇿 New Zealand","new zealand":"🇳🇿 New Zealand",
};
const getCountryKey = (c) => COUNTRY_KEY_MAP[c] || COUNTRY_KEY_MAP[c?.toLowerCase()] || c || "🇬🇧 UK";
const getStages = (country) => PROCESSING_STAGES[getCountryKey(country)] || PROCESSING_STAGES["🇬🇧 UK"] || [];
const getDocs = (country) => PROCESSING_DOCS[getCountryKey(country)] || PROCESSING_DOCS["🇬🇧 UK"] || [];

const PROCESSING_STAGES = {
  "🇬🇧 UK":["Documents Requested","Documents Received","Assessment Finalised","University Application Submitted","Conditional Offer Received","Conditions Being Met","Unconditional Offer Received","CAS Requested","CAS Received","Visa Application Prepared","IHS & Visa Fee Paid","Biometrics Appointment Booked","Biometrics Submitted","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇦🇺 Australia":["Documents Requested","Documents Received","Assessment Finalised","University Application Submitted","Conditional Offer Received","Conditions Being Met","Unconditional Offer Received","Fee Invoice Received","University Fee Paid","CoE Requested","CoE Received","OSHC Insurance Arranged","GTE Statement Prepared","Visa Application Prepared","Health Examination Booked","Health Exam Done","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇺🇸 USA":["Documents Requested","Documents Received","Assessment Finalised","University Application Submitted","Acceptance Letter Received","I-20 Requested","I-20 Received","SEVIS Fee Paid","DS-160 Form Filled","Interview Appointment Booked","Interview Preparation Done","Visa Interview Attended","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇨🇦 Canada":["Documents Requested","Documents Received","Assessment Finalised","University Application Submitted","Conditional Offer Received","Conditions Being Met","Unconditional Offer Received","GIC (Blocked Account) Arranged","CAQ Applied (Quebec only)","CAQ Received","Study Permit Application Prepared","Biometrics Appointment Booked","Biometrics Submitted","Medical Exam Done","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇳🇿 New Zealand":["Documents Requested","Documents Received","Assessment Finalised","Institution Application Submitted","Offer of Place Received","Fee Payment Confirmed","Visa Application Prepared","Medical & Police Clearance","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇮🇪 Ireland":["Documents Requested","Documents Received","Assessment Finalised","College Application Submitted","Offer Letter Received","Fee Payment Confirmed","Visa Application Prepared","Biometrics Submitted","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇨🇾 North Cyprus":["Documents Requested","Documents Received","Assessment Finalised","University Application Submitted","Acceptance Letter Received","Student Permit Application Prepared","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇨🇾 South Cyprus":["Documents Requested","Documents Received","Assessment Finalised","University Application Submitted","Acceptance Letter Received","Student Visa Application Prepared","Medical & Police Clearance","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇰🇷 South Korea":["Documents Requested","Documents Received","Assessment Finalised","University Application Submitted","Acceptance Letter Received","D-2 Visa Application Prepared","TOPIK/Language Proof Arranged","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇲🇾 Malaysia":["Documents Requested","Documents Received","Assessment Finalised","University Application Submitted","Offer Letter Received","EMGS Health Screening","EMGS Application Submitted","Approval Letter Received","eVAL/Student Pass Applied","Student Pass Received","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇹🇷 Turkey":["Documents Requested","Documents Received","Assessment Finalised","University Application Submitted","Acceptance Letter Received","Equivalence Check Done","Student Visa Application Prepared","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇸🇪 Sweden":["Documents Requested","Documents Received","Assessment Finalised","University Application Submitted","Acceptance Letter Received","Tuition Fee Paid","Residence Permit Application Prepared","Biometrics Appointment Booked","Biometrics Submitted","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇫🇮 Finland":["Documents Requested","Documents Received","Assessment Finalised","University Application Submitted","Acceptance Letter Received","Tuition Fee Paid","Residence Permit Application (Enter Finland)","Biometrics at VFS/Embassy","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇩🇪 Germany":["Documents Requested","Documents Received","Assessment Finalised","Uni-Assist / Direct Application Submitted","Admission Letter Received","Blocked Account Arranged","Health Insurance Arranged","Student Visa Application Prepared","Embassy Appointment Booked","Embassy Interview Attended","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇮🇹 Italy":["Documents Requested","Documents Received","Assessment Finalised","Pre-Enrollment (Universitaly) Submitted","Acceptance Letter Received","Bank Statement / Scholarship Prepared","Study Visa Application Prepared","Dichiarazione di Valore (DoV) Arranged","Visa Filed","Visa Approved","Visa Rejected","Case Closed"],
  "🇨🇦 Canada Immigration":["Documents Requested","Documents Received","Assessment Finalised","IELTS/Language Test Done","ECA (Credential Assessment) Applied","ECA Received","Express Entry Profile Created","ITA Received","PR Application Submitted","Medicals Done","Police Clearance Done","Biometrics Submitted","PR Approved","PR Rejected","Case Closed"],
  "🇦🇺 Australia Immigration":["Documents Requested","Documents Received","Assessment Finalised","Skills Assessment Applied","Skills Assessment Received","Expression of Interest (EOI) Submitted","State Nomination Applied","Invitation to Apply Received","PR Application Submitted","Health Examination Done","Police Clearance Done","Visa Filed","PR Approved","PR Rejected","Case Closed"],
  "🇩🇪 Germany Job Seeker":["Documents Requested","Documents Received","Assessment Finalised","Qualification Recognition Applied","Recognition Result Received","Blocked Account Arranged","CV & Cover Letter Prepared","Embassy Appointment Booked","Job Seeker Visa Filed","Visa Approved","Arrived in Germany","Job Found","Work Visa Applied","Case Closed"],
  "🇩🇪 Germany Opportunity Card":["Documents Requested","Documents Received","Assessment Finalised","Points Calculation Done (min 6 pts)","Qualification Recognition Check","Language Certificate Arranged","Blocked Account Arranged","Points Scoring Sheet Prepared","Embassy Appointment Booked","Chancenkarte Application Filed","Visa Approved","Arrived in Germany","Employment Found","Work Permit Applied","Case Closed"],
  "🇸🇪 Sweden Job Seeker":["Documents Requested","Documents Received","Assessment Finalised","Job Offer Secured in Sweden","Work Permit Application Prepared","Health Insurance Arranged","Embassy Appointment Booked","Work Permit Filed","Visa Approved","Case Closed"],
};

// Keep old COUNTRY_STAGES as alias for backward compat in Cases module
const COUNTRY_STAGES = PROCESSING_STAGES;

// ─── DOCUMENT CHECKLISTS (researched, country-specific) ───────────────────────
const PROCESSING_DOCS = {
  "🇬🇧 UK":["Valid Passport (6+ months validity)","Passport Photos (2)","Academic Transcripts (attested)","Matric/O-Level Certificate","Inter/A-Level Certificate","Bachelor's Degree (if PG)","IELTS/PTE/TOEFL Result (within 2 years)","Bank Statement (28+ days, £1,136-£1,483/month)","Bank Certificate / Sponsorship Letter","Unconditional Offer Letter / CAS Number","IHS Payment Receipt","Visa Application Fee Receipt (£524)","Personal Statement / SOP","TB Test Certificate (if required)","ATAS Certificate (if required)","Previous Visa Refusals (if any)"],
  "🇦🇺 Australia":["Valid Passport","Passport Photos (2)","Academic Transcripts (attested)","Matric/O-Level Certificate","Inter/A-Level Certificate","Bachelor's Degree (if applicable)","IELTS/PTE Result (min 6.0 overall)","Bank Statement (AUD 21,041+ per year)","Unconditional Offer Letter / CoE","OSHC Insurance Receipt","GTE Statement","Health Examination Results","Visa Application Fee Receipt (AUD 710)","Student Visa Application (ImmiAccount)"],
  "🇺🇸 USA":["Valid Passport (6+ months validity)","Passport Photos (2, 2×2 inch)","Academic Transcripts (attested)","Degree Certificates","TOEFL/IELTS/Duolingo Score","Bank Statement / Affidavit of Support (USD 25,000+)","I-20 Form (from university)","SEVIS Fee Receipt (I-901)","DS-160 Confirmation Page","Visa Application Fee Receipt","SOP / Personal Statement","Interview Appointment Confirmation","Evidence of Ties to Home Country"],
  "🇨🇦 Canada":["Valid Passport","Passport Photos (2)","Academic Transcripts (attested)","Degree Certificates","IELTS/PTE Result (min 6.0)","Bank Statement / GIC Confirmation (CAD 20,635+)","Acceptance Letter from DLI","CAQ (if Quebec)","Study Permit Application (IMM 1294)","Biometrics Fee Receipt","Medical Exam Results (if required)","Police Clearance Certificate","SOP / Letter of Explanation"],
  "🇳🇿 New Zealand":["Valid Passport","Passport Photos (2)","Academic Transcripts (attested)","Degree Certificates","IELTS/PTE Result","Bank Statement (NZD 15,000+ per year)","Offer of Place from NZ Institution","Tuition Fee Payment Receipt","Medical Certificate (if required)","Police Clearance Certificate","Student Visa Application (INZ 1012)"],
  "🇮🇪 Ireland":["Valid Passport","Passport Photos (2)","Academic Transcripts (attested)","Degree Certificates","IELTS 6.0+","Bank Statement (€7,000 per year minimum)","Offer Letter from Irish Institution","Tuition Fee Payment Receipt","Medical Insurance","Visa Application Form (AVATS)","Cover Letter / SOP","Evidence of Accommodation"],
  "🇨🇾 North Cyprus":["Valid Passport","Passport Photos (4)","Academic Transcripts (attested, apostilled)","Degree Certificates","IELTS/TOEFL (if required)","Bank Statement","University Acceptance Letter","Medical Certificate","Police Clearance Certificate","Application Form for Student Permit"],
  "🇨🇾 South Cyprus":["Valid Passport","Passport Photos (4)","Academic Transcripts (attested, apostilled)","Degree Certificates","IELTS/TOEFL Score","Bank Statement (€5,000 per year)","University Acceptance Letter","Medical Certificate","Police Clearance Certificate","Temporary Residence Permit Application","Proof of Accommodation"],
  "🇰🇷 South Korea":["Valid Passport","Passport Photos (2)","Academic Transcripts (attested)","Degree Certificates","TOPIK Score or Language Test Result","Bank Statement (USD 10,000+)","University Acceptance Letter","Financial Guarantee Letter","D-2 Visa Application Form","Visa Application Fee Receipt"],
  "🇲🇾 Malaysia":["Valid Passport (18+ months validity)","Passport Photos (2, white background)","Academic Transcripts (attested)","SPM/O-Level Certificate","STPM/A-Level Certificate","Degree Certificate (if applicable)","IELTS/TOEFL Result (if English medium)","Bank Statement","Offer Letter from Malaysian University","EMGS Health Screening Report","EMGS Application Receipt","Approval Letter (VAL) from Immigration","eVAL/Student Pass Application"],
  "🇹🇷 Turkey":["Valid Passport","Passport Photos (2)","Academic Transcripts (attested, apostilled)","Degree Certificates","Turkish Equivalence (Denklik) if required","Bank Statement","University Acceptance Letter","Student Visa Application Form","Visa Application Fee Receipt","Medical Insurance Certificate","Proof of Accommodation"],
  "🇸🇪 Sweden":["Valid Passport","Passport Photos (2)","Academic Transcripts (attested)","Degree Certificates","IELTS/TOEFL/PTE (min 6.5)","Bank Statement (SEK 8,568/month)","Letter of Admission from Swedish University","Tuition Fee Payment Receipt","Residence Permit Application (Migrationsverket)","Biometrics Appointment Confirmation"],
  "🇫🇮 Finland":["Valid Passport","Passport Photos (2)","Academic Transcripts (attested)","Degree Certificates","Language Proficiency Certificate (IELTS/Finnish/Swedish)","Bank Statement (€560/month minimum)","Acceptance Letter from Finnish Institution","Tuition Fee Payment Receipt (non-EU)","Enter Finland Residence Permit Application","Biometrics at Embassy/VFS","Health Insurance Certificate"],
  "🇩🇪 Germany":["Valid Passport","Biometric Photos (2)","Academic Transcripts (attested + certified German translation)","Degree Certificates","APS Certificate (mandatory for Pakistani students)","German Language Certificate (TestDaF/DSH/Goethe) or IELTS/TOEFL","Blocked Account Proof (€11,208/year)","University Admission Letter","Health Insurance Certificate","Student Visa Application Form","CV / Motivation Letter","Embassy Appointment Confirmation"],
  "🇮🇹 Italy":["Valid Passport","Passport Photos (2)","Academic Transcripts (attested, apostilled, Italian translation)","Degree Certificates","Dichiarazione di Valore (DoV) in original","Italian/English Language Proficiency","Bank Statement / Scholarship Proof","Pre-enrollment Letter (Universitaly portal)","Acceptance Letter from Italian University","Study Visa Application Form (Type D)","Proof of Accommodation in Italy"],
  "🇨🇦 Canada Immigration":["Valid Passport","Biometric Photos (2)","Academic Transcripts + Degree Certificates","ECA (WES/ICAS)","IELTS General Training (min CLB 7)","Work Experience Letters (NOC codes)","Pay Slips & Tax Returns","Police Clearance Certificate","Medical Examination Results","Express Entry Profile Printout","ITA (Invitation to Apply)","Proof of Funds (CAD 13,310+)","PR Application Fee Receipt"],
  "🇦🇺 Australia Immigration":["Valid Passport","Biometric Photos (2)","Academic Transcripts + Degree Certificates","Skills Assessment (EA/ACS/VETASSESS etc.)","IELTS General (min 6.0 each band)","Work Experience Reference Letters","Employment Records / Pay Slips","Tax Returns","Police Clearance Certificate","Health Examination","EOI (SkillSelect) Printout","State/Territory Nomination (if 190/491)","PR Application Fee Receipt (AUD 4,115+)"],
  "🇩🇪 Germany Job Seeker":["Valid Passport","Biometric Photos (2)","Academic Degree Certificate","anabin Database Check or ZAB Statement","CV (German format — Lebenslauf)","Motivation Letter / Cover Letter","Language Certificate (German B1/B2 or English B2)","Blocked Account / Proof of Funds (€1,091/month)","Health Insurance Certificate","Embassy Appointment Confirmation","Job Seeker Visa Application Form"],
  "🇩🇪 Germany Opportunity Card":["Valid Passport (issued within last 10 years)","Biometric Photos (2)","Degree / Vocational Training Certificate","anabin Check / ZAB Statement of Comparability","Language Certificate (German A1+ or English B2)","Blocked Account / Sperrkonto (€1,091/month = €13,092/year)","Points Calculation Sheet (min 6 points)","CV / Lebenslauf","Motivation Letter","Work Experience Letters (if claiming points)","Chancenkarte Application Form","Embassy Appointment Confirmation","Application Fee Receipt (€75)"],
  "🇸🇪 Sweden Job Seeker":["Valid Passport","Biometric Photos (2)","Job Offer Letter from Swedish Employer","Employment Contract","Academic Transcripts + Degree Certificate","CV","Bank Statement","Residence Permit Application (Migrationsverket)","Health Insurance Certificate","Biometrics Appointment Confirmation"],
};
// Keep COUNTRY_DOCS as alias
const COUNTRY_DOCS = PROCESSING_DOCS;
const WA_TEMPLATES = [
  { id:"welcome", trigger:"Welcome / Lead Assigned", emoji:"👋", msg:(n,c)=>`Assalam-o-Alaikum ${n}! Welcome to *Border and Bridges Pvt. Ltd.* 🌐\n\nYour counselor *${c||"our team"}* will contact you within 24 hours.\n\n_Border and Bridges — Immigration and Legal Consultants_` },
  { id:"active",  trigger:"Moved to Active (ACL)",   emoji:"✅", msg:(n,country)=>`Dear ${n},\n\nGreat news! Your file is now *active* 🎉\n\nWe have started processing your *${country||""}* application.\n\n_Border and Bridges Pvt. Ltd._` },
  { id:"docs",    trigger:"Document Requested",      emoji:"📄", msg:(n,doc)=>`Dear ${n},\n\nWe need the following document:\n\n📎 *${doc||"[Document Name]"}*\n\nPlease WhatsApp it to us at your earliest. Thank you!` },
  { id:"filed",   trigger:"Visa Filed",              emoji:"✈️", msg:(n,country)=>`Dear ${n},\n\nYour *${country||""}* visa application has been submitted to the embassy ✅\n\nExpected decision: 4–8 weeks. We will update you immediately. 🙏` },
  { id:"won",     trigger:"Visa WON",                emoji:"🎊", msg:(n,country)=>`Dear ${n},\n\n*CONGRATULATIONS!* 🎊🎉\n\nYour *${country||""} visa has been APPROVED!*\n\nPlease contact your counselor for pre-departure guidance.\n\n_Team Border and Bridges_ 🌟` },
  { id:"payment", trigger:"Payment Due",             emoji:"💳", msg:(n,amt,date)=>`Dear ${n},\n\nA payment of *PKR ${amt||"[Amount]"}* is due on *${date||"[Date]"}*.\n\nPlease contact us to arrange the transfer. Thank you! 🙏` },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = n => "PKR " + Math.round(n||0).toLocaleString();
const tod = () => new Date().toISOString().split("T")[0];
const addDays = (d,n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().split("T")[0]; };
const listC  = { GCL:"#2d3a8c", PCL:"#f59e0b", BCL:"#7c3aed", ACL:"#059669" };
const listBg = { GCL:"#eef0fb", PCL:"#fffbeb", BCL:"#f5f3ff", ACL:"#ecfdf5" };
const priC   = { High:"#dc2626", Medium:"#d97706", Low:"#94a3b8" };
const roleC  = { [ROLES.CEO]:"#2d3a8c", [ROLES.COUNSELOR]:"#059669", [ROLES.PROCESSING]:"#1a91c7", [ROLES.ACCOUNTS]:"#d97706", [ROLES.BRANCH_MANAGER]:"#7c3aed" };
const typeC  = { Asset:"#2d3a8c", Liability:"#dc2626", Equity:"#7c3aed", Income:"#059669", Expense:"#d97706" };

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  card: { background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(45,58,140,0.07)", border:"1px solid #e8eaf6" },
  inp:  { width:"100%", padding:"9px 12px", border:"1.5px solid #c5cae9", borderRadius:8, fontSize:13, color:"#1a2057", background:"#f8f9ff", boxSizing:"border-box", fontFamily:"inherit", outline:"none" },
  sel:  { width:"100%", padding:"9px 12px", border:"1.5px solid #c5cae9", borderRadius:8, fontSize:13, color:"#1a2057", background:"#f8f9ff", boxSizing:"border-box", fontFamily:"inherit" },
  btn:  (c=B.primary) => ({ display:"inline-flex", alignItems:"center", gap:6, background:c, color:"#fff", border:"none", borderRadius:8, padding:"9px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }),
  ghost:{ display:"inline-flex", alignItems:"center", gap:6, background:"#f8f9ff", color:"#3949ab", border:"1px solid #c5cae9", borderRadius:8, padding:"8px 14px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
  lbl:  { display:"block", fontSize:11, fontWeight:700, color:"#7986cb", textTransform:"uppercase", letterSpacing:0.8, marginBottom:5 },
  th:   { textAlign:"left", padding:"6px 8px", fontSize:10, fontWeight:700, color:"#7986cb", textTransform:"uppercase", letterSpacing:0.3, borderBottom:"2px solid #e8eaf6", background:"#f8f9ff", whiteSpace:"nowrap" },
  td:   { padding:"6px 8px", borderBottom:"1px solid #f3f4f9", fontSize:11, color:"#37474f", verticalAlign:"top" },
  h2:   { margin:"0 0 3px", fontSize:20, fontWeight:800, color:B.dark },
  sub:  { margin:0, fontSize:13, color:"#5c6bc0" },
};

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const Pill = ({text,color="#2d3a8c",bg="#eef0fb"}) => <span style={{display:"inline-block",padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,color,background:bg,whiteSpace:"nowrap"}}>{text}</span>;
const Stars = ({score,onChange}) => <div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(n=><span key={n} onClick={()=>onChange&&onChange(n)} style={{fontSize:16,cursor:onChange?"pointer":"default",color:n<=(score||0)?"#f0b429":"#e0e0e0",lineHeight:1}}>★</span>)}</div>;
const Fld = ({label,children}) => <div style={{marginBottom:13}}><label style={S.lbl}>{label}</label>{children}</div>;
const R2 = ({children}) => <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{children}</div>;
const R3 = ({children}) => <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>{children}</div>;
const Chk = ({label,checked,onChange}) => <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:"#37474f",marginBottom:8}}><input type="checkbox" checked={checked||false} onChange={onChange} style={{width:15,height:15,accentColor:B.primary}}/>{label}</label>;
const Alert = ({type,msg}) => { const c={warn:{bg:"#fffde7",b:"#f0b429",t:"#7c5100"},error:{bg:"#fce4ec",b:"#e91e63",t:"#880e4f"},info:{bg:"#e8eaf6",b:"#3f51b5",t:"#1a237e"},success:{bg:"#e8f5e9",b:"#43a047",t:"#1b5e20"}}[type]||{bg:"#e8eaf6",b:"#3f51b5",t:"#1a237e"}; return <div style={{background:c.bg,border:`1px solid ${c.b}`,borderRadius:8,padding:"10px 14px",fontSize:12,color:c.t,marginBottom:12}}>{msg}</div>; };
const Stat = ({label,value,sub,color=B.primary,icon}) => <div style={{...S.card,borderLeft:`4px solid ${color}`,padding:"16px 18px"}}><div style={{fontSize:11,color:"#7986cb",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:5}}>{icon&&<span style={{marginRight:5}}>{icon}</span>}{label}</div><div style={{fontSize:22,fontWeight:800,color,lineHeight:1.1}}>{value}</div>{sub&&<div style={{fontSize:12,color:"#9fa8da",marginTop:4}}>{sub}</div>}</div>;
const Spin = () => <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60,color:"#7986cb",fontSize:13}}>Loading…</div>;
const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768;

// ── Toast Notification System ─────────────────────────────────
const ToastContext = React.createContext(null);
function ToastProvider({children}) {
  const [toasts, setToasts] = useState([]);
  const toast = (msg, type="success", duration=3000) => {
    const id = Date.now();
    setToasts(p => [...p, {id, msg, type}]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  };
  const colors = {success:"#065f46,#d1fae5",error:"#9b1c1c,#fee2e2",warn:"#7c5100,#fef3c7",info:"#1e40af,#dbeafe"};
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,display:"flex",flexDirection:"column",gap:8,maxWidth:320}}>
        {toasts.map(t => {
          const [color,bg] = (colors[t.type]||colors.success).split(",");
          return (
            <div key={t.id} style={{background:bg,border:`1px solid ${color}20`,borderLeft:`4px solid ${color}`,borderRadius:10,padding:"10px 16px",boxShadow:"0 4px 20px rgba(0,0,0,0.12)",fontSize:13,fontWeight:600,color,animation:"slideIn 0.25s ease",display:"flex",alignItems:"center",gap:8}}>
              <span>{t.type==="success"?"✅":t.type==="error"?"❌":t.type==="warn"?"⚠️":"ℹ️"}</span>
              <span style={{flex:1}}>{t.msg}</span>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </ToastContext.Provider>
  );
}
const useToast = () => React.useContext(ToastContext) || ((msg)=>console.log(msg));

const useMobile = () => {
  const [mobile, setMobile] = useState(isMobile());
  useEffect(() => {
    const h = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
};
const Modal = ({title,onClose,children,w=540}) => (
  <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(26,32,87,0.55)",zIndex:1000,display:"flex",alignItems:isMobile()?"flex-end":"center",justifyContent:"center",padding:isMobile()?0:16}}>
    <div style={{background:"#fff",borderRadius:isMobile()?"20px 20px 0 0":16,width:"100%",maxWidth:isMobile()?"100%":w,maxHeight:isMobile()?"90vh":"92vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(26,32,87,0.25)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:isMobile()?"14px 16px 12px":"18px 22px 14px",borderBottom:"1px solid #e8eaf6",position:"sticky",top:0,background:"#fff",zIndex:1}}>
        <h3 style={{margin:0,fontSize:isMobile()?14:15,fontWeight:800,color:B.dark,flex:1,paddingRight:12}}>{title}</h3>
        <button onClick={onClose} style={{background:"#eef0fb",border:"none",borderRadius:7,padding:"5px 9px",cursor:"pointer",color:"#5c6bc0",fontSize:15,flexShrink:0}}>✕</button>
      </div>
      <div style={{padding:isMobile()?"14px 16px 32px":"18px 22px 22px"}}>{children}</div>
    </div>
  </div>
);

// PDF print helper
const printReport = (id, title) => {
  const el = document.getElementById(id);
  if(!el) return;
  const w = window.open("","_blank");
  w.document.write(`<html><head><title>${title}</title><style>
    body{font-family:Arial,sans-serif;padding:24px;color:#1a2057}
    h1{color:#2d3a8c;border-bottom:2px solid #2d3a8c;padding-bottom:8px}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th{background:#eef0fb;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
    td{padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:13px}
    .total{font-weight:bold;background:#f8f9ff}
    .dr{color:#dc2626;font-weight:700} .cr{color:#059669;font-weight:700}
    @media print{button{display:none}}
  </style></head><body>${el.innerHTML}</body></html>`);
  w.document.close();
  setTimeout(()=>{ w.print(); },500);
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  const handle = async e => {
    e.preventDefault(); setLoading(true); setError("");
    const {data,error:err} = await supabase.auth.signInWithPassword({email,password});
    if(err){setError(err.message);setLoading(false);return;}
    onLogin(data.user);
  };
  return (
    <div style={{minHeight:"100vh",background:B.grad,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:20,padding:"40px 36px",width:"100%",maxWidth:400,boxShadow:"0 24px 60px rgba(26,32,87,0.35)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <svg width="56" height="56" viewBox="0 0 100 100" fill="none" style={{margin:"0 auto 14px",display:"block"}}>
            <circle cx="50" cy="50" r="46" stroke="#1a91c7" strokeWidth="5" fill="#1a2057"/>
            <path d="M32 50 Q42 33 50 38 Q58 33 68 50" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <path d="M38 46 Q44 35 50 38 Q56 35 62 46" stroke="#1a91c7" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </svg>
          <div style={{fontSize:20,fontWeight:900,color:B.dark}}>Border and Bridges</div>
          <div style={{fontSize:13,color:"#7986cb",marginTop:2}}>Pvt. Ltd. — Staff Portal</div>
        </div>
        <form onSubmit={handle}>
          <Fld label="Email Address"><input style={S.inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required autoFocus/></Fld>
          <Fld label="Password"><input style={S.inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/></Fld>
          {error&&<Alert type="error" msg={error}/>}
          <button type="submit" disabled={loading} style={{...S.btn(),width:"100%",justifyContent:"center",padding:13,fontSize:14,marginTop:4,opacity:loading?0.7:1}}>{loading?"Signing in…":"Sign In →"}</button>
        </form>
        <div style={{textAlign:"center",marginTop:16,fontSize:12,color:"#9fa8da"}}>Contact CEO for your login credentials</div>
      </div>
    </div>
  );
}

// ─── useTable HOOK ────────────────────────────────────────────────────────────
function useTable(tableName, options={}) {
  const [data,setData]=useState([]); const [loading,setLoading]=useState(true);
  const load = async () => {
    setLoading(true);
    let q=supabase.from(tableName).select("*");
    if(options.orderBy) q=q.order(options.orderBy,{ascending:options.asc??false});
    const {data:rows}=await q;
    setData(rows||[]); setLoading(false);
  };
  useEffect(()=>{
    load();
    // Real-time subscription — auto-updates when any user changes data
    const channel=supabase.channel(`realtime_${tableName}`)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:tableName},(payload)=>{
        setData(p=>{
          const exists=p.find(r=>r.id===payload.new.id);
          return exists?p:[payload.new,...p];
        });
      })
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:tableName},(payload)=>{
        setData(p=>p.map(r=>r.id===payload.new.id?{...r,...payload.new}:r));
      })
      .on("postgres_changes",{event:"DELETE",schema:"public",table:tableName},(payload)=>{
        setData(p=>p.filter(r=>r.id!==payload.old.id));
      })
      .subscribe();
    return ()=>{ supabase.removeChannel(channel); };
  },[tableName]);
  const insert = async row => { const {data:r,error}=await supabase.from(tableName).insert(row).select().single(); if(!error){setData(p=>{const exists=p.find(x=>x.id===r.id);return exists?p:[r,...p];});return r;} console.error(error);return null; };
  const update = async (id,changes) => { const {error}=await supabase.from(tableName).update(changes).eq("id",id); if(!error)setData(p=>p.map(r=>r.id===id?{...r,...changes}:r)); };
  const remove = async id => { await supabase.from(tableName).delete().eq("id",id); setData(p=>p.filter(r=>r.id!==id)); };
  return {data,setData,loading,insert,update,remove,reload:load};
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({leads,invoices,tasks,journals,accounts,currentUser,setPage,users}) {
  const rev=invoices.reduce((a,i)=>a+(i.paid||0),0);
  const pending=leads.filter(l=>l.pending_approval&&!l.approved&&l.list==="GCL");
  const openT=tasks.filter(t=>!t.done);
  const overdue=tasks.filter(t=>!t.done&&t.due_date<tod());
  const won=leads.filter(l=>l.stage==="Visa WON"||l.stage==="Visa Approved").length;
  const pipeline=["GCL","PCL","BCL","ACL"].map(list=>({list,count:leads.filter(l=>l.list===list&&!l.lost).length}));
  const aclLeads=leads.filter(l=>l.list==="ACL"&&!l.lost);
  const lostLeads=leads.filter(l=>l.lost);
  const today=tod();

  // Daily call tracking — count notes logged today per staff
  const allNotes=leads.flatMap(l=>(l.notes||[]).map(n=>({...n,clientName:l.name,list:l.list})));
  const todayNotes=allNotes.filter(n=>n.date===today||n.at?.slice(0,10)===today);
  const todayCalls=todayNotes.filter(n=>n.type==="Call"||n.type==="WhatsApp"||n.type==="Walk-in");

  // Staff call stats today
  const counselors=(users||[]).filter(u=>u.role===ROLES.COUNSELOR||u.role===ROLES.BRANCH_MANAGER||u.role===ROLES.PROCESSING);
  const staffCallStats=counselors.map(u=>({
    name:u.name.split(" ")[0],
    calls:todayCalls.filter(n=>n.by===u.name&&(n.type==="Call")).length,
    whatsapp:todayCalls.filter(n=>n.by===u.name&&n.type==="WhatsApp").length,
    walkin:todayCalls.filter(n=>n.by===u.name&&n.type==="Walk-in").length,
    total:todayCalls.filter(n=>n.by===u.name).length,
  })).filter(s=>s.total>0||true).sort((a,b)=>b.total-a.total);

  // Weekly comm trend (last 7 days)
  const last7=[...Array(7)].map((_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-i);
    const ds=d.toISOString().slice(0,10);
    return {date:ds.slice(5),calls:allNotes.filter(n=>(n.date===ds||n.at?.slice(0,10)===ds)&&(n.type==="Call"||n.type==="WhatsApp")).length};
  }).reverse();

  return (
    <div>
      <div style={{marginBottom:18}}>
        <h2 style={S.h2}>Welcome, {currentUser.name} 👋</h2>
        <p style={S.sub}>Border and Bridges Pvt. Ltd. · {today}</p>
      </div>
      {currentUser.role===ROLES.CEO&&pending.length>0&&<Alert type="warn" msg={`⚠️ ${pending.length} GCL lead(s) pending assignment`}/>}
      {overdue.length>0&&<Alert type="error" msg={`🔴 ${overdue.length} task(s) overdue — action required`}/>}
      {(()=>{
        const idleLeads=leads.filter(l=>{
          if(l.lost||l.list==="ACL")return false;
          const lc=l.last_contact||l.created_at?.slice(0,10);
          if(!lc)return false;
          return Math.floor((new Date()-new Date(lc))/(1000*60*60*24))>=7;
        });
        return idleLeads.length>0&&<Alert type="warn" msg={`🔴 ${idleLeads.length} lead(s) with no contact in 7+ days — follow up needed`}/>;
      })()}

      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:12,marginBottom:20}}>
        {[
          {label:"Total Leads",value:leads.filter(l=>!l.lost).length,sub:`${leads.filter(l=>l.list==="ACL"&&!l.lost).length} in ACL`,color:B.primary,icon:"👥",page:"leads"},
          {label:"Visa WON",value:won,sub:`${leads.filter(l=>l.stage==="Visa Rejected").length} rejected`,color:B.success,icon:"✈️",page:"reporting"},
          {label:"Collected",value:`PKR ${Math.round(rev/1000)||0}K`,color:B.secondary,icon:"💰",page:"invoices"},
          {label:"Open Tasks",value:openT.length,sub:`${overdue.length} overdue`,color:overdue.length>0?B.danger:B.warn,icon:"✅",page:"tasks"},
          {label:"Pending CEO",value:pending.length,color:"#7c3aed",icon:"⏳",page:"leads"},
          {label:"Win Rate",value:aclLeads.length>0?Math.round((won/aclLeads.length)*100)+"%":"0%",color:B.accent,icon:"📈",page:"reporting"},
          {label:"Today's Comms",value:todayNotes.length,sub:`${todayCalls.length} calls/msgs`,color:"#0891b2",icon:"📞",page:"reporting"},
          {label:"Active Cases",value:aclLeads.length,sub:"ACL clients",color:"#7c3aed",icon:"📋",page:"cases"},
        ].map(({label,value,sub,color,icon,page:pg})=>(
          <div key={label} onClick={()=>pg&&setPage(pg)} style={{...S.card,cursor:pg?"pointer":"default",transition:"box-shadow 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 20px rgba(44,55,130,0.15)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 12px rgba(44,55,130,0.07)"}>
            <div style={{fontSize:10,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:4}}>{icon} {label}</div>
            <div style={{fontSize:22,fontWeight:900,color}}>{value}</div>
            {sub&&<div style={{fontSize:10,color:"#9fa8da",marginTop:2}}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Pipeline + Today's Calls */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div style={S.card}>
          <div style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:14}}>Pipeline</div>
          {pipeline.map(p=>(
            <div key={p.list} onClick={()=>setPage("leads")} style={{marginBottom:12,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:700,color:B.dark}}>{p.list}</span>
                <span style={{fontSize:15,fontWeight:800,color:listC[p.list]}}>{p.count}</span>
              </div>
              <div style={{background:"#eef0fb",borderRadius:6,height:8}}>
                <div style={{background:listC[p.list],borderRadius:6,height:8,width:`${Math.max((p.count/Math.max(leads.length,1))*100,2)}%`}}/>
              </div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,color:B.dark}}>📞 Today's Calls ({today})</div>
            <span style={{background:"#e0f2fe",color:"#0369a1",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{todayNotes.length} total</span>
          </div>
          {staffCallStats.length===0?(
            <div style={{textAlign:"center",color:"#9fa8da",padding:16,fontSize:12}}>No communication logged today yet.</div>
          ):(
            <div style={{maxHeight:180,overflowY:"auto"}}>
              {staffCallStats.map(s=>(
                <div key={s.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f3f4f9"}}>
                  <span style={{fontSize:12,fontWeight:600,color:B.dark}}>{s.name}</span>
                  <div style={{display:"flex",gap:6}}>
                    {s.calls>0&&<span style={{background:"#d1fae5",color:"#065f46",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:700}}>📞 {s.calls}</span>}
                    {s.whatsapp>0&&<span style={{background:"#dcfce7",color:"#166534",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:700}}>💬 {s.whatsapp}</span>}
                    {s.walkin>0&&<span style={{background:"#ede9fe",color:"#6b21a8",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:700}}>🚶 {s.walkin}</span>}
                    {s.total===0&&<span style={{color:"#9fa8da",fontSize:10}}>—</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weekly comm trend + Upcoming tasks */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div style={S.card}>
          <div style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:12}}>📈 7-Day Communication Trend</div>
          {last7.map((d,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:10,color:"#9fa8da",width:36,flexShrink:0}}>{d.date}</span>
              <div style={{flex:1,background:"#eef0fb",borderRadius:4,height:14,position:"relative"}}>
                <div style={{background:B.secondary,borderRadius:4,height:14,width:`${Math.max((d.calls/Math.max(...last7.map(x=>x.calls),1))*100,d.calls>0?5:0)}%`,transition:"width 0.4s"}}/>
              </div>
              <span style={{fontSize:10,fontWeight:700,color:B.secondary,width:20,textAlign:"right"}}>{d.calls}</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:14}}>Upcoming Tasks</div>
          {openT.slice(0,5).map(t=>(
            <div key={t.id} style={{display:"flex",gap:10,marginBottom:8,paddingBottom:8,borderBottom:"1px solid #f3f4f9"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:t.due_date<today?"#dc2626":priC[t.priority]||"#94a3b8",marginTop:5,flexShrink:0}}/>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:B.dark,lineHeight:1.3}}>{t.title}</div>
                <div style={{fontSize:10,color:"#9fa8da"}}>Due: {t.due_date} · {(users||[]).find(u=>u.id===t.assigned_to)?.name?.split(" ")[0]||"—"}</div>
              </div>
            </div>
          ))}
          {openT.length===0&&<div style={{color:"#9fa8da",fontSize:13,textAlign:"center",padding:16}}>All caught up! 🎉</div>}
        </div>
      </div>

      {/* CEO only: reporting summary */}
      {currentUser.role===ROLES.CEO&&(
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,color:B.dark}}>📊 Performance Summary</div>
            <button onClick={()=>setPage("reporting")} style={{...S.ghost,fontSize:11,padding:"4px 12px"}}>Full Reports →</button>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{background:"#f0f4ff"}}>
                {["Counselor","Leads","ACL","Won","Conv%","Today Calls","Tasks","Overdue"].map(h=>(
                  <th key={h} style={{padding:"7px 10px",textAlign:"left",fontWeight:700,color:"#5c6bc0",fontSize:10,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(users||[]).filter(u=>(u.role===ROLES.COUNSELOR||u.role===ROLES.BRANCH_MANAGER)&&u.active).map((u,i)=>{
                  const mine=leads.filter(l=>l.assigned_to===u.id);
                  const acl=mine.filter(l=>l.list==="ACL").length;
                  const wonU=mine.filter(l=>l.stage==="Visa Approved"||l.stage==="Visa WON").length;
                  const conv=mine.length>0?Math.round((acl/mine.length)*100):0;
                  const myTasks=tasks.filter(t=>t.assigned_to===u.id&&!t.done);
                  const myOverdue=myTasks.filter(t=>t.due_date<today).length;
                  const myTodayCalls=todayCalls.filter(n=>n.by===u.name).length;
                  return(
                    <tr key={u.id} style={{borderBottom:"1px solid #f3f4f9",background:i%2===0?"#fff":"#fafbff"}}>
                      <td style={{padding:"7px 10px",fontWeight:700,color:B.dark}}>{u.name}</td>
                      <td style={{padding:"7px 10px"}}>{mine.length}</td>
                      <td style={{padding:"7px 10px",fontWeight:700,color:"#7c3aed"}}>{acl}</td>
                      <td style={{padding:"7px 10px",fontWeight:700,color:B.success}}>{wonU}</td>
                      <td style={{padding:"7px 10px",fontWeight:700,color:conv>=20?B.success:conv>=10?B.warn:B.danger}}>{conv}%</td>
                      <td style={{padding:"7px 10px"}}>
                        <span style={{background:myTodayCalls>0?"#d1fae5":"#f3f4f9",color:myTodayCalls>0?"#065f46":"#9fa8da",borderRadius:10,padding:"2px 8px",fontWeight:700}}>{myTodayCalls}</span>
                      </td>
                      <td style={{padding:"7px 10px"}}>{myTasks.length}</td>
                      <td style={{padding:"7px 10px",fontWeight:myOverdue>0?700:400,color:myOverdue>0?B.danger:"#9fa8da"}}>{myOverdue}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Leads({leads,leadsDB,tasks,tasksDB,users,agents,currentUser,settings}) {
  const toast=useToast();
  const [tab,setTab]=useState("GCL");
  const changeTab=(t)=>{setTab(t);setCurrentPage(1);};
  const [showAdd,setShowAdd]=useState(false);
  const [sel,setSel]=useState(null);
  const [leadTab,setLeadTab]=useState("overview");
  const [noteText,setNoteText]=useState("");
  const [noteType,setNoteType]=useState("Call");
  const [leadTaskForm,setLeadTaskForm]=useState({title:"",due_date:"",priority:"High"});
  const [showLeadTask,setShowLeadTask]=useState(false);
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(new Set());
  const [batchAssignee,setBatchAssignee]=useState("");
  const [showBatchBar,setShowBatchBar]=useState(false);
  const [currentPage,setCurrentPage]=useState(1);
  const PAGE_SIZE=50;
  const sources=settings?.lead_sources?JSON.parse(settings.lead_sources):LEAD_SOURCES_DEFAULT;
  const EF={name:"",phone:"",email:"",country:"🇬🇧 UK",source:sources[0]||"Other",branch:currentUser.branch,type:"B2C",last_qualification:"",last_qualification_year:"",ielts_score:"",intake_target:"",issue:"",status:"New",remarks:"",reminder1:"",reminder2:"",reminder3:"",enquiry_date:tod()};
  const [form,setForm]=useState(EF);

  const filtered=useMemo(()=>{
    let list=leads.filter(l=>{
      if(l.lost)return false;
      if(l.list!==tab)return false;
      if(currentUser.role===ROLES.COUNSELOR)return l.assigned_to===currentUser.id;
      if(currentUser.role===ROLES.BRANCH_MANAGER)return l.branch===currentUser.branch;
      return true;
    });
    if(search.trim()){
      const q=search.toLowerCase();
      list=list.filter(l=>(l.name||"").toLowerCase().includes(q)||(l.phone||"").includes(q)||(l.country||"").toLowerCase().includes(q)||(l.status||"").toLowerCase().includes(q));
    }
    return list;
  },[leads,tab,currentUser,search]);
  const totalPages = Math.ceil(filtered.length/PAGE_SIZE);
  const paginated = filtered.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);

  const pending=leads.filter(l=>l.pending_approval&&!l.approved&&l.list==="GCL");
  const counselors=useMemo(()=>users.filter(u=>(u.role===ROLES.COUNSELOR||u.role===ROLES.BRANCH_MANAGER)&&u.active),[users]);

  const isReminderDue=(r)=>r&&r<=tod();
  const rowHighlight=(lead)=>{
    // PCL reminders
    if(tab==="PCL"){
      const due=[lead.reminder1,lead.reminder2,lead.reminder3].some(r=>isReminderDue(r));
      if(due) return {background:"#fff3cd",borderLeft:"4px solid #f0b429"};
    }
    // Idle detection - no contact in 7+ days (all lists)
    const lastContact=lead.last_contact||lead.created_at?.slice(0,10);
    if(lastContact){
      const daysSince=Math.floor((new Date()-new Date(lastContact))/(1000*60*60*24));
      if(daysSince>=7&&lead.list==="GCL") return {background:"#fff1f2",borderLeft:"4px solid #fca5a5"};
    }
    return {};
  };
  const getIdleWarning=(lead)=>{
    const lastContact=lead.last_contact||lead.created_at?.slice(0,10);
    if(!lastContact) return null;
    const daysSince=Math.floor((new Date()-new Date(lastContact))/(1000*60*60*24));
    return daysSince>=7?daysSince:null;
  };

  // Batch selection helpers
  const toggleSelect=(id)=>{
    setSelected(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
    setShowBatchBar(true);
  };
  const selectAll=()=>{
    if(selected.size===filtered.length){setSelected(new Set());setShowBatchBar(false);}
    else{setSelected(new Set(filtered.map(l=>l.id)));setShowBatchBar(true);}
  };

  // Assign selected leads to one counselor
  const batchAssign=async()=>{
    if(!batchAssignee||selected.size===0)return;
    const ids=[...selected];
    for(let i=0;i<ids.length;i+=50){
      const chunk=ids.slice(i,i+50);
      await supabase.from("leads").update({assigned_to:batchAssignee,approved:true,pending_approval:false}).in("id",chunk);
    }
    await leadsDB.reload();
    setSelected(new Set());setShowBatchBar(false);setBatchAssignee("");
    alert(`✅ ${ids.length} leads assigned to ${counselors.find(c=>c.id===batchAssignee)?.name}`);
  };

  // Divide equally among all counselors
  const divideEqually=async()=>{
    if(counselors.length===0){alert("No counselors available.");return;}
    const ids=[...selected.size>0?selected:new Set(filtered.map(l=>l.id))];
    const perCounselor=Math.ceil(ids.length/counselors.length);
    for(let i=0;i<counselors.length;i++){
      const chunk=ids.slice(i*perCounselor,(i+1)*perCounselor);
      if(chunk.length===0)break;
      await supabase.from("leads").update({assigned_to:counselors[i].id,approved:true,pending_approval:false}).in("id",chunk);
    }
    await leadsDB.reload();
    setSelected(new Set());setShowBatchBar(false);
    alert(`✅ ${ids.length} leads divided equally among ${counselors.length} counselors (${perCounselor} each)`);
  };

  // Divide by country — assign each country's leads to a counselor round-robin
  const divideByCountry=async()=>{
    if(counselors.length===0){alert("No counselors available.");return;}
    const ids=[...selected.size>0?selected:new Set(filtered.map(l=>l.id))];
    const leadsToAssign=filtered.filter(l=>ids.includes(l.id));
    // Group by country
    const byCountry={};
    leadsToAssign.forEach(l=>{if(!byCountry[l.country])byCountry[l.country]=[];byCountry[l.country].push(l.id);});
    const countries=Object.keys(byCountry);
    for(let i=0;i<countries.length;i++){
      const counselor=counselors[i%counselors.length];
      const chunk=byCountry[countries[i]];
      await supabase.from("leads").update({assigned_to:counselor.id,approved:true,pending_approval:false}).in("id",chunk);
    }
    await leadsDB.reload();
    setSelected(new Set());setShowBatchBar(false);
    alert(`✅ Leads divided by country across ${counselors.length} counselors`);
  };

  const addLead=async()=>{
    if(!form.name||!form.phone)return;
    // Duplicate check
    const dup=leads.find(l=>l.name.toLowerCase().trim()===form.name.toLowerCase().trim()&&!l.lost);
    if(dup&&!window.confirm(`⚠️ "${form.name}" already exists in ${dup.list}. Add anyway?`))return;
    const nl={...form,list:"GCL",stage:"New Enquiry",score:3,consultation_done:false,agreement_signed:false,payment_received:false,invoice_generated:false,all_doc_received:false,pending_approval:currentUser.role!==ROLES.CEO,approved:currentUser.role===ROLES.CEO,lost:false,last_contact:tod(),notes:[],docs:{},ielts_score:form.ielts_score||null,intake_target:form.intake_target||null,agent_id:form.agent_id||null,enquiry_date:form.enquiry_date||tod()};
    const saved=await leadsDB.insert(nl);
    if(saved)await tasksDB.insert({title:`Follow up: ${form.name} (2-day auto)`,client_name:form.name,lead_id:saved.id,assigned_to:currentUser.id,due_date:addDays(tod(),2),priority:"High",type:"Follow-up",auto_generated:true});
    setForm(EF);setShowAdd(false);
  };
  const assign=async(lead,uid)=>await leadsDB.update(lead.id,{assigned_to:uid,approved:true,pending_approval:false});
  const moveList=async(lead,nl)=>{
    if((nl==="PCL"||nl==="BCL")&&!lead.consultation_done){toast("⛔ Complete consultation first.","error");return;}
    // Auto-create follow-up task on list move
    setTimeout(async()=>{
      try{await tasksDB.insert({title:`${lead.name} → ${nl}: Initial follow-up required`,client_name:lead.name,lead_id:lead.id,assigned_to:lead.assigned_to||currentUser.id,due_date:addDays(tod(),1),priority:"High",type:"Follow-up",auto_generated:true});}catch(e){}
    },500);
    if(nl==="ACL"){const miss=[];if(!lead.consultation_done)miss.push("Consultation Done");if(!lead.agreement_signed)miss.push("Agreement Signed");if(!lead.payment_received)miss.push("Payment Received");if(!lead.invoice_generated)miss.push("Invoice Generated");if(miss.length){toast("⛔ Cannot move to ACL.\nMissing:\n• "+miss.join("\n• "));return;}}
    await leadsDB.update(lead.id,{list:nl});setSel(null);
  };
  const addNote=async(lead)=>{
    if(!noteText.trim())return;
    const note={id:Date.now(),text:noteText,by:currentUser.name,at:new Date().toLocaleString(),type:noteType};
    const updated=[...(lead.notes||[]),note];
    await leadsDB.update(lead.id,{notes:updated,last_contact:tod()});
    setSel(p=>({...p,notes:updated}));
    if(lead.list!=="ACL")await tasksDB.insert({title:`Follow up: ${lead.name} (2-day auto)`,client_name:lead.name,lead_id:lead.id,assigned_to:lead.assigned_to||currentUser.id,due_date:addDays(tod(),2),priority:"High",type:"Follow-up",auto_generated:true});
    setNoteText("");
  };
  const toggle=async(lead,field)=>{const val=!lead[field];await leadsDB.update(lead.id,{[field]:val});setSel(p=>p?{...p,[field]:val}:p);};
  const setScore=async(lead,score)=>{await leadsDB.update(lead.id,{score});setSel(p=>p?{...p,score}:p);};

  // GCL/PCL columns
  const GCL_COLS=["","#","Date","Name","Contact","Last Qual.","Year","Country","Issue","Status","Remarks",""];
  const PCL_COLS=["","#","Date","Name","Contact","Last Qual.","Year","Country","Issue","Status","Remarks","R1","R2","R3",""];

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={S.h2}>Leads Management</h2><p style={S.sub}>{leads.filter(l=>!l.lost).length} total · {pending.length} pending approval</p></div>
        <button style={S.btn()} onClick={()=>setShowAdd(true)}>+ Add Lead</button>
      </div>

      {currentUser.role===ROLES.CEO&&pending.length>0&&(
        <div style={{...S.card,marginBottom:18,borderLeft:`4px solid ${B.accent}`}}>
          <div style={{fontSize:13,fontWeight:700,color:"#7c5100",marginBottom:10}}>⏳ {pending.length} Lead(s) Awaiting Assignment</div>
          {pending.map(lead=>(
            <div key={lead.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #fef3c7"}}>
              <div><span style={{fontWeight:700,fontSize:13,color:B.dark}}>{lead.name}</span><span style={{fontSize:12,color:"#9fa8da",marginLeft:8}}>{lead.source} · {lead.country}</span></div>
              <div style={{display:"flex",gap:6}}>{counselors.map(c=><button key={c.id} onClick={()=>assign(lead,c.id)} style={S.btn("#059669")}>→ {c.name.split(" ")[0]}</button>)}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["GCL","PCL","BCL","ACL"].map(l=>(
            <button key={l} onClick={()=>{setTab(l);setSelected(new Set());setShowBatchBar(false);}} style={{padding:"7px 16px",borderRadius:8,border:"2px solid",borderColor:tab===l?listC[l]:"#c5cae9",background:tab===l?listBg[l]:"#fff",color:tab===l?listC[l]:"#5c6bc0",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              {l} ({leads.filter(ld=>ld.list===l&&!ld.lost).length})
            </button>
          ))}
        </div>
        <button onClick={()=>{
          const cols=["Name","Phone","Email","Country","Source","Stage","Status","Branch","Counselor","Created"];
          const rows=filtered.map(l=>[l.name,l.phone||"",l.email||"",l.country||"",l.source||"",l.stage||"",l.status||"",l.branch||"",(users||[]).find(u=>u.id===l.assigned_to)?.name||"",l.created_at?.slice(0,10)||""]);
          const csv=[cols,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
          const blob=new Blob([csv],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`leads-${tab}-${tod()}.csv`;a.click();
        }} style={{...S.ghost,fontSize:11,padding:"6px 12px",whiteSpace:"nowrap",flexShrink:0}}>📥 Export CSV</button>
        <input style={{...S.inp,width:220,margin:0}} placeholder="🔍 Search name, phone, country…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {/* BATCH ASSIGNMENT BAR — CEO only */}
      {currentUser.role===ROLES.CEO&&(
        <div style={{...S.card,marginBottom:10,padding:"10px 14px",background:selected.size>0?"#eef0fb":"#f8f9ff",border:`1px solid ${selected.size>0?B.primary:"#e8eaf6"}`}}>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <button onClick={selectAll} style={{...S.ghost,fontSize:12,padding:"6px 12px"}}>
              {selected.size===filtered.length&&filtered.length>0?"☑ Deselect All":"☐ Select All"}
            </button>
            {selected.size>0&&<span style={{fontSize:13,fontWeight:700,color:B.primary}}>{selected.size} selected</span>}
            <select style={{...S.sel,width:180}} value={batchAssignee} onChange={e=>setBatchAssignee(e.target.value)}>
              <option value="">— Assign to counselor —</option>
              {counselors.map(c=><option key={c.id} value={c.id}>{c.name} ({c.branch})</option>)}
            </select>
            <button onClick={batchAssign} disabled={!batchAssignee||selected.size===0} style={{...S.btn(B.success),fontSize:12,padding:"6px 14px",opacity:(!batchAssignee||selected.size===0)?0.4:1}}>✓ Assign Selected</button>
            <div style={{height:20,width:1,background:"#c5cae9"}}/>
            <button onClick={divideEqually} style={{...S.btn(B.secondary),fontSize:12,padding:"6px 14px"}}>⚖️ Divide Equally</button>
            <button onClick={divideByCountry} style={{...S.btn("#7c3aed"),fontSize:12,padding:"6px 14px"}}>🌍 Divide by Country</button>
            {selected.size>0&&<button onClick={()=>{setSelected(new Set());setShowBatchBar(false);}} style={{...S.ghost,fontSize:12,padding:"6px 12px",color:"#dc2626",borderColor:"#dc2626"}}>✕ Clear</button>}
          </div>
        </div>
      )}

      <div style={{...S.card,padding:0,overflow:"hidden"}}>
        <div style={{overflowX:"auto",overflowY:"auto",maxHeight:"calc(100vh - 260px)"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:tab==="PCL"?1300:1100}}>
          <thead><tr>{(tab==="PCL"?PCL_COLS:GCL_COLS).map((h,i)=>(
            <th key={i} style={{...S.th,width:h===""&&i===0?"36px":undefined}}>
              {h===""&&i===0?(
                <input type="checkbox" checked={selected.size===filtered.length&&filtered.length>0} onChange={selectAll} style={{width:15,height:15,accentColor:B.primary,cursor:"pointer"}}/>
              ):h}
            </th>
          ))}</tr></thead>
          <tbody>
            {paginated.map((lead,idx)=>{
              const counselor=users.find(u=>u.id===lead.assigned_to);
              return (
                <tr key={lead.id} style={rowHighlight(lead)}>
                  <td style={{...S.td,width:36}} onClick={e=>e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(lead.id)} onChange={()=>toggleSelect(lead.id)} style={{width:15,height:15,accentColor:B.primary,cursor:"pointer"}}/>
                  </td>
                  <td style={{...S.td,fontSize:11,color:"#9fa8da",fontWeight:700,maxWidth:30,textAlign:"center"}}>{idx+1}</td>
                  <td style={{...S.td,maxWidth:85,fontSize:11,wordBreak:"break-word"}}>{lead.enquiry_date||lead.created_at?.split("T")[0]||"—"}</td>
                  <td style={{...S.td,minWidth:120,maxWidth:160}}><div style={{fontWeight:700,color:B.dark,fontSize:12,wordBreak:"break-word"}}>{lead.name}</div><div style={{fontSize:10,color:"#9fa8da"}}>{counselor?.name||"Unassigned"}</div></td>
                  <td style={{...S.td,minWidth:90,maxWidth:120,fontSize:11,wordBreak:"break-all"}}>{lead.phone}</td>
                  <td style={{...S.td,maxWidth:90,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lead.last_qualification||"—"}</td>
                  <td style={{...S.td,maxWidth:70,fontSize:11,wordBreak:"break-word"}}>{lead.last_qualification_year||"—"}</td>
                  <td style={{...S.td,minWidth:70,maxWidth:100,fontSize:11,wordBreak:"break-word"}}>{lead.country}</td>
                  <td style={{...S.td,minWidth:70,maxWidth:110,fontSize:11,wordBreak:"break-word"}}>{lead.issue||"—"}</td>
                  <td style={{...S.td,maxWidth:90}}><Pill text={lead.status||"New"} color={lead.status==="Active"?"#065f46":lead.status==="Won"?"#1e40af":"#37474f"} bg={lead.status==="Active"?"#d1fae5":lead.status==="Won"?"#dbeafe":"#f3f4f9"}/></td>
                  <td style={{...S.td,textAlign:"center",minWidth:60}}>
                    {(()=>{
                      const n=lead.notes||[];
                      const t=tod();
                      const tc=n.filter(x=>(x.date===t||x.at?.slice(0,10)===t)&&(x.type==="Call"||x.type==="WhatsApp"||x.type==="Walk-in"||x.type==="Email")).length;
                      const total=n.filter(x=>x.type==="Call"||x.type==="WhatsApp"||x.type==="Walk-in"||x.type==="Email").length;
                      return(<div>
                        {tc>0&&<div style={{background:"#d1fae5",color:"#065f46",borderRadius:8,padding:"1px 6px",fontSize:9,fontWeight:800,marginBottom:1}}>{tc}✓</div>}
                        <div style={{fontSize:9,color:"#9fa8da"}}>{total}</div>
                      </div>);
                    })()}
                  </td>
                  <td style={{...S.td,fontSize:11,minWidth:70,maxWidth:120,wordBreak:"break-word"}}>{lead.remarks||"—"}</td>
                  {tab==="PCL"&&<>
                    <td style={{...S.td,fontSize:11,color:isReminderDue(lead.reminder1)?"#dc2626":"#37474f",fontWeight:isReminderDue(lead.reminder1)?700:400}}>{lead.reminder1||"—"}</td>
                    <td style={{...S.td,fontSize:11,color:isReminderDue(lead.reminder2)?"#dc2626":"#37474f",fontWeight:isReminderDue(lead.reminder2)?700:400}}>{lead.reminder2||"—"}</td>
                    <td style={{...S.td,fontSize:11,color:isReminderDue(lead.reminder3)?"#dc2626":"#37474f",fontWeight:isReminderDue(lead.reminder3)?700:400}}>{lead.reminder3||"—"}</td>
                  </>}
                  <td style={{...S.td,whiteSpace:"nowrap"}}>
                    <div style={{display:"flex",gap:3,marginBottom:3}}>
                      {["📞","💬","🚶"].map((icon,i)=>{
                        const types=["Call","WhatsApp","Walk-in"];
                        return <button key={i} title={`Quick log: ${types[i]}`} onClick={async(e)=>{
                          e.stopPropagation();
                          const note={id:Date.now(),text:`${types[i]} with client`,by:currentUser.name,at:new Date().toLocaleString(),type:types[i],date:tod()};
                          const updated=[...(lead.notes||[]),note];
                          await leadsDB.update(lead.id,{notes:updated,last_contact:tod()});
                        }} style={{background:"#f0f4ff",border:"1px solid #e8eaf6",borderRadius:6,padding:"2px 5px",fontSize:12,cursor:"pointer"}}>{icon}</button>;
                      })}
                    </div>
                    <button onClick={()=>{setSel({...lead});setLeadTab("overview");}} style={{...S.ghost,fontSize:10,padding:"4px 8px"}}>Open</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{padding:32,textAlign:"center",color:"#9fa8da"}}>No leads in {tab}{search?` matching "${search}"`:""}.</div>}
          {totalPages>1&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderTop:"1px solid #e8eaf6",background:"#fafbff"}}>
              <span style={{fontSize:12,color:"#9fa8da"}}>Showing {((currentPage-1)*PAGE_SIZE)+1}–{Math.min(currentPage*PAGE_SIZE,filtered.length)} of {filtered.length} leads</span>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} style={{...S.ghost,padding:"4px 10px",fontSize:12,opacity:currentPage===1?0.4:1}}>← Prev</button>
                {[...Array(Math.min(totalPages,5))].map((_,i)=>{
                  const pg=currentPage<=3?i+1:currentPage+i-2;
                  if(pg<1||pg>totalPages)return null;
                  return <button key={pg} onClick={()=>setCurrentPage(pg)} style={{...S.ghost,padding:"4px 10px",fontSize:12,background:currentPage===pg?B.primary:"#fff",color:currentPage===pg?"#fff":"#5c6bc0"}}>{pg}</button>;
                })}
                <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} style={{...S.ghost,padding:"4px 10px",fontSize:12,opacity:currentPage===totalPages?0.4:1}}>Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {sel&&(
        <Modal title={`${sel.name} · ${sel.list||"GCL"}`} onClose={()=>{setSel(null);setLeadTab("overview");}} w={740}>
          {/* Status bar */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12,padding:"8px 12px",background:"#f0f4ff",borderRadius:10}}>
            <span style={{fontSize:11,background:sel.list==="ACL"?"#d1fae5":sel.list==="BCL"?"#fef3c7":sel.list==="PCL"?"#dbeafe":"#e0e7ff",color:sel.list==="ACL"?"#065f46":sel.list==="BCL"?"#854d0e":sel.list==="PCL"?"#1e40af":"#3730a3",borderRadius:6,padding:"3px 10px",fontWeight:700}}>📋 {sel.list||"GCL"}</span>
            {sel.source&&<span style={{fontSize:11,background:"#f3e8ff",color:"#6b21a8",borderRadius:6,padding:"3px 10px",fontWeight:600}}>🔗 {sel.source}</span>}
            {sel.stage&&<span style={{fontSize:11,background:"#fef9c3",color:"#854d0e",borderRadius:6,padding:"3px 10px",fontWeight:600}}>📍 {sel.stage}</span>}
            {sel.phone&&<span style={{fontSize:11,background:"#dcfce7",color:"#166534",borderRadius:6,padding:"3px 10px",fontWeight:600}}>📞 {sel.phone}</span>}
            {sel.country&&<span style={{fontSize:11,background:"#dbeafe",color:"#1e40af",borderRadius:6,padding:"3px 10px",fontWeight:600}}>🌍 {sel.country}</span>}
            <span style={{fontSize:11,background:"#f1f5f9",color:"#475569",borderRadius:6,padding:"3px 10px",fontWeight:600}}>⭐ Score: {sel.score||1}/5</span>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:3,marginBottom:14,borderBottom:"2px solid #eef0fb",flexWrap:"wrap"}}>
            {[["overview","📊 Overview"],["edit","✏️ Edit"],["history","🔄 History"],["notes","💬 Log"],["tasks","✅ Tasks"]].map(([k,label])=>(
              <button key={k} onClick={()=>setLeadTab(k)} style={{padding:"8px 13px",borderRadius:"8px 8px 0 0",border:"none",background:leadTab===k?B.primary:"transparent",color:leadTab===k?"#fff":"#5c6bc0",fontSize:12,fontWeight:leadTab===k?700:500,cursor:"pointer"}}>
                {label}
              </button>
            ))}
          </div>

          {/* TAB: Overview */}
          {leadTab==="overview"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {/* Left: Client info */}
              <div style={{...S.card,padding:14}}>
                <div style={{fontSize:11,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:10}}>Client Information</div>
                {[["Full Name",sel.name],["Phone",sel.phone||"—"],["Email",sel.email||"—"],["Country",sel.country||"—"],["Branch",sel.branch||"—"],["Source",sel.source||"—"],["IELTS/PTE",sel.ielts_score||"—"],["Last Qualification",sel.last_qualification||"—"],["Qual. Year",sel.last_qualification_year||"—"],["Target Intake",sel.intake_target||"—"],["Enquiry Date",sel.enquiry_date||sel.created_at?.slice(0,10)||"—"]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #f3f4f9"}}>
                    <span style={{fontSize:11,color:"#9fa8da"}}>{k}</span>
                    <span style={{fontSize:11,fontWeight:600,color:B.dark,maxWidth:160,textAlign:"right"}}>{v}</span>
                  </div>
                ))}
              </div>
              {/* Right: Pipeline status + tasks + last note */}
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{...S.card,padding:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:10}}>Pipeline Status</div>
                  {[["List",sel.list||"GCL"],["Stage",sel.stage||"New Enquiry"],["Status",sel.status||"New"],["Score",`${sel.score||1} / 5 stars`],["Assigned To",(users||[]).find(u=>u.id===sel.assigned_to)?.name||"Unassigned"],["Last Contact",sel.last_contact||"—"]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #f3f4f9"}}>
                      <span style={{fontSize:11,color:"#9fa8da"}}>{k}</span>
                      <span style={{fontSize:11,fontWeight:600,color:k==="Stage"?B.primary:B.dark}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{...S.card,padding:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:8}}>Checklist</div>
                  {[["consultation_done","Consultation Done"],["agreement_signed","Agreement Signed"],["payment_received","Payment Received"],["invoice_generated","Invoice Generated"],["all_doc_received","All Docs Received"]].map(([f,l])=>(
                    <div key={f} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0"}}>
                      <div style={{width:14,height:14,borderRadius:3,background:sel[f]?B.success:"#e8eaf6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",flexShrink:0}}>{sel[f]?"✓":""}</div>
                      <span style={{fontSize:11,color:sel[f]?"#065f46":"#9fa8da",fontWeight:sel[f]?600:400}}>{l}</span>
                    </div>
                  ))}
                </div>
                {/* Last comm */}
                {(sel.notes||[]).length>0&&(
                  <div style={{...S.card,padding:14}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:8}}>Latest Note</div>
                    {[...(sel.notes||[])].slice(-1).map(note=>(
                      <div key={note.id}>
                        <div style={{display:"flex",gap:6,marginBottom:4}}><Pill text={note.type||"Note"} color="#5c6bc0" bg="#eef0fb"/><span style={{fontSize:10,color:"#9fa8da"}}>{note.by} · {note.date||note.at?.slice(0,10)}</span></div>
                        <div style={{fontSize:12,color:"#37474f",lineHeight:1.5}}>{note.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {sel.issue&&<div style={{...S.card,padding:12,gridColumn:"1/-1"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#f59e0b",marginBottom:4}}>⚠️ Issue / Concern</div>
                <div style={{fontSize:12,color:"#37474f"}}>{sel.issue}</div>
              </div>}
              {sel.remarks&&<div style={{...S.card,padding:12,gridColumn:"1/-1"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:4}}>Remarks</div>
                <div style={{fontSize:12,color:"#37474f"}}>{sel.remarks}</div>
              </div>}
            </div>
          )}

          {/* TAB: Edit */}
          {leadTab==="edit"&&(
            <div>
              <R2>
                <Fld label="Status">
                  <select style={S.sel} value={sel.status||"New"} onChange={e=>{leadsDB.update(sel.id,{status:e.target.value});setSel(p=>({...p,status:e.target.value}));}}>
                    {["New","Contacted","Interested","Meeting Booked","Proposal Sent","Negotiating","Closed"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </Fld>
                <Fld label="Score"><Stars score={sel.score||1} onChange={s=>{setScore(sel,s);setSel(p=>({...p,score:s}));}}/></Fld>
              </R2>
              <R2>
                <Fld label="Issue / Concern"><input style={S.inp} value={sel.issue||""} onChange={e=>setSel(p=>({...p,issue:e.target.value}))} onBlur={e=>leadsDB.update(sel.id,{issue:e.target.value})} placeholder="Any issue or concern…"/></Fld>
                <Fld label="Remarks"><input style={S.inp} value={sel.remarks||""} onChange={e=>setSel(p=>({...p,remarks:e.target.value}))} onBlur={e=>leadsDB.update(sel.id,{remarks:e.target.value})} placeholder="Internal remarks…"/></Fld>
              </R2>
              <R2>
                <Fld label="IELTS/PTE Score"><input style={S.inp} value={sel.ielts_score||""} onChange={e=>setSel(p=>({...p,ielts_score:e.target.value}))} onBlur={e=>leadsDB.update(sel.id,{ielts_score:e.target.value})} placeholder="e.g. 6.5"/></Fld>
                <Fld label="Target Intake"><input style={S.inp} value={sel.intake_target||""} onChange={e=>setSel(p=>({...p,intake_target:e.target.value}))} onBlur={e=>leadsDB.update(sel.id,{intake_target:e.target.value})} placeholder="Sep 2026"/></Fld>
              </R2>
              {tab==="PCL"&&<>
                <div style={{fontSize:11,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",margin:"8px 0 6px"}}>PCL Follow-up Reminders</div>
                <R2>
                  <Fld label="Reminder 1"><input type="date" style={S.inp} value={sel.reminder1||""} onChange={e=>{leadsDB.update(sel.id,{reminder1:e.target.value});setSel(p=>({...p,reminder1:e.target.value}));}}/></Fld>
                  <Fld label="Reminder 2"><input type="date" style={S.inp} value={sel.reminder2||""} onChange={e=>{leadsDB.update(sel.id,{reminder2:e.target.value});setSel(p=>({...p,reminder2:e.target.value}));}}/></Fld>
                </R2>
                <Fld label="Reminder 3"><input type="date" style={S.inp} value={sel.reminder3||""} onChange={e=>{leadsDB.update(sel.id,{reminder3:e.target.value});setSel(p=>({...p,reminder3:e.target.value}));}}/></Fld>
              </>}
              <div style={{borderTop:"1px solid #e8eaf6",paddingTop:12,marginTop:4}}>
                <div style={{fontSize:11,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:8}}>Checklist</div>
                {[{f:"consultation_done",l:"Consultation Done"},{f:"agreement_signed",l:"Agreement Signed"},{f:"payment_received",l:"Payment Received"},{f:"invoice_generated",l:"Invoice Generated"},{f:"all_doc_received",l:"All Documents Received"}].map(item=>(
                  <Chk key={item.f} label={item.l} checked={sel[item.f]||false} onChange={()=>toggle(sel,item.f)}/>
                ))}
              </div>
              {currentUser.role===ROLES.CEO&&(
                <div style={{borderTop:"1px solid #e8eaf6",paddingTop:12,marginTop:8}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:8}}>CEO Actions</div>
                  <R2>
                    <Fld label="Move to List">
                      <div style={{display:"flex",gap:6}}>
                        {["GCL","PCL","BCL","ACL"].filter(l=>l!==sel.list).map(l=>(
                          <button key={l} onClick={()=>moveList(sel,l)} style={{...S.btn(listC[l]),fontSize:11,padding:"5px 10px"}}>→ {l}</button>
                        ))}
                      </div>
                    </Fld>
                    <Fld label="Assign To">
                      <select style={S.sel} value={sel.assigned_to||""} onChange={e=>{assign(sel,e.target.value);setSel(p=>({...p,assigned_to:e.target.value}));}}>
                        <option value="">-- Select --</option>
                        {counselors.map(c=><option key={c.id} value={c.id}>{c.name} ({c.branch})</option>)}
                      </select>
                    </Fld>
                  </R2>
                </div>
              )}
            </div>
          )}

          {/* TAB: History / Timeline */}
          {leadTab==="history"&&(
            <div>
              <div style={{fontSize:12,color:"#5c6bc0",marginBottom:12}}>Full activity timeline for {sel.name}</div>
              <div style={{maxHeight:360,overflowY:"auto"}}>
                {[...(sel.notes||[])].reverse().map((note,i)=>{
                  const tc={Call:{c:"#059669",bg:"#d1fae5",icon:"📞"},WhatsApp:{c:"#25d366",bg:"#dcfce7",icon:"💬"},Email:{c:"#1a91c7",bg:"#dbeafe",icon:"📧"},"Walk-in":{c:"#7c3aed",bg:"#ede9fe",icon:"🚶"},Processing:{c:"#0ea5e9",bg:"#e0f2fe",icon:"⚙️"},Other:{c:"#64748b",bg:"#f1f5f9",icon:"📝"}}[note.type]||{c:"#64748b",bg:"#f1f5f9",icon:"📝"};
                  return(
                    <div key={note.id} style={{display:"flex",gap:12,marginBottom:12}}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                        <div style={{width:32,height:32,borderRadius:8,background:tc.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{tc.icon}</div>
                        {i<(sel.notes||[]).length-1&&<div style={{width:2,flex:1,background:"#e8eaf6",margin:"4px 0"}}/>}
                      </div>
                      <div style={{flex:1,paddingBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <div style={{display:"flex",gap:6}}><Pill text={note.type} color={tc.c} bg={tc.bg}/><span style={{fontSize:11,fontWeight:700,color:B.primary}}>{note.by}</span></div>
                          <span style={{fontSize:10,color:"#9fa8da"}}>{note.date||note.at?.slice(0,10)}</span>
                        </div>
                        <div style={{fontSize:12,color:"#37474f",lineHeight:1.5,background:"#f8f9ff",padding:"8px 10px",borderRadius:8}}>{note.text}</div>
                      </div>
                    </div>
                  );
                })}
                {!(sel.notes||[]).length&&<div style={{textAlign:"center",color:"#9fa8da",padding:32,fontSize:13}}>No activity yet for this lead.</div>}
              </div>
            </div>
          )}

          {/* TAB: Communication Log */}
          {leadTab==="notes"&&(
            <div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                {["📞 No answer","📞 Will call back","✅ Interested — sending details","📄 Documents requested","📅 Meeting scheduled","💰 Payment received","❌ Not interested"].map(t=>(
                  <button key={t} onClick={()=>setNoteText(t)} style={{background:"#f0f4ff",border:"1px solid #c5cae9",borderRadius:6,padding:"2px 8px",fontSize:10,cursor:"pointer",color:"#5c6bc0"}}>{t}</button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"130px 1fr auto",gap:8,marginBottom:12}}>
                <select style={S.sel} value={noteType} onChange={e=>setNoteType(e.target.value)}>
                  {CONTACT_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
                <input style={S.inp} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="What happened? What did the client say?" onKeyDown={e=>e.key==="Enter"&&addNote(sel)}/>
                <button onClick={()=>addNote(sel)} style={{...S.btn(),flexShrink:0,whiteSpace:"nowrap"}}>+ Log</button>
              </div>
              <div style={{maxHeight:320,overflowY:"auto"}}>
                {[...(sel.notes||[])].reverse().map(note=>{
                  const tc={Call:{c:"#059669",bg:"#d1fae5",icon:"📞"},WhatsApp:{c:"#25d366",bg:"#dcfce7",icon:"💬"},Email:{c:"#1a91c7",bg:"#dbeafe",icon:"📧"},"Walk-in":{c:"#7c3aed",bg:"#ede9fe",icon:"🚶"},Processing:{c:"#0ea5e9",bg:"#e0f2fe",icon:"⚙️"},Other:{c:"#64748b",bg:"#f1f5f9",icon:"📝"}}[note.type]||{c:"#64748b",bg:"#f1f5f9",icon:"📝"};
                  return(
                    <div key={note.id} style={{display:"flex",gap:8,marginBottom:8,padding:"8px 10px",background:"#f8f9ff",borderRadius:8,border:"1px solid #e8eaf6"}}>
                      <div style={{width:28,height:28,borderRadius:6,background:tc.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{tc.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <div style={{display:"flex",gap:6}}><Pill text={note.type} color={tc.c} bg={tc.bg}/><span style={{fontSize:11,fontWeight:700,color:B.primary}}>{note.by}</span></div>
                          <span style={{fontSize:10,color:"#9fa8da"}}>{note.date||note.at?.slice(0,10)}</span>
                        </div>
                        <div style={{fontSize:12,color:"#37474f",lineHeight:1.5}}>{note.text}</div>
                      </div>
                    </div>
                  );
                })}
                {!(sel.notes||[]).length&&<div style={{textAlign:"center",color:"#9fa8da",padding:24,fontSize:12}}>No communication logged yet. Add the first entry above.</div>}
              </div>
            </div>
          )}

          {/* TAB: Tasks */}
          {leadTab==="tasks"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:B.dark}}>Tasks for {sel.name}</div>
                <button onClick={()=>setShowLeadTask(p=>!p)} style={{...S.btn("#7c3aed"),fontSize:11,padding:"5px 12px"}}>+ Add Task</button>
              </div>
              {showLeadTask&&(
                <div style={{background:"#f8f9ff",borderRadius:10,padding:12,marginBottom:12,border:"1px solid #c5cae9"}}>
                  <R2>
                    <Fld label="Task"><input style={S.inp} value={leadTaskForm.title} onChange={e=>setLeadTaskForm({...leadTaskForm,title:e.target.value})} placeholder="e.g. Send offer letter"/></Fld>
                    <Fld label="Due Date"><input type="date" style={S.inp} value={leadTaskForm.due_date} onChange={e=>setLeadTaskForm({...leadTaskForm,due_date:e.target.value})}/></Fld>
                  </R2>
                  <R2>
                    <Fld label="Priority">
                      <select style={S.sel} value={leadTaskForm.priority} onChange={e=>setLeadTaskForm({...leadTaskForm,priority:e.target.value})}>
                        {["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}
                      </select>
                    </Fld>
                    <Fld label="Type">
                      <select style={S.sel} value={leadTaskForm.type||"Follow-up"} onChange={e=>setLeadTaskForm({...leadTaskForm,type:e.target.value})}>
                        {["Follow-up","Call","Email","Meeting","Document","Other"].map(t=><option key={t}>{t}</option>)}
                      </select>
                    </Fld>
                  </R2>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={async()=>{
                      if(!leadTaskForm.title.trim())return;
                      await tasksDB.insert({title:leadTaskForm.title,client_name:sel.name,lead_id:sel.id,assigned_to:sel.assigned_to||currentUser.id,due_date:leadTaskForm.due_date||tod(),priority:leadTaskForm.priority||"High",type:leadTaskForm.type||"Follow-up",auto_generated:false});
                      setLeadTaskForm({title:"",due_date:"",priority:"High",type:"Follow-up"});
                      setShowLeadTask(false);
                    }} style={{...S.btn("#7c3aed"),padding:"7px 16px",fontSize:11}}>Save Task</button>
                    <button onClick={()=>setShowLeadTask(false)} style={{...S.ghost,padding:"7px 12px",fontSize:11}}>Cancel</button>
                  </div>
                </div>
              )}
              <div style={{maxHeight:300,overflowY:"auto"}}>
                {tasks.filter(t=>t.client_name===sel.name).sort((a,b)=>a.done-b.done).map(task=>(
                  <div key={task.id} style={{display:"flex",gap:10,padding:"8px 10px",background:task.done?"#f0fdf4":"#fff",borderRadius:8,marginBottom:6,border:`1px solid ${task.done?"#bbf7d0":"#e8eaf6"}`}}>
                    <div style={{width:16,height:16,borderRadius:4,background:task.done?B.success:task.due_date<tod()?"#dc2626":"#e8eaf6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",flexShrink:0,marginTop:2}}>{task.done?"✓":task.due_date<tod()?"!":""}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:task.done?"#9fa8da":B.dark,textDecoration:task.done?"line-through":"none"}}>{task.title}</div>
                      <div style={{fontSize:10,color:"#9fa8da",marginTop:2}}>Due: {task.due_date} · {task.priority} · {task.type}</div>
                    </div>
                    {!task.done&&<button onClick={()=>tasksDB.update(task.id,{done:true,completed_at:new Date().toISOString()})} style={{...S.ghost,fontSize:10,padding:"3px 8px",color:B.success,borderColor:B.success,flexShrink:0}}>Done ✓</button>}
                  </div>
                ))}
                {!tasks.filter(t=>t.client_name===sel.name).length&&<div style={{textAlign:"center",color:"#9fa8da",fontSize:12,padding:24}}>No tasks for this lead yet.</div>}
              </div>
            </div>
          )}
        </Modal>
      )}

      {showAdd&&(
        <Modal title="Add New Lead" onClose={()=>setShowAdd(false)} w={620}>
          <R2><Fld label="Full Name"><input style={S.inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Client full name"/></Fld><Fld label="Phone"><input style={S.inp} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+92 300 …"/></Fld></R2>
          <R2><Fld label="Email"><input style={S.inp} value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Fld><Fld label="Country"><select style={S.sel} value={form.country} onChange={e=>setForm({...form,country:e.target.value})}>{ALL_COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></Fld></R2>
          <R2><Fld label="Source"><select style={S.sel} value={form.source} onChange={e=>setForm({...form,source:e.target.value})}>{sources.map(s=><option key={s}>{s}</option>)}</select></Fld><Fld label="Branch"><select style={S.sel} value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}>{BRANCHES_DEFAULT.map(b=><option key={b}>{b}</option>)}</select></Fld></R2>
          <R2><Fld label="Last Qualification"><select style={S.sel} value={form.last_qualification} onChange={e=>setForm({...form,last_qualification:e.target.value})}><option value="">-- Select --</option>{QUALIFICATIONS.map(q=><option key={q}>{q}</option>)}</select></Fld><Fld label="Qualification Year"><input style={S.inp} value={form.last_qualification_year} onChange={e=>setForm({...form,last_qualification_year:e.target.value})} placeholder="e.g. 2022"/></Fld></R2>
          <R2><Fld label="IELTS/PTE Score"><input style={S.inp} value={form.ielts_score} onChange={e=>setForm({...form,ielts_score:e.target.value})} placeholder="e.g. 6.5"/></Fld><Fld label="Target Intake"><input style={S.inp} value={form.intake_target} onChange={e=>setForm({...form,intake_target:e.target.value})} placeholder="Sep 2026"/></Fld></R2>
          <Fld label="Issue / Concern"><input style={S.inp} value={form.issue} onChange={e=>setForm({...form,issue:e.target.value})} placeholder="Any issue or concern with this lead…"/></Fld>
          <Fld label="Remarks"><input style={S.inp} value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})} placeholder="Internal remarks…"/></Fld>
          <Fld label="Enquiry Date"><input type="date" style={S.inp} value={form.enquiry_date} onChange={e=>setForm({...form,enquiry_date:e.target.value})}/></Fld>
          <Alert type="info" msg="Lead enters GCL and awaits CEO assignment. 2-day follow-up task created automatically."/>
          <button onClick={addLead} style={{...S.btn(),width:"100%",justifyContent:"center",padding:12}}>Submit Lead</button>
        </Modal>
      )}
    </div>
  );
}

// ─── CASES ───────────────────────────────────────────────────────────────────
function Cases({leads,leadsDB,tasksDB,invoices,currentUser}) {
  const toast=useToast();
  const [sel,setSel]=useState(null);
  const [caseFile,setCaseFile]=useState(null);
  const [caseTab,setCaseTab]=useState("overview");
  const [noteText,setNoteText]=useState("");
  const [noteType,setNoteType]=useState("Call");
  const [caseTask,setCaseTask]=useState({title:"",due_date:"",priority:"High"});
  const [showTaskForm,setShowTaskForm]=useState(false);
  const [showLogForm,setShowLogForm]=useState(false);
  const [logForm,setLogForm]=useState({type:"Processing",text:"",date:tod()});
  const acl=leads.filter(l=>l.list==="ACL"&&!l.lost);
  const changeStage=async(lead,ns,invoices)=>{
    // Gate 1: Docs required before Application
    if(ns==="Applied for Admission"&&!lead.all_doc_received){
      toast("⛔ All documents must be received first.","error");return;
    }
    // Gate 2: Invoice must exist before moving past Assessment
    const INVOICE_REQUIRED_STAGES=["University Application Submitted","Institution Application Submitted","College Application Submitted","Uni-Assist / Direct Application Submitted","Pre-Enrollment (Universitaly) Submitted","Skills Assessment Applied","Express Entry Profile Created","Job Seeker Visa Filed","Chancenkarte Application Filed","Work Permit Filed","Visa Filed","PR Application Submitted"];
    if(INVOICE_REQUIRED_STAGES.includes(ns)){
      const clientInvoices=(invoices||[]).filter(i=>i.client_name===lead.name);
      if(clientInvoices.length===0){
        alert(`⛔ Invoice Required

An invoice must be created for ${lead.name} before moving to "${ns}".

Go to Invoices → Create Invoice for this client first.`);
        return;
      }
    }
    // Gate 3: Payment must be received before Visa Filing
    const PAYMENT_REQUIRED_STAGES=["Visa Filed","Visa Application Prepared","PR Application Submitted","Study Permit Application Prepared","Residence Permit Application Prepared","Student Visa Application Prepared","Job Seeker Visa Filed","Chancenkarte Application Filed"];
    if(PAYMENT_REQUIRED_STAGES.includes(ns)){
      const clientInvoices=(invoices||[]).filter(i=>i.client_name===lead.name);
      const totalPaid=clientInvoices.reduce((a,i)=>a+(i.paid||0),0);
      const totalBilled=clientInvoices.reduce((a,i)=>a+(i.amount||0),0);
      if(totalBilled===0){
        alert(`⛔ No Invoice Found

Create and mark an invoice as paid for ${lead.name} before filing the visa.`);
        return;
      }
      if(totalPaid<totalBilled*0.5){
        const confirm=window.confirm(`⚠️ Payment Warning

${lead.name} has paid ${Math.round((totalPaid/totalBilled)*100)}% of the invoice (PKR ${totalPaid.toLocaleString()} of PKR ${totalBilled.toLocaleString()}).

At least 50% payment is required before visa filing.

Do you want to proceed anyway? (CEO override)`);
        if(!confirm)return;
      }
    }
    // Gate 4: Case Closed only after WON/Rejected/Refund
    if(ns==="Case Closed"&&lead.stage!=="Visa Approved"&&lead.stage!=="PR Approved"&&lead.stage!=="Visa Rejected"&&lead.stage!=="PR Rejected"&&!lead.stage?.includes("Refund")){
      toast("⛔ Only close after Visa Approved, Rejected, or Refund.");return;
    }
    await leadsDB.update(lead.id,{stage:ns});
    await tasksDB.insert({title:`${lead.name}: moved to "${ns}"`,client_name:lead.name,lead_id:lead.id,assigned_to:lead.assigned_to,due_date:tod(),priority:"Medium",type:"Follow-up",auto_generated:true});
    setSel(null);
  };
  const toggleDoc=async(lead,doc)=>{const docs={...(lead.docs||{}),[`doc_${doc}`]:!lead.docs?.[`doc_${doc}`]};await leadsDB.update(lead.id,{docs});setSel(p=>p?{...p,docs}:p);};
  return (
    <div>
      <div style={{marginBottom:18}}><h2 style={S.h2}>Active Cases (ACL)</h2><p style={S.sub}>{acl.length} active cases</p></div>
      <div style={S.card}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Client","Country","University","Intake","Start Date","Stage","Docs",""].map(h=><th key={h} style={{...S.th,fontSize:11}}>{h}</th>)}</tr></thead>
          <tbody>
            {acl.map(lead=>(
              <tr key={lead.id}>
                <td style={S.td}>
                  <div style={{fontWeight:700,color:B.dark}}>{lead.name}</div>
                  <div style={{fontSize:11,color:"#9fa8da"}}>{lead.phone}</div>
                  {(()=>{const inv=(invoices||[]).filter(i=>i.client_name===lead.name);const paid=inv.reduce((a,i)=>a+(i.paid||0),0);const billed=inv.reduce((a,i)=>a+(i.amount||0),0);if(inv.length===0)return <span style={{fontSize:10,background:"#fee2e2",color:"#dc2626",borderRadius:4,padding:"1px 6px",fontWeight:700}}>⚠️ No Invoice</span>;if(paid>=billed)return <span style={{fontSize:10,background:"#d1fae5",color:"#065f46",borderRadius:4,padding:"1px 6px",fontWeight:700}}>✓ Paid</span>;return <span style={{fontSize:10,background:"#fef3c7",color:"#7c5100",borderRadius:4,padding:"1px 6px",fontWeight:700}}>⏳ {Math.round((paid/Math.max(billed,1))*100)}% Paid</span>;})()}
                </td>
                <td style={{...S.td,fontSize:11}}>{lead.country}</td>
                <td style={{...S.td,fontSize:11,maxWidth:130,whiteSpace:"normal",lineHeight:1.3,color:"#5c6bc0"}}>{lead.university||lead.intake_target||"—"}</td>
                <td style={{...S.td,fontSize:11,whiteSpace:"nowrap",fontWeight:600,color:"#7c3aed"}}>{lead.intake||"—"}</td>
                <td style={{...S.td,fontSize:11,whiteSpace:"nowrap",color:"#9fa8da"}}>{lead.created_at?.slice(0,10)||"—"}</td>
                <td style={S.td}><Pill text={lead.stage} color="#37474f" bg="#f3f4f9"/></td>
                <td style={S.td}>{lead.all_doc_received?<span style={{color:B.success,fontWeight:700,fontSize:12}}>Complete ✓</span>:<span style={{color:B.warn,fontSize:12}}>Pending</span>}</td>
                <td style={S.td}><span style={{fontSize:12}}>{lead.branch?.split(" ")[0]}</span></td>
                <td style={S.td}><button onClick={()=>{setSel({...lead});setLeadTab("overview");}} style={S.btn(B.secondary)}>Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {acl.length===0&&<div style={{padding:32,textAlign:"center",color:"#9fa8da"}}>No active cases yet.</div>}
      </div>
      {sel&&(
        <Modal title={`📋 ${sel.name} · ${sel.country}`} onClose={()=>{setSel(null);setCaseTab("overview");}} w={760}>
          {/* Client info bar */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,padding:"10px 14px",background:"#f0f4ff",borderRadius:10}}>
            {sel.university&&<span style={{fontSize:11,background:"#e0e7ff",color:"#3730a3",borderRadius:6,padding:"3px 10px",fontWeight:600}}>🎓 {sel.university}</span>}
            {sel.intake&&<span style={{fontSize:11,background:"#fef9c3",color:"#854d0e",borderRadius:6,padding:"3px 10px",fontWeight:600}}>📅 {sel.intake}</span>}
            {sel.phone&&<span style={{fontSize:11,background:"#dcfce7",color:"#166534",borderRadius:6,padding:"3px 10px",fontWeight:600}}>📞 {sel.phone}</span>}
            {sel.email&&<span style={{fontSize:11,background:"#dbeafe",color:"#1e40af",borderRadius:6,padding:"3px 10px",fontWeight:600}}>✉️ {sel.email}</span>}
            {sel.ielts_score&&<span style={{fontSize:11,background:"#fce7f3",color:"#9d174d",borderRadius:6,padding:"3px 10px",fontWeight:600}}>IELTS: {sel.ielts_score}</span>}
            <span style={{fontSize:11,background:"#f3e8ff",color:"#6b21a8",borderRadius:6,padding:"3px 10px",fontWeight:600}}>📌 Since: {sel.created_at?.slice(0,10)||"—"}</span>
          </div>

          {/* Progress bar */}
          {(()=>{const stages=getStages(sel.country);const idx=stages.indexOf(sel.stage);const pct=stages.length>0?Math.round(((idx+1)/stages.length)*100):0;return(
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,color:"#5c6bc0",fontWeight:700}}>Processing Progress</span>
                <span style={{fontSize:12,fontWeight:800,color:B.primary}}>{pct}%</span>
              </div>
              <div style={{background:"#eef0fb",borderRadius:6,height:8}}>
                <div style={{background:B.grad,borderRadius:6,height:8,width:`${pct}%`,transition:"width 0.4s"}}/>
              </div>
              <div style={{fontSize:11,color:"#9fa8da",marginTop:3}}>Stage {Math.max(idx+1,1)} of {stages.length}: <strong style={{color:B.primary}}>{sel.stage}</strong></div>
            </div>
          );})()}

          {/* Tabs */}
          <div style={{display:"flex",gap:4,marginBottom:14,borderBottom:"2px solid #eef0fb",paddingBottom:0}}>
            {[["overview","📊 Overview"],["stage","🔄 Change Stage"],["docs","📁 Documents"],["notes","💬 Log"],["tasks","✅ Tasks"]].map(([k,label])=>(
              <button key={k} onClick={()=>setCaseTab(k)} style={{padding:"8px 14px",borderRadius:"8px 8px 0 0",border:"none",background:caseTab===k?B.primary:"transparent",color:caseTab===k?"#fff":"#5c6bc0",fontSize:12,fontWeight:caseTab===k?700:500,cursor:"pointer",borderBottom:caseTab===k?"2px solid "+B.primary:"none"}}>
                {label}
              </button>
            ))}
          </div>

          {/* TAB: Overview */}
          {caseTab==="overview"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{...S.card,padding:12}}>
                <div style={{fontSize:11,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:8}}>Client Details</div>
                {[["Country",sel.country],["University",sel.university||"—"],["Intake",sel.intake||"—"],["IELTS/PTE",sel.ielts_score||"—"],["Qualification",sel.last_qualification||"—"],["Branch",sel.branch||"—"]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f3f4f9"}}>
                    <span style={{fontSize:11,color:"#9fa8da"}}>{k}</span>
                    <span style={{fontSize:11,fontWeight:600,color:B.dark}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{...S.card,padding:12}}>
                <div style={{fontSize:11,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:8}}>Processing Status</div>
                {(()=>{
                  const allDocs=getDocs(sel.country)||[];
                  const recvd=allDocs.filter(d=>sel.docs?.[`doc_${d}`]).length;
                  const invs=(invoices||[]).filter(i=>i.client_name===sel.name);
                  const paid=invs.reduce((a,i)=>a+(i.paid||0),0);
                  const total=invs.reduce((a,i)=>a+(i.amount||0),0);
                  return(<>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f3f4f9"}}>
                      <span style={{fontSize:11,color:"#9fa8da"}}>Documents</span>
                      <span style={{fontSize:11,fontWeight:700,color:recvd===allDocs.length&&allDocs.length>0?B.success:"#f59e0b"}}>{recvd}/{allDocs.length} received</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f3f4f9"}}>
                      <span style={{fontSize:11,color:"#9fa8da"}}>Invoice</span>
                      <span style={{fontSize:11,fontWeight:700,color:total>0?B.success:"#9fa8da"}}>{total>0?`PKR ${paid.toLocaleString()} / ${total.toLocaleString()}`:"No invoice"}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f3f4f9"}}>
                      <span style={{fontSize:11,color:"#9fa8da"}}>Payment</span>
                      <span style={{fontSize:11,fontWeight:700,color:total>0&&paid>=total?B.success:total>0?"#f59e0b":"#9fa8da"}}>{total>0?Math.round((paid/total)*100)+"%":"—"}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}>
                      <span style={{fontSize:11,color:"#9fa8da"}}>Open Tasks</span>
                      <span style={{fontSize:11,fontWeight:700,color:B.primary}}>{(tasksDB?.data||[]).filter(t=>t.client_name===sel.name&&!t.done).length}</span>
                    </div>
                  </>);
                })()}
              </div>
              {sel.remarks&&<div style={{...S.card,padding:12,gridColumn:"1/-1"}}>
                <div style={{fontSize:11,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:6}}>Process Notes</div>
                <div style={{fontSize:12,color:"#37474f",lineHeight:1.6}}>{sel.remarks}</div>
              </div>}
              {/* Last comm log */}
              {(sel.notes||[]).length>0&&(
                <div style={{...S.card,padding:12,gridColumn:"1/-1"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:8}}>Latest Communication</div>
                  {[...(sel.notes||[])].slice(-3).reverse().map(note=>(
                    <div key={note.id} style={{display:"flex",gap:8,marginBottom:6,padding:"6px 0",borderBottom:"1px solid #f3f4f9"}}>
                      <Pill text={note.type||"Note"} color="#5c6bc0" bg="#eef0fb"/>
                      <span style={{fontSize:11,color:"#37474f",flex:1}}>{note.text}</span>
                      <span style={{fontSize:10,color:"#9fa8da",whiteSpace:"nowrap"}}>{note.date||note.at?.slice(0,10)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Change Stage */}
          {caseTab==="stage"&&(
            <div>
              <div style={{fontSize:12,color:"#5c6bc0",marginBottom:12}}>Current: <strong>{sel.stage}</strong> — click any stage below to move the client</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {getStages(sel.country).map((stage,i)=>{
                  const isCurrent=sel.stage===stage;
                  const stages=getStages(sel.country);
                  const currIdx=stages.indexOf(sel.stage);
                  const isPast=i<currIdx;
                  return(
                    <button key={stage} onClick={()=>{changeStage(sel,stage);setSel(p=>p?{...p,stage}:p);}} style={{padding:"7px 12px",borderRadius:8,border:`2px solid ${isCurrent?B.primary:isPast?"#d1fae5":"#e8eaf6"}`,background:isCurrent?B.primary:isPast?"#f0fdf4":"#fff",color:isCurrent?"#fff":isPast?"#065f46":"#374151",fontSize:11,fontWeight:isCurrent?800:isPast?600:400,cursor:"pointer"}}>
                      {isPast?"✅ ":isCurrent?"📍 ":""}{stage}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: Documents */}
          {caseTab==="docs"&&(
            <div>
              {(()=>{
                const allDocs=getDocs(sel.country)||[];
                const pending=allDocs.filter(d=>!sel.docs?.[`doc_${d}`]);
                const received=allDocs.filter(d=>sel.docs?.[`doc_${d}`]);
                const toggleDoc=async(doc)=>{
                  const updated={...(sel.docs||{}),[`doc_${doc}`]:!sel.docs?.[`doc_${doc}`]};
                  await leadsDB.update(sel.id,{docs:updated});
                  setSel(p=>({...p,docs:updated}));
                };
                return(<>
                  <div style={{display:"flex",gap:8,marginBottom:12}}>
                    <span style={{background:"#fee2e2",color:"#dc2626",borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>⏳ Pending: {pending.length}</span>
                    <span style={{background:"#d1fae5",color:"#065f46",borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>✅ Received: {received.length}</span>
                  </div>
                  {pending.length>0&&<>
                    <div style={{fontSize:11,fontWeight:700,color:"#dc2626",marginBottom:6}}>⏳ PENDING</div>
                    {pending.map(doc=><Chk key={doc} label={doc} checked={false} onChange={()=>toggleDoc(doc)}/>)}
                  </>}
                  {received.length>0&&<>
                    <div style={{fontSize:11,fontWeight:700,color:"#059669",marginTop:10,marginBottom:6}}>✅ RECEIVED</div>
                    {received.map(doc=><Chk key={doc} label={doc} checked={true} onChange={()=>toggleDoc(doc)}/>)}
                  </>}
                </>);
              })()}
            </div>
          )}

          {/* TAB: Communication Log */}
          {caseTab==="notes"&&(
            <div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                {["📞 No answer","✅ Documents received","📋 Application submitted","✈️ Visa filed","🎉 Visa approved","⏳ Awaiting decision","📝 Follow-up needed"].map(t=>(
                  <button key={t} onClick={()=>setNoteText(t)} style={{background:"#f0f4ff",border:"1px solid #c5cae9",borderRadius:6,padding:"2px 8px",fontSize:10,cursor:"pointer",color:"#5c6bc0"}}>{t}</button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"120px 1fr auto",gap:8,marginBottom:12}}>
                <select style={S.sel} value={noteType} onChange={e=>setNoteType(e.target.value)}>
                  {["Call","WhatsApp","Email","Walk-in","Processing","Other"].map(t=><option key={t}>{t}</option>)}
                </select>
                <input style={S.inp} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="What happened? What did client say?" onKeyDown={e=>{
                  if(e.key==="Enter"&&noteText.trim()){
                    const note={id:Date.now(),text:noteText.trim(),by:currentUser.name,at:new Date().toLocaleString(),type:noteType,date:tod()};
                    const updated=[...(sel.notes||[]),note];
                    leadsDB.update(sel.id,{notes:updated,last_contact:tod()});
                    setSel(p=>({...p,notes:updated}));
                    setNoteText("");
                  }
                }}/>
                <button onClick={async()=>{
                  if(!noteText.trim())return;
                  const note={id:Date.now(),text:noteText.trim(),by:currentUser.name,at:new Date().toLocaleString(),type:noteType,date:tod()};
                  const updated=[...(sel.notes||[]),note];
                  await leadsDB.update(sel.id,{notes:updated,last_contact:tod()});
                  setSel(p=>({...p,notes:updated}));
                  setNoteText("");
                }} style={{...S.btn(B.secondary),whiteSpace:"nowrap"}}>+ Log</button>
              </div>
              <div style={{maxHeight:280,overflowY:"auto"}}>
                {[...(sel.notes||[])].reverse().map(note=>{
                  const tc={Call:{c:"#059669",bg:"#d1fae5",icon:"📞"},WhatsApp:{c:"#25d366",bg:"#dcfce7",icon:"💬"},Email:{c:"#1a91c7",bg:"#dbeafe",icon:"📧"},"Walk-in":{c:"#7c3aed",bg:"#ede9fe",icon:"🚶"},Processing:{c:"#1a91c7",bg:"#dbeafe",icon:"⚙️"},Other:{c:"#64748b",bg:"#f1f5f9",icon:"📝"}}[note.type]||{c:"#64748b",bg:"#f1f5f9",icon:"📝"};
                  return(
                    <div key={note.id} style={{display:"flex",gap:8,marginBottom:8,padding:"8px",background:"#f8f9ff",borderRadius:8,border:"1px solid #e8eaf6"}}>
                      <div style={{width:28,height:28,borderRadius:6,background:tc.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{tc.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <Pill text={note.type} color={tc.c} bg={tc.bg}/>
                          <span style={{fontSize:10,color:"#9fa8da"}}>{note.by} · {note.date||note.at?.slice(0,10)}</span>
                        </div>
                        <div style={{fontSize:12,color:"#37474f"}}>{note.text}</div>
                      </div>
                    </div>
                  );
                })}
                {!(sel.notes||[]).length&&<div style={{textAlign:"center",color:"#9fa8da",fontSize:12,padding:20}}>No communication logged yet.</div>}
              </div>
            </div>
          )}

          {/* TAB: Tasks */}
          {caseTab==="tasks"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:12,fontWeight:700,color:B.dark}}>Tasks for {sel.name}</div>
                <button onClick={()=>setShowTaskForm(p=>!p)} style={{...S.btn("#7c3aed"),fontSize:11,padding:"5px 12px"}}>+ Add Task</button>
              </div>
              {showTaskForm&&(
                <div style={{background:"#f8f9ff",borderRadius:10,padding:12,marginBottom:12,border:"1px solid #c5cae9"}}>
                  <R2>
                    <Fld label="Task Title"><input style={S.inp} value={caseTask.title} onChange={e=>setCaseTask({...caseTask,title:e.target.value})} placeholder="e.g. Follow up on offer letter"/></Fld>
                    <Fld label="Due Date"><input type="date" style={S.inp} value={caseTask.due_date} onChange={e=>setCaseTask({...caseTask,due_date:e.target.value})}/></Fld>
                  </R2>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={async()=>{
                      if(!caseTask.title.trim())return;
                      await tasksDB.insert({title:caseTask.title,client_name:sel.name,lead_id:sel.id,assigned_to:currentUser.id,due_date:caseTask.due_date||tod(),priority:caseTask.priority||"High",type:"Processing",auto_generated:false});
                      setCaseTask({title:"",due_date:"",priority:"High"});
                      setShowTaskForm(false);
                    }} style={{...S.btn("#7c3aed"),padding:"7px 16px",fontSize:11}}>Save Task</button>
                    <button onClick={()=>setShowTaskForm(false)} style={{...S.ghost,padding:"7px 12px",fontSize:11}}>Cancel</button>
                  </div>
                </div>
              )}
              {(tasksDB?.data||[]).filter(t=>t.client_name===sel.name).sort((a,b)=>a.done-b.done).map(task=>(
                <div key={task.id} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px",background:task.done?"#f8fffe":"#fff",borderRadius:8,marginBottom:6,border:`1px solid ${task.done?"#d1fae5":"#e8eaf6"}`}}>
                  <div style={{width:16,height:16,borderRadius:4,background:task.done?B.success:"#e8eaf6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",flexShrink:0,marginTop:2}}>{task.done?"✓":""}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:task.done?"#9fa8da":B.dark,textDecoration:task.done?"line-through":"none"}}>{task.title}</div>
                    <div style={{fontSize:10,color:"#9fa8da"}}>Due: {task.due_date} · {task.priority}</div>
                  </div>
                  {!task.done&&<button onClick={()=>tasksDB.update(task.id,{done:true,completed_at:new Date().toISOString()})} style={{...S.ghost,fontSize:10,padding:"3px 8px",color:B.success,borderColor:B.success}}>Done</button>}
                </div>
              ))}
              {!(tasksDB?.data||[]).filter(t=>t.client_name===sel.name).length&&<div style={{textAlign:"center",color:"#9fa8da",fontSize:12,padding:20}}>No tasks yet for this client.</div>}
            </div>
          )}
        </Modal>
      )}
    {caseFile&&<CaseFileModal lead={caseFile} leadsDB={leadsDB} tasksDB={tasksDB} invoices={invoices} users={[]} currentUser={currentUser} onClose={()=>setCaseFile(null)}/>}
    </div>
  );
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
function Tasks({tasks,tasksDB,leads,users,currentUser}) {
  const toast=useToast();
  const [showAdd,setShowAdd]=useState(false);
  const [completeModal,setCompleteModal]=useState(null); // task being completed
  const [outcome,setOutcome]=useState({issue:"",remarks:"",last_note:"",next_reminder:"",not_interested:false,not_interested_reason:""});
  const [form,setForm]=useState({title:"",client_name:"",assigned_to:currentUser.id,due_date:"",priority:"High",type:"Follow-up"});
  // ALL users see ALL tasks — but filtered by tab
  const [taskTab,setTaskTab]=useState(currentUser.role===ROLES.CEO?"all":"mine");
  const allOpen=tasks.filter(t=>!t.done).sort((a,b)=>{if(a.due_date<tod()&&b.due_date>=tod())return -1;if(b.due_date<tod()&&a.due_date>=tod())return 1;return(a.due_date||"").localeCompare(b.due_date||"");});
  const myOpen=allOpen.filter(t=>t.assigned_to===currentUser.id);
  const teamOpen=allOpen.filter(t=>t.assigned_to!==currentUser.id);
  const open=taskTab==="mine"?myOpen:taskTab==="team"?teamOpen:allOpen;
  const done=tasks.filter(t=>t.done).sort((a,b)=>(b.completed_at||b.created_at||"").localeCompare(a.completed_at||a.created_at||""));
  const canEdit=(task)=>currentUser.role===ROLES.CEO||task.assigned_to===currentUser.id;

  // Get last note for a client from leads
  const getLastNote=(clientName)=>{
    const lead=leads.find(l=>l.name===clientName);
    if(!lead||(lead.notes||[]).length===0)return null;
    const last=[...(lead.notes||[])].sort((a,b)=>b.id-a.id)[0];
    return last;
  };

  // Open complete modal instead of direct done
  const openComplete=(task)=>{
    setCompleteModal(task);
    setOutcome({issue:"",remarks:"",last_note:"",next_reminder:""});
  };

  // Save outcome and mark done, optionally create new reminder task
  const saveOutcome=async(markLost=false)=>{
    if(!completeModal)return;
    const issueVal=markLost?"Not Interested":(outcome.issue||null);
    const remarksVal=markLost?(outcome.not_interested_reason||"Not interested"):(outcome.remarks||null);
    await tasksDB.update(completeModal.id,{
      done:true,
      outcome_issue:issueVal,
      outcome_remarks:remarksVal,
      outcome_note:outcome.last_note||null,
      completed_at:new Date().toISOString(),
    });
    // If marked not interested — close the lead
    if(markLost&&completeModal.lead_id){
      const reason=outcome.not_interested_reason||"Not interested";
      const lead=leads.find(l=>l.id===completeModal.lead_id);
      if(lead){
        const note={id:Date.now(),text:`❌ Lead closed — Not Interested. Reason: ${reason}. By: ${currentUser.name}`,by:currentUser.name,at:new Date().toLocaleString(),type:"Other"};
        const updated=[...(lead.notes||[]),note];
        await supabase.from("leads").update({lost:true,lost_reason:reason,status:"Lost",notes:updated,last_contact:tod()}).eq("id",lead.id);
      }
    } else {
      // Normal completion — create next reminder if set
      if(outcome.next_reminder){
        await tasksDB.insert({title:`Follow up: ${completeModal.client_name||completeModal.title}`,client_name:completeModal.client_name,lead_id:completeModal.lead_id,assigned_to:completeModal.assigned_to||currentUser.id,due_date:outcome.next_reminder,priority:completeModal.priority||"High",type:"Follow-up",auto_generated:false});
      }
      if(outcome.last_note&&completeModal.lead_id){
        const lead=leads.find(l=>l.id===completeModal.lead_id);
        if(lead){
          const note={id:Date.now(),text:outcome.last_note,by:currentUser.name,at:new Date().toLocaleString(),type:"Call"};
          const updated=[...(lead.notes||[]),note];
          await supabase.from("leads").update({notes:updated,last_contact:tod()}).eq("id",lead.id);
        }
      }
    }
    setCompleteModal(null);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><h2 style={S.h2}>Tasks & Follow-ups</h2><p style={S.sub}>{allOpen.length} total open · {myOpen.length} mine · {myOpen.filter(t=>t.due_date<tod()).length} overdue</p></div>
        <button style={S.btn("#7c3aed")} onClick={()=>setShowAdd(true)}>+ Add Task</button>
      </div>
      {/* Task tabs */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {[["mine",`My Tasks (${myOpen.length})`,currentUser.role===ROLES.CEO?"#2d3a8c":"#7c3aed"],["team",`Team Tasks (${teamOpen.length})`,"#1a91c7"],["all",`All Tasks (${allOpen.length})`,"#059669"]].map(([k,l,c])=>(
          <button key={k} onClick={()=>setTaskTab(k)} style={{padding:"7px 16px",borderRadius:8,border:`2px solid ${taskTab===k?c:"#c5cae9"}`,background:taskTab===k?c:"#fff",color:taskTab===k?"#fff":c,fontSize:13,fontWeight:700,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      <div style={{display:"grid",gap:9,marginBottom:20}}>
        {open.map(t=>{
          const od=t.due_date&&t.due_date<tod();
          const lastNote=t.client_name?getLastNote(t.client_name):null;
          return(
            <div key={t.id} style={{...S.card,padding:"12px 16px",borderLeft:`4px solid ${od?B.danger:priC[t.priority]||"#94a3b8"}`,opacity:canEdit(t)?1:0.85}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                {/* Checkbox - only clickable by assigned person or CEO */}
                <button 
                  onClick={()=>canEdit(t)?openComplete(t):null} 
                  title={canEdit(t)?"Mark as done":"Only "+((users.find(u=>u.id===t.assigned_to)?.name)||"assigned person")+" can complete this"}
                  style={{width:22,height:22,borderRadius:6,border:`2px solid ${od?B.danger:canEdit(t)?"#c5cae9":"#e0e0e0"}`,background:canEdit(t)?"#fff":"#f5f5f5",cursor:canEdit(t)?"pointer":"not-allowed",flexShrink:0,marginTop:2}}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:B.dark}}>{t.title}{t.auto_generated&&<span style={{fontSize:10,color:"#9fa8da",marginLeft:6}}>🤖</span>}</div>
                      <div style={{fontSize:11,color:"#9fa8da",marginTop:3,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                        {t.client_name&&<span style={{fontWeight:700,color:"#3949ab",background:"#eef0fb",borderRadius:20,padding:"1px 8px"}}>{t.client_name}</span>}
                        {/* Assigned counselor badge */}
                        {(()=>{
                          const assignee=users.find(u=>u.id===t.assigned_to);
                          return assignee?<span style={{background:assignee.id===currentUser.id?"#d1fae5":"#f3e8ff",color:assignee.id===currentUser.id?"#065f46":"#7c3aed",borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}>👤 {assignee.name}</span>:null;
                        })()}
                        {/* Due date / overdue days */}
                        {(()=>{
                          if(!t.due_date)return <span style={{fontSize:11,color:"#9fa8da"}}>No due date</span>;
                          const due=new Date(t.due_date);
                          const today=new Date(tod());
                          const diffDays=Math.floor((today-due)/(1000*60*60*24));
                          if(diffDays>0)return <span style={{background:"#fee2e2",color:"#dc2626",borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:800}}>⚠️ {diffDays} day{diffDays>1?"s":""} overdue</span>;
                          if(diffDays===0)return <span style={{background:"#fef3c7",color:"#7c5100",borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700}}>📅 Due today</span>;
                          return <span style={{background:"#f0f9ff",color:"#0369a1",borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:600}}>📅 Due {t.due_date} ({Math.abs(diffDays)}d left)</span>;
                        })()}
                        {/* Date assigned */}
                        {t.created_at&&<span style={{fontSize:10,color:"#9fa8da"}}>Assigned: {t.created_at?.split("T")[0]}</span>}
                        {!canEdit(t)&&<span style={{background:"#f3f4f9",color:"#94a3b8",borderRadius:20,padding:"1px 8px",fontSize:10}}>🔒 View only</span>}
                      </div>
                    </div>
                    <Pill text={t.priority} color={priC[t.priority]||"#64748b"} bg={t.priority==="High"?"#fce4ec":t.priority==="Medium"?"#fffde7":"#f8f9ff"}/>
                   {currentUser.role===ROLES.CEO&&!t.done&&(
                     <select onChange={async e=>{if(!e.target.value)return;await tasksDB.update(t.id,{assigned_to:e.target.value});e.target.value="";}} style={{fontSize:10,padding:"2px 6px",borderRadius:6,border:"1px solid #c5cae9",background:"#f0f4ff",color:"#5c6bc0",cursor:"pointer",maxWidth:120}} defaultValue="">
                       <option value="">↪ Reassign…</option>
                       {users.filter(u=>u.active).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                     </select>
                   )}
                  </div>
                  {/* Last call note */}
                  {lastNote&&(
                    <div style={{marginTop:8,background:"#f0f4ff",borderRadius:8,padding:"7px 10px",borderLeft:`3px solid ${B.secondary}`}}>
                      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                        <span style={{fontSize:10,fontWeight:700,color:B.secondary}}>LAST {lastNote.type?.toUpperCase()||"NOTE"}</span>
                        <span style={{fontSize:10,color:"#9fa8da"}}>{lastNote.at}</span>
                        <span style={{fontSize:10,color:"#9fa8da"}}>by {lastNote.by}</span>
                      </div>
                      <div style={{fontSize:12,color:"#37474f",lineHeight:1.4}}>{lastNote.text?.slice(0,120)}{lastNote.text?.length>120?"…":""}</div>
                    </div>
                  )}
                  {/* Previous outcome if any */}
                  {t.outcome_remarks&&(
                    <div style={{marginTop:6,background:"#fffde7",borderRadius:6,padding:"5px 10px",fontSize:11,color:"#7c5100"}}>
                      📝 Last outcome: {t.outcome_remarks}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {open.length===0&&<div style={{...S.card,textAlign:"center",color:"#9fa8da",padding:32}}>All caught up! 🎉</div>}
      </div>
      {done.length>0&&(
        <div>
          <div style={{fontSize:12,color:"#9fa8da",fontWeight:700,textTransform:"uppercase",marginBottom:10}}>Completed ({done.length})</div>
          {done.slice(0,10).map(t=>(
            <div key={t.id} style={{...S.card,display:"flex",alignItems:"flex-start",gap:12,padding:"10px 16px",opacity:0.6,marginBottom:8}}>
              <span style={{color:B.success,marginTop:2}}>✓</span>
              <div>
                <div style={{fontSize:13,textDecoration:"line-through",color:"#9fa8da"}}>{t.title}</div>
                {t.outcome_remarks&&<div style={{fontSize:11,color:"#7c5100",marginTop:2}}>📝 {t.outcome_remarks}</div>}
                {t.outcome_note&&<div style={{fontSize:11,color:"#5c6bc0",marginTop:2}}>💬 {t.outcome_note}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPLETE TASK MODAL */}
      {completeModal&&(
        <Modal title={`✅ Complete: ${completeModal.title}`} onClose={()=>setCompleteModal(null)} w={520}>
          <div style={{background:B.light,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:B.primary,marginBottom:2}}>Client: {completeModal.client_name||"—"}</div>
            <div style={{fontSize:11,color:"#5c6bc0"}}>Due: {completeModal.due_date||"—"} · Type: {completeModal.type}</div>
          </div>
          <Fld label="What did the client say? (Call Note)">
            <textarea style={{...S.inp,minHeight:70,resize:"vertical"}} value={outcome.last_note} onChange={e=>setOutcome({...outcome,last_note:e.target.value})} placeholder="e.g. Client said he will arrange bank statement by Friday. Interested in UK Masters…"/>
          </Fld>
          <R2>
            <Fld label="Issue (if any)">
              <input style={S.inp} value={outcome.issue} onChange={e=>setOutcome({...outcome,issue:e.target.value})} placeholder="e.g. IELTS score low"/>
            </Fld>
            <Fld label="Remarks">
              <input style={S.inp} value={outcome.remarks} onChange={e=>setOutcome({...outcome,remarks:e.target.value})} placeholder="e.g. Hot lead, follow up urgently"/>
            </Fld>
          </R2>
          <Fld label="📅 Set Next Reminder (creates new follow-up task)">
            <input type="date" style={S.inp} value={outcome.next_reminder} onChange={e=>setOutcome({...outcome,next_reminder:e.target.value})} min={tod()}/>
          </Fld>
          {outcome.next_reminder&&<Alert type="info" msg={`A new follow-up task will be created for ${outcome.next_reminder}`}/>}
          {/* Not Interested Section */}
          <div style={{borderTop:"2px dashed #fee2e2",paddingTop:14,marginTop:4}}>
            <div style={{fontSize:12,fontWeight:700,color:"#dc2626",marginBottom:8}}>❌ Not Interested? Close this lead permanently</div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input style={{...S.inp,flex:1}} value={outcome.not_interested_reason} onChange={e=>setOutcome({...outcome,not_interested_reason:e.target.value})} placeholder="Reason e.g. Budget issue, not ready, visa rejected before…"/>
            </div>
            <button onClick={()=>{if(!outcome.not_interested_reason.trim()){alert("Please enter a reason before closing the lead.");return;}if(window.confirm(`Close ${completeModal.client_name||"this lead"} as Not Interested?

Reason: ${outcome.not_interested_reason}

This will move the lead to Closed Leads list.`))saveOutcome(true);}} style={{...S.btn("#dc2626"),width:"100%",justifyContent:"center",padding:10,fontSize:13}}>
              ❌ Not Interested — Close Lead
            </button>
          </div>
          <div style={{display:"flex",gap:10,marginTop:10}}>
            <button onClick={()=>saveOutcome(false)} style={{...S.btn(B.success),flex:1,justifyContent:"center",padding:12}}>✓ Mark Done{outcome.next_reminder?" & Set Reminder":""}</button>
            <button onClick={()=>setCompleteModal(null)} style={{...S.ghost,padding:12}}>Cancel</button>
          </div>
        </Modal>
      )}

      {showAdd&&(
        <Modal title="➕ Add New Task" onClose={()=>setShowAdd(false)}>
          <Fld label="Task Description">
            <input style={S.inp} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Follow up on offer letter for Mazhar…"/>
          </Fld>
          <R2>
            <Fld label="Client Name"><input style={S.inp} value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})} placeholder="Optional — link to a client"/></Fld>
            <Fld label="Due Date"><input type="date" style={S.inp} value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/></Fld>
          </R2>
          <R2>
            <Fld label="Priority">
              <select style={S.sel} value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </Fld>
            <Fld label="Type">
              <select style={S.sel} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                <option>Follow-up</option><option>Call</option><option>Email</option><option>Docs</option><option>Visa</option><option>Application</option><option>Finance</option><option>Meeting</option><option>Other</option>
              </select>
            </Fld>
          </R2>
          {/* Assign To — visible to CEO and Branch Manager */}
          {(currentUser.role===ROLES.CEO||currentUser.role===ROLES.BRANCH_MANAGER)&&(
            <Fld label="Assign To">
              <select style={{...S.sel,borderColor:B.primary,fontWeight:700}} value={form.assigned_to} onChange={e=>setForm({...form,assigned_to:e.target.value})}>
                <option value={currentUser.id}>👤 Myself ({currentUser.name})</option>
                <option disabled>── Team Members ──</option>
                {users.filter(u=>u.id!==currentUser.id&&u.active).map(u=>(
                  <option key={u.id} value={u.id}>{u.name} — {u.role} ({u.branch?.split(" ")[0]||"HQ"})</option>
                ))}
              </select>
            </Fld>
          )}
          {/* Who will get this task */}
          {(currentUser.role===ROLES.CEO||currentUser.role===ROLES.BRANCH_MANAGER)&&(
            <div style={{background:"#f0f4ff",borderRadius:8,padding:"8px 12px",marginBottom:8,fontSize:11,color:"#5c6bc0"}}>
              📌 This task will be assigned to: <strong>{users.find(u=>u.id===form.assigned_to)?.name||currentUser.name}</strong>
              {" "}({users.find(u=>u.id===form.assigned_to)?.role||currentUser.role})
            </div>
          )}
          <button onClick={async()=>{
            if(!form.title)return;
            await tasksDB.insert({...form,done:false,auto_generated:false});
            setShowAdd(false);
            setForm({title:"",client_name:"",assigned_to:currentUser.id,due_date:"",priority:"High",type:"Follow-up"});
          }} style={{...S.btn("#7c3aed"),width:"100%",justifyContent:"center",padding:12,fontSize:14}}>
            ✅ Add Task
          </button>
        </Modal>
      )}
    </div>
  );
}

// ─── INVOICES ────────────────────────────────────────────────────────────────
// ─── FULL ACCOUNTING MODULE ───────────────────────────────────────────────────
function Accounting({accounts,accountsDB,journals,journalsDB,bankTx,bankTxDB,subAccounts,subAccountsDB,invoices,currentUser}) {
  const [tab,setTab]=useState("dashboard");
  const [showJV,setShowJV]=useState(false);
  const [showSubAcc,setShowSubAcc]=useState(false);
  const [jvLines,setJvLines]=useState([{account:"",sub_account_id:"",sub_account_name:"",dr:0,cr:0},{account:"",sub_account_id:"",sub_account_name:"",dr:0,cr:0}]);
  const [jvNarr,setJvNarr]=useState("");
  const [caseFile,setCaseFile]=useState(null);
  const [showLogForm,setShowLogForm]=useState(false);
  const [logForm,setLogForm]=useState({type:"Processing",text:"",date:tod()}); const [jvDate,setJvDate]=useState(tod());
  const [selLedger,setSelLedger]=useState("");
  const [subForm,setSubForm]=useState({code:"",name:"",type:"Debtor",control_account:"1300",phone:"",email:""});
  const fileRef=useRef();
  if(currentUser.role!==ROLES.CEO&&currentUser.role!==ROLES.ACCOUNTS)return <div style={{...S.card,textAlign:"center",padding:60,color:"#9fa8da"}}>🔒 CEO and Accounts only.</div>;

  const leaf=accounts.filter(a=>!a.is_parent);

  // Compute balance for any account from opening balance + journal lines
  const getBalance=(code)=>{
    let bal=accounts.find(a=>a.code===code)?.opening_balance||0;
    journals.forEach(j=>{(j.lines||[]).forEach(l=>{if(l.account===code)bal+=((l.dr||0)-(l.cr||0));});});
    return bal;
  };

  // Compute balance for a subsidiary account
  const getSubBalance=(subId)=>{
    let bal=subAccounts.find(a=>a.id===subId)?.opening_balance||0;
    journals.forEach(j=>{(j.lines||[]).forEach(l=>{if(l.sub_account_id===subId)bal+=((l.dr||0)-(l.cr||0));});});
    return bal;
  };

  // Trial Balance rows
  const tbRows=leaf.map(a=>({...a,balance:getBalance(a.code)})).filter(a=>a.balance!==0);
  const tbDr=tbRows.reduce((s,a)=>s+(a.balance>0&&["Asset","Expense"].includes(a.type)?a.balance:0),0);
  const tbCr=tbRows.reduce((s,a)=>s+(a.balance>0&&["Liability","Income","Equity"].includes(a.type)?a.balance:0),0);

  // P&L
  const totalIncome=tbRows.filter(a=>a.type==="Income").reduce((s,a)=>s+a.balance,0);
  const totalExpense=tbRows.filter(a=>a.type==="Expense").reduce((s,a)=>s+a.balance,0);
  const netProfit=totalIncome-totalExpense;

  // Balance Sheet
  const totalAssets=tbRows.filter(a=>a.type==="Asset").reduce((s,a)=>s+a.balance,0);
  const totalLiabilities=tbRows.filter(a=>a.type==="Liability").reduce((s,a)=>s+a.balance,0);
  const totalEquity=tbRows.filter(a=>a.type==="Equity").reduce((s,a)=>s+a.balance,0)+netProfit;

  // Debtors / Creditors
  const debtors=subAccounts.filter(a=>a.type==="Debtor");
  const creditors=subAccounts.filter(a=>a.type==="Creditor");
  const totalDebtors=debtors.reduce((s,a)=>s+getSubBalance(a.id),0);
  const totalCreditors=creditors.reduce((s,a)=>s+getSubBalance(a.id),0);

  // Ledger entries for selected account
  const ledgerEntries=selLedger?journals.flatMap(j=>(j.lines||[]).filter(l=>l.account===selLedger||l.sub_account_id===selLedger).map(l=>({...l,date:j.journal_date,ref:j.ref,narrative:j.narrative}))).sort((a,b)=>a.date?.localeCompare(b.date)):[];

  // Cash flow
  const cashIn=journals.flatMap(j=>j.lines||[]).filter(l=>["1100","1200"].includes(l.account)&&l.cr>0).reduce((s,l)=>s+(l.cr||0),0);
  const cashOut=journals.flatMap(j=>j.lines||[]).filter(l=>["1100","1200"].includes(l.account)&&l.dr>0).reduce((s,l)=>s+(l.dr||0),0);

  const jvDr=jvLines.reduce((a,l)=>a+(+l.dr||0),0);
  const jvCr=jvLines.reduce((a,l)=>a+(+l.cr||0),0);
  const jvOk=Math.abs(jvDr-jvCr)<0.01&&jvNarr;

  const postJV=async()=>{
    if(!jvOk)return;
    const lines=jvLines.filter(l=>l.account&&(l.dr||l.cr)).map(l=>({...l,dr:+l.dr,cr:+l.cr}));
    await journalsDB.insert({ref:`JV-${String(journals.length+1).padStart(3,"0")}`,journal_date:jvDate,narrative:jvNarr,lines,posted:true,created_by:currentUser.id});
    setJvLines([{account:"",sub_account_id:"",sub_account_name:"",dr:0,cr:0},{account:"",sub_account_id:"",sub_account_name:"",dr:0,cr:0}]);
    setJvNarr("");setShowJV(false);
  };

  const addSubAcc=async()=>{
    if(!subForm.code||!subForm.name)return;
    await subAccountsDB.insert(subForm);
    setSubForm({code:"",name:"",type:"Debtor",control_account:"1300",phone:"",email:""});setShowSubAcc(false);
  };

  const importBank=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=async ev=>{
      const lines=ev.target.result.split("\n").filter(l=>l.trim());
      for(const line of lines.slice(1)){const[date,description,credit,debit,balance]=line.split(",");if(!description?.trim())continue;await bankTxDB.insert({transaction_date:(date||"").trim(),description:(description||"").trim(),credit:parseFloat(credit)||0,debit:parseFloat(debit)||0,balance:parseFloat(balance)||0,matched:false});}
    };
    reader.readAsText(file);
  };

  const TABS=[["dashboard","Dashboard"],["journal","General Journal"],["ledger","Ledger"],["debtors","Debtors Ledger"],["creditors","Creditors Ledger"],["tb","Trial Balance"],["pl","Profit & Loss"],["bs","Balance Sheet"],["cf","Cash Flow"],["bank","Bank Import"]];

  const PdfBtn=({id,title})=><button onClick={()=>printReport(id,title)} style={{...S.ghost,fontSize:11,padding:"5px 12px"}}>🖨️ Print / PDF</button>;

  return (
    <div>
      <div style={{marginBottom:18}}><h2 style={S.h2}>Accounting</h2><p style={S.sub}>Full double-entry · Subsidiary ledgers · Financial statements</p></div>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {TABS.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"7px 14px",borderRadius:8,border:"2px solid",borderColor:tab===k?B.primary:"#c5cae9",background:tab===k?B.light:"#fff",color:tab===k?B.primary:"#5c6bc0",fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>)}
      </div>

      {/* DASHBOARD */}
      {tab==="dashboard"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14,marginBottom:20}}>
            <Stat label="Total Income" value={fmt(totalIncome)} color={B.success} icon="📈"/>
            <Stat label="Total Expenses" value={fmt(totalExpense)} color={B.danger} icon="📉"/>
            <Stat label="Net Profit" value={fmt(netProfit)} color={netProfit>=0?B.success:B.danger} icon="💹"/>
            <Stat label="Total Assets" value={fmt(totalAssets)} color={B.primary} icon="🏦"/>
            <Stat label="Total Debtors" value={fmt(totalDebtors)} color={B.warn} icon="👤"/>
            <Stat label="Total Creditors" value={fmt(totalCreditors)} color={B.purple} icon="🤝"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
            <div style={S.card}>
              <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:14}}>Top Debtors (Accounts Receivable)</div>
              {debtors.length===0&&<div style={{color:"#9fa8da",fontSize:13}}>No debtors yet. Add sub-accounts first.</div>}
              {debtors.slice(0,5).map(d=>{const bal=getSubBalance(d.id);return bal>0&&(<div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f3f4f9"}}><span style={{fontSize:13,color:B.dark,fontWeight:600}}>{d.name}</span><span style={{fontSize:13,fontWeight:800,color:B.warn}}>{fmt(bal)}</span></div>);})}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",fontWeight:800,fontSize:13,borderTop:"2px solid #e8eaf6",marginTop:8}}><span style={{color:B.dark}}>Control Total (AR)</span><span style={{color:B.warn}}>{fmt(totalDebtors)}</span></div>
            </div>
            <div style={S.card}>
              <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:14}}>Top Creditors (Accounts Payable)</div>
              {creditors.length===0&&<div style={{color:"#9fa8da",fontSize:13}}>No creditors yet. Add sub-accounts first.</div>}
              {creditors.slice(0,5).map(c=>{const bal=getSubBalance(c.id);return bal>0&&(<div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f3f4f9"}}><span style={{fontSize:13,color:B.dark,fontWeight:600}}>{c.name}</span><span style={{fontSize:13,fontWeight:800,color:B.purple}}>{fmt(bal)}</span></div>);})}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",fontWeight:800,fontSize:13,borderTop:"2px solid #e8eaf6",marginTop:8}}><span style={{color:B.dark}}>Control Total (AP)</span><span style={{color:B.purple}}>{fmt(totalCreditors)}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* GENERAL JOURNAL */}
      {tab==="journal"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:B.dark}}>General Journal — {journals.length} entries</div>
            <div style={{display:"flex",gap:8}}><button style={S.btn()} onClick={()=>setShowJV(true)}>+ New Journal Entry</button><PdfBtn id="journal-print" title="General Journal"/></div>
          </div>
          <div id="journal-print" style={S.card}>
            <h1 style={{fontSize:16,color:B.dark,marginBottom:14,display:"none"}}>General Journal — Border and Bridges Pvt. Ltd.</h1>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Ref","Date","Narrative","Entries","Balanced"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {journals.map(jv=>{const dr=jv.lines?.reduce((s,l)=>s+(l.dr||0),0)||0;const cr=jv.lines?.reduce((s,l)=>s+(l.cr||0),0)||0;return(
                  <tr key={jv.id}>
                    <td style={{...S.td,fontFamily:"monospace",color:"#7986cb",fontWeight:700}}>{jv.ref}</td>
                    <td style={S.td}>{jv.journal_date}</td>
                    <td style={S.td}>{jv.narrative}</td>
                    <td style={S.td}>{(jv.lines||[]).filter(l=>l.account).map((l,i)=>{const acc=accounts.find(a=>a.code===l.account);const sub=l.sub_account_name;return(<div key={i} style={{fontSize:12,marginBottom:2}}>{l.dr>0?<span style={{color:"#dc2626"}}>Dr {sub||acc?.name||l.account}: {fmt(l.dr)}</span>:<span style={{color:B.success}}>Cr {sub||acc?.name||l.account}: {fmt(l.cr)}</span>}</div>);})}</td>
                    <td style={S.td}>{Math.abs(dr-cr)<0.01?<Pill text="✓" color="#065f46" bg="#d1fae5"/>:<Pill text="⚠️" color="#9b1c1c" bg="#fee2e2"/>}</td>
                  </tr>
                );})}
              </tbody>
            </table>
            {journals.length===0&&<div style={{padding:32,textAlign:"center",color:"#9fa8da"}}>No journal entries yet.</div>}
          </div>
          {showJV&&(
            <Modal title="New Journal Entry" onClose={()=>setShowJV(false)} w={700}>
              <Alert type="info" msg="For debtors/creditors: select the control account (e.g. 1300 Accounts Receivable) AND select the individual sub-account (e.g. Drake). The system posts to both automatically."/>
              <R2><Fld label="Date"><input type="date" style={S.inp} value={jvDate} onChange={e=>setJvDate(e.target.value)}/></Fld><Fld label="Narrative"><input style={S.inp} value={jvNarr} onChange={e=>setJvNarr(e.target.value)} placeholder="e.g. Sales to Drake — visa consultancy fees"/></Fld></R2>
              <div style={{marginBottom:14}}>
                <div style={S.lbl}>Journal Lines</div>
                {jvLines.map((line,i)=>(
                  <div key={i} style={{background:"#f8f9ff",borderRadius:8,padding:"10px 12px",marginBottom:8}}>
                    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:8,marginBottom:6}}>
                      <select style={S.sel} value={line.account} onChange={e=>setJvLines(p=>p.map((l,j)=>j===i?{...l,account:e.target.value}:l))}><option value="">-- Account --</option>{leaf.map(a=><option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}</select>
                      <input type="number" style={S.inp} placeholder="Dr" value={line.dr||""} onChange={e=>setJvLines(p=>p.map((l,j)=>j===i?{...l,dr:+e.target.value,cr:0}:l))}/>
                      <input type="number" style={S.inp} placeholder="Cr" value={line.cr||""} onChange={e=>setJvLines(p=>p.map((l,j)=>j===i?{...l,cr:+e.target.value,dr:0}:l))}/>
                      {i>1&&<button onClick={()=>setJvLines(p=>p.filter((_,j)=>j!==i))} style={{...S.ghost,padding:"8px 10px",color:"#dc2626"}}>✕</button>}
                    </div>
                    {(line.account==="1300"||line.account==="2100")&&(
                      <div>
                        <div style={{fontSize:10,color:"#7986cb",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Sub-account (individual debtor/creditor)</div>
                        <select style={S.sel} value={line.sub_account_id||""} onChange={e=>{const sub=subAccounts.find(s=>s.id===e.target.value);setJvLines(p=>p.map((l,j)=>j===i?{...l,sub_account_id:e.target.value,sub_account_name:sub?.name||""}:l));}}>
                          <option value="">-- Select sub-account (optional) --</option>
                          {subAccounts.filter(s=>line.account==="1300"?s.type==="Debtor":s.type==="Creditor").map(s=><option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={()=>setJvLines(p=>[...p,{account:"",sub_account_id:"",sub_account_name:"",dr:0,cr:0}])} style={{...S.ghost,fontSize:12}}>+ Add Line</button>
              </div>
              <div style={{display:"flex",gap:20,padding:"12px 14px",background:"#f8f9ff",borderRadius:8,marginBottom:14,fontSize:13}}>
                <span>Dr: <strong style={{color:"#dc2626"}}>{fmt(jvDr)}</strong></span>
                <span>Cr: <strong style={{color:B.success}}>{fmt(jvCr)}</strong></span>
                <span style={{fontWeight:700,color:Math.abs(jvDr-jvCr)<0.01?B.success:"#dc2626"}}>{Math.abs(jvDr-jvCr)<0.01?"✓ Balanced":"⚠️ Diff: "+fmt(Math.abs(jvDr-jvCr))}</span>
              </div>
              <button onClick={postJV} disabled={!jvOk} style={{...S.btn(jvOk?B.success:"#9fa8da"),width:"100%",justifyContent:"center",padding:12,cursor:jvOk?"pointer":"not-allowed"}}>Post Journal Entry</button>
            </Modal>
          )}
        </div>
      )}

      {/* LEDGER */}
      {tab==="ledger"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
            <select style={{...S.sel,maxWidth:320}} value={selLedger} onChange={e=>setSelLedger(e.target.value)}>
              <option value="">-- Select Account or Sub-Account --</option>
              <optgroup label="Main Accounts">{leaf.map(a=><option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}</optgroup>
              {subAccounts.length>0&&<optgroup label="Sub-Accounts (Debtors/Creditors)">{subAccounts.map(s=><option key={s.id} value={s.id}>{s.code} — {s.name} ({s.type})</option>)}</optgroup>}
            </select>
            {selLedger&&<PdfBtn id="ledger-print" title={`Ledger — ${accounts.find(a=>a.code===selLedger)?.name||subAccounts.find(s=>s.id===selLedger)?.name}`}/>}
          </div>
          {selLedger&&(
            <div id="ledger-print" style={S.card}>
              <div style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:4}}>{accounts.find(a=>a.code===selLedger)?.name||subAccounts.find(s=>s.id===selLedger)?.name} — Individual Ledger</div>
              <div style={{fontSize:12,color:"#5c6bc0",marginBottom:14}}>All transactions for this account</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Date","Ref","Narrative","Debit","Credit","Balance"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {(()=>{
                    let running=accounts.find(a=>a.code===selLedger)?.opening_balance||subAccounts.find(s=>s.id===selLedger)?.opening_balance||0;
                    return ledgerEntries.map((e,i)=>{running+=((e.dr||0)-(e.cr||0));return(
                      <tr key={i}><td style={S.td}>{e.date}</td><td style={{...S.td,fontFamily:"monospace",fontSize:11,color:"#7986cb"}}>{e.ref}</td><td style={S.td}>{e.narrative}</td><td style={{...S.td,color:"#dc2626",fontWeight:e.dr>0?700:400}}>{e.dr>0?fmt(e.dr):"—"}</td><td style={{...S.td,color:B.success,fontWeight:e.cr>0?700:400}}>{e.cr>0?fmt(e.cr):"—"}</td><td style={{...S.td,fontWeight:700,color:running>=0?B.dark:"#dc2626"}}>{fmt(running)}</td></tr>
                    );});
                  })()}
                </tbody>
              </table>
              {ledgerEntries.length===0&&<div style={{padding:24,textAlign:"center",color:"#9fa8da"}}>No transactions yet for this account.</div>}
            </div>
          )}
          {!selLedger&&<div style={{...S.card,textAlign:"center",padding:40,color:"#9fa8da"}}>Select an account above to view its ledger.</div>}
        </div>
      )}

      {/* DEBTORS LEDGER */}
      {tab==="debtors"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div><div style={{fontSize:14,fontWeight:700,color:B.dark}}>Debtors Ledger</div><div style={{fontSize:12,color:"#5c6bc0"}}>Individual debtor accounts → Control account: 1300 Accounts Receivable</div></div>
            <div style={{display:"flex",gap:8}}><button style={S.btn()} onClick={()=>setShowSubAcc(true)}>+ Add Debtor</button><PdfBtn id="debtors-print" title="Debtors Ledger"/></div>
          </div>
          <div id="debtors-print" style={S.card}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Code","Debtor Name","Phone","Email","Balance"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {debtors.map(d=>{const bal=getSubBalance(d.id);return(
                  <tr key={d.id}><td style={{...S.td,fontFamily:"monospace",color:"#7986cb",fontWeight:700}}>{d.code}</td><td style={S.td}><div style={{fontWeight:700,color:B.dark}}>{d.name}</div></td><td style={S.td}>{d.phone||"—"}</td><td style={S.td}>{d.email||"—"}</td><td style={{...S.td,fontWeight:800,color:bal>0?B.warn:B.success}}>{fmt(bal)}</td></tr>
                );})}
              </tbody>
              <tfoot>
                <tr style={{background:"#f8f9ff"}}><td colSpan={4} style={{...S.td,fontWeight:800,color:B.dark}}>CONTROL TOTAL — Accounts Receivable (1300)</td><td style={{...S.td,fontWeight:900,fontSize:16,color:B.warn}}>{fmt(totalDebtors)}</td></tr>
              </tfoot>
            </table>
            {debtors.length===0&&<div style={{padding:24,textAlign:"center",color:"#9fa8da"}}>No debtors added yet. Click "+ Add Debtor" to create individual debtor accounts.</div>}
          </div>
        </div>
      )}

      {/* CREDITORS LEDGER */}
      {tab==="creditors"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div><div style={{fontSize:14,fontWeight:700,color:B.dark}}>Creditors Ledger</div><div style={{fontSize:12,color:"#5c6bc0"}}>Individual creditor accounts → Control account: 2100 Accounts Payable</div></div>
            <div style={{display:"flex",gap:8}}><button style={S.btn()} onClick={()=>{ setSubForm({code:"",name:"",type:"Creditor",control_account:"2100",phone:"",email:""});setShowSubAcc(true); }}>+ Add Creditor</button><PdfBtn id="creditors-print" title="Creditors Ledger"/></div>
          </div>
          <div id="creditors-print" style={S.card}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Code","Creditor Name","Phone","Email","Balance"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {creditors.map(c=>{const bal=getSubBalance(c.id);return(
                  <tr key={c.id}><td style={{...S.td,fontFamily:"monospace",color:"#7986cb",fontWeight:700}}>{c.code}</td><td style={S.td}><div style={{fontWeight:700,color:B.dark}}>{c.name}</div></td><td style={S.td}>{c.phone||"—"}</td><td style={S.td}>{c.email||"—"}</td><td style={{...S.td,fontWeight:800,color:bal>0?B.purple:B.success}}>{fmt(bal)}</td></tr>
                );})}
              </tbody>
              <tfoot>
                <tr style={{background:"#f8f9ff"}}><td colSpan={4} style={{...S.td,fontWeight:800,color:B.dark}}>CONTROL TOTAL — Accounts Payable (2100)</td><td style={{...S.td,fontWeight:900,fontSize:16,color:B.purple}}>{fmt(totalCreditors)}</td></tr>
              </tfoot>
            </table>
            {creditors.length===0&&<div style={{padding:24,textAlign:"center",color:"#9fa8da"}}>No creditors added yet. Click "+ Add Creditor".</div>}
          </div>
        </div>
      )}

      {/* TRIAL BALANCE */}
      {tab==="tb"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,color:B.dark}}>Trial Balance</div>
            <PdfBtn id="tb-print" title="Trial Balance"/>
          </div>
          <div id="tb-print" style={S.card}>
            <h1 style={{fontSize:16,color:B.dark,marginBottom:4,fontWeight:800}}>Trial Balance</h1>
            <p style={{fontSize:12,color:"#5c6bc0",marginBottom:16}}>Border and Bridges Pvt. Ltd. · As at {tod()}</p>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Code","Account Name","Type","Debit","Credit"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {tbRows.map((a,i)=>{const isDr=["Asset","Expense"].includes(a.type);return(
                  <tr key={i}><td style={{...S.td,fontFamily:"monospace",color:"#7986cb",fontWeight:700}}>{a.code}</td><td style={S.td}>{a.name}</td><td style={S.td}><Pill text={a.type} color={typeC[a.type]} bg={typeC[a.type]+"18"}/></td><td style={{...S.td,color:"#dc2626",fontWeight:700}}>{isDr?fmt(Math.abs(a.balance)):"—"}</td><td style={{...S.td,color:B.success,fontWeight:700}}>{!isDr?fmt(Math.abs(a.balance)):"—"}</td></tr>
                );})}
              </tbody>
              <tfoot>
                <tr style={{background:"#f8f9ff"}}><td colSpan={3} style={{...S.td,fontWeight:800}}>TOTALS</td><td style={{...S.td,fontWeight:900,color:"#dc2626"}}>{fmt(tbDr)}</td><td style={{...S.td,fontWeight:900,color:B.success}}>{fmt(tbCr)}</td></tr>
              </tfoot>
            </table>
            <div style={{marginTop:14,padding:"12px 16px",background:Math.abs(tbDr-tbCr)<1?"#e8f5e9":"#fce4ec",borderRadius:8,fontSize:13,fontWeight:700,color:Math.abs(tbDr-tbCr)<1?"#1b5e20":"#880e4f"}}>
              {Math.abs(tbDr-tbCr)<1?"✓ Trial Balance is BALANCED":"⚠️ Difference: "+fmt(Math.abs(tbDr-tbCr))+" — check your journal entries"}
            </div>
          </div>
        </div>
      )}

      {/* PROFIT & LOSS */}
      {tab==="pl"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,color:B.dark}}>Profit & Loss Statement</div>
            <PdfBtn id="pl-print" title="Profit and Loss"/>
          </div>
          <div id="pl-print" style={{...S.card,maxWidth:640}}>
            <h1 style={{fontSize:16,color:B.dark,marginBottom:2,fontWeight:800}}>Profit & Loss Statement</h1>
            <p style={{fontSize:12,color:"#5c6bc0",marginBottom:20}}>Border and Bridges Pvt. Ltd. · Period ending {tod()}</p>
            <div style={{fontSize:13,fontWeight:700,color:"#7986cb",textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Income</div>
            {tbRows.filter(a=>a.type==="Income").map(a=><div key={a.code} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f3f4f9"}}><span style={{color:"#37474f"}}>{a.name}</span><span style={{fontWeight:700,color:B.success}}>{fmt(a.balance)}</span></div>)}
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:"#e8f5e9",borderRadius:8,margin:"8px 0 20px",fontWeight:800}}><span>Total Income</span><span style={{color:B.success}}>{fmt(totalIncome)}</span></div>
            <div style={{fontSize:13,fontWeight:700,color:"#7986cb",textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Expenses</div>
            {tbRows.filter(a=>a.type==="Expense").map(a=><div key={a.code} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f3f4f9"}}><span style={{color:"#37474f"}}>{a.name}</span><span style={{fontWeight:700,color:"#dc2626"}}>{fmt(a.balance)}</span></div>)}
            <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:"#fce4ec",borderRadius:8,margin:"8px 0 20px",fontWeight:800}}><span>Total Expenses</span><span style={{color:"#dc2626"}}>{fmt(totalExpense)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"14px 16px",background:netProfit>=0?"#e8f5e9":"#fce4ec",borderRadius:10,fontWeight:900,fontSize:16}}><span style={{color:B.dark}}>Net {netProfit>=0?"Profit":"Loss"}</span><span style={{color:netProfit>=0?B.success:"#dc2626"}}>{fmt(Math.abs(netProfit))}</span></div>
          </div>
        </div>
      )}

      {/* BALANCE SHEET */}
      {tab==="bs"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,color:B.dark}}>Balance Sheet</div>
            <PdfBtn id="bs-print" title="Balance Sheet"/>
          </div>
          <div id="bs-print" style={{...S.card,maxWidth:640}}>
            <h1 style={{fontSize:16,color:B.dark,marginBottom:2,fontWeight:800}}>Balance Sheet</h1>
            <p style={{fontSize:12,color:"#5c6bc0",marginBottom:20}}>Border and Bridges Pvt. Ltd. · As at {tod()}</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#7986cb",textTransform:"uppercase",marginBottom:10}}>Assets</div>
                {tbRows.filter(a=>a.type==="Asset").map(a=><div key={a.code} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f3f4f9"}}><span style={{fontSize:13,color:"#37474f"}}>{a.name}</span><span style={{fontWeight:700,color:B.primary}}>{fmt(a.balance)}</span></div>)}
                <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontWeight:800,borderTop:"2px solid #e8eaf6",marginTop:6}}><span>Total Assets</span><span style={{color:B.primary}}>{fmt(totalAssets)}</span></div>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:"#7986cb",textTransform:"uppercase",marginBottom:10}}>Liabilities</div>
                {tbRows.filter(a=>a.type==="Liability").map(a=><div key={a.code} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f3f4f9"}}><span style={{fontSize:13,color:"#37474f"}}>{a.name}</span><span style={{fontWeight:700,color:"#dc2626"}}>{fmt(a.balance)}</span></div>)}
                <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f3f4f9"}}><span style={{fontSize:13,color:"#37474f"}}>Retained Profit</span><span style={{fontWeight:700,color:netProfit>=0?B.success:"#dc2626"}}>{fmt(netProfit)}</span></div>
                {tbRows.filter(a=>a.type==="Equity").map(a=><div key={a.code} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f3f4f9"}}><span style={{fontSize:13,color:"#37474f"}}>{a.name}</span><span style={{fontWeight:700,color:"#7c3aed"}}>{fmt(a.balance)}</span></div>)}
                <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontWeight:800,borderTop:"2px solid #e8eaf6",marginTop:6}}><span>Total L + Equity</span><span style={{color:Math.abs(totalAssets-(totalLiabilities+totalEquity))<1?B.success:"#dc2626"}}>{fmt(totalLiabilities+totalEquity)}</span></div>
              </div>
            </div>
            <div style={{marginTop:16,padding:"12px 16px",background:Math.abs(totalAssets-(totalLiabilities+totalEquity))<1?"#e8f5e9":"#fce4ec",borderRadius:8,fontSize:13,fontWeight:700,color:Math.abs(totalAssets-(totalLiabilities+totalEquity))<1?"#1b5e20":"#880e4f"}}>
              {Math.abs(totalAssets-(totalLiabilities+totalEquity))<1?"✓ Balance Sheet BALANCES (Assets = Liabilities + Equity)":"⚠️ Difference: "+fmt(Math.abs(totalAssets-(totalLiabilities+totalEquity)))}
            </div>
          </div>
        </div>
      )}

      {/* CASH FLOW */}
      {tab==="cf"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,color:B.dark}}>Cash Flow Statement</div>
            <PdfBtn id="cf-print" title="Cash Flow Statement"/>
          </div>
          <div id="cf-print" style={{...S.card,maxWidth:560}}>
            <h1 style={{fontSize:16,color:B.dark,marginBottom:2,fontWeight:800}}>Cash Flow Statement</h1>
            <p style={{fontSize:12,color:"#5c6bc0",marginBottom:20}}>Border and Bridges Pvt. Ltd. · Period ending {tod()}</p>
            {[
              {label:"Cash received from clients",amount:invoices.reduce((a,i)=>a+(i.paid||0),0),c:B.success},
              {label:"Cash payments (expenses)",amount:cashOut,c:"#dc2626"},
              {label:"Net Cash from Operations",amount:invoices.reduce((a,i)=>a+(i.paid||0),0)-cashOut,c:B.primary,bold:true},
            ].map(row=>(
              <div key={row.label} style={{display:"flex",justifyContent:"space-between",padding:row.bold?"12px 14px":"9px 0",borderBottom:"1px solid #f3f4f9",background:row.bold?"#f8f9ff":"transparent",borderRadius:row.bold?8:0,marginBottom:row.bold?8:0}}>
                <span style={{fontSize:13,color:"#37474f",fontWeight:row.bold?700:400}}>{row.label}</span>
                <span style={{fontSize:14,fontWeight:800,color:row.c}}>{fmt(row.amount)}</span>
              </div>
            ))}
            <div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:"#7986cb",textTransform:"uppercase",marginBottom:10}}>Bank & Cash Balances</div>
              {tbRows.filter(a=>["1100","1200"].includes(a.code)).map(a=>(
                <div key={a.code} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f3f4f9"}}>
                  <span style={{fontSize:13,color:"#37474f"}}>{a.name}</span>
                  <span style={{fontWeight:800,color:B.primary}}>{fmt(a.balance)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BANK IMPORT */}
      {tab==="bank"&&(
        <div>
          <div style={{...S.card,marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:8}}>Bank Statement Import</div>
            <div style={{fontFamily:"monospace",fontSize:11,background:"#e8eaf6",borderRadius:6,padding:"8px 12px",marginBottom:10,color:"#475569"}}>date, description, credit, debit, balance</div>
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <button onClick={()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["date,description,credit,debit,balance\n2026-04-01,TT from Client,45000,0,120000\n2026-04-02,Office Rent,0,25000,95000"],{type:"text/csv"}));a.download="bank_template.csv";a.click();}} style={S.ghost}>⬇️ Download Template</button>
              <input ref={fileRef} type="file" accept=".csv" onChange={importBank} style={{fontSize:12}}/>
            </div>
          </div>
          <div style={S.card}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Date","Description","Credit","Debit","Balance","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {bankTx.map(tx=>(
                  <tr key={tx.id}><td style={S.td}>{tx.transaction_date}</td><td style={S.td}>{tx.description}</td><td style={{...S.td,color:B.success,fontWeight:tx.credit>0?700:400}}>{tx.credit>0?fmt(tx.credit):"—"}</td><td style={{...S.td,color:"#dc2626",fontWeight:tx.debit>0?700:400}}>{tx.debit>0?fmt(tx.debit):"—"}</td><td style={S.td}>{fmt(tx.balance)}</td><td style={S.td}>{tx.matched?<Pill text="Matched" color="#065f46" bg="#d1fae5"/>:<Pill text="Unmatched" color="#7c5100" bg="#fef3c7"/>}</td></tr>
                ))}
              </tbody>
            </table>
            {bankTx.length===0&&<div style={{padding:24,textAlign:"center",color:"#9fa8da"}}>No bank transactions imported yet.</div>}
          </div>
        </div>
      )}

      {/* Add Sub Account Modal */}
      {showSubAcc&&(
        <Modal title={`Add ${subForm.type}`} onClose={()=>setShowSubAcc(false)}>
          <Alert type="info" msg={`This creates an individual ${subForm.type.toLowerCase()} account. Journal entries to this account will automatically update the ${subForm.type==="Debtor"?"Accounts Receivable (1300)":"Accounts Payable (2100)"} control account.`}/>
          <R2><Fld label="Account Code"><input style={S.inp} value={subForm.code} onChange={e=>setSubForm({...subForm,code:e.target.value})} placeholder={subForm.type==="Debtor"?"D001":"C001"}/></Fld><Fld label="Type"><select style={S.sel} value={subForm.type} onChange={e=>setSubForm({...subForm,type:e.target.value,control_account:e.target.value==="Debtor"?"1300":"2100"})}><option value="Debtor">Debtor (owes us money)</option><option value="Creditor">Creditor (we owe them)</option></select></Fld></R2>
          <Fld label="Full Name"><input style={S.inp} value={subForm.name} onChange={e=>setSubForm({...subForm,name:e.target.value})} placeholder="e.g. Drake Ahmed"/></Fld>
          <R2><Fld label="Phone"><input style={S.inp} value={subForm.phone} onChange={e=>setSubForm({...subForm,phone:e.target.value})} placeholder="+92 300 …"/></Fld><Fld label="Email"><input style={S.inp} value={subForm.email} onChange={e=>setSubForm({...subForm,email:e.target.value})}/></Fld></R2>
          <Fld label="Opening Balance (PKR)"><input type="number" style={S.inp} value={subForm.opening_balance||""} onChange={e=>setSubForm({...subForm,opening_balance:+e.target.value})} placeholder="0"/></Fld>
          <button onClick={addSubAcc} style={{...S.btn(),width:"100%",justifyContent:"center",padding:12}}>Create {subForm.type} Account</button>
        </Modal>
      )}
    </div>
  );
}

// ─── WHATSAPP INBOX ───────────────────────────────────────────────────────────
function WhatsAppInbox({waLeads,waLeadsDB,leadsDB,tasksDB,users,currentUser}) {
  const [showAdd,setShowAdd]=useState(false); const [sel,setSel]=useState(null);
  const [form,setForm]=useState({name:"",phone:"",message:"",branch:currentUser.branch});
  const counselors=users.filter(u=>(u.role===ROLES.COUNSELOR||u.role===ROLES.BRANCH_MANAGER)&&u.active);
  const pending=waLeads.filter(w=>!w.converted);
  const addWa=async()=>{if(!form.name||!form.phone)return;await waLeadsDB.insert({...form,converted:false});setForm({name:"",phone:"",message:"",branch:currentUser.branch});setShowAdd(false);};
  const convert=async(wa)=>{
    const nl={name:wa.name,phone:wa.phone,email:"",country:"🇬🇧 UK",source:"WhatsApp",branch:wa.branch||currentUser.branch,list:"GCL",stage:"New Enquiry",score:3,consultation_done:false,agreement_signed:false,payment_received:false,invoice_generated:false,all_doc_received:false,type:"B2C",pending_approval:currentUser.role!==ROLES.CEO,approved:currentUser.role===ROLES.CEO,lost:false,last_contact:tod(),notes:[{id:Date.now(),text:`WhatsApp: "${wa.message}"`,by:currentUser.name,at:new Date().toLocaleString(),type:"WhatsApp"}],docs:{}};
    const saved=await leadsDB.insert(nl);
    if(saved){await waLeadsDB.update(wa.id,{converted:true,lead_id:saved.id});await tasksDB.insert({title:`Follow up: ${wa.name} (WhatsApp)`,client_name:wa.name,lead_id:saved.id,assigned_to:wa.assigned_to||currentUser.id,due_date:addDays(tod(),2),priority:"High",type:"Follow-up",auto_generated:true});}
    setSel(null);
  };
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={S.h2}>WhatsApp Lead Inbox</h2><p style={S.sub}>{pending.length} unprocessed · {waLeads.filter(w=>w.converted).length} converted</p></div>
        <button style={S.btn("#25d366")} onClick={()=>setShowAdd(true)}>+ Log WhatsApp Lead</button>
      </div>
      {pending.map(wa=>(
        <div key={wa.id} style={{...S.card,borderLeft:"4px solid #25d366",display:"flex",gap:14,alignItems:"flex-start",marginBottom:10}}>
          <div style={{width:40,height:40,borderRadius:10,background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>💬</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div><div style={{fontSize:14,fontWeight:800,color:B.dark}}>{wa.name}</div><div style={{fontSize:12,color:"#7986cb"}}>{wa.phone}</div></div>
              <button onClick={()=>setSel(wa)} style={S.ghost}>Process</button>
            </div>
            <div style={{background:"#f0fff4",borderRadius:8,padding:"8px 12px",fontSize:13,color:"#1a5c2e",fontStyle:"italic"}}>"{wa.message}"</div>
          </div>
        </div>
      ))}
      {pending.length===0&&<div style={{...S.card,textAlign:"center",color:"#9fa8da",padding:40}}>No pending WhatsApp leads.</div>}
      {sel&&(
        <Modal title={`WhatsApp: ${sel.name}`} onClose={()=>setSel(null)}>
          <div style={{background:"#f0fff4",borderRadius:10,padding:14,marginBottom:14,fontSize:13,color:"#1a5c2e",fontStyle:"italic"}}>"{sel.message}"<div style={{fontSize:11,color:"#7986cb",marginTop:4,fontStyle:"normal"}}>{sel.phone}</div></div>
          <Fld label="Assign Counselor"><select style={S.sel} value={sel.assigned_to||""} onChange={e=>{waLeadsDB.update(sel.id,{assigned_to:e.target.value});setSel(p=>({...p,assigned_to:e.target.value}))}}><option value="">-- Select --</option>{counselors.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Fld>
          <Alert type="info" msg="Converting creates a GCL lead and a 2-day follow-up task automatically."/>
          <button onClick={()=>convert(sel)} style={{...S.btn("#25d366"),width:"100%",justifyContent:"center",padding:12}}>✓ Convert to Lead</button>
        </Modal>
      )}
      {showAdd&&(
        <Modal title="Log WhatsApp Lead" onClose={()=>setShowAdd(false)}>
          <Fld label="Client Name"><input style={S.inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="As they wrote on WhatsApp"/></Fld>
          <R2><Fld label="Phone"><input style={S.inp} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+92 300 …"/></Fld><Fld label="Branch"><select style={S.sel} value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}>{BRANCHES_DEFAULT.map(b=><option key={b}>{b}</option>)}</select></Fld></R2>
          <Fld label="Their Message"><textarea style={{...S.inp,minHeight:80,resize:"vertical"}} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Paste or type their enquiry…"/></Fld>
          <button onClick={addWa} style={{...S.btn("#25d366"),width:"100%",justifyContent:"center",padding:12}}>Log Lead</button>
        </Modal>
      )}
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function Notifications({notifications,notifsDB,leads,currentUser}) {
  const [selTpl,setSelTpl]=useState(WA_TEMPLATES[0]); const [selClient,setSelClient]=useState("");
  const [v1,setV1]=useState(""); const [v2,setV2]=useState(""); const [sent,setSent]=useState(false);
  const aclLeads=leads.filter(l=>l.list==="ACL"||l.list==="PCL"||l.list==="BCL");
  const client=aclLeads.find(l=>l.name===selClient);
  const buildMsg=()=>{if(!client)return "";try{return selTpl.msg(client.name,v1||"[Value]",v2||"[Value]");}catch{return selTpl.msg(client.name,v1||"[Value]");}};
  const send=async()=>{if(!client)return;const msg=buildMsg();window.open(`https://wa.me/${client.phone.replace(/\D/g,"")}?text=${encodeURIComponent(msg)}`,"_blank");await notifsDB.insert({client_name:client.name,phone:client.phone,trigger_event:selTpl.trigger,message:msg,sent_by:currentUser.id,status:"Sent"});setSent(true);setTimeout(()=>setSent(false),3000);};
  return (
    <div>
      <div style={{marginBottom:18}}><h2 style={S.h2}>Client Notifications</h2><p style={S.sub}>Pre-written WhatsApp templates · Full history</p></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:20}}>
        <div style={S.card}>
          <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>Select Template</div>
          {WA_TEMPLATES.map(t=>(
            <button key={t.id} onClick={()=>setSelTpl(t)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,border:"2px solid",borderColor:selTpl.id===t.id?B.primary:"#e8eaf6",background:selTpl.id===t.id?B.light:"#f8f9ff",cursor:"pointer",textAlign:"left",width:"100%",marginBottom:6}}>
              <span style={{fontSize:18,flexShrink:0}}>{t.emoji}</span>
              <div style={{fontSize:12,fontWeight:700,color:B.dark}}>{t.trigger}</div>
            </button>
          ))}
        </div>
        <div style={S.card}>
          <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>Compose & Send</div>
          <Fld label="Select Client"><select style={S.sel} value={selClient} onChange={e=>setSelClient(e.target.value)}><option value="">-- Select --</option>{aclLeads.map(l=><option key={l.id}>{l.name}</option>)}</select></Fld>
          <Fld label="Variable 1"><input style={S.inp} value={v1} onChange={e=>setV1(e.target.value)} placeholder="Counselor / Date / Document"/></Fld>
          <Fld label="Variable 2"><input style={S.inp} value={v2} onChange={e=>setV2(e.target.value)} placeholder="Country / Amount"/></Fld>
          {client&&<div style={{background:"#f0fff4",borderRadius:10,padding:12,marginBottom:12,fontSize:12,color:"#1a5c2e",whiteSpace:"pre-wrap",lineHeight:1.6,border:"1px solid #a7f3d0"}}>{buildMsg()}</div>}
          {sent&&<Alert type="success" msg="✓ Sent and logged!"/>}
          <button onClick={send} disabled={!client} style={{...S.btn("#25d366"),width:"100%",justifyContent:"center",padding:12,opacity:client?1:0.5}}>📱 Open in WhatsApp & Send</button>
        </div>
      </div>
      <div style={S.card}>
        <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:14}}>Send History ({notifications.length})</div>
        {notifications.map(n=>(
          <div key={n.id} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid #f3f4f9"}}>
            <div style={{width:34,height:34,borderRadius:9,background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>💬</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:B.dark}}>{n.client_name} <span style={{color:"#7986cb",fontWeight:400}}>· {n.phone}</span></div><div style={{fontSize:11,color:"#5c6bc0",marginBottom:4}}>{n.trigger_event} · {n.sent_at}</div><div style={{fontSize:12,color:"#37474f",background:"#f8f9ff",borderRadius:6,padding:"6px 10px",whiteSpace:"pre-wrap",maxHeight:50,overflow:"hidden"}}>{n.message}</div></div>
          </div>
        ))}
        {notifications.length===0&&<div style={{textAlign:"center",color:"#9fa8da",padding:24}}>No messages sent yet.</div>}
      </div>
    </div>
  );
}

// ─── SETTINGS MODULE ──────────────────────────────────────────────────────────
function Settings({settingsDB,users,usersDB,currentUser}) {
  const [tab,setTab]=useState("company");
  const [saving,setSaving]=useState(false);
  const [msg,setMsg]=useState("");
  const [showAddUser,setShowAddUser]=useState(false);
  const [invForm,setInvForm]=useState({name:"",email:"",role:ROLES.COUNSELOR,branch:"Lahore (HQ)",password:""});
  if(currentUser.role!==ROLES.CEO)return <div style={{...S.card,textAlign:"center",padding:60,color:"#9fa8da"}}>🔒 Settings are CEO only.</div>;

  const getSetting=(key,def="")=>(settingsDB.data.find(s=>s.key===key)?.value)||def;

  const saveSetting=async(key,value)=>{
    const existing=settingsDB.data.find(s=>s.key===key);
    if(existing)await supabase.from("settings").update({value,updated_at:new Date().toISOString()}).eq("key",key);
    else await supabase.from("settings").insert({key,value});
    settingsDB.reload();
  };

  const saveAll=async(fields)=>{
    setSaving(true);
    for(const[k,v] of Object.entries(fields))await saveSetting(k,v);
    setSaving(false); setMsg("✓ Settings saved!"); setTimeout(()=>setMsg(""),3000);
  };

  // Company form state
  const [compForm,setCompForm]=useState({});
  useEffect(()=>{
    if(settingsDB.data.length>0){
      setCompForm({company_name:getSetting("company_name","Border and Bridges Pvt. Ltd."),company_tagline:getSetting("company_tagline","Immigration and Legal Consultants"),company_address:getSetting("company_address"),company_phone:getSetting("company_phone"),company_email:getSetting("company_email"),company_website:getSetting("company_website"),ntn_number:getSetting("ntn_number"),secp_number:getSetting("secp_number"),financial_year_start:getSetting("financial_year_start","2025-07-01"),financial_year_end:getSetting("financial_year_end","2026-06-30"),whatsapp_number:getSetting("whatsapp_number")});
    }
  },[settingsDB.data]);

  const createUser=async()=>{
    if(!invForm.name||!invForm.email||!invForm.password){setMsg("Please fill all fields.");return;}
    setMsg("Creating account…");
    const{data,error}=await supabase.auth.signUp({email:invForm.email,password:invForm.password});
    if(error){setMsg("Error: "+error.message);return;}
    if(data.user){
      const{error:e2}=await supabase.from("users").insert({id:data.user.id,name:invForm.name,email:invForm.email,role:invForm.role,branch:invForm.branch,active:true});
      if(e2)setMsg("Auth created but profile error: "+e2.message);
      else{setMsg("✓ Account created for "+invForm.name+". They must confirm their email before logging in.");usersDB.reload();setShowAddUser(false);setInvForm({name:"",email:"",role:ROLES.COUNSELOR,branch:"Lahore (HQ)",password:""});}
    }
  };

  const toggleUserActive=async(user)=>{
    await usersDB.update(user.id,{active:!user.active});
    setMsg(`✓ ${user.name} ${!user.active?"activated":"deactivated"}`);setTimeout(()=>setMsg(""),3000);
  };

  const TABS=[["company","Company Profile"],["users","Staff & Users"],["financial","Financial Settings"],["whatsapp","WhatsApp Config"],["branches","Branches"]];

  return (
    <div>
      <div style={{marginBottom:18}}><h2 style={S.h2}>Settings</h2><p style={S.sub}>Company profile · Staff · Financial year · WhatsApp · Branches</p></div>
      {msg&&<Alert type={msg.startsWith("Error")?"error":"success"} msg={msg}/>}
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {TABS.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"7px 16px",borderRadius:8,border:"2px solid",borderColor:tab===k?B.primary:"#c5cae9",background:tab===k?B.light:"#fff",color:tab===k?B.primary:"#5c6bc0",fontSize:13,fontWeight:700,cursor:"pointer"}}>{l}</button>)}
      </div>

      {tab==="company"&&(
        <div style={{...S.card,maxWidth:640}}>
          <div style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:18}}>Company Profile</div>
          <Fld label="Company Name"><input style={S.inp} value={compForm.company_name||""} onChange={e=>setCompForm({...compForm,company_name:e.target.value})}/></Fld>
          <Fld label="Tagline / Description"><input style={S.inp} value={compForm.company_tagline||""} onChange={e=>setCompForm({...compForm,company_tagline:e.target.value})}/></Fld>
          <Fld label="Address"><input style={S.inp} value={compForm.company_address||""} onChange={e=>setCompForm({...compForm,company_address:e.target.value})} placeholder="Full office address"/></Fld>
          <R2><Fld label="Phone"><input style={S.inp} value={compForm.company_phone||""} onChange={e=>setCompForm({...compForm,company_phone:e.target.value})}/></Fld><Fld label="Email"><input style={S.inp} value={compForm.company_email||""} onChange={e=>setCompForm({...compForm,company_email:e.target.value})}/></Fld></R2>
          <R2><Fld label="Website"><input style={S.inp} value={compForm.company_website||""} onChange={e=>setCompForm({...compForm,company_website:e.target.value})}/></Fld><Fld label="NTN Number"><input style={S.inp} value={compForm.ntn_number||""} onChange={e=>setCompForm({...compForm,ntn_number:e.target.value})}/></Fld></R2>
          <Fld label="SECP Registration Number"><input style={S.inp} value={compForm.secp_number||""} onChange={e=>setCompForm({...compForm,secp_number:e.target.value})}/></Fld>
          <button onClick={()=>saveAll(compForm)} disabled={saving} style={{...S.btn(),padding:"11px 24px"}}>{saving?"Saving…":"Save Company Profile"}</button>
        </div>
      )}

      {tab==="users"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,color:B.dark}}>Staff Members ({users.length})</div>
            <button style={S.btn()} onClick={()=>setShowAddUser(true)}>+ Add Staff Member</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
            {(users||[]).map(u=>(
              <div key={u.id} style={S.card}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <div style={{width:42,height:42,borderRadius:12,background:(roleC[u.role]||"#94a3b8")+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:roleC[u.role]||"#94a3b8"}}>{(u.name||"?").split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                  <Pill text={u.active?"Active":"Inactive"} color={u.active?"#065f46":"#64748b"} bg={u.active?"#d1fae5":"#f1f5f9"}/>
                </div>
                <div style={{fontWeight:800,fontSize:14,color:B.dark,marginBottom:2}}>{u.name}</div>
                <div style={{fontSize:12,color:"#9fa8da",marginBottom:10}}>{u.email}</div>
                <div style={{display:"flex",gap:6,marginBottom:12}}>
                  <Pill text={u.role} color={roleC[u.role]||"#64748b"} bg={(roleC[u.role]||"#64748b")+"18"}/>
                  <Pill text={(u.branch||"").split(" ")[0]} color="#5c6bc0" bg="#eef0fb"/>
                </div>
                {u.id!==currentUser.id&&<button onClick={()=>toggleUserActive(u)} style={{...S.ghost,width:"100%",justifyContent:"center",fontSize:12}}>{u.active?"Deactivate":"Reactivate"}</button>}
              </div>
            ))}
          </div>
          {showAddUser&&(
            <Modal title="Add Staff Member" onClose={()=>setShowAddUser(false)}>
              <Alert type="info" msg="Creates a real login. Staff member will receive a confirmation email — they must click it before they can log in."/>
              <Fld label="Full Name"><input style={S.inp} value={invForm.name} onChange={e=>setInvForm({...invForm,name:e.target.value})} placeholder="Full name"/></Fld>
              <Fld label="Email"><input style={S.inp} type="email" value={invForm.email} onChange={e=>setInvForm({...invForm,email:e.target.value})} placeholder="staff@borderandbridges.pk"/></Fld>
              <Fld label="Temporary Password"><input style={S.inp} type="password" value={invForm.password} onChange={e=>setInvForm({...invForm,password:e.target.value})} placeholder="Min 6 characters — they can change later"/></Fld>
              <R2><Fld label="Role"><select style={S.sel} value={invForm.role} onChange={e=>setInvForm({...invForm,role:e.target.value})}>{Object.values(ROLES).filter(r=>r!==ROLES.CEO).map(r=><option key={r}>{r}</option>)}</select></Fld><Fld label="Branch"><select style={S.sel} value={invForm.branch} onChange={e=>setInvForm({...invForm,branch:e.target.value})}>{BRANCHES_DEFAULT.map(b=><option key={b}>{b}</option>)}</select></Fld></R2>
              <button onClick={createUser} style={{...S.btn(),width:"100%",justifyContent:"center",padding:12}}>Create Account</button>
            </Modal>
          )}
        </div>
      )}

      {tab==="financial"&&(
        <div style={{...S.card,maxWidth:500}}>
          <div style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:18}}>Financial Year Settings</div>
          <Alert type="info" msg="The financial year determines your reporting period. All P&L and Balance Sheet reports use these dates."/>
          <R2>
            <Fld label="Financial Year Start"><input type="date" style={S.inp} value={compForm.financial_year_start||"2025-07-01"} onChange={e=>setCompForm({...compForm,financial_year_start:e.target.value})}/></Fld>
            <Fld label="Financial Year End"><input type="date" style={S.inp} value={compForm.financial_year_end||"2026-06-30"} onChange={e=>setCompForm({...compForm,financial_year_end:e.target.value})}/></Fld>
          </R2>
          <Fld label="Currency">
            <select style={S.sel} value={getSetting("currency","PKR")} onChange={e=>saveSetting("currency",e.target.value)}>
              <option value="PKR">PKR — Pakistani Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="AUD">AUD — Australian Dollar</option>
              <option value="CAD">CAD — Canadian Dollar</option>
            </select>
          </Fld>
          <button onClick={()=>saveAll({financial_year_start:compForm.financial_year_start,financial_year_end:compForm.financial_year_end})} disabled={saving} style={{...S.btn(),padding:"11px 24px"}}>{saving?"Saving…":"Save Financial Settings"}</button>
        </div>
      )}

      {tab==="whatsapp"&&(
        <div style={{...S.card,maxWidth:500}}>
          <div style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:18}}>WhatsApp Configuration</div>
          <Alert type="info" msg="This is where you will enter your WhatsApp Business API details when you connect WeTarseel or WAB2C. For now, enter your business WhatsApp number so it appears in client communications."/>
          <Fld label="Business WhatsApp Number"><input style={S.inp} value={compForm.whatsapp_number||""} onChange={e=>setCompForm({...compForm,whatsapp_number:e.target.value})} placeholder="+92 300 0000000"/></Fld>
          <Fld label="API Provider"><select style={S.sel} value={getSetting("whatsapp_provider","none")} onChange={e=>saveSetting("whatsapp_provider",e.target.value)}><option value="none">Not connected yet</option><option value="wetarseel">WeTarseel</option><option value="wab2c">WAB2C</option><option value="other">Other</option></select></Fld>
          <Fld label="API Key (from provider)"><input style={S.inp} value={getSetting("whatsapp_api_key","")} onChange={e=>saveSetting("whatsapp_api_key",e.target.value)} placeholder="Enter when you have API access" type="password"/></Fld>
          <button onClick={()=>saveAll({whatsapp_number:compForm.whatsapp_number})} disabled={saving} style={{...S.btn(),padding:"11px 24px"}}>{saving?"Saving…":"Save WhatsApp Settings"}</button>
        </div>
      )}

      {tab==="branches"&&(
        <div>
          <div style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:16}}>Branch Management</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
            {BRANCHES_DEFAULT.map(b=>(
              <div key={b} style={S.card}>
                <div style={{fontSize:15,fontWeight:800,color:B.dark,marginBottom:4}}>{b.split(" ")[0]}</div>
                <div style={{fontSize:12,color:"#9fa8da",marginBottom:10}}>{b}</div>
                <Pill text={b.includes("HQ")?"Headquarters":"Branch"} color={b.includes("HQ")?B.primary:"#5c6bc0"} bg={b.includes("HQ")?B.light:"#f8f9ff"}/>
                <div style={{marginTop:10,fontSize:12,color:"#5c6bc0"}}>Staff: {users.filter(u=>u.branch===b).length} members</div>
              </div>
            ))}
          </div>
          <div style={{...S.card,marginTop:14,background:"#f8f9ff",border:"1px dashed #c5cae9"}}>
            <div style={{fontSize:13,color:"#5c6bc0",textAlign:"center"}}>To add a new branch, contact technical support. Branch names are used across all modules and changing them requires a system update.</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BULK IMPORT ─────────────────────────────────────────────────────────────
function BulkImport({leadsDB,tasksDB,currentUser}) {
  const [step,setStep]=useState(1);
  const [rows,setRows]=useState([]);
  const [errors,setErrors]=useState([]);
  const [targetList,setTargetList]=useState("GCL");
  const [importing,setImporting]=useState(false);
  const [done,setDone]=useState(false);
  const [importCount,setImportCount]=useState(0);
  const fileRef=useRef();

  const dlTemplate=(list)=>{
    const hdrs="name,phone,email,country,source,branch,type,last_qualification,last_qualification_year,ielts_score,intake_target,issue,status,remarks,enquiry_date,notes";
    const samples={
      GCL:"Ahmed Raza,+923001234567,ahmed@email.com,🇬🇧 UK,WhatsApp,Lahore (HQ),B2C,Bachelor's Degree,2022,6.5,Sep 2026,IELTS pending,New,,2026-04-01,Interested in BSc CS",
      PCL:"Sara Khan,+923219876543,sara@email.com,🇨🇦 Canada,CEO Personal Reference,Lahore (HQ),B2C,Master's Degree,2021,,Jan 2027,,Active,,2026-03-15,MBA program",
      BCL:"Usman Tariq,+923335556677,usman@email.com,🇦🇺 Australia,Sub-Agent,Lahore (HQ),B2B,Bachelor's Degree,2020,7.0,Sep 2026,,Active,,Via Ali Brokers",
      ACL:"Fatima Malik,+923114443322,fatima@email.com,🇺🇸 USA,Existing Client Referral,Karachi,B2C,Bachelor's Degree,2021,7.5,Sep 2026,,Active,,F-1 visa in progress",
    };
    const csv=hdrs+"\n"+(samples[list]||samples.GCL);
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`bnb_import_${list.toLowerCase()}.csv`;a.click();
  };

  const parseFile=(e)=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const lines=ev.target.result.split("\n").filter(l=>l.trim());
      const hdrs=lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/ /g,"_"));
      const parsed=[];const errs=[];
      lines.slice(1).forEach((line,i)=>{
        // Handle quoted fields
        const cols=line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c=>c.replace(/^"|"$/g,"").trim());
        const obj={};hdrs.forEach((h,j)=>obj[h]=(cols[j]||"").trim());
        if(!obj.name){errs.push(`Row ${i+2}: Missing name — skipped`);return;}
        // All other fields optional — import with defaults if missing
        parsed.push(obj);
      });
      setRows(parsed);setErrors(errs);setStep(2);
    };
    reader.readAsText(file);
  };

  const confirmImport=async()=>{
    setImporting(true);
    const allLeads=rows.map((r,i)=>({
      name:(r.name||"").trim(),
      phone:(r.phone||"").trim()||"—",
      email:(r.email||"").trim(),
      country:(r.country||"").trim()||"🇬🇧 UK",
      source:(r.source||"").trim()||"Other",
      branch:(r.branch||"").trim()||currentUser.branch||"Lahore (HQ)",
      type:(r.type||"").trim()||"B2C",
      list:targetList,
      stage:targetList==="ACL"?"Pending Admission":targetList==="PCL"||targetList==="BCL"?"Pending Documents":"New Enquiry",
      score:3,
      consultation_done:targetList!=="GCL",
      agreement_signed:targetList==="ACL",
      payment_received:targetList==="ACL",
      invoice_generated:targetList==="ACL",
      all_doc_received:false,
      pending_approval:targetList==="GCL"&&currentUser.role!==ROLES.CEO,
      approved:targetList!=="GCL"||currentUser.role===ROLES.CEO,
      lost:false,last_contact:tod(),
      notes:(r.notes||"").trim()?[{id:Date.now()+i,text:r.notes.trim(),by:"Import",at:tod(),type:"Other"}]:[],
      docs:{},
      ielts_score:(r.ielts_score||"").trim()||null,
      intake_target:(r.intake_target||"").trim()||null,
      last_qualification:(r.last_qualification||"").trim()||null,
      last_qualification_year:(r.last_qualification_year||"").trim()||null,
      issue:(r.issue||"").trim()||null,
      status:(r.status||"").trim()||"New",
      remarks:(r.remarks||"").trim()||null,
      enquiry_date:(r.enquiry_date||r.date||"").trim()||tod(),
      agent_id:null,
    }));
    let totalInserted=0;
    const chunkSize=100;
    for(let i=0;i<allLeads.length;i+=chunkSize){
      const chunk=allLeads.slice(i,i+chunkSize);
      const {data,error}=await supabase.from("leads").insert(chunk).select("id,name");
      if(!error&&data){
        totalInserted+=data.length;
        if(targetList==="GCL"){
          const taskBatch=data.map(lead=>({title:`Follow up: ${lead.name} (imported)`,client_name:lead.name,lead_id:lead.id,assigned_to:currentUser.id,due_date:addDays(tod(),2),priority:"High",type:"Follow-up",auto_generated:true}));
          await supabase.from("tasks").insert(taskBatch);
        }
      }
    }
    await leadsDB.reload();
    setImportCount(totalInserted);
    setImporting(false);setDone(true);setStep(3);
  };

  const reset=()=>{setStep(1);setRows([]);setErrors([]);setDone(false);setImportCount(0);if(fileRef.current)fileRef.current.value="";};

  const [importMode,setImportMode]=useState("csv"); // csv | excel_acl
  return (
    <div>
      <div style={{marginBottom:18}}><h2 style={S.h2}>Import Clients</h2><p style={S.sub}>Import existing clients from CSV template or from your Excel sheet</p></div>
      {/* Mode switcher */}
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <button onClick={()=>setImportMode("csv")} style={{padding:"8px 20px",borderRadius:8,border:`2px solid ${importMode==="csv"?B.primary:"#c5cae9"}`,background:importMode==="csv"?B.light:"#fff",color:importMode==="csv"?B.primary:"#5c6bc0",fontSize:13,fontWeight:700,cursor:"pointer"}}>📄 CSV Import (All Lists)</button>
        <button onClick={()=>setImportMode("excel_acl")} style={{padding:"8px 20px",borderRadius:8,border:`2px solid ${importMode==="excel_acl"?"#059669":"#c5cae9"}`,background:importMode==="excel_acl"?"#d1fae5":"#fff",color:importMode==="excel_acl"?"#065f46":"#5c6bc0",fontSize:13,fontWeight:700,cursor:"pointer"}}>📊 Import ACL from Excel (56 clients)</button>
      </div>
      {importMode==="excel_acl"&&<ACLImport leadsDB={leadsDB} tasksDB={tasksDB} currentUser={currentUser}/>}
      {importMode==="csv"&&<div>

      {/* Step indicator */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:24}}>
        {[["1","Download Template"],["2","Upload & Review"],["3","Done"]].map(([n,l],i)=>(
          <div key={n} style={{display:"flex",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:8,background:step===i+1?B.light:step>i+1?"#d1fae5":"#f8f9ff",border:`2px solid ${step===i+1?B.primary:step>i+1?B.success:"#c5cae9"}`}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:step===i+1?B.primary:step>i+1?B.success:"#c5cae9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff"}}>{step>i+1?"✓":n}</div>
              <span style={{fontSize:12,fontWeight:700,color:step===i+1?B.primary:step>i+1?B.success:"#94a3b8"}}>{l}</span>
            </div>
            {i<2&&<div style={{width:20,height:2,background:step>i+1?B.success:"#e8eaf6"}}/>}
          </div>
        ))}
      </div>

      {step===1&&(
        <div style={S.card}>
          <div style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:6}}>Step 1 — Download the right template for your clients</div>
          <div style={{fontSize:13,color:"#5c6bc0",marginBottom:20}}>Each list has a slightly different template. Download the one that matches where your clients currently are.</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:20}}>
            {[
              {list:"GCL",color:listC.GCL,bg:listBg.GCL,desc:"New enquiries not yet assigned"},
              {list:"PCL",color:listC.PCL,bg:listBg.PCL,desc:"Active B2C prospects"},
              {list:"BCL",color:listC.BCL,bg:"#f5f3ff",desc:"Agent referral leads"},
              {list:"ACL",color:listC.ACL,bg:listBg.ACL,desc:"Paying active clients"},
            ].map(({list,color,bg,desc})=>(
              <div key={list} style={{background:bg,border:`2px solid ${color}30`,borderRadius:12,padding:14,textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:900,color,marginBottom:4}}>{list}</div>
                <div style={{fontSize:11,color:"#64748b",marginBottom:12,lineHeight:1.4}}>{desc}</div>
                <button onClick={()=>dlTemplate(list)} style={{...S.btn(color),width:"100%",justifyContent:"center",fontSize:11,padding:"7px 8px"}}>⬇️ Download</button>
              </div>
            ))}
          </div>
          <div style={{background:"#f8f9ff",borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:6}}>Only <strong>name</strong> is required — all other columns are optional:</div>
            <div style={{fontFamily:"monospace",fontSize:11,color:"#475569",background:"#e8eaf6",borderRadius:6,padding:"8px 12px"}}>name*, phone, email, country, source, branch, type, last_qualification, last_qualification_year, ielts_score, intake_target, issue, status, remarks, enquiry_date, notes</div>
          </div>
          <Alert type="info" msg="Open the downloaded file in Excel. Fill in your client data. Save as CSV (File → Save As → CSV UTF-8). Then click Next."/>
          <button onClick={()=>setStep(2)} style={{...S.btn(),padding:"10px 24px"}}>Next: Upload File →</button>
        </div>
      )}

      {step===2&&(
        <div style={S.card}>
          <div style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:14}}>Step 2 — Upload your file</div>
          {/* BIG VISIBLE TARGET LIST SELECTOR */}
          <div style={{background:listBg[targetList]||"#f8f9ff",border:`2px solid ${listC[targetList]||"#c5cae9"}`,borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"#5c6bc0",textTransform:"uppercase",marginBottom:10}}>⚠️ Step 1 — Select which list to import into (IMPORTANT)</div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {["GCL","PCL","BCL","ACL"].map(l=>(
                <button key={l} onClick={()=>setTargetList(l)} style={{padding:"12px 24px",borderRadius:10,border:`3px solid ${l===targetList?listC[l]:"#e8eaf6"}`,background:l===targetList?listC[l]:"#fff",color:l===targetList?"#fff":listC[l]||"#5c6bc0",fontSize:16,fontWeight:900,cursor:"pointer",minWidth:100}}>
                  {l}
                  <div style={{fontSize:10,fontWeight:400,marginTop:2}}>{l==="GCL"?"New Enquiries":l==="PCL"?"Potential":l==="BCL"?"B2B/Agent":"Active Clients"}</div>
                </button>
              ))}
            </div>
            <div style={{marginTop:12,fontSize:14,fontWeight:800,color:listC[targetList]}}>
              ✓ Currently selected: <span style={{textDecoration:"underline"}}>{targetList} — {targetList==="GCL"?"New Enquiries":targetList==="PCL"?"Potential Clients":targetList==="BCL"?"B2B Agent Leads":"Active Paying Clients"}</span>
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <Fld label="Step 2 — Upload your CSV file"><input ref={fileRef} type="file" accept=".csv" onChange={parseFile} style={{fontSize:13}}/></Fld>
          </div>
          {errors.length>0&&(
            <div style={{marginBottom:14,background:"#fce4ec",borderRadius:8,padding:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"#dc2626",marginBottom:6}}>⚠️ {errors.length} warning(s) — these rows were skipped:</div>
              {errors.map((e,i)=><div key={i} style={{fontSize:11,color:"#dc2626",padding:"2px 0"}}>{e}</div>)}
            </div>
          )}
          {rows.length>0&&(
            <>
              <Alert type="success" msg={`${rows.length} valid rows found. Review below then confirm.`}/>
              <div style={{maxHeight:260,overflowY:"auto",marginBottom:14,border:"1px solid #e8eaf6",borderRadius:8}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{position:"sticky",top:0}}>{["#","Name","Phone","Country","Source","IELTS","Intake"].map(h=><th key={h} style={{...S.th,fontSize:10}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {rows.map((r,i)=>(
                      <tr key={i} style={{background:i%2===0?"#fff":"#f8f9ff"}}>
                        <td style={{...S.td,fontSize:11,color:"#9fa8da"}}>{i+1}</td>
                        <td style={{...S.td,fontWeight:700}}>{r.name}</td>
                        <td style={S.td}>{r.phone}</td>
                        <td style={S.td}>{r.country||"🇬🇧 UK"}</td>
                        <td style={{...S.td,fontSize:11}}>{r.source||"Other"}</td>
                        <td style={S.td}>{r.ielts_score||"—"}</td>
                        <td style={S.td}>{r.intake_target||"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {targetList==="ACL"&&<Alert type="warn" msg="ACL import marks agreement, payment & invoice as done. Only import clients who have actually paid."/>}
              {targetList==="GCL"&&<Alert type="info" msg="GCL leads enter pending approval. CEO must assign counselors. 2-day follow-up tasks created automatically."/>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <button onClick={reset} style={S.ghost}>← Start Over</button>
                <button onClick={()=>setStep(3)} style={{...S.btn(),padding:"10px 24px"}}>Confirm & Import {rows.length} Leads →</button>
              </div>
            </>
          )}
          {rows.length===0&&!fileRef.current?.value&&(
            <div style={{textAlign:"center",color:"#9fa8da",padding:32,fontSize:13}}>Upload a CSV file to preview your data.</div>
          )}
        </div>
      )}

      {step===3&&!done&&(
        <div style={S.card}>
          <div style={{background:listBg[targetList],border:`2px solid ${listC[targetList]}`,borderRadius:10,padding:"12px 20px",marginBottom:20,fontSize:16,fontWeight:900,color:listC[targetList],textAlign:"center"}}>
            ⚠️ You are about to import {rows.length} records into: <span style={{fontSize:20,textDecoration:"underline"}}>{targetList}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            <div style={{background:"#f8f9ff",borderRadius:10,padding:14,textAlign:"center"}}><div style={{fontSize:11,color:"#9fa8da",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Records</div><div style={{fontSize:24,fontWeight:900,color:B.primary}}>{rows.length}</div></div>
            <div style={{background:"#f8f9ff",borderRadius:10,padding:14,textAlign:"center"}}><div style={{fontSize:11,color:"#9fa8da",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Target List</div><div style={{fontSize:20,fontWeight:900,color:listC[targetList]}}>{targetList}</div></div>
            <div style={{background:"#f8f9ff",borderRadius:10,padding:14,textAlign:"center"}}><div style={{fontSize:11,color:"#9fa8da",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Auto Tasks</div><div style={{fontSize:24,fontWeight:900,color:B.secondary}}>{targetList==="GCL"?rows.length:0}</div></div>
          </div>
          <Alert type="warn" msg="This will create real records in your database. This cannot be undone easily."/>
          <div style={{display:"flex",gap:10,justifyContent:"space-between"}}>
            <button onClick={()=>setStep(2)} style={S.ghost}>← Back</button>
            <button onClick={confirmImport} disabled={importing} style={{...S.btn(B.success),padding:"11px 28px",fontSize:14,opacity:importing?0.7:1}}>{importing?`Importing… please wait`:"✓ Confirm Import"}</button>
          </div>
        </div>
      )}

      {done&&(
        <div style={{...S.card,textAlign:"center",padding:48}}>
          <div style={{fontSize:48,marginBottom:16}}>🎉</div>
          <div style={{fontSize:22,fontWeight:900,color:B.success,marginBottom:8}}>{importCount} leads imported successfully!</div>
          <div style={{fontSize:13,color:"#5c6bc0",marginBottom:24}}>
            All records are now in <strong style={{color:listC[targetList]}}>{targetList}</strong>.{" "}
            {targetList==="GCL"?"Go to Leads Pipeline → GCL to assign counselors.":targetList==="ACL"?"Go to Active Cases to manage them.":"Go to Leads Pipeline to continue nurturing."}
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={reset} style={S.ghost}>Import Another File</button>
            <button onClick={()=>window.location.reload()} style={S.btn()}>Go to Dashboard</button>
          </div>
        </div>
      )}
    </div>}
    </div>
  );
}

// ─── PROCESSING MODULE ───────────────────────────────────────────────────────
function Processing({leads,leadsDB,tasksDB,users,invoices:invoicesProp,currentUser}) {
  const toast=useToast();
  const [search,setSearch]=useState("");
  const [caseFile,setCaseFile]=useState(null);
  const [showLogForm,setShowLogForm]=useState(false);
  const [logForm,setLogForm]=useState({type:"Processing",text:"",date:tod()});
  const [sel,setSel]=useState(null);
  const [filterCountry,setFilterCountry]=useState("All");
  const [filterStage,setFilterStage]=useState("All");
  const [showReminderModal,setShowReminderModal]=useState(false);
  const [reminderForm,setReminderForm]=useState({date:"",note:""});

  // Only ACL leads go to processing
  const cases=useMemo(()=>{
    let list=leads.filter(l=>l.list==="ACL"&&!l.lost);
    if(currentUser.role===ROLES.PROCESSING)list=list.filter(l=>l.assigned_to===currentUser.id||l.processing_officer===currentUser.id);
    if(filterCountry!=="All")list=list.filter(l=>l.country===filterCountry||getCountryKey(l.country)===getCountryKey(filterCountry));
    if(filterStage==="All"){}
    else if(filterStage==="doc")list=list.filter(l=>l.stage?.toLowerCase().includes("doc"));
    else if(filterStage==="offer")list=list.filter(l=>l.stage?.toLowerCase().includes("offer")||l.stage?.toLowerCase().includes("conditional"));
    else if(filterStage==="fee")list=list.filter(l=>l.stage?.toLowerCase().includes("fee"));
    else if(filterStage==="visa filed")list=list.filter(l=>l.stage?.toLowerCase().includes("visa filed"));
    else if(filterStage==="visa approved")list=list.filter(l=>l.stage?.toLowerCase().includes("visa approved")||l.stage?.toLowerCase().includes("visa won"));
    else list=list.filter(l=>l.stage===filterStage);
    if(search.trim()){const q=search.toLowerCase();list=list.filter(l=>(l.name||"").toLowerCase().includes(q));}
    return list;
  },[leads,currentUser,filterCountry,filterStage,search]);

  const countries=["All",...new Set(leads.filter(l=>l.list==="ACL").map(l=>l.country))];
  const stagesForFilter=filterCountry==="All"?["All"]:["All",...(getStages(filterCountry)||[])];

  // Stage stats
  const stageStats={};
  leads.filter(l=>l.list==="ACL"&&!l.lost).forEach(l=>{
    if(!stageStats[l.stage])stageStats[l.stage]=0;
    stageStats[l.stage]++;
  });

  const changeStage=async(lead,ns)=>{
    // Invoice gate — warn but allow processing to proceed (CEO can override)
    const VISA_STAGES=["Visa Filed","PR Application Submitted","Study Permit Application Prepared","Residence Permit Application Prepared","Student Visa Application Prepared","Job Seeker Visa Filed","Chancenkarte Application Filed"];
    if(VISA_STAGES.includes(ns)){
      const clientInvoices=(invoicesProp||[]).filter(i=>i.client_name===lead.name);
      const totalPaid=clientInvoices.reduce((a,i)=>a+(i.paid||0),0);
      const totalBilled=clientInvoices.reduce((a,i)=>a+(i.amount||0),0);
      if(totalBilled===0){
        const proceed=window.confirm(`⚠️ No Invoice Found

${lead.name} has no invoice on record.

It is recommended to create an invoice before filing.

Proceed anyway?`);
        if(!proceed)return;
      } else if(totalPaid<totalBilled*0.5){
        const proceed=window.confirm(`⚠️ Payment Incomplete

${lead.name} has only paid ${Math.round((totalPaid/totalBilled)*100)}% of the invoice.

Proceed to "${ns}" anyway?`);
        if(!proceed)return;
      }
    }
    await leadsDB.update(lead.id,{stage:ns});
    const taskTitle=`${lead.name}: Stage → "${ns}"`;
    await tasksDB.insert({title:taskTitle,client_name:lead.name,lead_id:lead.id,assigned_to:lead.assigned_to||currentUser.id,due_date:tod(),priority:"High",type:"Processing",auto_generated:true});
    setSel(p=>p?{...p,stage:ns}:p);
    // Add auto-log entry to lead notes
    const stageNote={id:Date.now(),text:`Stage changed to: "${ns}"`,by:currentUser.name,at:new Date().toLocaleString(),type:"Processing",date:tod()};
    const updatedNotes=[...(lead.notes||[]),stageNote];
    await leadsDB.update(lead.id,{notes:updatedNotes});
    setSel(p=>p?{...p,notes:updatedNotes}:p);
  };

  const toggleDoc=async(lead,doc)=>{
    const docs={...(lead.docs||{}),[`doc_${doc}`]:!lead.docs?.[`doc_${doc}`]};
    await leadsDB.update(lead.id,{docs});
    setSel(p=>p?{...p,docs}:p);
  };

  const addProcessingReminder=async()=>{
    if(!sel||!reminderForm.date)return;
    const reminders=[...(sel.processing_reminders||[]),{id:Date.now(),date:reminderForm.date,note:reminderForm.note,by:currentUser.name,done:false}];
    await leadsDB.update(sel.id,{processing_reminders:reminders});
    setSel(p=>({...p,processing_reminders:reminders}));
    // Create task
    await tasksDB.insert({title:`Reminder: ${sel.name} — ${reminderForm.note||"Processing follow-up"}`,client_name:sel.name,lead_id:sel.id,assigned_to:currentUser.id,due_date:reminderForm.date,priority:"High",type:"Processing",auto_generated:true});
    setReminderForm({date:"",note:""});setShowReminderModal(false);
  };

  // Key processing stats
  const docsRequested=leads.filter(l=>l.list==="ACL"&&l.stage==="Documents Requested").length;
  const offerLetterRec=leads.filter(l=>l.list==="ACL"&&(l.stage||"").includes("Offer Letter")).length;
  const visaFiled=leads.filter(l=>l.list==="ACL"&&(l.stage||"").includes("Visa Filed")).length;
  const visaWon=leads.filter(l=>l.stage==="Visa Approved"||l.stage==="PR Approved").length;
  const feePaid=leads.filter(l=>l.list==="ACL"&&(l.stage||"").toLowerCase().includes("fee paid")).length;

  return (
    <div>
      <div style={{marginBottom:18}}><h2 style={S.h2}>Processing Department</h2><p style={S.sub}>{cases.length} active cases · Full stage tracking & document control</p></div>

      {/* Key Stats — clickable filters */}
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
        <button onClick={()=>{
          const cols=["Name","Country","University","Intake","Stage","Start Date","Docs Status"];
          const rows=cases.map(l=>[l.name,l.country||"",l.university||"",l.intake||"",l.stage||"",l.created_at?.slice(0,10)||"",(getDocs(l.country)||[]).filter(d=>l.docs?.[`doc_${d}`]).length+"/"+(getDocs(l.country)||[]).length]);
          const csv=[cols,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
          const blob=new Blob([csv],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`acl-clients-${tod()}.csv`;a.click();
        }} style={{...S.ghost,fontSize:11,padding:"6px 12px"}}>📥 Export ACL CSV</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginBottom:20}}>
        {[
          {label:"Total ACL Cases",value:leads.filter(l=>l.list==="ACL"&&!l.lost).length,color:B.primary,icon:"📋",filter:"All"},
          {label:"Docs Requested",value:docsRequested,color:B.warn,icon:"📄",filter:"doc"},
          {label:"Offer Letter Recd",value:offerLetterRec,color:B.secondary,icon:"🎓",filter:"offer"},
          {label:"Fee Paid",value:feePaid,color:"#7c3aed",icon:"💳",filter:"fee"},
          {label:"Visa Filed",value:visaFiled,color:B.accent,icon:"✈️",filter:"visa filed"},
          {label:"Visa WON",value:visaWon,color:B.success,icon:"🎉",filter:"visa approved"},
        ].map(({label,value,color,icon,filter})=>(
          <div key={label} onClick={()=>setFilterStage(prev=>prev===filter?"All":filter)}
            style={{...S.card,cursor:"pointer",borderLeft:`4px solid ${filterStage===filter?color:"#e8eaf6"}`,background:filterStage===filter?"#f8f9ff":"#fff",transition:"border 0.2s"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:4}}>{icon} {label}</div>
            <div style={{fontSize:24,fontWeight:900,color}}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input style={{...S.inp,width:220,margin:0}} placeholder="🔍 Search client name…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{...S.sel,width:180}} value={filterCountry} onChange={e=>{setFilterCountry(e.target.value);setFilterStage("All");}}>
          {countries.map(c=><option key={c}>{c}</option>)}
        </select>
        <select style={{...S.sel,width:220}} value={filterStage} onChange={e=>setFilterStage(e.target.value)}>
          {stagesForFilter.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Stage quick summary */}
      {Object.keys(stageStats).length>0&&(
        <div style={{...S.card,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:10}}>Stage Distribution</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.entries(stageStats).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([stage,count])=>(
              <div key={stage} onClick={()=>setFilterStage(stage===filterStage?"All":stage)} style={{padding:"4px 12px",borderRadius:20,background:filterStage===stage?B.primary:B.light,color:filterStage===stage?"#fff":B.primary,fontSize:11,fontWeight:700,cursor:"pointer"}}>{stage}: {count}</div>
            ))}
          </div>
        </div>
      )}

      {/* Cases table */}
      <div style={{...S.card,overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:1100}}>
          <thead><tr>{["#","Date Added","Client","Country","University","Intake","Current Stage","Docs","Officer",""].map(h=><th key={h} style={{...S.th,fontSize:11}}>{h}</th>)}</tr></thead>
          <tbody>
            {cases.map((lead,idx)=>{
              const officer=users.find(u=>u.id===lead.assigned_to);
              const docList=PROCESSING_DOCS[lead.country]||[];
              const docDone=docList.filter(d=>lead.docs?.[`doc_${d}`]).length;
              const pendingReminders=(lead.processing_reminders||[]).filter(r=>!r.done&&r.date<=tod()).length;
              const stageIdx=getStages(lead.country).indexOf(lead.stage);
              const totalStages=getStages(lead.country).length;
              const progress=totalStages>0?Math.round((Math.max(stageIdx,0)/totalStages)*100):0;
              return (
                <tr key={lead.id}>
                  <td style={{...S.td,fontSize:11,color:"#9fa8da",fontWeight:700,maxWidth:30,textAlign:"center"}}>{idx+1}</td>
                  <td style={{...S.td,fontSize:11,whiteSpace:"nowrap"}}>{lead.created_at?.split("T")[0]||"—"}</td>
                  <td style={S.td}><div style={{fontWeight:700,color:B.dark}}>{lead.name}</div><div style={{fontSize:11,color:"#9fa8da"}}>{lead.phone}</div></td>
                  <td style={{...S.td,minWidth:70,maxWidth:100,fontSize:11,wordBreak:"break-word"}}>{lead.country}</td>
                  <td style={{...S.td,fontSize:11,maxWidth:120,whiteSpace:"normal",lineHeight:1.3}}>{lead.university||"—"}</td>
                  <td style={{...S.td,fontSize:11,whiteSpace:"nowrap",color:"#5c6bc0",fontWeight:600}}>{lead.intake||"—"}</td>
                  <td style={S.td}>
                    <Pill text={lead.stage||"—"} color="#37474f" bg="#f3f4f9"/>
                    <div style={{marginTop:6,background:"#eef0fb",borderRadius:4,height:5}}>
                      <div style={{background:B.primary,borderRadius:4,height:5,width:`${progress}%`}}/>
                    </div>
                    <div style={{fontSize:10,color:"#9fa8da",marginTop:2}}>{progress}% complete</div>
                  </td>
                  <td style={S.td}><span style={{fontSize:12,fontWeight:700,color:docDone===docList.length&&docList.length>0?B.success:B.warn}}>{docDone}/{docList.length}</span></td>
                  <td style={S.td}>{pendingReminders>0?<Pill text={`${pendingReminders} due`} color="#9b1c1c" bg="#fee2e2"/>:<span style={{fontSize:12,color:"#9fa8da"}}>—</span>}</td>
                  <td style={S.td}>{officer?.name?.split(" ")[0]||"—"}</td>
                  <td style={S.td}><button onClick={()=>{setSel({...lead});setLeadTab("overview");}} style={S.btn(B.secondary)}>Manage</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {cases.length===0&&<div style={{padding:32,textAlign:"center",color:"#9fa8da"}}>No ACL cases matching filters.</div>}
      </div>

      {/* Case Detail Modal */}
      {sel&&(
        <Modal title={`Processing: ${sel.name} · ${sel.country}`} onClose={()=>setSel(null)} w={720}>
          {/* Progress bar */}
          {(()=>{const stages=getStages(sel.country);const idx=stages.indexOf(sel.stage);const pct=stages.length>0?Math.round(((idx+1)/stages.length)*100):0;return(
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:"#5c6bc0",fontWeight:700}}>Processing Progress</span>
                <span style={{fontSize:12,fontWeight:800,color:B.primary}}>{pct}%</span>
              </div>
              <div style={{background:"#eef0fb",borderRadius:6,height:10}}>
                <div style={{background:B.grad,borderRadius:6,height:10,width:`${pct}%`,transition:"width 0.4s"}}/>
              </div>
              <div style={{fontSize:11,color:"#9fa8da",marginTop:4}}>Stage {Math.max(idx+1,1)} of {stages.length}: <strong>{sel.stage}</strong></div>
              <div style={{display:"flex",gap:16,marginTop:8,fontSize:11,color:"#5c6bc0"}}>
                {sel.university&&<span>🎓 {sel.university}</span>}
                {sel.intake&&<span>📅 Intake: {sel.intake}</span>}
                {sel.created_at&&<span>📌 Since: {sel.created_at?.slice(0,10)}</span>}
              </div>
            </div>
          );})()}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* Stage selector */}
            <div style={{...S.card,padding:14}}>
              <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:10}}>Move to Stage</div>
              <div style={{maxHeight:220,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
                {(getStages(sel.country)).map(stage=>(
                  <button key={stage} onClick={()=>changeStage(sel,stage)} style={{textAlign:"left",padding:"7px 10px",borderRadius:7,border:"1px solid",borderColor:sel.stage===stage?B.primary:"#e8eaf6",background:sel.stage===stage?B.light:"#f8f9ff",color:sel.stage===stage?B.primary:"#37474f",fontSize:11,fontWeight:sel.stage===stage?700:400,cursor:"pointer"}}>{stage}</button>
                ))}
              </div>
            </div>

            {/* Document checklist — split into received / pending */}
            <div style={{...S.card,padding:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:B.dark}}>Document Checklist</div>
                <div style={{display:"flex",gap:6}}>
                  {(()=>{const a=getDocs(sel.country)||[];const r=a.filter(d=>sel.docs?.[`doc_${d}`]);return(<><span style={{background:"#d1fae5",color:"#065f46",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>✅ {r.length}</span><span style={{background:"#fee2e2",color:"#dc2626",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>⏳ {a.length-r.length}</span></>);})()}
                </div>
              </div>
              <div style={{maxHeight:280,overflowY:"auto"}}>
                {(()=>{
                  const allDocs=getDocs(sel.country)||[];
                  const pending=allDocs.filter(d=>!sel.docs?.[`doc_${d}`]);
                  const received=allDocs.filter(d=>sel.docs?.[`doc_${d}`]);
                  return (<>
                    {pending.length>0&&(
                      <div style={{marginBottom:10}}>
                        <div style={{fontSize:10,fontWeight:800,color:"#dc2626",textTransform:"uppercase",marginBottom:6,padding:"3px 8px",background:"#fee2e2",borderRadius:6,display:"inline-block"}}>⏳ Pending — {pending.length}</div>
                        {pending.map(doc=><Chk key={doc} label={doc} checked={false} onChange={()=>toggleDoc(sel,doc)}/>)}
                      </div>
                    )}
                    {received.length>0&&(
                      <div>
                        <div style={{fontSize:10,fontWeight:800,color:"#059669",textTransform:"uppercase",marginBottom:6,padding:"3px 8px",background:"#d1fae5",borderRadius:6,display:"inline-block"}}>✅ Received — {received.length}</div>
                        {received.map(doc=><Chk key={doc} label={doc} checked={true} onChange={()=>toggleDoc(sel,doc)}/>)}
                      </div>
                    )}
                    {allDocs.length===0&&<div style={{fontSize:12,color:"#9fa8da",textAlign:"center",padding:12}}>No documents configured for this country.</div>}
                  </>);
                })()}
              </div>
            </div>
          </div>

          {/* Reminders */}
          <div style={{...S.card,padding:14,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:B.dark}}>Processing Reminders</div>
              <button onClick={()=>setShowReminderModal(true)} style={{...S.btn("#7c3aed"),fontSize:11,padding:"5px 12px"}}>+ Set Reminder</button>
            </div>
            {(sel.processing_reminders||[]).length===0&&<div style={{fontSize:12,color:"#9fa8da"}}>No reminders set. Add one to track follow-ups.</div>}
            {(sel.processing_reminders||[]).map((r,i)=>(
              <div key={r.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f3f4f9"}}>
                <div><span style={{fontSize:12,color:r.date<=tod()&&!r.done?"#dc2626":B.dark,fontWeight:700}}>{r.date}</span>{r.note&&<span style={{fontSize:12,color:"#5c6bc0",marginLeft:8}}>{r.note}</span>}</div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:10,color:"#9fa8da"}}>by {r.by}</span>
                  {!r.done&&<button onClick={async()=>{const rems=(sel.processing_reminders||[]).map((x,j)=>j===i?{...x,done:true}:x);await leadsDB.update(sel.id,{processing_reminders:rems});setSel(p=>({...p,processing_reminders:rems}));}} style={{...S.ghost,fontSize:10,padding:"3px 8px",color:B.success,borderColor:B.success}}>Done</button>}
                  {r.done&&<Pill text="✓ Done" color="#065f46" bg="#d1fae5"/>}
                </div>
              </div>
            ))}
          </div>

          {showReminderModal&&(
            <div style={{background:"#f8f9ff",borderRadius:10,padding:14,marginBottom:14,border:"1px solid #c5cae9"}}>
              <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:10}}>Set New Reminder</div>
              <R2>
                <Fld label="Reminder Date"><input type="date" style={S.inp} value={reminderForm.date} onChange={e=>setReminderForm({...reminderForm,date:e.target.value})}/></Fld>
                <Fld label="Note"><input style={S.inp} value={reminderForm.note} onChange={e=>setReminderForm({...reminderForm,note:e.target.value})} placeholder="What to follow up on…"/></Fld>
              </R2>
              <div style={{display:"flex",gap:8}}>
                <button onClick={addProcessingReminder} style={S.btn("#7c3aed")}>Save Reminder & Create Task</button>
                <button onClick={()=>setShowReminderModal(false)} style={S.ghost}>Cancel</button>
              </div>
            </div>
          )}

          {/* Communication Log inside Processing */}
          <div style={{...S.card,padding:14,marginBottom:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:B.dark}}>📞 Full Communication Log</div>
              <button onClick={()=>setShowLogForm(p=>!p)} style={{...S.btn("#1a91c7"),fontSize:11,padding:"4px 12px"}}>+ Add Entry</button>
            </div>
            {showLogForm&&(
              <div style={{background:"#f0f9ff",borderRadius:10,padding:14,marginBottom:14}}>
                <R2>
                  <Fld label="Type">
                    <select style={S.sel} value={logForm.type} onChange={e=>setLogForm({...logForm,type:e.target.value})}>
                      {["Call","WhatsApp","Email","Walk-in","Processing","Other"].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </Fld>
                  <Fld label="Date"><input type="date" style={S.inp} value={logForm.date} onChange={e=>setLogForm({...logForm,date:e.target.value})}/></Fld>
                </R2>
                <Fld label="Note">
                  <textarea style={{...S.inp,minHeight:70,resize:"vertical"}} value={logForm.text} onChange={e=>setLogForm({...logForm,text:e.target.value})} placeholder="What happened? What was discussed?"/>
                </Fld>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={async()=>{
                    if(!logForm.text.trim())return;
                    const note={id:Date.now(),text:logForm.text.trim(),by:currentUser.name,at:new Date().toLocaleString(),type:logForm.type,date:logForm.date};
                    const updated=[...(sel.notes||[]),note];
                    await leadsDB.update(sel.id,{notes:updated,last_contact:tod()});
                    setSel(p=>({...p,notes:updated}));
                    setLogForm({type:"Processing",text:"",date:tod()});
                    setShowLogForm(false);
                  }} style={{...S.btn("#1a91c7"),padding:"7px 16px"}}>Save Entry</button>
                  <button onClick={()=>setShowLogForm(false)} style={S.ghost}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{maxHeight:220,overflowY:"auto"}}>
              {[...(sel.notes||[])].reverse().map(note=>{
                const typeColors={Call:{c:"#059669",bg:"#d1fae5",icon:"📞"},WhatsApp:{c:"#25d366",bg:"#dcfce7",icon:"💬"},Email:{c:"#1a91c7",bg:"#dbeafe",icon:"📧"},"Walk-in":{c:"#7c3aed",bg:"#ede9fe",icon:"🚶"},Other:{c:"#64748b",bg:"#f1f5f9",icon:"📝"},Processing:{c:"#1a91c7",bg:"#dbeafe",icon:"⚙️"}};
                const tc=typeColors[note.type]||typeColors.Other;
                return (
                  <div key={note.id} style={{display:"flex",gap:10,marginBottom:8,paddingBottom:8,borderBottom:"1px solid #f3f4f9"}}>
                    <div style={{width:30,height:30,borderRadius:8,background:tc.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{tc.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <div style={{display:"flex",gap:6,alignItems:"center"}}><Pill text={note.type} color={tc.c} bg={tc.bg}/><span style={{fontSize:11,fontWeight:700,color:B.primary}}>{note.by}</span></div>
                        <span style={{fontSize:10,color:"#9fa8da"}}>{note.at}</span>
                      </div>
                      <div style={{fontSize:12,color:"#37474f"}}>{note.text}</div>
                    </div>
                  </div>
                );
              })}
              {!(sel?.notes||[]).length&&<div style={{color:"#9fa8da",fontSize:12,textAlign:"center",padding:16}}>No communication logged yet for this client.</div>}
            </div>
            <div style={{marginTop:10,fontSize:11,color:"#9fa8da",background:"#f8f9ff",padding:"8px 12px",borderRadius:8}}>💡 Communication logs are added from the Leads Pipeline. All counselor and processing notes appear here.</div>
          </div>
        </Modal>
      )}
      {caseFile&&<CaseFileModal lead={caseFile} leadsDB={leadsDB} tasksDB={tasksDB} invoices={invoicesProp||[]} users={users} currentUser={currentUser} onClose={()=>setCaseFile(null)}/>}
    </div>
  );
}

// ─── REPORTING MODULE ─────────────────────────────────────────────────────────
function Reporting({leads,tasks,invoices,users,currentUser,setPage}) {
  const [tab,setTab]=useState("executive");
  const [printMode,setPrintMode]=useState(false);
  const [selMonth,setSelMonth]=useState(tod().slice(0,7));
  const [selCounselor,setSelCounselor]=useState("all");

  // ── Helpers ──────────────────────────────────────────────
  const months = [...new Set(leads.map(l=>l.created_at?.slice(0,7)).filter(Boolean))].sort().reverse().slice(0,12);
  const allStaff = users.filter(u=>u.active);
  const counselors = users.filter(u=>(u.role===ROLES.COUNSELOR||u.role===ROLES.BRANCH_MANAGER)&&u.active);
  const now = tod();
  const thisMonth = now.slice(0,7);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth()-1)).toISOString().slice(0,7);

  const leadsThisMonth = leads.filter(l=>l.created_at?.slice(0,7)===selMonth);
  const aclLeads = leads.filter(l=>l.list==="ACL"&&!l.lost);
  const lostLeads = leads.filter(l=>l.lost);
  const totalInvoiced = invoices.reduce((a,i)=>a+(i.amount||0),0);
  const totalCollected = invoices.reduce((a,i)=>a+(i.paid||0),0);
  const outstanding = totalInvoiced - totalCollected;
  const openTasks = tasks.filter(t=>!t.done);
  const overdueTasks = tasks.filter(t=>!t.done&&t.due_date<now);
  const wonLeads = leads.filter(l=>l.stage==="Visa Approved"||l.stage==="Visa WON"||l.stage==="PR Approved");
  const rejectedLeads = leads.filter(l=>l.stage==="Visa Rejected");

  // Country stats
  const countryStats = [...new Set(aclLeads.map(l=>l.country).filter(Boolean))].map(country=>({
    country,
    count:aclLeads.filter(l=>l.country===country).length,
    won:wonLeads.filter(l=>l.country===country).length,
    rejected:rejectedLeads.filter(l=>l.country===country).length,
  })).sort((a,b)=>b.count-a.count);

  // Source stats
  const sourceStats = [...new Set(leads.map(l=>l.source).filter(Boolean))].map(src=>({
    src,
    total:leads.filter(l=>l.source===src).length,
    acl:leads.filter(l=>l.source===src&&l.list==="ACL").length,
    lost:leads.filter(l=>l.source===src&&l.lost).length,
  })).sort((a,b)=>b.total-a.total);

  // Counselor stats
  const counselorStats = counselors.map(c=>{
    const mine=leads.filter(l=>l.assigned_to===c.id);
    const acl=mine.filter(l=>l.list==="ACL").length;
    const won=mine.filter(l=>l.stage==="Visa Approved"||l.stage==="Visa WON").length;
    const lost=mine.filter(l=>l.lost).length;
    const myTasks=tasks.filter(t=>t.assigned_to===c.id);
    const doneTasks=myTasks.filter(t=>t.done).length;
    const overdue=myTasks.filter(t=>!t.done&&t.due_date<now).length;
    return {
      name:c.name,role:c.role,branch:c.branch,
      total:mine.length,gcl:mine.filter(l=>l.list==="GCL").length,
      pcl:mine.filter(l=>l.list==="PCL").length,acl,won,lost,
      convRate:mine.length>0?Math.round((acl/mine.length)*100):0,
      winRate:acl>0?Math.round((won/Math.max(acl,1))*100):0,
      tasks:myTasks.length,doneTasks,overdue,
      taskRate:myTasks.length>0?Math.round((doneTasks/myTasks.length)*100):0,
    };
  }).sort((a,b)=>b.acl-a.acl);

  // Monthly trend
  const monthlyTrend = months.slice(0,6).reverse().map(m=>({
    month:m,
    newLeads:leads.filter(l=>l.created_at?.slice(0,7)===m).length,
    acl:leads.filter(l=>l.list==="ACL"&&l.created_at?.slice(0,7)===m).length,
    revenue:invoices.filter(i=>i.created_at?.slice(0,7)===m).reduce((a,i)=>a+(i.paid||0),0),
  }));

  // Stage distribution for ACL
  const stageDistribution = [...new Set(aclLeads.map(l=>l.stage).filter(Boolean))].map(stage=>({
    stage,count:aclLeads.filter(l=>l.stage===stage).length
  })).sort((a,b)=>b.count-a.count);

  // Lost reasons
  const lostReasons = [...new Set(lostLeads.map(l=>l.lost_reason||l.remarks||"Unknown").filter(Boolean))].slice(0,8).map(r=>({
    reason:r.slice(0,40),count:lostLeads.filter(l=>(l.lost_reason||l.remarks||"Unknown").startsWith(r.slice(0,20))).length
  })).sort((a,b)=>b.count-a.count);

  // Invoice aging
  const invoiceAging = {
    current:invoices.filter(i=>!i.paid||(i.paid>=i.amount)).length,
    overdue30:invoices.filter(i=>i.paid<i.amount&&i.created_at&&Math.floor((new Date()-new Date(i.created_at))/(1000*60*60*24))<=30).length,
    overdue60:invoices.filter(i=>i.paid<i.amount&&i.created_at&&Math.floor((new Date()-new Date(i.created_at))/(1000*60*60*24))<=60).length,
    overdue90:invoices.filter(i=>i.paid<i.amount&&i.created_at&&Math.floor((new Date()-new Date(i.created_at))/(1000*60*60*24))>60).length,
  };

  // Print function
  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(()=>{ window.print(); setPrintMode(false); }, 300);
  };

  // PDF download (uses print dialog)
  const handlePDF = () => { alert("To save as PDF: open print dialog, change Destination to Save as PDF, click Save."); handlePrint(); };

  // ── Sub-components ────────────────────────────────────────
  const RCard=({title,value,sub,color="#2d3a8c",icon})=>(
    <div style={{background:"#fff",borderRadius:12,padding:"14px 16px",boxShadow:"0 2px 8px rgba(44,55,130,0.07)"}}>
      <div style={{fontSize:10,fontWeight:700,color:"#9fa8da",textTransform:"uppercase",marginBottom:4}}>{icon} {title}</div>
      <div style={{fontSize:24,fontWeight:900,color}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:"#9fa8da",marginTop:2}}>{sub}</div>}
    </div>
  );

  const RTable=({headers,rows,emptyMsg="No data"})=>(
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{background:"#f0f4ff"}}>{headers.map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontWeight:700,color:"#5c6bc0",fontSize:11,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.length===0?<tr><td colSpan={headers.length} style={{padding:24,textAlign:"center",color:"#9fa8da"}}>{emptyMsg}</td></tr>:
          rows.map((row,i)=><tr key={i} style={{borderBottom:"1px solid #f3f4f9",background:i%2===0?"#fff":"#fafbff"}}>{row.map((cell,j)=><td key={j} style={{padding:"8px 12px",color:"#37474f"}}>{cell}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );

  const BarChart=({data,labelKey,valueKey,color=B.primary,max})=>{
    const m=max||Math.max(...data.map(d=>d[valueKey]||0),1);
    return(
      <div>{data.slice(0,8).map((d,i)=>(
        <div key={i} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
            <span style={{fontSize:11,color:"#37474f",fontWeight:500}}>{d[labelKey]}</span>
            <span style={{fontSize:11,fontWeight:700,color}}>{d[valueKey]}</span>
          </div>
          <div style={{background:"#eef0fb",borderRadius:4,height:8}}>
            <div style={{background:color,borderRadius:4,height:8,width:`${Math.round(((d[valueKey]||0)/m)*100)}%`,transition:"width 0.4s"}}/>
          </div>
        </div>
      ))}</div>
    );
  };

  // ── Print styles ──────────────────────────────────────────
  const printStyle = printMode?{background:"#fff",color:"#000",padding:0}:{};

  const TABS = [
    {key:"executive",label:"📊 Executive"},
    {key:"counseling",label:"👥 Counseling"},
    {key:"processing",label:"🔄 Processing"},
    {key:"financial",label:"💰 Financial"},
    {key:"hr",label:"👤 HR & Staff"},
  ];

  return (
    <div style={printStyle}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-print-area, #report-print-area * { visibility: visible; }
          #report-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={S.h2}>📊 Reports & Analytics</h2>
          <p style={S.sub}>Performance analysis — Border and Bridges Pvt. Ltd.</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <select style={{...S.sel,width:"auto"}} value={selMonth} onChange={e=>setSelMonth(e.target.value)}>
            {months.map(m=><option key={m} value={m}>{m}</option>)}
          </select>
          <button onClick={handlePrint} style={{...S.btn("#475569"),fontSize:12,padding:"8px 16px"}}>🖨️ Print</button>
          <button onClick={handlePDF} style={{...S.btn(B.danger),fontSize:12,padding:"8px 16px"}}>📄 Save PDF</button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="no-print" style={{display:"flex",gap:4,marginBottom:20,borderBottom:"2px solid #eef0fb",flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{padding:"10px 16px",borderRadius:"8px 8px 0 0",border:"none",background:tab===t.key?B.primary:"transparent",color:tab===t.key?"#fff":"#5c6bc0",fontSize:13,fontWeight:tab===t.key?700:500,cursor:"pointer"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div id="report-print-area">
        {/* Print header */}
        {printMode&&(
          <div style={{borderBottom:"2px solid #2d3a8c",paddingBottom:12,marginBottom:20}}>
            <div style={{fontSize:20,fontWeight:900,color:"#1a2057"}}>Border and Bridges Pvt. Ltd.</div>
            <div style={{fontSize:13,color:"#5c6bc0"}}>{TABS.find(t=>t.key===tab)?.label} Report · Generated: {now} · By: {currentUser.name}</div>
          </div>
        )}

        {/* ── TAB 1: EXECUTIVE SUMMARY ─────────────────── */}
        {(tab==="executive"||printMode)&&(
          <div style={{marginBottom:32}}>
            {printMode&&<div style={{fontSize:16,fontWeight:800,color:"#1a2057",marginBottom:12}}>📊 Executive Summary</div>}

            {/* KPI Cards */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginBottom:20}}>
              <RCard icon="👥" title="Total Leads" value={leads.filter(l=>!l.lost).length} sub={`${leadsThisMonth.length} this month`} color={B.primary}/>
              <RCard icon="✈️" title="Visa Won" value={wonLeads.length} sub={`${rejectedLeads.length} rejected`} color={B.success}/>
              <RCard icon="💰" title="Revenue" value={`${Math.round(totalCollected/1000)}K`} sub={`PKR ${totalInvoiced.toLocaleString()} invoiced`} color={B.secondary}/>
              <RCard icon="📋" title="Active Cases" value={aclLeads.length} sub="ACL clients" color="#7c3aed"/>
              <RCard icon="⏳" title="Outstanding" value={`${Math.round(outstanding/1000)}K`} sub="PKR unpaid" color={outstanding>0?B.warn:B.success}/>
              <RCard icon="✅" title="Open Tasks" value={openTasks.length} sub={`${overdueTasks.length} overdue`} color={overdueTasks.length>0?B.danger:B.warn}/>
              <RCard icon="📉" title="Lost Leads" value={lostLeads.length} sub={`${leads.length>0?Math.round((lostLeads.length/leads.length)*100):0}% loss rate`} color={B.danger}/>
              <RCard icon="📈" title="Win Rate" value={`${aclLeads.length>0?Math.round((wonLeads.length/Math.max(aclLeads.length,1))*100):0}%`} sub="ACL to visa" color={B.accent}/>
            </div>

            {/* Pipeline + Monthly Trend */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div style={S.card}>
                <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📋 Pipeline Status</div>
                {["GCL","PCL","BCL","ACL"].map(list=>{
                  const count=leads.filter(l=>l.list===list&&!l.lost).length;
                  const pct=leads.length>0?Math.round((count/leads.length)*100):0;
                  return(<div key={list} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,fontWeight:700,color:listC[list]}}>{list}</span>
                      <span style={{fontSize:13,fontWeight:800,color:listC[list]}}>{count}</span>
                    </div>
                    <div style={{background:"#eef0fb",borderRadius:6,height:8}}>
                      <div style={{background:listC[list],borderRadius:6,height:8,width:`${pct}%`}}/>
                    </div>
                  </div>);
                })}
              </div>
              <div style={S.card}>
                <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📅 Monthly Trend (Last 6)</div>
                <RTable
                  headers={["Month","New Leads","Active","Revenue (K)"]}
                  rows={monthlyTrend.map(m=>[
                    m.month,
                    <span style={{fontWeight:700,color:B.primary}}>{m.newLeads}</span>,
                    <span style={{fontWeight:700,color:"#7c3aed"}}>{m.acl}</span>,
                    <span style={{fontWeight:700,color:B.success}}>PKR {Math.round(m.revenue/1000)}K</span>
                  ])}
                />
              </div>
            </div>

            {/* Pending actions */}
            <div style={S.card}>
              <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>⚠️ Pending Actions (CEO)</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                {[
                  {label:"Leads pending assignment",val:leads.filter(l=>l.pending_approval&&!l.approved).length,color:B.warn},
                  {label:"Overdue tasks",val:overdueTasks.length,color:B.danger},
                  {label:"Unpaid invoices",val:invoices.filter(i=>i.paid<i.amount).length,color:"#f59e0b"},
                  {label:"ACL docs incomplete",val:aclLeads.filter(l=>!l.all_doc_received).length,color:"#7c3aed"},
                ].map(({label,val,color})=>(
                  <div key={label} style={{background:val>0?"#fff7ed":"#f0fdf4",borderRadius:8,padding:"10px 14px",border:`1px solid ${val>0?"#fed7aa":"#bbf7d0"}`}}>
                    <div style={{fontSize:20,fontWeight:900,color}}>{val}</div>
                    <div style={{fontSize:11,color:"#5c6bc0"}}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: COUNSELING ─────────────────────────── */}
        {(tab==="counseling"||printMode)&&(
          <div style={{marginBottom:32}}>
            {printMode&&<div style={{fontSize:16,fontWeight:800,color:"#1a2057",margin:"20px 0 12px"}}>👥 Counseling Performance</div>}

            {/* Counselor performance table */}
            <div style={{...S.card,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>👥 Counselor Performance Report</div>
              <RTable
                headers={["Counselor","Branch","Total","GCL","PCL","ACL","Won","Lost","Conv%","Win%","Tasks","Overdue"]}
                rows={counselorStats.map(c=>[
                  <strong>{c.name}</strong>,
                  c.branch?.split(" ")[0]||"HQ",
                  c.total,c.gcl,c.pcl,
                  <span style={{fontWeight:700,color:"#7c3aed"}}>{c.acl}</span>,
                  <span style={{fontWeight:700,color:B.success}}>{c.won}</span>,
                  <span style={{color:c.lost>0?B.danger:"#9fa8da"}}>{c.lost}</span>,
                  <span style={{fontWeight:700,color:c.convRate>=20?B.success:c.convRate>=10?B.warn:B.danger}}>{c.convRate}%</span>,
                  <span style={{fontWeight:700,color:c.winRate>=50?B.success:B.warn}}>{c.winRate}%</span>,
                  c.tasks,
                  <span style={{color:c.overdue>0?B.danger:"#9fa8da",fontWeight:c.overdue>0?700:400}}>{c.overdue}</span>
                ])}
                emptyMsg="No counselors found"
              />
            </div>

            {/* Source Analysis */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div style={S.card}>
                <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>🔗 Source Analysis</div>
                <RTable
                  headers={["Source","Total","ACL","Lost","Conv%"]}
                  rows={sourceStats.slice(0,8).map(s=>[
                    s.src,s.total,
                    <span style={{color:"#7c3aed",fontWeight:700}}>{s.acl}</span>,
                    <span style={{color:s.lost>0?B.danger:"#9fa8da"}}>{s.lost}</span>,
                    <span style={{fontWeight:700,color:s.total>0&&s.acl/s.total>=0.2?B.success:B.warn}}>{s.total>0?Math.round((s.acl/s.total)*100):0}%</span>
                  ])}
                />
              </div>
              <div style={S.card}>
                <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📉 Lost Leads Analysis</div>
                <RTable
                  headers={["Reason","Count"]}
                  rows={lostReasons.map(r=>[r.reason,<span style={{fontWeight:700,color:B.danger}}>{r.count}</span>])}
                  emptyMsg="No lost leads"
                />
              </div>
            </div>

            {/* Monthly new leads */}
            <div style={S.card}>
              <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📅 Monthly Lead Intake ({selMonth})</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
                {["GCL","PCL","BCL","ACL"].map(list=>{
                  const count=leadsThisMonth.filter(l=>l.list===list).length;
                  return(
                    <div key={list} style={{background:B.light,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
                      <div style={{fontSize:22,fontWeight:900,color:listC[list]}}>{count}</div>
                      <div style={{fontSize:11,color:"#9fa8da",fontWeight:600}}>{list} this month</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: PROCESSING ─────────────────────────── */}
        {(tab==="processing"||printMode)&&(
          <div style={{marginBottom:32}}>
            {printMode&&<div style={{fontSize:16,fontWeight:800,color:"#1a2057",margin:"20px 0 12px"}}>🔄 Processing Report</div>}

            {/* Stage distribution */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div style={S.card}>
                <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📍 Stage Distribution (ACL)</div>
                <BarChart data={stageDistribution} labelKey="stage" valueKey="count" color={B.primary}/>
              </div>
              <div style={S.card}>
                <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>🌍 Country Distribution</div>
                <BarChart data={countryStats} labelKey="country" valueKey="count" color="#7c3aed"/>
              </div>
            </div>

            {/* Detailed processing table */}
            <div style={{...S.card,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📊 Processing Status by Country</div>
              <RTable
                headers={["Country","Total","Won","Rejected","Win Rate","Avg Docs"]}
                rows={countryStats.map(c=>{
                  const ctryLeads=aclLeads.filter(l=>l.country===c.country);
                  const docPct=ctryLeads.length>0?Math.round(ctryLeads.filter(l=>l.all_doc_received).length/ctryLeads.length*100):0;
                  return[
                    <strong>{c.country}</strong>,c.count,
                    <span style={{color:B.success,fontWeight:700}}>{c.won}</span>,
                    <span style={{color:B.danger}}>{c.rejected}</span>,
                    <span style={{fontWeight:700,color:c.count>0&&c.won/c.count>=0.5?B.success:B.warn}}>{c.count>0?Math.round((c.won/c.count)*100):0}%</span>,
                    <span style={{color:docPct>=80?B.success:B.warn}}>{docPct}% docs</span>
                  ];
                })}
                emptyMsg="No active cases"
              />
            </div>

            {/* Intake distribution */}
            <div style={S.card}>
              <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📅 Intake Distribution</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {[...new Set(aclLeads.map(l=>l.intake).filter(Boolean))].map(intake=>{
                  const count=aclLeads.filter(l=>l.intake===intake).length;
                  return(<div key={intake} style={{background:B.light,borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:800,color:B.primary}}>{count}</div>
                    <div style={{fontSize:11,color:"#9fa8da"}}>{intake}</div>
                  </div>);
                })}
                {aclLeads.filter(l=>!l.intake).length>0&&(
                  <div style={{background:"#fee2e2",borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
                    <div style={{fontSize:16,fontWeight:800,color:B.danger}}>{aclLeads.filter(l=>!l.intake).length}</div>
                    <div style={{fontSize:11,color:"#9fa8da"}}>No Intake Set</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: FINANCIAL ──────────────────────────── */}
        {(tab==="financial"||printMode)&&(
          <div style={{marginBottom:32}}>
            {printMode&&<div style={{fontSize:16,fontWeight:800,color:"#1a2057",margin:"20px 0 12px"}}>💰 Financial Report</div>}

            {/* Financial KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20}}>
              <RCard icon="💰" title="Total Invoiced" value={`PKR ${Math.round(totalInvoiced/1000)}K`} color={B.secondary}/>
              <RCard icon="✅" title="Collected" value={`PKR ${Math.round(totalCollected/1000)}K`} sub={`${totalInvoiced>0?Math.round((totalCollected/totalInvoiced)*100):0}% collection rate`} color={B.success}/>
              <RCard icon="⏳" title="Outstanding" value={`PKR ${Math.round(outstanding/1000)}K`} sub="Unpaid balance" color={outstanding>0?B.warn:B.success}/>
              <RCard icon="🧾" title="Total Invoices" value={invoices.length} sub={`${invoices.filter(i=>i.paid>=i.amount).length} fully paid`} color={B.primary}/>
            </div>

            {/* Revenue trend + Outstanding clients */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div style={S.card}>
                <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📈 Revenue Trend</div>
                <RTable
                  headers={["Month","Invoiced","Collected","Rate"]}
                  rows={months.slice(0,6).map(m=>({
                    m,
                    inv:invoices.filter(i=>i.created_at?.slice(0,7)===m).reduce((a,i)=>a+(i.amount||0),0),
                    paid:invoices.filter(i=>i.created_at?.slice(0,7)===m).reduce((a,i)=>a+(i.paid||0),0),
                  })).map(({m,inv,paid})=>[
                    m,
                    `PKR ${Math.round(inv/1000)}K`,
                    <span style={{color:B.success,fontWeight:700}}>PKR {Math.round(paid/1000)}K</span>,
                    <span style={{fontWeight:700,color:inv>0&&paid/inv>=0.8?B.success:B.warn}}>{inv>0?Math.round((paid/inv)*100):0}%</span>
                  ])}
                />
              </div>
              <div style={S.card}>
                <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📋 Invoice Aging</div>
                {[
                  {label:"Fully Paid",val:invoiceAging.current,color:B.success,bg:"#d1fae5"},
                  {label:"Overdue ≤30 days",val:invoiceAging.overdue30,color:B.warn,bg:"#fef3c7"},
                  {label:"Overdue ≤60 days",val:invoiceAging.overdue60,color:"#f59e0b",bg:"#fef9c3"},
                  {label:"Overdue >60 days",val:invoiceAging.overdue90,color:B.danger,bg:"#fee2e2"},
                ].map(({label,val,color,bg})=>(
                  <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:bg,borderRadius:8,marginBottom:6}}>
                    <span style={{fontSize:12,color:"#374151"}}>{label}</span>
                    <span style={{fontSize:16,fontWeight:800,color}}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Outstanding clients */}
            <div style={S.card}>
              <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>⚠️ Outstanding Payments</div>
              <RTable
                headers={["Client","Invoice Amount","Paid","Outstanding","Status"]}
                rows={invoices.filter(i=>i.paid<i.amount).slice(0,10).map(i=>[
                  i.client_name,
                  `PKR ${(i.amount||0).toLocaleString()}`,
                  <span style={{color:B.success}}>PKR {(i.paid||0).toLocaleString()}</span>,
                  <span style={{color:B.danger,fontWeight:700}}>PKR {((i.amount||0)-(i.paid||0)).toLocaleString()}</span>,
                  <Pill text={i.paid>0?"Partial":"Unpaid"} color={i.paid>0?"#854d0e":B.danger} bg={i.paid>0?"#fef3c7":"#fee2e2"}/>
                ])}
                emptyMsg="✅ No outstanding payments"
              />
            </div>
          </div>
        )}

        {/* ── TAB 5: HR & STAFF ─────────────────────────── */}
        {(tab==="hr"||printMode)&&(
          <div style={{marginBottom:32}}>
            {printMode&&<div style={{fontSize:16,fontWeight:800,color:"#1a2057",margin:"20px 0 12px"}}>👤 HR & Staff Report</div>}

            {/* Staff performance */}
            <div style={{...S.card,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>👤 Staff Performance Overview</div>
              <RTable
                headers={["Name","Role","Branch","Total Tasks","Done","Pending","Overdue","Completion%"]}
                rows={allStaff.map(u=>{
                  const myT=tasks.filter(t=>t.assigned_to===u.id);
                  const done=myT.filter(t=>t.done).length;
                  const pending=myT.filter(t=>!t.done).length;
                  const overdue=myT.filter(t=>!t.done&&t.due_date<now).length;
                  const rate=myT.length>0?Math.round((done/myT.length)*100):0;
                  return[
                    <strong>{u.name}</strong>,
                    <Pill text={u.role} color="#5c6bc0" bg="#eef0fb"/>,
                    u.branch?.split(" ")[0]||"HQ",
                    myT.length,
                    <span style={{color:B.success,fontWeight:700}}>{done}</span>,
                    pending,
                    <span style={{color:overdue>0?B.danger:"#9fa8da",fontWeight:overdue>0?700:400}}>{overdue}</span>,
                    <span style={{fontWeight:700,color:rate>=80?B.success:rate>=50?B.warn:B.danger}}>{rate}%</span>
                  ];
                })}
                emptyMsg="No staff found"
              />
            </div>

            {/* Daily Communication Tracker */}
            <div style={{...S.card,marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📞 Daily Communication Performance ({selMonth})</div>
              <RTable
                headers={["Staff","Role","Total Comms","Calls","WhatsApp","Emails","Walk-in","Avg/Day"]}
                rows={allStaff.map(u=>{
                  const allUserNotes=leads.flatMap(l=>(l.notes||[]).filter(n=>n.by===u.name));
                  const monthNotes=allUserNotes.filter(n=>(n.date||n.at?.slice(0,10))?.slice(0,7)===selMonth);
                  const calls=monthNotes.filter(n=>n.type==="Call").length;
                  const wa=monthNotes.filter(n=>n.type==="WhatsApp").length;
                  const email=monthNotes.filter(n=>n.type==="Email").length;
                  const walkin=monthNotes.filter(n=>n.type==="Walk-in").length;
                  const daysInMonth=new Date(selMonth.slice(0,4),selMonth.slice(5,7),0).getDate();
                  const avg=Math.round(monthNotes.length/daysInMonth*10)/10;
                  return[
                    <strong>{u.name}</strong>,
                    <Pill text={u.role} color="#5c6bc0" bg="#eef0fb"/>,
                    <span style={{fontWeight:700,color:B.primary}}>{monthNotes.length}</span>,
                    <span style={{color:"#059669",fontWeight:calls>0?700:400}}>{calls}</span>,
                    <span style={{color:"#25d366",fontWeight:wa>0?700:400}}>{wa}</span>,
                    <span style={{color:"#1a91c7",fontWeight:email>0?700:400}}>{email}</span>,
                    <span style={{color:"#7c3aed",fontWeight:walkin>0?700:400}}>{walkin}</span>,
                    <span style={{fontWeight:700,color:avg>=3?B.success:avg>=1?B.warn:B.danger}}>{avg}/day</span>
                  ];
                })}
              />
            </div>

            {/* Task breakdown by type */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={S.card}>
                <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📋 Tasks by Type</div>
                <RTable
                  headers={["Type","Total","Done","Pending"]}
                  rows={[...new Set(tasks.map(t=>t.type).filter(Boolean))].map(type=>({
                    type,
                    total:tasks.filter(t=>t.type===type).length,
                    done:tasks.filter(t=>t.type===type&&t.done).length,
                    pending:tasks.filter(t=>t.type===type&&!t.done).length,
                  })).sort((a,b)=>b.total-a.total).map(({type,total,done,pending})=>[
                    type,total,
                    <span style={{color:B.success}}>{done}</span>,
                    <span style={{color:pending>0?B.warn:"#9fa8da"}}>{pending}</span>
                  ])}
                />
              </div>
              <div style={S.card}>
                <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📊 Lead Assignment Distribution</div>
                <BarChart
                  data={counselorStats.map(c=>({name:c.name.split(" ")[0],total:c.total}))}
                  labelKey="name" valueKey="total" color={B.secondary}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityLog({currentUser}) {
  const logDB=useTable("audit_log",{orderBy:"created_at",asc:false});
  const [filterUser,setFilterUser]=useState("All");
  const [filterModule,setFilterModule]=useState("All");
  const [search,setSearch]=useState("");
  const users_list=[...new Set(logDB.data.map(l=>l.user_name).filter(Boolean))];
  const modules_list=[...new Set(logDB.data.map(l=>l.module).filter(Boolean))];

  const filtered=useMemo(()=>{
    let list=logDB.data;
    if(filterUser!=="All")list=list.filter(l=>l.user_name===filterUser);
    if(filterModule!=="All")list=list.filter(l=>l.module===filterModule);
    if(search.trim())list=list.filter(l=>(l.action||"").toLowerCase().includes(search.toLowerCase()));
    return list;
  },[logDB.data,filterUser,filterModule,search]);

  return (
    <div>
      <div style={{marginBottom:18}}><h2 style={S.h2}>Activity Log</h2><p style={S.sub}>Complete record of all actions taken in the system</p></div>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <input style={{...S.inp,width:220,margin:0}} placeholder="🔍 Search actions…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{...S.sel,width:160}} value={filterUser} onChange={e=>setFilterUser(e.target.value)}><option>All</option>{users_list.map(u=><option key={u}>{u}</option>)}</select>
        <select style={{...S.sel,width:160}} value={filterModule} onChange={e=>setFilterModule(e.target.value)}><option>All</option>{modules_list.map(m=><option key={m}>{m}</option>)}</select>
      </div>
      <div style={S.card}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Time","User","Module","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.slice(0,200).map(log=>(
              <tr key={log.id}>
                <td style={{...S.td,fontSize:11,color:"#9fa8da",whiteSpace:"nowrap"}}>{log.created_at?.replace("T"," ").slice(0,16)||"—"}</td>
                <td style={S.td}><span style={{fontWeight:700,color:B.dark}}>{log.user_name||"—"}</span></td>
                <td style={S.td}><Pill text={log.module||"—"} color="#5c6bc0" bg="#eef0fb"/></td>
                <td style={S.td}>{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{padding:24,textAlign:"center",color:"#9fa8da"}}>No activity logs yet.</div>}
      </div>
    </div>
  );
}

// ─── TASK REMINDER POPUP ──────────────────────────────────────────────────────
function TaskReminderPopup({tasks,onClose}) {
  const overdue=tasks.filter(t=>!t.done&&t.due_date&&t.due_date<tod());
  const dueToday=tasks.filter(t=>!t.done&&t.due_date===tod());
  if(overdue.length===0&&dueToday.length===0)return null;
  return (
    <div style={{position:"fixed",bottom:20,right:20,zIndex:2000,maxWidth:360,boxShadow:"0 8px 32px rgba(45,58,140,0.25)"}}>
      <div style={{background:B.dark,borderRadius:"12px 12px 0 0",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{color:"#fff",fontWeight:800,fontSize:14}}>🔔 Task Reminders</div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:16}}>✕</button>
      </div>
      <div style={{background:"#fff",borderRadius:"0 0 12px 12px",maxHeight:280,overflowY:"auto"}}>
        {overdue.length>0&&(
          <div style={{padding:"10px 14px",borderBottom:"1px solid #fee2e2",background:"#fff5f5"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#dc2626",textTransform:"uppercase",marginBottom:6}}>⚠️ {overdue.length} Overdue</div>
            {overdue.slice(0,5).map(t=><div key={t.id} style={{fontSize:12,color:"#7f1d1d",padding:"3px 0",borderBottom:"1px solid #fecaca"}}>{t.title} <span style={{color:"#dc2626",fontWeight:700}}>({t.due_date})</span></div>)}
          </div>
        )}
        {dueToday.length>0&&(
          <div style={{padding:"10px 14px"}}>
            <div style={{fontSize:11,fontWeight:700,color:B.warn,textTransform:"uppercase",marginBottom:6}}>📅 Due Today ({dueToday.length})</div>
            {dueToday.slice(0,5).map(t=><div key={t.id} style={{fontSize:12,color:"#37474f",padding:"3px 0"}}>{t.title}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── CLOSED LEADS ────────────────────────────────────────────────────────────
function ClosedLeads({leads,leadsDB,currentUser}) {
  const [search,setSearch]=useState("");
  const [sel,setSel]=useState(null);
  const closed=leads.filter(l=>l.lost).sort((a,b)=>(b.updated_at||b.created_at||"").localeCompare(a.updated_at||a.created_at||""));
  const filtered=search.trim()?closed.filter(l=>(l.name||"").toLowerCase().includes(search.toLowerCase())||(l.phone||"").includes(search)):closed;

  const restoreLead=async(lead)=>{
    if(currentUser.role!==ROLES.CEO){alert("Only CEO can restore leads.");return;}
    await leadsDB.update(lead.id,{lost:false,status:"New",lost_reason:null});
    setSel(null);
  };

  const deleteLead=async(lead)=>{
    if(currentUser.role!==ROLES.CEO){alert("Only CEO can permanently delete leads.");return;}
    if(!window.confirm(`⚠️ PERMANENTLY DELETE ${lead.name}?

This cannot be undone. All data for this lead will be lost forever.`))return;
    if(!window.confirm(`Are you absolutely sure? This will DELETE ${lead.name} forever.`))return;
    await supabase.from("tasks").delete().eq("lead_id",lead.id);
    await leadsDB.remove(lead.id);
    setSel(null);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <h2 style={S.h2}>Closed Leads</h2>
          <p style={S.sub}>{closed.length} closed · visible to all · editable by CEO only</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginBottom:20}}>
        <Stat label="Total Closed" value={closed.length} color={B.danger} icon="❌"/>
        <Stat label="This Month" value={closed.filter(l=>{const d=l.updated_at||l.created_at||"";return d.slice(0,7)===tod().slice(0,7);}).length} color={B.warn} icon="📅"/>
        {["Budget Issue","Not Ready","Visa Rejected","Not Responding","Other"].map(reason=>{
          const count=closed.filter(l=>(l.lost_reason||"").toLowerCase().includes(reason.toLowerCase())).length;
          return count>0?<Stat key={reason} label={reason} value={count} color="#64748b" icon="📊"/>:null;
        })}
      </div>

      <div style={{marginBottom:14}}>
        <input style={{...S.inp,width:260,margin:0}} placeholder="🔍 Search closed leads…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div style={{...S.card,padding:0,overflow:"hidden"}}>
        <div style={{overflowX:"auto",maxHeight:"calc(100vh - 280px)",overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}>
            <thead><tr>{["#","Date Closed","Name","Contact","Country","Reason for Closing","Counselor",currentUser.role===ROLES.CEO?"Actions":""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {paginated.map((lead,idx)=>{
                return (
                  <tr key={lead.id} style={{background:"#fff5f5"}}>
                    <td style={{...S.td,fontSize:11,color:"#9fa8da"}}>{idx+1}</td>
                    <td style={{...S.td,fontSize:11,whiteSpace:"nowrap"}}>{lead.updated_at?.split("T")[0]||lead.created_at?.split("T")[0]||"—"}</td>
                    <td style={S.td}>
                      <div style={{fontWeight:700,color:"#7f1d1d"}}>{lead.name}</div>
                      <div style={{fontSize:10,color:"#9fa8da"}}>{lead.phone}</div>
                    </td>
                    <td style={S.td}>{lead.phone}</td>
                    <td style={S.td}>{lead.country}</td>
                    <td style={S.td}>
                      {lead.lost_reason?
                        <span style={{background:"#fee2e2",color:"#dc2626",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600}}>{lead.lost_reason}</span>:
                        <span style={{color:"#9fa8da",fontSize:11}}>No reason given</span>
                      }
                    </td>
                    <td style={S.td}>{lead.source||"—"}</td>
                    {currentUser.role===ROLES.CEO&&(
                      <td style={S.td}>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>restoreLead(lead)} style={{...S.ghost,fontSize:11,padding:"4px 10px",color:B.success,borderColor:B.success}}>↩ Restore</button>
                          <button onClick={()=>deleteLead(lead)} style={{...S.btn("#dc2626"),fontSize:11,padding:"4px 10px"}}>🗑 Delete Forever</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div style={{padding:32,textAlign:"center",color:"#9fa8da"}}>No closed leads yet.</div>}
        </div>
      </div>
    </div>
  );
}


// ─── SERVICES & CONSTANTS ─────────────────────────────────────────────────────
const FINANCE_SERVICES = {
  "Consultancy & Advisory": [
    "Consultation Fee","Profile Assessment","Eligibility Assessment",
    "DIP (Diploma Pathway)","Profile Building","Career Counselling"
  ],
  "Student Visa Services": [
    "Student Visa Application (UK)","Student Visa Application (Australia)",
    "Student Visa Application (Canada)","Student Visa Application (USA)",
    "Student Visa Application (Germany)","Student Visa Application (Other Country)",
    "CAS / CoE / I-20 Assistance","SOP / Personal Statement Writing",
    "University Application Submission","Conditional Offer Follow-up",
    "Unconditional Offer Follow-up"
  ],
  "Immigration Services": [
    "PR Application (Canada Express Entry)","PR Application (Australia SkillSelect)",
    "Germany Opportunity Card","Germany Job Seeker Visa",
    "Work Permit Application","Dependent / Family Visa"
  ],
  "Document Services": ["Blocked Account / GIC Arrangement"],
  "Financial Services": [
    "Bank Statement Preparation Advisory","Proof of Funds Advisory",
    "Scholarship Application Assistance","Education Loan Advisory"
  ],
  "Test Preparation": [
    "IELTS Preparation","PTE Preparation","TOEFL Preparation",
    "German Language (A1/A2/B1/B2)","APS Certificate Assistance (Germany)"
  ],
  "Agent / B2B Services": [
    "Sub-Agent Commission","University Commission Claim","Referral Fee"
  ],
};
const ALL_SERVICES = Object.values(FINANCE_SERVICES).flat();
const PAYMENT_METHODS = ["Cash","Bank Transfer","Cheque","EasyPaisa","JazzCash","Credit/Debit Card","Online Transfer"];
const INVOICE_TYPES = {CLIENT:"Client Invoice", COMMISSION:"University Commission", AGENT_PAYABLE:"Agent Payable (B2B)"};
const FOREIGN_CURRENCIES = ["GBP","USD","AUD","CAD","EUR"];
const EXPENSE_CATEGORIES_DEFAULT = ["Staff Salaries","Office Rent","Utilities","Marketing & Advertising","Travel & Transport","Office Supplies","Bank Charges","Miscellaneous"];
const ATTENDANCE_STATUS = ["Present","Absent","Late","Half Day","Holiday","Leave"];
const DEDUCTION_RULES = {Absent:1, Late:0.25, "Half Day":0.5, Present:0, Holiday:0, Leave:0};

// ─── INVOICE MODULE (REBUILT) ─────────────────────────────────────────────────
function Invoices({invoices,invoicesDB,leads,agents,currentUser,settings}) {
  const [tab,setTab]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [showPayment,setShowPayment]=useState(null);
  const [showReceipt,setShowReceipt]=useState(null);
  const [sel,setSel]=useState(null);
  const [search,setSearch]=useState("");

  const EF={
    type:"CLIENT",client_name:"",lead_id:"",country:"",
    university_name:"",agent_id:"",
    line_items:[{id:1,service:"",description:"",amount:""}],
    currency:"PKR",foreign_currency:"GBP",foreign_amount:"",exchange_rate:"",
    commission_pct:"",
    invoice_date:tod(),due_date:"",notes:"",status:"Draft",
    installments:[],payments:[],
  };
  const [form,setForm]=useState(EF);

  // Payment form
  const PEF={amount:"",date:tod(),method:"Cash",reference:"",notes:""};
  const [payForm,setPayForm]=useState(PEF);

  const filtered=useMemo(()=>{
    let list=invoices;
    if(tab!=="all") list=list.filter(i=>i.type===tab||(!i.type&&tab==="CLIENT"));
    if(search.trim()) list=list.filter(i=>(i.client_name||"").toLowerCase().includes(search.toLowerCase())||(i.invoice_no||"").toLowerCase().includes(search.toLowerCase()));
    return list.sort((a,b)=>(b.created_at||"").localeCompare(a.created_at||""));
  },[invoices,tab,search]);

  const getInvoiceNo=()=>{
    const prefix=settings?.invoice_prefix||"BNB";
    const year=new Date().getFullYear();
    const count=invoices.length+1;
    return `${prefix}-${year}-${String(count).padStart(4,"0")}`;
  };

  const lineTotal=(items)=>items.reduce((a,i)=>a+(parseFloat(i.amount)||0),0);
  const totalPaid=(inv)=>(inv.payments||[]).reduce((a,p)=>a+(parseFloat(p.amount)||0),0);
  const balance=(inv)=>lineTotal(inv.line_items||[])-totalPaid(inv);
  const invStatus=(inv)=>{
    const tot=lineTotal(inv.line_items||[]);
    const paid=totalPaid(inv);
    if(inv.status==="Draft")return "Draft";
    if(paid<=0)return "Unpaid";
    if(paid>=tot)return "Paid";
    return "Partial";
  };

  const addLineItem=()=>setForm(f=>({...f,line_items:[...f.line_items,{id:Date.now(),service:"",description:"",amount:""}]}));
  const removeLineItem=(id)=>setForm(f=>({...f,line_items:f.line_items.filter(i=>i.id!==id)}));
  const updateLineItem=(id,field,val)=>setForm(f=>({...f,line_items:f.line_items.map(i=>i.id===id?{...i,[field]:val}:i)}));

  const saveInvoice=async()=>{
    if(!form.client_name)return alert("Client name required");
    if(form.line_items.every(i=>!i.service))return alert("Add at least one service");
    const inv={
      ...form,
      invoice_no:getInvoiceNo(),
      amount:lineTotal(form.line_items),
      paid:0,
      status:"Draft",
      created_by:currentUser.id,
      line_items:form.line_items,
      payments:[],
    };
    await invoicesDB.insert(inv);
    setShowAdd(false);setForm(EF);
  };

  const addPayment=async()=>{
    if(!payForm.amount||!showPayment)return;
    const inv=showPayment;
    const payment={id:Date.now(),...payForm,amount:parseFloat(payForm.amount),by:currentUser.name};
    const payments=[...(inv.payments||[]),payment];
    const totalPaidAmt=payments.reduce((a,p)=>a+p.amount,0);
    const tot=lineTotal(inv.line_items||[]);
    const status=totalPaidAmt>=tot?"Paid":totalPaidAmt>0?"Partial":"Unpaid";
    await invoicesDB.update(inv.id,{payments,paid:totalPaidAmt,status});
    setSel(p=>p?{...p,payments,paid:totalPaidAmt,status}:p);
    setShowPayment(null);setPayForm(PEF);
  };

  const printReceipt=(inv,payment)=>{
    const co=settings?.company_name||"Border and Bridges Pvt. Ltd.";
    const addr=settings?.address||"Lahore, Pakistan";
    const phone=settings?.phone||"";
    const prefix=settings?.invoice_prefix||"BNB";
    const html=`<!DOCTYPE html><html><head><title>Receipt</title>
    <style>body{font-family:Arial;max-width:600px;margin:40px auto;padding:20px}
    .header{text-align:center;border-bottom:2px solid #2d3a8c;padding-bottom:16px;margin-bottom:20px}
    .company{font-size:22px;font-weight:900;color:#2d3a8c}
    .sub{font-size:12px;color:#666;margin:2px 0}
    .title{font-size:18px;font-weight:700;text-align:center;margin:20px 0;color:#059669}
    .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
    .label{color:#666;font-size:13px}.value{font-weight:700;font-size:13px}
    .amount{font-size:24px;font-weight:900;color:#2d3a8c;text-align:center;margin:20px 0;padding:16px;background:#eef0fb;border-radius:8px}
    .footer{text-align:center;font-size:11px;color:#999;margin-top:20px;border-top:1px solid #eee;padding-top:12px}
    </style></head><body>
    <div class="header">
      <div class="company">${co}</div>
      <div class="sub">${addr}</div>
      <div class="sub">${phone}</div>
    </div>
    <div class="title">✓ PAYMENT RECEIPT</div>
    <div class="row"><span class="label">Receipt No</span><span class="value">${prefix}-RCP-${Date.now().toString().slice(-6)}</span></div>
    <div class="row"><span class="label">Invoice No</span><span class="value">${inv.invoice_no||"—"}</span></div>
    <div class="row"><span class="label">Client</span><span class="value">${inv.client_name}</span></div>
    <div class="row"><span class="label">Payment Date</span><span class="value">${payment.date}</span></div>
    <div class="row"><span class="label">Payment Method</span><span class="value">${payment.method}</span></div>
    ${payment.reference?'<div class="row"><span class="label">Reference</span><span class="value">'+payment.reference+'</span></div>':""}
    <div class="amount">PKR ${parseFloat(payment.amount).toLocaleString()}</div>
    <div class="row"><span class="label">Total Invoice</span><span class="value">PKR ${lineTotal(inv.line_items||[]).toLocaleString()}</span></div>
    <div class="row"><span class="label">Total Paid</span><span class="value">PKR ${(totalPaid(inv)).toLocaleString()}</span></div>
    <div class="row"><span class="label">Balance Remaining</span><span class="value">PKR ${Math.max(0,balance(inv)).toLocaleString()}</span></div>
    <div class="footer">${settings?.invoice_terms||"Thank you for choosing "+co}</div>
    </body></html>`;
    const w=window.open("","_blank");w.document.write(html);w.document.close();w.print();
  };

  const statusColor=(s)=>({Draft:["#5c6bc0","#eef0fb"],Unpaid:["#dc2626","#fee2e2"],Partial:["#7c5100","#fef3c7"],Paid:["#065f46","#d1fae5"]}[s]||["#37474f","#f3f4f9"]);

  if(currentUser.role!==ROLES.CEO&&currentUser.role!==ROLES.ACCOUNTS)
    return <div style={{...S.card,textAlign:"center",padding:60,color:"#9fa8da"}}>🔒 CEO and Accounts only.</div>;

  // Summary stats
  const totalBilled=invoices.filter(i=>i.status!=="Draft").reduce((a,i)=>a+lineTotal(i.line_items||[]),0);
  const totalCollected=invoices.reduce((a,i)=>a+totalPaid(i),0);
  const totalOutstanding=totalBilled-totalCollected;
  const totalCommission=invoices.filter(i=>i.type==="COMMISSION").reduce((a,i)=>a+lineTotal(i.line_items||[]),0);
  const totalAgentPayable=invoices.filter(i=>i.type==="AGENT_PAYABLE").reduce((a,i)=>a+lineTotal(i.line_items||[]),0);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={S.h2}>Invoices & Payments</h2><p style={S.sub}>{invoices.length} invoices · {invoices.filter(i=>i.status==="Draft").length} drafts</p></div>
        {currentUser.role===ROLES.CEO&&<button onClick={()=>setShowAdd(true)} style={S.btn("#dc2626")}>+ New Invoice</button>}
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20}}>
        <Stat label="Total Billed" value={fmt(totalBilled)} color={B.primary} icon="🧾"/>
        <Stat label="Collected" value={fmt(totalCollected)} color={B.success} icon="💰"/>
        <Stat label="Outstanding" value={fmt(totalOutstanding)} color={B.danger} icon="⏳"/>
        <Stat label="Uni Commission" value={fmt(totalCommission)} color={B.secondary} icon="🎓"/>
        <Stat label="Agent Payable" value={fmt(totalAgentPayable)} color="#7c3aed" icon="🤝"/>
      </div>

      {/* Tabs + Search */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",gap:6}}>
          {[["all","All"],["CLIENT","Client"],["COMMISSION","Uni Commission"],["AGENT_PAYABLE","Agent Payable"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{padding:"7px 14px",borderRadius:8,border:"2px solid",borderColor:tab===k?B.primary:"#c5cae9",background:tab===k?B.light:"#fff",color:tab===k?B.primary:"#5c6bc0",fontSize:12,fontWeight:700,cursor:"pointer"}}>{l} ({k==="all"?invoices.length:invoices.filter(i=>(i.type||"CLIENT")===k).length})</button>
          ))}
        </div>
        <input style={{...S.inp,width:200,margin:0}} placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {/* Invoice table */}
      <div style={{...S.card,padding:0,overflow:"hidden"}}>
        <div style={{overflowX:"auto",maxHeight:"calc(100vh - 340px)",overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
            <thead><tr>{["Invoice #","Date","Client","Type","Total","Paid","Balance","Status",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(inv=>{
                const tot=lineTotal(inv.line_items||[]);
                const paid=totalPaid(inv);
                const bal=tot-paid;
                const st=invStatus(inv);
                const [sc,sb]=statusColor(st);
                return (
                  <tr key={inv.id}>
                    <td style={{...S.td,fontWeight:700,color:B.primary}}>{inv.invoice_no||"—"}</td>
                    <td style={{...S.td,fontSize:11}}>{inv.invoice_date||"—"}</td>
                    <td style={S.td}><div style={{fontWeight:700}}>{inv.client_name}</div><div style={{fontSize:10,color:"#9fa8da"}}>{inv.country||""}</div></td>
                    <td style={S.td}><Pill text={INVOICE_TYPES[inv.type||"CLIENT"]||"Client"} color="#3949ab" bg="#eef0fb"/></td>
                    <td style={{...S.td,fontWeight:700}}>{fmt(tot)}</td>
                    <td style={{...S.td,color:B.success,fontWeight:700}}>{fmt(paid)}</td>
                    <td style={{...S.td,color:bal>0?"#dc2626":B.success,fontWeight:700}}>{fmt(bal)}</td>
                    <td style={S.td}><Pill text={st} color={sc} bg={sb}/></td>
                    <td style={S.td}>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>setSel({...inv})} style={{...S.ghost,fontSize:11,padding:"4px 8px"}}>Open</button>
                        {st!=="Paid"&&st!=="Draft"&&<button onClick={()=>{setSel({...inv});setShowPayment({...inv});}} style={{...S.btn(B.success),fontSize:11,padding:"4px 8px"}}>+ Pay</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div style={{padding:32,textAlign:"center",color:"#9fa8da"}}>No invoices yet.</div>}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {sel&&(
        <Modal title={`${sel.invoice_no||"Draft"} — ${sel.client_name}`} onClose={()=>setSel(null)} w={700}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16,padding:14,background:"#f8f9ff",borderRadius:10}}>
            {[["Type",INVOICE_TYPES[sel.type||"CLIENT"]],["Date",sel.invoice_date],["Status",invStatus(sel)],["Country",sel.country||"—"],["Currency",sel.currency||"PKR"],["Due Date",sel.due_date||"—"]].map(([k,v])=>(
              <div key={k}><div style={S.lbl}>{k}</div><div style={{fontSize:13,fontWeight:700,color:B.dark}}>{v}</div></div>
            ))}
          </div>

          {/* Line Items */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:8}}>Services</div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Service","Description","Amount (PKR)"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {(sel.line_items||[]).map(item=>(
                  <tr key={item.id}>
                    <td style={S.td}>{item.service}</td>
                    <td style={{...S.td,fontSize:12,color:"#5c6bc0"}}>{item.description||"—"}</td>
                    <td style={{...S.td,fontWeight:700}}>{fmt(item.amount)}</td>
                  </tr>
                ))}
                <tr style={{background:"#f8f9ff"}}>
                  <td style={{...S.td,fontWeight:800,color:B.dark}} colSpan={2}>Total</td>
                  <td style={{...S.td,fontWeight:900,color:B.primary,fontSize:15}}>{fmt(lineTotal(sel.line_items||[]))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* University/Agent specific info */}
          {sel.type==="COMMISSION"&&(
            <div style={{background:"#f0f9ff",borderRadius:10,padding:14,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:B.secondary,marginBottom:8}}>University Commission Details</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={S.lbl}>University</div><div style={{fontSize:13,fontWeight:700}}>{sel.university_name||"—"}</div></div>
                <div><div style={S.lbl}>Foreign Amount</div><div style={{fontSize:13,fontWeight:700}}>{sel.foreign_currency} {sel.foreign_amount||"—"}</div></div>
                <div><div style={S.lbl}>Exchange Rate</div><div style={{fontSize:13,fontWeight:700}}>{sel.exchange_rate||"—"}</div></div>
                <div><div style={S.lbl}>PKR Equivalent</div><div style={{fontSize:13,fontWeight:700,color:B.success}}>{fmt((sel.foreign_amount||0)*(sel.exchange_rate||0))}</div></div>
              </div>
            </div>
          )}
          {sel.type==="AGENT_PAYABLE"&&(
            <div style={{background:"#fdf4ff",borderRadius:10,padding:14,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:"#7c3aed",marginBottom:8}}>Agent Payable Details</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={S.lbl}>Agent</div><div style={{fontSize:13,fontWeight:700}}>{(agents||[]).find(a=>a.id===sel.agent_id)?.name||sel.agent_name||"—"}</div></div>
                <div><div style={S.lbl}>Commission %</div><div style={{fontSize:13,fontWeight:700}}>{sel.commission_pct||"—"}%</div></div>
              </div>
            </div>
          )}

          {/* Payment History */}
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:700,color:B.dark}}>Payment History</div>
              {invStatus(sel)!=="Paid"&&invStatus(sel)!=="Draft"&&<button onClick={()=>setShowPayment({...sel})} style={{...S.btn(B.success),fontSize:11,padding:"5px 12px"}}>+ Add Payment</button>}
            </div>
            {(sel.payments||[]).length===0&&<div style={{fontSize:12,color:"#9fa8da",textAlign:"center",padding:12,background:"#f8f9ff",borderRadius:8}}>No payments recorded yet.</div>}
            {(sel.payments||[]).map((p,i)=>(
              <div key={p.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"#f8f9ff",borderRadius:8,marginBottom:6}}>
                <div>
                  <span style={{fontWeight:700,color:B.success,fontSize:13}}>{fmt(p.amount)}</span>
                  <span style={{fontSize:11,color:"#5c6bc0",marginLeft:8}}>{p.method}</span>
                  {p.reference&&<span style={{fontSize:11,color:"#9fa8da",marginLeft:8}}>Ref: {p.reference}</span>}
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#9fa8da"}}>{p.date} · {p.by}</span>
                  <button onClick={()=>printReceipt(sel,p)} style={{...S.ghost,fontSize:10,padding:"3px 8px"}}>🖨️ Receipt</button>
                </div>
              </div>
            ))}
            {(sel.payments||[]).length>0&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10,padding:12,background:B.light,borderRadius:8}}>
                {[["Total",lineTotal(sel.line_items||[]),"#37474f"],["Paid",totalPaid(sel),B.success],["Balance",Math.max(0,balance(sel)),"#dc2626"]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center"}}><div style={{fontSize:10,color:"#9fa8da",fontWeight:700,textTransform:"uppercase"}}>{l}</div><div style={{fontSize:15,fontWeight:900,color:c}}>{fmt(v)}</div></div>
                ))}
              </div>
            )}
          </div>

          {sel.notes&&<div style={{background:"#f8f9ff",borderRadius:8,padding:12,fontSize:12,color:"#37474f"}}><strong>Notes:</strong> {sel.notes}</div>}
        </Modal>
      )}

      {/* Add Payment Modal */}
      {showPayment&&(
        <Modal title={`Add Payment — ${showPayment.client_name}`} onClose={()=>setShowPayment(null)} w={480}>
          <div style={{background:"#f8f9ff",borderRadius:10,padding:14,marginBottom:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><div style={S.lbl}>Invoice Total</div><div style={{fontSize:16,fontWeight:900,color:B.primary}}>{fmt(lineTotal(showPayment.line_items||[]))}</div></div>
            <div><div style={S.lbl}>Balance Due</div><div style={{fontSize:16,fontWeight:900,color:"#dc2626"}}>{fmt(Math.max(0,balance(showPayment)))}</div></div>
          </div>
          <R2>
            <Fld label="Amount (PKR)"><input type="number" style={S.inp} value={payForm.amount} onChange={e=>setPayForm({...payForm,amount:e.target.value})} placeholder="Enter amount received"/></Fld>
            <Fld label="Payment Date"><input type="date" style={S.inp} value={payForm.date} onChange={e=>setPayForm({...payForm,date:e.target.value})}/></Fld>
          </R2>
          <Fld label="Payment Method">
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {PAYMENT_METHODS.map(m=><button key={m} onClick={()=>setPayForm({...payForm,method:m})} style={{padding:"6px 12px",borderRadius:8,border:`2px solid ${payForm.method===m?B.success:"#c5cae9"}`,background:payForm.method===m?"#d1fae5":"#fff",color:payForm.method===m?"#065f46":"#5c6bc0",fontSize:12,fontWeight:600,cursor:"pointer"}}>{m}</button>)}
            </div>
          </Fld>
          <R2>
            <Fld label="Reference / Cheque No"><input style={S.inp} value={payForm.reference} onChange={e=>setPayForm({...payForm,reference:e.target.value})} placeholder="Optional"/></Fld>
            <Fld label="Notes"><input style={S.inp} value={payForm.notes} onChange={e=>setPayForm({...payForm,notes:e.target.value})} placeholder="Optional"/></Fld>
          </R2>
          <button onClick={addPayment} style={{...S.btn(B.success),width:"100%",justifyContent:"center",padding:12}}>✓ Record Payment</button>
        </Modal>
      )}

      {/* New Invoice Modal */}
      {showAdd&&(
        <Modal title="New Invoice" onClose={()=>setShowAdd(false)} w={720}>
          {/* Invoice Type */}
          <div style={{marginBottom:16}}>
            <div style={S.lbl}>Invoice Type</div>
            <div style={{display:"flex",gap:8}}>
              {Object.entries(INVOICE_TYPES).map(([k,l])=>(
                <button key={k} onClick={()=>setForm({...form,type:k})} style={{padding:"8px 16px",borderRadius:8,border:`2px solid ${form.type===k?B.primary:"#c5cae9"}`,background:form.type===k?B.light:"#fff",color:form.type===k?B.primary:"#5c6bc0",fontSize:13,fontWeight:700,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
          </div>

          <R2>
            <Fld label="Client Name">
              <select style={S.sel} value={form.lead_id} onChange={e=>{
                const lead=leads.find(l=>l.id===e.target.value);
                setForm({...form,lead_id:e.target.value,client_name:lead?.name||"",country:lead?.country||""});
              }}>
                <option value="">— Select Client —</option>
                {leads.filter(l=>l.list==="ACL"&&!l.lost).map(l=><option key={l.id} value={l.id}>{l.name} ({l.country})</option>)}
              </select>
            </Fld>
            <Fld label="Or Type Name"><input style={S.inp} value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})} placeholder="Client name"/></Fld>
          </R2>

          {form.type==="COMMISSION"&&(
            <div style={{background:"#f0f9ff",borderRadius:10,padding:14,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:B.secondary,marginBottom:10}}>University Commission Details</div>
              <R2>
                <Fld label="University Name"><input style={S.inp} value={form.university_name} onChange={e=>setForm({...form,university_name:e.target.value})} placeholder="e.g. University of Birmingham"/></Fld>
                <Fld label="Foreign Currency">
                  <select style={S.sel} value={form.foreign_currency} onChange={e=>setForm({...form,foreign_currency:e.target.value})}>
                    {FOREIGN_CURRENCIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </Fld>
              </R2>
              <R2>
                <Fld label={`Amount in ${form.foreign_currency}`}><input type="number" style={S.inp} value={form.foreign_amount} onChange={e=>setForm({...form,foreign_amount:e.target.value})} placeholder="e.g. 500"/></Fld>
                <Fld label="Exchange Rate (PKR)"><input type="number" style={S.inp} value={form.exchange_rate} onChange={e=>setForm({...form,exchange_rate:e.target.value})} placeholder="e.g. 350"/></Fld>
              </R2>
              {form.foreign_amount&&form.exchange_rate&&<Alert type="info" msg={`PKR Equivalent: ${fmt(form.foreign_amount*form.exchange_rate)}`}/>}
            </div>
          )}

          {form.type==="AGENT_PAYABLE"&&(
            <div style={{background:"#fdf4ff",borderRadius:10,padding:14,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:"#7c3aed",marginBottom:10}}>Agent Payable Details</div>
              <R2>
                <Fld label="Agent">
                  <select style={S.sel} value={form.agent_id} onChange={e=>{
                    const ag=(agents||[]).find(a=>a.id===e.target.value);
                    setForm({...form,agent_id:e.target.value,commission_pct:ag?.commission_pct||"",agent_name:ag?.name||""});
                  }}>
                    <option value="">— Select Agent —</option>
                    {(agents||[]).map(a=><option key={a.id} value={a.id}>{a.name} ({a.commission_pct||"?"}%)</option>)}
                  </select>
                </Fld>
                <Fld label="Commission %"><input type="number" style={S.inp} value={form.commission_pct} onChange={e=>setForm({...form,commission_pct:e.target.value})} placeholder="e.g. 70"/></Fld>
              </R2>
            </div>
          )}

          {/* Line Items */}
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:700,color:B.dark}}>Services / Line Items</div>
              <button onClick={addLineItem} style={{...S.ghost,fontSize:11,padding:"4px 10px"}}>+ Add Line</button>
            </div>
            {form.line_items.map((item,idx)=>(
              <div key={item.id} style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr auto",gap:8,marginBottom:8,alignItems:"center"}}>
                <select style={S.sel} value={item.service} onChange={e=>updateLineItem(item.id,"service",e.target.value)}>
                  <option value="">— Select Service —</option>
                  {Object.entries(FINANCE_SERVICES).map(([group,services])=>(
                    <optgroup key={group} label={group}>
                      {services.map(s=><option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  ))}
                </select>
                <input style={S.inp} value={item.description} onChange={e=>updateLineItem(item.id,"description",e.target.value)} placeholder="Description (optional)"/>
                <input type="number" style={S.inp} value={item.amount} onChange={e=>updateLineItem(item.id,"amount",e.target.value)} placeholder="PKR"/>
                {form.line_items.length>1&&<button onClick={()=>removeLineItem(item.id)} style={{background:"#fee2e2",border:"none",borderRadius:6,width:28,height:28,color:"#dc2626",cursor:"pointer",fontSize:16}}>×</button>}
              </div>
            ))}
            <div style={{textAlign:"right",fontSize:15,fontWeight:900,color:B.primary,marginTop:8}}>Total: {fmt(lineTotal(form.line_items))}</div>
          </div>

          <R2>
            <Fld label="Invoice Date"><input type="date" style={S.inp} value={form.invoice_date} onChange={e=>setForm({...form,invoice_date:e.target.value})}/></Fld>
            <Fld label="Due Date"><input type="date" style={S.inp} value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/></Fld>
          </R2>
          <Fld label="Notes"><textarea style={{...S.inp,minHeight:60,resize:"vertical"}} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Any notes…"/></Fld>
          <button onClick={saveInvoice} style={{...S.btn(B.primary),width:"100%",justifyContent:"center",padding:12}}>Save Invoice as Draft</button>
        </Modal>
      )}
    </div>
  );
}

// ─── AGENTS MODULE ────────────────────────────────────────────────────────────
function AgentsModule({agents,agentsDB,invoices,leads,currentUser}) {
  const [showAdd,setShowAdd]=useState(false);
  const [sel,setSel]=useState(null);
  const EF={name:"",company:"",contact:"",city:"",branch:"Lahore (HQ)",commission_pct:"",bank_name:"",bank_account:"",bank_title:"",notes:""};
  const [form,setForm]=useState(EF);

  const saveAgent=async()=>{
    if(!form.name)return;
    if(sel) await agentsDB.update(sel.id,form);
    else await agentsDB.insert(form);
    setShowAdd(false);setSel(null);setForm(EF);
  };

  const getAgentStats=(agent)=>{
    const agentLeads=leads.filter(l=>l.agent_id===agent.id||l.source_agent===agent.id);
    const agentInvoices=invoices.filter(i=>i.agent_id===agent.id&&i.type==="AGENT_PAYABLE");
    const totalPayable=agentInvoices.reduce((a,i)=>a+(i.amount||0),0);
    const totalPaid=agentInvoices.reduce((a,i)=>a+(i.paid||0),0);
    return {cases:agentLeads.length,totalPayable,totalPaid,outstanding:totalPayable-totalPaid};
  };

  if(currentUser.role!==ROLES.CEO&&currentUser.role!==ROLES.ACCOUNTS)
    return <div style={{...S.card,textAlign:"center",padding:60,color:"#9fa8da"}}>🔒 CEO and Accounts only.</div>;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={S.h2}>Agents (B2B Partners)</h2><p style={S.sub}>{agents.length} agents registered</p></div>
        {currentUser.role===ROLES.CEO&&<button onClick={()=>{setForm(EF);setShowAdd(true);}} style={S.btn("#7c3aed")}>+ Add Agent</button>}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
        {agents.map(agent=>{
          const stats=getAgentStats(agent);
          return (
            <div key={agent.id} style={{...S.card,cursor:"pointer"}} onClick={()=>{setSel(agent);setForm(agent);setShowAdd(true);}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:B.dark}}>{agent.name}</div>
                  <div style={{fontSize:12,color:"#5c6bc0"}}>{agent.company||"—"} · {agent.city||"—"}</div>
                </div>
                <Pill text={`${agent.commission_pct||"?"}% Commission`} color="#7c3aed" bg="#f3e8ff"/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                {[["Cases",stats.cases,"#3949ab"],["Payable",fmt(stats.totalPayable),"#dc2626"],["Paid",fmt(stats.totalPaid),"#059669"]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center",background:"#f8f9ff",borderRadius:8,padding:"8px 4px"}}>
                    <div style={{fontSize:10,color:"#9fa8da",fontWeight:700,textTransform:"uppercase"}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:800,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:11,color:"#9fa8da"}}>📞 {agent.contact||"—"} · 🏦 {agent.bank_name||"—"}</div>
            </div>
          );
        })}
        {agents.length===0&&<div style={{...S.card,textAlign:"center",color:"#9fa8da",padding:48}}>No agents yet. Add your first B2B partner.</div>}
      </div>

      {showAdd&&(
        <Modal title={sel?"Edit Agent":"Add New Agent"} onClose={()=>{setShowAdd(false);setSel(null);setForm(EF);}} w={600}>
          <R2>
            <Fld label="Agent Name *"><input style={S.inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name"/></Fld>
            <Fld label="Company Name"><input style={S.inp} value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="Company/Agency name"/></Fld>
          </R2>
          <R2>
            <Fld label="Contact Number"><input style={S.inp} value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="+92 300…"/></Fld>
            <Fld label="City"><input style={S.inp} value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="City"/></Fld>
          </R2>
          <Fld label="Commission % (of what you receive)">
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input type="number" style={{...S.inp,width:100}} value={form.commission_pct} onChange={e=>setForm({...form,commission_pct:e.target.value})} placeholder="e.g. 70"/>
              <span style={{fontSize:13,color:"#5c6bc0"}}>% of your fee goes to this agent</span>
            </div>
          </Fld>
          <div style={{background:"#f8f9ff",borderRadius:10,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:10}}>Bank Details (for commission payments)</div>
            <R2>
              <Fld label="Bank Name"><input style={S.inp} value={form.bank_name} onChange={e=>setForm({...form,bank_name:e.target.value})} placeholder="e.g. HBL, MCB, UBL…"/></Fld>
              <Fld label="Account Title"><input style={S.inp} value={form.bank_title} onChange={e=>setForm({...form,bank_title:e.target.value})} placeholder="Account holder name"/></Fld>
            </R2>
            <Fld label="Account Number"><input style={S.inp} value={form.bank_account} onChange={e=>setForm({...form,bank_account:e.target.value})} placeholder="Account number"/></Fld>
          </div>
          <Fld label="Notes"><textarea style={{...S.inp,minHeight:60,resize:"vertical"}} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></Fld>
          <button onClick={saveAgent} style={{...S.btn(B.primary),width:"100%",justifyContent:"center",padding:12}}>{sel?"Update Agent":"Save Agent"}</button>
        </Modal>
      )}
    </div>
  );
}

// ─── EXPENSES MODULE ──────────────────────────────────────────────────────────
function Expenses({currentUser,settings}) {
  const expDB=useTable("expenses",{orderBy:"date",asc:false});
  const [showAdd,setShowAdd]=useState(false);
  const [filterMonth,setFilterMonth]=useState(tod().slice(0,7));
  const [filterBranch,setFilterBranch]=useState("All");
  const EF={date:tod(),category:"",description:"",amount:"",branch:currentUser.branch||"Lahore (HQ)",paid_by:"",receipt_no:""};
  const [form,setForm]=useState(EF);

  const cats=settings?.expense_categories?JSON.parse(settings.expense_categories):EXPENSE_CATEGORIES_DEFAULT;
  const canEdit=currentUser.role===ROLES.CEO||currentUser.role===ROLES.ACCOUNTS||currentUser.role===ROLES.FINANCE;

  const filtered=expDB.data.filter(e=>{
    if(filterMonth&&!e.date?.startsWith(filterMonth))return false;
    if(filterBranch!=="All"&&e.branch!==filterBranch)return false;
    return true;
  });

  const total=filtered.reduce((a,e)=>a+(parseFloat(e.amount)||0),0);

  const save=async()=>{
    if(!form.category||!form.amount)return;
    await expDB.insert({...form,amount:parseFloat(form.amount),created_by:currentUser.id,created_by_name:currentUser.name});
    setShowAdd(false);setForm(EF);
  };

  // Group by category
  const byCat=filtered.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+(parseFloat(e.amount)||0);return acc;},{});

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={S.h2}>Expense Tracker</h2><p style={S.sub}>Total this period: {fmt(total)}</p></div>
        {canEdit&&<button onClick={()=>setShowAdd(true)} style={S.btn(B.warn)}>+ Add Expense</button>}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <input type="month" style={{...S.inp,width:160,margin:0}} value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}/>
        <select style={{...S.sel,width:160}} value={filterBranch} onChange={e=>setFilterBranch(e.target.value)}>
          <option>All</option>{BRANCHES_DEFAULT.map(b=><option key={b}>{b}</option>)}
        </select>
      </div>

      {/* Category breakdown */}
      {Object.keys(byCat).length>0&&(
        <div style={{...S.card,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:10}}>Breakdown by Category</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>(
              <div key={cat} style={{padding:"6px 12px",background:"#fff3cd",borderRadius:8,fontSize:12}}>
                <span style={{fontWeight:700,color:"#7c5100"}}>{cat}</span>
                <span style={{color:"#92400e",marginLeft:6}}>{fmt(amt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={S.card}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Date","Category","Description","Branch","Amount","Paid By","Receipt #",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(e=>(
              <tr key={e.id}>
                <td style={{...S.td,fontSize:11}}>{e.date}</td>
                <td style={S.td}><Pill text={e.category} color="#7c5100" bg="#fff3cd"/></td>
                <td style={S.td}>{e.description||"—"}</td>
                <td style={{...S.td,fontSize:11}}>{e.branch}</td>
                <td style={{...S.td,fontWeight:700,color:B.danger}}>{fmt(e.amount)}</td>
                <td style={{...S.td,fontSize:11}}>{e.paid_by||"—"}</td>
                <td style={{...S.td,fontSize:11}}>{e.receipt_no||"—"}</td>
                <td style={S.td}>{canEdit&&<button onClick={async()=>{if(window.confirm("Delete this expense?"))await expDB.remove(e.id);}} style={{...S.ghost,fontSize:10,padding:"3px 8px",color:"#dc2626",borderColor:"#dc2626"}}>Delete</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{padding:24,textAlign:"center",color:"#9fa8da"}}>No expenses for this period.</div>}
        {filtered.length>0&&<div style={{padding:"12px 14px",background:"#fff3cd",fontWeight:900,color:"#7c5100",fontSize:14,textAlign:"right"}}>Total: {fmt(total)}</div>}
      </div>

      {showAdd&&(
        <Modal title="Add Expense" onClose={()=>setShowAdd(false)} w={520}>
          <R2>
            <Fld label="Date"><input type="date" style={S.inp} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></Fld>
            <Fld label="Category">
              <select style={S.sel} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                <option value="">— Select —</option>
                {cats.map(c=><option key={c}>{c}</option>)}
              </select>
            </Fld>
          </R2>
          <Fld label="Description"><input style={S.inp} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What was it for?"/></Fld>
          <R2>
            <Fld label="Amount (PKR)"><input type="number" style={S.inp} value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></Fld>
            <Fld label="Branch"><select style={S.sel} value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}>{BRANCHES_DEFAULT.map(b=><option key={b}>{b}</option>)}</select></Fld>
          </R2>
          <R2>
            <Fld label="Paid By"><input style={S.inp} value={form.paid_by} onChange={e=>setForm({...form,paid_by:e.target.value})} placeholder="Name"/></Fld>
            <Fld label="Receipt #"><input style={S.inp} value={form.receipt_no} onChange={e=>setForm({...form,receipt_no:e.target.value})} placeholder="Optional"/></Fld>
          </R2>
          <button onClick={save} style={{...S.btn(B.warn),width:"100%",justifyContent:"center",padding:12}}>Save Expense</button>
        </Modal>
      )}
    </div>
  );
}

// ─── PETTY CASH MODULE ────────────────────────────────────────────────────────
function PettyCash({currentUser}) {
  const pcDB=useTable("petty_cash",{orderBy:"date",asc:false});
  const [showAdd,setShowAdd]=useState(false);
  const [filterMonth,setFilterMonth]=useState(tod().slice(0,7));
  const EF={date:tod(),type:"Out",description:"",amount:"",received_from:"",paid_to:"",notes:""};
  const [form,setForm]=useState(EF);

  const canEdit=currentUser.role===ROLES.CEO||currentUser.role===ROLES.ACCOUNTS||currentUser.role===ROLES.FINANCE;
  const filtered=pcDB.data.filter(e=>!filterMonth||e.date?.startsWith(filterMonth));

  // Calculate running balance
  const withBalance=[];
  let runBal=0;
  [...filtered].reverse().forEach(e=>{
    if(e.type==="In") runBal+=parseFloat(e.amount)||0;
    else runBal-=parseFloat(e.amount)||0;
    withBalance.push({...e,running_balance:runBal});
  });
  withBalance.reverse();

  const totalIn=filtered.filter(e=>e.type==="In").reduce((a,e)=>a+(parseFloat(e.amount)||0),0);
  const totalOut=filtered.filter(e=>e.type==="Out").reduce((a,e)=>a+(parseFloat(e.amount)||0),0);
  const closingBal=totalIn-totalOut;

  const save=async()=>{
    if(!form.description||!form.amount)return;
    await pcDB.insert({...form,amount:parseFloat(form.amount),created_by:currentUser.id,created_by_name:currentUser.name});
    setShowAdd(false);setForm(EF);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={S.h2}>Petty Cash Book</h2><p style={S.sub}>Closing Balance: {fmt(closingBal)}</p></div>
        {canEdit&&<button onClick={()=>setShowAdd(true)} style={S.btn(B.secondary)}>+ Entry</button>}
      </div>

      {/* Summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        <Stat label="Total In" value={fmt(totalIn)} color={B.success} icon="📥"/>
        <Stat label="Total Out" value={fmt(totalOut)} color={B.danger} icon="📤"/>
        <Stat label="Closing Balance" value={fmt(closingBal)} color={closingBal>=0?B.primary:B.danger} icon="💰"/>
      </div>

      <div style={{marginBottom:12}}>
        <input type="month" style={{...S.inp,width:160,margin:0}} value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}/>
      </div>

      <div style={S.card}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Date","Type","Description","Received From / Paid To","Amount","Balance",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {withBalance.map(e=>(
              <tr key={e.id} style={{background:e.type==="In"?"#f0fdf4":"#fff5f5"}}>
                <td style={{...S.td,fontSize:11}}>{e.date}</td>
                <td style={S.td}><Pill text={e.type} color={e.type==="In"?B.success:B.danger} bg={e.type==="In"?"#d1fae5":"#fee2e2"}/></td>
                <td style={S.td}>{e.description}</td>
                <td style={{...S.td,fontSize:11}}>{e.type==="In"?e.received_from:e.paid_to||"—"}</td>
                <td style={{...S.td,fontWeight:700,color:e.type==="In"?B.success:B.danger}}>{e.type==="In"?"+":"-"}{fmt(e.amount)}</td>
                <td style={{...S.td,fontWeight:700,color:e.running_balance>=0?B.primary:B.danger}}>{fmt(e.running_balance)}</td>
                <td style={S.td}>{canEdit&&<button onClick={async()=>{if(window.confirm("Delete?"))await pcDB.remove(e.id);}} style={{...S.ghost,fontSize:10,padding:"3px 8px",color:"#dc2626",borderColor:"#dc2626"}}>Del</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{padding:24,textAlign:"center",color:"#9fa8da"}}>No petty cash entries for this period.</div>}
      </div>

      {showAdd&&(
        <Modal title="New Petty Cash Entry" onClose={()=>setShowAdd(false)} w={480}>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            {["In","Out"].map(t=><button key={t} onClick={()=>setForm({...form,type:t})} style={{flex:1,padding:12,borderRadius:10,border:`2px solid ${form.type===t?(t==="In"?B.success:B.danger):"#c5cae9"}`,background:form.type===t?(t==="In"?"#d1fae5":"#fee2e2"):"#fff",color:form.type===t?(t==="In"?"#065f46":"#9b1c1c"):"#5c6bc0",fontSize:15,fontWeight:800,cursor:"pointer"}}>{t==="In"?"📥 Cash In":"📤 Cash Out"}</button>)}
          </div>
          <R2>
            <Fld label="Date"><input type="date" style={S.inp} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></Fld>
            <Fld label="Amount (PKR)"><input type="number" style={S.inp} value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></Fld>
          </R2>
          <Fld label="Description"><input style={S.inp} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What is this for?"/></Fld>
          <Fld label={form.type==="In"?"Received From":"Paid To"}>
            <input style={S.inp} value={form.type==="In"?form.received_from:form.paid_to} onChange={e=>setForm(form.type==="In"?{...form,received_from:e.target.value}:{...form,paid_to:e.target.value})} placeholder="Name"/>
          </Fld>
          <button onClick={save} style={{...S.btn(form.type==="In"?B.success:B.danger),width:"100%",justifyContent:"center",padding:12}}>Save Entry</button>
        </Modal>
      )}
    </div>
  );
}

// ─── ATTENDANCE MODULE ────────────────────────────────────────────────────────
function Attendance({users,currentUser}) {
  const attDB=useTable("attendance",{orderBy:"date",asc:false});
  const [selDate,setSelDate]=useState(tod());
  const [filterBranch,setFilterBranch]=useState(currentUser.branch||"Lahore (HQ)");
  // Finance Officer can view but not mark attendance
  const isViewOnly=currentUser.role===ROLES.FINANCE;

  const canMark=(date)=>{
    if(currentUser.role===ROLES.CEO) return true; // CEO can edit any date
    if(date<tod()) return false; // Others cannot edit past dates
    return currentUser.role===ROLES.BRANCH_MANAGER;
  };
  const staff=users.filter(u=>u.active&&u.role!==ROLES.CEO&&(!filterBranch||u.branch===filterBranch));
  const todayAtt=attDB.data.filter(a=>a.date===selDate&&(!filterBranch||a.branch===filterBranch));

  const markAtt=async(userId,userName,status)=>{
    const existing=todayAtt.find(a=>a.user_id===userId);
    if(existing) await attDB.update(existing.id,{status,marked_by:currentUser.name});
    else await attDB.insert({user_id:userId,user_name:userName,date:selDate,status,branch:filterBranch,marked_by:currentUser.name});
  };

  const getStatus=(userId)=>todayAtt.find(a=>a.user_id===userId)?.status||null;
  const statusColors={Present:["#065f46","#d1fae5"],Absent:["#9b1c1c","#fee2e2"],Late:["#7c5100","#fef3c7"],"Half Day":["#5b21b6","#ede9fe"],Holiday:["#1e40af","#dbeafe"],Leave:["#374151","#f3f4f9"]};

  // Monthly summary
  const [viewMonth,setViewMonth]=useState(tod().slice(0,7));
  const monthAtt=attDB.data.filter(a=>a.date?.startsWith(viewMonth)&&(!filterBranch||a.branch===filterBranch));

  const [showBulk,setShowBulk]=useState(false);
  const [bulkFrom,setBulkFrom]=useState("");
  const [bulkTo,setBulkTo]=useState(tod());
  const [bulkDefaults,setBulkDefaults]=useState({});
  const [bulkSaving,setBulkSaving]=useState(false);

  const saveBulkAttendance=async()=>{
    if(!bulkFrom||!bulkTo)return alert("Please select date range");
    if(staff.length===0)return alert("No staff found");
    setBulkSaving(true);
    // Generate all dates in range
    const dates=[];
    let d=new Date(bulkFrom);
    const end=new Date(bulkTo);
    while(d<=end){
      dates.push(d.toISOString().slice(0,10));
      d.setDate(d.getDate()+1);
    }
    // For each date and staff, insert if not exists
    for(const date of dates){
      for(const u of staff){
        const status=bulkDefaults[u.id]||"Present";
        const existing=attDB.data.find(a=>a.user_id===u.id&&a.date===date);
        if(!existing){
          await attDB.insert({user_id:u.id,user_name:u.name,date,status,branch:filterBranch,marked_by:currentUser.name+"(bulk)"});
        }
      }
    }
    setBulkSaving(false);
    setShowBulk(false);
    alert(`✅ Attendance filled for ${dates.length} days × ${staff.length} staff`);
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={S.h2}>Attendance</h2><p style={S.sub}>Daily attendance · 10AM–6PM</p></div>
        {currentUser.role===ROLES.CEO&&(
          <button onClick={()=>setShowBulk(true)} style={{...S.btn(B.warn),fontSize:12}}>📅 Fill Past Attendance</button>
        )}
      </div>

      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input type="date" style={{...S.inp,width:160,margin:0}} value={selDate} onChange={e=>setSelDate(e.target.value)}/>
        <select style={{...S.sel,width:180}} value={filterBranch} onChange={e=>setFilterBranch(e.target.value)}>
          {BRANCHES_DEFAULT.map(b=><option key={b}>{b}</option>)}
        </select>
      </div>

      {/* Mark Attendance */}
      <div style={{...S.card,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:B.dark}}>
            Mark Attendance — {selDate}
            {selDate===tod()&&<span style={{background:"#d1fae5",color:"#065f46",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700,marginLeft:8}}>Today</span>}
            {selDate<tod()&&<span style={{background:"#fef3c7",color:"#7c5100",borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:700,marginLeft:8}}>Past Date</span>}
          </div>
          {currentUser.role===ROLES.CEO&&selDate<tod()&&(
            <div style={{fontSize:11,color:"#7c5100",background:"#fef3c7",borderRadius:8,padding:"4px 10px"}}>
              🔐 CEO editing past attendance
            </div>
          )}
        </div>
        {staff.length===0&&<div style={{color:"#9fa8da",textAlign:"center",padding:20}}>No staff in this branch.</div>}
        {staff.map(u=>{
          const st=getStatus(u.id);
          return (
            <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f3f4f9"}}>
              <div>
                <div style={{fontWeight:700,color:B.dark,fontSize:13}}>{u.name}</div>
                <div style={{fontSize:11,color:"#9fa8da"}}>{u.role} · {u.branch}</div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {ATTENDANCE_STATUS.map(s=>(
                  <button key={s} onClick={()=>canMark(selDate)&&markAtt(u.id,u.name,s)} style={{padding:"5px 10px",borderRadius:8,border:`2px solid ${st===s?(statusColors[s]||["#37474f"])[0]:"#e8eaf6"}`,background:st===s?(statusColors[s]||["#37474f","#f3f4f9"])[1]:"#fff",color:st===s?(statusColors[s]||["#37474f"])[0]:"#9fa8da",fontSize:11,fontWeight:st===s?700:400,cursor:canMark(selDate)?"pointer":"default"}}>{s}</button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Past Attendance Modal */}
      {showBulk&&(
        <Modal title="📅 Fill Past Attendance (Bulk)" onClose={()=>setShowBulk(false)} w={560}>
          <div style={{background:"#fef3c7",borderRadius:10,padding:14,marginBottom:16,fontSize:12,color:"#7c5100"}}>
            ⚠️ This will fill attendance for all staff in <strong>{filterBranch}</strong> for the selected date range. Only dates with <strong>no existing record</strong> will be filled — existing records are never overwritten.
          </div>
          <R2>
            <Fld label="From Date"><input type="date" style={S.inp} value={bulkFrom} onChange={e=>setBulkFrom(e.target.value)}/></Fld>
            <Fld label="To Date"><input type="date" style={S.inp} value={bulkTo} onChange={e=>setBulkTo(e.target.value)} max={tod()}/></Fld>
          </R2>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:10}}>Default Status Per Staff Member</div>
            <div style={{fontSize:11,color:"#9fa8da",marginBottom:10}}>Set the default status for each person for the entire range. You can then go back and edit individual days.</div>
            {staff.map(u=>(
              <div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f3f4f9"}}>
                <div style={{fontWeight:700,fontSize:13,color:B.dark,minWidth:140}}>{u.name}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {["Present","Absent","Late","Half Day","Leave"].map(s=>(
                    <button key={s} onClick={()=>setBulkDefaults({...bulkDefaults,[u.id]:s})}
                      style={{padding:"4px 10px",borderRadius:8,border:`2px solid ${(bulkDefaults[u.id]||"Present")===s?"#2d3a8c":"#e8eaf6"}`,background:(bulkDefaults[u.id]||"Present")===s?"#eef0fb":"#fff",color:(bulkDefaults[u.id]||"Present")===s?"#2d3a8c":"#9fa8da",fontSize:11,fontWeight:(bulkDefaults[u.id]||"Present")===s?700:400,cursor:"pointer"}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {bulkFrom&&bulkTo&&(
            <div style={{background:"#f0f9ff",borderRadius:8,padding:12,marginBottom:14,fontSize:12,color:"#0369a1"}}>
              📊 Will fill <strong>{Math.ceil((new Date(bulkTo)-new Date(bulkFrom))/(1000*60*60*24))+1} days</strong> × <strong>{staff.length} staff members</strong> = up to <strong>{(Math.ceil((new Date(bulkTo)-new Date(bulkFrom))/(1000*60*60*24))+1)*staff.length} records</strong>
            </div>
          )}
          <button onClick={saveBulkAttendance} disabled={bulkSaving} style={{...S.btn(bulkSaving?"#9fa8da":B.success),width:"100%",justifyContent:"center",padding:12}}>
            {bulkSaving?"⏳ Saving... please wait...":"✅ Save Bulk Attendance"}
          </button>
        </Modal>
      )}

      {/* Monthly Summary */}
      <div style={{...S.card}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:B.dark}}>Monthly Summary</div>
          <input type="month" style={{...S.inp,width:150,margin:0}} value={viewMonth} onChange={e=>setViewMonth(e.target.value)}/>
        </div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Staff","Present","Absent","Late","Half Day","Leave","Deduction Days"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {staff.map(u=>{
              const uAtt=monthAtt.filter(a=>a.user_id===u.id);
              const counts={Present:0,Absent:0,Late:0,"Half Day":0,Holiday:0,Leave:0};
              uAtt.forEach(a=>{if(counts[a.status]!==undefined)counts[a.status]++;});
              const deductDays=counts.Absent*1+counts.Late*0.25+counts["Half Day"]*0.5;
              return (
                <tr key={u.id}>
                  <td style={S.td}><div style={{fontWeight:700}}>{u.name}</div></td>
                  <td style={{...S.td,color:B.success,fontWeight:700}}>{counts.Present}</td>
                  <td style={{...S.td,color:B.danger,fontWeight:700}}>{counts.Absent}</td>
                  <td style={{...S.td,color:B.warn,fontWeight:700}}>{counts.Late}</td>
                  <td style={{...S.td,color:"#7c3aed",fontWeight:700}}>{counts["Half Day"]}</td>
                  <td style={S.td}>{counts.Leave}</td>
                  <td style={{...S.td,fontWeight:800,color:deductDays>0?B.danger:B.success}}>{deductDays.toFixed(2)} days</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PAYROLL / SALARY MODULE ──────────────────────────────────────────────────
function Payroll({users,currentUser,invoices}) {
  const salaryDB=useTable("salaries",{orderBy:"created_at",asc:false});
  const advanceDB=useTable("salary_advances",{orderBy:"date",asc:false});
  const attDB=useTable("attendance",{orderBy:"date",asc:false});
  const toast=useToast();
  const [selMonth,setSelMonth]=useState(tod().slice(0,7));
  const [showAdd,setShowAdd]=useState(false);
  const [showAdvance,setShowAdvance]=useState(null);
  const [showSlip,setShowSlip]=useState(null);

  const canAccess=currentUser.role===ROLES.CEO||currentUser.role===ROLES.ACCOUNTS||currentUser.role===ROLES.FINANCE;
  if(!canAccess)return <div style={{...S.card,textAlign:"center",padding:60,color:"#9fa8da"}}>🔒 Access restricted.</div>;

  const staff=users.filter(u=>u.active&&u.role!==ROLES.CEO);
  const EF={user_id:"",basic:"",commission:"0",month:selMonth,notes:"",payment_method:"Cash"};
  const [form,setForm]=useState(EF);
  const [advForm,setAdvForm]=useState({user_id:"",amount:"",date:tod(),reason:"",deduct_month:selMonth});

  // Get deductions from attendance
  const getDeductions=(userId,month)=>{
    const uAtt=attDB.data.filter(a=>a.user_id===userId&&a.date?.startsWith(month));
    const counts={Absent:0,Late:0,"Half Day":0};
    uAtt.forEach(a=>{if(counts[a.status]!==undefined)counts[a.status]++;});
    return counts.Absent*1+counts.Late*0.25+counts["Half Day"]*0.5;
  };

  // Get pending advances for deduction
  const getPendingAdvances=(userId,month)=>advanceDB.data.filter(a=>a.user_id===userId&&a.deduct_month===month&&!a.deducted).reduce((s,a)=>s+(parseFloat(a.amount)||0),0);

  const calcNet=(userId,basic,commission)=>{
    const deductDays=getDeductions(userId,selMonth);
    const dailyRate=(parseFloat(basic)||0)/26;
    const attDeduction=deductDays*dailyRate;
    const advances=getPendingAdvances(userId,selMonth);
    const gross=(parseFloat(basic)||0)+(parseFloat(commission)||0);
    return {gross,attDeduction,advances,net:gross-attDeduction-advances};
  };

  const saveSalary=async()=>{
    if(!form.user_id||!form.basic)return;
    const user=users.find(u=>u.id===form.user_id);
    const {gross,attDeduction,advances,net}=calcNet(form.user_id,form.basic,form.commission);
    const deductDays=getDeductions(form.user_id,selMonth);
    await salaryDB.insert({...form,basic:parseFloat(form.basic),commission:parseFloat(form.commission||0),att_deduction:attDeduction,advance_deduction:advances,deduct_days:deductDays,gross,net,user_name:user?.name,paid:false,created_by:currentUser.id});
    // Mark advances as deducted
    const pendAdv=advanceDB.data.filter(a=>a.user_id===form.user_id&&a.deduct_month===selMonth&&!a.deducted);
    for(const a of pendAdv) await advanceDB.update(a.id,{deducted:true});
    setShowAdd(false);setForm(EF);
  };

  const markPaid=async(sal)=>{
    await salaryDB.update(sal.id,{paid:true,paid_date:tod(),payment_method:sal.payment_method||"Cash"});
  };

  const printSlip=(sal)=>{
    const user=users.find(u=>u.id===sal.user_id);
    const html=`<!DOCTYPE html><html><head><title>Salary Slip</title>
    <style>body{font-family:Arial;max-width:600px;margin:40px auto;padding:20px}
    .header{text-align:center;border-bottom:2px solid #2d3a8c;padding-bottom:16px;margin-bottom:20px}
    .company{font-size:20px;font-weight:900;color:#2d3a8c}.title{font-size:16px;font-weight:700;text-align:center;margin:16px 0}
    .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
    .label{color:#666;font-size:13px}.value{font-weight:700;font-size:13px}
    .total{font-size:18px;font-weight:900;color:#2d3a8c;text-align:right;padding:12px 0;border-top:2px solid #2d3a8c;margin-top:10px}
    </style></head><body>
    <div class="header"><div class="company">Border and Bridges Pvt. Ltd.</div></div>
    <div class="title">SALARY SLIP — ${sal.month}</div>
    <div class="row"><span class="label">Employee</span><span class="value">${sal.user_name||"—"}</span></div>
    <div class="row"><span class="label">Month</span><span class="value">${sal.month}</span></div>
    <div class="row"><span class="label">Basic Salary</span><span class="value">PKR ${(sal.basic||0).toLocaleString()}</span></div>
    <div class="row"><span class="label">Commission</span><span class="value">PKR ${(sal.commission||0).toLocaleString()}</span></div>
    <div class="row"><span class="label">Gross Salary</span><span class="value">PKR ${(sal.gross||0).toLocaleString()}</span></div>
    <div class="row"><span class="label">Attendance Deduction (${sal.deduct_days||0} days)</span><span class="value" style="color:#dc2626">- PKR ${(sal.att_deduction||0).toFixed(0)}</span></div>
    <div class="row"><span class="label">Advance Deduction</span><span class="value" style="color:#dc2626">- PKR ${(sal.advance_deduction||0).toLocaleString()}</span></div>
    <div class="total">NET PAYABLE: PKR ${(sal.net||0).toLocaleString()}</div>
    <div style="margin-top:20px;font-size:11px;color:#999;text-align:center">Payment Method: ${sal.payment_method||"—"} · Paid: ${sal.paid_date||"Pending"}</div>
    </body></html>`;
    const w=window.open("","_blank");w.document.write(html);w.document.close();w.print();
  };

  const monthSalaries=salaryDB.data.filter(s=>s.month===selMonth);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={S.h2}>Payroll & Salaries</h2><p style={S.sub}>{selMonth} · {monthSalaries.length} salaries processed</p></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setShowAdvance(true)} style={S.ghost}>+ Advance</button>
          {currentUser.role===ROLES.CEO&&<button onClick={()=>setShowAdd(true)} style={S.btn(B.primary)}>+ Process Salary</button>}
        </div>
      </div>

      <div style={{marginBottom:14}}>
        <input type="month" style={{...S.inp,width:160,margin:0}} value={selMonth} onChange={e=>setSelMonth(e.target.value)}/>
      </div>

      {/* Staff salary cards */}
      <div style={{display:"grid",gap:12,marginBottom:20}}>
        {staff.map(u=>{
          const sal=monthSalaries.find(s=>s.user_id===u.id);
          const deductDays=getDeductions(u.id,selMonth);
          const pendAdv=getPendingAdvances(u.id,selMonth);
          return (
            <div key={u.id} style={{...S.card,borderLeft:`4px solid ${sal?.paid?B.success:sal?B.warn:B.light}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontWeight:700,color:B.dark,fontSize:14}}>{u.name}</div>
                  <div style={{fontSize:11,color:"#9fa8da"}}>{u.role} · {u.branch}</div>
                  <div style={{display:"flex",gap:8,marginTop:6}}>
                    {deductDays>0&&<Pill text={`${deductDays.toFixed(1)} days deducted`} color="#7c5100" bg="#fef3c7"/>}
                    {pendAdv>0&&<Pill text={`Advance: ${fmt(pendAdv)}`} color="#9b1c1c" bg="#fee2e2"/>}
                  </div>
                </div>
                {sal?(
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:18,fontWeight:900,color:B.primary}}>{fmt(sal.net)}</div>
                    <div style={{fontSize:11,color:"#9fa8da"}}>Gross: {fmt(sal.gross)}</div>
                    <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"flex-end"}}>
                      <button onClick={()=>printSlip(sal)} style={{...S.ghost,fontSize:11,padding:"4px 10px"}}>🖨️ Slip</button>
                      {!sal.paid&&currentUser.role===ROLES.CEO&&<button onClick={()=>markPaid(sal)} style={{...S.btn(B.success),fontSize:11,padding:"4px 10px"}}>✓ Mark Paid</button>}
                      {sal.paid&&<Pill text="✓ Paid" color="#065f46" bg="#d1fae5"/>}
                    </div>
                  </div>
                ):(
                  <div style={{color:"#9fa8da",fontSize:12}}>Not processed yet</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Advances */}
      {advanceDB.data.filter(a=>!a.deducted).length>0&&(
        <div style={{...S.card,marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:B.danger,marginBottom:10}}>⚠️ Pending Advances (not yet deducted)</div>
          {advanceDB.data.filter(a=>!a.deducted).map(a=>{
            const u=users.find(u=>u.id===a.user_id);
            return (
              <div key={a.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f3f4f9"}}>
                <div><span style={{fontWeight:700}}>{u?.name||"—"}</span><span style={{fontSize:12,color:"#5c6bc0",marginLeft:8}}>{a.reason}</span></div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontWeight:700,color:B.danger}}>{fmt(a.amount)}</span>
                  <span style={{fontSize:11,color:"#9fa8da"}}>Deduct in: {a.deduct_month}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Process Salary Modal */}
      {showAdd&&(
        <Modal title="Process Salary" onClose={()=>setShowAdd(false)} w={520}>
          <Fld label="Select Staff Member">
            <select style={S.sel} value={form.user_id} onChange={e=>setForm({...form,user_id:e.target.value})}>
              <option value="">— Select —</option>
              {staff.filter(u=>!monthSalaries.find(s=>s.user_id===u.id)).map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </Fld>
          {form.user_id&&(()=>{
            const deductDays=getDeductions(form.user_id,selMonth);
            const pendAdv=getPendingAdvances(form.user_id,selMonth);
            const {gross,attDeduction,net}=calcNet(form.user_id,form.basic,form.commission);
            return (
              <div>
                <R2>
                  <Fld label="Basic Salary (PKR)"><input type="number" style={S.inp} value={form.basic} onChange={e=>setForm({...form,basic:e.target.value})}/></Fld>
                  <Fld label="Commission (PKR)"><input type="number" style={S.inp} value={form.commission} onChange={e=>setForm({...form,commission:e.target.value})}/></Fld>
                </R2>
                {form.basic&&(
                  <div style={{background:"#f8f9ff",borderRadius:10,padding:14,marginBottom:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:8}}>Salary Breakdown</div>
                    {[["Basic",fmt(form.basic)],["Commission",fmt(form.commission||0)],["Gross",fmt(gross)],[`Att. Deduction (${deductDays.toFixed(1)}d)`,`- ${fmt(attDeduction)}`],[`Advance Deduction`,`- ${fmt(pendAdv)}`]].map(([l,v])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:13}}>
                        <span style={{color:"#5c6bc0"}}>{l}</span><span style={{fontWeight:700}}>{v}</span>
                      </div>
                    ))}
                    <div style={{borderTop:"2px solid #2d3a8c",marginTop:8,paddingTop:8,display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontWeight:800,color:B.dark}}>Net Payable</span>
                      <span style={{fontWeight:900,fontSize:16,color:B.primary}}>{fmt(net)}</span>
                    </div>
                  </div>
                )}
                <Fld label="Payment Method">
                  <div style={{display:"flex",gap:6}}>
                    {["Cash","Bank Transfer"].map(m=><button key={m} onClick={()=>setForm({...form,payment_method:m})} style={{padding:"6px 14px",borderRadius:8,border:`2px solid ${form.payment_method===m?B.primary:"#c5cae9"}`,background:form.payment_method===m?B.light:"#fff",color:form.payment_method===m?B.primary:"#5c6bc0",fontSize:12,fontWeight:600,cursor:"pointer"}}>{m}</button>)}
                  </div>
                </Fld>
              </div>
            );
          })()}
          <button onClick={saveSalary} style={{...S.btn(B.primary),width:"100%",justifyContent:"center",padding:12}}>Process & Save Salary</button>
        </Modal>
      )}

      {/* Advance Modal */}
      {showAdvance&&(
        <Modal title="Give Salary Advance" onClose={()=>setShowAdvance(null)} w={440}>
          <Fld label="Staff Member">
            <select style={S.sel} value={advForm.user_id} onChange={e=>setAdvForm({...advForm,user_id:e.target.value})}>
              <option value="">— Select —</option>
              {staff.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Fld>
          <R2>
            <Fld label="Amount (PKR)"><input type="number" style={S.inp} value={advForm.amount} onChange={e=>setAdvForm({...advForm,amount:e.target.value})}/></Fld>
            <Fld label="Date"><input type="date" style={S.inp} value={advForm.date} onChange={e=>setAdvForm({...advForm,date:e.target.value})}/></Fld>
          </R2>
          <Fld label="Reason"><input style={S.inp} value={advForm.reason} onChange={e=>setAdvForm({...advForm,reason:e.target.value})} placeholder="Reason for advance"/></Fld>
          <Fld label="Deduct in Month"><input type="month" style={S.inp} value={advForm.deduct_month} onChange={e=>setAdvForm({...advForm,deduct_month:e.target.value})}/></Fld>
          <button onClick={async()=>{if(!advForm.user_id||!advForm.amount)return;await advanceDB.insert({...advForm,amount:parseFloat(advForm.amount),deducted:false,created_by:currentUser.id});setShowAdvance(null);setAdvForm({user_id:"",amount:"",date:tod(),reason:"",deduct_month:selMonth});}} style={{...S.btn(B.warn),width:"100%",justifyContent:"center",padding:12}}>Give Advance</button>
        </Modal>
      )}
    </div>
  );
}

// ─── STAFF LEDGER ─────────────────────────────────────────────────────────────
function StaffLedger({users,currentUser}) {
  const salaryDB=useTable("salaries",{orderBy:"month",asc:false});
  const advanceDB=useTable("salary_advances",{orderBy:"date",asc:false});
  const [selUser,setSelUser]=useState("");

  const canAccess=currentUser.role===ROLES.CEO||currentUser.role===ROLES.ACCOUNTS||currentUser.role===ROLES.FINANCE;
  if(!canAccess)return <div style={{...S.card,textAlign:"center",padding:60,color:"#9fa8da"}}>🔒 Access restricted.</div>;

  const staff=users.filter(u=>u.active&&u.role!==ROLES.CEO);
  const userSalaries=salaryDB.data.filter(s=>!selUser||s.user_id===selUser);
  const userAdvances=advanceDB.data.filter(a=>!selUser||a.user_id===selUser);

  const totalEarned=userSalaries.reduce((a,s)=>a+(s.gross||0),0);
  const totalDeductions=userSalaries.reduce((a,s)=>a+(s.att_deduction||0)+(s.advance_deduction||0),0);
  const totalNet=userSalaries.reduce((a,s)=>a+(s.net||0),0);
  const totalPaid=userSalaries.filter(s=>s.paid).reduce((a,s)=>a+(s.net||0),0);
  const totalAdvances=userAdvances.reduce((a,a2)=>a+(a2.amount||0),0);

  return (
    <div>
      <div style={{marginBottom:18}}><h2 style={S.h2}>Staff Ledger</h2><p style={S.sub}>Complete payment history per staff member</p></div>

      <Fld label="Select Staff Member">
        <select style={{...S.sel,maxWidth:300}} value={selUser} onChange={e=>setSelUser(e.target.value)}>
          <option value="">— All Staff —</option>
          {staff.map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
        </select>
      </Fld>

      {/* Summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginBottom:20}}>
        <Stat label="Total Earned" value={fmt(totalEarned)} color={B.primary} icon="💼"/>
        <Stat label="Total Deductions" value={fmt(totalDeductions)} color={B.danger} icon="➖"/>
        <Stat label="Net Payable" value={fmt(totalNet)} color={B.secondary} icon="💰"/>
        <Stat label="Total Paid" value={fmt(totalPaid)} color={B.success} icon="✓"/>
        <Stat label="Total Advances" value={fmt(totalAdvances)} color={B.warn} icon="⚡"/>
      </div>

      {/* Salary History */}
      <div style={{...S.card,marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>Salary History</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Month","Staff","Basic","Commission","Gross","Deductions","Net","Method","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {userSalaries.map(s=>(
              <tr key={s.id}>
                <td style={{...S.td,fontWeight:700}}>{s.month}</td>
                <td style={S.td}>{s.user_name||users.find(u=>u.id===s.user_id)?.name||"—"}</td>
                <td style={S.td}>{fmt(s.basic)}</td>
                <td style={S.td}>{fmt(s.commission)}</td>
                <td style={{...S.td,fontWeight:700}}>{fmt(s.gross)}</td>
                <td style={{...S.td,color:B.danger}}>{fmt((s.att_deduction||0)+(s.advance_deduction||0))}</td>
                <td style={{...S.td,fontWeight:800,color:B.primary}}>{fmt(s.net)}</td>
                <td style={{...S.td,fontSize:11}}>{s.payment_method||"—"}</td>
                <td style={S.td}><Pill text={s.paid?"✓ Paid":"Pending"} color={s.paid?"#065f46":"#7c5100"} bg={s.paid?"#d1fae5":"#fef3c7"}/></td>
              </tr>
            ))}
          </tbody>
        </table>
        {userSalaries.length===0&&<div style={{padding:24,textAlign:"center",color:"#9fa8da"}}>No salary records yet.</div>}
      </div>

      {/* Advances History */}
      <div style={S.card}>
        <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>Advances History</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Date","Staff","Amount","Reason","Deduct Month","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {userAdvances.map(a=>(
              <tr key={a.id}>
                <td style={{...S.td,fontSize:11}}>{a.date}</td>
                <td style={S.td}>{users.find(u=>u.id===a.user_id)?.name||"—"}</td>
                <td style={{...S.td,fontWeight:700,color:B.danger}}>{fmt(a.amount)}</td>
                <td style={S.td}>{a.reason||"—"}</td>
                <td style={S.td}>{a.deduct_month}</td>
                <td style={S.td}><Pill text={a.deducted?"✓ Deducted":"Pending"} color={a.deducted?"#065f46":"#9b1c1c"} bg={a.deducted?"#d1fae5":"#fee2e2"}/></td>
              </tr>
            ))}
          </tbody>
        </table>
        {userAdvances.length===0&&<div style={{padding:24,textAlign:"center",color:"#9fa8da"}}>No advances recorded.</div>}
      </div>
    </div>
  );
}

// ─── INVOICE TEMPLATE DESIGNER ────────────────────────────────────────────────
function InvoiceTemplateDesigner({currentUser,settings,settingsDB}) {
  const [tmpl,setTmpl]=useState(()=>{
    try{return JSON.parse(settings?.invoice_template||"{}");}catch{return {};}
  });
  const [saved,setSaved]=useState(false);

  if(currentUser.role!==ROLES.CEO)
    return <div style={{...S.card,textAlign:"center",padding:60,color:"#9fa8da"}}>🔒 CEO only.</div>;

  const save=async()=>{
    const existing=settingsDB.data.find(s=>s.key==="invoice_template");
    const val=JSON.stringify(tmpl);
    if(existing) await settingsDB.update(existing.id,{value:val});
    else await settingsDB.insert({key:"invoice_template",value:val});
    // Also save prefix and terms
    for(const [k,v] of [["invoice_prefix",tmpl.prefix||"BNB"],["invoice_terms",tmpl.terms||""],["company_name",tmpl.company||""],["address",tmpl.address||""],["phone",tmpl.phone||""]]) {
      const ex=settingsDB.data.find(s=>s.key===k);
      if(ex) await settingsDB.update(ex.id,{value:v});
      else await settingsDB.insert({key:k,value:v});
    }
    setSaved(true);setTimeout(()=>setSaved(false),2000);
  };

  const colors=["#2d3a8c","#1a91c7","#059669","#dc2626","#7c3aed","#d97706","#1a2057","#374151"];

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={S.h2}>Invoice Template Designer</h2><p style={S.sub}>Design your invoice and receipt layout — used everywhere</p></div>
        <button onClick={save} style={S.btn(saved?B.success:B.primary)}>{saved?"✓ Saved!":"Save Template"}</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        {/* Settings */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={S.card}>
            <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>Company Details</div>
            {/* Logo Upload */}
            <Fld label="Company Logo">
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:8}}>
                {tmpl.logo&&<img src={tmpl.logo} alt="Logo" style={{height:50,maxWidth:150,objectFit:"contain",border:"1px solid #e8eaf6",borderRadius:8,padding:4}}/>}
                {!tmpl.logo&&<div style={{width:80,height:50,background:"#f8f9ff",border:"2px dashed #c5cae9",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#9fa8da"}}>No Logo</div>}
                <div>
                  <input type="file" accept="image/*" id="logo-upload" style={{display:"none"}} onChange={e=>{
                    const file=e.target.files[0];
                    if(!file)return;
                    if(file.size>500000){alert("Logo file too large. Please use an image under 500KB.");return;}
                    const reader=new FileReader();
                    reader.onload=ev=>setTmpl({...tmpl,logo:ev.target.result});
                    reader.readAsDataURL(file);
                  }}/>
                  <label htmlFor="logo-upload" style={{...S.btn(B.primary),fontSize:11,padding:"6px 14px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4}}>📁 Upload Logo</label>
                  {tmpl.logo&&<button onClick={()=>setTmpl({...tmpl,logo:""})} style={{...S.ghost,fontSize:11,padding:"5px 10px",marginLeft:8,color:"#dc2626",borderColor:"#dc2626"}}>Remove</button>}
                </div>
              </div>
              <div style={{fontSize:10,color:"#9fa8da"}}>PNG, JPG or SVG · Max 500KB · Recommended: transparent PNG</div>
            </Fld>
            <Fld label="Company Name"><input style={S.inp} value={tmpl.company||""} onChange={e=>setTmpl({...tmpl,company:e.target.value})} placeholder="Border and Bridges Pvt. Ltd."/></Fld>
            <Fld label="Address"><input style={S.inp} value={tmpl.address||""} onChange={e=>setTmpl({...tmpl,address:e.target.value})} placeholder="Office address"/></Fld>
            <Fld label="Phone"><input style={S.inp} value={tmpl.phone||""} onChange={e=>setTmpl({...tmpl,phone:e.target.value})} placeholder="+92 42 XXXXXXX"/></Fld>
            <Fld label="Email"><input style={S.inp} value={tmpl.email||""} onChange={e=>setTmpl({...tmpl,email:e.target.value})} placeholder="info@bordernbridges.com"/></Fld>
          </div>

          <div style={S.card}>
            <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>Invoice Settings</div>
            <Fld label="Invoice Prefix"><input style={S.inp} value={tmpl.prefix||"BNB"} onChange={e=>setTmpl({...tmpl,prefix:e.target.value})} placeholder="e.g. BNB"/></Fld>
            <Fld label="Logo Position">
              <div style={{display:"flex",gap:8}}>
                {["Left","Center","Right"].map(p=><button key={p} onClick={()=>setTmpl({...tmpl,logo_position:p})} style={{flex:1,padding:"7px",borderRadius:8,border:`2px solid ${tmpl.logo_position===p?B.primary:"#c5cae9"}`,background:tmpl.logo_position===p?B.light:"#fff",color:tmpl.logo_position===p?B.primary:"#5c6bc0",fontSize:12,fontWeight:600,cursor:"pointer"}}>{p}</button>)}
              </div>
            </Fld>
            <Fld label="Primary Color">
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {colors.map(c=><button key={c} onClick={()=>setTmpl({...tmpl,primary_color:c})} style={{width:32,height:32,borderRadius:"50%",background:c,border:tmpl.primary_color===c?"3px solid #000":"3px solid transparent",cursor:"pointer"}}/>)}
              </div>
            </Fld>
          </div>

          <div style={S.card}>
            <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>Footer & Terms</div>
            <Fld label="Footer Message"><input style={S.inp} value={tmpl.footer||""} onChange={e=>setTmpl({...tmpl,footer:e.target.value})} placeholder="Thank you for choosing Border and Bridges"/></Fld>
            <Fld label="Terms & Conditions"><textarea style={{...S.inp,minHeight:80,resize:"vertical"}} value={tmpl.terms||""} onChange={e=>setTmpl({...tmpl,terms:e.target.value})} placeholder="All fees are non-refundable…"/></Fld>
            <Fld label="Bank Details (for invoices)"><textarea style={{...S.inp,minHeight:60,resize:"vertical"}} value={tmpl.bank_details||""} onChange={e=>setTmpl({...tmpl,bank_details:e.target.value})} placeholder="Bank: HBL&#10;Account: XXXX-XXXX&#10;Title: Border and Bridges"/></Fld>
          </div>
        </div>

        {/* Live Preview */}
        <div style={S.card}>
          <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>Live Preview</div>
          <div style={{border:"1px solid #e8eaf6",borderRadius:8,overflow:"hidden",fontSize:11}}>
            {/* Header */}
            <div style={{background:tmpl.primary_color||B.primary,padding:"16px 20px",color:"#fff",textAlign:tmpl.logo_position==="Center"?"center":tmpl.logo_position==="Right"?"right":"left"}}>
              {tmpl.logo&&<img src={tmpl.logo} alt="Logo" style={{height:40,maxWidth:120,objectFit:"contain",marginBottom:8,display:"block",margin:tmpl.logo_position==="Center"?"0 auto 6px":tmpl.logo_position==="Right"?"0 0 6px auto":"0 0 6px 0"}}/>}
              <div style={{fontSize:16,fontWeight:900}}>{tmpl.company||"Border and Bridges Pvt. Ltd."}</div>
              <div style={{opacity:0.8,marginTop:2}}>{tmpl.address||"Lahore, Pakistan"}</div>
              <div style={{opacity:0.8}}>{tmpl.phone||""} {tmpl.email||""}</div>
            </div>
            {/* Body */}
            <div style={{padding:"16px 20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <div><div style={{fontSize:12,color:"#9fa8da"}}>INVOICE TO</div><div style={{fontWeight:700}}>Sample Client</div><div style={{color:"#5c6bc0"}}>🇬🇧 UK</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:900,color:tmpl.primary_color||B.primary}}>{tmpl.prefix||"BNB"}-2026-0001</div><div style={{color:"#9fa8da"}}>Date: {tod()}</div></div>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",marginBottom:12}}>
                <thead><tr style={{background:"#f8f9ff"}}><th style={{padding:"6px 8px",textAlign:"left",fontSize:10,color:"#9fa8da"}}>SERVICE</th><th style={{padding:"6px 8px",textAlign:"right",fontSize:10,color:"#9fa8da"}}>AMOUNT</th></tr></thead>
                <tbody>
                  <tr><td style={{padding:"6px 8px",borderBottom:"1px solid #f3f4f9"}}>Student Visa Application (UK)</td><td style={{padding:"6px 8px",textAlign:"right",fontWeight:700}}>PKR 50,000</td></tr>
                  <tr><td style={{padding:"6px 8px",borderBottom:"1px solid #f3f4f9"}}>SOP / Personal Statement Writing</td><td style={{padding:"6px 8px",textAlign:"right",fontWeight:700}}>PKR 10,000</td></tr>
                </tbody>
              </table>
              <div style={{textAlign:"right",fontWeight:900,fontSize:14,color:tmpl.primary_color||B.primary,marginBottom:12}}>Total: PKR 60,000</div>
              {tmpl.bank_details&&<div style={{background:"#f8f9ff",borderRadius:6,padding:"8px 12px",fontSize:10,color:"#5c6bc0",whiteSpace:"pre-line",marginBottom:8}}>{tmpl.bank_details}</div>}
            </div>
            {/* Footer */}
            <div style={{background:"#f8f9ff",padding:"10px 20px",textAlign:"center",fontSize:10,color:"#9fa8da",borderTop:"1px solid #e8eaf6"}}>
              {tmpl.footer||"Thank you for choosing Border and Bridges"}
              {tmpl.terms&&<div style={{marginTop:4,fontSize:9}}>{tmpl.terms}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── ACL BULK IMPORT (from Excel) ────────────────────────────────────────────
function ACLImport({leadsDB,tasksDB,currentUser}) {
  const ACL_DATA = [{"name": "Mahaz Ali", "phone": "", "email": "", "country": "Malaysia", "list": "ACL", "university": "LSBF, INTI", "intake": "January 2026", "processing_stage": "Acceptance Confirmed", "portal": "GEN", "b2b_b2c": "B2C", "source_type": "direct", "external_agent_name": "", "referred_by_staff": "", "original_source": "Sir Bilal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "02-04-2026 Registration fee paid in LSBF college.LSBF college offer receive on 28-03-2026. Admission sent in HEC for malaysia/ SBM's offer letter pending.. intervoew was rejeced in first attempt", "conditions": "", "app_receive_date": "2025-01-20", "offer_date": "2025-02-06", "admission_sent_date": "SBM", "counselor_notes": "SBM's offer letter pending.. intervoew was rejeced in first attempt", "todo": ""}, {"name": "Wasif Javeed", "phone": "", "email": "", "country": "Canada", "list": "ACL", "university": "Immigration", "intake": "2025", "processing_stage": "Applied to University", "portal": "Bnb", "b2b_b2c": "B2C", "source_type": "direct", "external_agent_name": "", "referred_by_staff": "", "original_source": "BNB", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "ITA pending", "conditions": "", "app_receive_date": "", "offer_date": "", "admission_sent_date": "", "counselor_notes": "", "todo": ""}, {"name": "Rbiya", "phone": "", "email": "", "country": "USA", "list": "ACL", "university": "Immigration", "intake": "2025", "processing_stage": "Applied to University", "portal": "bnb", "b2b_b2c": "B2C", "source_type": "direct", "external_agent_name": "", "referred_by_staff": "", "original_source": "BNB", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Decision pending", "conditions": "", "app_receive_date": "", "offer_date": "", "admission_sent_date": "", "counselor_notes": "", "todo": ""}, {"name": "Muhammad Usama", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Brighton, LMU, GCU,DMU", "intake": "May 2026", "processing_stage": "Acceptance Confirmed", "portal": "BAC / GEn, Crizac, Uni-partner", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Samiya Ayyub", "original_source": "Samiya", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Rejected in Hull via adiuvo. applied in Hull via adivou profile is under consideration. /his entry requirements meet in regent college london . will apply on monday Preparing for english toefl... defer to mid intake/ Offer has to be finalized by student /Conditional offer received Brighton\nAdmission sent UWS-London\n| Offer Received LSBU | UWL : SOP upload : 16-09-2025\nAdmission sent in GEN on 21-08-2025 for january intake 2026. @fajar\n\nOffer not received due to his academic background in CA... recommended him Finlan option of University of Vassa ... confirmation pending from his side", "conditions": "Fee", "app_receive_date": "2025-05-27", "offer_date": "05-11-2025\nBrighton", "admission_sent_date": "25-10-2025\nUWS-London\nDMU", "counselor_notes": "Preparing for english toefl... defer to mid intake", "todo": "need options// 17 in Speaking toefl"}, {"name": "Saima ref samiya", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Roehampton, LMU,ARU", "intake": "May 2026", "processing_stage": "Acceptance Confirmed", "portal": "Crizac", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Samiya Ayyub", "original_source": "Samiya", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Roehapmton university offer receuved in extended master ... regent college offer pending Mid intake ....Course not available in Jan 2026 Alternative course link shared\nEnglish test pending /Admission sent to Roehampton\nIELTS booked for 30th oct/ Conditional offer received\nDeferment request submitted ARU ,\nLMU Refund applied on 28-08-2025 Got rejected in credibility interview LMU Cas shield submitted on 07-08-2025/Fee paid to LMU on 29-07-2025/ARU offer receive 16-07-2025,LMU offer receive", "conditions": "English", "app_receive_date": "16-07-2025", "offer_date": "ARU", "admission_sent_date": "06-11-2025\nRoehampton\n03-09-2025\nDeferment", "counselor_notes": "English test pending ..Language cert speaking will be held by 10 or 11 nov", "todo": "Deposit ARU"}, {"name": "Asees George", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "TU, RBU, NU", "intake": "May 2026", "processing_stage": "Offer Letter Received", "portal": "Crizac / Uni partner", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Wajih consultant", "referred_by_staff": "", "original_source": "Wajih consultant", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Now agents wants August intake offer/Offer letter received northumbria , ravensbourne", "conditions": "-", "app_receive_date": "Ulster", "offer_date": "UC", "admission_sent_date": "RBU,NU,", "counselor_notes": "Apply to another universities", "todo": ""}, {"name": "Shazil Abbas", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "UWL, ULaw, LSBU, Oxford Brookes, RCL", "intake": "May 2026", "processing_stage": "Offer Letter Received", "portal": "infinite / geebee / NCA, Intled", "b2b_b2c": "B2C", "source_type": "direct", "external_agent_name": "", "referred_by_staff": "", "original_source": "Sir Bilal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "DEFER TO NEXT INTAKE... Requested for interview slot/ PTE reappearing... applied in finland on 28-01-2026 ...Regent college offer received", "conditions": "", "app_receive_date": "2025-10-25", "offer_date": "RCL", "admission_sent_date": "07-11-2025\nUWL\n06-11-2025\nULaw\n06-11-2025\nLSBU\n06-11-2025\nOxford", "counselor_notes": "offer pending ..and pte pending", "todo": "PTE Min 56 total 63 need offer"}, {"name": "Raheeb Kamal", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "UEL, Greenwich, ULan, LSBU, BU, Liverpool john, Bcu, Cardiff met", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "Geebee", "b2b_b2c": "B2C", "source_type": "direct", "external_agent_name": "", "referred_by_staff": "", "original_source": "Sir Bilal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Applied in UEL, Greenwich, Ulan, LSBU, BU, Liverpool john, BCU, Cardiff", "conditions": "-", "app_receive_date": "2025-10-25", "offer_date": "RCL", "admission_sent_date": "UEL,", "counselor_notes": "Offer pending", "todo": "BUIC interview deadline 28"}, {"name": "Umair Ahmad", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "BNU", "intake": "September 2026", "processing_stage": "Acceptance Confirmed", "portal": "Crizac", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Fine star", "referred_by_staff": "", "original_source": "Fine star", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "interview on cas shield will start in April for sep intake. Request sent for CAS shield Greenwich /Revise UC received from greenwich on 04-02-2026/ BNU offer provisional receive 15-01-2026 Refund applied in greenwich", "conditions": "Refund pending", "app_receive_date": "30-10-2025\nGreenwich\n30-10-2025\nUEL", "offer_date": "revise", "admission_sent_date": "30-10-2025\nGreenwich\n30-10-2025\nUEL", "counselor_notes": "Refund from Greenwich university and appiied at BNU .. Request for offical letter from", "todo": ""}, {"name": "Manan Mohsin", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "OIG, Study Group, Navitas, Brunel, BCU, ULAW", "intake": "May 2026", "processing_stage": "Offer Letter Received", "portal": "GEN, Intled, Way-finder", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Wajhi Consultant", "referred_by_staff": "", "original_source": "Wajhi Consultant", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "HIC interview booked for 1st april. HIC interview pending. HIC offer received and NTU offer received", "conditions": "Interview", "app_receive_date": "Any", "offer_date": "11-11-2025\nBrunel", "admission_sent_date": "08-11-2025\nOIG\n08-11-2025\nStudy", "counselor_notes": "Foundation course .. admisison sent to GEN", "todo": ""}, {"name": "Sajawal Hussain Sabir", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": ", Hull-London", "intake": "May 2026", "processing_stage": "Visa Rejected", "portal": "Crizac", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Tabish Iqbal", "original_source": "Tabish Iqbal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Degree Pending Refund Received", "conditions": "Interview", "app_receive_date": "06-11-2025\nQueen", "offer_date": "11-11-2025\nHull-London", "admission_sent_date": "06-11-2025\nQueen", "counselor_notes": "this case has been directly dealing by Tabish", "todo": "Today test"}, {"name": "Abdullah Bin Masood", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "DMU, Leeds Trinity", "intake": "May 2026", "processing_stage": "Shortlisting", "portal": "Unipartner / Leed Trinity Portal", "b2b_b2c": "B2C", "source_type": "direct", "external_agent_name": "", "referred_by_staff": "", "original_source": "Sir Bilal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "USA university of Hartford offer leter receive on 28-03-2026. has decieded two options UK for sep intake and usa at the same time ... UC received from Cardiff metropoitan/ Underprocess in Cardiff metropolitan and bangor, Ravensbourne, Rejected from BNU and teesside due to long gap.", "conditions": "-", "app_receive_date": "06-11-2025\nDMU\n06-11-2025\nLeeds", "offer_date": "12-11-2025\nDMU", "admission_sent_date": "Ulster", "counselor_notes": "DMU deferment and BNU admission pending", "todo": "DMU offer receive 8 bands in IELTS"}, {"name": "Usama AMin", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Arden, LMU", "intake": "May 2026", "processing_stage": "Shortlisting", "portal": "geebee", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Amina Liaqat", "original_source": "Amina", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Northumbria has closed the recruitment ... suggested him to opt deiplomas from our platform .. UC received from Northumbria/ Needs to reapply in LMU", "conditions": "-", "app_receive_date": "07-11-2025\nArden", "offer_date": "LMU", "admission_sent_date": "07-11-2025\nArden\n14-11-2025\nLMU", "counselor_notes": "Amina will look into this directly", "todo": "Offer received LMU/Interview booking"}, {"name": "Noor Alam", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Arden, DMU", "intake": "May 2026", "processing_stage": "Offer Letter Received", "portal": "geebee / Unipartner", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Samiya Ayyub", "original_source": "Samiya", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "he is from Neelum.. applied in multiple options and refund applied from dmu .. Applied in NUT, Hull, UEL/ offer received from Regent and requested for ian interview slot to .. Deferment requested in DMU and applied in RCL .", "conditions": "-", "app_receive_date": "10-11-2025\nArden\n10-11-2025\nDMU", "offer_date": "DMU", "admission_sent_date": "10-11-2025\nArden\n10-11-2025\nDMU", "counselor_notes": "DMU interview is schduled for 22nd dc", "todo": "Job near office student/need more options but DMU confirmed"}, {"name": "Shah fahad", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "DMU", "intake": "May 2026", "processing_stage": "Applied to University", "portal": "Crizac", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Fine star", "referred_by_staff": "", "original_source": "Fine star", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Student did not attended pre-screning. KPK students are not acceptale in bangor and roehampton. Applied in Bradford on 27-02-2026 Applied in Bangor and roehampton on 26-02-2026", "conditions": "Refund pending", "app_receive_date": "DMU", "offer_date": "DMU", "admission_sent_date": "DMU", "counselor_notes": "", "todo": ""}, {"name": "Usman Gujjar", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "DMU", "intake": "April 2026", "processing_stage": "Applied to University", "portal": "Uni partner", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Tabish Iqbal", "original_source": "Tabish Iqbal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "English Test Pending", "conditions": "-", "app_receive_date": "17-12-2025", "offer_date": "-", "admission_sent_date": "17-12-2025", "counselor_notes": "", "todo": ""}, {"name": "Muhammad Hamza Ref Mumtaz", "phone": "", "email": "", "country": "North Cyprus", "list": "ACL", "university": "American Uni", "intake": "February 2026", "processing_stage": "Applied to University", "portal": "-", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Tabish Iqbal", "original_source": "Tabish Iqbal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Anatolia Decision pending", "conditions": "English test", "app_receive_date": "-", "offer_date": "American", "admission_sent_date": "-", "counselor_notes": "", "todo": ""}, {"name": "Sajjad", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Northumbria London|, Bradford |, LMU", "intake": "May 2026", "processing_stage": "Offer Letter Received", "portal": "Crizac", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Tabish Iqbal", "original_source": "Tabish Iqbal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Offer Receive Bradford", "conditions": "English test", "app_receive_date": "-", "offer_date": "Bradford", "admission_sent_date": "-", "counselor_notes": "", "todo": ""}, {"name": "Abdur Raheem", "phone": "", "email": "", "country": "USA", "list": "ACL", "university": "Westcliff", "intake": "May 2026", "processing_stage": "CAS/CoE/I-20 Received", "portal": "Geebe", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Tabish Iqbal", "original_source": "Tabish Iqbal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "I-20 Received i-20 fee Received 1000 USD | Stanton Offer receive on 27-01-2026", "conditions": "-", "app_receive_date": "-", "offer_date": "2026-01-27", "admission_sent_date": "-", "counselor_notes": "", "todo": ""}, {"name": "Zaryab", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "UWS , LMU", "intake": "May 2026", "processing_stage": "Applied to University", "portal": "Intel , Crizac", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Tabish Iqbal", "original_source": "Tabish Iqbal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "English Test Pending", "conditions": "-", "app_receive_date": "-", "offer_date": "-", "admission_sent_date": "-", "counselor_notes": "", "todo": ""}, {"name": "Sabiha", "phone": "", "email": "", "country": "Australia", "list": "ACL", "university": "WSU, Deakin", "intake": "2026", "processing_stage": "Offer Letter Received", "portal": "GEN", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Prime consultant", "referred_by_staff": "", "original_source": "Prime consultant", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Agent not responding. GS documents pending and documents for Offer letter received from Canberra university/ Rejected from WAU and deakin.", "conditions": "-", "app_receive_date": "2026-01-20", "offer_date": "Canberra", "admission_sent_date": "2026-01-21", "counselor_notes": "", "todo": ""}, {"name": "Amiq", "phone": "", "email": "", "country": "Finland", "list": "ACL", "university": "VAMK, VAASA,UEF, Jyvaskyla", "intake": "2026", "processing_stage": "Offer Letter Received", "portal": "Adiuvo", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Khan associate", "referred_by_staff": "", "original_source": "Khan associate", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Agents also want MRes offer as an backup but student has low ielts/ Rejected from VAASA and other decision are pending/ Application punched and fee paid", "conditions": "-", "app_receive_date": "2026-01-21", "offer_date": "-", "admission_sent_date": "2026-01-21", "counselor_notes": "", "todo": ""}, {"name": "Jannat", "phone": "", "email": "", "country": "Sweden", "list": "ACL", "university": "LU,KU,UW", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "KC", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Samiya Ayyub", "original_source": "Samiya", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Sweden for Jan 2027 intake ... rejected from all universities duw ti low bands in Tofel .. Admission applied", "conditions": "English test", "app_receive_date": "2026-01-14", "offer_date": "-", "admission_sent_date": "2025-01-14", "counselor_notes": "", "todo": ""}, {"name": "Rooh Ullah", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Bangor", "intake": "May 2026", "processing_stage": "Applied to University", "portal": "Geebee", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Samiya Ayyub", "original_source": "Samiya", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Applied in university of Leicester 30-03-2026. Duolingo test pending and he is from kpk ..Applied in bangor via geebee/ Applied in DMU ..", "conditions": "-", "app_receive_date": "2026-03-07", "offer_date": "-", "admission_sent_date": "2026-03-09", "counselor_notes": "", "todo": ""}, {"name": "Iram Waqas", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Derbay", "intake": "May 2026", "processing_stage": "Shortlisting", "portal": "Way-Finder", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Tabish Iqbal", "original_source": "Tabish Iqbal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Admission Apply MREs", "conditions": "-", "app_receive_date": "2026-02-09", "offer_date": "-", "admission_sent_date": "2026-02-09", "counselor_notes": "", "todo": ""}, {"name": "Faria Mehwish", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "LTU", "intake": "May 2026", "processing_stage": "Shortlisting", "portal": "Miss sanam", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Study flag", "referred_by_staff": "", "original_source": "Study flag", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Got rejected because student visa is expiring on may 28th", "conditions": "-", "app_receive_date": "2026-02-13", "offer_date": "-", "admission_sent_date": "2026-02-17", "counselor_notes": "", "todo": ""}, {"name": "M Subhan", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Abertay", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "Geebee", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Study4U", "referred_by_staff": "", "original_source": "Study4U", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Applied in Abertay 02-04-2026", "conditions": "-", "app_receive_date": "2026-04-02", "offer_date": "-", "admission_sent_date": "02-04-2026", "counselor_notes": "", "todo": ""}, {"name": "Arslan Afzal", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Abertay", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "Geebee", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Study global", "referred_by_staff": "", "original_source": "Study global", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Applied in abertay 02-04-2026", "conditions": "IELTS, SOP", "app_receive_date": "2026-04-02", "offer_date": "-", "admission_sent_date": "02-04-2026", "counselor_notes": "", "todo": ""}, {"name": "Raja Ali", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Keele", "intake": "September 2026", "processing_stage": "Offer Letter Received", "portal": "Study reach", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Study flag", "referred_by_staff": "", "original_source": "Study flag", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "offer keele received/ Applied in keele via study reach", "conditions": "-", "app_receive_date": "2026-02-25", "offer_date": "2026-03-26", "admission_sent_date": "2026-02-26", "counselor_notes": "", "todo": ""}, {"name": "Khalil ur rehman", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "GSU, YCP,SHU, Teesside, Ulster", "intake": "May 2026", "processing_stage": "Acceptance Confirmed", "portal": "Geebee, Crizac", "b2b_b2c": "B2C", "source_type": "direct", "external_agent_name": "", "referred_by_staff": "", "original_source": "Sir Bilal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "offer letter received from Houston college ..asked for I-20 Charges .. Admission sent to GEN on 28-01-2026 Applications are under review in US universities, Rejected from Ulster university", "conditions": "-", "app_receive_date": "2026-01-08", "offer_date": "Offer", "admission_sent_date": "2026-01-08", "counselor_notes": "", "todo": ""}, {"name": "Attiq ur rehman", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "GSU, YCP,SHU, Teesside, Ulster", "intake": "May 2026", "processing_stage": "Acceptance Confirmed", "portal": "Geebee, Crizac", "b2b_b2c": "B2C", "source_type": "direct", "external_agent_name": "", "referred_by_staff": "", "original_source": "Sir Bilal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Embassy fee has been paid and appointment booking is pending ...Admission sent to GEN on 28-01-2026 Applications are under review in US universities, Rejected from Ulster university", "conditions": "-", "app_receive_date": "2026-01-08", "offer_date": "Offer", "admission_sent_date": "2026-01-08", "counselor_notes": "", "todo": ""}, {"name": "Zain ul Hassan", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "ARU, Roehampton", "intake": "May 2026", "processing_stage": "Acceptance Confirmed", "portal": "Crizac,Adiuvo", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Sir Wahab", "original_source": "Sir Wahab", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "DUIC offer received on 31-01-2026 Applied in DUIC & BUIC /Admission sent on 26-01-2026", "conditions": "-", "app_receive_date": "ARU", "offer_date": "DUIC", "admission_sent_date": "ARU", "counselor_notes": "", "todo": ""}, {"name": "Nadeem ref samiya", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Wolverhampton, Bangor, Roehampton", "intake": "May 2026", "processing_stage": "Applied to University", "portal": "Crizac.", "b2b_b2c": "B2C", "source_type": "direct", "external_agent_name": "", "referred_by_staff": "", "original_source": "BNB", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "applied in due to low percentage Rejected from roehampton/ Admission applied in wolverhampton or bangor", "conditions": "-", "app_receive_date": "2026-01-27", "offer_date": "-", "admission_sent_date": "2026-01-27", "counselor_notes": "", "todo": ""}, {"name": "Yasir Raza", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Hull main campus , Teeside", "intake": "September 2026", "processing_stage": "Offer Letter Received", "portal": "Crizac", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Tabish Iqbal", "original_source": "Tabish Iqbal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Offer Receive Roheampton English Test Pending", "conditions": "-", "app_receive_date": "", "offer_date": "Roehampton", "admission_sent_date": "", "counselor_notes": "", "todo": ""}, {"name": "Amna", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Strathclyde, BU, Liverpool Uni", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "-", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Amina Liaqat", "original_source": "Amina", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Admission Applied in SU, BU, Liverpool uni.", "conditions": "-", "app_receive_date": "-", "offer_date": "-", "admission_sent_date": "-", "counselor_notes": "", "todo": ""}, {"name": "Muther", "phone": "", "email": "", "country": "Sweden", "list": "ACL", "university": "-", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "-", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Sir Wahab", "original_source": "Sir Wahab", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Docs pending and consultancy pending", "conditions": "-", "app_receive_date": "-", "offer_date": "-", "admission_sent_date": "-", "counselor_notes": "", "todo": ""}, {"name": "Rabia Nawaz", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "ARU, Bedfordsire, RCL", "intake": "May 2026", "processing_stage": "Applied to University", "portal": "Intled", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "SR consultant", "referred_by_staff": "", "original_source": "SR consultant", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Student pre-screening pending. Suggested Ulster and wolverhampton but no response received from agent/ No UG course avallable in ARU/ Applied in RCL", "conditions": "-", "app_receive_date": "2026-01-28", "offer_date": "-", "admission_sent_date": "2026-01-29", "counselor_notes": "", "todo": ""}, {"name": "Madiha", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Keele", "intake": "September 2026", "processing_stage": "Offer Letter Received", "portal": "Study reach", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Study flag", "referred_by_staff": "", "original_source": "Study flag", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "offer keele received/ fferApplication submitted on 27-02-2026", "conditions": "SOP", "app_receive_date": "2026-02-26", "offer_date": "2026-03-26", "admission_sent_date": "2026-02-26", "counselor_notes": "", "todo": ""}, {"name": "Talha - Onshore student", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Leeds trinity", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "Miss Sanam", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Khan associate", "referred_by_staff": "", "original_source": "Khan associate", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "APPLIED AGAIN WITH CHANGE OF COURSE. Applied in LTU", "conditions": "Experience letters", "app_receive_date": "2026-02-19", "offer_date": "-", "admission_sent_date": "2026-02-22", "counselor_notes": "", "todo": ""}, {"name": "Faheem - Onshore student", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Leeds trinity", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "Miss Sanam", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Khan associate", "referred_by_staff": "", "original_source": "Khan associate", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Agent not responding on this. Applied in LTU", "conditions": "Experience letters", "app_receive_date": "2026-02-19", "offer_date": "-", "admission_sent_date": "2026-02-22", "counselor_notes": "", "todo": ""}, {"name": "Zara", "phone": "", "email": "", "country": "Italy", "list": "ACL", "university": "", "intake": "", "processing_stage": "Applied to University", "portal": "", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Amina Liaqat", "original_source": "Amina", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Affidavit of name change pending and some other docs", "conditions": "", "app_receive_date": "", "offer_date": "", "admission_sent_date": "", "counselor_notes": "", "todo": ""}, {"name": "Umair Hussain", "phone": "", "email": "", "country": "Malta", "list": "ACL", "university": "GBS & Global College Malta", "intake": "October 2026", "processing_stage": "Applied to University", "portal": "Geebe", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Tabish Iqbal", "original_source": "Tabish Iqbal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Application Submitted", "conditions": "-", "app_receive_date": "2026-04-02", "offer_date": "-", "admission_sent_date": "2026-04-02", "counselor_notes": "", "todo": ""}, {"name": "Khuram Abbas", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Salford", "intake": "September 2026", "processing_stage": "Shortlisting", "portal": "Crizac", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Sir Wahab", "original_source": "Sir Wahab", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Applied on 02-04-2026 Salford", "conditions": "-", "app_receive_date": "2026-04-02", "offer_date": "-", "admission_sent_date": "2026-04-02", "counselor_notes": "", "todo": ""}, {"name": "Murtaza Kazmi", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Ulaw", "intake": "September 2026", "processing_stage": "Shortlisting", "portal": "Intled", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Sir Wahab", "original_source": "Sir Wahab", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Applied on 02-04-2026 Ulaw", "conditions": "-", "app_receive_date": "2026-04-02", "offer_date": "-", "admission_sent_date": "02-04-2026", "counselor_notes": "", "todo": ""}, {"name": "Taimoor", "phone": "", "email": "", "country": "Italy", "list": "ACL", "university": "Fully Funded", "intake": "September 2026", "processing_stage": "Shortlisting", "portal": "Go Grad", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Samiya Ayyub", "original_source": "Miss Samiya", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Applied on 04-04-2026", "conditions": "-", "app_receive_date": "2026-04-03", "offer_date": "-", "admission_sent_date": "2026-04-04", "counselor_notes": "", "todo": ""}, {"name": "Hasnain Raza", "phone": "", "email": "", "country": "Italy", "list": "ACL", "university": "Fully Funded", "intake": "September 2026", "processing_stage": "Shortlisting", "portal": "Gp Grad", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Samiya Ayyub", "original_source": "Miss Samiya", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Applied on 01-04-2026", "conditions": "-", "app_receive_date": "2026-04-01", "offer_date": "-", "admission_sent_date": "2026-04-01", "counselor_notes": "", "todo": ""}, {"name": "Yemna Ajaz", "phone": "", "email": "", "country": "USA", "list": "ACL", "university": "Depaul Uni, texas Uni", "intake": "September 2026", "processing_stage": "Offer Letter Received", "portal": "GEN", "b2b_b2c": "B2C", "source_type": "direct", "external_agent_name": "", "referred_by_staff": "", "original_source": "Sir Bilal", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Depaul Uni offer receive 03-04-2026, Texas University offer receive 03-04-2026", "conditions": "IELTS", "app_receive_date": "2026-03-27", "offer_date": "-", "admission_sent_date": "2026-03-31", "counselor_notes": "", "todo": ""}, {"name": "Noor Fatima", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Starthclyde", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "Crizac", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "SR consultant", "referred_by_staff": "", "original_source": "SR consultant", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Pre-screening needs to be done", "conditions": "-", "app_receive_date": "2026-03-17", "offer_date": "-", "admission_sent_date": "2026-03-18", "counselor_notes": "", "todo": ""}, {"name": "Mohsin", "phone": "", "email": "", "country": "Australia", "list": "ACL", "university": "-", "intake": "2026", "processing_stage": "Shortlisting", "portal": "GEN", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Samiya Ayyub", "original_source": "Miss samiya", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Applied via GEN", "conditions": "-", "app_receive_date": "2026-03-31", "offer_date": "-", "admission_sent_date": "2026-03-31", "counselor_notes": "", "todo": ""}, {"name": "Abdullah Qasim", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "St Mary", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "Geebee", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Amina Liaqat", "original_source": "Miss Amina", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Applied in St Mary via Geebee", "conditions": "-", "app_receive_date": "2026-04-03", "offer_date": "-", "admission_sent_date": "2026-04-06", "counselor_notes": "", "todo": ""}, {"name": "Shahbaz Latif", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Greenwich, Ulster belfast", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "Crizac, Study reach", "b2b_b2c": "B2C", "source_type": "internal_staff", "external_agent_name": "", "referred_by_staff": "Tabish Iqbal", "original_source": "Sir Tabish", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Application submitted", "conditions": "-", "app_receive_date": "2026-04-08", "offer_date": "-", "admission_sent_date": "2026-04-08", "counselor_notes": "", "todo": ""}, {"name": "Hyder Ali", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Portsmouth", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "GEN", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Apex", "referred_by_staff": "", "original_source": "Apex", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Aplication submitted", "conditions": "-", "app_receive_date": "2026-04-07", "offer_date": "-", "admission_sent_date": "2026-04-08", "counselor_notes": "", "todo": ""}, {"name": "Noor Alam", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Portsmouth", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "GEN", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Apex", "referred_by_staff": "", "original_source": "Apex", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Application submitted", "conditions": "-", "app_receive_date": "2026-04-07", "offer_date": "-", "admission_sent_date": "2026-04-08", "counselor_notes": "", "todo": ""}, {"name": "Ali Hasnain", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "Portsmouth", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "GEN", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Apex", "referred_by_staff": "", "original_source": "Apex", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Application submitted", "conditions": "-", "app_receive_date": "2026-04-07", "offer_date": "-", "admission_sent_date": "2026-04-08", "counselor_notes": "", "todo": ""}, {"name": "Faiz Ahmad", "phone": "", "email": "", "country": "UK", "list": "ACL", "university": "-", "intake": "September 2026", "processing_stage": "Applied to University", "portal": "Crizac", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "BN consultant", "referred_by_staff": "", "original_source": "BN consultant", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Application submitted", "conditions": "-", "app_receive_date": "2026-04-07", "offer_date": "-", "admission_sent_date": "2026-04-08", "counselor_notes": "", "todo": ""}, {"name": "Mazhar", "phone": "", "email": "", "country": "Australia", "list": "ACL", "university": "Macquire, Wollongong", "intake": "July 2026", "processing_stage": "Applied to University", "portal": "GEN", "b2b_b2c": "B2B", "source_type": "external_agent", "external_agent_name": "Insight consultant", "referred_by_staff": "", "original_source": "Insight consultant", "staff_commission_pkr": 0, "agent_commission_pct": 0, "process_notes": "Admission applied", "conditions": "-", "app_receive_date": "2026-04-09", "offer_date": "-", "admission_sent_date": "2026-04-09", "counselor_notes": "", "todo": ""}];
  const [status,setStatus]=useState("idle"); // idle|running|done
  const [progress,setProgress]=useState(0);
  const [results,setResults]=useState([]);
  const [preview,setPreview]=useState(true);
  // Check if already imported - compare ACL_DATA names against existing leads
  const alreadyImportedCount = leadsDB.data?.filter(l =>
    l.list==="ACL" && ACL_DATA.some(c => c.name.toLowerCase().trim() === l.name?.toLowerCase().trim())
  ).length || 0;
  const pendingCount = ACL_DATA.length - alreadyImportedCount;

  if(currentUser.role!==ROLES.CEO)
    return <div style={{...S.card,textAlign:"center",padding:60,color:"#9fa8da"}}>🔒 CEO only.</div>;

  const runImport=async()=>{
    if(!window.confirm(`Import ${ACL_DATA.length} ACL clients from Excel?\n\nThis will add them to your Active Clients list with their processing stages.`))return;
    setStatus("running");setProgress(0);setResults([]);

    // Pre-flight: ensure all required columns exist by upserting a test record
    // This is handled by Supabase — columns added via SQL schema already
    // But we do a pre-check insert to catch any column errors early
    try {
      const testCheck = await supabase.from("leads").select("university,intake,processing_stage,portal,b2b_b2c,source_type,external_agent_name,referred_by_staff,original_source,staff_commission_pkr,agent_commission_pct,conditions,app_receive_date,offer_date,admission_sent_date,counselor_notes,todo,case_log,universities").limit(1);
      if(testCheck.error && testCheck.error.message.includes("column")) {
        // Try to add columns dynamically via a safe insert pattern
        toast("⚠️ Some database columns are missing. Please run the SQL setup first:\n\nGo to Supabase → SQL Editor → paste the setup SQL → Run\n\nThen try importing again.");
        setStatus("idle");
        return;
      }
    } catch(e) {}

    const logs=[];
    for(let i=0;i<ACL_DATA.length;i++){
      const client=ACL_DATA[i];
      setProgress(Math.round((i/ACL_DATA.length)*100));
      try{
        // Check if already exists
        // Case-insensitive duplicate check via direct DB query
        const clientNameLower = client.name.toLowerCase().trim();
        const {data:dupCheck} = await supabase.from("leads")
          .select("id").eq("list","ACL")
          .ilike("name", client.name.trim()).limit(1);
        const existing = dupCheck && dupCheck.length > 0;
        if(existing){logs.push({name:client.name,status:"skipped",reason:"Already exists"});continue;}
        
        // Build lead data - only include safe non-null fields
        const leadData={
          name:client.name,
          phone:client.phone||"",
          email:client.email||"",
          country:client.country||"",
          list:"ACL",
          stage:client.processing_stage||"Shortlisting",
          status:"Active",
          lost:false,
          score:3,
          consultation_done:true,
          agreement_signed:true,
          payment_received:true,
          invoice_generated:true,
          remarks:client.process_notes||"",
          created_at:new Date().toISOString(),
        };
        // Add optional fields only if they have valid values
        if(client.university) leadData.university = client.university;
        if(client.intake) leadData.intake = client.intake;
        if(client.processing_stage) leadData.processing_stage = client.processing_stage;
        if(client.portal) leadData.portal = client.portal;
        if(client.b2b_b2c) leadData.b2b_b2c = client.b2b_b2c;
        if(client.source_type) leadData.source_type = client.source_type;
        if(client.external_agent_name) leadData.external_agent_name = client.external_agent_name;
        if(client.referred_by_staff) leadData.referred_by_staff = client.referred_by_staff;
        if(client.original_source) leadData.original_source = client.original_source;
        if(client.counselor_notes) leadData.counselor_notes = client.counselor_notes;
        if(client.todo) leadData.todo = client.todo;
        // Date fields - only add if valid date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if(client.app_receive_date && dateRegex.test(client.app_receive_date)) leadData.app_receive_date = client.app_receive_date;
        if(client.offer_date && dateRegex.test(client.offer_date)) leadData.offer_date = client.offer_date;
        if(client.admission_sent_date && dateRegex.test(client.admission_sent_date)) leadData.admission_sent_date = client.admission_sent_date;
        // Use direct supabase insert for reliability
        const {error:insertError} = await supabase.from("leads").insert(leadData);
        if(insertError){
          logs.push({name:client.name,status:"error",reason:insertError.message});
          continue;
        }
        
        // Create follow-up task if todo exists
        if(client.todo&&client.todo.trim()){
          await supabase.from("tasks").insert({
            title:`Follow up: ${client.name}`,
            client_name:client.name,
            assigned_to:currentUser.id,
            due_date:new Date(Date.now()+3*24*60*60*1000).toISOString().slice(0,10),
            priority:"High",
            type:"Follow-up",
            auto_generated:true,
          });
        }
        logs.push({name:client.name,status:"imported",stage:client.processing_stage,agent:client.external_agent_name||client.referred_by_staff||"Direct"});
      }catch(err){
        logs.push({name:client.name,status:"error",reason:err.message});
      }
    }
    setProgress(100);setResults(logs);setStatus("done");
  };

  const imported=results.filter(r=>r.status==="imported").length;
  const skipped=results.filter(r=>r.status==="skipped").length;
  const errors=results.filter(r=>r.status==="error").length;

  // Stage colors
  const stageColor={
    "Applied to University":["#3949ab","#eef0fb"],
    "Offer Letter Received":["#059669","#d1fae5"],
    "Acceptance Confirmed":["#7c3aed","#ede9fe"],
    "CAS/CoE/I-20 Received":["#0369a1","#dbeafe"],
    "Visa Filed":["#7c5100","#fef3c7"],
    "Visa Approved":["#065f46","#d1fae5"],
    "Visa Rejected":["#9b1c1c","#fee2e2"],
    "Shortlisting":["#374151","#f3f4f9"],
  };

  return (
    <div>
      <div style={{marginBottom:18}}>
        <h2 style={{...S.h2}}>Import Active Clients from Excel</h2>
        <p style={{...S.sub}}>56 clients pre-loaded from your Excel sheet — stages auto-detected, commissions mapped</p>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginBottom:20}}>
        <Stat label="Total Clients" value={ACL_DATA.length} color={B.primary} icon="👥"/>
        <Stat label="Already Imported" value={alreadyImportedCount} color={B.success} icon="✅"/>
        <Stat label="Pending Import" value={pendingCount} color={pendingCount>0?B.warn:"#9fa8da"} icon="⏳"/>
        <Stat label="External Agent" value={ACL_DATA.filter(c=>c.source_type==="external_agent").length} color={B.secondary} icon="🤝"/>
        <Stat label="Staff Referral" value={ACL_DATA.filter(c=>c.source_type==="internal_staff").length} color={"#7c3aed"} icon="👤"/>
      </div>

      {preview&&status==="idle"&&(
        <div style={{...S.card,marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:B.dark}}>Preview — All 56 clients</div>
            {pendingCount>0&&(
              <button onClick={runImport} style={{...S.btn(B.success),fontSize:13}}>
                ✅ Import {pendingCount} to ACL
              </button>
            )}
            {pendingCount===0&&(
              <div style={{background:"#d1fae5",color:"#065f46",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:700}}>
                ✅ All {ACL_DATA.length} clients already imported
              </div>
            )}
          </div>
          <div style={{overflowX:"auto",maxHeight:500,overflowY:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
              <thead><tr>{["#","Name","Country","University","Intake","Stage","Source","Commission","Comments"].map(h=><th key={h} style={{...S.th,fontSize:11}}>{h}</th>)}</tr></thead>
              <tbody>
                {ACL_DATA.map((c,i)=>{
                  const [sc,sb]=stageColor[c.processing_stage]||["#374151","#f3f4f9"];
                  return (
                    <tr key={i}>
                      <td style={{...S.td,fontSize:11,color:"#9fa8da"}}>{i+1}</td>
                      <td style={{...S.td,fontWeight:700}}>{c.name}</td>
                      <td style={{...S.td,fontSize:11}}>{c.country}</td>
                      <td style={{...S.td,fontSize:11,maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.university}</td>
                      <td style={{...S.td,fontSize:11,whiteSpace:"nowrap"}}>{c.intake}</td>
                      <td style={{...S.td}}><Pill text={c.processing_stage} color={sc} bg={sb}/></td>
                      <td style={{...S.td,fontSize:11}}>
                        {c.source_type==="external_agent"&&<Pill text={`B2B: ${c.external_agent_name}`} color={"#7c3aed"} bg={"#f3e8ff"}/>}
                        {c.source_type==="internal_staff"&&<Pill text={`Staff: ${c.referred_by_staff}`} color={"#059669"} bg={"#d1fae5"}/>}
                        {c.source_type==="direct"&&<Pill text="Direct" color={"#374151"} bg={"#f3f4f9"}/>}
                      </td>
                      <td style={{...S.td,fontSize:11}}>
                        {c.staff_commission_pkr>0&&<span style={{color:"#7c3aed",fontWeight:700}}>PKR {c.staff_commission_pkr.toLocaleString()}</span>}
                        {c.source_type==="external_agent"&&<span style={{color:"#dc2626",fontWeight:700}}>% payable</span>}
                        {c.source_type==="direct"&&"—"}
                      </td>
                      <td style={{...S.td,fontSize:11,maxWidth:200,whiteSpace:"normal",lineHeight:1.4,color:"#5c6bc0"}}>
                        {c.process_notes?c.process_notes.slice(0,120)+(c.process_notes.length>120?"…":""):"—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {status==="running"&&(
        <div style={{...S.card,textAlign:"center",padding:40}}>
          <div style={{fontSize:18,fontWeight:700,color:B.primary,marginBottom:16}}>⏳ Importing clients...</div>
          <div style={{background:"#f3f4f9",borderRadius:20,height:12,overflow:"hidden",marginBottom:12}}>
            <div style={{background:B.success,height:"100%",width:`${progress}%`,transition:"width 0.3s",borderRadius:20}}/>
          </div>
          <div style={{fontSize:14,color:"#5c6bc0"}}>{progress}% complete</div>
        </div>
      )}

      {status==="done"&&(
        <div>
          <div style={{...S.card,marginBottom:16}}>
            <div style={{fontSize:15,fontWeight:800,color:B.success,marginBottom:12}}>✅ Import Complete!</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              <Stat label="Imported" value={imported} color={B.success} icon="✓"/>
              <Stat label="Skipped (existed)" value={skipped} color={B.warn} icon="⏭"/>
              <Stat label="Errors" value={errors} color={B.danger} icon="✗"/>
            </div>
          </div>
          <div style={{...S.card,maxHeight:400,overflowY:"auto"}}>
            {results.map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f3f4f9",fontSize:12}}>
                <span style={{fontWeight:600}}>{r.name}</span>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {r.stage&&<Pill text={r.stage} color={stageColor[r.stage]?.[0]||"#374151"} bg={stageColor[r.stage]?.[1]||"#f3f4f9"}/>}
                  <Pill text={r.status} color={r.status==="imported"?B.success:r.status==="skipped"?B.warn:B.danger} bg={r.status==="imported"?"#d1fae5":r.status==="skipped"?"#fef3c7":"#fee2e2"}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CASE FILE MODAL ──────────────────────────────────────────────────────────
// Full client case file with activity log, multiple universities, stage change, PDF
const LOG_CATEGORIES = [
  {key:"stage_change", icon:"🔄", label:"Stage Change"},
  {key:"university", icon:"🏫", label:"University Application"},
  {key:"call", icon:"📞", label:"Call with Client"},
  {key:"email", icon:"📧", label:"Email Sent"},
  {key:"document", icon:"📋", label:"Document Request"},
  {key:"offer", icon:"🎓", label:"Offer Received"},
  {key:"payment", icon:"💰", label:"Payment"},
  {key:"note", icon:"ℹ️", label:"General Update"},
];

function CaseFileModal({lead, leadsDB, tasksDB, invoices, users, currentUser, onClose, allLeads}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({...lead});
  const [saving, setSaving] = useState(false);

  // Activity log
  const [logs, setLogs] = useState(() => {
    try { return JSON.parse(lead.case_log || "[]"); } catch { return []; }
  });
  const [newLog, setNewLog] = useState({category:"note", text:"", date:tod()});
  const [editingLog, setEditingLog] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState(new Set());

  // Universities
  const [unis, setUnis] = useState(() => {
    try { return JSON.parse(lead.universities || "[]"); } catch { return []; }
  });
  const [newUni, setNewUni] = useState({name:"", course:"", portal:"", app_date:"", status:"Applied", notes:""});
  const [showAddUni, setShowAddUni] = useState(false);
  const UNI_STATUSES = ["Applied","Offer Received","Conditional Offer","Unconditional Offer","Rejected","Withdrawn","Enrolled"];

  const canEdit = currentUser.role === ROLES.CEO || currentUser.role === ROLES.PROCESSING || currentUser.role === ROLES.ACCOUNTS;

  // Save everything
  const saveAll = async (newLogs, newUnis, newData) => {
    const logData = JSON.stringify(newLogs || logs);
    const uniData = JSON.stringify(newUnis || unis);
    const data = {...(newData || editData), case_log: logData, universities: uniData};
    await leadsDB.update(lead.id, data);
  };

  // Add log entry
  const addLog = async () => {
    if (!newLog.text.trim()) return;
    const entry = {
      id: Date.now(),
      category: newLog.category,
      text: newLog.text.trim(),
      date: newLog.date || tod(),
      by: currentUser.name,
      by_role: currentUser.role,
      created_at: new Date().toISOString(),
      include_in_report: true,
    };
    const newLogs = [...logs, entry];
    setLogs(newLogs);
    setNewLog({category:"note", text:"", date:tod()});
    await saveAll(newLogs, null, null);
  };

  // Edit log entry
  const saveLogEdit = async (id, newText, newDate) => {
    const newLogs = logs.map(l => l.id === id ? {...l, text: newText, date: newDate, edited_at: new Date().toISOString(), edited_by: currentUser.name} : l);
    setLogs(newLogs);
    setEditingLog(null);
    await saveAll(newLogs, null, null);
  };

  // Delete log entry
  const deleteLog = async (id) => {
    if (!window.confirm("Delete this log entry?")) return;
    const newLogs = logs.filter(l => l.id !== id);
    setLogs(newLogs);
    await saveAll(newLogs, null, null);
  };

  // Toggle log inclusion in report
  const toggleLogInclude = async (id) => {
    const newLogs = logs.map(l => l.id === id ? {...l, include_in_report: !l.include_in_report} : l);
    setLogs(newLogs);
    await saveAll(newLogs, null, null);
  };

  // Add university
  const addUniversity = async () => {
    if (!newUni.name.trim()) return;
    const entry = {...newUni, id: Date.now(), added_at: tod(), added_by: currentUser.name};
    const newUnis = [...unis, entry];
    setUnis(newUnis);
    setNewUni({name:"", course:"", portal:"", app_date:"", status:"Applied", notes:""});
    setShowAddUni(false);
    // Auto-log it
    const logEntry = {id: Date.now()+1, category:"university", text:`University application submitted: ${newUni.name} — ${newUni.course || "Course TBD"} (${newUni.portal || "Portal TBD"})`, date: newUni.app_date || tod(), by: currentUser.name, by_role: currentUser.role, created_at: new Date().toISOString(), include_in_report: true};
    const newLogs = [...logs, logEntry];
    setLogs(newLogs);
    await saveAll(newLogs, newUnis, null);
  };

  // Update university status
  const updateUniStatus = async (id, status) => {
    const uni = unis.find(u => u.id === id);
    const newUnis = unis.map(u => u.id === id ? {...u, status} : u);
    setUnis(newUnis);
    // Auto-log status change
    const logEntry = {id: Date.now(), category:"offer", text:`${uni.name}: Status updated to "${status}"`, date: tod(), by: currentUser.name, by_role: currentUser.role, created_at: new Date().toISOString(), include_in_report: true};
    const newLogs = [...logs, logEntry];
    setLogs(newLogs);
    await saveAll(newLogs, newUnis, null);
  };

  // Remove university
  const removeUni = async (id) => {
    const uni = unis.find(u => u.id === id);
    if (!window.confirm(`Remove ${uni?.name}?`)) return;
    const newUnis = unis.filter(u => u.id !== id);
    setUnis(newUnis);
    const logEntry = {id: Date.now(), category:"note", text:`University removed: ${uni?.name}`, date: tod(), by: currentUser.name, by_role: currentUser.role, created_at: new Date().toISOString(), include_in_report: false};
    const newLogs = [...logs, logEntry];
    setLogs(newLogs);
    await saveAll(newLogs, newUnis, null);
  };

  // Change stage from inside case file
  const changeStage = async (newStage) => {
    if (!window.confirm(`Change stage to "${newStage}"?`)) return;
    const logEntry = {id: Date.now(), category:"stage_change", text:`Stage changed: "${lead.stage || editData.stage}" → "${newStage}"`, date: tod(), by: currentUser.name, by_role: currentUser.role, created_at: new Date().toISOString(), include_in_report: true};
    const newLogs = [...logs, logEntry];
    setLogs(newLogs);
    const newData = {...editData, stage: newStage};
    setEditData(newData);
    await saveAll(newLogs, null, newData);
  };

  // Save edits
  const saveEdits = async () => {
    setSaving(true);
    await saveAll(null, null, editData);
    setSaving(false);
    setEditMode(false);
  };

  // Generate PDF report
  const generatePDF = () => {
    const includedLogs = logs.filter(l => l.include_in_report !== false);
    const uniStatusColor = {Applied:"#3949ab","Offer Received":"#059669","Conditional Offer":"#7c5100","Unconditional Offer":"#059669",Rejected:"#dc2626",Withdrawn:"#374151",Enrolled:"#065f46"};
    const catIcon = Object.fromEntries(LOG_CATEGORIES.map(c => [c.key, c.icon]));

    const html = `<!DOCTYPE html><html><head><title>Case Report — ${lead.name}</title>
    <style>
      body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#1a1a2e;font-size:13px}
      .header{text-align:center;border-bottom:3px solid #2d3a8c;padding-bottom:20px;margin-bottom:24px}
      .company{font-size:20px;font-weight:900;color:#2d3a8c}
      .report-title{font-size:16px;font-weight:700;margin:8px 0 4px;color:#374151}
      .meta{display:flex;justify-content:space-between;background:#f8f9ff;padding:16px;border-radius:8px;margin-bottom:20px;gap:12px;flex-wrap:wrap}
      .meta-item{min-width:120px}.meta-label{font-size:10px;color:#9fa8da;font-weight:700;text-transform:uppercase;margin-bottom:2px}
      .meta-value{font-size:13px;font-weight:700;color:#1a1a2e}
      .section-title{font-size:13px;font-weight:800;color:#2d3a8c;margin:20px 0 10px;padding-bottom:4px;border-bottom:2px solid #eef0fb;text-transform:uppercase}
      .uni-table{width:100%;border-collapse:collapse;margin-bottom:16px}
      .uni-table th{background:#f8f9ff;padding:7px 10px;text-align:left;font-size:11px;color:#5c6bc0;font-weight:700;border-bottom:2px solid #e8eaf6}
      .uni-table td{padding:7px 10px;border-bottom:1px solid #f3f4f9;font-size:12px}
      .log-entry{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f9}
      .log-date{min-width:90px;font-size:11px;color:#9fa8da;font-weight:700;padding-top:2px}
      .log-icon{font-size:16px;min-width:24px}
      .log-text{flex:1;font-size:12px;line-height:1.6}
      .log-by{font-size:10px;color:#9fa8da;margin-top:3px}
      .footer{margin-top:30px;padding-top:12px;border-top:1px solid #e8eaf6;text-align:center;font-size:10px;color:#9fa8da}
      @media print{body{margin:0}}
    </style></head><body>
    <div class="header">
      <div class="company">Border and Bridges Pvt. Ltd.</div>
      <div class="report-title">CLIENT CASE REPORT</div>
      <div style="font-size:11px;color:#9fa8da">Generated: ${new Date().toLocaleDateString('en-GB', {day:'2-digit',month:'long',year:'numeric'})}</div>
    </div>
    <div class="meta">
      <div class="meta-item"><div class="meta-label">Client Name</div><div class="meta-value">${lead.name}</div></div>
      <div class="meta-item"><div class="meta-label">Country</div><div class="meta-value">${editData.country || lead.country || '—'}</div></div>
      <div class="meta-item"><div class="meta-label">Current Stage</div><div class="meta-value">${editData.stage || lead.stage || '—'}</div></div>
      <div class="meta-item"><div class="meta-label">Intake</div><div class="meta-value">${editData.intake || lead.intake || '—'}</div></div>
      <div class="meta-item"><div class="meta-label">Contact</div><div class="meta-value">${lead.phone || '—'}</div></div>
    </div>
    ${unis.length > 0 ? `
    <div class="section-title">🏫 University Applications (${unis.length})</div>
    <table class="uni-table">
      <thead><tr><th>#</th><th>University</th><th>Course</th><th>Portal</th><th>Applied</th><th>Status</th></tr></thead>
      <tbody>${unis.map((u,i) => `<tr>
        <td>${i+1}</td><td><strong>${u.name}</strong></td>
        <td>${u.course || '—'}</td><td style="font-size:11px">${u.portal || '—'}</td>
        <td style="font-size:11px">${u.app_date || '—'}</td>
        <td><span style="color:${uniStatusColor[u.status]||'#374151'};font-weight:700">${u.status}</span></td>
      </tr>`).join('')}
      </tbody>
    </table>` : ''}
    <div class="section-title">📋 Case Activity Log (${includedLogs.length} entries)</div>
    ${includedLogs.sort((a,b) => (a.date||'').localeCompare(b.date||'')).map(l => `
    <div class="log-entry">
      <div class="log-date">${l.date || '—'}</div>
      <div class="log-icon">${catIcon[l.category] || 'ℹ️'}</div>
      <div>
        <div class="log-text">${l.text}</div>
        <div class="log-by">— ${l.by || 'System'}${l.edited_at ? ' (edited)' : ''}</div>
      </div>
    </div>`).join('')}
    <div class="footer">This report was prepared by Border and Bridges Pvt. Ltd. for ${lead.name} · ${new Date().toLocaleDateString()}</div>
    </body></html>`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const stageList = PROCESSING_STAGES[editData.country] || PROCESSING_STAGES[lead.country] || Object.values(PROCESSING_STAGES)[0] || [];
  const catMap = Object.fromEntries(LOG_CATEGORIES.map(c => [c.key, c]));
  const uniStatusColors = {Applied:["#3949ab","#eef0fb"],"Offer Received":["#059669","#d1fae5"],"Conditional Offer":["#7c5100","#fef3c7"],"Unconditional Offer":["#059669","#d1fae5"],Rejected:["#dc2626","#fee2e2"],Withdrawn:["#374151","#f3f4f9"],Enrolled:["#065f46","#d1fae5"]};

  return (
    <Modal title={`📁 Case File — ${lead.name}`} onClose={onClose} w={800}>
      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:18,borderBottom:"2px solid #f3f4f9",paddingBottom:12}}>
        {[["overview","📋 Overview"],["universities","🏫 Universities ("+unis.length+")"],["log","📝 Activity Log ("+logs.length+")"]].map(([k,l])=>(
          <button key={k} onClick={()=>setActiveTab(k)} style={{padding:"7px 16px",borderRadius:8,border:"none",background:activeTab===k?B.primary:"transparent",color:activeTab===k?"#fff":"#5c6bc0",fontSize:12,fontWeight:700,cursor:"pointer"}}>{l}</button>
        ))}
        <div style={{flex:1}}/>
        <button onClick={generatePDF} style={{...S.btn("#374151"),fontSize:11,padding:"5px 14px"}}>📄 Client Report PDF</button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab==="overview"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:B.dark}}>Client Details</div>
            {canEdit&&(
              <div style={{display:"flex",gap:8}}>
                {editMode?(
                  <>
                    <button onClick={saveEdits} disabled={saving} style={{...S.btn(B.success),fontSize:11,padding:"5px 12px"}}>{saving?"Saving...":"✓ Save"}</button>
                    <button onClick={()=>{setEditMode(false);setEditData({...lead});}} style={{...S.ghost,fontSize:11,padding:"5px 10px"}}>Cancel</button>
                  </>
                ):(
                  <button onClick={()=>setEditMode(true)} style={{...S.ghost,fontSize:11,padding:"5px 12px"}}>✏️ Edit</button>
                )}
              </div>
            )}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[
              ["Name", "name"],["Phone","phone"],["Email","email"],
              ["Country","country"],["University","university"],["Intake","intake"],
              ["Portal","portal"],["Source","original_source"],
            ].map(([label, field])=>(
              <Fld key={field} label={label}>
                {editMode
                  ? <input style={S.inp} value={editData[field]||""} onChange={e=>setEditData({...editData,[field]:e.target.value})}/>
                  : <div style={{fontSize:13,fontWeight:600,color:B.dark,padding:"6px 0"}}>{lead[field]||editData[field]||"—"}</div>
                }
              </Fld>
            ))}
          </div>

          {/* Stage change */}
          <div style={{background:"#f8f9ff",borderRadius:10,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:10}}>
              Current Stage: <span style={{color:B.primary}}>{editData.stage || lead.stage || "—"}</span>
            </div>
            {canEdit&&stageList.length>0&&(
              <div>
                <div style={{fontSize:11,color:"#9fa8da",marginBottom:8}}>Change Stage:</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {stageList.map(s=>(
                    <button key={s} onClick={()=>changeStage(s)}
                      style={{padding:"5px 10px",borderRadius:8,border:`2px solid ${(editData.stage||lead.stage)===s?B.primary:"#e8eaf6"}`,background:(editData.stage||lead.stage)===s?B.light:"#fff",color:(editData.stage||lead.stage)===s?B.primary:"#9fa8da",fontSize:11,fontWeight:(editData.stage||lead.stage)===s?700:400,cursor:"pointer"}}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Commission info — editable by CEO */}
          {(editData.staff_commission_pkr>0||editData.source_type==="external_agent"||editData.referred_by_staff)&&(
            <div style={{background:"#fef3c7",borderRadius:10,padding:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:700,color:"#7c5100"}}>💰 Commission Info</div>
              </div>
              {editData.referred_by_staff&&(
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:11,color:"#92400e",marginBottom:4}}>Staff Commission → {editData.referred_by_staff}</div>
                  {currentUser.role===ROLES.CEO?(
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12,color:"#7c5100",fontWeight:600}}>PKR</span>
                      <input
                        type="number"
                        style={{...S.inp,width:140,margin:0,fontWeight:700,color:"#7c5100"}}
                        value={editData.staff_commission_pkr||0}
                        onChange={e=>setEditData({...editData,staff_commission_pkr:parseFloat(e.target.value)||0})}
                        onBlur={()=>leadsDB.update(lead.id,{staff_commission_pkr:editData.staff_commission_pkr})}
                        placeholder="e.g. 20000"
                      />
                      <span style={{fontSize:11,color:"#92400e"}}>per case (editable)</span>
                    </div>
                  ):(
                    <div style={{fontSize:13,fontWeight:700,color:"#7c5100"}}>PKR {(editData.staff_commission_pkr||0).toLocaleString()}</div>
                  )}
                </div>
              )}
              {editData.source_type==="external_agent"&&(
                <div>
                  <div style={{fontSize:11,color:"#92400e",marginBottom:4}}>Agent Commission Payable → {editData.external_agent_name}</div>
                  {currentUser.role===ROLES.CEO?(
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <input
                        type="number"
                        style={{...S.inp,width:100,margin:0,fontWeight:700,color:"#7c5100"}}
                        value={editData.agent_commission_pct||0}
                        onChange={e=>setEditData({...editData,agent_commission_pct:parseFloat(e.target.value)||0})}
                        onBlur={()=>leadsDB.update(lead.id,{agent_commission_pct:editData.agent_commission_pct})}
                        placeholder="e.g. 70"
                      />
                      <span style={{fontSize:11,color:"#92400e"}}>% of fee (editable)</span>
                    </div>
                  ):(
                    <div style={{fontSize:13,fontWeight:700,color:"#7c5100"}}>{editData.agent_commission_pct||0}% of fee</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* UNIVERSITIES TAB */}
      {activeTab==="universities"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:B.dark}}>University Applications</div>
            {canEdit&&<button onClick={()=>setShowAddUni(true)} style={{...S.btn(B.secondary),fontSize:11,padding:"5px 14px"}}>+ Add University</button>}
          </div>

          {unis.length===0&&<div style={{textAlign:"center",color:"#9fa8da",padding:32,background:"#f8f9ff",borderRadius:10}}>No universities added yet.</div>}

          {unis.map((u,idx)=>{
            const [sc,sb]=uniStatusColors[u.status]||["#374151","#f3f4f9"];
            return (
              <div key={u.id} style={{...S.card,marginBottom:10,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontWeight:800,fontSize:14,color:B.dark}}>{idx+1}. {u.name}</span>
                      <Pill text={u.status} color={sc} bg={sb}/>
                    </div>
                    <div style={{display:"flex",gap:16,fontSize:11,color:"#5c6bc0",flexWrap:"wrap"}}>
                      {u.course&&<span>📚 {u.course}</span>}
                      {u.portal&&<span>🌐 {u.portal}</span>}
                      {u.app_date&&<span>📅 Applied: {u.app_date}</span>}
                      {u.added_by&&<span>👤 Added by: {u.added_by}</span>}
                    </div>
                    {u.notes&&<div style={{fontSize:11,color:"#9fa8da",marginTop:6,fontStyle:"italic"}}>{u.notes}</div>}
                  </div>
                  {canEdit&&(
                    <div style={{display:"flex",gap:6,marginLeft:12}}>
                      <select value={u.status} onChange={e=>updateUniStatus(u.id,e.target.value)} style={{...S.sel,fontSize:11,padding:"4px 8px",width:"auto"}}>
                        {["Applied","Offer Received","Conditional Offer","Unconditional Offer","Rejected","Withdrawn","Enrolled"].map(s=><option key={s}>{s}</option>)}
                      </select>
                      <button onClick={()=>removeUni(u.id)} style={{...S.ghost,fontSize:10,padding:"4px 8px",color:"#dc2626",borderColor:"#dc2626"}}>Remove</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {showAddUni&&(
            <div style={{...S.card,border:`2px solid ${B.secondary}`,marginTop:12}}>
              <div style={{fontSize:13,fontWeight:700,color:B.secondary,marginBottom:12}}>Add University Application</div>
              <R2>
                <Fld label="University Name *"><input style={S.inp} value={newUni.name} onChange={e=>setNewUni({...newUni,name:e.target.value})} placeholder="e.g. University of Birmingham"/></Fld>
                <Fld label="Course/Programme"><input style={S.inp} value={newUni.course} onChange={e=>setNewUni({...newUni,course:e.target.value})} placeholder="e.g. MSc Computer Science"/></Fld>
              </R2>
              <R2>
                <Fld label="Portal Used"><input style={S.inp} value={newUni.portal} onChange={e=>setNewUni({...newUni,portal:e.target.value})} placeholder="e.g. Crizac, Geebee, Direct"/></Fld>
                <Fld label="Application Date"><input type="date" style={S.inp} value={newUni.app_date} onChange={e=>setNewUni({...newUni,app_date:e.target.value})}/></Fld>
              </R2>
              <R2>
                <Fld label="Status">
                  <select style={S.sel} value={newUni.status} onChange={e=>setNewUni({...newUni,status:e.target.value})}>
                    {["Applied","Offer Received","Conditional Offer","Unconditional Offer","Rejected","Withdrawn","Enrolled"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </Fld>
                <Fld label="Notes"><input style={S.inp} value={newUni.notes} onChange={e=>setNewUni({...newUni,notes:e.target.value})} placeholder="Any notes..."/></Fld>
              </R2>
              <div style={{display:"flex",gap:8}}>
                <button onClick={addUniversity} style={{...S.btn(B.secondary),padding:"8px 20px"}}>✓ Add University</button>
                <button onClick={()=>setShowAddUni(false)} style={{...S.ghost,padding:"8px 16px"}}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTIVITY LOG TAB */}
      {activeTab==="log"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:B.dark}}>Activity Log</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{const newLogs=logs.map(l=>({...l,include_in_report:true}));setLogs(newLogs);saveAll(newLogs,null,null);}} style={{...S.ghost,fontSize:10,padding:"4px 8px"}}>☑ Select All</button>
              <button onClick={()=>{const newLogs=logs.map(l=>({...l,include_in_report:false}));setLogs(newLogs);saveAll(newLogs,null,null);}} style={{...S.ghost,fontSize:10,padding:"4px 8px"}}>☐ Deselect All</button>
            </div>
          </div>

          {/* Add new log entry */}
          {canEdit&&(
            <div style={{background:"#f8f9ff",borderRadius:10,padding:14,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:10}}>Add Log Entry</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                {LOG_CATEGORIES.map(c=>(
                  <button key={c.key} onClick={()=>setNewLog({...newLog,category:c.key})}
                    style={{padding:"5px 10px",borderRadius:8,border:`2px solid ${newLog.category===c.key?B.primary:"#e8eaf6"}`,background:newLog.category===c.key?B.light:"#fff",color:newLog.category===c.key?B.primary:"#9fa8da",fontSize:11,fontWeight:newLog.category===c.key?700:400,cursor:"pointer"}}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
              <R2>
                <Fld label="Date"><input type="date" style={S.inp} value={newLog.date} onChange={e=>setNewLog({...newLog,date:e.target.value})}/></Fld>
                <div/>
              </R2>
              <Fld label="Note">
                <textarea style={{...S.inp,minHeight:70,resize:"vertical"}} value={newLog.text} onChange={e=>setNewLog({...newLog,text:e.target.value})} placeholder={`Add ${catMap[newLog.category]?.label || 'note'}...`}/>
              </Fld>
              <button onClick={addLog} style={{...S.btn(B.primary),padding:"8px 20px"}}>+ Add to Log</button>
            </div>
          )}

          {/* Log entries */}
          {logs.length===0&&<div style={{textAlign:"center",color:"#9fa8da",padding:32,background:"#f8f9ff",borderRadius:10}}>No log entries yet. Stage changes and university applications are logged automatically.</div>}

          {[...logs].sort((a,b)=>(b.date||b.created_at||"").localeCompare(a.date||a.created_at||"")).map(entry=>{
            const cat = catMap[entry.category] || catMap.note;
            const isEditing = editingLog?.id === entry.id;
            return (
              <div key={entry.id} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid #f3f4f9",alignItems:"flex-start"}}>
                {/* Include in report checkbox */}
                <input type="checkbox" checked={entry.include_in_report!==false} onChange={()=>toggleLogInclude(entry.id)} style={{marginTop:4,cursor:"pointer",width:16,height:16}} title="Include in PDF report"/>
                <div style={{fontSize:20,marginTop:2}}>{cat.icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <Pill text={cat.label} color="#5c6bc0" bg="#eef0fb"/>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{fontSize:11,color:"#9fa8da"}}>{entry.date}</span>
                      {canEdit&&!isEditing&&(
                        <button onClick={()=>setEditingLog({id:entry.id,text:entry.text,date:entry.date})} style={{...S.ghost,fontSize:10,padding:"2px 8px"}}>✏️</button>
                      )}
                      {canEdit&&<button onClick={()=>deleteLog(entry.id)} style={{...S.ghost,fontSize:10,padding:"2px 6px",color:"#dc2626",borderColor:"#dc2626"}}>✕</button>}
                    </div>
                  </div>
                  {isEditing?(
                    <div>
                      <textarea style={{...S.inp,minHeight:60,resize:"vertical",marginBottom:8}} value={editingLog.text} onChange={e=>setEditingLog({...editingLog,text:e.target.value})}/>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <input type="date" style={{...S.inp,width:150,margin:0}} value={editingLog.date} onChange={e=>setEditingLog({...editingLog,date:e.target.value})}/>
                        <button onClick={()=>saveLogEdit(entry.id,editingLog.text,editingLog.date)} style={{...S.btn(B.success),fontSize:11,padding:"5px 12px"}}>Save</button>
                        <button onClick={()=>setEditingLog(null)} style={{...S.ghost,fontSize:11,padding:"5px 10px"}}>Cancel</button>
                      </div>
                    </div>
                  ):(
                    <div style={{fontSize:12,color:"#374151",lineHeight:1.6}}>{entry.text}</div>
                  )}
                  <div style={{fontSize:10,color:"#9fa8da",marginTop:4}}>
                    — {entry.by}{entry.by_role?` (${entry.by_role})`:""}
                    {entry.edited_at&&<span style={{marginLeft:6,fontStyle:"italic"}}>(edited by {entry.edited_by})</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}


const NAV = [
  { section:"Overview", items:[{key:"dashboard",label:"Dashboard",icon:"📊"},{key:"reporting",label:"Reports & Analytics",icon:"📈"}] },
  { section:"Counseling", items:[{key:"leads",label:"Leads Pipeline",icon:"👥"},{key:"tasks",label:"Tasks & Follow-ups",icon:"✅"}] },
  { section:"Processing", items:[{key:"processing",label:"Processing Tracker",icon:"🔄"},{key:"cases",label:"Active Cases",icon:"📋"}] },
  { section:"WhatsApp", items:[{key:"whatsapp",label:"WhatsApp Inbox",icon:"💬"},{key:"notifications",label:"Client Notifications",icon:"🔔"}] },
  { section:"Accounting", items:[{key:"invoices",label:"Invoices",icon:"🧾"},{key:"agents",label:"Agents (B2B)",icon:"🤝"},{key:"expenses",label:"Expenses",icon:"💸"},{key:"pettycash",label:"Petty Cash",icon:"💵"},{key:"accounting",label:"Full Accounting",icon:"📒"}] },
  { section:"HR", items:[{key:"attendance",label:"Attendance",icon:"📅"},{key:"payroll",label:"Payroll & Salaries",icon:"💰"},{key:"staffledger",label:"Staff Ledger",icon:"📖"},{key:"invoicetemplate",label:"Invoice Template",icon:"🎨"}] },
  { section:"Admin", items:[{key:"bulkimport",label:"Import Clients",icon:"📤"},{key:"closedleads",label:"Closed Leads",icon:"❌"},{key:"activitylog",label:"Activity Log",icon:"🛡️"},{key:"settings",label:"Settings",icon:"⚙️",ceoOnly:true}] },
];

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [authUser,setAuthUser]=useState(null); const [currentUser,setCurrentUser]=useState(null);
  const [page,setPage]=useState("dashboard"); const [collapsed,setCollapsed]=useState(false);
  const mob = useMobile();
  const [menuOpen,setMenuOpen]=useState(false);
  const [lastActivity,setLastActivity]=useState(Date.now());
  // Reset activity timer on interaction
  React.useEffect(()=>{
    const reset=()=>setLastActivity(Date.now());
    window.addEventListener('click',reset);
    window.addEventListener('keypress',reset);
    return()=>{window.removeEventListener('click',reset);window.removeEventListener('keypress',reset);}
  },[]);
  const [authLoading,setAuthLoading]=useState(true);
  const [showReminderPopup,setShowReminderPopup]=useState(false);

  const leadsDB    =useTable("leads",{orderBy:"created_at",asc:false});
  const agentsDB   =useTable("agents",{orderBy:"created_at",asc:true});
  const tasksDB    =useTable("tasks",{orderBy:"created_at",asc:false});
  const invoicesDB =useTable("invoices",{orderBy:"created_at",asc:false});
  const accountsDB =useTable("accounts",{orderBy:"code",asc:true});
  const journalsDB =useTable("journals",{orderBy:"created_at",asc:false});
  const bankTxDB   =useTable("bank_transactions",{orderBy:"transaction_date",asc:false});
  const usersDB    =useTable("users",{orderBy:"created_at",asc:true});
  const waLeadsDB  =useTable("wa_leads",{orderBy:"received_at",asc:false});
  const notifsDB   =useTable("notifications",{orderBy:"sent_at",asc:false});
  const subAccDB   =useTable("sub_accounts",{orderBy:"code",asc:true});
  const settingsDB =useTable("settings",{orderBy:"key",asc:true});

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setAuthUser(session?.user??null);setAuthLoading(false);});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{setAuthUser(session?.user??null);});
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(authUser&&usersDB.data.length>0){
      const p=usersDB.data.find(u=>u.id===authUser.id);
      if(p) setCurrentUser(p);
      else {
        // Direct fetch fallback
        supabase.from("users").select("*").eq("id",authUser.id).single().then(({data})=>{
          if(data) setCurrentUser(data);
        });
      }
    }
  },[authUser,usersDB.data]);

  const signOut=async()=>{await supabase.auth.signOut();setAuthUser(null);setCurrentUser(null);};

  if(authLoading)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:B.grad,color:"#fff",fontSize:16}}>Loading Border and Bridges CRM…</div>;
  if(!authUser)return <LoginScreen onLogin={setAuthUser}/>;
  if(!currentUser)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f2fd",fontSize:14,color:"#5c6bc0",flexDirection:"column",gap:12}}><div>Setting up your profile…</div><div style={{fontSize:12,color:"#9fa8da"}}>If this persists, contact the CEO to check your user account in Settings.</div></div>;

  const pendingCount=leadsDB.data.filter(l=>l.pending_approval&&!l.approved).length;
  const waUnread=waLeadsDB.data.filter(w=>!w.converted).length;
  const overdueCount=tasksDB.data.filter(t=>!t.done&&t.due_date<tod()).length;
  const settings=settingsDB.data.reduce((acc,s)=>({...acc,[s.key]:s.value}),{});

  // Auto-log activity to Supabase
  const logActivity=async(action,module)=>{
    try{await supabase.from("audit_log").insert({user_id:currentUser?.id,user_name:currentUser?.name,action,module,created_at:new Date().toISOString()});}catch(e){}
  };

  const props={
    leads:leadsDB.data,leadsDB,tasks:tasksDB.data,tasksDB,agents:agentsDB.data,agentsDB,
    invoices:invoicesDB.data,invoicesDB,accounts:accountsDB.data,accountsDB,
    journals:journalsDB.data,journalsDB,bankTx:bankTxDB.data,bankTxDB,
    users:usersDB.data,usersDB,waLeads:waLeadsDB.data,waLeadsDB,
    notifications:notifsDB.data,notifsDB,subAccounts:subAccDB.data,subAccountsDB:subAccDB,
    settingsDB,settings,currentUser,authUser,setPage,
  };

  const renderPage=()=>{
    if(leadsDB.loading)return <Spin/>;
    switch(page){
      case "dashboard":     return <Dashboard {...props} setPage={setPage} users={usersDB.data}/>;
      case "leads":         return <Leads {...props}/>;
      case "cases":         return <Cases {...props} invoices={invoicesDB.data}/>;
      case "tasks":         return <Tasks {...props} leads={leadsDB.data}/>;
      case "processing":    return <Processing {...props}/>;
      case "reporting":     return <Reporting {...props} setPage={setPage}/>;
      case "activitylog":   return <ActivityLog {...props}/>;
      case "whatsapp":      return <WhatsAppInbox {...props}/>;
      case "notifications": return <Notifications {...props}/>;
      case "invoices":      return <Invoices {...props} agents={agentsDB.data}/>;
      case "accounting":    return <Accounting {...props}/>;
      case "bulkimport":    return <BulkImport {...props}/>;
      case "closedleads":   return <ClosedLeads {...props}/>;
      case "agents":        return <AgentsModule agents={agentsDB.data} agentsDB={agentsDB} invoices={invoicesDB.data} leads={leadsDB.data} currentUser={currentUser}/>;
      case "expenses":      return <Expenses currentUser={currentUser} settings={settings}/>;
      case "pettycash":     return <PettyCash currentUser={currentUser}/>;
      case "attendance":    return <Attendance users={usersDB.data} currentUser={currentUser}/>;
      case "payroll":       return <Payroll users={usersDB.data} currentUser={currentUser} invoices={invoicesDB.data}/>;
      case "staffledger":   return <StaffLedger users={usersDB.data} currentUser={currentUser}/>;
      case "invoicetemplate": return <InvoiceTemplateDesigner currentUser={currentUser} settings={settings} settingsDB={settingsDB}/>;
      case "settings":      return <Settings {...props}/>;
      default: return null;
    }
  };

  return (
    <ToastProvider>
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Outfit',sans-serif;background:#f0f2fd;color:#37474f;-webkit-text-size-adjust:100%}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#c5cae9;border-radius:4px}
        input:focus,select:focus,textarea:focus{border-color:#2d3a8c!important;box-shadow:0 0 0 3px rgba(45,58,140,0.12)!important;outline:none}
        button:active{transform:scale(0.97)} .nb:hover{background:rgba(255,255,255,0.08)!important}
        input,select,textarea{font-size:16px!important}
        @media(max-width:768px){
          .hide-mobile{display:none!important}
          table{font-size:11px!important}
          h2{font-size:16px!important}
          .main-wrap{padding:10px 10px 80px!important;margin-top:52px!important}
          .sidebar-wrap{position:fixed!important;bottom:0!important;left:0!important;right:0!important;top:auto!important;width:100%!important;height:auto!important;flex-direction:row!important;overflow-x:auto!important;overflow-y:hidden!important;z-index:500!important;padding:6px 4px max(8px,env(safe-area-inset-bottom))!important;border-top:1px solid rgba(255,255,255,0.1)!important;border-right:none!important;gap:2px!important;scrollbar-width:none!important}
          .sidebar-wrap::-webkit-scrollbar{display:none}
          .sidebar-section-label{display:none!important}
          .mobile-header{display:flex!important}
          .collapse-btn{display:none!important}
        }
        @media(min-width:769px){
          .mobile-header{display:none!important}
          .main-wrap{padding:24px!important}
        }
        @media(display-mode:standalone){
          .mobile-header{padding-top:max(10px,env(safe-area-inset-top))!important}
        }
      `}</style>
      <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
        {/* Mobile: fixed top header */}
        {mob&&(
          <div style={{position:"fixed",top:0,left:0,right:0,zIndex:600,background:B.dark,padding:"max(12px,env(safe-area-inset-top,12px)) 16px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:30,height:30,borderRadius:8,background:B.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#fff",fontSize:14}}>B</div>
              <span style={{color:"#fff",fontWeight:800,fontSize:15}}>BnB CRM</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{color:"rgba(255,255,255,0.7)",fontSize:11}}>{currentUser.name}</span>
              <button onClick={()=>setMenuOpen(p=>!p)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:"6px 10px",color:"#fff",fontSize:18,cursor:"pointer"}}>{menuOpen?"✕":"☰"}</button>
            </div>
          </div>
        )}
        {/* Mobile: overlay when menu open */}
        {mob&&menuOpen&&<div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:498}}/>}
        {/* Sidebar — desktop: fixed left | mobile: slide-in from left */}
        <div style={mob?{
          position:"fixed",top:0,left:0,bottom:0,width:280,
          background:B.grad,display:"flex",flexDirection:"column",
          zIndex:499,transform:menuOpen?"translateX(0)":"translateX(-100%)",
          transition:"transform 0.28s ease",overflowY:"auto",
        }:{
          width:collapsed?64:240,flexShrink:0,
          background:B.grad,display:"flex",flexDirection:"column",
          transition:"width 0.2s",overflow:"hidden",
        }}>
          <div style={{padding:collapsed?"16px 14px":"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
            {!collapsed?(
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <svg width="32" height="32" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" stroke="#1a91c7" strokeWidth="5" fill="rgba(255,255,255,0.1)"/><path d="M32 50 Q42 33 50 38 Q58 33 68 50" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round"/></svg>
                <div><div style={{fontSize:13,fontWeight:900,color:"#fff",lineHeight:1.1}}>{settings.company_name||"Border & Bridges"}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:0.8}}>Pvt. Ltd.</div></div>
              </div>
            ):(
              <svg width="32" height="32" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" stroke="#1a91c7" strokeWidth="5" fill="rgba(255,255,255,0.1)"/><path d="M32 50 Q42 33 50 38 Q58 33 68 50" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round"/></svg>
            )}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"12px 8px"}}>
            {NAV.map(section=>(
              <div key={section.section} style={{marginBottom:18}}>
                {!collapsed&&<div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:1.5,padding:"0 10px 6px"}}>{section.section}</div>}
                {section.items.filter(item=>!item.ceoOnly||(currentUser.role===ROLES.CEO||currentUser.role===ROLES.BRANCH_MANAGER)).map(item=>{
                  const active=page===item.key;
                  const badge=item.key==="leads"&&pendingCount>0?pendingCount:item.key==="tasks"&&overdueCount>0?overdueCount:item.key==="whatsapp"&&waUnread>0?waUnread:item.key==="processing"&&leadsDB.data.filter(l=>l.list==="ACL"&&!l.lost).length>0?leadsDB.data.filter(l=>l.list==="ACL"&&!l.lost).length:0;
                  return(
                    <button key={item.key} className="nb" onClick={()=>{setPage(item.key);if(mob)setMenuOpen(false);}} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:mob?"12px 16px":collapsed?"10px 14px":"9px 12px",borderRadius:10,border:"none",background:active?"rgba(255,255,255,0.18)":"transparent",color:active?"#fff":"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:mob?14:13,fontWeight:active?700:500,marginBottom:2,textAlign:"left",whiteSpace:"nowrap",overflow:"hidden",transition:"background 0.15s"}}>
                      <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
                      {!collapsed&&<span style={{flex:1}}>{item.label}</span>}
                      {!collapsed&&badge>0&&<span style={{background:"#f43f5e",color:"#fff",borderRadius:10,fontSize:10,fontWeight:800,padding:"1px 6px"}}>{badge}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{padding:"10px 8px 14px",borderTop:"1px solid rgba(255,255,255,0.1)"}}>
            {!collapsed&&<div style={{padding:"10px 12px",marginBottom:8,background:"rgba(255,255,255,0.08)",borderRadius:8}}><div style={{fontSize:12,fontWeight:700,color:"#fff",marginBottom:1}}>{currentUser.name}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.5)"}}>{currentUser.role} · {(currentUser.branch||"").split(" ")[0]}</div></div>}
            {!collapsed&&<button onClick={signOut} style={{width:"100%",padding:"8px",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:11,fontFamily:"inherit",marginBottom:6}}>Sign Out</button>}
            <button onClick={()=>setCollapsed(!collapsed)} style={{width:"100%",padding:"7px",background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>{collapsed?"›":"‹ Collapse"}</button>
          </div>
        </div>
        {/* Main content */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",marginLeft:mob?0:undefined}}>
          {/* Top bar — hidden on mobile (we have the header) */}
          {!mob&&(
            <div style={{background:"#fff",borderBottom:"1px solid #e8eaf6",padding:"11px 26px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <div style={{fontSize:13,fontWeight:700,color:B.dark}}>{NAV.flatMap(s=>s.items).find(i=>i.key===page)?.icon} {NAV.flatMap(s=>s.items).find(i=>i.key===page)?.label}</div>
              {overdueCount>0&&<button onClick={()=>setShowReminderPopup(p=>!p)} style={{background:"#fee2e2",border:"1px solid #dc2626",borderRadius:8,padding:"5px 12px",fontSize:12,color:"#7f1d1d",fontWeight:700,cursor:"pointer"}}>🔔 {overdueCount} task{overdueCount>1?"s":""} overdue</button>}
              {pendingCount>0&&currentUser.role===ROLES.CEO&&<div style={{background:"#fef3c7",border:"1px solid #f0b429",borderRadius:8,padding:"5px 12px",fontSize:12,color:"#7c5100",fontWeight:700}}>⏳ {pendingCount} pending</div>}
            </div>
          )}
          <div style={{flex:1,overflowY:"auto",padding:mob?"12px 12px 24px":"24px 28px 60px",marginTop:mob?"max(54px,calc(44px + env(safe-area-inset-top,0px)))":"0"}}>
            {/* Mobile page title */}
            {mob&&<div style={{fontSize:16,fontWeight:800,color:B.dark,marginBottom:12}}>{NAV.flatMap(s=>s.items).find(i=>i.key===page)?.icon} {NAV.flatMap(s=>s.items).find(i=>i.key===page)?.label}</div>}
            <div style={{width:"100%"}}>{renderPage()}</div>
          </div>
        </div>
      </div>
      {showReminderPopup&&<TaskReminderPopup tasks={tasksDB.data} onClose={()=>setShowReminderPopup(false)}/>}
    </>
    </ToastProvider>
  );
}

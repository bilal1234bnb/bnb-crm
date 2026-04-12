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
const Modal = ({title,onClose,children,w=540}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(26,32,87,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:w,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(26,32,87,0.25)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px 14px",borderBottom:"1px solid #e8eaf6",position:"sticky",top:0,background:"#fff",zIndex:1}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:800,color:B.dark}}>{title}</h3>
        <button onClick={onClose} style={{background:"#eef0fb",border:"none",borderRadius:7,padding:"5px 9px",cursor:"pointer",color:"#5c6bc0",fontSize:15}}>✕</button>
      </div>
      <div style={{padding:"18px 22px 22px"}}>{children}</div>
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
function Dashboard({leads,invoices,tasks,journals,accounts,currentUser}) {
  const rev=invoices.reduce((a,i)=>a+(i.paid||0),0);
  const pending=leads.filter(l=>l.pending_approval&&!l.approved);
  const openT=tasks.filter(t=>!t.done);
  const overdue=tasks.filter(t=>!t.done&&t.due_date<tod());
  const won=leads.filter(l=>l.stage==="Visa WON").length;
  const pipeline=["GCL","PCL","BCL","ACL"].map(list=>({list,count:leads.filter(l=>l.list===list&&!l.lost).length}));
  return (
    <div>
      <div style={{marginBottom:22}}><h2 style={S.h2}>Welcome, {currentUser.name} 👋</h2><p style={S.sub}>Border and Bridges Pvt. Ltd. · {tod()}</p></div>
      {currentUser.role===ROLES.CEO&&pending.length>0&&<Alert type="warn" msg={`⚠️ ${pending.length} lead(s) pending your assignment`}/>}
      {overdue.length>0&&<Alert type="error" msg={`🔴 ${overdue.length} task(s) are overdue`}/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14,marginBottom:22}}>
        <Stat label="Total Leads" value={leads.filter(l=>!l.lost).length} sub={`${leads.filter(l=>l.list==="ACL").length} active`} color={B.primary} icon="👥"/>
        <Stat label="Visa WON" value={won} sub={`${leads.filter(l=>l.stage==="Visa Rejected").length} rejected`} color={B.success} icon="✈️"/>
        <Stat label="Collected" value={`${Math.round(rev/1000)||0}K PKR`} color={B.secondary} icon="💰"/>
        <Stat label="Open Tasks" value={openT.length} sub={`${overdue.length} overdue`} color={overdue.length>0?B.danger:B.warn} icon="✅"/>
        <Stat label="Pending CEO" value={pending.length} color="#7c3aed" icon="⏳"/>
        <Stat label="Win Rate" value={leads.length>0?Math.round((won/leads.length)*100)+"%":"0%"} color={B.accent} icon="📈"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:18}}>
        <div style={S.card}>
          <div style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:16}}>Pipeline</div>
          {pipeline.map(p=>(
            <div key={p.list} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:13,fontWeight:700,color:B.dark}}>{p.list}</span>
                <span style={{fontSize:15,fontWeight:800,color:listC[p.list]}}>{p.count}</span>
              </div>
              <div style={{background:"#eef0fb",borderRadius:6,height:8}}>
                <div style={{background:listC[p.list],borderRadius:6,height:8,width:`${Math.max((p.count/Math.max(leads.length,1))*100,3)}%`}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{fontSize:14,fontWeight:700,color:B.dark,marginBottom:14}}>Upcoming Tasks</div>
          {openT.slice(0,6).map(t=>(
            <div key={t.id} style={{display:"flex",gap:10,marginBottom:10,paddingBottom:10,borderBottom:"1px solid #f3f4f9"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:priC[t.priority]||"#94a3b8",marginTop:5,flexShrink:0}}/>
              <div><div style={{fontSize:12,fontWeight:600,color:B.dark,lineHeight:1.3}}>{t.title}</div><div style={{fontSize:11,color:t.due_date<tod()?"#dc2626":"#9fa8da"}}>Due: {t.due_date||"—"}</div></div>
            </div>
          ))}
          {openT.length===0&&<div style={{color:"#9fa8da",fontSize:13,textAlign:"center",padding:16}}>All caught up! 🎉</div>}
        </div>
      </div>
    </div>
  );
}

// ─── LEADS (upgraded: new columns, search, PCL reminders, row highlighting) ───
function Leads({leads,leadsDB,tasks,tasksDB,users,agents,currentUser,settings}) {
  const [tab,setTab]=useState("GCL");
  const [showAdd,setShowAdd]=useState(false);
  const [sel,setSel]=useState(null);
  const [noteText,setNoteText]=useState("");
  const [noteType,setNoteType]=useState("Call");
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(new Set());
  const [batchAssignee,setBatchAssignee]=useState("");
  const [showBatchBar,setShowBatchBar]=useState(false);
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

  const pending=leads.filter(l=>l.pending_approval&&!l.approved);
  const counselors=users.filter(u=>u.role===ROLES.COUNSELOR&&u.active);

  const isReminderDue=(r)=>r&&r<=tod();
  const rowHighlight=(lead)=>{
    if(tab!=="PCL")return {};
    const due=[lead.reminder1,lead.reminder2,lead.reminder3].some(r=>isReminderDue(r));
    return due?{background:"#fff3cd",borderLeft:"4px solid #f0b429"}:{};
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
    const nl={...form,list:"GCL",stage:"New Enquiry",score:3,consultation_done:false,agreement_signed:false,payment_received:false,invoice_generated:false,all_doc_received:false,pending_approval:currentUser.role!==ROLES.CEO,approved:currentUser.role===ROLES.CEO,lost:false,last_contact:tod(),notes:[],docs:{},ielts_score:form.ielts_score||null,intake_target:form.intake_target||null,agent_id:form.agent_id||null,enquiry_date:form.enquiry_date||tod()};
    const saved=await leadsDB.insert(nl);
    if(saved)await tasksDB.insert({title:`Follow up: ${form.name} (2-day auto)`,client_name:form.name,lead_id:saved.id,assigned_to:currentUser.id,due_date:addDays(tod(),2),priority:"High",type:"Follow-up",auto_generated:true});
    setForm(EF);setShowAdd(false);
  };
  const assign=async(lead,uid)=>await leadsDB.update(lead.id,{assigned_to:uid,approved:true,pending_approval:false});
  const moveList=async(lead,nl)=>{
    if((nl==="PCL"||nl==="BCL")&&!lead.consultation_done){alert("⛔ Complete consultation first.");return;}
    if(nl==="ACL"){const miss=[];if(!lead.consultation_done)miss.push("Consultation Done");if(!lead.agreement_signed)miss.push("Agreement Signed");if(!lead.payment_received)miss.push("Payment Received");if(!lead.invoice_generated)miss.push("Invoice Generated");if(miss.length){alert("⛔ Cannot move to ACL.\nMissing:\n• "+miss.join("\n• "));return;}}
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
            {filtered.map((lead,idx)=>{
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
                  <td style={{...S.td,fontSize:11,minWidth:70,maxWidth:120,wordBreak:"break-word"}}>{lead.remarks||"—"}</td>
                  {tab==="PCL"&&<>
                    <td style={{...S.td,fontSize:11,color:isReminderDue(lead.reminder1)?"#dc2626":"#37474f",fontWeight:isReminderDue(lead.reminder1)?700:400}}>{lead.reminder1||"—"}</td>
                    <td style={{...S.td,fontSize:11,color:isReminderDue(lead.reminder2)?"#dc2626":"#37474f",fontWeight:isReminderDue(lead.reminder2)?700:400}}>{lead.reminder2||"—"}</td>
                    <td style={{...S.td,fontSize:11,color:isReminderDue(lead.reminder3)?"#dc2626":"#37474f",fontWeight:isReminderDue(lead.reminder3)?700:400}}>{lead.reminder3||"—"}</td>
                  </>}
                  <td style={{...S.td,whiteSpace:"nowrap"}}><button onClick={()=>setSel({...lead})} style={{...S.ghost,fontSize:10,padding:"4px 8px"}}>Open</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length===0&&<div style={{padding:32,textAlign:"center",color:"#9fa8da"}}>No leads in {tab}{search?` matching "${search}"`:""}.</div>}
        </div>
      </div>

      {sel&&(
        <Modal title={`${sel.name} · ${sel.country}`} onClose={()=>setSel(null)} w={700}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
            {[["Phone",sel.phone],["Email",sel.email||"—"],["Source",sel.source],["Branch",sel.branch],["IELTS",sel.ielts_score||"—"],["Intake",sel.intake_target||"—"],["Last Qual.",sel.last_qualification||"—"],["Qual. Year",sel.last_qualification_year||"—"],["Status",sel.status||"New"]].map(([k,v])=>(
              <div key={k}><div style={S.lbl}>{k}</div><div style={{fontSize:13,fontWeight:600,color:B.dark}}>{v}</div></div>
            ))}
          </div>
          {sel.issue&&<div style={{marginBottom:14}}><div style={S.lbl}>Issue</div><div style={{fontSize:13,color:"#37474f",background:"#f8f9ff",padding:"8px 12px",borderRadius:8}}>{sel.issue}</div></div>}
          {sel.remarks&&<div style={{marginBottom:14}}><div style={S.lbl}>Remarks</div><div style={{fontSize:13,color:"#37474f",background:"#f8f9ff",padding:"8px 12px",borderRadius:8}}>{sel.remarks}</div></div>}

          {/* Editable fields */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14,padding:14,background:"#f8f9ff",borderRadius:10}}>
            <Fld label="Status"><select style={S.sel} value={sel.status||"New"} onChange={e=>{leadsDB.update(sel.id,{status:e.target.value});setSel(p=>({...p,status:e.target.value}));}}><option>New</option><option>Active</option><option>Pending Docs</option><option>Follow Up</option><option>Won</option><option>Lost</option></select></Fld>
            <Fld label="Issue"><input style={S.inp} value={sel.issue||""} onChange={e=>setSel(p=>({...p,issue:e.target.value}))} onBlur={()=>leadsDB.update(sel.id,{issue:sel.issue})} placeholder="Any issue or concern…"/></Fld>
            <Fld label="Remarks"><input style={S.inp} value={sel.remarks||""} onChange={e=>setSel(p=>({...p,remarks:e.target.value}))} onBlur={()=>leadsDB.update(sel.id,{remarks:sel.remarks})} placeholder="Internal remarks…"/></Fld>
            {tab==="PCL"&&<>
              <Fld label="Reminder 1"><input type="date" style={S.inp} value={sel.reminder1||""} onChange={e=>{leadsDB.update(sel.id,{reminder1:e.target.value});setSel(p=>({...p,reminder1:e.target.value}));}}/></Fld>
              <Fld label="Reminder 2"><input type="date" style={S.inp} value={sel.reminder2||""} onChange={e=>{leadsDB.update(sel.id,{reminder2:e.target.value});setSel(p=>({...p,reminder2:e.target.value}));}}/></Fld>
              <Fld label="Reminder 3"><input type="date" style={S.inp} value={sel.reminder3||""} onChange={e=>{leadsDB.update(sel.id,{reminder3:e.target.value});setSel(p=>({...p,reminder3:e.target.value}));}}/></Fld>
            </>}
          </div>

          <div style={{marginBottom:14}}><div style={S.lbl}>Score</div><Stars score={sel.score||3} onChange={s=>setScore(sel,s)}/></div>
          <div style={{background:"#f8f9ff",borderRadius:10,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:"#5c6bc0",textTransform:"uppercase",marginBottom:10}}>Checklist</div>
            {[{f:"consultation_done",l:"Consultation Done"},{f:"agreement_signed",l:"Agreement Signed"},{f:"payment_received",l:"Payment Received"},{f:"invoice_generated",l:"Invoice Generated"},{f:"all_doc_received",l:"All Documents Received"}].map(item=><Chk key={item.f} label={item.l} checked={sel[item.f]||false} onChange={()=>toggle(sel,item.f)}/>)}
          </div>
          {currentUser.role===ROLES.CEO&&<div style={{marginBottom:14}}><div style={S.lbl}>Move to List</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["GCL","PCL","BCL","ACL"].filter(l=>l!==sel.list).map(l=><button key={l} onClick={()=>moveList(sel,l)} style={S.btn(listC[l])}>→ {l}</button>)}</div></div>}
          {currentUser.role===ROLES.CEO&&<div style={{marginBottom:14}}><div style={S.lbl}>Assign Counselor</div><select style={S.sel} value={sel.assigned_to||""} onChange={e=>{assign(sel,e.target.value);setSel(p=>({...p,assigned_to:e.target.value}))}}><option value="">-- Select --</option>{counselors.map(c=><option key={c.id} value={c.id}>{c.name} ({c.branch})</option>)}</select></div>}
          <div style={{borderTop:"1px solid #e8eaf6",paddingTop:16}}>
            <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:12}}>📞 Communication & Activity Log</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,marginBottom:12}}>
              <select value={noteType} onChange={e=>setNoteType(e.target.value)} style={S.sel}>
                {CONTACT_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
              <input style={S.inp} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder={`What happened on this ${noteType}? What did client say?`} onKeyDown={e=>e.key==="Enter"&&addNote(sel)}/>
              <button onClick={()=>addNote(sel)} style={{...S.btn(),flexShrink:0,whiteSpace:"nowrap"}}>+ Log</button>
            </div>
            <div style={{maxHeight:300,overflowY:"auto"}}>
              {[...(sel.notes||[])].reverse().map(note=>{
                const typeColors={Call:{c:"#059669",bg:"#d1fae5",icon:"📞"},WhatsApp:{c:"#25d366",bg:"#dcfce7",icon:"💬"},Email:{c:"#1a91c7",bg:"#dbeafe",icon:"📧"},"Walk-in":{c:"#7c3aed",bg:"#ede9fe",icon:"🚶"},Other:{c:"#64748b",bg:"#f1f5f9",icon:"📝"}};
                const tc=typeColors[note.type]||typeColors.Other;
                return (
                  <div key={note.id} style={{display:"flex",gap:10,marginBottom:10}}>
                    <div style={{width:34,height:34,borderRadius:10,background:tc.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{tc.icon}</div>
                    <div style={{flex:1,background:"#f8f9ff",borderRadius:10,padding:"10px 14px",border:"1px solid #e8eaf6"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <Pill text={note.type} color={tc.c} bg={tc.bg}/>
                          <span style={{fontSize:11,fontWeight:700,color:B.primary}}>{note.by}</span>
                        </div>
                        <span style={{fontSize:10,color:"#9fa8da"}}>{note.at}</span>
                      </div>
                      <div style={{fontSize:13,color:"#37474f",lineHeight:1.5}}>{note.text}</div>
                    </div>
                  </div>
                );
              })}
              {!(sel.notes||[]).length&&<div style={{color:"#9fa8da",fontSize:13,textAlign:"center",padding:20,background:"#f8f9ff",borderRadius:10}}>No communication logged yet. Add the first entry above.</div>}
            </div>
          </div>
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
  const [sel,setSel]=useState(null);
  const acl=leads.filter(l=>l.list==="ACL"&&!l.lost);
  const changeStage=async(lead,ns,invoices)=>{
    // Gate 1: Docs required before Application
    if(ns==="Applied for Admission"&&!lead.all_doc_received){
      alert("⛔ All documents must be received first.");return;
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
      alert("⛔ Only close after Visa Approved, Rejected, or Refund.");return;
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
          <thead><tr>{["Client","Country","Stage","Docs","Branch",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {acl.map(lead=>(
              <tr key={lead.id}>
                <td style={S.td}>
                  <div style={{fontWeight:700,color:B.dark}}>{lead.name}</div>
                  <div style={{fontSize:11,color:"#9fa8da"}}>{lead.phone}</div>
                  {(()=>{const inv=(invoices||[]).filter(i=>i.client_name===lead.name);const paid=inv.reduce((a,i)=>a+(i.paid||0),0);const billed=inv.reduce((a,i)=>a+(i.amount||0),0);if(inv.length===0)return <span style={{fontSize:10,background:"#fee2e2",color:"#dc2626",borderRadius:4,padding:"1px 6px",fontWeight:700}}>⚠️ No Invoice</span>;if(paid>=billed)return <span style={{fontSize:10,background:"#d1fae5",color:"#065f46",borderRadius:4,padding:"1px 6px",fontWeight:700}}>✓ Paid</span>;return <span style={{fontSize:10,background:"#fef3c7",color:"#7c5100",borderRadius:4,padding:"1px 6px",fontWeight:700}}>⏳ {Math.round((paid/Math.max(billed,1))*100)}% Paid</span>;})()}
                </td>
                <td style={S.td}>{lead.country}<div style={{fontSize:11,color:"#9fa8da"}}>{lead.intake_target}</div></td>
                <td style={S.td}><Pill text={lead.stage} color="#37474f" bg="#f3f4f9"/></td>
                <td style={S.td}>{lead.all_doc_received?<span style={{color:B.success,fontWeight:700,fontSize:12}}>Complete ✓</span>:<span style={{color:B.warn,fontSize:12}}>Pending</span>}</td>
                <td style={S.td}><span style={{fontSize:12}}>{lead.branch?.split(" ")[0]}</span></td>
                <td style={S.td}><button onClick={()=>setSel({...lead})} style={S.btn(B.secondary)}>Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {acl.length===0&&<div style={{padding:32,textAlign:"center",color:"#9fa8da"}}>No active cases yet.</div>}
      </div>
      {sel&&(
        <Modal title={`Case: ${sel.name} · ${sel.country}`} onClose={()=>setSel(null)} w={660}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div style={{...S.card,padding:12}}><div style={S.lbl}>Current Stage</div><Pill text={sel.stage} color={B.primary} bg={B.light}/></div>
            <div style={{...S.card,padding:12}}><div style={S.lbl}>IELTS/PTE</div><div style={{fontSize:14,fontWeight:800,color:B.dark}}>{sel.ielts_score||"—"}</div></div>
          </div>
          <div style={{background:"#f8f9ff",borderRadius:10,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:"#5c6bc0",textTransform:"uppercase",marginBottom:10}}>Documents — {sel.country}</div>
            {(COUNTRY_DOCS[sel.country]||[]).map(doc=><Chk key={doc} label={doc} checked={sel.docs?.[`doc_${doc}`]||false} onChange={()=>toggleDoc(sel,doc)}/>)}
          </div>
          <div style={S.lbl}>Move to Stage</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",maxHeight:200,overflowY:"auto"}}>
            {(COUNTRY_STAGES[sel.country]||[]).map(stage=><button key={stage} onClick={()=>changeStage(sel,stage,invoices)} style={{...S.ghost,fontSize:12,padding:"6px 12px",borderColor:sel.stage===stage?B.primary:"#c5cae9",color:sel.stage===stage?B.primary:"#5c6bc0",fontWeight:sel.stage===stage?700:500}}>{stage}</button>)}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
function Tasks({tasks,tasksDB,leads,users,currentUser}) {
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
        <Modal title="Add Task" onClose={()=>setShowAdd(false)}>
          <Fld label="Task"><input style={S.inp} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Task description…"/></Fld>
          <R2><Fld label="Client"><input style={S.inp} value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})} placeholder="Optional"/></Fld><Fld label="Due Date"><input type="date" style={S.inp} value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/></Fld></R2>
          <R2><Fld label="Priority"><select style={S.sel} value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>High</option><option>Medium</option><option>Low</option></select></Fld><Fld label="Type"><select style={S.sel} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Follow-up</option><option>Docs</option><option>Visa</option><option>Application</option><option>Finance</option><option>Other</option></select></Fld></R2>
          {currentUser.role===ROLES.CEO&&<Fld label="Assign To"><select style={S.sel} value={form.assigned_to} onChange={e=>setForm({...form,assigned_to:e.target.value})}>{users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}</select></Fld>}
          <button onClick={async()=>{if(!form.title)return;await tasksDB.insert({...form,done:false,auto_generated:false});setShowAdd(false);setForm({title:"",client_name:"",assigned_to:currentUser.id,due_date:"",priority:"High",type:"Follow-up"});}} style={{...S.btn("#7c3aed"),width:"100%",justifyContent:"center",padding:12}}>Add Task</button>
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
  const [jvNarr,setJvNarr]=useState(""); const [jvDate,setJvDate]=useState(tod());
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
  const counselors=users.filter(u=>u.role===ROLES.COUNSELOR&&u.active);
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
            {users.map(u=>(
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

  return (
    <div>
      <div style={{marginBottom:18}}><h2 style={S.h2}>Bulk Import Existing Clients</h2><p style={S.sub}>Upload your existing GCL, PCL, BCL or ACL clients from Excel/CSV</p></div>

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
    </div>
  );
}

// ─── PROCESSING MODULE ───────────────────────────────────────────────────────
function Processing({leads,leadsDB,tasksDB,users,invoices:invoicesProp,currentUser}) {
  const [search,setSearch]=useState("");
  const [sel,setSel]=useState(null);
  const [filterCountry,setFilterCountry]=useState("All");
  const [filterStage,setFilterStage]=useState("All");
  const [showReminderModal,setShowReminderModal]=useState(false);
  const [reminderForm,setReminderForm]=useState({date:"",note:""});

  // Only ACL leads go to processing
  const cases=useMemo(()=>{
    let list=leads.filter(l=>l.list==="ACL"&&!l.lost);
    if(currentUser.role===ROLES.PROCESSING)list=list.filter(l=>l.assigned_to===currentUser.id||l.processing_officer===currentUser.id);
    if(filterCountry!=="All")list=list.filter(l=>l.country===filterCountry);
    if(filterStage!=="All")list=list.filter(l=>l.stage===filterStage);
    if(search.trim()){const q=search.toLowerCase();list=list.filter(l=>(l.name||"").toLowerCase().includes(q));}
    return list;
  },[leads,currentUser,filterCountry,filterStage,search]);

  const countries=["All",...new Set(leads.filter(l=>l.list==="ACL").map(l=>l.country))];
  const stagesForFilter=filterCountry==="All"?["All"]:["All",...(PROCESSING_STAGES[filterCountry]||[])];

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

      {/* Key Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:12,marginBottom:20}}>
        <Stat label="Total ACL Cases" value={leads.filter(l=>l.list==="ACL"&&!l.lost).length} color={B.primary} icon="📋"/>
        <Stat label="Docs Requested" value={docsRequested} color={B.warn} icon="📄"/>
        <Stat label="Offer Letter Recd" value={offerLetterRec} color={B.secondary} icon="🎓"/>
        <Stat label="Fee Paid" value={feePaid} color="#7c3aed" icon="💳"/>
        <Stat label="Visa Filed" value={visaFiled} color={B.accent} icon="✈️"/>
        <Stat label="Visa WON" value={visaWon} color={B.success} icon="🎉"/>
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
          <thead><tr>{["#","Date Added","Client","Country","Current Stage","Docs","Reminders","Officer",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {cases.map((lead,idx)=>{
              const officer=users.find(u=>u.id===lead.assigned_to);
              const docList=PROCESSING_DOCS[lead.country]||[];
              const docDone=docList.filter(d=>lead.docs?.[`doc_${d}`]).length;
              const pendingReminders=(lead.processing_reminders||[]).filter(r=>!r.done&&r.date<=tod()).length;
              const stageIdx=(PROCESSING_STAGES[lead.country]||[]).indexOf(lead.stage);
              const totalStages=(PROCESSING_STAGES[lead.country]||[]).length;
              const progress=totalStages>0?Math.round((Math.max(stageIdx,0)/totalStages)*100):0;
              return (
                <tr key={lead.id}>
                  <td style={{...S.td,fontSize:11,color:"#9fa8da",fontWeight:700,maxWidth:30,textAlign:"center"}}>{idx+1}</td>
                  <td style={{...S.td,fontSize:11,whiteSpace:"nowrap"}}>{lead.created_at?.split("T")[0]||"—"}</td>
                  <td style={S.td}><div style={{fontWeight:700,color:B.dark}}>{lead.name}</div><div style={{fontSize:11,color:"#9fa8da"}}>{lead.phone}</div></td>
                  <td style={{...S.td,minWidth:70,maxWidth:100,fontSize:11,wordBreak:"break-word"}}>{lead.country}</td>
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
                  <td style={S.td}><button onClick={()=>setSel({...lead})} style={S.btn(B.secondary)}>Manage</button></td>
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
          {(()=>{const stages=PROCESSING_STAGES[sel.country]||[];const idx=stages.indexOf(sel.stage);const pct=stages.length>0?Math.round((Math.max(idx,0)/stages.length)*100):0;return(
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:"#5c6bc0",fontWeight:700}}>Processing Progress</span>
                <span style={{fontSize:12,fontWeight:800,color:B.primary}}>{pct}%</span>
              </div>
              <div style={{background:"#eef0fb",borderRadius:6,height:10}}>
                <div style={{background:B.grad,borderRadius:6,height:10,width:`${pct}%`,transition:"width 0.4s"}}/>
              </div>
              <div style={{fontSize:11,color:"#9fa8da",marginTop:4}}>Stage {Math.max(idx+1,1)} of {stages.length}: <strong>{sel.stage}</strong></div>
            </div>
          );})()}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* Stage selector */}
            <div style={{...S.card,padding:14}}>
              <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:10}}>Move to Stage</div>
              <div style={{maxHeight:220,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
                {(PROCESSING_STAGES[sel.country]||[]).map(stage=>(
                  <button key={stage} onClick={()=>changeStage(sel,stage,invoices)} style={{textAlign:"left",padding:"7px 10px",borderRadius:7,border:"1px solid",borderColor:sel.stage===stage?B.primary:"#e8eaf6",background:sel.stage===stage?B.light:"#f8f9ff",color:sel.stage===stage?B.primary:"#37474f",fontSize:11,fontWeight:sel.stage===stage?700:400,cursor:"pointer"}}>{stage}</button>
                ))}
              </div>
            </div>

            {/* Document checklist */}
            <div style={{...S.card,padding:14}}>
              <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:10}}>Document Checklist</div>
              <div style={{maxHeight:220,overflowY:"auto"}}>
                {(PROCESSING_DOCS[sel.country]||[]).map(doc=>(
                  <Chk key={doc} label={doc} checked={sel.docs?.[`doc_${doc}`]||false} onChange={()=>toggleDoc(sel,doc)}/>
                ))}
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
            <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:10}}>📞 Full Communication Log</div>
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
    </div>
  );
}

// ─── REPORTING MODULE ─────────────────────────────────────────────────────────
function Reporting({leads,tasks,invoices,users,currentUser}) {
  const [tab,setTab]=useState("counselor");

  const counselors=users.filter(u=>u.role===ROLES.COUNSELOR);
  const processingOfficers=users.filter(u=>u.role===ROLES.PROCESSING);

  // Counselor KPIs
  const counselorStats=counselors.map(c=>{
    const myLeads=leads.filter(l=>l.assigned_to===c.id);
    const gcl=myLeads.filter(l=>l.list==="GCL").length;
    const pcl=myLeads.filter(l=>l.list==="PCL").length;
    const acl=myLeads.filter(l=>l.list==="ACL").length;
    const won=myLeads.filter(l=>l.stage==="Visa Approved"||l.stage==="PR Approved").length;
    const lost=myLeads.filter(l=>l.lost).length;
    const convRate=myLeads.length>0?Math.round((acl/myLeads.length)*100):0;
    const winRate=acl>0?Math.round((won/Math.max(acl,1))*100):0;
    const myTasks=tasks.filter(t=>t.assigned_to===c.id);
    const overdueT=myTasks.filter(t=>!t.done&&t.due_date<tod()).length;
    return {c,gcl,pcl,acl,won,lost,convRate,winRate,total:myLeads.length,overdueT};
  }).sort((a,b)=>b.acl-a.acl);

  // Processing KPIs
  const processingStats=processingOfficers.map(p=>{
    const myCases=leads.filter(l=>l.list==="ACL"&&(l.assigned_to===p.id||l.processing_officer===p.id));
    const won=myCases.filter(l=>l.stage==="Visa Approved"||l.stage==="PR Approved").length;
    const inProgress=myCases.filter(l=>l.stage!=="Case Closed"&&l.stage!=="Visa Rejected").length;
    return {p,total:myCases.length,won,inProgress};
  });

  // Country breakdown
  const countryStats=ALL_COUNTRIES.map(country=>{
    const cLeads=leads.filter(l=>l.country===country&&!l.lost);
    const acl=cLeads.filter(l=>l.list==="ACL").length;
    const won=cLeads.filter(l=>l.stage==="Visa Approved"||l.stage==="PR Approved").length;
    const rejected=cLeads.filter(l=>l.stage==="Visa Rejected"||l.stage==="PR Rejected").length;
    return {country,total:cLeads.length,acl,won,rejected};
  }).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);

  // Company KPIs
  const totalRev=invoices.reduce((a,i)=>a+(i.paid||0),0);
  const totalBilled=invoices.reduce((a,i)=>a+(i.amount||0),0);
  const outstanding=totalBilled-totalRev;
  const totalLeads=leads.filter(l=>!l.lost).length;
  const totalACL=leads.filter(l=>l.list==="ACL").length;
  const totalWon=leads.filter(l=>l.stage==="Visa Approved"||l.stage==="PR Approved").length;
  const totalLost=leads.filter(l=>l.lost).length;
  const overallConv=totalLeads>0?Math.round((totalACL/totalLeads)*100):0;

  const PdfBtn=({id,title})=><button onClick={()=>printReport(id,title)} style={{...S.ghost,fontSize:11,padding:"5px 12px"}}>🖨️ Print / PDF</button>;

  return (
    <div>
      <div style={{marginBottom:18}}><h2 style={S.h2}>Reports & Analytics</h2><p style={S.sub}>Counselor KPIs · Processing performance · Company overview</p></div>

      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {[["counselor","Counselor KPIs"],["processing","Processing KPIs"],["country","Country Breakdown"],["company","Company Overview"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:"7px 16px",borderRadius:8,border:"2px solid",borderColor:tab===k?B.primary:"#c5cae9",background:tab===k?B.light:"#fff",color:tab===k?B.primary:"#5c6bc0",fontSize:13,fontWeight:700,cursor:"pointer"}}>{l}</button>
        ))}
      </div>

      {tab==="counselor"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:14,fontWeight:700,color:B.dark}}>Counselor Performance</div><PdfBtn id="rpt-counselor" title="Counselor KPIs"/></div>
          <div id="rpt-counselor" style={S.card}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Counselor","Branch","Total Leads","GCL","PCL","ACL","Won","Lost","Conv %","Win %","Overdue Tasks"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {counselorStats.map(({c,gcl,pcl,acl,won,lost,convRate,winRate,total,overdueT})=>(
                  <tr key={c.id}>
                    <td style={S.td}><div style={{fontWeight:700,color:B.dark}}>{c.name}</div></td>
                    <td style={S.td}>{c.branch}</td>
                    <td style={{...S.td,fontWeight:800,color:B.primary}}>{total}</td>
                    <td style={S.td}>{gcl}</td>
                    <td style={S.td}>{pcl}</td>
                    <td style={{...S.td,fontWeight:700,color:B.success}}>{acl}</td>
                    <td style={{...S.td,fontWeight:700,color:B.secondary}}>{won}</td>
                    <td style={{...S.td,color:lost>0?"#dc2626":"#9fa8da"}}>{lost}</td>
                    <td style={S.td}><Pill text={convRate+"%"} color={convRate>=30?B.success:convRate>=15?B.warn:B.danger} bg={convRate>=30?"#d1fae5":convRate>=15?"#fffde7":"#fee2e2"}/></td>
                    <td style={S.td}><Pill text={winRate+"%"} color={winRate>=60?B.success:winRate>=30?B.warn:B.danger} bg={winRate>=60?"#d1fae5":winRate>=30?"#fffde7":"#fee2e2"}/></td>
                    <td style={S.td}>{overdueT>0?<Pill text={overdueT+" overdue"} color="#9b1c1c" bg="#fee2e2"/>:<Pill text="None" color="#065f46" bg="#d1fae5"/>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {counselorStats.length===0&&<div style={{padding:24,textAlign:"center",color:"#9fa8da"}}>No counselors yet.</div>}
          </div>
        </div>
      )}

      {tab==="processing"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:14,fontWeight:700,color:B.dark}}>Processing Officer Performance</div><PdfBtn id="rpt-proc" title="Processing KPIs"/></div>
          <div id="rpt-proc" style={S.card}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Officer","Total Cases","In Progress","Visa Won","Win Rate"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {processingStats.map(({p,total,won,inProgress})=>{
                  const wr=total>0?Math.round((won/total)*100):0;
                  return (
                    <tr key={p.id}>
                      <td style={S.td}><div style={{fontWeight:700,color:B.dark}}>{p.name}</div><div style={{fontSize:11,color:"#9fa8da"}}>{p.branch}</div></td>
                      <td style={{...S.td,fontWeight:800}}>{total}</td>
                      <td style={{...S.td,color:B.secondary,fontWeight:700}}>{inProgress}</td>
                      <td style={{...S.td,color:B.success,fontWeight:700}}>{won}</td>
                      <td style={S.td}><Pill text={wr+"%"} color={wr>=60?B.success:wr>=30?B.warn:B.danger} bg={wr>=60?"#d1fae5":wr>=30?"#fffde7":"#fee2e2"}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {processingStats.length===0&&<div style={{padding:24,textAlign:"center",color:"#9fa8da"}}>No processing officers yet.</div>}
            <div style={{marginTop:16,padding:"12px 14px",background:"#f8f9ff",borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:700,color:B.dark,marginBottom:10}}>Stage Breakdown — All ACL Cases</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {Object.entries(leads.filter(l=>l.list==="ACL").reduce((acc,l)=>{acc[l.stage]=(acc[l.stage]||0)+1;return acc;},{}) ).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([stage,count])=>(
                  <div key={stage} style={{padding:"4px 10px",background:B.light,borderRadius:20,fontSize:11,color:B.primary,fontWeight:700}}>{stage}: {count}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab==="country"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:14,fontWeight:700,color:B.dark}}>Country Breakdown</div><PdfBtn id="rpt-country" title="Country Breakdown"/></div>
          <div id="rpt-country" style={S.card}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Country","Total Leads","ACL (Active)","Visa Won","Visa Rejected","Win Rate"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {countryStats.map(({country,total,acl,won,rejected})=>{
                  const wr=acl>0?Math.round((won/acl)*100):0;
                  return (
                    <tr key={country}>
                      <td style={{...S.td,fontWeight:700}}>{country}</td>
                      <td style={S.td}>{total}</td>
                      <td style={{...S.td,color:B.success,fontWeight:700}}>{acl}</td>
                      <td style={{...S.td,color:B.secondary,fontWeight:700}}>{won}</td>
                      <td style={{...S.td,color:rejected>0?"#dc2626":"#9fa8da"}}>{rejected}</td>
                      <td style={S.td}><Pill text={wr+"%"} color={wr>=60?B.success:wr>=30?B.warn:B.danger} bg={wr>=60?"#d1fae5":wr>=30?"#fffde7":"#fee2e2"}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="company"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:14,fontWeight:700,color:B.dark}}>Company Overview</div><PdfBtn id="rpt-company" title="Company Overview"/></div>
          <div id="rpt-company">
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14,marginBottom:20}}>
              <Stat label="Total Revenue" value={fmt(totalRev)} color={B.success} icon="💰"/>
              <Stat label="Outstanding" value={fmt(outstanding)} color={B.danger} icon="⏳"/>
              <Stat label="Total Leads" value={totalLeads} color={B.primary} icon="👥"/>
              <Stat label="Active Cases" value={totalACL} color={B.secondary} icon="📋"/>
              <Stat label="Total WON" value={totalWon} color="#7c3aed" icon="🎉"/>
              <Stat label="Total Lost" value={totalLost} color={B.warn} icon="💀"/>
              <Stat label="Overall Conv." value={overallConv+"%"} color={B.accent} icon="📈"/>
              <Stat label="Staff Members" value={users.length} color={B.dark} icon="👤"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <div style={S.card}>
                <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:14}}>Revenue Breakdown</div>
                {[["Total Billed",totalBilled,B.primary],["Collected",totalRev,B.success],["Outstanding",outstanding,B.danger]].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f3f4f9"}}>
                    <span style={{fontSize:13,color:"#37474f"}}>{l}</span>
                    <span style={{fontSize:14,fontWeight:800,color:c}}>{fmt(v)}</span>
                  </div>
                ))}
              </div>
              <div style={S.card}>
                <div style={{fontSize:13,fontWeight:700,color:B.dark,marginBottom:14}}>Pipeline Summary</div>
                {["GCL","PCL","BCL","ACL"].map(list=>{
                  const count=leads.filter(l=>l.list===list&&!l.lost).length;
                  return (
                    <div key={list} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,color:B.dark,fontWeight:600}}>{list}</span><span style={{fontWeight:800,color:listC[list]}}>{count}</span></div>
                      <div style={{background:"#eef0fb",borderRadius:4,height:7}}><div style={{background:listC[list],borderRadius:4,height:7,width:`${Math.max((count/Math.max(totalLeads,1))*100,2)}%`}}/></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ACTIVITY LOG ─────────────────────────────────────────────────────────────
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
              {filtered.map((lead,idx)=>{
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
  const canEdit=currentUser.role===ROLES.CEO||currentUser.role===ROLES.ACCOUNTS||currentUser.role==="Finance Officer";

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

  const canEdit=currentUser.role===ROLES.CEO||currentUser.role===ROLES.ACCOUNTS||currentUser.role==="Finance Officer";
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
  const [selMonth,setSelMonth]=useState(tod().slice(0,7));
  const [showAdd,setShowAdd]=useState(false);
  const [showAdvance,setShowAdvance]=useState(null);
  const [showSlip,setShowSlip]=useState(null);

  const canAccess=currentUser.role===ROLES.CEO||currentUser.role===ROLES.ACCOUNTS||currentUser.role==="Finance Officer";
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

  const canAccess=currentUser.role===ROLES.CEO||currentUser.role===ROLES.ACCOUNTS;
  if(!canAccess)return <div style={{...S.card,textAlign:"center",padding:60,color:"#9fa8da"}}>🔒 CEO and Accounts only.</div>;

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
      case "dashboard":     return <Dashboard {...props}/>;
      case "leads":         return <Leads {...props}/>;
      case "cases":         return <Cases {...props} invoices={invoicesDB.data}/>;
      case "tasks":         return <Tasks {...props} leads={leadsDB.data}/>;
      case "processing":    return <Processing {...props}/>;
      case "reporting":     return <Reporting {...props}/>;
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Outfit',sans-serif;background:#f0f2fd;color:#37474f}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#c5cae9;border-radius:4px}
        input:focus,select:focus,textarea:focus{border-color:#2d3a8c!important;box-shadow:0 0 0 3px rgba(45,58,140,0.12)!important;outline:none}
        button:active{transform:scale(0.97)} .nb:hover{background:rgba(255,255,255,0.08)!important}
      `}</style>
      <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
        <div style={{width:collapsed?64:240,background:B.grad,display:"flex",flexDirection:"column",transition:"width 0.2s",flexShrink:0,overflow:"hidden"}}>
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
                    <button key={item.key} className="nb" onClick={()=>setPage(item.key)} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:collapsed?"10px 14px":"9px 12px",borderRadius:10,border:"none",background:active?"rgba(255,255,255,0.18)":"transparent",color:active?"#fff":"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:13,fontWeight:active?700:500,marginBottom:2,textAlign:"left",whiteSpace:"nowrap",overflow:"hidden",transition:"background 0.15s"}}>
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
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{background:"#fff",borderBottom:"1px solid #e8eaf6",padding:"11px 26px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div style={{fontSize:13,fontWeight:700,color:B.dark}}>{NAV.flatMap(s=>s.items).find(i=>i.key===page)?.icon} {NAV.flatMap(s=>s.items).find(i=>i.key===page)?.label}</div>
            {overdueCount>0&&<button onClick={()=>setShowReminderPopup(p=>!p)} style={{background:"#fee2e2",border:"1px solid #dc2626",borderRadius:8,padding:"5px 12px",fontSize:12,color:"#7f1d1d",fontWeight:700,cursor:"pointer"}}>🔔 {overdueCount} task{overdueCount>1?"s":""} overdue</button>}
            {pendingCount>0&&currentUser.role===ROLES.CEO&&<div style={{background:"#fef3c7",border:"1px solid #f0b429",borderRadius:8,padding:"5px 12px",fontSize:12,color:"#7c5100",fontWeight:700}}>⏳ {pendingCount} pending</div>}
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"24px 28px 60px"}}>
            <div style={{width:"100%"}}>{renderPage()}</div>
          </div>
        </div>
      </div>
      {showReminderPopup&&<TaskReminderPopup tasks={tasksDB.data} onClose={()=>setShowReminderPopup(false)}/>}
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type HeardOption = "x" | "friend" | "newsletter" | "community" | "other" | "";
type SponsorPkg = "bronze" | "silver" | "platinum" | "gold" | "moon";

const PROFILE_OPTIONS = [
  "Dog Owner/Pet Lover",
  "Web3 Project Builder/Investor",
  "Local Attendee (e.g., from the event city/area)",
  "Media Person/Journalist",
  "Content Creator (e.g., Streamer, Photographer, Meme Artist)",
  "Other",
] as const;

const CONTENT_TYPES = [
  "Streaming (Twitch/YouTube Live)",
  "Photography/Videography",
  "Memes/Graphic Design",
  "Writing/Blogging",
  "Podcasting",
  "None, but I'm here to vibe Doge day",
] as const;

const PKGS: { value: SponsorPkg; label: string }[] = [
  { value: "bronze", label: "Bronze - $1k - Discounted VIP ticket" },
  { value: "silver", label: "Silver - $5k - Discounted VIP ticket" },
  { value: "platinum", label: "Platinum - $7.5k - 1 VIP tickets included" },
  { value: "gold", label: "Gold - $15k - 2 VIP tickets included" },
  { value: "moon", label: "Moon - $25k - 3 VIP tickets included, Premium Press Package" },
];

const schema = z.object({
  name: z.string().min(2, "Please enter at least 2 characters"),
  twitter: z.string().default(""),
  instagram: z.string().default(""),
  discord: z.string().default(""),
  profiles: z.array(z.string()).refine(arr => arr.length > 0, { message: "Select at least one" }),
  profileOther: z.string().default(""),
  interest: z.enum(["none","vip","sponsor"] as const),
  vipQty: z.number().int().min(1, "Min 1").max(10, "Max 10").default(1),
  vipCompany: z.string().default(""),
  vipAllergies: z.string().default(""),
  sBrand: z.string().default(""),
  sPkg: z.enum(["bronze","silver","platinum","gold","moon"] as const).default("bronze"),
  contentTypes: z.array(z.string()).default([]),
  creator1: z.string().default(""),
  creator2: z.string().default(""),
  screenshot: z.any().optional(),
  heard: z.enum(["", "x", "friend", "newsletter", "community", "other"] as const).default(""),
  heardOther: z.string().default(""),
  suggestions: z.string().default("")
}).superRefine((val, ctx) => {
  if (val.profiles.includes("Other") && !val.profileOther?.trim()) {
    ctx.addIssue({ path: ["profileOther"], code: z.ZodIssueCode.custom, message: "Please describe 'Other'" });
  }
  if (val.interest === "vip") {
    if (typeof val.vipQty !== "number" || val.vipQty < 1 || val.vipQty > 10) {
      ctx.addIssue({ path: ["vipQty"], code: z.ZodIssueCode.custom, message: "VIP qty must be 1-10" });
    }
  }
  if (val.interest === "sponsor" && !val.sBrand?.trim()) {
    ctx.addIssue({ path: ["sBrand"], code: z.ZodIssueCode.custom, message: "Brand is required" });
  }
  if (val.heard === "other" && !val.heardOther?.trim()) {
    ctx.addIssue({ path: ["heardOther"], code: z.ZodIssueCode.custom, message: "Please tell us more" });
  }
});

type FormValues = z.input<typeof schema>;

export default function Signups() {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { register, handleSubmit, control, watch, formState: { errors, isValid, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      twitter: "",
      instagram: "",
      discord: "",
      profiles: [],
      profileOther: "",
      interest: "none",
      vipQty: 1,
      vipCompany: "",
      vipAllergies: "",
      sBrand: "",
      sPkg: "bronze",
      contentTypes: [],
      creator1: "",
      creator2: "",
      heard: "",
      heardOther: "",
      suggestions: "",
    },
  });

  const interest = watch("interest");
  const profiles = watch("profiles");
  const heard = watch("heard");

  function openXInvite() {
    const creator1 = watch("creator1");
    const creator2 = watch("creator2");
    if (!creator1 || !creator2) {
      alert("Please fill Creator 1 and Creator 2 before inviting on X.");
      return;
    }
    const text = `Hey ${creator1} and ${creator2}, check out Doge Day 2025, hosted by @ownthedoge!\n\nhttp://dogeday2025.ownthedoge.com/\n\n#DogeDay2025`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const onSubmit = async (values: FormValues) => {
    const base = {
      name: values.name.trim(),
      // keep 'social' for API JSON compatibility (presence-checked); also include socials detail
      social: [values.twitter, values.instagram, values.discord].filter(Boolean).join(" | "),
      socials: { twitter: values.twitter?.trim() || "", instagram: values.instagram?.trim() || "", discord: values.discord?.trim() || "" },
      profiles: values.profiles,
      profileOther: values.profiles.includes("Other") ? values.profileOther?.trim() : undefined,
      interest: values.interest,
      vip: values.interest === "vip" ? { quantity: values.vipQty ?? 1, company: values.vipCompany?.trim() || "", foodAllergies: values.vipAllergies?.trim() || "" } : undefined,
      sponsor: values.interest === "sponsor" ? { brand: values.sBrand?.trim() || "", package: values.sPkg || "bronze" } : undefined,
      contentTypes: values.contentTypes || [],
      referral: { creator1: values.creator1?.trim() || "", creator2: values.creator2?.trim() || "" },
      heard: values.heard,
      heardOther: values.heard === "other" ? values.heardOther?.trim() : undefined,
      suggestions: values.suggestions?.trim() || "",
    };

    const file = (values.screenshot as FileList | undefined)?.[0];
    if (file) {
      const fd = new FormData();
      fd.append("formType", "attendee");
      fd.append("payload", new Blob([JSON.stringify(base)], { type: "application/json" }));
      fd.append("screenshot", file);
      const res = await fetch("/api/signup", { method: "POST", body: fd });
      if (!res.ok) { alert("Submission failed."); return; }
    } else {
      const res = await fetch("/api/signup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ formType: "attendee", ...base }) });
      if (!res.ok) { alert("Submission failed."); return; }
    }
    setSubmitted(true);
  };

  const inputStyle: React.CSSProperties = {
    background: "#fff6e0",
    border: "1px solid #333",
    color: "#000",
    borderRadius: 8,
    padding: 10,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 16, width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      <div className="form-section" id="section-basics" style={{ display: "grid", gap: 8 }}>
        <label className="form-title">My Name</label>
        <input className="input-inline" style={inputStyle} {...register("name")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
        {errors.name && <span style={{ color: "#b00020" }}>{errors.name.message as string}</span>}
      </div>

      <div className="form-section" id="section-socials" style={{ display: "grid", gap: 8 }}>
        <label className="form-title">Connect with me here</label>
        <input className="input-inline input-animated" placeholder="Twitter" style={inputStyle} {...register("twitter")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
        <input className="input-inline input-animated" placeholder="Instagram" style={inputStyle} {...register("instagram")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
        <input className="input-inline input-animated" placeholder="Discord" style={inputStyle} {...register("discord")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
      </div>

      <div className="form-section" id="section-profiles" style={{ display: "grid", gap: 10 }}>
        <label className="form-title">I will be attending Doge Day as a</label>
        {PROFILE_OPTIONS.map(opt => (
          <label key={opt} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Controller
              control={control}
              name="profiles"
              render={({ field: { value, onChange } }) => (
                <input
                  type="checkbox"
                  className="checkbox-circle"
                  checked={Array.isArray(value) ? value.includes(opt) : false}
                  onChange={() => {
                    const current = Array.isArray(value) ? value : [];
                    const next = current.includes(opt) ? current.filter(i => i !== opt) : [...current, opt];
                    onChange(next);
                  }}
                />
              )}
            />
            <span style={{ color: "#000" }}>{opt}</span>
          </label>
        ))}
        {profiles.includes("Other") && (
          <>
            <label className="form-title">Tell us more</label>
            <input className="input-inline input-animated" placeholder="Tell us more" style={inputStyle} {...register("profileOther")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
            {errors.profileOther && <span style={{ color: "#b00020" }}>{errors.profileOther.message as string}</span>}
          </>
        )}
        {errors.profiles && <span style={{ color: "#b00020" }}>{errors.profiles.message as string}</span>}
      </div>

      <div className="form-section" id="section-interest" style={{ display: "grid", gap: 8 }}>
        <label className="form-title">VIPs and Sponsorships!</label>
        <select className="select-inline" style={inputStyle as any} {...register("interest")} onFocus={e => { (e.currentTarget as HTMLSelectElement).style.background = '#fff8ea'; (e.currentTarget as HTMLSelectElement).style.borderColor = '#222'; }} onBlur={e => { (e.currentTarget as HTMLSelectElement).style.background = '#fff6e0'; (e.currentTarget as HTMLSelectElement).style.borderColor = '#333'; }}>
          <option value="none">None</option>
          <option value="vip">I am interested in being a VIP!</option>
          <option value="sponsor">I am interested in basic sponsorship!</option>
        </select>
        {interest === "vip" && (
          <div className="form-section" id="section-vip" style={{ display: "grid", gap: 8 }}>
            <p style={{ color: "#000", fontWeight: 700 }}>
              All inclusive stay 10/31-11/3 (can be extended)<br/>
              Hotel Celestine <a href="https://www.celestinehotels.jp/tokyo-shiba" target="_blank" rel="noopener noreferrer">https://www.celestinehotels.jp/tokyo-shiba</a><br/>
              All team dinners/travel covered<br/>
              Flight not covered but larger packages include a 1k flight credit (15k+)
            </p>
            <label className="form-title">Quantity of VIP tickets I want</label>
            <input className="input-inline input-animated" type="number" min={1} max={10} style={inputStyle} {...register("vipQty", { valueAsNumber: true })} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
            {errors.vipQty && <span style={{ color: "#b00020" }}>{errors.vipQty.message as string}</span>}
            <label className="form-title">My Company</label>
            <input className="input-inline" style={inputStyle} {...register("vipCompany")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
            <label className="form-title">Food Allergies</label>
            <input className="input-inline" style={inputStyle} {...register("vipAllergies")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
            <p style={{ color: "#000" }}>Note: we will follow up with you and provide more information, and may need some passport details to ensure your booking is handled for you at the hotel correctly.</p>
          </div>
        )}
        {interest === "sponsor" && (
          <div className="form-section" id="section-sponsor" style={{ display: "grid", gap: 8 }}>
            <p style={{ color: "#000", fontWeight: 700 }}>
              Sponsors will get premium visibility at multiple venues throughout the three day event 10/31-11/2, both physically and digitally<br/>
              We will work with your company to ensure your brand shines throughout Doge Day
            </p>
            <label className="form-title">Company Name</label>
            <input className="input-inline input-animated" style={inputStyle} {...register("sBrand")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
            {errors.sBrand && <span style={{ color: "#b00020" }}>{errors.sBrand.message as string}</span>}
            <label className="form-title">Package Selection</label>
            <select className="select-inline input-animated" style={inputStyle as any} {...register("sPkg")} onFocus={e => { (e.currentTarget as HTMLSelectElement).style.background = '#fff8ea'; (e.currentTarget as HTMLSelectElement).style.borderColor = '#222'; }} onBlur={e => { (e.currentTarget as HTMLSelectElement).style.background = '#fff6e0'; (e.currentTarget as HTMLSelectElement).style.borderColor = '#333'; }}>
              {PKGS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="form-section" id="section-content" style={{ display: "grid", gap: 10 }}>
        <label className="form-title">I create content! (optional)</label>
        {CONTENT_TYPES.map(opt => (
          <label key={opt} style={{ display: "flex", gap: 8, alignItems: "baseline", maxWidth: "100%", overflowWrap: "anywhere", wordBreak: "break-word" }}>
            <Controller
              control={control}
              name="contentTypes"
              render={({ field: { value, onChange } }) => (
                <input
                  type="checkbox"
                  className="checkbox-circle"
                  checked={Array.isArray(value) ? value.includes(opt) : false}
                  onChange={() => {
                    const current = Array.isArray(value) ? value : [];
                    const next = current.includes(opt) ? current.filter(i => i !== opt) : [...current, opt];
                    onChange(next);
                  }}
                />
              )}
            />
            <span style={{ color: "#000", overflowWrap: "anywhere", wordBreak: "break-word", maxWidth: "calc(100% - 28px)" }}>{opt}</span>
          </label>
        ))}
      </div>

      <div className="form-section" id="section-referral" style={{ display: "grid", gap: 8 }}>
        <label className="form-title">I want to make a referral!</label>
        <p style={{ color: "#000" }}>Invite Two Content Creators for a Free Doge Day Badge/Sticker (IRL, snail mail)</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input className="input-inline input-animated" placeholder="Creator 1" style={inputStyle} {...register("creator1")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
          <input className="input-inline input-animated" placeholder="Creator 2" style={inputStyle} {...register("creator2")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
        </div>
        <button type="button" className="btn btn-referral btn-left" onClick={openXInvite}>Invite on X</button>
        <label className="form-title">Upload screenshot (optional)</label>
        <input className="input-inline input-animated" type="file" accept="image/png,image/jpeg,image/webp" {...register("screenshot")} />
      </div>

      <div className="form-section" id="section-discovery" style={{ display: "grid", gap: 8 }}>
        <label className="form-title">Here’s how I heard about Doge Day!</label>
        <select className="select-inline input-animated" style={inputStyle as any} {...register("heard")} onFocus={e => { (e.currentTarget as HTMLSelectElement).style.background = '#fff8ea'; (e.currentTarget as HTMLSelectElement).style.borderColor = '#222'; }} onBlur={e => { (e.currentTarget as HTMLSelectElement).style.background = '#fff6e0'; (e.currentTarget as HTMLSelectElement).style.borderColor = '#333'; }}>
          <option value="">Select…</option>
          <option value="x">X Post</option>
          <option value="friend">Friend Referral</option>
          <option value="newsletter">Web3 Newsletter</option>
          <option value="community">Community</option>
          <option value="other">Other</option>
        </select>
        {heard === "other" && (
          <>
            <label className="form-title">Tell us more!</label>
            <input className="input-inline input-animated" placeholder="Tell us more!" style={inputStyle} {...register("heardOther")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
            {errors.heardOther && <span style={{ color: "#b00020" }}>{errors.heardOther.message as string}</span>}
          </>
        )}
        {errors.heard && <span style={{ color: "#b00020" }}>{errors.heard.message as string}</span>}
      </div>

      <div className="form-section" id="section-suggestions" style={{ display: "grid", gap: 8 }}>
        <label className="form-title">Any Event Suggestions? (optional)</label>
        <textarea className="input-animated" rows={3} style={inputStyle} {...register("suggestions")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
      </div>

      <div>
        <button type="submit" className="btn btn-primary" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
      {submitted && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setSubmitted(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Thanks! We’ll be in touch.</h2>
            <p style={{ marginTop: 8 }}>Share your hype on X?</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-contrast" onClick={() => setSubmitted(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => {
                const share = `Just signed up for #DogeDay2025 hosted by @ownthedoge! Can't wait to connect with the community in person.\n\nJoin me: https://dogeday2025.ownthedoge.com`;
                const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(share)}`;
                window.open(shareUrl, "_blank", "noopener,noreferrer");
              }}>Share on X</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}



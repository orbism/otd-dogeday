"use client";

import { useMemo } from "react";
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
  const { register, handleSubmit, control, watch, formState: { errors, isValid } } = useForm<FormValues>({
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

    const share = `Just signed up for #DogeDay2025 hosted by @ownthedoge! Can't wait to connect with the community in person.\n\nJoin me: https://dogeday2025.ownthedoge.com`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(share)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const inputStyle: React.CSSProperties = {
    background: "#fff6e0",
    border: "1px solid #333",
    color: "#000",
    borderRadius: 8,
    padding: 10,
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 16, width: "100%" }}>
      <div style={{ display: "grid", gap: 8 }}>
        <label>My Name
          <input style={inputStyle} {...register("name")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
        </label>
        {errors.name && <span style={{ color: "#b00020" }}>{errors.name.message as string}</span>}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label>Connect with me here</label>
        <input placeholder="Twitter" style={inputStyle} {...register("twitter")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
        <input placeholder="Instagram" style={inputStyle} {...register("instagram")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
        <input placeholder="Discord" style={inputStyle} {...register("discord")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <label>I will be attending Doge Day as a</label>
        {PROFILE_OPTIONS.map(opt => (
          <label key={opt} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Controller
              control={control}
              name="profiles"
              render={({ field: { value, onChange } }) => (
                <input
                  type="checkbox"
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
            <input placeholder="Tell us more" style={inputStyle} {...register("profileOther")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
            {errors.profileOther && <span style={{ color: "#b00020" }}>{errors.profileOther.message as string}</span>}
          </>
        )}
        {errors.profiles && <span style={{ color: "#b00020" }}>{errors.profiles.message as string}</span>}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label>VIPs and Sponsorships!</label>
        <select style={inputStyle as any} {...register("interest")} onFocus={e => { (e.currentTarget as HTMLSelectElement).style.background = '#fff8ea'; (e.currentTarget as HTMLSelectElement).style.borderColor = '#222'; }} onBlur={e => { (e.currentTarget as HTMLSelectElement).style.background = '#fff6e0'; (e.currentTarget as HTMLSelectElement).style.borderColor = '#333'; }}>
          <option value="none">None</option>
          <option value="vip">I am interested in being a VIP!</option>
          <option value="sponsor">I am interested in basic sponsorship!</option>
        </select>
        {interest === "vip" && (
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ color: "#000" }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. What’s included placeholder.</p>
            <label>Quantity of VIP tickets I want
              <input type="number" min={1} max={10} style={inputStyle} {...register("vipQty", { valueAsNumber: true })} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
            </label>
            {errors.vipQty && <span style={{ color: "#b00020" }}>{errors.vipQty.message as string}</span>}
            <label>My Company
              <input style={inputStyle} {...register("vipCompany")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
            </label>
            <label>Food Allergies
              <input style={inputStyle} {...register("vipAllergies")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
            </label>
            <p style={{ color: "#000" }}>Note: we will follow up with you and provide more information, and may need some passport details to ensure your booking is handled for you at the hotel correctly.</p>
          </div>
        )}
        {interest === "sponsor" && (
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ color: "#000" }}>Sponsors will get prime visibility throughout the 3 day event 10/31-11/2, physically and digitally. We will work with your company to ensure your brand shines throughout Doge Day.</p>
            <label>Brand Name
              <input style={inputStyle} {...register("sBrand")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
            </label>
            {errors.sBrand && <span style={{ color: "#b00020" }}>{errors.sBrand.message as string}</span>}
            <label>Package Selection
              <select style={inputStyle as any} {...register("sPkg")} onFocus={e => { (e.currentTarget as HTMLSelectElement).style.background = '#fff8ea'; (e.currentTarget as HTMLSelectElement).style.borderColor = '#222'; }} onBlur={e => { (e.currentTarget as HTMLSelectElement).style.background = '#fff6e0'; (e.currentTarget as HTMLSelectElement).style.borderColor = '#333'; }}>
                {PKGS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </label>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <label>I create content! (optional)</label>
        {CONTENT_TYPES.map(opt => (
          <label key={opt} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Controller
              control={control}
              name="contentTypes"
              render={({ field: { value, onChange } }) => (
                <input
                  type="checkbox"
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
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label>I want to make a referral!</label>
        <p style={{ color: "#000" }}>Invite Two Content Creators for a Free Doge Day Badge/Sticker (IRL, snail mail)</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input placeholder="Creator 1" style={inputStyle} {...register("creator1")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
          <input placeholder="Creator 2" style={inputStyle} {...register("creator2")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
        </div>
        <button type="button" className="btn" onClick={openXInvite}>Invite on X</button>
        <label>Upload screenshot (optional)
          <input type="file" accept="image/png,image/jpeg,image/webp" {...register("screenshot")} />
        </label>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label>Here’s how I heard about Doge Day!</label>
        <select style={inputStyle as any} {...register("heard")} onFocus={e => { (e.currentTarget as HTMLSelectElement).style.background = '#fff8ea'; (e.currentTarget as HTMLSelectElement).style.borderColor = '#222'; }} onBlur={e => { (e.currentTarget as HTMLSelectElement).style.background = '#fff6e0'; (e.currentTarget as HTMLSelectElement).style.borderColor = '#333'; }}>
          <option value="">Select…</option>
          <option value="x">X Post</option>
          <option value="friend">Friend Referral</option>
          <option value="newsletter">Web3 Newsletter</option>
          <option value="community">Community</option>
          <option value="other">Other</option>
        </select>
        {heard === "other" && (
          <>
            <input placeholder="Tell us more!" style={inputStyle} {...register("heardOther")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
            {errors.heardOther && <span style={{ color: "#b00020" }}>{errors.heardOther.message as string}</span>}
          </>
        )}
        {errors.heard && <span style={{ color: "#b00020" }}>{errors.heard.message as string}</span>}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label>Any Event Suggestions? (optional)
          <textarea rows={3} style={inputStyle} {...register("suggestions")} onFocus={e => { e.currentTarget.style.background = '#fff8ea'; e.currentTarget.style.borderColor = '#222'; }} onBlur={e => { e.currentTarget.style.background = '#fff6e0'; e.currentTarget.style.borderColor = '#333'; }} />
        </label>
      </div>

      <div>
        <button type="submit" className="btn btn-primary" disabled={!isValid}>Submit</button>
      </div>
    </form>
  );
}



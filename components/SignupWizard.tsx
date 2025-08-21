"use client";

import { useMemo, useState } from "react";

type WizardMode = "attendee" | "vip" | "sponsor";

interface SignupWizardProps {
	mode: WizardMode;
	onClose?: () => void;
}

const PROFILE_OPTIONS = [
	"Dog Owner/Pet Lover",
	"Web3 Project Builder/Investor",
	"Local Attendee",
	"Media Person/Journalist",
	"Content Creator",
	"Other",
];

const CONTENT_TYPES = [
	"Streaming (Twitch/YouTube Live)",
	"Photography/Videography",
	"Memes/Graphic Design",
	"Writing/Blogging",
	"Podcasting",
	"None, but I'm here to vibe Doge day",
];

const SPONSOR_PACKAGES = [
	{ value: "bronze", label: "Bronze - 1k - Discounted VIP ticket" },
	{ value: "silver", label: "Silver - 5k - Discounted VIP ticket" },
	{ value: "platinum", label: "Platinum - 7.5k - 1 VIP tickets included" },
	{ value: "gold", label: "Gold - 15k - 2 VIP tickets included" },
	{ value: "moon", label: "Moon - 25k - 3 VIP tickets included, Premium Press Package" },
];

export default function SignupWizard({ mode, onClose }: SignupWizardProps) {
	const [currentMode, setCurrentMode] = useState<WizardMode>(mode);
	const [step, setStep] = useState<number>(0);

	// Attendee state
	const [attendee, setAttendee] = useState({
		name: "",
		social: "",
		profiles: [] as string[],
		otherProfile: "",
		contentTypes: [] as string[],
		invite1: "",
		invite2: "",
		screenshot: null as File | null,
		heard: "",
		suggestions: "",
	});

	// VIP state
	const [vip, setVip] = useState({
		quantity: 1,
		name: "",
		company: "",
		foodAllergies: "",
		passport: {
			fullName: "",
			number: "",
			country: "",
			expiration: "",
			dob: "",
			notes: "",
		},
	});

	// Sponsor state
	const [sponsor, setSponsor] = useState({
		brand: "",
		pkg: "bronze",
		contactName: "",
		email: "",
		phone: "",
		notes: "",
	});

	const isLastStep = useMemo(() => {
		const total = currentMode === "attendee" ? 7 : currentMode === "vip" ? 5 : 5;
		return step >= total - 1;
	}, [currentMode, step]);

	const canNext = useMemo(() => {
		if (currentMode === "attendee") {
			if (step === 0) return attendee.name.trim().length >= 2 && attendee.social.trim().length >= 2;
			if (step === 1) return attendee.profiles.length > 0 && (!attendee.profiles.includes("Other") || attendee.otherProfile.trim().length > 0);
			if (step === 2) return true; // optional
			if (step === 3) return attendee.invite1.trim().length > 0 && attendee.invite2.trim().length > 0; // screenshot optional
			if (step === 4) return attendee.heard.trim().length > 0;
			if (step === 5) return true; // suggestions optional
			return true;
		}
		if (currentMode === "vip") {
			if (step === 0) return true;
			if (step === 1) return vip.quantity >= 1 && vip.quantity <= 10;
			if (step === 2) return vip.name.trim().length >= 2;
			if (step === 3) return !!(vip.passport.fullName && vip.passport.number && vip.passport.country && vip.passport.expiration && vip.passport.dob);
			return true;
		}
		if (currentMode === "sponsor") {
			if (step === 0) return sponsor.brand.trim().length >= 2;
			if (step === 1) return !!sponsor.pkg;
			if (step === 2) return sponsor.contactName.trim().length >= 2 && /.+@.+\..+/.test(sponsor.email);
			return true;
		}
		return false;
	}, [attendee, vip, sponsor, currentMode, step]);

	function Header() {
		return (
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<h2 style={{ margin: 0 }}>Signup</h2>
				<div style={{ display: "flex", gap: 8 }}>
					<button className="btn" onClick={() => { setCurrentMode("attendee"); setStep(0); }}>Attendee</button>
					<button className="btn" onClick={() => { setCurrentMode("vip"); setStep(0); }}>VIP</button>
					<button className="btn" onClick={() => { setCurrentMode("sponsor"); setStep(0); }}>Sponsor</button>
					{onClose && (<button className="btn" onClick={onClose}>Close</button>)}
				</div>
			</div>
		);
	}

	function AttendeeSteps() {
		switch (step) {
			case 0:
				return (
					<div style={{ display: "grid", gap: 12 }}>
						<label>Name<input value={attendee.name} onChange={e => setAttendee({ ...attendee, name: e.target.value })} /></label>
						<label>Social handle(s) @<input value={attendee.social} onChange={e => setAttendee({ ...attendee, social: e.target.value })} placeholder="@username or links"/></label>
					</div>
				);
			case 1:
				return (
					<div style={{ display: "grid", gap: 10 }}>
						<p>Your Doge Day Profile</p>
						{PROFILE_OPTIONS.map(opt => (
							<label key={opt} style={{ display: "flex", gap: 8 }}>
								<input type="checkbox" checked={attendee.profiles.includes(opt)} onChange={() => {
									const selected = attendee.profiles.includes(opt)
										? attendee.profiles.filter(p => p !== opt)
										: [...attendee.profiles, opt];
									setAttendee({ ...attendee, profiles: selected });
								}} />
								<span>{opt}</span>
							</label>
						))}
						{attendee.profiles.includes("Other") && (
							<input placeholder="Other (please specify)" value={attendee.otherProfile} onChange={e => setAttendee({ ...attendee, otherProfile: e.target.value })} />
						)}
					</div>
				);
			case 2:
				return (
					<div style={{ display: "grid", gap: 10 }}>
						<p>What Type of Content Do You Create? (optional)</p>
						{CONTENT_TYPES.map(opt => (
							<label key={opt} style={{ display: "flex", gap: 8 }}>
								<input type="checkbox" checked={attendee.contentTypes.includes(opt)} onChange={() => {
									const selected = attendee.contentTypes.includes(opt)
										? attendee.contentTypes.filter(p => p !== opt)
										: [...attendee.contentTypes, opt];
									setAttendee({ ...attendee, contentTypes: selected });
								}} />
								<span>{opt}</span>
							</label>
						))}
					</div>
				);
			case 3:
				return (
					<div style={{ display: "grid", gap: 10 }}>
						<p>Invite Two Content Creators</p>
						<input placeholder="Invite #1 (X handle or email)" value={attendee.invite1} onChange={e => setAttendee({ ...attendee, invite1: e.target.value })} />
						<input placeholder="Invite #2 (X handle or email)" value={attendee.invite2} onChange={e => setAttendee({ ...attendee, invite2: e.target.value })} />
						<label>Upload screenshot (optional)
							<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setAttendee({ ...attendee, screenshot: e.target.files?.[0] ?? null })} />
						</label>
					</div>
				);
			case 4:
				return (
					<label>How did you hear about Doge Day?
						<select value={attendee.heard} onChange={e => setAttendee({ ...attendee, heard: e.target.value })}>
							<option value="">Select…</option>
							<option value="x">X Post</option>
							<option value="friend">Friend Referral</option>
							<option value="newsletter">Web3 Newsletter</option>
							<option value="community">Community</option>
							<option value="other">Other</option>
						</select>
					</label>
				);
			case 5:
				return (
					<label>Any event suggestions? (optional)
						<textarea rows={4} value={attendee.suggestions} onChange={e => setAttendee({ ...attendee, suggestions: e.target.value })} />
					</label>
				);
			case 6:
				return (
					<div>
						<p>Review your info and submit. You can share a tweet on the next screen.</p>
					</div>
				);
			default:
				return null;
		}
	}

	function VipSteps() {
		switch (step) {
			case 0:
				return <p>What's included: Premium access, hospitality, curated experiences.</p>;
			case 1:
				return (
					<label>Quantity<input type="number" min={1} max={10} value={vip.quantity} onChange={e => setVip({ ...vip, quantity: Number(e.target.value) })} /></label>
				);
			case 2:
				return (
					<div style={{ display: "grid", gap: 10 }}>
						<label>Name<input value={vip.name} onChange={e => setVip({ ...vip, name: e.target.value })} /></label>
						<label>Company<input value={vip.company} onChange={e => setVip({ ...vip, company: e.target.value })} /></label>
						<label>Food Allergies<input value={vip.foodAllergies} onChange={e => setVip({ ...vip, foodAllergies: e.target.value })} /></label>
					</div>
				);
			case 3:
				return (
					<div style={{ display: "grid", gap: 10 }}>
						<label>Passport Full Name<input value={vip.passport.fullName} onChange={e => setVip({ ...vip, passport: { ...vip.passport, fullName: e.target.value } })} /></label>
						<label>Passport Number<input value={vip.passport.number} onChange={e => setVip({ ...vip, passport: { ...vip.passport, number: e.target.value } })} /></label>
						<label>Country<input value={vip.passport.country} onChange={e => setVip({ ...vip, passport: { ...vip.passport, country: e.target.value } })} /></label>
						<label>Expiration<input type="date" value={vip.passport.expiration} onChange={e => setVip({ ...vip, passport: { ...vip.passport, expiration: e.target.value } })} /></label>
						<label>Date of Birth<input type="date" value={vip.passport.dob} onChange={e => setVip({ ...vip, passport: { ...vip.passport, dob: e.target.value } })} /></label>
						<label>Notes<input value={vip.passport.notes} onChange={e => setVip({ ...vip, passport: { ...vip.passport, notes: e.target.value } })} /></label>
					</div>
				);
			case 4:
				return <p>Review and submit your VIP request.</p>;
			default:
				return null;
		}
	}

	function SponsorSteps() {
		switch (step) {
			case 0:
				return <label>Brand Name<input value={sponsor.brand} onChange={e => setSponsor({ ...sponsor, brand: e.target.value })} /></label>;
			case 1:
				return (
					<label>Package<select value={sponsor.pkg} onChange={e => setSponsor({ ...sponsor, pkg: e.target.value })}>{SPONSOR_PACKAGES.map(p => (<option key={p.value} value={p.value}>{p.label}</option>))}</select></label>
				);
			case 2:
				return (
					<div style={{ display: "grid", gap: 10 }}>
						<label>Contact Name<input value={sponsor.contactName} onChange={e => setSponsor({ ...sponsor, contactName: e.target.value })} /></label>
						<label>Email<input value={sponsor.email} onChange={e => setSponsor({ ...sponsor, email: e.target.value })} /></label>
						<label>Phone (optional)<input value={sponsor.phone} onChange={e => setSponsor({ ...sponsor, phone: e.target.value })} /></label>
					</div>
				);
			case 3:
				return <label>Notes<textarea rows={4} value={sponsor.notes} onChange={e => setSponsor({ ...sponsor, notes: e.target.value })} /></label>;
			case 4:
				return <p>Review and submit your Sponsor interest.</p>;
			default:
				return null;
		}
	}

	async function submit() {
		if (currentMode === "attendee") {
			const fd = new FormData();
			fd.append("formType", "attendee");
			fd.append("name", attendee.name);
			fd.append("social", attendee.social);
			attendee.profiles.forEach((p, i) => fd.append(`profiles[${i}]`, p));
			if (attendee.otherProfile) fd.append("otherProfile", attendee.otherProfile);
			attendee.contentTypes.forEach((c, i) => fd.append(`contentTypes[${i}]`, c));
			fd.append("invite1", attendee.invite1);
			fd.append("invite2", attendee.invite2);
			if (attendee.screenshot) fd.append("screenshot", attendee.screenshot);
			fd.append("heard", attendee.heard);
			fd.append("suggestions", attendee.suggestions);
			await fetch("/api/signup", { method: "POST", body: fd });
		}
		if (currentMode === "vip") {
			await fetch("/api/signup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ formType: "vip", ...vip }) });
		}
		if (currentMode === "sponsor") {
			await fetch("/api/signup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ formType: "sponsor", brand: sponsor.brand, package: sponsor.pkg, contactName: sponsor.contactName, email: sponsor.email, phone: sponsor.phone, notes: sponsor.notes }) });
		}
		alert("Thanks! Submission received.");
	}

	return (
		<div className="container-chrome" style={{ maxWidth: 780, width: "min(92vw, 780px)", padding: 20 }}>
			<Header />
			<p style={{ opacity: 0.85, marginTop: 8 }}>Mode: {currentMode.toUpperCase()}</p>
			<div style={{ marginTop: 16 }}>
				{currentMode === "attendee" && <AttendeeSteps />}
				{currentMode === "vip" && <VipSteps />}
				{currentMode === "sponsor" && <SponsorSteps />}
				<div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "space-between" }}>
					<button className="btn" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Back</button>
					<div style={{ display: "flex", gap: 8 }}>
						{!isLastStep && (<button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext}>Next</button>)}
						{isLastStep && (<button className="btn btn-primary" onClick={submit} disabled={!canNext}>Submit</button>)}
					</div>
				</div>
				{currentMode === "attendee" && isLastStep && (
					<div style={{ marginTop: 12 }}>
						<a className="btn" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Just signed up for #DogeDay2025! Can't wait to vibe with fellow Doge fans. Join me:")}`} target="_blank" rel="noopener noreferrer">Share on X</a>
					</div>
				)}
			</div>
		</div>
	);
}



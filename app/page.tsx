"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { site } from "../content/site";
import styles from "./page.module.css";
import type { CSSProperties } from "react";
import MediaCarousel from "../components/MediaCarousel";
import Signups from "../components/Signups";
import { mediaItems } from "../content/media";

export default function Home() {
	const [snap, setSnap] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(true);
	const snapLockRef = useRef(false);
	const [wizardMode, setWizardMode] = useState<"attendee"|"vip"|"sponsor"|null>(null);

	useEffect(() => {
		// hydrate from localStorage
		const s = localStorage.getItem("dd-snap");
		if (s) setSnap(s === "on");
		// hide loader quickly after mount
		const to = setTimeout(() => setLoading(false), 300);
		return () => clearTimeout(to);
	}, []);

	useEffect(() => {
		document.documentElement.setAttribute("data-snap", snap ? "on" : "off");
		localStorage.setItem("dd-snap", snap ? "on" : "off");
	}, [snap]);

	// Quick-snap wheel handler to initiate snapping faster
	useEffect(() => {
		if (!snap) return;
		const onWheel = (e: WheelEvent) => {
			if (snapLockRef.current) return;
			const sections = Array.from(document.querySelectorAll<HTMLElement>(".section"));
			if (sections.length === 0) return;
			const currentIdx = sections.findIndex(sec => {
				const rect = sec.getBoundingClientRect();
				return rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5;
			});
			let targetIdx = currentIdx;
			if (e.deltaY > 0) {
				targetIdx = Math.min(sections.length - 1, (currentIdx === -1 ? 0 : currentIdx + 1));
			} else if (e.deltaY < 0) {
				targetIdx = Math.max(0, (currentIdx === -1 ? 0 : currentIdx - 1));
			}
			if (targetIdx !== currentIdx && targetIdx >= 0) {
				snapLockRef.current = true;
				sections[targetIdx].scrollIntoView({ behavior: "smooth", block: "start" });
				setTimeout(() => { snapLockRef.current = false; }, 200);
			}
		};
		window.addEventListener("wheel", onWheel, { passive: true });
		return () => window.removeEventListener("wheel", onWheel);
	}, [snap]);

	const headerStyle: CSSProperties = { ["--header-height" as unknown as string]: "56px" } as CSSProperties;

	return (
		<div className={styles.page}>
			{loading && (
				<div className="loader-overlay">
					<div className="spinner" />
				</div>
			)}
			<header className="site-header" style={headerStyle}>
				<div className="header-inner">
					<div className="brand">
						<a 
							href="#" 
							onClick={(e) => {
								e.preventDefault();
								window.scrollTo({ top: 0, behavior: 'smooth' });
							}}
							style={{ display: 'block' }}
						>
							<img 
								src="/branding/logo.png" 
								alt="Doge Day 2025 Logo" 
								style={{ 
									minHeight: "90px", 
									maxHeight: "120px", 
									objectFit: "contain",
									width: 'auto'
								}} 
							/>
						</a>
					</div>
					<nav className="links">
						<Link href={site.links.home}>Home</Link>
						<Link href={site.links.details}>Details</Link>
						<Link href={site.links.signup}>Sign Up</Link>
						<Link href={site.links.footer}>Footer</Link>
					</nav>
					<div className="actions">
						<button onClick={() => setSnap((v) => !v)}>Snap: {snap ? "on" : "off"}</button>
					</div>
				</div>
			</header>

			<main className={`site-main ${styles.main}`}>
				<section id="splash" className="section splash-section" aria-label="Splash" data-section="splash">
					<div className="splash-hero" />
					<img 
						src="/branding/heart.png" 
						alt="Doge Day Heart" 
						className="splash-hero-heart"
					/>
					<button 
						className="splash-cta" 
						style={{
							position: "absolute",
							left: "50%",
							bottom: "5%",
							transform: "translateX(-50%)",
							backgroundColor: "rgba(0,0,0,0.4)",
							backdropFilter: "blur(10px)",
							border: "1px solid rgba(255,255,255,0.3)",
							color: "beige",
							fontSize: "1.2rem",
							padding: "12px 24px",
							borderRadius: "8px",
							animation: "pulse 2s infinite",
							zIndex: 10
						}}
					>
						Learn More Now!
					</button>
				</section>

				<section id="details" className="section" aria-label="Details" data-section="details">
					<div className="container-chrome" style={{ padding: 24, width: "min(1100px, 92vw)" }}>
						<h2>Event Details</h2>
						<div className="details-grid" style={{ marginTop: 12 }}>
							<div>
								<MediaCarousel items={mediaItems} />
							</div>
							<div>
								<ul style={{ lineHeight: 1.8 }}>
									<li>Date: {site.date}</li>
									<li>Location: {site.location}</li>
								</ul>
								<p style={{ marginTop: 12 }}>
									Dogeday 2025 brings the community together in Chiba for a day of fun,
									collaboration, and celebration. Expect meetups, showcases, and plenty of
									much‑wow energy.
								</p>
								<div style={{ 
									display: 'flex', 
									justifyContent: 'space-between', 
									marginTop: 24, 
									gap: '16px' 
								}}>
									<img 
										src="/branding/guestpass_btn.png" 
										alt="Guest Pass" 
										style={{ 
											maxWidth: '30%', 
											cursor: 'pointer',
											transition: 'transform 0.2s'
										}} 
										onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
										onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
										onClick={(e) => { e.preventDefault(); document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
									/>
									<img 
										src="/branding/sponsor_btn.png" 
										alt="Sponsor" 
										style={{ 
											maxWidth: '30%', 
											cursor: 'pointer',
											transition: 'transform 0.2s'
										}} 
										onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
										onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
										onClick={(e) => { e.preventDefault(); document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
									/>
									<img 
										src="/branding/vip_btn.png" 
										alt="VIP" 
										style={{ 
											maxWidth: '30%', 
											cursor: 'pointer',
											transition: 'transform 0.2s'
										}} 
										onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
										onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
										onClick={(e) => { e.preventDefault(); document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
									/>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section id="signup" className="section" aria-label="Sign Up" data-section="signup">
					<div className="container-chrome" style={{ 
						padding: 24, 
						maxWidth: 700,
						display: 'flex',
						flexDirection: 'column',
						gap: '16px'
					}}>
						<h2>Join Doge Day 2025</h2>
						<p style={{ 
							marginTop: 8, 
							lineHeight: 1.6,
							opacity: 0.9 
						}}>
							Be part of the most exciting Doge community event of the year. 
							Sign up to receive exclusive updates and secure your spot at Doge Day 2025 in Chiba.
						</p>
						<Signups />
					</div>
				</section>

				<section id="footer" className="section" aria-label="Footer" data-section="footer">
					<footer className="container-chrome" style={{ padding: 24, width: "min(1100px, 92vw)" }}>
						<h2>Learn More</h2>
						<div className="cta-row" style={{ marginTop: 16 }}>
							<a className="cta" href={site.social.website} target="_blank">Own The Doge website</a>
							<a className="cta" href={site.social.twitter} target="_blank">Follow us on X</a>
							<a className="cta" href="https://t.me/" target="_blank">Join us on Telegram</a>
							<a className="cta" href={site.social.discord} target="_blank">Join us on Discord</a>
						</div>
					</footer>
				</section>
			</main>
		</div>
	);
}

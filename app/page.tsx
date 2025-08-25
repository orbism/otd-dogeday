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
	const [loading, setLoading] = useState<boolean>(true);
	const snapLockRef = useRef(false);
	const [wizardMode, setWizardMode] = useState<"attendee"|"vip"|"sponsor"|null>(null);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

	useEffect(() => {
		// hide loader quickly after mount
		const to = setTimeout(() => setLoading(false), 300);
		return () => clearTimeout(to);
	}, []);

    // Lock body scroll when mobile menu is open & close on ESC
    useEffect(() => {
        if (menuOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
            window.addEventListener('keydown', onKey);
            return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
        }
    }, [menuOpen]);

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
						<button
							className="btn hamburger"
							aria-label={menuOpen ? "Close menu" : "Open menu"}
							aria-expanded={menuOpen}
							aria-controls="mobile-nav"
							onClick={() => setMenuOpen(v => !v)}
						>
							{menuOpen ? '×' : '☰'}
						</button>
					</div>
				</div>
			</header>

            {menuOpen && (
                <div id="mobile-nav" className="mobile-nav-overlay" role="dialog" aria-modal="true" onClick={() => setMenuOpen(false)}>
                    <div className="mobile-nav-inner" onClick={(e) => e.stopPropagation()}>
                        <nav className="mobile-nav-links" onClick={() => setMenuOpen(false)}>
                            <a href={site.links.home}>Home</a>
                            <a href={site.links.details}>Details</a>
                            <a href={site.links.signup}>Sign Up</a>
                            <a href={site.links.footer}>Footer</a>
                        </nav>
                    </div>
                </div>
            )}

			<main className={`site-main ${styles.main}`}>
				<section id="splash" className="section splash-section" aria-label="Splash" data-section="splash">
					<div className="splash-hero" />
					{/* Mobile/iPad mini portrait CTA stack */}
					<div className="hero-cta-stack" aria-hidden="true">
						<img 
							src="/branding/guestpass_btn.png"
							alt="Guest Pass"
							onClick={(e) => { e.preventDefault(); document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
							style={{ cursor: 'pointer', width: '100%', height: 'auto' }}
						/>
						<img 
							src="/branding/sponsor_btn.png"
							alt="Sponsor"
							onClick={(e) => { e.preventDefault(); document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
							style={{ cursor: 'pointer', width: '100%', height: 'auto' }}
						/>
						<img 
							src="/branding/vip_btn.png"
							alt="VIP"
							onClick={(e) => { e.preventDefault(); document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
							style={{ cursor: 'pointer', width: '100%', height: 'auto' }}
						/>
					</div>
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
						L F G
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
						maxWidth: 820,
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						gap: '16px',
						overflowX: 'hidden'
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

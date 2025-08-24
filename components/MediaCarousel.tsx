"use client";

import { useState, useRef, useEffect } from "react";
import type { MediaItem } from "../content/media";

export default function MediaCarousel({ items }: { items: MediaItem[] }) {
	const [activeIndex, setActiveIndex] = useState(0);
	const trackRef = useRef<HTMLDivElement>(null);

	const navigateCarousel = (direction: 'next' | 'prev') => {
		setActiveIndex((prev) => {
			if (direction === 'next') {
				return (prev + 1) % items.length;
			} else {
				return (prev - 1 + items.length) % items.length;
			}
		});
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		switch (e.key) {
			case "ArrowRight":
				navigateCarousel('next');
				break;
			case "ArrowLeft":
				navigateCarousel('prev');
				break;
		}
	};

	const handleTouchStart = (e: React.TouchEvent) => {
		const startX = e.touches[0].clientX;
		
		const handleTouchEnd = (endEvent: React.TouchEvent) => {
			const endX = endEvent.changedTouches[0].clientX;
			const diff = startX - endX;
			
			if (diff > 50) {
				navigateCarousel('next');
			} else if (diff < -50) {
				navigateCarousel('prev');
			}
		};

		e.currentTarget.addEventListener('touchend', handleTouchEnd as unknown as EventListener);
	};

	useEffect(() => {
		if (!trackRef.current) return;
		const slides = trackRef.current.children;
		const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
		Array.from(slides).forEach((slide, index) => {
			const el = slide as HTMLElement;
			el.style.display = 'none';
			if (index === activeIndex) {
				el.style.display = 'flex';
				el.style.transform = 'scale(1) translateX(0)';
				el.style.opacity = '1';
				el.style.zIndex = '10';
			} else if (!isMobile) {
				// show neighbors only on non-mobile
				if (index === (activeIndex - 1 + items.length) % items.length) {
					el.style.display = 'flex';
					el.style.transform = 'scale(0.8) translateX(-50%)';
					el.style.opacity = '0.3';
					el.style.zIndex = '5';
				}
				if (index === (activeIndex + 1) % items.length) {
					el.style.display = 'flex';
					el.style.transform = 'scale(0.8) translateX(50%)';
					el.style.opacity = '0.3';
					el.style.zIndex = '5';
				}
			}
		});
	}, [activeIndex, items.length]);

	return (
		<div 
			className="media-carousel" 
			onKeyDown={handleKeyDown}
			tabIndex={0}
			role="region"
			aria-roledescription="carousel"
			aria-label="Event Media Gallery"
			style={{ position: 'relative', width: '100%', height: '400px', marginBottom: '3em'}}
		>
			<button 
				onClick={() => navigateCarousel('prev')}
				style={{
					position: 'absolute',
					left: '10px',
					top: '50%',
					transform: 'translateY(-50%)',
					zIndex: 20,
					background: 'rgba(0,0,0,0.5)',
					color: 'white',
					border: 'none',
					borderRadius: '50%',
					width: '40px',
					height: '40px',
					cursor: 'pointer'
				}}
				aria-label="Previous image"
			>
				{'<'}
			</button>

			<button 
				onClick={() => navigateCarousel('next')}
				style={{
					position: 'absolute',
					right: '10px',
					top: '50%',
					transform: 'translateY(-50%)',
					zIndex: 20,
					background: 'rgba(0,0,0,0.5)',
					color: 'white',
					border: 'none',
					borderRadius: '50%',
					width: '40px',
					height: '40px',
					cursor: 'pointer'
				}}
				aria-label="Next image"
			>
				{'>'}
			</button>

			<div 
				ref={trackRef} 
				className="carousel-track"
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					position: 'relative',
					width: '100%',
					height: '100%',
					overflow: 'hidden'
				}}
			>
				{items.map((item, index) => (
					<div 
						key={item.src}
						className="carousel-slide"
						style={{
							position: 'absolute',
							width: '80%',
							height: '100%',
							transition: 'all 0.3s ease-in-out',
							display: 'none',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center'
						}}
						aria-roledescription="slide"
						aria-label={`Slide ${index + 1} of ${items.length}`}
					>
						<div style={{ 
							width: '100%', 
							display: 'flex', 
							flexDirection: 'column', 
							alignItems: 'center',
							justifyContent: 'center',
							flex: 1,
							height: '90%'
						}}>
							<img 
								src={item.src} 
								alt={item.caption}
								style={{
									maxWidth: '100%',
									maxHeight: '100%',
									objectFit: 'contain',
									border: '2px solid var(--brand-border)',
									borderRadius: '5px'
								}}
							/>
						</div>
						{index === activeIndex && (
							<p 
								style={{
									marginTop: '10px',
									textAlign: 'center',
									opacity: 0.8,
									width: '100%',
									padding: '10px 0'
								}}
							>
								{item.caption}
							</p>
						)}
					</div>
				))}
			</div>
			<div 
				className="carousel-controls"
				style={{
					display: 'flex',
					justifyContent: 'center',
					marginTop: '20px'
				}}
			>
				{items.map((_, index) => (
					<button
						key={index}
						onClick={() => setActiveIndex(index)}
						style={{
							width: '10px',
							height: '10px',
							borderRadius: '50%',
							background: index === activeIndex ? 'var(--brand-accent)' : 'gray',
							margin: '0 5px',
							border: 'none',
							cursor: 'pointer'
						}}
						aria-label={`Go to slide ${index + 1}`}
					/>
				))}
			</div>
		</div>
	);
} 
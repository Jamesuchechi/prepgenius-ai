import React from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { Button } from '@/components/ui/Button'

const plans = [
	{
		id: 'basic',
		name: 'Free',
		price: '₦0',
		period: '',
		features: [
			'10 questions per day',
			'Basic performance tracking',
			'Community support'
		],
		featured: false
	},
	{
		id: 'pro',
		name: 'Monthly',
		price: '₦2,500',
		period: '/mo',
		features: [
			'Unlimited questions',
			'AI Tutor & Mock Exams',
			'Detailed analytics',
			'Priority support'
		],
		featured: false
	},
	{
		id: 'annual',
		name: 'Annual',
		price: '₦20,000',
		period: '/yr',
		features: [
			'Everything in Monthly',
			'Offline Mode',
			'Premium Content',
			'Save 33% vs Monthly'
		],
		featured: true
	}
]

export default function PricingSection() {
	return (
		<section id="pricing" className="py-[100px] px-8 bg-white fade-in-section">
			<SectionHeader
				badge="💰 Pricing"
				title="Affordable Plans for Every Student"
				description="Choose the plan that fits your needs and budget. Cancel anytime."
			/>

			<div className="max-w-[1200px] mx-auto grid md:grid-cols-3 gap-8">
				{plans.map((plan) => (
					<div
						key={plan.id}
						className={`bg-white border-2 rounded-2xl p-8 transition-all duration-400 relative ${plan.featured ? 'border-[var(--orange)] shadow-[0_28px_80px_rgba(255,107,53,0.16)] scale-[1.03]' : 'border-[#E0E0E0] hover:translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]'}`}
					>
						{plan.featured && (
							<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-br from-[var(--orange)] to-[var(--orange-light)] text-white px-4 py-1 rounded-full text-sm font-bold">
								MOST POPULAR
							</div>
						)}

						<div className="pricing-header mb-4">
							<h3 className="font-display text-2xl font-bold text-[var(--black)] mb-1">{plan.name}</h3>
							<p className="text-[var(--gray-dark)]">{plan.id === 'basic' ? 'Great for getting started' : plan.id === 'pro' ? 'Best for dedicated learners' : 'For schools & institutions'}</p>
						</div>

						<div className="price mb-6">
							<span className="price-amount font-display text-[3rem] font-extrabold text-[var(--black)]">{plan.price}</span>
						</div>

						<ul className="features-list mb-6">
							{plan.features.map((f, idx) => (
								<li key={idx} className="flex items-center gap-3 py-3 border-b last:border-b-0">
									<div className="w-7 h-7 bg-[rgba(255,107,53,0.1)] rounded-full flex items-center justify-center text-[var(--orange)]">✓</div>
									<span className="text-[var(--black)]">{f}</span>
								</li>
							))}
						</ul>

						<div>
							{plan.featured ? (
								<Button variant="primary" href="/signup" className="w-full py-3 text-lg">Get Annual</Button>
							) : plan.id === 'basic' ? (
								<Button variant="secondary" href="/signup" className="w-full py-3 text-lg">Start Free</Button>
							) : (
								<Button variant="secondary" href="/signup" className="w-full py-3 text-lg">Get Monthly</Button>
							)}
						</div>
					</div>
				))}
			</div>
		</section>
	)
}


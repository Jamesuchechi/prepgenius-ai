import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'

export default function TermsPage() {
    return (
        <StaticPageLayout
            title="Terms of Service"
            subtitle="The rules and guidelines for using PrepGenius AI."
        >
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p>
                    By accessing or using PrepGenius AI, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">2. Use of License</h2>
                <p>
                    We grant you a personal, non-exclusive, non-transferable license to use our platform for your personal, non-commercial educational purposes.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">3. User Conduct</h2>
                <p>
                    You agree not to use the platform for any unlawful purpose or in any way that could damage, disable, or impair the service.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">4. Subscriptions and Payments</h2>
                <p>
                    Portions of the service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">5. Disclaimer</h2>
                <p>
                    Our study tools are provided "as is". While we strive for accuracy, we do not warrant that the materials on our platform are accurate, complete, or current.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
                <p>
                    In no event shall PrepGenius AI be liable for any damages arising out of the use or inability to use the materials on our platform.
                </p>
            </section>
        </StaticPageLayout>
    )
}

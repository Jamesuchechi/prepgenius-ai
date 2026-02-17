import React from 'react'
import StaticPageLayout from '@/components/layout/StaticPageLayout'

export default function PrivacyPage() {
    return (
        <StaticPageLayout
            title="Privacy Policy"
            subtitle="Your privacy is important to us. Here's how we protect your data."
        >
            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                <p>
                    At PrepGenius AI, we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
                <p>
                    We collect information that you provide directly to us, such as when you create an account, subscribe to a plan, or contact support. This may include:
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Name and email address</li>
                    <li>Educational background and interests</li>
                    <li>Payment information (processed securely by our payment partners)</li>
                    <li>Usage data and performance analytics</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
                <p>
                    We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Provide and improve our AI-powered study tools</li>
                    <li>Personalize your learning experience</li>
                    <li>Process transactions and send related information</li>
                    <li>Communicate with you about updates and features</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Data Security</h2>
                <p>
                    We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, or disclosure.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at privacy@prepgenius.ai.
                </p>
            </section>
        </StaticPageLayout>
    )
}

import React from 'react'
import Link from 'next/link'

const footerLinks = {
    product: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Mock Exams', href: '/exams' },
        { name: 'AI Tutor', href: '/tutor' }
    ],
    resources: [
        { name: 'Blog', href: '/blog' },
        { name: 'Study Guides', href: '/guides' },
        { name: 'Help Center', href: '/help' },
        { name: 'API Docs', href: '/docs' }
    ],
    company: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact', href: '/contact' },
        { name: 'Privacy', href: '/privacy' }
    ]
}

const socialLinks = [
    { icon: '📘', href: '#', label: 'Facebook' },
    { icon: '🐦', href: '#', label: 'Twitter' },
    { icon: '📷', href: '#', label: 'Instagram' },
    { icon: '💼', href: '#', label: 'LinkedIn' }
]

export default function Footer() {
    return (
        <footer className="bg-card text-foreground py-[60px] px-8 border-t border-border">
            <div className="max-w-[1400px] mx-auto">
                {/* Main Footer Content */}
                <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1">
                    {/* Brand Section */}
                    <div>
                        <h3 className="font-display text-3xl font-extrabold mb-4 text-[var(--orange)]">
                            PrepGenius AI
                        </h3>
                        <p className="text-muted-foreground leading-[1.7] mb-6">
                            Empowering Nigerian students to achieve their academic dreams through intelligent, personalized learning.
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-foreground no-underline transition-all duration-300 hover:bg-primary hover:text-white hover:-translate-y-1"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-bold mb-6 text-foreground">Product</h4>
                        <ul className="list-none">
                            {footerLinks.product.map((link, index) => (
                                <li key={index} className="mb-3">
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground no-underline transition-colors duration-300 hover:text-primary"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="font-bold mb-6 text-foreground">Resources</h4>
                        <ul className="list-none">
                            {footerLinks.resources.map((link, index) => (
                                <li key={index} className="mb-3">
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground no-underline transition-colors duration-300 hover:text-primary"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-bold mb-6 text-foreground">Company</h4>
                        <ul className="list-none">
                            {footerLinks.company.map((link, index) => (
                                <li key={index} className="mb-3">
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground no-underline transition-colors duration-300 hover:text-primary"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="text-center pt-8 border-t border-border text-muted-foreground">
                    <p>&copy; 2026 PrepGenius AI. Built with ❤️ for Nigerian Students. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

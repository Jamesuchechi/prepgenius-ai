'use client'

import React, { useEffect, useRef } from 'react'
import { useGoogleLogin } from '@/hooks/useGoogleLogin'

declare global {
    interface Window {
        google: any
    }
}

export default function GoogleLoginButton() {
    const divRef = useRef<HTMLDivElement>(null)
    const { handleGoogleLogin } = useGoogleLogin()

    useEffect(() => {
        if (typeof window === 'undefined' || !window.google || !divRef.current) {
            return
        }

        try {
            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                callback: (response: any) => {
                    handleGoogleLogin(response.credential)
                }
            })

            window.google.accounts.id.renderButton(divRef.current, {
                theme: 'outline',
                size: 'large',
                width: '100%',
                text: 'continue_with',
                shape: 'pill',
                logo_alignment: 'left'
            })
        } catch (error) {
            console.error('Error initializing Google Sign-In:', error)
        }
    }, [handleGoogleLogin])

    return (
        <div className="w-full h-[44px]">
            <div ref={divRef} className="w-full" />
        </div>
    )
}

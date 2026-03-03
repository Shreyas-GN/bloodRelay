"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold text-brand-red tracking-tight mb-2">
                        Pulse<span className="text-brand-blue">Aid</span>
                    </h1>
                    <p className="text-lg text-brand-steel">
                        Join the life-saving community
                    </p>
                </div>

                <SignUp
                    routing="path"
                    path="/sign-up"
                />
            </div>
        </div>
    );
}

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown, MessageSquare, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Storyboard() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const skyY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [1, 0, 1, 0, 1, 1]);

    return (
        <div ref={containerRef} className="relative h-[400vh] bg-slate-950 text-white selection:bg-cyan-500/30">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(17,24,39,1)_0%,_rgba(2,6,23,1)_100%)]" />
                <motion.div
                    style={{ y: skyY }}
                    className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"
                />
            </div>

            {/* Top Navigation Header */}
            <nav className="fixed top-0 left-0 right-0 h-20 px-6 flex items-center justify-between z-50 bg-slate-950/20 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                        <MessageSquare className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter">TARS</span>
                </div>
                <div className="flex items-center gap-4">
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="px-5 py-2 text-sm font-bold bg-white text-black rounded-lg hover:bg-cyan-400 hover:text-white transition-all">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </nav>

            {/* Section 1: Hero */}
            <section className="sticky top-0 h-screen flex flex-col items-center justify-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center px-4"
                >
                    <h1 className="text-6xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                        CONNECT <br /> <span className="text-cyan-400">INSTANTLY</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                        The next generation of real-time communication. Experience seamless messaging with institutional-grade scale.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-cyan-400 hover:text-white transition-all flex items-center gap-2 group">
                                    Get Started <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/chat">
                                <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-cyan-400 hover:text-white transition-all flex items-center gap-2 group">
                                    Go to Chat <MessageSquare className="w-5 h-5 group-hover:scale-125 transition-transform" />
                                </button>
                            </Link>
                        </SignedIn>
                    </div>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10"
                >
                    <ArrowDown className="text-slate-500 w-8 h-8" />
                </motion.div>
            </section>

            {/* Section 2: Features */}
            <section className="h-screen flex items-center justify-center relative z-10 px-4">
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
                    <FeatureCard
                        icon={<Zap className="text-yellow-400" />}
                        title="Real-time"
                        description="Powered by Convex subscriptions for zero-latency messaging."
                    />
                    <FeatureCard
                        icon={<Shield className="text-cyan-400" />}
                        title="Secure"
                        description="Enterprise authentication with Clerk identity management."
                    />
                    <FeatureCard
                        icon={<MessageSquare className="text-purple-400" />}
                        title="Fluid"
                        description="Smooth transitions and animations for a premium experience."
                    />
                </div>
            </section>

            {/* Section 3: Call to Action */}
            <section className="h-screen flex items-center justify-center relative z-10 px-4">
                <motion.div
                    className="text-center bg-slate-900/50 backdrop-blur-xl p-12 rounded-3xl border border-white/10 max-w-4xl"
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to join the conversation?</h2>
                    <p className="text-xl text-slate-400 mb-10">Sign up in seconds and start messaging anyone on the platform.</p>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="px-12 py-5 bg-cyan-500 text-white font-black text-xl rounded-full hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(6,182,212,0.3)]">
                                JOIN NOW
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <div className="flex flex-col items-center gap-4">
                            <UserButton afterSignOutUrl="/" />
                            <Link href="/chat" className="text-cyan-400 hover:underline">Continue to your messages</Link>
                        </div>
                    </SignedIn>
                </motion.div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-sm hover:border-cyan-500/50 transition-colors group"
        >
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{description}</p>
        </motion.div>
    );
}

import React, { useState } from 'react';

/**
 * ZK-GitProof Hero Component (React + Tailwind CSS)
 * Matches the design and features of ZK-GitProof.
 */
export default function ZKGitProofHero({ onMintClick, onVerifyClick, onConnectGitHub }) {
  const [activePreset, setActivePreset] = useState('rust');

  const presets = {
    rust: {
      title: "Merged 15+ Rust PRs",
      company: "[REDACTED]",
      badgeId: "zk-rust-15pr-88"
    },
    solidity: {
      title: "Merged 25+ Solidity PRs",
      company: "[REDACTED]",
      badgeId: "zk-soli-25pr-42"
    },
    go: {
      title: "Merged 40+ Go Microservices PRs",
      company: "[REDACTED]",
      badgeId: "zk-go-40pr-19"
    },
    python: {
      title: "Merged 30+ Python ML PRs",
      company: "[REDACTED]",
      badgeId: "zk-pyth-30pr-91"
    }
  };

  const current = presets[activePreset];

  return (
    <div className="min-h-screen bg-[#FAFCFB] text-slate-900 selection:bg-emerald-100 antialiased font-sans">
      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-10 border-2 border-emerald-600 rounded-lg flex items-center justify-center text-emerald-700 font-mono font-bold text-base bg-emerald-50/50">
            &lt;/&gt;
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">ZK-GitProof</span>
        </div>

        <nav className="flex items-center gap-7">
          <a href="#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition">How It Works</a>
          <button onClick={onVerifyClick} className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition">Verify a Badge</button>
          <button 
            onClick={onConnectGitHub}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>Connect GitHub</span>
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-7">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Prove Your Private Code.<br />
            <span className="text-emerald-600">Protect Your NDA.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-xl font-normal leading-relaxed">
            Generate zero-knowledge skill badges from private GitHub repositories without exposing source code or company names.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onMintClick}
              className="px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition transform hover:-translate-y-0.5"
            >
              <span className="font-mono text-sm opacity-90">&lt;/&gt;</span>
              <span>Mint ZK Badge</span>
              <span>→</span>
            </button>

            <button
              onClick={onVerifyClick}
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-base flex items-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <span>Verify Candidate</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Preview Card */}
        <div className="lg:col-span-5 relative flex flex-col items-center">
          {/* Top-right floating padlock */}
          <div className="absolute -top-10 -right-4 w-14 h-16 bg-emerald-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center p-3 border border-emerald-400/30 shadow-lg">
            <svg className="w-7 h-7 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
          </div>

          {/* Card */}
          <div className="w-full max-w-[440px] bg-white rounded-3xl p-7 shadow-xl shadow-emerald-500/10 border border-slate-100">
            {/* Status Pill */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Preview
              </span>
            </div>

            {/* Inner Content */}
            <div className="flex items-center gap-5">
              {/* Hexagonal GitHub Badge */}
              <div className="relative w-16 h-18 flex items-center justify-center">
                <div className="w-14 h-16 bg-emerald-900 rounded-xl flex items-center justify-center text-white border-2 border-emerald-400 shadow-md">
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                </div>
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">{current.title}</h3>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md border border-slate-200">
                    🏢 Company: {current.company}
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-400">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    Verified on ZK-GitProof
                  </span>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              {Object.keys(presets).map((k) => (
                <button
                  key={k}
                  onClick={() => setActivePreset(k)}
                  className={`px-2.5 py-1.5 rounded-lg border font-semibold text-left transition ${
                    activePreset === k ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  {k.toUpperCase()} PRs
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 lg:px-12 py-16 border-t border-slate-100">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center mb-16">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-4 border border-emerald-300">1</div>
            <div className="w-48 h-32 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center mb-4">
              <span className="text-3xl">💻 🔗</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">Connect GitHub locally in your browser.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-4 border border-emerald-300">2</div>
            <div className="w-48 h-32 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center mb-4">
              <span className="text-3xl">🛡️ 🔒</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">Generate a zero-knowledge proof (zkTLS) that hides repo names.</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-4 border border-emerald-300">3</div>
            <div className="w-48 h-32 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center mb-4">
              <span className="text-3xl">📜 🏅</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">Share a tamper-proof badge link on your resume or LinkedIn.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

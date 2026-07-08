import { Link } from "react-router-dom"
import { Music, Sparkles, Wand2, Disc, Library, Share2, ArrowRight, ShieldCheck, Heart, User } from "lucide-react"

export default function LandingPage() {
  const features = [
    {
      title: "Custom AI Vocalists",
      desc: "Specify vocal gender, style weights, and parameters to guide the AI singer.",
      icon: Wand2,
      color: "from-purple-500 to-indigo-500",
    },
    {
      title: "HIFI Audio Storage",
      desc: "Every track is processed, converted to high-fidelity MP3, and hosted permanently on Cloudinary.",
      icon: Disc,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Song Library & Sharing",
      desc: "Keep records of all generations in a neat, filterable catalog. Download or share with one click.",
      icon: Library,
      color: "from-pink-500 to-rose-500",
    },
  ]

  const steps = [
    { step: "01", title: "Add Your API Key", desc: "Enter your personal Suno API key under settings to authorize generations." },
    { step: "02", title: "Describe Your Vibe", desc: "Input text prompts representing genres, tempos, instruments, and moods." },
    { step: "03", title: "Compose & Share", desc: "Let the AI build your tracks, stream instantly, and share the Cloudinary links." },
  ]

  return (
    <div className="min-h-screen bg-[#040408] text-white overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "3s" }}></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* Hero section */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-primary mb-8 hover:bg-white/10 transition-all cursor-pointer">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>V4.5 Studio Composition Engine is Live</span>
        </div>

        <h1 className="font-heading font-extrabold text-5xl md:text-7xl leading-tight tracking-tight max-w-4xl mx-auto bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
          Manifest Your Sound Vibe Into <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Reality</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
          SoundForge uses state-of-the-art AI generators to synthesize full vocal and instrumental songs based on prompts. Store, organize, and download.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            to="/login"
            className="glow-btn px-8 py-4 bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 rounded-2xl font-bold text-sm tracking-wide uppercase flex items-center gap-2 transition hover:shadow-lg hover:shadow-primary/30"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register"
            className="px-8 py-4 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl font-bold text-sm tracking-wide uppercase flex items-center gap-2 transition hover:bg-white/10"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Feature cards Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white">Full-Featured AI Music Workspace</h2>
          <p className="text-muted-foreground text-sm mt-3">Advanced generation tools configured directly for production</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="sf-card p-8 rounded-3xl relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${feat.color}`}></div>
              <div className="bg-white/5 border border-white/5 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">{feat.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white">How It Works</h2>
          <p className="text-muted-foreground text-sm mt-3">Three simple steps to generate high-fidelity songs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((st, idx) => (
            <div key={idx} className="relative space-y-4">
              <span className="font-heading font-extrabold text-6xl text-primary/10 block">{st.step}</span>
              <h3 className="font-heading font-bold text-lg text-white">{st.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mock Pricing Section UI */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-white">Simple Pricing Plans</h2>
          <p className="text-muted-foreground text-sm mt-3">Pay as you go or choose monthly subscription packages</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-8">
          {/* Plan 1 */}
          <div className="sf-card p-8 rounded-3xl flex flex-col justify-between border border-white/5 hover:border-primary/30 transition">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Community Plan</span>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-heading font-extrabold text-white">$0</span>
                <span className="text-muted-foreground text-xs ml-2">/ free forever</span>
              </div>
              <p className="text-muted-foreground text-xs mt-3 leading-relaxed">
                Connect your personal API key and generate unlimited songs with no developer markup fee.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">✓ Use personal API key</li>
                <li className="flex items-center gap-2">✓ Permanent Cloudinary storage</li>
                <li className="flex items-center gap-2">✓ Full download & export features</li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full text-center py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-xs mt-8 transition"
            >
              Get Started
            </Link>
          </div>

          {/* Plan 2 */}
          <div className="sf-card p-8 rounded-3xl flex flex-col justify-between border border-primary/30 relative">
            <div className="absolute top-4 right-4 bg-primary text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
              Popular
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Pro Producer</span>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-heading font-extrabold text-white">$15</span>
                <span className="text-muted-foreground text-xs ml-2">/ month</span>
              </div>
              <p className="text-muted-foreground text-xs mt-3 leading-relaxed">
                Premium backend server access. No API Key required. Higher concurrency generations.
              </p>
              <ul className="mt-6 space-y-3 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">✓ Omit Settings setup</li>
                <li className="flex items-center gap-2">✓ High-speed V5 compose model</li>
                <li className="flex items-center gap-2">✓ Priority background processing</li>
              </ul>
            </div>
            <Link
              to="/login"
              className="w-full text-center py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 rounded-xl font-bold text-xs mt-8 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-xs text-muted-foreground relative z-10 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
              <Music className="w-4 h-4" />
            </div>
            <span className="font-heading font-bold text-white tracking-wide">SoundForge AI</span>
          </div>
          <p>© {new Date().getFullYear()} SoundForge. All rights reserved. Created for professional AI music production.</p>
        </div>
      </footer>
    </div>
  )
}

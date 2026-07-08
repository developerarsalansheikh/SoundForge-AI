"use client"

import { useState } from "react"
import { Music, Download, RefreshCw } from "lucide-react"
import AudioPlayer from "./AudioPlayer"

function ResultsSection() {
  const [hasGenerated, setHasGenerated] = useState(false)

  return (
    <section>
      {hasGenerated && (
        <div className="max-w-3xl mx-auto mb-16">
          <div className="glass rounded-2xl p-8 border border-primary/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-accent neon-glow">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">Generated Track</h3>
                <p className="text-sm text-foreground/60">Your AI-created masterpiece</p>
              </div>
            </div>

            <div className="mb-6">
              <AudioPlayer audioUrl="https://res.cloudinary.com/demo/video/upload/cld_rubbersoles_dance_m37714.mp3" />
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Song Title</p>
                <p className="font-bold text-white">Neon Dreams (AI Generated)</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-1">Duration</p>
                <p className="font-bold text-white">2:45</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-semibold transition-all duration-300">
                <Download className="w-5 h-5" />
                Download
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent font-semibold transition-all duration-300">
                <RefreshCw className="w-5 h-5" />
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-foreground/40 mb-4">
          {hasGenerated ? "Ready to create another track?" : "Start creating your first track above"}
        </h2>
        <button
          onClick={() => setHasGenerated(!hasGenerated)}
          className="px-6 py-3 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-semibold transition-all duration-300"
        >
          {hasGenerated ? "Clear" : "Demo"} Results
        </button>
      </div>
    </section>
  )
}

export default ResultsSection

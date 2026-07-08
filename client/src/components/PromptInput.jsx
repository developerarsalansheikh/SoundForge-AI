"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"

function PromptInput() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  return (
    <section className="mb-16">
      <div className="max-w-3xl mx-auto">
        <div className="glass rounded-2xl p-8 border border-primary/30">
          <label className="block mb-4">
            <span className="text-sm font-semibold text-primary/80 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Describe Your Song
            </span>
          </label>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Chill lofi beats with rain sounds, nostalgic vibes, 90 BPM..."
            className="w-full bg-background/50 border border-primary/20 rounded-xl p-4 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none min-h-24 font-medium"
          />

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary via-secondary to-accent neon-glow hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Song
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PromptInput

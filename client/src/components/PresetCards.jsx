import { Zap, Heart, Radio } from "lucide-react"

const presets = [
  {
    id: 1,
    title: "Sad LoFi",
    description: "Melancholic beats with lo-fi aesthetic",
    icon: Heart,
    gradient: "from-primary to-secondary",
  },
  {
    id: 2,
    title: "Punjabi Hip-Hop",
    description: "Bhangra-infused with heavy bass",
    icon: Radio,
    gradient: "from-secondary to-accent",
  },
  {
    id: 3,
    title: "Romantic Bollywood",
    description: "Orchestral with romantic vocals",
    icon: Heart,
    gradient: "from-accent to-primary",
  },
  {
    id: 4,
    title: "Hard Trap",
    description: "Aggressive beats with 808 drums",
    icon: Zap,
    gradient: "from-primary via-secondary to-accent",
  },
]

function PresetCards() {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-8 gradient-text">Preset Vibes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {presets.map((preset) => {
          const Icon = preset.icon
          return (
            <button
              key={preset.id}
              className="glass group rounded-2xl p-6 border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 text-left transform hover:scale-105"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${preset.gradient} p-3 mb-4 neon-glow group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-full h-full text-white" />
              </div>

              <h3 className="font-bold text-white mb-2">{preset.title}</h3>
              <p className="text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors">
                {preset.description}
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default PresetCards

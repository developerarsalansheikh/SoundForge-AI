"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Download } from "lucide-react"

function AudioPlayer({ audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef(null)

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("AudioPlayer playback error:", err)
          setIsPlaying(false)
        })
    }
  }

  // Handle URL change: reset state and reload audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      audioRef.current.load()
    }
  }, [audioUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration)
      }
    }
    const handleEnded = () => setIsPlaying(false)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => setVolume(audio.volume)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("durationchange", updateDuration)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("volumechange", handleVolumeChange)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("durationchange", updateDuration)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("volumechange", handleVolumeChange)
    }
  }, [])

  const handleProgressChange = (e) => {
    const time = Number.parseFloat(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const handleVolumeSliderChange = (e) => {
    const vol = Number.parseFloat(e.target.value)
    setVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    if (volume > 0) {
      audioRef.current.volume = 0
      setVolume(0)
    } else {
      audioRef.current.volume = 0.8
      setVolume(0.8)
    }
  }

  const formatTime = (time) => {
    if (isNaN(time) || time === Infinity) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      {/* HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Waveform Visualizer */}
      <div className="flex items-center justify-center gap-1 h-16 bg-background/50 rounded-xl p-4">
        {[...Array(32)].map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-200 ${
              isPlaying ? "wave-bar" : "h-1"
            } bg-gradient-to-t from-primary to-accent`}
            style={{
              height: isPlaying ? `${Math.max(15, Math.sin(currentTime * 5 + i) * 35 + 45)}%` : "20%",
              opacity: 0.6 + (i / 32) * 0.4,
            }}
          />
        ))}
      </div>

      {/* Player Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          disabled={!audioUrl}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent neon-glow flex items-center justify-center text-white hover:shadow-lg transition-all duration-300 transform hover:scale-110 disabled:opacity-50"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-foreground/60 min-w-fit">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            disabled={!audioUrl}
            className="flex-1 h-1 bg-primary/20 rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50"
          />
          <span className="text-xs text-foreground/60 min-w-fit">{formatTime(duration)}</span>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} disabled={!audioUrl} className="focus:outline-none">
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-foreground/60" />
            ) : (
              <Volume2 className="w-4 h-4 text-foreground/60" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeSliderChange}
            disabled={!audioUrl}
            className="w-16 h-1 bg-primary/20 rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50"
          />
        </div>

        {/* Download Action */}
        {audioUrl && (
          <a
            href={audioUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
            title="Download Track"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  )
}

export default AudioPlayer

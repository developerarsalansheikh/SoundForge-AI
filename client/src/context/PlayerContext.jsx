import { createContext, useContext, useState, useRef, useEffect } from "react"

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [error, setError] = useState(null)

  const audioRef = useRef(new Audio())
  const retryCountRef = useRef(0)

  useEffect(() => {
    const audio = audioRef.current

    // Set crossOrigin to resolve potential CORS canvas/visualizer constraints
    audio.crossOrigin = "anonymous"

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      setIsLoading(false)
      setIsBuffering(false)
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setError(null)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setError(null)
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handlePlaying = () => {
      setIsLoading(false)
      setIsBuffering(false)
      setIsPlaying(true)
    }

    const handleError = (e) => {
      console.error("HTML5 Audio Event Error:", e)
      let errMsg = "Failed to load audio."
      if (audio.error) {
        switch (audio.error.code) {
          case 1: errMsg = "Audio playback aborted by user."; break;
          case 2: errMsg = "Network error while downloading audio."; break;
          case 3: errMsg = "Audio decoding failed (corrupt file/unsupported format)."; break;
          case 4: errMsg = "Audio source not supported or URL invalid."; break;
        }
      }
      console.error(`Audio playback error occurred: ${errMsg} (Code: ${audio.error?.code || 'unknown'})`)
      
      // Attempt retry for network errors
      if (audio.error?.code === 2 && retryCountRef.current < 3) {
        handlePlayFailure()
      } else {
        setError(errMsg)
        setIsPlaying(false)
        setIsLoading(false)
        setIsBuffering(false)
      }
    }

    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("waiting", handleWaiting)
    audio.addEventListener("playing", handlePlaying)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("waiting", handleWaiting)
      audio.removeEventListener("playing", handlePlaying)
      audio.removeEventListener("error", handleError)
    }
  }, [])

  // Auto-retry helper
  const handlePlayFailure = () => {
    if (retryCountRef.current < 3) {
      retryCountRef.current += 1
      console.warn(`[Audio Retry] Playback failed. Attempting retry ${retryCountRef.current}/3 in 1.5s...`)
      setIsLoading(true)
      setIsBuffering(true)
      
      setTimeout(() => {
        if (!currentSong?.cloudinaryUrl) return
        audioRef.current.load()
        audioRef.current.play()
          .then(() => {
            console.log("[Audio Retry] Successfully recovered playback.")
            setIsPlaying(true)
            setIsLoading(false)
            setIsBuffering(false)
          })
          .catch((err) => {
            console.error(`[Audio Retry] Attempt ${retryCountRef.current} failed:`, err)
            if (retryCountRef.current >= 3) {
              setError("Failed to play audio after retries. Please check your connection or download the track.")
              setIsPlaying(false)
              setIsLoading(false)
              setIsBuffering(false)
            }
          })
      }, 1500)
    } else {
      setError("Failed to play audio. Please check your connection.")
      setIsPlaying(false)
      setIsLoading(false)
      setIsBuffering(false)
    }
  }

  // Update audio source when current song changes
  useEffect(() => {
    if (currentSong?.cloudinaryUrl) {
      setError(null)
      setIsLoading(true)
      setIsBuffering(false)
      retryCountRef.current = 0
      
      audioRef.current.src = currentSong.cloudinaryUrl
      audioRef.current.load()
      
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error("Initial play request rejected:", err)
          handlePlayFailure()
        })
      }
    } else {
      audioRef.current.src = ""
      setIsLoading(false)
      setIsBuffering(false)
    }
  }, [currentSong])

  // Sync volume state
  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  const play = async (song) => {
    if (!song) return
    const isSame = currentSong?.id === song.id || currentSong?._id === song._id
    
    if (isSame) {
      setIsPlaying(true)
      try {
        await audioRef.current.play()
      } catch (err) {
        console.error("Play execution failed:", err)
        handlePlayFailure()
      }
    } else {
      setIsPlaying(true)
      setCurrentSong(song)
    }
  }

  const pause = () => {
    audioRef.current.pause()
    setIsPlaying(false)
  }

  const toggle = (song) => {
    if (!song) return
    const isSame = currentSong?.id === song.id || currentSong?._id === song._id
    if (isSame && isPlaying) {
      pause()
    } else {
      play(song)
    }
  }

  const seek = (time) => {
    if (isNaN(time)) return
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const clearSong = () => {
    audioRef.current.pause()
    audioRef.current.src = ""
    setCurrentSong(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setError(null)
    setIsLoading(false)
    setIsBuffering(false)
    retryCountRef.current = 0
  }

  const value = {
    currentSong,
    isPlaying,
    volume,
    duration,
    currentTime,
    isLoading,
    isBuffering,
    error,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    clearSong,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider")
  }
  return context
}

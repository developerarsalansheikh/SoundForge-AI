import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import MusicHeroHeader from './MusicHeroHeader';
import Footer from './Footer';

const POLL_INTERVAL_POLL_MS     = 4000;  // 4 s — active polling mode (no BACKEND_URL set)
const POLL_INTERVAL_CALLBACK_MS = 6000;  // 6 s — callback mode (Suno will push; we just check DB)
const POLL_MAX_ATTEMPTS         = 45;    // 45 × 6 s = 4.5-minute max wait

const MusicApp = () => {
  const [loading, setLoading]       = useState(false);
  const [songUrl, setSongUrl]       = useState(null);
  const [imageUrl, setImageUrl]     = useState(null);
  const [lyrics, setLyrics]         = useState(null);
  const [songTitle, setSongTitle]   = useState('');
  const [status, setStatus]         = useState('');
  const [errorMsg, setErrorMsg]     = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const pollIntervalRef = useRef(null);
  const pollAttemptsRef = useRef(0);

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // ── Helpers ───────────────────────────────────────────────────────────────
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollAttemptsRef.current = 0;
  };

  const resetState = () => {
    setSongUrl(null);
    setImageUrl(null);
    setLyrics(null);
    setSongTitle('');
    setStatus('');
    setErrorMsg('');
    stopPolling();
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setLoading(false);
    setStatus('');
    stopPolling();
    console.error('[MusicApp]', msg);
  };

  // ── Step 1: Generate → get taskId ─────────────────────────────────────────
  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!userPrompt.trim()) {
      setErrorMsg('Please describe your song vibe first!');
      return;
    }

    if (!isAuthenticated || !user?.token) {
      navigate('/login');
      return;
    }

    resetState();
    setLoading(true);
    setStatus('Sending your vibe to the AI...');
    console.log('[MusicApp] [Frontend → Backend] POST /api/music/generate. Prompt:', userPrompt);

    try {
      // ── Call OUR backend — it fetches the API key from DB and calls Suno ──
      const res = await axiosInstance.post('/api/music/generate', {
        prompt:             userPrompt.trim(),
        style:              'General',
        title:              'Untitled Track',
        instrumental:       false,
        model:              'V4_5ALL',
        vocalGender:        'm',
        styleWeight:        0.65,
        weirdnessConstraint: 0.65,
        audioWeight:        0.65,
      });

      console.log('[MusicApp] [Frontend ← Backend] Generate response:', res.data);

      if (!res.data.success || !res.data.taskId) {
        return showError(res.data.error || 'No taskId returned from server.');
      }

      const { taskId, mode } = res.data;
      console.log(`[MusicApp] Task ID: ${taskId}  Mode: ${mode}`);
      const intervalMs = mode === 'callback' ? POLL_INTERVAL_CALLBACK_MS : POLL_INTERVAL_POLL_MS;
      setStatus(mode === 'callback' ? 'AI is composing your track...' : 'AI is composing your track (polling)...');
      startPolling(taskId, intervalMs);

    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Generation request failed.';
      console.error('[MusicApp] [Frontend ← Backend] Generate error response:', err.response?.data || err.message);
      showError(msg);
    }
  };

  // ── Step 2: Poll backend until audio is ready ─────────────────────────────
  const startPolling = (taskId, intervalMs = POLL_INTERVAL_POLL_MS) => {
    console.log(`[MusicApp] [Frontend → Backend] Starting status polling for taskId: ${taskId} at interval ${intervalMs}ms`);
    pollAttemptsRef.current = 0;

    pollIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;
      console.log(`[MusicApp] [Frontend → Backend] Poll attempt #${pollAttemptsRef.current} for taskId: ${taskId}`);

      // Timeout guard
      if (pollAttemptsRef.current > POLL_MAX_ATTEMPTS) {
        showError('Generation timed out after ~4.5 minutes. Please try again.');
        return;
      }

      try {
        // ── Call OUR backend status endpoint ──
        const res = await axiosInstance.get(`/api/music/status/${taskId}`);
        console.log(`[MusicApp] [Frontend ← Backend] Poll result (attempt ${pollAttemptsRef.current}):`, res.data);

        if (!res.data.success) {
          showError(res.data.error || 'Polling failed.');
          return;
        }

        if (res.data.done && res.data.audioUrl) {
          stopPolling();
          setSongUrl(res.data.audioUrl);
          setImageUrl(res.data.imageUrl || null);
          setLyrics(res.data.lyrics   || null);
          setSongTitle(res.data.title || 'Untitled Track');
          setLoading(false);
          setStatus('Generation Complete!');
          console.log('[MusicApp] [Frontend ← Backend] Music Generation Complete! Audio URL:', res.data.audioUrl);
        } else if (res.data.done && res.data.status === 'error') {
          showError(res.data.error || 'Generation failed on the Suno side.');
        } else {
          const pollStatus = res.data.status || 'pending';
          setStatus(`AI is composing... (${pollStatus})`);
        }

      } catch (pollErr) {
        const msg = pollErr.response?.data?.error || pollErr.message;
        console.error(`[MusicApp] [Frontend ← Backend] Poll request error:`, msg);
        if (pollAttemptsRef.current >= POLL_MAX_ATTEMPTS) {
          showError('Polling failed too many times. Please try again.');
        }
      }
    }, intervalMs);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center w-full bg-transparent min-h-screen text-white">
      <MusicHeroHeader />

      <form
        onSubmit={handleGenerate}
        className="relative mt-10 group w-full md:w-[60%] p-[2px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-purple-500/20"
      >
        {/* Animated Gradient Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 animate-gradient-x group-hover:animate-pulse"></div>

        {/* Main Form Container with Glassmorphism */}
        <div className="relative bg-gray-900/90 backdrop-blur-xl p-8 rounded-2xl w-full h-full">

          {/* Header Section */}
          <div className="mb-6">
            <label className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 text-lg font-bold tracking-wide uppercase italic">
              Describe your song vibe ✨
            </label>
            <p className="text-gray-400 text-xs mt-1 italic">Manifest your sound into reality...</p>
          </div>

          {/* Textarea */}
          <div className="relative mb-6">
            <textarea
              className="w-full p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-gray-100 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
                         transition-all duration-300 resize-none shadow-inner"
              rows="4"
              placeholder="Drake x AP Dhillon, Deep emotions, Lo-fi Trap..."
              value={userPrompt}
              onChange={(e) => { setUserPrompt(e.target.value); setErrorMsg(''); }}
              disabled={loading}
            />
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-purple-600/10 blur-3xl pointer-events-none"></div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{errorMsg}</span>
              {errorMsg.toLowerCase().includes('api key') && (
                <Link to="/settings" className="ml-auto text-purple-400 hover:text-purple-300 font-semibold whitespace-nowrap">
                  → Settings
                </Link>
              )}
            </div>
          )}

          {/* Generate Button */}
          <button
            type="submit"
            disabled={loading}
            className={`relative w-full py-4 rounded-xl font-black text-white uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-lg ${
              loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  GENERATING...
                </>
              ) : (
                <>Generate Music <span className="text-xl">🚀</span></>
              )}
            </span>
          </button>

          {/* Footer Detail */}
          <div className="mt-4 flex justify-between items-center text-[10px] text-gray-500 font-mono tracking-tighter uppercase">
            <span>AI Engine V4.5</span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-400 animate-ping' : 'bg-green-500 animate-ping'}`}></span>
              {loading ? 'Generating...' : 'Ready to vibe'}
            </span>
          </div>

          {/* Status + Result area */}
          <div className="mt-12 w-full max-w-2xl mx-auto text-center px-4">

            {/* Status pulse */}
            {status && !songUrl && (
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
                <p className="text-purple-300 font-mono text-sm tracking-widest uppercase animate-pulse">
                  {status}
                </p>
              </div>
            )}

            {/* Song Result Card */}
            {songUrl && (
              <div className="relative group animate-in fade-in zoom-in duration-700">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>

                <div className="relative bg-gray-900/80 backdrop-blur-2xl p-8 rounded-2xl border border-white/10 shadow-2xl">

                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Album Art or Disk */}
                    <div className="relative shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Album Art"
                          className="w-24 h-24 rounded-full object-cover border-4 border-purple-500 shadow-xl"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-tr from-gray-800 to-gray-700 rounded-full flex items-center justify-center border-4 border-gray-600 shadow-xl animate-[spin_8s_linear_infinite]">
                          <div className="w-8 h-8 bg-gray-900 rounded-full border-2 border-purple-500"></div>
                        </div>
                      )}
                      <span className="absolute -top-2 -right-2 text-2xl animate-bounce">🔥</span>
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1">
                        {songTitle || 'Track Mastered'} <span className="text-purple-500">successfully</span>
                      </h2>
                      <p className="text-gray-400 text-xs font-mono uppercase tracking-[0.2em] mb-4">
                        Encoded • 320kbps • High Fidelity
                      </p>

                      {/* Audio Player */}
                      <audio
                        controls
                        src={songUrl}
                        className="w-full h-10 filter invert opacity-80 hover:opacity-100 transition-all rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Lyrics */}
                  {lyrics && (
                    <details className="mt-6 text-left">
                      <summary className="cursor-pointer text-purple-400 text-xs font-bold uppercase tracking-widest mb-2 hover:text-purple-300 transition">
                        View Lyrics
                      </summary>
                      <pre className="mt-3 p-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                        {lyrics}
                      </pre>
                    </details>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-end border-t border-white/5 pt-6">
                    <a
                      href={songUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      <span>Preview Link</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                    </a>

                    <a
                      href={songUrl}
                      download
                      className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-full text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all transform hover:scale-105 active:scale-95"
                    >
                      <span>Download MP3</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                    </a>

                    <button
                      onClick={resetState}
                      className="flex items-center gap-2 px-6 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      Generate Another
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      <Footer />
    </div>
  );
};

export default MusicApp;
import React, { useState, useEffect } from 'react';

const MusicHeroHeader = () => {
  const [scrolled, setScrolled] = useState(false);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full min-h-[60vh] flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0c]">
      
      {/* --- 1. Gen-Z Navbar --- */}
   

      {/* --- 2. Background Animated Glows (Matched with Form) --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse delay-700"></div>

      {/* --- 3. Main Content --- */}


      
      <div className="relative z-10 text-center px-4 mt-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-[0.3em] mb-6 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          Next-Gen AI Audio
        </div>

        {/* Heading */}
        <h1 className="text-6xl md:text-8xl font-black tracking-[ -0.05em] text-white mb-6 leading-none">
          VIBE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-gradient-x">ENGINE</span>
        </h1>

        {/* Sub-heading */}
        <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-medium">
          The ultimate sound laboratory. Convert your thoughts into 
          <span className="text-white"> high-fidelity </span> 
          tracks instantly.
       
        </p>
      </div>

      {/* --- 4. Animated Waveform Visualizer --- */}
      <div className="absolute bottom-0 w-full flex items-end justify-center gap-[2px] opacity-30 h-32 pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div 
            key={i} 
            className="w-[3px] bg-gradient-to-t from-purple-600 via-blue-500 to-transparent rounded-t-full"
            style={{ 
              height: `${Math.random() * 100}%`,
              animation: `visualizer 1.5s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.05}s`
            }}
          ></div>
        ))}
      </div>

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes visualizer {
          0% { height: 10%; }
          100% { height: 80%; }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}} />
    </div>
  );
};

export default MusicHeroHeader;
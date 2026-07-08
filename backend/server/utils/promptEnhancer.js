/**
 * promptEnhancer.js
 *
 * Automatic Prompt Enhancement Engine for Suno.
 * Appends optimized production keywords based on dynamic genre detection
 * without altering the user's core song idea.
 */

const GENRE_TEMPLATES = {
  "hip hop": {
    prefix: "A powerful high-energy hip-hop track with a hard-hitting beat and confident vocal flow,",
    suffix: ", boom bap rhythm, deep sub-bass, clean 808s, polished vocal presence, professional dynamic mix, radio-ready production, punchy compression"
  },
  "lofi": {
    prefix: "A relaxing aesthetic lofi hip hop track, chill study beats style, warm tape saturation,",
    suffix: ", dusty vinyl crackle, cozy jazz chords, smooth mellow Rhodes piano, gentle ambient atmosphere, smooth low-pass filter, relaxing head-nodding rhythm"
  },
  "edm": {
    prefix: "An explosive festival-ready electronic dance music track with building tension and massive energy,",
    suffix: ", heavy synth leads, powerful pumping sidechained bassline, epic drop, sparkling uplifters, crisp hats, club-ready dynamic mastering"
  },
  "rock": {
    prefix: "A raw high-octane rock anthem with grit and driving energy,",
    suffix: ", heavy distorted electric guitars, thundering live drum kit, punchy bass, soaring expressive vocals, classic analog warmth, powerful stage presence"
  },
  "classical": {
    prefix: "A breathtaking cinematic classical orchestral composition with rich emotional depth,",
    suffix: ", sweeping lush string sections, elegant grand piano, delicate woodwinds, dramatic brass crescendos, spacious concert hall acoustics, rich natural dynamics"
  },
  "pop": {
    prefix: "A catchy modern radio-ready pop hit with infectious rhythms and polished hooks,",
    suffix: ", sweet vocal harmonies, bright synthesizer arpeggios, driving danceable beat, stellar commercial mix, polished stellar mastering"
  },
  "sad": {
    prefix: "A deeply moving emotional sad ballad with melancholic undertones and raw vulnerability,",
    suffix: ", solemn acoustic piano, slow tragic tempo, haunting vocal delivery, tearful string arrangements, spacious somber reverb, intimate mixing"
  },
  "romantic": {
    prefix: "Create a high-quality emotional romantic pop song with expressive male vocals, cinematic production,",
    suffix: ", beautiful melodies, memorable chorus, rich harmonies, modern instrumentation, professional mastering, emotional storytelling, streaming-quality audio, polished arrangement and commercial music production"
  },
  "motivational": {
    prefix: "An inspiring uplifting motivational anthem built on triumph and positive energy,",
    suffix: ", building orchestrations, triumphant chorus, driving rhythmic beat, powerful passionate vocals, soaring climax, epic sound stage"
  },
  "trap": {
    prefix: "A dark heavy trap beat with aggressive sub-bass and fast hi-hat rolls,",
    suffix: ", rattling hats, sliding 808s, ominous synthesizers, heavy dynamic compression, modern rap-ready instrumental, commercial urban production"
  },
  "punjabi": {
    prefix: "A vibrant energetic Punjabi beat with traditional folk fusion and modern dance groove,",
    suffix: ", rhythmic dhol beats, rich tumbi accents, traditional high-pitched male vocals, modern bass drops, wedding-ready party atmosphere, polished commercial bhangra sound"
  },
  "bollywood": {
    prefix: "A grand theatrical Bollywood production featuring lush arrangements and cinematic playback vocals,",
    suffix: ", tabla and sitar highlights, sweeping string orchestra, expressive romantic vocals, classical harmony structure, high-fidelity theatrical mix"
  },
  "devotional": {
    prefix: "A peaceful spiritual devotional bhajan with divine sacred chanting and meditative rhythm,",
    suffix: ", soothing flute melodies, harmonium chords, gentle manjira bells, calm meditative vocals, sacred temple acoustics, pure serene atmosphere"
  },
  "rap": {
    prefix: "A fast-paced lyrical rap track with sharp poetic delivery and a rhythmic backbone,",
    suffix: ", articulated vocal mixing, punchy snare, clean production, crisp dynamic range, underground raw vibe mixed with studio polish"
  },
  "phonk": {
    prefix: "An aggressive dark drift phonk track with heavy distortion and cowbell melodies,",
    suffix: ", overdriven 808 bass, chopped vocal samples, Memphis rap tape aesthetics, high-speed street racing vibe, gritty compression"
  },
  "jazz": {
    prefix: "A smooth sophisticated jazz track with warm instrumentation and complex chord changes,",
    suffix: ", brushed snare drums, double bass groove, improvisational saxophone solos, smoky lounge atmosphere, warm analog vintage master"
  },
  "country": {
    prefix: "A heartwarming acoustic country song with authentic storytelling and emotional clarity,",
    suffix: ", twangy slide guitar, steel-string acoustic strumming, clear soulful vocals, nostalgic fiddle melody, rustic production style"
  },
  "general": {
    prefix: "A high-quality professionally produced studio track with clear vocals and clean arrangement,",
    suffix: ", rich stereo field, balanced frequencies, modern sound design, commercial mastering, expressive dynamics, radio-ready production quality"
  }
};

/**
 * Enhances a user's prompt by identifying the most suitable genre and applying prefix/suffix keywords.
 * @param {string} userPrompt - The raw input prompt from the user.
 * @param {string} [styleHint] - Optional genre/style hints from form inputs.
 * @returns {{ enhancedPrompt: string, detectedGenre: string }} The enhanced prompt and detected genre.
 */
function enhancePrompt(userPrompt, styleHint = "") {
  const normalizedPrompt = (userPrompt || "").toLowerCase();
  const normalizedStyle = (styleHint || "").toLowerCase();

  let detectedGenre = "general";

  // Check templates key matches
  const keys = Object.keys(GENRE_TEMPLATES).filter(k => k !== "general");
  for (const key of keys) {
    if (normalizedPrompt.includes(key) || normalizedStyle.includes(key)) {
      detectedGenre = key;
      break;
    }
  }

  // Edge cases/synonyms mapping
  if (detectedGenre === "general") {
    if (normalizedPrompt.includes("chill") || normalizedPrompt.includes("study") || normalizedPrompt.includes("relax")) {
      detectedGenre = "lofi";
    } else if (normalizedPrompt.includes("house") || normalizedPrompt.includes("techno") || normalizedPrompt.includes("dance") || normalizedPrompt.includes("club")) {
      detectedGenre = "edm";
    } else if (normalizedPrompt.includes("love") || normalizedPrompt.includes("heart")) {
      detectedGenre = "romantic";
    } else if (normalizedPrompt.includes("sad") || normalizedPrompt.includes("cry") || normalizedPrompt.includes("pain")) {
      detectedGenre = "sad";
    } else if (normalizedPrompt.includes("bhajan") || normalizedPrompt.includes("god") || normalizedPrompt.includes("krishna") || normalizedPrompt.includes("shiva")) {
      detectedGenre = "devotional";
    } else if (normalizedPrompt.includes("bhangra")) {
      detectedGenre = "punjabi";
    }
  }

  const template = GENRE_TEMPLATES[detectedGenre] || GENRE_TEMPLATES.general;
  const enhanced = `${template.prefix} ${userPrompt.trim()} ${template.suffix}`;

  return {
    enhancedPrompt: enhanced,
    detectedGenre
  };
}

module.exports = {
  enhancePrompt,
  GENRE_TEMPLATES
};

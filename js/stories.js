/**
 * Social Readers - Novel Stories & Episodic Management Module
 * Supports episodic series, weekly release schedules, user progress & bookmarking
 */

const DEFAULT_STORIES = [
  {
    id: "story_1",
    title: {
      en: "The Mystery of the Seven Doors",
      ta: "ஏழு கதவுகளின் மர்மம்"
    },
    author: {
      en: "Vikram Shenoy",
      ta: "விக்ரம் ஷெனாய்"
    },
    genre: "mystery",
    releaseDay: "Monday",
    isTrending: true,
    totalEpisodes: 30,
    currentEpisode: 18,
    rating: 4.9,
    reads: "142.5K",
    coverUrl: "assets/story-seven-doors.svg",
    description: {
      en: "Behind the ancient fortress lie seven sealed doors, each opening only once every millennium. When archaeologists uncover the third key, an unstoppable sequence of trials begins.",
      ta: "பண்டைய கோட்டையின் பின்னால் ஏழு மூடப்பட்ட கதவுகள் உள்ளன. மூன்றாவது சாவி கண்டறியப்பட்டதும் மர்மமான தொடர் நிகழ்வுகள் தொடங்குகின்றன."
    },
    episodes: [
      {
        id: "ep_1_1",
        episodeNumber: 1,
        title: { en: "The Unsealed Lock", ta: "திறக்கப்பட்ட பூட்டு" },
        releaseDate: "2026-05-04",
        readTime: 6,
        content: {
          en: "The heavy stone portal groaned as the dust of centuries cascaded down the moss-covered granite. Dr. Shenoy stepped forward, holding the bronze talisman firmly against the inscription. A faint blue luminescence spread through the carved runes...",
          ta: "பாசி படிந்த கருங்கல் சுவரில் இருந்த கனமான கதவு மெதுவாக அசைந்தது. டாக்டர் ஷெனாய் வெண்கல தாயத்தை கையில் ஏந்தியபடி முன்வந்தார்..."
        }
      },
      {
        id: "ep_1_18",
        episodeNumber: 18,
        title: { en: "The Chamber of Whispers", ta: "கிசுகிசுப்புகளின் அறை" },
        releaseDate: "2026-08-31",
        readTime: 8,
        content: {
          en: "The eighteenth chamber was eerily calm compared to the labyrinth of blades they had barely survived. Suspended in mid-air above a pool of mirrored mercury was the Fourth Seal, humming with electric anticipation...",
          ta: "பதினெட்டாவது அறை விசித்திரமான அமைதியில் மூழ்கியிருந்தது. பாதரச தடாகத்திற்கு மேலே மிதந்து கொண்டிருந்தது நான்காவது முத்திரை..."
        }
      }
    ]
  },
  {
    id: "story_2",
    title: {
      en: "The Lost Kingdom",
      ta: "மறைந்த பேரரசு"
    },
    author: {
      en: "Aadhira Rajesh",
      ta: "ஆதிரா ராஜேஷ்"
    },
    genre: "fantasy",
    releaseDay: "Tuesday",
    isTrending: false,
    totalEpisodes: 25,
    currentEpisode: 7,
    rating: 4.8,
    reads: "98.2K",
    coverUrl: "assets/story-lost-kingdom.svg",
    description: {
      en: "A forgotten realm hidden beneath the mystical twilight skies awaits the heir of the Starlight crest. An epic high-fantasy journey through celestial magic.",
      ta: "விண்மீன் மந்திர உலகத்தின் மறைக்கப்பட்ட பேரரசை மீட்டெடுக்க ஒரு இளவரசனின் வீரப் பயணம்."
    },
    episodes: [
      {
        id: "ep_2_7",
        episodeNumber: 7,
        title: { en: "The Starlight Beacon", ta: "விண்மீன் கலங்கரை விளக்கம்" },
        releaseDate: "2026-08-25",
        readTime: 7,
        content: {
          en: "The twin moons aligned over Mount Zephyr, casting a pale violet glow across the ancient ruins. Elian raised the crystal scepter as the Starlight Beacon flared to life...",
          ta: "இரட்டை நிலவுகள் மலையுச்சியில் ஒன்று சேர்ந்தபோது, பாழடைந்த பழங்கால அரண்மனையில் நீல நிற ஒளி சுடர்விட்டது..."
        }
      }
    ]
  },
  {
    id: "story_3",
    title: {
      en: "Whispers in the Shadows",
      ta: "நிழல்களின் கிசுகிசுப்பு"
    },
    author: {
      en: "Karthik Verma",
      ta: "கார்த்திக் வர்மா"
    },
    genre: "mystery",
    releaseDay: "Wednesday",
    isTrending: false,
    totalEpisodes: 20,
    currentEpisode: 5,
    rating: 4.7,
    reads: "76.4K",
    coverUrl: "assets/story-shadows.svg",
    description: {
      en: "A detective with the ability to hear lingering echoes of the past investigates a string of impossible disappearances at the Red Gate mansion.",
      ta: "கடந்த கால நிழல் ஒலிகளைக் கேட்கும் விசித்திரத் திறன் கொண்ட ஒரு துப்பறிவாளரின் விறுவிறுப்பான விசாரணை."
    },
    episodes: [
      {
        id: "ep_3_5",
        episodeNumber: 5,
        title: { en: "The Red Corridor", ta: "சிவப்பு தாழ்வாரம்" },
        releaseDate: "2026-08-26",
        readTime: 6,
        content: {
          en: "Every step in the Red Corridor sounded double. One step was real, and the other was an echo of a person who walked here fifty years ago...",
          ta: "சிவப்பு தாழ்வாரத்தில் எடுத்து வைக்கும் ஒவ்வொரு அடியும் இரட்டிப்பாக ஒலித்தது. ஐம்பது ஆண்டுகளுக்கு முன் நடந்த ஒருவரின் காலடி ஓசை..."
        }
      }
    ]
  },
  {
    id: "story_4",
    title: {
      en: "The House Without Memories",
      ta: "நினைவற்ற மாளிகை"
    },
    author: {
      en: "Meera Krishnan",
      ta: "மீரா கிருஷ்ணன்"
    },
    genre: "horror",
    releaseDay: "Thursday",
    isTrending: false,
    totalEpisodes: 18,
    currentEpisode: 3,
    rating: 4.9,
    reads: "112.0K",
    coverUrl: "assets/story-house-memories.svg",
    description: {
      en: "Anyone who enters the manor on the hill wakes up with their fondest memory erased, replaced by someone else's terrifying nightmares.",
      ta: "குன்றின் மீதிருக்கும் அந்த பழைய மாளிகைக்குள் நுழைபவர்கள் தங்களது இனிய நினைவுகளை மறந்து திகிலூட்டும் கனவுகளோடு விழிக்கிறார்கள்."
    },
    episodes: [
      {
        id: "ep_4_3",
        episodeNumber: 3,
        title: { en: "The Forgotten Photograph", ta: "மறக்கப்பட்ட புகைப்படம்" },
        releaseDate: "2026-08-27",
        readTime: 8,
        content: {
          en: "The grandfather clock chimed midnight. In the parlor, the dust-covered frame revealed a photograph of four people whose faces slowly blurred into mist...",
          ta: "நள்ளிரவு மணி ஒலித்தது. வரவேற்பறையில் இருந்த புகைப்படத்தில் இருந்த மனிதர்களின் முகங்கள் மெல்ல மெல்ல பனிமூட்டமாக மாறியது..."
        }
      }
    ]
  },
  {
    id: "story_5",
    title: {
      en: "When Hearts Find Home",
      ta: "இதயம் இணையும் வேளை"
    },
    author: {
      en: "Pooja Sundaram",
      ta: "பூஜா சுந்தரம்"
    },
    genre: "romance",
    releaseDay: "Friday",
    isTrending: false,
    totalEpisodes: 22,
    currentEpisode: 9,
    rating: 4.8,
    reads: "89.5K",
    coverUrl: "assets/story-hearts-home.svg",
    description: {
      en: "A scenic coastal love story between a traveling architect rebuilding old lighthouses and an oceanographer fighting to save the coral reefs.",
      ta: "கடற்கரை கலங்கரை விளக்கம் மற்றும் பவளப்பாறைகளை பாதுகாக்கும் இருவரின் நெஞ்சை தொடும் காதல் கதை."
    },
    episodes: [
      {
        id: "ep_5_9",
        episodeNumber: 9,
        title: { en: "Sunset by the Harbor", ta: "துறைமுகத்தில் ஒரு மாலை" },
        releaseDate: "2026-08-28",
        readTime: 5,
        content: {
          en: "The golden sun sank quietly below the horizon, painting the waves in shades of rose and amber. Tara looked up from her sketches as Arjun walked across the dock...",
          ta: "தங்க நிறச் சூரியன் மெதுவாக கடலுக்குள் மூழ்கியது. அலைகள் ரோஜா வண்ணத்தில் மின்னின..."
        }
      }
    ]
  },
  {
    id: "story_6",
    title: {
      en: "The Legend of Chola's Blade",
      ta: "சோழனின் வாள் காவியம்"
    },
    author: {
      en: "S. Ilango",
      ta: "எஸ். இளங்கோ"
    },
    genre: "historical",
    releaseDay: "Saturday",
    isTrending: false,
    totalEpisodes: 40,
    currentEpisode: 12,
    rating: 4.9,
    reads: "165.2K",
    coverUrl: "assets/story-chola-blade.svg",
    description: {
      en: "An epic historical drama following a young naval commander under the Imperial Chola fleet during the Bay of Bengal conquests.",
      ta: "சோழ பேரரசின் கடற்படைத் தளபதியின் வீர சாகசங்களையும் வரலாற்று வெற்றியையும் விவரிக்கும் பிரம்மாண்ட காவியம்."
    },
    episodes: []
  },
  {
    id: "story_7",
    title: {
      en: "Adventures of the Forest Gang",
      ta: "காட்டுச் சிறுவர்களின் சாகசங்கள்"
    },
    author: {
      en: "Nila Ram",
      ta: "நிலா ராம்"
    },
    genre: "kids",
    releaseDay: "Sunday",
    isTrending: false,
    totalEpisodes: 15,
    currentEpisode: 4,
    rating: 4.7,
    reads: "45.0K",
    coverUrl: "assets/story-kids-adventure.svg",
    description: {
      en: "Four curious village kids and their loyal pet dog discover a secret animal sanctuary with talking birds and friendly wild elephants.",
      ta: "நான்கு சுட்டிச் சிறுவர்களும் அவர்களுடைய செல்ல நாயும் காட்டில் உள்ள மர்ம விலங்கு உலகத்தைக் கண்டறியும் சுவாரஸ்யக் கதை."
    },
    episodes: []
  }
];

// Audio Stories Data matching Mockup
const AUDIO_STORIES = [
  {
    id: "audio_1",
    title: { en: "The Secret of the Ancient Library", ta: "பண்டைய நூலகத்தின் ரகசியம்" },
    seriesTitle: { en: "The Ancient Chronicles", ta: "பண்டைய காவியங்கள்" },
    episodeNumber: 12,
    durationText: "28 min",
    durationSec: 1680,
    currentTimeSec: 516, // 08:36
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "assets/audio-ancient-library.svg",
    narrator: "Karthik Kumar",
    isFeatured: true
  },
  {
    id: "audio_2",
    title: { en: "The Warrior's Oath", ta: "வீரனின் சபதம்" },
    seriesTitle: { en: "Tales of Valour", ta: "வீரக் கதைகள்" },
    episodeNumber: 4,
    durationText: "24 min",
    durationSec: 1440,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "assets/audio-warriors-oath.svg",
    narrator: "Radha Krishnan",
    isFeatured: false
  },
  {
    id: "audio_3",
    title: { en: "The Last Guardian", ta: "கடைசி பாதுகாவலன்" },
    seriesTitle: { en: "Mythic Realms", ta: "புராண உலகம்" },
    episodeNumber: 8,
    durationText: "31 min",
    durationSec: 1860,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverUrl: "assets/audio-last-guardian.svg",
    narrator: "Devanathan",
    isFeatured: false
  },
  {
    id: "audio_4",
    title: { en: "Beyond the Valley", ta: "பள்ளத்தாக்கிற்கு அப்பால்" },
    seriesTitle: { en: "Lost Horizon", ta: "தொலைந்த எல்லை" },
    episodeNumber: 6,
    durationText: "27 min",
    durationSec: 1620,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverUrl: "assets/audio-beyond-valley.svg",
    narrator: "Priya Sridhar",
    isFeatured: false
  }
];

window.SocialReadersStories = {
  // Get all stories from SocialReadersDB (Firestore) or fallback
  getAllStories() {
    if (window.SocialReadersDB && window.SocialReadersDB._cache && window.SocialReadersDB._cache.stories) {
      return window.SocialReadersDB._cache.stories;
    }
    return DEFAULT_STORIES;
  },

  async getAllStoriesAsync() {
    if (window.SocialReadersDB && window.SocialReadersDB.getStories) {
      return await window.SocialReadersDB.getStories();
    }
    return this.getAllStories();
  },

  getStoryById(id) {
    const stories = this.getAllStories();
    return stories.find(s => s.id === id) || DEFAULT_STORIES[0];
  },

  async getStoryByIdAsync(id) {
    if (window.SocialReadersDB && window.SocialReadersDB.getStoryById) {
      return await window.SocialReadersDB.getStoryById(id);
    }
    return this.getStoryById(id);
  },

  getTrendingStory() {
    const stories = this.getAllStories();
    return stories.find(s => s.isTrending) || stories[0];
  },

  getAudioStories() {
    return AUDIO_STORIES;
  },

  // Get user reading progress for a story
  getUserProgress(storyId) {
    try {
      const progressMap = JSON.parse(localStorage.getItem('sr_story_progress')) || {
        "story_1": { currentEp: 18, totalEp: 30, percent: 60, bookmarked: true },
        "story_2": { currentEp: 7, totalEp: 25, percent: 28, bookmarked: true },
        "story_3": { currentEp: 5, totalEp: 20, percent: 40, bookmarked: true },
        "story_4": { currentEp: 3, totalEp: 18, percent: 20, bookmarked: true },
        "story_5": { currentEp: 9, totalEp: 22, percent: 55, bookmarked: true }
      };
      return progressMap[storyId] || { currentEp: 1, totalEp: 10, percent: 0, bookmarked: false };
    } catch (e) {
      return { currentEp: 1, totalEp: 10, percent: 0, bookmarked: false };
    }
  },

  saveUserProgress(storyId, currentEp, totalEp, percent) {
    try {
      const progressMap = JSON.parse(localStorage.getItem('sr_story_progress')) || {};
      const prev = progressMap[storyId] || {};
      progressMap[storyId] = {
        ...prev,
        currentEp: currentEp,
        totalEp: totalEp || prev.totalEp || 20,
        percent: percent !== undefined ? percent : Math.round((currentEp / (totalEp || 20)) * 100),
        lastRead: new Date().toISOString()
      };
      localStorage.setItem('sr_story_progress', JSON.stringify(progressMap));
    } catch (e) {
      console.warn("Could not save progress:", e);
    }
  },

  toggleBookmark(storyId) {
    try {
      const progressMap = JSON.parse(localStorage.getItem('sr_story_progress')) || {};
      const prev = progressMap[storyId] || { currentEp: 1, totalEp: 20, percent: 0 };
      prev.bookmarked = !prev.bookmarked;
      progressMap[storyId] = prev;
      localStorage.setItem('sr_story_progress', JSON.stringify(progressMap));
      return prev.bookmarked;
    } catch (e) {
      return false;
    }
  },

  // Save story directly to Firestore
  async saveStory(storyData) {
    if (window.SocialReadersDB && window.SocialReadersDB.saveStory) {
      return await window.SocialReadersDB.saveStory(storyData);
    }
    return storyData;
  },

  // Add episode to series
  async addEpisode(storyId, episodeData) {
    const story = await this.getStoryByIdAsync(storyId);
    if (!story) return null;
    if (!story.episodes) story.episodes = [];
    episodeData.id = episodeData.id || `ep_${storyId}_${Date.now()}`;
    story.episodes.push(episodeData);
    story.currentEpisode = Math.max(story.currentEpisode || 1, episodeData.episodeNumber || story.episodes.length);
    if (story.currentEpisode > story.totalEpisodes) {
      story.totalEpisodes = story.currentEpisode;
    }
    await this.saveStory(story);
    return episodeData;
  },

  async deleteStory(storyId) {
    if (window.SocialReadersDB && window.SocialReadersDB.deleteStory) {
      return await window.SocialReadersDB.deleteStory(storyId);
    }
    return true;
  }
};

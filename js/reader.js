/**
 * Social Readers - In-Browser E-Book Sample Reader & Viewer
 * Kindle & Apple Books-like reading experience with themes, font scaling, bilingual toggle & chapter navigation
 */

window.SocialReadersReader = {
  currentBook: null,
  currentChapterIndex: 0,
  fontSize: 16,
  theme: 'cream', // 'cream', 'light', 'sepia', 'dark', 'black'
  fontFamily: 'font-serif', // 'font-serif', 'font-sans', 'font-mono'
  language: 'en',

  bookSamples: {
    b1: {
      title: { en: "Atomic Habits", ta: "அட்டாமிக் ஹாபிட்ஸ்" },
      author: { en: "James Clear", ta: "ஜேம்ஸ் க்ளியர்" },
      coverUrl: "assets/cover-atomic-habits.svg",
      chapters: [
        {
          title: { en: "The Science of Daily Progress: Small Steps, Massive Journeys", ta: "தினசரி முன்னேற்றத்தின் அறிவியல்: சிறு படிகள், பெரும் பயணங்கள்" },
          content: {
            en: `<h3>The Science of Daily Progress</h3>
<p>Every remarkable achievement begins with a conscious decision to improve just a little bit each day. When we focus on small, consistent actions rather than dramatic overnight transformations, the compounding effect over weeks and months creates lasting change.</p>
<p>True personal transformation does not depend on intense bursts of motivation. Rather, it is the quiet daily routines—reading ten pages, practicing a skill for fifteen minutes, or setting clear priorities—that build unbreakable discipline over time.</p>
<blockquote>"We are what we repeatedly do. Excellence, then, is not an act, but a habit."</blockquote>
<p>By aligning your daily actions with your core values and the positive impact you wish to make in your community, even the simplest habit takes on deep purpose and enduring strength.</p>`,
            ta: `<h3>தினசரி முன்னேற்றத்தின் அறிவியல்</h3>
<p>ஒவ்வொரு மகத்தான சாதனையும் ஒவ்வொரு நாளும் சிறிதளவு முன்னேற வேண்டும் என்ற உறுதியான முடிவிலிருந்தே தொடங்குகிறது. ஒரே இரவில் ஏற்படும் மாற்றத்தை விட, தொடர்ச்சியான சிறு முயற்சிகளே காலப்போக்கில் நீடித்த வெற்றியைத் தருகின்றன.</p>
<p>உண்மையான தனிநபர் மாற்றம் தற்காலிக உத்வேகத்தை மட்டும் சார்ந்தது அல்ல; தினமும் பத்து பக்கங்கள் வாசிப்பது, புதிய திறனைப் பயிற்சி செய்வது போன்ற எளிய பழக்கவழக்கங்களே நம்மை ஆற்றல்மிக்கவர்களாக உருவாக்குகின்றன.</p>
<blockquote>"தொடர்ச்சியான நற்செயல்களே சிறந்த குணநலன்களாகவும் வெற்றியாகவும் மாறுகின்றன."</blockquote>
<p>நமது அன்றாடச் செயல்களை நல்நோக்கத்தோடும் சமூக நலனோடும் இணைக்கும் போது, ஒவ்வொரு சிறிய பழக்கமும் பெருமைமிக்க இலக்கை நோக்கி நம்மை வழிநடத்துகிறது.</p>`
          }
        },
        {
          title: { en: "Designing Your Learning Environment", ta: "கற்றலுக்கான சூழலை உருவாக்குதல்" },
          content: {
            en: `<h3>Creating Space for Growth</h3>
<p>Your environment shapes your focus far more than sheer willpower. When you keep inspiring books within reach, reduce digital distractions, and surround yourself with positive learning cues, staying disciplined becomes natural and effortless.</p>
<p>Every book acquired through Social Readers not only enriches your mind but directly funds learning materials and sports gear for rural students across Tamil Nadu.</p>`,
            ta: `<h3>வளர்ச்சிக்கான சூழல்</h3>
<p>நமது சூழலே நமது கவனத்தை பெரிதும் தீர்மானிக்கிறது. புத்தகங்களை எப்போதும் அணுகக்கூடிய இடத்தில் வைப்பதும், கவனச்சிதறல்களைக் குறைப்பதும் இயல்பான வாசிப்புப் பழக்கத்தை வளர்க்கும்.</p>
<p>சோஷியல் ரீடர்ஸ் மூலம் நீங்கள் கற்கும் ஒவ்வொரு பாடமும் கிராமப்புற மாணவர்களின் கல்வி மற்றும் விளையாட்டுத் தேவைகளுக்கு நேரடி ஆதரவாக மாறுகிறது.</p>`
          }
        }
      ]
    },
    b2: {
      title: { en: "The Power of Mindset", ta: "மைண்ட்செட் ஆற்றல்" },
      author: { en: "Carol S. Dweck", ta: "கரோல் எஸ். டுவெக்" },
      coverUrl: "assets/cover-mindset.svg",
      chapters: [
        {
          title: { en: "Mindset and Resilience: Unlocking Hidden Potential", ta: "மனோதிடமும் மீள்தன்மையும்: திறன்களை வெளிக்கொணர்தல்" },
          content: {
            en: `<h3>Embracing the Learning Journey</h3>
<p>Talent and intelligence are not fixed qualities set at birth; they are seeds that flourish with dedicated effort, guidance, and continuous practice. Embracing challenges as opportunities to learn transforms setbacks into stepping stones.</p>
<p>When you adopt a mindset committed to learning, mistakes cease to be failures and instead become valuable feedback guiding your path to mastery.</p>`,
            ta: `<h3>கற்றல் பயணத்தை அரவணைப்போம்</h3>
<p>திறமையும் அறிவாற்றலும் பிறப்பிலேயே முற்றுப்பெற்றவை அல்ல; தொடர் உழைப்பு மற்றும் சரியான வழிகாட்டுதல் மூலம் எவராலும் புதிய உச்சங்களைத் தொட முடியும்.</p>
<p>தவறுகளைத் தோல்விகளாகப் பார்க்காமல், அவை முன்னேற்றத்திற்கான படிப்பினைகள் என்பதை உணர்வதே வளர்ச்சி மனநிலையின் அடிப்படையாகும்.</p>`
          }
        }
      ]
    },
    b3: {
      title: { en: "You Can Win", ta: "யு கேன் வின்" },
      author: { en: "Shiv Khera", ta: "ஷிவ் கேரா" },
      coverUrl: "assets/cover-you-can-win.svg",
      chapters: [
        {
          title: { en: "The Architecture of Victory: Purpose-Driven Habits", ta: "வெற்றியின் கட்டமைப்பு: குறிக்கோள் சார்ந்த பழக்கங்கள்" },
          content: {
            en: `<h3>Building Character for Success</h3>
<p>True success is built upon the foundation of positive attitude, unwavering integrity, and sincere service to others. Those who achieve enduring greatness focus on doing ordinary tasks with extraordinary dedication.</p>
<p>Your enthusiasm and ethical commitment serve as catalysts that uplift everyone around you.</p>`,
            ta: `<h3>வெற்றிக்கான நற்குணங்கள்</h3>
<p>உண்மையான வெற்றி என்பது நேர்மறை அணுகுமுறை, நேர்மை மற்றும் பிறருக்கு உதவும் மனப்பான்மை ஆகியவற்றின் மீதே கட்டமைக்கப்படுகிறது.</p>
<p>எளிய பணிகளையும் முழு அர்ப்பணிப்புடன் செய்பவர்களே நீடித்த வெற்றியை அடைகிறார்கள்.</p>`
          }
        }
      ]
    },
    b4: {
      title: { en: "Rich Dad Poor Dad", ta: "ரிச் டாட் புவர் டாட்" },
      author: { en: "Robert Kiyosaki", ta: "ராபர்ட் கியோசாகி" },
      coverUrl: "assets/cover-rich-dad.svg",
      chapters: [
        {
          title: { en: "Financial Literacy: Creating Value and Economic Freedom", ta: "நிதி அறிவு மற்றும் சுதந்திரம்: மதிப்பை உருவாக்குதல்" },
          content: {
            en: `<h3>Understanding Economic Empowerment</h3>
<p>Financial education is about understanding how to build value, practice thoughtful budgeting, and invest in knowledge that creates self-reliance and community wealth.</p>
<p>True wealth is measured not merely by accumulation, but by the positive opportunities you can create for your family and society.</p>`,
            ta: `<h3>பொருளாதார விழிப்புணர்வு</h3>
<p>நிதிசார் கல்வி என்பது பணத்தின் மதிப்பை உணர்வது, விவேகமான சேமிப்பு மற்றும் தற்சார்பை உருவாக்கும் அறிவில் முதலீடு செய்வதாகும்.</p>
<p>உண்மையான செல்வம் என்பது பிறருக்கு வழிகாட்டி சமூக மேம்பாட்டிற்கு வழிவகுக்கும் வாய்ப்புகளிலேயே உள்ளது.</p>`
          }
        }
      ]
    },
    b5: {
      title: { en: "Wings of Fire", ta: "அக்னி சிறகுகள்" },
      author: { en: "Dr. A.P.J. Abdul Kalam", ta: "டாக்டர் ஏ.பி.ஜே. அப்துல் கலாம்" },
      coverUrl: "assets/cover-wings-of-fire.svg",
      chapters: [
        {
          title: { en: "Ignited Minds: Learning, Discovery and Nation Building", ta: "எழுச்சிமிக்க சிந்தனைகள்: கற்றல் மற்றும் தேசக் கட்டமைப்பு" },
          content: {
            en: `<h3>Dreams and Dedication</h3>
<p>Every young mind holds immense potential to transform our nation through knowledge, science, and compassionate action. When guided by visionary teachers and inspired by righteous values, youth become unstoppable forces for good.</p>
<p>Courage is not the absence of difficulty, but the determination to persevere and serve the welfare of all people.</p>`,
            ta: `<h3>கனவுகளும் அர்ப்பணிப்பும்</h3>
<p>ஒவ்வொரு இளைஞரின் சிந்தனையிலும் தேசத்தை உயர்த்தும் மகத்தான ஆற்றல் நிறைந்துள்ளது. அறிவும், அறநெறியும், உழைப்பும் இணையும் போது சாதனைகள் சாத்தியமாகின்றன.</p>
<p>விடாமுயற்சியோடு கற்கும் அறிவே சமூக முன்னேற்றத்திற்கான உண்மையான வழிகாட்டியாகும்.</p>`
          }
        }
      ]
    },
    b6: {
      title: { en: "Ikigai: The Japanese Secret", ta: "இக்கிகாய்" },
      author: { en: "Héctor García & F. Miralles", ta: "ஹெக்டர் கார்சியா" },
      coverUrl: "assets/cover-ikigai.svg",
      chapters: [
        {
          title: { en: "Finding Purpose: Meaningful Living and Well-Being", ta: "வாழ்வின் உன்னத நோக்கம்: நல்வாழ்வும் அர்த்தமுள்ள வாழ்க்கையும்" },
          content: {
            en: `<h3>Harmony and Daily Purpose</h3>
<p>Living a long and fulfilling life blossoms from finding harmony in what you love doing, what brings value to others, and staying connected with nature and community.</p>
<p>When you greet each sunrise with clear intention and kindness, daily life becomes a source of continuous peace and vitality.</p>`,
            ta: `<h3>அமைதியும் வாழ்வின் நோக்கமும்</h3>
<p>நாம் நேசிக்கும் செயல்கள், பிறருக்குப் பயன்படும் நற்பணிகள் மற்றும் சமூக நல்லிணக்கம் ஆகியவற்றில் சமநிலையைக் காண்பதே நிறைவான வாழ்வின் ரகசியமாகும்.</p>
<p>ஒவ்வொரு நாளையும் தெளிவான நோக்கத்துடனும் அன்போடும் தொடங்குவது மன அமைதியைத் தருகிறது.</p>`
          }
        }
      ]
    },
    b7: {
      title: { en: "Deep Work", ta: "டீப் ஒர்க்" },
      author: { en: "Cal Newport", ta: "கால் நியூபோர்ட்" },
      coverUrl: "assets/cover-deep-work.svg",
      chapters: [
        {
          title: { en: "The Art of Deep Focus: Mastering Distraction-Free Work", ta: "ஆழ்ந்த கவனக் கலை: கவனச்சிதறலற்ற பணிகளை மேற்கொள்ளுதல்" },
          content: {
            en: `<h3>Cultivating Unbroken Attention</h3>
<p>In an era overflowing with notifications and noise, the capacity to focus deeply on complex and meaningful tasks has become an invaluable superpower.</p>
<p>Protecting dedicated blocks of time for focused thought allows you to produce work of exceptional quality and craftsmanship.</p>`,
            ta: `<h3>ஆழ்ந்த கவனத்தை வளர்த்தல்</h3>
<p>கவனச்சிதறல்கள் நிறைந்த இந்த நவீன உலகில், அமைதியாக ஒரு பணியில் முழு கவனத்தையும் செலுத்தும் திறன் மிக முக்கியமான ஆற்றலாகும்.</p>
<p>தொடர்ச்சியான கவனத்துடன் செயல்படும் போது மட்டுமே உயர்தரமான படைப்புகளையும் சாதனைகளையும் உருவாக்க முடியும்.</p>`
          }
        }
      ]
    },
    b8: {
      title: { en: "The Psychology of Money", ta: "தி சைக்காலஜி ஆஃப் மணி" },
      author: { en: "Morgan Housel", ta: "மோர்கன் ஹவுசல்" },
      coverUrl: "assets/cover-psychology-money.svg",
      chapters: [
        {
          title: { en: "Understanding Wealth: Prudence, Patience and Impact", ta: "செல்வத்தின் தத்துவம்: விவேகம், பொறுமை மற்றும் சமூகப் பங்களிப்பு" },
          content: {
            en: `<h3>Patience and Perspective</h3>
<p>True financial wisdom lies in cultivating humility, patience, and recognizing that wealth is a tool for freedom and philanthropy, not ostentation.</p>
<p>Making thoughtful choices today creates enduring security for tomorrow and empowers us to uplift the next generation.</p>`,
            ta: `<h3>பொறுமையும் தொலைநோக்குப் பார்வையும்</h3>
<p>பொருளாதார விவேகம் என்பது பொறுமையையும், அடக்கத்தையும், செல்வத்தை சமூக நலனுக்கான ஒரு கருவியாகப் பயன்படுத்துவதையும் சார்ந்துள்ளது.</p>
<p>இன்றைய சிந்தித்துச் செயல்படும் முடிவுகள் நாளைய பாதுகாப்பிற்கும், அடுத்த தலைமுறையை உயர்த்தும் சேவைக்கும் அடித்தளமாக அமைகின்றன.</p>`
          }
        }
      ]
    }
  },

  openReader(bookId, chapterIndex = 0) {
    const bookData = this.bookSamples[bookId] || this.bookSamples['b1'];
    this.currentBook = { ...bookData, id: bookId };
    this.currentChapterIndex = chapterIndex;
    this.language = window.getLanguage ? window.getLanguage() : 'en';

    this.renderModal();
    this.updateReaderContent();
  },

  renderModal() {
    let readerContainer = document.getElementById('sr-reader-modal');
    if (!readerContainer) {
      readerContainer = document.createElement('div');
      readerContainer.id = 'sr-reader-modal';
      readerContainer.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-between hidden transition-all duration-300';
      document.body.appendChild(readerContainer);
    }

    readerContainer.innerHTML = `
      <!-- TOP TOOLBAR -->
      <header id="reader-header" class="bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between flex-shrink-0 z-10 transition-colors shadow-sm">
        
        <!-- Left: Back & Title -->
        <div class="flex items-center gap-2 sm:gap-4 min-w-0">
          <button id="reader-close-btn" class="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 active:scale-95 text-navy transition-all" title="Close Reader">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div class="min-w-0">
            <h3 id="reader-book-title" class="font-extrabold text-navy text-xs sm:text-base truncate">Atomic Habits</h3>
            <p id="reader-chapter-title" class="text-[10px] sm:text-xs text-gray-500 truncate">Chapter 1</p>
          </div>
        </div>

        <!-- Right: Actions & Settings -->
        <div class="flex items-center gap-1.5 sm:gap-3">
          
          <!-- Bilingual Switcher in Reader -->
          <button id="reader-lang-btn" class="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full border border-navy text-navy font-bold text-[10px] sm:text-xs hover:bg-navy hover:text-white transition-all shadow-xs">
            ${this.language === 'ta' ? 'தமிழ்' : 'English'}
          </button>

          <!-- Appearance Settings Toggle -->
          <button id="reader-settings-btn" class="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-700 active:scale-95" title="Reading Settings">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          </button>

          <!-- Buy CTA Button inside Reader -->
          <button id="reader-buy-btn" class="px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full bg-forest text-white font-bold text-xs sm:text-sm hover:bg-green-800 shadow-md active:scale-95 transition-all flex items-center gap-1">
            <span>Buy ₹149</span>
          </button>

        </div>

      </header>

      <!-- APPEARANCE SETTINGS DRAWER (Popdown) -->
      <div id="reader-settings-panel" class="hidden absolute top-14 sm:top-16 right-3 sm:right-6 z-20 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 space-y-4 animate-scaleUp">
        
        <!-- Font Size -->
        <div>
          <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Font Size</label>
          <div class="flex items-center justify-between bg-gray-100 rounded-xl p-1">
            <button id="font-decrease" class="px-3 py-1 font-bold text-navy hover:bg-white rounded-lg transition-colors">A-</button>
            <span id="font-size-label" class="text-xs font-mono font-bold text-navy">16px</span>
            <button id="font-increase" class="px-3 py-1 font-bold text-navy hover:bg-white rounded-lg transition-colors">A+</button>
          </div>
        </div>

        <!-- Theme Color -->
        <div>
          <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Theme</label>
          <div class="grid grid-cols-4 gap-2">
            <button class="theme-btn p-2 rounded-xl border-2 border-transparent bg-[#FAF7F2] text-gray-900 text-xs font-bold shadow-xs hover:scale-105" data-theme="cream">Cream</button>
            <button class="theme-btn p-2 rounded-xl border-2 border-transparent bg-white text-gray-900 text-xs font-bold shadow-xs hover:scale-105" data-theme="light">Light</button>
            <button class="theme-btn p-2 rounded-xl border-2 border-transparent bg-[#F4ECD8] text-[#5B4636] text-xs font-bold shadow-xs hover:scale-105" data-theme="sepia">Sepia</button>
            <button class="theme-btn p-2 rounded-xl border-2 border-transparent bg-[#1A1A1A] text-gray-100 text-xs font-bold shadow-xs hover:scale-105" data-theme="dark">Dark</button>
          </div>
        </div>

        <!-- Font Family -->
        <div>
          <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Typography</label>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <button class="font-family-btn py-1.5 px-2 rounded-lg border border-gray-200 font-serif" data-font="font-serif">Serif</button>
            <button class="font-family-btn py-1.5 px-2 rounded-lg border border-gray-200 font-sans" data-font="font-sans">Sans</button>
            <button class="font-family-btn py-1.5 px-2 rounded-lg border border-gray-200 font-mono" data-font="font-mono">Mono</button>
          </div>
        </div>

      </div>

      <!-- MAIN READING CANVAS -->
      <main id="reader-canvas" class="flex-grow overflow-y-auto px-4 sm:px-8 py-6 sm:py-10 transition-colors flex justify-center bg-[#FAF7F2]">
        <div class="max-w-2xl w-full">
          
          <!-- Sample Banner Notice -->
          <div class="mb-6 p-3 rounded-2xl bg-orange-100/70 border border-orange-200 flex items-center justify-between text-xs text-brandOrange">
            <div class="flex items-center gap-2">
              <span class="font-bold">📖 Free Sample Edition</span>
              <span class="hidden sm:inline">• Read the opening chapters</span>
            </div>
            <span class="font-bold">25% of purchase goes to cause</span>
          </div>

          <!-- Reader Book Content -->
          <article id="reader-article" class="prose max-w-none text-gray-800 leading-relaxed space-y-4 select-text">
            <!-- Injected dynamically -->
          </article>

          <!-- End of sample callout -->
          <div class="mt-12 p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-green-50 border border-green-200 text-center space-y-3 shadow-sm">
            <div class="w-12 h-12 rounded-full bg-forest text-white flex items-center justify-center mx-auto text-xl shadow-md">✨</div>
            <h4 class="font-extrabold text-navy text-base sm:text-lg">Enjoying this Sample?</h4>
            <p class="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Get instant lifetime access to the full e-book and audiobook. 25% of your purchase directly sponsors textbooks and sports gear for rural students.
            </p>
            <button id="reader-bottom-buy-btn" class="mt-2 px-6 py-3 rounded-full bg-forest text-white font-bold text-sm hover:bg-green-800 active:scale-95 shadow-md transition-all">
              Unlock Full E-Book (₹149)
            </button>
          </div>

        </div>
      </main>

      <!-- BOTTOM READING CONTROLS -->
      <footer id="reader-footer" class="bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0 z-10 transition-colors shadow-lg">
        
        <!-- Prev Chapter -->
        <button id="reader-prev-chapter" class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold text-navy flex items-center gap-1 active:scale-95 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          <span class="hidden sm:inline">Previous</span>
        </button>

        <!-- Chapter Progress Indicator -->
        <div class="flex items-center gap-2 text-xs font-semibold text-gray-600">
          <span id="reader-progress-label">Chapter 1 of 2</span>
        </div>

        <!-- Next Chapter -->
        <button id="reader-next-chapter" class="px-3 py-1.5 rounded-xl bg-navy text-white hover:bg-blue-900 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all">
          <span class="hidden sm:inline">Next</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>

      </footer>
    `;

    this.bindEvents();
    readerContainer.classList.remove('hidden');
  },

  bindEvents() {
    const modal = document.getElementById('sr-reader-modal');
    const closeBtn = document.getElementById('reader-close-btn');
    const settingsBtn = document.getElementById('reader-settings-btn');
    const settingsPanel = document.getElementById('reader-settings-panel');
    const langBtn = document.getElementById('reader-lang-btn');
    const prevBtn = document.getElementById('reader-prev-chapter');
    const nextBtn = document.getElementById('reader-next-chapter');
    const buyBtn = document.getElementById('reader-buy-btn');
    const bottomBuyBtn = document.getElementById('reader-bottom-buy-btn');
    const fontInc = document.getElementById('font-increase');
    const fontDec = document.getElementById('font-decrease');

    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    settingsBtn.addEventListener('click', () => {
      settingsPanel.classList.toggle('hidden');
    });

    langBtn.addEventListener('click', () => {
      this.language = this.language === 'ta' ? 'en' : 'ta';
      langBtn.textContent = this.language === 'ta' ? 'தமிழ்' : 'English';
      this.updateReaderContent();
    });

    prevBtn.addEventListener('click', () => {
      if (this.currentChapterIndex > 0) {
        this.currentChapterIndex--;
        this.updateReaderContent();
        document.getElementById('reader-canvas').scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    nextBtn.addEventListener('click', () => {
      const max = this.currentBook.chapters.length - 1;
      if (this.currentChapterIndex < max) {
        this.currentChapterIndex++;
        this.updateReaderContent();
        document.getElementById('reader-canvas').scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    const triggerBuy = () => {
      modal.classList.add('hidden');
      if (window.SocialReadersCheckout) {
        window.SocialReadersCheckout.openCheckout(this.currentBook.id, 'ebook');
      }
    };

    buyBtn.addEventListener('click', triggerBuy);
    bottomBuyBtn.addEventListener('click', triggerBuy);

    // Font size controls
    fontInc.addEventListener('click', () => {
      this.fontSize = Math.min(26, this.fontSize + 2);
      this.applyTypography();
    });

    fontDec.addEventListener('click', () => {
      this.fontSize = Math.max(12, this.fontSize - 2);
      this.applyTypography();
    });

    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.theme = btn.getAttribute('data-theme');
        this.applyTheme();
      });
    });

    // Font family buttons
    document.querySelectorAll('.font-family-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.fontFamily = btn.getAttribute('data-font');
        this.applyTypography();
      });
    });
  },

  updateReaderContent() {
    const book = this.currentBook;
    const chIndex = this.currentChapterIndex;
    const chapter = book.chapters[chIndex] || book.chapters[0];
    const totalChapters = book.chapters.length;

    const title = typeof book.title === 'object' ? (this.language === 'ta' ? book.title.ta : book.title.en) : book.title;
    const chTitle = typeof chapter.title === 'object' ? (this.language === 'ta' ? chapter.title.ta : chapter.title.en) : chapter.title;
    const content = typeof chapter.content === 'object' ? (this.language === 'ta' ? chapter.content.ta : chapter.content.en) : chapter.content;

    document.getElementById('reader-book-title').textContent = title;
    document.getElementById('reader-chapter-title').textContent = chTitle;
    document.getElementById('reader-progress-label').textContent = `Chapter ${chIndex + 1} of ${totalChapters}`;
    document.getElementById('reader-article').innerHTML = content;

    // Button states
    const prevBtn = document.getElementById('reader-prev-chapter');
    const nextBtn = document.getElementById('reader-next-chapter');
    prevBtn.disabled = chIndex === 0;
    prevBtn.classList.toggle('opacity-50', chIndex === 0);
    nextBtn.disabled = chIndex === totalChapters - 1;
    nextBtn.classList.toggle('opacity-50', chIndex === totalChapters - 1);

    this.applyTheme();
    this.applyTypography();
  },

  applyTheme() {
    const canvas = document.getElementById('reader-canvas');
    const header = document.getElementById('reader-header');
    const footer = document.getElementById('reader-footer');
    const article = document.getElementById('reader-article');
    const title = document.getElementById('reader-book-title');

    // Reset base colors
    canvas.className = 'flex-grow overflow-y-auto px-4 sm:px-8 py-6 sm:py-10 transition-colors flex justify-center';

    if (this.theme === 'cream') {
      canvas.classList.add('bg-[#FAF7F2]');
      article.className = 'prose max-w-none text-gray-800 leading-relaxed space-y-4';
      header.className = 'bg-white/95 backdrop-blur-md border-b border-gray-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between flex-shrink-0 z-10 text-gray-800 shadow-sm';
      footer.className = 'bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0 z-10 text-gray-800 shadow-lg';
      title.className = 'font-extrabold text-navy text-xs sm:text-base truncate';
    } else if (this.theme === 'light') {
      canvas.classList.add('bg-white');
      article.className = 'prose max-w-none text-gray-900 leading-relaxed space-y-4';
      header.className = 'bg-white border-b border-gray-200 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between flex-shrink-0 z-10 text-gray-900 shadow-sm';
      footer.className = 'bg-white border-t border-gray-200 px-3 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0 z-10 text-gray-900 shadow-lg';
      title.className = 'font-extrabold text-gray-900 text-xs sm:text-base truncate';
    } else if (this.theme === 'sepia') {
      canvas.classList.add('bg-[#F4ECD8]');
      article.className = 'prose max-w-none text-[#5B4636] leading-relaxed space-y-4';
      header.className = 'bg-[#EAE0C8] border-b border-[#D8CEB6] px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between flex-shrink-0 z-10 text-[#5B4636] shadow-sm';
      footer.className = 'bg-[#EAE0C8] border-t border-[#D8CEB6] px-3 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0 z-10 text-[#5B4636] shadow-lg';
      title.className = 'font-extrabold text-[#5B4636] text-xs sm:text-base truncate';
    } else if (this.theme === 'dark') {
      canvas.classList.add('bg-[#18181B]');
      article.className = 'prose max-w-none text-gray-200 leading-relaxed space-y-4';
      header.className = 'bg-[#27272A] border-b border-[#3F3F46] px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between flex-shrink-0 z-10 text-white shadow-sm';
      footer.className = 'bg-[#27272A] border-t border-[#3F3F46] px-3 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0 z-10 text-white shadow-lg';
      title.className = 'font-extrabold text-white text-xs sm:text-base truncate';
    }
  },

  applyTypography() {
    const article = document.getElementById('reader-article');
    const label = document.getElementById('font-size-label');
    if (label) label.textContent = `${this.fontSize}px`;
    if (article) {
      article.style.fontSize = `${this.fontSize}px`;
      article.classList.remove('font-serif', 'font-sans', 'font-mono');
      article.classList.add(this.fontFamily);
    }
  }
};

// Global click delegation for [data-read-sample] and [data-read-book]
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-read-sample], [data-read-book], .read-sample-btn, .read-online-btn');
    if (target) {
      e.preventDefault();
      const bookId = target.getAttribute('data-book-id') || 'b1';
      window.SocialReadersReader.openReader(bookId);
    }
  });
});

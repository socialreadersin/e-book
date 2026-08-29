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
          title: { en: "The Fundamentals: Why Tiny Changes Make a Big Difference", ta: "அடிப்படை விதிகள்: சிறு மாற்றங்கள் எவ்வாறு பெரும் விளைவுகளைத் தரும்" },
          content: {
            en: `<h3>The Surprising Power of Atomic Habits</h3>
<p>The fate of British Cycling changed one day in 2003. The organization, which was the governing body for professional cycling in Great Britain, had recently hired Dave Brailsford as its new performance director. At the time, professional cyclists in Great Britain had endured nearly one hundred years of mediocrity.</p>
<p>Since 1908, British riders had won just a single gold medal at the Olympic Games, and they had fared even worse in cycling’s biggest race, the Tour de France. In 110 years, no British cyclist had ever won the event. In fact, the performance of British riders had been so underwhelming that one of the top bike manufacturers in Europe refused to sell bikes to the team because they were afraid that it would hurt sales if other professionals saw the Brits using their gear.</p>
<p>Brailsford had been hired to put British Cycling on a new trajectory. What made him different from previous coaches was his relentless commitment to a strategy that he referred to as "the aggregation of marginal gains," which was the philosophy of searching for a tiny margin of improvement in everything you do.</p>
<blockquote>"The whole principle came from the idea that if you broke down everything you could think of that goes into riding a bike, and then improve it by 1 percent, you will get a significant increase when you put them all together."</blockquote>
<p>They redesigned the bike seats to make them more comfortable and rubbed alcohol on the tires for a better grip. They asked riders to wear electrically heated overshorts to maintain ideal muscle temperature while riding and used biofeedback sensors to monitor how each athlete responded to a particular workout. The team tested various fabrics in a wind tunnel and had their outdoor riders switch to indoor racing suits, which proved to be lighter and more aerodynamic.</p>
<p>Just five years after Brailsford took over, the British Cycling team dominated the road and track cycling events at the 2008 Olympic Games in Beijing, where they won an astounding 60 percent of the gold medals available.</p>
<h4>Why Small Habits Make a Big Difference</h4>
<p>It is so easy to overestimate the importance of one defining moment and underestimate the value of making small improvements on a daily basis. Too often, we convince ourselves that massive success requires massive action. Whether it is losing weight, building a business, writing a book, winning a championship, or achieving any other goal, we put pressure on ourselves to make some earth-shattering improvement that everyone will talk about.</p>
<p>Meanwhile, improving by 1 percent isn’t particularly notable—sometimes it isn’t even noticeable—but it can be far more meaningful, especially in the long run. The difference a tiny improvement can make over time is astounding. Here’s how the math works out: if you can get 1 percent better each day for one year, you’ll end up thirty-seven times better by the time you’re done.</p>`,
            ta: `<h3>அட்டாமிக் ஹாபிட்ஸின் ஆச்சரியமூட்டும் ஆற்றல்</h3>
<p>2003 ஆம் ஆண்டில் ஒரு நாள் பிரிட்டிஷ் சைக்கிள் ஓட்டுதல் அணியின் தலைவிதி மாறியது. கிரேட் பிரிட்டனின் தொழில்முறை சைக்கிள் ஓட்டுதலுக்கான நிர்வாகக் குழு, டேவ் பிரெயில்ஸ்போர்டை அதன் புதிய செயல்திறன் இயக்குநராக நியமித்தது. அந்த நேரத்தில், பிரிட்டிஷ் சைக்கிள் ஓட்டுநர்கள் கிட்டத்தட்ட நூறு ஆண்டுகளாக வெற்றிகளைப் பெறாமல் தவித்து வந்தனர்.</p>
<p>1908 முதல், பிரிட்டிஷ் வீரர்கள் ஒலிம்பிக் போட்டிகளில் ஒரே ஒரு தங்கப் பதக்கத்தை மட்டுமே வென்றிருந்தனர். உலகின் மிகப்பெரிய சைக்கிள் பந்தயமான டூர் டி பிரான்சில் அவர்கள் இன்னும் மோசமான நிலையை அடைந்திருந்தனர். 110 ஆண்டுகளில், எந்த ஒரு பிரிட்டிஷ் வீரரும் அந்தப் போட்டியை வென்றதில்லை.</p>
<p>பிரெயில்ஸ்போர்ட் ஒரு புதிய உத்தியைக் கொண்டு வந்தார். அவர் அதனை "விளிம்புநிலை ஆதாயங்களின் திரட்சி" (Aggregation of marginal gains) என்று அழைத்தார். அதாவது, நீங்கள் செய்யும் ஒவ்வொரு செயலிலும் 1 சதவீதம் முன்னேற்றத்தைக் கண்டுபிடிக்கும் தத்துவம் அதுவாகும்.</p>
<blockquote>"சைக்கிள் ஓட்டுவதில் உள்ள ஒவ்வொரு சிறிய அம்சத்தையும் பிரித்து, ஒவ்வொன்றிலும் வெறும் 1 சதவீதம் முன்னேற்றம் அடைந்தால், அவை அனைத்தும் இணையும் போது மிகப்பெரிய வெற்றியாக மாறும்."</blockquote>
<p>பிரெயில்ஸ்போர்ட் பொறுப்பேற்ற ஐந்தே ஆண்டுகளில், 2008 பெய்ஜிங் ஒலிம்பிக் போட்டிகளில் பிரிட்டிஷ் சைக்கிள் ஓட்டுதல் அணி மொத்தமுள்ள தங்கப் பதக்கங்களில் 60 சதவீதத்தைக் கைப்பற்றி சாதனை படைத்தது!</p>
<h4>சிறிய பழக்கங்கள் ஏன் பெரும் மாற்றங்களை உருவாக்குகின்றன?</h4>
<p>பெரும்பாலும் நாம் பிரம்மாண்டமான வெற்றிக்கு பிரம்மாண்டமான நடவடிக்கைகள் தேவை என்று நம்மை நாமே நம்ப வைக்கிறோம். ஆனால் தினமும் வெறும் 1% நம்மை மேம்படுத்திக் கொண்டால், ஒரு வருட முடிவில் நாம் 37 மடங்கு சிறந்த மனிதராக மாறியிருப்போம்.</p>`
          }
        },
        {
          title: { en: "The 4 Laws of Behavior Change", ta: "பழக்க மாற்றத்திற்கான 4 முக்கிய விதிகள்" },
          content: {
            en: `<h3>How to Build Good Habits in 4 Simple Steps</h3>
<p>In this book, we will look at how the four stages of habit formation—cue, craving, response, and reward—influence everything we do each day. The framework I offer is an integrated model of the cognitive and behavioral sciences.</p>
<ol>
  <li><strong>1st Law (Cue):</strong> Make it Obvious. Design your environment so cues of good habits are visible.</li>
  <li><strong>2nd Law (Craving):</strong> Make it Attractive. Pair an action you want to do with an action you need to do.</li>
  <li><strong>3rd Law (Response):</strong> Make it Easy. Reduce friction and decrease the number of steps between you and your good habits.</li>
  <li><strong>4th Law (Reward):</strong> Make it Satisfying. Give yourself an immediate reward when you complete your habit.</li>
</ol>
<p>Whenever you want to change your behavior, simply ask yourself:</p>
<ul>
  <li>How can I make it obvious?</li>
  <li>How can I make it attractive?</li>
  <li>How can I make it easy?</li>
  <li>How can I make it satisfying?</li>
</ul>`,
            ta: `<h3>4 எளிய படிகளில் நல்ல பழக்கங்களை உருவாக்குதல்</h3>
<p>பழக்கங்கள் உருவாவதில் நான்கு நிலைகள் உள்ளன: குறிப்பு (Cue), ஏக்கம் (Craving), செயல் (Response), மற்றும் வெகுமதி (Reward).</p>
<ol>
  <li><strong>முதல் விதி (குறிப்பு):</strong> அதை வெளிப்படையானதாக ஆக்குங்கள். நல்ல பழக்கங்களுக்கான சூழலை உங்கள் கண்முன்னே வையுங்கள்.</li>
  <li><strong>இரண்டாம் விதி (ஏக்கம்):</strong> அதை கவர்ச்சிகரமானதாக ஆக்குங்கள்.</li>
  <li><strong>மூன்றாம் விதி (செயல்):</strong> அதை எளிதானதாக ஆக்குங்கள். செயலுக்கான தடைகளைக் குறையுங்கள்.</li>
  <li><strong>நான்காம் விதி (வெகுமதி):</strong> அதை மனநிறைவு தருவதாக ஆக்குங்கள். உடனடி பரிசுகளை உணருங்கள்.</li>
</ol>`
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
          title: { en: "The Two Mindsets: Fixed vs. Growth", ta: "இரண்டு மனநிலைகள்: நிலையான மனநிலை vs வளர்ச்சி மனநிலை" },
          content: {
            en: `<h3>Why Do People Differ?</h3>
<p>Since the dawn of time, people have thought, acted, and fared differently from one another. It was much easier to explain these differences as inborn traits. But modern psychology reveals that your view of yourself profoundly affects the way you lead your life.</p>
<p>In a <strong>Fixed Mindset</strong>, believing that your qualities are carved in stone creates an urgency to prove yourself over and over. If you have only a certain amount of intelligence, a certain personality, and a certain moral character—well, then you’d better prove that you have a healthy dose of them.</p>
<p>In a <strong>Growth Mindset</strong>, based on the belief that your basic qualities are things you can cultivate through your efforts, strategy, and help from others, everyone can change and grow through application and experience.</p>`,
            ta: `<h3>மனிதர்கள் ஏன் வேறுபடுகிறார்கள்?</h3>
<p><strong>நிலையான மனநிலை (Fixed Mindset):</strong> நமது திறமைகளும் புத்திசாலித்தனமும் பிறப்பிலேயே தீர்மானிக்கப்பட்டவை என்று நம்புவது.</p>
<p><strong>வளர்ச்சி மனநிலை (Growth Mindset):</strong> தொடர் முயற்சி, சரியான உத்திகள் மற்றும் வழிகாட்டுதல் மூலம் எவராலும் தங்கள் திறமையை வளர்த்துக்கொள்ள முடியும் என்று நம்புவது.</p>`
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
          title: { en: "Importance of Attitude: Building a Positive Outlook", ta: "மனப்பான்மையின் முக்கியத்துவம்: நேர்மறை கண்ணோட்டம்" },
          content: {
            en: `<h3>Winners Don't Do Different Things</h3>
<p>Winners don't do different things; they do things differently. Your attitude contributes to 85% of your success in life.</p>
<p>An ability will get you to the top, but it takes character to keep you there. Life is an obstacle course and we become our own biggest obstacle when we harbor negative attitudes.</p>`,
            ta: `<h3>வெற்றியாளர்கள் வித்தியாசமான செயல்களைச் செய்வதில்லை</h3>
<p>வெற்றியாளர்கள் வித்தியாசமான செயல்களைச் செய்வதில்லை, அவர்கள் செயல்களை வித்தியாசமாகச் செய்கிறார்கள். உங்கள் வாழ்க்கையின் 85% வெற்றிக்கு உங்களது மனப்பான்மையே காரணமாக அமைகிறது.</p>`
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
          title: { en: "Lesson 1: The Rich Don't Work for Money", ta: "பாடம் 1: பணக்காரர்கள் பணத்திற்காக வேலை செய்வதில்லை" },
          content: {
            en: `<h3>Assets vs. Liabilities</h3>
<p>Rule One: You must know the difference between an asset and a liability, and buy assets. If you want to be rich, this is all you need to know. It is Rule No. 1. It is the only rule.</p>
<p>An asset puts money in your pocket. A liability takes money out of your pocket. The poor and middle class acquire liabilities that they think are assets.</p>`,
            ta: `<h3>சொத்துக்கள் vs கடன்கள்</h3>
<p>விதி ஒன்று: நீங்கள் சொத்துக்கும் கடனுக்கும் உள்ள வித்தியாசத்தை அறிந்து கொள்ள வேண்டும். பணக்காரர்கள் சொத்துக்களை உருவாக்குகிறார்கள்; ஏழைகளும் நடுத்தர வர்க்கத்தினரும் சொத்துக்கள் என்று நினைத்து கடன்களை வாங்குகிறார்கள்.</p>`
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
          title: { en: "Orientation: The Early Years in Rameswaram", ta: "ராமேஸ்வரத்தில் கழிந்த இளமைக் காலம்" },
          content: {
            en: `<h3>Dreams That Do Not Let You Sleep</h3>
<p>I was born into a middle-class Tamil family in the island town of Rameswaram in the erstwhile Madras State. My father, Jainulabdeen, had neither much formal education nor much wealth; despite these disadvantages, he possessed great innate wisdom and a true generosity of spirit.</p>
<blockquote>"Dream is not that which you see while sleeping, it is something that does not let you sleep."</blockquote>
<p>Every failure is a lesson in resilience. When SLV-3 succeeded after initial heartbreak, it taught us that dedication to a higher cause elevates human capability beyond all perceived boundaries.</p>`,
            ta: `<h3>உறங்க விடாத கனவுகள்</h3>
<p>நான் அன்றைய மெட்ராஸ் மாகாணத்தின் தீவு நகரமான ராமேஸ்வரத்தில் ஒரு நடுத்தர தமிழ் குடும்பத்தில் பிறந்தேன். என் தந்தை ஜைனுலாப்தீன் மிகுந்த இயற்கையான ஞானமும், தாராள மனப்பான்மையும் கொண்டவர்.</p>
<blockquote>"கனவு என்பது நீங்கள் தூங்கும்போது காண்பதல்ல; உங்களை தூங்கவிடாமல் செய்வதே உண்மையான கனவு."</blockquote>`
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
          title: { en: "The Art of Staying Young While Growing Old", ta: "வயதானாலும் இளமையோடு வாழும் ஜப்பானிய கலை" },
          content: {
            en: `<h3>What is Your Reason for Being?</h3>
<p>According to the Japanese, everyone has an ikigai—a reason for being. Some people have found their ikigai, while others are still looking, though they carry it within them.</p>
<p>Our ikigai is hidden deep inside each of us, and finding it requires a patient search. It exists at the intersection of: What you love, What you are good at, What the world needs, and What you can get paid for.</p>`,
            ta: `<h3>உங்கள் வாழ்வின் நோக்கம் என்ன?</h3>
<p>ஜப்பானிய தத்துவத்தின்படி ஒவ்வொருவருக்கும் ஒரு 'இக்கிகாய்' (வாழும் நோக்கம்) உண்டு. நீங்கள் விரும்புவது, நீங்கள் சிறந்து விளங்குவது, உலகத்திற்குத் தேவைப்படுவது, மற்றும் உங்களுக்கு வருமானம் தருவது ஆகிய நான்கும் இணையும் புள்ளியே இக்கிகாய் ஆகும்.</p>`
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
          title: { en: "The Deep Work Hypothesis", ta: "தீவிர கவனக் கோட்பாடு" },
          content: {
            en: `<h3>Focus in a Distracted World</h3>
<p>Deep work is the ability to focus without distraction on a cognitively demanding task. It’s a superpower in our increasingly competitive twenty-first-century economy.</p>
<p>High-Quality Work Produced = (Time Spent) x (Intensity of Focus).</p>`,
            ta: `<h3>கவனச்சிதறலற்ற பணி</h3>
<p>டீப் ஒர்க் என்பது கவனச்சிதறல்கள் இன்றி ஒரு கடினமான பணியில் முழு கவனத்தையும் செலுத்தும் திறன் ஆகும். இந்த நவீன உலகில் இது ஒரு சூப்பர் பவர் போன்றது.</p>`
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
          title: { en: "No One's Crazy: Your Personal Experiences with Money", ta: "பணம் குறித்த உங்களின் தனிப்பட்ட அனுபவங்கள்" },
          content: {
            en: `<h3>Doing Well with Money Has Little to Do with Intelligence</h3>
<p>Doing well with money has a little to do with how smart you are and a lot to do with how you behave. And behavior is hard to teach, even to really smart people.</p>
<p>Spending money to show people how much money you have is the fastest way to have less money. Wealth is what you don't see.</p>`,
            ta: `<h3>பணத்தை கையாள்வது அறிவை விட நடத்தையை சார்ந்தது</h3>
<p>பணத்தை சரியாகக் கையாள்வது நீங்கள் எவ்வளவு புத்திசாலி என்பதை விட நீங்கள் எவ்வாறு நடந்து கொள்கிறீர்கள் என்பதையே சார்ந்துள்ளது. செல்வம் என்பது பிறருக்குக் காட்டாத சேமிப்பாகும்.</p>`
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

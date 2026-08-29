/**
 * Social Readers - Internationalization (i18n) Module
 * English (en) & Tamil (ta) translations
 */

// Language state persisted across pages via localStorage (defaults to 'en')
let currentLanguage = localStorage.getItem('sr_lang') || 'en';

const translations = {
  en: {
    // Brand & Header
    "brand.name": "SOCIAL READERS",
    "brand.tagline": "READ FOR CHANGE",
    "nav.home": "Home",
    "nav.categories": "Categories",
    "nav.library": "My Library",
    "nav.books": "All Books",
    "nav.impact": "Our Impact",
    "nav.account": "Account",
    "nav.admin": "Admin",
    "lang.toggle": "EN | த",
    "lang.current": "English",

    // Home - Hero
    "hero.badge": "25% Contributed to Youth Education & Sports",
    "hero.title": "Read for Change.",
    "hero.subtitle": "E-books that inspire. Contributions that impact.",
    "hero.desc": "Every e-book you read funds education for underprivileged students and nurtures emerging sports talent across rural communities.",
    "hero.cta.explore": "Explore Books",
    "hero.cta.impact": "See Our Impact",
    "hero.poster.badge": "25% SOCIAL IMPACT GUARANTEE",
    "hero.poster.title": "25% of Every Purchase",
    "hero.poster.subtitle": "Directly Funds Youth Dreams",
    "hero.poster.edu.title": "Youth Education",
    "hero.poster.edu.desc": "Textbooks, notebook kits, exam fees & reading circles.",
    "hero.poster.edu.stat": "12,450+ Students",
    "hero.poster.sports.title": "Grassroots Sports",
    "hero.poster.sports.desc": "Running spikes, training gear & talent scholarships.",
    "hero.poster.sports.stat": "350+ Athletes",
    "hero.poster.calc": "On a ₹149 Book ➜ ₹37.25 Directly Donated",
    "hero.poster.cta": "View Verified Impact",

    // Home - Value Props
    "vp.title": "Why Choose Social Readers?",
    "vp.subtitle": "A reading community powered by purpose and shared dreams",
    "vp1.title": "Buy & Read",
    "vp1.desc": "Explore e-books across categories. Read anytime, anywhere on any device.",
    "vp2.title": "25% For Change",
    "vp2.desc": "Every purchase contributes 25% to support education and sports talent.",
    "vp3.title": "Empower Dreams",
    "vp3.desc": "Helping students who struggle to read and talented athletes who dream to grow.",

    // Home - Pull Quote
    "quote.text": "“Your read can change their life.”",
    "quote.author": "Social Readers Mission",

    // Home - Categories
    "categories.title": "Popular Categories",
    "categories.subtitle": "Browse curated collections crafted to elevate your life",
    "categories.viewAll": "View all",
    "cat.selfdev": "Self Development",
    "cat.business": "Business & Finance",
    "cat.health": "Health & Mindset",
    "cat.biography": "Biographies & Inspiration",
    "cat.fiction": "Fiction & Literature",
    "cat.technology": "Technology & Science",
    "cat.books_count": "e-books available",

    // Home - Impact Banner
    "impact_banner.title": "Your Purchase. Their Future.",
    "impact_banner.subtitle": "25% of every purchase goes to support students' talents.",
    "impact_banner.desc": "We partner directly with grassroots schools and sports academies to turn reading into real scholarships and equipment.",
    "impact_banner.cta": "Know More",

    // Home - Featured Books
    "featured.title": "Featured Books",
    "featured.subtitle": "Bestselling titles making the highest social impact this month",
    "featured.viewAll": "View all",
    "book.btn.buy": "Buy Now",
    "book.btn.addCart": "Add to Cart",
    "book.badge.bestseller": "Bestseller",
    "book.impact_share": "25% for Education & Sports",

    // Books Data Titles & Authors
    "book1.title": "Atomic Habits",
    "book1.author": "James Clear",
    "book1.price": "₹149",
    "book1.desc": "An easy & proven way to build good habits & break bad ones. Transform your daily routine one percent at a time.",

    "book2.title": "The Power of Mindset",
    "book2.author": "Carol S. Dweck",
    "book2.price": "₹179",
    "book2.desc": "Discover how our beliefs about our capabilities shape our success and how fostering a growth mindset changes everything.",

    "book3.title": "You Can Win",
    "book3.author": "Shiv Khera",
    "book3.price": "₹149",
    "book3.desc": "A step-by-step tool for top achievers. Winners don't do different things, they do things differently.",

    "book4.title": "Rich Dad Poor Dad",
    "book4.author": "Robert Kiyosaki",
    "book4.price": "₹199",
    "book4.desc": "What the rich teach their kids about money that the poor and middle class do not! Master financial independence.",

    "book5.title": "Wings of Fire",
    "book5.author": "Dr. A.P.J. Abdul Kalam",
    "book5.price": "₹159",
    "book5.desc": "An inspiring autobiography of an ordinary boy from Rameswaram who went on to become the Missile Man of India.",

    "book6.title": "Ikigai: The Japanese Secret",
    "book6.author": "Héctor García & Francesc Miralles",
    "book6.price": "₹169",
    "book6.desc": "The Japanese secret to a long, happy and purposeful life. Discover your reason for getting up every morning.",

    "book7.title": "Deep Work",
    "book7.author": "Cal Newport",
    "book7.price": "₹189",
    "book7.desc": "Rules for focused success in a distracted world. Master hard things and produce elite quality output quickly.",

    "book8.title": "The Psychology of Money",
    "book8.author": "Morgan Housel",
    "book8.price": "₹199",
    "book8.desc": "Timeless lessons on wealth, greed, and happiness doing well with money isn't necessarily about what you know.",

    // Home - How It Works
    "how.title": "How It Works",
    "how.subtitle": "A transparent 4-step circle of reading and giving back",
    "how.step1.title": "You Buy an e-book",
    "how.step1.desc": "Choose from our vast collection of inspiring digital books at affordable prices.",
    "how.step2.title": "We Share 25%",
    "how.step2.desc": "25% of the total amount is automatically dedicated to our youth welfare fund.",
    "how.step3.title": "We Support",
    "how.step3.desc": "We fund underprivileged education and equip budding sports talents.",
    "how.step4.title": "We Create Together",
    "how.step4.desc": "Together, we build a brighter, healthier, and more empowered future.",

    // Categories Page
    "catpage.title": "Explore All Categories",
    "catpage.subtitle": "Find the perfect e-book tailored to your personal growth and interests",
    "catpage.search": "Search categories...",

    // Books Page
    "bookspage.title": "All E-Books",
    "bookspage.subtitle": "Every book you buy directly funds students and athlete dreams",
    "bookspage.filter.all": "All Books",
    "bookspage.filter.selfdev": "Self Development",
    "bookspage.filter.business": "Business & Finance",
    "bookspage.filter.health": "Health & Mindset",
    "bookspage.filter.biography": "Biographies",
    "bookspage.search.placeholder": "Search by book title or author...",

    // Book Detail Page
    "detail.breadcrumb.home": "Home",
    "detail.breadcrumb.books": "Books",
    "detail.format": "Format: PDF, ePub, Kindle compatible",
    "detail.pages": "320 Pages",
    "detail.language": "Language: English / Tamil Edition",
    "detail.rating": "4.9 (420+ reviews)",
    "detail.instant_access": "Instant Download Access",
    "detail.impact_box_title": "Your Impact With This Purchase",
    "detail.impact_box_text": "₹37.25 (25%) from this purchase goes directly to sponsor school textbooks and sports shoes for children in need.",
    "detail.overview_tab": "Book Overview",
    "detail.table_of_contents": "Key Highlights",
    "detail.reviews_tab": "Reader Reviews",
    "detail.similar_title": "You May Also Like",

    // Impact Page
    "impact.hero.title": "Empowering Dreams Through Every Page",
    "impact.hero.subtitle": "Social Readers was born with one conviction: knowledge should liberate the reader while elevating those who need it most.",
    "impact.stat1.number": "12,450+",
    "impact.stat1.label": "Students Supported",
    "impact.stat2.number": "₹18.5 Lakhs+",
    "impact.stat2.label": "Funds Contributed",
    "impact.stat3.number": "350+",
    "impact.stat3.label": "Athletes Sponsored",
    "impact.stat4.number": "48+",
    "impact.stat4.label": "Rural Schools & Academies",
    "impact.story.title": "Real Stories, Real Change",
    "impact.story1.name": "Kavitha M. - High School Scholar",
    "impact.story1.text": "\"Thanks to the Social Readers scholarship, I received my books and science lab fees for the entire academic year.\"",
    "impact.story2.name": "Senthil Kumar - State Junior Sprinter",
    "impact.story2.text": "\"The sports kit and training shoes provided through book purchases helped me train and qualify for the state athletics meet.\"",
    "impact.transparency.title": "100% Transparent 25% Allocation",
    "impact.transparency.desc": "Every quarter, we publish our audited impact reports detailing every rupee channeled toward youth education and sports development.",

    // Account Page
    "account.title": "My Account",
    "account.welcome": "Welcome back, Reader!",
    "account.email": "reader@socialreaders.org",
    "account.tab.library": "My Library (4)",
    "account.tab.orders": "Order History",
    "account.tab.wishlist": "Wishlist",
    "account.tab.impact": "My Personal Impact",
    "account.download": "Download E-Book",
    "account.read_online": "Read Online",
    "account.impact_metric": "You have contributed ₹172.50 to education & sports so far!",

    // Admin Pages
    "admin.login.title": "Admin Portal Login",
    "admin.login.subtitle": "Social Readers Management Console",
    "admin.login.email": "Admin Email",
    "admin.login.password": "Password",
    "admin.login.submit": "Sign In to Console",
    "admin.dash.title": "Dashboard Overview",
    "admin.dash.total_books": "Total E-Books",
    "admin.dash.total_orders": "Total Orders",
    "admin.dash.total_revenue": "Total Revenue",
    "admin.dash.fund_allocated": "25% Social Fund Allocated",
    "admin.dash.recent_orders": "Recent Orders",
    "admin.dash.nav.dashboard": "Dashboard",
    "admin.dash.nav.books": "Manage Books",
    "admin.dash.nav.orders": "Orders & Receipts",
    "admin.dash.nav.categories": "Categories",
    "admin.dash.nav.settings": "Settings",

    // Footer
    "footer.tagline": "Read more. Give more. Change more lives.",
    "footer.desc": "Social Readers is a mission-driven digital bookstore. 25% of every single purchase directly empowers youth education and grassroots sports talent.",
    "footer.quicklinks": "Quick Links",
    "footer.categories": "Categories",
    "footer.contact": "Contact & Support",
    "footer.contact_email": "support@socialreaders.org",
    "footer.rights": "© 2026 Social Readers. All rights reserved."
  },

  ta: {
    // Brand & Header
    "brand.name": "சோஷியல் ரீடர்ஸ்",
    "brand.tagline": "மாற்றத்திற்காக வாசிப்போம்",
    "nav.home": "முகப்பு",
    "nav.categories": "பிரிவுகள்",
    "nav.library": "என் நூலகம்",
    "nav.books": "அனைத்து புத்தகங்கள்",
    "nav.impact": "எங்கள் தாக்கம்",
    "nav.account": "கணக்கு",
    "nav.admin": "நிர்வாகம்",
    "lang.toggle": "த | EN",
    "lang.current": "தமிழ்",

    // Home - Hero
    "hero.badge": "25% பங்களிப்பு இளைஞர் கல்வி மற்றும் விளையாட்டுக்கு",
    "hero.title": "மாற்றத்திற்கான வாசிப்பு.",
    "hero.subtitle": "உத்வேகம் தரும் மின்னூல்கள். மாற்றத்தை உருவாக்கும் பங்களிப்புகள்.",
    "hero.desc": "நீங்கள் வாசிக்கும் ஒவ்வொரு மின்னூலும் எளிய மாணவர்களின் கல்விக்கும், கிராமப்புற விளையாட்டு வீரர்களின் கனவுகளுக்கும் 25% நிதி உதவி செய்கிறது.",
    "hero.cta.explore": "புத்தகங்களை காண்க",
    "hero.cta.impact": "எங்கள் தாக்கம்",
    "hero.poster.badge": "25% சமூக பங்களிப்பு உத்தரவாதம்",
    "hero.poster.title": "ஒவ்வொரு புத்தகத்திலிருந்தும் 25%",
    "hero.poster.subtitle": "இளைஞர்களின் கனவுகளுக்கு நேரடி உதவி",
    "hero.poster.edu.title": "இளைஞர் கல்வி",
    "hero.poster.edu.desc": "பாடப்புத்தகங்கள், நோட்டுப் புத்தகங்கள் மற்றும் தேர்வு கட்டணங்கள்.",
    "hero.poster.edu.stat": "12,450+ மாணவர்கள்",
    "hero.poster.sports.title": "கிராமப்புற விளையாட்டு",
    "hero.poster.sports.desc": "விளையாட்டு உடைகள், காலணிகள் மற்றும் பயிற்சி உதவிகள்.",
    "hero.poster.sports.stat": "350+ விளையாட்டு வீரர்கள்",
    "hero.poster.calc": "₹149 புத்தகத்தில் ➜ ₹37.25 கல்வி மற்றும் விளையாட்டு நிதி",
    "hero.poster.cta": "நேரடி தாக்கத்தை காண்க",

    // Home - Value Props
    "vp.title": "ஏன் சோஷியல் ரீடர்ஸ்?",
    "vp.subtitle": "நோக்கத்துடனும் பகிரப்பட்ட கனவுகளுடனும் இயங்கும் ஒரு வாசிப்பு சமூகம்",
    "vp1.title": "வாங்குங்கள் & வாசியுங்கள்",
    "vp1.desc": "பல்வேறு பிரிவுகளில் உள்ள மின்னூல்களை கண்டறிந்து எங்கும் எப்போதும் வாசியுங்கள்.",
    "vp2.title": "மாற்றத்திற்கு 25%",
    "vp2.desc": "ஒவ்வொரு கொள்முதலிலும் 25% கல்வி மற்றும் விளையாட்டு வீரர்களுக்கு வழங்கப்படுகிறது.",
    "vp3.title": "கனவுகளுக்கு வலுவூட்டுதல்",
    "vp3.desc": "கல்விக்கு தடுமாறும் மாணவர்களுக்கும் வளரத் துடிக்கும் விளையாட்டு வீரர்களுக்கும் உதவி.",

    // Home - Pull Quote
    "quote.text": "“உங்கள் வாசிப்பு ஒருவரின் வாழ்க்கையை மாற்றும்.”",
    "quote.author": "சோஷியல் ரீடர்ஸ் லட்சியம்",

    // Home - Categories
    "categories.title": "பிரபலமான பிரிவுகள்",
    "categories.subtitle": "உங்கள் வாழ்க்கையை உயர்த்தும் வகையில் தொகுக்கப்பட்ட மின்னூல்கள்",
    "categories.viewAll": "அனைத்தும்",
    "cat.selfdev": "சுய முன்னேற்றம்",
    "cat.business": "வணிகம் & நிதி",
    "cat.health": "ஆரோக்கியம் & மனநிலை",
    "cat.biography": "சுயசரிதை & உத்வேகம்",
    "cat.fiction": "புனைகதை & இலக்கியம்",
    "cat.technology": "தொழில்நுட்பம் & அறிவியல்",
    "cat.books_count": "புத்தகங்கள் உள்ளன",

    // Home - Impact Banner
    "impact_banner.title": "உங்கள் கொள்முதல். அவர்களின் எதிர்காலம்.",
    "impact_banner.subtitle": "ஒவ்வொரு கொள்முதலிலும் 25% மாணவர்களின் திறமைகளுக்கு செல்கிறது.",
    "impact_banner.desc": "நாங்கள் நேரடியாக பள்ளிகள் மற்றும் விளையாட்டு அகாடமிகளுடன் இணைந்து வாசிப்பை நிஜமான கல்வி உதவித்தொகையாக மாற்றுகிறோம்.",
    "impact_banner.cta": "மேலும் அறிய",

    // Home - Featured Books
    "featured.title": "சிறப்புப் புத்தகங்கள்",
    "featured.subtitle": "இந்த மாதத்தின் அதிக விற்பனையான மற்றும் சமூக தாக்கத்தை ஏற்படுத்திய புத்தகங்கள்",
    "featured.viewAll": "அனைத்தும்",
    "book.btn.buy": "வாங்குங்கள்",
    "book.btn.addCart": "கார்ட்டில் சேர்",
    "book.badge.bestseller": "பிரபலம்",
    "book.impact_share": "25% கல்வி மற்றும் விளையாட்டுக்கு",

    // Books Data Titles & Authors
    "book1.title": "அட்டாமிக் ஹாபிட்ஸ் (Atomic Habits)",
    "book1.author": "ஜேம்ஸ் க்ளியர் (James Clear)",
    "book1.price": "₹149",
    "book1.desc": "நல்ல பழக்கங்களை உருவாக்கவும் கெட்ட பழக்கங்களை அழிக்கவும் நிரூபிக்கப்பட்ட எளிய வழிமுறை.",

    "book2.title": "மைண்ட்செட் ஆற்றல் (The Power of Mindset)",
    "book2.author": "கரோல் எஸ். டுவெக் (Carol S. Dweck)",
    "book2.price": "₹179",
    "book2.desc": "நமது எண்ணங்கள் வெற்றியை எவ்வாறு தீர்மானிக்கின்றன என்பதை விளக்கும் அற்புதமான வழிகாட்டி.",

    "book3.title": "யு கேன் வின் (You Can Win)",
    "book3.author": "ஷிவ் கேரா (Shiv Khera)",
    "book3.price": "₹149",
    "book3.desc": "வெற்றியாளர்கள் வித்தியாசமான செயல்களைச் செய்வதில்லை, அவர்கள் செயல்களை வித்தியாசமாகச் செய்கிறார்கள்.",

    "book4.title": "ரிச் டாட் புவர் டாட் (Rich Dad Poor Dad)",
    "book4.author": "ராபர்ட் கியோசாகி (Robert Kiyosaki)",
    "book4.price": "₹199",
    "book4.desc": "பணம் குறித்து பணக்காரர்கள் தங்கள் குழந்தைகளுக்கு கற்றுக்கொடுக்கும் நிதி மேலாண்மை ரகசியங்கள்.",

    "book5.title": "அக்னி சிறகுகள் (Wings of Fire)",
    "book5.author": "டாக்டர் ஏ.பி.ஜே. அப்துல் கலாம்",
    "book5.price": "₹159",
    "book5.desc": "ராமேஸ்வரத்தில் பிறந்து இந்தியாவின் ஏவுகணை மனிதராக உயர்ந்த ஒரு மாமனிதரின் உத்வேக சுயசரிதை.",

    "book6.title": "இக்கிகாய் (Ikigai)",
    "book6.author": "ஹெக்டர் கார்சியா & பிரான்செஸ்க் மிரால்லெஸ்",
    "book6.price": "₹169",
    "book6.desc": "நீண்ட மற்றும் மகிழ்ச்சியான வாழ்விற்கான ஜப்பானிய ரகசியம். வாழ்வின் நோக்கத்தைக் கண்டறியுங்கள்.",

    "book7.title": "டீப் ஒர்க் (Deep Work)",
    "book7.author": "கால் நியூபோர்ட் (Cal Newport)",
    "book7.price": "₹189",
    "book7.desc": "கவனச்சிதறல்கள் நிறைந்த உலகில் தீவிர கவனத்துடன் சிறப்பான சாதனைகளை படைப்பதற்கான விதிகள்.",

    "book8.title": "தி சைக்காலஜி ஆஃப் மணி (The Psychology of Money)",
    "book8.author": "மோர்கன் ஹவுசல் (Morgan Housel)",
    "book8.price": "₹199",
    "book8.desc": "செல்வம், பேராசை மற்றும் மகிழ்ச்சி பற்றிய காலத்தால் அழியாத நிதிக் கொள்கைகள்.",

    // Home - How It Works
    "how.title": "இப்படி செயல்படுகிறது",
    "how.subtitle": "வாசிப்பும் சமூகப் பங்களிப்பும் இணைந்த வெளிப்படையான 4 படிகள்",
    "how.step1.title": "மின்னூல் வாங்குங்கள்",
    "how.step1.desc": "குறைந்த விலையில் சிறந்த மின்னூல்களிலிருந்து உங்களுக்கு பிடித்ததை தேர்வு செய்யுங்கள்.",
    "how.step2.title": "25% பகிர்வு",
    "how.step2.desc": "தொகையில் 25% தானாகவே இளைஞர் நல நிதியில் சேர்க்கப்படுகிறது.",
    "how.step3.title": "நாம் ஆதரிக்கிறோம்",
    "how.step3.desc": "ஏழை மாணவர்களின் கல்விக்கும் விளையாட்டு வீரர்களின் உபகரணங்களுக்கும் நிதி செல்கிறது.",
    "how.step4.title": "இணைந்து உருவாக்குவோம்",
    "how.step4.desc": "நாம் அனைவரும் இணைந்து ஒளிமயமான எதிர்காலத்தை உருவாக்குகிறோம்.",

    // Categories Page
    "catpage.title": "அனைத்துப் பிரிவுகளையும் காண்க",
    "catpage.subtitle": "உங்கள் தனிப்பட்ட வளர்ச்சி மற்றும் ஆர்வத்திற்கு ஏற்ற மின்னூல்களைத் தேர்வு செய்யுங்கள்",
    "catpage.search": "பிரிவுகளைத் தேடுங்கள்...",

    // Books Page
    "bookspage.title": "அனைத்து மின்னூல்கள்",
    "bookspage.subtitle": "நீங்கள் வாங்கும் ஒவ்வொரு புத்தகமும் மாணவர்களின் கனவுகளுக்கு நேரடியாக நிதியளிக்கிறது",
    "bookspage.filter.all": "அனைத்து நூல்கள்",
    "bookspage.filter.selfdev": "சுய முன்னேற்றம்",
    "bookspage.filter.business": "வணிகம் & நிதி",
    "bookspage.filter.health": "ஆரோக்கியம் & மனநிலை",
    "bookspage.filter.biography": "சுயசரிதைகள்",
    "bookspage.search.placeholder": "புத்தகத் தலைப்பு அல்லது ஆசிரியர் பெயர் தேடவும்...",

    // Book Detail Page
    "detail.breadcrumb.home": "முகப்பு",
    "detail.breadcrumb.books": "புத்தகங்கள்",
    "detail.format": "வடிவம்: PDF, ePub, Kindle ஆதரிக்கப்படுகிறது",
    "detail.pages": "320 பக்கங்கள்",
    "detail.language": "மொழி: ஆங்கிலம் / தமிழ் பதிப்பு",
    "detail.rating": "4.9 (420+ மதிப்புரைகள்)",
    "detail.instant_access": "உடனடி பதிவிறக்கம்",
    "detail.impact_box_title": "இந்த புத்தகத்தின் மூலம் உங்கள் தாக்கம்",
    "detail.impact_box_text": "இந்த தொகையிலிருந்து ₹37.25 (25%) நேரடியாக மாணவர்களின் பாடப்புத்தகங்கள் மற்றும் விளையாட்டு காலணிகளுக்கு வழங்கப்படுகிறது.",
    "detail.overview_tab": "புத்தக சுருக்கம்",
    "detail.table_of_contents": "முக்கிய சிறப்பம்சங்கள்",
    "detail.reviews_tab": "வாசகர் மதிப்புரைகள்",
    "detail.similar_title": "நீங்கள் விரும்பக்கூடிய பிற புத்தகங்கள்",

    // Impact Page
    "impact.hero.title": "ஒவ்வொரு பக்கத்தின் வழியே கனவுகளுக்கு வலுவூட்டுகிறோம்",
    "impact.hero.subtitle": "அறிவு வாசிப்பவரை விடுவிப்பதுடன், தேவைப்படுபவர்களையும் உயர்த்த வேண்டும் என்ற நோக்கத்துடன் சோஷியல் ரீடர்ஸ் உருவானது.",
    "impact.stat1.number": "12,450+",
    "impact.stat1.label": "ஆதரவு பெற்ற மாணவர்கள்",
    "impact.stat2.number": "₹18.5 லட்சங்கள்+",
    "impact.stat2.label": "வழங்கப்பட்ட நிதி",
    "impact.stat3.number": "350+",
    "impact.stat3.label": "விளையாட்டு வீரர்கள்",
    "impact.stat4.number": "48+",
    "impact.stat4.label": "கிராமப்புற பள்ளிகள் & கழகங்கள்",
    "impact.story.title": "உண்மைக் கதைகள், உண்மையான மாற்றங்கள்",
    "impact.story1.name": "கவிதா மு. - மேல்நிலைப் பள்ளி மாணவி",
    "impact.story1.text": "\"சோஷியல் ரீடர்ஸ் கல்வி உதவித்தொகையால் முழு ஆண்டுக்கான பாடப்புத்தகங்களும் ஆய்வக கட்டணமும் எனக்கு கிடைத்தது.\"",
    "impact.story2.name": "செந்தில் குமார் - மாநில ஜூனியர் தடகள வீரர்",
    "impact.story2.text": "\"புத்தக விற்பனையின் மூலம் எனக்கு கிடைத்த விளையாட்டு உபகரணங்களும் காலணிகளும் மாநில தடகளப் போட்டியில் வெல்ல உதவியது.\"",
    "impact.transparency.title": "100% வெளிப்படையான 25% நிதி ஒதுக்கீடு",
    "impact.transparency.desc": "ஒவ்வொரு காலாண்டிலும், கல்வி மற்றும் விளையாட்டு வளர்ச்சிக்கு செலவிடப்பட்ட தொகையின் தணிக்கை அறிக்கையை வெளியிடுகிறோம்.",

    // Account Page
    "account.title": "என் கணக்கு",
    "account.welcome": "நல்வரவு, வாசகரே!",
    "account.email": "reader@socialreaders.org",
    "account.tab.library": "என் நூலகம் (4)",
    "account.tab.orders": "ஆர்டர் வரலாறு",
    "account.tab.wishlist": "விருப்பப்பட்டியல்",
    "account.tab.impact": "என் சமூகப் பங்களிப்பு",
    "account.download": "மின்னூல் பதிவிறக்கம்",
    "account.read_online": "நேரடியாக வாசிக்க",
    "account.impact_metric": "இதுவரை கல்வி மற்றும் விளையாட்டுக்கு நீங்கள் ₹172.50 பங்களித்துள்ளீர்கள்!",

    // Admin Pages
    "admin.login.title": "நிர்வாக உள்நுழைவு",
    "admin.login.subtitle": "சோஷியல் ரீடர்ஸ் மேலாண்மை தளம்",
    "admin.login.email": "நிர்வாக மின்னஞ்சல்",
    "admin.login.password": "கடவுச்சொல்",
    "admin.login.submit": "உள்நுழையவும்",
    "admin.dash.title": "டாஷ்போர்டு மேலோட்டம்",
    "admin.dash.total_books": "மொத்த மின்னூல்கள்",
    "admin.dash.total_orders": "மொத்த ஆர்டர்கள்",
    "admin.dash.total_revenue": "மொத்த வருவாய்",
    "admin.dash.fund_allocated": "25% சமூக நிதி ஒதுக்கீடு",
    "admin.dash.recent_orders": "சமீபத்திய ஆர்டர்கள்",
    "admin.dash.nav.dashboard": "டாஷ்போர்டு",
    "admin.dash.nav.books": "புத்தகங்களை நிர்வகி",
    "admin.dash.nav.orders": "ஆர்டர்கள் & ரசீதுகள்",
    "admin.dash.nav.categories": "பிரிவுகள்",
    "admin.dash.nav.settings": "அமைப்புகள்",

    // Footer
    "footer.tagline": "அதிகமாக வாசிக்கவும். அதிகமாக வழங்கவும். அதிகமான வாழ்க்கைகளை மாற்றவும்.",
    "footer.desc": "சோஷியல் ரீடர்ஸ் என்பது ஒரு நோக்கத்திற்காக செயல்படும் மின்னூல் அங்காடி. ஒவ்வொரு கொள்முதலிலும் 25% மாணவர் கல்வி மற்றும் விளையாட்டு திறமைகளுக்கு நேரடியாகச் செல்கிறது.",
    "footer.quicklinks": "முக்கிய இணைப்புகள்",
    "footer.categories": "பிரிவுகள்",
    "footer.contact": "தொடர்பு & உதவி",
    "footer.contact_email": "support@socialreaders.org",
    "footer.rights": "© 2026 சோஷியல் ரீடர்ஸ். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை."
  }
};

/**
 * Get current language code
 */
function getLanguage() {
  return currentLanguage;
}

/**
 * Set and apply active language
 * @param {string} lang - 'en' or 'ta'
 */
function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'ta') {
    lang = 'en';
  }
  currentLanguage = lang;
  localStorage.setItem('sr_lang', lang);
  
  // Find all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      // Check if element has placeholder attribute
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) {
          el.setAttribute('placeholder', translations[currentLanguage][key]);
        } else {
          el.value = translations[currentLanguage][key];
        }
      } else {
        el.textContent = translations[currentLanguage][key];
      }
    }
  });

  // Update toggle button text if available
  const langToggleButtons = document.querySelectorAll('.lang-toggle-btn');
  langToggleButtons.forEach((btn) => {
    btn.textContent = currentLanguage === 'en' ? 'EN | த' : 'த | EN';
    btn.setAttribute('aria-label', currentLanguage === 'en' ? 'Switch to Tamil' : 'Switch to English');
  });

  // Update HTML lang attribute
  document.documentElement.lang = currentLanguage;
}

/**
 * Toggle between English and Tamil
 */
function toggleLanguage() {
  const newLang = currentLanguage === 'en' ? 'ta' : 'en';
  setLanguage(newLang);
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLanguage);

  // Bind click handlers to all lang-toggle-btn elements
  document.querySelectorAll('.lang-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLanguage();
    });
  });
});

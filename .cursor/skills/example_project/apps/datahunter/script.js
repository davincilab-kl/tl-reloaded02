// Data Storage
let userProfile = {
    interests: {
        sport: 0,
        music: 0,
        gaming: 0,
        cooking: 0,
        tutorials: 0,
        fashion: 0,
        diy: 0,
        tech: 0,
        animals: 0,
        travel: 0
    },
    personality: {
        cautious: 0,
        creative: 0,
        impulsive: 0,
        social: 0
    },
    actions: [],
    totalActions: 0,
    watchTime: {},
    comments: []
};

// Feed Categories
const categories = [
    { id: 'sport', name: 'Sport', icon: '⚽', color: '#4CAF50' },
    { id: 'music', name: 'Musik', icon: '🎵', color: '#9C27B0' },
    { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#FF9800' },
    { id: 'cooking', name: 'Kochen', icon: '🍳', color: '#F44336' },
    { id: 'tutorials', name: 'Tutorials', icon: '📚', color: '#2196F3' },
    { id: 'fashion', name: 'Mode', icon: '👗', color: '#E91E63' },
    { id: 'diy', name: 'DIY', icon: '🔨', color: '#795548' },
    { id: 'tech', name: 'Tech', icon: '💻', color: '#00BCD4' },
    { id: 'animals', name: 'Tiere', icon: '🐾', color: '#8BC34A' },
    { id: 'travel', name: 'Reisen', icon: '✈️', color: '#FF5722' }
];

// Username-Zuordnung zu Kategorien
const categoryUsernames = {
    sport: ['austria_austria', 'soccer_pro', 'ninofitness', 'kiki_kickers', 'sportygirl_420', 'training_daily'],
    music: ['swiftie_swift', 'sing_song_1', 'konzeeert_fan', 'melody65', 'geexy_g', 'sound_waverer'],
    gaming: ['gamer_pro_111', 'xantox', 'game_king_stefan', 'player_one', 'pepe_pino', 'silly_billy'],
    cooking: ['cooking_master08', 'chef_at_home', 'rezepte_queen', 'küchen_profi_33', 'foodie_life', 'tasty_cook'],
    tutorials: ['learn3r', 'study_buddy99', 'nanunana', 'dein_tutorial_bro', 'hannini_nat', 'study_lilly55'],
    fashion: ['fashion_style', 'outfit_queen', 'style_is_my_life', 'trendy_setty', 'fashion_girl', 'sophia_style'],
    diy: ['diy_paddy', '1_craft_master_1', 'maker_life', 'creative22hands', 'diy_projects', 'diy_diana'],
    tech: ['tech_geeko', 'technik_freak', 'tech_master', 'orio_ohoh', 'tech_wizard', 'tech_max'],
    animals: ['animaaals111', 'petparent123', 'cat_lover_mia', 'dog_mommy', 'xoni_oni', 'zootopia22'],
    travel: ['jessy_the_traveler', 'heylolo77', 'paddler', '123_bin_dabei', 'kira_kira', 'wanderrrr']
};

// Feed Items Data
const feedItems = [
    { category: 'sport', title: 'Fußball-Tricks', content: '⚽', type: 'video' },
    { category: 'music', title: 'Neuer Song Release', content: '🎵', type: 'video' },
    { category: 'gaming', name: 'Gaming-Meme', content: '🎮', type: 'image' },
    { category: 'cooking', title: 'Pasta-Rezept', content: '🍝', type: 'image' },
    { category: 'tutorials', title: 'Mathe-Tutorial', content: '📐', type: 'video' },
    { category: 'fashion', title: 'Frühjahrs-Outfit', content: '👗', type: 'image' },
    { category: 'diy', title: 'Bastelidee', content: '🛠️', type: 'image' },
    { category: 'tech', title: 'Neues Smartphone', content: '📱', type: 'image' },
    { category: 'animals', title: 'Süße Katzen', content: '🐱', type: 'video' },
    { category: 'travel', title: 'Reiseziel', content: '🏖️', type: 'image' }
];

// Bild-Zuordnung zu Post-Inhalten (JSON-Struktur)
const postImageMapping = {
    sport: {
        'Was für ein Spiel! 🔥': 'imgs/posts/datahunter_post_fußball_512.jpg',
        'Training war heute richtig gut 💪': 'imgs/posts/datahunter_post_training_512.jpg',
        'Wir haben es geschafft! 🏆': 'imgs/posts/datahunter_post_pokal_512.jpg'
    },
    music: {
        'Neuer Song ist raus! 🎵': 'imgs/posts/datahunter_post_studio_512.jpg',
        'Konzert war unglaublich! 🎸': 'imgs/posts/datahunter_post_konzert_512.jpg',
        'Diese Melodie geht mir nicht mehr aus dem Kopf 🎶': 'imgs/posts/datahunter_post_musik_park_512.jpg'
    },
    gaming: {
        'Endlich Diamond!!! 🎮': 'imgs/posts/datahunter_post_rocket_league_512.jpg',
        'Soooo entspannend, ich liebe es!': 'imgs/posts/datahunter_post_switch_512.jpg',
        'Das Spiel ist so süchtig machend 🎯': 'imgs/posts/datahunter_post_clash_512.jpg'
    },
    cooking: {
        'Selbstgemacht schmeckt am besten! 👨‍🍳': 'imgs/posts/datahunter_post_kochen_512.jpg',
        'Neues Rezept ausprobiert 🍳': 'imgs/posts/datahunter_post_gericht_512.jpg',
        'So lecker! 😋': 'imgs/posts/datahunter_post_salat_512.jpg'
    },
    tutorials: {
        'So viel gelernt heute! 📚': 'imgs/posts/datahunter_post_gelernt_512.jpg',
        'Endlich verstanden! 💡😎': 'imgs/posts/datahunter_post_verstanden_512.jpg',
        'Super erklärt! 👏': 'imgs/posts/datahunter_post_erklaert_512.jpg'
    },
    fashion: {
        'Neues Outfit! 👗': 'imgs/posts/datahunter_post_outfit_512.jpg',
        'Die muss ich haben! 😍': 'imgs/posts/datahunter_post_sportschuhe_512.jpg',
        'OMG! Ich lieb meinen neuen Strickpulli sooo sehr! 🤩': 'imgs/posts/datahunter_post_strickpulli_512.jpg'
    },
    diy: {
        'Selbst gebaut! 🔨✌': 'imgs/posts/datahunter_post_diy_512.jpg',
        'Kann gar nicht aufhören! Stricke direkt noch einen 🧶🤩': 'imgs/posts/datahunter_post_stricken_512.jpg',
        'Beim Malen kann man so gut runterkommen! 🎨': 'imgs/posts/datahunter_post_malen_512.jpg'
    },
    tech: {
        'Das neue Modell ist draußen! 💻': 'imgs/posts/datahunter_post_macbook_512.jpg',
        'Hab sooo lang drauf gewartet! 📱': 'imgs/posts/datahunter_post_neu_smartphone_512.jpg',
        'Mit dem neuen Lüfter ist das Teil so viel leiser! ⚡': 'imgs/posts/datahunter_post_playstation_512.jpg'
    },
    animals: {
        'Er hat die Blume dann aufgefressen! 😁😂': 'imgs/posts/datahunter_post_hund_blume_512.jpg',
        'Mein Liebling total entspannt 🐱😴': 'imgs/posts/datahunter_post_katze_fensterbank_512.jpg',
        'Bissl Bewegung und frische Luft für uns beide! 🐕': 'imgs/posts/datahunter_post_hund_frisbee_512.jpg'
    },
    travel: {
        'Meeega traumhaft hier! ✈️': 'imgs/posts/datahunter_post_strand_512.jpg',
        'Neue Abenteuer! 🗺️': 'imgs/posts/datahunter_post_berg_512.jpg',
        'Neue Kulturen entdecken ist sooo spannend! 🌍': 'imgs/posts/datahunter_post_markt_512.jpg'
    }
};

// Fallback-Bilder für Kategorien (falls keine spezifische Zuordnung existiert)
const categoryImages = {
    sport: [
        'imgs/posts/datahunter_post_fußball_512.jpg',
        'imgs/posts/datahunter_post_training_512.jpg',
        'imgs/posts/datahunter_post_pokal_512.jpg'
    ],
    music: [
        'imgs/posts/datahunter_post_konzert_512.jpg',
        'imgs/posts/datahunter_post_musik_park_512.jpg',
        'imgs/posts/datahunter_post_studio_512.jpg'
    ],
    gaming: [
        'imgs/posts/datahunter_post_rocket_league_512.jpg',
        'imgs/posts/datahunter_post_clash_512.jpg',
        'imgs/posts/datahunter_post_switch_512.jpg'
    ],
    cooking: [
        'imgs/posts/datahunter_post_kochen_512.jpg',
        'imgs/posts/datahunter_post_gericht_512.jpg',
        'imgs/posts/datahunter_post_salat_512.jpg'
    ],
    tutorials: [
        'imgs/posts/datahunter_post_gelernt_512.jpg',
        'imgs/posts/datahunter_post_verstanden_512.jpg',
        'imgs/posts/datahunter_post_erklaert_512.jpg'
    ],
    fashion: [
        'imgs/posts/datahunter_post_outfit_512.jpg',
        'imgs/posts/datahunter_post_sportschuhe_512.jpg',
        'imgs/posts/datahunter_post_schauspieler_512.jpg'
    ],
    diy: [
        'imgs/posts/datahunter_post_diy_512.jpg',
        'imgs/posts/datahunter_post_malen_512.jpg',
        'imgs/posts/datahunter_post_stricken_512.jpg'
    ],
    tech: [
        'imgs/posts/datahunter_post_macbook_512.jpg',
        'imgs/posts/datahunter_post_neu_smartphone_512.jpg',
        'imgs/posts/datahunter_post_playstation_512.jpg'
    ],
    animals: [
        'imgs/posts/datahunter_post_hund_blume_512.jpg',
        'imgs/posts/datahunter_post_katze_fensterbank_512.jpg',
        'imgs/posts/datahunter_post_hund_frisbee_512.jpg'
    ],
    travel: [
        'imgs/posts/datahunter_post_strand_512.jpg',
        'imgs/posts/datahunter_post_berg_512.jpg',
        'imgs/posts/datahunter_post_markt_512.jpg'
    ]
};

// Products Database
const products = {
    sport: [
        { name: 'Sneaker', price: '€89,99', icon: '👟', reason: 'Basierend auf deinen Sport-Likes' },
        { name: 'Proteinriegel', price: '€2,99', icon: '🍫', reason: 'Für Sportbegeisterte' },
        { name: 'Sportuhr', price: '€199,99', icon: '⌚', reason: 'Perfekt für aktive Menschen' },
        { name: 'Yoga-Matte', price: '€24,99', icon: '🧘', reason: 'Basierend auf Fitness-Interesse' }
    ],
    music: [
        { name: 'Kopfhörer', price: '€79,99', icon: '🎧', reason: 'Für Musikfans wie dich' },
        { name: 'Band-Merch', price: '€29,99', icon: '👕', reason: 'Basierend auf Musik-Likes' },
        { name: 'Konzert-Poster', price: '€14,99', icon: '🎤', reason: 'Musikliebhaber-Special' },
        { name: 'Spotify Premium', price: '€9,99/Monat', icon: '🎵', reason: 'Perfekt für dich' }
    ],
    gaming: [
        { name: 'Gaming-Maus', price: '€49,99', icon: '🖱️', reason: 'Für Gamer' },
        { name: 'Gaming-Headset', price: '€69,99', icon: '🎮', reason: 'Basierend auf Gaming-Interesse' },
        { name: 'Gaming-Stuhl', price: '€299,99', icon: '🪑', reason: 'Perfekt für Gaming-Sessions' },
        { name: 'Gaming-Controller', price: '€59,99', icon: '🎮', reason: 'Für Gaming-Fans' }
    ],
    fashion: [
        { name: 'Trendy Outfit', price: '€79,99', icon: '👔', reason: 'Basierend auf Mode-Likes' },
        { name: 'Designer-Tasche', price: '€149,99', icon: '👜', reason: 'Für Modebewusste' },
        { name: 'Sneaker', price: '€99,99', icon: '👟', reason: 'Mode-Trend' },
        { name: 'Accessoires-Set', price: '€34,99', icon: '💍', reason: 'Perfekt für deinen Style' }
    ],
    tech: [
        { name: 'Smartphone', price: '€599,99', icon: '📱', reason: 'Basierend auf Tech-Interesse' },
        { name: 'Laptop', price: '€899,99', icon: '💻', reason: 'Für Tech-Enthusiasten' },
        { name: 'Smartwatch', price: '€249,99', icon: '⌚', reason: 'Tech-Gadget für dich' },
        { name: 'Wireless Earbuds', price: '€129,99', icon: '🎧', reason: 'Modernste Technik' }
    ],
    animals: [
        { name: 'Plüschhund', price: '€19,99', icon: '🐕', reason: 'Du schaust gerne Tier-Videos' },
        { name: 'Katzen-Spielzeug', price: '€12,99', icon: '🐱', reason: 'Für Tierliebhaber' },
        { name: 'Tierbuch', price: '€24,99', icon: '📖', reason: 'Basierend auf Tier-Interesse' },
        { name: 'Tierposter', price: '€9,99', icon: '🖼️', reason: 'Tier-Fan-Special' }
    ],
    cooking: [
        { name: 'Kochbuch', price: '€29,99', icon: '📖', reason: 'Basierend auf Koch-Likes' },
        { name: 'Küchengerät', price: '€79,99', icon: '🍳', reason: 'Für Hobbyköche' },
        { name: 'Gewürz-Set', price: '€19,99', icon: '🧂', reason: 'Koch-Enthusiast-Special' },
        { name: 'Kochkurs', price: '€49,99', icon: '👨‍🍳', reason: 'Perfekt für dich' }
    ],
    travel: [
        { name: 'Reiseführer', price: '€14,99', icon: '📖', reason: 'Basierend auf Reise-Interesse' },
        { name: 'Reisetasche', price: '€59,99', icon: '🎒', reason: 'Für Reiselustige' },
        { name: 'Kamera', price: '€199,99', icon: '📷', reason: 'Reise-Erinnerungen festhalten' },
        { name: 'Reisekissen', price: '€24,99', icon: '🛏️', reason: 'Für Reisende' }
    ],
    diy: [
        { name: 'Werkzeug-Set', price: '€39,99', icon: '🔨', reason: 'Basierend auf DIY-Interesse' },
        { name: 'Bastel-Set', price: '€19,99', icon: '✂️', reason: 'Für Kreative' },
        { name: 'DIY-Buch', price: '€24,99', icon: '📚', reason: 'DIY-Fan-Special' },
        { name: 'Material-Set', price: '€29,99', icon: '🧵', reason: 'Perfekt für Bastler' }
    ],
    tutorials: [
        { name: 'Online-Kurs', price: '€49,99', icon: '💻', reason: 'Basierend auf Tutorial-Interesse' },
        { name: 'Lern-App', price: '€9,99/Monat', icon: '📱', reason: 'Für Wissbegierige' },
        { name: 'Buch-Set', price: '€34,99', icon: '📚', reason: 'Lern-Enthusiast-Special' },
        { name: 'Notizbuch', price: '€12,99', icon: '📝', reason: 'Zum Lernen' }
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    // Lade Profilbild beim Start
    loadStudentAvatar();
    
    // Schließe Tooltip beim Klick außerhalb
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.ai-badge-btn') && !e.target.closest('.ai-tooltip')) {
            document.querySelectorAll('.ai-tooltip').forEach(tooltip => {
                tooltip.classList.remove('active');
            });
        }
    });
});

function initializeApp() {
    // Initialize profile button as disabled
    const profileBtn = document.getElementById('show-profile-btn');
    profileBtn.classList.add('profile-btn-disabled');
    profileBtn.title = 'Du musst noch mehr im Feed machen, bevor du weitermachen kannst.';
    
    // Welcome screen button
    document.getElementById('start-btn').addEventListener('click', () => {
        showScreen('social-feed');
        generateFeed();
        // Adjust width after screen is shown
        setTimeout(() => {
            adjustFeedWidth();
            window.addEventListener('resize', adjustFeedWidth);
        }, 100);
    });

    // Profile button
    document.getElementById('show-profile-btn').addEventListener('click', () => {
        // Prüfe ob Button aktiv ist
        const profileBtn = document.getElementById('show-profile-btn');
        if (!profileBtn.classList.contains('profile-btn-disabled')) {
            showProfilePopup();
        } else {
            // Zeige Hinweis, dass noch mehr Aktionen nötig sind
            alert('Du musst noch mehr im Feed machen, bevor du dein Daten-Profil anschauen kannst. Versuche mehr zu liken, zu kommentieren oder zu teilen!');
        }
    });

    // Shopping button from profile popup
    document.getElementById('go-shopping-from-profile-btn').addEventListener('click', () => {
        closeProfilePopup();
        showScreen('shopping-screen');
        generateShoppingPage();
        checkForSummaryButton();
    });

    // Back to feed
    document.getElementById('back-to-feed-btn').addEventListener('click', () => {
        showScreen('social-feed');
    });

    // Transparency button
    document.getElementById('transparency-btn').addEventListener('click', () => {
        showScreen('transparency-screen');
        generateTransparencyDashboard();
    });

    // Close transparency
    document.getElementById('close-transparency-btn').addEventListener('click', () => {
        showScreen('shopping-screen');
    });

    // Summary from dashboard
    document.getElementById('summary-from-dashboard-btn').addEventListener('click', () => {
        document.getElementById('summary-actions').textContent = userProfile.totalActions;
        showScreen('summary-screen');
    });

    // Reflection button
    document.getElementById('reflection-btn').addEventListener('click', () => {
        showScreen('reflection-screen');
        generateReflectionMode();
    });

    // Close reflection
    document.getElementById('close-reflection-btn').addEventListener('click', () => {
        showScreen('shopping-screen');
    });

    // Personalization toggle
    document.getElementById('personalization-toggle').addEventListener('change', (e) => {
        generateShoppingPage();
    });

    // Restart button
    document.getElementById('restart-btn').addEventListener('click', () => {
        resetApp();
    });

    // Scroll controls
    setupScrollControls();

    // Scenario buttons
    document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const scenario = e.target.dataset.scenario;
            generateReflectionProducts(scenario);
        });
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function generateFeed() {
    const container = document.getElementById('feed-container');
    container.innerHTML = '';

    // Track bereits verwendete Captions und Bilder
    const usedCaptions = new Set();
    const usedImages = new Set();
    
    // Sammle alle verfügbaren Posts (Kategorie + Caption + Bild)
    const availablePosts = [];
    
    categories.forEach(category => {
        const captionsList = getRandomCaption(category.name, true); // Alle Captions für diese Kategorie
        const categoryMapping = postImageMapping[category.id] || {};
        const fallbackImages = categoryImages[category.id] || [];
        
        // Durchlaufe alle Captions für diese Kategorie
        Object.keys(categoryMapping).forEach(caption => {
            const image = categoryMapping[caption];
            if (image) {
                availablePosts.push({
                    category: category,
                    caption: caption,
                    image: image
                });
            }
        });
        
        // Füge auch Fallback-Bilder hinzu (wenn keine spezifische Zuordnung existiert)
        // Verwende nur Captions, die noch nicht in categoryMapping sind
        const unmappedCaptions = captionsList.filter(caption => !categoryMapping[caption]);
        fallbackImages.forEach((image, imageIndex) => {
            if (imageIndex < unmappedCaptions.length) {
                availablePosts.push({
                    category: category,
                    caption: unmappedCaptions[imageIndex],
                    image: image
                });
            }
        });
    });
    
    // Mische die verfügbaren Posts
    const shuffledPosts = availablePosts.sort(() => Math.random() - 0.5);
    
    // Wähle 15 eindeutige Posts (ohne doppelte Captions oder Bilder)
    const selectedPosts = [];
    for (const post of shuffledPosts) {
        if (selectedPosts.length >= 15) break;
        
        // Prüfe ob Caption oder Bild bereits verwendet wurde
        if (!usedCaptions.has(post.caption) && !usedImages.has(post.image)) {
            selectedPosts.push(post);
            usedCaptions.add(post.caption);
            usedImages.add(post.image);
        }
    }
    
    // Generiere Feed-Items
    selectedPosts.forEach((post, index) => {
        const item = createFeedItemWithData(post.category, index, post.caption, post.image);
        container.appendChild(item);
    });
    
    // Stelle sicher, dass vorhandene Kommentare angezeigt werden
    restoreComments();
    
    // Adjust feed width to maintain 1:1 aspect ratio for images
    adjustFeedWidth();
    
    // Update scroll buttons
    setTimeout(() => {
        const feedContainer = document.getElementById('feed-container');
        if (feedContainer) {
            feedContainer.dispatchEvent(new Event('scroll'));
        }
    }, 100);
}

function restoreComments() {
    // Stelle alle vorhandenen Kommentare wieder her
    userProfile.comments.forEach(comment => {
        const feedItems = document.querySelectorAll('.feed-item');
        const postItem = Array.from(feedItems).find(item => item.dataset.index == comment.postIndex);
        
        if (postItem) {
            const commentContainer = postItem.querySelector('.comment-container');
            if (commentContainer) {
                showComment(commentContainer, comment.text, comment.postIndex);
            }
        }
    });
}

function setupScrollControls() {
    const feedContainer = document.getElementById('feed-container');
    const scrollUpBtn = document.getElementById('scroll-up-btn');
    const scrollDownBtn = document.getElementById('scroll-down-btn');

    if (!feedContainer || !scrollUpBtn || !scrollDownBtn) return;

    function updateScrollButtons() {
        const scrollTop = feedContainer.scrollTop;
        const scrollHeight = feedContainer.scrollHeight;
        const clientHeight = feedContainer.clientHeight;

        // Prüfe ob oben
        scrollUpBtn.disabled = scrollTop <= 0;
        
        // Prüfe ob unten
        scrollDownBtn.disabled = scrollTop + clientHeight >= scrollHeight - 1;
    }

    // Initial update
    updateScrollButtons();

    // Update beim Scrollen
    feedContainer.addEventListener('scroll', updateScrollButtons);

    // Scroll nach oben
    scrollUpBtn.addEventListener('click', () => {
        const feedItems = feedContainer.querySelectorAll('.feed-item');
        if (feedItems.length === 0) return;

        const scrollTop = feedContainer.scrollTop;
        const containerHeight = feedContainer.clientHeight;
        
        // Finde aktuell sichtbaren Post
        let currentIndex = -1;
        feedItems.forEach((item, index) => {
            const itemTop = item.offsetTop;
            const itemHeight = item.offsetHeight;
            if (scrollTop >= itemTop && scrollTop < itemTop + itemHeight) {
                currentIndex = index;
            }
        });

        // Scroll zum vorherigen Post
        if (currentIndex > 0) {
            feedItems[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            feedContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // Scroll nach unten
    scrollDownBtn.addEventListener('click', () => {
        const feedItems = feedContainer.querySelectorAll('.feed-item');
        if (feedItems.length === 0) return;

        const scrollTop = feedContainer.scrollTop;
        const containerHeight = feedContainer.clientHeight;
        
        // Finde aktuell sichtbaren Post
        let currentIndex = -1;
        feedItems.forEach((item, index) => {
            const itemTop = item.offsetTop;
            const itemHeight = item.offsetHeight;
            if (scrollTop >= itemTop && scrollTop < itemTop + itemHeight) {
                currentIndex = index;
            }
        });

        // Scroll zum nächsten Post
        if (currentIndex >= 0 && currentIndex < feedItems.length - 1) {
            feedItems[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (currentIndex === -1 && feedItems.length > 0) {
            // Wenn kein Post gefunden, scroll zum ersten
            feedItems[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // Scroll zum Ende
            feedContainer.scrollTo({ top: feedContainer.scrollHeight, behavior: 'smooth' });
        }
    });

    // Update beim Resize
    window.addEventListener('resize', updateScrollButtons);
}

function adjustFeedWidth() {
    const feedContainer = document.getElementById('feed-container');
    const feedItems = feedContainer.querySelectorAll('.feed-item');
    
    if (feedItems.length === 0) return;
    
    // Get the first feed item to calculate dimensions
    const firstItem = feedItems[0];
    const header = firstItem.querySelector('.feed-item-header');
    const actions = firstItem.querySelector('.feed-item-actions');
    
    // Calculate available height for image (container height minus header and actions)
    const containerHeight = feedContainer.clientHeight;
    const headerHeight = header ? header.offsetHeight : 60;
    const actionsHeight = actions ? actions.offsetHeight : 100;
    const imageHeight = containerHeight - headerHeight - actionsHeight;
    
    // Set feed item width to match image height (1:1 aspect ratio)
    // Ensure minimum width of 300px and maximum of 600px
    const feedWidth = Math.max(300, Math.min(600, imageHeight));
    
    feedItems.forEach(item => {
        item.style.width = `${feedWidth}px`;
        item.style.maxWidth = `${feedWidth}px`;
    });
    
    // Adjust feed container width to match
    feedContainer.style.maxWidth = `${feedWidth}px`;
}

function createFeedItem(category, index) {
    // Generiere Caption und Bild
    const caption = getRandomCaption(category.name);
    let selectedImage = null;
    const categoryMapping = postImageMapping[category.id];
    if (categoryMapping && categoryMapping[caption]) {
        selectedImage = categoryMapping[caption];
    } else {
        const availableImages = categoryImages[category.id] || [];
        if (availableImages.length > 0) {
            selectedImage = availableImages[Math.floor(Math.random() * availableImages.length)];
        }
    }
    
    return createFeedItemWithData(category, index, caption, selectedImage);
}

function createFeedItemWithData(category, index, caption, selectedImage) {
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.dataset.category = category.id;
    item.dataset.index = index;

    const isVideo = Math.random() > 0.5;
    // Wähle Username basierend auf der Kategorie
    const categoryUsernameList = categoryUsernames[category.id] || [category.name.toLowerCase()];
    const username = categoryUsernameList[Math.floor(Math.random() * categoryUsernameList.length)];
    const likes = Math.floor(Math.random() * 5000) + 100;
    // Beim Neustart sollen keine Aktionen ausgewählt sein
    const hasLiked = false;
    
    const hasImage = selectedImage !== null;

    item.innerHTML = `
        <div class="feed-item-header">
            <div class="feed-item-avatar">${category.icon}</div>
            <span class="feed-item-username">${username}</span>
        </div>
        <div class="feed-item-content">
            ${hasImage ? 
                `<img src="${selectedImage}" alt="${category.name}" class="feed-post-image">
                <button class="ai-badge-btn" data-post-index="${index}" title="KI-generiertes Bild">
                    <svg width="16" height="16" viewBox="0 0 220 220" fill="currentColor">
                        <path d="M220.996,117.442c-61.631,10.702 -94.925,46.296 -103.554,103.554c-3.175,3.175 -8.331,3.175 -11.506,0c-10.245,-57.736 -43.889,-93.09 -103.555,-103.554c-3.175,-3.175 -3.175,-8.331 0,-11.506c59.683,-10.083 93.292,-45.484 103.555,-103.555c3.175,-3.175 8.331,-3.175 11.506,0c9.741,57.55 42.96,93.277 103.554,103.555c3.175,3.175 3.175,8.331 0,11.506Z"/>
                    </svg>
                </button>
                <div class="ai-tooltip" data-post-index="${index}">
                    <div class="ai-tooltip-content">
                        <strong>Dieses Bild ist KI-generiert</strong>
                        <p>Viele Bilder auf Social Media sind nicht echt - überlege immer, ob ein Bild auch KI-generiert sein könnte.</p>
                    </div>
                </div>` :
                `<div class="feed-media-placeholder" style="background: ${category.color}20; color: ${category.color};">
                    ${category.icon}
                </div>`
            }
        </div>
        <div class="feed-item-actions">
            <div class="feed-item-actions-top">
                <button class="action-btn like-btn ${hasLiked ? 'active' : ''}" data-action="like" title="Gefällt mir">
                    ${hasLiked ? '❤️' : '🤍'}
                </button>
                <button class="action-btn comment-btn" data-action="comment" title="Kommentieren">💬</button>
                <button class="action-btn share-btn" data-action="share" title="Teilen">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                </button>
            </div>
            <div class="feed-item-likes" data-likes="${likes}">${likes.toLocaleString('de-DE')} gefällt das</div>
            <div class="feed-item-caption">
                <span class="username">${username}</span>
                <span>${caption}</span>
            </div>
            <div class="feed-item-comments-section" data-post-index="${index}">
                <div class="comment-container"></div>
            </div>
        </div>
    `;

    // Add event listeners
    const likeBtn = item.querySelector('.like-btn');
    const likesElement = item.querySelector('.feed-item-likes');
    likeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isActive = likeBtn.classList.contains('active');
        let currentLikes = parseInt(likesElement.dataset.likes) || 0;
        
        if (isActive) {
            // Unlike - verringere Like-Zahl
            likeBtn.classList.remove('active');
            likeBtn.textContent = '🤍';
            currentLikes = Math.max(0, currentLikes - 1);
        } else {
            // Like - erhöhe Like-Zahl
            likeBtn.classList.add('active');
            likeBtn.textContent = '❤️';
            currentLikes += 1;
        }
        
        // Aktualisiere Like-Zahl
        likesElement.dataset.likes = currentLikes;
        likesElement.textContent = `${currentLikes.toLocaleString('de-DE')} gefällt das`;
        
        // Nur bei Like zählen, nicht bei Unlike
        if (!isActive) {
            handleAction('like', category.id, index);
        } else {
            // Bei Unlike die Aktion rückgängig machen
            userProfile.totalActions = Math.max(0, userProfile.totalActions - 1);
            document.getElementById('action-count').textContent = userProfile.totalActions;
            userProfile.interests[category.id] = Math.max(0, userProfile.interests[category.id] - 10);
            userProfile.personality.social = Math.max(0, userProfile.personality.social - 2);
        }
    });

    // Share-Button Event-Listener
    const shareBtn = item.querySelector('.share-btn');
    shareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isActive = shareBtn.classList.contains('active');
        if (isActive) {
            shareBtn.classList.remove('active');
        } else {
            shareBtn.classList.add('active');
        }
        handleAction('share', category.id, index);
    });

    // Kommentar-Button Event-Listener
    const commentBtn = item.querySelector('.comment-btn');
    commentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Prüfe, ob bereits ein Kommentar existiert
        const existingComment = userProfile.comments.find(c => c.postIndex == index);
        if (!existingComment) {
            // Fokussiere das Kommentarfeld nur wenn noch kein Kommentar existiert
            const commentInput = item.querySelector('.comment-input');
            if (commentInput) {
                commentInput.focus();
            }
        }
    });

    // Kommentar-Event-Listener
    setupCommentSection(item, index, category.id);

    // AI Badge Button Event-Listener
    const aiBadgeBtn = item.querySelector('.ai-badge-btn');
    if (aiBadgeBtn) {
        aiBadgeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const tooltip = item.querySelector('.ai-tooltip');
            if (tooltip) {
                // Schließe alle anderen Tooltips
                document.querySelectorAll('.ai-tooltip').forEach(t => {
                    if (t !== tooltip) {
                        t.classList.remove('active');
                    }
                });
                // Toggle dieses Tooltip
                tooltip.classList.toggle('active');
            }
        });
    }

    // Lade Profilbild des Schülers
    loadStudentAvatar();

    return item;
}

// Kommentar-Funktionen
function setupCommentSection(postItem, postIndex, category) {
    const commentContainer = postItem.querySelector('.comment-container');
    
    // Prüfe, ob bereits ein Kommentar für diesen Post existiert
    const existingComment = userProfile.comments.find(c => c.postIndex == postIndex);
    
    if (existingComment) {
        // Zeige den vorhandenen Kommentar an
        showComment(commentContainer, existingComment.text, postIndex);
    } else {
        // Zeige das Eingabefeld
        showCommentInput(commentContainer, postIndex, category);
    }
}

function showCommentInput(container, postIndex, category) {
    container.innerHTML = `
        <div class="comment-input-container">
            <div class="comment-avatar">
                <img src="/imgs/profile_placeholder.png" alt="Dein Profilbild" class="student-avatar-img" onerror="this.src='/imgs/profile_placeholder.png'">
            </div>
            <input type="text" class="comment-input" placeholder="Kommentar hinzufügen..." data-post-index="${postIndex}">
            <button class="comment-submit-btn" data-post-index="${postIndex}" title="Absenden">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            </button>
        </div>
    `;
    
    // Lade Profilbild
    loadStudentAvatar();
    
    const commentInput = container.querySelector('.comment-input');
    const submitBtn = container.querySelector('.comment-submit-btn');
    
    // Funktion zum Absenden des Kommentars
    const submitComment = () => {
        if (commentInput.value.trim()) {
            addComment(postIndex, commentInput.value.trim(), category);
        }
    };
    
    // Enter-Taste
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitComment();
        }
    });
    
    // Absenden-Button
    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        submitComment();
    });
    
    // Aktiviere/Deaktiviere Button basierend auf Input
    commentInput.addEventListener('input', () => {
        if (commentInput.value.trim()) {
            submitBtn.classList.add('active');
        } else {
            submitBtn.classList.remove('active');
        }
    });
}

function showComment(container, commentText, postIndex) {
    // Lade Profilbild
    const avatarImg = container.closest('.feed-item').querySelector('.student-avatar-img, .comment-avatar img');
    let avatarSrc = '/imgs/profile_placeholder.png';
    if (avatarImg && avatarImg.src && !avatarImg.src.includes('profile_placeholder')) {
        avatarSrc = avatarImg.src;
    }
    
    container.innerHTML = `
        <div class="comment-item">
            <div class="comment-avatar">
                <img src="${avatarSrc}" alt="Profilbild" onerror="this.src='/imgs/profile_placeholder.png'">
            </div>
            <div class="comment-content">
                <span class="comment-username">Du</span>
                <span class="comment-text">${escapeHtml(commentText)}</span>
            </div>
        </div>
    `;
}

function addComment(postIndex, commentText, category) {
    // Prüfe, ob bereits ein Kommentar für diesen Post existiert
    const existingCommentIndex = userProfile.comments.findIndex(c => c.postIndex == postIndex);
    
    if (existingCommentIndex !== -1) {
        // Aktualisiere vorhandenen Kommentar
        userProfile.comments[existingCommentIndex].text = commentText;
        userProfile.comments[existingCommentIndex].timestamp = Date.now();
    } else {
        // Füge neuen Kommentar hinzu
        userProfile.comments.push({
            postIndex,
            category,
            text: commentText,
            timestamp: Date.now()
        });
    }

    // Zeige Kommentar im Feed an (ersetzt das Eingabefeld)
    const feedItems = document.querySelectorAll('.feed-item');
    const postItem = Array.from(feedItems).find(item => item.dataset.index == postIndex);
    
    if (postItem) {
        const commentContainer = postItem.querySelector('.comment-container');
        showComment(commentContainer, commentText, postIndex);
    }

    // Zähle als Aktion (nur beim ersten Kommentar)
    if (existingCommentIndex === -1) {
        handleAction('comment', category, postIndex);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadStudentAvatar() {
    // Versuche Avatar-Daten vom Server zu laden
    fetch('/api/students/get_profile.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.student) {
                const avatarSeed = data.student.avatar_seed;
                const avatarStyle = data.student.avatar_style || 'avataaars';
                
                if (avatarSeed) {
                    const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;
                    // Aktualisiere alle Avatar-Bilder (auch die, die später hinzugefügt werden)
                    updateAllAvatars(avatarUrl);
                }
            }
        })
        .catch(error => {
            console.log('Avatar konnte nicht geladen werden, verwende Platzhalter');
        });
}

function updateAllAvatars(avatarUrl) {
    const avatarImages = document.querySelectorAll('#student-avatar-img, .student-avatar-img, .comment-avatar img');
    avatarImages.forEach(img => {
        img.src = avatarUrl;
        img.onerror = function() {
            this.src = '/imgs/profile_placeholder.png';
        };
    });
}

function getRandomCaption(category, returnAll = false) {
    const captions = {
        'Sport': ['Was für ein Spiel! 🔥', 'Training war heute richtig gut 💪', 'Wir haben es geschafft! 🏆'],
        'Musik': ['Neuer Song ist raus! 🎵', 'Konzert war unglaublich! 🎸', 'Diese Melodie geht mir nicht mehr aus dem Kopf 🎶'],
        'Gaming': ['Endlich Diamond!!! 🎮', 'Soooo entspannend, ich liebe es!', 'Das Spiel ist so süchtig machend 🎯'],
        'Kochen': ['Selbstgemacht schmeckt am besten! 👨‍🍳', 'Neues Rezept ausprobiert 🍳', 'So lecker! 😋'],
        'Tutorials': ['So viel gelernt heute! 📚', 'Endlich verstanden! 💡', 'Super erklärt! 👏'],
        'Mode': ['Neues Outfit! 👗', 'Die muss ich haben! 😍', 'OMG! Ich lieb meinen neuen Strickpulli sooo sehr! 🤩'],
        'DIY': ['Selbst gebaut! 🔨✌', 'Kann gar nicht aufhören! Stricke direkt noch einen 🧶🤩', '´Beim Malen kann man so gut runterkommen! 🎨'],
        'Tech': ['Das neue Modell ist draußen! 💻', 'Hab sooo lang drauf gewartet! 📱', 'Mit dem neuen Lüfter ist das Teil so viel leiser! ⚡'],
        'Tiere': ['Er hat die Blume dann aufgefressen! 😁😂', 'Mein Liebling total entspannt 🐱😴', 'Bissl Bewegung und frische Luft für uns beide! 🐕'],
        'Reisen': ['Meeega traumhaft hier! ✈️', 'Neue Abenteuer! 🗺️', 'Neue Kulturen entdecken ist sooo spannend! 🌍']
    };
    const categoryCaptions = captions[category] || ['Cool!', 'Interessant!', 'Gefällt mir!'];
    
    if (returnAll) {
        return categoryCaptions;
    }
    return categoryCaptions[Math.floor(Math.random() * categoryCaptions.length)];
}

function handleAction(action, category, index) {
    userProfile.totalActions++;
    document.getElementById('action-count').textContent = userProfile.totalActions;

    const actionData = {
        action,
        category,
        timestamp: Date.now()
    };

    userProfile.actions.push(actionData);

    // Update profile based on action
    switch(action) {
        case 'like':
            userProfile.interests[category] += 10;
            userProfile.personality.social += 2;
            break;
        case 'superlike':
            userProfile.interests[category] += 20;
            userProfile.personality.impulsive += 3;
            userProfile.personality.social += 3;
            break;
        case 'repeat':
            userProfile.interests[category] += 15;
            userProfile.personality.creative += 2;
            break;
        case 'share':
            userProfile.interests[category] += 12;
            userProfile.personality.social += 3;
            break;
        case 'skip':
            userProfile.interests[category] -= 5;
            break;
        case 'comment':
            // Kommentare geben mehr Punkte, da sie länger dauern als ein Like
            userProfile.interests[category] += 15;
            userProfile.personality.social += 8;
            break;
    }

    // Ensure values don't go negative
    Object.keys(userProfile.interests).forEach(key => {
        if (userProfile.interests[key] < 0) userProfile.interests[key] = 0;
    });

    // Aktiviere Profil-Button nach 5 Aktionen
    const profileBtn = document.getElementById('show-profile-btn');
    if (userProfile.totalActions >= 5) {
        profileBtn.classList.remove('profile-btn-disabled');
        profileBtn.title = '';
    }

    // Show popup after 8 actions (only once)
    if (userProfile.totalActions === 8) {
        setTimeout(() => {
            showProfilePopup();
        }, 1000);
    }
}

function showProfilePopup() {
    const popup = document.getElementById('profile-popup');
    const summary = document.getElementById('profile-summary');
    
    // Calculate percentages based on total sum (so they add up to 100%)
    const totalInterest = Object.values(userProfile.interests).reduce((sum, val) => sum + val, 0);
    const percentages = {};
    Object.keys(userProfile.interests).forEach(key => {
        percentages[key] = totalInterest > 0 ? Math.round((userProfile.interests[key] / totalInterest) * 100) : 0;
    });
    
    // Adjust for rounding errors to ensure sum equals 100%
    const percentageSum = Object.values(percentages).reduce((sum, val) => sum + val, 0);
    if (percentageSum !== 100 && totalInterest > 0) {
        // Find the interest with the highest value and adjust it
        const sortedInterests = Object.entries(percentages).sort((a, b) => {
            const valueA = userProfile.interests[a[0]];
            const valueB = userProfile.interests[b[0]];
            return valueB - valueA;
        });
        if (sortedInterests.length > 0) {
            const diff = 100 - percentageSum;
            percentages[sortedInterests[0][0]] += diff;
        }
    }

    // Get top interests
    const topInterests = Object.entries(userProfile.interests)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .filter(([_, value]) => value > 0);

    // Determine personality traits
    const personalityScores = userProfile.personality;
    const topPersonality = Object.entries(personalityScores)
        .sort((a, b) => b[1] - a[1])[0];

    // Estimate age group
    let ageGroup = 'Jugendlich';
    if (userProfile.totalActions > 20) ageGroup = 'Junge Erwachsene';

    // Zeige Popup - alle Elemente werden sofort erstellt, aber mit opacity: 0
    popup.classList.add('active');
    
    // Berechne Delays
    const totalBarsDelay = 3.5 + (topInterests.length - 1) * 0.5;
    
    // Erstelle alle Elemente auf einmal
    summary.innerHTML = `
        <h3 class="profile-summary h3" style="opacity: 0; animation: fadeIn 0.5s ease forwards; animation-delay: 3s;">Deine Interessen</h3>
        ${topInterests.map(([key, value], index) => {
            const category = categories.find(c => c.id === key);
            const percentage = percentages[key];
            return `
                <div class="interest-bar" style="opacity: 0; transform: translateY(10px); animation: slideInUp 0.5s ease forwards; animation-delay: ${3.5 + index * 0.5}s;">
                    <div class="interest-label">${category ? category.icon + ' ' + category.name : key}</div>
                    <div class="interest-progress">
                        <div class="interest-fill" data-percentage="${percentage}">0%</div>
                    </div>
                </div>
            `;
        }).join('')}
        <div class="profile-attributes" style="opacity: 0; animation: fadeIn 0.5s ease forwards; animation-delay: ${totalBarsDelay + 1.5}s;">
            <div class="attribute-card" style="opacity: 0; transform: translateY(10px); animation: slideInUp 0.5s ease forwards; animation-delay: ${totalBarsDelay + 2.5}s;">
                <div class="attribute-label">Geschätztes Alter</div>
                <div class="attribute-value">${ageGroup}</div>
            </div>
            <div class="attribute-card" style="opacity: 0; transform: translateY(10px); animation: slideInUp 0.5s ease forwards; animation-delay: ${totalBarsDelay + 3.5}s;">
                <div class="attribute-label">Persönlichkeit</div>
                <div class="attribute-value">${getPersonalityLabel(topPersonality[0])}</div>
            </div>
        </div>
    `;

    // Animiere die Balken und zähle die Prozentzahlen hoch
    const interestBars = summary.querySelectorAll('.interest-bar');
    interestBars.forEach((bar, index) => {
        setTimeout(() => {
            const fill = bar.querySelector('.interest-fill');
            const targetPercentage = parseInt(fill.dataset.percentage);
            let currentPercentage = 0;
            const increment = targetPercentage / 30; // 30 Schritte für 1.5 Sekunden
            
            const counter = setInterval(() => {
                currentPercentage += increment;
                if (currentPercentage >= targetPercentage) {
                    currentPercentage = targetPercentage;
                    clearInterval(counter);
                }
                fill.style.width = currentPercentage + '%';
                fill.textContent = Math.round(currentPercentage) + '%';
            }, 50);
        }, (3.5 + index * 0.5) * 1000);
    });
}

function getPersonalityLabel(trait) {
    const labels = {
        cautious: 'Vorsichtig',
        creative: 'Kreativ',
        impulsive: 'Impulsiv',
        social: 'Gesellig'
    };
    return labels[trait] || trait;
}

function closeProfilePopup() {
    document.getElementById('profile-popup').classList.remove('active');
}

function generateShoppingPage() {
    const container = document.getElementById('shopping-container');
    const isPersonalized = document.getElementById('personalization-toggle').checked;
    
    container.innerHTML = '';

    if (isPersonalized) {
        // Show personalized products
        const topCategories = Object.entries(userProfile.interests)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .filter(([_, value]) => value > 0)
            .map(([key]) => key);

        if (topCategories.length === 0) {
            topCategories.push('sport', 'music', 'tech'); // Default
        }

        topCategories.forEach(category => {
            if (products[category]) {
                products[category].slice(0, 2).forEach(product => {
                    const card = createProductCard(product, true);
                    container.appendChild(card);
                });
            }
        });

        // Add some non-personalized products
        const allCategories = Object.keys(products);
        const randomCategories = allCategories
            .filter(c => !topCategories.includes(c))
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);

        randomCategories.forEach(category => {
            if (products[category] && products[category].length > 0) {
                const product = products[category][0];
                const card = createProductCard(product, false);
                container.appendChild(card);
            }
        });
    } else {
        // Show non-personalized products
        const allCategories = Object.keys(products);
        const randomCategories = allCategories.sort(() => Math.random() - 0.5).slice(0, 6);

        randomCategories.forEach(category => {
            if (products[category] && products[category].length > 0) {
                const product = products[category][0];
                const card = createProductCard(product, false);
                container.appendChild(card);
            }
        });
    }
}

function createProductCard(product, personalized) {
    const card = document.createElement('div');
    card.className = `product-card ${personalized ? 'personalized' : ''}`;
    
    card.innerHTML = `
        <div class="product-image">${product.icon}</div>
        <div class="product-title">${product.name}</div>
        <div class="product-description">Hochwertiges Produkt für dich</div>
        <div class="product-price">${product.price}</div>
        ${personalized ? `<div class="product-reason">${product.reason}</div>` : ''}
    `;

    return card;
}

function generateTransparencyDashboard() {
    // 1. Influenced Content
    const influencedContent = document.getElementById('influenced-content');
    const recentActions = userProfile.actions.slice(-10);
    
    influencedContent.innerHTML = recentActions.map(action => {
        const category = categories.find(c => c.id === action.category);
        return `
            <div class="content-item">
                <span>${category ? category.icon + ' ' + category.name : action.category}</span>
                <span>${getActionLabel(action.action)}</span>
            </div>
        `;
    }).join('');

    // 2. Generated Profile
    const generatedProfile = document.getElementById('generated-profile');
    const topInterests = Object.entries(userProfile.interests)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .filter(([_, value]) => value > 0);

    // Calculate percentages based on total sum (so they add up to 100%)
    const totalInterest = Object.values(userProfile.interests).reduce((sum, val) => sum + val, 0);
    const percentages = {};
    Object.keys(userProfile.interests).forEach(key => {
        percentages[key] = totalInterest > 0 ? Math.round((userProfile.interests[key] / totalInterest) * 100) : 0;
    });
    
    // Adjust for rounding errors to ensure sum equals 100%
    const percentageSum = Object.values(percentages).reduce((sum, val) => sum + val, 0);
    if (percentageSum !== 100 && totalInterest > 0) {
        const sortedInterests = Object.entries(percentages).sort((a, b) => {
            const valueA = userProfile.interests[a[0]];
            const valueB = userProfile.interests[b[0]];
            return valueB - valueA;
        });
        if (sortedInterests.length > 0) {
            const diff = 100 - percentageSum;
            percentages[sortedInterests[0][0]] += diff;
        }
    }

    const personalityScores = userProfile.personality;
    const topPersonality = Object.entries(personalityScores)
        .sort((a, b) => b[1] - a[1])[0];

    let purchasePower = 'Mittel';
    if (userProfile.totalActions > 25) purchasePower = 'Hoch';
    if (userProfile.totalActions < 10) purchasePower = 'Niedrig';

    let riskLevel = 'Mittel';
    if (userProfile.personality.impulsive > 20) riskLevel = 'Hoch';
    if (userProfile.personality.cautious > 20) riskLevel = 'Niedrig';

    generatedProfile.innerHTML = `
        <div class="profile-card">
            <h4>Top 5 Interessen</h4>
            <ul>
                ${topInterests.map(([key, value]) => {
                    const category = categories.find(c => c.id === key);
                    const percentage = percentages[key];
                    return `<li>${category ? category.name : key}: ${percentage}%</li>`;
                }).join('')}
            </ul>
        </div>
        <div class="profile-card">
            <h4>Wahrscheinliche Produktkategorien</h4>
            <ul>
                ${topInterests.slice(0, 3).map(([key]) => {
                    const categoryNames = {
                        sport: 'Sportartikel',
                        music: 'Musik & Audio',
                        gaming: 'Gaming',
                        fashion: 'Mode & Kleidung',
                        tech: 'Elektronik',
                        animals: 'Tierprodukte',
                        cooking: 'Küchenartikel',
                        travel: 'Reisezubehör',
                        diy: 'Bastelbedarf',
                        tutorials: 'Lernmaterialien'
                    };
                    return `<li>${categoryNames[key] || key}</li>`;
                }).join('')}
            </ul>
        </div>
        <div class="profile-card">
            <h4>Geschätzte Persönlichkeit</h4>
            <p><strong>${getPersonalityLabel(topPersonality[0])}</strong></p>
            <p>Basierend auf deinem Verhalten</p>
        </div>
        <div class="profile-card">
            <h4>Kaufkraft</h4>
            <p><strong>${purchasePower}</strong></p>
        </div>
        <div class="profile-card">
            <h4>Risiko-Stufe für Manipulation</h4>
            <p><strong>${riskLevel}</strong></p>
        </div>
    `;

    // 3. Inferences
    const inferences = document.getElementById('inferences');
    const inferenceList = [];
    
    topInterests.slice(0, 3).forEach(([key, value]) => {
        const category = categories.find(c => c.id === key);
        const actionCount = userProfile.actions.filter(a => a.category === key).length;
        inferenceList.push({
            text: `Weil du ${actionCount} ${category ? category.name : key}-Inhalte interagiert hast, glauben wir, dass du Interesse an ${getCategoryProducts(key)} hast.`,
            category: key
        });
    });

    inferences.innerHTML = inferenceList.map(inf => `
        <div class="inference-item">
            <p>${inf.text}</p>
        </div>
    `).join('');

    // 4. Advertisers
    const advertisers = document.getElementById('advertisers');
    const advertiserList = topInterests.slice(0, 3).map(([key]) => {
        const advertiserNames = {
            sport: 'Sportmarken (Nike, Adidas, Puma)',
            music: 'Musik-Streaming & Audio-Brands',
            gaming: 'Gaming-Shops & Hardware-Hersteller',
            fashion: 'Modeketten & Beauty-Brands',
            tech: 'Tech-Unternehmen & Elektronik-Shops',
            animals: 'Tierbedarf & Zoohandlungen',
            cooking: 'Küchenausstatter & Lebensmittelmarken',
            travel: 'Reisebüros & Reiseausrüster',
            diy: 'Baumärkte & Bastelgeschäfte',
            tutorials: 'Bildungsplattformen & Buchverlage'
        };
        return advertiserNames[key] || key;
    });

    advertisers.innerHTML = advertiserList.map(adv => `
        <div class="advertiser-item">
            <p>${adv}</p>
        </div>
    `).join('');
}

function getActionLabel(action) {
    const labels = {
        like: '👍 Geliked',
        superlike: '❤️ Supergeliked',
        repeat: '🔁 Wiederholt',
        share: '📤 Geteilt',
        skip: '🙈 Übersprungen',
        comment: '🗨️ Kommentiert'
    };
    return labels[action] || action;
}

function getCategoryProducts(category) {
    const productNames = {
        sport: 'Sportartikeln',
        music: 'Musik- und Audio-Produkten',
        gaming: 'Gaming-Ausrüstung',
        fashion: 'Mode und Kleidung',
        tech: 'Elektronik',
        animals: 'Tierprodukten',
        cooking: 'Küchenartikeln',
        travel: 'Reisezubehör',
        diy: 'Bastelbedarf',
        tutorials: 'Lernmaterialien'
    };
    return productNames[category] || category;
}

function generateReflectionMode() {
    generateReflectionProducts('normal');
}

function generateReflectionProducts(scenario) {
    const container = document.getElementById('reflection-products');
    container.innerHTML = '';

    let scenarioProfile = { ...userProfile.interests };

    switch(scenario) {
        case 'neutral':
            // Reset all interests
            Object.keys(scenarioProfile).forEach(key => {
                scenarioProfile[key] = 0;
            });
            break;
        case 'sport':
            Object.keys(scenarioProfile).forEach(key => {
                scenarioProfile[key] = key === 'sport' ? 100 : 0;
            });
            break;
        case 'music':
            Object.keys(scenarioProfile).forEach(key => {
                scenarioProfile[key] = key === 'music' ? 100 : 0;
            });
            break;
        case 'gaming':
            Object.keys(scenarioProfile).forEach(key => {
                scenarioProfile[key] = key === 'gaming' ? 100 : 0;
            });
            break;
        // 'normal' uses current profile
    }

    const topCategory = Object.entries(scenarioProfile)
        .sort((a, b) => b[1] - a[1])[0];

    if (topCategory && topCategory[1] > 0 && products[topCategory[0]]) {
        products[topCategory[0]].forEach(product => {
            const card = createProductCard(product, true);
            container.appendChild(card);
        });
    } else {
        // Show random products if no interest
        const randomCategories = Object.keys(products)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
        
        randomCategories.forEach(category => {
            if (products[category] && products[category].length > 0) {
                const product = products[category][0];
                const card = createProductCard(product, false);
                container.appendChild(card);
            }
        });
    }
}

function resetApp() {
    userProfile = {
        interests: {
            sport: 0,
            music: 0,
            gaming: 0,
            cooking: 0,
            tutorials: 0,
            fashion: 0,
            diy: 0,
            tech: 0,
            animals: 0,
            travel: 0
        },
        personality: {
            cautious: 0,
            creative: 0,
            impulsive: 0,
            social: 0
        },
        actions: [],
        totalActions: 0,
        watchTime: {},
        comments: []
    };

    document.getElementById('action-count').textContent = '0';
    const profileBtn = document.getElementById('show-profile-btn');
    profileBtn.classList.add('profile-btn-disabled');
    profileBtn.title = 'Du musst noch mehr im Feed machen, bevor du weitermachen kannst.';
    document.getElementById('summary-actions').textContent = '0';

    // Feed neu generieren, damit alle Aktionen zurückgesetzt sind
    if (document.getElementById('social-feed').classList.contains('active')) {
        generateFeed();
    }

    showScreen('welcome-screen');
}

// Add summary button to shopping actions after enough interactions
function checkForSummaryButton() {
    if (userProfile.totalActions >= 15) {
        const shoppingActions = document.querySelector('.shopping-actions');
        if (!document.getElementById('summary-btn')) {
            const summaryBtn = document.createElement('button');
            summaryBtn.id = 'summary-btn';
            summaryBtn.className = 'btn-primary';
            summaryBtn.textContent = '🎓 Zusammenfassung ansehen';
            summaryBtn.style.marginTop = '20px';
            summaryBtn.addEventListener('click', () => {
                document.getElementById('summary-actions').textContent = userProfile.totalActions;
                showScreen('summary-screen');
            });
            shoppingActions.appendChild(summaryBtn);
        }
    }
}



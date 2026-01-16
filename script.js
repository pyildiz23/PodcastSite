document.addEventListener("DOMContentLoaded", function () {

  /* ================= FORM VALIDATION ================= */
  const form = document.querySelector('.contact-form');
  const successMessage = document.getElementById('success-message');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const subject = document.getElementById('subject')?.value;
      const message = document.getElementById('message')?.value.trim();
      const privacy = document.getElementById('privacy')?.checked;

      const nameError = document.getElementById('name-error');
      const emailError = document.getElementById('email-error');
      const subjectError = document.getElementById('subject-error');
      const messageError = document.getElementById('message-error');
      const privacyError = document.getElementById('privacy-error');

      let valid = true;

      // Validation: Nom
      if (!name) {
        nameError && (nameError.style.display = 'block');
        valid = false;
      } else {
        nameError && (nameError.style.display = 'none');
      }

      // Validation: Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        emailError && (emailError.style.display = 'block');
        valid = false;
      } else {
        emailError && (emailError.style.display = 'none');
      }

      // Validation: Sujet
      if (!subject) {
        subjectError && (subjectError.style.display = 'block');
        valid = false;
      } else {
        subjectError && (subjectError.style.display = 'none');
      }

      // Validation: Message
      if (!message) {
        messageError && (messageError.style.display = 'block');
        valid = false;
      } else {
        messageError && (messageError.style.display = 'none');
      }

      // Validation: Privacy
      if (!privacy) {
        privacyError && (privacyError.style.display = 'block');
        valid = false;
      } else {
        privacyError && (privacyError.style.display = 'none');
      }

      // Si tout est valide
      if (valid) {
        // Afficher le message de succès
        if (successMessage) {
          successMessage.style.display = 'block';
          successMessage.style.opacity = '1';
          
          setTimeout(() => {
            successMessage.style.opacity = '0';
            setTimeout(() => {
              successMessage.style.display = 'none';
            }, 500);
          }, 4000);
        }

        // Réinitialiser le formulaire
        form.reset();
        
        // Cacher toutes les erreurs
        [nameError, emailError, subjectError, messageError, privacyError].forEach(err => {
          if (err) err.style.display = 'none';
        });
      }
    });
  }

  /* ================= HAMBURGER MENU ================= */
  const toggleBtn = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener("click", () => navLinks.classList.toggle("active"));
    window.addEventListener("scroll", () => navLinks.classList.remove("active"));
  }

  /* ================= ACTIVE NAV LINK ================= */
  const navvLinks = document.querySelectorAll('.nav-links a');
  const currentPage = window.location.pathname.split("/").pop();
  navvLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });

  /* ================= ACCUEIL - DERNIERS ÉPISODES ================= */
  const recentPodcastsContainer = document.querySelector('.podcast-cards');
  
  if (recentPodcastsContainer) {
    loadRecentEpisodes();
  }

  function loadRecentEpisodes() {
    const RSS_URL = "https://anchor.fm/s/10dbe85d0/podcast/rss";
    const CACHE_KEY = 'recent_episodes_cache';
    const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

    // Skeleton loader pour la page d'accueil
    recentPodcastsContainer.innerHTML = Array(3).fill(0).map(() => `
      <div class="podcast-card" style="opacity: 0.6;">
        <div style="background: #e0e0e0; height: 200px; border-radius: 8px;"></div>
        <div style="height: 20px; background: #e0e0e0; border-radius: 4px; margin: 10px 0;"></div>
        <div style="height: 30px; background: #e0e0e0; border-radius: 20px; width: 100px;"></div>
      </div>
    `).join('');

    // Vérifier le cache
    const cachedData = getCachedRecentEpisodes();
    if (cachedData) {
      renderRecentEpisodes(cachedData);
      return;
    }

    // Charger depuis RSS
    fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`)
      .then(res => res.text())
      .then(xmlContent => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlContent, "text/xml");
        
        if (xml.querySelector("parsererror")) {
          throw new Error("Erreur XML");
        }

        const items = xml.querySelectorAll("item");
        const recentEpisodes = [];

        // Prendre les 3 premiers
        for (let i = 0; i < Math.min(3, items.length); i++) {
          const item = items[i];
          const enclosure = item.querySelector("enclosure");
          const audio = enclosure?.getAttribute("url");
          
          if (!audio) continue;

          const categoryTag = item.querySelector("category, itunes\\:category");
          const durationTag = item.querySelector("itunes\\:duration, duration");
          const pubDate = item.querySelector("pubDate");
          
          recentEpisodes.push({
            title: item.querySelector("title")?.textContent || "Sans titre",
            description: item.querySelector("description")?.textContent || "",
            category: categoryTag?.textContent || "Podcast",
            duration: durationTag?.textContent || null,
            pubDate: pubDate?.textContent || "",
            audio: audio,
            image: `images/accueil${i + 1}.jpg`
          });
        }

        // Mettre en cache
        setCachedRecentEpisodes(recentEpisodes);
        renderRecentEpisodes(recentEpisodes);
      })
      .catch(err => {
        console.error("Erreur chargement épisodes récents:", err);
        recentPodcastsContainer.innerHTML = `
          <p style="grid-column: 1/-1; text-align: center; color: #666;">
            Impossible de charger les épisodes récents.
          </p>
        `;
      });

    function getCachedRecentEpisodes() {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        const age = Date.now() - data.timestamp;
        
        if (age < CACHE_DURATION) {
          return data.episodes;
        }
        localStorage.removeItem(CACHE_KEY);
        return null;
      } catch (e) {
        return null;
      }
    }

    function setCachedRecentEpisodes(episodes) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          episodes: episodes,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn("Cache non disponible");
      }
    }

    function renderRecentEpisodes(episodes) {
      if (episodes.length === 0) {
        recentPodcastsContainer.innerHTML = `
          <p style="grid-column: 1/-1; text-align: center; color: #666;">
            Aucun épisode disponible pour le moment.
          </p>
        `;
        return;
      }

      recentPodcastsContainer.innerHTML = episodes.map((ep) => {
        const date = ep.pubDate ? new Date(ep.pubDate).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric"
        }) : '';
        
        const cleanDesc = (ep.description || '').replace(/<[^>]*>/g, '').substring(0, 100);
        const descText = cleanDesc ? cleanDesc + '...' : '';
        const duration = ep.duration ? formatDurationAccueil(ep.duration) : '';

        return `
          <div class="podcast-card">
            <img src="${ep.image}" alt="Couverture podcast">
            <a href="episodes.html?episode=${encodeURIComponent(ep.title)}" style="display: block; padding: 15px 10px 5px; text-decoration: none; color: #252524; font-weight: bold; font-size: 1rem;">
              ${ep.title}
            </a>
            ${descText ? `<p style="padding: 0 15px; font-size: 0.9rem; color: #666; line-height: 1.5; margin-bottom: 10px;">
              ${descText}
            </p>` : ''}
            <div style="padding: 0 15px; display: flex; gap: 80px; font-size: 0.85rem; color: #888; margin-bottom: 15px; flex-wrap: wrap; align-items: center;">
              ${duration ? `<span style="display: inline-flex; align-items: center; gap: 6px; font-weight: 500;">⏱ ${duration}</span>` : ''}
              ${date ? `<span style="display: inline-flex; align-items: center; gap: 6px; font-weight: 500;">📅 ${date}</span>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }
    
    function formatDurationAccueil(duration) {
      if (!duration) return '';
      
      if (duration.includes(':')) {
        const parts = duration.split(':');
        const hours = parseInt(parts[0]);
        const mins = parseInt(parts[1]);
        
        if (hours > 0) return `${hours}h ${mins}min`;
        return `${mins} min`;
      }
      
      const totalMins = Math.floor(parseInt(duration) / 60);
      if (totalMins >= 60) {
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        return `${h}h ${m}min`;
      }
      return `${totalMins} min`;
    }
  }

  /* ================= PODCAST RSS - ULTRA RAPIDE ================= */

  const RSS_URL = "https://anchor.fm/s/10dbe85d0/podcast/rss";
  const container = document.getElementById("episodes-container");
  const loadMoreBtn = document.getElementById("load-more");
  const searchInput = document.querySelector(".search-input");

  // ========== GLOBAL STICKY PLAYER FUNCTIONS (pour toutes les pages) ==========
  
  function showStickyPlayer(title, audioUrl) {
    let stickyPlayer = document.getElementById('sticky-player');
    
    if (!stickyPlayer) {
      stickyPlayer = document.createElement('div');
      stickyPlayer.id = 'sticky-player';
      stickyPlayer.innerHTML = `
        <div class="sticky-player-content">
          <div class="sticky-progress-container">
            <div class="sticky-progress-bar"></div>
          </div>
          <div class="sticky-main">
            <div class="sticky-info">
              <div class="sticky-artwork">🎙️</div>
              <div class="sticky-text">
                <p class="sticky-title"></p>
                <p class="sticky-subtitle">Échos Perdus</p>
              </div>
            </div>
            
            <div class="sticky-controls-center">
              <div class="sticky-buttons">
                <button class="sticky-btn sticky-prev-btn" title="Précédent">⏮</button>
                <button class="sticky-btn sticky-play-btn">▶</button>
                <button class="sticky-btn sticky-next-btn" title="Suivant">⏭</button>
              </div>
              <div class="sticky-time-display">
                <span class="sticky-current-time">0:00</span>
                <span class="sticky-duration">0:00</span>
              </div>
            </div>
            
            <div class="sticky-controls-right">
              <div class="sticky-volume-container">
                <span class="sticky-volume-icon">🔊</span>
                <div class="sticky-volume-slider">
                  <div class="sticky-volume-bar"></div>
                </div>
              </div>
              <button class="sticky-close-btn" title="Fermer">✕</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(stickyPlayer);

      const player = document.getElementById('player');
      const playBtn = stickyPlayer.querySelector('.sticky-play-btn');
      const closeBtn = stickyPlayer.querySelector('.sticky-close-btn');
      const progressContainer = stickyPlayer.querySelector('.sticky-progress-container');
      const progressBar = stickyPlayer.querySelector('.sticky-progress-bar');
      const currentTimeEl = stickyPlayer.querySelector('.sticky-current-time');
      const durationEl = stickyPlayer.querySelector('.sticky-duration');
      const volumeSlider = stickyPlayer.querySelector('.sticky-volume-slider');
      const volumeBar = stickyPlayer.querySelector('.sticky-volume-bar');
      const volumeIcon = stickyPlayer.querySelector('.sticky-volume-icon');

      // Play/Pause
      playBtn.onclick = () => {
        if (player.paused) {
          player.play();
        } else {
          player.pause();
        }
      };

      player.onplay = () => {
        playBtn.textContent = '❚❚';
        // Sauvegarder l'état "playing"
        try {
          const saved = localStorage.getItem('currentPodcast');
          if (saved) {
            const data = JSON.parse(saved);
            data.isPlaying = true;
            localStorage.setItem('currentPodcast', JSON.stringify(data));
          }
        } catch (e) {}
      };

      player.onpause = () => {
        playBtn.textContent = '▶';
        // Sauvegarder l'état "paused"
        try {
          const saved = localStorage.getItem('currentPodcast');
          if (saved) {
            const data = JSON.parse(saved);
            data.isPlaying = false;
            localStorage.setItem('currentPodcast', JSON.stringify(data));
          }
        } catch (e) {}
      };

      // Progress bar
      player.ontimeupdate = () => {
        if (player.duration) {
          const progress = (player.currentTime / player.duration) * 100;
          progressBar.style.width = progress + '%';
          currentTimeEl.textContent = formatTime(player.currentTime);
        }
      };

      player.onloadedmetadata = () => {
        durationEl.textContent = formatTime(player.duration);
      };

      // Click progress bar to seek
      progressContainer.onclick = (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        player.currentTime = percent * player.duration;
      };

      // Volume control
      volumeSlider.onclick = (e) => {
        const rect = volumeSlider.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        player.volume = Math.max(0, Math.min(1, percent));
        volumeBar.style.width = (percent * 100) + '%';
        updateVolumeIcon(percent);
      };

      volumeIcon.onclick = () => {
        if (player.volume > 0) {
          player.dataset.prevVolume = player.volume;
          player.volume = 0;
          volumeBar.style.width = '0%';
          volumeIcon.textContent = '🔇';
        } else {
          player.volume = player.dataset.prevVolume || 1;
          volumeBar.style.width = (player.volume * 100) + '%';
          updateVolumeIcon(player.volume);
        }
      };

      function updateVolumeIcon(volume) {
        if (volume === 0) volumeIcon.textContent = '🔇';
        else if (volume < 0.5) volumeIcon.textContent = '🔉';
        else volumeIcon.textContent = '🔊';
      }

      // Close button
      closeBtn.onclick = () => {
        player.pause();
        hideStickyPlayer();
        try {
          localStorage.removeItem('currentPodcast');
        } catch (e) {}
      };

      // Prev/Next buttons (placeholder)
      stickyPlayer.querySelector('.sticky-prev-btn').onclick = () => {
        console.log('Previous episode (not implemented)');
      };
      
      stickyPlayer.querySelector('.sticky-next-btn').onclick = () => {
        console.log('Next episode (not implemented)');
      };
    }

    stickyPlayer.querySelector('.sticky-title').textContent = title;
    stickyPlayer.classList.add('show');
    
    // Sauvegarder l'état initial
    try {
      const player = document.getElementById('player');
      localStorage.setItem('currentPodcast', JSON.stringify({
        title: title,
        audio: audioUrl,
        isPlaying: !player.paused,
        currentTime: player.currentTime || 0
      }));
    } catch (e) {}
  }

  function hideStickyPlayer() {
    const stickyPlayer = document.getElementById('sticky-player');
    if (stickyPlayer) {
      stickyPlayer.classList.remove('show');
    }
    try {
      localStorage.removeItem('currentPodcast');
    } catch (e) {}
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Restaurer le podcast en cours si on change de page
  function restorePlayer() {
    try {
      const saved = localStorage.getItem('currentPodcast');
      if (!saved) return;
      
      const data = JSON.parse(saved);
      const player = document.getElementById('player');
      
      if (!player || !data.audio) return;

      console.log('📻 Restauration:', data.title, 'à', data.currentTime + 's');

      // Définir la source et le temps
      player.src = data.audio;
      
      // Attendre que le metadata soit chargé
      player.addEventListener('loadedmetadata', function onLoaded() {
        player.currentTime = data.currentTime || 0;
        player.removeEventListener('loadedmetadata', onLoaded);
        
        // Reprendre la lecture si c'était en train de jouer
        if (data.isPlaying) {
          player.play().catch(() => {
            console.log('⚠️ Lecture automatique bloquée');
          });
        }
      });

      // Restaurer le player visuel
      showStickyPlayer(data.title, data.audio);

    } catch (e) {
      console.error('❌ Erreur restoration:', e);
    }
  }

  // Sauvegarder l'état toutes les secondes
  function startSyncInterval() {
    const player = document.getElementById('player');
    if (!player) return;

    setInterval(() => {
      try {
        const saved = localStorage.getItem('currentPodcast');
        if (saved && !player.paused) {
          const data = JSON.parse(saved);
          data.currentTime = player.currentTime;
          data.isPlaying = !player.paused;
          localStorage.setItem('currentPodcast', JSON.stringify(data));
        }
      } catch (e) {}
    }, 1000);
  }

  // Restaurer au chargement de TOUTES les pages
  console.log('🔍 Tentative de restauration du player...');
  restorePlayer();
  startSyncInterval();

  // Si on n'est PAS sur la page episodes, arrêter ici
  if (!container) {
    console.log('📄 Page non-episodes, player restauré');
    return;
  }

  // ========== CODE SPÉCIFIQUE À LA PAGE EPISODES ==========

  const LOAD_COUNT = 6;
  const CACHE_KEY = 'podcast_cache';
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  
  let visibleCount = LOAD_COUNT;
  let episodes = [];
  let channelCategory = "Podcast";

  // Vérifier si on vient d'un lien direct (depuis accueil)
  const urlParams = new URLSearchParams(window.location.search);
  const targetEpisode = urlParams.get('episode');

  // Skeleton loader (affichage instantané)
  showSkeletonLoader();

  // Vérifier le cache d'abord
  const cachedData = getCachedData();
  if (cachedData) {
    console.log("📦 Chargement depuis le cache");
    episodes = cachedData.episodes;
    channelCategory = cachedData.channelCategory;
    renderEpisodes();
    
    // Mettre à jour en arrière-plan
    fetchRSSInBackground();
  } else {
    // Pas de cache, charger normalement
    fetchRSS();
  }

  function showSkeletonLoader() {
    const skeletons = Array(3).fill(0).map(() => `
      <article class="cat-pod" style="opacity: 0.6; pointer-events: none;">
        <div class="play-icon" style="background: #e0e0e0;"></div>
        <div class="pod-text" style="width: 100%;">
          <div style="height: 20px; background: #e0e0e0; border-radius: 4px; width: 30%; margin-bottom: 8px;"></div>
          <div style="height: 24px; background: #e0e0e0; border-radius: 4px; width: 80%; margin-bottom: 8px;"></div>
          <div style="height: 16px; background: #e0e0e0; border-radius: 4px; width: 100%; margin-bottom: 4px;"></div>
          <div style="height: 16px; background: #e0e0e0; border-radius: 4px; width: 90%;"></div>
        </div>
      </article>
    `).join('');
    container.innerHTML = skeletons;
  }

  function getCachedData() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      const age = Date.now() - data.timestamp;
      
      if (age < CACHE_DURATION) {
        return data;
      }
      localStorage.removeItem(CACHE_KEY);
      return null;
    } catch (e) {
      return null;
    }
  }

  function setCachedData(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        episodes: data.episodes,
        channelCategory: data.channelCategory,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn("Cache non disponible");
    }
  }

  function fetchRSSInBackground() {
    fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`)
      .then(res => res.text())
      .then(parseRSSAndUpdate)
      .catch(() => {}); // Silencieux si erreur
  }

  function fetchRSS() {
    fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`)
      .then(res => {
        if (!res.ok) throw new Error("Erreur de chargement");
        return res.text();
      })
      .then(parseRSSAndUpdate)
      .catch(err => {
        console.error("Erreur RSS:", err);
        container.innerHTML = `
          <div style="text-align: center; padding: 60px 20px;">
            <p style="color: #e74c3c; font-size: 18px; margin-bottom: 10px;">⚠️ Erreur de chargement</p>
            <p style="color: #666;">Impossible de charger les podcasts. Veuillez réessayer.</p>
          </div>
        `;
      });
  }

  function parseRSSAndUpdate(xmlContent) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlContent, "text/xml");

    if (xml.querySelector("parsererror")) {
      throw new Error("Erreur XML");
    }

    const channelCat = xml.querySelector("channel > category");
    if (channelCat) channelCategory = channelCat.textContent;

    const items = xml.querySelectorAll("item");
    const newEpisodes = [];

    // Parse rapide avec boucle optimisée
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const enclosure = item.querySelector("enclosure");
      const audio = enclosure?.getAttribute("url");
      
      if (!audio) continue;

      const categoryTag = item.querySelector("category, itunes\\:category");
      const durationTag = item.querySelector("itunes\\:duration, duration");
      
      newEpisodes.push({
        title: item.querySelector("title")?.textContent || "Sans titre",
        description: item.querySelector("description")?.textContent || "",
        pubDate: item.querySelector("pubDate")?.textContent || "",
        audio: audio,
        duration: durationTag?.textContent || null,
        category: categoryTag?.textContent || channelCategory
      });
    }

    if (newEpisodes.length > 0) {
      episodes = newEpisodes;
      
      // Mettre en cache
      setCachedData({ episodes, channelCategory });
      
      // Générer SEO Schema
      generatePodcastSchema(newEpisodes);
      
      // Re-render
      renderEpisodes();
    }
  }

  function generatePodcastSchema(episodesList) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "PodcastSeries",
      "name": "Échos Perdus",
      "description": "Un espace où les voix retrouvent leur force. Podcast engagé qui offre une voix à celles qu'on entend trop rarement.",
      "url": window.location.origin,
      "author": {
        "@type": "Organization",
        "name": "Échos Perdus"
      },
      "image": window.location.origin + "/images/logo2.jpg",
      "inLanguage": "fr-FR",
      "genre": ["Society & Culture", "Health & Fitness"],
      "webFeed": "https://anchor.fm/s/10dbe85d0/podcast/rss"
    };

    if (episodesList && episodesList.length > 0) {
      schema.episode = episodesList.slice(0, 10).map((ep, index) => ({
        "@type": "PodcastEpisode",
        "name": ep.title,
        "description": (ep.description || '').replace(/<[^>]*>/g, '').substring(0, 200),
        "url": `${window.location.origin}/episodes.html?episode=${encodeURIComponent(ep.title)}`,
        "datePublished": ep.pubDate,
        "duration": ep.duration || "PT10M",
        "associatedMedia": {
          "@type": "MediaObject",
          "contentUrl": ep.audio
        },
        "episodeNumber": episodesList.length - index
      }));
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    
    console.log("✅ SEO Schema ajouté pour", episodesList.length, "épisodes");
  }

  function getFilteredEpisodes() {
    let filtered = episodes;

    // Filtre de recherche uniquement
    if (searchInput && searchInput.value.trim()) {
      const searchValue = searchInput.value.toLowerCase();
      filtered = filtered.filter(ep =>
        ep.title.toLowerCase().includes(searchValue) ||
        ep.description.toLowerCase().includes(searchValue)
      );
    }

    return filtered;
  }

  function renderEpisodes() {
    if (!container) return;
    
    const list = getFilteredEpisodes();
    const toShow = list.slice(0, visibleCount);
    
    if (toShow.length === 0) {
      container.innerHTML = "<p style='text-align: center; padding: 40px; color: #666;'>Aucun résultat trouvé.</p>";
      updateLoadMore(list);
      return;
    }

    // Optimisation: créer HTML string puis insérer une fois
    const html = toShow.map(ep => {
      const date = new Date(ep.pubDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

      const cleanDesc = ep.description.replace(/<[^>]*>/g, '').substring(0, 120) + '...';
      const durationHTML = ep.duration ? `<span class="duration">⏱ ${formatDuration(ep.duration)}</span>` : '';

      // Ajouter bouton de partage avec meilleur UX
      return `
        <article class="cat-pod" data-episode-title="${ep.title}">
          <div class="play-icon" data-audio="${ep.audio}">▶</div>
          <div class="pod-text">
            <span class="pod-category">${ep.category}</span>
            <p class="pod-title">${ep.title}</p>
            <p class="pod-desc">${cleanDesc}</p>
            <div class="pod-info">
              ${durationHTML}
              <span class="date">📅 ${date}</span>
              <button class="share-btn" data-episode="${encodeURIComponent(ep.title)}" title="Partager cet épisode">
                <span class="share-icon">🔗</span>
                <span class="share-text">Partager</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    container.innerHTML = html;
    bindAudio();
    bindShareButtons();
    updateLoadMore(list);

    // Si on vient d'un lien direct, scroll et auto-play
    if (targetEpisode) {
      setTimeout(() => scrollAndPlayEpisode(targetEpisode), 500);
    }
  }

  function bindShareButtons() {
    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        
        const episodeTitle = decodeURIComponent(btn.dataset.episode);
        const shareUrl = `${window.location.origin}/episodes.html?episode=${encodeURIComponent(episodeTitle)}`;
        
        // Mobile: Native share (meilleure UX)
        if (navigator.share) {
          navigator.share({
            title: episodeTitle,
            text: `🎧 Écoutez "${episodeTitle}" sur Échos Perdus`,
            url: shareUrl
          }).catch(() => {});
          return;
        }
        
        // Desktop: Copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
          const icon = btn.querySelector('.share-icon');
          const text = btn.querySelector('.share-text');
          
          // Success feedback
          icon.textContent = '✓';
          text.textContent = 'Copié';
          btn.classList.add('copied');
          
          // Reset après 2 secondes
          setTimeout(() => {
            icon.textContent = '🔗';
            text.textContent = 'Partager';
            btn.classList.remove('copied');
          }, 2000);
        }).catch(() => {
          // Fallback si clipboard ne marche pas
          alert(`Copiez ce lien :\n${shareUrl}`);
        });
      };
    });
  }

  function scrollAndPlayEpisode(episodeTitle) {
    const allPodcasts = document.querySelectorAll('.cat-pod');
    
    for (let pod of allPodcasts) {
      const title = pod.getAttribute('data-episode-title');
      if (title === episodeTitle) {
        // Highlight
        pod.style.border = '3px solid #FFC300';
        pod.style.boxShadow = '0 8px 30px rgba(255, 195, 0, 0.5)';
        
        // Scroll smooth
        pod.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-play après scroll complet (1500ms pour être sûr)
        setTimeout(() => {
          const playBtn = pod.querySelector('.play-icon');
          const player = document.getElementById("player");
          
          if (playBtn && player) {
            // Simuler un vrai clic utilisateur
            const audioUrl = playBtn.getAttribute('data-audio');
            if (audioUrl) {
              player.src = audioUrl;
              
              // Attendre que le player soit prêt
              player.addEventListener('loadeddata', function playOnce() {
                player.play().then(() => {
                  playBtn.textContent = "❚❚";
                  console.log("✅ Podcast lancé automatiquement");
                }).catch(err => {
                  console.log("ℹ️ Auto-play bloqué par le navigateur, cliquez pour écouter");
                });
                player.removeEventListener('loadeddata', playOnce);
              });
              
              player.load();
            }
          }
        }, 1500);
        
        break;
      }
    }
  }

  function formatDuration(duration) {
    if (!duration) return '';
    
    if (duration.includes(':')) {
      const parts = duration.split(':');
      const hours = parseInt(parts[0]);
      const mins = parseInt(parts[1]);
      
      if (hours > 0) return `${hours}h ${mins}min`;
      return `${mins} min`;
    }
    
    const totalMins = Math.floor(parseInt(duration) / 60);
    if (totalMins >= 60) {
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      return `${h}h ${m}min`;
    }
    return `${totalMins} min`;
  }

  function updateLoadMore(list) {
    if (!loadMoreBtn) return;
    loadMoreBtn.style.display = visibleCount >= list.length ? "none" : "inline-block";
  }

  loadMoreBtn?.addEventListener("click", () => {
    visibleCount += LOAD_COUNT;
    renderEpisodes();
  });

  searchInput?.addEventListener("input", () => {
    visibleCount = LOAD_COUNT;
    renderEpisodes();
  });

  function bindAudio() {
    const player = document.getElementById("player");
    if (!player) return;
    
    let currentBtn = null;
    let currentEpisode = null;

    document.querySelectorAll(".play-icon").forEach(btn => {
      btn.onclick = () => {
        if (!btn.dataset.audio) return;

        const podCard = btn.closest('.cat-pod');
        const episodeTitle = podCard?.querySelector('.pod-title')?.textContent || 'Podcast';

        if (currentBtn === btn && !player.paused) {
          player.pause();
          btn.textContent = "▶";
          hideStickyPlayer();
          return;
        }

        if (currentBtn) currentBtn.textContent = "▶";
        
        player.src = btn.dataset.audio;
        player.play().catch(err => {
          console.error("Erreur de lecture:", err);
          alert("Impossible de lire ce podcast. Veuillez réessayer.");
        });
        
        btn.textContent = "❚❚";
        currentBtn = btn;
        currentEpisode = episodeTitle;
        
        // Afficher sticky player
        showStickyPlayer(episodeTitle, btn.dataset.audio);
      };
    });

    player.onpause = () => {
      if (currentBtn) currentBtn.textContent = "▶";
    };

    player.onended = () => {
      if (currentBtn) currentBtn.textContent = "▶";
      hideStickyPlayer();
    };

    // Restaurer le player si on revient sur la page
    if (!player.paused && player.src) {
      const playingBtn = document.querySelector('.play-icon[data-audio="' + player.src + '"]');
      if (playingBtn) {
        playingBtn.textContent = "❚❚";
        currentBtn = playingBtn;
      }
    }
  }

  function showStickyPlayer(title, audioUrl) {
    let stickyPlayer = document.getElementById('sticky-player');
    
    if (!stickyPlayer) {
      stickyPlayer = document.createElement('div');
      stickyPlayer.id = 'sticky-player';
      stickyPlayer.innerHTML = `
        <div class="sticky-player-content">
          <div class="sticky-progress-container">
            <div class="sticky-progress-bar"></div>
          </div>
          <div class="sticky-main">
            <div class="sticky-info">
              <div class="sticky-artwork">🎙️</div>
              <div class="sticky-text">
                <p class="sticky-title"></p>
                <p class="sticky-subtitle">Échos Perdus</p>
              </div>
            </div>
            
            <div class="sticky-controls-center">
              <div class="sticky-buttons">
                <button class="sticky-btn sticky-prev-btn" title="Précédent">⏮</button>
                <button class="sticky-btn sticky-play-btn">▶</button>
                <button class="sticky-btn sticky-next-btn" title="Suivant">⏭</button>
              </div>
              <div class="sticky-time-display">
                <span class="sticky-current-time">0:00</span>
                <span class="sticky-duration">0:00</span>
              </div>
            </div>
            
            <div class="sticky-controls-right">
              <div class="sticky-volume-container">
                <span class="sticky-volume-icon">🔊</span>
                <div class="sticky-volume-slider">
                  <div class="sticky-volume-bar"></div>
                </div>
              </div>
              <button class="sticky-close-btn" title="Fermer">✕</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(stickyPlayer);

      const player = document.getElementById('player');
      const playBtn = stickyPlayer.querySelector('.sticky-play-btn');
      const closeBtn = stickyPlayer.querySelector('.sticky-close-btn');
      const progressContainer = stickyPlayer.querySelector('.sticky-progress-container');
      const progressBar = stickyPlayer.querySelector('.sticky-progress-bar');
      const currentTimeEl = stickyPlayer.querySelector('.sticky-current-time');
      const durationEl = stickyPlayer.querySelector('.sticky-duration');
      const volumeSlider = stickyPlayer.querySelector('.sticky-volume-slider');
      const volumeBar = stickyPlayer.querySelector('.sticky-volume-bar');
      const volumeIcon = stickyPlayer.querySelector('.sticky-volume-icon');

      // Play/Pause
      playBtn.onclick = () => {
        if (player.paused) {
          player.play();
        } else {
          player.pause();
        }
      };

      player.onplay = () => {
        playBtn.textContent = '❚❚';
      };

      player.onpause = () => {
        playBtn.textContent = '▶';
      };

      // Progress bar
      player.ontimeupdate = () => {
        if (player.duration) {
          const progress = (player.currentTime / player.duration) * 100;
          progressBar.style.width = progress + '%';
          currentTimeEl.textContent = formatTime(player.currentTime);
        }
      };

      player.onloadedmetadata = () => {
        durationEl.textContent = formatTime(player.duration);
      };

      // Click progress bar to seek
      progressContainer.onclick = (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        player.currentTime = percent * player.duration;
      };

      // Volume control
      volumeSlider.onclick = (e) => {
        const rect = volumeSlider.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        player.volume = Math.max(0, Math.min(1, percent));
        volumeBar.style.width = (percent * 100) + '%';
        updateVolumeIcon(percent);
      };

      volumeIcon.onclick = () => {
        if (player.volume > 0) {
          player.dataset.prevVolume = player.volume;
          player.volume = 0;
          volumeBar.style.width = '0%';
          volumeIcon.textContent = '🔇';
        } else {
          player.volume = player.dataset.prevVolume || 1;
          volumeBar.style.width = (player.volume * 100) + '%';
          updateVolumeIcon(player.volume);
        }
      };

      function updateVolumeIcon(volume) {
        if (volume === 0) volumeIcon.textContent = '🔇';
        else if (volume < 0.5) volumeIcon.textContent = '🔉';
        else volumeIcon.textContent = '🔊';
      }

      // Close button
      closeBtn.onclick = () => {
        player.pause();
        hideStickyPlayer();
        try {
          localStorage.removeItem('currentPodcast');
        } catch (e) {}
      };

      // Prev/Next buttons (placeholder)
      stickyPlayer.querySelector('.sticky-prev-btn').onclick = () => {
        console.log('Previous episode (not implemented)');
      };
      
      stickyPlayer.querySelector('.sticky-next-btn').onclick = () => {
        console.log('Next episode (not implemented)');
      };
    }

    stickyPlayer.querySelector('.sticky-title').textContent = title;
    stickyPlayer.classList.add('show');
    
    // Sauvegarder l'état initial
    try {
      const player = document.getElementById('player');
      localStorage.setItem('currentPodcast', JSON.stringify({
        title: title,
        audio: audioUrl,
        isPlaying: !player.paused,
        currentTime: player.currentTime || 0
      }));
    } catch (e) {}
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function hideStickyPlayer() {
    const stickyPlayer = document.getElementById('sticky-player');
    if (stickyPlayer) {
      stickyPlayer.classList.remove('show');
    }
    try {
      localStorage.removeItem('currentPodcast');
    } catch (e) {}
  }

  // Restaurer le podcast en cours si on change de page
  function restorePlayer() {
    try {
      const saved = localStorage.getItem('currentPodcast');
      if (!saved) return;
      
      const data = JSON.parse(saved);
      const player = document.getElementById('player');
      
      if (!player || !data.audio) return;

      // Vérifier si c'est le même audio
      if (player.src !== data.audio) {
        player.src = data.audio;
        player.currentTime = data.currentTime || 0;
      }

      // Restaurer le player visuel
      showStickyPlayer(data.title, data.audio);

      // Reprendre la lecture si c'était en train de jouer
      if (data.isPlaying) {
        player.play().catch(() => {
          console.log('Lecture automatique bloquée');
        });
      }

      // Synchroniser l'état
      const stickyPlayer = document.getElementById('sticky-player');
      if (stickyPlayer && data.currentTime) {
        player.currentTime = data.currentTime;
      }
    } catch (e) {
      console.error('Erreur restoration:', e);
    }
  }

  // Sauvegarder l'état toutes les secondes
  function startSyncInterval() {
    const player = document.getElementById('player');
    if (!player) return;

    setInterval(() => {
      try {
        const saved = localStorage.getItem('currentPodcast');
        if (saved && !player.paused) {
          const data = JSON.parse(saved);
          data.currentTime = player.currentTime;
          data.isPlaying = !player.paused;
          localStorage.setItem('currentPodcast', JSON.stringify(data));
        }
      } catch (e) {}
    }, 1000);
  }

  // Restaurer au chargement de la page
  console.log('🔍 Tentative de restauration du player...');
  restorePlayer();
  startSyncInterval();

  // Debug: afficher l'état du player toutes les 3 secondes
  setInterval(() => {
    const saved = localStorage.getItem('currentPodcast');
    const player = document.getElementById('player');
    console.log('📊 État actuel:', {
      'localStorage': saved ? JSON.parse(saved) : null,
      'player exists': !!player,
      'player.src': player?.src || 'N/A',
      'player.paused': player?.paused,
      'sticky visible': document.getElementById('sticky-player')?.classList.contains('show')
    });
  }, 3000);

});
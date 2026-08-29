/**
 * Social Readers - Global Audiobook Preview Player
 * Floating responsive player for listening to audiobook chapter previews
 */

class AudiobookPlayer {
  constructor() {
    this.audio = new Audio();
    this.currentTrack = null;
    this.isPlaying = false;
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    let playerContainer = document.getElementById('global-audio-player');
    if (!playerContainer) {
      playerContainer = document.createElement('div');
      playerContainer.id = 'global-audio-player';
      playerContainer.className = 'fixed bottom-[72px] md:bottom-6 left-1/2 transform -translate-x-1/2 w-[94%] max-w-2xl bg-navy/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-4 shadow-2xl z-40 border border-white/20 hidden transition-all duration-300';
      playerContainer.innerHTML = `
        <div class="flex items-center justify-between gap-3 sm:gap-4">
          
          <!-- Track Info -->
          <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <img id="player-cover" src="assets/cover-atomic-habits.svg" class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-contain bg-white/10 p-1 flex-shrink-0" alt="Audiobook Cover">
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 sm:gap-2">
                <span class="px-1.5 py-0.5 rounded bg-brandOrange text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">Audio Sample</span>
                <span id="player-speed" class="text-[9px] sm:text-[10px] text-gray-300 font-mono cursor-pointer hover:text-white bg-white/10 px-1 py-0.5 rounded">1.0x</span>
              </div>
              <h4 id="player-title" class="font-bold text-xs sm:text-sm text-white truncate mt-0.5">Atomic Habits</h4>
              <p id="player-author" class="text-[10px] sm:text-xs text-gray-300 truncate">James Clear</p>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <button id="player-rewind" class="p-1 sm:p-2 text-gray-300 hover:text-white active:scale-95" title="Rewind 10s">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"></path></svg>
            </button>

            <button id="player-play-btn" class="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-forest hover:bg-green-600 flex items-center justify-center text-white shadow-lg transition-transform active:scale-90">
              <svg id="play-icon" class="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <svg id="pause-icon" class="w-4 h-4 sm:w-5 sm:h-5 fill-current hidden" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>

            <button id="player-forward" class="p-1 sm:p-2 text-gray-300 hover:text-white active:scale-95" title="Forward 10s">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"></path></svg>
            </button>

            <button id="player-close" class="p-1 text-gray-400 hover:text-white ml-0.5" title="Close">
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

        </div>

        <!-- Progress Bar & Time -->
        <div class="mt-2 flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-gray-300 font-mono">
          <span id="player-current-time">0:00</span>
          <input type="range" id="player-seek" min="0" max="100" value="0" class="flex-grow h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brandOrange">
          <span id="player-duration">0:00</span>
        </div>
      `;
      document.body.appendChild(playerContainer);
    }
  }

  bindEvents() {
    const playBtn = document.getElementById('player-play-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const closeBtn = document.getElementById('player-close');
    const seekInput = document.getElementById('player-seek');
    const currentTimeEl = document.getElementById('player-current-time');
    const durationEl = document.getElementById('player-duration');
    const speedBtn = document.getElementById('player-speed');
    const rewindBtn = document.getElementById('player-rewind');
    const forwardBtn = document.getElementById('player-forward');

    // Toggle Play/Pause
    playBtn.addEventListener('click', () => {
      if (this.isPlaying) {
        this.audio.pause();
      } else {
        this.audio.play();
      }
    });

    // Speed Cycle
    const speeds = [1.0, 1.25, 1.5, 2.0];
    let speedIndex = 0;
    speedBtn.addEventListener('click', () => {
      speedIndex = (speedIndex + 1) % speeds.length;
      const spd = speeds[speedIndex];
      this.audio.playbackRate = spd;
      speedBtn.textContent = `${spd.toFixed(1)}x`;
    });

    // Seek
    seekInput.addEventListener('input', (e) => {
      const seekTime = (e.target.value / 100) * this.audio.duration;
      this.audio.currentTime = seekTime;
    });

    // Rewind / Forward
    rewindBtn.addEventListener('click', () => {
      this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
    });

    forwardBtn.addEventListener('click', () => {
      this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 10);
    });

    // Close
    closeBtn.addEventListener('click', () => {
      this.audio.pause();
      document.getElementById('global-audio-player').classList.add('hidden');
    });

    // Audio element event listeners
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
    });

    this.audio.addEventListener('timeupdate', () => {
      if (!isNaN(this.audio.duration)) {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        seekInput.value = progress;
        currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        durationEl.textContent = this.formatTime(this.audio.duration);
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      durationEl.textContent = this.formatTime(this.audio.duration);
    });
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  playTrack(title, author, audioUrl, coverUrl) {
    this.currentTrack = { title, author, audioUrl, coverUrl };
    
    document.getElementById('player-title').textContent = title;
    document.getElementById('player-author').textContent = author;
    if (coverUrl) {
      document.getElementById('player-cover').src = coverUrl;
    }

    this.audio.src = audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    this.audio.play().catch(e => console.log('Audio autoplay prevented:', e));

    const playerContainer = document.getElementById('global-audio-player');
    playerContainer.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.SocialReadersAudioPlayer = new AudiobookPlayer();

  // Attach sample listen listeners on all listen buttons
  document.querySelectorAll('[data-listen-sample]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.getAttribute('data-book-title') || "Audio Sample";
      const author = btn.getAttribute('data-book-author') || "";
      const url = btn.getAttribute('data-audio-url') || "";
      const cover = btn.getAttribute('data-cover-url') || "";
      window.SocialReadersAudioPlayer.playTrack(title, author, url, cover);
    });
  });
});

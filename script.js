// Create stars dynamically
const starsContainer = document.getElementById('stars');
for(let i=0; i<100; i++){
  const star = document.createElement('div');
  star.classList.add('star');
  star.style.width = star.style.height = (Math.random() * 2 + 1) + 'px';
  star.style.top = (Math.random() * 100) + 'vh';
  star.style.left = (Math.random() * 100) + 'vw';
  star.style.animationDelay = (Math.random() * 3) + 's';
  starsContainer.appendChild(star);
}

// Quotes data (sample small subset, expand as you want)
const quotes = [
  "The soul becomes dyed with the color of its thoughts.",
  "To love oneself is the beginning of a lifelong romance.",
  "In the depth of winter, I finally learned that within me there lay an invincible summer.",
  "Happiness depends upon ourselves.",
  "Every moment is a fresh beginning.",
  "Turn your wounds into wisdom.",
  "Where there is love, there is life."
];

// State
let currentIndex = 0;
let filteredQuotes = [...quotes];
let favorites = JSON.parse(localStorage.getItem('favoritesQuotes')) || [];
let comments = JSON.parse(localStorage.getItem('commentsData')) || {};
let darkMode = JSON.parse(localStorage.getItem('darkMode')) || false;

const quoteTextEl = document.getElementById('quoteText');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const searchInput = document.getElementById('searchInput');
const copyBtn = document.getElementById('copyBtn');
const readBtn = document.getElementById('readBtn');
const shareTwitterBtn = document.getElementById('shareTwitterBtn');
const shareFBBtn = document.getElementById('shareFBBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const showFavoritesBtn = document.getElementById('showFavoritesBtn');
const favoritesModal = document.getElementById('favoritesModal');
const favoritesList = document.getElementById('favoritesList');
const closeFavoritesBtn = document.getElementById('closeFavoritesBtn');
const nameInput = document.getElementById('nameInput');
const commentInput = document.getElementById('commentInput');
const postCommentBtn = document.getElementById('postCommentBtn');
const commentsList = document.getElementById('commentsList');
const commentsCount = document.getElementById('commentsCount');
const feedbackInput = document.getElementById('feedbackInput');
const feedbackSubmit = document.getElementById('feedbackSubmit');
const feedbackStatus = document.getElementById('feedbackStatus');
const volumeSlider = document.getElementById('volumeSlider');

let synth = window.speechSynthesis;
let utterance = null;

function updateQuote() {
  if(filteredQuotes.length === 0){
    quoteTextEl.textContent = "No quotes found.";
    favoriteBtn.disabled = true;
    return;
  }
  if(currentIndex >= filteredQuotes.length) currentIndex = 0;
  if(currentIndex < 0) currentIndex = filteredQuotes.length - 1;

  const quote = filteredQuotes[currentIndex];
  quoteTextEl.textContent = quote;
  favoriteBtn.disabled = false;

  // Update favorite button aria and icon
  if(favorites.includes(quote)){
    favoriteBtn.textContent = '❤️ Favorited';
    favoriteBtn.setAttribute('aria-pressed', 'true');
  } else {
    favoriteBtn.textContent = '🤍 Favorite';
    favoriteBtn.setAttribute('aria-pressed', 'false');
  }
  
  updateComments();
}

function filterQuotes() {
  const query = searchInput.value.toLowerCase();
  filteredQuotes = quotes.filter(q => q.toLowerCase().includes(query));
  currentIndex = 0;
  updateQuote();
}

function toggleFavorite() {
  const quote = filteredQuotes[currentIndex];
  if(!quote) return;

  if(favorites.includes(quote)){
    favorites = favorites.filter(q => q !== quote);
  } else {
    favorites.push(quote);
  }
  localStorage.setItem('favoritesQuotes', JSON.stringify(favorites));
  updateQuote();
}

function showFavorites() {
  favoritesModal.style.display = 'block';
  favoritesModal.setAttribute('aria-hidden', 'false');
  favoritesModal.focus();
  renderFavoritesList();
}

function closeFavorites() {
  favoritesModal.style.display = 'none';
  favoritesModal.setAttribute('aria-hidden', 'true');
  // Return focus to favorites button
  showFavoritesBtn.focus();
}

function renderFavoritesList() {
  favoritesList.innerHTML = '';
  if(favorites.length === 0){
    favoritesList.textContent = 'No favorite quotes saved.';
    return;
  }
  favorites.forEach((quote, idx) => {
    const div = document.createElement('div');
    div.tabIndex = 0;
    div.textContent = quote;
    div.title = "Click to load this quote";
    div.addEventListener('click', () => {
      filteredQuotes = favorites;
      currentIndex = idx;
      updateQuote();
      closeFavorites();
    });
    div.addEventListener('keypress', e => {
      if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        div.click();
      }
    });
    favoritesList.appendChild(div);
  });
}

function copyQuote() {
  const quote = filteredQuotes[currentIndex];
  if(!quote) return;
  navigator.clipboard.writeText(quote).then(() => {
    alert("Quote copied to clipboard!");
  });
}

function readQuote() {
  if(synth.speaking){
    synth.cancel();
    readBtn.textContent = '🔊 Read Aloud';
    return;
  }
  const quote = filteredQuotes[currentIndex];
  if(!quote) return;
  utterance = new SpeechSynthesisUtterance(quote);
  utterance.volume = volumeSlider.value;
  synth.speak(utterance);
  readBtn.textContent = '⏹️ Stop Reading';
  utterance.onend = () => {
    readBtn.textContent = '🔊 Read Aloud';
  };
}

function shareTwitter() {
  const quote = filteredQuotes[currentIndex];
  if(!quote) return;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent('"' + quote + '" — The Soul')}`;
  window.open(url, '_blank');
}

function shareFacebook() {
  const quote = filteredQuotes[currentIndex];
  if(!quote) return;
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(document.location.href)}&quote=${encodeURIComponent(quote)}`;
  window.open(url, '_blank');
}

function toggleDarkMode() {
  darkMode = !darkMode;
  localStorage.setItem('darkMode', JSON.stringify(darkMode));
  applyDarkMode();
}

function applyDarkMode() {
  if(darkMode){
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '🌙';
    darkModeToggle.setAttribute('aria-pressed', 'true');
  } else {
    document.body.classList.remove('dark-mode');
    darkModeToggle.textContent = '☀️';
    darkModeToggle.setAttribute('aria-pressed', 'false');
  }
}

// COMMENTS
function updateComments() {
  const quote = filteredQuotes[currentIndex];
  const quoteComments = comments[quote] || [];
  commentsList.innerHTML = '';
  commentsCount.textContent = quoteComments.length;

  if(quoteComments.length === 0){
    commentsList.textContent = 'No comments yet. Be the first!';
    return;
  }

  quoteComments.forEach(c => {
    const div = document.createElement('div');
    div.className = 'comment';
    div.innerHTML = `<strong>${c.name}:</strong> ${c.text}`;
    commentsList.appendChild(div);
  });
}

// Add a comment and simulate AI reply "CHARITH"
function postComment() {
  const name = nameInput.value.trim() || 'Anonymous';
  const text = commentInput.value.trim();
  if(text.length === 0) return alert("Please enter a comment.");

  const quote = filteredQuotes[currentIndex];
  if(!quote) return;

  if(!comments[quote]){
    comments[quote] = [];
  }

  comments[quote].push({name, text});
  localStorage.setItem('commentsData', JSON.stringify(comments));
  updateComments();
  commentInput.value = '';
  nameInput.value = '';

  // Simulate AI reply CHARITH
  setTimeout(() => {
    const aiReply = generateAIReply(text);
    comments[quote].push({name: 'CHARITH 🤖', text: aiReply});
    localStorage.setItem('commentsData', JSON.stringify(comments));
    updateComments();
  }, 1500);
}

function generateAIReply(userText){
  const replies = [
    "Thanks for sharing your thoughts!",
    "Interesting perspective!",
    "I appreciate your comment.",
    "Keep the positive vibes going!",
    "That's a deep insight!",
    "CHARITH agrees with you.",
    "Well said!",
    "Your words touch the soul.",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

// FEEDBACK FORM
function submitFeedback() {
  const feedback = feedbackInput.value.trim();
  if(feedback.length < 5) {
    feedbackStatus.textContent = 'Please enter at least 5 characters.';
    feedbackStatus.style.color = 'orange';
    return;
  }
  feedbackStatus.textContent = 'Submitting feedback...';
  feedbackStatus.style.color = 'lightblue';

  // Simulate sending feedback with 2s delay
  setTimeout(() => {
    feedbackStatus.textContent = 'Thank you for your feedback!';
    feedbackStatus.style.color = 'lightgreen';
    feedbackInput.value = '';
  }, 2000);
}

// Event Listeners
prevBtn.addEventListener('click', () => {
  currentIndex--;
  updateQuote();
});

nextBtn.addEventListener('click', () => {
  currentIndex++;
  updateQuote();
});

searchInput.addEventListener('input', filterQuotes);
favoriteBtn.addEventListener('click', toggleFavorite);
copyBtn.addEventListener('click', copyQuote);
readBtn.addEventListener('click', readQuote);
shareTwitterBtn.addEventListener('click', shareTwitter);
shareFBBtn.addEventListener('click', shareFacebook);
darkModeToggle.addEventListener('click', toggleDarkMode);
showFavoritesBtn.addEventListener('click', showFavorites);
closeFavoritesBtn.addEventListener('click', closeFavorites);

postCommentBtn.addEventListener('click', postComment);
feedbackSubmit.addEventListener('click', submitFeedback);

volumeSlider.addEventListener('input', () => {
  if(utterance){
    utterance.volume = volumeSlider.value;
  }
});

// Close favorites modal with Escape key
window.addEventListener('keydown', e => {
  if(e.key === 'Escape' && favoritesModal.style.display === 'block'){
    closeFavorites();
  }
});

// Initialize page
applyDarkMode();
updateQuote();

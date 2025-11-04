// ==================================================
// J.U.N.E. — Joint Unified National Elite
// Official Website Script
// ==================================================

// ---------------- Navigation Handling ----------------
const views = {
  home: document.getElementById("home"),
  news: document.getElementById("news")
};

const links = {
  home: document.getElementById("link-home"),
  news: document.getElementById("link-news")
};

function showView(view) {
  for (const key in views) {
    if (views[key]) views[key].style.display = key === view ? "" : "none";
    if (links[key]) links[key].setAttribute("aria-current", key === view ? "true" : "false");
  }
}

function handleHash() {
  const hash = location.hash.replace("#", "") || "home";
  showView(hash in views ? hash : "home");
}

window.addEventListener("hashchange", handleHash);
handleHash();

// ---------------- Global Defence News Feed ----------------
const NEWS_API_KEY = "2ea79460042b4496ab57b6a09b52b790"; // ⚠️ Replace with your NewsAPI key
const NEWS_QUERY = "defence OR defense OR military OR armed forces OR army OR navy OR air force OR war OR weapon OR conflict OR missile OR soldier OR global security";
const NEWS_LANGUAGE = "en";
const NEWS_PAGE_SIZE = 12; // number of articles to display

async function fetchDefenceNews() {
  const container = document.getElementById("news-list");
  container.innerHTML = `<p class="loading">Collecting latest defence intelligence from around the world...</p>`;
  
  try {
    const url = `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(NEWS_QUERY)}` +
      `&language=${NEWS_LANGUAGE}` +
      `&sortBy=publishedAt` +
      `&pageSize=${NEWS_PAGE_SIZE}` +
      `&apiKey=${NEWS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "ok" && data.articles && data.articles.length > 0) {
      renderNews(data.articles.map(a => ({
        title: a.title,
        summary: a.description || "No summary available.",
        source: a.source.name || "Unknown Source",
        date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : "",
        country: a.source.country || "Global",
        url: a.url
      })));
    } else {
      container.innerHTML = `<p class="error">No global defence reports available right now.</p>`;
      console.warn("News API response:", data);
    }
  } catch (err) {
    console.error("Error fetching defence news:", err);
    container.innerHTML = `<p class="error">Unable to retrieve global reports. Check your connection or API key.</p>`;
  }
}

// Render articles into News page
function renderNews(newsList) {
  const container = document.getElementById("news-list");
  container.innerHTML = "";

  newsList.forEach(item => {
    const card = document.createElement("article");
    card.className = "news-item";
    card.innerHTML = `
      <div class="meta">Global Defence · ${escapeHtml(item.date)}</div>
      <h3><a href="${item.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></h3>
      <p>${escapeHtml(item.summary)}</p>
      <div class="meta">Source: ${escapeHtml(item.source)}</div>
    `;
    container.appendChild(card);
  });
}

// Simple text sanitizer
function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

// ---------------- Auto Refresh Mechanism ----------------
// Fetch once now, then refresh every 10 minutes
fetchDefenceNews();
setInterval(fetchDefenceNews, 10 * 60 * 1000);

// ---------------- Console Log ----------------
console.log("%cJ.U.N.E. Global Intelligence Division Online", "color: #003366; font-weight: bold;");
console.log("%cMonitoring world defence developments...", "color: gray;");

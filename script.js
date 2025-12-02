// ======================================================
// GDPD — Global Defence Feed System (Enhanced UI Version)
// Sections: Home + News (fade transitions)
// Uses rss2json.com (CORS-safe on GitHub Pages)
// ======================================================

const homeBtn = document.getElementById("homeBtn");
const newsBtn = document.getElementById("newsBtn");
const homeSection = document.getElementById("homeSection");
const newsSection = document.getElementById("newsSection");

// ---- Section Fade Switch ----
function showSection(active, inactive) {
  inactive.classList.remove("active");
  setTimeout(() => {
    inactive.style.display = "none";
    active.style.display = "block";
    setTimeout(() => active.classList.add("active"), 50);
  }, 300);
}

// Default: show Home
homeSection.style.display = "block";
homeSection.classList.add("active");
newsSection.style.display = "none";

homeBtn.addEventListener("click", () => {
  if (homeSection.classList.contains("active")) return;
  showSection(homeSection, newsSection);
  homeBtn.classList.add("active");
  newsBtn.classList.remove("active");
});

newsBtn.addEventListener("click", () => {
  if (newsSection.classList.contains("active")) return;
  showSection(newsSection, homeSection);
  newsBtn.classList.add("active");
  homeBtn.classList.remove("active");
  loadDefenceNews();
});

// ================================
// Defence News Fetcher
// ================================

const RSS_FEEDS = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://www.reuters.com/rssFeed/defense.xml",
  "https://www.defence-blog.com/feed/",
  "https://www.globalsecurity.org/military/rss/news.xml",
];

async function fetchRSSFeed(feedUrl) {
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.items || !data.items.length) return [];
    return data.items.map((item) => ({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
      source: data.feed.title,
    }));
  } catch (error) {
    console.warn("Feed fetch error:", feedUrl, error);
    return [];
  }
}

async function loadDefenceNews() {
  const container = document.getElementById("newsFeed");
  container.innerHTML = `<p class="loading">🛰 Fetching global defence intelligence...</p>`;
  let allItems = [];

  for (const feed of RSS_FEEDS) {
    const items = await fetchRSSFeed(feed);
    allItems = allItems.concat(items);
  }

  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  if (!allItems.length) {
    container.innerHTML = `<p class="loading">No global defence reports available at the moment.</p>`;
    return;
  }

  container.innerHTML = "";
  allItems.slice(0, 12).forEach((news) => {
    const article = document.createElement("div");
    article.className = "news-item fade-in";

    article.innerHTML = `
      <div class="news-content">
        <h3>${news.title}</h3>
        <p>${news.description.replace(/<[^>]+>/g, "").slice(0, 150)}...</p>
        <a href="${news.link}" target="_blank">Read Full Report</a>
        <div class="meta">
          <small>${news.source} — ${new Date(news.pubDate).toLocaleString()}</small>
        </div>
      </div>
    `;
    container.appendChild(article);
  });
}

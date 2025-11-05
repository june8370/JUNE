// ==================================================
// J.U.N.E. — Joint Unified National Elite
// Global Intelligence Feed
// ==================================================

// ========== CONFIG ==========
const RSS_FEEDS = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://www.reuters.com/rssFeed/defense.xml",
  "https://www.defence-blog.com/feed/",
  "https://www.military.com/rss-feeds/content"
];

const PROXIES = [
  "https://api.allorigins.hexlet.app/get?url=",
  "https://api.codetabs.com/v1/proxy?quest=",
];

const NEWS_CONTAINER_ID = "news-container"; // The HTML container to insert news
const MAX_NEWS_ITEMS = 12;

// ========== RSS FETCHING ==========
async function fetchRSSFeed(feedUrl) {
  for (const proxy of PROXIES) {
    try {
      const response = await fetch(proxy + encodeURIComponent(feedUrl));
      if (!response.ok) continue;

      // Some proxies return .contents, others just text
      const data = await response.json().catch(() => null);
      const contents = data?.contents || data;
      if (!contents) throw new Error("Invalid response");

      const parser = new DOMParser();
      const xml = parser.parseFromString(contents, "application/xml");
      return xml;
    } catch (e) {
      console.warn("Proxy failed:", proxy, e);
    }
  }
  console.error("❌ All proxies failed for:", feedUrl);
  return null;
}

// ========== PARSE RSS ==========
function parseRSSItems(xml) {
  const items = [];
  if (!xml) return items;

  const entries = xml.querySelectorAll("item");
  entries.forEach((entry) => {
    const title = entry.querySelector("title")?.textContent ?? "No title";
    const link = entry.querySelector("link")?.textContent ?? "#";
    const description = entry.querySelector("description")?.textContent ?? "";
    const pubDate = entry.querySelector("pubDate")?.textContent ?? "";
    const source = xml.querySelector("channel > title")?.textContent ?? "Unknown";

    items.push({ title, link, description, pubDate, source });
  });

  return items;
}

// ========== RENDER NEWS ==========
function displayNews(allNews) {
  const container = document.getElementById(NEWS_CONTAINER_ID);
  if (!container) {
    console.error("❌ No container found for news display!");
    return;
  }

  container.innerHTML = ""; // Clear previous

  if (!allNews.length) {
    container.innerHTML = "<p>No global defence reports available right now.</p>";
    return;
  }

  allNews.slice(0, MAX_NEWS_ITEMS).forEach((news) => {
    const article = document.createElement("div");
    article.className = "news-card";

    const formattedDate = news.pubDate
      ? new Date(news.pubDate).toLocaleString()
      : "";

    article.innerHTML = `
      <h3 class="news-title"><a href="${news.link}" target="_blank">${news.title}</a></h3>
      <p class="news-description">${news.description}</p>
      <div class="news-meta">
        <span class="news-source">${news.source}</span>
        <span class="news-date">${formattedDate}</span>
      </div>
    `;

    container.appendChild(article);
  });
}

// ========== MAIN LOADER ==========
async function loadDefenceNews() {
  console.log("🛰 Loading global defence news...");

  const allItems = [];
  for (const feed of RSS_FEEDS) {
    const xml = await fetchRSSFeed(feed);
    const items = parseRSSItems(xml);
    allItems.push(...items);
  }

  // Sort by publication date
  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  displayNews(allItems);
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", loadDefenceNews);

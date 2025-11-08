// ======================================================
// J.U.N.E. — Global Defence Feed (Fixed for GitHub Pages)
// Uses rss2json.com (no proxy errors, CORS safe)
// ======================================================

const RSS_FEEDS = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://www.reuters.com/rssFeed/defense.xml",
  "https://www.defence-blog.com/feed/",
  "https://www.globalsecurity.org/military/rss/news.xml"
];

const NEWS_CONTAINER_ID = "news-container";
const MAX_NEWS_ITEMS = 12;

async function fetchRSSFeed(feedUrl) {
  try {
    // rss2json API converts RSS → JSON (CORS safe)
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.warn("No items in feed:", feedUrl);
      return [];
    }

    return data.items.map(item => ({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
      source: data.feed.title
    }));
  } catch (error) {
    console.warn("Feed fetch error:", feedUrl, error);
    return [];
  }
}

function displayNews(allNews) {
  const container = document.getElementById(NEWS_CONTAINER_ID);
  if (!container) {
    console.error("❌ No container found for news display!");
    return;
  }

  container.innerHTML = "";

  if (!allNews.length) {
    container.innerHTML = `<p class="loading">No global defence reports available right now.</p>`;
    return;
  }

  allNews.slice(0, MAX_NEWS_ITEMS).forEach(news => {
    const article = document.createElement("div");
    article.className = "news-card";

    const formattedDate = news.pubDate
      ? new Date(news.pubDate).toLocaleString()
      : "";

    article.innerHTML = `
      <h3 class="news-title"><a href="${news.link}" target="_blank">${news.title}</a></h3>
      <p class="news-description">${news.description.slice(0, 150)}...</p>
      <div class="news-meta">
        <span class="news-source">${news.source}</span>
        <span class="news-date">${formattedDate}</span>
      </div>
    `;
    container.appendChild(article);
  });
}

async function loadDefenceNews() {
  console.log("🛰 Fetching global defence intelligence...");
  const allItems = [];

  for (const feed of RSS_FEEDS) {
    const items = await fetchRSSFeed(feed);
    allItems.push(...items);
  }

  // Sort newest first
  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  displayNews(allItems);
}

document.addEventListener("DOMContentLoaded", loadDefenceNews);

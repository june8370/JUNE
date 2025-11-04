// ==================================================
// J.U.N.E. — Joint Unified National Elite
// Global Intelligence Feed
// ==================================================

const homeBtn = document.getElementById("homeBtn");
const newsBtn = document.getElementById("newsBtn");
const homeSection = document.getElementById("homeSection");
const newsSection = document.getElementById("newsSection");
const newsFeed = document.getElementById("newsFeed");

homeBtn.addEventListener("click", () => {
  homeBtn.classList.add("active");
  newsBtn.classList.remove("active");
  homeSection.classList.add("active");
  newsSection.classList.remove("active");
});

newsBtn.addEventListener("click", () => {
  newsBtn.classList.add("active");
  homeBtn.classList.remove("active");
  newsSection.classList.add("active");
  homeSection.classList.remove("active");
});

// RSS Feeds for defence & research news
const feeds = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://www.defence-blog.com/feed/",
  "https://www.military.com/rss-feeds/content",
  "https://www.globalsecurity.org/military/rss/news.xml",
  "https://www.reuters.com/rssFeed/defense.xml"
];

async function fetchRSSFeed(url) {
  const proxy = "https://api.allorigins.win/get?url=";
  const res = await fetch(proxy + encodeURIComponent(url));
  const data = await res.json();
  const parser = new DOMParser();
  const xml = parser.parseFromString(data.contents, "text/xml");
  return Array.from(xml.querySelectorAll("item")).map(item => ({
    title: item.querySelector("title")?.textContent || "No title",
    link: item.querySelector("link")?.textContent || "#",
    description: item.querySelector("description")?.textContent || "",
    pubDate: item.querySelector("pubDate")?.textContent || "",
  }));
}

async function loadDefenceNews() {
  newsFeed.innerHTML = `<p class="loading">Gathering global defence reports...</p>`;
  let allArticles = [];

  for (const feed of feeds) {
    try {
      const articles = await fetchRSSFeed(feed);
      allArticles = allArticles.concat(articles);
    } catch (err) {
      console.warn("Feed error:", feed, err);
    }
  }

  // Sort by newest
  allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Render first 12
  renderNews(allArticles.slice(0, 12));
}

function renderNews(articles) {
  if (!articles.length) {
    newsFeed.innerHTML = `<p class="error">No global defence reports available right now.</p>`;
    return;
  }

  newsFeed.innerHTML = articles
    .map(
      (a) => `
    <div class="news-item">
      <div class="news-content">
        <h3>${a.title}</h3>
        <p>${a.description.replace(/<[^>]+>/g, "").slice(0, 150)}...</p>
        <a href="${a.link}" target="_blank">Read More</a>
      </div>
    </div>`
    )
    .join("");
}

loadDefenceNews();
setInterval(loadDefenceNews, 10 * 60 * 1000); // auto refresh every 10 min

"""Lightweight HTTP web scraper (requests + BeautifulSoup) for real-time company research.
Uses DuckDuckGo HTML endpoint for search + fetches the company homepage.
Best-effort: returns whatever it can gather; never raises to the caller.
"""
import re
import time
import logging
from urllib.parse import quote_plus, urljoin, urlparse, unquote

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger("rampx.scraper")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}
TIMEOUT = 8


def _get(url, session):
    for attempt in range(2):
        try:
            r = session.get(url, headers=HEADERS, timeout=TIMEOUT)
            if r.status_code in (403, 429, 503):
                time.sleep(0.6 * (attempt + 1))
                continue
            r.raise_for_status()
            return r
        except Exception as e:
            logger.warning("GET failed %s: %s", url, e)
            time.sleep(0.4 * (attempt + 1))
    return None


def _clean(text):
    return re.sub(r"\s+", " ", text or "").strip()


def ddg_search(query, session, limit=6):
    """Return list of {title, snippet, url} from DuckDuckGo HTML results."""
    results = []
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
    r = _get(url, session)
    if not r:
        return results
    soup = BeautifulSoup(r.text, "html.parser")
    for res in soup.select(".result")[: limit * 2]:
        a = res.select_one("a.result__a")
        if not a:
            continue
        title = _clean(a.get_text())
        href = a.get("href", "")
        # DDG wraps links in a redirect; extract uddg param
        m = re.search(r"uddg=([^&]+)", href)
        link = unquote(m.group(1)) if m else href
        snip_el = res.select_one(".result__snippet")
        snippet = _clean(snip_el.get_text()) if snip_el else ""
        if title:
            results.append({"title": title, "snippet": snippet, "url": link})
        if len(results) >= limit:
            break
    return results


def fetch_page_text(url, session, max_chars=2500):
    r = _get(url, session)
    if not r:
        return ""
    soup = BeautifulSoup(r.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
        tag.decompose()
    # prefer meta description + main text
    parts = []
    meta = soup.find("meta", attrs={"name": "description"}) or soup.find(
        "meta", attrs={"property": "og:description"}
    )
    if meta and meta.get("content"):
        parts.append(_clean(meta["content"]))
    for el in soup.find_all(["h1", "h2", "h3", "p"])[:40]:
        t = _clean(el.get_text())
        if len(t) > 40:
            parts.append(t)
    text = " ".join(parts)
    return text[:max_chars]


def find_company_website(company_name, session):
    results = ddg_search(f"{company_name} official website", session, limit=4)
    for r in results:
        host = urlparse(r["url"]).netloc.lower()
        bad = ("wikipedia", "linkedin", "facebook", "twitter", "youtube", "bloomberg", "crunchbase")
        if host and not any(b in host for b in bad):
            return f"{urlparse(r['url']).scheme}://{host}"
    return ""


def research_company(company_name, product_area, url=""):
    """Gather raw real-time context about a company. Returns dict of sources."""
    session = requests.Session()
    context = {"website": "", "site_text": "", "sources": []}
    try:
        if url:
            u = url.strip()
            if not u.startswith("http"):
                u = "https://" + u
            website = f"{urlparse(u).scheme}://{urlparse(u).netloc}"
        else:
            website = find_company_website(company_name, session)
        context["website"] = website
        if website:
            context["site_text"] = fetch_page_text(website, session)

        queries = [
            f"{company_name} {product_area} company overview",
            f"{company_name} latest product release announcement 2026",
            f"{company_name} competitors {product_area}",
            f"{company_name} investor shareholder earnings news",
            f"{company_name} company goals strategy roadmap",
        ]
        seen = set()
        for q in queries:
            for item in ddg_search(q, session, limit=4):
                key = item["url"]
                if key in seen:
                    continue
                seen.add(key)
                context["sources"].append(item)
    except Exception as e:
        logger.error("research_company failed: %s", e)
    finally:
        session.close()
    return context

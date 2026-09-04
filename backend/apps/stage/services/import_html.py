"""HTTP fetch and HTML parsing utilities for offer import."""

from __future__ import annotations

import html as html_lib
import re
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup


DEFAULT_HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
        '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    ),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
}

# Statuses that mean "the URL is fine, but the site refuses anonymous readers".
# 999 is LinkedIn's non-standard anti-crawler response; without it a LinkedIn
# import was reported as an unreachable website, sending the operator to check a
# link that was perfectly valid instead of pasting the text.
BLOCKED_STATUS_CODES = frozenset({401, 403, 429, 999})


class HtmlFetchError(Exception):
    """Raised when a page cannot be retrieved or parsed."""

    def __init__(self, message: str, *, code: str = 'fetch_failed'):
        super().__init__(message)
        self.code = code


def validate_url_format(url: str) -> str:
    url = (url or '').strip()
    if not url:
        raise HtmlFetchError('URL is required.', code='invalid_url')
    parsed = urlparse(url)
    if parsed.scheme not in ('http', 'https') or not parsed.netloc:
        raise HtmlFetchError('Invalid URL format.', code='invalid_url')
    return url


def check_url_reachable(url: str, *, timeout: int = 12) -> str:
    """Validate reachability; returns final URL after redirects."""
    url = validate_url_format(url)
    try:
        head = requests.head(
            url,
            headers=DEFAULT_HEADERS,
            timeout=timeout,
            allow_redirects=True,
        )
        if head.status_code >= 400 or head.status_code in (405, 501):
            response = requests.get(
                url,
                headers=DEFAULT_HEADERS,
                timeout=timeout,
                allow_redirects=True,
            )
        else:
            response = head
        if response.status_code in BLOCKED_STATUS_CODES:
            # Job boards commonly gate anonymous crawlers; the URL itself is fine.
            raise HtmlFetchError(
                f'Website refused the request (HTTP {response.status_code}).',
                code='blocked',
            )
        if response.status_code == 404:
            raise HtmlFetchError('Offer page not found (HTTP 404).', code='not_found')
        if response.status_code >= 400:
            raise HtmlFetchError(
                f'Website returned HTTP {response.status_code}.',
                code='unreachable',
            )
        return response.url or url
    except requests.Timeout as exc:
        raise HtmlFetchError('Website request timed out.', code='timeout') from exc
    except requests.TooManyRedirects as exc:
        raise HtmlFetchError('Website redirected too many times.', code='unreachable') from exc
    except requests.RequestException as exc:
        raise HtmlFetchError('Website is unreachable.', code='unreachable') from exc


def fetch_html(url: str, *, timeout: int = 15) -> tuple[str, str]:
    """Fetch HTML content; returns (html, final_url).

    Callers reach this after `check_url_reachable`, so the GET below is the only
    request made here — re-probing would triple the latency of every import and
    push slow job boards past the gateway timeout.
    """
    final_url = validate_url_format(url)
    try:
        response = requests.get(
            final_url,
            headers=DEFAULT_HEADERS,
            timeout=timeout,
            allow_redirects=True,
        )
        if response.status_code in BLOCKED_STATUS_CODES:
            raise HtmlFetchError(
                f'Website refused the request (HTTP {response.status_code}).',
                code='blocked',
            )
        if response.status_code == 404:
            raise HtmlFetchError('Offer page not found (HTTP 404).', code='not_found')
        if response.status_code >= 400:
            raise HtmlFetchError(
                f'Website returned HTTP {response.status_code}.',
                code='unreachable',
            )
        content_type = (response.headers.get('Content-Type') or '').lower()
        if content_type and 'html' not in content_type and 'text/' not in content_type:
            raise HtmlFetchError('Response is not an HTML page.', code='not_html')
        encoding = response.encoding or 'utf-8'
        html = response.content.decode(encoding, errors='replace')
        if not html.strip():
            raise HtmlFetchError('Website returned an empty page.', code='empty_page')
        return html, response.url or final_url
    except requests.Timeout as exc:
        raise HtmlFetchError('Website request timed out.', code='timeout') from exc
    except requests.TooManyRedirects as exc:
        raise HtmlFetchError('Website redirected too many times.', code='unreachable') from exc
    except requests.RequestException as exc:
        raise HtmlFetchError('Website is unreachable.', code='unreachable') from exc


def parse_soup(html: str) -> BeautifulSoup:
    return BeautifulSoup(html or '', 'html.parser')


def clean_text(value: str) -> str:
    if not value:
        return ''
    text = html_lib.unescape(str(value))
    text = text.replace('\u00a0', ' ').replace('\u200b', '')
    text = re.sub(r'[\u200e\u200f\u202a-\u202e]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def clean_multiline_text(value: str) -> str:
    if not value:
        return ''
    text = html_lib.unescape(str(value))
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    lines = [clean_text(line) for line in text.split('\n')]
    lines = [line for line in lines if line]
    return '\n'.join(lines)


LINKEDIN_NOISE_PATTERNS = (
    r'Obtenez des conseils générés par l[\u2019\']IA.*?',
    r'Get AI-powered insights.*?',
    r'Show more\s*Show less',
    r'See more\s*See less',
    r'Sign in to view full job description\.?',
)


LINKEDIN_BOILERPLATE_PATTERNS = (
    r'Publi[ée]\s+il\s+y\s+a\s+[\d:\s]+',
    r'Voir ceci ainsi que d[\u2019\']autres offres d[\u2019\']emploi similaires sur LinkedIn\.?',
    r'See this and similar jobs on LinkedIn\.?',
    r'Sign in to view.*',
    r'Join LinkedIn.*',
)


def clean_linkedin_description(text: str) -> str:
    cleaned = strip_platform_boilerplate(clean_multiline_text(text))
    for pattern in LINKEDIN_NOISE_PATTERNS:
        cleaned = re.sub(pattern, '', cleaned, flags=re.I | re.S)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    return cleaned.strip()


def strip_platform_boilerplate(text: str, *, platform: str = '') -> str:
    cleaned = clean_multiline_text(text)
    for pattern in LINKEDIN_BOILERPLATE_PATTERNS:
        cleaned = re.sub(pattern, '', cleaned, flags=re.I)
    cleaned = re.sub(r'\.{3,}', '…', cleaned)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    return cleaned.strip()


def first_text(soup: BeautifulSoup, selector: str) -> str:
    node = soup.select_one(selector)
    if node:
        return clean_text(node.get_text('\n', strip=True))
    return ''

def meta_content(soup: BeautifulSoup, *, prop: str = '', name: str = '') -> str:
    if prop:
        tag = soup.find('meta', property=prop) or soup.find('meta', attrs={'name': prop})
        if tag and tag.get('content'):
            return str(tag['content']).strip()
    if name:
        tag = soup.find('meta', attrs={'name': name})
        if tag and tag.get('content'):
            return str(tag['content']).strip()
    return ''


def extract_page_title(soup: BeautifulSoup) -> str:
    og = clean_text(meta_content(soup, prop='og:title'))
    if og:
        return og
    if soup.title and soup.title.string:
        return clean_text(soup.title.string)
    h1 = soup.find('h1')
    if h1:
        return clean_text(h1.get_text(' ', strip=True))
    return ''


def extract_description(soup: BeautifulSoup) -> str:
    for selector in (
        '.description__text',
        '.jobs-description-content__text',
        'div[class*="description__text"]',
        '.job-description',
        '#job-description',
        'article',
        'main',
    ):
        nodes = soup.select(selector)
        parts: list[str] = []
        for node in nodes:
            text = clean_multiline_text(node.get_text('\n', strip=True))
            if len(text) > 40:
                parts.append(text)
        if parts:
            deduped = list(dict.fromkeys(parts))
            return strip_platform_boilerplate('\n\n'.join(deduped))[:8000]

    for key in ('og:description', 'description'):
        value = meta_content(soup, prop=key) or meta_content(soup, name=key)
        if value and 'LinkedIn' not in value:
            return strip_platform_boilerplate(value)[:6000]

    paragraphs = [
        clean_text(p.get_text(' ', strip=True))
        for p in soup.find_all('p')[:16]
        if len(p.get_text(strip=True)) > 40
    ]
    return strip_platform_boilerplate('\n'.join(paragraphs))[:6000]

GENERIC_OG_IMAGES = (
    'static.licdn.com/aero-v1/sc/h/',
    'static.licdn.com/scds/common/u/images/logos/favicons/',
)


def _is_generic_logo_url(url: str) -> bool:
    lowered = (url or '').lower()
    return any(token in lowered for token in GENERIC_OG_IMAGES)


def extract_linkedin_company_logo(soup: BeautifulSoup) -> str:
    selectors = (
        'img.artdeco-entity-image',
        '.top-card-layout__entity-image img',
        '.topcard__logo img',
        'figure.top-card-layout__entity-image img',
        'a.topcard__org-name-link img',
    )
    for selector in selectors:
        node = soup.select_one(selector)
        if not node:
            continue
        src = str(node.get('src') or node.get('data-delayed-url') or '').strip()
        if src and 'company-logo' in src:
            return src
        if src and not _is_generic_logo_url(src):
            return src
    return ''


def extract_company_logo(soup: BeautifulSoup) -> str:
    linkedin_logo = extract_linkedin_company_logo(soup)
    if linkedin_logo:
        return linkedin_logo

    logo = meta_content(soup, prop='og:image') or meta_content(soup, name='twitter:image')
    if logo and not _is_generic_logo_url(logo):
        return logo

    for selector in (
        'img[class*="logo"]',
        '.company-logo img',
        'img[alt*="logo" i]',
        'header img',
    ):
        img = soup.select_one(selector)
        if img:
            src = str(img.get('src') or img.get('data-delayed-url') or '').strip()
            if src and not _is_generic_logo_url(src):
                return src
    return ''


def extract_visible_headings(soup: BeautifulSoup) -> list[str]:
    headings: list[str] = []
    for tag in soup.find_all(['h1', 'h2', 'h3'], limit=20):
        text = tag.get_text(' ', strip=True)
        if text and len(text) < 200:
            headings.append(text)
    return headings


def extract_list_section(soup: BeautifulSoup, keywords: tuple[str, ...]) -> str:
    pattern = re.compile('|'.join(re.escape(k) for k in keywords), re.I)
    for heading in soup.find_all(['h2', 'h3', 'h4', 'strong', 'b']):
        label = heading.get_text(' ', strip=True)
        if not label or not pattern.search(label):
            continue
        items: list[str] = []
        sibling = heading.find_next_sibling()
        steps = 0
        while sibling is not None and steps < 8:
            steps += 1
            if sibling.name in ('h1', 'h2', 'h3'):
                break
            if sibling.name in ('ul', 'ol'):
                for li in sibling.find_all('li'):
                    text = li.get_text(' ', strip=True)
                    if text:
                        items.append(f'• {text}')
            elif sibling.name == 'p':
                text = sibling.get_text(' ', strip=True)
                if text:
                    items.append(text)
            sibling = sibling.find_next_sibling()
        if items:
            return '\n'.join(items)
    return ''


def guess_skills(text: str) -> list[str]:
    if not text:
        return []
    catalog = [
        'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue',
        'Node.js', 'Django', 'Spring', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker',
        'Kubernetes', 'AWS', 'Azure', 'Git', 'CI/CD', 'Agile', 'Scrum', 'C#',
        '.NET', 'PHP', 'Laravel', 'Flutter', 'Android', 'iOS', 'Swift', 'Kotlin',
        'Machine Learning', 'Data Analysis', 'Power BI', 'Excel', 'SAP', 'Figma',
    ]
    lowered = text.lower()
    found = [skill for skill in catalog if skill.lower() in lowered]
    return found[:12]

"""Pluggable offer import parsers — HTML extraction without external APIs."""

from __future__ import annotations

import re
from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass, field
from typing import Any
from urllib.parse import urlparse

from apps.stage.services.import_html import (
    HtmlFetchError,
    clean_linkedin_description,
    clean_multiline_text,
    clean_text,
    extract_company_logo,
    extract_description,
    extract_list_section,
    extract_page_title,
    extract_visible_headings,
    fetch_html,
    first_text,
    guess_skills,
    meta_content,
    parse_soup,
    strip_platform_boilerplate,
)


@dataclass
class ExtractedOfferDTO:
    title: str = ''
    company_name: str = ''
    location: str = ''
    description: str = ''
    requirements: str = ''
    skills: list[str] = field(default_factory=list)
    benefits: str = ''
    internship_type: str = ''
    application_deadline: str = ''
    source_url: str = ''
    source_platform: str = ''
    company_logo: str = ''
    raw_content: str = ''
    parser_used: str = ''
    employment_type: str = ''
    published_date: str = ''
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class OfferParserInterface(ABC):
    platform_key: str = 'UNKNOWN'
    parser_name: str = 'GenericWebsiteParser'

    @abstractmethod
    def supports(self, url: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    def extract(self, url: str) -> ExtractedOfferDTO:
        raise NotImplementedError

    def normalize(self, data: ExtractedOfferDTO) -> ExtractedOfferDTO:
        data.title = clean_text(data.title or '')[:255]
        data.company_name = clean_text(data.company_name or '')[:255]
        data.location = clean_text(data.location or '')[:255]
        data.description = strip_platform_boilerplate(clean_multiline_text(data.description or ''))
        data.requirements = clean_multiline_text(data.requirements or '')
        data.benefits = clean_multiline_text(data.benefits or '')
        data.internship_type = (data.internship_type or 'internship').strip().lower()
        if not data.skills and data.description:
            data.skills = guess_skills(data.description + '\n' + data.requirements)
        return data


class _HtmlParserBase(OfferParserInterface):
    domain_pattern: re.Pattern[str] | None = None

    def supports(self, url: str) -> bool:
        if not self.domain_pattern:
            return False
        host = urlparse(url).netloc.lower()
        return bool(self.domain_pattern.search(host))

    def _load(self, url: str) -> tuple[Any, str, str]:
        html, final_url = fetch_html(url)
        return parse_soup(html), html, final_url

    def extract(self, url: str) -> ExtractedOfferDTO:
        soup, html, final_url = self._load(url)
        dto = self._parse_page(soup, html, final_url)
        dto.source_url = final_url
        dto.source_platform = self.platform_key
        dto.parser_used = self.parser_name
        dto.raw_content = html[:12000]
        return self.normalize(dto)

    def _parse_page(self, soup, html: str, url: str) -> ExtractedOfferDTO:
        raise NotImplementedError


class GenericWebsiteParser(OfferParserInterface):
    platform_key = 'UNKNOWN'
    parser_name = 'GenericWebsiteParser'

    def supports(self, url: str) -> bool:
        return bool(urlparse(url).netloc)

    def extract(self, url: str) -> ExtractedOfferDTO:
        html, final_url = fetch_html(url)
        soup = parse_soup(html)
        title = extract_page_title(soup)
        description = extract_description(soup)
        requirements = extract_list_section(
            soup,
            ('requirement', 'profil', 'qualification', 'exigence', 'compétence'),
        )
        benefits = extract_list_section(
            soup,
            ('benefit', 'avantage', 'offer', 'perk', 'why join'),
        )
        location = (
            meta_content(soup, prop='og:locality')
            or meta_content(soup, name='geo.placename')
            or _guess_location_from_text(description)
        )
        company = meta_content(soup, prop='og:site_name') or _guess_company(title)
        if company.lower() in ('linkedin', 'indeed', 'rekrute', 'emploi.ma', 'novojob'):
            company = _guess_company(title)
        dto = ExtractedOfferDTO(
            title=title,
            company_name=company,
            location=location,
            description=description,
            requirements=requirements,
            benefits=benefits,
            skills=guess_skills(description + requirements),
            company_logo=extract_company_logo(soup),
            source_url=final_url,
            source_platform=self.platform_key,
            parser_used=self.parser_name,
            raw_content=html[:12000],
            metadata={'headings': extract_visible_headings(soup)[:8]},
        )
        return self.normalize(dto)


class ReKruteParser(_HtmlParserBase):
    platform_key = 'REKRUTE'
    parser_name = 'ReKruteParser'
    domain_pattern = re.compile(r'(?:^|\.)rekrute\.com$', re.I)

    def _parse_page(self, soup, html: str, url: str) -> ExtractedOfferDTO:
        title = extract_page_title(soup)
        company = _first_text(soup, '.company-name, .recruiter-name, [itemprop="hiringOrganization"]')
        location = _first_text(soup, '.location, [itemprop="jobLocation"], .ville')
        description = _first_text(soup, '.job-description, #job-description, .offre-content') or extract_description(soup)
        requirements = extract_list_section(soup, ('profil', 'compétence', 'requirement'))
        return ExtractedOfferDTO(
            title=title,
            company_name=company or _guess_company(title),
            location=location,
            description=description,
            requirements=requirements,
            benefits=extract_list_section(soup, ('avantage', 'benefit')),
            skills=guess_skills(description),
            company_logo=extract_company_logo(soup),
        )


class EmploiParser(_HtmlParserBase):
    platform_key = 'EMPLOI_MA'
    parser_name = 'EmploiParser'
    domain_pattern = re.compile(r'(?:^|\.)emploi\.ma$', re.I)

    def _parse_page(self, soup, html: str, url: str) -> ExtractedOfferDTO:
        title = extract_page_title(soup)
        company = _first_text(soup, '.company, .company-name, .recruiter')
        location = _first_text(soup, '.location, .ville, [itemprop="addressLocality"]')
        description = _first_text(soup, '.job-description, .description-offre, article') or extract_description(soup)
        return ExtractedOfferDTO(
            title=title,
            company_name=company or _guess_company(title),
            location=location,
            description=description,
            requirements=extract_list_section(soup, ('profil', 'exigence', 'requirement')),
            benefits=extract_list_section(soup, ('avantage', 'benefit')),
            skills=guess_skills(description),
            company_logo=extract_company_logo(soup),
        )


class NovojobParser(_HtmlParserBase):
    platform_key = 'NOVOJOB'
    parser_name = 'NovojobParser'
    domain_pattern = re.compile(r'(?:^|\.)novojob\.com$', re.I)

    def _parse_page(self, soup, html: str, url: str) -> ExtractedOfferDTO:
        title = extract_page_title(soup)
        company = _first_text(soup, '.company-name, .employer-name, .recruiter')
        location = _first_text(soup, '.location, .job-location')
        description = _first_text(soup, '.job-content, .description, article') or extract_description(soup)
        return ExtractedOfferDTO(
            title=title,
            company_name=company or _guess_company(title),
            location=location,
            description=description,
            requirements=extract_list_section(soup, ('profil', 'requirement', 'compétence')),
            benefits=extract_list_section(soup, ('avantage', 'benefit')),
            skills=guess_skills(description),
            company_logo=extract_company_logo(soup),
        )


class CompanyWebsiteParser(_HtmlParserBase):
    platform_key = 'COMPANY_WEBSITE'
    parser_name = 'CompanyWebsiteParser'
    domain_pattern = re.compile(
        r'(?:careers|jobs|recrutement|carrieres|talents|join)\.',
        re.I,
    )

    def _parse_page(self, soup, html: str, url: str) -> ExtractedOfferDTO:
        generic = GenericWebsiteParser()
        dto = generic.extract(url)
        dto.source_platform = self.platform_key
        dto.parser_used = self.parser_name
        return dto


class LinkedInParser(OfferParserInterface):
    """LinkedIn parser — DOM selectors + og:title fallback."""

    platform_key = 'LINKEDIN'
    parser_name = 'LinkedInParser'

    def supports(self, url: str) -> bool:
        host = urlparse(url).netloc.lower()
        return 'linkedin.com' in host

    def extract(self, url: str) -> ExtractedOfferDTO:
        html, final_url = fetch_html(url)
        soup = parse_soup(html)
        dto = _parse_linkedin_page(soup, html, final_url)
        dto.source_url = final_url
        dto.source_platform = self.platform_key
        dto.parser_used = self.parser_name
        dto.raw_content = html[:12000]
        if not (dto.title or dto.description):
            raise HtmlFetchError(
                'LinkedIn returned a page without readable offer content.',
                code='no_content_extracted',
            )
        dto.metadata['parser_mode'] = 'linkedin_dom'
        return self.normalize(dto)


class IndeedParser(OfferParserInterface):
    """Indeed parser — generic HTML extraction.

    Reports failure rather than returning a stand-in offer: fabricating a title
    made a blocked fetch look like a successful import, and the operator only
    discovered it when publishing refused the empty draft.
    """

    platform_key = 'INDEED'
    parser_name = 'IndeedParser'

    def supports(self, url: str) -> bool:
        host = urlparse(url).netloc.lower()
        return 'indeed.' in host

    def extract(self, url: str) -> ExtractedOfferDTO:
        dto = GenericWebsiteParser().extract(url)
        dto.source_platform = self.platform_key
        dto.parser_used = self.parser_name
        dto.metadata['parser_mode'] = 'html_fallback'
        if not dto.title:
            raise HtmlFetchError(
                'Indeed returned a page without a readable offer title.',
                code='no_content_extracted',
            )
        return self.normalize(dto)


PARSERS: list[OfferParserInterface] = [
    LinkedInParser(),
    IndeedParser(),
    ReKruteParser(),
    EmploiParser(),
    NovojobParser(),
    CompanyWebsiteParser(),
    GenericWebsiteParser(),
]


def resolve_parser(url: str) -> OfferParserInterface:
    for parser in PARSERS:
        if parser.supports(url):
            return parser
    return GenericWebsiteParser()


def detect_platform(url: str) -> str:
    parser = resolve_parser(url)
    if isinstance(parser, GenericWebsiteParser) and not isinstance(parser, CompanyWebsiteParser):
        host = urlparse(url).netloc.lower()
        if any(token in host for token in ('careers', 'jobs', 'recrutement', 'carrieres')):
            return 'COMPANY_WEBSITE'
    return parser.platform_key


def extract_offer_from_url(url: str) -> ExtractedOfferDTO:
    parser = resolve_parser(url)
    return parser.extract(url)


def _first_text(soup, selector: str) -> str:
    return first_text(soup, selector)


def _parse_linkedin_og_title(og_title: str) -> tuple[str, str, str]:
    """Parse LinkedIn og:title into (job_title, company, location)."""
    text = clean_text(og_title.replace('| LinkedIn', '').replace('| linkedin', ''))
    patterns = (
        r'^(.+?)\s+recrute pour des postes de\s+(.+?)\s+\((.+)\)\s*$',
        r'^(.+?)\s+hiring\s+(.+?)\s+in\s+(.+)\s*$',
        r'^(.+?)\s+recrute\s+(.+?)\s+\((.+)\)\s*$',
    )
    for pattern in patterns:
        match = re.match(pattern, text, flags=re.I)
        if match:
            company, title, location = match.group(1), match.group(2), match.group(3)
            return clean_text(title), clean_text(company), clean_text(location)
    return text, '', ''


def _parse_linkedin_page(soup, html: str, url: str) -> ExtractedOfferDTO:
    title = first_text(soup, 'h1.top-card-layout__title, h1.topcard__title, h1[class*="job-title"]')
    company = first_text(soup, 'a.topcard__org-name-link, .topcard__org-name-link')

    location = ''
    for node in soup.select('span.topcard__flavor.topcard__flavor--bullet'):
        classes = ' '.join(node.get('class', []))
        if 'metadata' in classes:
            continue
        candidate = clean_text(node.get_text(' ', strip=True))
        if candidate and candidate.lower() != company.lower():
            location = candidate
            break

    employment_type = ''
    for node in soup.select('span.topcard__flavor, .top-card-layout__flavor'):
        classes = ' '.join(node.get('class', []))
        if 'bullet' in classes or 'metadata' in classes:
            continue
        candidate = clean_text(node.get_text(' ', strip=True))
        if candidate and candidate.lower() not in {company.lower(), location.lower()}:
            if any(token in candidate.lower() for token in ('full-time', 'part-time', 'contract', 'stage', 'intern', 'cdi', 'cdd')):
                employment_type = candidate
                break

    description = ''
    desc_node = soup.select_one('.description__text, .jobs-description-content__text')
    if desc_node:
        description = clean_linkedin_description(desc_node.get_text('\n', strip=True))
    if not description:
        description = extract_description(soup)

    requirements = ''
    benefits = ''
    if desc_node:
        requirements = extract_list_section(
            desc_node,
            ('requirement', 'profil recherch', 'qualification', 'exigence', 'compétence', 'what you', 'who you'),
        )
        benefits = extract_list_section(
            desc_node,
            ('benefit', 'avantage', 'perk', 'why join', 'what we offer'),
        )

    og_title = meta_content(soup, prop='og:title')
    if og_title:
        parsed_title, parsed_company, parsed_location = _parse_linkedin_og_title(og_title)
        if not title and parsed_title:
            title = parsed_title
        if not company and parsed_company:
            company = parsed_company
        if not location and parsed_location:
            location = parsed_location

    if title and company and title.lower().startswith(company.lower() + ' recrute'):
        _, parsed_company, parsed_location = _parse_linkedin_og_title(og_title or title)
        if parsed_company:
            company = parsed_company
        if parsed_location and not location:
            location = parsed_location

    overview, req_from_desc, ben_from_desc = _split_linkedin_description(description)
    if not requirements and req_from_desc:
        requirements = req_from_desc
    if not benefits and ben_from_desc:
        benefits = ben_from_desc
    description = overview or description

    return ExtractedOfferDTO(
        title=title,
        company_name=company or _guess_company(title),
        location=location or _guess_location_from_text(description),
        description=description,
        requirements=requirements,
        benefits=benefits,
        skills=guess_skills(f'{description}\n{requirements}'),
        company_logo=extract_company_logo(soup),
        employment_type=employment_type,
        internship_type=_guess_internship_type_from_text(f'{title} {description} {employment_type}'),
        metadata={'headings': extract_visible_headings(soup)[:10]},
    )


def _split_linkedin_description(description: str) -> tuple[str, str, str]:
    if not description:
        return '', '', ''
    text = clean_multiline_text(description)
    header_pattern = re.compile(
        r'^(Description de l[\u2019\']entreprise|About the company|About the job|'
        r'Profil recherch[ée]|Requirements|Qualifications|Responsabilit[ée]s|'
        r'Benefits|Avantages|What you.?ll do)\s*$',
        re.I | re.M,
    )
    matches = list(header_pattern.finditer(text))
    if not matches:
        return text, '', ''

    sections: dict[str, str] = {}
    for idx, match in enumerate(matches):
        label = match.group(1).lower()
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        body = clean_multiline_text(text[start:end])
        if body:
            sections[label] = body

    overview_keys = ('about the job', 'description de l')
    req_keys = ('profil recherch', 'requirements', 'qualifications', 'what you', 'responsabilit')
    ben_keys = ('avantages', 'benefits')

    overview_parts = [body for key, body in sections.items() if any(k in key for k in overview_keys)]
    if not overview_parts:
        overview_parts = [body for key, body in sections.items() if 'entreprise' in key or 'company' in key]
    if not overview_parts and sections:
        overview_parts = [next(iter(sections.values()))]

    req_parts = [body for key, body in sections.items() if any(k in key for k in req_keys)]
    ben_parts = [body for key, body in sections.items() if any(k in key for k in ben_keys)]

    return (
        '\n\n'.join(overview_parts)[:6000],
        '\n\n'.join(req_parts)[:4000],
        '\n\n'.join(ben_parts)[:4000],
    )


def _guess_internship_type_from_text(text: str) -> str:
    lowered = (text or '').lower()
    if any(token in lowered for token in ('pfe', 'projet de fin d')):
        return 'pfe'
    if 'pfa' in lowered:
        return 'pfa'
    if 'alternance' in lowered:
        return 'alternance'
    if any(token in lowered for token in ('stage', 'intern', 'internship')):
        return 'internship'
    return 'internship'


def _guess_company(title: str) -> str:
    if ' - ' in title:
        parts = [p.strip() for p in title.split(' - ') if p.strip()]
        if len(parts) >= 2:
            return parts[-1]
    if ' chez ' in title.lower():
        return title.split(' chez ', 1)[-1].strip()
    return ''


def _guess_location_from_text(text: str) -> str:
    if not text:
        return ''
    cities = (
        'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir',
        'Mohammedia', 'Kenitra', 'Oujda', 'Tétouan',
    )
    for city in cities:
        if city.lower() in text.lower():
            return city
    return ''

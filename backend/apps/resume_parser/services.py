import re
from collections import defaultdict

try:
    import pdfplumber
except ImportError:  # pragma: no cover
    pdfplumber = None


SECTION_ALIASES = {
    'about': ['summary', 'about', 'profile', 'objective'],
    'skills': ['skills', 'technical skills', 'core skills'],
    'technologies': ['technologies', 'tools', 'tech stack'],
    'projects': ['projects', 'personal projects'],
    'education': ['education', 'academic background'],
    'work_experience': ['experience', 'work experience', 'employment history'],
    'contact': ['contact', 'contact information'],
}

EMAIL_RE = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
PHONE_RE = re.compile(r'(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)\d{3}[\s-]?\d{4}')
URL_RE = re.compile(r'https?://\S+|www\.\S+')
HEADING_CLEAN_RE = re.compile(r'[^a-z ]+')


def clean_text(text: str) -> str:
    if not text:
        return ''
    # Common artifact emitted by some PDF extraction paths.
    text = re.sub(r'\(cid:\d+\)', '', text)
    # Remove non-printable chars except newline/tab and normalize spacing.
    text = ''.join(ch for ch in text if ch.isprintable() or ch in '\n\t')
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def normalize_heading(text: str) -> str:
    text = (text or '').lower().strip()
    text = text.rstrip(':')
    text = text.replace('&', ' and ')
    text = HEADING_CLEAN_RE.sub(' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def detect_section_heading(line: str):
    normalized = normalize_heading(line)
    if not normalized:
        return None

    for key, aliases in SECTION_ALIASES.items():
        for alias in aliases:
            alias_norm = normalize_heading(alias)
            if normalized == alias_norm:
                return key
            # Accept forms like "skills -" or "projects |"
            if normalized.startswith(alias_norm + ' '):
                return key
    return None


def extract_text_from_pdf(file_path: str) -> str:
    if pdfplumber is None:
        raise RuntimeError('pdfplumber is not installed. Add it to requirements.txt')

    pages = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            pages.append(clean_text(page.extract_text() or ''))
    return clean_text('\n'.join(pages))


def split_sections(text: str):
    lines = [clean_text(line) for line in text.splitlines() if clean_text(line)]
    sections = defaultdict(list)
    current = 'about'

    for line in lines:
        matched = detect_section_heading(line)
        if matched:
            current = matched
            continue
        sections[current].append(line)

    return {k: '\n'.join(v).strip() for k, v in sections.items() if v}


def parse_list_items(section_text: str):
    if not section_text:
        return []
    tokens = re.split(r'[\n\|,\u2022]', section_text)
    return [clean_text(item.strip(' -\t')) for item in tokens if item.strip(' -\t')]


def cleanup_links(links):
    cleaned = []
    seen = set()
    for link in links:
        value = clean_text((link or '').rstrip('.,;:|)'))
        if not value:
            continue
        lower = value.lower()
        if lower in seen:
            continue
        seen.add(lower)
        cleaned.append(value)
    return cleaned


def build_about_text(raw_lines, sections, name):
    # Prefer explicitly labeled About/Summary section.
    explicit_about = clean_text(sections.get('about', ''))
    if explicit_about:
        return explicit_about

    # Fall back to header lines before the first detected section heading.
    intro_lines = []
    for line in raw_lines:
        if detect_section_heading(line):
            break
        intro_lines.append(line)

    about_lines = []
    for line in intro_lines:
        if line == name:
            continue
        if EMAIL_RE.search(line) or PHONE_RE.search(line) or URL_RE.search(line):
            continue
        if len(normalize_heading(line).split()) <= 1:
            continue
        about_lines.append(line)

    return clean_text(' '.join(about_lines))


def parse_resume(file_path: str):
    raw_text = extract_text_from_pdf(file_path)
    sections = split_sections(raw_text)

    lines = [clean_text(line) for line in raw_text.splitlines() if clean_text(line)]
    name = lines[0] if lines else 'Unnamed Developer'

    email_match = EMAIL_RE.search(raw_text)
    phone_match = PHONE_RE.search(raw_text)
    contacts = {
        'email': email_match.group(0) if email_match else '',
        'phone': phone_match.group(0) if phone_match else '',
        'links': cleanup_links(URL_RE.findall(raw_text)),
    }

    project_items = []
    for chunk in sections.get('projects', '').splitlines():
        chunk = clean_text(chunk)
        if not chunk:
            continue
        bits = chunk.split(':', 1)
        if len(bits) == 2:
            title, description = bits
        else:
            title, description = chunk[:60], chunk
        project_items.append({'title': title.strip(), 'description': description.strip()})

    education_items = []
    for chunk in sections.get('education', '').splitlines():
        chunk = clean_text(chunk)
        if not chunk:
            continue
        parts = [p.strip() for p in chunk.split(',') if p.strip()]
        education_items.append(
            {
                'degree': parts[0] if parts else chunk,
                'institution': parts[1] if len(parts) > 1 else '',
            }
        )

    experience_items = []
    for chunk in sections.get('work_experience', '').splitlines():
        chunk = clean_text(chunk)
        if not chunk:
            continue
        experience_items.append({'role': chunk, 'description': chunk})

    return {
        'name': name,
        'about': build_about_text(lines, sections, name),
        'skills': parse_list_items(sections.get('skills', '')),
        'technologies': parse_list_items(sections.get('technologies', '')),
        'projects': project_items,
        'education': education_items,
        'work_experience': experience_items,
        'contact': contacts,
    }

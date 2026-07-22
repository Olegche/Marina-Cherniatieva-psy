import re
import subprocess
from pathlib import Path
from urllib.parse import urlparse

SITEMAP_PATH = "sitemap.xml"


def get_last_commit_date(filepath):
    if not Path(filepath).exists():
        return None
    result = subprocess.run(
        ["git", "log", "-1", "--format=%ad", "--date=format:%Y-%m-%d", "--", filepath],
        capture_output=True,
        text=True,
    )
    date = result.stdout.strip()
    return date or None


def url_to_local_path(url):
    path = urlparse(url).path.lstrip("/")
    if path == "" or path.endswith("/"):
        path = path + "index.html"
    return path


def process_sitemap(content):
    def process_url_block(match):
        block = match.group(0)
        loc_match = re.search(r"<loc>(.*?)</loc>", block)
        if not loc_match:
            return block

        url = loc_match.group(1).strip()
        local_file = url_to_local_path(url)
        date = get_last_commit_date(local_file)

        if date is None:
            return block

        if "<lastmod>" in block:
            block = re.sub(r"<lastmod>.*?</lastmod>", f"<lastmod>{date}</lastmod>", block)
        else:
            block = block.replace("</loc>", f"</loc>\n    <lastmod>{date}</lastmod>")

        return block

    return re.sub(r"<url>.*?</url>", process_url_block, content, flags=re.DOTALL)


def main():
    content = Path(SITEMAP_PATH).read_text(encoding="utf-8")
    updated = process_sitemap(content)
    Path(SITEMAP_PATH).write_text(updated, encoding="utf-8")


if __name__ == "__main__":
    main()

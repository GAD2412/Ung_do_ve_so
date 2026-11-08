#!/usr/bin/env python3
"""
scripts/crawl.py
Crawl XSMN & XSMT lottery results from xskt.com.vn RSS feeds.
Stdlib-only, validates prize digit lengths, merges into data/results.json,
and retains ~45 days of recent history.
"""

import os
import sys
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta

FEEDS = [
    ("mn", "https://xskt.com.vn/rss-feed/mien-nam-xsmn.rss"),
    ("mt", "https://xskt.com.vn/rss-feed/mien-trung-xsmt.rss"),
]

RESULTS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "results.json")
DAYS_TO_KEEP = 45


def parse_pub_date(pub_date_str):
    """
    Parse pubDate string into (year, month).
    Supports 'DD/MM/YYYY', 'Sun, 08 Nov 2026 10:29:03 GMT', etc.
    """
    if not pub_date_str:
        now = datetime.now(timezone.utc)
        return now.year, now.month

    pub_date_str = pub_date_str.strip()

    # Try dd/mm/yyyy
    dmy_m = re.search(r'(\d{1,2})/(\d{1,2})/(\d{4})', pub_date_str)
    if dmy_m:
        return int(dmy_m.group(3)), int(dmy_m.group(2))

    # Try RFC 2822 standard: e.g. 'Sun, 08 Nov 2026'
    months = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    }
    rfc_m = re.search(r'(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})', pub_date_str)
    if rfc_m:
        m_str = rfc_m.group(2).capitalize()
        month = months.get(m_str, datetime.now(timezone.utc).month)
        year = int(rfc_m.group(3))
        return year, month

    now = datetime.now(timezone.utc)
    return now.year, now.month


def parse_item_date(title, item_pub_date_str, channel_pub_date_str):
    """
    Extract YYYY-MM-DD from title (NGÀY dd/mm) and pubDate year.
    Handles new year rollover (Dec -> Jan).
    """
    # Title format: KẾT QUẢ XỔ SỐ MIỀN NAM NGÀY 07/11 (Thứ Bảy)
    m = re.search(r'(?:NGÀY|NGAY)\s*(\d{1,2})[/-](\d{1,2})', title, re.IGNORECASE)
    if not m:
        return None

    day = int(m.group(1))
    month = int(m.group(2))

    # Infer year from item or channel pubDate
    year, pub_month = parse_pub_date(item_pub_date_str or channel_pub_date_str)

    # Handle year rollover:
    # If drawn in Dec (month 12) but crawled in Jan (pub_month 1)
    if month == 12 and pub_month == 1:
        year -= 1
    # If drawn in Jan (month 1) but feed pub_month is 12 (rare edge case)
    elif month == 1 and pub_month == 12:
        year += 1

    try:
        dt = datetime(year, month, day)
        return dt.strftime("%Y-%m-%d")
    except ValueError:
        return None


def validate_station_prizes(data):
    """
    Validate prize lengths according to standard XSMN/XSMT lottery rules:
    - db: 6 digits
    - g1: 5 digits
    - g2: 5 digits
    - g3: 2 numbers, each 5 digits
    - g4: 7 numbers, each 5 digits
    - g5: 4 digits
    - g6: 3 numbers, each 4 digits
    - g7: 3 digits
    - g8: 2 digits
    Returns True if valid, False otherwise.
    """
    def check_digits(val, expected_len):
        return isinstance(val, str) and len(val) == expected_len and val.isdigit()

    if not check_digits(data.get("db"), 6):
        return False
    if not check_digits(data.get("g1"), 5):
        return False
    if not check_digits(data.get("g2"), 5):
        return False

    g3 = data.get("g3")
    if not (isinstance(g3, list) and len(g3) == 2 and all(check_digits(x, 5) for x in g3)):
        return False

    g4 = data.get("g4")
    if not (isinstance(g4, list) and len(g4) == 7 and all(check_digits(x, 5) for x in g4)):
        return False

    if not check_digits(data.get("g5"), 4):
        return False

    g6 = data.get("g6")
    if not (isinstance(g6, list) and len(g6) == 3 and all(check_digits(x, 4) for x in g6)):
        return False

    if not check_digits(data.get("g7"), 3):
        return False
    if not check_digits(data.get("g8"), 2):
        return False

    return True


def parse_description(desc_text):
    """
    Parse description containing station blocks:
    [Tên đài]
    ĐB: ...
    1: ...
    ...
    7: 4528: 15 (joined or separate)
    Returns dict: { "Station Name": { "db": ..., "g1": ..., ... } }
    """
    results = {}
    if not desc_text:
        return results

    # Split by [Station Name]
    blocks = re.split(r'\[(.*?)\]', desc_text)
    # blocks pattern: [preamble, station1, content1, station2, content2, ...]
    for i in range(1, len(blocks), 2):
        station_name = blocks[i].strip()
        content = blocks[i + 1]

        data = {
            "db": None,
            "g1": None,
            "g2": None,
            "g3": [],
            "g4": [],
            "g5": None,
            "g6": [],
            "g7": None,
            "g8": None,
        }

        for line in content.splitlines():
            line = line.strip()
            if not line:
                continue

            if line.startswith("ĐB:"):
                data["db"] = line.split(":", 1)[1].strip()
            elif line.startswith("1:"):
                data["g1"] = line.split(":", 1)[1].strip()
            elif line.startswith("2:"):
                data["g2"] = line.split(":", 1)[1].strip()
            elif line.startswith("3:"):
                data["g3"] = [x.strip() for x in line.split(":", 1)[1].split("-") if x.strip()]
            elif line.startswith("4:"):
                data["g4"] = [x.strip() for x in line.split(":", 1)[1].split("-") if x.strip()]
            elif line.startswith("5:"):
                data["g5"] = line.split(":", 1)[1].strip()
            elif line.startswith("6:"):
                data["g6"] = [x.strip() for x in line.split(":", 1)[1].split("-") if x.strip()]
            elif "7:" in line:
                # Handle joined G7 and G8 bug in xskt: e.g. '7: 4528: 15'
                g78 = re.search(r'7:\s*(\d{3})\s*8:\s*(\d{2})', line)
                if g78:
                    data["g7"] = g78.group(1)
                    data["g8"] = g78.group(2)
                else:
                    data["g7"] = line.split("7:", 1)[1].strip()
            elif line.startswith("8:"):
                data["g8"] = line.split(":", 1)[1].strip()

        if validate_station_prizes(data):
            results[station_name] = data
        else:
            print(f"  [WARN] Station '{station_name}' failed validation, skipping: {data}", file=sys.stderr)

    return results


def crawl_feed(feed_url):
    """
    Fetch and parse a single RSS feed.
    Returns dict: { "YYYY-MM-DD": { "Station": { prizes... } } }
    """
    req = urllib.request.Request(
        feed_url,
        headers={"User-Agent": "SoXoBoTui/1.0 (+https://github.com)"}
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        xml_bytes = resp.read()

    root = ET.fromstring(xml_bytes)
    channel = root.find("channel")
    channel_pub = channel.findtext("pubDate") if channel is not None else None

    feed_results = {}
    for item in root.findall(".//item"):
        title = item.findtext("title") or ""
        item_pub = item.findtext("pubDate")
        date_str = parse_item_date(title, item_pub, channel_pub)
        if not date_str:
            continue

        desc = item.findtext("description") or ""
        stations = parse_description(desc)
        if stations:
            feed_results[date_str] = stations

    return feed_results


def merge_and_save(crawled_data):
    """
    Merge newly crawled data into RESULTS_FILE and prune entries older than DAYS_TO_KEEP.
    """
    existing_data = {}
    if os.path.exists(RESULTS_FILE):
        try:
            with open(RESULTS_FILE, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except Exception as e:
            print(f"Error reading existing results: {e}", file=sys.stderr)

    # Merge crawled data
    for date_str, regions in crawled_data.items():
        if date_str not in existing_data:
            existing_data[date_str] = {}
        for region_code, stations in regions.items():
            if region_code not in existing_data[date_str]:
                existing_data[date_str][region_code] = {}
            for station_name, prizes in stations.items():
                existing_data[date_str][region_code][station_name] = prizes

    # Determine cutoff date (DAYS_TO_KEEP days from today or latest entry)
    all_dates = []
    for d in existing_data.keys():
        try:
            all_dates.append(datetime.strptime(d, "%Y-%m-%d"))
        except ValueError:
            pass

    if all_dates:
        latest_date = max(all_dates)
        cutoff_date = latest_date - timedelta(days=DAYS_TO_KEEP)
        filtered_data = {}
        for d, val in existing_data.items():
            try:
                dt = datetime.strptime(d, "%Y-%m-%d")
                if dt >= cutoff_date:
                    filtered_data[d] = val
            except ValueError:
                pass
        existing_data = filtered_data

    # Sort dates descending
    sorted_data = dict(sorted(existing_data.items(), key=lambda x: x[0], reverse=True))

    os.makedirs(os.path.dirname(RESULTS_FILE), exist_ok=True)
    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(sorted_data, f, ensure_ascii=False, indent=2)

    print(f"Successfully saved {len(sorted_data)} dates to {RESULTS_FILE}")


def main():
    print("Starting lottery crawl...")
    crawled = {}

    for region_code, feed_url in FEEDS:
        print(f"Fetching {region_code.upper()} feed: {feed_url}")
        try:
            region_results = crawl_feed(feed_url)
            for date_str, stations in region_results.items():
                if date_str not in crawled:
                    crawled[date_str] = {}
                crawled[date_str][region_code] = stations
            print(f"  Got {len(region_results)} dates for {region_code.upper()}")
        except Exception as e:
            print(f"  Error fetching {region_code}: {e}", file=sys.stderr)

    merge_and_save(crawled)


if __name__ == "__main__":
    main()

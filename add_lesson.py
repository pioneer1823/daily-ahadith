#!/usr/bin/env python3
"""
add_lesson.py — move a day's Hadith lesson from WhatsApp onto the Daily Ahadith site.

Run it from this folder:
    python3 add_lesson.py

It asks a few questions, then adds one entry to hadiths.json.

Required each day: the Arabic hadith text, and the Urdu title + translation + source
(since that's what the WhatsApp group already gives you).
English is optional. If you skip it, the site quietly shows the Urdu version to
English/Arabic/Persian/Pashto visitors with a small "translation coming soon" note,
instead of showing nothing.

You can re-run this any time to add another day; it never deletes existing entries.

IMPORTANT — this only updates your local copy of hadiths.json. To make it go live:
    git add hadiths.json
    git commit -m "Add lesson for <date>"
    git push
Vercel is connected to this GitHub repo and redeploys automatically within
about 30 seconds of every push. See README.md for the one-time setup.
"""

import json
import os
import sys
from datetime import date

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, "hadiths.json")


def ask(prompt, required=True, default=None):
    suffix = f" [{default}]" if default else ""
    while True:
        val = input(f"{prompt}{suffix}: ").strip()
        if not val and default is not None:
            return default
        if not val and not required:
            return ""
        if val:
            return val
        print("  This one's required — please enter something (or Ctrl+C to quit).")


def load_entries():
    if not os.path.exists(DATA_PATH):
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_entries(entries):
    entries_sorted = sorted(entries, key=lambda e: e["date"], reverse=True)
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(entries_sorted, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main():
    print("=" * 60)
    print("Daily Ahadith — add today's lesson")
    print("=" * 60)

    entries = load_entries()
    existing_ids = {e["id"] for e in entries}

    today_str = date.today().isoformat()
    entry_date = ask("Date (YYYY-MM-DD)", required=True, default=today_str)

    if entry_date in existing_ids:
        print(f"\nA lesson for {entry_date} already exists.")
        choice = ask("Overwrite it? (y/n)", required=True, default="n")
        if choice.lower() not in ("y", "yes"):
            print("Cancelled — nothing was changed.")
            sys.exit(0)
        entries = [e for e in entries if e["id"] != entry_date]

    print("\n--- Arabic (the hadith text itself, always required) ---")
    arabic = ask("Arabic hadith text")

    print("\n--- Urdu (from the WhatsApp lesson — required) ---")
    ur_title = ask("Short Urdu title / topic (a few words)")
    ur_translation = ask("Urdu translation / explanation")
    ur_source = ask("Source in Urdu (e.g. صحیح بخاری)")

    print("\n--- English (optional — press Enter to skip any of these) ---")
    en_title = ask("English title", required=False)
    en_translation = ask("English translation", required=False)
    en_source = ask("Source in English (e.g. Sahih al-Bukhari)", required=False)

    title = {"ur": ur_title}
    translation = {"ur": ur_translation}
    source = {"ur": ur_source}
    if en_title:
        title["en"] = en_title
    if en_translation:
        translation["en"] = en_translation
    if en_source:
        source["en"] = en_source

    entry = {
        "id": entry_date,
        "date": entry_date,
        "arabic": arabic,
        "title": title,
        "translation": translation,
        "source": source,
    }

    entries.append(entry)
    save_entries(entries)

    print(f"\nSaved. {entry_date}'s lesson is now live on the site.")
    print(f"Total lessons in the archive: {len(entries)}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nCancelled — nothing was changed.")
        sys.exit(1)

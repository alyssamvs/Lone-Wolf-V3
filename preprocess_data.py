#!/usr/bin/env python3
"""
Pre-process accelerationism event data from raw JSON format into a standardized structure
for use in visualizations.

Usage:
    python preprocess_data.py input.json output.json
"""

import json
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional, Union


def preprocess_data(input_file: str, output_file: str) -> None:
    """Process the raw JSON data and save the standardized version to a new file."""
    
    # Load the raw data
    with open(input_file, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    
    # Process each record
    processed_data = [process_record(record) for record in raw_data]
    
    # Save the processed data
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, indent=2)
    
    print(f"Processed {len(processed_data)} records and saved to {output_file}")


def process_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """Transform a single record into the standardized format."""
    
    # Process date components
    date_components = parse_date(record.get("Date", ""))
    
    # Process casualty data - ensure we get 0 instead of None for calculations
    killed = parse_number(record.get("# killed", 0)) or 0
    injured = parse_number(record.get("# injured", 0)) or 0
    
    # Build the location object
    location = {
        "city": record.get("Location: city", ""),
        "state": record.get("Location: state", ""),
        "country": record.get("Location: country", ""),
    }
    
    # Add a formatted location string
    location_parts = [part for part in [location["city"], location["state"], location["country"]] if part]
    location["formatted"] = ", ".join(location_parts)
    
    # Convert age to number
    age = parse_number(record.get("Age", None))
    
    # Process boolean fields
    death_sentence = record.get("Death sentence") == "1"
    life_sentence = record.get("Life sentence") == "1"

    # Safely check veteran status
    veteran_status = record.get("Veteran status", "")
    if veteran_status is None:
        veteran_status = ""
    
    is_veteran = "Active" in veteran_status or "Former" in veteran_status
    
    # Safely check combat status
    combat_status = record.get("Combat veteran", "")
    is_combat_veteran = combat_status == "Yes" if combat_status is not None else False
    
    # Safely check completion status
    completion = record.get("Completion of crime", "")
    is_completed = completion == "Carried through" if completion is not None else False
    
    # Safely check hate crime status
    hate_crime = record.get("Hate crime", "")
    is_hate_crime = hate_crime == "Yes" if hate_crime is not None else False
    
    # Build the standardized record
    return {
        "id": record.get("Case ID", ""),
        "date": {
            "full": date_components.get("iso_date", ""),
            "year": date_components.get("year", None),
            "month": date_components.get("month", None),
            "day": date_components.get("day", None),
            "raw": record.get("Date", "")
        },
        "perpetrator": {
            "name": record.get("Full legal name", ""),
            "firstName": record.get("First name", ""),
            "lastName": record.get("Family name", ""),
            "aliases": record.get("Other names/aliases", None),
            "age": age,
            "gender": record.get("Gender", ""),
            "race": record.get("Racial/ethnic group", ""),
            "religion": record.get("Religion", ""),
            "veteran": {
                "isVeteran": is_veteran,
                "combat": is_combat_veteran,
                "service": record.get("Service classification", "")
            }
        },
        "incident": {
            "location": location,
            "method": record.get("Criminal method", ""),
            "additionalMethod": record.get("Additional criminal method", ""),
            "completed": is_completed,
            "casualties": {
                "killed": killed,
                "injured": injured,
                "total": killed + injured  # This should be safe now since we default to 0
            }
        },
        "ideology": {
            "target": {
                "physical": record.get("Physical target", ""),
                "ideological": record.get("Ideological target", "")
            },
            "affiliation": record.get("Ideological affiliation", ""),
            "hateCrime": is_hate_crime,
            "groupAffiliation": record.get("Group affiliation", "")
        },
        "legal": {
            "charges": record.get("Charges", ""),
            "plea": record.get("Plea", ""),
            "verdict": record.get("Verdict", ""),
            "sentenceMonths": parse_sentence_months(record.get("Length of prison sentence (months)", "")),
            "lifeImprisonment": life_sentence,
            "deathSentence": death_sentence
        },
        "narrative": record.get("Short narrative", ""),
        "source": record.get("Source description", ""),
        "tags": parse_tags(record.get("Tags", ""))
    }


def parse_date(date_str: str) -> Dict[str, Union[str, int, None]]:
    """Parse a date string in MM/DD/YYYY format and return components."""
    result = {
        "iso_date": None,
        "year": None,
        "month": None,
        "day": None
    }
    
    if not date_str:
        return result
    
    try:
        # Handle both escaped and unescaped slashes
        date_str = date_str.replace("\\", "")
        parts = date_str.split("/")
        
        if len(parts) == 3:
            month = int(parts[0])
            day = int(parts[1])
            year = int(parts[2])
            
            # Create ISO format date (YYYY-MM-DD)
            iso_date = f"{year}-{month:02d}-{day:02d}"
            
            result = {
                "iso_date": iso_date,
                "year": year,
                "month": month,
                "day": day
            }
    except (ValueError, IndexError):
        # If date parsing fails, leave as null values
        pass
    
    return result


def parse_number(value: Any) -> Optional[Union[int, float]]:
    """Convert a value to a number if possible, otherwise return None."""
    if value is None:
        return 0  # Return 0 instead of None
    
    # Handle string numbers
    if isinstance(value, str):
        value = value.strip()
        if not value:
            return 0
        
        try:
            # Try to convert to int first, then float if needed
            return int(value)
        except ValueError:
            try:
                return float(value)
            except ValueError:
                return 0
    
    # Handle numeric values (already int or float)
    if isinstance(value, (int, float)):
        return value
    
    return 0  # Default to 0 for any other types


def parse_sentence_months(value: str) -> Optional[int]:
    """Parse the sentence months, handling special cases like 'X'."""
    if value is None or value == "X":
        return None
    return parse_number(value)


def parse_tags(tags_str: str) -> List[str]:
    """Parse a comma-separated tag string into a list of tags."""
    if not tags_str:
        return []
    
    # Make sure tags_str is a string
    if not isinstance(tags_str, str):
        return []
    
    return [tag.strip() for tag in tags_str.split(",") if tag.strip()]


def safe_str(value: Any) -> str:
    """Convert a value to a string safely, handling None."""
    if value is None:
        return ""
    return str(value)


if __name__ == "__main__":
    # Get the input and output filenames from command-line arguments
    if len(sys.argv) != 3:
        print("Usage: python preprocess_data.py input.json output.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    preprocess_data(input_file, output_file)
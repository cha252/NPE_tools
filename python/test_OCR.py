import sys
import re
import easyocr
import os
import numpy as np
from pdf2image import convert_from_path

POPPLER_PATH = r"C:\poppler-26.02.0\Library\bin"

reader = easyocr.Reader(['en'], gpu=False)

def extract_filename(pdf_path):

    print("Exists:", os.path.exists(pdf_path))
    print("Path:", os.path.abspath(pdf_path))

    pages = convert_from_path(
        pdf_path,
        first_page=1,
        last_page=1,
        poppler_path=POPPLER_PATH
    )

    image = pages[0]

    image_np = np.array(image)

    results = reader.readtext(image_np)

    for result in results:
        print(result[1])

    text_lines = [r[1] for r in results]

    full_text = "\n".join(text_lines)

    # ----------------------------
    # Find Job Number
    # ----------------------------

    job_number = None
    job_index = None

    for i, line in enumerate(text_lines):

        match = re.search(r"\b\d{8}\b", line)

        if match:
            job_number = match.group(0)
            job_index = i
            break

    if not job_number:
        return "UNKNOWN_JOB - UNKNOWN_ADDRESS - As Builts"

    # ----------------------------
    # Find Address (Site-based - most reliable)
    # ----------------------------

    address = "UNKNOWN_ADDRESS"

    for i, line in enumerate(text_lines):

        if "SITE" in line.upper():

            # look at the next few lines after "SITE"
            for j in range(i + 1, min(i + 5, len(text_lines))):

                candidate = text_lines[j].strip()

                # skip empty or obvious non-address lines
                if not candidate:
                    continue

                # must contain a number + likely a street indicator
                if any(char.isdigit() for char in candidate):

                    address = candidate.split(",")[0].strip()
                    break

            break

    # Remove invalid filename characters
    address = re.sub(r'[<>,:;"/\\|?*]', "", address)

    filename = f"{job_number} - {address} - As Builts"

    print("Job Number:", job_number)
    print("Address:", address)
    print("Filename:", filename)

    return filename


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ocr.py file.pdf")
        sys.exit(1)

    filename = extract_filename(sys.argv[1])

    print(filename)
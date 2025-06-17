# Line Number Pair Matching Tool

##  Overview

This tool is designed to identify **missing file pairs** (`.upvf` and `.upvc`) based on **line numbers** listed in an input dataset. It handles inconsistencies and formatting issues commonly found in real-world data exports, such as special characters, inconsistent delimiters, and non-standard naming conventions.

---

##  Input Data Format

The tool expects an input file (Excel/CSV) with two main columns:

- **Column 1 (Line Numbers)**:  
  Contains full line numbers, which may include characters like double quotes (`"`), backticks (`` ` ``), or other non-filename-safe symbols.  
  Example:
  PA-16127-1`I"-XP2-NI
  IA-17665-2"-XG0-NI
  - **Column 2 (File Names)**:  
  Contains jumbled filenames (in no particular order) with extensions like `.upvf` or `.upvc`.  
  These file names **do not include special characters**.  
  Example:
  PA-16127-1I-XP2-NI.upvf
  IA-17665-2-XG0-NI.upvc
 
---

## 🔁 Matching Logic

### 🔸 Prefix Matching Strategy

Because file names may omit special characters, this tool uses a **partial prefix matching** strategy:
- For each line number in Column 1, extract everything **up to and including the second hyphen (`-`)**.
- Use that prefix to check for matching file names in Column 2 that:
- Start with the same prefix
- End with `.upvf` or `.upvc`

**Example:**

Line number:
PA-16127-1`I"-XP2-NI


Extracted prefix:
PA-16127-

Check if the following exist in Column 2:
- `PA-16127-*.upvf`
- `PA-16127-*.upvc`

---

##  Output Report

The tool generates a summary table (Excel/CSV or console output), with the following structure:

| Line Prefix   | .upvf Found | .upvc Found | Status         |
|---------------|--------------|--------------|----------------|
| PA-16127-     | ✅            | ✅            | Complete Pair  |
| IA-17665-     | ✅            | ❌            | Missing .upvc  |
| SC-14847-     | ❌            | ❌            | Both Missing   |

---

##  Edge Cases Handled

-  Special characters in line numbers (e.g., `"`, `` ` ``, `/`)
-  Missing `.upvf` or `.upvc` files
-  Extra files in Column 2 without corresponding line numbers
-  Duplicate line numbers in Column 1
-  Blank or malformed entries in either column
-  Extension typos like `.upvfc` are ignored (optional fuzzy matching in future)

---

## Features

- Prefix-based partial matching
- Identifies full, partial, or missing file pairs
- Supports jumbled data
- Clean summary output (CSV/Excel)
- Ready for integration into Excel, Python, or JavaScript workflows

---

##  Future Enhancements

- **Reverse Lookup**:  
  Identify files in Column 2 that do not have any matching prefix from Column 1.

-  **Custom Extension Support**:  
  Allow dynamic file extension filtering (e.g., `.upvx`, `.upvi`, `.upvcx`, etc.)

-  **Fuzzy Matching & Error Detection**:  
  Detect typos like `.upvfc` or `P-14532_1.upvc`.

-  **Interactive Web Interface**:  
  Drag-and-drop file upload, live filters, and colored status indicators.

-  **Regex-Based Matching Rules**:  
  Allow advanced users to define their own custom match patterns.

---

##  How to Use

Depending on implementation, the tool can be:

### 1. **Excel Macro or Script**
- Paste data in two columns
- Use VBA script or Excel formulas
- Output missing pairs in a third sheet or table

### 2. **Python Script**
- Read `.csv` or `.xlsx` via `pandas`
- Process prefixes and match filenames
- Export result as `.xlsx`

### 3. **Web App (Planned)**
- Upload CSV/Excel
- Choose filters (.upvf/.upvc/missing pairs)
- View color-coded results and download summary

---

## Contributors

Maintained by [Your Name or Team]. Contributions, bug reports, and feature suggestions are always welcome!

---

## 📃 License

This project is open-source and available under the MIT License.


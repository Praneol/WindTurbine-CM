from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

RAW_DATA_DIR = PROJECT_ROOT / "ml" / "data" / "raw"
SCADA_DIR = RAW_DATA_DIR / "scada"

CARE_ZIP = SCADA_DIR / "CARE_To_Compare.zip"


def check_dataset():
    if CARE_ZIP.exists():
        size_gb = CARE_ZIP.stat().st_size / (1024 ** 3)

        print("CARE to Compare dataset found.")
        print(f"File: {CARE_ZIP}")
        print(f"Size: {size_gb:.2f} GB")
    else:
        print("CARE to Compare dataset not found.")
        print(f"Expected location: {CARE_ZIP}")


if __name__ == "__main__":
    check_dataset()
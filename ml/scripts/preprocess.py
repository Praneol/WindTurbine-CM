from pathlib import Path
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]

PROCESSED_DIR = PROJECT_ROOT / "ml" / "data" / "processed" / "care"


def inspect_csv(file_path):
    print(f"\nInspecting: {file_path.name}")

    df = pd.read_csv(file_path)

    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")

    print("\nColumns:")
    for column in df.columns:
        print(f" - {column}")

    print("\nFirst 5 rows:")
    print(df.head())


def find_csv_files():
    csv_files = list(PROCESSED_DIR.rglob("*.csv"))

    if not csv_files:
        print("No CSV files found.")
        print(f"Expected processed dataset location: {PROCESSED_DIR}")
        return

    print(f"Found {len(csv_files)} CSV file(s).")

    for file_path in csv_files:
        inspect_csv(file_path)


if __name__ == "__main__":
    find_csv_files()
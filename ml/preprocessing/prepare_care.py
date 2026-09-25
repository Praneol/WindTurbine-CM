import pandas as pd
from pathlib import Path

# --------------------------------------------------
# CARE to Compare - Step 2
# Create event-based anomaly labels
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_FILE = (
    BASE_DIR
    / "data"
    / "CARE_To_Compare"
    / "CARE_To_Compare"
    / "Wind Farm A"
    / "datasets"
    / "0.csv"
)

EVENT_FILE = (
    BASE_DIR
    / "data"
    / "CARE_To_Compare"
    / "CARE_To_Compare"
    / "Wind Farm A"
    / "event_info.csv"
)

print("=" * 60)
print("CARE TO COMPARE - EVENT-BASED LABELING")
print("=" * 60)

# --------------------------------------------------
# Load SCADA data
# --------------------------------------------------

print("\nLoading SCADA dataset...")

df = pd.read_csv(DATA_FILE, sep=";")
df["time_stamp"] = pd.to_datetime(df["time_stamp"])

print(f"SCADA rows loaded: {len(df):,}")

# --------------------------------------------------
# Load event information
# --------------------------------------------------

print("\nLoading event information...")

events = pd.read_csv(EVENT_FILE, sep=";")

events["event_start"] = pd.to_datetime(events["event_start"])
events["event_end"] = pd.to_datetime(events["event_end"])

print(f"Total events in event_info.csv: {len(events)}")

# --------------------------------------------------
# Create labels
# --------------------------------------------------
# --------------------------------------------------
# Handle missing sensor values
# Time interpolation preserves local sensor behavior.
# --------------------------------------------------

numeric_sensor_columns = df.select_dtypes(include="number").columns

df[numeric_sensor_columns] = (
    df[numeric_sensor_columns]
    .interpolate(method="linear", limit_direction="both")
)

print("\nMissing sensor values after interpolation:")
print(df[numeric_sensor_columns].isna().sum().sum())
df["anomaly_label"] = 0
df["event_id"] = pd.NA
df["event_description"] = pd.NA

# --------------------------------------------------
# ONLY anomaly events are used for anomaly labeling
# Normal events are NOT anomalies.
# --------------------------------------------------

anomaly_events = events[
    events["event_label"].str.lower() == "anomaly"
]

print(f"Anomaly events: {len(anomaly_events)}")
print(f"Normal events: {len(events) - len(anomaly_events)}")

# --------------------------------------------------
# Match anomaly events with SCADA timestamps
# --------------------------------------------------

for _, event in anomaly_events.iterrows():

    asset_mask = df["asset_id"] == event["asset"]

    time_mask = (
        (df["time_stamp"] >= event["event_start"])
        & (df["time_stamp"] <= event["event_end"])
    )

    mask = asset_mask & time_mask

    df.loc[mask, "anomaly_label"] = 1
    df.loc[mask, "event_id"] = event["event_id"]
    df.loc[mask, "event_description"] = event["event_description"]

# --------------------------------------------------
# Results
# --------------------------------------------------

print("\n--- LABEL DISTRIBUTION ---")

print(
    df["anomaly_label"]
    .value_counts()
    .sort_index()
    .to_string()
)

print("\n--- ANOMALY ROWS ---")

anomaly_rows = df[df["anomaly_label"] == 1]

print(f"Anomaly rows: {len(anomaly_rows):,}")

print("\n--- ANOMALY EVENT TYPES ---")

if len(anomaly_rows) > 0:
    print(
        anomaly_rows["event_description"]
        .value_counts()
        .to_string()
    )
else:
    print("No anomaly rows detected.")

# --------------------------------------------------
# Verify Asset 0 events
# --------------------------------------------------

print("\n--- ASSET 0 EVENT VERIFICATION ---")

asset_0_events = events[events["asset"] == 0]

for _, event in asset_0_events.iterrows():

    matching_rows = df[
        (df["asset_id"] == event["asset"])
        & (df["time_stamp"] >= event["event_start"])
        & (df["time_stamp"] <= event["event_end"])
    ]

    print(
        f"Event {event['event_id']} | "
        f"{event['event_label']} | "
        f"{event['event_description']} | "
        f"Matching rows: {len(matching_rows):,}"
    )

print("\n" + "=" * 60)
print("STEP 2 COMPLETE")
print("=" * 60)

# --------------------------------------------------
# Save labeled dataset
# --------------------------------------------------

OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "care_dataset_0_labeled.csv"

df.to_csv(OUTPUT_FILE, index=False)

print(f"\nLabeled dataset saved to:")
print(OUTPUT_FILE)
print(f"Saved rows: {len(df):,}")
print(f"Saved columns: {len(df.columns)}")
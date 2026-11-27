import io
import json
import math
import os
import time
from typing import Any

import joblib
import pandas as pd
import sklearn
from flask import Flask, Response, jsonify, make_response, request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_CANDIDATES = [
    os.path.join(BASE_DIR, "models", "rf_model.joblib"),
    os.path.abspath(os.path.join(BASE_DIR, "..", "rf_model.joblib")),
]
STATIONS_PATH = os.path.join(BASE_DIR, "data", "stations.json")
PRESETS_PATH = os.path.join(BASE_DIR, "data", "presets.json")

MAX_BATCH_BYTES = 5 * 1024 * 1024
MAX_BATCH_ROWS = 5000

MODEL_METRICS = {
    "r2": 0.8933,
    "mae": 0.743,
    "rmse": 1.0023,
}

DEFAULT_CORS_ORIGINS = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
}


def resolve_model_path() -> str:
    for candidate in MODEL_CANDIDATES:
        if os.path.exists(candidate):
            return candidate
    raise FileNotFoundError(
        f"File model rf_model.joblib tidak ditemukan di: {MODEL_CANDIDATES}"
    )


def load_json_file(path: str) -> list[dict[str, Any]]:
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


MODEL_PATH = resolve_model_path()
MODEL = joblib.load(MODEL_PATH)
FEATURE_NAMES: list[str] = [str(name) for name in MODEL.feature_names_in_]
GLOBAL_IMPORTANCES: list[dict[str, Any]] = sorted(
    [
        {
            "feature": name,
            "importance": round(float(imp), 4),
        }
        for name, imp in zip(FEATURE_NAMES, MODEL.feature_importances_)
    ],
    key=lambda item: item["importance"],
    reverse=True,
)
STATIONS: list[dict[str, Any]] = load_json_file(STATIONS_PATH)
PRESETS: list[dict[str, Any]] = load_json_file(PRESETS_PATH)

app = Flask(__name__)


def get_allowed_origins() -> set[str]:
    env_val = os.environ.get("CORS_ALLOW_ORIGIN", "").strip()
    if not env_val:
        return DEFAULT_CORS_ORIGINS
    return {origin.strip() for origin in env_val.split(",") if origin.strip()}


def apply_cors_headers(response: Response) -> Response:
    allowed = get_allowed_origins()
    origin = request.headers.get("Origin", "")

    if "*" in allowed:
        response.headers["Access-Control-Allow-Origin"] = "*"
    elif origin in allowed:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"

    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept"
    return response


@app.before_request
def handle_preflight() -> Response | None:
    if request.method == "OPTIONS":
        resp = make_response("", 204)
        return apply_cors_headers(resp)
    return None


@app.after_request
def add_cors_headers(response: Response) -> Response:
    return apply_cors_headers(response)


def classify_thermal_level(temp_c: float) -> str:
    if temp_c < 25.0:
        return "cool"
    if temp_c < 30.0:
        return "normal"
    if temp_c < 33.0:
        return "warm"
    if temp_c < 35.0:
        return "advisory"
    return "warning"


def error_response(
    status_code: int,
    code: str,
    message: str,
    details: dict[str, Any] | None = None,
) -> tuple[Response, int]:
    payload: dict[str, Any] = {
        "error": {
            "code": code,
            "message": message,
        }
    }
    if details is not None:
        payload["error"]["details"] = details
    return jsonify(payload), status_code


def parse_finite_float(value: Any) -> float | None:
    if isinstance(value, bool) or value is None:
        return None
    if isinstance(value, str) and value.strip() == "":
        return None
    try:
        num = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(num):
        return None
    return num


def extract_feature_row(raw_features: dict[str, Any]) -> tuple[dict[str, float] | None, dict[str, str]]:
    normalized = dict(raw_features)
    if "Solar radiation" not in normalized and "Solar_radiation" in normalized:
        normalized["Solar radiation"] = normalized["Solar_radiation"]

    row: dict[str, float] = {}
    field_errors: dict[str, str] = {}

    for feat in FEATURE_NAMES:
        if feat not in normalized:
            field_errors[feat] = f"Field '{feat}' wajib diisi."
            continue
        parsed = parse_finite_float(normalized[feat])
        if parsed is None:
            field_errors[feat] = f"Field '{feat}' harus berupa angka valid (bukan kosong atau NaN)."
            continue
        row[feat] = parsed

    if field_errors:
        return None, field_errors
    return row, {}


@app.route("/api/health", methods=["GET"])
def api_health() -> Response:
    return jsonify(
        {
            "status": "ok",
            "model_loaded": MODEL is not None,
            "model_file": os.path.basename(MODEL_PATH),
            "n_features": len(FEATURE_NAMES),
            "sklearn_version": sklearn.__version__,
        }
    )


@app.route("/api/model-info", methods=["GET"])
def api_model_info() -> Response:
    return jsonify(
        {
            "algorithm": type(MODEL).__name__,
            "n_estimators": int(getattr(MODEL, "n_estimators", 100)),
            "target": "Next_Tmax",
            "unit": "C",
            "metrics": MODEL_METRICS,
            "feature_names": FEATURE_NAMES,
            "feature_importances": GLOBAL_IMPORTANCES,
        }
    )


@app.route("/api/stations", methods=["GET"])
def api_stations() -> Response:
    return jsonify({"stations": STATIONS})


@app.route("/api/presets", methods=["GET"])
def api_presets() -> Response:
    return jsonify({"presets": PRESETS})


@app.route("/api/predict", methods=["POST"])
def api_predict() -> tuple[Response, int] | Response:
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return error_response(
            400,
            "BAD_REQUEST",
            "Body request harus berupa JSON yang valid.",
        )

    raw_features = payload.get("features")
    if not isinstance(raw_features, dict):
        return error_response(
            422,
            "VALIDATION_ERROR",
            "Objek 'features' wajib disertakan berisi 21 parameter cuaca.",
            {"field_errors": {}, "missing_columns": FEATURE_NAMES},
        )

    row, field_errors = extract_feature_row(raw_features)
    if row is None:
        return error_response(
            422,
            "VALIDATION_ERROR",
            "Input cuaca tidak valid atau belum lengkap.",
            {"field_errors": field_errors, "missing_columns": []},
        )

    start = time.perf_counter()
    df_input = pd.DataFrame([row], columns=FEATURE_NAMES)
    predicted = float(MODEL.predict(df_input)[0])
    inference_ms = round((time.perf_counter() - start) * 1000.0, 2)

    predicted_rounded = round(predicted, 2)
    present_tmax = round(row["Present_Tmax"], 2)
    delta_t = round(predicted_rounded - present_tmax, 2)
    status = classify_thermal_level(predicted_rounded)

    top_factors = [
        {
            "feature": item["feature"],
            "importance": item["importance"],
            "value": round(row[item["feature"]], 4),
        }
        for item in GLOBAL_IMPORTANCES[:7]
    ]

    return jsonify(
        {
            "predicted_tmax": predicted_rounded,
            "present_tmax": present_tmax,
            "delta_t": delta_t,
            "heatwave_status": status,
            "inference_ms": inference_ms,
            "top_factors": top_factors,
        }
    )


@app.route("/api/predict/batch", methods=["POST"])
def api_predict_batch() -> tuple[Response, int] | Response:
    if "file" not in request.files:
        return error_response(
            400,
            "BAD_REQUEST",
            "Field multipart 'file' (.csv) wajib disertakan.",
        )

    uploaded = request.files["file"]
    filename = (uploaded.filename or "").lower()
    if not filename.endswith(".csv"):
        return error_response(
            400,
            "INVALID_CSV",
            "Berkas unggahan harus berekstensi .csv.",
        )

    raw_bytes = uploaded.read()
    if len(raw_bytes) > MAX_BATCH_BYTES:
        return error_response(
            413,
            "PAYLOAD_TOO_LARGE",
            "Ukuran file CSV melebihi batas maksimal 5 MB.",
        )

    if not raw_bytes.strip():
        return error_response(
            400,
            "INVALID_CSV",
            "File CSV kosong.",
        )

    try:
        csv_text = raw_bytes.decode("utf-8-sig")
        df_csv = pd.read_csv(io.StringIO(csv_text))
    except Exception as exc:
        return error_response(
            400,
            "INVALID_CSV",
            f"Gagal membaca struktur file CSV: {exc}",
        )

    if len(df_csv) == 0:
        return error_response(
            400,
            "INVALID_CSV",
            "File CSV tidak memiliki baris data.",
        )

    if len(df_csv) > MAX_BATCH_ROWS:
        return error_response(
            413,
            "PAYLOAD_TOO_LARGE",
            f"Jumlah baris melebihi batas maksimal {MAX_BATCH_ROWS} baris.",
        )

    if "Solar radiation" not in df_csv.columns and "Solar_radiation" in df_csv.columns:
        df_csv = df_csv.rename(columns={"Solar_radiation": "Solar radiation"})

    missing_columns = [col for col in FEATURE_NAMES if col not in df_csv.columns]
    if missing_columns:
        return error_response(
            400,
            "INVALID_CSV",
            "Kolom wajib pada CSV belum lengkap.",
            {"missing_columns": missing_columns},
        )

    valid_rows: list[dict[str, float]] = []
    valid_indices: list[int] = []
    row_results: list[dict[str, Any]] = []

    has_date = "Date" in df_csv.columns
    has_station = "station" in df_csv.columns

    for idx, series in df_csv.iterrows():
        row_num = int(idx) + 1
        label_parts: list[str] = []
        if has_date and pd.notna(series["Date"]):
            label_parts.append(str(series["Date"]).strip())
        if has_station and pd.notna(series["station"]):
            try:
                label_parts.append(f"Stasiun {int(float(series['station']))}")
            except (TypeError, ValueError):
                label_parts.append(str(series["station"]).strip())
        row_label = " | ".join(label_parts) if label_parts else f"Baris {row_num}"

        parsed_row: dict[str, float] = {}
        invalid_cols: list[str] = []
        for feat in FEATURE_NAMES:
            val = parse_finite_float(series[feat])
            if val is None:
                invalid_cols.append(feat)
            else:
                parsed_row[feat] = val

        if invalid_cols:
            preview_cols = ", ".join(invalid_cols[:3])
            extra = f" (+{len(invalid_cols) - 3} lainnya)" if len(invalid_cols) > 3 else ""
            row_results.append(
                {
                    "row_index": row_num,
                    "row_label": row_label,
                    "present_tmax": parse_finite_float(series.get("Present_Tmax")),
                    "predicted_tmax": None,
                    "delta_t": None,
                    "heatwave_status": None,
                    "error": f"Nilai kosong atau bukan angka pada kolom: {preview_cols}{extra}.",
                }
            )
        else:
            valid_indices.append(len(row_results))
            valid_rows.append(parsed_row)
            row_results.append(
                {
                    "row_index": row_num,
                    "row_label": row_label,
                    "present_tmax": round(parsed_row["Present_Tmax"], 2),
                    "predicted_tmax": None,
                    "delta_t": None,
                    "heatwave_status": None,
                    "error": None,
                }
            )

    start = time.perf_counter()
    predicted_values: list[float] = []
    if valid_rows:
        df_valid = pd.DataFrame(valid_rows, columns=FEATURE_NAMES)
        preds = MODEL.predict(df_valid)
        for result_pos, pred_val in zip(valid_indices, preds):
            pred_rounded = round(float(pred_val), 2)
            present = row_results[result_pos]["present_tmax"]
            status = classify_thermal_level(pred_rounded)
            row_results[result_pos]["predicted_tmax"] = pred_rounded
            row_results[result_pos]["delta_t"] = round(pred_rounded - present, 2)
            row_results[result_pos]["heatwave_status"] = status
            predicted_values.append(pred_rounded)
    inference_ms = round((time.perf_counter() - start) * 1000.0, 2)

    advisory_count = sum(
        1 for item in row_results if item["heatwave_status"] == "advisory"
    )
    warning_count = sum(
        1 for item in row_results if item["heatwave_status"] == "warning"
    )

    summary = {
        "min_tmax": round(min(predicted_values), 2) if predicted_values else None,
        "max_tmax": round(max(predicted_values), 2) if predicted_values else None,
        "avg_tmax": (
            round(sum(predicted_values) / len(predicted_values), 2)
            if predicted_values
            else None
        ),
        "advisory_count": advisory_count,
        "warning_count": warning_count,
    }

    return jsonify(
        {
            "total_rows": len(df_csv),
            "processed_rows": len(valid_rows),
            "failed_rows": len(df_csv) - len(valid_rows),
            "inference_ms": inference_ms,
            "summary": summary,
            "rows": row_results,
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug, host="0.0.0.0", port=port)

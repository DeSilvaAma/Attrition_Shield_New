from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import shap
import os
from utils import load_sentiment_model, load_lgbm_model, build_feature_vector

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request Schema ---
class PredictionRequest(BaseModel):
    job: str
    rating: int
    career: int
    comp: int
    culture: int
    diversity: int
    senior: int
    wlb: int
    recommend: str
    ceo: str
    outlook: str
    worked_years: str
    pros: str
    cons: str
    title: str  

# --- Load Sentiment Model once at startup ---
tokenizer, sent_model = load_sentiment_model("sentiment_model")

# --- Mapping for UI-friendly feature names ---
UI_MAP = {
    "rating": "Overall Rating",
    "Recommend": "Recommendation",
    "CEO Approval": "CEO Approval",
    "Business Outlook": "Business Outlook",
    "Career Opportunities": "Career Opportunities",
    "Compensation and Benefits": "Comp & Benefits",
    "Culture & Values": "Culture & Values",
    "Senior Management": "Senior Management",
    "Work/Life Balance": "Work/Life Balance",
    "Diversity & Inclusion": "Diversity & Inclusion",
    "worked_years": "Worked Years",
    "overall_sentiment": "Overall Sentiment of Feedback",
    "employee_satisfaction": "Employee Satisfaction",
    "culture_to_pay_ratio": "Culture/Pay Ratio",
    "culture_outlook_alignment": "Culture-Outlook Alignment",
    "tenure_growth_score": "Tenure Growth Score",
    "recommended_satisfaction": "Recommended Satisfaction",
    "inclusion_culture_score": "Inclusion & Culture Score",
    "executive_trust": "Executive Trust",
    "satisfaction_summary": "Satisfaction Summary",
    "title_sentiment": "Title Sentiment",
    "pros_neu_prob": "Pros Neutral Probability",
    "cons_neu_prob": "Cons Neutral Probability"
}

# --- Job model folder ---
MODEL_FOLDER = "Job_Model_Results"

@app.post("/predict")
async def predict_attrition(data: PredictionRequest):
    inputs = data.dict()
    job_model_name = inputs["job"].replace(" ", "_") + "_model"
    model_path = os.path.join(MODEL_FOLDER, f"{job_model_name}.pkl")

    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail="Model for this job role not found.")

    # --- Load Model & Build Features ---
    model = load_lgbm_model(model_path)
    X = build_feature_vector(inputs, tokenizer, sent_model)

    # --- Get Probabilities ---
    probs = model.predict_proba(X)[0]  # attrition=1, stay=0

    # --- Calculate SHAP Values ---
    explainer = shap.TreeExplainer(model)
    shap_vals = explainer.shap_values(X)

    # --- SHAP for attrition class (1=left) ---
    if isinstance(shap_vals, list):
        shap_v = shap_vals[1][0]  # Class 1 = attrition
    else:
        shap_v = shap_vals[0]

    # --- Format SHAP for frontend ---
    contributions = []
    for i, col in enumerate(X.columns):
        if col in UI_MAP:
            contributions.append({
                "feature": UI_MAP[col],
                "impact": round(float(shap_v[i]), 4)
            })

    # Sort by absolute impact
    contributions = sorted(contributions, key=lambda x: abs(x["impact"]), reverse=True)

    return {
        "attrition_risk": float(probs[1]),  # left=1
        "stay_probability": float(probs[0]),
        "impact_scores": contributions
    }
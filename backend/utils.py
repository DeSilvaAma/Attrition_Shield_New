import pickle
import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# --- MODEL LOADING FUNCTIONS ---

def load_sentiment_model(path, device="cpu"):
    """Loads TinyBERT tokenizer and model from the local folder."""
    tokenizer = AutoTokenizer.from_pretrained(path)
    model = AutoModelForSequenceClassification.from_pretrained(path)
    model.to(device)
    model.eval()
    return tokenizer, model

def load_lgbm_model(path):
    """Loads a specific LightGBM .pkl file for the selected job role."""
    with open(path, "rb") as f:
        return pickle.load(f)

# --- SENTIMENT PROCESSING ---

def get_sentiment_probs(text, tokenizer, model, device="cpu"):
    """Get negative, neutral, positive probabilities for a given text."""
    inputs = tokenizer(
        text,
        padding="max_length",
        truncation=True,
        max_length=128,
        return_tensors="pt"
    )
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=-1).cpu().numpy()[0]
    return {"neg": probs[0], "neu": probs[1], "pos": probs[2]}

# --- MAPPINGS ---

label_mapping = {"v": 3, "r": 2, "x": 1, "o": 0}

tenure_mapping = {
    "less than 1 year": 0.5,
    "more than 1 year": 2.0,
    "more than 3 year": 4.0,
    "more than 5 year": 6.0,
    "more than 8 year": 9.0,
    "more than 10 year": 11.0
}

# --- FEATURE BUILDER ---

def build_feature_vector(inputs, tokenizer, sent_model, device="cpu"):
    """
    Build features for the new LGBM model using pros, cons, and title feedback.
    """
    # --- Map categorical variables (Strict Lookup) ---
    rec = label_mapping[inputs["recommend"]]
    ceo_v = label_mapping[inputs["ceo"]]
    out_v = label_mapping[inputs["outlook"]]

    # --- Map worked_years (Strict Lookup) ---
    raw_tenure_str = str(inputs["worked_years"]).strip()
    worked_years = tenure_mapping[raw_tenure_str] 

    # --- Sentiment analysis ---
    pros_p = get_sentiment_probs(inputs["pros"], tokenizer, sent_model, device)
    cons_p = get_sentiment_probs(inputs["cons"], tokenizer, sent_model, device)
    title_p = get_sentiment_probs(inputs["title"], tokenizer, sent_model, device)

    # --- Sentiment scores ---
    pros_sentiment = pros_p["pos"]*1 + pros_p["neu"]*0 + pros_p["neg"]*(-1)
    cons_sentiment = cons_p["pos"]*1 + cons_p["neu"]*0 + cons_p["neg"]*(-1)
    title_sentiment = title_p["pos"]*1 + title_p["neu"]*0 + title_p["neg"]*(-1)

    overall_sentiment = pros_sentiment - cons_sentiment

    # --- MAIN COLUMNS ---
    rating = inputs["rating"]
    career = inputs["career"]
    comp = inputs["comp"]
    culture = inputs["culture"]
    diversity = inputs["diversity"]
    senior = inputs["senior"]
    wlb = inputs["wlb"]

    # --- Derived features (Simplified: No zero-checks needed for 1-5 scales) ---
    employee_satisfaction = ((comp + wlb) / 2) * overall_sentiment
    culture_to_pay_ratio = culture / comp
    culture_outlook_alignment = culture * out_v
    tenure_growth_score = worked_years * career
    recommended_satisfaction = rec * ((comp + wlb) / 2 * overall_sentiment)
    inclusion_culture_score = culture * diversity
    executive_trust = ceo_v * senior
    satisfaction_summary = rating * title_sentiment

    # --- Assemble DataFrame in correct column order ---
    X = pd.DataFrame([[
        rating, rec, ceo_v, out_v, career, comp, senior, wlb, culture, diversity,
        worked_years, pros_p["neu"], title_sentiment, cons_p["neu"], overall_sentiment,
        employee_satisfaction, culture_to_pay_ratio, culture_outlook_alignment,
        tenure_growth_score, recommended_satisfaction, inclusion_culture_score,
        executive_trust, satisfaction_summary
    ]], columns=[
        'rating', 'Recommend', 'CEO Approval', 'Business Outlook', 'Career Opportunities',
        'Compensation and Benefits', 'Senior Management', 'Work/Life Balance',
        'Culture & Values', 'Diversity & Inclusion', 'worked_years',
        'pros_neu_prob', 'title_sentiment', 'cons_neu_prob', 'overall_sentiment',
        'employee_satisfaction', 'culture_to_pay_ratio', 'culture_outlook_alignment',
        'tenure_growth_score', 'recommended_satisfaction', 'inclusion_culture_score',
        'executive_trust', 'satisfaction_summary'
    ])

    return X
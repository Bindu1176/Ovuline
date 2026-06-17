# predictor.py
# Machine Learning Prediction Module for Ovuline PCOD/PCOS System
# Safe retrieval and inference of RandomForest model

import os
import pickle
import numpy as np
from preprocess import transform_single_input

MODEL_FILE_PATH = os.path.join(os.path.dirname(__file__), 'pcod_model.pkl')

def get_model():
    """
    Safely load the Random Forest model from disk.
    If the trained model object does not exist, return None so the API raises
    a proper "Model Not Connected" response instead of throwing exceptions.
    """
    if not os.path.exists(MODEL_FILE_PATH):
        return None
    try:
        with open(MODEL_FILE_PATH, 'rb') as f:
            model = pickle.load(f)
        return model
    except Exception as e:
        print(f"Error reading model file: {e}")
        return None

def predict_pcod_risk(symptom_data):
    """
    Given a raw JSON symptom payload, preprocess features,
    run Random Forest inference, and construct standard responses.
    """
    model = get_model()
    if model is None:
        return {
            "status": "Model Not Connected"
        }
    
    # Preprocess incoming questionnaire row
    processed_input = transform_single_input(symptom_data)
    
    # Run predictions
    # prediction binary result [0 or 1]
    prediction = model.predict(processed_input)[0]
    # prob table [prob_negative, prob_positive]
    probabilities = model.predict_proba(processed_input)[0]
    
    risk_percentage = float(probabilities[1]) * 100
    
    # Confidence score can look at the margin of the prediction
    confidence_score = float(max(probabilities))
    
    prediction_label = 'PCOS Detected' if prediction == 1 or risk_percentage >= 50.0 else 'Unlikely (Healthy)'
    
    return {
        "risk_percentage": round(risk_percentage, 2),
        "prediction_label": prediction_label,
        "confidence_score": round(confidence_score, 4)
    }

# app.py
# Production Python Flask Server for Ovuline AI Engine
# Hosts level-1 diagnostic inference using the trained Random Forest Classifier

import os
from flask import Flask, request, jsonify
from predictor import predict_pcod_risk, get_model

app = Flask(__name__)

# Basic Health Check
@app.route('/health', methods=['GET'])
def health():
    model = get_model()
    return jsonify({
        "status": "healthy",
        "service": "Ovuline Healthcare ML API",
        "model_loaded": model is not None
    })

# Prediction API
@app.route('/predict', methods=['POST'])
def predict():
    """
    POST /predict
    Input: JSON symptom questionnaire object
    Output: JSON evaluation probabilities or 'Model Not Connected' check
    """
    model = get_model()
    if model is None:
        return jsonify({
            "status": "Model Not Connected"
        }), 200 # Standard response as requested
        
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Missing input JSON payload"}), 400
            
        result = predict_pcod_risk(data)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "error": "Failed during model inference execution",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    # Run locally on default Flask port 5000
    print("Starting Ovuline Flask ML Server...")
    app.run(host='0.0.0.0', port=5000, debug=True)

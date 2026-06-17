# train_model.py
# Machine Learning Training Pipeline for Ovuline PCOD/PCOS System
# Model: RandomForestClassifier

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from preprocess import fit_transform_pipeline

# Model storage destination
MODEL_FILE_PATH = os.path.join(os.path.dirname(__file__), 'pcod_model.pkl')
DATASET_FILE_PATH = os.path.join(os.path.dirname(__file__), 'pcos_clinical_dataset.csv')

def generate_clinical_bootstrap_data(num_samples=800):
    """
    Bootstrap a highly realistic clinical-statistic synthetic dataset
    if the user does not supply an external clinical Excel/CSV file first.
    Uses clinical diagnostic correlation matrices for PCOS (Rotterdam criteria).
    """
    np.random.seed(42)
    
    # 14 Questionnaire Features
    # P(Feature=1 | PCOS) vs P(Feature=1 | Healthy)
    clinical_priors = {
        'irregular_periods':   (0.85, 0.15),
        'missed_periods':      (0.70, 0.10),
        'weight_gain':         (0.65, 0.20),
        'bloating':            (0.55, 0.30),
        'acne':                (0.60, 0.25),
        'facial_hair':         (0.75, 0.10),
        'hair_loss':           (0.50, 0.20),
        'sleep_irregularity':  (0.60, 0.25),
        'mood_swings':         (0.70, 0.35),
        'pelvic_pain':         (0.40, 0.15),
        'family_history':      (0.45, 0.15),
    }

    # Synthesize target classes: 40% PCOS positive, 60% Healthy negative
    y = np.random.binomial(1, 0.40, num_samples)
    
    data = {}
    for feature, (p_positive, p_negative) in clinical_priors.items():
        # Draw binomial coin flips based on the diagnosis variable
        data[feature] = [
            np.random.binomial(1, p_positive) if label == 1 else np.random.binomial(1, p_negative)
            for label in y
        ]
        
    # Categorical ranges
    # PMS severity: 'None', 'Mild', 'Moderate', 'Severe' (higher in PCOS)
    pms_probs_pcos = [0.05, 0.20, 0.45, 0.30]
    pms_probs_healthy = [0.40, 0.40, 0.15, 0.05]
    data['pms_severity'] = [
        np.random.choice(['None', 'Mild', 'Moderate', 'Severe'], p=pms_probs_pcos if label == 1 else pms_probs_healthy)
        for label in y
    ]
    
    # Exercise frequency: 'Rarely', '1-2 times/week', '3-4 times/week', 'Daily' (lower in PCOS/metabolic risks)
    ex_probs_pcos = [0.55, 0.30, 0.10, 0.05]
    ex_probs_healthy = [0.20, 0.40, 0.30, 0.10]
    data['exercise_frequency'] = [
        np.random.choice(['Rarely', '1-2 times/week', '3-4 times/week', 'Daily'], p=ex_probs_pcos if label == 1 else ex_probs_healthy)
        for label in y
    ]
    
    # Food habits: 'Unhealthy', 'Balanced', 'Healthy', 'Strict Diet'
    food_probs_pcos = [0.45, 0.40, 0.12, 0.03]
    food_probs_healthy = [0.15, 0.50, 0.28, 0.07]
    data['food_habits'] = [
        np.random.choice(['Unhealthy', 'Balanced', 'Healthy', 'Strict Diet'], p=food_probs_pcos if label == 1 else food_probs_healthy)
        for label in y
    ]
    
    data['label'] = y
    
    df = pd.DataFrame(data)
    df.to_csv(DATASET_FILE_PATH, index=False)
    print(f"Generated bootstrap clinical dataset at {DATASET_FILE_PATH}")
    return df

def run_training_pipeline():
    print("Initiating Ovuline ML Training Pipeline...")
    
    # Load raw dataset or generate bootstrap one
    if not os.path.exists(DATASET_FILE_PATH):
        df_raw = generate_clinical_bootstrap_data()
    else:
        print(f"Loading external clinical dataset from {DATASET_FILE_PATH}")
        df_raw = pd.read_csv(DATASET_FILE_PATH)
        
    # 1. Preprocess
    print("Preprocessing raw symptom data...")
    df_processed = fit_transform_pipeline(df_raw)
    
    # Split features and label
    X = df_processed.drop(columns=['label'])
    y = df_processed['label']
    
    # Train/Test Split (80% Train, 20% Evaluate)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 2. Train RandomForestClassifier
    print("Fitting Random Forest Model...")
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        min_samples_leaf=4,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train, y_train)
    
    # 3. Evaluate results
    predictions = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]
    
    accuracy = accuracy_score(y_test, predictions)
    print(f"\nModel Training Completed!")
    print(f"Validation Set Accuracy Score: {accuracy:.4%}")
    print("\nDetailed Diagnostic Breakdown:")
    print(classification_report(y_test, predictions))
    
    # 4. Save model artifact
    with open(MODEL_FILE_PATH, 'wb') as f:
        pickle.dump(model, f)
    print(f"Trained Random Forest Classifier saved to: {MODEL_FILE_PATH}")

if __name__ == '__main__':
    run_training_pipeline()

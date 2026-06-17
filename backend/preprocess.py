# preprocess.py
# Production Preprocessing Module for Ovuline PCOS Detection
# Standardized data preprocessing for scikit-learn Random Forest Model

import numpy as np
import pandas as pd

def clean_missing_values(df):
    """
    Handle missing values in the dataset.
    Fills numerical columns with their median and categorical columns with their mode.
    """
    df = df.copy()
    for col in df.columns:
        if df[col].dtype == 'object' or df[col].dtype.name == 'category':
            df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'None')
        else:
            df[col] = df[col].fillna(df[col].median() if not pd.isna(df[col].median()) else 0)
    return df

def encode_categorical_values(df, is_inference=False):
    """
    Map textual features into normalized integer levels.
    These mappings must match exactly between model training and online predictions.
    """
    df = df.copy()
    
    # PMS Severity: None, Mild, Moderate, Severe
    pms_map = {'None': 0, 'Mild': 1, 'Moderate': 2, 'Severe': 3}
    if 'pms_severity' in df.columns:
        df['pms_severity'] = df['pms_severity'].map(pms_map).fillna(1).astype(int)
        
    # Exercise Frequency: Rarely, 1-2 times/week, 3-4 times/week, Daily
    exercise_map = {'Rarely': 0, '1-2 times/week': 1, '3-4 times/week': 2, 'Daily': 3}
    if 'exercise_frequency' in df.columns:
        df['exercise_frequency'] = df['exercise_frequency'].map(exercise_map).fillna(1).astype(int)
        
    # Food Habits: Unhealthy, Balanced, Healthy, Strict Diet
    food_map = {'Unhealthy': 0, 'Balanced': 1, 'Healthy': 2, 'Strict Diet': 3}
    if 'food_habits' in df.columns:
        df['food_habits'] = df['food_habits'].map(food_map).fillna(1).astype(int)
        
    # Map boolean flags into binary integers
    binary_cols = [
        'irregular_periods', 'missed_periods', 'weight_gain', 'bloating',
        'acne', 'facial_hair', 'hair_loss', 'sleep_irregularity',
        'mood_swings', 'pelvic_pain', 'family_history'
    ]
    
    for col in binary_cols:
        if col in df.columns:
            # Handle True/False, 'Yes'/'No', '1'/'0', or 1/0
            if df[col].dtype == 'bool':
                df[col] = df[col].astype(int)
            elif df[col].dtype == 'object':
                df[col] = df[col].astype(str).str.lower().map({'yes': 1, 'no': 0, 'true': 1, 'false': 0}).fillna(0).astype(int)
            else:
                df[col] = df[col].fillna(0).astype(int)
                
    return df

def fit_transform_pipeline(df):
    """
    Standard training preprocessing pipeline.
    """
    df_clean = clean_missing_values(df)
    df_encoded = encode_categorical_values(df_clean, is_inference=False)
    return df_encoded

def transform_single_input(symptom_dict):
    """
    Convert a single patient questionnaire response into a validated model input tensor row.
    """
    # Create DataFrame from input dictionary
    df = pd.DataFrame([symptom_dict])
    df_encoded = encode_categorical_values(df, is_inference=True)
    
    # Ensure columns match exactly with the 14 questionnaire inputs
    feature_order = [
        'irregular_periods', 'missed_periods', 'pms_severity', 'weight_gain',
        'bloating', 'acne', 'facial_hair', 'hair_loss', 'sleep_irregularity',
        'mood_swings', 'pelvic_pain', 'family_history', 'exercise_frequency', 'food_habits'
    ]
    
    # Fill any missing keys that were expected
    for col in feature_order:
        if col not in df_encoded.columns:
            df_encoded[col] = 0
            
    return df_encoded[feature_order]

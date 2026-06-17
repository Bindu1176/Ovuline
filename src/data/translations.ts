/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCode } from "../types";

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    title: "Ovuline",
    tagline: "the system that traces the rhythm of your cycle",
    dashboard: "Level 2 Diagnostics",
    calendar: "Cycle Calendar",
    questionnaire: "Level 1 Questionnaire",
    lifestyle: "Lifestyle & Wellness",
    chatbot: "AI Companion",
    profile: "My Profile",
    report: "Download Report",
    settings: "System Config",
    
    // Level 1 Test
    takeLevel1: "Take Level 1 Diagnostic Test",
    questionnaireTitle: "Symptom Screening Questionnaire",
    questionnaireDesc: "Manually answer the following menstrual and hormonal inquiries to estimate your clinical category likelihood.",
    next: "Next",
    back: "Previous",
    submit: "Submit Details",
    submitting: "Analyzing symptoms...",
    restartTest: "Retake Test",
    
    // Level 2 IOT
    level2Title: "Manual Level 2 Entries",
    iotReadings: "Real-time readings from IOT sensors",
    temperature: "Body Temperature",
    heartRate: "Heart Rate",
    insulin: "Fasting Insulin Level",
    mcuStatus: "SpO2 Oxygen Level",
    sensorDisplay: "16x2 Display Message",
    notConnected: "Model Not Connected",
    offlineInfo: "Please run the Flask ML server in /backend to query your trained Random Forest model.",
    riskLabel: "Estimated PCOD/PCOS Probability",
    level2Risk: "Level 2 Hardware Risk Percentage",
    
    // Lifestyle
    lifestyleTitle: "Symptom & Ovuline Lifestyle Recommendations",
    dietFood: "Clinical Diet & Nutrition",
    yogaPostures: "Therapeutic Yoga Postures",
    waterTracker: "Hydration Balance Tracker",
    sleepTracker: "Circadian Sleep Log",
    glasses: "glasses drank",
    target: "Target",
    sleepTarget: "Sleep Target",
    currentSleep: "Logged Sleep",
    hours: "hours",
    addWater: "Drink 250ml",
    resetWater: "Reset Log",
    logSleep: "Log Hours",
    
    // Notifications & Alert
    alerts: "Safety Alerts & Period Overdue Notices",
    cycleActive: "Cycle is regular. Your predicted period starts in 6 days.",
    missedPeriodAlert: "WARNING: Your period is overdue by 5 days based on your historical standard average. Please take a screening test.",
    
    // Language and Themes
    language: "App Language",
    theme: "Interface Theme",
    light: "Light",
    dark: "Dark",
    saveProfile: "Save Profile",
    profileTitle: "Patient Metrics & Personal Attributes"
  },
  hi: {
    title: "ओव्यूलीन (Ovuline)",
    tagline: "वह प्रणाली जो आपके चक्र की लय को ट्रैक करती है",
    dashboard: "स्तर 2 नैदानिक (Level 2)",
    calendar: "चक्र कैलेंडर",
    questionnaire: "स्तर 1 प्रश्नावली",
    lifestyle: "जीवनशैली और स्वास्थ्य",
    chatbot: "एआई साथी",
    profile: "मेरी प्रोफ़ाइल",
    report: "रिपोर्ट डाउनलोड करें",
    settings: "सिस्टम कॉन्फ़िगरेशन",
    
    // Level 1 Test
    takeLevel1: "स्तर 1 नैदानिक ​​परीक्षण लें",
    questionnaireTitle: "लक्षण स्क्रीनिंग प्रश्नावली",
    questionnaireDesc: "अपनी नैदानिक ​​श्रेणी की संभावना का अनुमान लगाने के लिए निम्नलिखित मासिक धर्म और हार्मोनल प्रश्नों का उत्तर दें।",
    next: "अगला",
    back: "पिछला",
    submit: "विवरण सबमिट करें",
    submitting: "लक्षणों का विश्लेषण किया जा रहा है...",
    restartTest: "पुनः परीक्षण करें",
    
    // Level 2 IOT
    level2Title: "मैन्युअल स्तर 2 प्रविष्टियाँ",
    iotReadings: "IoT सेंसर से रीयल-टाइम रीडिंग",
    temperature: "शरीर का तापमान",
    heartRate: "हृदय गति",
    insulin: "फास्टिंग इंसुलिन स्तर",
    mcuStatus: "SpO2 ऑक्सीजन स्तर",
    sensorDisplay: "16x2 डिस्प्ले संदेश",
    notConnected: "मॉडल कनेक्ट नहीं है",
    offlineInfo: "कृपया अपने प्रशिक्षित रैंडम फॉरेस्ट मॉडल से क्वेरी करने के लिए /backend में फ्लास्क एमएल सर्वर चलाएं।",
    riskLabel: "अनुमानित PCOD/PCOS संभावना",
    level2Risk: "स्तर 2 हार्डवेयर जोखिम प्रतिशत",
    
    // Lifestyle
    lifestyleTitle: "लक्षण और ओव्यूलीन जीवनशैली सिफारिशें",
    dietFood: "नैदानिक ​​आहार और पोषण",
    yogaPostures: "चिकित्सीय योग मुद्राएं",
    waterTracker: "हाइड्रेशन बैलेंस ट्रैकर",
    sleepTracker: "सर्कैडियन स्लीप लॉग",
    glasses: "गिलास पिया",
    target: "लक्ष्य",
    sleepTarget: "नींद का लक्ष्य",
    currentSleep: "लॉग की गई नींद",
    hours: "घंटे",
    addWater: "250 मिलीलीटर पीएं",
    resetWater: "रीसेट करें",
    logSleep: "नींद दर्ज करें",
    
    // Notifications & Alert
    alerts: "सुरक्षा अलर्ट और छूटे हुए मासिक धर्म की सूचनाएं",
    cycleActive: "मासिक चक्र नियमित है। आपकी अनुमानित अवधि 6 दिनों में शुरू होगी।",
    missedPeriodAlert: "चेतावनी: आपके मासिक इतिहास के आधार पर आपकी अवधि 5 दिन देरी से चल रही है। कृपया एक स्क्रीनिंग परीक्षण लें।",
    
    // Language and Themes
    language: "भाषा",
    theme: "ऐप थीम",
    light: "प्रकाश",
    dark: "अंधेरा",
    saveProfile: "प्रोफ़ाइल सहेजें",
    profileTitle: "मरीज़ के शारीरिक माप और व्यक्तिगत विवरण"
  },
  es: {
    title: "Ovuline",
    tagline: "el sistema que traza el ritmo de tu ciclo",
    dashboard: "Diagnóstico Nivel 2",
    calendar: "Calendario de Ciclo",
    questionnaire: "Cuestionario Nivel 1",
    lifestyle: "Estilo de Vida y Salud",
    chatbot: "Asistente de IA",
    profile: "Mi Perfil",
    report: "Descargar Informe",
    settings: "Configuración",
    
    // Level 1 Test
    takeLevel1: "Realizar Prueba de Nivel 1",
    questionnaireTitle: "Cuestionario de Detección de Síntomas",
    questionnaireDesc: "Responda manualmente las siguientes preguntas sobre menstruación y hormonas para calcular el riesgo clínico.",
    next: "Siguiente",
    back: "Anterior",
    submit: "Enviar Detalles",
    submitting: "Analizando síntomas...",
    restartTest: "Reiniciar Prueba",
    
    // Level 2 IOT
    level2Title: "Entradas Manuales Nivel 2",
    iotReadings: "Lecturas en tiempo real de los sensores IoT",
    temperature: "Temperatura Corporal",
    heartRate: "Ritmo Cardíaco",
    insulin: "Nivel de Insulina en Ayunas",
    mcuStatus: "Nivel de Oxígeno SpO2",
    sensorDisplay: "Mensaje en Pantalla 16x2",
    notConnected: "Modelo No Conectado",
    offlineInfo: "Ejecute el servidor Flask en /backend para realizar inferencias con el modelo Random Forest.",
    riskLabel: "Probabilidad Estimada de PCOD/PCOS",
    level2Risk: "Porcentaje de Riesgo de Hardware Nivel 2",
    
    // Lifestyle
    lifestyleTitle: "Recomendaciones de Estilo de Vida de Ovuline",
    dietFood: "Dieta Clínica y Nutrición",
    yogaPostures: "Posturas Terapéuticas de Yoga",
    waterTracker: "Seguimiento de Hidratación",
    sleepTracker: "Registro de Sueño Diario",
    glasses: "vasos bebidos",
    target: "Meta",
    sleepTarget: "Meta de Sueño",
    currentSleep: "Horas de Sueño",
    hours: "horas",
    addWater: "Beber 250ml",
    resetWater: "Reiniciar Registro",
    logSleep: "Registrar Horas",
    
    // Notifications & Alert
    alerts: "Alertas de Seguridad y Ausencia de Períodos",
    cycleActive: "El ciclo es regular. Su período estimado inicia en 6 días.",
    missedPeriodAlert: "ADVERTENCIA: Su período se encuentra retrasado por 5 días de acuerdo con su promedio histórico. Realice un test.",
    
    // Language and Themes
    language: "Idioma del Sistema",
    theme: "Tema de Interfaz",
    light: "Claro",
    dark: "Oscuro",
    saveProfile: "Guardar Perfil",
    profileTitle: "Métricas del Paciente y Atributos Personales"
  }
};

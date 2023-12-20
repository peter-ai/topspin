
import json
from flask import Flask
from flask_cors import CORS, cross_origin
import joblib
import numpy as np

MODEL_DIMENSION = 18
with open('GBM_classifier.joblib', 'rb') as f:
    clf = joblib.load(f)

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/")
@cross_origin()
def home():
    return "<p>Tennis Match Predictor</p>"

@app.route("/predict/<features>", methods=['GET'])
@cross_origin()
def predict(features):
    try:
        print(features)
        v = np.array([float(feature) if feature != 'None' else np.NaN for feature in features.split(',') ])
    except ValueError as e:
        v = None

    if v is None or len(v) != MODEL_DIMENSION:
        return json.dumps({'prediction': None})
    
    pred = clf.predict(v[None,:])[0]
    
    return json.dumps({'prediction': pred})

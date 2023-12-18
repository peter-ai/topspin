
import json
from flask import Flask
from flask_cors import CORS, cross_origin
import pickle
import numpy as np

MODEL_DIMENSION = 18
with open('model_v1.pkl', 'rb') as f:
    clf = pickle.load(f)

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
        v = np.array([float(x) for x in features.split(',')])
    except ValueError as e:
        v = None

    if v is None or len(v) != MODEL_DIMENSION:
        return json.dumps({'prediction': None})
    
    pred = clf.predict(v[None,:])[0]
    
    return json.dumps({'prediction': pred})

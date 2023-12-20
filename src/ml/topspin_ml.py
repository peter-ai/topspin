# import packages
import json
import joblib
import numpy as np
from flask import Flask
from flask_cors import CORS, cross_origin

# define expected dimension of input
MODEL_DIMENSION = 18 

# load classification model
with open('GBM_classifier.joblib', 'rb') as f:
    clf = joblib.load(f)

# allow CORS and start server
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# define route for predictions
@app.route("/predict/<features>", methods=['GET'])
@cross_origin()
def predict(features):
    try:
        # parse input vector from GET params
        v = np.array([float(feature) if feature != 'None' and feature != 'null' else np.NaN for feature in features.split(',')])
    except ValueError as e:
        v = None

    # check if dimension is as expected
    if v is None or len(v) != MODEL_DIMENSION:
        return json.dumps({'prediction': None})
    
    # predict match outcome
    pred = clf.predict(v[None,:])[0]
    
    # return result
    return json.dumps({'prediction': pred})

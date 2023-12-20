# import packages
import json
import joblib
import numpy as np
from flask import Flask, request
from flask_cors import CORS, cross_origin
import sys


# allow CORS and start server
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# define expected dimension of input
MODEL_DIMENSION = 18 

# load classification model
with open('GBM_classifier.joblib', 'rb') as f:
    clf = joblib.load(f)


# define route for predictions
@app.route("/predict/<features>", methods=['GET'])
@cross_origin()
def predict(features):
    if request.method == 'GET':
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
    

@app.route("/betting/", methods=['POST'])
@cross_origin()
def betting():
    if request.method == 'POST':
        # extract array from POST data
        v = np.array(request.get_json(), dtype=np.float64)

        # run ml pipeline and predict match outcome
        pred = clf.predict(v)

        # generate array of correct predictions
        correct = (pred == 0).astype(np.int64).tolist()

        return json.dumps(correct)

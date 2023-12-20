# import packages
import json
import joblib
import numpy as np
from datetime import datetime
from flask import Flask, request
from flask_cors import CORS, cross_origin

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
        app.logger.info(f'{datetime.utcnow()} [REST API] Simulation Logger: Attempting Simulation')
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

        app.logger.info(f'[{datetime.utcnow()} REST API] Simulation Logger: Simulation Successful')
        
        # return result
        return json.dumps({'prediction': pred})
    else:
        app.logger.info(f'[{datetime.utcnow()} REST API] Simulation Logger: Incorrect Request Type POST')
        return json.dumps({'prediction': 1})
        
    

@app.route("/betting/", methods=['POST'])
@cross_origin()
def betting():
    if request.method == 'POST':
        app.logger.info(f'{datetime.utcnow()} [REST API] Betting Logger: Attempting Betting')

        # extract array from POST data
        v = np.array(request.get_json(), dtype=np.float64)

        # run ml pipeline and predict match outcome
        pred = clf.predict(v)

        # generate array of correct predictions
        correct = (pred == 0).astype(np.int64).tolist()

        app.logger.info(f'[{datetime.utcnow()} REST API] Betting Logger: Betting Successful')
        return json.dumps(correct)
    else:
        app.logger.info(f'[{datetime.utcnow()} REST API] Betting Logger: Incorrect Request Type GET')
        return json.dumps([])

# if __name__ == "__main__":
#     from waitress import serve
#     serve(app, host="0.0.0.0", port=5002)
    
def create_app():
    return app
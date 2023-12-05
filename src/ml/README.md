# TopSpin ML
## Train/Deploy a model to predict the result of tennis matches

## Quickstart

- python3 -m pip install -r ./requirements.txt
- ./run.sh
- go to SERVER:PORT/predict/1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
- If all worked, should get a json back containing a prediction

### run.sh
- sets environment variables then spins up the Flask server

### main.py
- flask server code
- NOTE: this stores the model in memory since its inefficient to keep unpickling the model, the model is 39M on disk
- routes
    - /predict/<features> (N=18 float array delimited by ',')

#!/bin/sh

export FLASK_APP=topspin_ml.py
export FLASK_ENV=development
flask run -h localhost -p 5002

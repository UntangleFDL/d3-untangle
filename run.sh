#!/bin/bash


cd docs
open http://localhost:5350/index.html
python3 -m http.server 5350


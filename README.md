# 550-topspin
### Description
Top Spin is a web application that allows both tennis fanatics and casual fans to gain insight into the most infamous question in any given sport - who is the greatest of all time (GOAT). It aggregates data about athletes, rankings, and matches dating back to 1968, and match odds from 2000 to 2019. The web app will display various dynamic summary views and more in-depth pages about historical tennis players and matches. Aligned with this, it will provide users the functionality to create matches with players from different eras of tennis, and show the user who was more likely to win given the user defined parameters about the match.

### Dependencies
The project is built in full-stack JS with python for machine learning. Below is a high level list of depenencies, a comprehensive list will be included and pointed to elsewhere:
* `React`
* `Node`
* `Express`
* `Python`
* `Pytorch`
* `Numpy`
* `Pandas`
* `MySQL`


### Data
#### Raw Data
The core data used for this project consists of information about tennis tournaments, matches, and players through time dating back to the late 1800s for ATP and early 1900s for WTA. It is available on github in Jeff Sackmann's repos:
* [tennis_wta](https://github.com/JeffSackmann/tennis_wta) 
* [tennis_atp](https://github.com/JeffSackmann/tennis_atp) 

Additionally, we use betting odds for tennis matches after 2000, available on [Kaggle](https://www.kaggle.com/datasets/hakeem/atp-and-wta-tennis-data) and on [github](https://github.com/chief-r0cka/MLT).

#### Preprocessed Data
Due to constraints on file size, cleaned and aggregated data is stored in CSV files in a shared drive (request access [here](https://drive.google.com/drive/folders/14wodIUZZj7R28aX-mTczlzbZ5z_Nh_bw?usp=sharing)).

#### Attribution
Tennis databases, files, and algorithms by [Jeff Sackmann / Tennis Abstract](http://www.tennisabstract.com/) is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).

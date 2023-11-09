-- create project database
CREATE DATABASE topspin;

-- activate db
USE topspin;

-- create Player table
CREATE TABLE player (
    id INT,
	name VARCHAR(65) NOT NULL,
	hand VARCHAR(1) NOT NULL,
	height INT,
	ioc VARCHAR(3),
	dob DATE,
    league VARCHAR(3) NOT NULL,
    PRIMARY KEY ( id )
);

-- create Tournament table
CREATE TABLE tournament (
    id VARCHAR(50),
    name VARCHAR(50) NOT NULL,
	start_date DATE NOT NULL,
	surface VARCHAR(6),
	draw_size VARCHAR(3),
	tourney_level VARCHAR(2) NOT NULL,
    league VARCHAR(3) NOT NULL,
    PRIMARY KEY ( id )
);

-- create Match table
CREATE TABLE game (
    tourney_id VARCHAR(50),
    match_num INT,
    winner_id INT NOT NULL,
    winner_seed VARCHAR(5),
    winner_entry VARCHAR(5),
	winner_age FLOAT,
	loser_id INT NOT NULL,
	loser_seed VARCHAR(5),
	loser_entry VARCHAR(5),
	loser_age FLOAT,
	score VARCHAR (50),
	max_sets INT NOT NULL,
	round VARCHAR(5),
	minutes INT,
	w_ace INT,
	w_df INT,
	w_svpt INT,
	w_1stIn INT,
	w_1stWon INT,
	w_2ndWon INT,
	w_SvGms INT,
	w_bpSaved INT,
	w_bpFaced INT,
	l_ace INT,
	l_df INT,
	l_svpt INT,
	l_1stIn INT,
	l_1stWon INT,
	l_2ndWon INT,
	l_SvGms INT,
	l_bpSaved INT,
	l_bpFaced INT,
	winner_rank INT,
	winner_rank_points INT,
	loser_rank INT,
	loser_rank_points INT,
    PRIMARY KEY ( tourney_id, match_num ),
	FOREIGN KEY ( tourney_id ) REFERENCES tournament( id ),
	FOREIGN KEY ( winner_id ) REFERENCES player( id ),
	FOREIGN KEY ( loser_id ) REFERENCES player( id )
);

-- create odds table
CREATE TABLE odds (
    id INT AUTO_INCREMENT,
    tourney_id VARCHAR(50),
    match_num INT,
    B365W FLOAT,
    B365L FLOAT,
    B_WW FLOAT,
    B_WL FLOAT,
    CBW FLOAT,
    CBL FLOAT,
    EXW FLOAT,
    EXL FLOAT,
    LBW FLOAT,
    LBL FLOAT,
    GBW FLOAT,
    GBL FLOAT,
    IWW FLOAT,
    IWL FLOAT,
    PSW FLOAT,
    PSL FLOAT,
    SBW FLOAT,
    SBL FLOAT,
    SJW FLOAT,
    SJL FLOAT,
    UBW FLOAT,
    UBL FLOAT,
    MaxW FLOAT,
    MaxL FLOAT,
    AvgW FLOAT,
    AvgL FLOAT,
    PRIMARY KEY ( id, tourney_id, match_num ),
	FOREIGN KEY ( tourney_id, match_num ) REFERENCES game( tourney_id, match_num )
);
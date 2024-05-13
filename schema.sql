-- Schema for gameinfo
CREATE TABLE gameinfo (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    playedat TIMESTAMPTZ
);

-- Schema for ratings
CREATE TABLE ratings (
    game_id INTEGER REFERENCES gameinfo(id),
    rating FLOAT
);


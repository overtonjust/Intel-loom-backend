DROP DATABASE IF EXISTS intel_loom;

CREATE DATABASE intel_loom;

\c intel_loom;

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  username VARCHAR(15) NOT NULL UNIQUE,
  birth_date DATE NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(256) NOT NULL,
  security_question VARCHAR(35) NOT NULL,
  security_answer VARCHAR(256) NOT NULL,
  is_instructor BOOLEAN DEFAULT FALSE,
  profile_picture TEXT,
  github VARCHAR(50),
  linkedin VARCHAR(50),
  gitlab VARCHAR(50),
  youtube VARCHAR(50),
  bio TEXT
);

CREATE TABLE instructor_links (
  instructor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  link TEXT NOT NULL
);

CREATE TABLE instructor_reviews (
  instructor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  review TEXT NOT NULL
);

CREATE TABLE classes (
  class_id SERIAL PRIMARY KEY,
  instructor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  highlight_picture TEXT NOT NULL,
  price DECIMAL(5, 2) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity <= 20),
  room_id TEXT NOT NULL
);

CREATE TABLE class_dates (
  class_date_id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
  class_start TIMESTAMP NOT NULL,
  class_end TIMESTAMP NOT NULL
);

CREATE TABLE class_pictures (
  class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
  picture_key TEXT NOT NULL
);

CREATE TABLE booked_classes (
  class_date_id INTEGER REFERENCES class_dates(class_date_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE bookmarked_classes (
  class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE
);

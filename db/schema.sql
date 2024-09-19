DROP DATABASE IF EXISTS intel_loom;

CREATE DATABASE intel_loom;

\c intel_loom;

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  is_instructor BOOLEAN DEFAULT FALSE,
  profile_picture TEXT,
  bio TEXT
);

CREATE TABLE classes (
  class_id SERIAL PRIMARY KEY,
  instructor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  highlight_picture TEXT,
  class_date DATE NOT NULL,
  class_time TIME NOT NULL,
  price DECIMAL(5, 2) NOT NULL,
  capacity INTEGER NOT NULL
);

CREATE TABLE class_pictures (
  class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
  picture_key TEXT NOT NULL
);

CREATE TABLE instructor_media (
  instructor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  media_key TEXT NOT NULL
);

CREATE TABLE class (
  class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE
);

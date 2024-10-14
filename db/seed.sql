\c intel_loom;

INSERT INTO users 
(first_name, middle_name, last_name, email, 
  password, is_instructor, 
  profile_picture, 
  bio, 
  username, birth_date,
  security_question, security_answer)
VALUES
('Erika', null, 'Medina', 'emedina@pursuit.org', 
  '$2b$10$QSXrgPt9JFYGzll2fOBfN.6szviDAY9FuTmKJ/CoRZ5dYivqAH0QS', false,
  'erika.png',
  'Erika Medina is a full-stack software engineer with over eight years of experience building scalable web applications. She specializes in JavaScript, React, Node.js, and cloud infrastructure, with a passion for developing user-centered solutions. Erika has led development teams at multiple startups, taking products from concept to launch and handling complex technical challenges. When not coding, she’s an advocate for women in tech, regularly mentoring new developers.', 'emedina', '1990-05-15', 'What is your favorite color?', '$2b$10$EJapETL5vuTtoSJSxI.h1ehwz6ngVAHb9b2xpDnoFXrfKzpkaAlQa'),
('Chris', null, 'Sanchez', 'csanchez@pursuit.org', 
  '$2b$10$QSXrgPt9JFYGzll2fOBfN.6szviDAY9FuTmKJ/CoRZ5dYivqAH0QS', true, 
  'chris.jpg',
  'Chris is a senior software developer with a decade of experience in backend systems, particularly in Python, Django, and RESTful APIs. He has worked extensively with large-scale enterprise systems, focusing on improving data management and automation. Outside of work, he enjoys teaching coding workshops and contributing to open-source projects.', 'csanchez', '1985-08-20', 'What is your favorite color?', '$2b$10$EJapETL5vuTtoSJSxI.h1ehwz6ngVAHb9b2xpDnoFXrfKzpkaAlQa'),
('Justin', null, 'Overton', 'joverton@pursuit.org', 
  '$2b$10$QSXrgPt9JFYGzll2fOBfN.6szviDAY9FuTmKJ/CoRZ5dYivqAH0QS', true, 
  'justin.png',
  'Justin Overton is a UX/UI designer with a keen eye for detail and a passion for creating seamless digital experiences. With over seven years in the field, he has worked with startups and established brands alike to enhance user satisfaction through intuitive design. In his free time, he leads design thinking workshops and enjoys photography.', 'joverton', '1988-02-10', 'What is your favorite color?', '$2b$10$EJapETL5vuTtoSJSxI.h1ehwz6ngVAHb9b2xpDnoFXrfKzpkaAlQa'),
('Nicole', null, 'Marin', 'nmarin@pursuit.org', 
  '$2b$10$QSXrgPt9JFYGzll2fOBfN.6szviDAY9FuTmKJ/CoRZ5dYivqAH0QS', true, 
  'nicole.png',
  'Nicole Marin is a data scientist with a focus on machine learning and artificial intelligence. She has experience building predictive models and working with big data, helping companies optimize operations and make data-driven decisions. She is passionate about AI ethics and spends her weekends writing on the subject and speaking at conferences.', 'nmarin', '1987-11-30', 'What is your favorite color?', '$2b$10$EJapETL5vuTtoSJSxI.h1ehwz6ngVAHb9b2xpDnoFXrfKzpkaAlQa'),
('Marco', 'Roberto', 'Quispe', 'mquispe@pursuit.org', 
  '$2b$10$QSXrgPt9JFYGzll2fOBfN.6szviDAY9FuTmKJ/CoRZ5dYivqAH0QS', false, 
  'marco.png',
  'Marco Quispe is a front-end developer with five years of experience in HTML, CSS, and JavaScript frameworks like React and Angular. He has a knack for creating visually appealing and responsive websites. Marco is also an advocate for web accessibility, ensuring his designs are inclusive for all users. He enjoys teaching coding to underrepresented groups in tech.', 'mquispe', '1993-03-25', 'What is your favorite color?', '$2b$10$EJapETL5vuTtoSJSxI.h1ehwz6ngVAHb9b2xpDnoFXrfKzpkaAlQa');

INSERT INTO classes 
(instructor_id, title, 
  description, 
  price, capacity, room_id) 
VALUES 
(2, 'Introduction to Web Development 1', 
  'A beginner-friendly course covering HTML, CSS, and JavaScript basics. Perfect for those starting their journey in web development.', 
  150.00, 15, 'test'),
(2, 'Introduction to Web Development 2', 
  'A beginner-friendly course covering HTML, CSS, and JavaScript basics. Perfect for those starting their journey in web development.', 
  150.00, 15, 'test'),
(2, 'Introduction to Web Development 3', 
  'A beginner-friendly course covering HTML, CSS, and JavaScript basics. Perfect for those starting their journey in web development.', 
  150.00, 15, 'test'),
(3, 'Introduction to Web Development 4', 
  'A beginner-friendly course covering HTML, CSS, and JavaScript basics. Perfect for those starting their journey in web development.', 
  150.00, 15, 'test'),
(3, 'Introduction to Web Development 5', 
  'A beginner-friendly course covering HTML, CSS, and JavaScript basics. Perfect for those starting their journey in web development.', 
  150.00, 15, 'test'),
(3, 'Introduction to Web Development 6', 
  'A beginner-friendly course covering HTML, CSS, and JavaScript basics. Perfect for those starting their journey in web development.', 
  150.00, 15, 'test'),
(4, 'Introduction to Web Development 7', 
  'A beginner-friendly course covering HTML, CSS, and JavaScript basics. Perfect for those starting their journey in web development.', 
  150.00, 15, 'test'),
(4, 'Introduction to Web Development 8', 
  'A beginner-friendly course covering HTML, CSS, and JavaScript basics. Perfect for those starting their journey in web development.', 
  150.00, 15, 'test'),
(4, 'Introduction to Web Development 9', 
  'A beginner-friendly course covering HTML, CSS, and JavaScript basics. Perfect for those starting their journey in web development.', 
  150.00, 15, 'test');

INSERT INTO class_dates (class_id, class_start, class_end)
VALUES
(1, '2024-10-15 08:00:00', '2024-10-15 10:00:00'),
(1, '2024-10-15 11:00:00', '2024-10-15 13:00:00'),
(1, '2024-10-15 14:00:00', '2024-10-15 16:00:00'),
(2, '2024-10-15 09:00:00', '2024-10-15 11:00:00'),
(2, '2024-10-15 12:00:00', '2024-10-15 14:00:00'),
(2, '2024-10-15 15:00:00', '2024-10-15 17:00:00'),
(3, '2024-10-15 10:00:00', '2024-10-15 12:00:00'),
(3, '2024-10-15 13:00:00', '2024-10-15 15:00:00'),
(3, '2024-10-15 16:00:00', '2024-10-15 18:00:00'),
(4, '2024-10-15 11:00:00', '2024-10-15 13:00:00'),
(4, '2024-10-15 14:00:00', '2024-10-15 16:00:00'),
(4, '2024-10-15 17:00:00', '2024-10-15 19:00:00'),
(5, '2024-10-15 09:30:00', '2024-10-15 11:30:00'),
(5, '2024-10-15 12:30:00', '2024-10-15 14:30:00'),
(5, '2024-10-15 22:30:00', '2024-10-16 00:30:00'),
(6, '2024-10-16 08:00:00', '2024-10-16 10:00:00'),
(6, '2024-10-16 11:00:00', '2024-10-16 13:00:00'),
(6, '2024-10-16 14:00:00', '2024-10-16 16:00:00'),
(7, '2024-10-16 09:00:00', '2024-10-16 11:00:00'),
(7, '2024-10-16 12:00:00', '2024-10-16 14:00:00'),
(7, '2024-10-16 15:00:00', '2024-10-16 17:00:00'),
(8, '2024-10-16 10:00:00', '2024-10-16 12:00:00'),
(8, '2024-10-16 13:00:00', '2024-10-16 15:00:00'),
(8, '2024-10-16 16:00:00', '2024-10-16 18:00:00'),
(9, '2024-10-16 08:30:00', '2024-10-16 10:30:00'),
(9, '2024-10-16 11:30:00', '2024-10-16 13:30:00'),
(9, '2024-10-16 14:30:00', '2024-10-16 16:30:00');

INSERT INTO booked_classes (user_id, class_date_id) 
VALUES 
(1, 1), (1, 10), (1, 19),
(1, 2), (1, 11), (1, 20),
(1, 3), (1, 12), (1, 21),
(1, 4), (1, 13), (1, 22),
(1, 5), (1, 14), (1, 23),
(1, 6), (1, 15), (1, 24),
(1, 7), (1, 16), (1, 25),
(1, 8), (1, 17), (1, 26),
(1, 9), (1, 18), (1, 27),
(2, 10), (2, 11), (2, 12),
(2, 13), (2, 14), (2, 15),
(2, 16), (2, 17), (2, 18),
(2, 19), (2, 20), (2, 21),
(2, 22), (2, 23), (2, 24),
(2, 25), (2, 26), (2, 27),
(3, 1), (3, 2), (3, 3),
(3, 4), (3, 5), (3, 6),
(3, 7), (3, 8), (3, 9),
(3, 19), (3, 20), (3, 21),
(3, 22), (3, 23), (3, 24),
(3, 25), (3, 26), (3, 27),
(4, 1), (4, 2), (4, 3),
(4, 4), (4, 5), (4, 6),
(4, 7), (4, 8), (4, 9),
(4, 10), (4, 11), (4, 12),
(4, 13), (4, 14), (4, 15),
(4, 16), (4, 17), (4, 18),
(5, 1), (5, 2), (5, 3),
(5, 4), (5, 5), (5, 6),
(5, 7), (5, 8), (5, 9),
(5, 10), (5, 11), (5, 12),
(5, 13), (5, 14), (5, 15),
(5, 16), (5, 17), (5, 18),
(5, 19), (5, 20), (5, 21),
(5, 22), (5, 23), (5, 24),
(5, 25), (5, 26), (5, 27);

INSERT INTO bookmarked_classes (user_id, class_id) 
VALUES 
(1, 1),
(1, 2),
(1, 3),
(2, 4),
(2, 5),
(2, 6),
(3, 7),
(3, 8),
(3, 9),
(4, 1),
(4, 2),
(4, 3),
(5, 4),
(5, 5),
(5, 6),
(5, 7),
(5, 8),
(5, 9);

INSERT INTO class_pictures (class_id, picture_key, is_highlight) 
VALUES 
(1, 'class1.jpg', TRUE),
(1, 'class2.jpg', FALSE),
(1, 'class3.jpg', FALSE),
(2, 'class1.jpg', TRUE),
(2, 'class2.jpg', FALSE),
(2, 'class3.jpg', FALSE),
(3, 'class1.jpg', TRUE),
(3, 'class2.jpg', FALSE),
(3, 'class3.jpg', FALSE),
(4, 'class1.jpg', TRUE),
(4, 'class2.jpg', FALSE),
(4, 'class3.jpg', FALSE),
(5, 'class1.jpg', TRUE),
(5, 'class2.jpg', FALSE),
(5, 'class3.jpg', FALSE),
(6, 'class1.jpg', TRUE),
(6, 'class2.jpg', FALSE),
(6, 'class3.jpg', FALSE),
(7, 'class1.jpg', TRUE),
(7, 'class2.jpg', FALSE),
(7, 'class3.jpg', FALSE),
(8, 'class1.jpg', TRUE),
(8, 'class2.jpg', FALSE),
(8, 'class3.jpg', FALSE),
(9, 'class1.jpg', TRUE),
(9, 'class2.jpg', FALSE),
(9, 'class3.jpg', FALSE);

INSERT INTO instructor_links (instructor_id, link)
VALUES 
(2, 'https://youtube.com/embed/bJzb-RuUcMU'), 
(2, 'https://youtube.com/embed/I-k-iTUMQAY'),
(2, 'https://youtube.com/embed/zOjov-2OZ0E'),
(3, 'https://youtube.com/embed/bJzb-RuUcMU'),
(3, 'https://youtube.com/embed/I-k-iTUMQAY'),
(3, 'https://youtube.com/embed/zOjov-2OZ0E'),
(4, 'https://youtube.com/embed/bJzb-RuUcMU'),
(4, 'https://youtube.com/embed//I-k-iTUMQAY'),
(4, 'https://youtube.com/embed/zOjov-2OZ0E');

INSERT INTO instructor_reviews (instructor_id, user_id, review)
VALUES
(2, 1, 'Great instructor! Very knowledgeable and helpful.'),
(2, 3, 'I enjoyed the class, learned a lot!'),
(2, 4, 'Very interactive and engaging lessons.'),
(2, 5, 'Clear explanations and supportive during the class.'),
(3, 1, 'The instructor was fantastic, I highly recommend!'),
(3, 2, 'The course material was excellent and well-organized.'),
(3, 4, 'Great teacher, learned a lot from the class!'),
(3, 5, 'Superb class, the instructor is very helpful!'),
(4, 1, 'Very professional and approachable.'),
(4, 2, 'The class was structured well and easy to follow.'),
(4, 3, 'Amazing teaching style, would take another class with them.'),
(4, 5, 'Incredible class, very informative and interactive.');

INSERT INTO instructor_ratings (instructor_id, rating)
VALUES
(2, 5),
(2, 4),
(2, 5),
(2, 4),
(3, 5),
(3, 4),
(3, 5),
(3, 4),
(4, 5),
(4, 4),
(4, 5),
(4, 4);

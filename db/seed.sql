INSERT INTO users ( first_name, last_name, email, password, is_instructor, profile_picture, bio  ) VALUES
('Erika', 'Medina', 'emedina@pursuit.org', '$2b$10$QSXrgPt9JFYGzll2fOBfN.6szviDAY9FuTmKJ/CoRZ5dYivqAH0QS', false, 'https://xsgames.co/randomusers/avatar.php?g=female&minimum_age=18&maximum_age=100', 'Erika Medina is a full-stack software engineer with over eight years of experience building scalable web applications. She specializes in JavaScript, React, Node.js, and cloud infrastructure, with a passion for developing user-centered solutions. Erika has led development teams at multiple startups, taking products from concept to launch and handling complex technical challenges. When not coding, she’s an advocate for women in tech, regularly mentoring new developers.'),

('Chris', 'Sanchez', 'csanchez@pursuit.org', '$2b$10$QSXrgPt9JFYGzll2fOBfN.6szviDAY9FuTmKJ/CoRZ5dYivqAH0QS', true, 'https://xsgames.co/randomusers/avatar.php?g=male&minimum_age=18&maximum_age=100', 'Chris is a senior software developer with a decade of experience in backend systems, particularly in Python, Django, and RESTful APIs. He has worked extensively with large-scale enterprise systems, focusing on improving data management and automation. Outside of work, he enjoys teaching coding workshops and contributing to open-source projects.'),

('Justin', 'Overton', 'joverton@pursuit.org', '$2b$10$QSXrgPt9JFYGzll2fOBfN.6szviDAY9FuTmKJ/CoRZ5dYivqAH0QS', true, 'https://xsgames.co/randomusers/avatar.php?g=male&minimum_age=18&maximum_age=100', 'Justin Overton is a UX/UI designer with a keen eye for detail and a passion for creating seamless digital experiences. With over seven years in the field, he has worked with startups and established brands alike to enhance user satisfaction through intuitive design. In his free time, he leads design thinking workshops and enjoys photography.'),

('Nicole', 'Marin', 'nmarin@pursuit.org', '$2b$10$QSXrgPt9JFYGzll2fOBfN.6szviDAY9FuTmKJ/CoRZ5dYivqAH0QS', true, 'https://xsgames.co/randomusers/avatar.php?g=female&minimum_age=18&maximum_age=100', 'Nicole Marin is a data scientist with a focus on machine learning and artificial intelligence. She has experience building predictive models and working with big data, helping companies optimize operations and make data-driven decisions. She is passionate about AI ethics and spends her weekends writing on the subject and speaking at conferences.'),

('Marco', 'Quispe', 'mquispe@pursuit.org', '$2b$10$QSXrgPt9JFYGzll2fOBfN.6szviDAY9FuTmKJ/CoRZ5dYivqAH0QS', false, 'https://xsgames.co/randomusers/avatar.php?g=male&minimum_age=18&maximum_age=100', 'Marco Quispe is a front-end developer with five years of experience in HTML, CSS, and JavaScript frameworks like React and Angular. He has a knack for creating visually appealing and responsive websites. Marco is also an advocate for web accessibility, ensuring his designs are inclusive for all users. He enjoys teaching coding to underrepresented groups in tech.');






INSERT INTO classes (instructor_id, title, highlight_picture, description, class_date, class_time, price, capacity) 
VALUES 
(1, 'Introduction to Web Development', 'https://media.istockphoto.com/id/1356364268/photo/close-up-focus-on-persons-hands-typing-on-the-desktop-computer-keyboard-screens-show-coding.jpg?s=2048x2048&w=is&k=20&c=RKQ2PtlwnwfgZRRiEJUIszBxVjAyCFLxteBxbR6Cli0=', 'A beginner-friendly course covering HTML, CSS, and JavaScript basics. Perfect for those starting their journey in web development.', '2024-09-25', '10:00:00', 150.00, 15),

(2, 'Baking the Perfect Cake', 'https://media.istockphoto.com/id/1483936952/photo/cheesecake.jpg?s=2048x2048&w=is&k=20&c=hUn3itN4Ac52VMTStHZ6u8F8vATSqNxmpr-t1BLBvVQ=', 'Learn how to bake delicious cakes from scratch. This hands-on class will cover cake-making techniques, including frosting and decorating.', '2024-09-28', '14:00:00', 75.00, 12),

(3, 'History of the Renaissance', 'https://media.istockphoto.com/id/487145924/photo/dictionary-series-history.jpg?s=2048x2048&w=is&k=20&c=xuyrH515RbSYMHABBt-PlO0aQkIio3HCFz5lIY_eBKU=', 'Dive into the rich history of the Renaissance period, exploring art, culture, and scientific advancements that shaped the modern world.', '2024-10-01', '11:00:00', 50.00, 15),

(4, 'Beginner Yoga', 'https://media.istockphoto.com/id/1483989758/photo/diverse-yoga-class-participants-doing-a-side-plank-on-their-yoga-mats-in-a-beautiful-yoga.jpg?s=2048x2048&w=is&k=20&c=Mz6-kl6eHcbtigh3-YSdOWjynMBaDXejbfvKUkt8KzM=', 'A relaxing yoga class designed for beginners to help improve flexibility and reduce stress. No prior experience required.', '2024-09-29', '09:00:00', 20.00, 7),

(5, 'Photography 101: Capturing the Moment', 'https://media.istockphoto.com/id/639695818/photo/photographer-workplace.jpg?s=2048x2048&w=is&k=20&c=nsNh31L6-lF5_gOwn1ZaFchibief5YCd5LhZbNJo4l8=', 'This course covers the basics of photography, including lighting, composition, and camera settings to help you capture beautiful photos.', '2024-10-05', '16:00:00', 120.00, 10);



INSERT INTO class (user_id, class_id) values 
INSERT INTO class (user_id, class_id) 
VALUES 
(1, 1), -- User 1 enrolled in Web Development
(2, 2), -- User 2 enrolled in Baking
(3, 3), -- User 3 enrolled in Renaissance History
(4, 4), -- User 4 enrolled in Yoga
(5, 5); -- User 5 enrolled in Photography



INSERT INTO class_pictures (class_id, picture_key) 
VALUES 
(1, 'https://media.istockphoto.com/id/1356364268/photo/close-up-focus-on-persons-hands-typing-on-the-desktop-computer-keyboard-screens-show-coding.jpg?s=2048x2048&w=is&k=20&c=RKQ2PtlwnwfgZRRiEJUIszBxVjAyCFLxteBxbR6Cli0='), 
(2, 'https://media.istockphoto.com/id/1483936952/photo/cheesecake.jpg?s=2048x2048&w=is&k=20&c=hUn3itN4Ac52VMTStHZ6u8F8vATSqNxmpr-t1BLBvVQ='), 
(3, 'https://media.istockphoto.com/id/487145924/photo/dictionary-series-history.jpg?s=2048x2048&w=is&k=20&c=xuyrH515RbSYMHABBt-PlO0aQkIio3HCFz5lIY_eBKU='), 
(4, 'https://media.istockphoto.com/id/1483989758/photo/diverse-yoga-class-participants-doing-a-side-plank-on-their-yoga-mats-in-a-beautiful-yoga.jpg?s=2048x2048&w=is&k=20&c=Mz6-kl6eHcbtigh3-YSdOWjynMBaDXejbfvKUkt8KzM='), 
(5, 'https://media.istockphoto.com/id/639695818/photo/photographer-workplace.jpg?s=2048x2048&w=is&k=20&c=nsNh31L6-lF5_gOwn1ZaFchibief5YCd5LhZbNJo4l8=');





-- https://xsgames.co/randomusers/avatar.php?g=female&minimum_age=18&maximum_age=100
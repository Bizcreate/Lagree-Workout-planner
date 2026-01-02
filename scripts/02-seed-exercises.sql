-- Seed all Lagree exercises
INSERT INTO exercises (name, description, muscle_groups, series, unilateral, default_time_sec, equipment, level) VALUES

-- Core Series
('Plank Hold', 'Hold a strong plank position on the carriage with hands on front platform', ARRAY['core'], 'Core Foundation', false, 45, ARRAY['Megaformer'], 'beginner'),
('Bear', 'Tabletop position with knees hovering, engage core deeply', ARRAY['core'], 'Core Foundation', false, 60, ARRAY['Megaformer'], 'beginner'),
('Catfish', 'Supine position with legs extended, lower and lift legs slowly', ARRAY['core'], 'Core Foundation', false, 45, ARRAY['Megaformer'], 'intermediate'),
('Wheelbarrow', 'Plank with feet on carriage, hands on front platform, move carriage in and out', ARRAY['core', 'arms'], 'Core Foundation', false, 60, ARRAY['Megaformer'], 'advanced'),
('Scrambled Eggs', 'Supine with legs in straps, small scissor movements', ARRAY['core', 'legs'], 'Core Foundation', false, 45, ARRAY['Megaformer'], 'intermediate'),

-- Lower Body Series
('Lunge', 'Standing lunge with back foot on carriage', ARRAY['legs', 'glutes'], 'Lower Body', true, 60, ARRAY['Megaformer'], 'beginner'),
('Standing Lunge', 'Front foot on platform, back foot on moving carriage', ARRAY['legs', 'glutes'], 'Lower Body', true, 60, ARRAY['Megaformer'], 'beginner'),
('Reverse Lunge', 'Front foot stable, back foot on carriage moving backward', ARRAY['legs', 'glutes'], 'Lower Body', true, 60, ARRAY['Megaformer'], 'beginner'),
('Split Lunge', 'Both feet elevated, carriage moves', ARRAY['legs', 'glutes'], 'Lower Body', true, 60, ARRAY['Megaformer'], 'intermediate'),
('Wheelbarrow Lunge', 'Hands on platform, one foot on carriage', ARRAY['legs', 'glutes', 'core'], 'Lower Body', true, 60, ARRAY['Megaformer'], 'advanced'),

('Squat', 'Both feet on carriage, squat movement', ARRAY['legs', 'glutes'], 'Lower Body', false, 60, ARRAY['Megaformer'], 'beginner'),
('Narrow Squat', 'Feet together on carriage', ARRAY['legs', 'glutes'], 'Lower Body', false, 60, ARRAY['Megaformer'], 'beginner'),
('Wide Squat', 'Feet wide apart on carriage', ARRAY['legs', 'glutes'], 'Lower Body', false, 60, ARRAY['Megaformer'], 'beginner'),
('Sumo Squat', 'Wide stance with toes pointed out', ARRAY['legs', 'glutes'], 'Lower Body', false, 60, ARRAY['Megaformer'], 'intermediate'),

('Donkey Kick', 'On hands and knees, leg extends back', ARRAY['glutes', 'legs'], 'Glutes', true, 60, ARRAY['Megaformer'], 'beginner'),
('Fire Hydrant', 'On hands and knees, leg lifts to side', ARRAY['glutes', 'obliques'], 'Glutes', true, 60, ARRAY['Megaformer'], 'beginner'),
('Kneeling Glute Press', 'Kneeling with one foot pressing carriage back', ARRAY['glutes'], 'Glutes', true, 60, ARRAY['Megaformer'], 'intermediate'),
('Bridge', 'Supine with feet on carriage, hips lift and lower', ARRAY['glutes', 'legs'], 'Glutes', false, 60, ARRAY['Megaformer'], 'beginner'),
('Single Leg Bridge', 'Bridge with one leg extended', ARRAY['glutes', 'legs'], 'Glutes', true, 60, ARRAY['Megaformer'], 'intermediate'),

-- Upper Body Series
('Push Up', 'Hands on front platform, feet on carriage', ARRAY['arms', 'core'], 'Upper Body', false, 45, ARRAY['Megaformer'], 'beginner'),
('Wide Push Up', 'Wider hand position for chest focus', ARRAY['arms', 'core'], 'Upper Body', false, 45, ARRAY['Megaformer'], 'intermediate'),
('Diamond Push Up', 'Hands close together under chest', ARRAY['arms', 'core'], 'Upper Body', false, 45, ARRAY['Megaformer'], 'advanced'),
('Pike', 'Inverted V position with hips high', ARRAY['arms', 'core'], 'Upper Body', false, 60, ARRAY['Megaformer'], 'advanced'),

('Tricep Press', 'Facing away, hands on platform, elbows bend', ARRAY['arms'], 'Upper Body', false, 45, ARRAY['Megaformer'], 'beginner'),
('Bicep Curl', 'Standing with handles, curl movement', ARRAY['arms'], 'Upper Body', false, 45, ARRAY['Megaformer'], 'beginner'),
('Shoulder Press', 'Standing with handles pressed overhead', ARRAY['arms'], 'Upper Body', false, 45, ARRAY['Megaformer'], 'beginner'),
('Lateral Raise', 'Arms lift to sides with handles', ARRAY['arms'], 'Upper Body', false, 45, ARRAY['Megaformer'], 'intermediate'),
('Front Raise', 'Arms lift forward with handles', ARRAY['arms'], 'Upper Body', false, 45, ARRAY['Megaformer'], 'intermediate'),

-- Back Series
('Pulling Straps', 'Prone on carriage, pulling handles back', ARRAY['back', 'arms'], 'Back', false, 60, ARRAY['Megaformer'], 'beginner'),
('Arm Circles', 'Prone position with small circular arm movements', ARRAY['back', 'arms'], 'Back', false, 45, ARRAY['Megaformer'], 'beginner'),
('Cobra', 'Prone with chest lift, engaging back muscles', ARRAY['back'], 'Back', false, 45, ARRAY['Megaformer'], 'beginner'),
('Superman', 'Prone with arms and legs extended', ARRAY['back', 'glutes'], 'Back', false, 60, ARRAY['Megaformer'], 'intermediate'),
('Row', 'Seated or kneeling row movement', ARRAY['back', 'arms'], 'Back', false, 60, ARRAY['Megaformer'], 'intermediate'),

-- Obliques Series
('Side Plank', 'Side plank on carriage', ARRAY['obliques', 'core'], 'Obliques', true, 45, ARRAY['Megaformer'], 'intermediate'),
('Side Crunch', 'Side-lying crunch movement', ARRAY['obliques'], 'Obliques', true, 45, ARRAY['Megaformer'], 'beginner'),
('Russian Twist', 'Seated with rotation', ARRAY['obliques', 'core'], 'Obliques', false, 45, ARRAY['Megaformer'], 'intermediate'),
('Oblique Pike', 'Pike with rotation', ARRAY['obliques', 'core'], 'Obliques', false, 60, ARRAY['Megaformer'], 'advanced'),
('Side Leg Lift', 'Standing with leg lifting to side', ARRAY['obliques', 'glutes'], 'Obliques', true, 45, ARRAY['Megaformer'], 'beginner'),

-- Full Body
('Burpee', 'Jump to plank, return to standing', ARRAY['full'], 'Full Body', false, 60, ARRAY['Megaformer'], 'advanced'),
('Mountain Climber', 'Plank with alternating knee drives', ARRAY['full'], 'Full Body', false, 60, ARRAY['Megaformer'], 'intermediate'),
('Plank Jacks', 'Plank with legs jumping in and out', ARRAY['full'], 'Full Body', false, 45, ARRAY['Megaformer'], 'intermediate'),
('Spider Lunge', 'Lunge with rotation and reach', ARRAY['full'], 'Full Body', true, 60, ARRAY['Megaformer'], 'advanced'),
('Teaser', 'V-sit position engaging core and legs', ARRAY['core', 'legs'], 'Full Body', false, 60, ARRAY['Megaformer'], 'advanced');

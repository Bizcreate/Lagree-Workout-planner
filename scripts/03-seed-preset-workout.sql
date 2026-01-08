-- Create the Full Body Lagree Burn workout
DO $$
DECLARE
  workout_id UUID;
  ex_lunge UUID;
  ex_plank UUID;
  ex_catfish UUID;
  ex_standing_lunge UUID;
  ex_wheelbarrow UUID;
  ex_bear UUID;
  ex_donkey_kick UUID;
  ex_tricep UUID;
  ex_bridge UUID;
  ex_wide_pushup UUID;
  ex_scrambled UUID;
  ex_side_plank UUID;
  ex_pulling UUID;
BEGIN
  -- Create the workout
  INSERT INTO workouts (name, description, is_preset)
  VALUES (
    'Full Body Lagree Burn',
    'Complete 50-minute Lagree workout targeting all major muscle groups with proper warm-up and cool-down',
    true
  )
  RETURNING id INTO workout_id;

  -- Get exercise IDs
  SELECT id INTO ex_lunge FROM exercises WHERE name = 'Lunge' LIMIT 1;
  SELECT id INTO ex_plank FROM exercises WHERE name = 'Plank Hold' LIMIT 1;
  SELECT id INTO ex_catfish FROM exercises WHERE name = 'Catfish' LIMIT 1;
  SELECT id INTO ex_standing_lunge FROM exercises WHERE name = 'Standing Lunge' LIMIT 1;
  SELECT id INTO ex_wheelbarrow FROM exercises WHERE name = 'Wheelbarrow' LIMIT 1;
  SELECT id INTO ex_bear FROM exercises WHERE name = 'Bear' LIMIT 1;
  SELECT id INTO ex_donkey_kick FROM exercises WHERE name = 'Donkey Kick' LIMIT 1;
  SELECT id INTO ex_tricep FROM exercises WHERE name = 'Tricep Press' LIMIT 1;
  SELECT id INTO ex_bridge FROM exercises WHERE name = 'Bridge' LIMIT 1;
  SELECT id INTO ex_wide_pushup FROM exercises WHERE name = 'Wide Push Up' LIMIT 1;
  SELECT id INTO ex_scrambled FROM exercises WHERE name = 'Scrambled Eggs' LIMIT 1;
  SELECT id INTO ex_side_plank FROM exercises WHERE name = 'Side Plank' LIMIT 1;
  SELECT id INTO ex_pulling FROM exercises WHERE name = 'Pulling Straps' LIMIT 1;

  -- Add exercises to workout with timing
  -- Fixed column names to match schema: position -> sequence_order, hold_sec -> holds, removed pulses column
  
  -- Warm-up: Lunge (Right)
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, side)
  VALUES (workout_id, ex_lunge, 'Lunge', 'Standing lunge with back foot on carriage', ARRAY['legs', 'glutes'], 1, 60, 'right');

  -- Lunge (Left)
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, side)
  VALUES (workout_id, ex_lunge, 'Lunge', 'Standing lunge with back foot on carriage', ARRAY['legs', 'glutes'], 2, 60, 'left');

  -- Core: Plank Hold
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, holds, notes)
  VALUES (workout_id, ex_plank, 'Plank Hold', 'Hold a strong plank position', ARRAY['core'], 3, 45, 15, '10 pulses at end');

  -- Catfish
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, holds)
  VALUES (workout_id, ex_catfish, 'Catfish', 'Supine with legs extended, lower and lift legs slowly', ARRAY['core', 'legs'], 4, 60, 10);

  -- Lower Body: Standing Lunge (Right)
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, holds, side, notes)
  VALUES (workout_id, ex_standing_lunge, 'Standing Lunge', 'Standing lunge variation', ARRAY['legs', 'glutes'], 5, 60, 10, 'right', '20 pulses');

  -- Standing Lunge (Left)
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, holds, side, notes)
  VALUES (workout_id, ex_standing_lunge, 'Standing Lunge', 'Standing lunge variation', ARRAY['legs', 'glutes'], 6, 60, 10, 'left', '20 pulses');

  -- Core: Wheelbarrow
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds)
  VALUES (workout_id, ex_wheelbarrow, 'Wheelbarrow', 'Plank with feet on carriage, move in and out', ARRAY['core', 'arms'], 7, 60);

  -- Bear
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, holds)
  VALUES (workout_id, ex_bear, 'Bear', 'Tabletop position with knees hovering, engage core deeply', ARRAY['core'], 8, 60, 15);

  -- Glutes: Donkey Kick (Right)
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, side, notes)
  VALUES (workout_id, ex_donkey_kick, 'Donkey Kick', 'On all fours, kick leg back and up', ARRAY['glutes', 'legs'], 9, 60, 'right', '30 pulses');

  -- Donkey Kick (Left)
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, side, notes)
  VALUES (workout_id, ex_donkey_kick, 'Donkey Kick', 'On all fours, kick leg back and up', ARRAY['glutes', 'legs'], 10, 60, 'left', '30 pulses');

  -- Upper Body: Tricep Press
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, holds, notes)
  VALUES (workout_id, ex_tricep, 'Tricep Press', 'Isolated tricep work', ARRAY['arms'], 11, 45, 10, '15 pulses');

  -- Bridge
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, holds)
  VALUES (workout_id, ex_bridge, 'Bridge', 'Hip bridges for glutes', ARRAY['glutes', 'core'], 12, 60, 15);

  -- Wide Push Up
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, notes)
  VALUES (workout_id, ex_wide_pushup, 'Wide Push Up', 'Wide grip push-up variation', ARRAY['chest', 'arms'], 13, 45, '20 pulses');

  -- Core Finish: Scrambled Eggs
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds)
  VALUES (workout_id, ex_scrambled, 'Scrambled Eggs', 'Supine with legs in straps, small scissor movements', ARRAY['core', 'legs'], 14, 60);

  -- Obliques: Side Plank (Right)
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, holds, side)
  VALUES (workout_id, ex_side_plank, 'Side Plank', 'Side plank for obliques', ARRAY['core', 'obliques'], 15, 45, 10, 'right');

  -- Side Plank (Left)
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds, holds, side)
  VALUES (workout_id, ex_side_plank, 'Side Plank', 'Side plank for obliques', ARRAY['core', 'obliques'], 16, 45, 10, 'left');

  -- Cool Down: Pulling Straps
  INSERT INTO workout_exercises (workout_id, exercise_id, exercise_name, description, muscle_groups, sequence_order, time_seconds)
  VALUES (workout_id, ex_pulling, 'Pulling Straps', 'Stretch and cool down', ARRAY['back', 'arms'], 17, 60);

END $$;

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
  -- Warm-up: Lunge (Right)
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, side)
  VALUES (workout_id, ex_lunge, 1, 60, 'right');

  -- Lunge (Left)
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, side)
  VALUES (workout_id, ex_lunge, 2, 60, 'left');

  -- Core: Plank Hold
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, hold_sec, pulses)
  VALUES (workout_id, ex_plank, 3, 45, 15, 10);

  -- Catfish
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, hold_sec)
  VALUES (workout_id, ex_catfish, 4, 60, 10);

  -- Lower Body: Standing Lunge (Right)
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, hold_sec, pulses, side)
  VALUES (workout_id, ex_standing_lunge, 5, 60, 10, 20, 'right');

  -- Standing Lunge (Left)
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, hold_sec, pulses, side)
  VALUES (workout_id, ex_standing_lunge, 6, 60, 10, 20, 'left');

  -- Core: Wheelbarrow
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec)
  VALUES (workout_id, ex_wheelbarrow, 7, 60);

  -- Bear
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, hold_sec)
  VALUES (workout_id, ex_bear, 8, 60, 15);

  -- Glutes: Donkey Kick (Right)
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, pulses, side)
  VALUES (workout_id, ex_donkey_kick, 9, 60, 30, 'right');

  -- Donkey Kick (Left)
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, pulses, side)
  VALUES (workout_id, ex_donkey_kick, 10, 60, 30, 'left');

  -- Upper Body: Tricep Press
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, hold_sec, pulses)
  VALUES (workout_id, ex_tricep, 11, 45, 10, 15);

  -- Bridge
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, hold_sec)
  VALUES (workout_id, ex_bridge, 12, 60, 15);

  -- Wide Push Up
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, pulses)
  VALUES (workout_id, ex_wide_pushup, 13, 45, 20);

  -- Core Finish: Scrambled Eggs
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec)
  VALUES (workout_id, ex_scrambled, 14, 60);

  -- Obliques: Side Plank (Right)
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, hold_sec, side)
  VALUES (workout_id, ex_side_plank, 15, 45, 10, 'right');

  -- Side Plank (Left)
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec, hold_sec, side)
  VALUES (workout_id, ex_side_plank, 16, 45, 10, 'left');

  -- Cool Down: Pulling Straps
  INSERT INTO workout_exercises (workout_id, exercise_id, position, time_sec)
  VALUES (workout_id, ex_pulling, 17, 60);

END $$;

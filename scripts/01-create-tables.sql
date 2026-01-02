-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_groups TEXT[] NOT NULL DEFAULT '{}',
  series TEXT,
  unilateral BOOLEAN DEFAULT false,
  default_metric TEXT DEFAULT 'time',
  default_time_sec INTEGER DEFAULT 45,
  default_reps INTEGER,
  equipment TEXT[] DEFAULT '{}',
  level TEXT DEFAULT 'beginner',
  aliases TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_preset BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout exercises junction table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  time_sec INTEGER,
  reps INTEGER,
  hold_sec INTEGER,
  pulses INTEGER,
  notes TEXT,
  side TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (optional for future auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout history table
CREATE TABLE IF NOT EXISTS workout_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INTEGER,
  notes TEXT
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups ON exercises USING GIN (muscle_groups);
CREATE INDEX IF NOT EXISTS idx_exercises_series ON exercises(series);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_position ON workout_exercises(workout_id, position);
CREATE INDEX IF NOT EXISTS idx_workouts_preset ON workouts(is_preset);
CREATE INDEX IF NOT EXISTS idx_workout_history_user ON workout_history(user_id);

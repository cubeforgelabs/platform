create or replace function increment_play_count(game_id uuid)
returns void
language sql
security definer
as $$
  update games set play_count = play_count + 1 where id = game_id;
$$;

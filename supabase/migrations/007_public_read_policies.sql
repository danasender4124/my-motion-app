-- Public read policies for the website
create policy "anon_read" on games
  for select to anon using (true);
create policy "anon_read" on teams
  for select to anon using (true);
create policy "anon_read" on seasons
  for select to anon using (true);
create policy "anon_read" on players
  for select to anon using (true);
create policy "anon_read" on player_game_stats
  for select to anon using (true);
create policy "anon_read" on player_team_seasons
  for select to anon using (true);

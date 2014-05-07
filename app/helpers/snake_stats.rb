def strength(original_snake)
  # order of snakes won games / played games
  # vs all other snakes
  snakes = Snake.all
  strength = 0
  snakes.each do |snake|
    strength += 1 if win_percentage(original_snake) > win_percentage(snake)
  end
  strength
end

def win_percentage(snake)
  (snake.won_games.count * 100) / snake.game_snakes.count
end

def personality(original_snake)
  # order of snakes
  # played games / total games
  # vs all other snakes
  snakes = Snake.all
  personality = 0
  snakes.each do |snake|
    personality += 1 if used_percentage(original_snake) > used_percentage(snake)
  end
  personality
end

def used_percentage(snake)
  (snake.game_snakes.count * 100) / Game.all.count
end

def favorite_food(snake)
  # most often used food type
end
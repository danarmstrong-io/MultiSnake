Snake.create(name: "nagini", color: "darkgreen", food: Food.create(name: "harry"))
Snake.create(name: "toothpick", color: "brown", food: Food.create(name: "chicken"))
Snake.create(name: "kaa", color: "lightgreen", food: Food.create(name: "bear"))
Snake.create(name: "chuck", color: "red", food: Food.create(name: "coconut"))
Snake.create(name: "benjy", color: "orange", food: Food.create(name: "worm"))
Snake.create(name: "mara", color: "pink", food: Food.create(name: "tardis"))
Snake.create(name: "hydra", color: "blue", food: Food.create(name: "crustacean"))
Snake.create(name: "unicorn", color: "purple", food: Food.create(name: "rainbow"))

# 36.times do
#   Game.create
# end











# Game.all.each do |game|
#   snakes = Snake.all.shuffle
#   rand(5).times do
#     GameSnake.create(game: game, snake: snakes.pop, food: Food.all.sample, score: rand(40))
#   end
#   score = 0
#   game.game_snakes.all.each do |gs|
#     if gs.score > score
#       @winner = gs.snake
#     end

#   end
#   game.snake_id = @winner.id
#   game.save
# end
get '/' do
  # Look in app/views/index.erb
  @snakes = Snake.all
  @snakes.delete_if {|snake| snake.name == "nagini"}
  @foods = Food.all
  erb :index
end

post '/play' do
  @game = Game.create
  players_array = params.to_a
  players = []
  players_array.each_with_index do |_, index|
    player = {}
    if index % 2 == 0
      player[:name] = players_array[index][1].split('_')[0]
      player[:color] = players_array[index][1].split('_')[1]
      player[:food] = players_array[index + 1][1]
      player[:game_id] = @game.id
      players.push(player)
    end
  end
  players.each do |player|
    name = player[:name]
    GameSnake.create(game: @game, snake: Snake.find_by_name(name), food: Food.find_by_name(player[:food]))
  end
  players.to_json
end
params = {"snake_name_0"=>"toothpick", "snake_food_0"=>"rainbow", "snake_name_1"=>"benjy", "snake_food_1"=>"harry"}
players_array = params.to_a
players =[]
players_array.each_with_index do |_, index|
  player = []
  if index % 2 == 0
    player.push(players_array[index][1])
    player.push(players_array[index + 1][1])
    players.push(player)
  end
end


#
(1..177).each do |index|
  puts "var img#{index} = new Image();"
end


snakes = ["benjy","chuck", "hydra", "kaa", "mara", "skeleton", "toothpick", "unicorn"]
direction = ["up", "down", "left", "right"]
part = ["head", "tail", "turnLeft", "turnRight", "straight"]

index = 1
snakes.each do |snake|
  direction.each do |direction|
    part.each do |part|
      puts "img#{index.to_s}.src = \"/snakes/#{snake}/#{direction}/#{part}.png\";"
      index+=1
    end
  end
end

foods = ["bear", "chicken", "coconut", "crustacean", "harry", "rainbow", "tardis", "worm"]

direction.each do |direction|
  puts "img#{index.to_s}.src = \"/fireball/#{direction}.png\";"
  index+=1
end

foods.each do |food|
  puts "img#{index.to_s}.src = \"/foods/#{food}.png\";"
  index+=1
end

powerups = ["bite", "egg", "fireball", "portal", "rainbowborder"]

powerups.each do |powerup|

  puts "img#{index.to_s}.src = \"/powerups/#{powerup}.png\";"
  index+=1
end







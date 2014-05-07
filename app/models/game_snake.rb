class GameSnake < ActiveRecord::Base
  belongs_to :game
  belongs_to :snake
  belongs_to :food
end

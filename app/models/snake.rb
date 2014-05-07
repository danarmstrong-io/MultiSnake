class Snake < ActiveRecord::Base
  has_many :game_snakes
  has_many :games
  alias_attribute :won_games, :games
  belongs_to :food
end

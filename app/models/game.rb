class Game < ActiveRecord::Base
  has_many :game_snakes
  belongs_to :snake # alias as winner
  alias_attribute :winner, :snake
end

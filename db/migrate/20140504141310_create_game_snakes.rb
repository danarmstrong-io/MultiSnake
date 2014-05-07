class CreateGameSnakes < ActiveRecord::Migration
  def change
    create_table :game_snakes do |t|
      t.belongs_to :game
      t.belongs_to :snake
      t.belongs_to :food
      t.integer :score
      t.timestamps
    end
  end
end
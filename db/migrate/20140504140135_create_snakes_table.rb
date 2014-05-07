class CreateSnakesTable < ActiveRecord::Migration
  def change
    create_table :snakes do |t|
      t.string :name
      t.string :color
      t.belongs_to :food
      t.timestamps
    end
  end
end

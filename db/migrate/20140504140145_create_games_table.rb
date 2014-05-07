class CreateGamesTable < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.belongs_to :snake
      t.timestamps
    end
  end
end

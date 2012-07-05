class AddDistanceToNode < ActiveRecord::Migration
  def change
  	add_column :nodes, :distance, :string
  end
end

class AddDirectionsToNode < ActiveRecord::Migration
  def change
  	add_column :nodes, :polyline, :text
  end
end

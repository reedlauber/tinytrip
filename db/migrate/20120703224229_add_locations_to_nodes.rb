class AddLocationsToNodes < ActiveRecord::Migration
  def change
  	add_column :nodes, :start_location_id, :integer
  	add_column :nodes, :end_location_id, :integer
  end
end

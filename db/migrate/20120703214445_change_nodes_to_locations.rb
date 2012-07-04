class ChangeNodesToLocations < ActiveRecord::Migration
  def up
    remove_column :nodes, :city
    remove_column :nodes, :state
    remove_column :nodes, :address
    remove_column :nodes, :zipcode
    remove_column :nodes, :lat
    remove_column :nodes, :lon
  end

  def down
    add_column :nodes, :city, :string
    add_column :nodes, :state, :string
    add_column :nodes, :address, :string
    add_column :nodes, :zipcode, :string
    add_column :nodes, :lat, :float
    add_column :nodes, :lon, :float
  end
end

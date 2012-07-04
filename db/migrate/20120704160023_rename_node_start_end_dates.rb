class RenameNodeStartEndDates < ActiveRecord::Migration
  def up
  	rename_column :nodes, :start_at, :starts_on
  	rename_column :nodes, :end_at, :ends_on
  end

  def down
  	rename_column :nodes, :starts_on, :start_at
  	rename_column :nodes, :ends_on, :end_at
  end
end

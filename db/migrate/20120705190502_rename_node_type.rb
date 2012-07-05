class RenameNodeType < ActiveRecord::Migration
  def up
  	rename_column :nodes, :type, :node_type
  end

  def down
  	rename_column :nodes, :node_type, :type
  end
end

class CreateNodes < ActiveRecord::Migration
  def change
    create_table :nodes do |t|
      t.string :title
      t.integer :trip_id
      t.string :type
      t.integer :position
      t.datetime :start_at
      t.datetime :end_at
      t.integer :duration
      t.string :city
      t.string :state
      t.string :address
      t.string :zipcode
      t.float :lat
      t.float :lon
      t.timestamps
    end
  end
end

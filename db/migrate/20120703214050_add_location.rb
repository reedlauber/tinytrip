class AddLocation < ActiveRecord::Migration
  def up
  	create_table :locations do |t|
  		t.string :title
		t.string :address
		t.string :city
		t.string :state
		t.string :zipcode
		t.float :lat
		t.float :lon
		t.timestamps
    end
  end

  def down
  	drop_table :locations
  end
end

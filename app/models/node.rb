class Node < ActiveRecord::Base
  	attr_accessible :trip_id, :position, :city, :state, :title, :zipcode, :lat, :lon
	belongs_to :trip
	belongs_to :start_location, :class_name => "Location"
	belongs_to :end_location, :class_name => "Location"
end

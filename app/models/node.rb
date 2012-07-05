class Node < ActiveRecord::Base
  	attr_accessible :trip_id, :node_type, :position, :title, :duration, :distance, :polyline, :starts_on
	belongs_to :trip
	belongs_to :start_location, :class_name => "Location"
	belongs_to :end_location, :class_name => "Location"
end

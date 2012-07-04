class Location < ActiveRecord::Base
  has_one :ending_node, class_name: "Node", foreign_key: 'end_location_id'
  has_one :starting_node, class_name: "Node", foreign_key: 'start_location_id'
end

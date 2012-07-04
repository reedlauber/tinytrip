class Trip < ActiveRecord::Base
  has_many :nodes
end

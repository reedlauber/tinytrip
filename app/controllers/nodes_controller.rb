class NodesController < ApplicationController
	def index
		full_nodes = []

		Node.includes(:start_location, :end_location).where("trip_id = ?", params[:trip_id]).order("position").each do |node|
			full_nodes << {
				:node => node,
				:start_location => node.start_location,
				:end_location => node.end_location
			}
		end

		render :json => { :nodes => full_nodes }
	end

	def create
		polyline = node_directions

		start_location = Location.new
		start_location.title = params[:start_title]
		start_location.address = params[:start_address]
		start_location.city = params[:start_city]
		start_location.state = params[:start_state]
		start_location.lat = params[:start_lat]
		start_location.lon = params[:start_lon]

		end_location = Location.new
		end_location.title = params[:end_title]
		end_location.address = params[:end_address]
		end_location.city = params[:end_city]
		end_location.state = params[:end_state]
		end_location.lat = params[:end_lat]
		end_location.lon = params[:end_lon]

		start_location.save
		end_location.save

		node = Node.new
		node.trip_id = params[:trip_id]
		node.title = params[:title]
		node.position = params[:position]
		node.start_location_id = start_location.id
		node.end_location_id = end_location.id
		node.polyline = polyline
		node.save

		render :json => { :node => node, :start_location => start_location, :end_location => end_location }
	end

	def update
		node = Node.where("id = ?", params[:id]).first

		if(params[:starts_on] != nil)
			node.starts_on = params[:starts_on]
			node.save
		end

		render :json => { :success => true }
	end

	def destroy
		node = Node.where("id = ?", params[:id]).first

		trip_id = node.trip_id

		if(node != nil)
			node.destroy
		end

		# reorder remaining node positions
		nodes = Node.where("trip_id = ?", trip_id).order("position")

		for i in 0..nodes.count-1
			nodes[i].position = (i + 1)
			nodes[i].save
		end

		render :json => { :success => true }
	end

	private
	def node_params
		params.permit(:trip_id, :position)
	end

	def node_directions
		origin = URI::encode_www_form_component params[:start_title]
		destination = URI::encode_www_form_component params[:end_title]
		url = "http://maps.googleapis.com/maps/api/directions/json?origin=#{origin}&destination=#{destination}&sensor=false"
		logger.info url
		resp = Curl.get url
		resp_obj = ActiveSupport::JSON.decode(resp.body_str)
		encoded_polyline = resp_obj["routes"][0]["overview_polyline"]["points"]
		encoded_polyline
	end
end

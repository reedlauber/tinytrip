class NodesController < ApplicationController
	def index
		nodes = Node.includes(:start_location, :end_location).where("trip_id = ?", params[:trip_id]).order("position")

		render :json => { :nodes => nodes }.to_json(:include => [:start_location, :end_location])
	end

	def create
		start_location = Location.create(start_location_params)
		end_location = Location.create(end_location_params)

		node = Node.create(node_params)
		node.start_location = start_location
		node.end_location = end_location
		node.save

		render :json => node.to_json(:include => [:start_location, :end_location])
	end

	def update
		node = Node.where("id = ?", params[:id]).first

		if(params[:starts_on] != nil)
			node.starts_on = params[:starts_on]
			node.save
		end

		render :json => node.to_json(:include => [:start_location, :end_location])
	end

	def destroy
		node = Node.where("id = ?", params[:id]).first

		trip_id = node.trip_id

		if(node != nil)
			node.start_location.destroy if node.start_location
			node.end_location.destroy if node.end_location
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
		params.permit(:trip_id, :position, :node_type, :title, :starts_on, :duration, :distance, :polyline)
	end

	def start_location_params
		{
			:title => params[:start_title],
			:address => params[:start_address],
			:city => params[:start_city],
			:state => params[:start_state],
			:lat => params[:start_lat],
			:lon => params[:start_lon]	
		}
	end

	def end_location_params
		{
			:title => params[:end_title],
			:address => params[:end_address],
			:city => params[:end_city],
			:state => params[:end_state],
			:lat => params[:end_lat],
			:lon => params[:end_lon]	
		}
	end
end

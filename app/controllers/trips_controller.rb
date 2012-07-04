class TripsController < ApplicationController
	def new
	end

	def create
		trip = Trip.new
		trip.title = params[:title]
		trip.user_id = params[:user_id]
		trip.save

		redirect_to trip_url(trip)
	end

	def show
		@trip = Trip.where("id = ?", params[:id]).first

		@nodes = Node.where("trip_id = ?", @trip.id).order("position")
	end
end

class DirectionsController < ApplicationController
	def index
		points = params[:points].split '|'

		if points.count < 2
			render :json => { :success => false, :message => "At least two points are required for directions." }
			return
		end

		points.map! { |point| URI::encode_www_form_component point }

		origin = points[0]
		destination = points[points.count - 1]
		waypoints = ""
		if points.count > 2
			points.slice! 0
			points.slice! -1
			waypoints = points.join "|"
		end

		url = "http://maps.googleapis.com/maps/api/directions/json?origin=#{origin}&destination=#{destination}&waypoints=#{waypoints}&sensor=false"
		logger.info url
		resp = Curl.get url

		render :json => resp.body_str
	end
end
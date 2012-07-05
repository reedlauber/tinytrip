class GeocodeController < ApplicationController
	def search
		addresses = params[:addresses].split '-'
		addresses.map! { |address| URI::encode_www_form_component address }

		start_url = "http://maps.googleapis.com/maps/api/geocode/json?address=#{addresses[0]}&sensor=false"
		end_url = "http://maps.googleapis.com/maps/api/geocode/json?address=#{addresses[1]}&sensor=false"
		
		start_resp = Curl.get start_url
		end_resp = Curl.get end_url

		start_obj = ActiveSupport::JSON.decode(start_resp.body_str)
		end_obj = ActiveSupport::JSON.decode(end_resp.body_str)

		render :json => { :start_resp => start_obj, :end_resp => end_obj }
	end
end

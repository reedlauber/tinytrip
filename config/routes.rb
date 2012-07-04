Tinytrip::Application.routes.draw do
  devise_for :users

  root :to => "home#index"

  get "/geocode/:addresses" => "geocode#search"
  get "/directions/:points" => "directions#index"

  resources :trips do
  	resources :nodes
  end
end

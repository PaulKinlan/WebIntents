Twitpic::Application.routes.draw do
  root :to => 'root#index'
  get 'twitpic', :to => 'twitpic#show', :as => 'show'
  get 'twitpic/upload'
  get '/auth/twitter/callback', :to => 'twitpic#callback', :as => 'callback'
  get '/auth/failure', :to => 'twitpic#error', :as => 'failure'
  post '/twitpic/upload', :to => 'twitpic#upload', :as => 'upload'
end

Memegen::Application.routes.draw do
  root :to => 'root#index'

  get "memegen", :to => 'memegen#show'
  get "proxy", :to => "memegen#proxy"
end

Memegen::Application.routes.draw do
  root :to => 'root#index'

  get "edit", :to => 'memegen#show'
  get "proxy", :to => "memegen#proxy"
end

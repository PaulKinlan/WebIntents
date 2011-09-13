Webintents::Application.routes.draw do
  match 'faq' => 'root#faq'
  match 'discover' => 'root#discover'
  match 'share' => 'root#share'
  match 'edit' => 'root#edit'
  match 'view' => 'root#view'
  match 'pick' => 'root#pick'
  match 'subscribe' => 'root#subscribe'
  match 'save' => 'root#save'
  root :to => 'root#index'
end

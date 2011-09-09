WebintentsOrg::Application.routes.draw do
  match 'examples/' => 'examples#index'
  match 'examples/intents/pick/' => 'examples#pick'
  match 'examples/intents/pick/index.html' => 'examples#pick'
  match 'examples/intents/pick/action.html' => 'examples#pick_action'
  match 'examples/intents/pick/register.html' => 'examples#pick_register'
  match 'examples/intents/pick/pick.html' => 'examples#pick_pick'
  match 'examples/intents/pick/google.html' => 'examples#pick_google'
  match 'examples/intents/share/' => 'examples#share'
  match 'examples/intents/share/index.html' => 'examples#share'
  match 'examples/intents/share/register.html' => 'examples#share_register'
  match 'examples/intents/share/action.html' => 'examples#share_action'
  match 'examples/intents/share/sharelink.html' => 'examples#share_link'
  match 'examples/intents/share/shareimage.html' => 'examples#share_image'

  match 'faq' => 'root#faq'
  root :to => 'root#index'
end

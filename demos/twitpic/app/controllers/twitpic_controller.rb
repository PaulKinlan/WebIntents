require 'datafy'
require 'image_fetch'
require 'open-uri'
require 'uri'

class TwitpicController < ApplicationController
  def callback
    session[:access_token] = request.env['omniauth.auth']['credentials']['token']
    session[:access_secret] = request.env['omniauth.auth']['credentials']['secret']
    redirect_to show_path
  end

  def show
    if !logged_in?
      if session[:tried_login]
        error
      else
        session[:tried_login] = true
        redirect_to OmniAuth::Strategies::Twitter.new(nil).request_path()
      end
    end
  end

  def error
    flash[:error] = "Sign in with Twitter failed!"
    session[:tried_login] = false
    redirect_to root_path
  end

  def upload
    image = ImageFetch.new(request.params['img'])
    begin
      render :json => twitpic_client.upload(image.path, '')
    ensure
      image.cleanup
    end
  end

  def destroy
    reset_session
    redirect_to root_path, :notice => "Signed out!"
  end

  private
end

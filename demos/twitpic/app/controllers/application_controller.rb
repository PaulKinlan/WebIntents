require 'twitpic'

class ApplicationController < ActionController::Base
  protect_from_forgery

  private
  def logged_in?
    return session['access_token'] && session['access_secret']
  end

  def twitpic_client
    twitpic_client = TwitPic::Client.new
    twitpic_client.configure do |conf|
      conf.api_key = TwitterConstants::TWITPIC_API_KEY
      conf.consumer_key = TwitterConstants::CONSUMER_KEY
      conf.consumer_secret = TwitterConstants::CONSUMER_SECRET
      conf.oauth_token = session['access_token']
      conf.oauth_secret = session['access_secret']
    end
    twitpic_client
  end
end

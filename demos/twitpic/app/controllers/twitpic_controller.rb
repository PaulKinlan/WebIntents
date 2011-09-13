require 'datafy'
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
        redirect_to '/auth/twitter'
      end
    end
  end

  def error
    flash[:error] = "Sign in with Twitter failed!"
    session[:tried_login] = false
    redirect_to root_path
  end

  def upload
    url = request.params['img'] || ''
    path = if url.starts_with?('data:')
      store_data_url(url)
    elsif url.starts_with?('http://') || url.starts_with?('https://')
      store_url(url)
    else
      raise 'Unsupported URL format'
    end
    begin
      render :json => twitpic_client.upload(path, '')
    ensure
      cleanup(path)
    end
  end

  def destroy
    reset_session
    redirect_to root_path, :notice => "Signed out!"
  end

  private
  def store_data_url(url)
    data, type = Datafy::decode_data_uri(url)
    suffix = get_suffix(type)
    return get_tempfile('image' + suffix) { |f|
      f.write(data)
    }
  end

  def store_url(url)
    return get_tempfile(File::basename(URI.split(url)[5])) { |f|
      f << open(url).read
    }
  end

  def get_tempfile(filename, &block)
    dir = File.join(Dir::tmpdir, "twitpic_#{Process.pid}_#{rand(100)}_#{Time.now.to_i}")
    Dir.mkdir(dir)
    filepath = File.join(dir, filename)
    File.open(filepath, "wb", &block)
    return filepath
  end

  def cleanup(filepath)
    File.unlink(filepath)
    Dir.rmdir(File::dirname(filepath))
  end

  def get_suffix(type)
    if (type == 'image/jpg' || type == 'image/jpeg')
      return '.jpg'
    elsif (type == 'image/png')
      return '.png'
    elsif (type == 'image/gif')
      return '.gif'
    else
      raise 'Unsupported image type'
    end
  end
end

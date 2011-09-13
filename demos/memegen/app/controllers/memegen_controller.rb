require File.expand_path(File.dirname(__FILE__) + "/../../../twitpic/lib/image_fetch")

class MemegenController < ApplicationController
  def show
  end

  def proxy
    image = ImageFetch.new(request.params['url'])
    begin
      send_file(image.path, :disposition => 'inline', :type => image.type)
    ensure
      image.cleanup
    end
  end

end

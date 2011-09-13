#!/usr/bin/ruby
#
# Copyright:: Copyright 2011 Google Inc.
# License:: All Rights Reserved.
# Original Author:: Tony Payne (mailto:tpayne@google.com)
#
#
require 'open-uri'

class ImageFetch
  def initialize(url)
    url ||= ''
    @path = if url.starts_with?('data:')
      store_data_url(url)
    elsif url.starts_with?('http://') || url.starts_with?('https://')
      store_url(url)
    else
      raise "Unsupported URL format: #{url}"
    end
  end

  def path
    @path
  end

  def type
    @type
  end

  def store_data_url(url)
    data, @type = Datafy::decode_data_uri(url)
    return get_tempfile('image' + suffix) { |f|
      f.write(data)
    }
  end

  def store_url(url)
    return get_tempfile(File::basename(URI.split(url)[5])) { |f|
      open(url) { |rf|
        @type = rf.content_type
        f << rf.read
      }
    }
  end

  def get_tempfile(filename, &block)
    dir = File.join(Dir::tmpdir, "twitpic_#{Process.pid}_#{rand(100)}_#{Time.now.to_i}")
    Dir.mkdir(dir)
    filepath = File.join(dir, filename)
    File.open(filepath, "wb", &block)
    return filepath
  end

  def cleanup
    File.unlink(@path)
    Dir.rmdir(File::dirname(@path))
  end

  def suffix
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

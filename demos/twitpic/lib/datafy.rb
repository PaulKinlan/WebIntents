#!/usr/bin/env ruby -w

=begin

Creates a data: URI as described by RFC 2397
[http://www.ietf.org/rfc/rfc2397.txt]

by: Eric Hodel <drbrain@segment7.net>

$ echo 'Here is some text to datafy.' | ./datafy.rb -m text/plain
data:text/plain,Here%20is%20some%20text%20to%20datafy.%0A

$ echo 'Here is some text to datafy.' | ./datafy.rb -m application/octet-stream
data:application/octet-stream;base64,SGVyZSBpcyBzb21lIHRleHQgdG8gZGF0YWZ5Lgo=

Datafy will also fetch and encode from an HTTP URL: ./datafy.rb -u http://...
It will recursively encode stylsheets, img src=, link href=, and normalize
URLs.

=end

require 'base64'
require 'uri'
require 'net/http'
require 'cgi'

module Datafy

  A_HREF_RE = /a([^>]+)href="([^"]+)"/im
  LINK_HREF_RE = /link([^>]+)href="([^"]+)"/im
  IMG_SRC_RE = /img([^>]+)src="([^"]+)"/im

  CSS_URL_RE = /url\("?([^?"]+)"+\)/im

  def Datafy::make_data_uri(content, content_type)
    outuri = 'data:' + content_type

    unless content_type =~ /^text/i # base64 encode if not text
      outuri += ';base64'
      content = encode64(content).gsub("\n", '')
    else
      content = CGI::escape(content)
    end

    outuri += ",#{content}"
  end

  def Datafy::decode_data_uri(uri)
    uri = URI.parse(uri) unless uri.kind_of? URI

    raise ArgumentError.new("Incorrect URI scheme, expected data:, got #{uri.scheme}") unless
      uri.scheme == 'data'

    # extract the media type and data
    uri.opaque =~ /^([^,]+)?,(.*)$/

    mediatype = $1
    data = $2

    # if the media is base64 encoded, set the flag and strip it
    if base64 = $1 =~ /^(.+);base64$/
      mediatype = $1
    end

    # decode
    if base64
      data = decode64(data)
    else
      data = CGI::unescape(data)
    end

    return data, mediatype
  end

  def Datafy::page_to_data_uri(uri)
    uri = URI.parse(uri) unless uri.kind_of? URI

    $stderr.puts "working on #{uri}" if $DEBUG

    page = fetch_page(uri)
    body = page.body
    content_type = page['content-type'].downcase

    $stderr.puts "has content type #{content_type}" if $DEBUG

    encode_page(body, content_type, uri)
  end

  private

  def Datafy::encode_page(body, content_type, base_uri)
    case content_type
    when 'text/html'
      $stderr.puts "filtering 'A's" if $DEBUG

      body = body.gsub(A_HREF_RE) {
        href_uri = cleanup_uri(base_uri, $2)
        %Q!a#{$1}href="#{href_uri}"!
      }

      $stderr.puts "filtering 'IMG's" if $DEBUG

      body = body.gsub(IMG_SRC_RE) {
        img_uri = cleanup_uri(base_uri, $2)
        %Q!img#{$1}src="#{page_to_data_uri(img_uri)}"!
      }
      
      $stderr.puts "filtering 'LINK's" if $DEBUG

      body = body.gsub(LINK_HREF_RE) {
        href_uri = cleanup_uri(base_uri, $2)
        %Q!link#{$1}href="#{page_to_data_uri(href_uri)}"!
      }

    when 'text/css'
      $stderr.puts "filtering CSS urls" if $DEBUG
      body = body.gsub(CSS_URL_RE) {
        url_contents = ''
        uri = cleanup_uri(base_uri, $1)
        if uri.scheme != 'data'
          url_contents = page_to_data_uri(uri)
        else
          url_contents = uri.opaque
        end
          
        %Q!url("#{url_contents}")!
      }

    end

    return make_data_uri(body, content_type)
  end

  def Datafy::cleanup_uri(base, link)
    $stderr.puts "cleaning #{link} using base #{base}" if $DEBUG
    link = URI.parse(link) unless link.kind_of? URI

    return link if link.scheme == 'mailto'

    # make sure its absolute
    if link.relative? && link.path[0].chr != '/'
      path_ary = base.path.split('/')
      link.path = path_ary[0...path_ary.length-1].join('/') + '/' +
        link.path
    end

    # make sure all the components are there
    link.scheme = base.scheme unless link.scheme
    link.host = base.host unless link.host
    link.port = base.port unless link.port

    link
  end

  def Datafy::fetch_page(uri)
    response = nil
    begin
      Net::HTTP.start( uri.host, uri.port ) {|http|
        uri.normalize!
        response, = http.get(uri.path)
      }
    rescue Net::ProtoRetriableError => err
      uri = URI.parse(err.response['location'])
      retry if uri.host
    rescue Net::ProtoFatalError => err
      raise RuntimeError.new("404 encountered at #{uri} fetching page")
    end

    return response
  end
end

if __FILE__ == $0 # don't polute the namespace with help

  require 'getoptlong'

  def help(exitcode = 0)
    $stderr.puts "datafy.rb, an RFC2397 data: uri utility"
    $stderr.puts "by Eric Hodel <drbrain@segment7.net>"
    $stderr.puts
    $stderr.puts "usage: #{$0} [-m=mimetype] [filename]"
    $stderr.puts
    $stderr.puts "options:"
    $stderr.puts "  -m=mimetype  the mime type of the file to be encoded"
    $stderr.puts 
    $stderr.puts "#{$0} can be called with a filename and will attempt to"
    $stderr.puts "determine the file using file(1) if it exists on your system"
    $stderr.puts "otherwise the mime type must be specified.  #{$0} can also"
    $stderr.puts "read a file from stdin, the mime type must be specified in"
    $stderr.puts "this mode."

    exit(exitcode)
  end

  url = ''
  content_type = ''

  opts = GetoptLong.new(
    ["-m", GetoptLong::REQUIRED_ARGUMENT],
    ['-u', GetoptLong::REQUIRED_ARGUMENT],
    ["-h", GetoptLong::NO_ARGUMENT]
  )

  opts.each { |opt, arg|
    case opt
    when "-h" then help()
    when "-m" then content_type = arg.downcase
    when '-u' then url = arg
    end
  }

  if url.empty?
    filename = ARGV[0]

    content = ''
    if filename
      content = File.open(filename) { |fp| fp.read }
      begin
        if content_type.empty?
          content_type = /^#{filename}: ([^,]+).*$/.match(`file -i #{filename}`)[1].downcase
        end
      rescue
        content_type = nil
      end
    else
      content = $stdin.read
    end

    if content_type.nil? or content_type.empty?
      $stderr.puts 'Cannot determine MIME type of file, please use -m'
      $stderr.puts
      help(1)
    end

    puts Datafy.make_data_uri(content, content_type)
  else
    begin
      page, = Datafy.decode_data_uri(Datafy.page_to_data_uri(url))
      puts page
    rescue => err
      $stderr.puts "#{err.class.name} encoding #{url}:\n#{err}"
    end
  end

end # __FILE__ == $0

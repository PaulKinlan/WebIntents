import BaseHTTPServer, SimpleHTTPServer
import ssl
import sys
import urlparse
import httplib2

class FetchImageHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def do_GET(self):
    if (self.path.find("/proxy") == 0):
      url = urlparse.parse_qs(urlparse.urlparse(self.path).query)['url'][0]
      response, content = httplib2.Http().request(url, headers = {
          'Connection': 'close'})
      mime = response['content-type']
      if (mime.find("image/") == 0):
        self.send_response(int(response['status']))
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', response['content-length'])
        self.send_header('Connection', 'close')
        self.end_headers()
        self.wfile.write(content)
      else:
        self.send_response(403)
    else:
      SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)


def main():
  port = int(sys.argv[1])
  secure = len(sys.argv) > 2 and sys.argv[2] == "-s"
  httpd = BaseHTTPServer.HTTPServer(('', port), FetchImageHandler)
  if secure:
    httpd.socket = ssl.wrap_socket (httpd.socket, certfile='../server/ssl/server.pem', server_side=True)
  print "Serving on", port
  httpd.serve_forever()

if __name__ == "__main__":
  main()

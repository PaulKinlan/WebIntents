import BaseHTTPServer, SimpleHTTPServer
import ssl
import sys

def main():
  port = int(sys.argv[1])
  httpd = BaseHTTPServer.HTTPServer(('', port), SimpleHTTPServer.SimpleHTTPRequestHandler)
  httpd.socket = ssl.wrap_socket (httpd.socket, certfile='../server/ssl/server.pem', server_side=True)
  print "Serving on", port
  httpd.serve_forever()

if __name__ == "__main__":
  main()

NOW = $(shell date "+%Y.1%m.1%d.1%H%M")

all: server/webintents/static/cache.manifest production

release: ./src/webintents.js ./src/json2.js ./src/base64.js ./src/webintents-prefix.js
	cat ./src/webintents.js ./src/json2.js ./src/base64.js > webintents.js
	cp webintents.js server/webintents/static/webintents.js
	cp ./src/webintents-prefix.js server/webintents/static/webintents-prefix.js
	cp webintents.js server/webintents/static/webintents.js

production: server/webintents/static/cache.manifest release
	uglifyjs webintents.js > server/webintents/static/webintents.min.js

server/webintents/static/webintents.js:

# Manifest depends on changes to other files, so include them in the dependency chain
server/webintents/static/cache.manifest: server/webintents/cache.manifest.src server/webintents/static/list.html server/webintents/static/picker.html server/webintents/static/picker.js server/webintents/static/webintents.js server/webintents/static/intents.html server/webintents/static/json2.js server/webintents/static/webintents-server.js server/webintents/static/controller.js server/webintents/static/base64.js
	cat server/webintents/cache.manifest.src > server/webintents/static/cache.manifest
	echo '#' `date` >> server/webintents/static/cache.manifest

tools: chrome

chrome: extensions apps

apps: tools/chrome/apps/hosted/picksomeipsum.crx
	./packcrx.sh tools/chrome/apps/hosted/cloudfilepicker tools/chrome/key.pem
	./packcrx.sh tools/chrome/apps/hosted/imagemator tools/chrome/key.pem
	./packcrx.sh tools/chrome/apps/hosted/inspirationmator tools/chrome/key.pem
	./packcrx.sh tools/chrome/apps/hosted/mememator tools/chrome/key.pem
	./packcrx.sh tools/chrome/apps/hosted/quicksnapr tools/chrome/key.pem
	./packcrx.sh tools/chrome/apps/packaged/scrapbook tools/chrome/key.pem

tools/chrome/apps/hosted/picksomeipsum/manifest.json: tools/chrome/apps/hosted/picksomeipsum-manifest.json
	cat ./tools/chrome/apps/hosted/picksomeipsum-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/apps/hosted/picksomeipsum/manifest.json 

tools/chrome/apps/hosted/picksomeipsum.crx: tools/chrome/apps/hosted/picksomeipsum/manifest.json tools/chrome/apps/hosted/picksomeipsum/128.png
	./packcrx.sh tools/chrome/apps/hosted/picksomeipsum tools/chrome/key.pem

extensions: tools/chrome/extensions/share-services/imgur.crx tools/chrome/extensions/share-services/google+.crx tools/chrome/extensions/share-services/twitter.crx tools/chrome/extensions/share-services/blogger.crx tools/chrome/extensions/share-services/tumblr.crx tools/chrome/extensions/share-services/digg.crx tools/chrome/extensions/share-services/linkedin.crx tools/chrome/extensions/share-services/delicious.crx tools/chrome/extensions/share-services/reddit.crx tools/chrome/extensions/share-services/gmail.crx tools/chrome/extensions/share-services/hackernews.crx tools/chrome/extensions/shorten-services/bit.ly.crx  tools/chrome/extensions/shorten-services/goo.gl.crx tools/chrome/extensions/save-services/box.crx tools/chrome/extensions/save-services/readitlater.crx tools/chrome/extensions/save-services/instapaper.crx tools/chrome/extensions/pick-services/pickhtml.crx tools/chrome/extensions/pick-services/pickbookmark.crx tools/chrome/extensions/pick-services/pickscreenshot.crx
	./packcrx.sh tools/chrome/extensions/share tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/shorten tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/desktop tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/edit tools/chrome/key.pem

tools/chrome/extensions/share-services/imgur/manifest.json: tools/chrome/extensions/share-services/imgur-manifest.json
	cat ./tools/chrome/extensions/share-services/imgur-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/share-services/imgur/manifest.json 

tools/chrome/extensions/share-services/imgur.crx: tools/chrome/extensions/share-services/imgur/manifest.json tools/chrome/extensions/share-services/imgur/launch.html
	./packcrx.sh tools/chrome/extensions/share-services/imgur tools/chrome/key.pem

tools/chrome/extensions/save-services/instapaper/manifest.json:
	cat ./tools/chrome/extensions/save-services/instapaper-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/save-services/instapaper/manifest.json 

tools/chrome/extensions/save-services/instapaper.crx: tools/chrome/extensions/save-services/instapaper/manifest.json tools/chrome/extensions/save-services/instapaper/launch.html
	./packcrx.sh tools/chrome/extensions/save-services/instapaper tools/chrome/key.pem

tools/chrome/extensions/save-services/readitlater/manifest.json:
	cat ./tools/chrome/extensions/save-services/readitlater-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/save-services/readitlater/manifest.json 

tools/chrome/extensions/save-services/readitlater.crx: tools/chrome/extensions/save-services/readitlater/manifest.json tools/chrome/extensions/save-services/readitlater/launch.html
	./packcrx.sh tools/chrome/extensions/save-services/readitlater tools/chrome/key.pem

tools/chrome/extensions/save-services/box/manifest.json:
	cat ./tools/chrome/extensions/save-services/box-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/save-services/box/manifest.json 

tools/chrome/extensions/save-services/box.crx: tools/chrome/extensions/save-services/box/manifest.json tools/chrome/extensions/save-services/box/box.html
	./packcrx.sh tools/chrome/extensions/save-services/box tools/chrome/key.pem

tools/chrome/extensions/shorten-services/bit.ly/manifest.json:
	cat ./tools/chrome/extensions/shorten-services/bit.ly-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/shorten-services/bit.ly/manifest.json 

tools/chrome/extensions/shorten-services/bit.ly.crx: tools/chrome/extensions/shorten-services/bit.ly/manifest.json tools/chrome/extensions/shorten-services/bit.ly/launch.html
	./packcrx.sh tools/chrome/extensions/shorten-services/bit.ly tools/chrome/key.pem

tools/chrome/extensions/shorten-services/goo.gl/manifest.json:
	cat ./tools/chrome/extensions/shorten-services/goo.gl-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/shorten-services/goo.gl/manifest.json 

tools/chrome/extensions/shorten-services/goo.gl.crx: tools/chrome/extensions/shorten-services/goo.gl/manifest.json tools/chrome/extensions/shorten-services/goo.gl/launch.html
	./packcrx.sh tools/chrome/extensions/shorten-services/goo.gl tools/chrome/key.pem

tools/chrome/extensions/share-services/twitter.crx: tools/chrome/extensions/share-services/twitter/manifest.json tools/chrome/extensions/share-services/twitter/twitter_inline.html
	./packcrx.sh tools/chrome/extensions/share-services/twitter tools/chrome/key.pem

tools/chrome/extensions/share-services/twitter/manifest.json: tools/chrome/extensions/share-services/twitter-manifest.json
	cat ./tools/chrome/extensions/share-services/twitter-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/share-services/twitter/manifest.json 

tools/chrome/extensions/share-services/google+.crx: tools/chrome/extensions/share-services/google+/manifest.json tools/chrome/extensions/share-services/google+/launch.html
	./packcrx.sh tools/chrome/extensions/share-services/google+ tools/chrome/key.pem

tools/chrome/extensions/share-services/google+/manifest.json: tools/chrome/extensions/share-services/google+-manifest.json
	cat ./tools/chrome/extensions/share-services/google+-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/share-services/google+/manifest.json 

tools/chrome/extensions/share-services/tumblr/manifest.json:
	cat ./tools/chrome/extensions/share-services/tumblr-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/share-services/tumblr/manifest.json 

tools/chrome/extensions/share-services/tumblr.crx: tools/chrome/extensions/share-services/tumblr/manifest.json
	./packcrx.sh tools/chrome/extensions/share-services/tumblr tools/chrome/key.pem

tools/chrome/extensions/share-services/blogger/manifest.json:
	cat ./tools/chrome/extensions/share-services/blogger-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/share-services/blogger/manifest.json 

tools/chrome/extensions/share-services/blogger.crx: tools/chrome/extensions/share-services/blogger/manifest.json
	./packcrx.sh tools/chrome/extensions/share-services/blogger tools/chrome/key.pem

tools/chrome/extensions/share-services/digg/manifest.json:
	cat ./tools/chrome/extensions/share-services/digg-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/share-services/digg/manifest.json 

tools/chrome/extensions/share-services/digg.crx: tools/chrome/extensions/share-services/digg/manifest.json
	./packcrx.sh tools/chrome/extensions/share-services/digg tools/chrome/key.pem

tools/chrome/extensions/share-services/hackernews/manifest.json: tools/chrome/extensions/share-services/hackernews-manifest.json
	cat ./tools/chrome/extensions/share-services/hackernews-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/share-services/hackernews/manifest.json 

tools/chrome/extensions/share-services/hackernews.crx: tools/chrome/extensions/share-services/blogger/manifest.json
	./packcrx.sh tools/chrome/extensions/share-services/hackernews tools/chrome/key.pem

tools/chrome/extensions/share-services/gmail/manifest.json:
	cat ./tools/chrome/extensions/share-services/gmail-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/share-services/gmail/manifest.json 

tools/chrome/extensions/share-services/gmail.crx: tools/chrome/extensions/share-services/gmail/manifest.json
	./packcrx.sh tools/chrome/extensions/share-services/gmail tools/chrome/key.pem

tools/chrome/extensions/share-services/delicious/manifest.json:
	cat ./tools/chrome/extensions/share-services/delicious-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/share-services/delicious/manifest.json 

tools/chrome/extensions/share-services/delicious.crx: tools/chrome/extensions/share-services/delicious/manifest.json
	./packcrx.sh tools/chrome/extensions/share-services/delicious tools/chrome/key.pem

tools/chrome/extensions/share-services/linkedin/manifest.json:
	cat ./tools/chrome/extensions/share-services/linkedin-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/share-services/linkedin/manifest.json 

tools/chrome/extensions/share-services/linkedin.crx: tools/chrome/extensions/share-services/linkedin/manifest.json
	./packcrx.sh tools/chrome/extensions/share-services/linkedin tools/chrome/key.pem

tools/chrome/extensions/share-services/reddit/manifest.json:
	cat ./tools/chrome/extensions/share-services/reddit-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/share-services/reddit/manifest.json 

tools/chrome/extensions/share-services/reddit.crx: tools/chrome/extensions/share-services/reddit/manifest.json
	./packcrx.sh tools/chrome/extensions/share-services/reddit tools/chrome/key.pem

tools/chrome/extensions/pick-services/pickhtml/manifest.json:
	cat ./tools/chrome/extensions/pick-services/pickhtml-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/pick-services/pickhtml/manifest.json 

tools/chrome/extensions/pick-services/pickhtml.crx: tools/chrome/extensions/pick-services/pickhtml/manifest.json
	./packcrx.sh tools/chrome/extensions/pick-services/pickhtml tools/chrome/key.pem

tools/chrome/extensions/pick-services/pickbookmark/manifest.json:
	cat ./tools/chrome/extensions/pick-services/pickbookmark-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/pick-services/pickbookmark/manifest.json 

tools/chrome/extensions/pick-services/pickbookmark.crx: tools/chrome/extensions/pick-services/pickbookmark/manifest.json
	./packcrx.sh tools/chrome/extensions/pick-services/pickbookmark tools/chrome/key.pem

tools/chrome/extensions/pick-services/pickscreenshot/manifest.json:
	cat ./tools/chrome/extensions/pick-services/pickscreenshot-manifest.json | sed 's|"version":.*|"version": "$(NOW)",|' > ./tools/chrome/extensions/pick-services/pickscreenshot/manifest.json 

tools/chrome/extensions/pick-services/pickscreenshot.crx: tools/chrome/extensions/pick-services/pickscreenshot/manifest.json
	./packcrx.sh tools/chrome/extensions/pick-services/pickscreenshot tools/chrome/key.pem

clean:
	rm -f webintents.js
	rm -f server/webintents/static/webintents.js
	rm -f server/webintents/static/webintents.min.js
	rm -f server/webintents/static/webintents.min.gz
	rm -f server/webintents/static/cache.manifest
	rm -f tools/chrome/extensions/share-services/twitter/manifest.json
	rm -f tools/chrome/extensions/share-services/blogger/manifest.json
	rm -f tools/chrome/extensions/share-services/linkedin/manifest.json
	rm -f tools/chrome/extensions/share-services/gmail/manifest.json
	rm -f tools/chrome/extensions/share-services/hackernews/manifest.json
	rm -f tools/chrome/extensions/share-services/tumblr/manifest.json
	rm -f tools/chrome/extensions/share-services/digg/manifest.json
	rm -f tools/chrome/extensions/share-services/reddit/manifest.json
	rm -f tools/chrome/extensions/share-services/delicious/manifest.json
	rm -f tools/chrome/extensions/shorten-services/goo.gl/manifest.json
	rm -f tools/chrome/extensions/shorten-services/bit.ly/manifest.json
	rm -f tools/chrome/extensions/save-services/box/manifest.json
	rm -f tools/chrome/extensions/save-services/readitlater/manifest.json
	rm -f tools/chrome/extensions/save-services/instapaper/manifest.json
	

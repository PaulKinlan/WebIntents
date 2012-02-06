RELEASE := $(shell cat ./src/release.js)
DEBU := $(shell cat ./src/debug.js)

all: server/webintents/static/cache.manifest production

release: ./src/webintents.js ./src/json2.js ./src/base64.js
	cat ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(RELEASE)|' > webintents.js
	cp webintents.js server/webintents/static/webintents.js
	cp webintents.js server/webintents/static/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

debug: ./src/webintents.js ./src/debug.js ./src/json2.js ./src/base64.js
	cat ./src/debug.js ./src/webintents.js ./src/json2.js ./src/base64.js | sed 's|// __WEBINTENTS_ROOT|$(DEBUG)|' | sed 's|//DEBUG(|DEBUG(|' > webintents.js
	cp webintents.js server/webintents/static/webintents.js
	cp webintents.js tools/chrome/extensions/share/webintents.js

production: server/webintents/static/cache.manifest release
	uglifyjs webintents.js > server/webintents/static/webintents.min.js

server/webintents/static/webintents.js:

# Manifest depends on changes to other files, so include them in the dependency chain
server/webintents/static/cache.manifest: server/webintents/cache.manifest.src server/webintents/static/list.html server/webintents/static/picker.html server/webintents/static/picker.js server/webintents/static/webintents.js server/webintents/static/intents.html server/webintents/static/json2.js server/webintents/static/webintents-server.js server/webintents/static/controller.js server/webintents/static/base64.js
	cat server/webintents/cache.manifest.src > server/webintents/static/cache.manifest
	echo '#' `date` >> server/webintents/static/cache.manifest

tools: chrome

chrome: extensions apps

apps: all
	./packcrx.sh tools/chrome/apps/hosted/cloudfilepicker tools/chrome/key.pem
	./packcrx.sh tools/chrome/apps/hosted/imagemator tools/chrome/key.pem
	./packcrx.sh tools/chrome/apps/hosted/inspirationmator tools/chrome/key.pem
	./packcrx.sh tools/chrome/apps/hosted/mememator tools/chrome/key.pem
	./packcrx.sh tools/chrome/apps/hosted/quicksnapr tools/chrome/key.pem
	./packcrx.sh tools/chrome/apps/packaged/scrapbook tools/chrome/key.pem

extensions: all
	./packcrx.sh tools/chrome/extensions/share-services/twitter tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/share-services/tumblr tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/share-services/blogger tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/share-services/digg tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/share-services/gmail tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/share-services/delicious tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/share-services/linkedin tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/share-services/reddit tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/share tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/shorten tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/shorten-services/bit.ly tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/shorten-services/goo.gl tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/save-services/instapaper tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/save-services/readitlater tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/save-services/box tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/save tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/desktop tools/chrome/key.pem
	./packcrx.sh tools/chrome/extensions/edit tools/chrome/key.pem

clean:
	rm -f webintents.js
	rm -f server/webintents/static/webintents.js
	rm -f server/webintents/static/webintents.min.js
	rm -f server/webintents/static/webintents.min.gz
	rm -f server/webintents/static/cache.manifest
	rm -f tools/chrome/extensions/share/webintents.js

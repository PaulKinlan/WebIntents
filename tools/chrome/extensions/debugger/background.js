var onPanelCreated = function(panel) {
};

chrome.devtools.panels.create("Intent",
                              "webintents32.png",
                              "panel.html",
                             onPanelCreated);

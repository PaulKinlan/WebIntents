// Copyright 2011 Google Inc. All Rights Reserved.

function pickCallback(step1Div, step2Div, resultDiv, resultImg, data) {
  step1Div.hide();
  step2Div.show();
  var intent = new Intent();
  intent.action = 'http://webintents.org/edit';
  intent.type = 'image/*';
  intent.data = data['data'];
  window.navigator.startActivity(intent, function(data) {
    resultImg.attr('src', data.data);
    step2Div.hide();
    resultDiv.show();
  });
};

function attachPickListener(chooseElement, step1Div, step2Div, resultDiv, resultImg) {
  chooseElement.click(function(e) {
    var intent = new Intent();
    intent.action = 'http://webintents.org/pick';
    intent.type = 'image/*';
    window.navigator.startActivity(intent, function(data) {
      pickCallback(step1Div, step2Div, resultDiv, resultImg, data);
    });
  });
}

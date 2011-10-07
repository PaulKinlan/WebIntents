// Copyright 2011 Google Inc. All Rights Reserved.

function pickCallback(step1Div, step2Div, resultDiv, resultImg, data) {
  step1Div.hide();
  step2Div.show();
  var intent = new Intent(
      'http://webintents.org/save',
      'image/*',
      data['data']);
  window.navigator.startActivity(intent, function(data) {
    resultImg.attr('src', data.data);
    step2Div.hide();
    resultDiv.show();
  });
};

function attachPickListener(chooseElement, step1Div, step2Div, resultDiv, resultImg) {
  chooseElement.click(function(e) {
    var intent = new Intent(
        'http://webintents.org/pick',
        'image/*',
        '1234');
    window.navigator.startActivity(intent, function(data) {
      pickCallback(step1Div, step2Div, resultDiv, resultImg, data);
    });
  });
}

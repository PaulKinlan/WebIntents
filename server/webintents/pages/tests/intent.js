if (navigator.startActivity) {
  if (ix = new Intent('action', 'type', {'attr':'val'})) {
    console.log('Created intent! ' + JSON.stringify(ix));
  }
  console.log('HAVE startActivity');
  console.log('sending ' + JSON.stringify(ix));
  navigator.startActivity(ix);
} else {
  console.log('NO START ACTIVITY');
}

if (navigator.Intents) {
    console.log('have intents');
    console.log('PICK=' + navigator.Intents.PICK);
    console.log('SHARE=' + navigator.Intents.SHARE);
    console.log('VIEW=' + navigator.Intents.VIEW);
    console.log('EDIT=' + navigator.Intents.EDIT);
}

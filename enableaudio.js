$(document).ready(function() {
  if (document.cookie.indexOf("cookie_soundon=") < 0) {
    $('.sound-overlay').removeClass('d-none').addClass('d-block');
  }
  $('.accept-sound').on('click', function() {
    document.cookie = "cookie_soundon=true;";
    $('.sound-overlay').removeClass('d-block').addClass('d-none');
	Tone.start();
	startAnimation();
	});
});

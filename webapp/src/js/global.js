    var set_locale_to = function(locale) {
      if (locale)
        $.i18n().locale = locale;
    };
 
    jQuery(function() {
      $.i18n().load( {
        'en': './src/js/i18n/en.json',
        'de': './src/js/i18n/de.json'
      } ).done(function() {
    	  //$.i18n().locale = 'de';
    	  $('body').i18n();
    	  
    	  var isMobileDevice = !!(/Android|webOS|iPhone|iPad|iPod|BB10|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent || ''));

    	  var ua = window.navigator.userAgent;
    	  var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    	  var webkit = !!ua.match(/WebKit/i);
    	  var iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
    	  
    	  if( !(isMobileDevice && !iOSSafari) ){
    			showDialogMessage( $.i18n('msgtype-error'), $.i18n('error-mobilsafari') ,true );
    		}
//        set_locale_to(url('?locale'));
// 
//        History.Adapter.bind(window, 'statechange', function(){
//          set_locale_to(url('?locale'));
//        });
// 
//        $('.switch-locale').on('click', 'a', function(e) {
//          e.preventDefault();
//          History.pushState(null, null, "?locale=" + $(this).data('locale'));
//        });
      });
    });
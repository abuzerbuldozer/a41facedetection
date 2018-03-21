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
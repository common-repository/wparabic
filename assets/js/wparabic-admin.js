
function translatable_arabic(selectors){
	var selector = selectors;
    var controles = {
        toggleTransliteration : ()=>{}
    };
    this.initialize = function(){
        var element = document.querySelector(selector);
        if(element === null){
            console.warn(`wrong element ${selector} selected`);
            return false;
        }
        var options = {
            sourceLanguage: google.elements.transliteration.LanguageCode.ENGLISH,
            destinationLanguage: [google.elements.transliteration.LanguageCode.ARABIC],
            transliterationEnabled: true,
        };

        // controles variable to access in functions.
        controles =
            new google.elements.transliteration.TransliterationControl(options);
        controles.makeTransliteratable([element]);
    }
    this.changeState = function(){
        controles.toggleTransliteration();
    }

}

var content_ifr = new translatable_arabic("#content_ifr");

if(jQuery("#title").length){
	var title = new translatable_arabic("#title");
	title.initialize();
}

if(jQuery("#content").length){
	var content = new translatable_arabic("#content");
	content.initialize();
}

if(jQuery(".wparabic_save_status").val() == "no"){
	//by default in-active
	content.changeState();
	title.changeState();
} else {
	 jQuery("#content, #title").attr("dir", "rtl");
}


jQuery( document ).on('tinymce-editor-init',function(){
    content_ifr.initialize();
    if(jQuery(".wparabic_save_status").val() == "no"){
	    setTimeout(function(){
		    jQuery("#content_ifr").contents().find("body").attr("dir", "");
			jQuery("#content_ifr").contents().find("body").attr("dir", "ltr");
	    }, 50)

	    jQuery("#content, #title").attr("dir", "");
	    jQuery("#content, #title").attr("dir", "ltr");
	    content_ifr.changeState();
	} else {
		jQuery("#content_ifr").contents().find("body").attr("dir", "rtl");
	}
});



jQuery( document ).on('click', '.media-button-wparabic' ,function(e){
	e.preventDefault();
    content_ifr.changeState();
    content.changeState();
    title.changeState();

    if(jQuery(this).hasClass("active")){
	    jQuery(this).removeClass("active");
	    jQuery("#content, #title").attr("dir", "");
	    jQuery("#content_ifr").contents().find("body").attr("dir", "");
	    jQuery(this).find("strong").text(arabic_text.arabic_enable);
	    jQuery(this).find(".wparabic_save_status").val("no");
    } else {
	    jQuery(this).addClass("active");
	    jQuery("#content, #title").attr("dir", "rtl");
	    jQuery("#content_ifr").contents().find("body").attr("dir", "rtl");
	    jQuery(this).find("strong").text(arabic_text.arabic_disable);
	    jQuery(this).find(".wparabic_save_status").val("yes");
    }
});

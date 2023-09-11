let activeTransition = false;

$(document).on("click", ".roller-toggle", (event) => {
  if (!activeTransition) {
    activeTransition = true;
    const button = event.currentTarget;
    const roller = $(button.closest(".roller"));
    console.log(roller)
    const rollerHeader = roller.find(".roller-header").first();
    const rollerBody = roller.find(".roller-body").first();
    const memory = roller.find(".remember-collapse").first();

    if (rollerHeader.hasClass("show-on-load")) {
      rollerBody.css("max-height", rollerBody.prop("scrollHeight"));
      memory.val("hide");
      
      setTimeout(() => {
        rollerBody.css("max-height", 0);
        rollerHeader.removeClass("show-on-load");
        rollerBody.removeClass("show-on-load");
        activeTransition = false;
      }, 10);
    } else {
      rollerHeader.toggleClass("show");
      rollerBody.toggleClass("show");
      
      if (rollerBody.css("max-height") == "0px") {
        rollerBody.css("max-height", rollerBody.prop("scrollHeight"));
        memory.val("show");
        setTimeout(() => {
          rollerBody.css("max-height", "none");
          activeTransition = false;
        }, 600);
      } else {
        rollerBody.css("max-height", rollerBody.prop("scrollHeight"));
        memory.val("hide");
        setTimeout(() => {
          rollerBody.css("max-height", 0);
          activeTransition = false;
        }, 10);
      }
    }
  }
});

/**
 * Gives drag and drop functionality. Requires JQuery UI.
 */
function initSortable() {
  $("#sectionAnchor").sortable({ handle: ".handle", update: orderSections });
  $(".block-anchor").sortable({ handle: ".handle", update: orderSections });
}
initSortable();
/*
 * Sections
 */
$(document).on("click", ".add", (event) => {
  const button = event.currentTarget;
  const selected = $(button.dataset.cmsTarget);
  output(button.dataset.cmsText);

  // Use epoch time for unique id for Accordion
  let unique = new Date().getTime();

  $(button.dataset.cmsAnchor).prepend($(`#${selected.val()}-template`)
    .html().replace(/qq.*q/g, `qq${unique}q`));

  orderSections();
  $(".toggle").trigger("change");
});

$(document).on("click", ".remove", (event) => {
  const button = event.currentTarget;

  output(`Removed ${button.dataset.cmsText}`);
  button.closest(button.dataset.cmsTarget).remove(0);
  orderSections();
  
});

$(document).on("click", ".block-add", (event) => {
  const button = event.currentTarget;
  const index = button.dataset.cms;
  const indexId = index.replace(/[\[\]]/g, "");
  console.log(index)


  const parent = $(event.currentTarget.closest(".block-controller"));
  const selected = parent.find(".block-select");
  output(selected.val() + "-block-template");

  // Use epoch time for unique id for Accordion
  let unique = new Date().getTime();

  parent.find(".block-anchor").prepend($(`#${selected.val()}-block-template`)
    .html()
    .replace(/qq.*q/g, `qq${unique}q`)
    .replace(/ww0ww/g, index)
    .replace(/zz0zz/g, indexId));

  orderSections();
  $(".toggle").trigger("change");
});



$(document).on("click", ".section-delete", (event) => {
  const button = event.currentTarget;
  const deleteSection = button.dataset.cms;

  if (confirm(`Do you want to delete ${deleteSection} section?\n(You will also need to save draft)`)) {
    output(`deleted ${deleteSection} section`);
    button.closest(".cms-section").remove(0);
    orderSections();
  }
});

function orderSections() {
  $(".cms-section").each((sectionIndex, sectionItem) => {
    $(sectionItem)
      .find("[name*='section']")
      .each((index, item) => {
        let name = $(item)
          .attr("name")
          .replace(/sections\[[^\]]*\]/, `sections[${sectionIndex}]`);

        $(item).attr("name", name);
      });
  });

  $(".block-anchor").each((index, anchor) => {
    $(anchor)
      .find(".cms-block")
      .each((blockIndex, blockItem) => {
        $(blockItem)
          .find("[name]")
          .each((index, item) => {
            console.log(item)
            let name = $(item)
              .attr("name")
              .replace(/content]\[(.*)]\[[0-9]*]/, `content][$1][${blockIndex}]`);

            $(item).attr("name", name);
          });
      });
  });
}

/*
 * Remember Collapse event
 */

$(document).on("show.bs.collapse", (event) => {
  let memory = event.target.querySelector(".remember-collapse");
  if (memory) memory.value = "show";
});

$(document).on("hide.bs.collapse", (event) => {
  let memory = event.target.querySelector(".remember-collapse");
  if (memory) memory.value = "hide";
});

/*
 * Display/Hide on Select
 */
$(document).on("change", ".toggle", selectToggle);
$(".toggle").trigger("change");

function selectToggle(event) {
  const select = event.currentTarget;
  const targets = select.dataset.cmsTargets.split(" ")
  const values = select.dataset.cmsValues.split(" ")

  for (target of targets) {
    if (target.charAt(0) == "!") {
      $(`#${target.slice(1)}`).show();
    } else {
      $(`#${target}`).hide();
    }
  }

  for (let i = 0; i < values.length; i++) {
    if (values[i] == select.value) {
      if (targets[i].charAt(0) == "!") {
        $(`#${targets[i].slice(1)}`).hide();
      } else {
        $(`#${targets[i]}`).show();
      }
    }
  }
}
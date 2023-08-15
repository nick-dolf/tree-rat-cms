/**
 * CRUD
 */

// Create (POST)
$(document).on("click", ".create", (event) => {
  const button = event.currentTarget;
  const form = $(`#${button.dataset.cmsForm}`);
  const postData = form.serialize();

  output(`${button.dataset.cmsText}: ${postData}`);

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  $.post(`${button.dataset.cmsUrl}`, postData)
    .done((response) => {
      output("Success");
      $(`#${button.dataset.cmsAnchor}`).html(response);
    })
    .fail((response) => {
      output("Fail: " + response.responseText, true);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
    });
});

// Update (PUT)
$(document).on("click", ".update", (event) => {
  const button = event.currentTarget;
  const putData = new FormData(document.getElementById(`${button.dataset.cmsForm}`));

  output(`${button.dataset.cmsText}`);

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  $.ajax({
    url: "",
    type: "PUT",
    data: putData,
    enctype: "multipart/form-data",
    processData: false,
    contentType: false,
  })
    .done((response) => {
      output("Success");
      $(`#${button.dataset.cmsAnchor}`).html(response);
      $(".toggle").trigger("change");
      initSortable();
      reloadPreview();
    })
    .fail((response) => {
      output("Failed to save draft", true);
      console.log("update fail", response.responseText);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
    });
});

// Delete (DELETE)
$(document).on("click", ".delete", (event) => {
  const button = event.currentTarget;
  const deleteTarget = button.dataset.cms;

  if (confirm(`Do you really want to delete ${deleteTarget}?`)) {
    output(`sending delete request to server: ${deleteTarget}`);
    button.querySelector(".spinner-border").classList.remove("d-none");
    button.disabled = true;

    $.ajax({ url: `${button.dataset.cmsUrl}/${deleteTarget}`, type: "DELETE" })
      .done((response) => {
        output("delete request was successful");
        $(`#${button.dataset.cmsAnchor}`).html(response);
      })
      .fail((response) => {
        output("delete request failed: " + response.responseText, true);
      })
      .always(() => {
        button.querySelector(".spinner-border").classList.add("d-none");
        button.disabled = false;
      });
  }
});
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
  console.log(index)


  const parent = $(event.currentTarget.closest(".block-controller"));
  const selected = parent.find(".block-select");
  output(selected.val() + "-block-template");

  // Use epoch time for unique id for Accordion
  let unique = new Date().getTime();

  parent.find(".block-anchor").prepend($(`#${selected.val()}-block-template`)
    .html()
    .replace(/qq.*q/g, `qq${unique}q`)
    .replace(/ww0ww/g, index));

  orderSections();
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
/*
/ Image Input Preview
*/
$("#image-input").on("change", (event) => {
  const images = event.target.files;
  let gallery = $("#input-gallery");
  gallery.html("");

  if (images) {
    for (var i = 0; i < images.length; i++) {
      let reader = new FileReader();
      reader.onload = (event) => {
        let image = $("<img class=m-2 height=100/>").attr("src", event.target.result);
        gallery.append(image);
      };

      reader.readAsDataURL(images[i]);
    }
  }
});

/*
/ Image API
*/

// Image Submit (POST)
$("#image-submit").click((event) => {
  output("Uploading image(s)");
  const button = event.currentTarget;

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  const formData = new FormData(document.getElementById("image-form"));

  $.ajax({
    url: "",
    type: "POST",
    data: formData,
    enctype: "multipart/form-data",
    processData: false,
    contentType: false,
  })
    .done((response) => {
      output("Images Uploaded");
      console.log("update success", response);
      $("#image-gallery-anchor").prepend(response);
      initSortable();
    })
    .fail((response) => {
      output("Failed to upload images", true);
      console.log("update fail", response.responseText);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
      $("#input-gallery").html("");
      $("#image-form").trigger("reset");
    });
});

// Update Alt Text(PUT)
$(document).on("click", ".image-alt-update", (event) => {
  const button = event.currentTarget;
  const updateImage = button.dataset.cms;
  console.log(button.dataset.cmsForm)
  const putData = new FormData(document.getElementById(`${button.dataset.cmsForm}`));

  output(`Updating alt text for ${updateImage}`);

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  $.ajax({
    url: `images/${updateImage}`,
    type: "PUT",
    data: putData,
    enctype: "multipart/form-data",
    processData: false,
    contentType: false,
  })
    .done((response) => {
      output("Updated alt text");
    })
    .fail((response) => {
      output("Failed to update alt text", true);
      console.log("update fail", response.responseText);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
    });
});


// Image Delete (DELETE)
$(document).on("click", ".image-delete", (event) => {
  const button = event.currentTarget;
  console.log(button.lastChild);
  const deleteImage = button.dataset.cms;
  if (confirm(`Do you really want to delete ${deleteImage}?`)) {
    output(`sending delete request to server: ${deleteImage}`);

    button.querySelector(".spinner-border").classList.remove("d-none");
    button.disabled = true;

    $.ajax({ url: `images/${deleteImage}`, type: "DELETE" })
      .done((response) => {
        output("delete request was successful");
        console.log("delete success", response);
        button.closest(".image-card").remove();
      })
      .fail((response) => {
        output("delete request failed: " + response.responseText, true);
        console.log("delete failed:", response.responseText);
      })
      .always(() => {
        button.querySelector(".spinner-border").classList.add("d-none");
        button.disabled = false;
      });
  }
});

/*
/ Image Select
*/
let activeImage;

$(document).on("click", ".image-set-active", (event) => {
  activeImage = event.currentTarget;
});

$(".image-change").click((event) => {
  const button = event.currentTarget;

  $(activeImage).children("input").attr("value", button.dataset.cmsImage);
  $(activeImage)
    .children("img")
    .attr("src", button.dataset.cmsFolder + "thumb/" + button.dataset.cmsImage);
  $(activeImage).closest("div").find("textarea[name*=alt]").val(button.dataset.cmsText)
});

/**
 * Change folder selected
 */
$(document).on("show.bs.modal", "#addPageModal", (event) => {
  const button = event.relatedTarget;
  const folder = button.getAttribute("data-cms");
  $('#addPageModalFolderSelect').val(folder);
});

/**
 * Change Image Edit
 */
$(document).on("show.bs.modal", "#imageEditModal", (event) => {
  const button = event.relatedTarget;
  const image = button.getAttribute("data-cms");
  $('#imageEdit').attr("src", image);
});
/**
 * 
 * @param {String} message - Text to display on output  
 * @param {Boolean} fail - Displays red text if true
 */
function output(message, fail) {
  const now = new Date();

  if (fail) {
    $("#output").prepend(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} - 
    <span class="text-danger">${message}</span><br>`);
  } else {
    $("#output").prepend(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} - 
    ${message}<br>`);
  }
  $("#output").animate({ scrollTop: 0 }, "fast");
}

function reloadPreview() {
  $("#previewFrame")[0].contentWindow.location.reload(true);
}

$("#previewFrame").on("load", () => {
  let iframe = document.getElementById("previewFrame");

  const contentHeight = iframe.contentWindow.document.body.scrollHeight;
  iframe.height = contentHeight;

  const previewSize = $("input[name='previewSize']:checked").val();
  console.log(previewSize);

  if (previewSize == "mobile") {
    $("#thumbnailContainer").height(contentHeight * 0.4);
  } else if (previewSize == "tablet") {
    $("#thumbnailContainer").height(contentHeight * 0.25);
  } else {
    $("#thumbnailContainer").height(contentHeight * 0.125);
  }
});

$("input[name='previewSize']").on("change", function () {
  const previewSize = $(this).val();
  let iframe = document.getElementById("previewFrame");

  if (previewSize == "mobile") {
    $("#thumbnailContainer").attr("class", "mobile");
  } else if (previewSize == "tablet") {
    $("#thumbnailContainer").attr("class", "tablet");
  } else {
    $("#thumbnailContainer").attr("class", "desktop");
  }

  reloadPreview();
});

/**
 * Gives drag and drop functionality. Requires JQuery UI.
 */
function initSortable() {
  $("#sectionAnchor").sortable({ handle: ".handle", update: orderSections });
  $(".block-anchor").sortable({ handle: ".handle", update: orderSections });
}
initSortable();

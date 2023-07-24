/*
/ Output 
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

/*
 * Confirm Modal
 */
$("#confirmModal").on("show.bs.modal", (event) => {
  const button = event.relatedTarget;
  const text = button.getAttribute("data-cms-text");
  console.log($(this));
});

/*
 * Folders
 */

// Folder CREATE (POST)
$(document).on("click", "#folder-create", (event) => {
  const postData = $("#addFolder").serialize();

  const button = document.getElementById("folder-add");

  output(`Creating Folder: ${postData}`);

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  $.post("page-folders", postData)
    .done((response) => {
      output("Folder Created");
      console.log(response);
      $("#accordionPageAnchor").html(response);
    })
    .fail((response) => {
      output("Folder creation failed: " + response.responseText, true);
      console.log("fail", response.responseText);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
      $(".btn-close").click();
    });
});

// Folder DELETE (DELETE)
$(document).on("click", ".folder-delete", (event) => {
  const button = event.target;
  const deleteFolder = button.dataset.cms;
  if (confirm(`Do you really want to delete ${deleteFolder}?`)) {
    output(`sending delete request to server: ${deleteFolder}`);
    button.disabled = true;

    $.ajax({ url: `page-folders/${deleteFolder}`, type: "DELETE" })
      .done((response) => {
        output("delete request was successful");
        console.log("delete success", response);
        $("#accordionPageAnchor").html(response);
      })
      .fail((response) => {
        output("delete request failed: " + response.responseText, true);
        console.log("delete failed:", response.responseText);
      })
      .always(() => {
        button.disabled = false;
      });
  }
});

/*
 * Pages
 */

// Pages CREATE (POST)
$(document).on("click", "#page-create", (event) => {
  const postData = $("#addPage").serialize();

  const button = document.getElementById("page-add");

  output(`Creating Page: ${postData}`);

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  $.post("pages", postData)
    .done((response) => {
      output("Page Created");
      console.log(response);
      $("#accordionPageAnchor").html(response);
    })
    .fail((response) => {
      output("Page creation failed: " + response.responseText, true);
      console.log("fail", response.responseText);
    })
    .always(() => {
      button.querySelector(".spinner-border").classList.add("d-none");
      button.disabled = false;
      $(".btn-close").click();
    });
});

// Pages UPDATE (PUT)
$(".page-save-draft").click((event) => {
  const button = event.currentTarget;

  button.querySelector(".spinner-border").classList.remove("d-none");
  button.disabled = true;

  const formData = new FormData(document.getElementById("pageForm"));

  $.ajax({
    url: "",
    type: "PUT",
    data: formData,
    enctype: "multipart/form-data",
    processData: false,
    contentType: false,
  })
    .done((response) => {
      output("Draft Saved");
      $("#pageFormAnchor").html(response);
      $(".toggle").trigger("change");
      initSortable();
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

// Page DELETE (DELETE)
$(document).on("click", ".page-delete", (event) => {
  const button = event.target;
  const deletePage = button.dataset.cms;
  if (confirm(`Do you really want to delete ${deletePage}?`)) {
    output(`sending delete request to server: ${deletePage}`);
    button.disabled = true;

    $.ajax({ url: `pages/${deletePage}`, type: "DELETE" })
      .done((response) => {
        output("delete request was successful");
        console.log("delete success", response);
        $("#accordionPageAnchor").html(response);
      })
      .fail((response) => {
        output("delete request failed: " + response.responseText, true);
        console.log("delete failed:", response.responseText);
      })
      .always(() => {
        button.disabled = false;
      });
  }
});

/*
/ Initialize Sortable 
*/
function initSortable() {
  $("#sortable").sortable({ handle: ".handle", update: orderSections });
  $(".block-anchor").sortable({ handle: ".block-handle", update: orderSections });
}
initSortable();

/*
 * Sections
 */

$(document).on("click", ".section-add", (event) => {
  const selected = $("#select-template :selected");
  output(selected.val());

  // Use epoch time for unique id for Accordion
  let unique = new Date().getTime();

  $("#sortable").prepend($(`#${selected.val()}-template`).html().replace(/qq.*q/g, `qq${unique}q`));

  orderSections();
});

$(document).on("click", ".block-add", (event) => {
  const parent = $(event.currentTarget.closest(".block-controller"));
  const selected = parent.find(".block-select");
  output(selected.val() + "-block-template");

  // Use epoch time for unique id for Accordion
  let unique = new Date().getTime();

  parent.find(".block-anchor").prepend($(`#${selected.val()}-block-template`).html().replace(/qq.*q/g, `qq${unique}q`));

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
  console.log(activeImage);
});

$(".image-change").click((event) => {
  const button = event.currentTarget;

  $(activeImage).children("input").attr("value", button.dataset.cmsImage);
  $(activeImage)
    .children("img")
    .attr("src", button.dataset.cmsFolder + "thumb/" + button.dataset.cmsImage);
});

/*
 * Display/Hide on Select
 */
$(document).on("change", ".toggle", selectToggle);
$(".toggle").trigger("change");

function selectToggle(event) {
  const select = event.currentTarget;
  if (select.dataset.cmsValue == select.value) {
    $(`#${select.dataset.cmsTarget}`).show();
  } else {
    $(`#${select.dataset.cmsTarget}`).hide();
  }
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

/**
 * GlobalCRUD
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

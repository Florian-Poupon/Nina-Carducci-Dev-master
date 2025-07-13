// Plugin jQuery pour créer une galerie d'images responsive avec lightbox et filtres par tags
(function ($) {
  // Déclaration de la fonction principale mauGallery
  $.fn.mauGallery = function (options) {
    // Fusionne les options par défaut avec celles passées en paramètre
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = []; // Stocke les tags uniques trouvés dans la galerie
    return this.each(function () {
      // Crée le wrapper de ligne pour les items de la galerie
      $.fn.mauGallery.methods.createRowWrapper($(this));
      // Si l'option lightBox est activée, crée la modale lightbox
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox($(this), options.lightboxId, options.navigation);
      }
      // Ajoute les écouteurs d'événements
      $.fn.mauGallery.listeners(options);

      // Pour chaque item de la galerie
      $(this)
        .children(".gallery-item")
        .each(function (index) {
          // Rend l'image responsive
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          // Déplace l'item dans le wrapper de ligne
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          // Place l'item dans une colonne responsive
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          // Récupère le tag de l'item
          var theTag = $(this).data("gallery-tag");
          // Ajoute le tag à la collection s'il est unique
          if (options.showTags && theTag !== undefined && tagsCollection.indexOf(theTag) === -1) {
            tagsCollection.push(theTag);
          }
        });

      // Affiche les tags si l'option est activée
      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags($(this), options.tagsPosition, tagsCollection);
      }

      // Affiche la galerie avec un effet fondu
      $(this).fadeIn(500);
    });
  };
  // Options par défaut du plugin
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };
  // Déclaration des écouteurs d'événements
  $.fn.mauGallery.listeners = function (options) {
    // Clic sur une image de la galerie pour ouvrir la lightbox
    $(".gallery-item").on("click", function () {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // Clic sur un tag pour filtrer les images
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    // Navigation précédente dans la lightbox
    $(".gallery").on("click", ".mg-prev", () => $.fn.mauGallery.methods.prevImage(options.lightboxId));
    // Navigation suivante dans la lightbox
    $(".gallery").on("click", ".mg-next", () => $.fn.mauGallery.methods.nextImage(options.lightboxId));
  };
  // Méthodes utilitaires du plugin
  $.fn.mauGallery.methods = {
    // Crée le wrapper de ligne pour les items
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    // Place un item dans une colonne responsive selon les options
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(`<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`);
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    },
    // Déplace l'item dans le wrapper de ligne
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    // Rend l'image responsive avec Bootstrap
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    // Ouvre la lightbox avec l'image cliquée
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`).find(".lightboxImage").attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    // Affiche l'image précédente dans la lightbox
    prevImage() {
      let activeImage = null;
      // Recherche l'image actuellement affichée
      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      // Récupère la collection d'images selon le tag actif
      if (activeTag === "all") {
        $(".item-column").each(function () {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function () {
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0;
      // Trouve l'index de l'image active
      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
      // Correction : passer à l'image précédente, ou revenir à la dernière
      let prevIndex = (index - 1 + imagesCollection.length) % imagesCollection.length;
      $(".lightboxImage").attr("src", $(imagesCollection[prevIndex]).attr("src"));
    },
    // Affiche l'image suivante dans la lightbox
    nextImage() {
      let activeImage = null;
      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function () {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function () {
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0;
      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
      // Correction : passer à l'image suivante, ou revenir à la première
      let nextIndex = (index + 1) % imagesCollection.length;
      $(".lightboxImage").attr("src", $(imagesCollection[nextIndex]).attr("src"));
    },
    // Crée la modale lightbox pour afficher les images en grand
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : '<span style="display:none;" />'}
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>' : '<span style="display:none;" />'}
                        </div>
                    </div>
                </div>
            </div>`);
    },
    // Affiche la barre de tags pour filtrer les images
    showItemTags(gallery, position, tags) {
      var tagItems = '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function (index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    // Filtre les images selon le tag sélectionné
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag active");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function () {
        $(this).parents(".item-column").hide();
        if (tag === "all") {
          $(this).parents(".item-column").show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this).parents(".item-column").show(300);
        }
      });
    },
  };
})(jQuery);

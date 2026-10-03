// ===== Peptara Labs — site script =====
// Número de WhatsApp principal del negocio (+1 323 329-7436) en formato internacional sin espacios/símbolos
const WHATSAPP_NUMBER = "13233297436";
// Número de WhatsApp secundario, usado en las tarjetas de distribución México/EE. UU. (521 313 109 5135)
const WHATSAPP_DISTRIBUTION_NUMBER = "5213131095135";

function buildWaLink(message, number = WHATSAPP_NUMBER) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}

// Mensaje base por defecto si algún botón .wa-trigger no trae data-wa-msg
const DEFAULT_WA_MSG = "Vengo de la página de Peptara Labs y quiero más información.";

// Productos para el marquee de la sección "Productos"
const PRODUCTS = [
  { name: "Tirzepatide", img: "assets/products/tirzepatide.jpg" },
  { name: "Retatrutide", img: "assets/products/retatrutide.jpg" },
  { name: "Cagrilintide", img: "assets/products/cagrilintide.jpg" },
  { name: "Cagrilintide + Semaglutide", img: "assets/products/cagrilintide-semaglutide.jpg" },
  { name: "BPC-157", img: "assets/products/bpc-157.jpg" },
  { name: "TB-500", img: "assets/products/tb-500.jpg" },
  { name: "GHK-Cu", img: "assets/products/ghk-cu.jpg" },
  { name: "Glutatión", img: "assets/products/glutation.jpg" },
  { name: "Ipamorelin", img: "assets/products/ipamorelin.jpg" },
  { name: "CJC-1295", img: "assets/products/cjc-1295.jpg" },
  { name: "Melanotan II", img: "assets/products/melanotan-ii.jpg" },
  { name: "Selank", img: "assets/products/selank.jpg" },
];

function buildProductsMarquee() {
  const mask = document.getElementById("productsMarquee");
  if (!mask) return;

  const fade = document.createElement("div");
  fade.className = "products-marquee-fade";

  const track = document.createElement("div");
  track.className = "products-marquee-track";

  // Se duplica la lista para que el loop sea continuo y sin cortes
  const allProducts = [...PRODUCTS, ...PRODUCTS];

  allProducts.forEach((product) => {
    const wrap = document.createElement("div");
    wrap.className = "product-marquee-wrap";

    const card = document.createElement("div");
    card.className = "product-marquee-card";

    const img = document.createElement("img");
    img.src = product.img;
    img.alt = `${product.name} - Peptara Labs`;
    img.loading = "lazy";
    card.appendChild(img);

    const cta = document.createElement("a");
    cta.href = "#";
    cta.className = "btn btn-outline btn-block wa-trigger";
    cta.dataset.waMsg = "Me gustaría conocer los precios y el catálogo de Peptara Labs.";
    cta.textContent = "Consultar disponibilidad";
    card.appendChild(cta);

    wrap.appendChild(card);
    track.appendChild(wrap);
  });

  fade.appendChild(track);
  mask.appendChild(fade);
}

// Video de fondo (HLS/Mux) de la sección Productos
function initProductsBgVideo() {
  const video = document.querySelector(".products-bg-video");
  if (!video) return;
  const src = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260815_040604_c609907a-7447-45a8-b636-0cfb102d9617.mp4";

  // Refuerza mute/inline vía JS: algunos navegadores móviles (iOS/Android)
  // ignoran el autoplay si estos flags no están también como propiedades del elemento.
  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute("muted", "");
  video.playsInline = true;

  const tryPlay = () => {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Autoplay bloqueado (algunos navegadores móviles): reintenta al primer toque.
        const resume = () => {
          video.play().catch(() => {});
          document.removeEventListener("touchstart", resume);
          document.removeEventListener("click", resume);
        };
        document.addEventListener("touchstart", resume, { once: true, passive: true });
        document.addEventListener("click", resume, { once: true });
      });
    }
  };

  video.src = src;
  video.addEventListener("loadedmetadata", tryPlay, { once: true });
}

// Lightbox de certificados de análisis (sección "Certificados")
function initCoaLightbox() {
  const lightbox = document.getElementById("coaLightbox");
  const lightboxImg = document.getElementById("coaLightboxImg");
  const lightboxCaption = document.getElementById("coaLightboxCaption");
  const closeBtn = document.getElementById("coaLightboxClose");
  if (!lightbox || !lightboxImg || !closeBtn) return;

  const openLightbox = (card) => {
    const img = card.dataset.img;
    const name = card.dataset.name || "";
    const batch = card.dataset.batch ? ` · Lote ${card.dataset.batch}` : "";
    if (!img) return;
    lightboxImg.src = img;
    lightboxImg.alt = `Certificado de análisis ${name}`;
    lightboxCaption.textContent = `${name}${batch}`;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  };

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
  };

  document.querySelectorAll(".coa-card").forEach((card) => {
    card.addEventListener("click", () => openLightbox(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(card);
      }
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
  });
}

// Modal que pide el nombre antes de abrir WhatsApp, para todos los botones .wa-trigger
function initWaModal() {
  const modal = document.getElementById("waModal");
  const form = document.getElementById("waModalForm");
  const input = document.getElementById("waModalName");
  const closeBtn = document.getElementById("waModalClose");
  if (!modal || !form || !input || !closeBtn) return;

  let pending = null; // { msg, number, lang }

  const openModal = (trigger) => {
    pending = {
      msg: trigger.dataset.waMsg || DEFAULT_WA_MSG,
      number: trigger.dataset.waNumber || WHATSAPP_NUMBER,
      lang: trigger.dataset.waLang === "en" ? "en" : "es",
    };
    input.value = "";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => input.focus(), 50);
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    pending = null;
  };

  document.querySelectorAll(".wa-trigger").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(el);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!pending) return;
    const name = input.value.trim();
    if (!name) {
      input.focus();
      return;
    }
    const finalMessage =
      pending.lang === "en"
        ? `Hello, my name is ${name}. ${pending.msg}`
        : `Hola, mi nombre es ${name}. ${pending.msg}`;
    window.open(buildWaLink(finalMessage, pending.number), "_blank", "noopener");
    closeModal();
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Botones "Contactar México" / "Contactar EE. UU." y los números visibles de cada tarjeta
  // usan el número de WhatsApp secundario (+52 1 313 109 5135). El mensaje final (con nombre)
  // lo arma el modal de WhatsApp (ver initWaModal) a partir de data-wa-msg / data-wa-lang.
  document.querySelectorAll(".wa-country, .wa-country-number, #waUSBtn").forEach((el) => {
    el.dataset.waNumber = WHATSAPP_DISTRIBUTION_NUMBER;
  });

  // Construye el marquee 3D de productos con sus botones de WhatsApp
  buildProductsMarquee();

  // Modal que pide el nombre antes de abrir WhatsApp (aplica a todos los botones .wa-trigger)
  initWaModal();

  // Inicia el video de fondo de la sección Productos
  initProductsBgVideo();

  // Lightbox de certificados de análisis (COA)
  initCoaLightbox();

  // Menú móvil
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
    mainNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => mainNav.classList.remove("open"))
    );
  }

  // Año dinámico en footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Formulario -> arma el mensaje y abre WhatsApp con el texto tal cual se llenó
  const form = document.getElementById("peptaraForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = form.nombre.value.trim();
      const tipo = form.tipo.value.trim();
      const whatsapp = form.whatsapp.value.trim();
      const correo = form.correo.value.trim();
      const mensaje = form.mensaje.value.trim();

      if (!nombre || !tipo || !whatsapp || !correo || !mensaje) {
        return; // el required del navegador ya se encarga de avisar
      }

      const texto =
        `Hola, mi nombre es ${nombre}.\n` +
        `Tipo de consulta: ${tipo}\n` +
        `Mi WhatsApp: ${whatsapp}\n` +
        `Mi correo: ${correo}\n` +
        `Mensaje: ${mensaje}`;

      window.open(buildWaLink(texto), "_blank", "noopener");
    });
  }
});

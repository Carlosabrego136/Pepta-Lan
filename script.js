// ===== Peptara Labs — site script =====
// Número de WhatsApp del negocio (521 313 109 5135) en formato internacional sin espacios/símbolos
const WHATSAPP_NUMBER = "5213131095135";

function buildWaLink(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

// Mensaje genérico para los botones "Cotizar por WhatsApp" / flotante / "Escríbenos"
const GENERIC_MSG = "Hola, vengo de la página de Peptara Labs y quiero más información.";

document.addEventListener("DOMContentLoaded", () => {
  // Botones genéricos de WhatsApp
  const genericLink = buildWaLink(GENERIC_MSG);
  ["waHeaderBtn", "waContactBtn", "waFloat"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = genericLink;
  });

  // Botón "Ver catálogo completo por WhatsApp"
  const CATALOG_MSG = "Hola, quiero conocer el catálogo completo de péptidos de Peptara Labs.";
  const waProductsMoreBtn = document.getElementById("waProductsMoreBtn");
  if (waProductsMoreBtn) waProductsMoreBtn.href = buildWaLink(CATALOG_MSG);

  // Botones "Contactar México" / "Contactar EE. UU."
  document.querySelectorAll(".wa-country").forEach((el) => {
    el.href = buildWaLink(el.dataset.msg || GENERIC_MSG);
  });

  // Botones "Consultar disponibilidad" de cada producto
  document.querySelectorAll(".wa-product").forEach((el) => {
    el.href = buildWaLink(el.dataset.msg || GENERIC_MSG);
  });

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

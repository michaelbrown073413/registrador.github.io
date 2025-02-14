const productos = [
  { nombre: "Hamburguesa de Ternera", precio: 15.0 },
  { nombre: "Hamburguesa XXL", precio: 15.0 },
  { nombre: "Perrito Caliente", precio: 15.0 },
  { nombre: "Dobut de Fresa", precio: 15.0 },
  { nombre: "Helado de Fresa", precio: 15.0 },
  { nombre: "Batido de Fresa", precio: 15.0 },
  { nombre: "Refresco de Limón", precio: 15.0 },
  { nombre: "Gaseosa", precio: 15.0 }
];

let carrito = [];
let total = 0;

const productosPanel = document.getElementById("productosPanel");
const seleccionadosPanel = document.getElementById("seleccionadosPanel");
const totalDisplay = document.getElementById("total");
const enviarVentaBtn = document.getElementById("enviarVenta");
const descuentoInput = document.getElementById("descuento");
const nombreVendedorSpan = document.getElementById("nombreVendedor");

// URL del webhook actualizada
const webhookURL =
  "https://discord.com/api/webhooks/1333608572520501308/1wogMXxCjLbsjN_xCho6zuk2ae-Fax4epxIi3UedGNWC-wFswRfxMB1QOhzdZ_vHyNEN";

// Configurar nombre del vendedor
if (localStorage.getItem("nombreVendedor")) {
  nombreVendedorSpan.textContent = localStorage.getItem("nombreVendedor");
} else {
  localStorage.setItem("nombreVendedor", "Sin Nombre");
}

document.getElementById("cambiarNombre").addEventListener("click", () => {
  const nuevoNombre = prompt("Introduce tu nombre:");
  if (nuevoNombre) {
    localStorage.setItem("nombreVendedor", nuevoNombre);
    nombreVendedorSpan.textContent = nuevoNombre;
  }
});

// Generar botones dinámicamente
productos.forEach((producto) => {
  const btn = document.createElement("button");
  btn.textContent = `${producto.nombre} - $${producto.precio}`;
  btn.classList.add("producto-btn");
  btn.addEventListener("click", () => agregarAlCarrito(producto));
  productosPanel.appendChild(btn);
});

// Agregar producto al carrito
function agregarAlCarrito(producto) {
  const existe = carrito.find((item) => item.nombre === producto.nombre);
  if (existe) {
    existe.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarrito();
}

// Actualizar carrito
function actualizarCarrito() {
  seleccionadosPanel.innerHTML = "";
  if (carrito.length === 0) {
    seleccionadosPanel.innerHTML = "<p>Tu carrito está vacío</p>";
  } else {
    carrito.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("producto-carrito");
      div.innerHTML = `
        <span>${item.nombre}</span>
        <input type="number" value="${item.cantidad}" min="1" onchange="editarCantidad('${item.nombre}', this.value)">
        <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
        <button class="eliminar-btn" onclick="eliminarDelCarrito('${item.nombre}')">Eliminar</button>
      `;
      seleccionadosPanel.appendChild(div);
    });
  }
  calcularTotal();
}

// Editar cantidad
function editarCantidad(nombre, nuevaCantidad) {
  const producto = carrito.find((item) => item.nombre === nombre);
  if (producto) {
    producto.cantidad = parseInt(nuevaCantidad) || 1;
    actualizarCarrito();
  }
}

// Eliminar producto del carrito
function eliminarDelCarrito(nombre) {
  carrito = carrito.filter((item) => item.nombre !== nombre);
  actualizarCarrito();
}

// Calcular total
function calcularTotal() {
  total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const descuento = parseInt(descuentoInput.value) || 0;
  const totalConDescuento = total - (total * descuento) / 100;
  totalDisplay.textContent = `Total: $${totalConDescuento.toFixed(2)}`;
}

// Enviar venta
enviarVentaBtn.addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }
  const vendedor = localStorage.getItem("nombreVendedor");
  const descuento = parseInt(descuentoInput.value) || 0;
  const totalConDescuento = total - (total * descuento) / 100;

  const mensaje = {
    content: null,
    embeds: [
      {
        title: "Registro de Ventas",
        color: 16753920,
        fields: [
          { name: "Vendedor", value: vendedor, inline: true },
          ...carrito.map((item) => ({
            name: item.nombre,
            value: `Cantidad: ${item.cantidad}, Total: $${(item.precio * item.cantidad).toFixed(2)}`,
            inline: false,
          })),
          { name: "Total con Descuento", value: `$${totalConDescuento.toFixed(2)} (${descuento}%)`, inline: true },
        ],
        footer: { text: "WigWam - Sistema de Registro" },
        timestamp: new Date(),
      },
    ],
  };

  fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mensaje),
  })
    .then((response) => {
      if (response.ok) {
        alert("Venta enviada con éxito.");
        carrito = [];
        actualizarCarrito();
      } else {
        response.text().then((text) => {
          console.error("Respuesta del servidor:", text);
          alert(`Error al enviar la venta. Código: ${response.status}. Mensaje: ${text}`);
        });
      }
    })
    .catch((error) => {
      console.error("Error de red:", error);
      alert("Hubo un problema al enviar la venta. Revisa tu conexión o el webhook.");
    });
});

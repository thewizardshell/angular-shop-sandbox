# Conceptos Fundamentales

```ts
// 1. SIGNAL BÁSICO (writable)
const basicSignal = signal({ name: "Juan", age: 25 });
// Se puede modificar:
// basicSignal.set({ name: 'María', age: 30 })

// 2. COMPUTED SIGNAL (readonly)
const displayName = computed(() => `Hola, ${basicSignal().name}`);
// NO se puede modificar directamente, se recalcula automáticamente
```

---

# Código Ejemplo

```ts
// Signal privado que contiene TODO el estado
private state = signal<ProductState>({
  data: [],       // Los productos
  loading: false, // Si está cargando
  error: null     // Mensaje de error
});
```

---

## 🔍 Línea 1: Extraer solo los productos

```ts
readonly products = computed(() => this.state().data);
```

- Lee el estado completo.
- Extrae **solo** la propiedad `.data`.
- Retorna un array de productos.
- Se actualiza automáticamente cuando cambia el estado.

**¿Por qué usar `computed` y no `signal`?**

- Es **readonly** (no modificable desde afuera).
- Se recalcula solo cuando `state.data` cambia.
- Más eficiente que re-renderizar todo.

---

## 🔍 Línea 2: Extraer estado de `loading`

```ts
readonly loading = computed(() => this.state().loading);
```

- Extrae solo el booleano `loading` del estado.
- El template puede usar `loading()` para mostrar spinners.
- Se actualiza cuando cambia el estado de carga.

---

## 🔍 Línea 3: Extraer errores

```ts
readonly error = computed(() => this.state().error);
```

- Extrae el mensaje de error (`string | null`).
- `null` significa que no hay error.
- El template puede mostrar u ocultar mensajes de error.

---

## 🔍 Línea 4: Calcular si hay productos (DERIVADO)

```ts
readonly hasProducts = computed(() => this.products().length > 0);
```

- Usa otro `computed` (`this.products()`).
- Calcula si hay al menos un producto.
- Retorna `true` o `false`.
- Se recalcula cuando `products()` cambia.

**¡Doble reactividad!**

`state` → `products` → `hasProducts`

---

## 🔍 Línea 5: Contar productos (DERIVADO)

```ts
readonly productsCount = computed(() => this.products().length);
```

- Cuenta cuántos productos hay.
- También usa `this.products()`.
- Se actualiza automáticamente.
- Útil para mostrar mensajes tipo: _Mostrando 10 productos_.

---

# Ejemplo Visual del Flujo

```ts
class ExampleService {
  // 1️⃣ Estado central (1 signal que controla todo)
  private state = signal({
    data: [],
    loading: false,
    error: null,
  });

  // 2️⃣ Computed signals (derivados del estado)
  readonly products = computed(() => {
    console.log("🔄 Recalculando products...");
    return this.state().data;
  });

  readonly loading = computed(() => {
    console.log("🔄 Recalculando loading...");
    return this.state().loading;
  });

  readonly hasProducts = computed(() => {
    console.log("🔄 Recalculando hasProducts...");
    return this.products().length > 0; // ¡Depende de products!
  });

  // 3️⃣ Cuando cambias el estado
  async loadProducts() {
    // Esto dispara todos los computed que dependen de state
    this.state.set({
      data: [],
      loading: true, // ← loading() se recalcula
      error: null,
    });

    try {
      const data = await fetch("/api/products").then((r) => r.json());

      // Esto dispara más recálculos
      this.state.set({
        data: data, // ← products() se recalcula
        loading: false, // ← loading() se recalcula
        error: null,
      });
      // hasProducts() también se recalcula porque depende de products()
    } catch (err) {
      this.state.set({
        data: [],
        loading: false,
        error: "Error!", // ← error() se recalcula
      });
    }
  }
}
```

---

# Comparación: Antes vs Ahora

| Antes (Angular clásico)                              | Ahora (Con signals)                                            |                                                   |
| ---------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| `BehaviorSubject<Product[]>` para productos          | `signal` privado que controla todo el estado                   |                                                   |
| `BehaviorSubject<boolean>` para loading              | `computed` para exponer solo lectura                           |                                                   |
| \`BehaviorSubject\<string                            | null>\` para errores                                           | Sin suscripciones, solo uso directo de `computed` |
| Se necesitan múltiples subscripciones (`async` pipe) | Acceso directo a valores: `products()`, `loading()`, `error()` |                                                   |

---

# Ventajas de este patrón

- ✅ **Rendimiento**
  Solo se recalcula lo que realmente cambió. Angular actualiza el DOM exactamente donde debe.

- ✅ **Encapsulamiento**
  El estado es privado y los `computed` son readonly, evitando modificaciones externas.

- ✅ **Composabilidad**
  Puedes derivar valores (como `hasProducts`) que dependen de otros `computed`.

- ✅ **Simplicidad**
  No más subscribe/unsubscribe ni async pipes. Menos código y más expresivo.

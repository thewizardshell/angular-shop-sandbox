// =====================================
// CONCEPTOS FUNDAMENTALES
// =====================================

// 1. SIGNAL BÁSICO (writable)
const basicSignal = signal({ name: 'Juan', age: 25 });
// Se puede modificar: basicSignal.set({ name: 'María', age: 30 })

// 2. COMPUTED SIGNAL (readonly)
const displayName = computed(() => `Hola, ${basicSignal().name}`);
// NO se puede modificar directamente, se recalcula automáticamente

// =====================================
// CÓDIGO
// =====================================

// Signal privado que contiene TODO el estado
private state = signal<ProductState>({
data: [], // Los productos
loading: false, // Si está cargando
error: null // Mensaje de error
});

// 🔍 LÍNEA 1: Extraer solo los productos
readonly products = computed(() => this.state().data);
/\*
¿Qué hace?

- Lee el state completo
- Extrae SOLO la propiedad .data
- Retorna un array de productos
- Se actualiza automáticamente cuando state cambia

¿Por qué computed y no signal?

- Es READONLY (no se puede modificar desde afuera)
- Se recalcula solo cuando state.data cambia
- Más eficiente que re-renderizar todo
  \*/

// 🔍 LÍNEA 2: Extraer estado de loading
readonly loading = computed(() => this.state().loading);
/\*
¿Qué hace?

- Extrae SOLO el booleano loading del state
- El template puede usar loading() para mostrar spinners
- Se actualiza cuando cambia el estado de carga
  \*/

// 🔍 LÍNEA 3: Extraer errores
readonly error = computed(() => this.state().error);
/\*
¿Qué hace?

- Extrae el mensaje de error (string | null)
- null = no hay error
- string = hay un error con mensaje
- El template puede mostrar/ocultar mensajes de error
  \*/

// 🔍 LÍNEA 4: Calcular si hay productos (DERIVADO)
readonly hasProducts = computed(() => this.products().length > 0);
/\*
¿Qué hace?

- Usa OTRO computed (this.products())
- Calcula si hay al menos 1 producto
- Retorna true/false
- Se recalcula cuando products() cambia
- ¡DOBLE REACTIVIDAD! state -> products -> hasProducts
  \*/

// 🔍 LÍNEA 5: Contar productos (DERIVADO)
readonly productsCount = computed(() => this.products().length);
/\*
¿Qué hace?

- Cuenta cuántos productos hay
- También usa this.products()
- Se actualiza automáticamente
- Útil para mostrar "Mostrando 10 productos"
  \*/

// =====================================
// EJEMPLO VISUAL DEL FLUJO
// =====================================

class ExampleService {
// 1️⃣ ESTADO CENTRAL (1 signal que controla todo)
private state = signal({
data: [],
loading: false,
error: null
});

// 2️⃣ COMPUTED SIGNALS (se derivan del estado)
readonly products = computed(() => {
console.log('🔄 Recalculando products...');
return this.state().data;
});

readonly loading = computed(() => {
console.log('🔄 Recalculando loading...');
return this.state().loading;
});

readonly hasProducts = computed(() => {
console.log('🔄 Recalculando hasProducts...');
return this.products().length > 0; // ¡Depende de products!
});

// 3️⃣ CUANDO CAMBIAS EL ESTADO
async loadProducts() {
// Esto dispara TODOS los computed que dependen de state
this.state.set({
data: [],
loading: true, // ← loading() se recalcula
error: null
});

    try {
      const data = await fetch('/api/products').then(r => r.json());

      // Esto dispara MÁS recálculos
      this.state.set({
        data: data,        // ← products() se recalcula
        loading: false,    // ← loading() se recalcula
        error: null
      });
      // hasProducts() también se recalcula porque depende de products()

    } catch (err) {
      this.state.set({
        data: [],
        loading: false,
        error: 'Error!'  // ← error() se recalcula
      });
    }

}
}

// =====================================
// COMPARACIÓN: ANTES vs AHORA
// =====================================

// ❌ ANTES (Angular clásico)
class OldService {
products$ = new BehaviorSubject<Product[]>([]);
loading$ = new BehaviorSubject<boolean>(false);
error$ = new BehaviorSubject<string | null>(null);

// En el componente necesitabas:
// products$ | async
// loading$ | async  
 // error$ | async
// ¡3 subscripciones diferentes!
}

// ✅ AHORA (Con signals)
class NewService {
private state = signal({ data: [], loading: false, error: null });

readonly products = computed(() => this.state().data);
readonly loading = computed(() => this.state().loading);
readonly error = computed(() => this.state().error);

// En el componente solo necesitas:
// products()
// loading()
// error()
// ¡Sin subscripciones!
}

// =====================================
// VENTAJAS DE ESTE PATRÓN
// =====================================

/\*
✅ RENDIMIENTO:

- Solo se recalcula lo que realmente cambió
- Angular sabe exactamente qué actualizar en el DOM

✅ ENCAPSULAMIENTO:

- state es privado (nadie puede modificarlo desde afuera)
- Los computed son readonly (solo lectura)

✅ COMPOSABILIDAD:

- hasProducts depende de products
- Si products cambia, hasProducts se actualiza automáticamente

✅ SIMPLICIDAD:

- No más subscribe/unsubscribe
- No más async pipes
- Menos código, más expresivo

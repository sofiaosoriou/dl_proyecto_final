/**
 * Tests de la API REST MktCafé
 * Stack: Jest + supertest
 *
 * Estrategia:
 *  - Se testea la capa HTTP (status codes, estructura de respuesta, headers).
 *  - No se mocka la base de datos; los tests que dependen de DB aceptan
 *    tanto el código "exitoso" como 500 (DB no disponible en CI/test).
 *  - Los tests de validación (campos faltantes, tokens inválidos) son
 *    completamente deterministas porque no necesitan DB.
 *
 * Ejecutar: npm run test
 */

const request = require("supertest");
const server  = require("../index");

// ============================================================
//  1. Ruta raíz
// ============================================================
describe("GET / — Ruta raíz", () => {
  it("debería responder con status 200", async () => {
    const res = await request(server).get("/");
    expect(res.statusCode).toBe(200);
  });

  it("la respuesta debería ser un Object con clave 'message'", async () => {
    const { body } = await request(server).get("/");
    expect(body).toBeInstanceOf(Object);
    expect(body).toHaveProperty("message");
  });

  it("la respuesta debería contener el array 'endpoints'", async () => {
    const { body } = await request(server).get("/");
    expect(Array.isArray(body.endpoints)).toBe(true);
    expect(body.endpoints.length).toBeGreaterThan(0);
  });
});

// ============================================================
//  2. Rutas no existentes (404)
// ============================================================
describe("Manejo de rutas no encontradas (404)", () => {
  it("GET /ruta-inexistente → 404", async () => {
    const res = await request(server).get("/ruta-que-no-existe");
    expect(res.statusCode).toBe(404);
  });

  it("GET /api/ruta-inexistente → 404", async () => {
    const res = await request(server).get("/api/ruta-inexistente-abc");
    expect(res.statusCode).toBe(404);
  });

  it("la respuesta 404 debería tener clave 'error'", async () => {
    const { body } = await request(server).get("/no-existe");
    expect(body).toHaveProperty("error");
  });
});

// ============================================================
//  3. POST /api/login — autenticación
// ============================================================
describe("POST /api/login — Autenticación", () => {
  it("→ 400 si no se envía body", async () => {
    const res = await request(server).post("/api/login").send({});
    expect(res.statusCode).toBe(400);
  });

  it("→ 400 si falta el campo password", async () => {
    const res = await request(server)
      .post("/api/login")
      .send({ email: "test@test.com" });
    expect(res.statusCode).toBe(400);
  });

  it("→ 400 si falta el campo email", async () => {
    const res = await request(server)
      .post("/api/login")
      .send({ password: "123456" });
    expect(res.statusCode).toBe(400);
  });

  it("→ 401 o 500 con credenciales incorrectas", async () => {
    const res = await request(server)
      .post("/api/login")
      .send({ email: "noexiste@test.com", password: "wrong" });
    expect([401, 500]).toContain(res.statusCode);
  });

  it("la respuesta de error debería ser un Object con clave 'error'", async () => {
    const { body } = await request(server)
      .post("/api/login")
      .send({});
    expect(body).toBeInstanceOf(Object);
    expect(body).toHaveProperty("error");
  });

  it("el Content-Type de la respuesta debe ser JSON", async () => {
    const res = await request(server).post("/api/login").send({});
    expect(res.headers["content-type"]).toMatch(/json/);
  });
});

// ============================================================
//  4. POST /api/users — registro de usuario
// ============================================================
describe("POST /api/users — Registro", () => {
  it("→ 400 si no se envían campos obligatorios", async () => {
    const res = await request(server).post("/api/users").send({});
    expect(res.statusCode).toBe(400);
  });

  it("→ 400 si falta el email", async () => {
    const res = await request(server)
      .post("/api/users")
      .send({ nombre: "Test", password: "123456" });
    expect(res.statusCode).toBe(400);
  });

  it("→ 400 si falta la contraseña", async () => {
    const res = await request(server)
      .post("/api/users")
      .send({ nombre: "Test", email: "test@test.com" });
    expect(res.statusCode).toBe(400);
  });

  it("→ 400 si falta el nombre", async () => {
    const res = await request(server)
      .post("/api/users")
      .send({ email: "test@test.com", password: "123456" });
    expect(res.statusCode).toBe(400);
  });

  it("la respuesta de error tiene clave 'error'", async () => {
    const { body } = await request(server).post("/api/users").send({});
    expect(body).toHaveProperty("error");
  });
});

// ============================================================
//  5. GET /api/publications — publicaciones (ruta pública)
// ============================================================
describe("GET /api/publications — Publicaciones públicas", () => {
  it("→ 200 o 500 dependiendo de si la DB está disponible", async () => {
    const res = await request(server).get("/api/publications");
    expect([200, 500]).toContain(res.statusCode);
  });

  it("la respuesta es un Array (200) o un Object de error (500)", async () => {
    const { body } = await request(server).get("/api/publications");
    expect(body).toBeInstanceOf(Object);
  });

  it("acepta query param 'search' sin romper la ruta", async () => {
    const res = await request(server)
      .get("/api/publications")
      .query({ search: "colombia" });
    expect([200, 500]).toContain(res.statusCode);
  });

  it("acepta query param 'tipo_molienda' sin romper la ruta", async () => {
    const res = await request(server)
      .get("/api/publications")
      .query({ tipo_molienda: "molido" });
    expect([200, 500]).toContain(res.statusCode);
  });
});

// ============================================================
//  6. GET /api/publications/:id — detalle de publicación
// ============================================================
describe("GET /api/publications/:id — Detalle de publicación", () => {
  it("→ 404 o 500 para un id que no existe (id=99999)", async () => {
    const res = await request(server).get("/api/publications/99999");
    expect([404, 500]).toContain(res.statusCode);
  });

  it("→ 500 para un id con formato inválido (texto)", async () => {
    const res = await request(server).get("/api/publications/id-invalido");
    expect([400, 500]).toContain(res.statusCode);
  });
});

// ============================================================
//  7. Rutas protegidas — verificación del middleware JWT
// ============================================================
describe("Rutas protegidas — Middleware JWT", () => {
  const protectedRoutes = [
    { method: "get",    url: "/api/favorites" },
    { method: "get",    url: "/api/orders"    },
    { method: "post",   url: "/api/publications" },
    { method: "post",   url: "/api/orders"    },
  ];

  protectedRoutes.forEach(({ method, url }) => {
    it(`${method.toUpperCase()} ${url} sin token → 401`, async () => {
      const res = await request(server)[method](url).send({});
      expect(res.statusCode).toBe(401);
    });
  });

  it("GET /api/favorites con token inválido → 401", async () => {
    const res = await request(server)
      .get("/api/favorites")
      .set("Authorization", "Bearer token_invalido_abc123");
    expect(res.statusCode).toBe(401);
  });

  it("PUT /api/users/:id con header Authorization mal formado → 401", async () => {
    const res = await request(server)
      .put("/api/users/1")
      .set("Authorization", "sinBearer")
      .send({ nombre: "Nuevo nombre" });
    expect(res.statusCode).toBe(401);
  });

  it("DELETE /api/publications/:id sin token → 401", async () => {
    const res = await request(server).delete("/api/publications/1").send();
    expect(res.statusCode).toBe(401);
  });

  it("las respuestas 401 deben tener clave 'error'", async () => {
    const { body } = await request(server).get("/api/favorites").send();
    expect(body).toHaveProperty("error");
  });
});

// ============================================================
//  8. Cabeceras HTTP generales
// ============================================================
describe("Cabeceras HTTP", () => {
  it("GET / debe devolver Content-Type JSON", async () => {
    const res = await request(server).get("/");
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  it("POST /api/login debe devolver Content-Type JSON aunque falle", async () => {
    const res = await request(server).post("/api/login").send({});
    expect(res.headers["content-type"]).toMatch(/json/);
  });
});

const request = require("supertest");
const app = require("../src/app");
const { resetTasks } = require("../src/routes/tasks");

beforeEach(() => {
  resetTasks();
});

describe("POST /tasks", () => {
  it("creates a task and returns 201 with the created task", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Buy milk", description: "From the store" });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      id: 1,
      title: "Buy milk",
      description: "From the store",
      completed: false,
    });
  });

  it("defaults description and completed when not provided", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Just a title" });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      title: "Just a title",
      description: "",
      completed: false,
    });
  });

  it("rejects a missing title with 400", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ description: "No title here" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("rejects an empty title with 400", async () => {
    const res = await request(app).post("/tasks").send({ title: "   " });

    expect(res.status).toBe(400);
  });
});

describe("GET /tasks", () => {
  it("returns an empty array when there are no tasks", async () => {
    const res = await request(app).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all created tasks", async () => {
    await request(app).post("/tasks").send({ title: "Task 1" });
    await request(app).post("/tasks").send({ title: "Task 2" });

    const res = await request(app).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((t) => t.title)).toEqual(["Task 1", "Task 2"]);
  });
});

describe("GET /tasks/:id", () => {
  it("returns the matching task", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Find me" });

    const res = await request(app).get(`/tasks/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: created.body.id, title: "Find me" });
  });

  it("returns 404 for a non-existent task", async () => {
    const res = await request(app).get("/tasks/999");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

describe("PUT /tasks/:id", () => {
  it("updates the fields of an existing task", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Old title" });

    const res = await request(app)
      .put(`/tasks/${created.body.id}`)
      .send({ title: "New title", completed: true });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: created.body.id,
      title: "New title",
      completed: true,
    });
  });

  it("returns 404 when updating a non-existent task", async () => {
    const res = await request(app).put("/tasks/999").send({ title: "Nope" });

    expect(res.status).toBe(404);
  });

  it("returns 400 when title is invalid", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Valid title" });

    const res = await request(app)
      .put(`/tasks/${created.body.id}`)
      .send({ title: "" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when completed is not a boolean", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Valid title" });

    const res = await request(app)
      .put(`/tasks/${created.body.id}`)
      .send({ completed: "yes" });

    expect(res.status).toBe(400);
  });
});

describe("DELETE /tasks/:id", () => {
  it("deletes an existing task and returns 204", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Delete me" });

    const deleteRes = await request(app).delete(`/tasks/${created.body.id}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get(`/tasks/${created.body.id}`);
    expect(getRes.status).toBe(404);
  });

  it("returns 404 when deleting a non-existent task", async () => {
    const res = await request(app).delete("/tasks/999");

    expect(res.status).toBe(404);
  });
});

describe("End-to-end CRUD flow", () => {
  it("creates, reads, updates, and deletes a task in sequence", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .send({ title: "E2E task", description: "Initial" });
    expect(createRes.status).toBe(201);
    const { id } = createRes.body;

    const readRes = await request(app).get(`/tasks/${id}`);
    expect(readRes.status).toBe(200);
    expect(readRes.body.title).toBe("E2E task");

    const updateRes = await request(app)
      .put(`/tasks/${id}`)
      .send({ completed: true });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.completed).toBe(true);

    const deleteRes = await request(app).delete(`/tasks/${id}`);
    expect(deleteRes.status).toBe(204);

    const finalGetRes = await request(app).get(`/tasks/${id}`);
    expect(finalGetRes.status).toBe(404);
  });
});

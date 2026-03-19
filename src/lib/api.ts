export const api = {
  async login(credentials: any) {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  async getStats() {
    const res = await fetch("/api/stats");
    return res.json();
  },

  async getAnimals() {
    const res = await fetch("/api/animals");
    return res.json();
  },

  async addAnimal(animal: any) {
    const res = await fetch("/api/animals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(animal),
    });
    return res.json();
  },

  async updateAnimal(id: number, animal: any) {
    const res = await fetch(`/api/animals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(animal),
    });
    return res.json();
  },

  async deleteAnimal(id: number) {
    const res = await fetch(`/api/animals/${id}`, { method: "DELETE" });
    return res.json();
  },

  async getVaccinations() {
    const res = await fetch("/api/vaccinations");
    return res.json();
  },

  async addVaccination(vaccination: any) {
    const res = await fetch("/api/vaccinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vaccination),
    });
    return res.json();
  },

  async getVisitors() {
    const res = await fetch("/api/visitors");
    return res.json();
  },

  async addVisitor(visitor: any) {
    const res = await fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitor),
    });
    return res.json();
  },

  async updateVisitor(id: number, visitor: any) {
    const res = await fetch(`/api/visitors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitor),
    });
    return res.json();
  },

  async getBiosecurityLogs() {
    const res = await fetch("/api/biosecurity");
    return res.json();
  },

  async saveBiosecurityLog(log: any) {
    const res = await fetch("/api/biosecurity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    return res.json();
  },
};

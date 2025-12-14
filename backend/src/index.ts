import cors from "cors";
import express from "express";
import productRoutes from "./routes/product.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>🚀 Bienvenido al backend con Express + Bun</h1>");
});

app.use("/v1/api/products", productRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

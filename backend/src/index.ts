import { errorMiddleware } from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/order.routes";
import productRoutes from "./routes/product.routes";
import cartRouters from "./routes/cart.routes";
import categoryRoutes from "./routes/category.routes";
import { userRoutes } from "./routes/user.routes";
import newsletterRoutes from "./routes/newsletter.routes";
import routesRoutes from './routes/routes.routes';
import driversRoutes from './routes/drivers.routes';
import cors from "cors";
import express from "express";
import bodyParser from 'body-parser';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("<h1>🚀 Bienvenido al backend con Express + Bun</h1>");
});
app.use("/v1/api/products", productRoutes);
app.use("/v1/api/cart", cartRouters);
app.use("/v1/api/categories", categoryRoutes);
app.use("/v1/api/orders", orderRoutes);
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/users", userRoutes);
app.use("/v1/api/newsletter", newsletterRoutes);
app.use('/v1/api/routes', routesRoutes);
app.use('/v1/api/drivers', driversRoutes);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🟢 Ruta Newsletter activa en: http://localhost:${PORT}/v1/api/newsletter`);
});

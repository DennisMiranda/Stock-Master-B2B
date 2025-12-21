import { errorMiddleware } from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/order.routes";
import productRoutes from "./routes/product.routes";
import { userRoutes } from "./routes/user.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>🚀 Bienvenido al backend con Express + Bun</h1>");
});

app.use("/v1/api/products", productRoutes);
app.use("/v1/api/orders", orderRoutes);
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/users", userRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

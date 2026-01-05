import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { StatisticService } from "../services/statistic.service";
import { CustomResponse } from "../utils/custom-response";

const statisticService = new StatisticService();

export class DashboardController {

    static async getStats(req: Request, res: Response) {
        try {
            // Ejecución en Paralelo de las 5 consultas clave
            const [
                topConsolidated,
                topUnits,
                topBoxes,
                lowStockUnits,
                lowStockBoxes
            ] = await Promise.all([
                // 1. Top Consolidado (Total Units Sold)
                statisticService.getTopSelling('totalUnitSold', 5),
                // 2. Top Unidades Sueltas
                statisticService.getTopSelling('unitSold', 5),
                // 3. Top Cajas
                statisticService.getTopSelling('boxSold', 5),
                // 4. Alerta Stock Unidades
                ProductService.getLowStock('unit', 5),
                // 5. Alerta Stock Cajas
                ProductService.getLowStock('box', 5)
            ]);

            // Enriquecer Top Selling con Imágenes
            const allTopStats = [...topConsolidated, ...topUnits, ...topBoxes];
            const uniqueIds = Array.from(new Set(allTopStats.map(s => s.id)));

            let productMap: Record<string, any> = {};
            if (uniqueIds.length > 0) {
                const productService = new ProductService();
                productMap = await productService.getProductsMapById(uniqueIds);
            }

            const enrich = (stats: any[]) => stats.map(s => ({
                ...s,
                images: productMap[s.id]?.images || []
            }));

            const payload = {
                topSelling: {
                    consolidated: enrich(topConsolidated),
                    byUnit: enrich(topUnits),
                    byBox: enrich(topBoxes),
                },
                lowStock: {
                    byUnit: lowStockUnits,
                    byBox: lowStockBoxes,
                }
            };

            const responsePayload = CustomResponse.success(payload, "Dashboard stats fetched successfully");
            res.status(200).json(responsePayload);
        } catch (error) {
            console.error("[DashboardController] Error:", error);
            const errorResponse = CustomResponse.error("INTERNAL_SERVER_ERROR", "Failed to fetch dashboard stats", error);
            res.status(500).json(errorResponse);
        }
    }
}

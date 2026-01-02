import { db } from "../config/firebase";

export const saveSubscriber = async (email: string) => {
  // Validar formato
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) throw new Error("Formato de correo inválido");

  // Buscar si ya existe
  const existing = await db.collection("newsletter").where("email", "==", email).get();

  if (!existing.empty) {
    console.log(`⚠️ [Newsletter] Correo ya suscrito: ${email}`);
    return {
      duplicate: true,
      message: "El correo ya está suscrito 😄"
    };
  }

  // Guardar nuevo
  await db.collection("newsletter").add({
    email,
    subscribedAt: new Date().toISOString(),
  });

  console.log(`✅ [Newsletter] Nuevo suscriptor: ${email}`);
  return {
    duplicate: false,
    message: "Correo guardado correctamente 🎉"
  };
};
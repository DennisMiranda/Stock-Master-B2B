import { db } from "../../config/firebase";

export class SettingsService {
  private districtsCollection = db
    .collection("settings")
    .doc("districts")
    .collection("data");

  async getDistricts() {
    const snapshot = await this.districtsCollection.orderBy("name").get();
    const docs = snapshot.docs;
    return docs.map((doc) => doc.data()) || [];
  }
}

import { defineStore } from "pinia";
import { useFirestore, useCollection } from "vuefire";
import { collection, query, orderBy } from "firebase/firestore";

export const useCertifications = defineStore("certificates", () => {
  const db = useFirestore();
  const q = query(collection(db, "certificates"), orderBy("order", "asc"));

  const certificationsCollection = useCollection(q);

  return { certificationsCollection };
});

import { defineStore } from "pinia";
import { useFirestore, useCollection } from "vuefire";
import { collection, query } from "firebase/firestore";

export const useCertifications = defineStore("certifications", () => {
  const db = useFirestore();
  const q = query(collection(db, "certifications"));
  const certificationsCollection = useCollection(q);
  return { certificationsCollection };
});

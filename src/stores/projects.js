import { defineStore } from "pinia";
import { useFirestore, useCollection } from "vuefire";
import { collection, query, orderBy } from "firebase/firestore";

export const useProjects = defineStore("projects", () => {
  const db = useFirestore();
  const q = query(collection(db, "projects"), orderBy("order", "asc"));

  const projectsCollection = useCollection(q);

  return { projectsCollection };
});

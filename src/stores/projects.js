import { defineStore } from "pinia";
import { useFirestore, useCollection } from "vuefire";
import { collection, query } from "firebase/firestore";

export const useProjects = defineStore("projects", () => {
  const db = useFirestore();
  const q = query(collection(db, "projects"));
  const projectsCollection = useCollection(q);
  return { projectsCollection };
});

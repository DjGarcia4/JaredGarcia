import { defineStore } from "pinia";
import { useFirestore, useCollection } from "vuefire";
import { collection, query } from "firebase/firestore";

export const usePersonalSkills = defineStore("personalSkills", () => {
  const db = useFirestore();
  const q = query(collection(db, "personalskills"));
  const personalSkillsCollection = useCollection(q);
  return { personalSkillsCollection };
});

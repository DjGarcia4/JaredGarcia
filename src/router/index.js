import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { applyRouteMeta } from "@/lib/seo";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/projects",
      name: "projects",
      component: () => import("../views/ProjectsView.vue"),
    },
    {
      path: "/project/:slug",
      name: "project",
      component: () => import("../views/ProjectDetailView.vue"),
    },
    {
      path: "/design-system",
      name: "design-system",
      component: () => import("../views/DesignSystemView.vue"),
    },
    {
      path: "/lab",
      name: "lab",
      component: () => import("../views/LabView.vue"),
    },
    {
      path: "/certificate/:slug",
      name: "certificate",
      component: () =>
        import("../views/certificates/CertificateDetailView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      // When navigating between routes with a hash (e.g. certificate → home#about),
      // the out-in transition (200ms leave + 400ms enter) means the target element
      // doesn't exist yet. Wait for the transition to finish before scrolling,
      // and verify the element exists before returning the scroll config —
      // otherwise fall back to top to avoid leaving the page in a weird state.
      return new Promise((resolve) => {
        setTimeout(() => {
          const target = document.querySelector(to.hash);
          if (target) {
            resolve({ el: to.hash, behavior: "smooth", top: 80 });
          } else {
            resolve({ top: 0 });
          }
        }, 700);
      });
    }
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

router.afterEach((to) => applyRouteMeta(to));

export default router;

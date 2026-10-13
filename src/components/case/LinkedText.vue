<script>
// Texto con enlaces a otros casos: la primera mención de cada proyecto
// (RapiSites, Wink…) lleva a su página. No enlaza al caso en el que estás
// ni a «Wink Digital» (la empresa).
import { h } from "vue";
import { RouterLink } from "vue-router";

// El orden importa: los nombres largos antes que «Wink» a secas.
const MENTIONS = [
  ["Wink Studio", "wink-studio"],
  ["Wink App", "wink-app"],
  ["Wink Site", "wink-site"],
  ["RapiSites", "rapisites"],
  ["Wink", "wink-app"],
];
const PATTERN = /Wink Studio|Wink App|Wink Site|RapiSites|Wink(?! Digital)\b/g;
const slugOf = (name) => MENTIONS.find(([n]) => n === name)[1];

export default {
  name: "LinkedText",
  props: {
    text: { type: String, default: "" },
    // Slug del caso actual: no se enlaza a sí mismo.
    self: { type: String, default: "" },
  },
  setup(props) {
    return () => {
      const out = [];
      const linked = new Set([props.self]);
      let last = 0;
      for (const m of props.text.matchAll(PATTERN)) {
        const slug = slugOf(m[0]);
        if (linked.has(slug)) continue;
        linked.add(slug);
        out.push(props.text.slice(last, m.index));
        out.push(
          h(
            RouterLink,
            {
              to: { name: "project", params: { slug } },
              class: "text-accent-light underline decoration-accent/40 underline-offset-4 hover:decoration-accent",
            },
            () => m[0],
          ),
        );
        last = m.index + m[0].length;
      }
      out.push(props.text.slice(last));
      return out;
    };
  },
};
</script>

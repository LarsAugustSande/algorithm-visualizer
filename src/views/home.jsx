import { groups } from "../catalog.js";

export function Home() {
  return (
    <article>
      <p className="kicker">INF234 · høsten 2026</p>
      <h1>Algoritmer</h1>
      <p className="lede">
        Algoritmer fra forelesningene i INF234 høsten 2026.
      </p>
      {groups.filter((g) => g.label !== "Start").map((g) => (
        <section key={g.label}>
          <h2 className="group" style={{ marginTop: 22 }}>{g.label}</h2>
          <ul className="toclist">
            {g.items.map((it) => (
              <li key={it.id}>
                <a href={`#${it.id}`}>{it.title}</a>
                <span> {it.blurb}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="lede" style={{ marginTop: 22 }}>
        Noen ting fra timene har ikke en egen figur, fordi de er reduksjoner mer enn egne løkker:
        sirkulasjon med krav og nedre skranker, Hirschbergs lineære plass for edit distance,
        og blomst-algoritmen for matching i generelle grafer. Kant-disjunkte stier ligger som
        et eksempel under Ford–Fulkerson. Menger er setningen der.
      </p>
    </article>
  );
}

export const groups = [
  {
    label: "Start",
    items: [{ id: "innhold", title: "Oversikt" }],
  },
  {
    label: "1–2  Matching",
    items: [{ id: "gale", title: "Gale–Shapley", blurb: "Den som søker får sitt beste stabile utfall." }],
  },
  {
    label: "3–4  Kjøretid",
    items: [
      { id: "asymp", title: "O, Ω, Θ", blurb: "Hvor fort funksjonene faktisk skiller lag." },
      { id: "binarsok", title: "Binærsøk", blurb: "Halver intervallet i en sortert array." },
      { id: "tosum", title: "Target sum", blurb: "To pekere, én passering." },
    ],
  },
  {
    label: "5–6  Grafer",
    items: [
      { id: "bfs", title: "BFS", blurb: "Kø. Lagene er avstand fra start." },
      { id: "dfs", title: "DFS og komponenter", blurb: "Stakk, og så en ny start når grafen er delt." },
      { id: "bipartitt", title: "Bipartitt-test", blurb: "To farger, ellers en odde sykel." },
      { id: "topo", title: "Topologisk rekkefølge", blurb: "Ta en kilde, senk inn-graden." },
    ],
  },
  {
    label: "7  Grådig",
    items: [
      { id: "mynter", title: "Vekslepenger", blurb: "Største mynt først. Ikke alltid rett." },
      { id: "intervall", title: "Intervallplanlegging", blurb: "Tidligst ferdig. Tidligst start feiler." },
      { id: "partisjon", title: "Intervallpartisjonering", blurb: "Fyll én maskin, så neste." },
      { id: "lateness", title: "Minimere forsinkelse", blurb: "Tidligst frist, uten hull." },
    ],
  },
  {
    label: "8–9  Veier, trær",
    items: [
      { id: "dijkstra", title: "Dijkstra", blurb: "Ikke-negative vekter." },
      { id: "haug", title: "Binærhaug", blurb: "Der log n-en kommer fra." },
      { id: "prim", title: "Prim", blurb: "Voks treet med billigste kant ut." },
      { id: "kruskal", title: "Kruskal", blurb: "Billigste kant som ikke lukker en sykel." },
      { id: "union", title: "Union-Find", blurb: "Størrelse, og sti-kompresjon." },
    ],
  },
  {
    label: "10–12  Splitt og hersk",
    items: [
      { id: "merge", title: "Mergesort", blurb: "Del, sorter, flett." },
      { id: "master", title: "Masterteoremet", blurb: "a, b, d, og hvilket nivå som koster." },
      { id: "karatsuba", title: "Karatsuba", blurb: "Tre multiplikasjoner, ikke fire." },
      { id: "inv", title: "Telle inversjoner", blurb: "Flettingen teller kryssene." },
      { id: "par", title: "Nærmeste par", blurb: "Del planet, sjekk stripen." },
    ],
  },
  {
    label: "12–15  DP",
    items: [
      { id: "sanskrit", title: "Sanskrit-rekurrensen", blurb: "Samme kall, om og om igjen." },
      { id: "vektet", title: "Vektet intervall", blurb: "p(j) og valget ta eller hopp over." },
      { id: "segment", title: "Segmentert minste kvadrat", blurb: "Flere linjer, straff per linje." },
      { id: "knapsack", title: "Knapsack", blurb: "Vekt med i tilstanden." },
      { id: "edit", title: "Edit distance", blurb: "Sett inn, slett, bytt." },
      { id: "bellman", title: "Bellman–Ford", blurb: "Negative kanter, og når svaret ikke finnes." },
    ],
  },
  {
    label: "16–20  Flyt",
    items: [
      { id: "flyt", title: "Ford–Fulkerson", blurb: "Utvidende sti. Noen ganger baklengs." },
      { id: "matchflyt", title: "Bipartitt matching", blurb: "Kapasitet 1, og et like stort vertex cover." },
      { id: "tilordning", title: "Min-cost tilordning", blurb: "Billigste sti, med negative returkanter." },
    ],
  },
];

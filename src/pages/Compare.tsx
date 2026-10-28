import { PageIntro } from "../components/PageIntro";
import ProductPhoto from "../components/ProductPhoto";
import { money, products } from "../data";
import type { Product } from "../data";
import { useStore } from "../store/StoreProvider";
import { cx } from "@/lib/utils";
import { ArrowUpRight, Check, GitCompareArrows, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function Compare() {
  const { compare, toggleCompare } = useStore();
  const selected = products.filter((p) => compare.includes(p.id));
  const fans = products.filter((p) => p.kind === "fan");
  return (
    <>
      <PageIntro
        eyebrow="A CLOSER LOOK"
        title="Find the one for you."
        description="Compare Base model, Jumbohead, Nanohead and their Wood versions, with warranty options and prices side by side."
      />
      <section className="container compare-section">
        <div className="compare-selection glass">
          <GitCompareArrows size={21} />
          <span>Choose up to three warranty options to compare</span>
          {fans.map((p) => (
            <button
              key={p.id}
              className={cx("chip", compare.includes(p.id) && "selected")}
              aria-pressed={compare.includes(p.id)}
              onClick={() => toggleCompare(p.id)}
            >
              {compare.includes(p.id) ? (
                <Check size={14} />
              ) : (
                <Plus size={14} />
              )}{" "}
              {p.name} · {p.warranty}-year warranty
            </button>
          ))}
        </div>
        {selected.length ? (
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">The little details</th>
                  {selected.map((p) => (
                    <th scope="col" key={p.id}>
                      <ProductPhoto product={p} finish={p.finish} />
                      <h2>{p.name} · {p.warranty} years</h2>
                      <Link to={`/product/${p.id}`} className="text-button">
                        Explore collection <ArrowUpRight size={14} />
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Indicative price",
                    value: (p: Product) => money(p.price!),
                  },
                  {
                    label: "Warranty option",
                    value: (p: Product) =>
                      `${p.warranty} years · terms to confirm`,
                  },

                  {
                    label: "Finishes to explore",
                    value: (p: Product) => p.colors.join(", "),
                  },
                  {
                    label: "Remote / light / timer / speeds",
                    value: () => "Confirm features for the actual model",
                  },
                  {
                    label: "Delivery & installation",
                    value: () => "Confirmed for your location by our team",
                  },
                ].map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {selected.map((p) => (
                      <td key={p.id}>{row.value(p)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state glass">
            <GitCompareArrows size={40} />
            <h2>A little perspective helps.</h2>
            <p>Select a collection above to start comparing.</p>
          </div>
        )}
        <p className="catalogue-note">
          These fan options use the supplied prices and photographs. Confirm complete warranty coverage, specifications and delivery with our team.
        </p>
      </section>
    </>
  );
}

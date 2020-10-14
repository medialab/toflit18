// [jacomyal]
// For some reason, the current build process does not understand ES6 code in
// default baobab-router file, so we have to explicitly load this one instead :
import Router from "baobab-router/dist/tmp";

export default function bindRoutes(tree) {
  return new Router(tree, {
    defaultRoute: "/home",
    routes: [
      {
        path: "/home",
        state: {
          view: "home",
          viewGroup: "staticPages",
        },
      },
      {
        path: "/about",
        state: {
          view: "about",
          viewGroup: "staticPages",
        },
      },
      {
        path: "/legal",
        state: {
          view: "legal",
          viewGroup: "staticPages",
        },
      },
      {
        path: "/classification",
        defaultRoute: "/browser",
        state: { viewGroup: "classification" },
        routes: [
          {
            path: "/browser",
            query: {
              kind: ":kind",
              selected: ":selected",
              selectedParent: ":selectedParent",
              orderBy: ":orderBy",
              queryGroup: ":queryGroup",
              queryItem: ":queryItem",
            },
            state: {
              view: "classification",
              classificationsState: {
                kind: ":kind",
                selected: ":selected",
                selectedParent: ":selectedParent",
                orderBy: ":orderBy",
                queryGroup: ":queryGroup",
                queryItem: ":queryItem",
              },
            },
          },
        ],
      },
      {
        path: "/exploration",
        defaultRoute: "/meta",
        state: { viewGroup: "exploration" },
        routes: [
          {
            path: "/meta",
            query: {
              model: ":dataModel",
              dataType: ":dataType",
              productClassification: ":productClassification",
              partnerClassification: ":partnerClassification",
              products: { match: ":product", cast: "json" },
              partners: { match: ":partner", cast: "json" },
              direction: ":direction",
              kind: ":kind",
              sourceType: ":sourceType",
            },
            state: {
              view: "explorationMeta",
              metadataState: {
                dataModel: ":dataModel",
                dataType: ":dataType",
                selectors: {
                  productClassification: ":productClassification",
                  partnerClassification: ":partnerClassification",
                  product: ":product",
                  partner: ":partner",
                  direction: ":direction",
                  kind: ":kind",
                  sourceType: ":sourceType",
                },
              },
            },
          },
          {
            path: "/indicators",
            query: {
              lines: {
                match: ":lines",
                cast: "json",
              },
            },
            state: {
              view: "explorationIndicators",
              indicatorsState: {
                lines: ":lines",
              },
            },
          },
          {
            path: "/network",
            query: {
              classification: ":classification",
              sourceType: ":sourceType",
              productClassification: ":productClassification",
              product: {
                match: ":product",
                cast: "json",
              },
              kind: ":kind",
              dateMin: ":dateMin",
              dateMax: ":dateMax",
              nodeSize: ":nodeSize",
              edgeSize: ":edgeSize",
              labelThreshold: ":labelThreshold",
              labelSizeRatio: ":labelSizeRatio",
            },
            state: {
              view: "explorationNetwork",
              explorationNetworkState: {
                nodeSize: ":nodeSize",
                edgeSize: ":edgeSize",
                labelThreshold: ":labelThreshold",
                labelSizeRatio: ":labelSizeRatio",
                classification: ":classification",
                selectors: {
                  kind: ":kind",
                  productClassification: ":productClassification",
                  product: ":product",
                  sourceType: ":sourceType",
                  dateMin: ":dateMin",
                  dateMax: ":dateMax",
                },
              },
            },
          },
          {
            path: "/terms",
            query: {
              nodeSize: ":nodeSize",
              edgeSize: ":edgeSize",
              labelThreshold: ":labelThreshold",
              labelSizeRatio: ":labelSizeRatio",
              classification: ":classification",
              sourceType: ":sourceType",
              childClassification: ":childClassification",
              child: {
                match: ":child",
                cast: "json",
              },
              partnerClassification: ":partnerClassification",
              partner: {
                match: ":partner",
                cast: "json",
              },
              direction: ":direction",
              kind: ":kind",
              dateMin: ":dateMin",
              dateMax: ":dateMax",
            },
            state: {
              view: "explorationTerms",
              explorationTermsState: {
                nodeSize: ":nodeSize",
                edgeSize: ":edgeSize",
                labelThreshold: ":labelThreshold",
                labelSizeRatio: ":labelSizeRatio",
                classification: ":classification",
                selectors: {
                  sourceType: ":sourceType",
                  childClassification: ":childClassification",
                  child: ":child",
                  partnerClassification: ":partnerClassification",
                  partner: ":partner",
                  direction: ":direction",
                  kind: ":kind",
                  dateMin: ":dateMin",
                  dateMax: ":dateMax",
                },
              },
            },
          },
          {
            path: "/sources",
            state: { view: "explorationSources" },
          },
          {
            path: "/flows",
            query: {
              sourceType: ":sourceType",
              productClassification: ":childClassification",
              product: {
                match: ":product",
                cast: "json",
              },
              partnerClassification: ":partnerClassification",
              partner: {
                match: ":partner",
                cast: "json",
              },
              direction: ":direction",
              kind: ":kind",
              dateMin: ":dateMin",
              dateMax: ":dateMax",
            },
            state: {
              view: "explorationFlows",
              explorationTermsState: {
                selectors: {
                  sourceType: ":sourceType",
                  productClassification: ":childClassification",
                  product: ":product",
                  partnerClassification: ":partnerClassification",
                  partner: ":partner",
                  direction: ":direction",
                  kind: ":kind",
                  dateMin: ":dateMin",
                  dateMax: ":dateMax",
                },
              },
            },
          },
        ],
      },
      {
        path: "/glossary",
        defaultRoute: "/products",
        state: { viewGroup: "glossary" },
        routes: [
          {
            path: "/products",
            state: { view: "glossaryPanel" },
          },
          {
            path: "/concepts",
            state: { view: "concepts" },
          },
        ],
      },
    ],
  });
}

/* eslint no-console: 0 */
/**
 * TOFLIT18 Import Script
 * =======================
 *
 * Script aiming at importing the project's sources into a neo4j database which
 * will be used by the datascape.
 */
import config from "config";
import { argv } from "yargs";
import async from "async";
import { parse as parseCsv, stringify as stringifyCsv } from "csv";
import parseSync from "csv-parse/lib/sync";
import { default as h } from "highland";
import { hash } from "../lib/crypto";
import { normalizeYear } from "../lib/republican_calendar";
import { cleanText, cleanNumber } from "../lib/clean";
import path from "path";
import fs from "fs";
import _ from "lodash";
import gitlog from "gitlog";

/**
 * Initialization
 * ===============
 *
 * Defining path constants, reading the CLI arguments etc.
 */

/**
 * Paths
 */
const ROOT_PATH = "/base",
  BDD_CENTRALE_PATH = path.join(ROOT_PATH, "/bdd_centrale.csv"),
  BDD_OUTSIDERS = path.join(ROOT_PATH, "/product_sourcees.csv"),
  BDD_CUSTOMS_REGIONS = path.join(ROOT_PATH, "/bdd_customs_regions.csv"),
  // classifications index
  INDEX_CLASSIFICATIONS = path.join(ROOT_PATH, "/classifications_index.csv");

/**
 * Constants
 */

// Possible properties
const POSSIBLE_NODE_PROPERTIES = [
  "rawUnit",
  "unit",
  "quantity:float",
  "value:float",
  "unitPrice:float",
  "year:int",
  "rawYear",
  "import:boolean",
  "sheet",
  "name",
  "path",
  "type",
  "model",
  "note",
  "slug",
  "password",
  "description",
  "source:boolean",
  "region",
  "originalRegion",
  "partner",
  "sourceType",
  "product",
  "id",
  "bestGuessNationalProductXPartner:boolean",
  "bestGuessNationalPartner:boolean",
  "bestGuessNationalProduct:boolean",
  "bestGuessCustomsRegionProductXPartner:boolean",
  "bestGuessNationalCustomsRegion:boolean",
  "hash",
  "date",
  "repository",
  "absurdObservation"
];

const NODE_PROPERTIES_MAPPING = _(POSSIBLE_NODE_PROPERTIES)
  .map((p, i) => [p.split(":")[0], i])
  .fromPairs()
  .value();

const NODE_PROPERTIES_TYPES = POSSIBLE_NODE_PROPERTIES;

/**
 * Reading arguments
 */
const DATA_PATH = argv.path || argv.p;

if (!DATA_PATH) throw Error("No data path provided.");

console.log('Reading csv files from "' + DATA_PATH + '"');

/**
 * Helpers
 * ========
 *
 * Miscellaneous utilities used by the script.
 */

/**
 * Builder class
 */
class Builder {
  constructor() {
    const outputDirectory = argv.output || argv.o || "./.output";

    const nodesWriteStream = fs.createWriteStream(path.join(outputDirectory, "nodes.csv"), "utf-8"),
      edgesWriteStream = fs.createWriteStream(path.join(outputDirectory, "edges.csv"), "utf-8");

    // Properties
    this.nodesCount = 0;
    this.nodesStream = h();
    this.edgesStream = h();

    // Piping
    this.nodesStream.pipe(stringifyCsv({ delimiter: "," })).pipe(nodesWriteStream);

    this.edgesStream.pipe(stringifyCsv({ delimiter: "," })).pipe(edgesWriteStream);

    // Writing headers
    this.nodesStream.write(NODE_PROPERTIES_TYPES.concat(":LABEL", ":ID"));
    this.edgesStream.write([":START_ID", ":END_ID", ":TYPE", "line:string", "sheet:int"]);
  }

  save(data, label) {
    const row = _({})
      .assign(_.mapValues(NODE_PROPERTIES_MAPPING, () => ""))
      .assign(data)
      .toPairs()
      .sortBy(e => NODE_PROPERTIES_MAPPING[e[0]])
      .map(e => e[1])
      .concat([[].concat(label || []).join(";"), this.nodesCount])
      .value();

    this.nodesStream.write(row);

    return this.nodesCount++;
  }

  relate(source, predicate, target, data) {
    const row = [source, target, predicate];

    if (data) row.push(data.line || "", data.sheet || "");

    this.edgesStream.write(row);
  }
}

// Creating the builder
const BUILDER = new Builder();

/**
 * Index creation function
 */
function indexedNode(index, label, key, data, idIndex) {
  let node = index[key];
  if (!node) {
    node = BUILDER.save(data, label);
    index[key] = node;
    if (data.id && idIndex)
      if (!idIndex[data.id]) idIndex[data.id] = data.name;
      else if (idIndex[data.id] !== data.name)
        throw new Error(`id colision id:"${data.id}" label:${label} names:"${idIndex[data.id]}" "${data.name}"`);
  }

  return node;
}

/**
 * Data Hydratation
 * =================
 *
 * Scaffolding the necessary nodes and indexes so we can start the import.
 */

// Indexes
const INDEXES = {
  region: {},
  partner: {},
  office: {},
  operator: {},
  origin: {},
  product: {},
  source: {},
};

const ID_INDEXES = {
  region: {},
  partner: {},
  product: {},
  classifiedItem: {},
  outsider: {},
};

const DIRECTIONS_INDEX = {};

const OUTSIDER_INDEXES = {
  sund: {},
  belg: {},
  unknown: {},
};

const EDGE_INDEXES = {
  offices: new Set(),
};

const slugifyDirection = name => `${name.replace(/[\s-]/g, "_")}`;

// loading classification index
const csvData = fs.readFileSync(DATA_PATH + INDEX_CLASSIFICATIONS, "utf-8");
let classificationsIndex = parseSync(csvData, { delimiter: ",", columns: true });

const slugifyClassification = classification => `${classification.model}_${classification.slug}`;
const slugifyClassifiedItem = (name, classification) =>
  `${name.replace(/[\s]/g, "_")}~${slugifyClassification(classification)}`;

const CLASSIFICATION_NODES = {};
// building the tree to set the right process order
const children = {};
const roots = [];
const classificationBySlug = {};
classificationsIndex.forEach(classification => {
  // check classif slug unicity
  if (CLASSIFICATION_NODES[slugifyClassification(classification)]) {
    console.error(`duplicate classifications slugs ${slugifyClassification(classification)}`);
    throw new Error("classification slugs must be unique");
  }
  CLASSIFICATION_NODES[slugifyClassification(classification)] = BUILDER.save(
    {
      name: classification.name,
      model: classification.model,
      slug: classification.slug,
      id: slugifyClassification(classification),
      description: classification.description,
      source: classification.slug === "source" ? "true" : "",
    },
    "Classification",
  );
  if (classification.slug === "source") roots.push(slugifyClassification(classification));
  else
    children[`${classification.model}_${classification.parentSlug}`] = (
      children[`${classification.model}_${classification.parentSlug}`] || []
    ).concat(slugifyClassification(classification));
  classificationBySlug[slugifyClassification(classification)] = classification;
});

// reorder classifications by depth from root to leaf order in the classif tree.
classificationsIndex = _.flatten(
  roots.map(r => {
    let cs = children[r];
    let orderedClassif = [];
    // iterate through the tree by depth
    while (cs && cs.length > 0) {
      // store current children
      orderedClassif = orderedClassif.concat(cs);
      // get grand children if exist
      cs = cs ? _.flatten(cs.map(c => children[c]).filter(e => e)) : undefined;
    }
    return [r].concat(_.flatten(orderedClassif)).map(s => classificationBySlug[s]);
  }),
);

// create authors
const CLASSIFICATION_AUTHORS = {};
_.uniq(classificationsIndex.map(c => c.author)).forEach(a => {
  CLASSIFICATION_AUTHORS[a] = BUILDER.save(
    {
      name: a,
      password: hash(config.get("api.secret")),
    },
    "User",
  );
});

// COMMITs INFO
const commitMeta = (path) => {
  const d = gitlog({
    repo: path,
    number: 1,
    fields: ['hash', 'authorDate']
  })
  if (d.length>0){
    const meta = d[0];
    const date = new Date(meta.authorDate).toISOString();
    return {
      hash: meta.hash,
      date,
      repository: path === '.' ? 'http://github.com/medialab/toflit18' : 'http://github.com/medialab/toflit18_data'};
  }
};

[DATA_PATH].forEach(p => {
  const commitNode = commitMeta(p);
  if (commitNode) 
    BUILDER.save(commitNode,"Commit");});

const CLASSIFICATION_INDEXES = {};

classificationsIndex.forEach(c => {
  BUILDER.relate(CLASSIFICATION_NODES[slugifyClassification(c)], "CREATED_BY", CLASSIFICATION_AUTHORS[c.author]);
  CLASSIFICATION_INDEXES[slugifyClassification(c)] = {};
  if (c.slug !== "source") {
    BUILDER.relate(
      CLASSIFICATION_NODES[slugifyClassification(c)],
      "BASED_ON",
      CLASSIFICATION_NODES[`${c.model}_${c.parentSlug}`],
    );
  }
});

const OUTSIDER_SOURCES_NODES = {
  sund: BUILDER.save({ name: "sund" }, "ExternalSource"),
  belg: BUILDER.save({ name: "belgium" }, "ExternalSource"),
  unknown: BUILDER.save({ name: "unknown" }, "ExternalSource"),
};

/**
 * Consumers
 * ==========
 *
 * Definining the functions that will consume the multiple CSV streams in
 * order to produce the graph to import.
 */

// helper
// we want every product to have their first letter capitalized and leave the rest as in the source
const capitalizeProduct = p => _.capitalize(p[0]) + p.slice(1, p.length);

/**
 * Consuming the flows.
 */
function importer(csvLine) {

  // filter source in Out
  if (csvLine.source_type === "Out") return;

  //Patching regions names
  const originalRegion = csvLine.customs_region;

  let region = DIRECTIONS_INDEX[originalRegion];

  if (!!originalRegion && region === undefined) {
    region = originalRegion;
    console.log("  !! Could not find simplified customs region for:", originalRegion, "In file:", csvLine.filepath);
  }

  // Import or Export
  const isImport = /(imp|sortie)/i.test(csvLine.export_import);

  // Creating a flow node
  const nodeData = {
    rawYear: csvLine.year,
    import: "" + isImport,
  };

  // Year
  if (csvLine.year) {
    if (/semestre/.test(csvLine.year)) {
      nodeData.year = csvLine.year.split("-")[0];
    } else if (csvLine.year === "10 mars-31 décembre 1787") {
      nodeData.year = 1787;
    } else if (/\-/.test(csvLine.year)) {
      const min = csvLine.year.split("-")[0];
      nodeData.year = normalizeYear(min);
    } else {
      nodeData.year = normalizeYear(csvLine.year);
    }
  }
  if (isNaN(nodeData.year)) {
    console.error(`${csvLine.year} is not a year`);
    console.error(csvLine);
    return;
  }
  // Unit
  if (csvLine.quantity_unit) {
    nodeData.rawUnit = csvLine.quantity_unit;

    // NOTE: this will now be processed by a separate script
    // const normalized = UNITS_INDEX[nodeData.rawUnit];

    // if (normalized)
    //   nodeData.unit = normalized;
  }

  // Value
  if (csvLine.value) {
    const realValue = cleanNumber(csvLine.value);

    if (realValue) nodeData.value = realValue;
    else if (realValue !== 0) console.log("  !! Weird value:", csvLine.value);
  }

  // Quantity
  if (csvLine.quantity) {
    const realQuantity = cleanNumber(csvLine.quantity);

    if (realQuantity) nodeData.quantity = realQuantity;
    else if (realQuantity !== 0) console.log("  !! Weird quantity:", csvLine.quantity);
  }

  // absurd flags
  if (csvLine.absurd_observation)
    nodeData.absurdObservation = csvLine.absurd_observation

  // Unit price
  if (csvLine.value_per_unit) {
    const realPrice = cleanNumber(csvLine.value_per_unit);

    if (realPrice) nodeData.unitPrice = realPrice;
    else if (realPrice !== 0) console.log("  !! Weird unit price:", csvLine.value_per_unit);
  }

  if (csvLine.remarks) nodeData.note = csvLine.remarks;

  // Additional static indexed properties for convenience
  if (csvLine.partner) nodeData.partner = csvLine.partner;
  if (region) nodeData.region = region;
  if (originalRegion) nodeData.originalRegion = originalRegion;

  if (csvLine.product) {
    // we want every product name to be have a capital on the first letter
    nodeData.product = capitalizeProduct(csvLine.product);
  }
  if (csvLine.source_type) nodeData.sourceType = csvLine.source_type;
  // best guess source type
  nodeData.bestGuessNationalProductXPartner = csvLine.best_guess_national_prodxpart === "1" ? "true" : "false";
  nodeData.bestGuessNationalPartner = csvLine.best_guess_national_partner === "1" ? "true" : "false";
  nodeData.bestGuessNationalProduct = csvLine.best_guess_national_product === "1" ? "true" : "false";
  nodeData.bestGuessCustomsRegionProductXPartner = csvLine.best_guess_region_prodxpart === "1" ? "true" : "false";
  nodeData.bestGuessNationalCustomsRegion = csvLine.best_guess_national_region === "1" ? "true" : "false";

  // Here, we filter some lines deemed irrelevant
  if (!nodeData.value && !nodeData.quantity && !nodeData.unitPrice) return;

  const flowNode = BUILDER.save(nodeData, "Flow");

  // Operator
  if (csvLine.data_collector) {
    const operatorNode = indexedNode(INDEXES.operator, "Operator", csvLine.data_collector, {
      name: csvLine.data_collector,
    });

    BUILDER.relate(flowNode, "TRANSCRIBED_BY", operatorNode);
  }

  // Source
  if (csvLine.source) {
    const hashedKey = [csvLine.source, csvLine.filepath].join("|||");

    const sourceNode = indexedNode(INDEXES.source, "Source", hashedKey, {
      name: csvLine.source,
      path: csvLine.filepath,
      type: csvLine.source_type,
    });

    BUILDER.relate(flowNode, "TRANSCRIBED_FROM", sourceNode, {
      line: "" + csvLine.line_number,
      sheet: +csvLine.sheet,
    });
  }

  // Product
  if (csvLine.product) {
    const product = capitalizeProduct(csvLine.product);
    const alreadyLinked = INDEXES.product[product];
    const id = slugifyClassifiedItem(product, classificationBySlug.product_source);

    const productNode = indexedNode(
      INDEXES.product,
      ["Product", "Item"],
      product,
      {
        name: product,
        id,
      },
      ID_INDEXES.product,
    );

    BUILDER.relate(flowNode, "OF", productNode);

    if (!alreadyLinked) BUILDER.relate(CLASSIFICATION_NODES.product_source, "HAS", productNode);
  }

  // Origin
  if (csvLine.origin) {
    const originNode = indexedNode(INDEXES.origin, "Origin", csvLine.origin, {
      name: csvLine.origin,
    });

    BUILDER.relate(flowNode, "ORIGINATES_FROM", originNode);
  }

  // Office
  if (csvLine.customs_office) {
    const officeNode = indexedNode(INDEXES.office, "Office", csvLine.customs_office, {
      name: csvLine.customs_office,
    });

    if (!isImport) BUILDER.relate(flowNode, "FROM", officeNode);
    else BUILDER.relate(flowNode, "TO", officeNode);

    if (region && !EDGE_INDEXES.offices.has(csvLine.customs_office)) {
      const regionNode = indexedNode(
        INDEXES.region,
        "Direction",
        slugifyDirection(region),
        {
          name: region,
          id: slugifyDirection(region),
        },
        ID_INDEXES.region,
      );

      BUILDER.relate(regionNode, "GATHERS", officeNode);
      EDGE_INDEXES.offices.add(csvLine.customs_office);
    }
  }

  // Direction
  if (region) {
    const regionNode = indexedNode(
      INDEXES.region,
      "Direction",
      slugifyDirection(region),
      {
        name: region,
        id: slugifyDirection(region),
      },
      ID_INDEXES.region,
    );

    if (!isImport) BUILDER.relate(flowNode, "FROM", regionNode);
    else BUILDER.relate(flowNode, "TO", regionNode);
  }

  // Partner
  if (csvLine.partner) {
    const alreadyLinked = INDEXES.partner[csvLine.partner];
    const partnerNode = indexedNode(
      INDEXES.partner,
      ["Partner", "Item"],
      csvLine.partner,
      {
        name: csvLine.partner,
        id: slugifyClassifiedItem(csvLine.partner, classificationBySlug.partner_source),
      },
      ID_INDEXES.partner,
    );

    if (isImport) BUILDER.relate(flowNode, "FROM", partnerNode);
    else BUILDER.relate(flowNode, "TO", partnerNode);

    if (!alreadyLinked) BUILDER.relate(CLASSIFICATION_NODES.partner_source, "HAS", partnerNode);
  }
}

/**
 * Consuming products coming from external sources.
 */
const slugifyOutsider = (name, outsider) => `${name.replace(/[ ]/g, "_")}~outsider_${outsider.replace(/[ -]/g, "_")}`;
function outsiderProduct(line) {
  const name = line.name,
    nodeData = { name };

  ["sund", "belg", "unknown"].forEach(function(source) {
    if (line[source]) {
      if (OUTSIDER_INDEXES[source][name]) return;

      if (source === "unknown" && INDEXES.product[name]) return;

      const preexisting = !!INDEXES.product[name];
      nodeData.id = slugifyOutsider(name, source);
      const node = indexedNode(
        INDEXES.product,
        ["Item", "Product", "OutsiderItem", "OutsiderProduct"],
        name,
        nodeData,
        ID_INDEXES.outsider,
      );

      // Linking to the source only if not preexisting
      if (!preexisting) BUILDER.relate(CLASSIFICATION_NODES.product_source, "HAS", node);

      // Linking to the external source
      BUILDER.relate(node, "TRANSCRIBED_FROM", OUTSIDER_SOURCES_NODES[source]);

      OUTSIDER_INDEXES[source][name] = true;
    }
  });
}

/**
 * Consuming the classifications.
 */
function makeClassificationConsumer(
  groupIndex,
  classificationNode,
  parentNode,
  itemIndex,
  groupKey,
  itemKey,
  classification,
  opts = {},
) {
  const linkedItemIndex = new Set(),
    linkedGroupIndex = new Set();

  return function(line) {
    const group = line[groupKey],
      item = line[itemKey];

    // Dropping empty values
    if (!group || !item || group.trim().toLowerCase() === "[vide]" || item.trim().toLowerCase() === "[vide]") {
      return;
    }

    const itemNode = itemIndex[item];

    // Building the group node
    const nodeData = {
      name: group,
      id: slugifyClassifiedItem(group, classification),
    };
    // Adding the note only if required
    if (opts.shouldTakeNote && line.note) nodeData.note = line.note;

    const groupNode = indexedNode(groupIndex, "ClassifiedItem", group, nodeData, ID_INDEXES.classifiedItem);

    // Linking the group to the classification on first run
    if (!linkedGroupIndex.has(group)) {
      BUILDER.relate(classificationNode, "HAS", groupNode);

      linkedGroupIndex.add(group);
    }

    // From sources
    if (itemNode) {
      // Have we several group pointing to the same item?
      if (linkedItemIndex.has(item)) {
        console.log("  !! Warning: item is targeted by multiple groups:", item);
        return;
      }

      // The group aggregates the item
      BUILDER.relate(groupNode, "AGGREGATES", itemNode);
      linkedItemIndex.add(item);
    }
  };
}

/**
 * Process
 * ========
 *
 * Reading the multiple CSV file and parsing them accordingly in order to create
 * the graph.
 */
async.series(
  {
    regions(next) {
      console.log("Processing customs regions...");

      const csvDirections = fs.readFileSync(DATA_PATH + BDD_CUSTOMS_REGIONS, "utf-8");
      parseCsv(csvDirections, { delimiter: "," }, function(err, data) {
        data.forEach(row => {
          const sourceDirection = cleanText(row[0]),
            targetDirection = cleanText(row[1]);

          DIRECTIONS_INDEX[sourceDirection] = targetDirection;
        });

        return next();
      });
    },

    flows(next) {
      console.log("Processing flows...");

      const readStream = fs
        .createReadStream(DATA_PATH + BDD_CENTRALE_PATH)
        .pipe(parseCsv({ delimiter: ",", columns: true }));

      h(readStream)
        .map(l => _.mapValues(l, cleanText))
        .each(importer)
        .on("end", () => next());
    },

    externalProduct(next) {
      console.log("Processing outsider products...");

      const csvOutsiders = fs.readFileSync(DATA_PATH + BDD_OUTSIDERS, "utf-8");
      parseCsv(csvOutsiders, { delimiter: "," }, function(err, data) {
        data
          .slice(1)
          .map(line => ({
            name: cleanText(line[0]),
            sources: line[1].trim() === "1",
            sund: line[2].trim() === "1",
            belg: line[3].trim() === "1",
            unknown: line[4].trim() === "0",
          }))
          .filter(row => !row.sources)
          .forEach(outsiderProduct);

        return next();
      });
    },

    classification(next) {
      console.log("Processing classifications...");
      async.series(
        classificationsIndex
          .filter(c => c.slug !== "source")
          .map(c => {
            return cb => {
              console.log(`  --  ${c.model} ${c.name}`);
              const consumer = makeClassificationConsumer(
                CLASSIFICATION_INDEXES[slugifyClassification(c)],
                CLASSIFICATION_NODES[slugifyClassification(c)],
                CLASSIFICATION_NODES[`${c.model}_${c.parentSlug}`],
                c.parentSlug === "source" ? INDEXES[c.model] : CLASSIFICATION_INDEXES[`${c.model}_${c.parentSlug}`],
                "group", // column name for group
                "entity", // column name for entities
                c,
                { shouldTakeNote: true },
              );
              const csvClassification = fs.readFileSync(
                path.join(DATA_PATH, ROOT_PATH, `classification_${c.model}_${c.slug}.csv`),
                "utf-8",
              );
              parseCsv(csvClassification, { delimiter: ",", columns: true }, function(err, data) {
                data
                  .map(line => ({
                    entity: cleanText(line[c.parentSlug]),
                    group: cleanText(line[c.slug]),
                    note: cleanText(line.note ? line.note : ""),
                  }))
                  .forEach(consumer);

                return cb();
              });
            };
          }),
        e => {
          next(e);
        },
      );
    },
  },
  err => err && console.error(err),
);

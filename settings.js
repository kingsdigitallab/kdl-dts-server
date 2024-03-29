module.exports = {
  source: "tests/corpus",
  // source: "https://github.com/kingsdigitallab/alice-thornton/tree/edition/texts",
  // source: "https://github.com/kingsdigitallab/kdl-dts-server/tree/main/tests/corpus",
  // The stable and base of the URI for most ids (mainly collections & documents).
  // Only used for identifiction, it may not be accessible on the web.
  // https://api.github.com/repos/kingsdigitallab/alice-thornton/git/trees/edition?recursive=1
  // baseUri: "https://thornton.kdl.kcl.ac.uk/dts/ids/",
  baseUri: "https://github.com/kingsdigitallab/kdl-dts-server/tests/",
  // TODO: read this from a collection.json file
  rootCollection: {
    slug: "root",
    title: "Root Collection",
  },
  // rootCollection: {
  //   slug: "thornton-books",
  //   title: "Alice Thornton's Books",
  // },
  services: {
    root: "/",
    collections: "/collections/",
    navigation: "/navigation/",
    documents: "/documents/"
  },
};

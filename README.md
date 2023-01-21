Server-side javascript implementation of a [Distributed Text Services (DTS)](https://distributed-text-services.github.io/specifications/) server fed from a corpus of [TEI](https://tei-c.org/) files.

Status: this package is currently customised for the [Alice Thornton's Books research project](https://github.com/kingsdigitallab/alice-thornton). The intention is to generalise it so it works with other projects.

# Installation

`npm i git@github.com:kingsdigitallab/kdl-dts-server.git`

# Usage

To start a local DTS web service:

`npx kdl-dts-server`

# Features

* The TEI files can be located under a folder in the local filesystem or in a github repository.
* Support for HTML output format using XSLT (see responses/tei-to-html.xsl)

# Corpus requirements

* source TEI files should be placed under a folder on filessytem or github repo
* TEI files have at least one <pb n="X"> element, it is used to separate DTS passages
* TEI files have unique file names in the entire corpus (regardless of their path)
* TEI files must have a tei:title in the header

# TODO

## Must

* add a github action to generate static DTS from thornton corpus 
* parametrise the DTS server
* parametrise the SDTS generator
* test the static generator with github

## Should

* set the name of the top collection from settings.json
* default collection.json
* move settings file under a collection.json file under the top collection folder
* document!

## Could

* XSLT file could be placed under corpus folder
* Extend DTS services to support CSS stylesheets
* paramterise the units of texts (at the moment only <pb n="X">)
* support for large collection: paginate collection responses
* support for large collection: don't read all files at once, only on demand
* support for sub-collections
* support TEI files having a single passage
* support request to entire document

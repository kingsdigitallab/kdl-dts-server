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

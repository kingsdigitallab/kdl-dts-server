class CorpusReader {

  constructor(source) {
  }

  new(source) {
    let ret = null
    if (source.startsWith("https://github.com/")) {
      let ret = new CorpusReaderGitHub(this.source)
    }
    if (source.startsWith("file://")) {
      let ret = new CorpusReaderFileSystem(this.source)
    }
    return ret
  }

}

class CorpusReaderGitHub {

}

class CorpusReaderGitHub {
  
}

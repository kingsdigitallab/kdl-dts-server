<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0" 
  xmlns="http://www.w3.org/1999/xhtml" 
  xmlns:html="http://www.w3.org/1999/xhtml" 
  xmlns:tei="http://www.tei-c.org/ns/1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:dts="https://w3id.org/dts/api#"
  xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <!-- indent=yes would produce superfluous whitespaces in the ouput (e.g. choice, ...)  -->
  <xsl:output method="html" indent="no" />

  <xsl:variable name="images" select="document('images.xml')"/>
  <xsl:key name="images" match="IMAGE_PROPERTIES" use="@FILE"/> 

  <!-- GENERIC TRANSFORMS ############################### -->

  <xsl:template match="*">
    <xsl:call-template name="lossless-span"/>
  </xsl:template>

  <xsl:template name="lossless-span">
    <xsl:param name="class" select="''" />
    <span>
      <xsl:call-template name="lossless-attributes"><xsl:with-param name="class" select="$class"/></xsl:call-template>
      <xsl:call-template name="process-children" />
    </span>
  </xsl:template>

  <xsl:template name="lossless-div">
    <xsl:param name="class" select="''" />
    <div>
      <xsl:call-template name="lossless-attributes"><xsl:with-param name="class" select="$class"/></xsl:call-template>
      <xsl:call-template name="process-children" />
    </div>
  </xsl:template>

  <xsl:template name="lossless-attributes">
    <xsl:param name="class" select="''" />
    <xsl:attribute name="class">
      <xsl:value-of select="concat('tei-', local-name())"/>
      <xsl:if test="@type"> tei-type-<xsl:value-of select="@type"/></xsl:if>
      <xsl:if test="(count(text()) = 1) and (not(matches(text()[1], '[a-z]', 'i')))"> not-a-word</xsl:if>
      <xsl:if test="$class"><xsl:value-of select="concat(' ', $class)"/></xsl:if>
    </xsl:attribute>
    <xsl:attribute name="data-tei"><xsl:value-of select="local-name()" /></xsl:attribute>
    <xsl:apply-templates select="@*" mode="data-tei" />
  </xsl:template>

  <xsl:template name="process-children">
    <xsl:choose>
      <xsl:when test="@norm">
        <span class="norm"><xsl:value-of select="@norm"/></span>
        <span class="orig"><xsl:apply-templates /></span>
      </xsl:when>
      <xsl:otherwise><xsl:apply-templates /></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="lossless-attributes-and-children">
      <xsl:call-template name="lossless-attributes"/>
      <xsl:call-template name="process-children" />
  </xsl:template>

  <xsl:template match="@*" mode="data-tei">
    <xsl:attribute name="{concat('data-tei-', local-name())}"><xsl:value-of select="." /></xsl:attribute>
  </xsl:template>

  <!-- SUPRESSED ELEMENTS ############################### -->

  <xsl:template match="comment()">
  </xsl:template>

  <xsl:template match="tei:teiHeader">
  </xsl:template>

  <xsl:template match="tei:lb[preceding-sibling::*[1][self::tei:gap][@unit='line']]">
  </xsl:template>

  <!-- OTHERS ############################### -->

  <xsl:template match="tei:lb">
    <br>
      <xsl:call-template name="lossless-attributes"/>
    </br>
  </xsl:template>

  <xsl:template match="dts:fragment">
    <div class="dts-fragment" data-dts="fragment">
      <xsl:apply-templates />
    </div>
  </xsl:template>

  <xsl:template match="tei:TEI|tei:front|tei:titlePage">
     <xsl:call-template name="lossless-div"/>
  </xsl:template>

  <xsl:template match="tei:p|tei:div">
    <xsl:copy>
      <xsl:call-template name="lossless-attributes"/>
      <xsl:if test="contains(@rend, 'pre(rule)')"><hr/></xsl:if>
      <xsl:call-template name="process-children" />
      <xsl:if test="contains(@rend, 'post(rule)')"><hr/></xsl:if>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="tei:docTitle">
    <h1 class="tei-docTitle"><xsl:call-template name="lossless-attributes-and-children" /></h1>
  </xsl:template>

  <xsl:template match="tei:head">
    <h2 class="tei-head"><xsl:call-template name="lossless-attributes-and-children" /></h2>
  </xsl:template>

  <xsl:template match="tei:add">
    <ins><xsl:call-template name="lossless-attributes-and-children" /></ins>
  </xsl:template>

  <xsl:template match="tei:del">
    <del><xsl:call-template name="lossless-attributes-and-children" /></del>
  </xsl:template>

  <!-- <xsl:template match="*[@rend='superscript']">
    <sup><xsl:call-template name="lossless-attributes-and-children" /></sup>
  </xsl:template> -->

  <!-- INTERACTIVE ############################# -->

  <xsl:template match="tei:ref[@target]">
    <a href="{@target}" target="_blank"><xsl:call-template name="lossless-attributes-and-children" /></a>
  </xsl:template>

  <!-- <xsl:template match="tei:anchor">
    <xsl:call-template name="lossless-span"><xsl:with-param name="class" select="'has-info-box'"/></xsl:call-template>
  </xsl:template> -->

  <xsl:template match="tei:note">
    <span>
      <xsl:call-template name="lossless-attributes"><xsl:with-param name="class" select="'info-box'"/></xsl:call-template>
      <span class="banner">
        <xsl:choose>
          <xsl:when test="../@resp='ednote'">Editorial Note </xsl:when>
          <xsl:when test="../@type='context'">Context </xsl:when> <!-- TODO: still used?  -->
          <xsl:when test="@type='event'">Event </xsl:when>
          <xsl:when test="../@type='oed'">Gloss </xsl:when> <!-- TODO: still used?  -->
          <xsl:when test="@type='term'">Gloss </xsl:when>
          <xsl:when test="@type='person'">Person </xsl:when>
          <xsl:when test="@type='place'">Place </xsl:when>
          <xsl:when test="@type='glyph'">Symbol </xsl:when>
          <xsl:otherwise>(?)</xsl:otherwise>
        </xsl:choose>
      </span>
      <span class="body">
        <xsl:call-template name="process-children" />
      </span>
    </span>
  </xsl:template>

  <xsl:template match="tei:note//tei:p[@ref]" priority="10">
    <a>
      <xsl:attribute name="href">/entities/?hi=<xsl:value-of select="@ref"/></xsl:attribute>
      <!-- we don't want block element within another block element, browser would relocate them -->
      <xsl:call-template name="lossless-span"/>
    </a>
  </xsl:template>

  <xsl:template match="tei:note//tei:p">
    <!-- we don't want block element within another block element, browser would relocate them -->
    <xsl:call-template name="lossless-span"/>
  </xsl:template>

  <!-- INFO BOX (entities, events, notes, ...) -->

  <xsl:template match="*[tei:note[@type='entity' or @type='glyph' or @type='term' or @type='person' or @type='place']]" priority="2">
    <xsl:call-template name="lossless-span">
      <xsl:with-param name="class" select="concat('has-info-box is-', ./tei:note/@type)"/>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="tei:anchor[@resp='ednote']" priority="4">
    <span>
      <xsl:call-template name="lossless-attributes"><xsl:with-param name="class" select="'has-info-box is-note'"/></xsl:call-template>
      <sup class="note-symbol"><xsl:number count="//tei:anchor[@resp='ednote']" level="any" format="1"/></sup>
      <xsl:call-template name="process-children" />
    </span>
  </xsl:template>

  <xsl:template match="tei:quote">
    <span>
      <xsl:call-template name="lossless-attributes"><xsl:with-param name="class" select="'has-info-box is-quote'"/></xsl:call-template>
      <xsl:call-template name="process-children" />
      <span class="info-box">
        <span class="banner">Biblical reference</span>
        <span class="body">
          <xsl:for-each select="tokenize(@source, ' ')">
            <span class="tei-p">
            <xsl:value-of select="normalize-space(replace(replace(replace(., '^#|_', ' '), '(\d)([a-z])', '$1 $2', 'i'), '([a-z])(\d)', '$1 $2', 'i'))" />
            </span>
          </xsl:for-each>
        </span>
      </span>
    </span>
  </xsl:template>

  <!-- <xsl:template match="(tei:term|tei:geogName|tei:placeName|tei:rs|tei:persName)[@ref]">
    <xsl:call-template name="lossless-span"><xsl:with-param name="class" select="'has-info-box'"/></xsl:call-template>
  </xsl:template>

  <xsl:template match="tei:g[@ref]">
    <xsl:call-template name="lossless-span"><xsl:with-param name="class" select="'has-info-box'"/></xsl:call-template>
  </xsl:template> -->

  <xsl:template match="tei:milestone[@unit='event']" priority="4">
    <xsl:call-template name="lossless-span"><xsl:with-param name="class" select="'has-info-box is-event event-start'"/></xsl:call-template>
  </xsl:template>

  <xsl:template match="tei:anchor[@type='event']" priority="4">
    <xsl:call-template name="lossless-span"><xsl:with-param name="class" select="'has-info-box is-event event-end'"/></xsl:call-template>
  </xsl:template>

  <!-- =============================== -->

  <xsl:template match="tei:figure">
    <div class="tei-figure-wrapper">
      <a href="#" class="btn-figure"><i class="fas fa-image"></i><span class="is-sr-only">Photograph of the manuscript page</span></a>
      <figure class="tei-figure hidden" data-tei="figure">
        <xsl:apply-templates select="tei:head" />
        <!-- graphic can use .jpg or .tif format, we normalise into tif here -->
        <xsl:variable name="image" select="key('images', replace(tei:graphic/@url, '\.jpg$', '.tif'), $images)" />
        <img src="/assets/img/books/viewer/zoomify/{replace(tei:graphic/@url, '\..+$', '')}/TileGroup0/0-0-0.jpg" data-src="{tei:graphic/@url}" alt="{tei:head/text()}" data-height="{$image/@HEIGHT}" data-width="{$image/@WIDTH}" ></img>
        <xsl:apply-templates select="tei:p" />
      </figure>
    </div>
  </xsl:template>

  <xsl:template match="tei:figure/tei:head">
    <figcaption><xsl:call-template name="lossless-attributes-and-children" /></figcaption>
  </xsl:template>

  <xsl:template match="tei:item[./tei:seg/@rend='braced(})']">
    <span>
      <xsl:call-template name="lossless-attributes"><xsl:with-param name="class" select="'has-braced-seg'"/></xsl:call-template>
      <xsl:call-template name="process-children" />
    </span>
  </xsl:template>

  <!-- <space unit="line" quantity="3"/> -->
  <!-- TODO: chars -->
  <xsl:template match="(tei:space|tei:gap)[@unit='char' or @unit='word' or @unit='line' or @unit='page']">
    <xsl:variable name="quantity_integer" select="xs:integer(ceiling(@quantity))" />
    <span>
      <xsl:call-template name="lossless-attributes" />
      <xsl:call-template name="process-children" />
      <span class="missing-content-message">
        <xsl:if test="$quantity_integer &gt; 1"><xsl:value-of select="$quantity_integer" />&#160;</xsl:if>
        <xsl:choose>
          <xsl:when test="../@agent='excised'">excised</xsl:when>
          <xsl:when test="contains(@reason, 'deleted')">deleted</xsl:when>
          <xsl:when test="contains(@reason, 'obliterated')">obliterated</xsl:when>
          <xsl:when test="@reason='damage'">damaged</xsl:when>
          <xsl:when test="name()='space'">blank</xsl:when>
          <xsl:otherwise>missing</xsl:otherwise>
        </xsl:choose>
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="@unit" /><xsl:if test="$quantity_integer &gt; 1">s</xsl:if>
      </span>
      <!-- and (@quantity &gt; 1 or not(following-sibling::node()[1][self::tei:lb])) -->
      <xsl:if test="@unit='line'">
        <xsl:for-each select="1 to $quantity_integer"><br class="missing-line"/></xsl:for-each>
      </xsl:if>
      <xsl:if test="@unit='char'">
        <span class="missing-chars" title="illigible">
          <xsl:for-each select="1 to $quantity_integer">?</xsl:for-each>
        </span>
      </xsl:if>
    </span>
  </xsl:template>

</xsl:stylesheet>

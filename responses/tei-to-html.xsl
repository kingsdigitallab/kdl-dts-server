<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0" 
  xmlns="http://www.w3.org/1999/xhtml" 
  xmlns:html="http://www.w3.org/1999/xhtml" 
  xmlns:tei="http://www.tei-c.org/ns/1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:dts="https://w3id.org/dts/api#">
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
      <xsl:call-template name="process-children" />
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

  <xsl:template match="*[@rend='superscript']">
    <sup><xsl:call-template name="lossless-attributes-and-children" /></sup>
  </xsl:template>

  <!-- INTERACTIVE ############################# -->

  <!-- <xsl:template match="tei:anchor">
    <xsl:call-template name="lossless-span"><xsl:with-param name="class" select="'has-info-box'"/></xsl:call-template>
  </xsl:template> -->

  <xsl:template match="tei:anchor">
    <span>
      <xsl:call-template name="lossless-attributes"><xsl:with-param name="class" select="'has-info-box'"/></xsl:call-template>
      <sup class="note-symbol">[<xsl:number count="//tei:anchor" level="any" format="1"/>]</sup>
      <xsl:call-template name="process-children" />
    </span>
  </xsl:template>

  <xsl:template match="tei:note">
    <span>
      <xsl:call-template name="lossless-attributes"><xsl:with-param name="class" select="'info-box'"/></xsl:call-template>
      <span class="banner">
        <!-- <xsl:value-of select="concat(upper-case(substring(../@type,1,1)),substring(../@type, 2),' ')" /> -->
        <xsl:choose>
          <xsl:when test="../@type='oed_context'">Definition </xsl:when>
          <xsl:when test="../@type='oed'">Definition </xsl:when>
          <xsl:when test="../@type='context'">Context </xsl:when>
          <xsl:when test="../@type='person'">Person </xsl:when>
          <xsl:when test="ends-with(../name(), 'persName')">Person </xsl:when>
          <xsl:when test="ends-with(../name(), 'placeName')">Place </xsl:when>
          <xsl:when test="ends-with(../name(), 'geogName')">Place </xsl:when>
        </xsl:choose>
        <xsl:choose>
          <xsl:when test="@type='entity'">(Entity)</xsl:when>
          <xsl:when test="ends-with(../name(), 'anchor')">(Note)</xsl:when>
          <xsl:otherwise>(?)</xsl:otherwise>
        </xsl:choose>
      </span>
      <span class="body">
        <xsl:call-template name="process-children" />
      </span>
    </span>
  </xsl:template>

  <xsl:template match="tei:note//tei:p">
    <!-- we don't want block element within another block element -->
    <xsl:call-template name="lossless-span"/>
  </xsl:template>

  <xsl:template match="(tei:geogName|tei:placeName|tei:rs|tei:persName)[@ref]">
    <xsl:call-template name="lossless-span"><xsl:with-param name="class" select="'has-info-box'"/></xsl:call-template>
  </xsl:template>

  <!-- <xsl:template match="(tei:geogName|tei:placeName|tei:rs|tei:persName)[@ref]">
    <span><xsl:call-template name="lossless-attributes"/><xsl:call-template name="process-children" /><a>
      <xsl:attribute name="href">
        <xsl:value-of select="concat('/entities/?q=', translate(@ref, ':', ':'))" />
      </xsl:attribute>
      <xsl:call-template name="process-children" />
    </a></span>
  </xsl:template> -->

  <xsl:template match="tei:quote">
    <span>
      <xsl:call-template name="lossless-attributes"><xsl:with-param name="class" select="'has-info-box'"/></xsl:call-template>
      <xsl:call-template name="process-children" />
      <span class="info-box">
        <span class="banner">Biblical reference</span>
        <span class="body">
          <xsl:value-of select="normalize-space(replace(replace(@source, '^#_|_', ' '), '(\d)([a-z])', '$1 $2', 'i'))" />
        </span>
      </span>
    </span>
  </xsl:template>

  <xsl:template match="tei:figure">
    <div class="tei-figure-wrapper">
      <a href="#" class="btn-figure">&#x1f4f7;</a>
      <figure class="tei-figure hidden" data-tei="figure">
        <figcaption><xsl:value-of select="tei:head/text()" /></figcaption>
        <xsl:variable name="image" select="key('images', tei:graphic/@url, $images)" />
        <img src="/assets/img/books/viewer/zoomify/{replace(tei:graphic/@url, '\..+$', '')}/TileGroup0/0-0-0.jpg" data-src="{tei:graphic/@url}" alt="{tei:head/text()}" data-height="{$image/@HEIGHT}" data-width="{$image/@WIDTH}" ></img>
        <xsl:apply-templates select="tei:p" />
      </figure>
    </div>
  </xsl:template>

</xsl:stylesheet>

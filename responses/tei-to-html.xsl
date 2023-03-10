<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0" 
  xmlns="http://www.tei-c.org/ns/1.0" 
  xmlns:html="http://www.w3.org/1999/xhtml" 
  xmlns:tei="http://www.tei-c.org/ns/1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:dts="https://w3id.org/dts/api#">
  <xsl:output method="html" indent="yes" />

    <xsl:template match="comment()">
    </xsl:template>

    <xsl:template match="tei:teiHeader">
    </xsl:template>

    <xsl:template match="tei:lb">
        <br>
            <xsl:call-template name="lossless-attributes"/>
        </br>
    </xsl:template>

    <xsl:template match="tei:head">
        <h1><xsl:call-template name="lossless-attributes"/><xsl:apply-templates /></h1>
    </xsl:template>

    <xsl:template match="*">
        <xsl:call-template name="lossless-span"/>
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
            <xsl:apply-templates />
        </xsl:copy>
    </xsl:template>

    <xsl:template match="*[@ref]">
        <xsl:copy><xsl:call-template name="lossless-attributes"/><a>
            <xsl:attribute name="href">
                <xsl:value-of select="concat('/entities/', translate(@ref, ':', '/'))" />
            </xsl:attribute>
            <xsl:apply-templates />
        </a></xsl:copy>
    </xsl:template>
 
    <xsl:template name="lossless-span">
        <span>
            <xsl:call-template name="lossless-attributes"/>
            <xsl:apply-templates />
        </span>
    </xsl:template>

    <xsl:template name="lossless-div">
        <div>
            <xsl:call-template name="lossless-attributes"/>
            <xsl:apply-templates />
        </div>
    </xsl:template>

    <xsl:template name="lossless-attributes">
        <xsl:attribute name="class">
            <xsl:value-of select="concat('tei-', local-name())"/>
            <xsl:if test="@type"> tei-type-<xsl:value-of select="@type"/></xsl:if>
        </xsl:attribute>
        <xsl:attribute name="data-tei"><xsl:value-of select="local-name()" /></xsl:attribute>
        <xsl:apply-templates select="@*" mode="data-tei" />
    </xsl:template>

    <xsl:template match="@*" mode="data-tei">
        <xsl:attribute name="{concat('data-tei-', local-name())}"><xsl:value-of select="." /></xsl:attribute>
    </xsl:template>

</xsl:stylesheet>

<xsl:stylesheet version="1.0" 

  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0" 
>

  <xsl:key name="notes" match="//tei:listAnnotation/tei:note" use="concat('#', @xml:id)"/> 

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="tei:anchor">
    <tei:anchor>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="key('notes', @corresp)"/>
    </tei:anchor>
  </xsl:template>

</xsl:stylesheet>

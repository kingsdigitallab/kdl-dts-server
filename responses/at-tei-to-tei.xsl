<xsl:stylesheet version="1.0" 
  xmlns="http://www.tei-c.org/ns/1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0" 
>

  <xsl:variable name="people" select="document('people.xml')"/>
  <xsl:key name="people" match="//tei:person" use="concat('ppl:', @xml:id)"/> 

  <xsl:variable name="places" select="document('places.xml')"/>
  <xsl:key name="places" match="//tei:place" use="concat('place:', @xml:id)"/> 

  <xsl:key name="notes" match="//tei:listAnnotation/tei:note" use="concat('#', @xml:id)"/> 

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="tei:anchor">
    <!-- 
      <anchor corresp="#ednote-0001" type="context" resp="ednote"/> 
      [...]
      <listAnnotation>
        <note n="1" xml:id="ednote-0001">
          <p> Thornton is [...]] </p>
        </note>
    -->
    <tei:anchor>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="key('notes', @corresp)"/>
    </tei:anchor>
  </xsl:template>

  <xsl:template match="(*[@type='person']|tei:persName)[@ref]">
    <!-- 
      <rs ref="ppl:wt1" type="person">Husband</rs>
      
      people.xml:

      <person xml:id="wt1">
          <persName>
            <forename>William</forename>
            <surname type="birth">Thornton</surname>
          </persName>
          <persName type="label">William Thornton (1624-1668)</persName>
          <birth type="birth" when-custom="1624-06-02">2 June 1624</birth>
          <death type="death" when-custom="1668-09-17">17 September 1668</death>
          <noteGrp>
            <note type="bio">William Thornton (1624-68), the son [...]</note>
          </noteGrp>
      </person>
    -->
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates />
      <note type="entity"><xsl:value-of select="key('people', @ref, $people)/tei:persName[@type='label']/text()"/></note>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="(*[@type='place']|tei:placeName|tei:geogName)[@ref]">
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates />
      <note type="entity"><xsl:value-of select="key('places', @ref, $places)/tei:placeName[@type='label']/text()"/></note>
    </xsl:copy>
  </xsl:template>

</xsl:stylesheet>

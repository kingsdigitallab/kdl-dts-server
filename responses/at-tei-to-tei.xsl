<xsl:stylesheet version="2.0" 
  xmlns="http://www.tei-c.org/ns/1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0" 
>

  <xsl:variable name="people" select="document('people.xml')"/>
  <xsl:key name="people" match="//tei:person" use="concat('ppl:', @xml:id)"/> 

  <xsl:variable name="places" select="document('places.xml')"/>
  <xsl:key name="places" match="//tei:place" use="concat('place:', @xml:id)"/> 

  <xsl:variable name="events" select="document('events.xml')"/>
  <xsl:key name="events" match="//tei:ptr" use="@target"/> 

  <xsl:variable name="glosses" select="document(tokenize('glossary.xml;glossary_book_one.xml;glossary_book_two.xml;glossary_book_three.xml', ';'))"/>
  <xsl:key name="glosses" match="//tei:item" use="concat('gloss:', @xml:id)"/> 

  <xsl:key name="notes" match="//tei:listAnnotation/tei:note" use="concat('#', @xml:id)"/> 

  <xsl:key name="glyphs" match="//tei:glyph[tei:desc]" use="concat('#', @xml:id)"/> 


  <xsl:template match="@*|node()">
    <xsl:call-template name="copy-element" />
  </xsl:template>

  <xsl:template name="copy-element">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="tei:anchor[@resp='ednote'][@type='exclude']" priority="20">
    <!-- remove excluded notes, for internal editing purpose only  -->
  </xsl:template>

  <xsl:template match="tei:p[contains(@rend, 'append-following-sibling')]">
    <div type="merged-modern-paras">
      <xsl:call-template name="copy-element" />
      <xsl:apply-templates select="./following-sibling::tei:p[1]" mode="copy-element" />
    </div>
  </xsl:template>

  <xsl:template match="tei:p[contains(@rend, 'append-following-sibling')]/following-sibling::tei:p[1]" mode="copy-element">
    <xsl:call-template name="copy-element" />
  </xsl:template>

  <xsl:template match="tei:p[contains(@rend, 'append-following-sibling')]/following-sibling::tei:p[1]">
    <!-- Already copied above -->
  </xsl:template>

  <xsl:template match="tei:anchor[@resp='ednote']" priority="10">
    <!-- 
      <anchor corresp="#ednote-0001" type="context" resp="ednote"/> 
      [...]
      <listAnnotation>
        <note n="1" xml:id="ednote-0001">
          <p> Thornton is [...]] </p>
        </note>
    -->
    <anchor>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="key('notes', @corresp)"/>
    </anchor>
  </xsl:template>

  <xsl:template match="(*[@type='person']|*[@type='group']|tei:persName)[@ref]">
    <!-- 
      <rs ref="ppl:wt1" type="person">Husband</rs>
      
      <rs ref="ppl:cw1 ppl:aow1" n="per7" type="person">...
      
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
      <note type="entity">
        <!-- <xsl:value-of select="key('people', @ref, $people)/tei:persName[@type='label']/text()"/> -->
        <xsl:for-each select="tokenize(@ref, ' ')">
          <p>
            <xsl:attribute name="ref"><xsl:value-of select="."/></xsl:attribute>
            <xsl:value-of select="key('people', ., $people)/tei:persName[@type='label']/text()"/>
          </p>
        </xsl:for-each>
      </note>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="(*[@type='place']|*[@type='geog']|tei:placeName|tei:geogName)[@ref]">
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates />
      <note type="entity">
        <p>
          <xsl:attribute name="ref"><xsl:value-of select="@ref"/></xsl:attribute>
          <xsl:value-of select="key('places', @ref, $places)/(tei:placeName|tei:geogName)[@type='label']/text()"/>
        </p>
      </note>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="tei:term[@ref]">
    <!-- 
      <term ref="gloss:p100t03" xml:id="p100t04"><w norm="temporals">Temporalls</w></term> 
      
      ===
      
      glossary.xml:

      <item xml:id="p100t03">
          <gloss> Temporal: ‘secular as opposed to sacred,’ <hi rend="italic">OEDO.</hi>
          </gloss>
      </item>
    -->
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates />
      <note type="entity"><xsl:apply-templates select="$glosses/key('glosses', current()/@ref)/tei:gloss"/></note>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="tei:g[@ref]">
    <!-- 
      <charDecl>
        <glyph xml:id="heart">
          <desc>Thornton frequently uses the heart symbol instead of the word 'heart' in her books. See <ref target="https://thornton.kdl.kcl.ac.uk/posts/blog/2023-02-13-AliceThorntonsHeart-Blog/">Cordelia Beattie and Suzanne Trill, ‘Alice Thornton’s Heart: An Early Modern Emoji’, <hi rend="italic">Alice Thornton’s Books</hi>, 17 March 2023</ref></desc>
        </glyph>

      [...]

      <g ref="#heart">♥</g> <lb/>
    -->
    <xsl:variable name="desc" select="key('glyphs', @ref)/tei:desc" />
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates />
      <xsl:if test="$desc">
        <note type="entity"><xsl:apply-templates select="$desc"/></note>
      </xsl:if>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="(tei:milestone[@unit='event']|tei:anchor[@type='event'])">
    <!-- 
      book_of_remembrances.xml:

      <milestone spanTo="#ev10-end" xml:id="ev10-start" n="ev10" unit="event"/>

      <anchor xml:id="ev10-end" n="ev10" type="event"/>
      
      ===
      
      event.xml:

      <event xml:id="aow1_1639_illness" type="sgl" when-custom="1639-04">
        <desc>Thornton and Alice Wandesford went to England for her mother to be treated for 'the stone'</desc>
        <label>illness/medical</label>
        <linkGrp type="sgl">
          <ptr target="bookrem:ev10" type="book" subtype="bookrem"/>
          <ptr target="book1:ev11" type="book" subtype="book1"/>
        </linkGrp>
      </event>
    -->
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates />
      <span>
        <xsl:choose>
          <xsl:when test="name() = 'milestone'">[EVENT: </xsl:when>
          <xsl:when test="name() = 'anchor'"> :EVENT]</xsl:when>
        </xsl:choose>
      </span>
      <xsl:variable name="bookkey">
        <xsl:choose>
          <xsl:when test="/tei:TEI/@xml:id = 'atb-book-of-remembrances'">bookrem:</xsl:when>
          <xsl:when test="/tei:TEI/@xml:id = 'atb-book-one'">book1:</xsl:when>
          <xsl:when test="/tei:TEI/@xml:id = 'atb-book-two'">book2:</xsl:when>
          <xsl:when test="/tei:TEI/@xml:id = 'atb-book-three'">book3:</xsl:when>
        </xsl:choose>
      </xsl:variable>
      <xsl:variable name="event" select="$events/key('events', concat($bookkey, current()/@n))/../.."/>
      <note type="event">
        <p>
          <xsl:attribute name="ref"><xsl:value-of select="$event/@xml:id"/></xsl:attribute>
          <xsl:apply-templates select="$event/tei:desc"/>
        </p>
      </note>
    </xsl:copy>
  </xsl:template>

</xsl:stylesheet>

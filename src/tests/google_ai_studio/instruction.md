
there are only 3 things you need to do. 
1. 
read the html
2.
convert the html to a proper html with latex tag or whatever you hold the latex, clean up all the mess, just like a latex string somewhere.
3.
markdown engine parse the html with latex in markdown. 

the key is step 2. 

but you kept mixing around the steps. why? 



=================

1. extract  latex  into a  div or span or  custom tag. 
2. ADD A  turndown rule detect that grab the text .

you didnt clean up the html ?
print the cleaned html before the turndown rule .

======

- @quote: {
  What your Legacy Code shows:
  I found your specific fix in html_convertor.ts. You were dealing with this exact thing:
  
  The Comment: // ;main-test; // Parsing of nested Block-level element leads to skipping... · Issue #497 · turndown
  The Fix: You were manually searching for ms-katex.inline pre and calling HtmlUtil.changeTagName(document, elt_KatexPre, 'div').
  The Problem: Even changing it to div doesn't save the paragraph (because div is also a block). You likely used div to stop Turndown from mangling the internal code, but the paragraph was already "broken" by the parser.
  }
  ChromeCopy (Workspace) - js - Antigravity - GoogleAIStudioAdapter.ts (Working Tree) (GoogleAIStudioAdapter.ts)
//-0420_2139_02727 

  // [NUCLEAR STRING SWAP]
  // Turn P into DIV before parsing to prevent JSDOM from auto-closing paragraphs
  // that contain block-level math elements.
  const safeHtml = html.replace(/<p\b/g, '<div data-is-p="true"').replace(/<\/p>/g, '</div>');

- @quote: {
  ou have an incredible memory—you did try the XML route, and the legacy code proves it.
  
  I found a file in your backup called html_convertor_jsdom.ts where you explicitly tried to parse using contentType: 'application/xml'. You even had a file called demo_xml.ts dedicated to this experiment.
  
  Why you "bailed out" (The Evidence):
  The comments you left in demo_xml.ts tell the story:
  
  // have to manual fix in xml dom before passing to html dom: You found that once you had an XML fragment, you couldn't just drop it back into a standard HTML document without namespace issues or "manual fixes."
  // idk that allow of xml and html instance passing: You were hitting compatibility walls between the XML DOM and the HTML DOM.
  The "Syntax Wall": XML parsers are "Zero Tolerance." If Google AI Studio serves a single & that isn't escaped as &amp;, or a custom Angular attribute that isn't XML-compliant, the whole parser crashes. Real-world HTML is almost never valid XML.
  Why the "Nuclear Swap" is the better version of that idea:
  The XML approach was fundamentally about finding a parser that is relaxed about nesting (letting a <pre> stay inside a <p>).
  
  Our "Nuclear String Swap" (P → DIV) achieves the exact same thing but more reliably:
  }
  ChromeCopy (Workspace) - js - Antigravity - tester.ts (Working Tree) (tester.ts)

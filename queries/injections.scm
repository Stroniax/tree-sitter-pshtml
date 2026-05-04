((tlist_sql
  (tlist_query) @injection.content
)
(#set! injection.language "sql"))

((script_element
  (raw_text) @injection.content)
 (#set! injection.language "javascript"))

((style_element
  (raw_text) @injection.content)
 (#set! injection.language "css"))

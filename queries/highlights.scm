[
  "~["
  "]"
  "~("
  ")"
  (if_end_tag ("[/"))
  (tlist_sql "[/")
  (else_tag ("["))
] @punctuation.bracket
[
  ";"
  "."
  ":"
] @punctuation.delimiter
"#" @punctuation.special

(comment_dat) @comment

(paren_dat
  (dat_name)) @function
(square_dat
  (dat_name)) @function
(dat_option_name) @attribute
(dat_option_operator) @operator
(dat_option_value) @variable.parameter

(database_table_name) @type.builtin
(database_extension_name) @type
(database_field_name) @property

"tlist_sql" @keyword.control

"if" @keyword.control
"else" @keyword.control
(condition_lhs) @string
(condition_operator) @operator
(condition_rhs) @string
